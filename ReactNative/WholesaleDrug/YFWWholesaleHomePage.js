import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeAppEventEmitter, NativeEventEmitter,
    NativeModules,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    AppState
} from 'react-native';
/* 添加路由组件 */
import Navigation from 'react-navigation';
import {BaseStyles} from "./../Utils/YFWBaseCssStyle";
import {darkTextColor} from "./../Utils/YFWColor";
import NavigationLabelView from "./../widget/NavigationLabelView";

import YFWWDMain from './Home/YFWWDMain'
import YFWWDShopCar from './ShopCar/YFWWDShopCar'
import YFWWDUserCenterVC from './Mine/YFWWDUserCenterVC'
import YFWWDSellersList from './SellList/YFWWDSellersList'

import {YFWImageConst} from './Images/YFWImageConst'
import {
    dismissKeyboard_yfw, getTimeDifference,
    isIphoneX, isNotEmpty,
    kScreenHeight,
    kScreenWidth,
    safeObj,
    safe,
    isEmpty,
    kStyleWholesale
} from "../PublicModule/Util/YFWPublicFunction";
import LoadProgress from '../widget/LoadProgress';
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
import YFWNativeManager from '../Utils/YFWNativeManager';
import YFWWDCategory from "./Category/YFWWDCategory";
import {configLaunchView} from "../Utils/YFWInitializeRequestFunction";
import WDShopCarRedPoint from './Widget/WDShopCarRedPoint';
import YFWWDSearch from "./Search/YFWWDSearch";
import YFWWDLogin from "./Login/Controller/YFWWDLoginController"
import YFWWDStoreHome from "./Store/Controller/YFWWDStoreHomeController"
import YFWWDGoodsDetailRootVC from './GoodsDetail/YFWWDGoodsDetailRootVC'
import YFWWDSubCategoryList from "./Category/YFWWDSubCategoryList";
import YFWWDStoreAllGoods from './Store/Controller/YFWWDStoreAllGoodsController';
import YFWWDOperationSuccess from './Widget/Controller/YFWWDOperationSuccessController';
import YFWWDShippingAddressDetail from "./Address/YFWWDShippingAddressDetail";
import YFWWDShippingAddress from "./Address/YFWWDShippingAddress";
import YFWWDOrderSettlementRootVC from './OrderSettle/YFWWDOrderSettlementRootVC'
import YFWWDUtilityMenu from './Widget/YFWWDUtilityMenu';
import YFWWDMySupplier from "./Mine/YFWWDMySupplier";
import YFWWDApplyAccount from './Store/Controller/YFWWDApplyAccountController';
import YFWWDMyCollection from "./Mine/YFWWDMyCollection";
import YFWWDMyStoreInfo from "./Mine/YFWWDMyStoreInfo";
import YFWWDAccountQualifiiy from './Store/Controller/YFWWDAccountQualifiiyController';
import YFWWDUploadAccountQualifiy from './Store/Controller/YFWWDUploadAccountQualifiyController';
import YFWWDFrequentlyGoods from './Mine/Controller/YFWWDFrequentlyGoodsController';
import YFWWDBrowsingHistory from './Mine/Controller/YFWWDBrowsingHistoryController';
import YFWWDMyInvoice from './Mine/YFWWDMyInvoice'
import YFWWDMyOrder from "./MyOrder/YFWWDMyOrder";
import YFWWDOrderDetailController from "./OrderDetail/YFWWDOrderDetailController";
import BigPictureVC from '../UserCenter/BigPictureVC'
import YFWWDRefundsGoodsFirstStep from './MyOrder/OrderRefunds/YFWWDRefundsGoodsFirstStep'
import YFWWDRefundsGoods from './MyOrder/OrderRefunds/YFWWDRefundsGoods'
import YFWWDRefundNoDeliveryPage from './MyOrder/OrderRefunds/YFWWDRefundNoDeliveryPage'
import YFWWDOrderSuccessPage from './OrderSettle/YFWWDOrderSuccessPage'
import YFWWDRefundDetailPage from './MyOrder/OrderRefunds/YFWWDRefundDetailPage'
import YFWWDRefundNegotiationPage from './MyOrder/OrderRefunds/YFWWDRefundNegotiationPage'
import YFWWDLogisticsCompany from './MyOrder/OrderRefunds/YFWWDLogisticsCompany'
import YFWWDOrderReportDetailPage from "./OrderReport/YFWWDOrderReportDetailPage";
import YFWWDOrderReportTypePage from "./OrderReport/YFWWDOrderReportTypePage";
import YFWWDSearchOrder from "./MyOrder/YFWWDSearchOrder";
import YFWWDViewLogisticsInfo from './MyOrder/YFWWDViewLogisticsInfo'
import YFWWDMyComplaint from './Mine/Controller/YFWWDMyComplaintController';
import YFWWDComplaintDetail from './Mine/Controller/YFWWDComplaintDetailController';
import YFWWDMessageHome from './Message/Controller/YFWWDMessageHomeController';
import YFWWDMessageList from './Message/Controller/YFWWDMessageListController';
import YFWWDEvaluationOrder from './MyOrder/YFWWDEvaluationOrder'
import YFWWDMyRating from './Mine/YFWWDMyRating'
import YFWWDStoreIntroduction from './Store/Controller/YFWWDStoreIntroductionController'
import YFWWDRegister from './Login/Controller/YFWWDRegisterController';
import YFWWDRegisterQualify from './Login/Controller/YFWWDRegisterQualifyController';
import YFWWDProbateAdmin from './Login/Controller/YFWWDProbateAdminController';
import YFWWDProbateStore from './Login/Controller/YFWWDProbateStoreController';
import YFWWDProbateQualify from './Login/Controller/YFWWDProbateQualifyController';
import YFWWDOrderSettlementList from './OrderSettle/YFWWDOrderSettlementListController';
import YFWWDOrderStatusVc from './MyOrder/OrderRefunds/View/YFWWDOrderStatusVc';
import YFWWDCancelOrder from './MyOrder/YFWWDCancelOrder';
import YFWWDAllSupplier from './Mine/YFWWDAllSupplier'
import YFWWebView from './Base/YFWWDWebView';
import YFWStaticWebView from './Widget/View/YFWStaticWebView';
import YFWWDMyCoupon from './Mine/Controller/YFWWDMyCouponController';
import YFWWDSetting from './Mine/Controller/YFWWDSettingController';
import YFWWDFeedback from './Mine/Controller/YFWWDFeedbackController';

