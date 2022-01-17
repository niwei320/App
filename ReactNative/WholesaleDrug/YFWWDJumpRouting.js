import {DeviceEventEmitter, Alert,Platform} from "react-native";
var forge = require('node-forge');


import {isNotEmpty, currentDate, safe, isEmpty, mobClick, safeObj} from "../PublicModule/Util/YFWPublicFunction";

import YFWUserInfoManager from '../Utils/YFWUserInfoManager'

import {
    getItem, LOGIN_TOKEN,
    setItem,
} from "../Utils/YFWStorage";
import {JOSN} from "../PublicModule/Util/RuleString";
import {getPurchaseStatus, getRegistStatus} from "../Utils/YFWInitializeRequestFunction";

export const kRoute_category = 'get_category'         //分类结果页
export const kRoute_all_category = 'get_all_category'     //商品分类页面
export const kRoute_goods_detail = 'get_goods_detail'     //比价页面
export const kRoute_shop_goods_detail = 'get_shop_goods_detail'//商品详情
export const kRoute_order = 'get_order'            //我的订单
export const kRoute_favorite = 'get_favorite'         //我的收藏页面
export const kRoute_supplier = 'get_supplier' //我的供应商
export const kRoute_user_info = 'get_user_info'         //账户管理

export const kRoute_viewd_history = 'get_viewd_history'            //最近浏览页面
export const kRoute_search = 'get_search'           //搜索页面

export const kRoute_shop_detail = 'get_shop_detail'      //商家详情页面
export const kRoute_shop_detail_list = 'get_shop_detail_list' //商家商品列表
export const kRoute_shop_detail_intro = 'get_shop_detail_intro'//商家简介
export const kRoute_operation_success = 'operation_success'  // 付款成功、收货成功
export const kRoute_frequently_goods = 'frequently_goods'  // 常购商品
export const kRoute_browsing_history = 'browsing_history'  // 浏览历史
export const kRoute_apply_account = 'apply_account'  // 申请开户
export const kRoute_account_complement = 'account_complement'  // 补充资质
export const kRoute_account_qualifiiy = 'account_qualifiiy'  // 开户资料列表
export const kRoute_account_qualifiiy_zzzj = 'account_qualifiiy_zzzj'  // 开户资料资质证件列表
export const kRoute_upload_account_qualifiy = 'upload_account_qualifiy'  // 开户资料上传

export const kRoute_html = 'get_h5'               //跳转到H5页面
export const kRoute_html_static = 'get_h5_static'               //跳转到H5页面
export const kRoute_websitemessage = 'get_website_message'  //站内消息
export const kRoute_order_detail = 'get_order_detail'     //我的订单详情
export const kRoute_invoice_detail = 'get_invoice_detail'     //发票详情
export const kRoute_comment = 'get_comment'          //我的评价
export const kRoute_comment_detail = 'get_comment_detail'   //我的评价详情
export const kRoute_my_complaint = 'my_complaint'  // 我的投诉
export const kRoute_complaint_detail = 'complaint_detail'  // 投诉详情
export const kRoute_order_waiting_payment = 'get_order_waiting_payment'      //订单待付款
export const kRoute_order_waiting_delivery = 'get_order_waiting_delivery'     //订单待发货
export const kRoute_order_waiting_goods = 'get_order_waiting_goods'        //订单待收货
export const kRoute_order_waiting_evaluation = 'get_order_waiting_evaluation'   //订单待评价
export const kRoute_order_rutrun_goods_info = 'get_order_rutrun_goods_info'   //订单待评价
export const kRoute_shoppingcar = 'get_shopping_car'     //购物车
export const kRoute_order_settle = 'get_order_settle' //结算
export const kRoute_coupon = 'get_coupon'           //优惠券
export const kRoute_points = 'get_points'           //积分页
export const kRoute_message = 'get_message'          //消息弹窗
export const kRoute_rating = 'appear_rate'          //弹出评分
export const kRoute_login = 'get_login'            //登录页面
export const kRoute_register = 'get_register'            //提交注册页面
export const kRoute_forget_password = 'forget_password'            //忘记密码
export const kRoute_register_qualify = 'get_register_qualify'            //注册认证页面
export const kRoute_probate_admin = 'get_probate_admin'            //认证管理员页面
export const kRoute_probate_store = 'get_probate_store'            //经营执照认证页面
export const kRoute_probate_qualify = 'get_probate_qualify'            //药品经营许可认证页面
export const kRoute_probate_treatment = 'get_probate_treatment'            //医疗机构执业许可认证页面

