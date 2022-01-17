/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeAppEventEmitter, NativeEventEmitter,
    NativeModules,
    Platform,
    StyleSheet,
    Text,
    Alert,
    TouchableOpacity,
    View,
    AppState
} from 'react-native';
/* 添加路由组件 */
import Navigation from 'react-navigation';
import {BaseStyles} from "./Utils/YFWBaseCssStyle";
/* tabBar  */
import YFWShopCarVC from './ShopCar/YFWShopCarVC'
import YFWUserCenterVC from './UserCenter/YFWUserCenterVC'
import YFWSellersListView from './Goods/YFWSellersListView'
import YFWGoodsDetailRootVC from './GoodsDetail/YFWGoodsDetailRootVC'
import YFWWebView from './BaseVC/YFWWebView'
import YFWLogin from './UserCenter/YFWLogin'
import Setting from './UserCenter/YFWSettingController'
import YFWMainVC from './HomePage/YFWMainVC'
import YFWOrderSettlementRootVC from './OrderPay/YFWOrderSettlementRootVC'
import MyIntergration from './UserCenter/MyIntergration'
import MyCollection from './UserCenter/MyCollection'
import DrugReminding from './UserCenter/DrugReminding'
import DrugRemidingDetail from './UserCenter/DrugRemidingDetail'
import MyOrder from './UserCenter/MyOrder'
import ShippingAddress from './UserCenter/ShippingAddress'
import RecentlyViewed from './UserCenter/RecentlyViewed'
import MyCoupon from './UserCenter/MyCoupon'
import MyRating from './UserCenter/MyRating'
import LoginByPsw from './UserCenter/LoginByPsw'
import MyComplaint from './UserCenter/MyComplaint'
import UserInfo from './UserCenter/UserInfo'
import UpdateUserName from './UserCenter/UpdateUserName'
import UpdataUserPhone from './UserCenter/UpdataUserPhone'
import YFWMyMessageController from './Message/Controller/YFWMyMessageController'
import YFWMessageListController from './Message/Controller/YFWMessageListController'
import UpdataTelphone from './UserCenter/UpdataTelphone'
import UpdataQq from './UserCenter/UpdataQq'
import UpdateUserPsw from './UserCenter/UpdateUserPsw'
import YFWSubCategoryController from './FindYao/Controller/YFWSubCategoryController'
import Feedback from './UserCenter/Feedback'
import YFWCategoryController from './FindYao/Controller/YFWCategoryController'
import YFWFindYaoController from './FindYao/Controller/YFWFindYaoController'
import YFWShopDetailController from './FindYao/Controller/YFWShopDetailController'
import YFWShopDetailGoodsListController from './FindYao/Controller/YFWShopDetailGoodsListController'
import YFWShopDetailIntroController from './FindYao/Controller/YFWShopDetailIntroController'
import YFWSearchRootController from './HomePage/Search/Controller/YFWSearchRootController'
import ShippingAddressDetail from './UserCenter/ShippingAddressDetail'
// import OrderDetail from './UserCenter/order/OrderDetail'
import OrderDetail from './UserCenter/order/OrderDetail/YFWOrderDetailController'
import ContactUs from './UserCenter/ContactUs'
import YFWAboutUsController from './UserCenter/YFWAboutUsController'
import YFWHealthAskHomeController from "./HomePage/HealthAsk/Controller/YFWHealthAskHomeController";
import YFWHealthAskSearchController
    from "./HomePage/HealthAsk/Controller/YFWHealthAskSearchController";
import YFWHealthAskAllDepartmentController
    from "./HomePage/HealthAsk/Controller/YFWHealthAskAllDepartmentController";
import YFWHealthAskAllQuestionController
    from "./HomePage/HealthAsk/Controller/YFWHealthAskAllQuestionController";
import YFWHealthMyAskController from "./HomePage/HealthAsk/Controller/YFWHealthMyAskController";
import YFWHealthAskDetailController
    from "./HomePage/HealthAsk/Controller/YFWHealthAskDetailController";
import YFWHealthAskCategoryQuestionController
    from "./HomePage/HealthAsk/Controller/YFWHealthAskCategoryQuestionController";
import YFWHealthAskPharmacistHomeController
    from "./HomePage/HealthAsk/Controller/YFWHealthAskPharmacistHomeController";
import YFWHealthAskQuestionsController
    from "./HomePage/HealthAsk/Controller/YFWHealthAskQuestionsController";
import YFWOrderSettlementListController from "./OrderPay/YFWOrderSettlementListController";
import YFWGetCouponVC from "./BaseVC/YFWGetCouponVC";
import {
    configLaunchView,
    getAppConfig,
    YFWInitializeRequestFunction,
    configPermissionsView,
    homeAdviewClick,
    isCurrentInDateRange,
    requestUpdateInfo, getCityRegionId, sysConfigRequest
} from "./Utils/YFWInitializeRequestFunction";
import YFWVersionUpdateView from "./widget/YFWVersionUpdateView";
import YFWOpenNotificationAlertView from "./widget/YFWOpenNotificationAlertView";
import YFWNotificationView from "./widget/YFWNotificationView"
import YFWAdvertView from "./widget/YFWAdvertView";
import YFWLaunchView from "./widget/YFWLaunchView";
import YFWRateView from "./widget/YFWRateView";
import SerchOrder from './UserCenter/order/SerchOrder';
import BindUserPhoneNum from './UserCenter/BindUserPhoneNum';
import ForgotPassword from './UserCenter/ForgotPassword';
import CancelOrder from './UserCenter/order/CancelOrder';
import YFWRefund from './UserCenter/order/YFWRefund';
import RefundsIsReceiveGoods from './UserCenter/order/RefundsIsReceiveGoods';
import ReturnGoods from './UserCenter/order/ReturnGoods';
import EvaluationOrder from './UserCenter/order/EvaluationOrder';
import ClaimForRights from './UserCenter/order/ClaimForRights';
import DetailsOfReturns from './UserCenter/order/DetailsOfReturns';
import EditReturnLogistics from './UserCenter/order/EditReturnLogistics';
import ViewLogisticsInfo from './UserCenter/order/ViewLogisticsInfo';
import BuyInSameShop from './Goods/BuyInSameShop';
import YFWPatientEditController from './UserCenter/Prescription/YFWPatientEditController'
import YFWPrescriptionAuditResultController from './UserCenter/Prescription/YFWPrescriptionAuditResultController'
import YFWVerifyRealNamePage from './UserCenter/YFWVerifyRealNamePage'

