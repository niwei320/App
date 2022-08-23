package com.yaofangwang.mall;

import android.Manifest;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.app.UploadApkFragment;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;
import android.text.format.Formatter;
import android.util.Log;
import android.widget.Toast;

import com.alipay.sdk.app.EnvUtils;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.baidu.mapapi.model.LatLng;
import com.baidu.mapapi.navi.BaiduMapAppNotSupportNaviException;
import com.baidu.mapapi.search.core.PoiInfo;
import com.baidu.mapapi.search.core.SearchResult;
import com.baidu.mapapi.search.geocode.GeoCodeOption;
import com.baidu.mapapi.search.geocode.GeoCodeResult;
import com.baidu.mapapi.search.geocode.GeoCoder;
import com.baidu.mapapi.search.geocode.OnGetGeoCoderResultListener;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeOption;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeResult;
import com.baidu.mapapi.search.poi.OnGetPoiSearchResultListener;
import com.baidu.mapapi.search.poi.PoiCitySearchOption;
import com.baidu.mapapi.search.poi.PoiDetailResult;
import com.baidu.mapapi.search.poi.PoiDetailSearchResult;
import com.baidu.mapapi.search.poi.PoiIndoorResult;
import com.baidu.mapapi.search.poi.PoiNearbySearchOption;
import com.baidu.mapapi.search.poi.PoiResult;
import com.baidu.mapapi.search.poi.PoiSearch;
import com.baidu.mapapi.utils.DistanceUtil;
import com.baidu.mapapi.utils.OpenClientUtil;
import com.baidu.mapapi.utils.route.BaiduMapRoutePlan;
import com.baidu.mapapi.utils.route.RouteParaOption;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.geetest.onelogin.OneLoginHelper;
import com.google.gson.Gson;
import com.ishumei.smantifraud.SmAntiFraud;
import com.jdpaysdk.author.JDPayAuthor;
import com.sobot.chat.ZCSobotApi;
import com.sobot.chat.api.model.Information;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import com.umeng.analytics.MobclickAgent;
import com.umeng.commonsdk.UMConfigure;
import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.Fragment.NearlyShopFragment;
import com.yaofangwang.mall.TUtils.AppManager;
import com.yaofangwang.mall.TUtils.GoMarketUtil;
import com.yaofangwang.mall.TUtils.NotificationsUtils;
import com.yaofangwang.mall.TUtils.SPUtils;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall.TUtils.UpdateJsAsync;
import com.yaofangwang.mall.activity.AdressLocationMapActivity;
import com.yaofangwang.mall.activity.CaptureActivity;
import com.yaofangwang.mall.activity.ChangeIpActivity;
import com.yaofangwang.mall.activity.H5HuodongActivity;
import com.yaofangwang.mall.activity.ValueTrendChartActivity;
import com.yaofangwang.mall.bean.JdPayParamsBean;
import com.yaofangwang.mall.bean.LocationInfoBean;
import com.yaofangwang.mall.bean.NewWxPayParamsBean;
import com.yaofangwang.mall.bean.OrderInfoKeyValueBean;
import com.yaofangwang.mall.bean.VersionInfo;
import com.yaofangwang.mall.httpNet.AppConfig;
import com.yaofangwang.mall.httpNet.Net;
import com.yaofangwang.mall.net.ProjectGlaobleParams;
import com.yaofangwang.mall.net.TcpUtils;
import com.yaofangwang.mall.onelogin.StartOneLogin;
import com.yaofangwang.mall.pay.AliPayUtils;
import com.yaofangwang.mall.pay.PayListener;
import com.yaofangwang.mall.pay.WxPayUtils;
import com.yaofangwang.mall.utils.CrashHandlerUtil;
import com.yaofangwang.mall.utils.GpsUtil;
import com.yaofangwang.mall.utils.LoggerUtil;
import com.yaofangwang.mall.utils.NetUtils;
import com.yaofangwang.mall.utils.ThirdLoginUtils;
import com.yaofangwang.mall.utils.UshareUtils;
import com.yaofangwang.mall.widgtes.LoadingDialog;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import pub.devrel.easypermissions.EasyPermissions;

import static android.content.Context.ACTIVITY_SERVICE;
import static com.yaofangwang.mall.MainActivity.ONELOGIN_REQUEST_CODE;
import static com.yaofangwang.mall.TUtils.SPUtils.saveUploadCrashMsgSwitch;
import static java.lang.Math.atan2;
import static java.lang.Math.cos;
import static java.lang.Math.sin;
import static java.lang.Math.sqrt;

/**
 * Created by admin on 2018/9/10.
 */

public class AndroidNativeApi extends ReactContextBaseJavaModule implements LifecycleEventListener {
    public static ReactApplicationContext reactApplicationContext;
    private PoiSearch mPoiSearch;
    private GeoCoder mSearch;

    AndroidNativeApi(ReactApplicationContext reactContext) {
        super(reactContext);
        reactApplicationContext = reactContext;
        reactApplicationContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "AndroidNativeApi";
    }

    //一键登录
    @ReactMethod
    public void oneLogin(Boolean isLoginToUserCenter, Callback successCallback, Callback errorCallback){
        if(getCurrentActivity()instanceof StartOneLogin){
            ((StartOneLogin)getCurrentActivity()).startOneLogin(isLoginToUserCenter, successCallback, errorCallback);
        }
    }

    //返回预取号是否成功
    @ReactMethod
    public void isOneLoginPreGetTokenSuccess(Callback callback){
        callback.invoke(OneLoginHelper.with().isPreGetTokenSuccess());
    }


