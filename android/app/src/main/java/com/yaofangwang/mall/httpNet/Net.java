package com.yaofangwang.mall.httpNet;

import android.graphics.Bitmap;

import com.android.volley.Request;
import com.android.volley.Response;

import java.lang.reflect.Type;
import java.util.Map;

/**
 * Created by marti on 2018/7/24.
 * 网络工具类，
 * 此类的方法名固定后就不能再改
 * 此类的参数应该高度统一，做到切换网络框架也不会发生变化
 * 重构记录：
 *          第一次重构 2018年7月25日
 * 未来的计划：
 *          1、回调未实现统一
 *          2、上传文件参数未实现统一
 *          3、POST去除重载，无论什么情况下的PSOT只可能有两个参数，一个请求参数Map，一个回调
 *          4、自定义回调，回调类只有一个，至少要返回成功和错误，其他的非必须
 */
public class Net {

    /**
     * 无异常无Type的POST
     *
     * @param datas
     * @param listener
     * @param <T>
     */
    public static <T> void sendRequest(Map<String, String> datas, Response.Listener<T> listener) {
        sendRequest(datas, listener, null, null);
    }

    /**
     * 无异常回调的POST
     *
     * @param datas
     * @param listener
     * @param type
     * @param <T>
     */
    public static <T> void sendRequest(Map<String, String> datas, Response.Listener<T> listener, Type type) {
        sendRequest(datas, listener, null, type);
    }

    /**
     * 有异常回调的POST
     *
     * @param datas
     * @param listener
     * @param type
     * @param <T>
     */
    public static <T> void sendRequest(
            Map<String, String> datas, Response.Listener<T> listener, Response.ErrorListener error, Type type) {

        TGsonRequest request = NetClient.buildRequest(Request.Method.POST, datas, listener, error, type);
        NetClient.addRequest(request);

//        String fixedKey = datas.remove(TObjSaveType.FIXED_KEY);
//        TObjSaveEntity entity = TObjSaveUtils.requestLocal(NetConfig.app, Consts.api.base_url, datas, fixedKey);// /先请求本地，再请求网络
//        if (entity.is_need_request_net) {// 需要请求网络
//            if (entity.is_need_judge_result_data) {
//                listener.onResponse((T) entity.cacheData);
//                TObjSaveUtils.out("-----本地有数据先更新，同时再请求网络数据！");
//            }
//            TGsonRequest request = NetClient.buildRequest(Request.Method.POST, datas, listener, error, type);
//            NetClient.addRequest(request);
//            request.setOjbSaveEntity(entity);
//        } else {
//            listener.onResponse((T) entity.cacheData);
//            TObjSaveUtils.out("-----直接请求本地数据，不请求网络数据");
//        }
    }

    /**
     * 上传图片
     * TODO 这种上传图片太不合理肯定要换方式或者换框架的
     * @param datas
     * @param bitmaps
     * @param checkBitmaps
     * @param listener
     * @param error
     * @param <T>
     */
    public static <T> void postPic(final Map<String, String> datas, final Bitmap[] bitmaps,
                                   final Bitmap[] checkBitmaps, Response.Listener<String> listener, Response.ErrorListener error) {
        MultipartRequest request = NetClient.buildRequest(datas, bitmaps, checkBitmaps, listener);
        NetClient.addRequest(request);
    }


}
