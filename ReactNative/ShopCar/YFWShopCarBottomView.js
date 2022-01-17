import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity, Dimensions, DeviceEventEmitter
} from 'react-native';

import YFWCheckButton from '../PublicModule/Widge/YFWCheckButtonView';
import {darkNomalColor,darkTextColor,darkLightColor,separatorColor,yfwRedColor} from "../Utils/YFWColor";
import YFWOrderSettlementRootVC from "../OrderPay/YFWOrderSettlementRootVC";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {isNotEmpty, mobClick, safeObj} from "../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../Utils/ConvertUtils";
import YFWToast from "../Utils/YFWToast";
import LinearGradient from 'react-native-linear-gradient';
import YFWMoneyLabel from '../widget/YFWMoneyLabel';
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';

export default class YFWShopCarBottomView extends Component {

    static defaultProps = {
        Data:[],
        selectAll:false,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        };
    }

    componentDidMount(){
        let that = this
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            that.setState({
                noLocationHidePrice:isHide
            })
        })
    }

    componentWillUnmount() {
        this.locationListener && this.locationListener.remove()
    }

    render() {

        var sum= 0;
        var quantity = 0;
        var discount = 0;
        for (let i = 0 ; i < this.props.Data.length ; i++){

            let car_item = this.props.Data[i];
            if (car_item.type == 'package' || car_item.type == 'courseOfTreatment'){
                sum += Number.parseFloat(car_item.price) * Number.parseInt(car_item.count);
                car_item.package_medicines.forEach((value)=>{
                    quantity += Number.parseInt(value.quantity);
                });
                // quantity += Number.parseInt(car_item.count);
            } else {
                sum += Number.parseFloat(car_item.price) * Number.parseInt(car_item.quantity);
                quantity += Number.parseInt(car_item.quantity);
                discount += (Number.parseFloat(car_item.price_old) - Number.parseFloat(car_item.price)) * Number.parseInt(car_item.quantity);//返现金额
            }

        }
        if(this.props.DataAll && this.props.Data.length >0 ){
            let discount_activity = 0 //活动满减金额
            this.props.DataAll.forEach((item)=>{
                if(isNotEmpty(item.activesum)){
                    discount_activity += Number.parseFloat(item.activesum)
                }
            })
            discount += discount_activity
            sum -= discount_activity
        }
        return (
            <View style={{flex:1}}>
                <View style={styles.separatorStyle}/>
                <View style={styles.container}>
                    <View accessibilityLabel='shop_car_select_all' style={styles.checkButton}>
                        <YFWCheckButton style={{flex:1}} selectFn={()=>this._selectAll()}
                                        select={this.props.selectAll}/>
                    </View>
                    <Text style={{marginLeft:8,color:'#333',fontSize:13}}>全选</Text>
                    {!this.state.noLocationHidePrice?
                        <View style={[styles.view1Style,{alignItems:'flex-end',flex: 2}]}>
                            <View style={[BaseStyles.leftCenterView,{height:30}]}>
                                <Text style={{fontSize:15,color:darkTextColor(),fontWeight:'bold'}}>合计：</Text>
                                {/* <Text style={{fontSize:17,color:'rgb(255,51,0)',fontWeight:'bold'}}>¥{priceInt}
                                <Text style={{fontSize:15}}>.{priceDecimals}</Text>
                            </Text> */}
                                <YFWMoneyLabel money={sum}/>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={styles.regionStyle}>不含运费及包装费</Text>
                                {discount!=0 ? <Text style={{marginLeft: 5, fontSize:11, color: darkTextColor()}}>{'促销: -¥'+toDecimal(discount)}</Text> : <View/>}
                            </View>
                        </View>
                        :
                        <View style={{alignItems: 'flex-end',flex: 2}}>
                            <Text style={{ fontSize: 13, color: "#999999", marginRight: 18 }}>仅做信息展示</Text>
                        </View>
                    }
                    <View style={styles.view2Style}>
                        {!this.state.noLocationHidePrice?
                            <LinearGradient colors={['rgb(255,51,0)','rgb(255,110,74)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{width:'100%',height: 50,justifyContent:'center',alignItems:'center'}}>
                                <TouchableOpacity accessibilityLabel='shop_car_submit' hitSlop={{left:20,top:0,bottom:0,right:20}} style={{flex:1,justifyContent:'center', alignItems:'center'}} onPress={()=>this._orderSettlementMethod()}>
                                    <Text style={styles.payStyle}>结算({quantity})</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                            :
                            <LinearGradient colors={['rgb(204,204,204)','rgb(204,204,204)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{width:'100%',height: 50,justifyContent:'center',alignItems:'center'}}>
                                <TouchableOpacity style={{flex:1,justifyContent:'center', alignItems:'center'}}>
                                    <Text style={[styles.payStyle,{color:'white'}]}>结算</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        }

                    </View>
                </View>
            </View>

        );
    }


    _selectAll(){

        if (this.props.selectAllFn){
            this.props.selectAllFn();
        }

    }


    //订单结算
    _orderSettlementMethod(){
        let viewModel = new YFWRequestViewModel()
        let params = new Map()
        params.set('__cmd','person.account.isCertification')
        viewModel.TCPRequest(params,(res)=>{
            console.log('实名认证', res)
            if (isNotEmpty(res) && !res.result) {
                DeviceEventEmitter.emit('kRealNameStatus', 'ShopCar')
            } else {
                let goodsInfo = this.props.Data
                if (goodsInfo.length>0){
                    mobClick('cart-pay');
                    this.props.navigation.navigate("YFWOrderSettlementRootVC",{Data:goodsInfo});
                } else {
                    YFWToast('请至少选择一件商品，才能结算');
                }
            }
        },(error)=>{
            if (error) YFWToast(error.msg)
        },false)
    }

}

//设置样式
const styles = StyleSheet.create({
    container: {
        flex:1,
        height:50,
        backgroundColor:'white',
        flexDirection: 'row',
        alignItems:'center'
    },
    checkButton:{
        marginLeft:21,
        width:25,
        height:25,
    },
    view1Style:{
        height:50,
        marginRight: 8,
        marginLeft: 5
    },
    regionStyle:{

        fontSize: 11,
        //width:100,
        color:darkLightColor(),

    },
    view2Style:{
        flex:1,
        height:50,
        justifyContent:'center',
        alignItems:'center',
        marginRight:0,
    },

    separatorStyle:{
        backgroundColor:separatorColor(),
        height:0.5,
        width: Dimensions.get('window').width,
    },
    payStyle:{
        color:'white',
        fontSize:13,
    }

});