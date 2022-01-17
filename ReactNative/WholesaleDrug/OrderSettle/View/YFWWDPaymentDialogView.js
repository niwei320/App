import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    ScrollView,
    Picker,
    Platform,
    NativeModules,
    DeviceEventEmitter, NativeEventEmitter
} from 'react-native'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {isNotEmpty, itemAddKey, kScreenWidth, mobClick, richText, safe, isIphoneX, kScreenHeight, adaptSize, payOrderTip, isEmpty} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWToast from "../../../Utils/YFWToast";
import YFWNativeManager from "../../../Utils/YFWNativeManager";
import ModalView from '../../../widget/ModalView'
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";
import { toDecimal } from '../../../Utils/ConvertUtils';
import YFWDiscountText from '../../../PublicModule/Widge/YFWDiscountText'
import { pushWDNavigation, kRoute_operation_success, replaceWDNavigation } from '../../YFWWDJumpRouting';

const {YFWEventManager} = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);


export default class YFWWDPaymentDialogView extends Component {

    constructor(props) {
        super(props);
        this.isMerge = false    //是否合并支付
        this.type = 1
        this.isERPPay = false
        this.shopID = ''
        this.state = {
            promptContext: '',
            price: '0.00',
            orderNo: undefined,
            orderBatchNo: ''
        }
    }

