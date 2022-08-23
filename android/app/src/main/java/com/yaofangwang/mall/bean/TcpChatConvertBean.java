package com.yaofangwang.mall.bean;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by marti on 2018/12/7.
 */

public class TcpChatConvertBean {

    private int code;
    private ResultBean result;
    private Object msg;
    private String ssid;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public ResultBean getResult() {
        return result;
    }

    public void setResult(ResultBean result) {
        this.result = result;
    }

    public Object getMsg() {
        return msg;
    }

    public void setMsg(Object msg) {
        this.msg = msg;
    }

    public String getSsid() {
        return ssid;
    }

    public void setSsid(String ssid) {
        this.ssid = ssid;
    }

    public static class ResultBean {

        private String goods_name;
        private String mill_title;
        private int visit_count;
        private String price;
        private int store_num;
        private String chart_desc;
        private String time;
        private String price_sort;
        private ChartItemBean chart_item;

        public String getGoods_name() {
            return goods_name;
        }

        public void setGoods_name(String goods_name) {
            this.goods_name = goods_name;
        }

        public String getMill_title() {
            return mill_title;
        }

        public void setMill_title(String mill_title) {
            this.mill_title = mill_title;
        }

        public int getVisit_count() {
            return visit_count;
        }

        public void setVisit_count(int visit_count) {
            this.visit_count = visit_count;
        }

        public String getPrice() {
            return price;
        }

        public void setPrice(String price) {
            this.price = price;
        }

        public int getStore_num() {
            return store_num;
        }

        public void setStore_num(int store_num) {
            this.store_num = store_num;
        }

        public String getChart_desc() {
            return chart_desc;
        }

        public void setChart_desc(String chart_desc) {
            this.chart_desc = chart_desc;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public String getPrice_sort() {
            return price_sort;
        }

        public void setPrice_sort(String price_sort) {
            this.price_sort = price_sort;
        }

        public ChartItemBean getChart_item() {
            return chart_item;
        }

        public void setChart_item(ChartItemBean chart_item) {
            this.chart_item = chart_item;
        }

        public static class ChartItemBean {
            private List<PriceListBean> price_list;
            private List<TimeListBean> time_list;

            public List<PriceListBean> getPrice_list() {
                return price_list;
            }

            public void setPrice_list(List<PriceListBean> price_list) {
                this.price_list = price_list;
            }

            public List<TimeListBean> getTime_list() {
                return time_list;
            }

            public void setTime_list(List<TimeListBean> time_list) {
                this.time_list = time_list;
            }

            public static class PriceListBean {
                /**
                 * price : 30.15
                 * time : ~
                 */

                private double price;
                private String time;

                public double getPrice() {
                    return price;
                }

                public void setPrice(double price) {
                    this.price = price;
                }

                public String getTime() {
                    return time;
                }

                public void setTime(String time) {
                    this.time = time;
                }
            }

            public static class TimeListBean {
                /**
                 * time : ~
                 */

                private String time;

                public String getTime() {
                    return time;
                }

                public void setTime(String time) {
                    this.time = time;
                }
            }

            public ValueTrendChartBean convert(){
                ValueTrendChartBean chartBean = new ValueTrendChartBean();
                chartBean.setItem_prices(new ArrayList<>());
                chartBean.setItem_times(new ArrayList<>());
                List<ResultBean.ChartItemBean.PriceListBean> priceList = this.getPrice_list();
                List<ResultBean.ChartItemBean.TimeListBean> timeList = this.getTime_list();
                if(priceList!=null){
                    for (int i = 0; i < priceList.size(); i++) {
                        ValueTrendChartBean.ItemPricesBean pricesBean = new ValueTrendChartBean.ItemPricesBean();
                        pricesBean.setPrice(priceList.get(i).getPrice()+"");
                        pricesBean.setTime(priceList.get(i).getTime()+"");
                        chartBean.getItem_prices().add(pricesBean);
                    }
                }
                if(timeList!=null){
                    for (int i = 0; i < timeList.size(); i++) {
                        ValueTrendChartBean.ItemTimesBean timesBean = new ValueTrendChartBean.ItemTimesBean();
                        timesBean.setTime(timeList.get(i).getTime()+"");
                        chartBean.getItem_times().add(timesBean);
                    }
                }
                return chartBean;
            }
        }
    }

    public ValueTrendChartInfoBean convert(){
        ResultBean result = this.result;
        ValueTrendChartInfoBean bean = new ValueTrendChartInfoBean();
        ValueTrendChartBean chartBean = new ValueTrendChartBean();
        chartBean.setItem_prices(new ArrayList<>());
        chartBean.setItem_times(new ArrayList<>());
        double price;
        try {
            price = Double.parseDouble(result.getPrice());
        } catch (Exception e){
            price = 0.00;
        }
        if(result!=null){
            if(result.getChart_item()!=null){
                bean.setChart_item(result.getChart_item().convert());
            }
            bean.setGoods_name(result.getGoods_name()+"");
            bean.setChart_desc(result.getChart_desc()+"");
            bean.setMill_title(result.getMill_title()+"");
            bean.setPrice(price);
            bean.setPrice_sort(result.getPrice_sort()+"");
            bean.setVisit_count(result.getVisit_count());
            bean.setTime(result.getTime()+"");
            bean.setShop_count(result.getStore_num());
        }
        return bean;
    }
}
