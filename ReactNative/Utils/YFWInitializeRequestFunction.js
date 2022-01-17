import React from 'react';
import {DeviceEventEmitter, Platform,Alert} from 'react-native'
import YFWRequestViewModel from "./YFWRequestViewModel";
import {log, logWarm} from './YFWLog'
import {
    getItem,
    kIsFirstLoadLaunchKey,
    kIsShowLaunchViewKey,
    LOGIN_TOKEN,
    setItem, removeItem,ThisOpenEvaluation, ThisOpenEvaluationVersion, kIsShowPermissionsViewKey, kAccountKey, kWDAccountKey
} from "./YFWStorage";
import {formatDateTime, mapToJson, mobClick, safe, safeObj, isIphoneX, haslogin, deepCopyObj, safeNumber, extractingImge, tcpImage, isArray, isValidDate} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "./YFWNativeManager";
import YFWCategoryModel from "../FindYao/Model/YFWCategoryModel";
import YFWUserInfoManager from "./YFWUserInfoManager";
import {isNotEmpty, alertLogic, isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {pushNavigation,clearSessionForSession,clearSessionForLaunch,doAfterLogin, doAfterLoginWithCallBack} from "./YFWJumpRouting";
import YFWVersionUpdateModel from "./Model/YFWVersionUpdateModel";
import YFWConfig from '../config/YFWConfig';
import { pushWDNavigation, kRoute_html } from '../WholesaleDrug/YFWWDJumpRouting';
import YFWToast from "./YFWToast";
import FastImage from 'react-native-fast-image';
// import CookieManager from '@react-native-community/cookies';


let request_again_systemConfig = 0;

export function YFWInitializeRequestFunction() {
    //利用token刷新ssid后才允许调用 person相关的接口
    tokenLogin((isSuccessUpdate)=>{
        if (isSuccessUpdate !== 'refreshed') {
            fetchAllInitDataFromServer()
            sysConfigOpenNotification();
            requestAdvertData();
            configPingJia();
            requestUpdateInfo();
            get_ip();
            uploadExceptionMessageLog();
        }

        if (isSuccessUpdate || isSuccessUpdate == 'refreshed') {
            getShopCarNum();
            requestHasBlindMobile();
            refreshMessageRedPoint();
        }
    })
}

//版本更新接口
export function requestUpdateInfo() {
    getItem(kIsShowLaunchViewKey).then((id)=> {
        if (id) {
            YFWNativeManager.getVersionNum((value)=> {

                let paramMap = new Map();
                let viewModel = new YFWRequestViewModel();
                paramMap.set('__cmd', 'guest.common.app.checkUpdate');
                paramMap.set('version', YFWUserInfoManager.ShareInstance().version.replace(/\./g,""));
                paramMap.set('os', Platform.OS);

                viewModel.TCPRequest(paramMap, (res)=> {
                    let model = YFWVersionUpdateModel.getModelWithData(res.result);
                    YFWUserInfoManager.ShareInstance().updateInfo = model
                    try {
                        if(Platform.OS == 'ios'){
                            if (model.isForceUpdate == '1' || model.isNeedUpdate == '1') {
                                DeviceEventEmitter.emit('OpenVersionUpdateAlertView', model);
                            }
                        }else{
                            if(parseInt(model.new_version.replace(/\./g,'')) > parseInt(YFWUserInfoManager.ShareInstance().version.replace(/\./g,''))){
                                YFWNativeManager.downloadApk(res.result)
                            }
                        }
                    }catch (e) {}
                },(error)=>{
                    let e = error
                },false);

            });
        }
    });
}

function uploadExceptionMessageLog(){
    YFWNativeManager.uploadExceptionMessageLog(YFWConfig.ShareConfig().uploadErrorLogSwitch)
}

/**
 * 刷新消息红点
 **/
export function refreshMessageRedPoint(){
    let userInfo = YFWUserInfoManager.ShareInstance();
    if (userInfo.hasLogin()) {

        let paramMap = new Map();
        paramMap.set('__cmd', 'person.message.getNotReadCount');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if(!YFWUserInfoManager.ShareInstance().hasLogin()){
                return
            }
            let userInfo = YFWUserInfoManager.ShareInstance();
            if(isEmpty(res.result)){
                return
            }
            userInfo.messageRedPointVisible = res.result>0?'true':'false';
            DeviceEventEmitter.emit('ALL_MESSAGE_RED_POINT_STATUS',res.result)
        },(error)=>{},false);

    }
}
/**
 * 刷新消息红点
 **/