import YFWFaPiaoViewController from './OrderPay/View/YFWFaPiaoViewController'
import {pushNavigation} from "./Utils/YFWJumpRouting";
import ComplaintDetail from "./UserCenter/ComplaintDetail";
import YFWUploadRecipeController from "./OrderPay/Controller/YFWUploadRecipeController";
import YFWGoodsDetailQAVC from './GoodsDetail/YFWGoodsDetailQAVC';
import YFWSelectLocationVC from './UserCenter/YFWSelectLocationVC'
import UtilityMenu from './widget/UtilityMenu'
import YFWShareView from './widget/YFWShareView'
import LoadProgress from './widget/LoadProgress'
import {
    dismissKeyboard_yfw, getTimeDifference,
    isIphoneX, isNotEmpty,
    kScreenHeight,
    kScreenWidth,
    safeObj,
    safe,
    isEmpty,
    extractingImge, mobClick,
} from "./PublicModule/Util/YFWPublicFunction";

import InviteView from './widget/InviteView'
import {YFWNoNetWorkTipView} from "./widget/YFWNoNetWorkTipView";
import YFWAdView from "./widget/YFWAdView";
import ShopInstructions from './Goods/YFWShopInstructions';
import ShopCarRedPoint from './widget/ShopCarRedPoint'
import NavigationLabelView from "./widget/NavigationLabelView";
import BigPictureVC from "./UserCenter/BigPictureVC";
import ChooseMedicineFromDrugStorage from "./UserCenter/ChooseMedicineFromDrugStorage";
import FindPassword from './UserCenter/FindPassword'
import YFWVerificationController from './UserCenter/YFWVerificationController'
import ModifyPassword from './UserCenter/ModifyPassword'
import OrderStatusVc from './UserCenter/order/OrderStatusVc'
import RefundWithoutGoods from './UserCenter/order/RefundWithoutGoods'
import YFWNativeManager from "./Utils/YFWNativeManager";
import YFWReLoginView from "./widget/YFWReLoginView";
import YFWUserInfoManager from "./Utils/YFWUserInfoManager";
import YFWLocationPermissionDialog from "./widget/YFWLocationPermissionDialog";
import {darkTextColor} from "./Utils/YFWColor";
import YFWOrderSuccessPage from "./OrderPay/YFWOrderSuccessPage";
import MyPrescription from './UserCenter/Prescription/MyPrescription'
import PrescriptionDetail from './UserCenter/Prescription/PrescriptionDteail'
import {
    kIsFirstLoadLaunchKey,
    getItem,
    setItem,
    kLastDateLaunchApp,
    KAddressManual,
    KRegionIdManual,
    YFWLocationData,
    YFWLocationManualData,
    LOGIN_TOKEN,
    removeItem,
    kO2OCityListCacheData
} from './Utils/YFWStorage';
import YFWSwitchAddressView from "./widget/YFWSwitchAddressView";
import YFWToast from "./Utils/YFWToast";
import YFWUploadPrescriptionController from "./OrderPay/Controller/YFWUploadPrescriptionController";
import YFWPatientInfoController
    from "./UserCenter/Prescription/Controller/YFWPatientInfoController";
import YFWRequestViewModel from "./Utils/YFWRequestViewModel";
import NavigationActions from "../node_modules_local/react-navigation/src/NavigationActions";
import YFWRequestRefundPage from "./UserCenter/order/YFWRequestRefundPage";
import YFWRefundDetailPage from "./UserCenter/order/YFWRefundDetailPage";
import YFWLogisticsCompany from './UserCenter/order/YFWLogisticsCompany';
import YFWRefundNegotiationPage from "./UserCenter/order/YFWRefundNegotiationPage";
import YFWSettlementUnionMemberPage from "./OrderPay/YFWSettlementUnionMemberPage";
import YFWCloseAccountPage from "./UserCenter/Prescription/YFWCloseAccountPage"
import YFWCloseAccountConfirmPage from "./UserCenter/Prescription/YFWCloseAccountConfirmPage"
import YFWCloseTipAlert, { kTipTypeClosed, kLoginCloseAccountKey } from './UserCenter/View/YFWCloseTipAlert';
import YFWPermissionsView from './widget/YFWPermissionsView'
import YFWHeaderExamplePage from './HomePage/YFWHeaderExamplePage'
import YFWRxGoodsDetailVC from "./GoodsDetail/YFWRxGoodsDetailVC";
import OrderReportDetailPage from "./UserCenter/order/OrderReport/OrderReportDetailPage";
import OrderReportTypePage from "./UserCenter/order/OrderReport/OrderReportTypePage";
import BottomHideTipsDialog from "./PublicModule/Widge/BottomHideTipsDialog";

import YFWWholesaleHomePage from './WholesaleDrug/YFWWholesaleHomePage'
import YFWInvoiceDetailPage from "./UserCenter/order/InvoiceDetail/YFWInvoiceDetailPage";
import YFWInvoiceImagePage from "./UserCenter/order/InvoiceDetail/YFWInvoiceImagePage";
import YFWConfirmReceipt from "./UserCenter/order/ConfirmReceipt/YFWConfirmReceipt";
import YFWBatchNumberExamples from "./UserCenter/order/ConfirmReceipt/YFWBatchNumberExamples";
import MyCouponRecord from "./UserCenter/MyCouponRecord";
import YFWDiscountNoticePage from "./GoodsDetail/YFWDiscountNoticePage";
import YFWOrderMessageBoard from "./UserCenter/order/OrderMessageBoard/YFWOrderMessageBoard";
import YFWDrugRegistrationController from "./OrderPay/Controller/YFWDrugRegistrationController"
import FastImage from 'react-native-fast-image';
import SharePosterPic from './widget/SharePosterPic';
import YFWRealNameAlertView from './widget/YFWRealNameAlertView';
import YFWFastVerifyRealNamePage from './UserCenter/YFWFastVerifyRealNamePage'
import { YFWBackStack } from './Utils/YFWBackStack';
import YBTestHomeLevel from './TestModule/YBTestHomeLevel'
import YBTestAllApisLevel from './TestModule/YBTestAllApisLevel'
import YBTestOneApiLevel from './TestModule/YBTestOneApiLevel'
import YBTestModuleApisLevel from './TestModule/YBTestModuleApisLevel'
import YBTestCustomApi from './TestModule/YBTestCustomApi'
import YBTestBusiness from './TestModule/YBTestBusiness'
import YBTestChangeLocation from './TestModule/YBTestChangeLocation'
import YFWO2OShippingAddressPage from "./O2O/YFWO2OShippingAddress/YFWO2OShippingAddressPage";

import YFWOTOOrderSettlement from "./O2O/OrderPay/YFWOTOOrderSettlement"

import YFWOTOHomeController from './O2O/Home/YFWOTOHomeController'
import YFWOTOStoreController from './O2O/Store/YFWOTOStoreController'
import YFWOTOStoreSearchController from './O2O/Store/YFWOTOStoreSearchController'

