
import {
    DeviceEventEmitter,
    Platform,
} from 'react-native'
import {getItem,setItem,clearUserInfo,kAccountKey,kTcpSsidKey, kWDAccountKey,removeItem} from './YFWStorage'
import {isNotEmpty, isEmpty, safe, safeObj} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "./YFWNativeManager";
import YFWToast from './YFWToast';

let instance = null;
var ssid = '';
var SystemConfig = [];
var shopCarNum = ''
var wdshopCarNum = ''
var otoShopCarNum = ''
var messageRedPointVisible = false;
export default class YFWUserInfoManager{

    constructor(){
        this.latitude = '';
        this.longitude = '';
        this.region_id = '';
        this.cdn_url = '';
        this.address = ''//街道
        this.city = ''//城市
        this.deviceNo = '';
        this.version = '';
        this.idfa = '';
        this.deviceIp = '';
        this.deviceName =''
        this.manufacturer =''
        this.osVersion = ''
        this.jpushId = ''
        this.mfpushId = ''
        this.tableStyle = true
        this.market =''
        this.isPush = '1'
        this.idfv = ''
        this.devicekScreenWidth = ''//手机分辨率屏宽
        this.devicekScreenHeight = ''//手机分辨率屏高
        this.deviceTotalMemory = ''//手机内存
        this.deviceCPUType = ''//CPU类型
        this.deviceCPUNum = ''//cpu数量
        this.jumpToAddGoodsShopId = []
        this.locationSuccess = undefined
        this.firstTimeLoadShopCar = true
        this.hasBlindMobile = true
        this.isShowBlindMobileTips = true
        this.addCarIds = new Map()
        this.addCarOTOIds = new Map()
        this.shopCarInfo = undefined
        // this.locationManual = false  //手动设置地址
        this.noLocationHidePrice = false
        this.isLocationPermission = true //定位权限状态
        this.setCategoryTableStyle()
        this.setIsShowBlindMobile()
        this.enableOnLogin = true
        this.erpUserInfo = null
        this.erpShopID = -1
        this.is_wd_user = false     //是否是批发状态
        this.ssid = ''
        this.wd_ssid = ''
        this.is_regist = false       //认证资料审核通过
        this.is_purchase = false     //采购权限开启
        this.currentScreen = ''

        //O2O项目
        this.O2Olatitude = '';
        this.O2Olongitude = '';
        this.O2Ocity = '';
        this.O2Oaddress = '';

        if (!instance) {
            instance = this;
            getItem(kAccountKey).then((id)=> {
                if (id){
                    instance.ssid = id;
                }
            });
            getItem(kWDAccountKey).then((id)=> {
                if (id){
                    instance.wd_ssid = id;
                }
            });
        }
        return instance;
    }

    static defaultProps = {
        isRequestTCP:true,
        domian:'',
    }
    setErpUserInfo(info) {
        this.erpUserInfo = info
    }
    getErpUserInfo() {
        return this.erpUserInfo
    }
    setErpShopID(id) {
        this.erpShopID = id
    }
    getErpShopID(){
        return this.erpShopID
    }
    isShopMember(){
        return isNotEmpty(this.erpShopID)&&this.erpShopID != -1 &&this.erpShopID.toString().length>0
    }
    setCategoryTableStyle(){
        getItem('CategoryTableStyle').then((data)=>{
            if (data) {
                this.tableStyle = data == 'table'?true:false
            }
        })
    }
    setIsShowBlindMobile(){
        getItem('IsShowBlindMobileTips').then((data)=>{
            if (data) {
                this.isShowBlindMobileTips = data == 'true'?true:false
            }
        })
    }
    /**
     * 测试数据
     */
    testDefaultData(){
        this.latitude = '31.236276';
        this.longitude = '121.480248';
        this.region_id = "95"
        this.address = "上海"//街道
        this.city = "上海"//城市
    }




    /***
     * 类方法
     */
    static ShareInstance(){

        let singleton = new YFWUserInfoManager();
        return singleton;
    }



    /***
     * 实例方法
     */
    setSsid(ssid){
        if (this.is_wd_user) {
            this.wd_ssid = ssid;
            setItem(kWDAccountKey, ssid);
        } else {
            this.ssid = ssid;
            setItem(kAccountKey, ssid);
        }
        // YFWNativeManager.saveSsid_native(ssid);
    }

    getSsid(){
        if (this.is_wd_user) {
            return this.wd_ssid
        } else {
            return this.ssid;
        }
    }


    setSystemConfig(systemConfig){
        if(systemConfig=="undefined"){
            this.SystemConfig =  {};
            return
        }
        this.SystemConfig = systemConfig;
        if (isNotEmpty(systemConfig)){
            YFWNativeManager.setSystemConfigInfo(systemConfig)
        }
        if (isNotEmpty(systemConfig.domain) && systemConfig.domain.length > 0){
            if(systemConfig.domain[0] === '.'){
                systemConfig.domain = safeObj(systemConfig.domain).substring(1,safeObj(systemConfig.domain).length)
            }
            if (isNotEmpty(systemConfig.cdn_url) && systemConfig.cdn_url.length > 5){
                this.cdn_url = systemConfig.cdn_url;
            }
            YFWUserInfoManager.defaultProps.domian = systemConfig.domain;
            YFWNativeManager.changeDomain(systemConfig.domain);
        }

        //无定位权限是否隐藏
        if(isNotEmpty(systemConfig.not_location_hide_price)){
            if(systemConfig.not_location_hide_price == 'true'){
                YFWNativeManager.isLocationServiceOpen((isOpen)=>{
                    this.noLocationHidePrice = !isOpen
                    DeviceEventEmitter.emit("NO_LOCATION_HIDE_PRICE",this.noLocationHidePrice)
                })
            } else {
                this.noLocationHidePrice = false
                DeviceEventEmitter.emit("NO_LOCATION_HIDE_PRICE",this.noLocationHidePrice)
            }
        }

        /**
         * 如果服务器只是为了改变客户端的端口号，并不需要修改域名
         * 不需要跟域名一起判断，否则没有新的端口，TCP无法请求
         */
        YFWNativeManager.setCdnAndport(systemConfig)

    }