import {doAfterLogin, doAfterLoginWithCallBack, pushWDNavigation} from './YFWWDJumpRouting';
import YFWWDProbateTreatmentController from "./Login/Controller/YFWWDProbateTreatmentController";
import YFWWDShareView from './Widget/YFWWDShareView';
import YFWSharePoster from './Widget/YFWSharePoster';
import YFWWDAccountQualifiiyZZZJController
    from "./Store/Controller/YFWWDAccountQualifiiyZZZJController";
import YFWWDUploadDocumentsGuideView from "./Login/YFWWDUploadDocumentsGuideView";
import YFWWDInvoiceImagePage from "./OrderDetail/YFWWDInvoiceImagePage";
import YFWWDForgetPassword from "./Login/YFWWDForgetPassword";
import YFWWDModifyPassword from "./Mine/YFWWDModifyPassword";
import YFWWDAccountComplementController from "./Store/Controller/YFWWDAccountComplementController";

const styles = StyleSheet.create({
    tab: {
        height: 50,
        backgroundColor: 'white',
        borderTopColor: 'white'
    },
    tabIcon: {
        width: 23,
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
    YFWUserCenterVC: {screen:YFWWDUserCenterVC},
    YFWWDMain: {screen:YFWWDMain},
    YFWWDShopCar: {screen:YFWWDShopCar},
    YFWWDCategory: {screen:YFWWDCategory},
    YFWWDSubCategoryList: {screen:YFWWDSubCategoryList},
    YFWWDSellersList:{screen:YFWWDSellersList},
    YFWWDSearch: { screen: YFWWDSearch },
    YFWWDLogin: { screen: YFWWDLogin },
    YFWWDStoreHome: {screen:YFWWDStoreHome},
    YFWWDGoodsDetailRootVC: { screen: YFWWDGoodsDetailRootVC },
    YFWWDStoreAllGoods: {screen:YFWWDStoreAllGoods},
    YFWWDOperationSuccess: {screen:YFWWDOperationSuccess},
    YFWWDShippingAddress:{screen:YFWWDShippingAddress},
    YFWWDShippingAddressDetail:{screen:YFWWDShippingAddressDetail},
    YFWWDOrderSettlementRootVC:{screen:YFWWDOrderSettlementRootVC},
    YFWWDMySupplier:{screen:YFWWDMySupplier},
    YFWWDApplyAccount:{screen:YFWWDApplyAccount},
    YFWWDMyCollection:{screen:YFWWDMyCollection},
    YFWWDMyStoreInfo:{screen:YFWWDMyStoreInfo},
    YFWWDUploadAccountQualifiy:{screen:YFWWDUploadAccountQualifiy},
    YFWWDAccountQualifiiy:{screen:YFWWDAccountQualifiiy},
    YFWWDAccountComplementController:{screen:YFWWDAccountComplementController},
    YFWWDAccountQualifiiyZZZJController:{screen:YFWWDAccountQualifiiyZZZJController},
    YFWWDFrequentlyGoods:{screen:YFWWDFrequentlyGoods},
    YFWWDBrowsingHistory:{screen:YFWWDBrowsingHistory},
    YFWWDMyInvoice:{screen:YFWWDMyInvoice},
    YFWWDMyOrder:{screen:YFWWDMyOrder},
    YFWWDOrderDetailController:{screen:YFWWDOrderDetailController},
    YFWWebView:{screen:YFWWebView},
    YFWStaticWebView:{screen:YFWStaticWebView},
    YFWWDRefundsGoodsFirstStep:{screen:YFWWDRefundsGoodsFirstStep},
    YFWWDRefundsGoods:{screen:YFWWDRefundsGoods},
    YFWWDRefundDetailPage:{screen:YFWWDRefundDetailPage},
    YFWWDRefundNegotiationPage:{screen:YFWWDRefundNegotiationPage},
    YFWWDLogisticsCompany:{screen:YFWWDLogisticsCompany},
    YFWWDRefundNoDeliveryPage:{screen:YFWWDRefundNoDeliveryPage},
    YFWWDOrderSuccessPage:{screen:YFWWDOrderSuccessPage},
    YFWWDOrderReportDetailPage:{screen:YFWWDOrderReportDetailPage},
    YFWWDOrderReportTypePage:{screen:YFWWDOrderReportTypePage},
    YFWWDSearchOrder:{screen:YFWWDSearchOrder},
    YFWWDMyComplaint:{screen:YFWWDMyComplaint},
    YFWWDComplaintDetail:{screen:YFWWDComplaintDetail},
    YFWWDMessageHome:{screen:YFWWDMessageHome},
    YFWWDMessageList:{screen:YFWWDMessageList},
    YFWWDViewLogisticsInfo:{screen:YFWWDViewLogisticsInfo},
    YFWWDEvaluationOrder:{screen:YFWWDEvaluationOrder},
    YFWWDMyRating:{screen:YFWWDMyRating},
    BigPictureVC:{screen:BigPictureVC},
    YFWWDStoreIntroduction:{screen:YFWWDStoreIntroduction},
    YFWWDRegister:{screen:YFWWDRegister},
    YFWWDRegisterQualify:{screen:YFWWDRegisterQualify},
    YFWWDProbateAdmin:{screen:YFWWDProbateAdmin},
    YFWWDProbateStore:{screen:YFWWDProbateStore},
    YFWWDProbateQualify:{screen:YFWWDProbateQualify},
    YFWWDProbateTreatmentController:{screen:YFWWDProbateTreatmentController},
    YFWWDOrderSettlementList:{screen:YFWWDOrderSettlementList},
    YFWWDOrderStatusVc:{screen:YFWWDOrderStatusVc},
    YFWWDCancelOrder:{screen:YFWWDCancelOrder},
    YFWWDAllSupplier: { screen: YFWWDAllSupplier },
    YFWWDMyCoupon: { screen: YFWWDMyCoupon },
    YFWWDSetting:{screen:YFWWDSetting},
    YFWWDFeedback:{screen:YFWWDFeedback},
    YFWWDUploadDocumentsGuideView:{screen:YFWWDUploadDocumentsGuideView},
    YFWWDInvoiceImagePage:{screen:YFWWDInvoiceImagePage},
    YFWWDForgetPassword:{screen:YFWWDForgetPassword},
    YFWWDModifyPassword:{screen:YFWWDModifyPassword},
}

const {StatusBarManager} = NativeModules;
const navigateoptions = (navigation) =>({
    swipeEnabled: false,
    animationEnabled: false,
    // gesturesEnabled:false,
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
                   source={ require('../../img/top_back_green.png')} defaultSource={require('../../img/top_back_green.png')}/>
        </TouchableOpacity>
    ),
    headerRight: (
        <TouchableOpacity style={{width:30}}
                          onPress={() => {
                              DeviceEventEmitter.emit('OpenWDUtilityMenu');
                          }}>
            <Image style={{width:15,height:15,resizeMode:'contain',marginRight:15}}
                   source={require('../../img/me_icon_more.png')}/>
        </TouchableOpacity>
    ),
});


//导航器配置信息


const HomePageNav = Navigation.StackNavigator(
    navigatorRegistPage,
    {
        initialRouteName: 'YFWWDMain',      //YFWWDAccountQualifiiy,YFWWDUploadAccountQualifiy
        initialRouteParams:{from:kStyleWholesale},
        headerMode:'screen',
        navigationOptions: ({navigation}) =>navigateoptions(navigation)
    },
    {
        mode: 'card', //页面切换模式
    }
);

const ShopCarNav = Navigation.StackNavigator(
    navigatorRegistPage,
    {
        initialRouteName: 'YFWWDShopCar',
        initialRouteParams:{from:kStyleWholesale},
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
        initialRouteParams:{from:kStyleWholesale},
        headerMode:'screen',
        navigationOptions: ({navigation}) =>navigateoptions(navigation)
    },
    {
        mode: 'card', //页面切换模式
    },
);

const Tabs = Navigation.TabNavigator({

    'HomePageNav': {
        screen: HomePageNav,
        navigationOptions: ({navigation, screenProps}) => {

            return {
                tabBarLabel: '首页',
                tabBarIcon: (opt) => {
                    return <NavigationLabelView
                        isFocuse={opt.focused}
                        style={styles.tabIcon}
                        navigation={navigation}
                        selectIcon={YFWImageConst.Tab_home_select}
                        unSelectIcon={YFWImageConst.Tab_home_normal}
                    />
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
                        <WDShopCarRedPoint focused={opt.focused}/>
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
                    if (opt.focused) return <Image source={YFWImageConst.Tab_mine_select}
                                                   style={styles.tabIcon} />;
                    return <Image source={YFWImageConst.Tab_mine_normal} style={styles.tabIcon}/>;
                }
            }
        }
    },
}, {
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
});
const defaultGetStateForAction = Tabs.router.getStateForAction;

Tabs.router.getStateForAction = (action, state) => {
    if (
        action.routeName == "UserCenterNav" && !YFWUserInfoManager.ShareInstance().hasLogin()
    ) {
        // Returning null from getStateForAction means that the action
        // has been handled/blocked, but there is not a new state
        DeviceEventEmitter.emit('WDLoginToUserCenter',state.index)
        return null;
    }

    return defaultGetStateForAction(action, state);
};

// gets the current screen from navigation state
function getCurrentRouteName(navigationState) {
    if (!navigationState) {
        return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
        return getCurrentRouteName(route);
    }
    return route.routeName;
}

TextInput.defaultProps = Object.assign({}, TextInput.defaultProps, {defaultProps: false})
Text.defaultProps = Object.assign({}, Text.defaultProps, {allowFontScaling: false})
if (!__DEV__) {
    global.console = {
        info: () => {},
        log: () => {},
        warn: () => {},
        debug: () => {},
        error: () => {}
    };
}

export default class YFWWholesaleHomePage extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        gesturesEnabled:false,
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            load: 'home',//default：默认，home：主视图，launch：引导页 ,fullAd全屏广告，permissions权限说明页
        };

    }

    componentDidMount() {
        DeviceEventEmitter.emit('ShowInviteView',{value:false});
        let jumpTo = this.props.navigation.state.params.state.jumpTo
        if(isNotEmpty(jumpTo)){
            this._dealPushNotificationResult(jumpTo)
        }
        this.goBackYFWListener = DeviceEventEmitter.addListener('BACKYFW', () => {
            this.props.navigation.goBack()
        })
    }

    componentWillMount() {
        AppState.addEventListener('change', (state)=>{
            if (state == 'active'){
                let address = YFWUserInfoManager.ShareInstance().getAddress()
                if (address == '上海市') {
                    YFWNativeManager.appUpdatingLocation();
                }
            }
        });

        //StatusBar.setBarStyle('light-content');
        this.listener = NativeAppEventEmitter.addListener('AppToShopDetail', (info)=> {
            let {navigate}  = this.refs.tabs._navigation;
            pushWDNavigation(navigate, {type: info.type, value: info.value, from: 'map'});
        });
        this.notificationlistener = DeviceEventEmitter.addListener('dealPushNotificationWD', (info)=> {
            this._dealPushNotificationResult(info)
        });

    }

    _dealPushNotificationResult(info){
        let {navigate}  = this.refs.tabs._navigation;
        if(YFWUserInfoManager.ShareInstance().hasLogin()){
            pushWDNavigation(navigate, {type: info.type, value: info.value})
        } else {
            doAfterLoginWithCallBack(navigate, ()=> pushWDNavigation(navigate, {type: info.type, value: info.value}))
        }
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
                        getItem('FullAdsCasheData').then((data)=>{
                            if(data && data.is_show){
                                YFWNativeManager.showFullAdWithInfo({second:data.second,img_url:data.data.img_url},(showAdDetail)=>{
                                    if (showAdDetail) {
                                        let {navigate}  = this.refs.tabs._navigation;
                                        pushWDNavigation(navigate, data.data);
                                    }
                                })
                            }else{
                                YFWNativeManager.closeSplashImage()
                            }
                        })
                    }
                });
            }
            YFWNativeManager.showTransitionAnimationWithType('fade')
            this.setState({load: newScreen});
        });
    }

    render() {
        if (this.state.load === 'home') {
            return (
                <View style={{flex:1,backgroundColor:'#FFF'}}>
                    <LoadProgress />
                    <Tabs ref={'tabs'}
                          onNavigationStateChange={this._dealNavigationStateChangeAction}/>
                    <YFWWDUtilityMenu getNavigation={()=>{return this.refs.tabs._navigation}}/>
                    <YFWWDShareView getNavigation={()=>{return this.refs.tabs._navigation}} />
                    <YFWSharePoster getNavigation={()=>{return this.refs.tabs._navigation}} />
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
                }}/>
            );
        } else {
                return (
                <YFWLaunchView changeStatus={()=>{
                    YFWNativeManager.showTransitionAnimationWithType('fade')
                    this.setState({load:'home'});
                    YFWNativeManager.registBaiduManager();
                }}/>
            )
        }
    }


    componentWillUnmount(){
        //移除监听
        this.goBackYFWListener && this.goBackYFWListener.remove()
        //移除定位监听
        this.locationListener && this.locationListener.remove()
        //移除三方登录监听
        this.thirdAuthListener && this.thirdAuthListener.remove()
        //移除定位申请弹框
        this.timer && clearTimeout(this.timer);
        //移除推送监听
        this.notificationlistener && this.notificationlistener.remove()
    }


}