export const kRoute_message_list = 'get_message_msgtype_list'       //消息列表页面
export const kRoute_message_home = 'get_message_index_data'         //消息首页
export const kRoute_share = 'get_share'            //获取分享
export const kRoute_save_photo = 'get_save_photo'       //保存相片
export const kRoute_coupon_method = 'get_coupon_method'    //领取优惠券接口
export const kRoute_order_search = 'get_order_search'      //订单搜索
export const kRoute_feedback = 'get_feedback'          //意见反馈
export const kRoute_order_cancel = 'order_cancel'       //取消订单
export const kRoute_order_report = 'order_report'       //我要投诉
export const kRoute_order_return_detail = 'order_return_detail'//退货单详情
export const kRoute_order_request_return = 'order_request_return'//申请退货/款
export const kRoute_order_update_waybill = 'order_update_waybill'//更新运单号
export const kRoute_order_request_money = 'order_request_money' //申请退款
export const kRoute_order_evaluation = 'get_order_evaluation'    //订单评价
// export const kRoute_order_detail = 'order_detail'         //订单详情
export const kRoute_address_manager = 'get_address_manager'//收货地址管理
export const kRoute_address_detail = 'get_address_detail'//收货地址详情
export const kRoute_store_info = 'get_store_info'//企业信息

export const kRoute_modify_password = 'modify_password'//修改密码

export const kRoute_big_picture = "get_big_picture"     //查看大图
export const kRoute_order_request_money_detail = 'order_request_money_detail'//申请退款详情
export const kRoute_check_order_status_vc = 'check_order_status_vc'//订单操作状态页
export const kRoute_logistics = 'get_view_logistics' //查看物流
export const kRoute_call_phone = 'call_phone' //打电话
export const kRoute_refund_one_step = 'get_refund_one_step' //申请退货款 第一步 选择页
export const kRoute_refund_goods = 'get_refund_goods' //申请退货款
export const kRoute_refund_without_delivery = 'get_refund_without_delivery'//申请退款 --未发货情况
export const kRoute_order_operation_success = 'get_order_operation_success'//支付 收货 评价 成功状态页

export const kRoute_about_us = 'account_aboutus' //关于我们
export const kRoute_getcouponvc = 'get_coupon_detail' //领取优惠券

export const kRoute_request_refund = 'request_refund'         //申请退款页
export const kRoute_refund_detail = 'get_refund_detail'         //申请退款详情页
export const kRoute_refund_negotiation = 'get_refund_negotiation'         //退货退款协商详情页
export const kRoute_logistics_company = 'get_logistics_company'  // 物流公司
export const kRoute_my_invoice = 'get_my_invoice'  // 开票信息
export const kRoute_my_coupon = 'get_my_coupon'  // 我的优惠券
export const kRoute_account_setting = 'get_account_setting' //设置页
export const kRoute_all_supplier = 'get_all_supplier' //全部供应商
export const kRoute_feedback_wd = 'get_feedback_wd' //意见反馈
export const kRoute_upload_documents_guide = 'get_upload_documents_guide' //上传资质引导

const YFWWDCategory = 'YFWWDCategory'        //商品分类页面
const YFWWDSubCategoryList = 'YFWWDSubCategoryList'      //分类结果页
const YFWWDSearch = 'YFWWDSearch'      //分类结果页
const YFWWDSellersList = 'YFWWDSellersList' // 比价
const YFWWDGoodsDetailRootVC = 'YFWWDGoodsDetailRootVC' // 商品详情
const YFWWDStoreHome = 'YFWWDStoreHome' //店铺首页
const YFWWDShippingAddress = 'YFWWDShippingAddress' //店铺首页
const YFWWDShopCar = 'YFWWDShopCar' //购物车
const YFWWDOrderSettlementRootVC = 'YFWWDOrderSettlementRootVC' //结算页

