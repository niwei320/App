
import {log, logWarm, logErr} from './YFWLog'
import YFWUserInfoManager from './YFWUserInfoManager'
import {
    Platform,
} from 'react-native';
import {safe, is_ios_hot_bundle} from "../PublicModule/Util/YFWPublicFunction";

var forge = require('node-forge');

let iosAppkey = "ab391b9adb7de872a6c63bcb55cca349";
let appSecret = 'b4a7f03cd6e727e1ca9b70bab6ca589a';
let baseurl = "https://open.yaofangwang.com/app_gateway.ashx";
let anotherBaseurl = "https://app.yaofangwang.com:18180/4000/4000/0/";
 // let baseurl = "http://192.168.2.23:83/app_gateway.ashx";
let androidAppkey = "a53db3d0a4f1bdd6c1232e1db16f232b";
let androidAppSecret="c40617a9865baba6c97ac061f5bab1fe";

export default class YFWRequestParam{

    getURL(param,isAnother){

        let params = this.getBaseParam(param);

        params.set('sign',this.getSign(params));

        var url = baseurl
        if (isAnother) {
            url = anotherBaseurl
            let cmd = param.get('__cmd')
            if (cmd) {
                url += cmd
            }
        }
        url += '?' + this.encodeParams(params);
        log('请求链接：'+url);

        return url;

    }

    getBaseParam(param){

        let params = this.baseParam();

        for (let [k,v] of param) {
            params.set(k,v);
        }

        return params;

    }


    baseParam(){

        let baseParam = new Map();
        baseParam.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        baseParam.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        let userinfo = YFWUserInfoManager.ShareInstance();
        baseParam.set('os',(Platform.OS === 'ios') ? 'ios' : 'android');
        baseParam.set('device_no',safe(YFWUserInfoManager.ShareInstance().deviceNo));
        baseParam.set('app_version',safe(YFWUserInfoManager.ShareInstance().version));
        baseParam.set('version',safe(YFWUserInfoManager.ShareInstance().version));
        baseParam.set('app_key',(Platform.OS === 'ios') ? iosAppkey : androidAppkey);
        baseParam.set("timestamp",this.currentDate());
        baseParam.set("ssid",userinfo.getSsid());
        baseParam.set("market",userinfo.getMarket());
        baseParam.set("ip",YFWUserInfoManager.ShareInstance().deviceIp)//设备IP
        if (is_ios_hot_bundle()) {
            baseParam.set("hot_bundle","1");
        }
        baseParam.set('o2o_lat',safe(YFWUserInfoManager.ShareInstance().O2Olatitude));
        baseParam.set('o2o_lng',safe(YFWUserInfoManager.ShareInstance().O2Olongitude));
        // 手动设置地址功能
        // if(YFWUserInfoManager.ShareInstance().getLocationManual()){
        //     baseParam.set('lat',safe(YFWUserInfoManager.ShareInstance().latitude));
        //     baseParam.set('lng',safe(YFWUserInfoManager.ShareInstance().longitude));
        // }


        return baseParam;
    }


    encodeParams(param){
        let string = '';
        let i = 0;
        for (let [k,v] of param) {
            string += k+'='+encodeURI(v);
            // string += k + '=' + v ;
            if (i !== param.size-1){
                string += '&';
            }
            i++;
        }
        log('参数拼接：'+string);
        return string;
    }

    paramToString(param){
        let string = '';
        let i = 0;
        for (let [k,v] of param) {
            string += k+'='+v;
            if (i !== param.size-1){
                string += '&';
            }
            i++;
        }

        log('参数拼接：'+string);
        return string;
    }

    getSign(param){

        let paramStr = this.paramToString(param);
        let key=(Platform.OS === 'ios') ? appSecret : androidAppSecret;
        paramStr += '&app_secret='+key;
        var md = forge.md.md5.create();
        md.update(paramStr,'utf8');
        sign = md.digest().toHex();
        log('signParam:'+paramStr);
        log('sign：'+sign);

        return sign;

    }

    currentDate(){

        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let myDate = date.getDate();
        let hours =  date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        let timestamp = year+'-'+month+'-'+myDate+' '+hours+':'+minutes+':'+seconds;

        return timestamp;
    }

    /*增加对URL签名的方法*/
  signUrl(resourceUrl){
    let params = this.baseParam();
    let userinfo = YFWUserInfoManager.ShareInstance();
    params.set("timestamp",this.currentDate());
    params.set("ssid",userinfo.getSsid());
    params.set("idfa",safe(YFWUserInfoManager.ShareInstance().idfa))
    params.set("device_no",safe(YFWUserInfoManager.ShareInstance().deviceNo))
    params.set("from",Platform.OS == 'android' ? 'android':'ios')
    params.set('sign',this.getSign(params));
    var url = resourceUrl + '?' + this.encodeParams(params);
    return url
  }

    /*赚现金*/
    signInviteUrl(resourceUrl,parmUrl){
        let params = this.baseParam();
        let userinfo = YFWUserInfoManager.ShareInstance();
        params.set("timestamp",this.currentDate());
        params.set("ssid",userinfo.getSsid());
        params.set("uid",userinfo.getSsid());
        params.set("idfa",safe(YFWUserInfoManager.ShareInstance().idfa))
        params.set("device_no",safe(YFWUserInfoManager.ShareInstance().deviceNo))
        params.set("from",Platform.OS == 'android' ? 'android':'ios')
        params.set('url',parmUrl);
        params.set('sign',this.getSign(params));
        var url = resourceUrl + '?' + this.encodeParams(params);
        return url
    }

}












