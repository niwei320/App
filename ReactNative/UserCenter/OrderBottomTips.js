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
    FlatList, Platform,Image
} from 'react-native';
import {isIphoneX, isNotEmpty, itemAddKey, kScreenHeight} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWToast from "../Utils/YFWToast"
import OrderClick from "./order/OrderClick";
import YFWTimeText from '../PublicModule/Widge/YFWTimeText';
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import LinearGradient from 'react-native-linear-gradient';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

/*提交处方*/
var TYPE_ORDER_RX_SUBMIT = "order_rx_submit";
/*付款*/
var TYPE_ORDER_PAY = "order_pay";
/*取消订单*/
var TYPE_ORDER_CANCEL = "order_cancel";
/*删除订单*/
var TYPE_ORDER_REMOVE = "order_remove";
/*确认,同意更改价格*/
var TYPE_AGREE_PRICE_COD_ORDER = "agree_price_cod_order";
/*申请退款、再次申请退款*/
var TYPE_ORDER_APPLY_RETURN_PAY = "order_apply_return_pay";
/*取消申请退款*/
var TYPE_ORDER_APPLY_RETURN_PAY_CANCEL = "order_apply_return_pay_cancel";
/*确认收货*/
var TYPE_ORDER_RECEIVED = "order_received";
/*申请退货款*/
var TYPE_ORDER_APPLY_RETURN = "order_apply_return";
/*退货/款详情*/
var TYPE_ORDER_RETURN_DETAIL = "order_return_detail";
/*发出退货*/
var TYPE_ORDER_RETURN_SEND = "order_return_send";
/*取消退货/款*/
var TYPE_ORDER_APPLY_RETURN_CANCEL = "order_apply_return_cancel";
/*重新购买*/
var TYPE_ORDER_BUY_AGAIN = "order_buy_again";
/*我要评价*/
var TYPE_ORDER_EVALUATION = "order_evaluation";
/*维权投诉*/
var TYPE_ORDER_COMPLAINT = "order_complaint";
/*投诉详情*/
var TYPE_ORDER_COMPLAINT_DETAIL = "order_complaint_detail";
/*更新退货单号*/
var TYPE_ORDER_RETURN_SEND_UPDATE = "order_return_send_update";
/*催发货*/
var REMIND_ORDER_SEND_GOODS = "remind_order_send_goods";
/*查物流*/
var LOOK_LOGISTICS = "look_logistics";
/*更新收货状态*/
var TYPE_RETURN_PAY_REASON = "get_apply_return_pay_reason"
/*我要退货，或者只退款不退货*/
var TYPE_RETURN_UPDATE = "order_apply_return_update"

