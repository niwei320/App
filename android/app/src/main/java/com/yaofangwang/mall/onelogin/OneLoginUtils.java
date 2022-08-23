package com.yaofangwang.mall.onelogin;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.RelativeLayout;

import com.cmic.sso.sdk.AuthRegisterViewConfig;
import com.cmic.sso.sdk.utils.rglistener.CustomInterface;
import com.facebook.react.bridge.Callback;
import com.geetest.onelogin.OneLoginHelper;
import com.geetest.onelogin.config.OneLoginThemeConfig;
import com.geetest.onelogin.listener.AbstractOneLoginListener;
import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.net.TcpUtils;
import com.yaofangwang.mall.utils.LoggerUtil;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;


/**
 * Created by 谷闹年 on 2019/4/1.
 * OneLogin工具类
 */
public class OneLoginUtils {

    /**
     * 后台配置的服务校验接口
     */
    public static final String CHECK_PHONE_URL = "https://onepass.geetest.com/onelogin/result";

    /**
     * 后台申请的 oneLogin ID
     */
    public static final String CUSTOM_ID = "6f7f603a336a40cc3f4237268fc4dd8c";

    /**
     * 返回状态为200则表示成功
     */
    public static final int ONE_LOGIN_SUCCESS_STATUS = 200;

    /**
     * 日志 TAG
     */
    public static final String TAG = "OneLogin";

    private Handler backHandler;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    private Context context;
    private OneLoginResult oneLoginResult;
    private Callback successCallback;
    private Callback errorCallback;
    private Boolean isCallbackOnce;
    private Boolean isLoginToUserCenter;

    public OneLoginUtils(Context context, OneLoginResult oneLoginResult) {
        this.context = context;
        this.oneLoginResult = oneLoginResult;
        isCallbackOnce = false;
        HandlerThread handlerThread = new HandlerThread("oneLogin-demo");
        handlerThread.start();
        backHandler = new Handler(handlerThread.getLooper());
    }

    /**
     * 初始化 需在 <p>onCreate</p> 方法内使用
     * 在初始化的时候进行预取号操作
     * 由于预取号是耗时操作 也可以放在application的donCreate方法中使用
     */
    public void oneLoginInit() {
        OneLoginHelper.with().init(context);
        oneLoginPreGetToken(false);
    }

    /**
     * 设置为竖屏
     */
    public void setRequestedOrientation(Activity activity) {
        OneLoginHelper.with().setRequestedOrientation(activity, true);
    }

    /**
     * 关闭 需在页面关闭时候调用
     */
    public void oneLoginCancel() {
        OneLoginHelper.with().cancel();
    }

    /**
     * 预取号接口
     * 在初始化的时候进行预取号操作
     * 由于预取号是耗时操作 也可以放在application的onCreate方法中使用
     */
    private void oneLoginPreGetToken(final boolean isRequestToken) {
        OneLoginHelper.with().preGetToken(CUSTOM_ID, 5000, new AbstractOneLoginListener() {
            @Override
            public void onResult(JSONObject jsonObject) {
                oneLoginResult.onResult();
                LoggerUtil.i(TAG, "预取号结果为：" + jsonObject.toString());
                try {
                    int status = jsonObject.getInt("status");
                    if (status == ONE_LOGIN_SUCCESS_STATUS) {
                        if (isRequestToken) {
                            oneLoginRequestToken();
                        }
                    } else {
//                        Toast.makeText(context, "预取号失败", Toast.LENGTH_SHORT).show();
                        if( errorCallback != null && isCallbackOnce){
                            errorCallback.invoke("{\"errorCode\":\"preGetTokenFail\"}");
                            isCallbackOnce = false;
                        }
                        LoggerUtil.i(TAG, "预取号失败");
                    }
                } catch (JSONException e) {
//                    Toast.makeText(context, "预取号失败", Toast.LENGTH_SHORT).show();
                    if( errorCallback != null && isCallbackOnce){
                        errorCallback.invoke("{\"errorCode\":\"preGetTokenFail\"}");
                        isCallbackOnce = false;
                    }
                    LoggerUtil.i(TAG, "预取号失败");
                }
            }

            @Override
            public void onPrivacyClick(String s, String s1) {

            }
        });
    }

