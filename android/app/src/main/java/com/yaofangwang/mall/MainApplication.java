package com.yaofangwang.mall;

import android.app.Application;
import android.content.Context;
import android.os.Build;
import android.os.StrictMode;
import android.support.multidex.MultiDex;

import com.BV.LinearGradient.LinearGradientPackage;
import com.beefe.picker.PickerViewPackage;
import com.bolan9999.SpringScrollViewPackage;
import com.bun.miitmdid.core.JLibrary;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.facebook.react.ReactApplication;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.horcrux.svg.SvgPackage;
import com.bolan9999.SpringScrollViewPackage;
import com.beefe.picker.PickerViewPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.imagepicker.ImagePickerPackage;
import com.rnfs.RNFSPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import cn.jiguang.plugins.push.JPushPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.horcrux.svg.SvgPackage;
import com.imagepicker.ImagePickerPackage;
import com.rnfs.RNFSPackage;
import com.sobot.chat.ZCSobotApi;
import com.umeng.analytics.MobclickAgent;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.socialize.PlatformConfig;
import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.MapDelivery.MapDeliveryViewPackage;
import com.yaofangwang.mall.MapNearbyPoi.MapNearbyPoiViewPackage;
import com.yaofangwang.mall.httpNet.NetConfig;
import com.yaofangwang.mall.utils.CarshMsgHandler;
import com.yaofangwang.mall.utils.CrashHandlerUtil;
import com.yaofangwang.mall.utils.FrescoLoad;
import com.yaofangwang.mall.utils.LoggerUtil;
import com.yaofangwang.mall.utils.UserInfoManager;

import java.io.File;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Nullable;

import cn.jiguang.analytics.android.api.JAnalyticsInterface;
import cn.jiguang.plugins.push.JPushModule;
import cn.jiguang.plugins.push.JPushPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
public class MainApplication extends Application implements ReactApplication {


    public String receiveJpushData;

    //erp QR Login
    public String from_unionid = "";
    public String sub_siteid = "";

    public boolean MianActivityHadBeCreated;
    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(base);
    }

    private static Application mInstance;
    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new ReactMainPackage(),
                    new SvgPackage(),
                    new ImagePickerPackage(),
                    new PickerViewPackage(),
                    new RNViewShotPackage(),
                    new RNFSPackage(),
                    new AndroidNativePackge(),
                    new MapNearbyPoiViewPackage(),
                    new MapDeliveryViewPackage(),
                    new LinearGradientPackage(),
                    new JPushPackage(),
                    new SpringScrollViewPackage(),
                    new FastImageViewPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }

        @Nullable
        @Override
        protected String getJSBundleFile() {
            String jsBundleFile = getFilesDir().getAbsolutePath() + "/index.android.bundle/index.android.bundle";
            File file = new File(jsBundleFile);
            if (file.exists()) {
                LoggerUtil.e("index.android.bundle","读取assets中下载的bundl包");
                return jsBundleFile;
            } else {
                LoggerUtil.e("index.android.bundle","读取打包的apk中下载的bundl包");
                return super.getJSBundleFile();
            }
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        mInstance = this;
        SoLoader.init(this, /* native exopackage */ false);//react-native 使用用于加载so库文件

        CrashHandlerUtil.getInstance().init(this); //初始化收集崩溃类
        try {
            CarshMsgHandler.postErrorMsg(this,CarshMsgHandler.getMsg(this)); //上传崩溃信息
        }catch (Exception ignored){
        }
        JLibrary.InitEntry(this); //移动安全联盟SDK初始化
        LocationManager.init(this);//初始化定位 百度sdk
        if (Build.VERSION.SDK_INT >= 23) {
            StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
            StrictMode.setVmPolicy(builder.build());
            builder.detectFileUriExposure();
        }
        NetConfig.init(this);//网络设置
        UserInfoManager.init(this);//用户基本信息参数初始化
        FrescoLoad.init(this);//Fresco初始化
        initCounterSDK();//初始化统计SDK
        ZCSobotApi.initSobotSDK(this, Consts.Zhichi_appkey, "");
    }


    private void initCounterSDK() {

        //极光推送  调用此方法：点击通知让应用从后台切到前台
        JPushModule.registerActivityLifecycle(this);

        /*极光统计*/
        JAnalyticsInterface.init(this);//初始化
        JAnalyticsInterface.setDebugMode(false);// 打开Logcat输出，上线时，一定要关闭
        JAnalyticsInterface.initCrashHandler(this);//异常上报

        /*友盟统计*/
        UMConfigure.setLogEnabled(BuildConfig.DEBUG);
        UMConfigure.preInit(this, null, null);//(Context context, String appkey, String channel)  使用AndroidManifest.xml中配置好的appkey和channel值appkey和channel参数请置为null
        MobclickAgent.setPageCollectionMode(MobclickAgent.PageMode.MANUAL);//友盟手动埋点采集OnResume和OnPause

        /* 友盟分享配置三方SDK appID*/
        PlatformConfig.setWeixin(Consts.weixinpara.APP_ID, Consts.weixinpara.APP_SECRET);
        PlatformConfig.setQQZone(Consts.qqpara.APP_ID, Consts.qqpara.APP_KEY);
        PlatformConfig.setSinaWeibo("537022104", "e30bbf2cd8061c836c7410f2d893da87", "http://app.yaofangwang.com");

    }

    public static Context getInstance() {
        return mInstance;
    }

    @Override
    public void onTerminate() {
        super.onTerminate();
    }
}
