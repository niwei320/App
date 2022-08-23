package com.yaofangwang.mall.net;

import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.text.TextUtils;

import com.ishumei.smantifraud.SmAntiFraud;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.TUtils.SPUtils;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall.httpNet.NetConfig;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Created by marti on 2018/9/12.
 */

public class ProjectGlaobleParams {

//    public static String IP = "192.168.2.13";/*吴路*/
//    //public static String IP = "192.168.2.23";/*彭杰峰*/
//    //public static String IP = "192.168.3.106";/*孙启超*/
//    public static int TCP_PORT = 18280;/*线下端口*/
//    public static int DB_ID = 4000;/*线下DBID*/
//    public static int BUNDLE_ID = 4000;/*线下BUNDLEID*/
//    public static int VERSION_ID = 0;/*线下版本*/
//    public static String IMG_IP = "cdn."+getDomain();/*线上版本*/
//    public static int IMG_PORT = 18480;/*线上版本*/

    public static String IP = getDomain("ip");/*线上IP*/
    public static int TCP_PORT = getTcpPort();/*线上端口*/
    public static int DB_ID = 4000;/*线上DBID*/
    public static int BUNDLE_ID = 4000;/*线上BUNDLEID*/
    public static int VERSION_ID = 0;/*线上版本*/
    public static String IMG_IP = getDomain("img_ip");/*线上版本*/
    public static int IMG_PORT = getImage_Port();/*线上版本*/
//    public static int IMG_PORT = BuildConfig.IMG_PORT;/*线下图片端口*/
//    public static String IMG_IP = BuildConfig.IMG_IP;/*线下图片IP*/



    /*秘钥*/
    public static String SECRET = "ybyz!@#LHL8!234!$%&^@#BD1974&65";
    /*时间戳*/
    public static long TIME_DURING = 0;
    private static String market = "";

    public static String getDomain(String type){
        SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MainApplication.getInstance().MODE_PRIVATE);
        /*String tcp_net_domain = null;
        if(!BuildConfig.DEBUG){
             tcp_net_domain = sharedPreferences.getString("TCP_NET_DOMAIN", "yaofangwang.net");
        }else{
             tcp_net_domain = sharedPreferences.getString("TCP_NET_DOMAIN", "yaofangwang.com");
        }
        tcp_net_domain = sharedPreferences.getString("TCP_NET_DOMAIN", "yaofangwang.com");
        //return tcp_net_domain;*/

//        if(!BuildConfig.DEBUG){
//            if("ip".equals(type)){
//                return  "app."+sharedPreferences.getString("TCP_NET_DOMAIN", "yaofangwang.com");
//            }else {
//                return  "upload."+sharedPreferences.getString("TCP_NET_DOMAIN", "yaofangwang.com");
//            }
//        }
        String ipAddress = sharedPreferences.getString("Debug_IP_Address", "onLine");
        return getDetailIp(ipAddress,type);
    }

    public static String getDetailIp(String name,String type){
        String ip = null;
        switch (name){
            case "xiaopeng":
                ip = "192.168.2.66";
                break;
            case "wulu":
                ip = "192.168.2.13";
                break;
            case "xiaozhuang":
                ip = "192.168.2.15";
                break;
            case "yalin":
                ip = "192.168.2.16";
                break;
            case "likaihua":
                ip = "192.168.2.8";
                break;
            case "sunqichao":
                ip = "192.168.3.106";
                break;
            case "lihui":
                ip = "192.168.2.59";
                break;
            case "localtest":
                ip = "192.168.2.252";
                break;
            case "onLineTest":
                ip = "114.116.222.136";
                break;
            case "onLine":
                SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MainApplication.getInstance().MODE_PRIVATE);
                if("ip".equals(type)){
                    ip = "app."+sharedPreferences.getString("TCP_NET_DOMAIN", "yaofangwang.com");
                }else {
                    ip = "upload."+sharedPreferences.getString("TCP_NET_DOMAIN", "yaofangwang.com");
                }
                break;
            default:
                ip = name;
                break;
        }
        return ip;
    }

    public static int getTcpPort(){
        SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MainApplication.getInstance().MODE_PRIVATE);
//        if(!BuildConfig.DEBUG){
//            String tcp_port = sharedPreferences.getString("TCP_PORT","18380");
//            return Integer.valueOf(tcp_port);
//        }
        String ipAddress = sharedPreferences.getString("Debug_IP_Address", "onLine");
        return getDtailPort(ipAddress);
    }

    public static int getDtailPort(String name){
       if("onLine".equals(name)){
           return 18384;
       } else if("onLineTest".equals(name)){
           return 18380;
       }
       return 18280;
    }

    public static int getImage_Port(){
        SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MainApplication.getInstance().MODE_PRIVATE);
        String tcp_image_port = sharedPreferences.getString("TCP_IMAGE_PORT","18580");
        return Integer.valueOf(tcp_image_port);
    }


    public static Map<String, Object> addGloableParams(Map<String, Object> datas) {
        if (datas == null) {
            datas = new HashMap<>();
        }
        datas.put("__client", "phone");
        datas.put("os", "android");
        String ssid = (String) datas.get("ssid");
        if(!TextUtils.isEmpty(ssid) && !"null".equals(ssid)){
            datas.put("__ssid", datas.get("ssid"));
        }
//        else{
//            datas.put("__ssid", getSSID());
//        }
        String o2o_lat = (String) datas.get("o2o_lat");
        String o2o_lng = (String) datas.get("o2o_lng");
        String cmd = (String) datas.get("__cmd");
        if(!TextUtils.isEmpty(cmd)
                && (cmd.toUpperCase().contains("O2O") || cmd.toUpperCase().contains("OTO"))
                && !TextUtils.isEmpty(o2o_lat)
                && !TextUtils.isEmpty(o2o_lng)
        ){
            datas.put("__lat", o2o_lat);
            datas.put("__lng", o2o_lng);
        }
        datas.put("app_version", getAppVersion());
        datas.put("timestamp", getTimeStamp());// 每次请求都要上传版本号和时间戳等信息
        datas.put("market", getMarket());
        datas.put("shumid", SmAntiFraud.getDeviceId());
        return datas;
    }

    ///获取时间戳
    public static String getTimeStamp() {
        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
        Calendar c = Calendar.getInstance(Locale.getDefault());
        long nowTime = c.getTimeInMillis() + TIME_DURING;
        c.setTimeInMillis(nowTime);
        return format.format(c.getTime());
    }

    public static String getAppVersion() {
        try {
            PackageManager manager = MainApplication.getInstance().getPackageManager();
            PackageInfo info = manager.getPackageInfo(MainApplication.getInstance().getPackageName(), 0);
            return info.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return "";
    }

    /**
     * 返回market
     * @return
     */
    private static String getMarket(){
        if(TextUtils.isEmpty(market)){
            market = TUtils.getMetaValue(NetConfig.app, "UMENG_CHANNEL");
        }
        return market;
    }

    public static String getSSID(){
        return SPUtils.getSSID();
    }

    public static void saveSSID(String ssid){
        SPUtils.saveSSID(ssid);
    }

    /**
     * 获取到服务器的数据，重置域名、端口
     */
    public static void resetNetConfig(){
            IP = getDomain("ip");/*线上IP*/
            TCP_PORT = getTcpPort();/*线上端口*/
            DB_ID = 4000;/*线上DBID*/
            BUNDLE_ID = 4000;/*线上BUNDLEID*/
            VERSION_ID = 0;/*线上版本*/
            IMG_IP = getDomain("img_ip");/*线上版本*/
            IMG_PORT = getImage_Port();/*线上版本*/
    }
}
