package com.yaofangwang.mall.utils;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.JSBundleLoader;
import com.yaofangwang.mall.MainApplication;

import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.lang.reflect.Field;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Created by marti on 2018/12/1.
 */

public class CrashHandlerUtil implements Thread.UncaughtExceptionHandler {


    //系统默认的UncaughtException处理类
    private Thread.UncaughtExceptionHandler mDefaultHandler;
    //CrashHandler实例
    private static CrashHandlerUtil INSTANCE = new CrashHandlerUtil();
    //程序的Context对象
    private Context mContext;
    //用来存储设备信息和异常信息
    private Map<String, String> infos = new HashMap<>();
    //当前RN页面信息
    private String currentRouteName = "";
    //用于格式化日期,作为日志文件名的一部分
    private DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss", Locale.CHINA);
    private String crashTip = "应用开小差了，稍后重启下，亲！";

    public String getCrashTip() {
        return crashTip;
    }

    public void setCrashTip(String crashTip) {
        this.crashTip = crashTip;
    }


    private CrashHandlerUtil() {
    }


    public static CrashHandlerUtil getInstance() {
        return INSTANCE;
    }


    public void init(Context context) {
        mContext = context;
        //获取系统默认的UncaughtException处理器
        mDefaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        //设置该CrashHandler为程序的默认处理器
        Thread.setDefaultUncaughtExceptionHandler(this);
    }

    /**
     * 当UncaughtException发生时会转入该函数来处理
     *
     * @param thread 线程
     * @param ex     异常
     */
    @Override
    public void uncaughtException(Thread thread, Throwable ex) {
        if (thread.getName().equals("FinalizerWatchdogDaemon") && ex instanceof TimeoutException) {
            return;
        }
        if (!handleException(ex) && mDefaultHandler != null) {
            //如果用户没有处理则让系统默认的异常处理器来处理
            mDefaultHandler.uncaughtException(thread, ex);
        } else {
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                LoggerUtil.e("error : ", e.toString());
                e.printStackTrace();
            }
            ReactInstanceManager instanceManager = ((MainApplication) mContext.getApplicationContext()).getReactNativeHost().getReactInstanceManager();
            if (instanceManager != null
                    && instanceManager.getCurrentReactContext() != null
                    && instanceManager.getCurrentReactContext().getCurrentActivity() != null
                    && saveCrashInfo2File(ex).contains("com.facebook.react.common.JavascriptException")
            ) {
                new Handler(Looper.getMainLooper()).post(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            AlertDialog alert = new AlertDialog.Builder(instanceManager.getCurrentReactContext().getCurrentActivity())
                                    .setTitle("应用开小差了")
                                    .setMessage("应用开小差了，是否需要重新载入")
                                    .setPositiveButton("重新载入", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            String jsBundleFile = instanceManager.getCurrentReactContext().getCurrentActivity().getFilesDir().getAbsolutePath() + "/index.android.bundle/index.android.bundle";
                                            File file = new File(jsBundleFile);
                                            if (file.exists()) {
                                                try {
                                                    Field bundleLoaderField = instanceManager.getClass().getDeclaredField("mBundleLoader");
                                                    bundleLoaderField.setAccessible(true);
                                                    bundleLoaderField.set(instanceManager, JSBundleLoader.createFileLoader(jsBundleFile));
                                                } catch (Exception e) {
                                                    exitApp();
                                                }
                                            }
                                            instanceManager.recreateReactContextInBackground();
                                        }
                                    })
                                    .setNegativeButton("直接关闭", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            exitApp();
                                        }
                                    })
                                    .setCancelable(false)
                                    .show();
                        } catch (Exception e) {
                            exitApp();
                        }
                    }
                });
            } else {
                exitApp();
            }
        }
    }

    /**
     * 退出程序
     */
    private void exitApp(){
        //退出JVM(java虚拟机),释放所占内存资源,0表示正常退出(非0的都为异常退出)
        System.exit(0);
        //从操作系统中结束掉当前程序的进程
        android.os.Process.killProcess(android.os.Process.myPid());

    }

    /**
     * 自定义错误处理,收集错误信息 发送错误报告等操作均在此完成.
     *
     * @param throwable 异常
     * @return true:如果处理了该异常信息;否则返回false.
     */
    private boolean handleException(final Throwable throwable) {
        if (throwable == null) {
            return false;
        }
        //使用Toast来显示异常信息
        new Thread() {
            @Override
            public void run() {
                Looper.prepare();
                throwable.printStackTrace();
                Toast.makeText(mContext, getCrashTip(), Toast.LENGTH_SHORT).show();
                Looper.loop();
            }
        }.start();
        //收集设备参数信息
        collectDeviceInfo(mContext);
        //保存日志文件
        String carshMsg = saveCrashInfo2File(throwable);
        CarshMsgHandler.saveMsg(carshMsg,mContext);
        return true;
    }

    /**
     * 收集设备参数信息
     *
     * @param ctx 上下文
     */
    public void collectDeviceInfo(Context ctx) {
        try {
            PackageManager pm = ctx.getPackageManager();
            PackageInfo pi = pm.getPackageInfo(ctx.getPackageName(), PackageManager.GET_ACTIVITIES);
            if (pi != null) {
                String versionName = pi.versionName == null ? "null" : pi.versionName;
                String versionCode = pi.versionCode + "";
                infos.put("versionName", versionName);
                infos.put("versionCode", versionCode);
            }
        } catch (PackageManager.NameNotFoundException e) {
            LoggerUtil.e("an error occured when collect package info", e.toString());
        }
        Field[] fields = Build.class.getDeclaredFields();
        for (Field field : fields) {
            try {
                field.setAccessible(true);
                infos.put(field.getName(), field.get(null).toString());
            } catch (Exception e) {
                LoggerUtil.e("an error occured when collect crash info", e.toString());
            }
        }
    }

    /**
     * 保存错误信息到文件中
     *
     * @param ex 异常
     * @return 返回文件名称, 便于将文件传送到服务器
     */
    private String saveCrashInfo2File(Throwable ex) {

        StringBuffer sb = new StringBuffer();
        //不需要设备信息
//        for (Map.Entry<String, String> entry : infos.entrySet()) {
//            String key = entry.getKey();
//            String value = entry.getValue();
//            sb.append(key + "=" + value + "\n");
//        }

        Writer writer = new StringWriter();
        PrintWriter printWriter = new PrintWriter(writer);
        ex.printStackTrace(printWriter);
        Throwable cause = ex.getCause();
        while (cause != null) {
            cause.printStackTrace(printWriter);
            cause = cause.getCause();
        }
        printWriter.close();
        String result = writer.toString();
        sb.append(result);
        /*
        这个 crashInfo 就是我们收集到的所有信息，可以做一个异常上报的接口用来提交用户的crash信息
         */
        return sb.toString() + currentRouteName;
    }

    public void saveCurrentRouteName(String routeName){
        currentRouteName = routeName;
    }
}
