import {DeviceEventEmitter, Alert,Platform} from "react-native";
var forge = require('node-forge');


import {isNotEmpty, currentDate, safe, isEmpty, mobClick, safeObj} from "../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWNativeManager from "./YFWNativeManager";

import {
    getItem, LOGIN_TOKEN,
    setItem,
} from "../Utils/YFWStorage";
import { JOSN } from "../PublicModule/Util/RuleString";
import YFWSellersListView from "../Goods/YFWSellersListView";
import YFWToast from "./YFWToast";
import { getSignInData, TYPE_SIGN_POINTS, TYPE_SIGN_COUPON } from "./YFWInitializeRequestFunction";
import YFWOrderMessageBoard from "../UserCenter/order/OrderMessageBoard/YFWOrderMessageBoard";
import { YFWBackStack } from "./YFWBackStack";

var GET_CATEGORY = 'get_category'         //分类结果页
var GET_ALL_CATEGORY = 'get_all_category'     //商品分类页面
var GET_GOODS_DETAIL = 'get_goods_detail'     //比价页面
var GET_ORDER = 'get_order'            //我的订单
var GET_FAVORITE = 'get_favorite'         //我的收藏页面
var MY_INTERGRATION = 'my_intergration'         //我的积分
var USER_INFO = 'user_info'         //账户管理
var USER_CHANGE_NAME = 'user_change_name' //修改姓名
var USER_CHANGE_QQ = 'user_change_qq' //修改QQ
var USER_CHANGE_PWD = 'user_change_pwd' //修改密码
var DRUG_REMINDING = 'drug_reminding'         //服药提醒
var DRUG_REMIDINGDETAIL = 'drug_remidingdetail'         //服药提醒详情
var CHOOSE_MEDICINE_FROMDRUGSTORAGE = 'choose_medicine_fromdrugstorage'         //服药提醒药品库导入

var GET_ASK = 'get_ASK'              //问答页面
var GET_ASK_SEARCH = 'get_ASK_Search'       //问答搜索页面
var GET_ASK_ALL_DEPARTMENT = 'get_ASK_all_department' //问答所有科室页面
var GET_ASK_ALL_QUESTION = 'get_ASK_all_question'  //问答科室
var GET_ASK_ALL_CATEGORY = 'get_ASK_all_category'  //问答分类问题
var GET_MYASK = 'get_myASK'            //我的问答
var GET_SUBMIT_ASK = 'get_submit_ASK'       //提问页面
var GET_ASK_DETAIL = 'get_ask_detail'       //问题详情页面
var GET_ASK_PHARMACIST = 'get_ask_pharmacist'   //问答药师页面

var GET_RECENTLY = 'get_viewd'            //最近浏览页面
var GET_SHOP_AROUND = 'get_shop_around'      //附近药店页面
var GET_SEARCH = 'get_search'           //搜索页面

var GET_SHOP_GOODS_DETAIL = 'get_shop_goods_detail'//商品详情
var GET_SHOP_DETAIL = 'get_shop_detail'      //商家详情页面
var GET_SHOP_DETAIL_LIST = 'get_shop_detail_list' //商家商品列表
var GET_SHOP_DETAIL_INTRO = 'get_shop_detail_intro'//商家简介

