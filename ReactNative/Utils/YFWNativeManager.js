import React, {Component} from 'react';
import {
    DeviceEventEmitter, NativeModules,
    Platform,Alert
} from 'react-native'
import {
    isNotEmpty,
    isEmpty,
    strMapToObj,
    spliceImagePath,
    safe,
    mobClick,
    is_ios_hot_bundle
} from "../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "./YFWUserInfoManager";

var YFWBridgeManager = NativeModules.YFWBridgeManager;
var AndroidNativeApi = NativeModules.AndroidNativeApi;
import {mapToJson, safeObj} from '../PublicModule/Util/YFWPublicFunction'
import YFWHandleRequest from "./YFWHandleRequest";

import * as StoreReview from 'react-native-store-review'
import {LOGIN_TOKEN, setItem} from "./YFWStorage";
import {pushNavigation, YFWNavigate} from "./YFWJumpRouting";
import YFWToast from "./YFWToast";
import { kLoginCloseAccountKey } from '../UserCenter/View/YFWCloseTipAlert';
export default class YFWNativeManager {

    /**
     * 初始化数美SDK（用户同意隐私权限后，再初始化数美SDK）
     */
    static initSMSDK() {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.initSMSDK) {
                YFWBridgeManager.initSMSDK()
            }
        } else {
            if (AndroidNativeApi.initSMSDK) {
                AndroidNativeApi.initSMSDK()
            }
        }
    }

    /**
     * 初始化友盟SDK（用户同意隐私权限后，再初始化友盟SDK）
     */
    static initUMengSDK() {
        if (Platform.OS == 'ios') {
        } else {
            if (AndroidNativeApi.initUMengSDK) {
                AndroidNativeApi.initUMengSDK()
            }
        }
    }

    /**
     *  用户同意隐私权限后，再申请特殊权限
     */
    static requestPermissions() {
        if (Platform.OS == 'ios') {
        } else {
            if (AndroidNativeApi.requestPermissions) {
                AndroidNativeApi.requestPermissions()
            }
        }
    }

    static clearWebViewCache() {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.clearWebViewCache) {
                YFWBridgeManager.clearWebViewCache()
            }
        } else {
        }
    }
    static getDeviceId(callBack) {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.getDeviceId) {
                YFWBridgeManager.getDeviceId(callBack)
            } else {
                callBack&&callBack('')
            }
        } else {
            if (AndroidNativeApi.getDeviceId) {
                AndroidNativeApi.getDeviceId(callBack)
            } else {
                callBack&&callBack('')
            }
        }
    }

    static changeIQKeyboardManagerEnable(enable) {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.changeIQKeyboardManagerEnable) {
                console.log(enable,'changeIQKeyboardManagerEnable')
                YFWBridgeManager.changeIQKeyboardManagerEnable(enable)
            }
        }
    }

    static showAlertWithTitle(title,message,callBack) {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.showAlertWithTitle) {
                YFWBridgeManager.showAlertWithTitle(title,message,()=>{
                    callBack&&callBack()
                })
            }
        }
    }

    //检查相机权限
    static checkCameraAuthorizationStatusCallback(returnBlock){
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.checkCameraAuthorizationStatusCallback) {
                YFWBridgeManager.checkCameraAuthorizationStatusCallback((status)=>{
                    if (!status) {
                        Alert.alert('请开启摄像头权限','打开相机失败，请前往设置中心打开相机权限',[{text:'确定',onPress:()=>{YFWNativeManager.openSetting()}}])
                    }
                    returnBlock(status)
                })
            }
        } else {
            if (AndroidNativeApi.checkCameraAuthorizationStatusCallback) {
                AndroidNativeApi.checkCameraAuthorizationStatusCallback((status)=> {
                    if (!status) {
                        Alert.alert('请开启摄像头权限','打开相机失败，请前往设置中心打开相机权限',[{text:'确定',onPress:()=>{YFWNativeManager.startAppSettings()}}])
                    }
                    returnBlock(status)
                })
            }
        }
    }

    //判断是否打开通知权限
    static isOpenNotification(returnBlock) {

        if (Platform.OS == "ios") {
            if (YFWBridgeManager.isOpenNotification) {
                if (is_ios_hot_bundle()) {
                    let isFetchStatus = false
                    YFWBridgeManager.isOpenNotification((openStatus) => {
                        isFetchStatus = true
                        returnBlock(false);
                    });
                    setTimeout(() => {
                        if (!isFetchStatus) {
                            isFetchStatus = true
                            returnBlock(true)
                        }
                    }, 500);
                } else {
                    YFWBridgeManager.isOpenNotification((openStatus) => {
                        returnBlock(openStatus);
                    });
                }

            }

        } else {
            if (AndroidNativeApi.isNeedOpenNotification) {
                AndroidNativeApi.isNeedOpenNotification((openStatus)=> {
                    returnBlock(openStatus)
                })
            }

        }

    }

    //打开通知权限
    static openNotification(returnBlock) {

        if (Platform.OS == "ios") {
            if (YFWBridgeManager.openNotification) {
                YFWBridgeManager.openNotification(('value'), (error, events) => {
                    if (error) {
                        console.error(error);
                    } else {
                        returnBlock(events);
                    }
                });
            }

        } else {

        }

    }

    //打开设置页面
    static openSetting(type) {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.openSetting) {
                if(type=="location") {
                    Alert.alert('定位服务未开启','请进入系统「设置」>「隐私」>「定位服务」中打开开关，并允许药房网商城使用定位服务',[{text:'取消',onPress:()=>{}},{text:'立即开启',onPress:()=>{
                        YFWBridgeManager.openSetting((''), (error, events) => {
                            if (error) {
                                console.error(error);
                            } else {

                            }
                        })
                    }}])
                }else {
                    YFWBridgeManager.openSetting((''), (error, events) => {
                        if (error) {
                            console.error(error);
                        } else {

                        }
                    })
                }
            }

        } else {
            if (AndroidNativeApi.openSetting) {
                AndroidNativeApi.openSetting();
            }

        }

    }

    //打开App设置页面
    static startAppSettings(type) {

        if (Platform.OS == 'android') {
            if (AndroidNativeApi.startAppSettings) {
                AndroidNativeApi.startAppSettings();
            }
        } else {
            this.openSetting(type)
        }
    }

    //跳转应用市场
    static openAppStore(returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.openAppStore) {
                YFWBridgeManager.openAppStore((''), (error, events) => {
                    if (error) {
                        console.error(error);
                    } else {
                        returnBlock();
                    }
                })
            }


        } else {

            if (AndroidNativeApi.gotoAppMarket) {
                AndroidNativeApi.gotoAppMarket(()=> {
                    returnBlock()
                })
            }

        }


    }


    //跳转应用市场评价页面
    static openAppStoreComment(returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.openAppStoreComment) {
                if (StoreReview.isAvailable) {
                    StoreReview.requestReview();
                } else {
                    YFWBridgeManager.openAppStoreComment((''), (error, events) => {
                        if (error) {
                            console.error(error);
                        } else {
                            returnBlock()
                        }
                    })
                }

            }


        } else {
            if (AndroidNativeApi.gotoAppMarket) {
                AndroidNativeApi.gotoAppMarket(()=> {
                    returnBlock()
                })
            }

        }


    }


    //定位
    static getPosition() {

        if (Platform.OS == 'ios') {

            // iOS todo

        } else {
            if (AndroidNativeApi.startLocationNoCallback) {
                AndroidNativeApi.startLocationNoCallback();
            }

        }

    }

    //版本号
    static getVersionNum(returnBlock) {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.getVersionNum) {
                YFWBridgeManager.getVersionNum((''), (error, events) => {
                    if (error) {
                        console.error(error);
                    } else {
                        returnBlock(events);
                    }
                })
            }


        } else {
            if (AndroidNativeApi.getVersionCode) {
                AndroidNativeApi.getVersionCode((verSionCode)=> {
                    returnBlock(verSionCode)
                }, (error)=> {

                })
            }

        }

    }

    //获取Zip版本
    static getZipBundleNum(returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.getZipBundleNum) {
                YFWBridgeManager.getZipBundleNum((events) => {
                    returnBlock(events);
                })
            }


        } else {

            // todo
        }

    }


    //重新定位

    static chooseLocationData(returnValue, errorData) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.chooseLocationData) {
                AndroidNativeApi.chooseLocationData((res)=> {
                    returnValue(JSON.parse(res))
                }, ()=> {
                    errorData()
                })
            }

        } else {

            if (YFWBridgeManager.getLongitudeAndLatitude) {
                YFWBridgeManager.getLongitudeAndLatitude((info)=> {
                    returnValue(info);
                });
            }

        }
    }
    //重新定位获取定位信息
    static startUpdatingLocationWithComplection(returnBlock,errorBlock) {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.startUpdatingLocationWithComplection) {
                YFWBridgeManager.startUpdatingLocationWithComplection((address)=> {
                    returnBlock&&returnBlock(address);
                });
            }
        } else {
            if (AndroidNativeApi.chooseLocationData) {
                AndroidNativeApi.chooseLocationData((res)=> {
                    returnBlock&&returnBlock(JSON.parse(res))
                }, ()=> {
                    errorBlock&&errorBlock()
                })
            }
        }
    }


    //TCP网络请求
    static TCPRequest(params, returnValue, errorMethod) {

        if ((Platform.OS === 'ios')) {

            if (YFWBridgeManager.TCPRequest) {
                YFWBridgeManager.TCPRequest(params, (response) => {
                    response = YFWHandleRequest.handleResponse(response);
                    returnValue(response);
                }, (error)=> {
                    errorMethod(error);
                });
            }


        } else {
            if (AndroidNativeApi.tcpRequest) {
                let data = JSON.stringify(params)
                AndroidNativeApi.tcpRequest(data, (res)=> {
                    let response = JSON.parse(res);
                    response = YFWHandleRequest.handleResponse(response);
                    returnValue(response);
                }, (error)=> {
                    errorMethod(JSON.parse(error));
                })
            }

        }

    }

    //TCP网络请求
    static TCPMultipleRequest(params, returnValue, errorMethod) {

        if ((Platform.OS === 'ios')) {

            if (YFWBridgeManager.TCPMultipleRequest) {
                YFWBridgeManager.TCPMultipleRequest(params, (response) => {
                    response = YFWHandleRequest.handleResponse(response);
                    returnValue(response);
                }, (error)=> {
                    errorMethod(error);
                });
            }


        } else {
            // if (AndroidNativeApi.tcpRequest) {
            //     let data = JSON.stringify(params)
            //     AndroidNativeApi.tcpRequest(data, (res)=> {
            //         let response = JSON.parse(res);
            //         response = YFWHandleRequest.handleResponse(response);
            //         returnValue(response);
            //     }, (error)=> {
            //         errorMethod(JSON.parse(error));
            //     })
            // }

        }

    }


    //扫一扫
    static openSaoyisao(returnBlock) {
        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.openSaoyisao) {
                YFWBridgeManager.openSaoyisao(YFWUserInfoManager.defaultProps.isRequestTCP, (error, events) => {
                    if (error) {
                        console.error(error);
                    } else {
                        returnBlock(events);
                    }
                })
            }


        } else {
            if (AndroidNativeApi.startActivityForResult) {
                AndroidNativeApi.startActivityForResult((result)=> {
                    returnBlock(result)
                });
            }

        }

    }

    //三方登录
    static openThirdLogin(type, returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.openThirdLogin) {
                YFWBridgeManager.openThirdLogin(type, (info)=> {
                    returnBlock(info);
                });
            }


        } else {
            if (AndroidNativeApi.startLoginQQ) {
                AndroidNativeApi.startLoginQQ(type);
            }

        }


    }

    static shareSMS(text) {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.sendMessageWithRecipients) {
                YFWBridgeManager.sendMessageWithRecipients([],text)
            }

        } else {
            if (AndroidNativeApi.shareSMS) {
                AndroidNativeApi.shareSMS(text)
            }

        }
    }

    //分享功能
    static shareWithUmeng(type, data, returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.shareWithUmeng) {
                YFWBridgeManager.shareWithUmeng(type, data, ()=> {
                    returnBlock();
                });
            }


        } else {
            if (AndroidNativeApi.chooseShareClient) {
                AndroidNativeApi.chooseShareClient(type, JSON.stringify(data))
            }

        }

    }


    //第三方支付
    static openPayment(data, type, returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.openPayment) {
                YFWBridgeManager.openPayment(data, type, YFWUserInfoManager.defaultProps.isRequestTCP, ()=> {
                    returnBlock();
                });
            }


        } else {
            if (AndroidNativeApi.requsetPayment) {
                AndroidNativeApi.requsetPayment(JSON.stringify(data), type, YFWUserInfoManager.defaultProps.isRequestTCP);
            }

        }

    }

    //智齿客服
    static openZCSobot(data) {

        let ssid = YFWUserInfoManager.ShareInstance().getSsid();
        if (isNotEmpty(ssid)) {

            if (Platform.OS == 'ios') {

                if (isEmpty(data)) {
                    data = {};
                }

                if (YFWBridgeManager.openZCSobot) {
                    YFWBridgeManager.openZCSobot(data, ssid);
                }


            } else {

                if (AndroidNativeApi.startZhichiCustomer) {
                    AndroidNativeApi.startZhichiCustomer()
                }

            }

        }

    }


    //获取定位地址
    static getLocationAddress(returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.getLocationAddress) {
                YFWBridgeManager.getLocationAddress((address)=> {
                    returnBlock(address);
                });
            }


        } else {

            if (AndroidNativeApi.startLocationWithCallback) {
                AndroidNativeApi.startLocationWithCallback(
                    (address)=> {
                        let locationData = JSON.parse(address);
                        returnBlock(locationData);
                    },
                    (errorMessage)=> {
                    }
                )
            }

        }

    }


    //获取经纬度信息
    static getLongitudeAndLatitude(returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.getLongitudeAndLatitude) {
                YFWBridgeManager.getLongitudeAndLatitude((data)=> {
                    returnBlock(data);
                });
            }

        } else {

            if (AndroidNativeApi.getLoccation) {
                AndroidNativeApi.getLoccation((data)=> {
                    let locationData = JSON.parse(data);
                    returnBlock(locationData);
                }, (error)=> {
                })
            }

        }

    }


    //跳转地图页面
    static jumpToMapActivity(data, returnBlock) {

        if (Platform.OS == 'ios') {

            let info = {data: data};

            if (YFWBridgeManager.jumpToMapActivity) {
                YFWBridgeManager.jumpToMapActivity(info, YFWUserInfoManager.defaultProps.isRequestTCP, (info)=> {
                    returnBlock(info);
                });
            }


        }

    }


    //跳转重新定位页面
    static jumpToChooseAddress() {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.chooseAddress) {
                YFWBridgeManager.chooseAddress();
            }


        } else {
            if (AndroidNativeApi.chooseAddress) {
                AndroidNativeApi.chooseAddress();
            }

        }

    }

    //分享海报及价格趋势
    static sharePoster(type, param, returnBlock) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.sharePoster) {
                AndroidNativeApi.sharePoster(type, param.image)
            }

        } else {
            if (YFWBridgeManager.shareWithPicUmeng) {
                YFWBridgeManager.shareWithPicUmeng(type, param, ()=> {
                    returnBlock();
                });
            }

        }
    }

    //拷贝链接
    static copyLink(url) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.copyLink) {
                YFWBridgeManager.copyLink(url);
            }


        } else {
            if (AndroidNativeApi.shareCopy) {
                AndroidNativeApi.shareCopy(url)
            }

        }


    }

    //读取剪切板内容
    static getPasteboardString(callBack) {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.getPasteboardString) {
                YFWBridgeManager.getPasteboardString((stringFromClipboard)=>{
                    callBack&&callBack(stringFromClipboard)
                });
            }
        } else {
            if (AndroidNativeApi.getPasteboardString) {
                AndroidNativeApi.getPasteboardString((stringFromClipboard)=>{
                    callBack&&callBack(stringFromClipboard)
                })
            }
        }
    }

    //下载图片
    static copyImage(url,action) {


        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.copyImage) {
                YFWBridgeManager.copyImage(url);
            }


        } else {

            if (AndroidNativeApi.savePic) {
                AndroidNativeApi.savePic(url,action)
            }

        }

    }

    //获取缓存大小
    static getCacheSize(returnBlock) {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.getCacheSize) {
                YFWBridgeManager.getCacheSize((info)=> {
                    returnBlock(info);
                });
            }

        } else {

            if (AndroidNativeApi.getCacheSize) {
                AndroidNativeApi.getCacheSize((info)=> {
                    returnBlock(info);
                });
            }

        }

    }


    //清除缓存
    static clearCache(returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.clearCache) {
                YFWBridgeManager.clearCache((info)=> {
                    returnBlock(info);
                });
            }

        } else {
            if (AndroidNativeApi.clearCache) {
                AndroidNativeApi.clearCache((info)=> {
                    returnBlock(info);
                })
            }

        }

    }


    //存储SSid
    static saveSsid_native(ssid) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.saveSsid) {
                YFWBridgeManager.saveSsid(ssid);
            }

        } else {

            if (AndroidNativeApi.saveSsid) {
                AndroidNativeApi.saveSsid(ssid);
            }

        }

    }


    //获取App基础信息
    static getAppConfig(returnBlock) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.getAppConfig) {
                YFWBridgeManager.getAppConfig((info)=> {
                    returnBlock(info);
                });
            }


        } else {

            if (AndroidNativeApi.getAppConfig) {
                AndroidNativeApi.getAppConfig((info)=> {
                    returnBlock(JSON.parse(info));
                })
            }

        }

    }
    //存储yfwID
    static setKeychainYFWID(ID) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.setKeychainYFWID) {
                YFWBridgeManager.setKeychainYFWID(ID);
            }
        } else {
            // if (AndroidNativeApi.getAppConfig) {
            //     AndroidNativeApi.getAppConfig((info)=> {
            //         returnBlock(JSON.parse(info));
            //     })
            // }
        }
    }
    //获取yfwID
    static getKeychainYFWID(returnBlock) {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.getKeychainYFWID) {
                YFWBridgeManager.getKeychainYFWID((info)=> {
                    returnBlock(info);
                });
            }
        } else {
            // if (AndroidNativeApi.getAppConfig) {
            //     AndroidNativeApi.getAppConfig((info)=> {
            //         returnBlock(JSON.parse(info));
            //     })
            // }
        }
    }

    static setSystemConfigInfo(info) {
        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.setSystemConfigInfo) {
                YFWBridgeManager.setSystemConfigInfo(info);
            }


        } else {

            if (AndroidNativeApi.setSystemConfigInfo) {
                AndroidNativeApi.setSystemConfigInfo(info)
            }

        }
    }


    static mobClick(title) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.mobClick) {
                YFWBridgeManager.mobClick(title);
            }


        } else {

            if (AndroidNativeApi.mobClick) {
                AndroidNativeApi.mobClick(title)
            }

        }

    }

    static takePhone(number) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.takePhone) {
                AndroidNativeApi.takePhone(number)
            }

        } else {
            if (YFWBridgeManager.takePhone) {
                YFWBridgeManager.takePhone(number);
            }

        }


    }


    static registBaiduManager() {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.registBaiduManager) {
                YFWBridgeManager.registBaiduManager();
            }

        } else {


        }

    }

    /**
     * 跳转价格趋势
     * @param ssid
     * @param goodsId
     */
    static startChart(ssid, goodsId) {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.startChart) {
                YFWBridgeManager.startChart(ssid, goodsId, YFWUserInfoManager.defaultProps.isRequestTCP ? 'true' : 'false');
            }

        } else {

            if (AndroidNativeApi.startChart) {
                AndroidNativeApi.startChart(ssid, goodsId, YFWUserInfoManager.defaultProps.isRequestTCP ? true : false)
            }

        }
    }

    static removeVC() {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.removeVC) {
                YFWBridgeManager.removeVC();
            }

        } else {


        }
    }


    static backChange() {


        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.backChange) {
                YFWBridgeManager.backChange();
            }

        } else {


        }

    }
    /* The name of the transition. Current legal transition types include
   * `fade', `moveIn', `push' and `reveal'. Defaults to `fade'. */
    static showTransitionAnimationWithType(type) {
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.showTransitionAnimationWithType) {
                YFWBridgeManager.showTransitionAnimationWithType(type)
            }
        }
    }

    static closeSplashImage() {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.changeNavigation) {
                YFWBridgeManager.changeNavigation();
            }else {
                if (YFWBridgeManager.closeSplashImage) {
                    YFWBridgeManager.closeSplashImage();
                }
            }

        } else {


        }

    }


    //关闭程序
    static exit() {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.exit) {
                YFWBridgeManager.exit();
            }

        } else {

            if (AndroidNativeApi.exit) {
                AndroidNativeApi.exit()
            }

        }

    }

    //一键登录预取号
    static isOneLoginPreGetTokenSuccess(getResult,errorCallback){
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.isOneLoginPreGetTokenSuccess) {
                AndroidNativeApi.isOneLoginPreGetTokenSuccess((result)=>{
                    getResult(result)
                })
            } else {
                if (errorCallback) {
                    errorCallback()
                }
            }
        } else {
            if (YFWBridgeManager.isOneLoginPreGetTokenSuccess) {
                YFWBridgeManager.isOneLoginPreGetTokenSuccess((result)=>{
                    getResult(result)
                });
            } else {
                if (errorCallback) {
                    errorCallback()
                }
            }
        }
    }

    //一键登录
    static oneLogin(isLoginToUserCenter, successCallback, errorCallback) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.oneLogin) {
                AndroidNativeApi.oneLogin(isLoginToUserCenter, (result)=>{
                    let res = JSON.parse(result)
                    if(res.code == 1) {
                        let userInfo = YFWUserInfoManager.ShareInstance();
                        userInfo.setSsid(safe(res.ssid));//ssid传入一个死值
                        DeviceEventEmitter.emit('UserLoginSucess');
                        mobClick('oneLogin login-submit')
                        setItem(LOGIN_TOKEN,safe(res.result.login_token))
                        successCallback(res)
                    } else if (res.code == -100) {
                        DeviceEventEmitter.emit(kLoginCloseAccountKey,res.msg,()=>{})
                    } else {
                        YFWToast("一键登录失败,请切换登录方式")
                    }
                },(error)=>{
                    errorCallback(JSON.parse(error))
                })
            }
        }else{
            if (YFWBridgeManager.oneLogin) {
                YFWBridgeManager.oneLogin(isLoginToUserCenter,(res)=>{
                    if(res.code == 1) {
                        let userInfo = YFWUserInfoManager.ShareInstance();
                        userInfo.setSsid(safe(res.ssid));//ssid传入一个死值
                        DeviceEventEmitter.emit('UserLoginSucess');
                        mobClick('oneLogin login-submit')
                        setItem(LOGIN_TOKEN,safe(res.result.login_token))
                        successCallback(res)
                    } else if (res.code == -100) {
                        DeviceEventEmitter.emit(kLoginCloseAccountKey,res.msg,()=>{})
                    } else {
                        YFWToast("一键登录失败,请切换登录方式")
                    }
                },(error)=>{
                    errorCallback(error)
                });
            }
        }

    }

    static getStatusBarHeight(returnValue) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.getStatusBarHeight) {
                AndroidNativeApi.getStatusBarHeight((value)=> {
                    returnValue(value)
                })
            }

        }
    }

    static showToast(msg) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.showToast) {
                AndroidNativeApi.showToast(msg)
            }

        }
    }

    /*
     *  手机浏览器 打开指定网站
     * */
    static weakUpBrowser(url) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.weakUpBrowser) {
                AndroidNativeApi.weakUpBrowser(url)
            }
        } else {
            if (YFWBridgeManager.applicationOpenURL) {
                YFWBridgeManager.applicationOpenURL(url)
            }
        }
    }


    /**
     * TCP上传图片
     * @param path
     * @param successCallback
     * @param callback
     */
    static tcpUploadImg(path, successCallback, callback,diskId) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.tcpUploadImg) {
                if(diskId){
                    AndroidNativeApi.tcpUploadRXImg(path, diskId,(res)=> {
                        res = spliceImagePath(res)
                        successCallback && successCallback(res)
                    }, (error)=> {
                        callback && callback(safeObj(error).msg)
                    })
                }else{
                    AndroidNativeApi.tcpUploadImg(path, (res)=> {
                        console.log(res);
                        res = spliceImagePath(res)
                        successCallback && successCallback(res)
                    }, (error)=> {
                        console.log(error);
                        callback && callback(JSON.parse(safeObj(error)).msg)
                    })
                }
            }

        } else {
            if (YFWBridgeManager.tcpUploadImg) {
                if(diskId){
                    YFWBridgeManager.tcpUploadRXImg(path,diskId,(res)=> {
                        res = spliceImagePath(res)
                        successCallback && successCallback(res)
                    }, (error)=> {
                        callback && callback(safeObj(error).msg)
                    });
                }else{
                    YFWBridgeManager.tcpUploadImg(path, (res)=> {
                        res = spliceImagePath(res)
                        successCallback && successCallback(res)
                    }, (error)=> {
                        callback && callback(safeObj(error).msg)
                    });
                }
            }

        }
    }

    static nearlyShop() {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.startNative) {
                AndroidNativeApi.startNative()
            }

        }
    }

    static reactBack() {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.reactBack) {
                AndroidNativeApi.reactBack();
            }

        }
    }

    static showFullAdWithInfo(info,callBack){
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.showFullAdWithInfo) {
                YFWBridgeManager.showFullAdWithInfo(info,callBack)
            }
        }
    }

    /**
     *崩溃日志记录开关
     */
    static uploadExceptionMessageLog(switchStatus){
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.uploadExceptionMessageSwitch) {
                YFWBridgeManager.uploadExceptionMessageSwitch(switchStatus)
            }
        } else {
            if (AndroidNativeApi.uploadExceptionMessageLog) {
                AndroidNativeApi.uploadExceptionMessageLog(switchStatus)
            }
        }
    }


    /**
     * 切换TCP 请求环境
     * **/

    static changeRequest(is_tcp) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.requestChangeToTCP) {
                YFWBridgeManager.requestChangeToTCP(is_tcp);
            }

        } else {

            if (AndroidNativeApi.changeHotUpdateType) {
                if (is_tcp) {
                    AndroidNativeApi.changeHotUpdateType('tcp')
                } else {
                    AndroidNativeApi.changeHotUpdateType('http')
                }
            }

        }

    }


    /**
     * 是否开启定位
     * */
    static isLocationServiceOpen(call) {

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.isLocationServiceOpen) {
                YFWBridgeManager.isLocationServiceOpen((is_open)=> {
                    if (call) call(is_open == 'true');
                });
            }

        } else {

            if (AndroidNativeApi.isLocationServiceOpen) {
                AndroidNativeApi.isLocationServiceOpen(call);
            }

        }
    }

    /**
     * 打开定位
     */
    static openLocation() {
        if (Platform.OS == 'ios') {
            this.openSetting('location')
        } else {
            if (AndroidNativeApi.openLocation) {
                AndroidNativeApi.openLocation();
            }

        }
    }

    /**
     * 手动定位地址获取经纬度
     */
    static getGeoCodeResult(city, address, callback) {
        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.getGeoCodeResult) {
                YFWBridgeManager.getGeoCodeResult(city, address, (res)=> {
                    callback(res)
                });
            }

        } else {
            AndroidNativeApi.getGeoCodeResult(city, address,(result)=>{
                callback(JSON.parse(result))
            });
        }
    }

    /**
     * 获取经纬度对应的城市地址
     */
    static getGeoReverseCodeResult(longitude, latitude, callback) {
        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.getGeoReverseCodeResult) {
                YFWBridgeManager.getGeoReverseCodeResult(longitude, latitude, (res)=> {
                    callback(res)
                });
            }

        } else {
            if(AndroidNativeApi.getGeoReverseCodeResult){
                AndroidNativeApi.getGeoReverseCodeResult(longitude, latitude,(result)=>{
                    callback(JSON.parse(result))
                });
            }
        }
    }

    /**
     * 传域名
     * */
    static changeDomain(domain) {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.changeYfwDomain) {
                YFWBridgeManager.changeYfwDomain(domain);
            }

        } else {
            if (AndroidNativeApi.changeDomain) {
                AndroidNativeApi.changeDomain(domain)
            }
        }

    }


    /**
    *   获取scheme_url
    * */

    static get_schemeUrl(callBack){

        if (Platform.OS == 'ios'){

            if (YFWBridgeManager.get_schemeURL){

                YFWBridgeManager.get_schemeURL((url)=>{
                    callBack(url);
                });

            }

        }

    }

    /**
     *   获取支付结果 dic
     * */
    static get_payInfoDic(callBack){

        if (Platform.OS == 'ios'){

            if (YFWBridgeManager.get_payInfoDic){
                YFWBridgeManager.get_payInfoDic((dic)=>{
                    callBack(dic);
                });
            }
        }
    }

    /**
     *   获取推送 dic
     * */

    static get_notificationDic(callBack){

        if (Platform.OS == 'ios'){

            if (YFWBridgeManager.get_notificationDic){

                YFWBridgeManager.get_notificationDic((dic)=>{
                    callBack(dic);
                });

            }

        }

    }
    /**
     *   获取3d touch dic
     * */

    static get_3dTouchDic(callBack){

        if (Platform.OS == 'ios'){

            if (YFWBridgeManager.get_3dTouchDic){

                YFWBridgeManager.get_3dTouchDic((dic)=>{
                    callBack(dic);
                });

            }

        }

    }
    /**
     *   更新地址
     * */

    static appUpdatingLocation(){

        if (Platform.OS == 'ios'){

            if (YFWBridgeManager.appUpdatingLocation){

                YFWBridgeManager.appUpdatingLocation();

            }

        }

    }


    /**
     * 下载APP
     * @param res
     */
    static downloadApk(res) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.showUploadDialog) {
                AndroidNativeApi.showUploadDialog(JSON.stringify(res), YFWUserInfoManager.defaultProps.isRequestTCP)
            }

        }
    }

    static startH5(data) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.startH5) {
                AndroidNativeApi.startH5(JSON.stringify(data))
            }

        }
    }


    static getFindCode() {

        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.getFindCode) {
                YFWBridgeManager.getFindCode();
            }

        }

    }

    static setCdnAndport(data) {
        if (Platform.OS == 'android') {
            if (AndroidNativeApi.setCdnAndport) {
                AndroidNativeApi.setCdnAndport(JSON.stringify(safeObj(data)))
            }

        } else {

            if (YFWBridgeManager.setCdnAndport) {
                YFWBridgeManager.setCdnAndport(safeObj(data))
            }

        }


    }


    static saveVersionCode(){
        if(Platform.OS == 'android'){
            if(AndroidNativeApi.saveVersionCode){
                AndroidNativeApi.saveVersionCode()
            }
        }
    }


    /*
    *  检测用户是否安装微信
    * */
    static checkUserHaveInstallWX(callBack){
        if(Platform.OS == 'android'){
            if(AndroidNativeApi.checkUserHaveInstallWX){
                AndroidNativeApi.checkUserHaveInstallWX((bool)=>{
                    callBack(bool)
                })
            }
        }else {
            if (YFWBridgeManager.checkUserHaveInstallWX) {
                YFWBridgeManager.checkUserHaveInstallWX((isInstall)=>{callBack(isInstall)});
            } else {
                callBack(true)
            }
        }
    }

    /*
    *  获取 app被推送唤醒时的数据
    * */
    static getReceiveJpushData(callBack){
        if(Platform.OS == 'android'){
            if(AndroidNativeApi.getReceiveJpushData){
                AndroidNativeApi.getReceiveJpushData((data)=>{
                    callBack(data)
                })
            }
        }
    }

    /*
    *  跳转原生地址切换页
    * */
    static changeTcpHost(){
        if (Platform.OS == 'ios') {

            if (YFWBridgeManager.changeTcpHost) {
                YFWBridgeManager.changeTcpHost();
            }

        }else {
            if(AndroidNativeApi.changeTcpHost){
                AndroidNativeApi.changeTcpHost();
            }
        }
    }

    /*
    *  保存当前页面信息到原生用于崩溃信息
    * */
    static saveCurrentRouteName(category){

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.saveCurrentRouteName) {
                YFWBridgeManager.saveCurrentRouteName(category)
            }

        }else {
            if(AndroidNativeApi.saveCurrentRouteName){
                AndroidNativeApi.saveCurrentRouteName(category);
            }
        }
    }

    /*
    *  “点击前往” （地图导航）原生跳转方法。//测试数据'31.250098', '121.62799', '上海市浦东新区金豫路825号211室'
    * */
    static goToRoutePlanning(lat, lng, address){

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.jumpThirdMap) {
                YFWBridgeManager.jumpThirdMap(lat,lng,address);
            }
        }else {
            if(AndroidNativeApi.goToRoutePlanning){
                AndroidNativeApi.goToRoutePlanning(lat, lng, address);
            }
        }
    }

    /** 获取经纬度附近POI*/
    static getPOINearby(){

        if (Platform.OS == 'ios') {
            return new Promise((resolve,reject)=>{
                if (YFWBridgeManager.getPOINearby) {
                    YFWBridgeManager.getPOINearby((infos)=>{resolve({poiList:infos})})
                } else {
                    reject('')
                }
            })
        }else {
            if(AndroidNativeApi.getPOINearby){
                return AndroidNativeApi.getPOINearby();
            }
        }
    }

    /** 当前城市POI检索*/
    static getSearchPOIInCity(city, keyword){

        if (Platform.OS == 'ios') {
            return new Promise((resolve,reject)=>{
                if (YFWBridgeManager.getSearchPOIInCity) {
                    YFWBridgeManager.getSearchPOIInCity(city,keyword,(infos)=>{resolve({poiList:infos})})
                } else {
                    reject('')
                }
            })
        }else {
            if(AndroidNativeApi.getSearchPOIInCity){
                return AndroidNativeApi.getSearchPOIInCity(city, keyword);
            }
        }
    }

    /** 当释放POI检索*/
    static destroyPOI(){

        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.destroyPOI) {
                YFWBridgeManager.destroyPOI()
            }
        }else {
            if(AndroidNativeApi.destroyPOI){
                AndroidNativeApi.destroyPOI();
            }
        }
    }

    static saveJPushID(jpushID){
        if (Platform.OS == 'ios') {

        }else {
            if(AndroidNativeApi.saveJPushID){
                AndroidNativeApi.saveJPushID(jpushID);
            }
        }
    }
}
