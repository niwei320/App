import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, DeviceEventEmitter,
} from 'react-native';
import {isNotEmpty, kScreenWidth, safeObj, isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import LinearGradient from "react-native-linear-gradient";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";
import {toDecimal} from "../Utils/ConvertUtils";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWSettlementUnionMemberModel from "./Model/YFWSettlementUnionMemberModel";
import YFWPaymentDialogView from './View/YFWPaymentDialogView';

export default class YFWSettlementUnionMemberPage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '订单结算',
        headerRight: <View />
    });

    constructor(props) {
        super(props);
        this.state = {
            data:{
                phoneNumber : '',
                discountText : '',
                price : '',
                priceOld : '',
                goodsData : [],
            }
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        this._fetchDataFromServer()
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    _fetchDataFromServer() {
        let value = safeObj(safeObj(this.props.navigation.state.params).state).params
        let viewModel = new YFWRequestViewModel()
        let params = new Map()
        params.set('__cmd','person.erporder.GetOrderInfo')
        params.set('storeid',value['storeid'])
        params.set('orderno',value['orderno'])
        viewModel.TCPRequest(params,(res)=>{
            if(res && res.result){
                this.setState({
                    data:YFWSettlementUnionMemberModel.getModelValue(res.result)
                })
            }
        },(error)=>{
            console.log(error)
        },true)
    }

    _funcOnBtnClicked() {
        let value = safeObj(safeObj(this.props.navigation.state.params).state).params
        this.PaymentDialog.showErpPay(value['orderno'],value['storeid'],toDecimal(this.state.data.price),()=>{
            DeviceEventEmitter.emit('erp_order_status_refresh', 'PaySuccess');
            this.props.navigation.goBack()
        });
    }

//-----------------------------------------------RENDER---------------------------------------------

    render() {
        if(this.state.data.goodsData.length === 0){
            return <View />
        }
        let phoneNumber = this.state.data.phoneNumber
        let discountText = this.state.data.discountText
        let price = this.state.data.price
        let priceOld = this.state.data.priceOld
        let goodsData = this.state.data.goodsData
        let couponPrice = this.state.data.couponPrice
        let goodsItemTextArray = []
        goodsData.forEach((item)=>{
            let unit = ''
            if (item.medicinetype==1) {
                unit = item.unit.replace(/\[拆\]/g,'')
            }
            goodsItemTextArray.push(
                <View style={{width:(350-28*2+10)*rpx,flexDirection: 'row', justifyContent:'space-between', alignItems:'center',marginTop:9*rpx}}>
                    <View>
                        <Text style={{maxWidth:(350-28*2+10-100)*rpx,fontSize: 13*rpx,fontWeight:'500',color: "#000000"}}>{item.name}</Text>
                        {
                            item.medicinetype==1?
                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                <Text style={{fontSize: 10*rpx,color: "#999999"}}>{item.standard}</Text>
                                <View style={{...BaseStyles.centerItem,marginLeft:5,width: 24*rpx,height: 14*rpx,borderRadius: 2,backgroundColor: "#caf5e6",borderStyle: "solid",borderWidth: 1,borderColor: "#1fdb9b"}}>
                                    <Text style={{fontSize: 10*rpx,color: "#2ab988"}}>{'拆零'}</Text>
                                </View>
                                <Text style={{marginLeft:2,fontSize: 12*rpx,color: "#2ab988"}}>{unit}</Text>
                            </View>:
                            <Text style={{fontSize: 10*rpx,color: "#999999"}}>{item.standard}</Text>
                        }
                    </View>
                    <Text style={{maxWidth:90*rpx,fontSize: 12*rpx,color: "#999999"}}>X{item.counter}</Text>
                </View>
            )
        })
        return (
            <ScrollView contentContainerStyle = {{flex: 1, alignItems: 'center'}}>
                <Text style={styles.phoneNumberText}>{phoneNumber}</Text>
                <View style={styles.centerContentView}>
                    <View style={{alignItems:'center'}}>
                        <Text style={{paddingTop: 23*rpx,fontSize: 15*rpx,color:'#989897'}}>金额</Text>
                        <View style={{flexDirection: 'row', alignItems:'flex-end'}}>
                            {couponPrice==0?<View/>:<Text style={{fontSize: 10*rpx,color:'#ffffff',marginTop:13*rpx, opacity: 0}}> ¥{toDecimal(priceOld)} </Text>}
                            <Text style={{fontSize: 24*rpx,color:'#ff3300',marginTop:13*rpx, fontWeight: '500'}}>¥{toDecimal(price)}</Text>
                            {couponPrice==0?<View/>:<Text style={{fontSize: 10*rpx,color:'#666666',marginTop:13*rpx, marginLeft:3*rpx, textDecorationLine:'line-through'}}> ¥{toDecimal(priceOld)} </Text>}
                        </View>
                        {isNotEmpty(discountText) ? <Text style = {{fontSize: 10 * rpx, color: '#ff9907',marginTop:9*rpx}}>{discountText}</Text> : <View />}
                    </View>
                    <View style={{paddingLeft: 10*rpx, marginTop:50*rpx}}>
                        {goodsItemTextArray}
                    </View>
                </View>
                <View style={{marginTop:64*rpx, marginBottom: 100*rpx}}>
                    <YFWTouchableOpacity style_title={styles.bottomBtmOpacity} title={'立即付款'} callBack={()=>this._funcOnBtnClicked()} isEnableTouch = {true} />
                </View>
                <YFWPaymentDialogView ref={(dialog) => { this.PaymentDialog = dialog; }} navigation={this.props.navigation} from={'ERP_order'}/>
            </ScrollView>
        )
    }


}

const rpx = kScreenWidth / 375  //设计图单位（w:375）
const styles = StyleSheet.create({
    phoneNumberText: {
        marginTop:48*rpx,
        marginBottom:15*rpx,
        fontSize: 15,
        color: "#989897",
    },
    centerContentView: {
        width: 350*rpx,
        paddingVertical: 23*rpx,
        paddingHorizontal:28*rpx,
        alignItems:'center',
        justifyContent:'space-between',
        borderRadius: 7*rpx,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 8*rpx,
        elevation: 1,
        shadowOpacity: 1
    },
    bottomBtmOpacity: {
        marginTop:96*rpx,
        width: 294*rpx,
        height: 42*rpx,
        fontSize: 16
    }
});