export default class OrderBottomTips extends Component {


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
                                hitSlop={{left:10,top:10,bottom:10,right:10}}
                                onPress={()=>{
                                    this.moreTip.measure((frameX, frameY, frameWidth, frameHeight, pageX, pageY) => {
                                        //pageX,pageY就是相对屏幕的绝对位置
                                        // console.log(pageX,pageY,frameHeight,kScreenHeight)
                                        DeviceEventEmitter.emit('ShowBottomHideTips',
                                            {
                                                pageX:pageX,
                                                pageY:(kScreenHeight-pageY)+(Platform.OS==='ios'?10:(frameHeight+20)),
                                                data:dataOrderDetailPageHide,
                                                callback:((item)=>{this.buttonsClick(item)})
                                            })
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

    /** 旧版 */
    _renderOld() {
        let datalistWithKey = itemAddKey(this.state.data.button_items);
            if (datalistWithKey.length <= 4) {
                return (
                    <View style={{flexDirection:'row-reverse',marginTop:10,backgroundColor:"#FFF"}}>
                        {this.renderBottomTips(datalistWithKey)}
                    </View>
                )
            } else {
                return (
                    <ScrollView style={{flex:1}} horizontal={true} automaticallyAdjustContentInsets={false} showsHorizontalScrollIndicator = {false}>
                        {this._renderTakePlaceView(datalistWithKey)}
                        <View style={{flexDirection:'row-reverse',marginTop:10,backgroundColor:"#FFF"}}>
                            {this.renderBottomTips(datalistWithKey)}
                        </View>
                    </ScrollView>
                )
            }
    }

    renderBottomTips(datalist) {
        return datalist.map((item, index) => this.renderItem(item, index));
    }

    renderItem(item, index) {
        if ((item.value == "order_pay" ||item.value == "erp_order_pay"|| item.value == "order_received" || item.value == 'order_evaluation'||item.value == "order_pay_not"||item.value == "order_buy_again"|| item.value == 'look_pickup_code')) {
            if(item.value == "order_received"||item.text == '确认收货') {
                if(!YFWUserInfoManager.ShareInstance().isShopMember() && this.state.data.dict_order_sub_type != '2'){
                    return (
                        <TouchableOpacity activeOpacity={1} onPress={this.buttonsClick.bind(this,item)} key={index}>
                            <Image
                                style={{width:84,marginRight:13,marginLeft:3,marginBottom:13,height:23,}}
                                source={require('../../img/icon_receipt_lottery.png')}
                                resizeMode='stretch'
                            />
                        </TouchableOpacity>
                    )
                }
            }
            if(item.value == "order_pay"||item.value == "erp_order_pay"||item.text == '付款'){
                return (
                    <TouchableOpacity activeOpacity={1} onPress={this.buttonsClick.bind(this,item)} key={index}>
                        <View style={{borderRadius:11,borderColor:'#1fdb9b',minWidth:56,borderWidth:1,marginRight:13,marginLeft:3,marginBottom:13,height:23,paddingLeft: 13,paddingRight: 13,alignItems:'center',justifyContent:'center'}}>
                            <YFWTimeText times = {item.waitpaytime || -1}/>
                        </View>
                    </TouchableOpacity>
                );
            }else{

                return (
                    <TouchableOpacity activeOpacity={1} onPress={this.buttonsClick.bind(this,item)} key={index}>
                        <View
                            style={{borderRadius:11,borderColor:'#1fdb9b',minWidth:56,borderWidth:1,marginRight:13,marginLeft:3,marginBottom:13,height:23,paddingLeft: 13,paddingRight: 13,alignItems:'center',justifyContent:'center'}}
                        >
                            <Text style={{alignSelf:'center',color:'#1fdb9b',fontSize:12}}
                            >{item.text}</Text>
                        </View>
                    </TouchableOpacity>
                );
            }
        } else if (item.value == 'group_booking') {
            return (
                <TouchableOpacity activeOpacity={1} onPress={this.buttonsClick.bind(this,item)} key={index}>
                    <LinearGradient colors={['#ff6e4a','#ff3300']}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                locations={[0,1]}
                                style={{borderRadius:11,minWidth:56,marginRight:13,marginLeft:3,marginBottom:13,height:23,paddingLeft: 13,paddingRight: 13,alignItems:'center',justifyContent:'center'}}>
                        <Text style={{alignSelf:'center',color:'white',fontSize:13}}
                        >{item.text}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )
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
        OrderClick.buttonsClick({
            pageSource: this.props.pageSource,
            positionIndex: this.props.positionIndex,
            navigation: this.props.navigation,
            type: item.value,
            navigationParams: item.navigationParams,
            prompt_info:item.prompt_info,
            data: this.props.data,
            orderNo: this.state.data.order_no,
            shopName: this.state.data.shop_title,//商铺名称
            orderTotal: this.state.data.order_total, //商品总价
            showTips: this.props._showTipsDialog, //显示BaseTips的方法
            showTipsAlert: this.props._showTipsAlert,
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
            showPickupCode: this.props._showPickupCodeDialog,//提货码查看
            refresh: (index)=>this.props.refresh(index),//刷新数据的方法
            refreshHeader: ()=>this.props.refreshHeader(),//刷新头部处方
            goBack: goBack  //返回
        })
    }

    _renderTakePlaceView(datalistWithKey) {

        if (datalistWithKey.length * 83 >= width) {
            return (<View/>)
        } else {
            return (<View style={{width:width-datalistWithKey.length*85}}/>)
        }
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white'
    },

    lineStyle: {
        // width:ScreenWidth/3,
        height: 2,
        backgroundColor: '#FF0000',
    },
    textMainStyle: {
        flex: 1,
        fontSize: 40,
        marginTop: 10,
        textAlign: 'center',
        color: 'black'
    },

    textHeaderStyle: {
        fontSize: 40,
        color: 'white',
    }
})
