package com.yaofangwang.mall.utils;

import android.app.Activity;
import android.os.Message;
import android.support.annotation.NonNull;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.alipay.sdk.app.AuthTask;
import com.umeng.socialize.UMAuthListener;
import com.umeng.socialize.UMShareAPI;
import com.umeng.socialize.UMShareConfig;
import com.umeng.socialize.bean.SHARE_MEDIA;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainActivity;
import com.yaofangwang.mall.SignUtils;
import com.yaofangwang.mall.bean.ThirdLoginBean;

import java.io.UnsupportedEncodingException;
import java.lang.ref.WeakReference;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;

import static com.yaofangwang.mall.MainActivity.RQF_LOGIN;

/**
 *  第三方登录工具类
 */


public class ThirdLoginUtils {
    private WeakReference<Activity> activity;
    public ThirdLoginUtils(@NonNull Activity activity){
        if(activity == null){
            throw new NullPointerException();
        }
        this.activity = new WeakReference(activity);
    }

    public void initUtils(String type) {
        initUtils(type, "react-native", false);
    }
    public void initUtils(String type, String from, Boolean isLoginToUserCenter) {
        UMShareConfig config = new UMShareConfig();
        config.isNeedAuthOnGetUserInfo(true);
        UMShareAPI.get(activity.get()).setShareConfig(config);
        UMAuthListener umAuthListener = new UMAuthListener() {

            @Override
            public void onStart(SHARE_MEDIA platform) {
                //授权开始的回调
            }

            @Override
            public void onComplete(SHARE_MEDIA platform, int action, Map<String, String> data) {
                // 获取uid
                String uid = data.get("uid");
                if (!TextUtils.isEmpty(uid)) {
                    // uid不为空，获取用户信息
                    getUserInfo(platform, data, from, isLoginToUserCenter);
                } else {
                    Toast.makeText(activity.get(), "授权失败", Toast.LENGTH_SHORT).show();
                }

            }

            @Override
            public void onError(SHARE_MEDIA platform, int action, Throwable t) {
                Toast.makeText(activity.get(), "授权失败", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onCancel(SHARE_MEDIA platform, int action) {
                Toast.makeText(activity.get(), "授权取消", Toast.LENGTH_SHORT).show();
            }
        };
        if(null != type) {
            switch (type) {
                case "wx":
                    if (null != umAuthListener) {
                        UMShareAPI.get(activity.get()).getPlatformInfo(activity.get(), SHARE_MEDIA.WEIXIN, umAuthListener);

                    }
                    break;
                case "qq":
                    if (null != umAuthListener) {
                        UMShareAPI.get(activity.get()).getPlatformInfo(activity.get(), SHARE_MEDIA.QQ, umAuthListener);
                    }
                    break;
                case "weibo":
                    if (null != umAuthListener) {
                        UMShareAPI.get(activity.get()).getPlatformInfo(activity.get(), SHARE_MEDIA.SINA, umAuthListener);
                    }
                    break;
                case "ali":
                    loginByAli(activity.get(), from, isLoginToUserCenter);
                    break;
            }
        }
    }

    private void getUserInfo(final SHARE_MEDIA platform, Map<String, String> data,String cmdFrom, Boolean isLoginToUserCenter) {

        ThirdLoginBean bean = new ThirdLoginBean();
        bean.account_name = data.get("uid");
        if (platform.equals(SHARE_MEDIA.QQ)) {
            bean.type = "QQ";
        } else if (platform.equals(SHARE_MEDIA.SINA)) {
            bean.type = "weibo";
        } else if (platform.equals(SHARE_MEDIA.WEIXIN)) {
            bean.type = "weixin";
        }
        if (null != data) {
            bean.sex = data.get("gender");
            bean.nick_name = data.get("name");
            Log.e("bean.nick_name", bean.nick_name);
            bean.img_url = data.get("iconurl");
        }
        //Toast.makeText(activity.get(), bean.nick_name, Toast.LENGTH_SHORT).show();
        //将数据回传给js
        if(cmdFrom.equals("react-native")){
            ((MainActivity)activity.get()).sendTransMisson("sss",bean);
        } else {
            ((MainActivity)activity.get()).sendTransMisson("thirdAuthOK",bean, isLoginToUserCenter);
        }
    }

    public String sign(String content) {
        return SignUtils.sign(content, Consts.alipaypara.PRIVATE);
    }

    public String getSignType() {
        return "sign_type=\"RSA\"";
    }

    public String getSignDate() {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
        return format.format(new Date());
    }

    public String getAuthInfo() {
        // 服务接口名称， 固定值
        String authInfo = "apiname=\"com.alipay.account.auth\"";
        // 商户签约拿到的app_id，如：2013081700024223
        authInfo += "&app_id=" + "\"" + Consts.alipaypara.APPID + "\"";
        // 商户类型标识， 固定值
        authInfo += "&app_name=\"mc\"";
        // 授权类型，授权常量值为"AUTHACCOUNT", 登录常量值为"LOGIN"
        authInfo += "&auth_type=\"AUTHACCOUNT\"";
        // 业务类型， 固定值
        authInfo += "&biz_type=\"openservice\"";
        // 商户签约拿到的pid，如：2088102123816631
        authInfo += "&pid=" + "\"" + Consts.alipaypara.DEFAULT_PARTNER + "\"";
        // 产品码， 固定值
        authInfo += "&product_id=\"WAP_FAST_LOGIN\"";
        // 授权范围， 固定值
        authInfo += "&scope=\"kuaijie\"";
        // 商户标识该次用户授权请求的ID，该值在商户端应保持唯一，如：kkkkk091125
        authInfo += "&target_id=" + "\"" + "198964yyyyy" + "\"";
        // 签名时间戳
        authInfo += "&sign_date=" + "\"" + getSignDate() + "\"";
        return authInfo;
    }

    public void loginByAli(final Activity con, String cmdFrom, boolean isLoginToUserCenter){
        // 授权信息
        String info = getAuthInfo();
        // 对授权信息做签名
        String sign = sign(info);
        try {
            // 仅需对sign 做URL编码
            sign = URLEncoder.encode(sign, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        // 完整的符合支付宝授权规范的参数信息
        final String authInfo = info + "&sign=\"" + sign + "\"&" + getSignType();

        Runnable authRunnable = new Runnable() {

            @Override
            public void run() {
                // 构造AuthTask 对象
                AuthTask authTask = new AuthTask(con);
                // 调用授权接口，获取授权结果
                String result = authTask.auth(authInfo,true);
                Message msg = new Message();
                msg.what = RQF_LOGIN;
                msg.obj = result;
                if(cmdFrom.equals("react-native")){
                    msg.arg1 = 0;
                } else {
                    msg.arg1 = 1;
                }
                if(isLoginToUserCenter){
                    msg.arg2 = 1;
                } else {
                    msg.arg2 = 0;
                }
                ((MainActivity)activity.get()).mHandler.sendMessage(msg);
            }
        };

        //必须异步调用
        Thread authThread = new Thread(authRunnable);
        authThread.start();
    }



}
