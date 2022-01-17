import React from 'react'
import YFWToast from "../../Utils/YFWToast";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {isNotEmpty, isEmpty, safeObj, safe} from "../../PublicModule/Util/YFWPublicFunction";
import {getAuthUrl} from "../../Utils/YFWInitializeRequestFunction";
import {NavigationActions} from "react-navigation";
import {darkLightColor, yfwGreenColor} from "../../Utils/YFWColor";
import {
    DeviceEventEmitter
} from 'react-native';
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWNativeManager from '../../Utils/YFWNativeManager';
import YFWO2OOrderDetailAPI from '../../O2O/OrderDetail/YFWO2OOrderDetailAPI';

/*提交处方*/
var TYPE_ORDER_RX_SUBMIT = "order_rx_submit";
/*付款*/
var TYPE_ORDER_PAY = "order_pay";
/*tcp 单轨处方药 付款提示上传处方*/
var TYPE_ORDER_PAY_NOT = 'order_pay_not';
/*取消订单*/
var TYPE_ORDER_CANCEL = "order_cancel";
/*删除订单*/
var TYPE_ORDER_REMOVE = "order_remove";
var TYPE_ORDER_DELET_TCP = 'delete';
/*确认,同意更改价格*/
var TYPE_AGREE_PRICE_COD_ORDER = "agree_price_cod_order";
/*申请退款、再次申请退款 (待发货)*/
var TYPE_ORDER_APPLY_RETURN_PAY = "order_apply_return_pay";
/*取消申请退款 (待发货)*/
var TYPE_ORDER_APPLY_RETURN_PAY_CANCEL = "order_apply_return_pay_cancel";
/*确认收货*/
var TYPE_ORDER_RECEIVED = "order_received";
/*申请退货款*/
var TYPE_ORDER_APPLY_RETURN = "order_apply_return";
/*退货/款详情 (待收货)*/
var TYPE_ORDER_RETURN_DETAIL = "order_return_detail";
/*发出退货*/
var TYPE_ORDER_RETURN_SEND = "order_return_send";
/*取消退货/款 (待收货)*/
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
/* 编辑退货单页面*/
var ORDER_APPLY_RETURN_PAY_DETAIL = "order_apply_return_pay_detail"
/* ERP订单支付*/
var ERP_ORDER_PAY = "erp_order_pay"
/** 查看提货码 */
var TYPE_LOOK_PICKUP_CODE = "look_pickup_code"
/** 联系配送员 */
var TYPE_ORDER_CONTACT_COURIER = "order_contact_courier"
/** 拼团详情 */
var TYPE_GROUP_BOOKING = 'group_booking'
export default class OrderClick {

