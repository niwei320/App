/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    View,
    FlatList,
    DeviceEventEmitter,
    NativeEventEmitter,
    NativeModules,
    Text,
    Platform,
    UIManager,
    findNodeHandle,
    Image,
    TouchableOpacity,
    BackAndroid,
    Alert,AppState
} from 'react-native';

import YFWHomeBarner from './YFWHomeBannerView'
import YFWSearchHeader from './YFWHomeSearchHeaderView'
// import YFWSearchHeader from './YFWSearchHeaderView'
import YFWHomeMenu from './YFWHomeMenuView'
import YFWAdvertHead from './YFWHomeAdvertHeaderView'
import YFWShroudDataAdsView from './YFWHomeShroudDataAdsView'
import YFWHomeScrollListView from './YFWHomeScrollListView'
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import YFWHomeReCommendView from './YFWHomeReCommendView'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import {itemAddKey, safe, safeObj, isIphoneX, haslogin, kScreenWidth, iphoneTopMargin, kScreenHeight, dealDayStr, mobClick, iphoneBottomMargin, kScreenScaling, safeArray} from "../PublicModule/Util/YFWPublicFunction";
import {isNotEmpty,isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {backGroundColor,darkLightColor} from '../Utils/YFWColor'
import {pushNavigation,clearSessionForLaunch,clearSessionForSession,newSesscionId, doAfterLogin, doAfterLoginWithCallBack} from "../Utils/YFWJumpRouting";
import YFWHomeDataModel from "./Model/YFWHomeDataModel";
import YFWStatusBar from '../widget/YFWStatusBar'
import YFWBaseView from "../BaseVC/YFWBaseView";
import {refreshMessageRedPoint,postPushDeviceInfo, refreshRedPoint, getWinCashShareUrl, YFWInitializeRequestFunction,requestHasBlindMobile, dealPushNotificationResult, changeToYFW, getAuthUrlWithCallBack, homeAdviewClick, refreshOTORedPoint} from "../Utils/YFWInitializeRequestFunction";
import YFWRefreshHeader from "../widget/YFWRefreshHeader";
import YFWShopCarRecomendModel from "../ShopCar/Model/YFWShopCarRecomendModel";
import StatusView, { DISMISS_STATUS } from '../widget/StatusView'
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWToast from '../Utils/YFWToast'

import {
    getItem,
    HomeSelectCacheData,
    setItem,
    HomePageCacheData,
    kAccountKey,
    kOpenFullAdData, removeItem, kLastPayOrderNo
} from "../Utils/YFWStorage";
import {getInitialURL} from "react-native/Libraries/Linking/Linking";
import {analyzeUrl} from "../Utils/SchemeAnalyzeUtil";
import NavigationActions from "../../node_modules_local/react-navigation/src/NavigationActions";
import YFWHomeAdView from '../widget/YFWHomeAdView'
import { YFWLoginTip } from '../widget/YFWLoginTip';

const {YFWEventManager} = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);
import YFWTitleView from '../PublicModule/Widge/YFWTitleView';
let first_load = true;
import YFWHomeTopView from './YFWHomeTopView';
import YFWHomeFindCodeView from './YFWHomeFindCodeView';
import YFWHomeYaoShiClassRoom from './YFWHomeYaoShiClassRoom';
import YFWBlindMobileAlert from '../widget/YFWBlindMobileAlert';
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import LinearGradient from 'react-native-linear-gradient';
import YFWHomeCouponView from './YFWHomeCouponView';
import YFWHomeShopAdGoodsView from './YFWHomeShopAdGoodsView';
import YFWHomeShopDataModel from './Model/YFWHomeShopDataModel';
import YFWHomeShopRecommendView from './YFWHomeShopRecommendView';
import YFWErpOrderAlertView from './View/YFWErpOrderAlertView';
import YFWHomeAdsMainView from './YFWHomeAdsMainView';
import YFWHomeAdsSubView from './YFWHomeAdsSubView';
import { YFWBackStack } from '../Utils/YFWBackStack';
import JPush from "../Utils/JPush";
var forge = require('node-forge');

export default class YFWMainVC extends YFWBaseView {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: true,