export function refreshWDMessageRedPoint(){
    let userInfo = YFWUserInfoManager.ShareInstance();
    if (userInfo.hasLogin()) {

        let paramMap = new Map();
        paramMap.set('__cmd', 'store.customerservice.sitemessage.getNotReadCount');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if(!YFWUserInfoManager.ShareInstance().hasLogin()){
                return
            }
            let userInfo = YFWUserInfoManager.ShareInstance();
            if(isEmpty(res.result)){
                return
            }
            userInfo.messageRedPointVisible = res.result>0?'true':'false';
            DeviceEventEmitter.emit('WD_ALL_MESSAGE_RED_POINT_STATUS',res.result)
        },(error)=>{},false);

    }
}

/*
*  获取购物车商品数量
* */
function getShopCarNum(){
    getItem(kIsShowLaunchViewKey).then((id)=> {
        if (id) {
            refreshRedPoint();
        }
    })
}

export async function refreshRedPoint() {
    if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            return
    }
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.cart.getCartCount');
    let viewModel = new YFWRequestViewModel();
    viewModel.TCPRequest(paramMap, (res) => {
        if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            return
        }
        if (parseInt(safeObj(res.result).cartCount) >= 0) {
            let userInfo = new YFWUserInfoManager();
            userInfo.shopCarNum = res.result.cartCount;
            DeviceEventEmitter.emit('SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
        }

    },(error)=>{},false);
}
export async function refreshOTORedPoint() {
    return new Promise((resolve,reject)=>{
        if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            reject()
            return
        }
        let o2o_show = YFWUserInfoManager.ShareInstance().getSystemConfig().o2o_show
        if (parseInt(o2o_show) == 0) {
            reject()
            DeviceEventEmitter.emit('OTO_SHOPCAR_NUMTIPS_RED_POINT', '0');
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.carto2o.getCartCount');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if(!YFWUserInfoManager.ShareInstance().hasLogin()){
                reject()
                return
            }
            let cartCount = safeObj(res.result).cartCount
            if (parseInt(cartCount) >= 0) {
                let userInfo = new YFWUserInfoManager();
                userInfo.otoShopCarNum = cartCount;
                DeviceEventEmitter.emit('OTO_SHOPCAR_NUMTIPS_RED_POINT', cartCount);
                resolve(cartCount)
            } else {
                reject()
            }
        },(error)=>{reject()},false);
    })
}
export async function refreshWDRedPoint(callBack) {
    if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            return
    }
    let paramMap = new Map();
    paramMap.set('__cmd', 'store.buy.cart.getCartCount');
    let viewModel = new YFWRequestViewModel();
    viewModel.TCPRequest(paramMap, (res) => {
        if (callBack) {
            callBack(res)
        }
        if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            return
        }
        if (parseInt(safeObj(res.result).cartCount) >= 0) {
            let userInfo = new YFWUserInfoManager();
            userInfo.wdshopCarNum = res.result.cartCount;
            DeviceEventEmitter.emit('WD_SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
        }

    },(error)=>{},false);
}

async function fetchAllInitDataFromServer(){
    let paramMap = new Map();
    // paramMap.set('__cmd', 'guest.common.app.getSystemConfig')
    let cmd = 'guest.common.app.getSystemConfig as getSystemConfig'
    // paramMap.set('__cmd', 'guest.common.app.getFullAd')
    cmd += ',guest.common.app.getFullAd as getFullAd'
    // paramMap.set('deviceName',  (Platform.OS === 'ios'?isIphoneX()?'X':'N':'A'))
    paramMap.set('getFullAd',{deviceName:(Platform.OS === 'ios'?isIphoneX()?'X':'N':'A')})
    // paramMap.set('__cmd', 'guest.category.getCategoryList');
    cmd += ',guest.category.getCategoryList as getCategoryList'
    paramMap.set('__cmd', cmd)
    let viewModel = new YFWRequestViewModel();
    viewModel.TCPRequest(paramMap, (res)=> {
        console.log(res)
        let getSystemConfig = res.result.getSystemConfig
        if (getSystemConfig) {
            dealSystemConfig(getSystemConfig)
        } else {
            sysConfigRequest();
        }
        let getFullAd = res.result.getFullAd
        if (getFullAd) {

            if (isNotEmpty(getFullAd)) {
                let data = getFullAd.items;
                if (data.length > 0) {
                    canShowAds(getFullAd);
                }else{
                    removeItem('FullAdsCasheData')
                }
            }
        }

        let getCategoryList = res.result.getCategoryList
        if (getCategoryList) {
            //#图片预加载# 加载首屏图片
            if (isArray(getCategoryList) && isArray(getCategoryList[0].items)) {
                let imagesArray = getCategoryList[0].items.slice(0,3)
                imagesArray = extractingImge(imagesArray)
                imagesArray = imagesArray.map((img)=>{
                    img = safe(img).includes('gif')?img:tcpImage(img)
                    return {uri:img}
                })
                //分类广告位图
                for (let index = 0; index < getCategoryList.length;index++) {
                    let element = getCategoryList[index];
                    if (isArray(element.app_category_ad) && element.app_category_ad.length > 0 && isNotEmpty(element.app_category_ad[0].img_url)) {
                        imagesArray.push({uri:element.app_category_ad[0].img_url})
                    }
                }
                FastImage.preload(imagesArray)
            }
            YFWCategoryModel.getModelArray(getCategoryList)
        }


    },(error)=>{},false);
}