    /**
     * 传值
     * @param item {
     *     navigation : navigation  //导航对象
     *     type: "order_apply_return_update" //订单状态
     *     orderNo : 234187263 //订单号
     *     shopName : xxx //商铺名称
     *     orderTotal : 1.00 //商品总价
     *     showTips : (bean)=>{ } //显示BaseTips的方法
     *     showLoading : () => {} //显示Loading的方法
     *     cancelLoading : () => {} //隐藏Loading的方法
     *     refresh : () => {} //刷新数据的方法
     *     goBack :  () => {} //返回
     *
     * }
     */
    static buttonsClick(item) {
        switch (item.type) {
            case TYPE_ORDER_RX_SUBMIT:/*提交处方*/
                this._submitRx(item)
                break
            case TYPE_ORDER_PAY:/*付款*/
                this._requestSubmitRxTips(item)
                break
            case TYPE_ORDER_PAY_NOT://单轨 处方药 需提示上传处方
                this._needSubmitRxTips(item);
                break
            case TYPE_ORDER_CANCEL:/*取消订单*/
                this._cancelOrder(item)
                break
            case TYPE_ORDER_DELET_TCP:
            case TYPE_ORDER_REMOVE:/*删除订单*/
                this._delOrder(item)
                break
            case TYPE_AGREE_PRICE_COD_ORDER:/*同意，确认更改价格*/
                this._confirmChangePrice(item)
                break
            case TYPE_ORDER_APPLY_RETURN_PAY:/*申请退款、再次申请退款*/
                this._requestReturnMoneyAgain(item)
                break
            case TYPE_ORDER_APPLY_RETURN_PAY_CANCEL:/*取消申请退款*/
                this._cancelRequestReturnMoney(item)
                break
            case TYPE_ORDER_RECEIVED:/*确认收货*/
                this._confirmReceiver(item)
                break
            case TYPE_RETURN_UPDATE:/*我要退货，或者只退款不退货*/
            case TYPE_RETURN_PAY_REASON:/*更新收货状态*/
            case TYPE_ORDER_APPLY_RETURN:/*申请退货款*/
                this._returnMoney(item)
                break
            case TYPE_ORDER_RETURN_DETAIL:/*退货/款详情*/
                this._returnMoneyDetail(item)
                break
            case TYPE_ORDER_APPLY_RETURN_CANCEL:/*取消退货/款*/
                this._cancelReturnMoney(item)
                break
            case TYPE_ORDER_BUY_AGAIN:/*重新购买*/
                this._buyAgain(item)
                break
            case TYPE_ORDER_EVALUATION:/*我要评价*/
                this._evaluate(item)
                break
            case TYPE_ORDER_COMPLAINT:/*维权投诉*/
                this._report(item)
                break
            case TYPE_ORDER_COMPLAINT_DETAIL:/*投诉详情*/
                this._reportDeilta(item)
                break
            case TYPE_ORDER_RETURN_SEND:/*发出退货*/
            case TYPE_ORDER_RETURN_SEND_UPDATE:/*更新退货单号*/
                this._updateRetrunNo(item)
                break
            case REMIND_ORDER_SEND_GOODS:/*催发货*/
                this._urgeSendGoods(item)
                break
            case LOOK_LOGISTICS:/*查物流*/
                this._checkLogistics(item)
                break
            case ORDER_APPLY_RETURN_PAY_DETAIL:
                this._editRetrunGoodsInfo(item)
                break
            case ERP_ORDER_PAY:
                this._erpOrderPay(item)
                break
            case TYPE_LOOK_PICKUP_CODE:
                this._showPickupCode(item)
                break
            case TYPE_ORDER_CONTACT_COURIER:
                this._contactCourier(item)
                break
            case TYPE_GROUP_BOOKING:
                this._showGroupBookingDetail(item)
                break
        }
    }

    /**
     * 提交处方
     * @param item
     * @private
     */
    static _submitRx(item) {
        this._gotoSubmitRx(item)
    }


    /*
     *  付款需要提示上传处方
     * */
    static _needSubmitRxTips(item) {
        if (isNotEmpty(item.prompt_info)) {
            let bean = {
                id: item.orderNo,
                title: item.prompt_info,
                leftText: "立即上传",
                leftTextColor: yfwGreenColor(),
                leftClick: ()=> {
                    OrderClick._gotoSubmitRx(item)
                }
            }
            item.showTips(bean)
        }
    }


    /**
     * 付款提示是否没提交处方，去提交跳转提交处方页面，取消调起支付
     * @param item
     * @private
     */
    static _requestSubmitRxTips(item) {
        /*请求弹窗，请求成功之外的情况都调起支付*/
        //to-do
        if(false){
            if (item.refreshHeader) {
                item.refreshHeader()
            }
            return
        }
        OrderClick._pay(item);
    }

    /**
     * 跳转处方
     * @param item
     * @private
     */
    static _gotoSubmitRx(item) {
        const {navigate} = item.navigation;
        pushNavigation(navigate, {
            type: "order_rx_submit",
            value: item.orderNo,
            page: item.page,
            itemPosition: item.positionIndex,
            pageSource: item.pageSource
        })
    }

    /**
     * 调起支付
     * @param item
     * @private
     */
    static _pay(item) {
        item.showPay(item.orderNo)
    }

    /**
     * 取消订单
     * @param item
     * @private
     */
    static _cancelOrder(item) {
        let isOTOOrder = safe(safeObj(safeObj(item).data).dict_order_sub_type) == '2'
        const {navigate} = item.navigation;
        if (isOTOOrder) {

            let _rightClick = () => {
                item.showLoading()
                YFWO2OOrderDetailAPI.cancelOrder(item.orderNo, '我不想买了').then(
                    succ=>{
                        item.cancelLoading();
                        YFWToast('取消成功')
                        if (item.refresh) {
                            item.refresh(item.positionIndex)
                            DeviceEventEmitter.emit('order_status_refresh', item.pageSource)
                        }
                    }
                )
            }
            
            let bean = {
                title: "确定取消订单吗?",
                leftText: "取消",
                rightText: "确定",
                rightClick: _rightClick
            }
            item.showTips(bean)
        } else {
            
            pushNavigation(navigate, {
                type: "order_cancel",
                value: item.orderNo,
                itemPosition: item.positionIndex,
                pageSource: item.pageSource
            })
        }
    }