import YFWO2OCategoryResultController from "./O2O/CategoryResult/YFWO2OCategoryResultController"
import YFWO2OSearchController from './O2O/O2OSearch/YFWO2OSearchController'
import YFWO2OOrderConfirmReceiptionController from './O2O/OrderConfirmReceiption/YFWO2OOrderConfirmReceiptionController'
import YFWO2ORequestRefund from './O2O/RequestRefund/YFWO2ORequestRefund'
import YFWO2OReceivingAddress from './O2O/O2OReceivingAddress/YFWO2OReceivingAddress'
import YFWO2OReceivingAddressEdit from './O2O/O2OReceivingAddress/YFWO2OReceivingAddressEdit'
import YFWO2OCityListPage from "./O2O/YFWO2OCityList/YFWO2OCityListPage";
import YFWOTOMedicineDetailController from './O2O/MedicineDetail/YFWOTOMedicineDetailController';
import YFWO2OOrderDetailController from "./O2O/OrderDetail/YFWO2OOrderDetailController";
const {YFWEventManager} = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);
export const IMG_LOADING = require('../img/loading.gif')
export const IMG_NET_ERROR = require('../img/ic_net_error.png')


const styles = StyleSheet.create({
    tab: {
        height: 50,
        backgroundColor: 'white',
        borderTopColor: 'white'
    },
    tabIcon: {
        width: 26,
        height: 26,
        marginTop: 2
    },
    tabLabel: {
        flex:1,
        // marginBottom: 8
    }
});

//导航器页面注册
const navigatorRegistPage = {
    YFWHeaderExamplePage:{screen:YFWHeaderExamplePage},
    YFWMainVC: {screen: YFWMainVC},
    YFWWebView: {screen: YFWWebView},
    YFWSellersListView: {screen: YFWSellersListView},
    YFWGoodsDetailRootVC: {screen: YFWGoodsDetailRootVC},
    YFWCategoryController: {screen: YFWCategoryController},
    YFWShopCarVC: {screen: YFWShopCarVC},
    YFWFindYaoController: {screen: YFWFindYaoController},
    YFWOrderSettlementRootVC: {screen: YFWOrderSettlementRootVC},
    YFWUserCenterVC: {screen: YFWUserCenterVC},
    YFWLogin: {screen: YFWLogin},
    Setting: {screen: Setting},
    MyIntergration: {screen: MyIntergration},
    MyCollection: {screen: MyCollection},
    DrugReminding: {screen: DrugReminding},
    DrugRemidingDetail: {screen: DrugRemidingDetail},
    MyOrder: {screen: MyOrder},
    ShippingAddress: {screen: ShippingAddress},
    RecentlyViewed: {screen: RecentlyViewed},
    MyCoupon: {screen: MyCoupon},
    MyCouponRecord: {screen:MyCouponRecord},
    MyRating: {screen: MyRating},
    LoginByPsw: {screen: LoginByPsw},
    MyComplaint: {screen: MyComplaint},
    UserInfo: {screen: UserInfo},
    UpdateUserName: {screen: UpdateUserName},
    UpdataUserPhone: {screen: UpdataUserPhone},
    YFWMyMessageController: {screen: YFWMyMessageController},
    YFWMessageListController: {screen: YFWMessageListController},
    UpdataTelphone: {screen: UpdataTelphone},
    UpdataQq: {screen: UpdataQq},
    UpdateUserPsw: {screen: UpdateUserPsw},
    YFWSubCategoryController: {screen: YFWSubCategoryController},
    Feedback: {screen: Feedback},
    YFWShopDetailController: {screen: YFWShopDetailController, path: 'demo2/abc/:shop_id'},
    YFWShopDetailGoodsListController: {screen: YFWShopDetailGoodsListController},
    YFWShopDetailIntroController: {screen: YFWShopDetailIntroController},
    ShippingAddressDetail: {screen: ShippingAddressDetail},
    OrderDetail: {screen: OrderDetail},
    ContactUs: {screen: ContactUs},
    YFWSearchRootController: {screen: YFWSearchRootController},
    YFWHealthAskHomeController: {screen: YFWHealthAskHomeController},
    YFWHealthAskSearchController: {screen: YFWHealthAskSearchController},
    YFWHealthAskAllDepartmentController: {screen: YFWHealthAskAllDepartmentController},
    YFWHealthAskAllQuestionController: {screen: YFWHealthAskAllQuestionController},
    YFWHealthMyAskController: {screen: YFWHealthMyAskController},
    YFWHealthAskDetailController: {screen: YFWHealthAskDetailController},
    YFWHealthAskCategoryQuestionController: {screen: YFWHealthAskCategoryQuestionController},
    YFWHealthAskPharmacistHomeController: {screen: YFWHealthAskPharmacistHomeController},
    YFWHealthAskQuestionsController: {screen: YFWHealthAskQuestionsController},
    YFWOrderSettlementListController: {screen: YFWOrderSettlementListController},
    SerchOrder: {screen: SerchOrder},
    BindUserPhoneNum: {screen: BindUserPhoneNum},
    ForgotPassword: {screen: ForgotPassword},
    CancelOrder: {screen: CancelOrder},
    YFWRefund: {screen: YFWRefund},
    RefundsIsReceiveGoods: {screen: RefundsIsReceiveGoods},
    ReturnGoods: {screen: ReturnGoods},
    EvaluationOrder: {screen: EvaluationOrder},
    ClaimForRights: {screen: ClaimForRights},
    DetailsOfReturns: {screen: DetailsOfReturns},
    EditReturnLogistics: {screen: EditReturnLogistics},
    ViewLogisticsInfo: {screen: ViewLogisticsInfo},
    BuyInSameShop: {screen: BuyInSameShop},
    YFWFaPiaoViewController: {screen: YFWFaPiaoViewController},
    YFWOrderSuccessPage: {screen: YFWOrderSuccessPage},
    ComplaintDetail: {screen: ComplaintDetail},
    YFWUploadRecipeController: {screen: YFWUploadRecipeController},
    YFWUploadPrescriptionController: {screen: YFWUploadPrescriptionController},
    YFWPatientInfoController: {screen: YFWPatientInfoController},
    YFWGoodsDetailQAVC: {screen: YFWGoodsDetailQAVC},
    YFWSelectLocationVC: {screen: YFWSelectLocationVC},
    ShopInstructions: {screen: ShopInstructions},
    FindPassword: {screen: FindPassword},
    ModifyPassword: {screen: ModifyPassword},
    VerificationCode: {screen: YFWVerificationController},
    BigPictureVC: {screen: BigPictureVC},
    ChooseMedicineFromDrugStorage: {screen: ChooseMedicineFromDrugStorage},
    OrderStatusVc: {screen: OrderStatusVc},
    RefundWithoutGoods: {screen: RefundWithoutGoods},
    YFWAboutUsController: {screen: YFWAboutUsController},
    YFWGetCouponVC: {screen: YFWGetCouponVC},
    YFWPatientEditController: {screen: YFWPatientEditController},
    YFWPrescriptionAuditResultController: {screen: YFWPrescriptionAuditResultController},
    MyPrescription: {screen: MyPrescription},
    PrescriptionDetail: {screen: PrescriptionDetail},
    YFWRequestRefundPage: {screen: YFWRequestRefundPage},
    YFWRefundDetailPage: {screen: YFWRefundDetailPage},
    YFWRefundNegotiationPage: {screen: YFWRefundNegotiationPage},
    YFWLogisticsCompany:{screen: YFWLogisticsCompany},
    YFWSettlementUnionMemberPage:{screen: YFWSettlementUnionMemberPage},
    YFWCloseAccountPage:{screen: YFWCloseAccountPage},
    YFWCloseAccountConfirmPage:{screen:YFWCloseAccountConfirmPage},
    YFWPermissionsView: {screen:YFWPermissionsView},
    YFWRxGoodsDetailVC: {screen:YFWRxGoodsDetailVC},
    OrderReportDetailPage: {screen:OrderReportDetailPage},
    OrderReportTypePage: {screen:OrderReportTypePage},
    YFWInvoiceDetailPage: {screen:YFWInvoiceDetailPage},
    YFWInvoiceImagePage: {screen:YFWInvoiceImagePage},
    YFWWholesaleHomePage: {screen:YFWWholesaleHomePage},
    YFWConfirmReceipt: {screen:YFWConfirmReceipt},
    YFWDiscountNoticePage: {screen:YFWDiscountNoticePage},
    YFWOrderMessageBoard: {screen:YFWOrderMessageBoard},
    YFWVerifyRealNamePage: {screen:YFWVerifyRealNamePage},
    YFWFastVerifyRealNamePage: {screen:YFWFastVerifyRealNamePage},
    YFWBatchNumberExamples: {screen:YFWBatchNumberExamples},
    YFWDrugRegistrationController:{screen:YFWDrugRegistrationController},
    YBTestHomeLevel:{screen:YBTestHomeLevel},
    YBTestAllApisLevel:{screen:YBTestAllApisLevel},
    YBTestOneApisLevel:{screen:YBTestOneApiLevel},
    YBTestModuleApisLevel:{screen:YBTestModuleApisLevel},
    YBTestCustomApi:{screen:YBTestCustomApi},
    YBTestBusiness:{screen:YBTestBusiness},
    YBTestChangeLocation:{screen:YBTestChangeLocation},
    YFWO2OShippingAddressPage:{screen:YFWO2OShippingAddressPage},
    YFWO2OCityListPage:{screen:YFWO2OCityListPage},
    YFWOTOOrderSettlement:{screen:YFWOTOOrderSettlement},
    YFWOTOHomeController:{screen:YFWOTOHomeController},
    YFWOTOStoreController:{screen:YFWOTOStoreController},
    YFWOTOStoreSearchController:{screen:YFWOTOStoreSearchController},

    YFWO2OOrderDetailController:{screen:YFWO2OOrderDetailController},

    YFWO2OCategoryResultController:{screen:YFWO2OCategoryResultController},
    YFWO2OSearchController:{screen:YFWO2OSearchController},
    YFWO2OOrderConfirmReceiptionController:{screen:YFWO2OOrderConfirmReceiptionController},
    YFWO2ORequestRefund:{screen:YFWO2ORequestRefund},
    YFWO2OReceivingAddress:{screen:YFWO2OReceivingAddress},
    YFWO2OReceivingAddressEdit: { screen: YFWO2OReceivingAddressEdit },
    YFWOTOMedicineDetailController:{screen:YFWOTOMedicineDetailController},
}

