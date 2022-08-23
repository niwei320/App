package com.yaofangwang.mall.bean;

import com.yaofangwang.mall.Consts;

public class OrderInfoKeyValueBean {
	public String service;// mobile.securitypay.pay",
	public String public_key;// MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnxj/9qwVfgoUh/y2W89L6BkRAFljhNhgPdyPuBV64bfQNN1PjbCzkIM6qRdKBoLPXmKKMiFYnkd6rAoprih3/PrQEB/VsW8OoM8fxn67UDYuyBTqA23MML9q1+ilIZwBC2AQ2UBVOrFXfFl75p6/B5KsiNG9zpgmLCUYuLkxpLQIDAQAB",
	public String _input_charset;// utf-8",
	public String sign_type;// RSA",
	public String appenv;// system=android^version=1.0",
	public String payment_type;// 1",
	// yujian add (微信参数)
	public String appid;// 公众账号ID wx2ed8c9045bb2f970
	public String device_info;// 设备号(可选)
	public String trade_type;// 交易类型 APP
	public String sign;


	//支付宝参数
	public String private_key;// MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJWrv6olTtBU3xwGzX8semoOS1K6U1bLrWpBZovH1nsPYiFN0O5p/ww8flTh3VE6fHGdY7Mrp53c0aVuIMcW+GI+0fERDvO2t0tQg0ooYbg61yTQBgzhVYVFjGRxJnYalpe57tUGFela3nsyBKyOPX5Bi5HUaO1iltnxuiFtXtK5AgMBAAECgYAw/liuTKog/jdOiFeKcrfbsbQsb3vKZL/ukVwNE6x8+gsoVb233ZC0o7TC+nClH10PH/M7+mVTAq7J1WP7Z+SEXF6Aiy3v9Ym+P2HKnqacaQX+TqrTjtipyXTH9pnsC4F4LvxQNSz2YZeDLND12TcZVfOV/pcUSEMQ9jRQsa671QJBAMTSN6F/g2cjpiSVmINc5RoZ+EwDF6JCAKDDeprNrqRPygnWMI2wRstHnMZoAXNMLg8DuUiNXStlvdrFjEjgWhMCQQDCrEP7gWpsE5H4RRFau5c9finSphqpEzNIW0Fo05YmRWxF2atcnWQ9ZUosB/BNkDUVuaSoxUYef4f5J72nw7mDAkEAsivW3mSvUGvOGCowESLD5rgBtNXLzD/Rj7bFw2NUqDvumq8B7xHXVGf0fQtj3LrmqwLk9M+7uvB0SJoyXzpxbwJBALCIUqWx9/XF0WrYByLGViHXVMnHAwordSe6SRhsNw7BiavV9cVonMvoHFjNYiaUDO+Eh0Lckfd6Iq3YUe3eWU0CQBLL4QAEI7vivlZvNaCjNvhAl4XQS44dH1zPR/Lq1/ko57ZJf2mUTBQM+S4bV0YbAjzAVqiJHUsdueFSsDKHJNA=",
	public String partner;// 2088301654881161",
	public String notify_url;// http://cert.yaofangwang.com/Alipay_Mobile_notify_url.aspx",
	public String seller_id;// zy@yaofangwang.com",
	public String out_trade_no;// C504281642299792",
	public String subject;// 药房网商城（西充同康），磷酸氢钙咀嚼片",
	public String total_fee;// 0.01"

	//微信参数
	public String mch_id;// 商户号 1241635502
	public String prepay_id;//订单号
	public String nonce_str;// 随机字符串，可自己生成
	public String appId = Consts.weixinpara.APP_ID;
	public String Package = "Sign=WXPay";
	public String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
	public String key;// API密钥 277082A76986FACF04505E5DA7D75160



	public String getOrderInfoString() {

		// 签约合作者身份ID
		String orderInfo = "partner=" + "\"" + partner + "\"";

		// 签约卖家支付宝账号
		orderInfo += "&seller_id=" + "\"" + seller_id + "\"";

		// 商户网站唯一订单号
		orderInfo += "&out_trade_no=" + "\"" + out_trade_no + "\"";

		// 商品名称
		orderInfo += "&subject=" + "\"" + subject + "\"";

		// 商品详情
		orderInfo += "&body=" + "\"" + subject + "\"";

		// 商品金额
		orderInfo += "&total_fee=" + "\"" + total_fee + "\"";

		// 服务器异步通知页面路径
		orderInfo += "&notify_url=" + "\"" + notify_url + "\"";

		// 服务接口名称， 固定值
		orderInfo += "&service=\"mobile.securitypay.pay\"";

		// 支付类型， 固定值
		orderInfo += "&payment_type=\"1\"";

		// 参数编码， 固定值
		orderInfo += "&_input_charset=\"utf-8\"";

		// 设置未付款交易的超时时间
		// 默认30分钟，一旦超时，该笔交易就会自动被关闭。
		// 取值范围：1m～15d。
		// m-分钟，h-小时，d-天，1c-当天（无论交易何时创建，都在0点关闭）。
		// 该参数数值不接受小数点，如1.5h，可转换为90m。
		orderInfo += "&it_b_pay=\"30m\"";

		// extern_token为经过快登授权获取到的alipay_open_id,带上此参数用户将使用授权的账户进行支付
		// orderInfo += "&extern_token=" + "\"" + extern_token + "\"";

		// 支付宝处理完请求后，当前页面跳转到商户指定页面的路径，可空
		orderInfo += "&return_url=\"m.alipay.com\"";

		// 调用银行卡支付，需配置此参数，参与签名， 固定值 （需要签约《无线银行卡快捷支付》才能使用）
		// orderInfo += "&paymethod=\"expressGateway\"";
		return orderInfo;
	}
}
