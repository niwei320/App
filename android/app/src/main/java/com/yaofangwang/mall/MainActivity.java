package com.yaofangwang.mall;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.database.ContentObserver;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.provider.Settings;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.text.TextUtils;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Toast;

import com.baidu.mobstat.StatService;
import com.bun.miitmdid.core.IIdentifierListener;
import com.bun.miitmdid.core.MdidSdkHelper;
import com.bun.miitmdid.supplier.IdSupplier;
import com.facebook.react.bridge.Callback;
import com.geetest.onelogin.OneLoginHelper;
import com.jdpaysdk.author.JDPayAuthor;
import com.umeng.socialize.UMShareAPI;
import com.yaofangwang.mall.Fragment.NearlyShopFragment;
import com.yaofangwang.mall.TUtils.AppManager;
import com.yaofangwang.mall.bean.ThirdLoginBean;
import com.yaofangwang.mall.onelogin.OneLoginResult;
import com.yaofangwang.mall.onelogin.OneLoginUtils;
import com.yaofangwang.mall.onelogin.StartOneLogin;
import com.yaofangwang.mall.utils.GpsUtil;
import com.yaofangwang.mall.utils.ThirdLoginUtils;

import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.LinkedList;
import java.util.List;

import pub.devrel.easypermissions.EasyPermissions;

import static com.jdpaysdk.author.Constants.PAY_RESPONSE_CODE;
import static com.yaofangwang.mall.AndroidNativeApi.emitRNDeviceEvent;
import static com.yaofangwang.mall.AndroidNativeApi.reactApplicationContext;

public class MainActivity extends MyReactActivity implements MyFragmentDelegate, StartOneLogin {
    private ReactFragment reactFragment;
    private List<Fragment> fragments = new LinkedList<>();
    private DialogFragment uploadFragmentDialog;
    //private List<NearShopBeanTcp.ResultBean> shopDatas = new ArrayList<>();
    private static final String TAG = "MainActivity";

    //onelogin
    private OneLoginUtils oneLoginUtils;
    private ProgressDialog progressDialog;
    public static final int ONELOGIN_REQUEST_CODE = 900;
    private static final int LOCATION_REQUEST_CODE = 901;