const {StatusBarManager} = NativeModules;
const navigateoptions = (navigation) =>({
    swipeEnabled: false,
    animationEnabled: false,
    headerStyle: Platform.OS == 'android' ? {
        backgroundColor: 'white',
        elevation: 0,
        height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
        paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
    } : {backgroundColor: 'white'},
    headerTitleAllowFontScaling: false,
    headerTitleStyle: {fontSize: 16, color: '#333333', textAlign: 'center', flex: 1},
    headerLeft: (
        <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                          onPress={()=>{
                              dismissKeyboard_yfw();
                              navigation.goBack();
                              DeviceEventEmitter.emit('LoadProgressClose');
                          }}>
            <Image style={{width:11,height:19,resizeMode:'stretch'}}
                   source={ require('../img/top_back_green.png')} defaultSource={require('../img/top_back_green.png')}/>
        </TouchableOpacity>
    ),
    headerRight: (
        <TouchableOpacity style={{width:30}}
                        hitSlop={{left:10,top:10,bottom:13,right:10}}
                          onPress={() => {
                              DeviceEventEmitter.emit('OpenUtilityMenu');
                          }}>
            <Image style={{width:15,height:15,resizeMode:'contain',marginRight:15}}
                   source={require('../img/me_icon_more.png')}/>
        </TouchableOpacity>
    ),
});


//导航器配置信息


const HomePageNav = Navigation.StackNavigator(
    navigatorRegistPage,
    {
        initialRouteName: 'YFWMainVC',
        headerMode:'screen',
        navigationOptions: ({navigation}) =>navigateoptions(navigation)
    },
    {
        mode: 'card', //页面切换模式
    }
);

const FindYaoNav = Navigation.StackNavigator(
    navigatorRegistPage,
    {
        initialRouteName: 'YFWFindYaoController',
        headerMode:'screen',
        navigationOptions: ({navigation}) =>navigateoptions(navigation)
    },
    {
        mode: 'card', //页面切换模式
    },
);

const OTONav = Navigation.StackNavigator(
    navigatorRegistPage,
    {
        initialRouteName: 'YFWOTOHomeController',
        headerMode:'screen',
        navigationOptions: ({navigation}) =>navigateoptions(navigation)
    },
    {
        mode: 'card', //页面切换模式
    },
);

const ShopCarNav = Navigation.StackNavigator(
    navigatorRegistPage,
    {
        initialRouteName: 'YFWShopCarVC',
        headerMode:'screen',
        navigationOptions: ({navigation}) =>navigateoptions(navigation)
    },
    {
        mode: 'card', //页面切换模式
    },
);