var GET_HTML = 'get_h5'               //跳转到H5页面
var GET_WEBSITEMESSAGE = 'get_website_message'  //站内消息
var GET_ORDER_DETAIL = 'get_order_detail'     //我的订单详情
var GET_COMMENT = 'get_comment'          //我的评价
var GET_COMMENT_DETAIL = 'get_comment_detail'   //我的评价详情
var GET_COMPLAIN = 'get_complain'         //我的投诉
var GET_COMPLAIN_DETAIL = 'get_complain_detail'  //我的投诉详情
var GET_ORDER_WAITING_PAYMENT = 'get_order_waiting_payment'      //订单待付款
var GET_ORDER_WAITING_DELIVERY = 'get_order_waiting_delivery'     //订单待发货
var GET_ORDER_WAITING_GOODS = 'get_order_waiting_goods'        //订单待收货
var GET_ORDER_WAITING_EVALUATION = 'get_order_waiting_evaluation'   //订单待评价
var GET_ORDER_RUTRUN_GOODS_INFO = 'get_order_rutrun_goods_info'   //订单待评价
var GET_SHOPPINGCAR = 'get_shopping_car'     //购物车
var GET_COUPON = 'get_coupon'           //优惠券
var GET_COUPON_RECORD = 'get_coupon_record'           //优惠券使用记录页
var GET_POINTS = 'get_points'           //积分页
var GET_MESSAGE = 'get_message'          //消息弹窗
var GET_RATING = 'appear_rate'          //弹出评分
var GET_REGIST_PAGE = 'get_user_reg'         //跳转注册页面
var GET_LOGIN = 'get_login'            //登录页面
var GET_MESSAGE_LIST = 'get_message_msgtype_list'       //消息列表页面
var GET_MESSAGE_HOME = 'get_message_index_data'         //消息首页
var GET_SHARE = 'get_share'            //获取分享
var GET_SAVE_PHOTO = 'get_save_photo'       //保存相片
var GET_COUPON_METHOD = 'get_coupon_method'    //领取优惠券接口
var GET_ORDER_SEARCH = 'get_order_search'      //订单搜索
var GET_FEEDBACK = 'get_feedback'          //意见反馈
var GET_FAPIAOVIEW = 'get_fapiao'          //填写发票
var VERIFY_REAL_NAME = 'verify_real_name'          //实名认证
var VERIFY_FAST_REAL_NAME = 'verify_fast_real_name'          //实名认证

var ORDER_RX_SUBMIT = 'order_rx_submit'       //上传处方
var ORDER_CANCEL = 'order_cancel'       //取消订单
var ORDER_REPORT = 'order_report'       //我要投诉
var ORDER_RETURN_DETAIL = 'order_return_detail'//退货单详情
var ORDER_REQUEST_RETURN = 'order_request_return'//申请退货/款
var ORDER_UPDATE_WAYBILL = 'order_update_waybill'//更新运单号
var ORDER_REQUEST_MONEY = 'order_request_money' //申请退款
var ORDER_EVALUATION = 'order_evaluation'    //订单评价
var ORDER_DETAIL = 'order_detail'         //订单详情
var BUY_IN_SAMESHOP = 'buy_in_sameshop'
var GOODS_DETAIL_QA = 'goods_detail_qa'//商品详情问答
var SELECT_LOCATION = 'select_location'//首页地址选择
var ADDRESS_MANAGER = 'address_manager'//收货地址管理
var ADDRESS_EDIT = 'address_edit'//收货地址新增或编辑
var SHOP_INSTRUCTIONS = 'shop_instructions'//商品说明页
var FIND_PASSWORD = 'find_password'//找回密码
var MODIFY_PASSWORD = 'modify_password'//修改密码

var PRICE_MOVEMENT = 'price_movement'//价格趋势
var CHOOSE_ADDRESS = 'choose_address'//重新定位
var BIG_PICTURE = "big_picture"     //查看大图
var ORDER_REQUEST_MONEY_DETAIL = 'order_request_money_detail'//申请退款详情
var CHECK_ORDER_STATUS_VC = 'check_order_status_vc'//订单操作状态页
var LOGISTICS = 'get_logistics' //物流
var CALL_PHONE = 'call_phone' //打电话
var ERFUND_WITHOURT_GOODS = 'erfund_withourt_goods'//s申请退款

var ABOUT_US = 'account_aboutus' //关于我们
var GetCouponVC = 'get_coupon_detail' //领取优惠券

var PRESCRIPTION_PATIENT_EDIT = 'prescription_patient_edit' // 新增/编辑用药人
var PRESCRIPTION_RESULT = 'prescription_result' // 处方审核结果页
var MY_PRESCRIPTION = 'my_prescription'         //我的处方
var PRESCRIPTION_DETAIL = 'Prescription_Detail'         //我的处方
var PRESCRIPTION_INFO = 'prescription_info'         //处方单信息页
var PATIENT_INFO = 'patient_info'         //用药人页面
var BIG_PRESCRIPTION_PIC = 'big_prescription_pic'         //处方大图
var REQUEST_REFUND = 'request_refund'         //申请退款页
var REFUND_DETAIL = 'refund_detail'         //申请退款详情页
var REFUND_NEGOTIATION = 'refund_negotiation'         //退货退款协商详情页
var LogisticsCompany = 'logistics_company'  // 物流公司

var SETTLEMENT_UNION_MEMBER = 'settlement_union_member'  // 联合会员结算页

var CLOSE_ACCOUNT = 'close_account'