    /**
     * 删除订单
     * @param item
     * @private
     */
    static _delOrder(item) {
        let _rightClick = () => {
            item.showLoading()
            let viewModel = new YFWRequestViewModel();
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.order.delete');
            paramMap.set('orderno', item.orderNo);
            viewModel.TCPRequest(paramMap, (res) => {
                item.cancelLoading();
                YFWToast('删除成功');
                if (item.refresh) {
                    item.refresh(item.positionIndex)
                }
            })
        }

        let bean = {
            title: "是否删除该订单？\n删除后可以从电脑端订单回收站恢复",
            leftText: "取消",
            rightText: "确定",
            rightClick: _rightClick
        }
        item.showTips(bean)
    }

    /**
     * 同意修改价格
     * @param item
     * @private
     */
    static _confirmChangePrice(item) {
    }

    /**
     *  申请退款,再次申请退款
     * @param item
     * @private
     */
    static _requestReturnMoneyAgain(item) {
        const {navigate} = item.navigation;
        item.showReturn(()=>{
            pushNavigation(navigate, {
                type: "request_refund",
                value: {
                    orderNo: item.orderNo,
                    orderTotal: item.orderTotal,
                    pageSource: item.pageSource,
                    lastPage: item.lastPage,
                    gobackKey: item.navigation.state.key
                }
            })
        })

    }

