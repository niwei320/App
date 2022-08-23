package com.yaofangwang.mall.utils;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.view.View;

/**
 * Created by marti on 2018/7/5.
 * 分享图片抽象类 - 生成分享页面的视图控制器
 */
public abstract class BaseShareControl {
    protected Context con;
    protected View rootView;
    protected Intent dataIntent;

    public BaseShareControl(Context con, Intent dataIntent) {
        this.con = con;
        this.dataIntent = dataIntent;
        rootView = initView();
    }

    /**
     * 初始化分享的视图
     * @return
     */
    protected abstract View initView();

    /**
     * 返回分享的链接，自己凭拼接好
     * @return
     */
    public abstract String getQRCodeURL();

    /**
     * cannot help but
     * @param bitmap
     */
    public abstract void setQRCodeBitmap(Bitmap bitmap);

    /**
     * 返回分享的视图
     * @return
     */
    public View getRootView(){
        return rootView;
    }

}
