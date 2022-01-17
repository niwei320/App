import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, DeviceEventEmitter,
} from 'react-native';
import {YFWO2OOrderDetailViewModel} from "./YFWO2OOrderDetailViewModel";
import YFWO2OOrderDetailAPI from "./YFWO2OOrderDetailAPI";
import YFWO2OOrderDetailModel from "./YFWO2OOrderDetailModel";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWO2OOrderDetailView from "./YFWO2OOrderDetailView";
import {isNotEmpty, safe, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWToast from "../../Utils/YFWToast";

/*取消订单*/
let TYPE_ORDER_CANCEL = "order_cancel";
/*删除订单*/
let TYPE_ORDER_REMOVE = "order_remove";
let TYPE_ORDER_DELET_TCP = 'delete';
/*确认,同意更改价格*/
/*申请退款、再次申请退款 (待发货)*/
let TYPE_ORDER_APPLY_RETURN_PAY = "order_apply_return_pay";
/*取消申请退款 (待发货)*/
let TYPE_ORDER_APPLY_RETURN_PAY_CANCEL = "order_apply_return_pay_cancel";
/*确认收货*/
let TYPE_ORDER_RECEIVED = "order_received";
/*申请退货款*/
let TYPE_ORDER_APPLY_RETURN = "order_apply_return";
/*取消退货/款 (待收货)*/
let TYPE_ORDER_APPLY_RETURN_CANCEL = "order_apply_return_cancel";
/*重新购买*/
let TYPE_ORDER_BUY_AGAIN = "order_buy_again";
/*维权投诉*/
let TYPE_ORDER_COMPLAINT = "order_complaint";
/*投诉详情*/
let TYPE_ORDER_COMPLAINT_DETAIL = "order_complaint_detail";
/*更新收货状态*/
let TYPE_RETURN_PAY_REASON = "get_apply_return_pay_reason"
/*我要退货，或者只退款不退货*/
let TYPE_RETURN_UPDATE = "order_apply_return_update"
/* 电话商家*/
let CALL_STORE = "call_store"
/*退货/款详情 (待收货)*/
let TYPE_ORDER_RETURN_DETAIL = "order_return_detail";

export default class YFWO2OOrderDetailController extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null,
    });

    constructor(props) {
        super(props);
        this.state = {
            orderNo:this.props.navigation.state.params?.state?.orderNo??'',
            pageSource:this.props.navigation.state.params?.state?.pageSource??'',
            itemPosition:this.props.navigation.state.params?.state?.position??'',
            dataSource:'',
            statusList:[],
        }
        this.firstIn = true
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    UNSAFE_componentWillMount() {

    }

    componentDidMount() {
        this._fetchData()
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if(!this.firstIn){
                    this._fetchData()
                } else {
                    this.firstIn = false
                }
            }
        );
    }

    componentWillUnmount() {
        this.didFocus && this.didFocus.remove()
    }

