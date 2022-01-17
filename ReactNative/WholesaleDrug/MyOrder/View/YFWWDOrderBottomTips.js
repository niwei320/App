/**
 * Created by admin on 2018/6/7.
 */
/**
 * Created by admin on 2018/6/5.
 */
import React, {Component} from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    DeviceEventEmitter,
    ScrollView,
    FlatList, Platform
} from 'react-native';
import {
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    kScreenHeight,
    kStyleWholesale
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWWDOrderClick from "./YFWWDOrderClick";
import YFWTimeText from "../../../PublicModule/Widge/YFWTimeText";


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default class YFWWDOrderBottomTips extends Component {


    constructor(props) {
        super(props);
        this.state = {
            data: undefined
        }
    }

    componentDidMount() {
        let data = this.props.data;
        if (isNotEmpty(data)) {
            this.setState({
                data: data
            })
        }
    }

    render() {
        this.state.data = this.props.data;
        if (isNotEmpty(this.state.data)) {
            let datalistWithKey = itemAddKey(this.state.data.button_items);
            let dataOrderDetailPageShow=[]
            let dataOrderDetailPageHide=[]
            if(this.props.lastPage === 'OrderDetail'){
                datalistWithKey.map((item, index) =>{
                        switch(item.value){
                            case "delete":
                            case "order_complaint":
                                dataOrderDetailPageHide.push(item)
                                break;
                            default:
                                dataOrderDetailPageShow.push(item)
                        }
                    }
                )
            }
            return (
                <View style={{flexDirection:'row'}}>
                    {this.props.lastPage === 'OrderDetail' && dataOrderDetailPageHide.length > 0?
                        <View style={{width:56,justifyContent:'center',alignItems:'center'}}>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.moreTip.measure((frameX, frameY, frameWidth, frameHeight, pageX, pageY) => {
                                        DeviceEventEmitter.emit('ShowBottomHideTips', {
                                                pageX:pageX,
                                                pageY:(kScreenHeight-pageY)+(Platform.OS==='ios'?10:(frameHeight+20)),
                                                data:dataOrderDetailPageHide,
                                                callback:((item)=>{this.buttonsClick(item)})})
                                    })
                                }}>
                                <Text ref={(item) => {this.moreTip = item}} style={{	marginTop:10,marginBottom:13,fontSize: 13, color: "#666666"}}>{'更多'}</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        null
                    }
                    <View style={{flex:1,flexDirection:'row-reverse',marginTop:10,backgroundColor:"#FFF",flexWrap:'wrap'}}>
                        {this.renderBottomTips(this.props.lastPage === 'OrderDetail'?dataOrderDetailPageShow:datalistWithKey)}
                    </View>
                </View>
            )
        } else {
            return (<View/>)
        }
    }

    renderBottomTips(dataList) {
        return dataList.map((item, index) => this.renderItem(item, index));
    }

    renderItem(item, index) {
        if ((item.value == "order_pay" || item.value == "order_received" || item.value == 'order_evaluation'||item.value == "order_pay_not"||item.value == "order_buy_again")) {
            if(item.value == "order_pay"||item.text == '付款'){
                return (
                    <TouchableOpacity activeOpacity={1} onPress={this.buttonsClick.bind(this,item)} key={index}>
                        <View style={{borderRadius:11,borderColor:'#547cff',minWidth:56,borderWidth:1,marginRight:13,marginLeft:3,marginBottom:13,height:23,paddingLeft: 13,paddingRight: 13,alignItems:'center',justifyContent:'center'}}>
                            <YFWTimeText times = {item.waitpaytime || -1} color={'#547cff'}/>
                        </View>
                    </TouchableOpacity>
                );
            }else{

                return (
                    <TouchableOpacity activeOpacity={1} onPress={this.buttonsClick.bind(this,item)} key={index}>
                        <View
                            style={{borderRadius:11,borderColor:'#547cff',minWidth:56,borderWidth:1,marginRight:13,marginLeft:3,marginBottom:13,height:23,paddingLeft: 13,paddingRight: 13,alignItems:'center',justifyContent:'center'}}
                        >
                            <Text style={{alignSelf:'center',color:'#547cff',fontSize:12}}
                            >{item.text}</Text>
                        </View>
                    </TouchableOpacity>
                );
            }
        } else {
            let color = item.is_weak == 'true'?'#b0f6de':'#666'
            return (
                <TouchableOpacity activeOpacity={1} onPress={this.buttonsClick.bind(this,item)} key={index}>
                    <View
                        style={{borderRadius:11,borderColor:color,minWidth:56,borderWidth:1,marginRight:13,marginLeft:3,marginBottom:13,height:23,paddingLeft: 13,paddingRight: 13,alignItems:'center',justifyContent:'center'}}
                    >
                        <Text style={{alignSelf:'center',color:color,fontSize:13}}
                        >{item.text}</Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    buttonsClick(item) {
        let {goBack} = this.props.navigation
        YFWWDOrderClick.buttonsClick({
            pageSource: this.props.pageSource,
            positionIndex: this.props.positionIndex,
            navigation: this.props.navigation,
            type: item.value,
            prompt_info:item.prompt_info,
            data: this.props.data,
            orderNo: this.state.data.order_no,
            shopName: this.state.data.shop_title,//商铺名称
            orderTotal: this.state.data.order_total, //商品总价
            showTips: this.props._showTipsDialog, //显示BaseTips的方法
            showReturn: this.props._showReturnDialog,
            lastPage: this.props.lastPage,
            gobackKey: this.props.gobackKey,
            showLoading: ()=> {
                DeviceEventEmitter.emit('LoadProgressShow');
            }, //显示Loading的方法
            cancelLoading: ()=> {
                DeviceEventEmitter.emit('LoadProgressClose');
            },//隐藏Loading的方法
            showPay: this.props._showPayDialog, //支付弹窗
            refresh: (index)=>this.props.refresh(index),//刷新数据的方法
            goBack: goBack  //返回
        })
    }

}
