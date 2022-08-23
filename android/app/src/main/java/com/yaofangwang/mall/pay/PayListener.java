package com.yaofangwang.mall.pay;

/**
 * Created by marti on 2018/8/10.
 * 支付回调
 */
public interface PayListener {
    int PAY_CANCEL = -1;//支付取消
    int PAY_FAIL = -2;//支付失败
    int PAY_WAIT_PAYING = -3;//支付中
    int PAY_NEW_ERROR = -4;//网络异常（支付宝）
    int PAY_FAIL_OTHERS = -5;//其它原因失败（本地原因）
    int PAY_SIGN_FIAL_ALI = -6;//支付宝签名失败
    int PAY_SIGN_FIAL_WX = -7;//微信签名失败

    void onSuccess(String payType);
    void onFailure(String payType, int code);
}