var CLOSE_ACCOUNT_CONFIRM = 'close_account_confirm'
var RX_GOODS_DETAIL_VC = 'rx_goods_detail_vc'

var INVOICE_DETAIL_PAGE = 'invoice_detail_page'
var INVOICE_IMAGE_PAGE = 'invoice_image_page'
var CONFIRM_RECEIPT_PAGE = 'confirm_receipt_page'
var DISCOUNT_NOTICE_PAGE = 'discount_notice_page'
var ORDER_MESSAGE_BOARD = 'order_message_board'
var WholesaleHomePage = 'wholesale_homepage'
var DRUGREGISTRATION = 'get_drugRegistration' //用药登记

var TEST_MODULE_ONE = 'test_module_one' //测试工具主入口
var TEST_MODULE_TWO = 'test_module_two' //所有接口测试
var TEST_MODULE_THREE = 'test_module_three' //单独接口测试
var TEST_MODULE_FOUR = 'test_module_four' //模块相关接口测试
var TEST_MODULE_CUSTOM = 'test_module_custom' //自定义接口测试
var TEST_MODULE_BUSINESS = 'test_module_business'//业务测试
var TEST_MODULE_CHANGE_LOCATION = 'test_module_change_location'//定位切换

var GET_OTO_HOME = 'get_oto_home' // 同城配送首页
var GET_OTO_STORE = 'get_oto_store' // 同城配送店铺页面
var GET_OTO_STORE_SEARCH = 'get_oto_store_search' // 同城配送店铺页面