    public static final int RQF_LOGIN = 100;
    private ThirdLoginBean bean;
    public Handler mHandler = new Handler() {
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
                        OneLoginHelper.with().dismissAuthActivity();
                        if (auth_code != null && !auth_code.equals("")) {
                            bean = new ThirdLoginBean();
                            bean.type = "alipay";
                            bean.account_name = auth_code;
                            bean.nick_name = "";
                            bean.img_url = "";
                            //requestThirdLogin(bean);
                            if(msg.arg1 == 1){
                                Boolean isLoginToUserCenter = msg.arg2 == 1;
                                sendTransMisson("thirdAuthOK", bean, isLoginToUserCenter);
                            } else {
                                sendTransMisson("sss", bean);
                            }
                        }
                    } else {
                        // 其他状态值则为授权失败
                        Toast.makeText(MainActivity.this, "授权失败", Toast.LENGTH_SHORT).show();
                    }
                    break;
                }
                default:
                    break;

            }
        }
    };

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        emitRNDeviceEvent("onConfigurationChangedAndroid", "changed");
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "HelloWorld";
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onStop() {
        super.onStop();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (null != getSupportFragmentManager().findFragmentByTag("NearlyShopActivity")){
            Fragment fragment = getSupportFragmentManager().findFragmentByTag("NearlyShopActivity");
            fragment.getChildFragmentManager().beginTransaction()
                    .remove(fragment.getChildFragmentManager().findFragmentByTag("fragmentMap")).remove(fragment.getChildFragmentManager().findFragmentByTag("fragmentList")).commit();
            getSupportFragmentManager().beginTransaction().remove(fragment).commit();
        }
        setContentView(R.layout.activity_main);
        AppManager.getAppManager().addActivity(this);
        handlerJpushData();
        if (reactFragment == null) {
            reactFragment = new ReactFragment();
            reactFragment.setRootView(getRootView());
        }
        push(reactFragment, "ReactFragment");
        startGPSListener();
        ((MainApplication)MainApplication.getInstance()).MianActivityHadBeCreated = true;
        //工具类初始化
        oneLoginUtils = new OneLoginUtils(this, oneLoginResult);
        oneLoginUtils.oneLoginInit();
        oneLoginUtils.setRequestedOrientation(MainActivity.this);

//        //定位权限
//        int permissionCheckL = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION);
//        if ( permissionCheckL != PackageManager.PERMISSION_GRANTED ) {
//            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_REQUEST_CODE);
//        }
//        //手机信息权限
//        int permissionCheckP = ContextCompat.checkSelfPermission(this, android.Manifest.permission.READ_PHONE_STATE);
//        if (permissionCheckP != PackageManager.PERMISSION_GRANTED  ) {
//            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_PHONE_STATE}, ONELOGIN_REQUEST_CODE);
//        }
        //统一联盟获取OAID
        MdidSdkHelper.InitSdk(MainApplication.getInstance(), true, new IIdentifierListener() {
            @Override
            public void OnSupport(boolean b, IdSupplier idSupplier) {
                if (idSupplier != null && idSupplier.isSupported()){
                    StatService.setOaid(getApplicationContext(), idSupplier.getOAID());//百度统计使用
                    idSupplier.shutDown();
                }
            }

        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {
        switch (requestCode) {
            case ONELOGIN_REQUEST_CODE: { //获取手机信息权限后进行预取号
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    oneLoginUtils.oneLoginInit();
                }
                return;
            }
        }
    }

    public void startOneLogin(Boolean isLoginToUserCenter, Callback successCallback, Callback errorCallback) {
        progressDialog = ProgressDialog.show(MainActivity.this, null, "验证加载中", true, true);
        oneLoginUtils.requestToken(isLoginToUserCenter, successCallback, errorCallback);

    }

    private OneLoginResult oneLoginResult = new OneLoginResult() {
        @Override
        public void onResult() {
            if (progressDialog != null) {
                progressDialog.dismiss();
            }
        }

        @Override
        public void thirdOneLogin(String type, Boolean isLoginToUserCenter) {
            if(null != reactApplicationContext.getCurrentActivity())
                new ThirdLoginUtils(reactApplicationContext.getCurrentActivity()).initUtils(type, "OneLogin", isLoginToUserCenter);
        }

    };

    /**
     * 开启GPS监听
     */
    private void startGPSListener() {
        if (mGpsMonitor != null) {
            getContentResolver()
                    .registerContentObserver(
                            Settings.Secure.getUriFor(Settings.System.LOCATION_PROVIDERS_ALLOWED),
                            false, mGpsMonitor);
        }
    }

    /**
     * 关闭GPS监听
     */
    private void stopGPSListener() {
        if (mGpsMonitor != null) {
            getContentResolver().unregisterContentObserver(mGpsMonitor);
        }
    }

    public void sendTransMisson(String eventName, ThirdLoginBean params){
        sendTransMisson(eventName, params, false);
    }

    public void sendTransMisson(String eventName, ThirdLoginBean params, Boolean isLoginToUserCenter) {
        String message = "";
        JSONObject loginData = new JSONObject();
        try {
            loginData.put("key", params.account_name);
            loginData.put("nick_name", params.nick_name);
            loginData.put("type", params.type);
            loginData.put("device_no", params.account_name);
            loginData.put("img_url", params.img_url);
            loginData.put("isLoginToUserCenter", isLoginToUserCenter);
            message = loginData.toString();
        } catch (JSONException e) {
            message = e.getMessage();
        }
        emitRNDeviceEvent(eventName, message);
    }


    private void handlerJpushData() {
        String jpush_data = getIntent().getStringExtra("Jpush_Data");
        if (!TextUtils.isEmpty(jpush_data)) {
            emitRNDeviceEvent("Jpush_Data",jpush_data);
        }
        //将推送数据的数据保存
        ((MainApplication)MainApplication.getInstance()).receiveJpushData = jpush_data;
    }

    @Override
    protected void onResume() {
        super.onResume();
        setXiaomiStatusBar(getWindow(), false);
        setMeizuStatusBarDarkIcon(this, false);
        setHeightAndroidSdkApiStatusBarTransParent();
        // push(reactFragment, "ReactFragment");
        //每次屏幕可见查询是否有定位
        isOpenLocation();
    }



    private void setHeightAndroidSdkApiStatusBarTransParent() {
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.N){
            try {
                Class decorViewClazz = Class.forName("com.android.internal.policy.DecorView");
                Field field = decorViewClazz.getDeclaredField("mSemiTransparentStatusBarColor");
                field.setAccessible(true);
                field.setInt(getWindow().getDecorView(), Color.TRANSPARENT); //改为透明
            } catch (Exception e) {}
        }
    }

    /**
     * 判断是否有定位权限
     */
    private void isOpenLocation() {
        if (this != null && !this.isFinishing()) {
            boolean isOpen = GpsUtil.isOPen(MainApplication.getInstance()) && EasyPermissions.hasPermissions(this, android.Manifest.permission.ACCESS_COARSE_LOCATION);
            emitRNDeviceEvent("IS_OPEN_LOCATION", isOpen);
        }
    }

    public static boolean isXiaomi() {
        return "Xiaomi".equals(Build.MANUFACTURER);
    }

    public static boolean isMeizu() {
        return "Meizu".equals(Build.MANUFACTURER);
    }

    public static void setXiaomiStatusBar(Window window, boolean isLightStatusBar) {
        if (!isXiaomi()) return;
        Class<? extends Window> clazz = window.getClass();
        try {
            Class<?> layoutParams = Class.forName("android.view.MiuiWindowManager$LayoutParams");
            Field field = layoutParams.getField("EXTRA_FLAG_STATUS_BAR_DARK_MODE");
            int darkModeFlag = field.getInt(layoutParams);
            Method extraFlagField = clazz.getMethod("setExtraFlags", int.class, int.class);
            extraFlagField.invoke(window, isLightStatusBar ? darkModeFlag : 0, darkModeFlag);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void setMeizuStatusBarDarkIcon(Activity activity, boolean dark) {
        if (!isMeizu()) return;
        if (activity != null) {
            try {
                WindowManager.LayoutParams lp = activity.getWindow().getAttributes();
                Field darkFlag = WindowManager.LayoutParams.class.getDeclaredField("MEIZU_FLAG_DARK_STATUS_BAR_ICON");
                Field meizuFlags = WindowManager.LayoutParams.class.getDeclaredField("meizuFlags");
                darkFlag.setAccessible(true);
                meizuFlags.setAccessible(true);
                int bit = darkFlag.getInt(null);
                int value = meizuFlags.getInt(lp);
                if (dark) {
                    value |= bit;
                } else {
                    value &= ~bit;
                }
                meizuFlags.setInt(lp, value);
                activity.getWindow().setAttributes(lp);
            } catch (Exception e) {

            }
        }
    }


    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 100) {
            if (resultCode == RESULT_OK) {
                String type = data.getStringExtra("type");
                String value = data.getStringExtra("value");
                String qrCode = data.getStringExtra("scan_code");
                JSONObject jsonObject = new JSONObject();
                try {
                    jsonObject.put("value", value);
                    jsonObject.put("name", type);
                    jsonObject.put("scan_code", qrCode);
                } catch (JSONException e) {

                }
                Consts.myBlockingQueue.add(jsonObject.toString());
            } else if (resultCode == PAY_RESPONSE_CODE) {//京东支付回调
                String payResult = data.getStringExtra(JDPayAuthor.JDPAY_RESULT);
                try {
                    JSONObject json =new JSONObject(payResult);
                    String payStatus = json.get("payStatus").toString();
                    String toast;
                    int code;
                    switch (payStatus){
                        case "JDP_PAY_SUCCESS":
                            toast = "支付成功";
                            code = 0;
                            break;
                        case "JDP_PAY_CANCEL":
                            toast = "支付取消";
                            code = -1;
                            break;
                        case "JDP_PAY_FAIL":
                            toast = "支付失败";
                            code = -2;
                            break;
                        case "JDP_PAY_NOTHING":
                            toast = "无操作";
                            code = -5;
                            break;
                        default:
                            toast = "";
                            code = -5;
                    }
                    try {
                        if(code == 0){
                            emitRNDeviceEvent("paymentSuccess", "jd");
                        } else {
                            JSONObject payFailData = new JSONObject();
                            payFailData.put("payType", "jd");
                            payFailData.put("code", code);
                            emitRNDeviceEvent("paymentFailure", payFailData.toString());
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            } else {
                JSONObject jsonObject = new JSONObject();
                try {
                    jsonObject.put("value", "");
                    jsonObject.put("name", "");
                } catch (JSONException e) {

                }
                Consts.myBlockingQueue.add(jsonObject.toString());
            }

        }
        //返回取消安装或者取消授权的监听
        if (uploadFragmentDialog != null) {
            uploadFragmentDialog.onActivityResult(requestCode, resultCode, data);
        }
        if (requestCode == 11101 || requestCode == 10103 || requestCode == 5650) {
            UMShareAPI.get(this).onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public void onBackPressed() {
        List<Fragment> fragments = getSupportFragmentManager().getFragments();
        int needChangeBack = -1;
        for (Fragment fragment : fragments) {
            if (fragment instanceof NearlyShopFragment && !fragment.isHidden()) {
                needChangeBack = 1;
            }
        }
        if (needChangeBack == 1) {
            this.pop();
        } else {
            super.onBackPressed();
        }
    }


    @Override
    public void push(Fragment fragment, String tag) {
        getSupportFragmentManager().beginTransaction().add(R.id.id_main_container, fragment, tag).commit();
    }

    @Override
    public void pop() {
        List<Fragment> fragments = getSupportFragmentManager().getFragments();
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        //遍历所有的fragment
        for (Fragment fragment : fragments) {
            //当为ReactFragment的时候，显示
            if (fragment instanceof ReactFragment) {
                fragmentTransaction.show(fragment);
            } else {
                //隐藏除ReactFragment以外的所有fragment
                fragmentTransaction.hide(fragment);
            }
        }
        fragmentTransaction.commitAllowingStateLoss();
    }


    @Override
    public void startRN(String params) {
        //先切换RN视图
        emitRNDeviceEvent("shop_info",params);
        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                //获取所有的fragment
                List<Fragment> fragments = getSupportFragmentManager().getFragments();
                FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
                //遍历所有的fragment
                for (Fragment fragment : fragments) {
                    //当为ReactFragment的时候，显示
                    if (fragment instanceof ReactFragment) {
                        fragmentTransaction.show(fragment);
                    } else {
                        //隐藏除ReactFragment以外的所有fragment
                        fragmentTransaction.hide(fragment);
                    }
                }
                //再切换fragmnt
                fragmentTransaction.commit();
            }
        }, 1000);


    }

    @Override
    public void reactBack() {
        List<Fragment> fragments = getSupportFragmentManager().getFragments();
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        for (Fragment fragment : fragments) {
            fragmentTransaction.show(fragment);
        }
        fragmentTransaction.commit();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        AppManager.getAppManager().removeActivity(this);
        stopGPSListener();
        if (progressDialog != null) {
            progressDialog.dismiss();
        }
        oneLoginUtils.oneLoginCancel();
    }

    private final ContentObserver mGpsMonitor = new ContentObserver(null) {
        @Override
        public void onChange(boolean selfChange) {
            super.onChange(selfChange);
            isOpenLocation();
        }
    };

    @Override
    public void show(DialogFragment f, String tag) {
        if (f != null) {
            uploadFragmentDialog = f;
            f.show(getSupportFragmentManager(), tag);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (resetScreen()) {
            return;
        }
        emitRNDeviceEvent("SCHEME_ACTION", null);
        handlerJpushData();
    }

    /**
     * 重置页面，保证每次收到信息的时候一定是main页面
     * 返回是否强制更新的判断，如果强制更新就不让跳转逻辑继续执行
     */
    private boolean resetScreen() {
        if (uploadFragmentDialog != null && uploadFragmentDialog.getDialog().isShowing()) {
            if (uploadFragmentDialog.isCancelable()) {
                //当前不是强制更新，可以取消弹窗
                uploadFragmentDialog.dismiss();
            } else {
                return true;
            }
        }
        //如果是附近药店Fragment，就切换为主Fragment
        pop();
        return false;
    }
}