    //Request
    _handlePromptData() {
        //to-do
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.getPayAttentionInfo');
        paramMap.set('ordernoList', this.state.orderNo);
        paramMap.set('sub_type', 1);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let content = res.result.context;
            let price = res.result.order_price;
            this.setState({
                promptContext: content,
                price: price,
            });
            this.popupDialog && this.popupDialog.show();
        }, null, true);

    }


    //Action
    show(order_no,isMerge,callback) {
        this.type = 1
        this.isMerge = isMerge || false
        this.callback = callback
        this.initPaymentEvents();
        this.state.orderNo = isMerge?order_no:[order_no];
        this._handlePromptData();
    }

    showErpPay(order_no,shopID,price,callback){
        this.type = 1
        this.isERPPay = true
        this.state.orderNo = order_no
        this.shopID = shopID
        this.callback = callback
        this.initPaymentEvents()
        this.setState({
            price:price
        })
        this.popupDialog && this.popupDialog.show();
    }

    initPaymentEvents() {
        this.PayMentListener&&this.PayMentListener.remove();
        this.PayMentListener = null
        if (Platform.OS == 'android') {
            this.PayMentListener = DeviceEventEmitter.addListener('paymentSuccess', (msg)=> {
                this.paySucced(msg);
            });
        } else if (Platform.OS == 'ios') {
            this.PayMentListener = iOSManagerEmitter.addListener('paymentSuccess', (data)=> {
                this.paySucced(data.type);
            });

        }
    }

    dismiss(isPaySuccess) {
        //合并支付下，未点击支付或者微信付款，取消的，回调跳转订单提交成功页
        this.PayMentListener&&this.PayMentListener.remove();
        this.PayMentListener = null
        this.popupDialog && this.popupDialog.disMiss()
        if(!isPaySuccess){
            this.callback&&this.callback(this.state.orderBatchNo)
        }
    }

    dismissView() {
        //合并支付下，结算页支付弹框不消失
        if(!this.isMerge){
            this.popupDialog && this.popupDialog.disMiss()
        }
    }


    paySucced(type) {
        this.PayMentListener&&this.PayMentListener.remove();
        this.PayMentListener = null
        //to-do
        let paytype;
        if (type == 'ali') {
            mobClick('pay-Alipay');
            paytype = 'alipay';
        } else if (type == 'wx') {
            mobClick('pay-WeChat');
            paytype = 'wxpay';
        } else if (type == 'jd') {
            mobClick('pay-JD');
            paytype = 'jdpay';
        }
        let paramMap = new Map();
        if (this.isERPPay) {
            paramMap.set('__cmd', 'guest.erp_order.updatePayStatus');
        } else {
            paramMap.set('__cmd', 'guest.order.updateBatchPayStatus');
        }
        paramMap.set('orderno', this.state.orderBatchNo);
        paramMap.set('type', safe(paytype));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let result = res.result;
            if (result.success) {
                this.dismiss(true);
                if (this.isERPPay) {
                    this.callback&&this.callback(this.state.orderBatchNo)
                    return
                }
                if(safe(this.props.from) == 'orderRootSettlement'){
                    if (isNotEmpty(this.state.orderNo)) {
                        replaceWDNavigation(this.props.navigation, {type:kRoute_operation_success,title: '付款成功',
                            orderNo: this.state.orderNo,
                            pageType: 'payment',
                            from: safe(this.props.from),
                            unPayCount: this.props.unPayCount
                        })
                    }
                }else{
                    if (isNotEmpty(this.state.orderNo)) {
                          pushWDNavigation(this.props.navigation.navigate, {type:kRoute_operation_success,title: '付款成功',
                            orderNo: this.state.orderNo,
                            pageType: 'payment',
                            from: safe(this.props.from),
                            unPayCount: this.props.unPayCount
                        })
                    }
                }
            } else {
                YFWToast('支付失败');
            }
        });

    }

    payCancle() {


        this.type = 2

        this.setState({})


    }

    continuePay(){
        this.type = 1
        this.setState({})
    }

    leavePay(){
        if (this.props.payCancleMethod) {
            this.props.payCancleMethod(this.state.orderNo);
        }
        this.dismiss();
    }


    //View
    renderPayTipsView() {
        return(
            <View style={[{alignItems:'center',justifyContent:'center',flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                <View style={{width:kScreenWidth-adaptSize(35*2),justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:'#fff'}}>
                    <TouchableOpacity onPress={()=>{this.leavePay()}} style={{top:10,right:11,position:'absolute'}}>
                        <Image source={require('../../../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                    </TouchableOpacity>
                    <Text style={{fontSize:17,color:'rgb(51,51,51)',marginTop:adaptSize(24),fontWeight:'500'}}>付款提示</Text>
                    <Text style={{fontSize:12,color:'rgb(51,51,51)',marginTop:adaptSize(33),marginHorizontal:adaptSize(27),lineHeight:adaptSize(14)}}>{payOrderTip}</Text>
                    <View style={{flexDirection:'row',marginTop:adaptSize(39),marginBottom:adaptSize(20),}}>
                        <TouchableOpacity onPress={()=>{this.continuePay()}} style={{backgroundColor:'#547cff',alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                            borderRadius:adaptSize(15),borderWidth:1,borderColor:'#547cff'}}>
                            <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>继续支付</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{this.leavePay()}} style={{marginLeft:adaptSize(11),alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                            borderRadius:adaptSize(15),borderWidth:1,borderColor:'#547cff'}}>
                            <Text style={{color:'#547cff',fontSize:15,fontWeight:'500'}}>确认离开</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        )
    }

    renderPayView() {
        let viewH = this.isERPPay?380/667*kScreenHeight:580/667*kScreenHeight
        return (
            <View style={{backgroundColor: 'rgba(0, 0, 0, 0.3)',flex:1}}>
                    <TouchableOpacity style={{flex:1}} onPress={()=>this.payCancle()}/>
                    <View style={{backgroundColor:'white',height:viewH, borderTopLeftRadius:7,borderTopRightRadius:7}}>
                        <View>
                            <View style={[BaseStyles.leftCenterView,{height:42,width:kScreenWidth,justifyContent:'space-between',}]}>
                                <View style={{marginLeft:15 ,width:30,height:30}}/>
                                <Text style={[BaseStyles.titleWordStyle,{fontWeight:'bold',fontSize:15,color:'#000000',textAlign:'center'}]}>请选择支付方式</Text>
                                <TouchableOpacity style={[BaseStyles.centerItem,{marginRight:15 ,width:30,height:30}]}
                                                onPress={()=>this.payCancle()}>
                                    <Image style={{width: 12, height:12}}
                                        source={require('../../../../img/close_button.png')}/>
                                </TouchableOpacity>
                            </View>
                            <View style={[BaseStyles.separatorStyle,{marginLeft:0,width:kScreenWidth,
                                            height: 1,
                                            borderStyle: "solid",
                                            borderWidth: 0,
                                            borderColor: "#cccccc"}]}/>
                        </View>
                        <View style={{justifyContent:'center',alignItems:'center',}}>
                            <Text style={{fontSize:15,color:'#333333',marginTop:27}}>待支付金额:</Text>
                            <YFWDiscountText navigation={this.props.navigation}
                                style_view={{marginTop:13,marginBottom:35}} style_text={{fontSize:26}}
                                value={'¥ '+toDecimal(this.state.price)} />
                            <View style={[BaseStyles.separatorStyle,{marginLeft:15,width:kScreenWidth-15,
                                            height: 1,
                                            borderStyle: "solid",
                                            borderWidth: 0,
                                            borderColor: "#cccccc"}]}/>
                        </View>
                        <View>
                            {this.renderPayCell('ali')}
                            {this.renderCellLine()}
                            {this.renderPayCell('wx')}
                            {this.renderCellLine()}
                            {
                                this.isERPPay?null:this.renderPayCell('jd')
                            }
                            {
                                this.isERPPay?null:this.renderCellLine()
                            }
                        </View>
                        {
                            this.isERPPay?null:
                            <View style={{flex:1}}>
                                <Text style={{marginTop:25,marginLeft:16,marginBottom:16,color:'#000',fontSize:15}}>分期付款</Text>
                                {this.renderCellLine()}
                                {this.renderPayCell('jd-bt')}
                                {this.renderCellLine()}
                                <View style={[BaseStyles.leftCenterView,{height:50,marginTop:10}]}>
                                <View
                                    style={{marginLeft:21,backgroundColor:'#feac4c',width:7,height:7,borderRadius:3.5}}/>
                                    <Text style={[BaseStyles.titleWordStyle,{marginLeft:8, fontSize:12}]}>支付提示</Text>
                                </View>
                                <ScrollView style={{flex:1,marginBottom:4,marginTop:-9}}>
                                    <View style={{flex:1}}>
                                        <Text
                                            style={[BaseStyles.contentWordStyle,
                                                {width:kScreenWidth-55,marginLeft:35,fontSize:12,letterSpacing:2,lineHeight:19,color:'#666666'}
                                                ]}>{richText(this.state.promptContext)}</Text>
                                    </View>
                                </ScrollView>
                            </View>
                        }

                    </View>
                    <View style={{width:kScreenWidth,height:isIphoneX()?34+10:10,backgroundColor:'white'}}/>
                </View>
        )
    }

    renderPayCell(type) {

        if (isEmpty(type)) {
            return (<View/>)
        }

        let imageSource = ''
        let title = ''
        let imageW = 32
        let imageH = 29
        let imageR = 0
        let slogan = ''
        let sloganColor = '#999'
        if (type == 'ali') {
            imageSource = require('../../../../img/alipayicon.png')
            title = '支付宝支付'
            imageW = 30
            imageH = 30
            imageR = 1
        } else if (type == 'wx') {
            imageSource = require('../../../../img/weixinpayicon.png')
            title = '微信支付'
        } else if (type == 'jd') {
            imageSource = require('../../../../img/jd_pay.png')
            title = '京东支付'
            let config = YFWUserInfoManager.ShareInstance().getSystemConfig()
            if (isNotEmpty(config.jdpay_tips)) {
                slogan = config.jdpay_tips
                sloganColor = '#333'
            }
            imageW = 27
            imageH = 34
            imageR = 2.5
        } else if (type == 'jd-bt') {
            imageSource = require('../../../../img/jd_pay_bt.png')
            title = '京东白条'
            slogan = '先用后付，可分期'
            imageW = 27
            imageH = 34
            imageR = 2.5
        }

        return (
            <TouchableOpacity style={[BaseStyles.leftCenterView,{height:58,width:kScreenWidth}]}
                                onPress={()=>this._requestPayByAli(type)}>
                <Image style={{width: imageW, height:imageH, marginLeft:21+imageR,marginRight:imageR}}
                        source={imageSource}
                        defaultSource={imageSource}/>
                {
                    slogan&&slogan.length>0?
                    <View style={{alignContent:'center'}}>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:16, color:'#000000'}]}>{title}</Text>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:16, color:sloganColor,fontSize:12,marginTop:5}]}>{slogan}</Text>
                    </View>
                    :
                    <Text style={[BaseStyles.titleWordStyle,{marginLeft:16, color:'#000000'}]}>{title}</Text>
                }
                <View flex={1}/>
                <Image style={{width: 7, height:13, marginRight:20}}
                        source={require('../../../../img/toPayArrow.png')}/>
            </TouchableOpacity>
        )
    }

    renderCellLine() {

        return (
            <View style={[BaseStyles.separatorStyle,{marginLeft:15,width:kScreenWidth-15,
                height: 1,
                borderStyle: "solid",
                borderWidth: 0,
                borderColor: "#cccccc"}]}/>
        )
    }

    render() {
        return (
            <ModalView ref={(c) => this.popupDialog = c} animationType="fade"
                       onRequestClose={()=>{}}
            >
                {this.type==1?this.renderPayView():this.renderPayTipsView()}
            </ModalView>
        )
    }


    _requestPayByAli(type) {

        let that = this;
        if (isNotEmpty(this.state.orderNo)) {

            this._requestPaymentOrderInfo(this.state.orderNo, type);

        } else {

            if (this.props.getOrderNo) {
                this.props.getOrderNo((orderNo)=> {
                    if (isNotEmpty(orderNo)) {
                        that.state.orderNo = orderNo;
                        that._requestPaymentOrderInfo(that.state.orderNo, type);
                    }
                });
            }

        }

    }

    _requestPaymentOrderInfo(orderNo, type) {
        //to-do
        if (type === 'ali') {
            this.callPayInfoFromServer('alipay',type,orderNo)
        } else if (type === 'wx') {
            YFWNativeManager.checkUserHaveInstallWX((bool)=>{
                if(!bool){
                    YFWNativeManager.showToast("未检测到微信程序，请选择其他方式支付")
                    return
                }
                this.callPayInfoFromServer('wxpay',type,orderNo)
            })
        } else if (type === 'jd') {
            this.callPayInfoFromServer('jdpay',type,orderNo)
        } else if (type === 'jd-bt') {
            this.callPayInfoFromServer('jdpay','jd',orderNo,{'useBaiTiao':'1'})
        }
        setTimeout(()=> {DeviceEventEmitter.emit('LoadProgressClose');}, 1000 * 5)
    }

    callPayInfoFromServer(payType,type,orderList,extendedParam) {
        let paramMap = new Map();
        if (this.isERPPay) {
            paramMap.set('__cmd', 'person.erporder.getPayInfo_app')
            paramMap.set('orderno',orderList)
            paramMap.set('storeid',this.shopID)
        } else {
            paramMap.set('__cmd', 'guest.common.app.getBatchOrderInfo')
            paramMap.set('ordernoList', orderList)
        }
        paramMap.set('type', payType);
        if (extendedParam) {
            paramMap.set('param',extendedParam);
        }
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let result = res.result;
            this.state.orderBatchNo = result.orderno
            this.dismissView()
            YFWNativeManager.openPayment(result, type, ()=> { });
        });
    }


}