const Route_map = new Map()
Route_map.set(kRoute_goods_detail,{route_key:'YFWWDSellersList',route_name:'比价页'})
Route_map.set(kRoute_shop_goods_detail,{route_key:'YFWWDGoodsDetailRootVC',route_name:'商品详情'})
Route_map.set(kRoute_shoppingcar,{route_key:'YFWWDShopCar',route_name:'购物车'})
Route_map.set(kRoute_order_settle,{route_key:'YFWWDOrderSettlementRootVC',route_name:'结算页'})

Route_map.set(kRoute_all_category,{route_key:'YFWWDCategory',route_name:'商品分类'})
Route_map.set(kRoute_category,{route_key:'YFWWDSubCategoryList',route_name:'分类列表'})
Route_map.set(kRoute_search,{route_key:'YFWWDSearch',route_name:'搜索页面'})
Route_map.set(kRoute_address_manager, { route_key: 'YFWWDShippingAddress', route_name: '收货地址管理' })
Route_map.set(kRoute_address_detail, { route_key: 'YFWWDShippingAddressDetail', route_name: '收货地址详情' })

Route_map.set(kRoute_shop_detail,{route_key:'YFWWDStoreHome',route_name:'店铺首页'})
Route_map.set(kRoute_shop_detail_intro,{route_key:'YFWWDStoreIntroduction',route_name:'店铺简介'})
Route_map.set(kRoute_shop_detail_list,{route_key:'YFWWDStoreAllGoods',route_name:'店铺全部商品列表'})
Route_map.set(kRoute_login, { route_key: 'YFWWDLogin', route_name: '登录' })
Route_map.set(kRoute_register, { route_key: 'YFWWDRegister', route_name: '注册' })
Route_map.set(kRoute_forget_password, { route_key: 'YFWWDForgetPassword', route_name: '忘记密码' })
Route_map.set(kRoute_modify_password, { route_key: 'YFWWDModifyPassword', route_name: '修改密码' })
Route_map.set(kRoute_register_qualify, { route_key: 'YFWWDRegisterQualify', route_name: '注册认证' })
Route_map.set(kRoute_probate_admin, { route_key: 'YFWWDProbateAdmin', route_name: '管理员认证' })
Route_map.set(kRoute_probate_store, { route_key: 'YFWWDProbateStore', route_name: '经营执照认证' })
Route_map.set(kRoute_probate_qualify, { route_key: 'YFWWDProbateQualify', route_name: '经营执照认证' })
Route_map.set(kRoute_probate_treatment, { route_key: 'YFWWDProbateTreatmentController', route_name: '医疗机构执业许可认证' })

Route_map.set(kRoute_apply_account, { route_key: 'YFWWDApplyAccount', route_name: '开户申请' })
Route_map.set(kRoute_account_complement, { route_key: 'YFWWDAccountComplementController', route_name: '补充资质' })
Route_map.set(kRoute_account_qualifiiy, { route_key: 'YFWWDAccountQualifiiy', route_name: '开户资料列表' })
Route_map.set(kRoute_account_qualifiiy_zzzj, { route_key: 'YFWWDAccountQualifiiyZZZJController', route_name: '开户资料资质证件列表' })
Route_map.set(kRoute_upload_account_qualifiy, { route_key: 'YFWWDUploadAccountQualifiy', route_name: '上传开户资料' })
Route_map.set(kRoute_frequently_goods, { route_key: 'YFWWDFrequentlyGoods', route_name: '常购商品' })
Route_map.set(kRoute_browsing_history, { route_key: 'YFWWDBrowsingHistory', route_name: '浏览历史' })
Route_map.set(kRoute_my_complaint,{route_key:'YFWWDMyComplaint',route_name:'我的投诉'})
Route_map.set(kRoute_complaint_detail,{route_key:'YFWWDComplaintDetail',route_name:'投诉详情'})

Route_map.set(kRoute_supplier,{route_key:'YFWWDMySupplier',route_name:'我的供应商'})
Route_map.set(kRoute_favorite,{route_key:'YFWWDMyCollection',route_name:'我的收藏'})
Route_map.set(kRoute_store_info,{route_key:'YFWWDMyStoreInfo',route_name:'企业信息'})
Route_map.set(kRoute_my_invoice, { route_key: 'YFWWDMyInvoice', route_name: '开票信息' })
Route_map.set(kRoute_my_coupon,{route_key:'YFWWDMyCoupon',route_name:'我的优惠券'})
Route_map.set(kRoute_order,{route_key:'YFWWDMyOrder',route_name:'我的订单'})
Route_map.set(kRoute_order_detail,{route_key:'YFWWDOrderDetailController',route_name:'订单详情'})
Route_map.set(kRoute_invoice_detail,{route_key:'YFWWDInvoiceImagePage',route_name:'发票详情'})

