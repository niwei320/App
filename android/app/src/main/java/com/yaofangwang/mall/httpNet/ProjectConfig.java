package com.yaofangwang.mall.httpNet;

import android.text.TextUtils;

import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.TUtils.SPUtils;
import com.yaofangwang.mall.TUtils.TUtils;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Created by marti on 2018/7/24.
 * 项目相关配置
 */
public class ProjectConfig {
    private static String market = "";
    private final static SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());

    /**
     * 添加全局参数
     * @param datas
     * @return
     */
    public static Map<String,String> addGlobalParameters(Map<String,String> datas){
        datas.put("app_key", Consts.api.app_key);
        datas.put("os", Consts.api.os);
        datas.put("market", getMarket());
        //在传参的时候就要把SSID带过来
//        datas.put("ssid", ((_BaseApplication) NetConfig.app).getAccoutID());
        datas.put("app_version", AppConfig.getVersionName());
        datas.put("device_no", AppConfig.getDeviceID());
        datas.put("idfa", AppConfig.getDeviceID());
        datas.put("timestamp", getTimeStamp());
        datas.put("from", "android");
        return datas;
    }

    /**
     * 转换为URL
     * @param datas
     * @param sourceUrl
     * @return
     */
    public static String convertToUrl(Map<String,String> datas, String sourceUrl){
        return TUtils.getUrlSpell(datas, sourceUrl);
    }

    /**
     * 拼写URL
     * @param urlItem
     * @param url
     * @return
     */
    public static String getSpellURL(String urlItem, String url){
        Map<String, String> datas = addGlobalParameters(new HashMap<String, String>());
        datas.put("url", url);
        String spellurl = TUtils.getUrlSpell(datas, urlItem);
        return spellurl;
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

    /**
     * 获取时间戳
     * @return
     */
    private static String getTimeStamp() {
        long during = SPUtils.getTimeDuring();
        Calendar c = Calendar.getInstance(Locale.getDefault());
        long nowTime = c.getTimeInMillis() + during;
        c.setTimeInMillis(nowTime);
        return format.format(c.getTime());
    }
}
