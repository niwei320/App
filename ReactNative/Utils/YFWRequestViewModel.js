
import {
    DeviceEventEmitter,
    Platform,
} from 'react-native';
import YFWRequest from './YFWRequest'
import YFWRequestParam from './YFWRequestParam'
import YFWToast from "./YFWToast";
import YFWUserInfoManager from './YFWUserInfoManager'
import {isNotEmpty, isEmpty, strMapToObj, safeObj, yfw_domain} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from './YFWNativeManager'

export default class YFWRequestViewModel{


    returnValueConfig(res,returnValue,errorMethod){

        let userInfo = new YFWUserInfoManager();
        res.code = String(res.code)
        if (res.code === '1') {
            if (returnValue){
                return returnValue(res);
            }
        }else if(res.code === '-998' && userInfo.hasLogin()){
            userInfo.clearInfo();
            DeviceEventEmitter.emit('OpenReLoginView')
        }else if (res.code === '-2') {
            this.showToast(res.msg)
            if (errorMethod) {
                return errorMethod(res);
            }
        } else {
            if (isNotEmpty(res.msg) && res.msg.length >0){
                this.showToast(res.msg)
                if (errorMethod) {
                    return errorMethod(res);
                }
            }
        }
    }
    returnTCPValueConfig(res,returnValue,errorMethod){

        let userInfo = new YFWUserInfoManager();
        if (isNotEmpty(res) && isNotEmpty(res.code)){
            if (String(res.code) == '1') {
                if (returnValue){
                    return returnValue(res);
                }
            }else if(String(res.code) == '-999' || res.code == -999 ){
                userInfo.clearInfo();
                DeviceEventEmitter.emit('OpenReLoginView');
                if (errorMethod){
                    return errorMethod(null);
                }
            } else if(String(res.code) == '-2' || String(res.code) == '-3' || (userInfo.is_wd_user && String(res.code) === '-101')){

                if (errorMethod){
                    return errorMethod(res);
                }

            }else {
                this.showToast(res.msg);
                if (errorMethod){
                    return errorMethod(res);
                }
            }
        }

    }

    errorConfig(error , errorMethod){

        if (isEmpty(error)){
            if (errorMethod){
                errorMethod(error)
            }
            return;
        }


        //ssid过期

        let userInfo = new YFWUserInfoManager();
        if (error.code === '-999' || error.code == -999){
            userInfo.clearInfo();
            DeviceEventEmitter.emit('OpenReLoginView')
            if (errorMethod){
                errorMethod(error)
            }
            return;
        }

        //错误信息提示
        let errorMsg = isEmpty(safeObj(error).message)?safeObj(error).msg : safeObj(error).message
        if (safeObj(errorMsg).length >0 && !(String(error.code) === '-2' || String(error.code) === '-3') && !(userInfo.is_wd_user && String(error.code) === '-101')){
            this.showToast(errorMsg)
        }

        if (errorMethod) {
            return errorMethod(error);
        }

    }


    GET(param , returnValue, errorMethod,isShowLoad){
        if(YFWUserInfoManager.defaultProps.isRequestTCP){
            return
        }
        let showLoad = isShowLoad;
        let paramString = param;
        this._showLoading(showLoad);

        let request = new YFWRequest();
        let paramObj = new YFWRequestParam();
        var url = paramObj.getURL(param);

        try {
            request.get(url, null).then((res) => {
                let aaa = paramString;
                this._dismissLoading(showLoad)
                this.returnValueConfig(res,returnValue,errorMethod);
            }).catch((error)=>{
                this._dismissLoading(showLoad)
                this.errorConfig(error,errorMethod);
            });
        }catch (error) {
            this._dismissLoading(showLoad)
            this.errorConfig(error,errorMethod);
        }

    }


    GET_TCP(param , returnValue, errorMethod){

        let paramString = param;

        let request = new YFWRequest();
        let paramObj = new YFWRequestParam();
        var url = paramObj.getURL(param);
        url = url.replace('yaofangwang.com',yfw_domain());
        try {
            request.get(url, null).then((res) => {
                this.returnValueConfig(res,returnValue,errorMethod);
            }).catch((error)=>{
                this.errorConfig(error,errorMethod);
            });
        }catch (error) {
            this.errorConfig(error,errorMethod);
        }
    }