//全局配置接口
export async function sysConfigRequest() {

    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.getSystemConfig');
    let viewModel = new YFWRequestViewModel();
    viewModel.TCPRequest(paramMap, (res)=> {
        let data = res.result;
        dealSystemConfig(data)
    },(error)=>{

        if (request_again_systemConfig == 3){

        } else {
            request_again_systemConfig ++;
            sysConfigRequest();
        }

    },false);

}
function dealSystemConfig(data) {
    if (isEmpty(data)) {
        return
    }
    if (data.app_audit_version && data.app_audit_version.indexOf('.') == -1) {
        data.app_audit_version = data.app_audit_version.substr(0,1) + '.' + data.app_audit_version.substr(1,1) + '.' + data.app_audit_version.substr(2)
    }
    let userInfo = YFWUserInfoManager.ShareInstance();
    userInfo.setSystemConfig(data);
    DeviceEventEmitter.emit('InviteViewData', {value: safeObj(data.ads_item)})
    DeviceEventEmitter.emit('kSystemConfigChangeNotification',data)
    DeviceEventEmitter.emit('ShowInviteView',{value:true});
    DeviceEventEmitter.emit('ko2o_show',data.o2o_show)
    logWarm(data);
}
//打开消息通知权限
function sysConfigOpenNotification() {
    alertLogic().then((isShow) => {
        if (isShow){
            YFWNativeManager.isOpenNotification((openStatus)=>{
                if (openStatus) {
                    return
                }
                setTimeout(
                    ()=> {
                        DeviceEventEmitter.emit('OpenNotificationAlertView')
                    },
                    1000 * 3 * 60
                )
            })
        }
    })
}

function canShowAds(res) {

    let is_show = res.is_show;
    let show_count = res.show_count;
    let item = {};

    let data = res.items;
    if (data.length > 0){
        item = data[0];
    }
    let imageSource = item.img_url;
    // Image.getSize(imageSource, (w, h) => {});
    if (String(is_show) == 'true'){

        getItem('AdvertPageData').then((param)=> {

            let save_count = 0;
            if (param){
                let save_time = param.time;
                if (formatDateTime() == save_time){
                    save_count = param.count;
                }
            }

            if (save_count < Number.parseInt(show_count)) {
                setItem('AdvertPageData',{time:formatDateTime(),count:save_count+1})
                setItem('FullAdsCasheData',{data:item,second:res.time_second,is_show:res.is_show})
            }else {
                removeItem('FullAdsCasheData')
            }

        });
    }
}


//广告弹出框
async function requestAdvertData() {
    getItem('isShowAdvertView').then((id)=> {

        //TCP请求逻辑
        if(YFWUserInfoManager.defaultProps.isRequestTCP){
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'guest.common.app.getIndexPopupAds');
            paramMap.set('first_login', id?'false':'true');
            viewModel.TCPRequest(paramMap, (res)=> {
                if(res && res.code+'' === '1'){
                    DeviceEventEmitter.emit('OpenAdvertView', res.result);

                }
            },(error)=>{},false);
        }

        setItem('isShowAdvertView', 'false');
    });
}