        header: null,
    });

    constructor(...args) {
        super(...args);
        let _this = this;
        this.isTop = true
        this.exitTime = 0
        this.state = {
            data: [],
            recomeData: [],
            homeData: [],
            qualificationData: {},
            jkyxData:{},
            pageIndex: 1,
            showFoot: 2,
            isModal: false,
            shareData: [],
            loading: false,
            homeAdsGoodsData:[],
            shopInfo:{},
        };
        this.listener();
        this.onBackAndroid = this.onBackAndroid.bind(this)
        this.pageCount = 0
        this.repeatCount = 5            //浏览多少个页面，弹出绑定手机号弹框
    }


    onBackAndroid=()=>{
        if(Date.parse(new Date()) - this.exitTime > 2000){
            YFWToast('再次点击退出药房网商城');
            this.exitTime = Date.parse(new Date());
        }else {
            YFWNativeManager.exit();
        }
        return true;
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                DeviceEventEmitter.emit('ShowInviteView', {value: true});
                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
                }
                this.isOpenLocation()
                changeToYFW(() => {
                    if(!first_load){
                        this._requestIndexAdsMedicine()
                        refreshMessageRedPoint()
                    }
                })
                first_load = false

            }
        );
        this.didBlur = this.props.navigation.addListener('didBlur',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress',this.onBackAndroid);
                }
            }
        );

        DeviceEventEmitter.addListener('kCheckLocationPermission',()=>{
            this.isOpenLocation()
        })

        this.openAlertListener = DeviceEventEmitter.addListener('OpenBlindMobile', ()=> {
            if(YFWUserInfoManager.ShareInstance().hasBlindMobile){
                return
            }
            if(YFWUserInfoManager.ShareInstance().isShowBlindMobileTips&&this.pageCount == this.repeatCount){
                YFWUserInfoManager.ShareInstance().isShowBlindMobileTips = false
                this.pageCount = 0
                this.alertView&&this.alertView.showView()
            }else{
                this.pageCount++
            }
        })
    }

    //获取缓存
    _getCacheData(){

        getItem('kHomeCacheData').then((data)=>{
            if (data) {
                this._handle_requestHomeData_TCP(data)
            }
        })

    }

    /**
     * 是否有定位权限
     */
    isOpenLocation() {
        YFWNativeManager.isLocationServiceOpen((isOpen)=>{
            DeviceEventEmitter.emit("IS_OPEN_LOCATION",isOpen)
        })
    }


    //视图加载完成
    componentDidMount() {
        // this._fetchYFWIDTest()
        this.schemeListener()
        YFWInitializeRequestFunction();
        //监听是否需要滑动，这里做的是是否滑动到精选
        let that = this
        this.mainScrollListener = DeviceEventEmitter.addListener('MainScrollToTop', (value) => {
            if(isNotEmpty(that._flatList)){
                this._scrollToRecommend(value)
            }
        });
        YFWNativeManager.getFindCode();

        //提交推送设备信息
        postPushDeviceInfo();

        //发送统计
        getItem('sessionMap').then((data)=>{

            if(data){
                if(this.isNotEmptyMap(data['details'])){
                    this.postPushDeviceInfoByCountForLaunch()

                }else
                {
                    newSesscionId()
                    this.sendCountData()
                }
            }else{
                newSesscionId()
                this.sendCountData()
            }

        })
        this._requestAdData()

        this.loginListener = DeviceEventEmitter.addListener('UserLoginSucess',()=>{
            this._fetchShopMemberInfoFromServer()
            requestHasBlindMobile()
            refreshRedPoint();
            refreshOTORedPoint()
            refreshMessageRedPoint();
            this._fetchRealNameStatusData()
        })
        this.Login_Off = DeviceEventEmitter.addListener('Login_Off',()=>{
            this._fetchShopMemberInfoFromServer()
        })

        // this._fetchRealNameStatusData()
    }

    _fetchRealNameStatusData () {
        if (haslogin()) {
            let viewModel = new YFWRequestViewModel()
            let params = new Map()
            params.set('__cmd','person.account.isCertification')
            viewModel.TCPRequest(params,(res)=>{
                console.log('实名认证', res)
                if (isNotEmpty(res) && !res.result) {
                    DeviceEventEmitter.emit('kRealNameStatus', 'Home')
                }
            },(error)=>{
                console.log(error)
            },false)
        }
    }

    _fetchYFWIDTest() {

        YFWNativeManager.getKeychainYFWID((yfwID)=>{
            if (isNotEmpty(yfwID)) {
                console.log(yfwID,'yfwID')
            } else {
                let userInfo = YFWUserInfoManager.ShareInstance()

                let key = userInfo.idfv +  userInfo.devicekScreenWidth + 'x' + userInfo.devicekScreenWidth + userInfo.deviceTotalMemory + userInfo.deviceCPUType + userInfo.deviceCPUNum
                console.log(key)
                var md = forge.md.md5.create();
                md.update(key,'utf8');
                let ID = sign = md.digest().toHex();
                console.log(ID,'yfwID')
                YFWNativeManager.setKeychainYFWID(ID)
            }
        })

    }

    _fetchShopMemberInfoFromServer(firstLoad) {
        getItem('kShopMemberStoreID').then((storeid)=>{
            if (isNotEmpty(storeid) && storeid != 'error') {
                YFWUserInfoManager.ShareInstance().setErpShopID(storeid)
                if (storeid === -1) {
                    if(firstLoad) {
                        this._getCacheData()
                    }
                    DeviceEventEmitter.emit('changeTabRootView',{isShopMember:false,storeid:-1});
                } else if (storeid.toString().length>0) {
                    this.handleData(firstLoad)
                    DeviceEventEmitter.emit('changeTabRootView',{isShopMember:true,storeid:storeid});
                }
            } else {
                if(firstLoad) {
                    this._getCacheData()
                }
            }
            this._fetchShopMemberInfo()
        })

    }

    _fetchErpOrderInfoFromServer() {
        let viewModel = new YFWRequestViewModel()
        let params = new Map()
        params.set('__cmd','person.erporder.getERPOrderPaymentPrompt')
        viewModel.TCPRequest(params,(res)=>{
            let result = res.result
            if (isEmpty(result) || isEmpty(result.orderList) || safeArray(result.orderList).length == 0 || result.countDownTime <= 0) {
                return
            }
            this.erpOrderAlertView&&this.erpOrderAlertView.showView(result.countDownTime,result.tips,()=>{
                let value = {
                    storeid:result.storeid,
                    orderno:result.orderList[0].orderno
                }
                this._dealErpOrderPay(value)
            })

        },(error)=>{
            console.log(error)
        },false)
    }

    _dealErpOrderPay(value) {
        let {navigate} = this.props.navigation;
        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            pushNavigation(navigate,{type:'settlement_union_member',params:value})
        } else {
            doAfterLoginWithCallBack(navigate,()=>{
                pushNavigation(navigate,{type:'settlement_union_member',params:value})
            })
        }
    }

    _fetchShopMemberInfo(firstLoad) {
        let viewModel = new YFWRequestViewModel()
        let params = new Map()
        params.set('__cmd','guest.common.app.getStoreJoinAccountInfo')
        viewModel.TCPRequest(params,(res)=>{
            let result = safeObj(res.result)
            YFWUserInfoManager.ShareInstance().setErpShopID(result.storeid)
            let isNotShopMember = (res.result.storeid === -1)//非联合会员
            DeviceEventEmitter.emit('changeTabRootView',{isShopMember:!isNotShopMember,storeid:result.storeid});
            setItem('kShopMemberStoreID',result.storeid)
            this.handleData(firstLoad)
        },(error)=>{
            this.handleData(firstLoad)
        },false)
    }

    _requestAdData(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.common.app.getIndexPopupAds_new');
        viewModel.TCPRequest(paramMap, (res)=> {
            if(res && res.code+'' == '1'){
                let result = safeObj(res.result)
                if(safeArray(result.items).length == 0){
                    return
                }
                //当前是否是第一次打开app
                getItem("isFirstTimeOpen").then((b)=> {
                    if(!b){
                        if(result.isdisplay  == '1' && safeArray(result.items).length > 0){
                            this.homeAdView&&this.homeAdView.showView(result.items[0])
                        }
                        setItem('isFirstTimeOpen','false');

                    }else
                    {
                        let time =  safe(result.displaytime);//时间段
                        let dateArray = time.split('~');
                        if(isEmpty(dateArray) || safeArray(dateArray).length != 2){
                            return
                        }
                        let startDate = safe(dateArray[0]);
                        let endDate = safe(dateArray[1]);
                        // let startDate = res.result.start;
                        // let endDate = res.result.end;
                        let dateStat=new Date(startDate.replace(/-/g,'/'));
                        let dateEnd = new Date(endDate.replace(/-/g,'/'));
                        let currentDate = new Date();
                        let DateNow = currentDate.getTime();
                        let DateDay = currentDate.getFullYear() + '/' + dealDayStr(currentDate.getMonth() + 1) + '/' + dealDayStr(currentDate.getDate());
                        if(DateNow>=dateStat.getTime()&& DateNow<= dateEnd.getTime()){
                            if(safeObj(result).displaytype == '1'){
                                //这段时间只展示一次
                                getItem(time).then((b)=>{
                                    if(!b && safeArray(result.items).length > 0){
                                        this.homeAdView&&this.homeAdView.showView(result.items[0])
                                        setItem(time,'false')
                                    }
                                })
                            }else {
                                //每天展示一次
                                getItem("kADLastShowTime").then((b)=>{
                                if(b != DateDay && safeArray(result.items).length > 0){
                                    this.homeAdView&&this.homeAdView.showView(result.items[0])
                                    setItem("kADLastShowTime",DateDay)
                                }
                            })
                            }
                        }
                    }
                });

            }
        },(error)=>{

        },false);

    }


    sendCountData(){

        setTimeout(() => {
            getItem('sessionMap').then((data)=>{

                if(data){
                    if(this.isNotEmptyMap(data['details'])){
                        this.postPushDeviceInfoByCountForSession();

                    }else
                    {
                       this.sendCountData();
                    }
                }else{
                    this.sendCountData();
                }

            })
        }, 20*1000);

    }

    isNotEmptyMap(map){
        if(JSON.stringify(map).length>5){
            return true

        }else
        {
            return false

        }
    }