Route_map.set(kRoute_refund_one_step,{route_key:'YFWWDRefundsGoodsFirstStep',route_name:'申请退货款选择页'})
Route_map.set(kRoute_refund_goods,{route_key:'YFWWDRefundsGoods',route_name:'申请退货款'})
Route_map.set(kRoute_refund_without_delivery,{route_key:'YFWWDRefundNoDeliveryPage',route_name:'未发货申请退款'})
Route_map.set(kRoute_refund_detail,{route_key:'YFWWDRefundDetailPage',route_name:'退货款详情'})
Route_map.set(kRoute_refund_negotiation,{route_key:'YFWWDRefundNegotiationPage',route_name:'退货款协商历史'})
Route_map.set(kRoute_logistics_company,{route_key:'YFWWDLogisticsCompany',route_name:'物流公司'})
Route_map.set(kRoute_order_operation_success,{route_key:'YFWWDOrderSuccessPage',route_name:'订单操作成功状态页'})
Route_map.set(kRoute_order_report,{route_key:'YFWWDOrderReportTypePage',route_name:'申请投诉'})
Route_map.set(kRoute_order_search,{route_key:'YFWWDSearchOrder',route_name:'订单搜索'})
Route_map.set(kRoute_logistics, { route_key: 'YFWWDViewLogisticsInfo', route_name: '查看物流' })
Route_map.set(kRoute_message_home,{route_key:'YFWWDMessageHome',route_name:'我的消息'})
Route_map.set(kRoute_message_list,{route_key:'YFWWDMessageList',route_name:'消息列表'})
Route_map.set(kRoute_order_evaluation,{route_key:'YFWWDEvaluationOrder',route_name:'订单评价'})
Route_map.set(kRoute_comment,{route_key:'YFWWDMyRating',route_name:'我的评价'})
Route_map.set(kRoute_big_picture,{route_key:'BigPictureVC',route_name:'商品详情查看大图'})
Route_map.set(kRoute_operation_success,{route_key:'YFWWDOperationSuccess',route_name:'付款成功、收货成功'})
Route_map.set(kRoute_check_order_status_vc,{route_key:'YFWWDOrderStatusVc',route_name:'订单操作状态'})
Route_map.set(kRoute_order_cancel,{route_key:'YFWWDCancelOrder',route_name:'取消订单'})
Route_map.set(kRoute_html,{route_key:'YFWWebView',route_name:'h5页面'})
Route_map.set(kRoute_html_static,{route_key:'YFWStaticWebView',route_name:'h5页面'})
Route_map.set(kRoute_all_supplier, { route_key: 'YFWWDAllSupplier', route_name: '我的供应商' })
Route_map.set(kRoute_account_setting,{route_key:'YFWWDSetting',route_name:'设置页'})
Route_map.set(kRoute_feedback_wd,{route_key:'YFWWDFeedback',route_name:'意见反馈'})
Route_map.set(kRoute_upload_documents_guide,{route_key:'YFWWDUploadDocumentsGuideView',route_name:'上传认证资质引导页'})