//是否显示引导页
export function configLaunchView(doanBlock) {
    getItem(kIsShowLaunchViewKey).then((id)=> {
        if (id) {
            setItem(kIsFirstLoadLaunchKey,'false');
        } else {
            setItem(kIsShowLaunchViewKey, 'false');
            setItem(kIsFirstLoadLaunchKey,'true');
        }
        doanBlock(id);
    });
}
//是否显示权限说明页
export function configPermissionsView(doanBlock) {
    getItem(kIsShowPermissionsViewKey).then((id)=> {
        doanBlock(id);
    });
}
//是否显示评价
async function configPingJia() {
    YFWNativeManager.getVersionNum((value)=>{
        getItem(ThisOpenEvaluationVersion).then((version)=>{
            if (version != value){
                setItem(ThisOpenEvaluationVersion,value);
                setItem(ThisOpenEvaluation,0);
            }
        })
    })

    // let paramMap = new Map();
    // paramMap.set('__cmd', 'guest.common.app.getIsShowEvaluate');
    // let viewModel = new YFWRequestViewModel();
    // viewModel.TCPRequest(paramMap, (res)=> {
    //     let data = res.result.isShow;
    //     if (data == 1) {
            // setTimeout(
            //     ()=> {
            //         DeviceEventEmitter.emit('OpenRateView');
            //     },
            //     1000 * 3 * 60
            // )

        // }

    // },null,false);

}

//定位
function requestInitLocation() {

    YFWNativeManager.getPosition();

}


//获取App 详情信息
export function getAppConfig(returnBlock) {
    YFWNativeManager.changeRequest(true);
    YFWNativeManager.getAppConfig((info)=> {
        YFWUserInfoManager.ShareInstance().setAppConfig(info);
        if (returnBlock) returnBlock();
    });
    YFWNativeManager.getLongitudeAndLatitude((data)=> {
        YFWUserInfoManager.ShareInstance().setApplocation(data);
    });

}

/**
 * 获取分类列表
 * @private
 */
async function getClassifyList() {

    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'guest.category.getCategoryList');
    viewModel.TCPRequest(paramMap, (res)=> {
        YFWCategoryModel.getModelArray(res.result);

    }, (error)=> {

    }, false);

}

/**
 * 提交推送设备信息
 */
export function postPushDeviceInfo() {
    if (YFWUserInfoManager.defaultProps.isRequestTCP) {
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
        paramMap.set("isPush",YFWUserInfoManager.ShareInstance().isPush)//是否开启推送
        paramMap.set("lat",YFWUserInfoManager.ShareInstance().latitude)//经度
        paramMap.set("lng",YFWUserInfoManager.ShareInstance().longitude)//维度
        paramMap.set("city",YFWUserInfoManager.ShareInstance().getCity())//城市名
        if (Platform.OS == 'ios'){
            paramMap.set("mfpushId",YFWUserInfoManager.ShareInstance().mfpushId);
        } else {
            paramMap.set("mfpushId",YFWUserInfoManager.ShareInstance().jpushId+(Math.floor(Math.random() * 10000 + 1)))//厂商推送ID，TODO android暂无配置厂商，现为极光推送+10000内随机数，IOS不需要
        }


        viewModel.TCPRequest(paramMap, (res)=> {}, (error)=> {}, false);
    }
}

/**
 * 提交统计信息 ，启动的时候
 */
export function postPushDeviceInfoByCountForLaunch() {
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
                paramMap.set("details",JSON.stringify(data['details']));


                viewModel.TCPRequest(paramMap, (res)=> {
                    if (res.code == '1') {
                        clearSessionForLaunch()
                    }
                }, (error)=> {}, false);


            }else{

            }

        })

    }
}

/**
 * 提交统计信息 一个会话内
 */
export function postPushDeviceInfoByCountForSession() {
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
                paramMap.set("details",JSON.stringify(data['details']));


                viewModel.TCPRequest(paramMap, (res)=> {
                    if (res.code == '1') {
                        clearSessionForSession()
                    }
                }, (error)=> {}, false);


            }else{

            }

        })

    }
}

/**
 * 根据城市中文名获取ID，比如上海市
 */
export function getCityRegionId(cityName){
    if (YFWUserInfoManager.defaultProps.isRequestTCP) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.sys_region.getModelByNameCn');
        paramMap.set("region_name",cityName)//系统类型，ios android
        viewModel.TCPRequest(paramMap, (res)=> {
            YFWUserInfoManager.ShareInstance().setRegionId(safeObj(safeObj(safeObj(res).result).id))
        }, (error)=> {

        }, false);
    }
}


/**
 * 签到赢积分
 * */
