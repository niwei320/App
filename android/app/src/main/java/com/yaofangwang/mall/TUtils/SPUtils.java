package com.yaofangwang.mall.TUtils;

import android.content.SharedPreferences;

import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainApplication;

import static android.content.Context.MODE_PRIVATE;

/**
 * Created by marti on 2018/6/14.
 * SharedPreferences工具类
 */

public class SPUtils {
    private static SharedPreferences sp;

    static {
        sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MODE_PRIVATE);
    }

    /**
     * 获取是否第一次运行
     *
     * @return
     */
    public static boolean isFirstRun() {
        return sp.getBoolean(Consts.PreferenceKey.isWelcomeShowed, false);
    }


    /**
     * 保存是否第一次进入商品详情
     *
     */
    public static void saveIsFirstOpenGoodsDetails() {
        sp.edit().putBoolean("IsFirstOpenGoodsDetails", false).commit();
    }

    /**
     * 获取是否第一次进入商品详情
     *
     * @return
     */
    public static boolean isFirstOpenGoodsDetails() {
        return sp.getBoolean("IsFirstOpenGoodsDetails", true);
    }

    /**
     * 保存极光ID
     * @param id
     */
    public static void saveJPushID(String id) {
        sp.edit().putString("JPushID", id).commit();
    }

    /**
     * 获取极光ID
     * @return
     */
    public static String getJPushID() {
        return sp.getString("JPushID", "");
    }

    /**
     * 获取是否第一次运行
     * 这里没有提供存储是因为存储的写法是以前的，暂时只提供获取
     * @return
     */
    public static boolean isFristRun() {
        return sp.getBoolean(Consts.PreferenceKey.isWelcomeShowed, false);
    }

    /**
     * 获取时间戳
     * @return
     */
    public static long getTimeDuring() {
        return  sp.getLong(Consts.PreferenceKey.timeDuring, 0);
    }

    /**
     * 保存SSID
     * @param SSID
     */
    public static void saveSSID(String SSID){
        sp.edit().putString(Consts.PreferenceKey.ssid,SSID).commit();
    }

    /**
     * 获取SSID
     * @return
     */
    public static String getSSID(){
        return  sp.getString(Consts.PreferenceKey.ssid, "");
    }

    /**
     * 存储是否有报错信息
     * @param has
     */
    public static void saveHasCarshMsg(boolean has){
        sp.edit().putBoolean("CARSH_HAS_MSG",has).commit();
    }

    /**
     * 获取是否有报错信息
     * @return boolean
     */
    public static boolean getHasCarshMsg(){
        return  sp.getBoolean("CARSH_HAS_MSG", false);
    }


    /**
     * 获取ip地址
     * @return String
     */
    public static String getIpAddress(){
        return sp.getString("Debug_IP_Address", "onLine");
    }

    /**
     * 存储是否打开上传错误日志
     * @param switchStatus 是否打开
     */
    public static void saveUploadCrashMsgSwitch(boolean switchStatus){
        sp.edit().putBoolean("UPLOAD_ERROR_LOG_SWITCH",switchStatus).commit();
    }

    /**
     * 获取是否打开上传错误日志
     * @return boolean
     */
    public static boolean getUploadCrashMsgSwitch(){
        return  sp.getBoolean("UPLOAD_ERROR_LOG_SWITCH", true);
    }

}
