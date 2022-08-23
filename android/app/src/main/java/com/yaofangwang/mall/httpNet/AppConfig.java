package com.yaofangwang.mall.httpNet;

import android.content.pm.PackageManager;
import android.provider.Settings;
import android.text.TextUtils;

import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.TUtils.SPUtils;

/**
 * Created by marti on 2018/7/26.
 * APP相关信息
 */
public class AppConfig {
    /*设备版本*/
    private static String versionName = "";
    /*唯一标识符*/
    private static String uniqueCode = "";

    /**
     * 获取版本号
     *
     * @return
     */
    public static String getVersionName() {
        if (TextUtils.isEmpty(versionName)) {
            try {
                versionName = MainApplication.getInstance().getPackageManager().getPackageInfo(MainApplication.getInstance().getPackageName(), 0).versionName;
            } catch (PackageManager.NameNotFoundException e) {
                e.printStackTrace();
            }
        }
        return versionName;
    }

    /**
     * 获取设备唯一标识符
     * 如果不判断授权直接获取，在华为手机崩溃
     * @return
     */
    public static String getDeviceID() {
        if (TextUtils.isEmpty(uniqueCode)) {
            uniqueCode =  Settings.Secure.getString(MainApplication.getInstance().getApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID);
            if(TextUtils.isEmpty(uniqueCode)){
                uniqueCode = "unique"+SPUtils.getJPushID();
            }
        }
        return uniqueCode;
    }
}