    /**
     * 取消申请中申请退款
     * @param item
     * @private
     */
    static _cancelRequestReturnMoney(item) {
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.cancelApplyReturn');
        paramMap.set('orderno', item.orderNo);
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("取消申请退款成功")
            DeviceEventEmitter.emit('order_status_refresh', item.pageSource)
            if (isNotEmpty(item.lastPage) && item.lastPage == 'OrderDetail') {
                DeviceEventEmitter.emit('order_status_refresh_in_orderDetail')
            }
        })
    }

    /**
     * 确认收货
     * @param item
     * @private
     */
    static _confirmReceiver(item) {
        let data =item.data.goods_items[0].data
        let img_url = data[0].img_url
        // console.log(JSON.stringify(item))
        if (item.data.dict_order_sub_type == '2') {
            let {orderNo, pageSource} = item
            let {navigate} = item.navigation;
            pushNavigation(navigate,{type:'O2O_Comfirm_Receiption',orderNo:orderNo, pageSource:pageSource})
            return
        }
        let _rightClick
        if(YFWUserInfoManager.ShareInstance().isShopMember()) {
            _rightClick = () => {
                let viewModel = new YFWRequestViewModel();
                let paramMap = new Map();
                paramMap.set('__cmd', 'person.order.receive');
                paramMap.set('orderno', item.orderNo);
                viewModel.TCPRequest(paramMap, (res) => {
                    if (item.refresh) {
                        item.refresh()
                        item.navigation.navigate('YFWOrderSuccessPage', {
                            title: '收货成功',
                            orderNo: item.orderNo,
                            type: 'received',
                            shopName: item.shopName,
                            from: 'orderList',
                            orderTotal: item.orderTotal,
                            img_url: img_url

                        });
                        DeviceEventEmitter.emit('order_status_refresh', item.pageSource)
                    }
                })
            }
        } else {
            _rightClick = () => {
                item.navigation.navigate('YFWConfirmReceipt', {
                    data: item,
                });
            }
        }
        let bean = {
            title: "请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。",
            leftText: "取消",
            rightText: "确认收货",
            rightClick: _rightClick
        }
        item.showTips(bean)

    }

    /**
     * 申请退货款、更新收货状态
     * @param item
     * @private
     */
    static _returnMoney(item) {
        const {navigate} = item.navigation;
        let status = "0";
        if (item.type == "order_apply_return") {
            status = "0"
            if (safeObj(item.data).shipping_method == '同城配送') {
                item.showTipsAlert&&item.showTipsAlert('温馨提示','配送员已快马加鞭的赶过来了，如需申请退款，请先联系配送员',[{text:'我知道了',onPress:()=>{
                    item.showReturn(()=>{
                        pushNavigation(navigate, {
                            type: "order_request_return",
                            value: {
                                orderNo: item.orderNo,
                                status: status,
                                orderTotal: item.orderTotal,
                                package_price: item.data.package_price,
                                shipping_price: item.data.shipping_price,
                                pageSource: item.pageSource,
                                lastPage: item.lastPage,
                                gobackKey:item.gobackKey,
                            }
                        })
                    })
                }}])
                return
            }
        } else if (item.type == "order_apply_return_update") {
            status = "1"
        }
        if (item.type == "order_apply_return_update" && safe(safeObj(safeObj(item).data).dict_order_sub_type) !== '2'){
            pushNavigation(navigate, {
                type: "order_request_return",
                value: {
                    orderNo: item.orderNo,
                    status: status,
                    orderTotal: item.orderTotal,
                    package_price: item.data.package_price,
                    shipping_price: item.data.shipping_price,
                    pageSource: item.pageSource,
                    lastPage: item.lastPage,
                    gobackKey:item.gobackKey,
                }
            })
        }else if(item.type == "order_apply_return_update" && safe(safeObj(safeObj(item).data).dict_order_sub_type) === '2'){
            pushNavigation(navigate, { 
                type: 'O2O_Request_Refund', 
                isNeedPhoto: true, 
                orderNo: item.orderNo, 
                from: 'confirmReceiption', 
                pageSource: item.pageSource, 
                gobackKey: item.gobackKey })
        }
        else{
            item.showReturn(()=>{
                pushNavigation(navigate, {
                    type: "order_request_return",
                    value: {
                        orderNo: item.orderNo,
                        status: status,
                        orderTotal: item.orderTotal,
                        package_price: item.data.package_price,
                        shipping_price: item.data.shipping_price,
                        pageSource: item.pageSource,
                        lastPage: item.lastPage,
                        gobackKey:item.gobackKey,
                    }
                })
            })
        }
    }

    /**
     * 退货款详情
     * @param item
     * @private
     */
    static _returnMoneyDetail(item) {
        console.log(item);
        const {navigate} = item.navigation;
        pushNavigation(navigate, {
            type: "refund_detail",
            mOrderNo: item.orderNo,
            shopName: item.shopName,
            pageSource: item.pageSource,
            orderTotal: item.orderTotal,
            data: item.data,
            gobackKey:item.gobackKey,
        })
    }

    /**
     * 跳转填写退货运单信息页面
     * @param item
     * @private
     */
    static _sendRetrunInfo(item) {
        const {navigate} = item.navigation;
        pushNavigation(navigate, {type: "",})
    }

    /**
     * 取消退货款
     * @param item
     * @private
     */
    static _cancelReturnMoney(item) {
        let _rightClick = ()=> {
            let viewModel = new YFWRequestViewModel();
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.order.cancelReturnGoods');
            paramMap.set('orderno', item.orderNo);
            viewModel.TCPRequest(paramMap, (res) => {
                YFWToast("取消申请退货/款成功")
                DeviceEventEmitter.emit('order_status_refresh', item.pageSource)
                if (isNotEmpty(item.goBack)) {
                    item.goBack()
                }
            })
        }
        let bean = {
            title: "取消退货/款后，将无法再次发起",
            leftText: "取消",
            rightText: "确定",
            rightClick: _rightClick
        }
        item.showTips(bean)
    }

    /**
     * 再次购买
     * @param item
     * @private
     */
    static _buyAgain(item) {
        let isOTOOrder = safe(safeObj(safeObj(item).data).dict_order_sub_type) == '2'
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.buyAgain');
        paramMap.set('orderno', item.orderNo);
        if (isOTOOrder) {
            paramMap.set('is_o2o', '1');
        }
        viewModel.TCPRequest(paramMap, (res) => {
            // item.navigation.popToTop();
            // const resetActionTab = NavigationActions.navigate({routeName: 'ShopCarNav'});
            // item.navigation.dispatch(resetActionTab);
            item.data.goods_items.forEach((item,index,array)=>{
                if(item.package_type == -1){
                    item.data.forEach((item,index,array)=>{
                        YFWUserInfoManager.ShareInstance().addCarIds.set(item.shop_goods_id+'','id')
                    })
                } else {
                    //套餐再次购买, 加入购物车为套餐内商品
                    item.data.forEach((item,index,array)=>{
                        YFWUserInfoManager.ShareInstance().addCarIds.set(item.shop_goods_id+'','id')
                    })
                    //套餐再次购买, 加入购物车为套餐
                    // YFWUserInfoManager.ShareInstance().addCarIds.set(item.package_id+'','id')
                }
            })
            let {navigate} = item.navigation;
            if (isOTOOrder) {
                pushNavigation(navigate, { type:'get_oto_store', data: { storeid: safe(safeObj(safeObj(item).data).shop_id), cartfold: true } })
            } else {
                
                pushNavigation(navigate, {type: 'get_shopping_car'});
            }
        }, (error)=> {
            let errorMessaege = '';
            if (isNotEmpty(error) && isNotEmpty(error.msg)) {
                errorMessaege = error.msg;
                YFWToast(errorMessaege)
            }
        })
    }

    /**
     * 评价
     * @param item
     * @private
     */
    static _evaluate(item) {
        let data =item.data.goods_items[0].data
        let img_url = data[0].img_url
        const {navigate} = item.navigation;
        pushNavigation(navigate, {
            type: "order_evaluation",
            value: {orderNo: item.orderNo, shopName: item.shopName, pageSource: item.pageSource,orderTotal: item.orderTotal,img_url:img_url}
        })
    }

    /**
     * 维权投诉
     * @param item
     * @private
     */
    static _report(item) {
        const {navigate} = item.navigation;
        pushNavigation(navigate, {
            type: "order_report",
            value: {
                mOrderNo: item.orderNo,
                shopName: item.shopName,
                itemPosition: item.positionIndex,
                pageSource: item.pageSource
            }
        })
    }

    /**
     * 投诉详情
     * @param item
     * @private
     */
    static _reportDeilta(item) {
        const {navigate} = item.navigation;
        pushNavigation(navigate, {type: "get_complain_detail", orderNo: item.orderNo})
    }

    /**
     * 更新退货单号
     * @param item
     * @private
     */
    static _updateRetrunNo(item) {
        item.logisticsInfoView&&item.logisticsInfoView.showWithInfo({orderNo: item.orderNo, type: item.type})
        return
        const {navigate} = item.navigation;
        pushNavigation(navigate, {
            type: "order_update_waybill",
            value: {orderNo: item.orderNo, type: item.type}
        })
    }

    /**
     * 催促发货
     * @param item
     * @private
     */
    static _urgeSendGoods(item) {
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.RemindOrderSend');
        paramMap.set('orderno', item.orderNo);
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('提醒已发出，请耐心等待')
            // DeviceEventEmitter.emit('order_status_refresh', item.pageSource)
        }, (error)=> {
            let errorMessaege = '';
            if (isNotEmpty(error) && isNotEmpty(error.msg)) {
                errorMessaege = error.msg;
                YFWToast(errorMessaege)
            }
        })
    }

    /**
     * 查看物流
     * @param item
     * @private
     */
    static _checkLogistics(item) {
        let data =item.data.goods_items[0].data
        let img_url = data[0].img_url
        const {navigate} = item.navigation;
        pushNavigation(navigate, {type: "get_logistics", orderNo: item.orderNo, img_url:img_url})
    }
    /**
     * ERP订单支付
     * @param item
     * @private
     */
    static _erpOrderPay(item) {
        item.showPay(item.orderNo)
    }
    /**
     * 查看提货码
     * @param {*} item
     */
    static _showPickupCode(item){
        item.showTipsAlert&&item.showTipsAlert('温馨提示','出示提货码前请确认实际收货是否与订单商品相符，一旦验证通过则系统自动确认收货',[{text:'我知道了',onPress:()=>{
            item.showPickupCode&&item.showPickupCode()            
        }}])
    }
    /**
     * 联系配送员
     * @param {*} item
     */
    static _contactCourier(item){
        let mobile = safe(safeObj(safeObj(item).data).delivery_mobile)
        YFWNativeManager.takePhone(mobile)
    }
    /**
     * 拼团详情
     */
    static _showGroupBookingDetail(item) {
        const {navigate} = item.navigation;
        getAuthUrl(navigate,item.navigationParams)
    }


    static _editRetrunGoodsInfo(item) {
        const {navigate} = item.navigation;
        pushNavigation(navigate, {
            type: "order_request_money_detail",
            orderNo: item.orderNo,
            title: item.title,
            orderTotal: item.orderTotal,
            package_price: item.package_price,
            shipping_price: item.shipping_price,
            pageSource: item.pageSource,
            lastPage: item.lastPage,
            returnType:item.returnType,
            gobackKey:item.gobackKey,
            successCallBack:item.successCallBack,
        })
    }
}