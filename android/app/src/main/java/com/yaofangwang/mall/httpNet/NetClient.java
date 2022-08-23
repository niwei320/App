package com.yaofangwang.mall.httpNet;

import android.graphics.Bitmap;
import android.text.TextUtils;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.Response;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.TUtils.TUtils;

import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;
import java.net.URLEncoder;
import java.util.Map;

/**
 * Created by marti on 2018/7/25.
 */
public class NetClient {
    /**
     * 构建普通请求Request
     *
     * @param mode
     * @param datas
     * @param listener
     * @param error
     * @param type
     * @param <T>
     * @return
     */
    public static <T> TGsonRequest buildRequest(
            int mode, Map<String, String> datas, Response.Listener<T> listener, Response.ErrorListener error, Type type) {

        /*添加全局参数*/
        Map<String, String> newDatas = ProjectConfig.addGlobalParameters(datas);
        /*将参数转换为url*/
        final String newUrl = ProjectConfig.convertToUrl(newDatas, Consts.api.base_url);
        TGsonRequest request = new TGsonRequest<T>(mode, Consts.api.base_url, listener, error, type) {
            @Override
            public byte[] getBody() throws AuthFailureError {
                try {
                    return newUrl.replace(Consts.api.base_url + "?", "").getBytes("UTF-8");
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
                return null;
            }

            @Override
            public String getBodyContentType() {
                return "application/x-www-form-urlencoded";
            }
        };
        request.setTag(NetConfig.NET_TAG);
        request.setRetryPolicy(new DefaultRetryPolicy(NetConfig.TIME_OUT, DefaultRetryPolicy.DEFAULT_MAX_RETRIES, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        return request;
    }

    /**
     * 构建上传文件的Request
     *
     * @param listener
     * @param <T>
     * @return
     */
    public static <T> MultipartRequest buildRequest(Map<String, String> datas, Bitmap[] bitmaps,
                                                    Bitmap[] checkBitmaps, Response.Listener<String> listener) {

        /*添加全局参数*/
        Map<String, String> newDatas = ProjectConfig.addGlobalParameters(datas);
        /*将参数转换为url*/
        final String newUrl = ProjectConfig.convertToUrl(newDatas, Consts.api.base_url);
        /*签名*/
        String sign = TUtils.getSign(datas);
        /*获取新的路径*/
        final String bodyUrl = newUrl.replace(Consts.api.base_url + "?", "");
        /*构造Request*/
        MultipartRequest request = new MultipartRequest(Request.Method.POST, Consts.api.base_url, bodyUrl, listener);
        MultipartEntity entity = request.getMultiPartEntity();
        /*添加各种参数以及文件*/
        try {
            for (String key : datas.keySet()) {
                if(!TextUtils.isEmpty(datas.get(key))){
                    entity.addStringPart(key, URLEncoder.encode(datas.get(key), "UTF-8"));
                }
            }
            entity.addStringPart("sign", URLEncoder.encode(sign, "UTF-8"));
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        if (null != bitmaps) {
            for (int i = 0; i < bitmaps.length; i++) {
                entity.addBinaryPart("images" + i + ".jpg", TUtils.Bitmap2Bytes(bitmaps[i]), "voucher_images" + i + ".jpg");
            }
        }

        if (null != checkBitmaps) {
            for (int i = 0; i < checkBitmaps.length; i++) {
                entity.addBinaryPart("rimages" + i + ".jpg", TUtils.Bitmap2Bytes(checkBitmaps[i]), "report_images" + i + ".jpg");
            }
        }
        request.setTag(NetConfig.NET_TAG);
        request.setRetryPolicy(new DefaultRetryPolicy(NetConfig.TIME_OUT, DefaultRetryPolicy.DEFAULT_MAX_RETRIES, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        return request;
    }

    /**
     * 给Volley添加一个请求，实际上是发送一个请求
     *
     * @param request
     */
    public static void addRequest(Request request) {
        NetConfig.addRequest(request);
    }
}
