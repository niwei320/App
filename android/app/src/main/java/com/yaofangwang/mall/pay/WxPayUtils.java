package com.yaofangwang.mall.pay;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.widget.Toast;

import com.tencent.mm.opensdk.modelpay.PayReq;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import com.yaofangwang.mall.TUtils.MD5;
import com.yaofangwang.mall.bean.OrderInfoKeyValueBean;
import com.yaofangwang.mall.wxapi.WXPayEntryActivity;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by marti on 2018/8/10.
 * 微信支付工具类
 */
public class WxPayUtils {

    private Activity con;
    private PayListener listener;

    private PayReq req;
    private IWXAPI msgApi;

    public WxPayUtils(Activity con) {
        this.con = con;
        req = new PayReq();
        registPayResultBroadcast();
    }

    public void registerApp(String APP_ID) {
        msgApi = WXAPIFactory.createWXAPI(con, null);
        msgApi.registerApp(APP_ID);
    }

    /**
     * 微信支付第二步签名信息
     *
     * @param wxBean
     */
    public void pay(final OrderInfoKeyValueBean wxBean, final PayListener listener,boolean hasSign) {
        this.listener = listener;
        registerApp(wxBean.appId);
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    req.appId = wxBean.appId;
                    req.partnerId = wxBean.mch_id;
                    req.prepayId = wxBean.prepay_id;
                    req.packageValue = wxBean.Package;
                    req.nonceStr = wxBean.nonce_str;
                    req.timeStamp = wxBean.timestamp;

                    if(!hasSign){
                        //Http请求的话是没有sign的，需要自己拼凑
                        List<NameValuePair> signParams = new LinkedList<NameValuePair>();
                        signParams.add(new BasicNameValuePair("appid", req.appId));
                        signParams.add(new BasicNameValuePair("noncestr", req.nonceStr));
                        signParams.add(new BasicNameValuePair("package", req.packageValue));
                        signParams.add(new BasicNameValuePair("partnerid", req.partnerId));
                        signParams.add(new BasicNameValuePair("prepayid", req.prepayId));
                        signParams.add(new BasicNameValuePair("timestamp", req.timeStamp));
                        // signParams.add(new BasicNameValuePair("signType", "MD5"));
                        req.sign = genAppSign(signParams, wxBean.key); ///发送的东西要用MD5加密
                    }else{
                        //Tcp请求是有sign的，直接赋值就好
                        req.sign = wxBean.key; ///发送的东西要用MD5加密
                    }
                    msgApi.sendReq(req);
                } catch (Exception e) {
                    if(listener !=null){
                        listener.onFailure(PayUtils.TYPE_WX, PayListener.PAY_SIGN_FIAL_WX);
                    }
                    return;
                }
            }
        }).start();
    }

    /**
     * 加密信息
     *
     * @param params
     * @param key
     * @return
     */
    private String genAppSign(List<NameValuePair> params, String key) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < params.size(); i++) {
            sb.append(params.get(i).getName());
            sb.append('=');
            sb.append(params.get(i).getValue());
            sb.append('&');
        }
        sb.append("key=");
        sb.append(key);
        String appSign = MD5.getMessageDigest(sb.toString().getBytes()).toUpperCase();
        Log.d("orion", appSign);
        return appSign;
    }

    /**
     * 注册广播
     */
    private void registPayResultBroadcast() {
        LocalBroadcastManager localManager = LocalBroadcastManager.getInstance(con.getApplicationContext());
        IntentFilter filter = new IntentFilter(WXPayEntryActivity.ACTION_WX_PAY);
        localManager.registerReceiver(mReceiver, filter);
    }

    private BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            int result = intent.getIntExtra(WXPayEntryActivity.WX_PAY_RESULT_CODE, -100);
            if (listener != null) {
                    if (result == 0) {
                        // 微信支付成功回调
                        Toast.makeText(con,"支付成功",Toast.LENGTH_SHORT).show();
                        listener.onSuccess(PayUtils.TYPE_WX);
                    } else if (result == -1) {
                        // 错误
                        Toast.makeText(con,"支付失败,请重试",Toast.LENGTH_SHORT).show();
                        listener.onFailure(PayUtils.TYPE_WX, PayListener.PAY_FAIL);
                    } else {
                        // 取消
                        Toast.makeText(con,"尚未支付",Toast.LENGTH_SHORT).show();

                        listener.onFailure(PayUtils.TYPE_WX, PayListener.PAY_CANCEL);
                    }
            }
            LocalBroadcastManager.getInstance(context).unregisterReceiver(this);
        }
    };


}
