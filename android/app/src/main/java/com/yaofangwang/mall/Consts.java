package com.yaofangwang.mall;

import java.util.concurrent.ArrayBlockingQueue;

/**
 * Created by admin on 2018/9/14.
 */

public class Consts {


    public static ArrayBlockingQueue<String> myBlockingQueue = new ArrayBlockingQueue<String>(1);

    public static class alipaypara {
        /**
         * 合作身份者id，以2088开头的16位纯数字
         */
        public static final String DEFAULT_PARTNER = "2088301654881161";
        /**
         * 收款支付宝账号
         */
        public static final String DEFAULT_SELLER = "zy@yaofangwang.com";
        /**
         * 商户私钥，自助生成
         */
        public static final String PRIVATE = "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJWrv6olTtBU3xwGzX8semoOS1K6U1bLrWpBZovH1nsPYiFN0O5p" +
                "/ww8flTh3VE6fHGdY7Mrp53c0aVuIMcW+GI" +
                "+0fERDvO2t0tQg0ooYbg61yTQBgzhVYVFjGRxJnYalpe57tUGFela3nsyBKyOPX5Bi5HUaO1iltnxuiFtXtK5AgMBAAECgYAw/liuTKog/jdOiFeKcrfbsbQsb3vKZL/ukVwNE6x8+gsoVb233ZC0o7TC" +
                "+nClH10PH/M7+mVTAq7J1WP7Z+SEXF6Aiy3v9Ym+P2HKnqacaQX" +
                "+TqrTjtipyXTH9pnsC4F4LvxQNSz2YZeDLND12TcZVfOV/pcUSEMQ9jRQsa671QJBAMTSN6F/g2cjpiSVmINc5RoZ" +
                "+EwDF6JCAKDDeprNrqRPygnWMI2wRstHnMZoAXNMLg8DuUiNXStlvdrFjEjgWhMCQQDCrEP7gWpsE5H4RRFau5c9finSphqpEzNIW0Fo05YmRWxF2atcnWQ9ZUosB" +
                "/BNkDUVuaSoxUYef4f5J72nw7mDAkEAsivW3mSvUGvOGCowESLD5rgBtNXLzD/Rj7bFw2NUqDvumq8B7xHXVGf0fQtj3LrmqwLk9M+7uvB0SJoyXzpxbwJBALCIUqWx9" +
                "/XF0WrYByLGViHXVMnHAwordSe6SRhsNw7BiavV9cVonMvoHFjNYiaUDO" +
                "+Eh0Lckfd6Iq3YUe3eWU0CQBLL4QAEI7vivlZvNaCjNvhAl4XQS44dH1zPR/Lq1/ko57ZJf2mUTBQM+S4bV0YbAjzAVqiJHUsdueFSsDKHJNA=";
        public static final String PUBLIC = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnxj/9qwVfgoUh/y2W89L6BkRAFljhNhgPdyPuBV64bfQNN1PjbCzkIM6qRdKBoLPXmKKMiFYnkd6rAoprih3/PrQEB" +
                "/VsW8OoM8fxn67UDYuyBTqA23MML9q1+ilIZwBC2AQ2UBVOrFXfFl75p6" + "/B5KsiNG9zpgmLCUYuLkxpLQIDAQAB";
        public static final String RSA = "MIICXQIBAAKBgQCVq7+qJU7QVN8cBs1" +
                "/LHpqDktSulNWy61qQWaLx9Z7D2IhTdDuaf8MPH5U4d1ROnxxnWOzK6ed3NGlbiDHFvhiPtHxEQ7ztrdLUINKKGG4Otck0AYM4VWFRYxkcSZ2GpaXue7VBhXpWt57MgSsjj1" +
                "+QYuR1GjtYpbZ8bohbV7SuQIDAQABAoGAMP5YrkyqIP43TohXinK327G0LG97ymS/7pFcDROsfPoLKFW9t92QtKO0wvpwpR9dDx/zO/plUwKuydVj+2fkhFxegIst7/WJvj9hyp6mnGkF/k6q047Yqcl0x" +
                "/aZ7AuBeC78UDUs9mGXgyzQ9dk3GVXzlf6XFEhDEPY0ULGuu9UCQQDE0jehf4NnI6YklZiDXOUaGfhMAxeiQgCgw3qaza6kT8oJ1jCNsEbLR5zGaAFzTC4PA7lIjV0rZb3axYxI4FoTAkEAwqxD+4FqbBOR" +
                "+EURWruXPX4p0qYaqRMzSFtBaNOWJkVsRdmrXJ1kPWVKLAfwTZA1FbmkqMVGHn+H" +
                "+Se9p8O5gwJBALIr1t5kr1BrzhgqMBEiw+a4AbTVy8w/0Y" +
                "+2xcNjVKg77pqvAe8R11Rn9H0LY9y65qsC5PTPu7rwdEiaMl86cW8CQQCwiFKlsff1xdFq2AcixlYh11TJxwMKK3UnukkYbDcOwYmr1fXFaJzL6BxYzWImlAzvhIdC3JH3eiKt2FHt3llNAkASy" +
                "+EABCO74r5WbzWgozb4QJeF0EuOHR9cz0fy6tf5KOe2SX9plEwUDPkuG1dGGwI8wFaoiR1LHbnhUrAyhyTQ";
        public static final String APPID = "2015102100507562";
    }