export const TYPE_SIGN_POINTS = 'sign' //签到
export const TYPE_SIGN_COUPON = 'coupon'//优惠券
export function getSignInData(navigate,type,originUrl) {
    if(isEmpty(type)){
        type = TYPE_SIGN_POINTS
    }
    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'person.app.getShareUrl');
    paramMap.set('type',type);
    isNotEmpty(originUrl) && paramMap.set('url',originUrl)
    viewModel.TCPRequest(paramMap, (res)=> {

        let result = res.result;
        if(result){
            if(type === TYPE_SIGN_POINTS){
                if (isNotEmpty(result.sign_url)) {
                    let value = safe(result.sign_url);
                    let share = safe(result.sign_share);
                    pushNavigation(navigate,{type:'get_h5',value:value,share:share,isHiddenShare:true,title:'签到赢积分页'})
                }
            }else if(type === TYPE_SIGN_COUPON){
                if (isNotEmpty(result.coupon_url)) {
                    pushNavigation(navigate,{type:'get_h5',value:safeObj(result.coupon_url),isHiddenShare:true,title:'领券中心',forceBackEnable:true})
                }
            }
        }

    },null,false);
}

export const TYPE_SIGN_WD_COUPON = 'coupon_ws'//优惠券
export function getWDSignInData(navigate,type) {
    if(isEmpty(type)){
        type = TYPE_SIGN_POINTS
    }
    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'store.buy.app.getShareUrl');
    paramMap.set('type',type);
    viewModel.TCPRequest(paramMap, (res)=> {
        let result = res.result;
        if(result){
            if(type === TYPE_SIGN_POINTS){
                if (isNotEmpty(result.sign_url)) {
                    let value = safe(result.sign_url);
                    let share = safe(result.sign_share);
                    pushWDNavigation(navigate,{type:'get_h5',value:value,share:share,isHiddenShare:true,title:'签到赢积分页'})
                }
            }else if(type === TYPE_SIGN_WD_COUPON){
                if (isNotEmpty(result.coupon_ws_url)) {
                    pushWDNavigation(navigate,{type:'get_h5',value:safeObj(result.coupon_ws_url),isHiddenShare:true,title:'领券中心',forceBackEnable:true})
                }
            }
        }

    },null,false);
}



export function getAuthUrlWithCallBack(badge,callBack) {
    let info = deepCopyObj(badge)
    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'person.app.getAuthUrl');
    paramMap.set('redirect_url',safeObj(safeObj(info).value));
    viewModel.TCPRequest(paramMap, (res)=> {
        if (info.hasJump) {
            return
        }
        if(res.code == '1'){
            if(isNotEmpty(safeObj(res.result).auth_url)){
                info.hasJump = true
                callBack&&callBack(res.result.auth_url)
            }
        }
    },(error)=>{
        if (info.hasJump) {
            return
        }
        info.hasJump = true
        callBack&&callBack(info.value)
    },false)
    setTimeout(() => {
        if (info.hasJump) {
            return
        } else {
            info.hasJump = true
            callBack&&callBack(info.value)
        }
    }, 3000);

}
export function getAuthUrl(navigate,badge) {
    let info = deepCopyObj(badge)
    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'person.app.getAuthUrl');
    paramMap.set('redirect_url',safeObj(safeObj(info).value));
    viewModel.TCPRequest(paramMap, (res)=> {
        if (info.hasJump) {
            return
        }
        if(res.code == '1'){
            if(isNotEmpty(safeObj(res.result).auth_url)){
                info.token_value = res.result.auth_url;
                pushNavigation(navigate,info)
                info.hasJump = true
            }
        }
    },(error)=>{
        if (info.hasJump) {
            return
        }
        pushNavigation(navigate,info)
        info.hasJump = true
    },false)
    setTimeout(() => {
        if (info.hasJump) {
            return
        } else {
            pushNavigation(navigate,info)
            info.hasJump = true
        }
    }, 3000);
}
/**
 *判断 当前时间点是否在给定的时间范围内，常用于广告位开始时间和结束时间判断
 * @export
 * @param {*} startDate
 * @param {*} endDate
 * @returns
 */
export function isCurrentInDateRange(startDate,endDate) {
    startDate = safe(startDate);
    endDate = safe(endDate);
    if (startDate.length > 0 && startDate.length <= 10) {
        startDate += ' 00:00:00'
    }
    if (endDate.length > 0 && endDate.length <= 10) {
        endDate += ' 23:59:59'
    }
    let currentDate = new Date();
    let dateStart = new Date(startDate.replace(/-/g,'/'));
    if (!isValidDate(dateStart)) {
        dateStart = currentDate
    }
    let dateEnd = new Date(endDate.replace(/-/g,'/'));
    if (!isValidDate(dateEnd)) {
        dateEnd = currentDate
    }
    let DateNow = currentDate.getTime();
    let isInTime = false
    if(DateNow>=dateStart.getTime() && DateNow<= dateEnd.getTime()){
        isInTime = true
    }
    return isInTime;
}
/**
 * 处理推送跳转逻辑
 * @param {*} navigate
 * @param {*} data
 */
