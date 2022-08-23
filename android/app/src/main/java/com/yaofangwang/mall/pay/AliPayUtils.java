package com.yaofangwang.mall.pay;

import android.app.Activity;
import android.widget.Toast;

import com.alipay.sdk.app.PayTask;
import com.yaofangwang.mall.SignUtils;
import com.yaofangwang.mall.bean.OrderInfoKeyValueBean;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

/**
 * Created by marti on 2018/8/10.
 * 支付宝支付工具类
 */
public final class AliPayUtils {
    private Activity con;

    public AliPayUtils(Activity con) {
        this.con = con;
    }

    /**
     * 支付第二步签名支付信息
     * @param bean
     */
    public void pay(final OrderInfoKeyValueBean bean, PayListener listener) {
        String orderInfo = bean.getOrderInfoString();
        // 对订单做RSA 签名
        String sign = SignUtils.sign(bean.getOrderInfoString(), bean.private_key);
        try {
            // 仅需对sign 做URL编码
            sign = URLEncoder.encode(sign, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            if(listener!=null){
                listener.onFailure(PayUtils.TYPE_ALI, PayListener.PAY_SIGN_FIAL_ALI);
            }
            return;
        }
        // 完整的符合支付宝参数规范的订单信息
        final String payInfo = orderInfo + "&sign=\"" + sign + "\"&" + getSignType();

        startPay(payInfo,listener);
    }

    /**
     * 支付第三步调起支付页面
     * 因为支付宝最终传递的只是一个字符串，所以Http请求的话需要自己拼凑，TCP已经拼凑好了，可以直接调用
     * @param orderInfo
     */
    public void startPay(final String orderInfo,final PayListener listener) {
        new Thread() {
            @Override
            public void run() {
                PayTask alipay = new PayTask((Activity) con);
                final String result = alipay.pay(orderInfo,true);
                final PayResultBean resultBean = new PayResultBean(result);
                con.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if(listener!=null){
                            if(resultBean.resultStatus!=null){
                                if ("9000".equals(resultBean.resultStatus) && null != resultBean.result && (resultBean.result.contains("Success")||resultBean.result.contains("success=\"true\""))) {
                                    listener.onSuccess(PayUtils.TYPE_ALI);
                                }else{
                                    if("4000".equals(resultBean.resultStatus)){
                                        Toast.makeText(con,"支付失败,请重试",Toast.LENGTH_SHORT).show();
                                        listener.onFailure(PayUtils.TYPE_ALI, PayListener.PAY_FAIL);
                                    }else if("8000".equals(resultBean.resultStatus)){
                                        Toast.makeText(con,"支付中,请耐心等待,请重试",Toast.LENGTH_SHORT).show();
                                        listener.onFailure(PayUtils.TYPE_ALI, PayListener.PAY_WAIT_PAYING);
                                    }else if("6001".equals(resultBean.resultStatus)){
                                        Toast.makeText(con,"尚未支付",Toast.LENGTH_SHORT).show();
                                        listener.onFailure(PayUtils.TYPE_ALI, PayListener.PAY_CANCEL);
                                    }else if("6002".equals(resultBean.resultStatus)){
                                        Toast.makeText(con,"网络异常,支付失败",Toast.LENGTH_SHORT).show();
                                        listener.onFailure(PayUtils.TYPE_ALI, PayListener.PAY_NEW_ERROR);
                                    }
                                }
                            }else{
                                Toast.makeText(con,"支付失败,请重试",Toast.LENGTH_SHORT).show();
                                listener.onFailure(PayUtils.TYPE_ALI, PayListener.PAY_FAIL);
                            }
                        }
                    }
                });
            }
        }.start();
    }

    private static class PayResultBean {
        public String resultStatus;
        public String memo;
        public String result;

        public PayResultBean(String resultString) {
            String[] fileds = resultString.split(";");
            for (int i = 0; i < fileds.length; i++) {
                String fileValue = fileds[i].replaceFirst("=", "||||||");
                String[] key_value = fileValue.split("\\|\\|\\|\\|\\|\\|");
                if (key_value[0].equals("resultStatus")) {
                    resultStatus = key_value[1].replace("{", "").replace("}", "");
                } else if (key_value[0].equals("memo")) {
                    memo = key_value[1].replace("{", "").replace("}", "");
                } else if (key_value[0].equals("result")) {
                    result = key_value[1].replace("{", "").replace("}", "");
                }
            }

        }

        @Override
        public String toString() {
            return "PayResultBean{" + "resultStatus='" + resultStatus + '\'' + ", memo='" + memo + '\'' + ", result='" + result + '\'' + '}';
        }
    }

    private String getSignType() {
        return "sign_type=\"RSA\"";
    }

}