/**
 * 提交统计信息 ，启动的时候
 */
     postPushDeviceInfoByCountForLaunch() {
        if (YFWUserInfoManager.defaultProps.isRequestTCP) {
            getItem('sessionMap').then((data)=>{
                if(data){
                    let paramMap = new Map();
                    let viewModel = new YFWRequestViewModel();
                    paramMap.set('__cmd', 'guest.common.app.setDeviceInfo');
                    paramMap.set("os",Platform.OS)//系统类型，ios android
                    paramMap.set("osVersion",YFWUserInfoManager.ShareInstance().osVersion)//设备系统版本 ios10,android 9.0
                    paramMap.set("version",YFWUserInfoManager.ShareInstance().version)//APP版本
                    paramMap.set("deviceName",YFWUserInfoManager.ShareInstance().deviceName)//设备名。IPhoneX，华为Note8
                    paramMap.set("manufacturer",YFWUserInfoManager.ShareInstance().manufacturer)//厂商：苹果、华为、小米
                    paramMap.set("idfa",safe(YFWUserInfoManager.ShareInstance().idfa))//设备唯一标识符
                    paramMap.set("ip",YFWUserInfoManager.ShareInstance().deviceIp)//设备IP
                    paramMap.set("jpushId",YFWUserInfoManager.ShareInstance().jpushId)//极光推送ID
                    if (Platform.OS == 'ios'){
                        paramMap.set("mfpushId",YFWUserInfoManager.ShareInstance().mfpushId);
                    } else {
                        paramMap.set("mfpushId",YFWUserInfoManager.ShareInstance().jpushId+(Math.floor(Math.random() * 10000 + 1)))//厂商推送ID，TODO android暂无配置厂商，现为极光推送+10000内随机数，IOS不需要
                    }

                    paramMap.set("sessionId",data['sessionId']);
                    paramMap.set("startTime",data['startTime']);
                    paramMap.set("endTime",data['endTime']);
                    paramMap.set("details",JSON.stringify(data['details']));


                    viewModel.TCPRequest(paramMap, (res)=> {
                        if (res.code == '1') {
                            clearSessionForLaunch()
                            this.sendCountData()

                        }
                    }, (error)=> {}, false);


                }else{

                }

            })

        }
    }


    /**
     * 提交统计信息 ，一个会话内
     */
    postPushDeviceInfoByCountForSession() {
        if (YFWUserInfoManager.defaultProps.isRequestTCP) {
            getItem('sessionMap').then((data)=>{
                if(data){
                    let paramMap = new Map();
                    let viewModel = new YFWRequestViewModel();
                    paramMap.set('__cmd', 'guest.common.app.setDeviceInfo');
                    paramMap.set("os",Platform.OS)//系统类型，ios android
                    paramMap.set("osVersion",YFWUserInfoManager.ShareInstance().osVersion)//设备系统版本 ios10,android 9.0
                    paramMap.set("version",YFWUserInfoManager.ShareInstance().version)//APP版本
                    paramMap.set("deviceName",YFWUserInfoManager.ShareInstance().deviceName)//设备名。IPhoneX，华为Note8
                    paramMap.set("manufacturer",YFWUserInfoManager.ShareInstance().manufacturer)//厂商：苹果、华为、小米
                    paramMap.set("idfa",safe(YFWUserInfoManager.ShareInstance().idfa))//设备唯一标识符
                    paramMap.set("ip",YFWUserInfoManager.ShareInstance().deviceIp)//设备IP
                    paramMap.set("jpushId",YFWUserInfoManager.ShareInstance().jpushId)//极光推送ID
                    if (Platform.OS == 'ios'){
                        paramMap.set("mfpushId",YFWUserInfoManager.ShareInstance().mfpushId);
                    } else {
                        paramMap.set("mfpushId",YFWUserInfoManager.ShareInstance().jpushId+(Math.floor(Math.random() * 10000 + 1)))//厂商推送ID，TODO android暂无配置厂商，现为极光推送+10000内随机数，IOS不需要
                    }

                    paramMap.set("sessionId",data['sessionId']);
                    paramMap.set("startTime",data['startTime']);
                    paramMap.set("endTime",data['endTime']);
                    paramMap.set("details",JSON.stringify(data['details']));


                    viewModel.TCPRequest(paramMap, (res)=> {
                        if (res.code == '1') {
                            clearSessionForSession()
                            this.sendCountData()

                        }
                    }, (error)=> {}, false);


                }else{

                }

            })

        }
    }

    /**
     * SCHEME跳转监听
     */
    schemeListener(){
        if (Platform.OS === 'ios'){
            this.schemeEvent = iOSManagerEmitter.addListener('SCHEME_ACTION', (data)=> {
                data = safeObj(data)
                let url = safe(data.url);

                if (isNotEmpty(url) && url.length > 0){
                    this.handlerScheme(url)
                }

            });

            YFWNativeManager.get_schemeUrl((url)=>{

                if (isNotEmpty(url) && url.length > 0){
                    this.handlerScheme(url)
                }

            });

        } else {
            this.schemeEvent = DeviceEventEmitter.addListener('SCHEME_ACTION',()=>{
                getInitialURL().then((url) => {
                    this.handlerScheme(url)
                }).catch(err => {
                    let e = err
                });
            })

            getInitialURL().then((url) => {
                this.handlerScheme(url)
            }).catch(err => {
                let e = err
            });
        }


    }

    /**
     * SchemeURL解析
     * @param url
     */
    handlerScheme(url){
        let obj = analyzeUrl(url)
        if(isNotEmpty(obj)){
            this.props.navigation.popToTop();
            const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
            this.props.navigation.dispatch(resetActionTab);
            pushNavigation(this.props.navigation.navigate,obj)
        }
    }


    componentWillMount() {
        this._fetchShopMemberInfoFromServer(true)
        let {navigate} = this.props.navigation;
        JPush.setLoggerEnable(__DEV__)
        JPush.init();
        if(Platform.OS == 'android') {
            this.jumpToNearlyShopListener = DeviceEventEmitter.addListener('shop_info', (msg) => {
                pushNavigation(navigate, {type: 'get_shop_detail', value: msg, from: 'native'});
            });
            this.openNotificationListener = map => {
                if(map?.notificationEventType ==='notificationOpened' && isNotEmpty(map?.extras)){
                    dealPushNotificationResult(navigate,{type: map.extras.type, value: map.extras.value})
                }
            };
            YFWNativeManager.getReceiveJpushData((msg)=>{
                let data = JSON.parse(msg);
                dealPushNotificationResult(navigate,data)
            })
        } else {
            this.openNotificationListener = map => {
                dealPushNotificationResult(navigate,{type: map.extras.type, value: map.extras.value})
            }
            YFWNativeManager.get_notificationDic((data)=>{
                dealPushNotificationResult(navigate,data)
            });
        }
        JPush.addNotificationListener(this.openNotificationListener)
        this.callback = message => {
            console.log('alertContent: ' + JSON.stringify(message))
        }
        JPush.getRegistrationID((e)=>{
            // YFWToast(e.registerID)
            YFWNativeManager.saveJPushID(e.registerID)
        })
        JPush.addCustomMessagegListener(this.callback)
        DeviceEventEmitter.emit('ShowInviteView');
        //移除滑动监听，这里做的是是否滑动到精选
        if(isNotEmpty(this.mainScrollListener)) {
            this.mainScrollListener.remove();
        }
        this.schemeEvent && this.schemeEvent()
        //3D touch
        YFWNativeManager.get_3dTouchDic((data)=>{
            if (isNotEmpty(data)&&data.model == '0'){
                this.props.navigation.popToTop();
                const resetActionTab = NavigationActions.navigate({ routeName: 'ShopCarNav' });
                this.props.navigation.dispatch(resetActionTab);
            }
        });
        this.threeTouchListener = iOSManagerEmitter.addListener('get_threeTouch', (data)=> {
            if (isNotEmpty(data)&&data.model == '0'){
                this.props.navigation.popToTop();
                const resetActionTab = NavigationActions.navigate({ routeName: 'ShopCarNav' });
                this.props.navigation.dispatch(resetActionTab);
            }
        });
        //处理App进程被杀掉，再次启动
        this.dealLastPayInfoToUpdateOrderStatus()
        this.appStateFunc = this.handleAppStateChange.bind(this)
        //处理App进程被杀掉，手动启动App后，支付完成回调
        this.appStateListener = AppState.addEventListener('change', this.appStateFunc)

        getItem(kOpenFullAdData).then((data)=>{
            if (data){
                mobClick('splash-screen')
                homeAdviewClick(navigate,data)
                removeItem(kOpenFullAdData)
            }
        })
        DeviceEventEmitter.addListener('LoginToUserCenter',(param)=>{
            if (param == 0) {
                const {navigate} = this.props.navigation
                let userInfo = YFWUserInfoManager.ShareInstance();
                let callBackAction = () => {
                    const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
                    this.props.navigation.dispatch(resetActionTab);
                }
                if (userInfo.hasLogin()){
                    callBackAction()
                    return
                }
                doAfterLoginWithCallBack(navigate,()=>{
                    callBackAction()
                })
            }
        })
    }


    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove()
        }
        if (Platform.OS == 'android') {
            if (isNotEmpty(this.getQrCodeInfoListener)) {
                this.getQrCodeInfoListener.remove();
            }
            if (isNotEmpty(this.jumpToNearlyShopListener)) {
                this.jumpToNearlyShopListener.remove();
            }
        }
        if (isNotEmpty(this.openNotificationListener)) {
            JPush.removeListener(this.openNotificationListener)
        }
        if(this.callback){
            JPush.removeListener(this.callback)
        }
        this.threeTouchListener&&this.threeTouchListener.remove()
        this.didFocus.remove()
        this.loginListener&&this.loginListener.remove()
        this.openAlertListener&&this.openAlertListener.remove()
        AppState.removeEventListener('change', this.appStateFunc)
    }

    handleAppStateChange (state) {
        if (state == 'active') {
            this.dealLastPayInfoToUpdateOrderStatus()
        } else if (state == 'background') {
            YFWBackStack.ShareInstance().cacheListToLocalStorage()
        }
    }

    dealLastPayInfoToUpdateOrderStatus() {
        if (YFWUserInfoManager.ShareInstance().isListeningPayStatus) {//正常情况
            return
        }
        YFWNativeManager.get_payInfoDic((info)=>{
            // Alert.alert(JSON.stringify(info))
            if (isNotEmpty(info) && isNotEmpty(info.type) && info.result) {
                getItem(kLastPayOrderNo).then((data)=>{
                    if (isNotEmpty(data) && data != 'error' && isNotEmpty(data.orderNo)) {
                        this.updateOrderPayStatus(info.type,data.orderNo,data.orderBatchNo,data.isERPPay)
                    }
                    setItem(kLastPayOrderNo,null)
                })
            }
        })
    }

    updateOrderPayStatus(type,orderNo,orderBatchNo,isERPPay) {
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
        if (isERPPay) {
            paramMap.set('__cmd', 'guest.erp_order.updatePayStatus');
        } else {
            paramMap.set('__cmd', 'guest.order.updateBatchPayStatus');
        }
        paramMap.set('orderno', orderBatchNo);
        paramMap.set('type', safe(paytype));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let result = res.result;
            if (result.success && orderNo) {
                if (isERPPay) {//联合会员线下订单支付
                    DeviceEventEmitter.emit('erp_order_status_refresh', 'PaySuccess');
                    return
                }
                if (isNotEmpty(result.redirect_url)) {
                    let navigateParams = {
                        type: 'get_h5',
                        value: result.redirect_url,
                        from:'group_booking',
                        share: safe(result.phone_show_groupbuy_infourl),
                        isHiddenShare:parseInt(result.groupbuy_head) != 1,//不是团长的 需要隐藏分享按钮
                        shareTitle: safe(result.phone_show_groupbuy_title),
                        shareContent: safe(result.phone_show_groupbuy_content),
                        shareImage:safe(result.phone_show_groupbuy_image)
                    }
                    getAuthUrlWithCallBack(navigateParams,(authUrl)=>{
                        navigateParams.token_value = authUrl
                        this.props.navigation.navigate('YFWWebView', {state:navigateParams});
                    })
                    return
                }
                this.props.navigation.navigate('YFWOrderSuccessPage', {
                    title: '付款成功',
                    orderNo: orderNo,
                    type: 'payment',
                    from: '',
                    unPayCount:0
                });
            } else {
                YFWToast('支付失败');
            }
        });
    }


    //@ Request
    handleData(firstLoad) {
        this._requestIndexAdsMedicine();
        if (YFWUserInfoManager.ShareInstance().isShopMember()) {
            this._fetchAllShopInfoFromServer()
            if (YFWUserInfoManager.ShareInstance().hasLogin()) {
                this._fetchErpOrderInfoFromServer()
            }
        } else {
            this._requestAllHomeData(firstLoad)
        }
    }

    _requestAllHomeData(firstLoad){
        let params = new Map();
        params.set('__cmd','guest.common.app.getIndexData_new')
        params.set('os',Platform.OS)
        params.set('deviceName',(Platform.OS === 'ios'?isIphoneX()?'X':'N':'A'))
        let request = new YFWRequestViewModel()
        request.TCPRequest(params,(res)=>{
            // console.log(res,'home')
            this._handle_requestHomeData_TCP(res)
        },(error)=>{},false)
        let paramMap = new Map();
        let cmd = cmd = 'guest.common.app.getIndexData_JKYX as getIndexData_JKYX,guest.medicine.getLabelRecommendMedicine as getLabelRecommendMedicine,guest.common.app.getAPPBannerBottom as getQualification'
        paramMap.set('__cmd', cmd);
        paramMap.set('getIndexData_JKYX',{
            'os':Platform.OS,
            'deviceName':(Platform.OS === 'ios'?isIphoneX()?'X':'N':'A')
        })
        paramMap.set('getLabelRecommendMedicine',{
            'total':50
        })
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            // console.log(res,'home other')
            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.endRefresh();
            }
            let jkyxData = res.result['getIndexData_JKYX']
            this.state.jkyxData = {style:'ads_health',items:jkyxData}
            let recommendMedicine = res.result['getLabelRecommendMedicine']
            this._handle_requestRecommendedData_TCP({result:recommendMedicine})
            let getQualification = res.result['getQualification']
            this.state.qualificationData = YFWHomeDataModel.getQualificationData(getQualification);
            let dataArray = this._handleData();
            this.setState({
                data: dataArray,
            });
        }, (error)=> {
            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.endRefresh();
            }
            this.setState({
                showFoot: 0,
                loading: false,
            });
            if (isEmpty(this.state.data) || this.state.data.length ==0) {
                if (this.statusView)this.statusView.showNetError();
            }
        },this.state.loading);
    }

    _requestHomeData_TCP() {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.getIndexData');
        paramMap.set('os', Platform.OS);
        paramMap.set('version', 4000);
        paramMap.set('deviceName',  (Platform.OS === 'ios'?isIphoneX()?'X':'N':'A'));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {

            this._handle_requestHomeData_TCP(res);

            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.endRefresh();
            }
        }, (error)=> {
            this.setState({
                showFoot: 0,
                loading: false,
            });
            if (isEmpty(this.state.data) || this.state.data.length ==0) {
                if (this.statusView)this.statusView.showNetError();
            }
            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.endRefresh();
            }
        },this.state.loading);
    }

    _requestIndexAdsMedicine(){
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.getIndexAdsMedicine');
        paramMap.set('os', Platform.OS);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if(res.code == '1'){
                if(isNotEmpty(safeObj(safeObj(res.result)).shroud_items)&&res.result.shroud_items.length>0){
                    this.setState({
                        homeAdsGoodsData:res.result.shroud_items
                    })
                }
            }
        },(error)=>{

        },false)
    }

    _handle_requestHomeData_TCP(res){
        setItem('kHomeCacheData',res)
        this.state.homeData = YFWHomeDataModel.getModelArray(res.result.data_items);
        let dataArray = this._handleData();
        this.setState({
            data: dataArray,
            loading: false,
        });
        if (this.statusView)this.statusView.dismiss();

    }


    _requestRecommendedData_TCP() {

        let paramMap = new Map();
        paramMap.set('__cmd','guest.medicine.getLabelRecommendMedicine');
        paramMap.set('total',50);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {

            this._handle_requestRecommendedData_TCP(res);

        }, (error)=> {
            this.setState({
                showFoot: 0,
            });
        }, false);

    }

    _handle_requestRecommendedData_TCP(res){

        let showFoot = 0;
        let data = itemAddKey(YFWShopCarRecomendModel.getModelArray(res.result));

        if (data.length === 0) {
            showFoot = 1;
        }
        this.state.recomeData = data;
        let dataArray = this._handleData();
        this.setState({
            data: dataArray,
            showFoot: showFoot,
        });

    }

    _requestQualificationData_TCP(){
        let paramMap = new Map();
        paramMap.set('__cmd','guest.common.app.getAPPBannerBottom');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            this.state.qualificationData = YFWHomeDataModel.getQualificationData(res.result);
            let dataArray = this._handleData();
            this.setState({
                data: dataArray,
            });
        }, (error)=> {}, false);
    }

    //@ Action

    _handleData() {
        let dataArray = []
        if(isEmpty(this.state.homeData)){
            return dataArray
        }
        let recomeObj = {};
        dataArray = this.state.homeData.slice(0);
        if (this.state.recomeData.length > 0) {
            recomeObj['items'] = this.state.recomeData
            recomeObj['name'] = '精选商品'
            dataArray.map((item)=>{
                if (item.style == 'ads_7F') {
                    let haveIndex = null
                    let have = item.items.some((info,index)=>{
                        if (info.name == '精选商品') {
                            haveIndex = index
                        }
                        return info.name == '精选商品'
                    })
                    if (have) {
                        item.items.splice(haveIndex,1,recomeObj)
                    } else {
                        item.items = item.items.concat(recomeObj)
                    }
                }
            })
        }
        if (isNotEmpty(this.state.qualificationData)){
            if (!this._hasQualificationData(dataArray)){
                dataArray.splice(dataArray.length,0,this.state.qualificationData);
            }
        }
        if (isNotEmpty(this.state.jkyxData)){
            if (!this._hasjkyxData(dataArray)){
                let index = this._getjkyxDataIndex(dataArray)
                dataArray.splice(index,1,this.state.jkyxData);
            }
        }
        dataArray = itemAddKey(dataArray)

        return dataArray;
    }

    _hasjkyxData(data){
        return data.some((item,index)=>{
            return item.style == 'ads_health' && item.items
        })
    }
    _getjkyxDataIndex(data){
        let index = 4
        data.some((item,i)=>{
            let have = item.style == 'ads_health'
            if (have) {
                index = i
            }
            return have
        })
        return index
    }

    _hasQualificationData(data){
        let returnValue = false;
        data.forEach((item,index)=>{
            if (item.style == 'qualification'){
                returnValue = true;
            }
        })
        return returnValue
    }

    _fetchAllShopInfoFromServer() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        let shopID = YFWUserInfoManager.ShareInstance().getErpShopID()
        paramMap.set('__cmd', 'guest.shop.getShopInfo as shopInfo,guest.shopMedicine.getCategroyByParentId as categroyInfo,guest.shopMedicine.getStoreMedicineTop as recommendInfo,guest.shopMedicine.getPackageByStoreId as packageInfo,guest.common.app.getAPPBannerBottom as getQualification');
        paramMap.set('shopInfo',{
            'storeid':shopID
        })
        paramMap.set('recommendInfo',{
            'storeid':shopID,
            'count':6
        })
        paramMap.set('packageInfo',{
            'storeid':shopID
        })
        viewModel.TCPRequest(paramMap, (res)=> {
            console.log(res)
            let getQualification = res.result['getQualification']
            let qualificationInfo = YFWHomeDataModel.getQualificationData(getQualification);
            let dataArray = YFWHomeShopDataModel.getModelArray(res.result['shopInfo'],res.result['categroyInfo'],res.result['recommendInfo'],res.result['packageInfo'],qualificationInfo,this.state.data)
            this.setState({
                data:dataArray,
                shopInfo:res.result['shopInfo'],
                loading:false
            })
            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.endRefresh();
            }
            if (this.statusView)this.statusView.dismiss();
        },(error)=>{
            if (isEmpty(this.state.data) || this.state.data.length ==0) {
                if (this.statusView)this.statusView.showNetError();
            }
            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.endRefresh();
            }
            this.setState({
                showFoot: 0,
                loading: false,
            });
        },this.state.loading);
    }


    onShareClick() {
        if(haslogin()){
            getWinCashShareUrl((res)=>{
                if(res&&res.result){
                    let data = res.result;
                    let param = {
                        url:data.url,
                        title : data.title,
                        content:data.desc,
                        image : data.imgsrc,
                        goneItems:[],
                        page:'home',
                        isShowHead:true
                    };
                    DeviceEventEmitter.emit('OpenShareView',param);
                }
            })
        }else{
            DeviceEventEmitter.emit('OpenShareView', {page: 'home',isShowHead:true});
        }
    }


    onSearchClick() {

        let {navigate} = this.props.navigation;
        let params = {
            type: 'get_search'
        }
        if (YFWUserInfoManager.ShareInstance().isShopMember()) {
            params.shop_id = YFWUserInfoManager.ShareInstance().getErpShopID()
            params.isShopMember = true
        }
        pushNavigation(navigate, params);

    }

    onSaoyisaoClick(value) {
        if (value.name == 'erpOrderScan') {
            if(Platform.OS === 'android'){
                value = JSON.parse(value.value)
            }
            YFWUserInfoManager.ShareInstance().setErpUserInfo(value)
            this._dealErpOrderPay(value)
            return
        }

        if (value.name == 'get_goods_detail' && YFWUserInfoManager.ShareInstance().isShopMember()) {
            if (isNotEmpty(value.scan_code) && !isNaN(parseInt(value.scan_code))) {
                let {navigate} = this.props.navigation;
                let params = {
                    type: 'get_search',
                    searchText:value.scan_code+''
                }
                params.shop_id = YFWUserInfoManager.ShareInstance().getErpShopID()
                params.isShopMember = true
                pushNavigation(navigate, params);
                return
            }
        }

        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: value.name, value: value.value});

    }


    _onRefresh() {
        this.state.pageIndex = 1;
        this.handleData(false)
    }

    _onEndReached() {

        this.setState({
            showFoot: 1
        });

    }

    _onSrollStart(e) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate', {value: 1});
    }

    _onSrollEnd(e) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate', {value: 2});
    }
    _onScrollEndDrag(e){
        this.refreshHeader&&this.refreshHeader.beginRefresh();
    }


    onRefresh = () => {
        this.state.loading =true
        this._onRefresh();
        this.setState({});
    }

    renderList(){
        let isShopMember = YFWUserInfoManager.ShareInstance().isShopMember()
        let indices = Platform.select({
            android:isShopMember?[4]:[7],
            ios:isShopMember?[4]:[7]
        })
        if(Platform.OS == 'android'){
            return(<FlatList
                style={{backgroundColor:backGroundColor()}}
                ref={(flatList)=>this._flatList = flatList}
                extraData={this.state}
                data={this.state.data}
                renderItem={this._renderItem.bind(this)}
                ListFooterComponent={this._renderFooter.bind(this)}
                onEndReached={this._onEndReached.bind(this)}
                onEndReachedThreshold={0.1}
                onScrollBeginDrag={this._onSrollStart.bind(this)}
                onMomentumScrollEnd={this._onSrollEnd.bind(this)}
                scrollEventThrottle={50}
                onRefresh={this.onRefresh}
                refreshing={this.state.loading}
                ListHeaderComponent={<View style={{height: isShopMember?35:0}}/>}
                progressViewOffset={isShopMember?35:0}
                onScroll={this._onScroll}
                stickyHeaderIndices={indices}
            />)
        }else {
            return(<FlatList
                style={{backgroundColor:backGroundColor()}}
                ref={(flatList)=>this._flatList = flatList}
                extraData={this.state}
                data={this.state.data}
                renderItem={this._renderItem.bind(this)}
                ListFooterComponent={this._renderFooter.bind(this)}
                ListHeaderComponent={this._renderHeader.bind(this)}
                onEndReached={this._onEndReached.bind(this)}
                onEndReachedThreshold={0.1}
                onScrollBeginDrag={this._onSrollStart.bind(this)}
                onMomentumScrollEnd={this._onSrollEnd.bind(this)}
                onScrollEndDrag={this._onScrollEndDrag.bind(this)}
                onScroll={this._onScroll}
                scrollEventThrottle={50}
                stickyHeaderIndices={indices}
            />   )
        }


    }

    //@ View
    render() {
        let userInfo = YFWUserInfoManager.ShareInstance();
        if (userInfo.isShopMember()) {
            DeviceEventEmitter.emit('ShowInviteView', {value: true})
            let emptyViewH = 70 + iphoneTopMargin()
            if(Platform.OS === 'ios'){
                return (
                    <View style={[BaseStyles.container]}>
                        <YFWStatusBar addListener={this.props.navigation.addListener} />
                        <View ref={(e)=>{this.topEmptyView=e}} style={{height:emptyViewH,backgroundColor:'transparent',width:1}}/>
                        <YFWSearchHeader ref='searchHeaderView'
                                         navigation={this.props.navigation}
                                         from={'home_member'} bgStyle={{position:'absolute'}}
                                         canChangeColor={false}
                                         onShareClick={()=>{this.onShareClick()}}
                                         onSearchClick={()=>{this.onSearchClick()}}
                                         onSaoyisaoClick={(value)=>{this.onSaoyisaoClick(value)}}/>
                        {this.renderList()}
                        <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{this.state.loading=false;this._fetchShopMemberInfoFromServer()}}/>
                        <YFWLoginTip navigation={this.props.navigation}/>
                        <YFWHomeAdView ref={(ad)=>{this.homeAdView = ad}} navigation={this.props.navigation}/>
                        <YFWBlindMobileAlert ref={(m)=>{this.alertView = m}}/>
                        <YFWErpOrderAlertView ref={(e)=>this.erpOrderAlertView=e} ></YFWErpOrderAlertView>
                    </View>
                )
            }
            return (
                <View style={[BaseStyles.container]}>
                    <YFWStatusBar addListener={this.props.navigation.addListener} />
                    <View style={{height:35 + iphoneTopMargin(),}}/>
                    {this.renderList()}
                    <YFWSearchHeader ref='searchHeaderView'
                                    navigation={this.props.navigation}
                                    from={'home_member'} bgStyle={{position:'absolute'}}
                                    canChangeColor={false}
                                    onShareClick={()=>{this.onShareClick()}}
                                    onSearchClick={()=>{this.onSearchClick()}}
                                    onSaoyisaoClick={(value)=>{this.onSaoyisaoClick(value)}}/>
                    <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{this.state.loading=false;this._fetchShopMemberInfoFromServer()}}/>
                    <YFWLoginTip navigation={this.props.navigation}/>
                    <YFWHomeAdView ref={(ad)=>{this.homeAdView = ad}} navigation={this.props.navigation}/>
                    <YFWBlindMobileAlert ref={(m)=>{this.alertView = m}}/>
                    <YFWErpOrderAlertView ref={(e)=>this.erpOrderAlertView=e} ></YFWErpOrderAlertView>
                </View>
            )
        }
        return (
            <View style={[BaseStyles.container]}>
                <YFWStatusBar addListener={this.props.navigation.addListener} />
                {this.renderList()}

                {DeviceEventEmitter.emit('ShowInviteView', {value: true})}
                <YFWSearchHeader ref='searchHeaderView'
                                 navigation={this.props.navigation}
                                 from={'home'} bgStyle={{position:'absolute'}}
                                 onShareClick={()=>{this.onShareClick()}}
                                 onSearchClick={()=>{this.onSearchClick()}}
                                 onMessageClick={()=>{this.onMessageClick()}}
                                 onSaoyisaoClick={(value)=>{this.onSaoyisaoClick(value)}}/>
                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{this.state.loading=false;this._fetchShopMemberInfoFromServer()}}/>
                <YFWLoginTip navigation={this.props.navigation}/>
                <YFWHomeAdView ref={(ad)=>{this.homeAdView = ad}} navigation={this.props.navigation}/>
                <YFWBlindMobileAlert ref={(m)=>{this.alertView = m}}/>
            </View>
        );
    }

    onMessageClick() {
        // const {navigate} = this.props.navigation;
        // navigate('YFWHeaderExamplePage');
    }



    _renderItem = (item) => {
        let hasLogin = YFWUserInfoManager.ShareInstance().isShopMember()
        let rowData = item.item;
        if (rowData.style === 'banner') {
            return (
                <View style={BaseStyles.item}>
                    <YFWHomeBarner imagesData={rowData.items} backGroundImagesData={rowData.items_attach} backGroundDownImagesData={rowData.bannerBackground_down} navigation={this.props.navigation}/>
                </View>
            )
        } else if (rowData.style === 'menu') {
            return (
                <View style={BaseStyles.item}  backgroundColor={'white'}>
                    <YFWHomeMenu badgeData={rowData.items} bgData={rowData.menuBackground} navigation={this.props.navigation}/>
                </View>
            )
        }
        else if ( rowData.style == 'shopInfo') {
            return (
                <View>
                    <View style={{width:kScreenWidth,paddingBottom:17,marginBottom:13}}>
                        <View style={{position:"absolute",top:0,left:13,width:86,height:86,
                            justifyContent:'center',
                            alignItems:'center',
                            borderRadius:10,
                            backgroundColor:'white',
                            shadowColor: "rgba(204, 204, 204, 0.4)",
                            shadowOffset: {
                                width: 0,
                                height: 5
                            },
                            shadowRadius: 12,
                            shadowOpacity: 1}}
                        >
                            <Image style={{height: 35, width: 70, resizeMode: "contain"}} source={{uri:this.state.shopInfo.logo_image}}></Image>
                        </View>
                        <View style={{marginLeft:100+24}}>
                            <Text style={{color:'#333',fontSize:17,fontWeight:'500',marginTop:3}}>{this.state.shopInfo.title}</Text>
                            <Image style={{marginTop:5,width:46,height:18}} source={require('../../img/member_shop_icon.png')}></Image>
                            <Text style={{color:'#999',fontSize:12,marginTop:2}}>{this.state.shopInfo.address}</Text>
                        </View>
                    </View>
                </View>

            )
        }
        else if(rowData.style == 'coupon'){
            return(
                <View style={BaseStyles.item}>
                    <YFWHomeCouponView dataArray={rowData.items} navigation={this.props.navigation}></YFWHomeCouponView>
                </View>
            )
        } else if(rowData.style == 'shopPackage') {
            return(
                <View style={BaseStyles.item}>
                    <YFWHomeShopAdGoodsView dataArray={rowData.items} navigation={this.props.navigation} ></YFWHomeShopAdGoodsView>
                </View>
            )
        } else if (rowData.style == 'recomend') {
            return (
                <View style={BaseStyles.item}>
                    <YFWHomeShopRecommendView
                        Data={rowData.items} shop_id={rowData.shop_id} navigation={this.props.navigation}
                        ref = {(item)=>this.recommendView = item}
                        onLayout={(event) => this._onLayout(event)}
                    />
                </View>
            )
        }
        else if(rowData.style === 'ads_1F_2_new') {
            return (
                <View style={{backgroundColor:'white'}}>
                    <View style={{marginLeft:12,marginTop:15}}>
                        <YFWTitleView title={'商城频道'} style_title={{width:66,fontSize:15}} />
                    </View>
                    <YFWShroudDataAdsView Data={rowData.items} navigation={this.props.navigation}/>
                </View>)
        }
        else if (rowData.style === 'findDrug') {
            return (
                <View style={{backgroundColor:'white',marginBottom:-(30+iphoneTopMargin())}}>
                    <YFWHomeFindCodeView navigation={this.props.navigation}></YFWHomeFindCodeView>
                </View>
            )
        }
        else if (rowData.style === 'ads_health' ) {//|| rowData.style === 'ads_2F_2'
            return (
                <View style={{backgroundColor:'white'}}>
                    <View style={{marginLeft:12,marginTop:15}}>
                        <YFWTitleView title={'健康优享'} style_title={{width:66,fontSize:15}} />
                    </View>
                    <YFWHomeScrollListView Data={rowData.items&&rowData.items.length>0?rowData.items[0].items:[]} navigation={this.props.navigation}/>
                </View>

            )
        }
        else  if (rowData.style === 'ads_1F_1' ) {//|| rowData.style === 'ads_2F_1'
            return (
                <View style={BaseStyles.item} >
                    <YFWHomeYaoShiClassRoom Data={rowData.items} bgImage={rowData.bgImage}  navigation={this.props.navigation}/>
                </View>
            )
        }
        else if (rowData.style === 'topMenu') {
            return (
                <YFWHomeTopView isShopMember={hasLogin} shopInfo={this.state.shopInfo} Data={rowData.data.items} clickedIndex={(index)=>DeviceEventEmitter.emit('homeTopIndexChange',index)}></YFWHomeTopView>
            )
        }
        else if (rowData.style === 'ads_7F') {
            return (
                <View style={BaseStyles.item} onLayout=
                {(event)=> {
                    // this.measureRecommend()
                }}>
                    <YFWHomeReCommendView
                        Data={rowData.items} navigation={this.props.navigation}
                        ref = {(item)=>this.recommendView = item}
                        onLayout={(event) => this._onLayout(event)}
                    />
                </View>
            )
        }
        else if (rowData.style === 'qualification') {
            if (rowData.items && rowData.items[0].img_url && rowData.items[0].img_url.length > 0) {
                return  <View style={BaseStyles.item} >
                        <YFWAdvertHead Data={rowData.items} navigation={this.props.navigation} style={rowData.style}/>
                    </View>
            }
        }
        else if (rowData.style === 'ads_main') {
            return (
                <YFWHomeAdsMainView Data={rowData.items} navigation={this.props.navigation}></YFWHomeAdsMainView>
            )
        }
        else if (rowData.style === 'ads_sub') {
            return (
                <YFWHomeAdsSubView Data={rowData} navigation={this.props.navigation}></YFWHomeAdsSubView>
            )
        }
        else {
            return (
                null
            )
        }
    }


    _renderHeader(){

        let that = this;
        return (
            <YFWRefreshHeader ref={(m)=>{this.refreshHeader = m}} toScroll={(offset)=>{
                if (YFWUserInfoManager.ShareInstance().isShopMember()) {
                    if ( offset == 0) {
                        that._flatList.scrollToOffset({offset:offset,animated:true},1)
                    }
                    return
                }
                that._flatList.scrollToOffset({offset:offset,animated:true},1)
            }} onRefresh={() => this._onRefresh()}/>
        );

    }

    _renderFooter() {

        return (null)

        return <YFWListFooterComponent showFoot={this.state.showFoot} noFooterRender={()=>{
            return (
                <TouchableOpacity style={[BaseStyles.centerItem,{height:160}]} onPress={()=>{this._scrollToRecommend(!this.isTop)}}>
                    <Text style={{fontSize:14,color:darkLightColor()}}> —— 就这么多了，回到顶部再看看吧 —— </Text>
                </TouchableOpacity>
            );
        }}/>

    }

    _onScroll=(event)=>{
        try {
            // this.measureRecommend()
            this.searchHeadRecommend(event);
            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.onScroll(event);

            }
        }catch (e) {}
    }


    searchHeadRecommend(event){
        let contentY = event.nativeEvent.contentOffset.y;
        this.refs.searchHeaderView.setOffsetProps(contentY);
        let emptyViewH = 70 + iphoneTopMargin()
        // console.log('ssss=='+contentY)
        if (contentY >= 128) {
            this.topEmptyView&&this.topEmptyView.setNativeProps({
                style: {height:(emptyViewH - 38)},
            })
        } else {
            this.topEmptyView&&this.topEmptyView.setNativeProps({
                style: {height:emptyViewH},
            })
        }
    }


    /**
     * 测量精选推荐
     */
    measureRecommend(){
        if(this.state.recomeData.length<= 0){
            return
        }
        if(this.recommendView == null){
            return;
        }
        UIManager.measure(findNodeHandle(this.recommendView),(x,y,width,height,pageX,pageY)=>{
            try {
                if(isEmpty(this.recommendHeight)){
                    this.recommendHeight = pageY;
                }
                if(pageY>90){
                    DeviceEventEmitter.emit('MainLabelChange',null);
                    DeviceEventEmitter.emit('HomePageNameChange',"首页");
                    this.toTopBtn._setImg(require('../../img/ic_to_jingxuan.png'))
                    this.isTop = true
                }
                //已显示
                else{
                    DeviceEventEmitter.emit('MainLabelChange',require('../../img/icon_navigation_jinxuan.png'));
                    DeviceEventEmitter.emit('HomePageNameChange',"精选");
                    this.toTopBtn._setImg(require('../../img/ic_to_top.png'))
                    this.isTop = false
                }
            }catch (e) {

            }

        })
    }

    _scrollToRecommend(value){
        try {
            if (value) {
                //滑动到顶部
                this._flatList.scrollToOffset({offset: 0, animated: true});
            }else{
                //滑动到精选,80是已知的高度
                this._flatList.scrollToOffset({offset: this.recommendHeight-80, animated: true});
            }
        }catch (e) {

        }
    }
}