//-----------------------------------------------METHOD---------------------------------------------
    _fetchData(){
        let {orderNo} = this.state
        YFWO2OOrderDetailAPI.getDetail(orderNo).then(
            res=>{
                console.log(JSON.stringify(res))
                this.setState({
                    dataSource:YFWO2OOrderDetailModel.getModelArray(res.result)
                })
            },
            err=>{
            }
        )
        YFWO2OOrderDetailAPI.getOrderTrack(orderNo).then(
            res=>{
                console.log(JSON.stringify(res))
                this.setState({
                    statusList:res.result
                })
            },
            err=>{
            }
        )
    }

    _pageBack(){
        this.props.navigation.goBack()
    }

    _gotoStoreDetail(){
        let {storeid} = this.state.dataSource
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_oto_store',data:{storeid:storeid,cartfold:false}})
    }

    _makePhoneCall(){
        let mobile = this.state?.dataSource?.storePhoneNumber
        if(isNotEmpty(mobile)){
            YFWNativeManager.takePhone(mobile)
        }
    }
    _gotoInvoiceDetail(data){
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'invoice_detail_page',value:data,orderNo:this.state.orderNo, from:'oto'})
    }

    _gotoRxDetail(){
        let {orderNo} = this.state
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'prescription_result',orderNo:orderNo})
    }

    _gotoOrderReceived(){
        let {orderNo, pageSource} = this.state
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'O2O_Comfirm_Receiption',orderNo:orderNo, pageSource:pageSource})
    }

    _gotoRequestRefund(){
        let {orderNo, pageSource} = this.state
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'O2O_Request_Refund',orderNo:orderNo, pageSource:pageSource})
    }

    _buyAgain(){
        let {orderNo, storeid} = this.state.dataSource
        YFWO2OOrderDetailAPI.getBuyAgain(orderNo).then(
            success=>{
                let {navigate} = this.props.navigation;
                pushNavigation(navigate,{type:'get_oto_store',data:{storeid:storeid,cartfold:true}})
            },
            error =>{
                if (isNotEmpty(error?.msg)) {
                    YFWToast(error?.msg)
                }
            }
        )
    }

    _delOrder() {

        let {orderNo, pageSource} = this.state
        YFWO2OOrderDetailAPI.deleteOrder(orderNo).then(
            suc=>{
                YFWToast('删除成功');
                isNotEmpty(pageSource) && DeviceEventEmitter.emit('order_status_refresh',pageSource)
                this._pageBack()
            }
        )
    }

    _cancelOrder() {
        let {orderNo, pageSource} = this.state
        YFWO2OOrderDetailAPI.cancelOrder(orderNo, '我不想买了').then(
            succ=>{
                YFWToast('取消成功')
                isNotEmpty(pageSource) && DeviceEventEmitter.emit('order_status_refresh',pageSource)
                this._fetchData()
            }
        )
    }

    _report(){
        let {pageSource, itemPosition} = this.state
        let {orderNo, shop_title} = this.state.dataSource
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {
            type: "order_report",
            value: {
                mOrderNo: orderNo,
                shopName: shop_title,
                orderType: 2,
                pageSource: pageSource,
                itemPosition: itemPosition,
            }
        })
    }

    _cancelRequestReturnMoney(){
        let {orderNo, pageSource} = this.state
        YFWO2OOrderDetailAPI.cancelApplyReturn(orderNo).then(
            suc=>{
                YFWToast("取消申请成功")
                isNotEmpty(pageSource) && DeviceEventEmitter.emit('order_status_refresh',pageSource)
                this._fetchData()
            }
        )
    }
    _cancelReturnMoney(){
        let {orderNo, pageSource} = this.state
        YFWO2OOrderDetailAPI.cancelReturnGoods(orderNo).then(
            suc=>{
                YFWToast("取消申请成功")
                isNotEmpty(pageSource) && DeviceEventEmitter.emit('order_status_refresh',pageSource)
                this._fetchData()
            }
        )
    }

    _reportDetail(){
        let {orderNo} = this.state
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: "get_complain_detail", orderNo: orderNo})
    }

    _returnMoneyDetail() {
        let {pageSource} = this.state
        let {orderNo, shop_title,goodsInfoData} = this.state.dataSource
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {
            type: "refund_detail",
            mOrderNo: orderNo,
            shopName: shop_title,
            pageSource: pageSource,
            orderTotal: goodsInfoData.total_price,
            data: {dict_order_sub_type:'2'},
        })
    }

    _onClicked(type){
         switch (type) {
             case TYPE_ORDER_CANCEL:/*取消订单*/
                 this._cancelOrder()
                 break
             case TYPE_RETURN_UPDATE:/*我要退货，或者只退款不退货*/
             case TYPE_RETURN_PAY_REASON:/*更新收货状态*/
             case TYPE_ORDER_APPLY_RETURN:/*申请退货款*/
             case TYPE_ORDER_APPLY_RETURN_PAY:/*申请退款、再次申请退款*/
                 this._gotoRequestRefund()
                 break
             case TYPE_ORDER_APPLY_RETURN_PAY_CANCEL:/*取消申请退款*/
                 this._cancelRequestReturnMoney()
                 break
             case TYPE_ORDER_APPLY_RETURN_CANCEL:/*取消退货/款*/
                 this._cancelReturnMoney()
                 break
             case TYPE_ORDER_RECEIVED:/*确认收货*/
                 this._gotoOrderReceived()
                 break
             case TYPE_ORDER_BUY_AGAIN:/*重新购买*/
                 this._buyAgain()
                 break
             case TYPE_ORDER_COMPLAINT:/*维权投诉*/
                 this._report()
                 break
             case TYPE_ORDER_COMPLAINT_DETAIL:/*投诉详情*/
                 this._reportDetail()
                 break
             case TYPE_ORDER_REMOVE:/*投诉详情*/
             case TYPE_ORDER_DELET_TCP:/*投诉详情*/
                 this._delOrder()
                 break
             case CALL_STORE:
                 this._makePhoneCall()
                 break
             case TYPE_ORDER_RETURN_DETAIL:/*退货/款详情*/
                 this._returnMoneyDetail()
                 break
         }
    }

//-----------------------------------------------RENDER---------------------------------------------

    render() {
        return YFWO2OOrderDetailViewModel(this)
    }

}
