package com.yaofangwang.mall.bean;

import com.google.gson.Gson;

import java.io.Serializable;

public class VersionInfo implements Serializable {
    public String new_version;//"1.1",                                    //新版本号
    public String compulsively;//"1",                                    //是否强制升级
    public String update_url;//"http://open.w.com/yfw_1.1.apk",            //升级地址
    public String update_desc;//"旧版就像初恋，很美但是再也回不去了，点击确定收获新欢！"     //新版下载提
    public String title;

    //TCP
    public String updateDescription; //描述
    public String updateLink;   // 升级地址
    public String isNeedUpdate; // "0" = 不需要更新 "1" = 需要更新
    public String isForceUpdate;// "0" = 不强制  "1" = 强制

    public static VersionInfo convert(String json){
        VersionInfo info = new Gson().fromJson(json, VersionInfo.class);
        info.update_desc = info.updateDescription;
        info.compulsively = info.isForceUpdate;
        info.update_url = info.updateLink;
        info.new_version = info.isNeedUpdate;
        return info;
    }


}