const UserCenterNav = Navigation.StackNavigator(
    navigatorRegistPage,
    {
        initialRouteName: 'YFWUserCenterVC',
        headerMode:'screen',
        navigationOptions: ({navigation}) =>navigateoptions(navigation)
    },
    {
        mode: 'card', //页面切换模式
    },
);

const YFWPermissionsNav = Navigation.StackNavigator(
    navigatorRegistPage,
    {
        initialRouteName: 'YFWPermissionsView',
        headerMode:'screen',
        navigationOptions: ({navigation}) =>navigateoptions(navigation)
    },
    {
        mode: 'card', //页面切换模式
    },
);
const NavObjects = {

    'HomePageNav': {
        screen: HomePageNav,
        navigationOptions: ({navigation, screenProps}) => {

            return {
                tabBarLabel: '健康商城',
                tabBarIcon: (opt) => {
                    return <NavigationLabelView
                        isFocuse={opt.focused}
                        style={styles.tabIcon}
                        navigation={navigation}
                        selectIcon={require('../img/first_selected.png')}
                        unSelectIcon={require('../img/first_normal.png')}
                    />
                }
            }
        }
    },
    'FindYaoNav': {
        screen: FindYaoNav,
        navigationOptions: ({navigation, screenProps}) => {

            return {
                tabBarLabel: '找药',
                tabBarIcon: (opt) => {
                    if (opt.focused) return <Image source={require('../img/second_selected.png')}
                                                   style={styles.tabIcon}/>;
                    return <Image source={require('../img/second_normal.png')} style={styles.tabIcon}/>;
                }
            }
        }
    },
    'OTONav': {
        screen: OTONav,
        navigationOptions: ({navigation, screenProps}) => {

            return {
                tabBarLabel: '药迅达',
                tabBarIcon: (opt) => {
                    if (opt.focused) return <Image source={require('../img/same_city_delivery_selectd.png')}
                                                   style={styles.tabIcon}/>;
                    return <Image source={require('../img/same_city_delivery_normal.png')} style={styles.tabIcon}/>;
                }
            }
        }
    },
    'ShopCarNav': {
        screen: ShopCarNav,
        navigationOptions: ({navigation, screenProps}) => {

            return {
                tabBarLabel: '购物车',
                tabBarIcon: (opt) => {
                    return (
                        <ShopCarRedPoint focused={opt.focused}/>
                    )
                }
            }
        }
    },
    'UserCenterNav': {
        screen: UserCenterNav,
        navigationOptions: ({navigation, screenProps}) => {

            return {
                tabBarLabel: '我的',
                tabBarIcon: (opt) => {
                    if (opt.focused) return <Image accessibilityLabel='my_center' source={require('../img/forth_selected.png')}
                                                   style={styles.tabIcon}/>;
                    return <Image accessibilityLabel='my_center' source={require('../img/forth_normal.png')} style={styles.tabIcon}/>;
                }
            }
        }
    },
}
const NavConfig = {
    //设置tab使用的组件
    tabBarComponent: Navigation.TabBarBottom,
    //点击哪个才加载哪个tab里的页面
    lazy: true,
    //设置tab放在界面的底部
    tabBarPosition: 'bottom',
    //设置tab里面的样式
    swipeEnabled: false,
    animationEnabled:false,
    tabBarOptions: {
        style: styles.tab,
        activeTintColor: '#27BF8F',
        inactiveTintColor:darkTextColor(),
        labelStyle: {fontSize: Platform.isPad?14:10, marginBottom: Platform.isPad?0:4},
        allowFontScaling: false,
    }
}
const Tabs = Navigation.TabNavigator({
    'HomePageNav':NavObjects.HomePageNav,
    'OTONav':NavObjects.OTONav,
    'ShopCarNav':NavObjects.ShopCarNav,
    'UserCenterNav':NavObjects.UserCenterNav,
}, NavConfig);
const TabsAnother = Navigation.TabNavigator({
    'HomePageNav':NavObjects.HomePageNav,
    'FindYaoNav':NavObjects.FindYaoNav,
    'ShopCarNav':NavObjects.ShopCarNav,
    'UserCenterNav':NavObjects.UserCenterNav,
}, NavConfig);
const defaultGetStateForAction = Tabs.router.getStateForAction;

Tabs.router.getStateForAction = (action, state) => {
    if (action.routeName == "HomePageNav" || action.routeName == "FindYaoNav" || action.routeName == "ShopCarNav" || action.routeName == "UserCenterNav") {
        if (isNotEmpty(YFWUserInfoManager.ShareInstance().updateInfo)) {
            if (YFWUserInfoManager.ShareInstance().updateInfo.isForceUpdate == '1') {
                DeviceEventEmitter.emit('OpenVersionUpdateAlertView', YFWUserInfoManager.ShareInstance().updateInfo);
            }
        } else {
            requestUpdateInfo()
        }
    }
    if (
        action.routeName == "UserCenterNav" && !YFWUserInfoManager.ShareInstance().hasLogin()
    ) {
        // getStateForAction返回null意味着该动作已经被处理/阻止
        DeviceEventEmitter.emit('LoginToUserCenter',state.index)
        return null;
    }
    if (
        action.routeName == "ShopCarNav"
    ) {
        YFWBackStack.ShareInstance().setLastVC('get_shopping_car',{type:'get_shopping_car'})
    } else {
        YFWBackStack.ShareInstance().clearLastVC()
    }

    return defaultGetStateForAction(action, state);
};

// 从导航状态获取当前屏幕
function getCurrentRouteName(navigationState) {
    if (!navigationState) {
        return null;
    }
    const route = navigationState.routes[navigationState.index];
    //潜入嵌套导航器
    if (route.routes) {
        return getCurrentRouteName(route);
    }
    return route.routeName;
}

if (!__DEV__) {
    global.console = {
        info: () => {},
        log: () => {},
        warn: () => {},
        debug: () => {},
        error: () => {}
    };
}

let defaultImage = require('../img/Default.jpg');
let defaultXImage = require('../img/DefaultX.jpg');
let defaultPadImage = require('../img/DefaultPad.png');

