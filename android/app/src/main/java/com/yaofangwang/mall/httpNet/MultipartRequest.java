package com.yaofangwang.mall.httpNet;

import android.util.Log;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.HttpHeaderParser;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

/**
 * MultipartRequest，返回的结果是String格式的
 *
 * @author mrsimple 	///Volley上传文件
 */
public class MultipartRequest extends Request<String> {

    MultipartEntity mMultiPartEntity = new MultipartEntity();
    Response.Listener<String> mListener;
    String urlData;

    public MultipartRequest(int method, String url, String urlData, Response.Listener<String> listener) {
        super(method, url, null);
        this.urlData = urlData;
        mListener = listener;
    }

    /**
     * @return
     */
    public MultipartEntity getMultiPartEntity() {
        return mMultiPartEntity;
    }

    @Override
    public String getBodyContentType() {
        return mMultiPartEntity.getContentType().getValue();
    }

    @Override
    public byte[] getBody() {

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try {
//            byte[] urlData = this.urlData.getBytes("UTF-8");
//            bos.write(urlData, 0, urlData.length);
            // 将mMultiPartEntity中的参数写入到bos中
            mMultiPartEntity.writeTo(bos);
        } catch (IOException e) {
            Log.e("IOException", "IOException writing to ByteArrayOutputStream");
        }
        return bos.toByteArray();
    }

    @Override
    protected void deliverResponse(String response) {
        mListener.onResponse(response);
        if(null!=mMultiPartEntity){
            mMultiPartEntity.close();
        }
    }

    @Override
    public void deliverError(VolleyError error) {
        super.deliverError(error);
        if(null!=mMultiPartEntity){
            mMultiPartEntity.close();
        }
    }

    @Override
    protected Response<String> parseNetworkResponse(NetworkResponse response) {
        String parsed;
        try {
            parsed = new String(response.data, HttpHeaderParser.parseCharset(response.headers));
        } catch (UnsupportedEncodingException e) {
            parsed = new String(response.data);
        }
        return Response.success(parsed, HttpHeaderParser.parseCacheHeaders(response));
    }

}