    /**
     * 配置页面布局(默认竖屏)
     *
     * @return config
     */
    private OneLoginThemeConfig initConfig() {
        return new OneLoginThemeConfig.Builder()
                .setAuthBGImgPath("gt_one_login_bg")
                .setDialogTheme(false, 300, 500, 0, 0, false, false)
                .setStatusBar(0xFFFFFFFF, 0xFF333333, true)
                .setAuthNavLayout(0xFF3973FF, 49, true, false)
                .setAuthNavTextView("一键登录", 0xFFFFFFFF, 17, false, "服务条款", 0xFF000000, 17)
                .setAuthNavReturnImgView("top_back_green", 11, 24, false, 12)
                .setLogoImgView("gt_one_login_logo", 71, 71, true, 125, 0, 0)
                .setNumberView(0xFF333333, 26, dip2px(context, 35), 0, 0)
                .setSwitchView("切换账号", 0xFF1fdb9b, 16, false, dip2px(context, 100), 0, 0)
                .setLogBtnLayout("green_button", dip2px(context, 121), dip2px(context, 22), dip2px(context, 70), 0, 0)
                .setLogBtnTextView("一键登录", 0xFFFFFFFF, 16)
                .setLogBtnLoadingView("umcsdk_load_dot_white", 20, 20, 12)
                .setSloganView(0xFFA8A8A8, 11, dip2px(context, 55), 0, 0)
                .setPrivacyCheckBox("one_login_unchecked", "one_login_checked", false, 15, 15)
                .setPrivacyClauseText("药房网用户个人服务协议", "https://m.yaofangwang.com/app/agreement.html?os=android", "", "", "", "")
                .setPrivacyLayout(256, dip2px(context, 120), 0, 0, true)
                .setPrivacyClauseView(0xFF999999, 0xFF1fdb9b, 11)
                .setPrivacyTextView("登录注册并视为同意 《", "》 和 《", "、", "》 并使用本机号码登录")
                .build();
    }