export function pushWDNavigation(navigate, badge) {

    DeviceEventEmitter.emit('ShowInviteView', { value: false });
    let route_info = Route_map.get(badge.type)
    let userInfo = YFWUserInfoManager.ShareInstance();
    if (userInfo.hasLogin()) {
        getPurchaseStatus((status) => {
            if (status
                || badge.type === kRoute_login
                || badge.type === kRoute_register
                || badge.type === kRoute_probate_admin
                || badge.type === kRoute_probate_qualify
                || badge.type === kRoute_probate_treatment
                || badge.type === kRoute_probate_store
                || badge.type === kRoute_html
                || badge.type === kRoute_account_setting
                || badge.type === kRoute_upload_documents_guide
                || badge.type === kRoute_account_qualifiiy
                || badge.type === kRoute_upload_account_qualifiy
                || badge.type === kRoute_account_qualifiiy_zzzj
                || badge.type === kRoute_modify_password
                || badge.type === kRoute_forget_password) {
                if (route_info) {
                    YFWWDNavigate(navigate, route_info.route_key, { state: badge }, route_info.route_name)
                }
            } else {
                YFWWDNavigate(navigate, 'YFWWDRegisterQualify', { state: badge }, '企业注册')
            }
        })
    } else {
        if (badge.type == kRoute_register|| badge.type == kRoute_html || badge.type === kRoute_forget_password) {
            YFWWDNavigate(navigate, route_info.route_key, { state: badge }, route_info.route_name)
        } else {
            YFWWDNavigate(navigate, 'YFWWDLogin', {state:badge},'登录')
        }
    }


}
export function replaceWDNavigation(navigation, badge) {
    DeviceEventEmitter.emit('ShowInviteView', {value: false});
    let route_info = Route_map.get(badge.type)
    if (route_info) {
        YFWWDReplace(navigation,route_info.route_key,{state:badge},route_info.route_name)
        return
    }
}
export function YFWWDReplace(navigation,category,param,namecn){

    let userInfo = YFWUserInfoManager.ShareInstance();
    if (userInfo.hasLogin()) {
        addSessionCount(category,namecn)
        navigation.replace(category, param)
    }else {
        if((isEmpty(param.state.is_login)||param.state.is_login == '0')){
            addSessionCount(category,namecn)
            navigation.replace(category, param)
        }else {
            pushWDNavigation(navigation.navigate, {type: kRoute_login})
        }
    }
}
export function YFWWDNavigate(navigate,category,param,namecn){

    let userInfo = YFWUserInfoManager.ShareInstance();
    if (userInfo.hasLogin()) {
        addSessionCount(category,namecn)
        navigate(category, param)
    }else {
        if((isEmpty(param.state.is_login)||param.state.is_login == '0')){
            addSessionCount(category,namecn)
            navigate(category, param)
        }else {
            pushWDNavigation(navigate, {type: kRoute_login})
        }
    }
}

export function newSesscionId(categoryName,namecn){
    let time = currentDate();
    let md1 = forge.md.md5.create();
    md1.update(time);
    let sessionId = md1.digest().toHex();
    let countMap = {
        'sessionId':sessionId,
        'startTime':time,
        'endTime':time,
        'details':{'YFWMainVC':{'count':1,'name':'首页'}}
    }
    if(categoryName){
        countMap = {
            'sessionId':sessionId,
            'startTime':time,
            'endTime':time,
            'details':{categoryName:{'count':1,'name':namecn}}
        }
    }

    setItem('sessionMap',countMap);

}

export function clearSessionForLaunch(){

    setItem('sessionMap',null);

    newSesscionId();

}

export function clearSessionForSession(){

    getItem('sessionMap').then((data)=>{
        if(data){
            data['details'] = {};

            setItem('sessionMap',data);

        }

    })


}

export function addSessionCount(categoryName,namecn){
    namecn = namecn.replace(JOSN,'')
    getItem('sessionMap').then((data)=>{
        if(data){
            let time = currentDate();
            data['endTime'] = time;
            let countMap = data['details'];
            if(countMap[categoryName]){
                countMap[categoryName]['count'] = countMap[categoryName]['count']+1;
                countMap[categoryName]['name'] = namecn;
            }else
            {
                countMap[categoryName] = {'count':1,'name':namecn};
            }
            setItem('sessionMap',data);

        }else{
            newSesscionId(categoryName,cnname);
        }

    })


}


export function doAfterLogin(navigate, response) {

    let userInfo = YFWUserInfoManager.ShareInstance();
    if (userInfo.hasLogin()) {
        if (response) {
            response();
        }
    } else {

        pushWDNavigation(navigate, {type: kRoute_login})
    }

}

export function doAfterLoginWithCallBack(navigate, response) {

    let userInfo = YFWUserInfoManager.ShareInstance();
    if (!userInfo.hasLogin()) {
        pushWDNavigation(navigate, {type: kRoute_login,callBack:()=>{
            if (response) {
                response()
            }
        }})
    }
}



