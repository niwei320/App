package com.yaofangwang.mall.utils;

import android.app.Application;
import android.content.Context;
import android.content.SharedPreferences;

import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.TUtils.NotificationsUtils;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall.bean.LocationInfoBean;
import com.yaofangwang.mall.httpNet.AppConfig;
import com.yaofangwang.mall.httpNet.NetConfig;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class UserInfoManager {

    /*当前单例*/
    private static UserInfoManager userInfoManager;
    /*全局Context*/
    public static Application app;
    private static String deviceNo = "";
    private static String idfa = "";
    private static String version = "";
    private static String ip = "";
    private static String osVersion = "";
    private static String deviceName = "";
    private static String manufacturer = "";
    private static String netType = "";
    private static String yfwDomain = "";
    private static String market = "";
    private static String isPush = "";
    private static String longitude = "";
    private static String latitude = "";
    private static String androidAppkey = "a53db3d0a4f1bdd6c1232e1db16f232b";
    private SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");//设置日期格式
    private Context mContext;

    /*初始化，必须调用，建议在Application中*/
    public static void init(Application app) {
        synchronized (NetConfig.class) {
            if (userInfoManager == null) {
                synchronized (NetConfig.class) {
                    userInfoManager = new UserInfoManager(app);
                }
            }
        }
    }

    private UserInfoManager(Application app) {
        UserInfoManager.app = app;
        initUserInfo(app);
    }

    public void initUserInfo(Context context){
        this.mContext = context;
        String versionName = "";
        String net = "";
        String Domain = "";
        try {
            versionName = MainApplication.getInstance()
                    .getPackageManager()
                    .getPackageInfo(MainApplication.getInstance().getPackageName(), 0).versionName;
            SharedPreferences sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, context.MODE_PRIVATE);
            boolean net_type_istcp = sp.getBoolean("NET_TYPE_ISTCP", true);

            if(net_type_istcp){
                net = "tcp";
                Domain = sp.getString("TCP_NET_DOMAIN","yaofangwang.com");
            }else {
                net = "http";
                Domain = sp.getString("HTTP_NET_DOMAIN","yaofangwang.com");
            }

            deviceNo = AppConfig.getDeviceID();
            idfa = AppConfig.getDeviceID();
            version = versionName;
            ip = NetUtils.getIP(context);
            osVersion = android.os.Build.VERSION.RELEASE;
            deviceName = android.os.Build.MODEL;
            manufacturer = android.os.Build.BRAND;
            netType = net;
            yfwDomain = Domain;
            market = TUtils.getMetaValue(context,"UMENG_CHANNEL");
            boolean notificationEnabled = NotificationsUtils.isNotificationEnabled(context);
            if (notificationEnabled) {//true表示已开启
                isPush = "1";
            }else {
                isPush = "0";
            }
        }  catch (Exception e) {
        } finally {
        }
    }


    public static Map<String, Object> getBaseParam(){
        LocationInfoBean locationInfo = LocationManager.getLocationInfo();
        longitude = String.valueOf(locationInfo.getLongitude());
        latitude = String.valueOf(locationInfo.getLatitude());
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");//设置日期格式
        SharedPreferences sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, Context.MODE_PRIVATE);
        String ssid = sp.getString("ssid", "");
        Map<String, Object> baseParam = new HashMap<>();
        baseParam.put("__client", "phone");
        baseParam.put("__os", "android");
        baseParam.put("__device_no", deviceNo);
        baseParam.put("__app_version", version);
        baseParam.put("__os_version", osVersion);
        baseParam.put("__app_key", androidAppkey);
//        baseParam.put("__ssid", ssid);
        baseParam.put("__timestamp", df.format(new Date()));
        baseParam.put("__market", market);
        baseParam.put("__lat", latitude);
        baseParam.put("__lng", longitude);
        return baseParam;
    }

}