var O2O_COMFIRM_RECEIPTION = 'O2O_Comfirm_Receiption'//确认收货页
var O2O_SEARCH = 'O2O_Search'//搜索页及其结果页
var O2O_CATEGORY_RESULT = 'O2O_Category_Result'//分类结果页
var O2O_REQUEST_REFUND = 'O2O_Request_Refund'//申请退款
var O2O_RECEIVING_ADDRESS = 'O2O_Receiving_Address'//选择收货地址
var O2O_RECEIVING_ADDRESS_EDIT = 'O2O_Receiving_Address_Edit'//编辑或增加收货地址
var O2O_CITY_LIST = 'O2O_City_List'//城市选择页
var O2O_SHIPPING_ADDRESS = 'O2O_shipping_address'//城市选择页
var O2O_MEDICINE_DETAIL = 'O2O_medicine_detail'//020药品详情
var O2O_ORDER_DETAIL = 'O2O_order_detail'//O2O订单详情
export function pushNavigation(navigate, badge) {

    DeviceEventEmitter.emit('ShowInviteView', {value: false});

    switch (badge.type) {
        case O2O_ORDER_DETAIL:      //O2O订单详情
            YFWNavigate(navigate,'YFWO2OOrderDetailController', {state: badge},'O2O订单详情');
            break
        case O2O_MEDICINE_DETAIL:      //O2O药品详情
            YFWNavigate(navigate,'YFWOTOMedicineDetailController', {state: badge},'O2O药品详情');
            break
        case O2O_RECEIVING_ADDRESS_EDIT: //O2O编辑或增加收货地址页
            YFWNavigate(navigate,'YFWO2OReceivingAddressEdit', {state: badge},'编辑或增加收货地址页');
            break
        case O2O_RECEIVING_ADDRESS: //O2O选择收货地址页
            YFWNavigate(navigate,'YFWO2OReceivingAddress', {state: badge},'选择收货地址页');
            break
        case O2O_CITY_LIST:      //O2O城市选择页
            YFWNavigate(navigate,'YFWO2OCityListPage', {state: badge},'O2O城市选择页');
            break
        case O2O_SHIPPING_ADDRESS:      //O2O地址选择页
            YFWNavigate(navigate,'YFWO2OShippingAddressPage', {state: badge},'O2O地址选择页');
            break
        case GET_OTO_HOME:      //同城配送首页
            YFWNavigate(navigate,'YFWOTOHomeController', {state: badge},'同城配送');
            break
        case GET_OTO_STORE:      //同城配送首页
            YFWNavigate(navigate,'YFWOTOStoreController', {state: badge},'同城配送店铺首页');
            break
        case GET_OTO_STORE_SEARCH:      //同城配送首页
            YFWNavigate(navigate,'YFWOTOStoreSearchController', {state: badge},'同城配送店铺搜索页');
            break
        case O2O_COMFIRM_RECEIPTION:      //O2O确认收货页面
            YFWNavigate(navigate,'YFWO2OOrderConfirmReceiptionController', {state: badge},'确认收货');
            break
        case O2O_REQUEST_REFUND:      //O2O申请退款页
            YFWNavigate(navigate,'YFWO2ORequestRefund', {state: badge},'申请退款');
            break
        case O2O_SEARCH:      //O2O搜索页及其结果页
            YFWNavigate(navigate,'YFWO2OSearchController', {state: badge},'搜索页及其结果页');
            break
        case O2O_CATEGORY_RESULT:      //O2O分类结果页
            YFWNavigate(navigate,'YFWO2OCategoryResultController', {state: badge},'分类结果页');
            break
        case GET_ALL_CATEGORY:      //商品分类页面
            YFWNavigate(navigate,'YFWCategoryController', {state: badge},'商品分类');
            break
        case GET_SHOP_AROUND:

            if(Platform.OS == 'android'){
                YFWNativeManager.nearlyShop()
            }else {
                YFWNativeManager.jumpToMapActivity({}, (info)=> {
                    info["from"] = 'map';
                    YFWNavigate(navigate,'YFWShopDetailController', {state: info},'商家首页');

                });
            }
            break;
        case GET_CATEGORY:          //分类结果页
            YFWNavigate(navigate,'YFWSubCategoryController', {state: badge},'分类列表');
            break
        case GET_HTML:              //H5页面
            YFWNavigate(navigate,'YFWWebView', {state: badge},badge.title?safe(badge.title):safe(badge.name));
            break
        case GET_GOODS_DETAIL:      //比价页面
            YFWNavigate(navigate,'YFWSellersListView', {state: badge},'比价页');
            break
        case GET_SHOP_GOODS_DETAIL: //商品详情
            YFWNavigate(navigate,'YFWGoodsDetailRootVC', {state: badge},'商品详情');
            break
        case GET_SHOPPINGCAR:       //购物车
            YFWNavigate(navigate,'YFWShopCarVC', {state: badge},'购物车');
            break
        case GET_SHOP_DETAIL:       //商家详情页面
            YFWNavigate(navigate,'YFWShopDetailController', {state: badge},'商家详情');
            break
        case VERIFY_REAL_NAME:       //实名认证
            YFWNavigate(navigate,'YFWVerifyRealNamePage', {state: badge},'实名认证');
            break
        case VERIFY_FAST_REAL_NAME:       //实名认证
            YFWNavigate(navigate,'YFWFastVerifyRealNamePage', {state: badge},'实名认证');
            break
        case GET_SHOP_DETAIL_LIST:  //商家商品列表
            YFWNavigate(navigate,'YFWShopDetailGoodsListController', {state: badge},'商家商品列表');
            break
        case GET_SHOP_DETAIL_INTRO: //商家简介
            YFWNavigate(navigate,'YFWShopDetailIntroController', {state: badge},'商家简介');
            break
        case GET_LOGIN:             //登录页面
            let configInfo = YFWUserInfoManager.ShareInstance().getSystemConfig()
            if(configInfo.geetest_onelogin === 0) {
                YFWNavigate(navigate,'YFWLogin', {state: badge},'登录页');
            } else {
                let  isLoginToUserCenter = badge.callBack?true:false;
                YFWNativeManager.isOneLoginPreGetTokenSuccess((getResult)=>{
                    YFWUserInfoManager.ShareInstance().enableOnLogin = true
                    if(getResult || Platform.OS == 'android'){ //android平台判断在原生调用方法里,这里不重复判断
                        YFWNativeManager.oneLogin(isLoginToUserCenter, (res)=>{
                            DeviceEventEmitter.emit('UserLoginSucess');
                            if (badge.callBack) {
                                badge.callBack()
                            }
                        },(error)=>{
                            error = safeObj(error)
                            switch (error.errorCode) {
                                case "preGetTokenFail"://预取号失败
                                    YFWNavigate(navigate,'YFWLogin', {state: badge},'登录页');
                                    break;
                                case "noPermissions"://没有权限
                                    YFWNavigate(navigate,'YFWLogin', {state: badge},'登录页');
                                    break;
                                case "accountChange"://切换账号
                                    badge.from = 'oneLogin'
                                    YFWNavigate(navigate,'YFWLogin', {state: badge},'登录页');
                                    break;
                                case "userCancel"://返回按钮
                                    return;
                                case "loginByPsw":
                                    badge.from = 'oneLogin'
                                    YFWNavigate(navigate,'LoginByPsw',{state: badge},'密码登录页');
                                    mobClick('password login')
                                    break;
                                default:
                                    YFWToast('登录失败，请重试。')
                            }
                        })
                    } else {
                        YFWNavigate(navigate,'YFWLogin', {state: badge},'登录页');
                    }
                },()=>{
                    YFWNavigate(navigate,'YFWLogin', {state: badge},'登录页');
                })
            }
            break
        case GET_SEARCH:            //搜索页面
            YFWNavigate(navigate,'YFWSearchRootController', {state: badge},'搜索页面');
            break
        case GET_ASK:               //健康问答页面
            doAfterLogin(navigate,()=>{
                YFWNavigate(navigate,'YFWHealthAskHomeController', {state: badge},'健康问答首页');
            })
            break
        case GET_ASK_SEARCH:        //健康问答搜索页面
            YFWNavigate(navigate,'YFWHealthAskSearchController', {state: badge},'健康问答搜索页');
            break
        case GET_ASK_ALL_DEPARTMENT:  //健康问答所有科室页面
            YFWNavigate(navigate,'YFWHealthAskAllDepartmentController', {state: badge},'健康问答所有科室页');
            break
        case GET_ASK_ALL_CATEGORY:    //健康问答分类问题页面
            YFWNavigate(navigate,'YFWHealthAskCategoryQuestionController', {state: badge},'健康问答分类问题页');
            break
        case GET_ASK_ALL_QUESTION:    //健康问答所有问题页面
            YFWNavigate(navigate,'YFWHealthAskAllQuestionController', {state: badge},'健康问答所有问题页');
            break
        case GET_MYASK:               //健康问答我的问答页面
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'YFWHealthMyAskController', {state: badge},'健康问答我的问答页');
            })
            break
        case GET_ASK_DETAIL:          //健康问答详情页面
            YFWNavigate(navigate,'YFWHealthAskDetailController', {state: badge},'健康问答详情页');
            break
        case GET_ASK_PHARMACIST:      //健康问答医师页面
            YFWNavigate(navigate,'YFWHealthAskPharmacistHomeController', {state: badge},'健康问答医师页');
            break
        case GET_SUBMIT_ASK:          //健康问答提问页面
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'YFWHealthAskQuestionsController', {state: badge},'健康问答提问页');
            })
            break
        case GET_ORDER_SEARCH:          //订单搜索
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'SerchOrder', {state: badge},'订单搜索');
            },'');
            break
        case GET_FEEDBACK:          //意见反馈
            YFWNavigate(navigate,'Feedback', {state: badge},'意见反馈');
            break
        case GET_FAPIAOVIEW:          //填写发票
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'YFWFaPiaoViewController', {state: badge},'填写发票');
            })
            break
        case ORDER_CANCEL:                //取消订单
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'CancelOrder', {state: badge},'取消订单');
            })
            break
        case ORDER_REPORT:                //我要投诉
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'OrderReportTypePage', {state: badge},'我要投诉')
            },'');
            break
        case GET_ORDER:                //订单列表
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyOrder', {state: badge},'订单列表');
            },'');
            break
        case ORDER_RETURN_DETAIL:         //退货单详情
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'DetailsOfReturns', {state: badge},'退货单详情')
            })
            break
        case ORDER_REQUEST_RETURN:        //申请退货/款
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'RefundsIsReceiveGoods', {state: badge},'申请退货/款')
            })
            break
        case ORDER_UPDATE_WAYBILL:        //填写/更新运单号
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'EditReturnLogistics', {state: badge},'填写/更新运单号')
            })
            break
        case ORDER_REQUEST_MONEY:         //申请退款
            YFWNavigate(navigate,'YFWRefund', {state: badge},'申请退款（未发货）')
            break
        case ORDER_REQUEST_MONEY_DETAIL:         //申请退货款
            YFWNavigate(navigate,'ReturnGoods', {state: badge},'申请退货款')
            break
        case ORDER_EVALUATION:            //订单评价
            YFWNavigate(navigate,'EvaluationOrder', {state: badge},'订单评价')
            break
        case BUY_IN_SAMESHOP:               //同店购
            YFWNavigate(navigate,'BuyInSameShop', {state: badge},'同店购')
            break
        case GET_COMPLAIN_DETAIL:                //投诉详情
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'ComplaintDetail', {state: badge},'投诉详情');
            },'');
            break
        case GET_ORDER_DETAIL:              //订单详情
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'OrderDetail', {state: badge},'订单详情')
            })
            break
        case  ORDER_RX_SUBMIT:              //提交处方
            YFWNavigate(navigate,'YFWUploadRecipeController', {state: badge},'提交处方');
            break;
        case GOODS_DETAIL_QA:                   //商品详情问答
            YFWNavigate(navigate,'YFWGoodsDetailQAVC', {state: badge},'商品详情问答')
            break
        case SELECT_LOCATION://选择地址
            YFWNavigate(navigate,'YFWSelectLocationVC', {state: badge},'选择地址')
            break
        case ADDRESS_MANAGER://收货地址管理
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'ShippingAddress', {state: badge},'收货地址管理')
            })
            break
        case ADDRESS_EDIT://收货地址新增或编辑
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'ShippingAddressDetail', badge,badge.editType == 'new'?'新增收货地址':'编辑收货地址')
            })
            break
        case PRICE_MOVEMENT:
            let goods_id = badge.value;
            YFWNativeManager.startChart(YFWUserInfoManager.ShareInstance().getSsid(),goods_id)
            break
        case CHOOSE_ADDRESS:
            // YFWNativeManager.jumpToChooseAddress();
            break
        case GET_ORDER_WAITING_PAYMENT:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyOrder', {state: {value:1}},'待付款订单');
            },'');
            break
        case GET_ORDER_WAITING_DELIVERY:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyOrder', {state: {value:2}},'待发货订单');
            },'');
            break
        case GET_ORDER_WAITING_GOODS:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyOrder', {state: {value:3}},'待收货订单');
            },'');
            break
        case GET_ORDER_WAITING_EVALUATION:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyOrder', {state: {value:4}},'待评价订单');
            },'');
            break
        case GET_ORDER_RUTRUN_GOODS_INFO:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyOrder', {state: {value:5}},'退货/款订单');
            },'');
            break
        case GET_SHARE:
            DeviceEventEmitter.emit('OpenShareView', {page: 'h5'});
            break
        case GET_RECENTLY:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'RecentlyViewed',{state: badge},'最近浏览页');
            },'');
            break
        case MY_INTERGRATION:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyIntergration',{state: badge},'我的积分页');
            },'');
            break
        case GET_FAVORITE:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyCollection',{state: badge},'我的收藏页');
            },'');
            break
        case GET_COUPON:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyCoupon',{state: badge},'我的优惠券页');
            },'');
            break
        case GET_COUPON_RECORD:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyCouponRecord',{state: badge},'优惠券使用记录');
            },'');
            break
        case GET_COMMENT:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyRating',{state: badge},'我的评价页');
            },'');
            break
        case GET_COMPLAIN:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'MyComplaint',{state: badge},'我的投诉页');
            },'');
            break
        case USER_INFO:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'UserInfo',{state: badge},'账户管理页');
            },'');
            break
        case USER_CHANGE_NAME:
            doAfterLogin(navigate,()=>{
                YFWNavigate(navigate,'UpdateUserName',badge,'修改姓名页');
            })
            break
        case USER_CHANGE_QQ:
            doAfterLogin(navigate,()=>{
                YFWNavigate(navigate,'UpdataQq',badge,'修改QQ页');
            })
            break
        case USER_CHANGE_PWD:
            doAfterLogin(navigate,()=>{
                YFWNavigate(navigate,'UpdateUserPsw',badge,'修改密码页');
            })
            break
        case SHOP_INSTRUCTIONS://说明书页面
            YFWNavigate(navigate,'ShopInstructions',{state: badge},'商品说明书页');
            break
        case DRUG_REMINDING:
            doAfterLogin(navigate, ()=> {
                YFWNavigate(navigate,'DrugReminding',{state: badge},'服药提醒页');
            },'');
            break
        case DRUG_REMIDINGDETAIL:
            YFWNavigate(navigate,'DrugRemidingDetail', {state: badge},'服药提醒详情页')
            break
        case BIG_PICTURE:
            YFWNavigate(navigate,'BigPictureVC', {state: badge},'商品详情查看大图')
            break
        case CHOOSE_MEDICINE_FROMDRUGSTORAGE:
            YFWNavigate(navigate,'ChooseMedicineFromDrugStorage', {state: badge},'服药提醒药品库导入')
            break
        case FIND_PASSWORD:
            YFWNavigate(navigate,'FindPassword', {state: badge},'找回密码页')
            break
        case MODIFY_PASSWORD:
            YFWNavigate(navigate,'ModifyPassword', {state: badge},'修改密码页')
            break
        case CHECK_ORDER_STATUS_VC:
            YFWNavigate(navigate,'OrderStatusVc', {state: badge},'订单操作状态页')
            break
        case LOGISTICS: //物流
            YFWNavigate(navigate,'ViewLogisticsInfo', {state: badge},'物流信息页')
            break
        case ERFUND_WITHOURT_GOODS:
            YFWNavigate(navigate,'RefundWithoutGoods', {state: badge},'申请退款（已发货）')
            break
        case CALL_PHONE://打电话
            YFWNativeManager.takePhone(badge.value)
            break
        case ABOUT_US://关于我们
            YFWNavigate(navigate,'YFWAboutUsController', {state: badge},'关于我们')
            break
        case GetCouponVC://领取优惠券
            YFWNavigate(navigate,'YFWGetCouponVC', {state: badge},'领取优惠券')
            break
        case GET_SAVE_PHOTO:
            if (isNotEmpty(badge.value) && badge.value.length > 0){
                YFWNativeManager.copyImage(badge.value,'net','');
            }
            break
        case PRESCRIPTION_PATIENT_EDIT:
            YFWNavigate(navigate, 'YFWPatientEditController', {state: badge}, '编辑用药人信息页')
            break
        case PRESCRIPTION_RESULT:
            YFWNavigate(navigate, 'YFWPrescriptionAuditResultController', {state: badge}, '处方审核结果页')
            break
        case MY_PRESCRIPTION:
            doAfterLogin(navigate, () => {
                YFWNavigate(navigate, 'MyPrescription', { state: badge }, '我的处方');
                            }, '');
            break
        case PRESCRIPTION_DETAIL:
            doAfterLogin(navigate, () => {
                YFWNavigate(navigate, 'PrescriptionDetail', { state: badge }, '我的处方');
                            }, '');
            break
        case PRESCRIPTION_INFO:
            YFWNavigate(navigate, 'YFWUploadPrescriptionController', { state: badge }, '处方单信息');
            break
        case PATIENT_INFO:
            YFWNavigate(navigate, 'YFWPatientInfoController', { state: badge }, '处方单信息');
            break
        case REQUEST_REFUND:
            YFWNavigate(navigate, 'YFWRequestRefundPage', { state: badge }, '退款申请');
            break
        case REFUND_DETAIL:
            YFWNavigate(navigate, 'YFWRefundDetailPage', { state: badge }, '退款/退货详情');
            break
        case REFUND_NEGOTIATION:
            YFWNavigate(navigate, 'YFWRefundNegotiationPage', { state: badge }, '退款协商详情');
            break
        case LogisticsCompany:
            YFWNavigate(navigate,'YFWLogisticsCompany',{state:badge},'物流公司')
            break
        case SETTLEMENT_UNION_MEMBER:
            YFWNavigate(navigate,'YFWSettlementUnionMemberPage',{state:badge},'联合会员结算页')
            break
        case CLOSE_ACCOUNT:
            YFWNavigate(navigate,'YFWCloseAccountPage',{state:badge},'注销账户页')
            break
        case CLOSE_ACCOUNT_CONFIRM:
            YFWNavigate(navigate,'YFWCloseAccountConfirmPage',{state:badge},'注销账户确认页')
            break
        case RX_GOODS_DETAIL_VC:
            YFWNavigate(navigate,'YFWRxGoodsDetailVC',{state:badge},'处方药商品详情页')
            break
        case INVOICE_DETAIL_PAGE:
            YFWNavigate(navigate,'YFWInvoiceDetailPage',{state:badge},'发票详情页')
            break
        case INVOICE_IMAGE_PAGE:
            YFWNavigate(navigate,'YFWInvoiceImagePage',{state:badge},'发票详情大图页')
            break
        case CONFIRM_RECEIPT_PAGE:
            YFWNavigate(navigate,'YFWConfirmReceipt',{state:badge},'确认收货填写批号')
            break
        case DISCOUNT_NOTICE_PAGE:
            YFWNavigate(navigate,'YFWDiscountNoticePage',{state:badge},'降价通知页')
            break
        case ORDER_MESSAGE_BOARD:
            YFWNavigate(navigate,'YFWOrderMessageBoard',{state:badge},'留言板')
            break
        case WholesaleHomePage:
            YFWNavigate(navigate,'YFWWholesaleHomePage',{state:badge},'批发首页')
            break
        case DRUGREGISTRATION:
            YFWNavigate(navigate,'YFWDrugRegistrationController',{state:badge},'用药登记')
            break
        case TEST_MODULE_ONE:
            YFWNavigate(navigate,'YBTestHomeLevel',badge,'测试工具-首页')
            break
        case TEST_MODULE_TWO:
            YFWNavigate(navigate,'YBTestAllApisLevel',badge,'测试工具-测试所有接口')
            break
        case TEST_MODULE_THREE:
            YFWNavigate(navigate,'YBTestOneApisLevel',badge,'测试工具-测试单独接口')
            break
        case TEST_MODULE_FOUR:
            YFWNavigate(navigate,'YBTestModuleApisLevel',badge,'测试工具-测试模块接口')
            break
        case TEST_MODULE_CUSTOM:
            YFWNavigate(navigate,'YBTestCustomApi',badge,'测试工具-自定义测试接口')
            break
        case TEST_MODULE_BUSINESS:
            YFWNavigate(navigate,'YBTestBusiness',badge,'测试工具-业务逻辑测试')
            break
        case TEST_MODULE_BUSINESS:
            YFWNavigate(navigate,'YBTestChangeLocation',badge,'测试工具-修改定位')
            break
    }

}