    setAppConfig(info){

        if (isNotEmpty(info)) {
            this.deviceNo = info.deviceNo;
            this.version = info.version;
            this.idfa = info.idfa;
            // this.deviceIp = safe(info.ip);
            this.deviceName = info.deviceName;
            this.manufacturer = info.manufacturer
            this.osVersion = info.osVersion
            this.jpushId = info.jpushId
            this.market = info.market
            this.mfpushId = safe(info.mfpushId)
            this.isPush = safeObj(info.isPush)
            this.devicekScreenWidth = info.devicekScreenWidth
            this.devicekScreenHeight = info.devicekScreenHeight
            this.deviceCPUType = info.deviceCPUType
            this.deviceCPUNum = info.deviceCPUNum
            this.deviceTotalMemory = info.deviceTotalMemory
            this.idfv = info.idfv
            if (Platform.OS == 'ios'){
                let is_tcp = (info.isTcp == 'yes');
                YFWUserInfoManager.defaultProps.isRequestTCP = is_tcp;
                let domian = info.yfwDomain;
                if (isNotEmpty(domian) && domian.length > 10){
                    YFWUserInfoManager.defaultProps.domian = domian;
                }
            }
            if(Platform.OS == 'android'){
                let isTcp = (info.netType == "tcp")
                YFWUserInfoManager.defaultProps.isRequestTCP = true;
                let domian = info.yfwDomain;
                if (isNotEmpty(domian) && domian.length > 10){
                    YFWUserInfoManager.defaultProps.domian = domian;
                }
            }

        }

    }

    setApplocation(data){

        if (isNotEmpty(data)) {
            this.latitude = data.latitude;
            this.longitude = data.longitude;
            //默认经纬度或者O2O经纬度已存在不进行赋值
            if (isEmpty(this.O2Olatitude) && (parseFloat(data.longitude) != 121.480248 && parseFloat(data.longitude) != 121.480247)) {
                this.O2Olatitude = data.latitude;
                this.O2Olongitude = data.longitude;
            }
            if(isNotEmpty(data.city)){
                this.city = data.city;
                if (isEmpty(this.O2Ocity)) {
                    this.O2Ocity = data.city;
                }
            }
        }

    }

    getSystemConfig(){
        if(isEmpty(this.SystemConfig)){
            return {};
        }
        return this.SystemConfig;
    }

    getTcpSsid(){

        if(isEmpty(this.tcpSsid)){
            return '';
        }
        return this.tcpSsid;
    }

    clearInfo(){
        this.firstTimeLoadShopCar = true;
        this.hasBlindMobile = true;
        if (this.is_wd_user) {
            this.wd_ssid = ''
            this.is_regist = false
            this.is_purchase = false
            removeItem(kWDAccountKey);
        } else {
            this.ssid = ''
            clearUserInfo();
        }
    }

    hasLogin(){
        if (this.is_wd_user) {
            if (isNotEmpty(this.wd_ssid) && this.wd_ssid.length > 0){
                return true;
            } else{
                return false;
            }
        } else {

            if (isNotEmpty(this.ssid) && this.ssid.length > 0){
                return true;
            } else{
                return false;
            }
        }

    }

    setRegionId(id){
        if(isNotEmpty(id)){
            this.region_id = id
        }
    }

    getRegionId(){
        if(isEmpty(this.region_id)){
            return "95"//默认值
        }
        return this.region_id+""
    }

    setCity(city){
        if(isNotEmpty(city)){
            this.city = city
        }
    }


    getCity(){
        if(isEmpty(this.city)){
            return "上海市"//默认值
        }
        return this.city;
    }

    /**
     * 保存城市中文名
     * @param address
     */
    setAddress(address){
        if(isNotEmpty(address)){
            this.address = address;
            if (address != '上海市' && isEmpty(this.O2Oaddress)) {
                this.O2Oaddress = address;
            }
            this.locationSuccess = 'success'
        }
    }

    getLocationStasus(){
        return this.locationSuccess;
    }

    getAddress(){
        if(isEmpty(this.address)){
            return "上海市"//默认值
        }
        return this.address
    }

    getCdnUrl(){
        return '//c1.yaofangwang.net';
        if (isEmpty(this.cdn_url)){
            return '//c1.yaofangwang.net';
        }

        return this.cdn_url;
    }

    getMarket(){
        if(Platform.OS == 'ios'){
            return 'iOS'
        }else{
            if(isEmpty(this.market)){
                return ''
            }
            return this.market
        }
    }

    // 手动设置地址
    // setLocationManual(isManual){
    //     this.locationManual = isManual
    // }
    // getLocationManual(){
    //     return this.locationManual
    // }

    setNoLocationHidePrice(isHide){
        this.noLocationHidePrice = isHide
    }
    getNoLocationHidePrice(isHide){
        return this.noLocationHidePrice
    }
    setCurrentScreen(currentScreen){
        this.currentScreen = currentScreen
    }
    getCurrentScreen(){
        return this.currentScreen
    }
}
