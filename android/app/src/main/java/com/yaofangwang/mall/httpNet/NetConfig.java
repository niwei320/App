package com.yaofangwang.mall.httpNet;

import android.app.Application;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.Volley;

/**
 * Created by marti on 2018/7/24.
 * 网络相关配置
 */
public class NetConfig {
    /*全局Context*/
    public static Application app;
    /*当前单例*/
    private static NetConfig config;
    /*Volley统一请求对象*/
    private RequestQueue mRequestQueue;
    /*请求Tag*/
    public final static String NET_TAG = "NET_TAG";
    /*连接超时*/
    public final static int TIME_OUT = 50000;

    /*初始化，必须调用，建议在Application中*/
    public static void init(Application con) {
        synchronized (NetConfig.class) {
            if (config == null) {
                synchronized (NetConfig.class) {
                    config = new NetConfig(con);
                }
            }
        }
    }

    /**
     * 不可访问的构造，在初始化时候调用
     * 在构造的同时获取网络请求需要的和业务需要的系统参数
     *
     * @param app
     */
    private NetConfig(Application app) {
        NetConfig.app = app;
        mRequestQueue = Volley.newRequestQueue(app);
    }

    /**
     * 添加一个Request，实际上是发送一个Request
     *
     * @param request
     * @param <T>
     */
    public static <T> void addRequest(Request<T> request) {
        config.mRequestQueue.add(request);
    }

    public static void cancelAllRequest() {
        config.mRequestQueue.cancelAll(NET_TAG);
    }


}