export function dealPushNotificationResult(navigate,data) {
    if (isNotEmpty(data)){
        let userInfo = YFWUserInfoManager.ShareInstance();
        if (data.type == 'get_sign' || data.type == 'get_coupon_web') {
            let type = data.type == 'get_coupon_web'?TYPE_SIGN_COUPON:TYPE_SIGN_POINTS
            if (userInfo.hasLogin()) {
                getSignInData(navigate,type);
            } else {
                doAfterLoginWithCallBack(navigate,()=>{
                    getSignInData(navigate,type);
                })
            }
        } else if (data.type == 'get_order_advisory') {
            let info = {
                msg_type: "订单消息",
                msg_type_id: "2",
            }
            if (userInfo.hasLogin()) {
                navigate('YFWMessageListController', {state: info});
            } else {
                doAfterLoginWithCallBack(navigate,()=>{
                    navigate('YFWMessageListController', {state: info});
                })
            }
        } else if (data.type == 'get_coupon_wd'){
            if(!YFWUserInfoManager.ShareInstance().is_wd_user){
                pushNavigation(navigate, {type: 'wholesale_homepage', jumpTo:{type:'get_my_coupon'}});
            } else {
                DeviceEventEmitter.emit('dealPushNotificationWD',{type:'get_my_coupon'})
            }
        } else if(data.type == 'get_h5' && isNotEmpty(data.value)){
            if (userInfo.hasLogin()) {
                getAuthUrl(navigate,data);
            } else {
                doAfterLoginWithCallBack(navigate,()=>{
                    getAuthUrl(navigate,data);
                })
            }
        } else if (data.type == 'get_mine') {
            setTimeout(() => {
                DeviceEventEmitter.emit('LoginToUserCenter',0)
            }, 300);
        }
        else {
            if (data.is_login == '1'){
                if (userInfo.hasLogin()) {
                    pushNavigation(navigate,data);
                } else {
                    doAfterLoginWithCallBack(navigate,()=>{
                        pushNavigation(navigate,data);
                    })
                }
            } else {
                pushNavigation(navigate,data);
            }
        }
    }
}

export function homeAdviewClick(navigate,badge) {
    if(badge.type == 'get_h5' && isEmpty(badge.value)){
        return
    }
    this.needLogin = false
    this.needJumpRoute = true;
    if(badge.is_login == '1'){
        this.needLogin = true
    }
    if(this.needLogin){
        if (haslogin()) {
            if(badge.type == 'get_h5'){
                getAuthUrl(navigate,badge)
                this.needJumpRoute = false
            }
        } else {
            doAfterLoginWithCallBack(navigate,()=>{
                if(badge.type == 'get_h5'){
                    getAuthUrl(navigate,badge)
                    this.needJumpRoute = false
                }
            })
        }
        if (!haslogin()) {
            return
        }
    }
    if(!this.needJumpRoute){
        return
    }
    pushNavigation(navigate, badge)
}

export function wdHomeAdviewClick(navigate,badge) {
    if(badge.type == 'get_h5' && isEmpty(badge.value)){
        return
    }
    if (badge.type == 'get_h5') {
        badge.type = kRoute_html
    }
    pushWDNavigation(navigate, badge)
}

export function changeToYFW(callBack) {
    YFWUserInfoManager.ShareInstance().is_wd_user = false
    // getItem(kAccountKey).then((id)=> {
    //     if (id) {
    //         YFWUserInfoManager.ShareInstance().ssid = id
    //         YFWNativeManager.saveSsid_native(id);
    //     } else {
    //         YFWUserInfoManager.ShareInstance().ssid = ''
    //         YFWNativeManager.saveSsid_native('');
    //     }
    // });
    callBack&&callBack()
}

export function changeToWD(callBack) {
    YFWUserInfoManager.ShareInstance().is_wd_user = true
    // getItem(kWDAccountKey).then((id)=> {
    //     if (id) {
    //         YFWUserInfoManager.ShareInstance().ssid = id
    //         YFWNativeManager.saveSsid_native(id);
    //     } else {
    //         YFWUserInfoManager.ShareInstance().ssid = ''
    //         YFWNativeManager.saveSsid_native('');
    //     }
    // });
    callBack&&callBack()
}


export function getRegistStatus(callback) {
    if (YFWUserInfoManager.ShareInstance().is_regist) {
        callback&&callback(true)
    } else {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.home.dashboard.getCompleteSchedule_APP');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            callback && callback(res.result)
            YFWUserInfoManager.ShareInstance().is_regist = res.result
        }, (err) => {
            callback&&callback(false)

        },false)
    }

}

