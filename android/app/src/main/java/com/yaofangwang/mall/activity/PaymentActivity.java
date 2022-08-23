package com.yaofangwang.mall.activity;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import com.google.gson.Gson;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.OrderInfoKeyValueBean;
import com.yaofangwang.mall.pay.AliPayUtils;
import com.yaofangwang.mall.pay.PayListener;
import com.yaofangwang.mall.pay.WxPayUtils;

import org.json.JSONException;
import org.json.JSONObject;

import static com.yaofangwang.mall.AndroidNativeApi.emitRNDeviceEvent;

public class PaymentActivity extends AppCompatActivity implements PayListener {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ali_pay);
        initIntent();
    }


    private void initIntent() {
        String alipayInfoData = getIntent().getStringExtra("PaymentInfoData");
        String paymentType = getIntent().getStringExtra("PaymentType");
        OrderInfoKeyValueBean orderInfoKeyValueBean = new Gson().fromJson(alipayInfoData, OrderInfoKeyValueBean.class);
        startToPay(paymentType, orderInfoKeyValueBean);

    }

    private void startToPay(String paymentType, OrderInfoKeyValueBean orderInfoKeyValueBean) {
        if ("ali".equals(paymentType)) {
            AliPayUtils aliPayUtils = new AliPayUtils(this);
            aliPayUtils.pay(orderInfoKeyValueBean, this);
        } else {
            WxPayUtils wxPayUtils = new WxPayUtils(this);
            wxPayUtils.pay(orderInfoKeyValueBean, this,false);
        }
    }

    @Override
    public void onSuccess(String payType) {
        emitRNDeviceEvent("paymentSuccess", payType);
        finish();
    }

    @Override
    public void onFailure(String payType, int code) {
        JSONObject payFailData = new JSONObject();
        try {
            payFailData.put("payType", payType);
            payFailData.put("code", code);
            emitRNDeviceEvent("paymentFailure", payFailData.toString());
            finish();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
}