export function YFWNavigate(navigate,category,param,namecn){
    param.state = safeObj(param.state)
    if (category == 'YFWSellersListView'&&YFWSellersListView.sharedInstance()) {//比价页
        YFWSellersListView.sharedInstance().clearStatus()
        YFWSellersListView.sharedInstance().setGoodsID(param.state.value)
        if (param.state.goodsInfo) {
            YFWSellersListView.sharedInstance().setGoodsInfo(param.state.goodsInfo)
        }
        if (param.state.price_quantity) {
            YFWSellersListView.sharedInstance().setShopCount(param.state.price_quantity)
        }
        YFWSellersListView.sharedInstance().fetchAllDataFromServer()
    }
    let userInfo = YFWUserInfoManager.ShareInstance();
    if (userInfo.hasLogin()) {
        addSessionCount(category,namecn)
        navigate(category, param)
        DeviceEventEmitter.emit('OpenBlindMobile')
    }else {
        if((isEmpty(param.state.is_login)||param.state.is_login == '0')){
            addSessionCount(category,namecn)
            navigate(category, param)
        }else {
            pushNavigation(navigate, {type: 'get_login'})
        }
    }
    let jumpType = param.state.type || param.type
    let hookTypes = [
        'get_search',
        'get_category',
        'get_goods_detail',
        'get_shop_goods_detail',
        'get_order',
        'get_order_waiting_payment',
        'get_order_waiting_delivery',
        'get_order_waiting_goods',
        'get_order_waiting_evaluation',
        'get_order_rutrun_goods_info',
        'get_order_detail',
        'get_shopping_car',
        'user_change_name',
        'user_change_qq',
        'user_change_pwd',
        'get_shop_detail',
        'get_shop_detail_list',
        'get_shop_detail_intro',
        'address_edit',
        'get_feedback',
        'order_evaluation',
        'order_report',
        'get_order_search',
        'prescription_patient_edit',
    ]
    if (hookTypes.some((type)=>{return type == jumpType})) {
        YFWBackStack.ShareInstance().setLastVC(jumpType,param.state || param)
    } else {
        YFWBackStack.ShareInstance().clearLastVC()
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

        pushNavigation(navigate, {type: 'get_login'})
    }

}

export function doAfterLoginWithCallBack(navigate, response) {

    let userInfo = YFWUserInfoManager.ShareInstance();
    if (!userInfo.hasLogin() && (userInfo.enableOnLogin || userInfo.getSystemConfig().geetest_onelogin === 0 )) {
        userInfo.enableOnLogin = false
        pushNavigation(navigate, {type: 'get_login',callBack:()=>{
            if (response) {
                setTimeout(() => {
                    response()
                }, 500);
            }
        }})
    }
}