    /**
     * 自定义控件
     * 注意：横屏的自定义控件的边距需要自己再重新按照设计图设计
     * Demo中自定义控件只支持竖屏，横屏的自定义控件需要自己实现
     */
    private void initView() {
        Button mTitleBtn = new Button(context);
        mTitleBtn.setId(R.id.login_by_pwd);
        mTitleBtn.setText("账号密码登录");
        mTitleBtn.setTextColor(0xff1fdb9b);
        mTitleBtn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        mTitleBtn.setBackgroundColor(Color.TRANSPARENT);
        RelativeLayout.LayoutParams mLayoutParams1 = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.WRAP_CONTENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
        mLayoutParams1.addRule(RelativeLayout.ALIGN_PARENT_RIGHT, RelativeLayout.TRUE);
        mTitleBtn.setLayoutParams(mLayoutParams1);

        LayoutInflater inflater1 = LayoutInflater.from(context);
        RelativeLayout relativeLayout = (RelativeLayout) inflater1.inflate(R.layout.relative_item_view, null);
        RelativeLayout.LayoutParams layoutParamsOther = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.WRAP_CONTENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
        layoutParamsOther.setMargins(0, 0, 0, dip2px(context, 20));
        layoutParamsOther.addRule(RelativeLayout.CENTER_HORIZONTAL);
        layoutParamsOther.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
        relativeLayout.setLayoutParams(layoutParamsOther);
        ImageView weixin = relativeLayout.findViewById(R.id.weixin);
        ImageView alipay = relativeLayout.findViewById(R.id.alipay);
        ImageView qq = relativeLayout.findViewById(R.id.qq);
        ImageView weibo = relativeLayout.findViewById(R.id.weibo);
        alipay.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                oneLoginResult.onResult();
                oneLoginResult.thirdOneLogin("ali", isLoginToUserCenter);
                LoggerUtil.i(TAG, "支付宝登录");
            }
        });
        weixin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                OneLoginHelper.with().dismissAuthActivity();
                oneLoginResult.onResult();
                oneLoginResult.thirdOneLogin("wx", isLoginToUserCenter);
                LoggerUtil.i(TAG, "微信登录");
            }
        });
        qq.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                OneLoginHelper.with().dismissAuthActivity();
                oneLoginResult.onResult();
                oneLoginResult.thirdOneLogin("qq", isLoginToUserCenter);
                LoggerUtil.i(TAG, "qq登录");

            }
        });
        weibo.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                OneLoginHelper.with().dismissAuthActivity();
                oneLoginResult.onResult();
                oneLoginResult.thirdOneLogin("weibo", isLoginToUserCenter);
                LoggerUtil.i(TAG, "微博登录");

            }
        });

        OneLoginHelper.with().addOneLoginRegisterViewConfig("text_button", new AuthRegisterViewConfig.Builder()
                .setView(mTitleBtn)
                .setRootViewId(AuthRegisterViewConfig.RootViewId.ROOT_VIEW_ID_TITLE_BAR)
                .setCustomInterface(new CustomInterface() {
                    @Override
                    public void onClick(Context context) {
                        oneLoginResult.onResult();
                        if(isCallbackOnce) {
                            errorCallback.invoke("{\"errorCode\":\"loginByPsw\"}");
                            isCallbackOnce = false;
                        }
                        OneLoginHelper.with().dismissAuthActivity();
                    }
                })
                .build()
        ).addOneLoginRegisterViewConfig("title_button", new AuthRegisterViewConfig.Builder()
                .setView(relativeLayout)
                .setRootViewId(AuthRegisterViewConfig.RootViewId.ROOT_VIEW_ID_BODY)
                .setCustomInterface(new CustomInterface() {
                    @Override
                    public void onClick(Context context) {
//                        Toast.makeText(context, "动态注册的其他按钮", Toast.LENGTH_SHORT).show();
                    }
                })
                .build()
        );
    }

    /**
     * 点击进行判断是否要进行取号
     * 由于预取号是放在初始化时候的，所以这个方法使用之前需判断预取号是否成功以及预取号accessCode是否超时
     * 比如OneLoginHelper.with().isPreGetTokenSuccess()&&!OneLoginHelper.with().isAccessCodeExpired()
     * 如果预取号失败则需要重新进行预取号
     * <p>
     * 注意：整个验证的流水号只能使用一次。即调用了一次取号并获取手机成功之后 再进行取号就需要重新预取号
     * 这里模拟测试环境 需要多次进行取号状态的话 则就需要再加一个判断取号是否成功!OneLoginHelper.with().isRequestTokenSuccess()
     * 如果取号成功即表示不能再进行取号 得重新预取号
     */
    public void requestToken(Boolean isToUserCenter, Callback success, Callback error) {
        isLoginToUserCenter = isToUserCenter;
        successCallback = success;
        errorCallback = error;
        isCallbackOnce = true;
        if (OneLoginHelper.with().isPreGetTokenSuccess() && !OneLoginHelper.with().isAccessCodeExpired() && !OneLoginHelper.with().isRequestTokenSuccess()) {
            oneLoginRequestToken();
        } else {
            oneLoginPreGetToken(true);
        }

    }

    /**
     * 取号接口
     * 在这个方法里也可以配置自定义的布局页面
     * 比如    initView() initLogin()
     */
    private void oneLoginRequestToken() {
        initView();
        OneLoginHelper.with().requestToken(initConfig(), new AbstractOneLoginListener() {
            @Override
            public void onResult(final JSONObject jsonObject) {
                oneLoginResult.onResult();
                LoggerUtil.i(TAG, "取号结果为：" + jsonObject.toString());
                try {
                    int status = jsonObject.getInt("status");
                    if (status == ONE_LOGIN_SUCCESS_STATUS) {
                        final String process_id = jsonObject.getString("process_id");
                        final String token = jsonObject.getString("token");
                        backHandler.post(new Runnable() {
                            @Override
                            public void run() {
                                verify(process_id, token);
                            }
                        });
                    } else {
                        OneLoginHelper.with().dismissAuthActivity();
                        if(isCallbackOnce){
                            switch (jsonObject.getInt("errorCode")){
                                case -20303:
                                    errorCallback.invoke("{\"errorCode\":\"accountChange\"}");
                                    break;
                                case -20301:
                                    errorCallback.invoke("{\"errorCode\":\"userCancel\"}");
                                    break;
                                case -20302:
                                    errorCallback.invoke("{\"errorCode\":\"userCancel\"}");
                                    break;
                                default: errorCallback.invoke(jsonObject.toString());
                                    break;
                            }
                            isCallbackOnce = false;
                        }
                    }
                } catch (JSONException e) {
                    OneLoginHelper.with().dismissAuthActivity();
                    if(isCallbackOnce){
                        errorCallback.invoke(jsonObject.toString());
                        isCallbackOnce = false;
                    }
                }
            }

            @Override
            public void onPrivacyClick(String s, String s1) {
                LoggerUtil.i(TAG,"当前点击了隐私条款名为：" + s + "---地址为:" + s1);
            }
        });
    }


    /**
     * 手机号校验接口 需要网站主配置相关接口进行获取手机号等操作
     * 在这个阶段，也需要调用OneLoginHelper.with().dismissAuthActivity()来进行授权框的销毁
     */
    private void verify(String id, String token) {

        HashMap<String, Object> datas = new HashMap<>();
        datas.put("__cmd", "guest.account.login");
        datas.put("process_id", id);
        datas.put("token", token);
        datas.put("is_onelogin", 1);
        if(!((MainApplication) MainApplication.getInstance()).from_unionid.equals("")){
            datas.put("from_unionid", ((MainApplication) MainApplication.getInstance()).from_unionid);
            ((MainApplication) MainApplication.getInstance()).from_unionid = "";
        }
        if(!((MainApplication) MainApplication.getInstance()).sub_siteid.equals("")) {
            datas.put("sub_siteid", ((MainApplication) MainApplication.getInstance()).sub_siteid);
            ((MainApplication) MainApplication.getInstance()).sub_siteid = "";
        }

        new TcpUtils(context).sendMessage(datas, new TcpUtils.OnResponseListener() {
            @Override
            public void onResponse(String s) {
                /**
                 * 关闭授权页面
                 * sdk内部除了返回等相关事件以为是不关闭授权页面的，需要手动进行关闭
                 */
                LoggerUtil.i(TAG, "校验结果为:" + s);
                oneLoginResult.onResult();
                if(isCallbackOnce) {
                    successCallback.invoke(s);
                    isCallbackOnce = false;
                }
                OneLoginHelper.with().dismissAuthActivity();
            }

            @Override
            public void onError(String s) {
                LoggerUtil.i(TAG, "校验结果为:" + s);
                oneLoginResult.onResult();
                if(isCallbackOnce) {
                    successCallback.invoke(s);
                    isCallbackOnce = false;
                }
                OneLoginHelper.with().dismissAuthActivity();
            }
        });

    }

    public static int dip2px(Context context, float dpValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dpValue * scale + 0.5f);
    }
}
