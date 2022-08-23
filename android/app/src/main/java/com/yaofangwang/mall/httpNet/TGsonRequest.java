package com.yaofangwang.mall.httpNet;


import android.app.Activity;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.HttpHeaderParser;
import com.google.gson.Gson;
import com.yaofangwang.mall.TUtils.AppManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

public class TGsonRequest<T> extends Request<T>  {
    private final Response.Listener<T> mListener;
    Activity mContext;
    Type mType;

    TObjSaveEntity mObjSaveEntity;

    public TGsonRequest<T> setOjbSaveEntity(TObjSaveEntity entity) {
        this.mObjSaveEntity = entity;
        return this;
    }

    public TGsonRequest(int method, String url, Response.Listener<T> listener, Response.ErrorListener errorListener, Type type) {
        super(method, url, errorListener);
        mContext = AppManager.getAppManager().currentActivity();
        mListener = listener;
        mType = type;
    }

    public TGsonRequest(String url, Response.Listener<T> listener, Response.ErrorListener errorListener, Type type) {
        this( Request.Method.GET, url, listener, errorListener, type);
    }

    public TGsonRequest(Activity context, String url, Response.Listener<T> listener, Response.ErrorListener errorListener) {
        this( url, listener, errorListener, null);//不传类type的情况
    }

    @Override
    protected Response<T> parseNetworkResponse(NetworkResponse response) {
        String parsed;
        T obj = null;
        try {
            Map<String, String> headers = response.headers;
            parsed = new String(response.data, HttpHeaderParser.parseCharset(headers));
        } catch (UnsupportedEncodingException e) {
            parsed = new String(response.data);  //解析为String 字符串
        }
        try {
            if (TimShadow.class == mType) {
                obj = (T) parsed;
            } else {
                JSONObject result = new JSONObject(parsed);
                String code = result.getString("code");
                if ("1".equals(code)) {
                    String content = null;
                    if (result.has("item")) {
                        content = result.getString("item");
                    } else if (result.has("items")) {
                        content = result.getString("items");
                    } else if (result.has("shop_items")) {
                        if (result.has("platform_coupons_items")) {
                            content = result.toString();
                        } else {
                            content = result.getString("shop_items");
                        }
                    } else if (result.has("order_items")) {
                        content = result.getString("order_items");
                    } else if (result.has("data_items")) {
                        content = result.getString("data_items");
                    } else if (result.has("msg")) {
                        content = result.getString("msg");
                    } else if (result.length() == 1) {
                        obj = (T) "操作成功";
                        return Response.success(obj, null);
                    }
                    if (null != content) {
                        if (mType != null) {
                            obj = new Gson().fromJson(content, mType);
                        } else {
                            obj = (T) content;
                        }
                    } else if (null == mType) {
                        obj = (T) parsed;
                    }
                } else {
                    String errStr;
                    if (result.has("msg")) {
                        errStr = result.getString("msg");
                    } else {
                        errStr = "";
                    }
                    return Response.error(new VolleyError(errStr));
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        isNeedPostDataAgain = true;
        if (null != mObjSaveEntity && mObjSaveEntity.is_need_judge_result_data) {
            if (mObjSaveEntity.cacheData.toString().equals(obj.toString())) {
                isNeedPostDataAgain = false;
                TObjSaveUtils.out("-----不需要重新更新数据");
            } else {
                isNeedPostDataAgain = true;
                TObjSaveUtils.out("-----需要重新更新数据");
            }
        } else if (null != mObjSaveEntity && mObjSaveEntity.is_need_save_result_data) {
            TObjSaveUtils.saveObjectInCache(mContext, mObjSaveEntity.key, (Serializable) obj);
            TObjSaveUtils.out("-----重新保存数据！");

        }
        return Response.success(obj, HttpHeaderParser.parseCacheHeaders(response));// 传NULL 表示 不需要缓冲数据
    }

    boolean isNeedPostDataAgain = true;// 是否需要重新加载数据，用于本地优先读取数据，然后加载网上数据现在的情况

    @Override
    protected void deliverResponse(T response) {//解析完成后传递结果-->response
        if (response == null || mListener == null) {
            return;
        }
        if (isNeedPostDataAgain) {
            try {
                mListener.onResponse(response);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void deliverError(VolleyError error) {//解析完成后传递错误结果-->error
        if (null != error.getMessage() && error.getMessage().contains("UnknownHostException")) {
            error = new VolleyError("加载失败，请检查您当前的网络环境!");
        } else if (null != error.getMessage() && error.getMessage().startsWith("java")) {
            error = new VolleyError("");
        } else if (error.networkResponse != null) {// &&
            error = new VolleyError("");
        }
        super.deliverError(error);
    }

    public String getTopActivityPackageName(Context context) {
        String topActivityPackage = null;
        String topActivityClass = null;
        ActivityManager activityManager = (ActivityManager) (context.getSystemService(android.content.Context.ACTIVITY_SERVICE));
        List<ActivityManager.RunningTaskInfo> runningTaskInfos = activityManager.getRunningTasks(1);
        if (runningTaskInfos != null) {
            ComponentName f = runningTaskInfos.get(0).topActivity;
            topActivityPackage = f.getPackageName();
            topActivityClass = f.getClassName();
        }
        return topActivityPackage;
    }
}