export function getPurchaseStatus(callback) {
    if (YFWUserInfoManager.ShareInstance().is_purchase) {
        callback&&callback(true)
    } else {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getPurchase');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            callback && callback(res.result)
            YFWUserInfoManager.ShareInstance().is_purchase = res.result
        }, (err) => {
            callback&&callback(false)
        },false)
    }

}

/**
 *  批发 检查连锁药店类型是否设置，否，弹窗
 **/
export function checkWDChainShopType(){
    let userInfo = YFWUserInfoManager.ShareInstance();
    if (userInfo.hasLogin()) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.shop_type_needseted');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if(res.result){
                DeviceEventEmitter.emit('WDChainShopTypeNeedSet')
            }
        },(error)=>{
        },false);

    }
}

/**
 * 邀请赢现金
 * */
export function getWinCashData(navigate) {
    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'person.app.getShareUrl');
    paramMap.set('type','invite');
    viewModel.TCPRequest(paramMap, (res)=> {

        let result = res.result;
        if (result && isNotEmpty(result.invite_win_cash_url)) {

            let value = safe(result.invite_win_cash_url);
            let share = safe(result.invite_win_cash_url_share);
            pushNavigation(navigate,{type:'get_h5',value:value,share:share,isHiddenShare:true,title:'邀请赢现金'})

        }

    },null,false);
}

/**
 * 邀请赢现金分享链接
 * */
export function getWinCashShareUrl(block) {
    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'guest.common.app.getAppinviteConfig');
    viewModel.TCPRequest(paramMap, (res)=> {
        block(res)
    },()=>{
        block()
    },false);
}

export function test_connect() {
    // CookieManager.set({
    //     domain: "yaofangwang.com",
    //     httpOnly: true,
    //     name: "ASP.NET_SessionId",//ssid
    //     path: "/",
    //     secure: false,
    //     value: "4vyxpo53orifb43wpom2dkgn",
    //     version: "1",
    // }).then((done) => {
    //     console.log('CookieManager.set =>', done);
    //     // CookieManager.getAll().then((cookies) => {console.log('CookieManager.getAll =>', cookies);});
    //     CookieManager.get('https://m.yaofangwang.com').then((cookies) => {console.log('CookieManager.get =>', cookies);});
    //     let viewModel = new YFWRequestViewModel();
    //     let url = 'https://m.yaofangwang.com/catalog-70.html'
    //     url = 'https://m.yaofangwang.com/manage/order/list'
    //     viewModel.fetchHtml(url, (res)=> {
    //         console.log(res,'fetch html')
    //     });
    // });
}
//获取IP

export function get_ip() {

    let paramMap = new Map();
    paramMap.set('service', 'get_ip');
    let viewModel = new YFWRequestViewModel();
    viewModel.GET_TCP(paramMap, (res)=> {

        let ip = safe(res.ip);
        YFWUserInfoManager.ShareInstance().deviceIp = ip;
        postPushDeviceInfo();

    });


}

/**
 *1、无token直接回调\n
 *2、3s定时器回调
 *3、tokenLogin接口报错，或返回result==null
 *4、tokenLogin在定时器回调前(三秒内)成功返回正确结果
 *5、tokenLogin在定时器回调后(三秒后)，成功返回正确结果（ 2 --> 5）
 * 1 2 3 == 刷新失败处理逻辑 4 == 刷新成功逻辑 5 == 部分刷新成功逻辑
 * 失败处理：只调用guest相关接口
 * 成功处理：调用guest和person相关接口
 * 部分刷新处理：只调用person相关接口（guest接口在2中已调用）
 * @export
 * @param {*} callback true false 'refreshed'
 */
export function tokenLogin(callback) {

    getItem(LOGIN_TOKEN).then((token)=>{
        if (isEmpty(token) || token == 'error') {
            console.log('token login no token = ',token)
            callback&&callback(false);
            return
        }
        token = safe(token)
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.account.tokenLogin');
        paramMap.set('token', token);
        //设置定时器  3s后没有回调 直接return  callback
        var isCallBacked = false;
        this.timer =  setTimeout(
            ()=> {
                if(isCallBacked){
                    return
                }
                console.log('token login time out ')
                callback&&callback(false);
                isCallBacked = true;
            },1000*3
        );
        viewModel.TCPRequest(paramMap, (res) => {
            console.log('token login success back ',res)
            if (res.result&&res.result.is_token_login==1){
                let userInfo = YFWUserInfoManager.ShareInstance();
                userInfo.setSsid(safe(res.ssid));
                DeviceEventEmitter.emit('UserLoginSucess');
                setItem(LOGIN_TOKEN,safe(res.result.login_token))
            }
            if(isCallBacked){//定时器callback后，tokenLogin接口返回，此时只用刷新person相关接口
                console.log('token login success refreshed ')
                callback&&callback('refreshed')
                clearTimeout(this.timer)
                return
            }
            callback&&callback(true)
            isCallBacked = true
        },()=>{
            if(isCallBacked){
                clearTimeout(this.timer)
                return
            }
            callback&&callback(false)
            isCallBacked = true
        },false);
    })
}