    dataTaskWithRequest(param , returnValue, errorMethod,method){
        let request = new YFWRequest();
        let paramObj = new YFWRequestParam();
        var url = paramObj.getURL(param,true);
        try {
            if (method == 'POST') {
                request.post(url, null).then((res) => {
                    this.returnValueConfig(res,returnValue,errorMethod);
                }).catch((error)=>{
                    this.errorConfig(error,errorMethod);
                });
            } else {
                request.get(url, null).then((res) => {
                    this.returnValueConfig(res,returnValue,errorMethod);
                }).catch((error)=>{
                    this.errorConfig(error,errorMethod);
                });
            }

        }catch (error) {
            this.errorConfig(error,errorMethod);
        }
    }
    //

    fetchHtml(url , returnValue, errorMethod){
        let request = new YFWRequest();
        try {
            request.getHtml(url, null).then((res) => {
                returnValue && returnValue(res)
            }).catch((error)=>{
                errorMethod && errorMethod(error)
            });
        }catch (error) {
            this.errorConfig(error,errorMethod);
        }
    }

    POST(param , returnValue, errorMethod,isShowLoad){
        if(YFWUserInfoManager.defaultProps.isRequestTCP){
            return
        }
        let showLoad = isShowLoad;
        this._showLoading(showLoad);

        let request = new YFWRequest();
        let paramObj = new YFWRequestParam();
        var url = paramObj.getURL(param);

        try {
            request.post(url, null).then((res) => {
                this._dismissLoading(showLoad)
                this.returnValueConfig(res,returnValue,errorMethod);
            }).catch((error)=>{
                this._dismissLoading(showLoad)
                this.errorConfig(error,errorMethod);
            });
        }catch (error) {
            this._dismissLoading(showLoad)
            this.errorConfig(error,errorMethod);
        }
    }

    //isShowLoad未传的表示显示加载页，传值的不显示
    //
    //
    TCPRequest(param , returnValue, errorMethod,isShowLoad){
        let showLoad = isShowLoad;
        this._showLoading(showLoad);

        let paramObj = new YFWRequestParam();
        let params = paramObj.getBaseParam(param);

        try {
            YFWNativeManager.TCPRequest(strMapToObj(params),(res)=>{
                this._dismissLoading(showLoad)
                res = this.addMsg(param,res)
                this.returnTCPValueConfig(res,returnValue,errorMethod);
            },(error)=>{
                this._dismissLoading(showLoad)
                error=this.addMsg(param,error)
                this.errorConfig(error,errorMethod);
            });
        }catch (error) {
            this._dismissLoading(showLoad)
            error=this.addMsg(param,error)
            this.errorConfig(error,errorMethod);
        }
    }

    //isShowLoad未传的表示显示加载页，传值的不显示
    TCPMultipleRequest(params , returnValue, errorMethod,isShowLoad){
        let showLoad = isShowLoad;
        this._showLoading(showLoad);

        let paramObj = new YFWRequestParam();
        let newParams = params.map((item)=>{
            let param = paramObj.getBaseParam(item)
            return strMapToObj(param)
        })
        try {
            YFWNativeManager.TCPMultipleRequest({params:newParams},(res)=>{
                this._dismissLoading(showLoad)
                // res = this.addMsg(param,res)
                returnValue(res)
                // this.returnTCPValueConfig(res,returnValue,errorMethod);
            },(error)=>{
                this._dismissLoading(showLoad)
                error=this.addMsg(param,error)
                // this.errorConfig(error,errorMethod);
            });
        }catch (error) {
            this._dismissLoading(showLoad)
            error=this.addMsg(param,error)
            this.errorConfig(error,errorMethod);
        }
    }


    /**
     * TODO Test 增加测试代码，弹窗增加接口名
     * @param param
     * @param error
     * @returns {*}
     */
    addMsg(param,error){
        if(error && error.code == -900){
            let value = param.get("__cmd")
            error.msg = error.msg+value
        }
        return error
    }


    _showLoading(showLoad){
        if (showLoad != false) DeviceEventEmitter.emit('LoadProgressShow');
    }

    _dismissLoading(showLoad){
        if (showLoad != false) DeviceEventEmitter.emit('LoadProgressClose');
    }

    /**
     * 过滤所有不显示的内容
     */
    showToast(msg){
        let isShow = true;
        let array = YFWUserInfoManager.ShareInstance().is_wd_user?wd_filterMsg:filterMsg
        for (let i = 0; i < array.length; i++) {
            if(msg.includes(array[i])){
                isShow =false
                break
            }
        }
        if(isShow){
            YFWToast(msg)
        }
    }
}

const filterMsg = [ "下架","error","request","系统","服务","__cmd","undefined","service","接口","您的需求清单中","认证失败","认证次数","身份证","此账号已经注销","未完结的订单"]
const wd_filterMsg = ["error","request","系统","服务","__cmd","undefined","service","接口","您的需求清单中","认证失败","认证次数","身份证","此账号已经注销","未完结的订单"]

