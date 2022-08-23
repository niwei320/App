package com.yaofangwang.mall.pay;

/**
 * Created by marti on 2018/8/14.
 * 支付工具类
 */
public class PayUtils {
    /*支付类型*/
    public static final String TYPE_ALI = "ali";
    public static final String TYPE_WX = "wx";

    /*阿里接口*/
    public static final String SERVICE_ALI_ACCOUNT = "get_order_alipay_mobile_info";/*结算*/
    public static final String SERVICE_ALI_CHUFANG = "get_rx_order_alipay_mobile_info";/*处方*/
    /*微信接口*/
    public static final String SERVICE_WX_ACCOUNT = "get_order_wxpay_mobile_info";/*结算*/
    public static final String SERVICE_WX_CHUFANG = "get_rx_order_wxpay_mobile_info";/*处方*/
}