    public static class api {
        public static String base_url = "https://open.yaofangwang.com/app_gateway.ashx";
       // public static String base_url = "http://192.168.2.23:83/app_gateway.ashx";

        public static final String app_key = "a53db3d0a4f1bdd6c1232e1db16f232b";
        public static final String app_secret = "c40617a9865baba6c97ac061f5bab1fe";
        //        public static final String app_key = "4fb44b67d0be2af36f7135586d38d658";
//        public static final String app_secret = "4ea0b919090d21ad6b77b0f9188e6905";
        public static final String os = "android";
        public static int timeout = 50000;// Volley的post方法设置超时重连机制,单位为毫秒
    }
    public static boolean isDelete = false;

    public static class PreferenceKey {
        public static final String isWelcomeShowed = "is_welcome_showed";
        public static final String preferenceName = "preference_name";
        public static final String oldVersion = "old_version";
        public static final String timeDuring = "timd_during";
        public static final String ssid = "ssid";
        public static final String isMap = "is_map";

        public static final String SP_CHUFANG_TIP_VIEW = "is_tip_show";//比价页处方咨询tipview
    }
    public static boolean isJPush = false;
    public static String Zhichi_appkey = "c67d8705208743a890f4164fea4bda16";

    public static class qqpara {
        public static final String APP_ID = "1104618462";// 100424468
        public static final String APP_KEY = "HWPyhyl68j1vdNcc";// c7394704798a158208a74ab60104f0ba
    }

    public static class weixinpara {
        public static final String APP_ID = "wx2ed8c9045bb2f970";// wxf6d404887435b825(门业CRM)
        public static final String APP_SECRET = "610acf4597527b7afbf8d36edd50a719";// 44205e5271a09aee767d3cdd348c7b40(门业CRM)
    }

    //数美SDK通用配置
    public static class smpara {
        public static final String android_public_key = "MIIDLzCCAhegAwIBAgIBMDANBgkqhkiG9w0BAQUFADAyMQswCQYDVQQGEwJDTjELMAkGA1UECwwCU00xFjAUBgNVBAMMDWUuaXNodW1laS5jb20wHhcNMjAwNDI3MTE1NDIzWhcNNDAwNDIyMTE1NDIzWjAyMQswCQYDVQQGEwJDTjELMAkGA1UECwwCU00xFjAUBgNVBAMMDWUuaXNodW1laS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCEnM701f+Fpp1ekRQBDmTb8Il6u5iaSod+MlvG0INiktcADhz+MUOkhrTYd41MCTHsojlMA5gmTqwm2+wpuVppzUeA61F8sY3hCk+g3naGDT4vhIfpvfODwuoUB41uSXQMa/8jbkpIntyStt5ZpEWNYScBAcXfvEGNslrQSWQ1HdwgGNCf1uMIYEHVq2MlaC6rxDrwDvEJq95HvYLJRmsDBy/GFgcH2lch+3GwESTyw9yTTrwmK+HT0xe1zLZAY3JP0VrqDRNWHvEux0ZW0Qk2mgQtH6ntdFD2yGfJD6dWXCZP4xyMr8gdR+lNqglhFrtqx607r/C5iGCLTDthGBNvAgMBAAGjUDBOMB0GA1UdDgQWBBQkt484C7FpC+4z6MKd+NTvD9HriDAfBgNVHSMEGDAWgBQkt484C7FpC+4z6MKd+NTvD9HriDAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBBQUAA4IBAQAl1mDsrsV5u/5WV0a9dY+qtNI+i6C0gF3fh3PpfmgT0Pmj3tK0BEK6WtdoMSNF/Xi1M1dzK/KbjEE9o5bNfb9rRK2tGYySR5/du+cb0bNCkTg66P2n2584WPw7ODU1MA/fA+rq9RrfVOf4ghQ6ShpIGZGfSw/7ymcgtZFjd8ZsY/N+ZvsXA96XjzOBFqKODZlgaL4Sg/jaIpvLo8ae0ZiO1amT8zFfuMB2wKHx+Xeot3KxWzKeCeDF3YBngLoWIBNGof141+ve9mfwWpIyVq4IRhiVHvYchgaSamLTE7FJnxDvjmMW9gheHq9a61I2HRG9RMw80aLR7OwUvLUH9Fzu";
        public static final String organization = "V5q9k7igvwpLHJXPSXBU";
        public static final String appId = "V5q9k7igvwpLHJXPSXBU";
        public static final String ainfoKey = "eOQaHmsnzRZwmSrBYIvuaJTdTTCyCiChBoGbbfrklVpeAEgAWLIseighToCzrrZv";

    }

