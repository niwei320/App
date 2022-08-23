package com.yaofangwang.mall.utils;

import android.content.Context;
import android.net.TrafficStats;
import android.text.TextUtils;
import android.util.Log;

import com.yaofangwang.mall.BuildConfig;


/**
 * Created by marti on 2018/12/5.
 */

public class LoggerUtil {
    private static final String TAG = "YFWREQUEST_TAG";
    public static void e(String msg){
        if(!BuildConfig.DEBUG){
            return;
        }
        Log.e(TAG, msg);
    }

    public static void e(String tag, String msg){
        if(!BuildConfig.DEBUG){
            return;
        }
        Log.e(tag, msg);
    }
    public static void i(String msg){
        if(!BuildConfig.DEBUG){
            return;
        }
        Log.i(TAG, msg);
    }

    public static void i(String tag, String msg){
        if(!BuildConfig.DEBUG){
            return;
        }
        Log.i(tag, msg);
    }

    public static void log(Context con,String __cmd,String time,boolean isBack){
        if(!BuildConfig.DEBUG){
            return;
        }
        StringBuilder sb = new StringBuilder();
        if(isBack){
            sb.append("<----- request : "+__cmd+"\n");
            if(!TextUtils.isEmpty(time)){
                sb.append("<----- 耗时 : "+time+"\n");
            }
            sb.append("<----- 网络 : "+NetUtils.getNetType(con)+"\n");
            sb.append("<----- 网速 : "+ TrafficStats.getTotalRxBytes()+"\n");
        }else{
            sb.append("-----> response : "+__cmd+"\n");
            if(!TextUtils.isEmpty(time)){
                sb.append("-----> 耗时 : "+time+"\n");
            }
            sb.append("-----> 网络 : "+NetUtils.getNetType(con)+"\n");
            sb.append("-----> 网速 : "+ TrafficStats.getTotalRxBytes()+"\n");
        }
        e(sb.toString());
    }
}