export function get_new_ip(callBack,onFailure){

    let paramMap = new Map();
    paramMap.set('service', 'get_ip');
    let viewModel = new YFWRequestViewModel();
    viewModel.GET_TCP(paramMap, (res)=> {

        let ip = safe(res.ip);

        if (callBack)callBack(ip);

    },(error)=>{
        // if (callBack)callBack('');
        onFailure && onFailure(error)
    });

}

 /**
 * 查询是否绑定手机号
 */
export function requestHasBlindMobile() {
    if(!YFWUserInfoManager.ShareInstance().hasLogin()){
        return
    }
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.account.getAccountMobile');
    let viewModel = new YFWRequestViewModel();
    viewModel.TCPRequest(paramMap, (res) => {
        let data = res.result
        let mobilde = safe(data.value)
        if(mobilde == ''){
            YFWUserInfoManager.ShareInstance().hasBlindMobile = false;
        }
    })
}


export function addLogPage(page) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.sitemap.LogPageView')
    paramMap.set('unionid', 75)
    paramMap.set('page', page)
    let viewModel = new YFWRequestViewModel();
    viewModel.TCPRequest(paramMap, (res) => { }, () => { },false)
}

/**
 *
 * @param {当前购物车该商品数量} current_car_count
 * @param {起订量} minsum
 * @param {限购} lbuy_no
 * @param {一次加入的数量} purchase_times
 * @param {库存} reserve
 */
export function getAddCarCount(quantity,current_car_count,minsum,lbuyno,purchasetimes,reserves) {
    quantity = Number.parseInt(String(quantity));
    let car_good_count = safeNumber(current_car_count,0)
    let min_purchase = safeNumber(minsum,1)
    let purchase_times = safeNumber(purchasetimes,1)
    let lbuy_no = safeNumber(lbuyno,1)
    let reserve = safeNumber(reserves,1)
    let show_quantity = 1
    try {
        if (car_good_count >= min_purchase) {
            show_quantity = purchase_times
        } else {
            show_quantity = min_purchase - car_good_count
        }
        if (isNaN(quantity) || !quantity) {
            quantity = ''
        } else if (quantity > reserve) {
            quantity = parseInt(reserve / purchase_times) * purchase_times
            YFWToast('超过库存上限');
        } else if (!isNaN(lbuy_no) && lbuy_no> 0 && quantity > lbuy_no) {
            quantity = parseInt(lbuy_no/purchase_times)*purchase_times
            YFWToast('限购'+lbuy_no);
        } else if (quantity < show_quantity) {
            quantity = show_quantity
        } else {
            let mquantity = parseInt(quantity/purchase_times)*purchase_times
            if(quantity != mquantity) {
                YFWToast('购买数量倍数为 '+purchase_times);
            }
            quantity = mquantity
        }
    } catch (e) {
        quantity = ''
    }

    try {
        quantity = Number.parseInt(String(quantity));
        if (isNaN(quantity) || !quantity) {
            quantity = safeNumber(min_purchase,1)
        } else if (quantity < 1) {
            quantity = safeNumber(min_purchase,1)
        }
    } catch (e) {
        quantity = safeNumber(min_purchase,1)
    }
    return quantity
}

export function getWDAuthUrl(navigate,badge) {
    let info = deepCopyObj(badge)
    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'store.buy.app.getToken');
    viewModel.TCPRequest(paramMap, (res)=> {
        if (info.hasJump) {
            return
        }
        if(res.code == '1'){
            if(isNotEmpty(safeObj(res.result))){
                info.token_value = info.value+'?token='+res.result;
                pushWDNavigation(navigate,info)
                info.hasJump = true
            }
        }
    },(error)=>{
        if (info.hasJump) {
            return
        }
        pushWDNavigation(navigate,info)
        info.hasJump = true
    },false)
    setTimeout(() => {
        if (info.hasJump) {
            return
        } else {
            pushWDNavigation(navigate,info)
            info.hasJump = true
        }
    }, 3000);
}