export default class YFWHomePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: 'default',//default：默认，home：主视图，launch：引导页 ,fullAd全屏广告，permissions权限说明页
            o2oShow:true
        };
        //提前初始化
        YFWBackStack.ShareInstance()
    }

    componentWillMount() {
        this._setListener()
        getAppConfig(()=> {
            configPermissionsView((isShowPermission)=>{
                if (isShowPermission !== 'false') {
                    this.setState({load: 'permissions'});
                    this.preFetchHomeData()
                } else {
                    this._dealLaunchScreen()
                }
            })
        });
    }

    componentDidMount() {
        sysConfigRequest()
    }

    _dealNavigationCallBackAction(){
        const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
        this.refs.tabs._navigation.dispatch(resetActionTab);
    }

    _dealNavigationStateChangeAction = (prevState, currentState,NavigationActions) => {
        //"Navigation/NAVIGATE"
        //"Navigation/POP_TO_TOP"
        //"Navigation/BACK"
        //"Navigation/REPLACE"
        if (NavigationActions.type == 'Navigation/SET_PARAMS' || NavigationActions.type == 'Navigation/COMPLETE_TRANSITION') {
            return
        }
        const currentScreen = getCurrentRouteName(currentState);
        const prevScreen = getCurrentRouteName(prevState);
        let routeInfo = "\r\n当前页面: " + currentScreen
        // let params = NavigationActions.params
        // if (isNotEmpty(params)) {
        //     routeInfo += "params:" + JSON.stringify(params)
        // }
        routeInfo += "\r\n上一个页面: " + prevScreen
        routeInfo += "\r\n路由动作: " + NavigationActions.type + "\r\n"
        YFWNativeManager.saveCurrentRouteName(routeInfo)
        YFWUserInfoManager.ShareInstance().setCurrentScreen(currentScreen)
    }

    _setListener() {
        this.o2oShowListener = DeviceEventEmitter.addListener('ko2o_show',(value)=>{
            if (parseInt(value) == 0) {
                this.setState({o2oShow:false})
            }
        })
        this.addressChangeListener = AppState.addEventListener('change', (state)=>{
            if (state == 'active'){
                let address = YFWUserInfoManager.ShareInstance().getAddress()
                if (address == '上海市') {
                    YFWNativeManager.appUpdatingLocation();
                }
            }
        });

        this.permissionsListener = DeviceEventEmitter.addListener('kPermissionsConfirm',(result)=>{
            this._dealLaunchScreen()
        })

        this.listener = NativeAppEventEmitter.addListener('AppToShopDetail', (info)=> {
            let {navigate}  = this.refs.tabs._navigation;
            pushNavigation(navigate, {type: info.type, value: info.value, from: 'map'});
        });

        if (Platform.OS == 'ios'){
            this.locationListener = iOSManagerEmitter.addListener('IS_OPEN_LOCATION',(data)=>{
                // if (isEmpty(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).app_audit_version) ||
                //     safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).app_audit_version == safe(YFWUserInfoManager.ShareInstance().version)) {//处理iOS审核被拒
                //     return
                // }
                if(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).hide_user_location != 'false'){
                    //如果没有开启
                    let isOpen = data;
                    if (isNotEmpty(data.is_open)){
                        isOpen =  (data.is_open == 'true');
                    }

                    //设置是否隐藏价格等信息(根据后台配置和有无权限判断)。
                    let isHide = false
                    if(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).not_location_hide_price == 'true'){
                        isHide = isOpen?false:true
                    }else{
                        isHide = false
                    }
                    YFWUserInfoManager.ShareInstance().setNoLocationHidePrice(isHide)
                    DeviceEventEmitter.emit("NO_LOCATION_HIDE_PRICE",isHide)
                    if(!isOpen){
                        let data = {
                            address: '定位失败',
                            lat: YFWUserInfoManager.ShareInstance().latitude,
                            lng: YFWUserInfoManager.ShareInstance().longitude,
                        }
                        DeviceEventEmitter.emit('get_change_location',data);
                    }
                }
            })
        } else {
            this.locationListener = DeviceEventEmitter.addListener('IS_OPEN_LOCATION',(isOpen)=>{
                if(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).hide_user_location != 'false'){

                    //设置是否隐藏价格等信息(根据后台配置和有无权限判断)。
                    let isHide = false
                    if(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).not_location_hide_price == 'true'){
                        isHide = isOpen?false:true
                    }else{
                        isHide = false
                    }
                    YFWUserInfoManager.ShareInstance().setNoLocationHidePrice(isHide)
                    DeviceEventEmitter.emit("NO_LOCATION_HIDE_PRICE",isHide)
                }
                if(!isOpen){
                    YFWUserInfoManager.ShareInstance().isLocationPermission = false
                    let data = {
                        address: '定位失败',
                        lat: YFWUserInfoManager.ShareInstance().latitude,
                        lng: YFWUserInfoManager.ShareInstance().longitude,
                    }
                    DeviceEventEmitter.emit('get_change_location',data);
                } else {
                    //开启定位后重新定位
                    if(!YFWUserInfoManager.ShareInstance().isLocationPermission){
                        YFWUserInfoManager.ShareInstance().isLocationPermission = true
                        YFWNativeManager.getLocationAddress((locationData)=> {
                            let city = safe(locationData?.city)
                            let address = isNotEmpty(locationData)?safe(locationData.name):'上海市';
                            getCityRegionId(city);//根据城市中文名获取ID
                            YFWUserInfoManager.ShareInstance().setCity(city)
                            if(isNotEmpty(locationData.lat)||isNotEmpty(locationData.lng)) {
                                YFWUserInfoManager.ShareInstance().setAddress(address)
                                YFWUserInfoManager.ShareInstance().setApplocation({
                                    city:city,
                                    latitude:locationData.lat,
                                    longitude:locationData.lng
                                })
                            } else {
                                YFWUserInfoManager.ShareInstance().address = address
                            }
                            let data = {
                                address: address,
                                lat: YFWUserInfoManager.ShareInstance().latitude,
                                lng: YFWUserInfoManager.ShareInstance().longitude,
                            }
                            DeviceEventEmitter.emit('get_change_location',data);
                            DeviceEventEmitter.emit('androidLocationOpen'); // 开启定位通知
                        })
                    }
                }
            })
        }

        //原生调用第三方登录监听
        this.thirdAuthListener = DeviceEventEmitter.addListener('thirdAuthOK', (msg) => {
            let tabNaviagtion = this.refs.tabs._navigation;
            let tabIndex = tabNaviagtion.state.index;
            let navigation = tabNaviagtion.state.routes[tabIndex];
            let key = navigation.routes[navigation.index].key;
            let data = msg;
            if(Platform.OS == 'android'){
                data = JSON.parse(msg)
            }
            this.state.thirdUserinfo = data;
            if (isNotEmpty(data)) { let type;
                if (data.type == 'weibo') {
                    type = '1';
                } else if (data.type == 'qq'||data.type == 'QQ') {
                    type = '2';
                } else if (data.type == 'alipay') {
                    type = '3';
                } else {//微信
                    type = '4';
                }

                let paramMap = new Map();
                paramMap.set('__cmd', 'guest.account.getAccountInfoByOpenKey');
                paramMap.set('open_key', data.key);
                paramMap.set('type', type);
                paramMap.set('nick_name', safe(data.nick_name));
                paramMap.set('img_url', data.img_url);
                let erpInfo = YFWUserInfoManager.ShareInstance().getErpUserInfo()
                if (isNotEmpty(erpInfo)) {
                    paramMap.set('from_unionid',erpInfo['from_unionid'])
                    paramMap.set('sub_siteid',erpInfo['sub_siteid'])
                }
                let viewModel = new YFWRequestViewModel();
                viewModel.TCPRequest(paramMap, (res) => {
                    if (isNotEmpty(res)) {
                        if (res.code == 1 && isNotEmpty(res.result) && res.result) {
                            //登陆成功
                            let userInfo = new YFWUserInfoManager;
                            userInfo.setSsid(safeObj(res.ssid));
                            DeviceEventEmitter.emit('UserLoginSucess');
                            setItem(LOGIN_TOKEN,safe(res.result.login_token))
                            if(data.isLoginToUserCenter){
                                this._dealNavigationCallBackAction()
                            }
                        } else {
                            //绑定手机
                            this.refs.tabs._navigation.navigate('BindUserPhoneNum', {
                                data: data,
                                gobackKey: null,
                                callBack:data.isLoginToUserCenter?()=>this._dealNavigationCallBackAction():null,
                            })
                        }
                    }
                }, (res) => {
                    if (isNotEmpty(res)&& res.code == -2) {
                        //绑定手机号码
                        this.refs.tabs._navigation.navigate('BindUserPhoneNum', {
                            data: data,
                            gobackKey: null,
                            callBack:data.isLoginToUserCenter?()=>this._dealNavigationCallBackAction():null,
                        })
                    }
                }, true);
            }
        });

        this.closeAccountListener = DeviceEventEmitter.addListener(kLoginCloseAccountKey,(message,callBack)=>{
            if (isEmpty(message)) {
                message = ''
            }
            this.closeTipView&&this.closeTipView.showView(kTipTypeClosed, message, '', () => {
                if (isNotEmpty(callBack)) {
                    callBack()
                }
            })
        })

        this.realNameListener = DeviceEventEmitter.addListener('kRealNameStatus', (res) => {
            this.realNameAlert && this.realNameAlert.show(res)
        })
    }

    _dealNavigationCallBackAction(){
        const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
        this.refs.tabs._navigation.dispatch(resetActionTab);
    }

    _dealNavigationStateChangeAction = (prevState, currentState,NavigationActions) => {
        /*
        //"Navigation/NAVIGATE"
        //"Navigation/POP_TO_TOP"
        //"Navigation/BACK"
        //"Navigation/REPLACE" */
        if (NavigationActions.type == 'Navigation/SET_PARAMS' || NavigationActions.type == 'Navigation/COMPLETE_TRANSITION') {
            return
        }
        if (NavigationActions.type == 'Navigation/BACK') {
            YFWBackStack.ShareInstance().clearLastVC()
        }
        const currentScreen = getCurrentRouteName(currentState);
        const prevScreen = getCurrentRouteName(prevState);
        let routeInfo = "\r\n当前页面: " + currentScreen
        // let params = NavigationActions.params
        // if (isNotEmpty(params)) {
        //     routeInfo += "params:" + JSON.stringify(params)
        // }
        routeInfo += "\r\n上一个页面: " + prevScreen
        routeInfo += "\r\n路由动作: " + NavigationActions.type + "\r\n"
        YFWNativeManager.saveCurrentRouteName(routeInfo)
        YFWUserInfoManager.ShareInstance().setCurrentScreen(currentScreen)
    }

    _dealLaunchScreen() {
        configLaunchView((id)=> {
            let newScreen = (id === 'false' || id === 'error') ? 'fullAd' : 'launch';
            if (Platform.OS == 'ios' && newScreen == 'fullAd') {
                newScreen = 'home'
                getItem(kIsFirstLoadLaunchKey).then((id)=> {
                    if (id == 'true') {
                        setItem(kIsFirstLoadLaunchKey,'false');
                        YFWNativeManager.closeSplashImage()
                    } else {
                        this.fetchLastVC((isNeedJumpToLastVC)=>{
                            if (!isNeedJumpToLastVC) {
                                getItem('FullAdsCasheData').then((data)=>{
                                    let adInfo = safeObj(safeObj(data).data)
                                    let startDate = safe(adInfo.start);
                                    let endDate = safe(adInfo.end);
                                    let isInTime = isCurrentInDateRange(startDate,endDate)
                                    if(data && data.is_show && isInTime){
                                        YFWNativeManager.showFullAdWithInfo({second:data.second,img_url:data.data.img_url},(showAdDetail)=>{
                                            if (showAdDetail) {
                                                mobClick('splash-screen')
                                                let {navigate}  = this.refs.tabs._navigation;
                                                homeAdviewClick(navigate,safeObj(data.data))
                                            }
                                        })
                                    }else{
                                        YFWNativeManager.closeSplashImage()
                                    }
                                })
                            } else {
                                YFWNativeManager.closeSplashImage()
                            }
                        })
                    }
                });
                this.checkLocationService()
            }
            YFWNativeManager.showTransitionAnimationWithType('fade')
            this.setState({load: newScreen});
        });
        YFWNativeManager.requestPermissions()//检查部分权限
        YFWNativeManager.initSMSDK()//数美SDK初始化
        YFWNativeManager.initUMengSDK()//友盟SDK初始化
    }

    fetchLastVC(callBack) {
        let {navigate}  = this.refs.tabs._navigation;
        YFWBackStack.ShareInstance().getLastVC().then((lastVCInfo)=>{
            console.log('ready navigate to last vc',lastVCInfo)
            if (lastVCInfo && lastVCInfo.type) {
                callBack && callBack(true)
                if (lastVCInfo.isNeedAlert) {
                    //iOS切换keyWindow的rootViewController，有转场动画1.5s
                    //alert出现依赖于keyWindow的rootViewController，所以延迟执行
                    setTimeout(() => {
                        Alert.alert('','是否打开上次浏览的页面',[
                            {text:'取消',onPress:()=>{
                                YFWBackStack.ShareInstance().clearLastVC()
                            }},
                            {text:'确定',onPress:()=>{
                                pushNavigation(navigate,lastVCInfo);
                            }}
                        ],{cancelable:false})
                    }, 1500);
                } else {
                    pushNavigation(navigate,lastVCInfo);
                }
            } else {
                callBack && callBack(false)
            }
        },(error)=>{
            callBack && callBack(false)
        })
    }

    checkLocationService() {
        YFWNativeManager.isLocationServiceOpen((isOpen)=>{//定位权限检查
            if(!isOpen){
                /** 更新应用上一次打开的时间, 判断是否为当日第一次启动*/
                getItem(kLastDateLaunchApp).then((lastDate)=> {
                    let date = new Date();
                    let nowMonth = date.getMonth() + 1;
                    let strDate = date.getDate();
                    let nowDate = date.getFullYear() + "-" + nowMonth + "-" + strDate;
                    if(lastDate !== nowDate || isEmpty(lastDate)){//第一次启动应用
                        this.timer = setTimeout(() => {
                            DeviceEventEmitter.emit("OPEN_LOCATION_DIALOG")
                        }, 4000);
                    } else {
                        //非第一次启动，系统申请权限。设定5分钟后再次弹窗
                        YFWNativeManager.openLocation()
                        this.timer = setTimeout(() => {
                            YFWNativeManager.isLocationServiceOpen((isOpen)=> {
                                if(!isOpen){
                                    DeviceEventEmitter.emit("OPEN_LOCATION_DIALOG")
                                }
                            })
                        }, 1000*60*5);
                    }
                    setItem(kLastDateLaunchApp, nowDate);
                })
            }
        })
    }
    //#图片预加载# 加载首页首屏图片
    preFetchHomeData() {
        let params = new Map();
        params.set('__cmd','guest.common.app.getIndexData_new')
        params.set('os',Platform.OS)
        params.set('deviceName',(Platform.OS === 'ios'?isIphoneX()?'X':'N':'A'))
        let request = new YFWRequestViewModel()
        request.TCPRequest(params,(res)=>{
            if (isEmpty(res.result) || isEmpty(res.result.data_items)) {
                return
            }
            let info = res.result.data_items
            let datas = [
                safeObj(info.singleAd_1_goods_new),
                safeObj(info.menus),
                safeObj(info.banner)
            ]
            let imagesArray = []
            imagesArray = extractingImge(datas)
            imagesArray = imagesArray.map((img)=>{
                return {uri:img}
            })
            FastImage.preload(imagesArray)
        },(error)=>{},false)
    }

    render() {
        if (this.state.load === 'home') {
            return (
                <View style={{flex:1,backgroundColor:'#FFF'}}>
                    <LoadProgress />
                    {this.state.o2oShow?<Tabs ref={'tabs'}
                          onNavigationStateChange={this._dealNavigationStateChangeAction}/>:
                          <TabsAnother ref={'tabs'}
                          onNavigationStateChange={this._dealNavigationStateChangeAction}/>}
                    <InviteView getNavigation={()=>{return this.refs.tabs._navigation}}/>
                    <YFWNoNetWorkTipView/>
                    <YFWVersionUpdateView/>
                    {/* <YFWOpenNotificationAlertView/> */}
                    <YFWNotificationView notiType="home"/>
                    <YFWRateView getNavigation={()=>{return this.refs.tabs._navigation}}/>
                    <YFWAdvertView getNavigation={()=>{return this.refs.tabs._navigation}}/>
                    <UtilityMenu getNavigation={()=>{return this.refs.tabs._navigation}}/>
                    {/*详情页底部更多按钮弹框*/}
                    <BottomHideTipsDialog />
                    <YFWShareView getNavigation={()=>{return this.refs.tabs._navigation}}/>
                    <YFWReLoginView getNavigation={()=>{return this.refs.tabs._navigation}}/>
                    <YFWLocationPermissionDialog getNavigation={()=>{return this.refs.tabs._navigation}}
                        showSwitchAddressView={()=>this.ref_switchaddress.showView()}/>
                    <YFWCloseTipAlert ref={(e) => this.closeTipView = e}></YFWCloseTipAlert>
                    <SharePosterPic></SharePosterPic>
                    <YFWRealNameAlertView getNavigation={()=>{return this.refs.tabs._navigation}} ref={e => this.realNameAlert = e} />
                    {/*手动选择地址*/}
                    {/*<YFWSwitchAddressView ref={ref_phoneInput => (this.ref_switchaddress = ref_phoneInput)}*/}
                                          {/*addressCallBack={(data)=>{this.setLocationDataManual(data)}}/>*/}
                </View>
            );
        } else if (this.state.load === 'default') {
                return(
                    <View/>
                    );
        } else if (this.state.load === 'fullAd') {
            return (
                <YFWAdView style={{position:'absolute'}} closecallback={()=>{
                    this.setState({load:'home'});
                    this.checkLocationService()
                }}/>
            );
        } else if (this.state.load == 'permissions') {
            return (
                <YFWPermissionsNav/>
            )
        } else {
                return (
                <YFWLaunchView changeStatus={()=>{
                    YFWNativeManager.showTransitionAnimationWithType('fade')
                    this.setState({load:'home'});
                    this.checkLocationService()
                    YFWNativeManager.registBaiduManager();
                }}/>
            )
        }
    }

    // /**
    //  * 手动设置地址经纬度
    //  * data: {name:地址，id: region}
    //  */
    // setLocationDataManual(data){
    //     let latitude = 0
    //     let longitude = 0
    //     YFWToast(data.get('name'))
    //     YFWNativeManager.getGeoCodeResult(data.get('name'), data.get('name'), (geoCodeResult)=>{
    //         latitude = geoCodeResult.latitude
    //         longitude = geoCodeResult.longitude
    //         let locationManualData = {
    //             city:data.get('name'),
    //             region_id:data.get('id'),
    //             address: data.get('name'),
    //             latitude: latitude,
    //             longitude: longitude,
    //             lat:latitude,
    //             lng:longitude,
    //         }
    //         YFWUserInfoManager.ShareInstance().setLocationManual(true);
    //         YFWUserInfoManager.ShareInstance().setAddress(locationManualData.city);
    //         YFWUserInfoManager.ShareInstance().setRegionId(locationManualData.region_id);
    //         YFWUserInfoManager.ShareInstance().setApplocation(locationManualData);
    //         DeviceEventEmitter.emit('get_change_location',locationManualData);
    //         setItem(YFWLocationManualData, locationManualData);
    //     })
    // }

    componentWillUnmount(){
        //移除地址改变监听
        this.addressChangeListener && this.addressChangeListener.remove()
        //移除授权监听
        this.permissionsListener && this.permissionsListener.remove()
        //移除页面跳转监听
        this.listener && this.listener.remove()
        //移除定位监听
        this.locationListener && this.locationListener.remove()
        //移除三方登录监听
        this.thirdAuthListener && this.thirdAuthListener.remove()
        //移除三方登录监听
        this.closeAccountListener && this.closeAccountListener.remove()
        //移除定位申请弹框
        this.timer && clearTimeout(this.timer);
        // 移除实名状态监听
        this.realNameListener && this.realNameListener.remove()
        this.o2oShowListener && this.o2oShowListener.remove()
    }


}



