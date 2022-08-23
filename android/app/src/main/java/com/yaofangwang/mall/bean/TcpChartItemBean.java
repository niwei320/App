package com.yaofangwang.mall.bean;

/**
 * Created by marti on 2018/12/7.
 */

public class TcpChartItemBean {
    private String code;
    private String msg;
    private TcpChatConvertBean.ResultBean.ChartItemBean result;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public TcpChatConvertBean.ResultBean.ChartItemBean getResult() {
        return result;
    }

    public void setResult(TcpChatConvertBean.ResultBean.ChartItemBean result) {
        this.result = result;
    }
}