    /* 原生回传值到RN
    * */
    @ReactMethod
    public void startActivityForResult(Callback successCallback) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (null != currentActivity) {
                Class aimActivity = Class.forName("com.yaofangwang.mall.activity.CaptureActivity");
                Intent intent = new Intent(currentActivity, aimActivity);
                currentActivity.startActivityForResult(intent, 100);
                String result = Consts.myBlockingQueue.take();
                successCallback.invoke(result);
            }
        } catch (Exception e) {
            //erroCallback.invoke(e.getMessage());
            throw new JSApplicationIllegalArgumentException(
                    "Could not open the activity : " + e.getMessage());
        }
    }

    /*
    * 附近药店
    * */
    /*
    * 跳转原生附近药店
    * */

    @ReactMethod
    public void startNative() {
        if (getCurrentActivity() instanceof MyFragmentDelegate) {
            MyFragmentDelegate fragmentDelegate = (MyFragmentDelegate) getCurrentActivity();
            //调用push方法，添加一个fragment到activity
            List<Fragment> fragments = ((MainActivity)getCurrentActivity()).getSupportFragmentManager().getFragments();
            FragmentTransaction fragmentTransaction = ((MainActivity)getCurrentActivity()).getSupportFragmentManager().beginTransaction();
            if(((MainActivity)getCurrentActivity()).getSupportFragmentManager().findFragmentByTag("NearlyShopActivity") == null){
                fragmentDelegate.push(new NearlyShopFragment(), "NearlyShopActivity");
            }else {
                for (Fragment fragment : fragments) {
                    //当为ReactFragment的时候，显示
                    if (fragment instanceof ReactFragment) {
                        fragmentTransaction.hide(fragment);
                    } else {
                        if(fragment instanceof NearlyShopFragment){
                            ((NearlyShopFragment)fragment).locationAndRequestData();
                        }
                        //隐藏除ReactFragment以外的所有fragment
                        fragmentTransaction.show(fragment);
                    }
                }
                fragmentTransaction.commitAllowingStateLoss();
            }
              //((MainActivity)getCurrentActivity()).show();
        }
    }

    /**
     * 向RN发送事件
     * @param key 关键字
     * @param value 值
     */
    public static void emitRNDeviceEvent(String key, Object value) {
        if(reactApplicationContext != null) {
            try {
                reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(key, value);
            }catch (RuntimeException e){
                LoggerUtil.e("YFWMainActivity",e.getMessage());
            }
        }
    }

    /**
     * rn点击返回的时候
     */
    @ReactMethod
    public void reactBack() {
        if (getCurrentActivity() instanceof MyFragmentDelegate) {
            //调用reactBack方法，使所有的fragment可见
            MyFragmentDelegate fragmentDelegate = (MyFragmentDelegate) getCurrentActivity();
            fragmentDelegate.reactBack();
        }
    }


    /*
    * 开始定位
    * 使用场景: 初始化app的时候  listener 传null
    * */
    @ReactMethod
    public void startLocationNoCallback() {
        LocationManager.getInstance().start(true, null);
    }


    /*
    *  开始定位
    *  使用场景   需要获取定位后的回调
    * */
    @ReactMethod
    public void startLocationWithCallback(final Callback successCallback, final Callback failCallback) {
        if (!LocationManager.isSuccess()) {
            LocationManager.getInstance().start(true, new LocationManager.OnLocationListener() {
                @Override
                public boolean onSuccess(LocationInfoBean bean) {
                    JSONObject locationData = new JSONObject();
                    try {
                        locationData.put("city", bean.getCity());
                        locationData.put("name", bean.getAddress());
                        locationData.put("lat", bean.getLatitude()+"");
                        locationData.put("lng", bean.getLongitude()+"");
                    } catch (JSONException e) {
                        failCallback.invoke();
                    }
                    successCallback.invoke(locationData.toString());
                    return false;
                }

                @Override
                public void onFailure() {
                    failCallback.invoke();
                }
            });
        } else {
            LocationInfoBean locationInfo = LocationManager.getLocationInfo();
            JSONObject locationData = new JSONObject();
            try {
                locationData.put("city", locationInfo.getCity());
                locationData.put("name", locationInfo.getAddress());
            } catch (JSONException e) {
                failCallback.invoke();
            }
            successCallback.invoke(locationData.toString());
        }
    }

    /*
    * 重新定位
    * */
    @ReactMethod
    public void chooseLocationData(final Callback successCallback, final Callback failCallback) {
        LocationManager.getInstance().start(true, new LocationManager.OnLocationListener() {
            @Override
            public boolean onSuccess(LocationInfoBean bean) {
                LocationInfoBean locationInfo = LocationManager.getLocationInfo();
                JSONObject locationData = new JSONObject();
                try {
                    locationData.put("name", locationInfo.getAddress());
                    locationData.put("lat", locationInfo.getLatitude() + "");
                    locationData.put("lon", locationInfo.getLongitude() + "");
                    locationData.put("city", locationInfo.getCity() + "");
                    locationData.put("province", locationInfo.getProvince()+"");
                    locationData.put("area", locationInfo.getDistrict()+"");
                    locationData.put("address", locationInfo.getAddressStr()+"");
                    successCallback.invoke(locationData.toString());
                } catch (JSONException e) {
                    failCallback.invoke();
                }
                return false;
            }

            @Override
            public void onFailure() {
                failCallback.invoke();
            }
        });
    }


    /*
    *
    *  获取定位
    * */

    @ReactMethod
    public void getLoccation(Callback successCallback, Callback failCallback) {
        LocationInfoBean locationInfo = LocationManager.getLocationInfo();
        JSONObject locationData = new JSONObject();
        try {
            locationData.put("longitude", locationInfo.getLongitude());
            locationData.put("latitude", locationInfo.getLatitude());
            locationData.put("city", locationInfo.getCity());
            locationData.put("district", locationInfo.getDistrict());
            locationData.put("province", locationInfo.getProvince());
            locationData.put("areaType", locationInfo.getAreaType());
            locationData.put("unicode", locationInfo.getUnicode());
            locationData.put("provinceCode", locationInfo.getProvinceCode());
            locationData.put("cityCode", locationInfo.getCityCode());
            locationData.put("street", locationInfo.getStreet());
            locationData.put("locType", locationInfo.getLocType());
            locationData.put("radius", locationInfo.getRadius());
            locationData.put("isGetAddrees", locationInfo.isGetAddrees());
            locationData.put("isSuccess", locationInfo.isSuccess);
            locationData.put("distreectCode", locationInfo.getDistreectCode());
            locationData.put("address", locationInfo.getAddress());
            successCallback.invoke(locationData.toString());
        } catch (JSONException e) {
            failCallback.invoke(e.getMessage());
        }
    }


    /*
    *  第三方登录
    * */

    @ReactMethod
    public void startLoginQQ(String type) {
        new ThirdLoginUtils(getCurrentActivity()).initUtils(type);
    }





    /*
    *  扫码
    * */

    @ReactMethod
    public void qrSearch() {
        if(reactApplicationContext == null){
            return;
        }
        if (EasyPermissions.hasPermissions(reactApplicationContext, Manifest.permission.CAMERA)) {
            reactApplicationContext.startActivity(new Intent(reactApplicationContext, CaptureActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        } else {
            EasyPermissions.requestPermissions(this, "请求相机权限", 1000, android.Manifest.permission.CAMERA);
        }
    }

    /*
    *  function 吐司
    * */

    @ReactMethod
    public void showToast(String msg) {
        if(reactApplicationContext != null){
            Toast.makeText(reactApplicationContext, msg, Toast.LENGTH_SHORT).show();
        }
    }

    /*
    *  function 销毁当前原生Activity
    * */
    @ReactMethod
    public void finishNativeScreen() {
        AppManager.getAppManager().currentActivity().finish();
    }


    /*
    *  分享短信
    * */
    @ReactMethod
    public void shareSMS(String text) {
        if(reactApplicationContext == null){
            return;
        }
         Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:"));
         intent.putExtra("sms_body", text);
         reactApplicationContext.getCurrentActivity().startActivity(intent);
    }

    /**
     * 分享
     *
     * @param chooseType
     * @param data
     */
    @ReactMethod
    public void chooseShareClient(String chooseType, String data) {
        if (!EasyPermissions.hasPermissions(getCurrentActivity(), PERMISSIONS_STORAGE)) {
            EasyPermissions.requestPermissions(getCurrentActivity(), "需要存储权限", 0, PERMISSIONS_STORAGE);
            return;
        } else {
            new UshareUtils(getCurrentActivity()).init(chooseType, data, "", "", "");
        }
    }

    /*
    *
    *  智齿 咨询
    * */
    @ReactMethod
    public void startZhichiCustomer() {
        Information info = new Information();
        info.setApp_key(Consts.Zhichi_appkey);
        if (reactApplicationContext != null) {
            ZCSobotApi.openZCChat(reactApplicationContext, info);
        }
    }

    /**
     * 申请手机信息权限 定位及手机状态
     */
    @ReactMethod
    public void requestPermissions() {
        if (reactApplicationContext != null) {
            int permissionCheckL = ContextCompat.checkSelfPermission(reactApplicationContext, android.Manifest.permission.ACCESS_COARSE_LOCATION);
            int permissionCheckP = ContextCompat.checkSelfPermission(reactApplicationContext, android.Manifest.permission.READ_PHONE_STATE);
            if ((permissionCheckP != PackageManager.PERMISSION_GRANTED || permissionCheckL != PackageManager.PERMISSION_GRANTED) && getCurrentActivity() != null) {
                ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.READ_PHONE_STATE}, ONELOGIN_REQUEST_CODE);
            }
        }
    }

    /**
     * 返回数美ID
     */
    @ReactMethod
    public void getDeviceId(final Callback callback) {
        String deviceId = SmAntiFraud.getDeviceId();
        callback.invoke(deviceId);
    }

    /**
     * 数美SDK初始化
     */
    @ReactMethod
    public void initSMSDK() {

        // 如果 AndroidManifest.xml 中没有指定主进程名字，主进程名默认与 packagename 相同 // 如下条件判断保证只在主进程中初始化 SDK
        if (reactApplicationContext != null && reactApplicationContext.getPackageName().equals(getCurProcessName(this.getReactApplicationContext()))) {
            SmAntiFraud.SmOption option = new SmAntiFraud.SmOption(); //1.通用配置项
            option.setOrganization(Consts.smpara.organization); //必填，组织标识，邮件中organization 项
            option.setAppId(Consts.smpara.appId); //必填，应用标识，登录数美后台应用管理查看
            option.setPublicKey(Consts.smpara.android_public_key); //必填，加密 KEY，邮件中 android_public_key 附件内容
            option.setAinfoKey(Consts.smpara.ainfoKey); //必填，加密 KEY，邮件中 Android ainfo key 项
            // 2.连接海外机房特殊配置项，仅供设备数据上报海外机房客户使用
            // option.setArea(SmAntiFraud.AREA_XJP); //连接新加坡机房客户使用此选项
            // option.setArea(SmAntiFraud.AREA_FJNY); //连接美国机房客户使用此选项
            // 3.SDK 初始化
            SmAntiFraud.create(this.getReactApplicationContext(), option);
            //4.获取设备标识，注意获取 deviceId，这个接口在需要使用 deviceId 时地方调用
            String deviceId = SmAntiFraud.getDeviceId();
//            ToastUtil.showToast(this.getReactApplicationContext(),deviceId);
        }
    }
    /**
     * 友盟SDK初始化
     */
    @ReactMethod
    public void initUMengSDK() {
        UMConfigure.init(reactApplicationContext.getApplicationContext(), UMConfigure.DEVICE_TYPE_PHONE, "7ca9d6b2bb83863b6e8a24f36dea09f0");
    }

    String getCurProcessName(Context context) {
        int pid = android.os.Process.myPid();
        ActivityManager mActivityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        if(null != mActivityManager.getRunningAppProcesses()){
            for (ActivityManager.RunningAppProcessInfo appProcess : mActivityManager.getRunningAppProcesses()) {
                if (appProcess.pid == pid) {
                    return appProcess.processName;
                }
            }
        }
        return null;
    }

    /*
    *  支付
    * */
    @ReactMethod
    public void requsetPayment(String paymentInfoData, String paymentType, boolean isTcp) {
        if (isTcp) {
            //TCP支付
            PayListener listener = new PayListener() {
                @Override
                public void onSuccess(String payType) {
                    emitRNDeviceEvent("paymentSuccess", payType);
                }

                @Override
                public void onFailure(String payType, int code) {
                    JSONObject payFailData = new JSONObject();
                    try {
                        payFailData.put("payType", payType);
                        payFailData.put("code", code);
                        emitRNDeviceEvent("paymentFailure", payFailData.toString());
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            };
            if ("ali".equals(paymentType)) {
                String param = "";
                try {
                    JSONObject json = new JSONObject(paymentInfoData);
                    Object result = json.opt("result");
                    param = result.toString();
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                if(SPUtils.getIpAddress().equals("onLine")){
                    EnvUtils.setEnv(EnvUtils.EnvEnum.ONLINE);
                } else {
                    EnvUtils.setEnv(EnvUtils.EnvEnum.SANDBOX);
                }
                AliPayUtils aliPayUtils = new AliPayUtils(getCurrentActivity());
                aliPayUtils.startPay(param, listener);
            }
            if("wx".equals(paymentType)) {
                OrderInfoKeyValueBean bean = new OrderInfoKeyValueBean();
                try {
                    NewWxPayParamsBean paramsBean = new Gson().fromJson(paymentInfoData, NewWxPayParamsBean.class);
                    if (paramsBean != null && paramsBean.getParam() != null) {
                        NewWxPayParamsBean.ParamBean param = paramsBean.getParam();
                        bean.mch_id = param.getPartnerid();//商家ID
                        bean.prepay_id = param.getPrepayid();//订单号
                        bean.nonce_str = param.getNoncestr();// 随机字符串，可自己生成
                        bean.appId = param.getAppid();//APPID
                        bean.Package = param.getPackageX();//packageID
                        bean.timestamp = param.getTimestamp();//时间戳
                        bean.key = param.getSign();//签名
                    }
                } catch (Exception e) {
                }
                WxPayUtils wxPayUtils = new WxPayUtils(getCurrentActivity());
                wxPayUtils.pay(bean, listener, true);
            }
            if ("jd".equals(paymentType)) {
                JDPayAuthor jdPayAuthor = new JDPayAuthor();
                JdPayParamsBean paramsBean = new Gson().fromJson(paymentInfoData, JdPayParamsBean.class);
                String orderId = paramsBean.getResult().getOrderId();
                String merchant = paramsBean.getResult().getMerchantId();
                String appId = paramsBean.getResult().getAppId();
                String signData = paramsBean.getResult().getSign();
                jdPayAuthor.author(getCurrentActivity(), orderId, merchant, appId, signData,null);
            }
        } else {
            //Http支付
            OrderInfoKeyValueBean orderInfoKeyValueBean = new Gson().fromJson(paymentInfoData, OrderInfoKeyValueBean.class);
            startToPay(paymentType, orderInfoKeyValueBean);




            /*Intent intent = new Intent(reactApplicationContext, PaymentActivity.class);
            intent.putExtra("PaymentInfoData", paymentInfoData);
            intent.putExtra("PaymentType", paymentType);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactApplicationContext.startActivity(intent);*/
        }
    }

    private void startToPay(String paymentType, OrderInfoKeyValueBean orderInfoKeyValueBean) {
        if ("ali".equals(paymentType)) {
            AliPayUtils aliPayUtils = new AliPayUtils(getCurrentActivity());
            aliPayUtils.pay(orderInfoKeyValueBean, new PayListener() {
                @Override
                public void onSuccess(String payType) {
                    emitRNDeviceEvent("paymentSuccess", payType);
                }

                @Override
                public void onFailure(String payType, int code) {
                    JSONObject payFailData = new JSONObject();
                    try {
                        payFailData.put("payType", payType);
                        payFailData.put("code", code);
                        emitRNDeviceEvent("paymentFailure", payFailData.toString());
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            });
        } else {
            WxPayUtils wxPayUtils = new WxPayUtils(getCurrentActivity());
            wxPayUtils.pay(orderInfoKeyValueBean, new PayListener() {
                @Override
                public void onSuccess(String payType) {
                    emitRNDeviceEvent("paymentSuccess", payType);
                }

                @Override
                public void onFailure(String payType, int code) {
                    JSONObject payFailData = new JSONObject();
                    try {
                        payFailData.put("payType", payType);
                        payFailData.put("code", code);
                        emitRNDeviceEvent("paymentFailure", payFailData.toString());
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }, false);
        }
    }


    /*.
    *
    *  TCP请求
    * */
    @ReactMethod
    public void tcpRequest(String params, final Callback successCallback, final Callback failCallback) {
        Map<String, Object> datas = TUtils.jsonToMap(params);
        if (datas == null || reactApplicationContext == null) {
            return;
        }

        new TcpUtils(reactApplicationContext).sendMessage(datas, new TcpUtils.OnResponseListener() {
            @Override
            public void onResponse(String s) {
                //图片链接转换
                successCallback.invoke(s);
            }

            @Override
            public void onError(String s) {
                failCallback.invoke(s);
            }
        });
    }

    /**
     * TCP上传图片
     */
    @ReactMethod
    public void tcpUploadImg(String params, final Callback successCallback, final Callback failCallback) {
        tcpUploadRXImg(params, 0, successCallback,  failCallback);
    }

    /**
     * TCP上传处方图片
     */
    @ReactMethod
    public void tcpUploadRXImg(String params, Integer diskId, final Callback successCallback, final Callback failCallback) {
        if (TextUtils.isEmpty(params)) {
            return;
        }
        if(null == diskId){
            return;
        }
        params = params.replace("file://", "");
        new TcpUtils(getCurrentActivity()).buildDataPackage(diskId, params, new File(params).getName(), new TcpUtils.OnResponseListener() {
            @Override
            public void onResponse(String url) {
                successCallback.invoke(url);
            }

            @Override
            public void onError(String s) {
                failCallback.invoke(s);
            }
        });
    }

    /*
    * 重新定位
    * */
    @ReactMethod
    public void chooseAddress() {
        if (reactApplicationContext != null) {
            Intent intent = new Intent(reactApplicationContext, AdressLocationMapActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactApplicationContext.startActivity(intent);
        }
    }

    /*
    *
    * 图片分享
    * */

    private static final int REQUEST_EXTERNAL_STORAGE = 1;
    private static String[] PERMISSIONS_STORAGE = {
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE};

    public void verifyStoragePermissions(Activity activity) {
        // Check if we have write permission
        int permission = ActivityCompat.checkSelfPermission(activity,
                Manifest.permission.WRITE_EXTERNAL_STORAGE);
        if (permission != PackageManager.PERMISSION_GRANTED) {
            // We don't have permission so prompt the user
            ActivityCompat.requestPermissions(activity, PERMISSIONS_STORAGE,
                    REQUEST_EXTERNAL_STORAGE);
        }
    }

    /**
     * 图片分享
     *
     * @param action
     * @param uri
     */
    @ReactMethod
    public void sharePoster(String action, String uri) {
        if (!EasyPermissions.hasPermissions(getCurrentActivity(), PERMISSIONS_STORAGE)) {
            EasyPermissions.requestPermissions(getCurrentActivity(), "需要存储权限", 0, PERMISSIONS_STORAGE);
            return;
        } else {

            new UshareUtils(getCurrentActivity()).init("", "", "sharePoster", uri, action);
        }
    }

    /**
     * 获取图片缓存大小
     *
     * @return
     */
    @ReactMethod
    public void getCacheSize(final Callback sizeCallback) {
        Fresco.getImagePipelineFactory().getMainFileCache().trimToMinimum();
        long totalSize = Fresco.getImagePipelineFactory().getMainFileCache().getSize();
        String size = Formatter.formatFileSize(reactApplicationContext, totalSize);
        sizeCallback.invoke(size);
    }

    /**
     * 清除图片缓存
     */
    @ReactMethod
    public void clearCache(final Callback block) {
        Fresco.getImagePipeline().clearCaches();
        block.invoke();
    }

    /*
    *
    *  开启通知权限
    * */
    @ReactMethod
    public void openNotificationPermission() {
        Intent intent = new Intent();
        if(reactApplicationContext == null){
            return;
        }
        //android 8.0引导
        if (Build.VERSION.SDK_INT >= 26) {
            intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
            intent.putExtra("android.provider.extra.APP_PACKAGE", reactApplicationContext.getPackageName());
        }
        //android 5.0-7.0
        if (Build.VERSION.SDK_INT >= 21 && Build.VERSION.SDK_INT < 26) {
            intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
            intent.putExtra("app_package", reactApplicationContext.getPackageName());
            intent.putExtra("app_uid", reactApplicationContext.getApplicationInfo().uid);
        }
        //其他
        if (Build.VERSION.SDK_INT < 21) {
            intent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
            intent.setData(Uri.fromParts("package", reactApplicationContext.getPackageName(), null));
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactApplicationContext.startActivity(intent);
    }

    /*
    *  检查通知权限是否开启
    * */
    @ReactMethod
    public void isNeedOpenNotification(Callback isNeedOpen) {
        if(reactApplicationContext == null) {
            isNeedOpen.invoke(true);
            return;
        }
        // areNotificationsEnabled方法的有效性官方只最低支持到API 19，低于19的仍可调用此方法不过只会返回true，即默认为用户已经开启了通知。
        NotificationManagerCompat manager = NotificationManagerCompat.from(reactApplicationContext);
        boolean notificationEnabled = manager.areNotificationsEnabled();
        isNeedOpen.invoke(notificationEnabled);
    }

    /*
    *  检查相机权限是否开启
    * */
    @ReactMethod
    public void checkCameraAuthorizationStatusCallback(Callback isOpen) {
        if(reactApplicationContext == null) {
            isOpen.invoke(false);
            return;
        }
        isOpen.invoke(EasyPermissions.hasPermissions(reactApplicationContext, Manifest.permission.CAMERA));
    }


    /*
    *
    *  跳转应用市场
    * */
    @ReactMethod
    public void gotoAppMarket(Callback action) {
        GoMarketUtil.toMarket(getCurrentActivity(), null);
        action.invoke();
    }

    /*
    *  获取版本号
    **/
    @ReactMethod
    public void getVersionCode(Callback verSionCode, Callback error) {
        if(reactApplicationContext == null) {
            error.invoke();
            return;
        }
        String versionCode = TUtils.getVersionCode(reactApplicationContext);
        if (!TextUtils.isEmpty(versionCode)) {
            verSionCode.invoke(versionCode);
        } else {
            error.invoke();
        }
    }

    /**
     * 获取APP配置，版本号、设备唯一标识
     *
     * @param call
     */
    @ReactMethod
    public void getAppConfig(Callback call) {
        if(reactApplicationContext == null) {
            return;
        }
        JSONObject jsonObject = new JSONObject();
        String versionName = "";
        String netType = "";
        String yfwDomain = "";
        try {
            versionName = MainApplication.getInstance()
                    .getPackageManager()
                    .getPackageInfo(MainApplication.getInstance().getPackageName(), 0).versionName;
            SharedPreferences sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, getCurrentActivity().MODE_PRIVATE);
            boolean net_type_istcp = sp.getBoolean("NET_TYPE_ISTCP", true);

            if(net_type_istcp){
                netType = "tcp";
                yfwDomain = sp.getString("TCP_NET_DOMAIN","yaofangwang.com");
            }else {
                netType = "http";
                yfwDomain = sp.getString("HTTP_NET_DOMAIN","yaofangwang.com");
            }
            jsonObject.put("deviceNo", AppConfig.getDeviceID());
            jsonObject.put("idfa", AppConfig.getDeviceID());
            jsonObject.put("version", versionName);
            jsonObject.put("ip", NetUtils.getIP(getCurrentActivity()));
            jsonObject.put("osVersion", android.os.Build.VERSION.RELEASE);
            jsonObject.put("deviceName", android.os.Build.MODEL);
            jsonObject.put("manufacturer", android.os.Build.BRAND);
            jsonObject.putOpt("jpushId", SPUtils.getJPushID());
            jsonObject.put("netType",netType);
            jsonObject.put("yfwDomain",yfwDomain);
            jsonObject.put("market",TUtils.getMetaValue(getCurrentActivity(),"UMENG_CHANNEL"));
            boolean notificationEnabled = NotificationsUtils.isNotificationEnabled(reactApplicationContext);
            if (notificationEnabled) {//true表示已开启
                jsonObject.put("isPush","1");
            }else {
                jsonObject.put("isPush","0");
            }
        } catch (JSONException e) {
        } catch (Exception e) {
        } finally {
            call.invoke(jsonObject.toString());
        }
    }

    /*
    * 复制链接
    * */
    @ReactMethod
    public void shareCopy(String url) {
        if(reactApplicationContext != null){
            ClipboardManager myClipboard = (ClipboardManager) reactApplicationContext.getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData myClip = ClipData.newPlainText("text", url);
            myClipboard.setPrimaryClip(myClip);
        }
    }
    /*
     * 读取剪切板内容
     * */
    @ReactMethod
    public void getPasteboardString(Callback callback) {
        if(reactApplicationContext != null){
            try {
                ClipboardManager clipboard = (ClipboardManager) reactApplicationContext.getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clipData = clipboard.getPrimaryClip();
                if (clipData != null && clipData.getItemCount() >= 1) {
                    ClipData.Item firstItem = clipboard.getPrimaryClip().getItemAt(0);
                    callback.invoke("" + firstItem.getText());
                } else {
                    callback.invoke("");
                }
            } catch (Exception e) {

            }
        }
    }

    /*
    *  保存图片
    * */
    @ReactMethod
    public void savePic(String url,String action) {
        /*Intent intent = new Intent(reactApplicationContext, UshareActivity.class);
        intent.putExtra("type", "sharePoster");
        intent.putExtra("uri", url);
        intent.putExtra("action", "save");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactApplicationContext.startActivity(intent);*/
        if(getCurrentActivity() != null) {
            new UshareUtils(getCurrentActivity()).init("","","downloadImage",url,action);
        }
    }

    /*
    * 埋点
    * */
    @ReactMethod
    public void mobClick(String title) {
        if(reactApplicationContext != null){
            MobclickAgent.onEvent(reactApplicationContext, title);
        }
    }

    /*
    * 打电话
    * */
    @ReactMethod
    public void takePhone(String number) {
        if (number != null && reactApplicationContext != null) {
            TUtils.callPhone(reactApplicationContext, number);
        }
    }

    /*
    *  价格趋势
    * */
    @ReactMethod
    public void startChart(String ssid, String goodsId, boolean isTcp) {
        if(reactApplicationContext != null){
            Intent intent = new Intent(reactApplicationContext, ValueTrendChartActivity.class);
            intent.putExtra("ssid", ssid);
            intent.putExtra("goodsID", goodsId);
            intent.putExtra("isTcp", isTcp);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactApplicationContext.startActivity(intent);
        }
    }


    @ReactMethod
    public void upLoadPic(String data, Callback successCallback, Callback callback) {
        try {
            JSONObject jsonObject = new JSONObject(data);
            JSONArray jsonArray = jsonObject.optJSONArray("picDataKey");
            Bitmap[] bitarr = new Bitmap[jsonArray.length()];
            for (int i = 0; i < jsonArray.length(); i++) {
                String url = jsonArray.get(i).toString();
                Bitmap bitmap = TUtils.convertToBitmap(url);
                bitarr[i] = bitmap;
            }
            JSONArray reportData = jsonObject.optJSONArray("reportData");
            Bitmap[] rePortbitarr;
            if (reportData != null) {
                rePortbitarr = new Bitmap[reportData.length()];
                if (reportData.length() > 0) {
                    for (int i = 0; i < reportData.length(); i++) {
                        String url = reportData.get(i).toString();
                        Bitmap bitmap = TUtils.convertToBitmap(url);
                        rePortbitarr[i] = bitmap;
                    }
                }
            } else {
                rePortbitarr = new Bitmap[0];
            }
            String action = jsonObject.optString("action");
            String ssid = jsonObject.optString("ssid");
            String orderNo = jsonObject.optString("orderNo");
            String title = jsonObject.optString("title");
            String desc = jsonObject.optString("desc");
            String sex = jsonObject.optString("sex");
            String age = jsonObject.optString("age");
            String return_reason = jsonObject.optString("return_reason");
            String return_money = jsonObject.optString("return_money");
            String return_goods_info = jsonObject.optString("return_goods_info");
            String category_id = jsonObject.optString("category_id");

            switch (action) {
                case "upload_complaint_img":
                    requestAddComplaintPic(orderNo, bitarr, ssid, successCallback, callback);
                    break;
                case "update_account_info":
                    requestUpdateUserIcon(bitarr[0], ssid, successCallback, callback);
                    break;
                case "submit_ask_questions":
                    submitUserHealthQuestion(ssid, title, desc, sex, age, category_id, bitarr, successCallback, callback);
                    break;
                case "upload_drug_remind_goods_image":
                    submitDrugRemidingImage(ssid, bitarr, successCallback, callback);
                    break;
                case "order_apply_return":
                    requestRefunds(ssid, orderNo, return_reason, return_money, return_goods_info, bitarr, rePortbitarr, successCallback, callback);
                    break;
                case "submit_rx_img":
                    submitRxInfo(ssid, orderNo, bitarr, rePortbitarr, successCallback, callback);
                    break;
            }
        } catch (JSONException e) {
            callback.invoke(e.getMessage().toString());
        }
    }

    /**
     * 处方上传图片
     *
     * @param ssid
     * @param orderNo
     * @param bitarr
     * @param rePortbitarr
     */
    private void submitRxInfo(String ssid, String orderNo, Bitmap[] bitarr, Bitmap[] rePortbitarr, final Callback successCallback, final Callback callback) {
        HashMap<String, String> datas = new HashMap<String, String>();
        datas.put("service", "submit_rx_img");
        datas.put("ssid", ssid);
        datas.put("order_no", orderNo);
        Net.postPic(datas, bitarr, rePortbitarr, new Response.Listener<String>() {
            @Override
            public void onResponse(String result) {
                try {
                    JSONObject obj = new JSONObject(result);
                    if ("1".equals(obj.getString("code"))) {
                        successCallback.invoke();
                    } else {
                        callback.invoke();
                    }
                } catch (JSONException e) {
                    callback.invoke();
                }
            }
        }, new Response.ErrorListener() {

            @Override
            public void onErrorResponse(VolleyError error) {
                callback.invoke();
            }
        });
    }

    private void requestRefunds(String ssid, String mPreOrderNo, String return_reason, String return_money, String return_goods_info, Bitmap[] bitarr, Bitmap[] rePortbitarr, final Callback successCallback, final Callback callback) {
        HashMap<String, String> datas = new HashMap<>();
        datas.put("service", "order_apply_return");
        datas.put("ssid", ssid);
        datas.put("order_no", mPreOrderNo);
        datas.put("return_reason", return_reason);
        datas.put("return_money", return_money);
        if (!TextUtils.isEmpty(return_goods_info))
            datas.put("return_goods_info", return_goods_info);
        Net.postPic(datas, bitarr, rePortbitarr, new Response.Listener<String>() {
            @Override
            public void onResponse(String listItems) {
                LoadingDialog.cancelForce();
                try {
                    JSONObject obj = new JSONObject(listItems);
                    if ("1".equals(obj.getString("code"))) {
                        successCallback.invoke();
                    } else if ("-1".equals(obj.getString("code"))) {
                        callback.invoke(obj.getString("msg"));
                    }
                } catch (JSONException e) {
                    callback.invoke(e.getMessage().toString());
                }
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError volleyError) {
                LoadingDialog.cancelForce();
                callback.invoke(volleyError.getMessage().toString());
            }
        });
    }

    private void submitDrugRemidingImage(String ssid, Bitmap[] bitarr, final Callback successCallback, final Callback callback) {
        HashMap<String, String> data = new HashMap<>();
        data.put("service", "upload_drug_remind_goods_image");
        data.put("ssid", ssid);
        Net.postPic(data, bitarr, new Bitmap[0], new Response.Listener<String>() {

            @Override
            public void onResponse(String result) {
                try {
                    JSONObject obj = new JSONObject(result);
                    if ("1".equals(obj.getString("code"))) {
                        successCallback.invoke(result);
                    } else if ("-1".equals(obj.getString("code"))) {
                        callback.invoke("error");
                    }
                } catch (JSONException e) {
                    callback.invoke(e.getMessage().toString());
                }
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                LoadingDialog.cancelForce();
                if (error.getMessage() != null) {
                }
            }
        });
    }

    private void submitUserHealthQuestion(String ssid, String title, String desc, String sex, String age, String category_id, Bitmap[] bitarr, final Callback successCallback, final Callback callback) {
        HashMap<String, String> datas = new HashMap<>();
        datas.put("service", "submit_ask_questions");
        datas.put("title", title);
        datas.put("desc", desc);
        datas.put("sex", sex + "");
        datas.put("age", age);
        datas.put("category_id", category_id);
        datas.put("ssid", ssid);
        Net.postPic(datas, bitarr, new Bitmap[0], new Response.Listener<String>() {

            @Override
            public void onResponse(String result) {
                try {
                    JSONObject obj = new JSONObject(result);
                    if ("1".equals(obj.getString("code"))) {
                        successCallback.invoke("");
                    } else if ("-1".equals(obj.getString("code"))) {
                        callback.invoke("");
                    }
                } catch (JSONException e) {
                    callback.invoke(e.getMessage().toString());
                }
            }
        }, new Response.ErrorListener() {

            @Override
            public void onErrorResponse(VolleyError error) {
                if (error.getMessage() != null) {
                    callback.invoke(error.getMessage().toString());
                }
            }
        });
    }


    public void requestUpdateUserIcon(Bitmap bitmap, String ssid, final Callback successCallback, final Callback callback) {
        HashMap<String, String> datas = new HashMap<>();
        datas.put("service", "update_account_img");
        datas.put("ssid", ssid);
        Net.postPic(datas, new Bitmap[]{bitmap}, new Bitmap[0], new Response.Listener<String>() {
            @Override
            public void onResponse(String s) {
                successCallback.invoke("success");
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError volleyError) {
                if (volleyError != null) {
                    callback.invoke(volleyError.getMessage().toString());
                }
            }
        });
    }


    public void requestAddComplaintPic(String orderNo, Bitmap[] picArr, String ssid, final Callback successCallback, final Callback callback) {
        HashMap<String, String> datas = new HashMap<>();
        datas.put("service", "upload_complaint_img");
        datas.put("ssid", ssid);
        datas.put("order_no", orderNo);
        Net.postPic(datas, picArr, new Bitmap[0], new Response.Listener<String>() {

            @Override
            public void onResponse(String result) {
                try {
                    JSONObject obj = new JSONObject(result);
                    if ("1".equals(obj.getString("code"))) {
                        StringBuilder sb = new StringBuilder();
                        JSONArray arr = obj.getJSONArray("items");
                        for (int i = 0; i < arr.length(); i++) {
                            String img = arr.getString(i);
                            sb.append(img).append("|");
                        }
                        successCallback.invoke(sb.toString());
                    } else {
                        callback.invoke("投诉提交失败，请重试！");
                    }
                } catch (JSONException e) {
                    callback.invoke("投诉提交失败，请重试！");
                }
            }
        }, new Response.ErrorListener() {

            @Override
            public void onErrorResponse(VolleyError error) {
                if (error != null) callback.invoke(error.getMessage().toString());
            }
        });
    }

    /*
    *  跳转H5
    * */
    @ReactMethod
    public void startH5(String params) {
        if(reactApplicationContext != null) {
            try {
                JSONObject json = new JSONObject(params);
                String name = json.optString("name");
                String value = json.optString("value");
                String share = json.optString("share");
                Intent intent = new Intent(reactApplicationContext, H5HuodongActivity.class);
                intent.putExtra(Consts.extra.DATA_URL, value);
                intent.putExtra(Consts.extra.DATA_URL_TITLE, name);
                intent.putExtra(Consts.extra.DATA_SHARE_URL, TextUtils.isEmpty(share) ? value : share);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactApplicationContext.startActivity(intent);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    /*
    *  打开设置页面
    * */
    @ReactMethod
    public void openSetting() {
        Activity currentActivity = getCurrentActivity();
        Intent intent = new Intent(Settings.ACTION_SETTINGS);
        currentActivity.startActivity(intent);
    }

    /*
    *  退出APP
    * */
    @ReactMethod
    public void exit() {
        if(getCurrentActivity() != null) {
            getCurrentActivity().finish();
        }
        System.exit(0);
        ActivityManager manager = (ActivityManager) getCurrentActivity().getSystemService(ACTIVITY_SERVICE);
        manager.killBackgroundProcesses(getCurrentActivity().getPackageName());
    }


    /*
    * 获取状态栏高度
    * */
    @ReactMethod
    public void getStatusBarHeight(Callback callback) {
        int result = 0;
        int height = 0;
        int resourceId = getCurrentActivity().getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            result = getCurrentActivity().getResources().getDimensionPixelSize(resourceId);
            height = TUtils.px2dp(getCurrentActivity(), result);
        }
        callback.invoke(height);
        ;
    }

    /*
    * 判断是否需要热更新
    * */
    @ReactMethod
    public void VersionUpdateCheckModule(Callback callback) {

    }

    @ReactMethod
    public void getCloudVersionNumbe() {
        HashMap<String, Object> datas = new HashMap<>();
        datas.put("__cmd", "guest.common.app.getCurrentVersionZip");
        new TcpUtils(getCurrentActivity()).sendMessage(datas, new TcpUtils.OnResponseListener() {
            @Override
            public void onResponse(String s) {
                try {
                    JSONObject jsonObject = new JSONObject(s);
                    JSONObject result = jsonObject.getJSONObject("result");
                    String cloudVersionCode = result.optString("version");
                    String cloudZipVersionCode = result.optString("zipversion");
                    String cloudZipUrlCode = result.optString("zipurl");
                    String loaclVersionCode = TUtils.getVersionCode(getCurrentActivity());
                    checkIsNeedUpDate(cloudVersionCode, loaclVersionCode, cloudZipVersionCode, cloudZipUrlCode);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onError(String s) {

            }
        });
    }

    private void checkIsNeedUpDate(String cloudVersionCode, String loaclVersionCode, String cloudZipVersionCode, String cloudZipUrlCode) {
        int cloundVersion = formatVersionCode(cloudVersionCode);
        int loaclVersion = formatVersionCode(loaclVersionCode);
        if (cloundVersion > loaclVersion) {
            //应用市场重新下载
            boolean equalJsBundleCode = isEqualJsBundleCode(cloudZipVersionCode);
            if (!equalJsBundleCode) {
                //应用内下载jsbundle
                downloadCloudJsBundle(cloudZipUrlCode, cloudVersionCode);
                //修改本地jsbundle版本标识

            } else {
                //直接读取
                //downloadCloudJsBundle(cloudZipUrlCode);
                downloadCloudJsBundle(cloudZipUrlCode, cloudVersionCode);
            }
        } else {
            boolean equalJsBundleCode = isEqualJsBundleCode(cloudZipVersionCode);
            if (!equalJsBundleCode) {
                //应用内下载jsbundle
                downloadCloudJsBundle(cloudZipUrlCode, cloudVersionCode);
                //修改本地jsbundle版本标识

            } else {
                //直接读取
                //downloadCloudJsBundle(cloudZipUrlCode);
                downloadCloudJsBundle(cloudZipUrlCode, cloudVersionCode);
            }
        }
    }

    private void downloadCloudJsBundle(String cloudZipUrlCode, String cloudVersionCode) {
        String jsBundleUrl = getCurrentActivity().getFilesDir().getAbsolutePath() + "/JsBundle.zip";
        File file = new File(jsBundleUrl);
        if (file.exists()) {
            getCurrentActivity().deleteFile("JsBundle.zip");
        }
        new UpdateJsAsync(getCurrentActivity(), cloudVersionCode, false).execute(cloudZipUrlCode);
    }

    private int formatVersionCode(String cloudVersionCode) {
        String replace = cloudVersionCode.replace(".", "");
        return Integer.parseInt(replace);
    }

    private boolean isEqualJsBundleCode(String cloudZipVersionCode) {
        String url = getCurrentActivity().getFilesDir().getAbsolutePath() + "/localJsBundleCode";
        File file = new File(url);
        if (file.exists()) {
            String result = "";
            try {
                FileInputStream fileInputStream = getCurrentActivity().openFileInput("localJsBundleCode");
                //获取文件长度
                int lenght = fileInputStream.available();
                byte[] buffer = new byte[lenght];
                fileInputStream.read(buffer);
                //将byte数组转换成指定格式的字符串
                result = new String(buffer, "UTF-8");
                //得到本地jsbundle版本
                int localJsBundleCode = formatVersionCode(result);
                int cloudJsBundleCode = formatVersionCode(cloudZipVersionCode);
                if (localJsBundleCode >= cloudJsBundleCode) {
                    return false;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            /*if(cloudZipVersion<=本地){
                //不需要
                return  false;
            }*/
        } else {
            // 路径不存在 表示没有更新过 写入版本号
            try {
                FileOutputStream fileOutputStream = getCurrentActivity().openFileOutput("localJsBundleCode", getCurrentActivity().MODE_PRIVATE);
                byte[] bytes = cloudZipVersionCode.getBytes();
                fileOutputStream.write(bytes);
                fileOutputStream.close();
                Log.e("localJsBundleCode", "写入成功");
                return true;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return true;
    }

    /*
    * 打开浏览器
    * */

    @ReactMethod
    public void weakUpBrowser(String url) {
        final Intent intent = new Intent();
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(url));
// 注意此处的判断intent.resolveActivity()可以返回显示该Intent的Activity对应的组件名
// 官方解释 : Name of the component implementing an activity that can display the intent
        if (intent.resolveActivity(getCurrentActivity().getPackageManager()) != null) {
            final ComponentName componentName = intent.resolveActivity(getCurrentActivity().getPackageManager());
            // 打印Log   ComponentName到底是什么
            getCurrentActivity().startActivity(Intent.createChooser(intent, "请选择浏览器"));
        } else {
            Toast.makeText(getCurrentActivity(), "链接错误或未匹配到浏览器", Toast.LENGTH_SHORT).show();
        }
    }

    /*
    *  切换原生http tcp热更新模式
    * */
    @ReactMethod
    public void changeHotUpdateType(String type) {
        SharedPreferences sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, getCurrentActivity().MODE_PRIVATE);

        if (type.equals("tcp")) {
            sp.edit().putBoolean("NET_TYPE_ISTCP", true).apply();
        } else {
            sp.edit().putBoolean("NET_TYPE_ISTCP", false).apply();
        }
    }

    /**
     * 判断是否打开定位权限，需要同时判断GPS和定位权限
     */
    @ReactMethod
    public void isLocationServiceOpen(Callback callback) {
        boolean isOpen = GpsUtil.isOPen(MainApplication.getInstance())
                && EasyPermissions.hasPermissions(MainApplication.getInstance(), Manifest.permission.ACCESS_COARSE_LOCATION);
        if (callback != null) {
            callback.invoke(isOpen);
        }
    }

    /**
     * 打开定位权限
     */
    @ReactMethod
    public void openLocation() {
        if(getCurrentActivity()==null){
            return;
        }
        if (!GpsUtil.isOPen(MainApplication.getInstance())) {
            new AlertDialog.Builder(getCurrentActivity())
                    .setTitle("定位失败")
                    .setMessage("请检查是否开启定位服务")
                    .setPositiveButton("立即开启", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();//关闭对话框
                            Intent intent = new Intent();
                            intent.setAction(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
                            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            getCurrentActivity().startActivity(intent);
                        }
                    })
                    .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();//关闭对话框
                        }
                    })
                    .show();
            return;
        }
        //是否拒绝并选择了不再询问（无法弹出授权窗口）
        if (!ActivityCompat.shouldShowRequestPermissionRationale(getCurrentActivity(), Manifest.permission.ACCESS_COARSE_LOCATION)
                && !EasyPermissions.hasPermissions(MainApplication.getInstance(), Manifest.permission.ACCESS_COARSE_LOCATION)) {
            new AlertDialog.Builder(getCurrentActivity())
                    .setTitle("请允许获取位置信息")
                    .setMessage("由于药房网商城无法获取位置信息的权限，部分功能不能使用，请开启权限后使用。\n设置路径：系统设置->药房网商城->权限")
                    .setPositiveButton("去设置", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();//关闭对话框
                            Intent intent = new Intent();
                            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            intent.setData(Uri.parse("package:" + getCurrentActivity().getPackageName()));
                            getCurrentActivity().startActivity(intent);
                        }
                    })
                    .setNegativeButton("拒绝", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();//关闭对话框
                        }
                    })
                    .show();
            return;
        } else {
            EasyPermissions.requestPermissions(getCurrentActivity(), "药房网商城需要获取定位权限，以便您查看商品价格等信息，建议选择允许授权定位服务。",R.string.agree,R.string.denied,0, Manifest.permission.ACCESS_COARSE_LOCATION,Manifest.permission.READ_PHONE_STATE);
        }
    }


    /** 获取经纬度附近POI*/
    @ReactMethod
    public void getPOINearby(Promise promise) {
        mSearch = GeoCoder.newInstance();
        mSearch.setOnGetGeoCodeResultListener(new OnGetGeoCoderResultListener() {
            @Override
            public void onGetGeoCodeResult(GeoCodeResult geoCodeResult) {

            }

            @Override
            public void onGetReverseGeoCodeResult(ReverseGeoCodeResult result) {

                if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
                    promise.reject("-100","获取失败");
                    return;
                }
                List<PoiInfo> listData = result.getPoiList();
                ReverseGeoCodeResult.AddressComponent  addressDetail = result.getAddressDetail();
                String province = addressDetail.province;
                String area = addressDetail.district;
                WritableMap map = Arguments.createMap();
                WritableArray poiList = new WritableNativeArray();
                for(PoiInfo poiInfo:listData){
                    WritableMap poi = Arguments.createMap();
                    poi.putInt("distance",poiInfo.getDistance());
                    poi.putString("city",poiInfo.getCity());
                    poi.putString("province",province);
                    poi.putString("area",area);
                    poi.putString("name",poiInfo.getName());
                    poi.putString("address",poiInfo.getAddress());
                    poi.putDouble("latitude",poiInfo.getLocation().latitude);
                    poi.putDouble("longitude",poiInfo.getLocation().longitude);
                    poiList.pushMap(poi);
                }
                map.putArray("poiList", poiList);

                promise.resolve(map);
            }
        });
        double lat = LocationManager.getLocationInfo().getLatitude();
        double lng = LocationManager.getLocationInfo().getLongitude();
        LatLng ptCenter = new LatLng(lat, lng);
        mSearch.reverseGeoCode(new ReverseGeoCodeOption().location(ptCenter));
    }

    /** 获取经纬度附近POI*/
    @ReactMethod
    public void searchPOINearby(String keyword,Promise promise) {
        if(mPoiSearch == null){
            mPoiSearch = PoiSearch.newInstance();
        }
        OnGetPoiSearchResultListener listener = new OnGetPoiSearchResultListener() {
            @Override
            public void onGetPoiResult(PoiResult poiResult) {
                if(poiResult == null || poiResult.error == SearchResult.ERRORNO.RESULT_NOT_FOUND){
                    promise.reject("-100","获取失败");
                    return;
                }
                List<PoiInfo> listData = poiResult.getAllPoi();
                WritableMap map = Arguments.createMap();
                WritableArray poiList = new WritableNativeArray();
                for(PoiInfo poiInfo:listData){
                    WritableMap poi = Arguments.createMap();
                    poi.putInt("distance",poiInfo.getDistance());
                    poi.putString("city",poiInfo.getCity());
                    poi.putString("province",poiInfo.getProvince());
                    poi.putString("area",poiInfo.getArea());
                    poi.putString("name",poiInfo.getName());
                    poi.putString("address",poiInfo.getAddress());
                    poi.putDouble("latitude",poiInfo.getLocation().latitude);
                    poi.putDouble("longitude",poiInfo.getLocation().longitude);
                    poiList.pushMap(poi);
                }
                map.putArray("poiList", poiList);

                promise.resolve(map);
            }
            @Override
            public void onGetPoiDetailResult(PoiDetailSearchResult poiDetailSearchResult) {
            }
            @Override
            public void onGetPoiIndoorResult(PoiIndoorResult poiIndoorResult) {
            }
            //废弃
            @Override
            public void onGetPoiDetailResult(PoiDetailResult poiDetailResult) {
            }
        };
        mPoiSearch.setOnGetPoiSearchResultListener(listener);
        double lat = LocationManager.getLocationInfo().getLatitude();
        double lng = LocationManager.getLocationInfo().getLongitude();
        mPoiSearch.searchNearby(new PoiNearbySearchOption()
                .keyword(keyword)
                .radius(1000)
                .location(new LatLng(lat,lng)));
    }

    /** 当前城市POI检索*/
    @ReactMethod
    public void getSearchPOIInCity(String city, String keyword,Promise promise) {
        if(mPoiSearch == null){
            mPoiSearch = PoiSearch.newInstance();
        }
        OnGetPoiSearchResultListener listener = new OnGetPoiSearchResultListener() {
            @Override
            public void onGetPoiResult(PoiResult poiResult) {
                if(poiResult == null || poiResult.error == SearchResult.ERRORNO.RESULT_NOT_FOUND){
                    promise.reject("-100","获取失败");
                    return;
                }
                List<PoiInfo> listData = poiResult.getAllPoi();
                WritableMap map = Arguments.createMap();
                WritableArray poiList = new WritableNativeArray();
                double lat = LocationManager.getLocationInfo().getLatitude();
                double lng = LocationManager.getLocationInfo().getLongitude();
                for(PoiInfo poiInfo:listData){
                    WritableMap poi = Arguments.createMap();
                    poi.putDouble("distance", DistanceUtil.getDistance(
                            new LatLng(poiInfo.getLocation().latitude, poiInfo.getLocation().longitude),
                            new LatLng(lat, lng)));
                    poi.putString("name",poiInfo.getName());
                    poi.putString("address",poiInfo.getAddress());
                    poi.putString("city",poiInfo.getCity());
                    poi.putString("province",poiInfo.getProvince());
                    poi.putString("area",poiInfo.getArea());
                    poi.putDouble("latitude",poiInfo.getLocation().latitude);
                    poi.putDouble("longitude",poiInfo.getLocation().longitude);
                    poiList.pushMap(poi);
                }
                map.putArray("poiList", poiList);
                promise.resolve(map);

            }
            @Override
            public void onGetPoiDetailResult(PoiDetailResult poiDetailResult) {

            }
            @Override
            public void onGetPoiDetailResult(PoiDetailSearchResult poiDetailSearchResult) {
            }
            @Override
            public void onGetPoiIndoorResult(PoiIndoorResult poiIndoorResult) {

            }
        };
        mPoiSearch.setOnGetPoiSearchResultListener(listener);
        mPoiSearch.searchInCity(new PoiCitySearchOption()
                .city(city) //必填
                .cityLimit(true)
                .scope(2)
                .keyword(keyword) //必填
        );
    }

    /** 释放POI检索*/
    @ReactMethod
    public void destroyPOI() {
        if(mPoiSearch != null){
            mPoiSearch.destroy();
            mPoiSearch = null;
        }
        if(mSearch != null){
            mSearch.destroy();
            mSearch = null;
        }
    }



    /** 获取地址对应的经纬度信息*/
    @ReactMethod
    public void getGeoCodeResult(String city, String address, Callback callback) {
        GeoCoder mCoder = GeoCoder.newInstance();
        mCoder.setOnGetGeoCodeResultListener( new OnGetGeoCoderResultListener() {
            @Override
            public void onGetGeoCodeResult(GeoCodeResult geoCodeResult) {
                if (null != geoCodeResult && null != geoCodeResult.getLocation()) {
                    if (geoCodeResult == null || geoCodeResult.error != SearchResult.ERRORNO.NO_ERROR) {
                        //没有检索到结果
                        callback.invoke();
                        mCoder.destroy();
                        return;
                    } else {
                        JSONObject result = new JSONObject();
                        try {
                            result.put("latitude", geoCodeResult.getLocation().latitude);
                            result.put("longitude", geoCodeResult.getLocation().longitude);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        if (callback != null) {
                            callback.invoke(result.toString());
                        }
                        mCoder.destroy();
                    }
                }
            }

            @Override
            public void onGetReverseGeoCodeResult(ReverseGeoCodeResult reverseGeoCodeResult) {

            }
        });
        mCoder.geocode(new GeoCodeOption().city(city).address(address));
    }

    /** 获取经纬度对应的地址信息*/
    @ReactMethod
    public void getGeoReverseCodeResult(String longitude, String latitude, Callback callback) {
        if(null == longitude || null == latitude){
            callback.invoke();
            return;
        }
        GeoCoder mCoder = GeoCoder.newInstance();
        mCoder.setOnGetGeoCodeResultListener( new OnGetGeoCoderResultListener() {
            @Override
            public void onGetGeoCodeResult(GeoCodeResult geoCodeResult) {

            }

            @Override
            public void onGetReverseGeoCodeResult(ReverseGeoCodeResult reverseGeoCodeResult) {
                if (reverseGeoCodeResult == null || reverseGeoCodeResult.error != SearchResult.ERRORNO.NO_ERROR) {
                    //没有找到检索结果
                    callback.invoke();
                    mCoder.destroy();
                } else {

                    //详细地址
                    String address = reverseGeoCodeResult.getAddress();
                    String city = reverseGeoCodeResult.getAddressDetail().city;
                    JSONObject result = new JSONObject();
                    try {
                        result.put("city", city);
                        result.put("address",address);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    if (callback != null) {
                        callback.invoke(result.toString());
                    }
                    mCoder.destroy();
                }
            }
        });
        mCoder.reverseGeoCode(new ReverseGeoCodeOption()
                .location(new LatLng(Double.parseDouble(latitude), Double.parseDouble(longitude)))
                // 设置是否返回新数据 默认值0不返回，1返回
                .newVersion(1)
                // POI召回半径，允许设置区间为0-1000米，超过1000米按1000米召回。默认值为1000
                .radius(500));
    }

    @ReactMethod
    public void showUploadDialog(String info, boolean isTcp) {
        if (getCurrentActivity() instanceof MyFragmentDelegate) {
            VersionInfo versionInfo;
            if (isTcp) {
                versionInfo = VersionInfo.convert(info);
            } else {
                versionInfo = new Gson().fromJson(info, VersionInfo.class);
            }
            MyFragmentDelegate fragmentDelegate = (MyFragmentDelegate) getCurrentActivity();
            fragmentDelegate.show(UploadApkFragment.newInstance(versionInfo), UploadApkFragment.class.getName());
        }
    }

    @ReactMethod
    public void setCdnAndport(String data) {
        try {
            JSONObject jsonObject = new JSONObject(data);
            String cdn_url = jsonObject.getString("cdn_url");
            String tcp_port = jsonObject.getString("tcp_port");
            String tcp_image_port = jsonObject.getString("tcp_image_port");
            SharedPreferences sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, getCurrentActivity().MODE_PRIVATE);
            if (cdn_url != null && cdn_url.length() > 5) {
                sp.edit().putString("CDN_URL", cdn_url).apply();
            }
            if (tcp_port != null && tcp_port.length() > 1) {
                sp.edit().putString("TCP_PORT", tcp_port.toString()).apply();
            }
            if (tcp_image_port != null && tcp_image_port.length() > 1) {
                sp.edit().putString("TCP_IMAGE_PORT", tcp_image_port.toString()).apply();
            }
            ProjectGlaobleParams.resetNetConfig();
        } catch (JSONException e) {

        }
    }

    @ReactMethod
    public void changeDomain(String domain){
        if(domain!=null&&domain.length()>10){
            SharedPreferences sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, getCurrentActivity().MODE_PRIVATE);
            boolean net_type_istcp = sp.getBoolean("NET_TYPE_ISTCP", true);
            if(net_type_istcp){
                sp.edit().putString("TCP_NET_DOMAIN",domain).apply();
                ProjectGlaobleParams.resetNetConfig();
            }else {
                sp.edit().putString("HTTP_NET_DOMAIN",domain).apply();
            }
        }
    }

    /**
     * 跳转APP的设置中心
     */
    @ReactMethod
    private void startAppSettings() {
        Intent intent = new Intent();
        intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setData(Uri.parse("package:" + getCurrentActivity().getPackageName()));
        getCurrentActivity().startActivity(intent);
    }

    /**
     * 保存SSID
     */
    @ReactMethod
    private void saveSsid(String ssid){
        SPUtils.saveSSID(ssid);
    }

    /**
     * 保存JPushID
     */
    @ReactMethod
    private void saveJPushID(String regId){
        SPUtils.saveJPushID(regId);;
    }

    @ReactMethod
    public void saveVersionCode(){
        SharedPreferences sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, getCurrentActivity().MODE_PRIVATE);
        String mSaveNativeVersionCode = TUtils.getVersionCode(getCurrentActivity());
        sp.edit().putString("LOCAL_NATIVE_VERSON",mSaveNativeVersionCode).apply();
    }


    /*
    *
    *  检测用户是否安装微信
    * */
    @ReactMethod
    public void checkUserHaveInstallWX(Callback callback){
        IWXAPI wxapi = WXAPIFactory.createWXAPI(getCurrentActivity(), Consts.weixinpara.APP_ID,false);
        if(wxapi.isWXAppInstalled()){
            callback.invoke(true);
        }else {
            callback.invoke(false);
        }
    }

    /*
    *  获取极光推送数据（推送唤醒app的情况下使用的数据）
    * */
    @ReactMethod
    public void getReceiveJpushData(Callback callback){
        String receiveJpushData = ((MainApplication) MainApplication.getInstance()).receiveJpushData;
        if(!TextUtils.isEmpty(receiveJpushData)){
            callback.invoke(receiveJpushData);
            ((MainApplication) MainApplication.getInstance()).receiveJpushData = null;
        }
    }

    /*
    *  切换ip
    * */
    @ReactMethod
    public void changeTcpHost(){
        Activity currentActivity = getCurrentActivity();
        if(currentActivity!=null){//&&BuildConfig.DEBUG
            currentActivity.startActivity(new Intent(currentActivity, ChangeIpActivity.class));
        }
    }


    /*
    *  崩溃日志记录开关
    * */
    @ReactMethod
    public void uploadExceptionMessageLog(Boolean switchStatus){
        saveUploadCrashMsgSwitch(switchStatus);
    }

    /*
     *  保存RN当前页面用于上传报错信息
     * */
    @ReactMethod
    public void saveCurrentRouteName(String routeName){
        CrashHandlerUtil.getInstance().saveCurrentRouteName(routeName);
    }


    /*
     *  跳转导航
     * */
    @ReactMethod
    public void goToRoutePlanning(String lat, String lng, String address){
        if(getCurrentActivity()==null){
            return;
        }
        if(checkApkExist(getCurrentActivity(),"com.autonavi.minimap") && !checkApkExist(getCurrentActivity(),"com.baidu.BaiduMap")){
            goToGaode( lat, lng, address);
            return;
        }
        double mLat1 = LocationManager.getLocationInfo().getLatitude();
        double mLon1 = LocationManager.getLocationInfo().getLongitude();
        double mLat2 = Double.parseDouble(lat);
        double mLon2 = Double.parseDouble(lng);
        LatLng pt1 = new LatLng(mLat1, mLon1);
        LatLng pt2 = new LatLng(mLat2, mLon2);
        RouteParaOption para = new RouteParaOption()
                .startPoint(pt1)
                .endPoint(pt2)
                .startName(LocationManager.getLocationInfo().getAddress())
                .endName(address);

        try {
            BaiduMapRoutePlan.setSupportWebRoute(true);
            BaiduMapRoutePlan.openBaiduMapWalkingRoute(para, getCurrentActivity());
        } catch (BaiduMapAppNotSupportNaviException e) {
            e.printStackTrace();
            AlertDialog.Builder builder = new AlertDialog.Builder(getCurrentActivity());
            builder.setMessage("您尚未安装百度地图app或app版本过低，点击确认安装？").setTitle("提示").setPositiveButton("确认", new AlertDialog.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    dialog.dismiss();
                    /**
                     * OpenClientUtil:调起百度客户端工具类
                     *
                     * public static int getBaiduMapVersion(Context context)
                     * 获取百度地图客户端版本号
                     * 返回0代表没有安装百度地图客户端
                     * */
                    OpenClientUtil.getLatestBaiduMapApp(getCurrentActivity());
                }
            }).setNegativeButton("取消", new AlertDialog.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    dialog.dismiss();
                }
            }).create().show();
        }
    }

    private Double gg_lon;
    private Double gg_lat;

    //高德
    private void goToGaode(String lat, String lon, String address) {
        bd_decrypt(Double.parseDouble(lat), Double.parseDouble(lon));
        StringBuffer stringBuffer = new StringBuffer("androidamap://route?sourceApplication=").append("amap");

        stringBuffer.append("&dlat=").append(gg_lat)
                .append("&dlon=").append(gg_lon)
                .append("&dname=").append(address)
                .append("&dev=").append(0)
                .append("&t=").append(0);

        Intent intent = new Intent("android.intent.action.VIEW", android.net.Uri.parse(stringBuffer.toString()));
        intent.setPackage("com.autonavi.minimap");
        if(getCurrentActivity()!=null) {
            getCurrentActivity().startActivity(intent);
        }
    }

    //百度转高德
    void bd_decrypt(double bd_lat, double bd_lon) {
        double x = bd_lon - 0.0065, y = bd_lat - 0.006; double z = sqrt(x * x + y * y) - 0.00002 * sin(y * Math.PI);
        double theta = atan2(y, x) - 0.000003 * cos(x * Math.PI);
        gg_lon = z * cos(theta);
        gg_lat = z * sin(theta);

    }

    //判断是否安装地图应用 com.autonavi.minimap/com.baidu.BaiduMap
    private boolean checkApkExist(Context context, String packageName) {
        if (packageName == null || "".equals(packageName))
            return false;
        try {
            ApplicationInfo info = context.getPackageManager().getApplicationInfo(packageName,
                    PackageManager.GET_UNINSTALLED_PACKAGES);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
    }

}
