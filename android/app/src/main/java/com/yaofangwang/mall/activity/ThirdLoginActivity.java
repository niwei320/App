package com.yaofangwang.mall.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.alipay.sdk.app.AuthTask;
import com.facebook.react.ReactActivity;
import com.umeng.socialize.UMAuthListener;
import com.umeng.socialize.UMShareAPI;
import com.umeng.socialize.UMShareConfig;
import com.umeng.socialize.bean.SHARE_MEDIA;
import com.yaofangwang.mall.AuthResult;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.SignUtils;
import com.yaofangwang.mall.TUtils.AppManager;
import com.yaofangwang.mall.bean.ThirdLoginBean;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;

import static com.yaofangwang.mall.AndroidNativeApi.emitRNDeviceEvent;


public class ThirdLoginActivity extends ReactActivity {

    public static final String CHOOSE_TYPE = "choose_type";




    private Handler mHandler = new Handler() {
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case RQF_LOGIN: {
                    AuthResult authResult = new AuthResult((String) msg.obj);
                    // 支付宝返回此次授权结果及加签，建议对支付宝签名信息拿签约时支付宝提供的公钥做验签
                    String resultInfo = authResult.getResult();
                    String resultStatus = authResult.getResultStatus();
                    String auth_code = authResult.getAuthCode();
                    // 判断resultStatus 为“9000”且result_code
                    // 为“200”则代表授权成功，具体状态码代表含义可参考授权接口文档
                    if (TextUtils.equals(resultStatus, "9000") && TextUtils.equals(authResult.getResultCode(), "200")) {
                        // 获取alipay_open_id，调支付时作为参数extern_token 的value
                        // 传入，则用户使用的支付账户为该授权账户
                        // TUtils.showShortCustomToast(getContent(), "授权成功",
                        // R.drawable.toast_y);
                        if (auth_code != null && !auth_code.equals("")) {
                            bean = new ThirdLoginBean();
                            bean.type = "alipay";
                            bean.account_name = auth_code;
                            bean.nick_name = "";
                            bean.img_url = "";
                            //requestThirdLogin(bean);
                            Toast.makeText(ThirdLoginActivity.this, bean.account_name, Toast.LENGTH_SHORT).show();
                            sendTransMisson("sss",bean);
                            finish();
                        }
                    } else {
                        // 其他状态值则为授权失败
                        Toast.makeText(ThirdLoginActivity.this, "授权失败", Toast.LENGTH_SHORT).show();
                    }
                    break;
                }
                default:
                    break;

            }
        }
    };




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String type = getIntent().getStringExtra(CHOOSE_TYPE);
        AppManager.getAppManager().addActivity(this);
        UMShareConfig config = new UMShareConfig();
        config.isNeedAuthOnGetUserInfo(true);
        UMShareAPI.get(this).setShareConfig(config);


        if(null != type) {
            switch (type) {
                case "wx":
                    if (null != umAuthListener) {
                        UMShareAPI.get(this).getPlatformInfo(this, SHARE_MEDIA.WEIXIN, umAuthListener);

                    }
                    break;
                case "qq":
                    if (null != umAuthListener) {
                        UMShareAPI.get(this).getPlatformInfo(this, SHARE_MEDIA.QQ, umAuthListener);
                    }
                    break;
                case "ali":
                    loginByAli(this);
                    break;
            }
        }
    }

    public void loginByAli(final Activity activity){
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
                AuthTask authTask = new AuthTask(activity);
                // 调用授权接口，获取授权结果
                String result = authTask.auth(authInfo,true);
                Message msg = new Message();
                msg.what = RQF_LOGIN;
                msg.obj = result;
                mHandler.sendMessage(msg);
            }
        };

        //必须异步调用
        Thread authThread = new Thread(authRunnable);
        authThread.start();
    }

    public String getSignType() {
        return "sign_type=\"RSA\"";
    }

    public String sign(String content) {
        return SignUtils.sign(content, Consts.alipaypara.PRIVATE);
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



    public String getSignDate() {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
        return format.format(new Date());
    }









    private UMAuthListener umAuthListener = new UMAuthListener() {

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
                getUserInfo(platform, data);
            } else {
                Toast.makeText(ThirdLoginActivity.this, "授权失败", Toast.LENGTH_SHORT).show();
                finish();
            }

        }

        @Override
        public void onError(SHARE_MEDIA platform, int action, Throwable t) {
            Toast.makeText(ThirdLoginActivity.this, "授权失败", Toast.LENGTH_SHORT).show();
            finish();
        }

        @Override
        public void onCancel(SHARE_MEDIA platform, int action) {
            Toast.makeText(ThirdLoginActivity.this, "授权取消", Toast.LENGTH_SHORT).show();
            finish();
        }
    };

    private static final int RQF_LOGIN = 100;
    private ThirdLoginBean bean;


    private void getUserInfo(final SHARE_MEDIA platform, Map<String, String> data) {

        bean = new ThirdLoginBean();
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
        Toast.makeText(ThirdLoginActivity.this, bean.nick_name, Toast.LENGTH_SHORT).show();
        //将数据回传给js
        sendTransMisson("sss",bean);
        finish();
    }

    public void sendTransMisson(String eventName, ThirdLoginBean params) {
        String message = "";
        JSONObject loginData = new JSONObject();
        try {
            loginData.put("key",params.account_name);
            loginData.put("nick_name",params.nick_name);
            loginData.put("type",params.type);
            loginData.put("device_no",params.account_name);
            loginData.put("img_url",params.img_url);
            message = loginData.toString();
        } catch (JSONException e) {
            message = e.getMessage().toString();
        }
        emitRNDeviceEvent(eventName, message);
    }



    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        UMShareAPI.get(this).onActivityResult(requestCode, resultCode, data);

    }

}
