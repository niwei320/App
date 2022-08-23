package com.yaofangwang.mall.bean;

import com.google.gson.annotations.SerializedName;

/**
 * Created by marti on 2018/12/1.
 * 框架3.0版本使用的微信支付类
 */
public class NewWxPayParamsBean {

    private ParamBean param;
    private boolean success;

    public ParamBean getParam() {
        return param;
    }

    public void setParam(ParamBean param) {
        this.param = param;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public static class ParamBean {
        /**
         * package : Sign=WXPay
         * appid : wx2ed8c9045bb2f970
         * sign : 3C26AE2EF6D1E971B1226F38F2BED270
         * partnerid : 1241635502
         * prepayid : wx0114545637281022836afc394216692868
         * noncestr : wOUTH72JafiHi9g4
         * timestamp : 1543647296
         */

        //这里将字段package转成带X了，因为package是语法关键字
        @SerializedName("package")
        private String packageX;
        private String appid;
        private String sign;
        private String partnerid;
        private String prepayid;
        private String noncestr;
        private String timestamp;

        public String getPackageX() {
            return packageX;
        }

        public void setPackageX(String packageX) {
            this.packageX = packageX;
        }

        public String getAppid() {
            return appid;
        }

        public void setAppid(String appid) {
            this.appid = appid;
        }

        public String getSign() {
            return sign;
        }

        public void setSign(String sign) {
            this.sign = sign;
        }

        public String getPartnerid() {
            return partnerid;
        }

        public void setPartnerid(String partnerid) {
            this.partnerid = partnerid;
        }

        public String getPrepayid() {
            return prepayid;
        }

        public void setPrepayid(String prepayid) {
            this.prepayid = prepayid;
        }

        public String getNoncestr() {
            return noncestr;
        }

        public void setNoncestr(String noncestr) {
            this.noncestr = noncestr;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
    }
}