    public static class extra {
        public static final String EXTRA_ADDRESS_LIST = "extra_address_list";
        public static final String EXTRA_ADDRESS_NEED_BACK = "extra_address_list_need_back";
        public static final String EXTRA_SINGLE_ADDRESS = "extra_single_address";
        public static final String DATA_URL = "url";
        public static final String DATA_SHARE_URL = "share_url";
        public static final String DATA_URL_TITLE = "url_title";
        public static final String DATA_FILTER_ENTITY = "filter_entity";
        public static final String DATA_MEDICINE_ID = "medicine_id";
        public static final String DATA_CATEGROY_ID = "categroy_id";
        public static final String DATA_CATEGROY_NAME = "categroy_name";
        public static final String DATA_MILL_ID = "data_mill_id";
        public static final String DATA_SHOP_ID = "shop_id";
        public static final String DATA_SHOP_GOODS_ID = "shop_goods_id";
        // 这个字段是为了收藏商家里面的图片字段可后来取消了这个字段
        public static final String DATA_SHOP_GOODS_ID_IMG = "shop_goods_id_img";
        public static final String DATA_SHOP_GOODS_TITLE = "shop_goods_title";
        public static final String DATA_ORDER_ID = "order_id";
        public static final String DATA_SEND_GOOD_TYPE = "data_send_good_type";
        public static final String DATA_IS_RECEIVE_GOODS = "is_receive_goods";
        public static final String DATA_RECEIVE_GOODS_STRING = "receive_goods_string";
        public static final String DATA_ORDER_TOTAL = "order_total";
        public static final String DATA_ORDER_PACKAGE_PIRCE = "order_package_pirce";
        public static final String DATA_ORDER_GOODS_ITEMS = "order_goods_items";
        public static final String DATA_SHOP_NAME = "shop_name";
        public static final String EXTRA_QRCODE_TYPE = "extra_code_type";
        public static final String EXTRA_QRCODE_CONTENT = "extra_code_content";
        public static final String EXTRA_LIST_DATA = "extra_list_data";
        public static final String EXTRA_DATA = "extra_data";
        public static final String EXTRA_ORDER_BEAN = "extra_order_bean";
        public static final String EXTRA_WHICH = "extra_which";
        public static final String EXTRA_TITLE = "extra_title";
        public static final String EXTRA_CONTENT = "extra_content";
        public static final String EXTRA_CODE = "extra_code";
        public static final String EXTRA_ACCOUNT_RESULT = "extra_account_result";
        public static final String EXTRA_ACCOUNT_RESULT_ADDRESS = "extra_account_result_address";
        public static final String EXTRA_RX_TYPE = "extra_rx_type";
        public static final String EXTRA_REQUEST_TYPE = "extra_request_type";
        public static final String EXTRA_REFUSE_TYPE = "extra_request_type";
        // yujian add
        public static final String EXTRA_PAYMENT_TYPE = "extra_payment_type";
        public static final String DATA_ARTICLE_ID = "article_id";
        public static final String DATA_MEDICINE_BEAN = "data_medicine_bean";
    }

    public static class qrresult {
        public static final String QR_GET_GOODS_DETAIL = "get_goods_detail";
        public static final String QR_GET_SHOP_GOODS_DETAIL = "get_shop_goods_detail";
        public static final String QR_GET_SHOP_DETAIL = "get_shop_detail";
        public static final String QR_GET_H5 = "get_h5";
        public static final String QR_LOGIN = "login";
        public static final String QR_SEARCH = "get_search_goods";
        public static final String QR_GET_SHOP_CAR = "get_shopping_car";
        public static final String QR_ERP = "erpOrderScan";
    }



}
