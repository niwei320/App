package com.yaofangwang.mall.bean;

import java.io.Serializable;

/**
 * Created by marti on 2018/7/2.
 */

public class ValueTrendChartInfoBean implements Serializable {

    /**
     * time : 06/24~06/30
     * price : 19
     * price_sort : level
     * mill_title : 华润三九医药股份有限公司
     * goods_name : 999 感冒灵颗粒(10gx9袋/盒)(颗粒剂)
     * shop_count : 15
     * visit_count : 23789
     * chart_desc : 在上一周，999 感冒灵颗粒 （10gx9袋/盒 ，华润三九医药股份有限公司） 的价格呈现下降趋势，上周的价格为19.00元，上上周的价格为19.00元，环比均价持平，
     同时该商品的浏览次数和在售商家数达到了23789次和15家。
     本文归药房网商城所有，各位如果要是转载，请注明出处和相关链接。
     * chart_item : {"item_prices":[{"time":"2018-06-03~2018-06-09","price":"19.00"},{"time":"2018-06-10~2018-06-16","price":"19.00"},{"time":"2018-06-17~2018-06-23","price":"19.00"},{"time":"2018-06-24~2018-06-30","price":"19.00"}],"item_times":[{"time":"06/03~06/09"},{"time":"06/10~06/16"},{"time":"06/17~06/23"},{"time":"06/24~06/30"}]}
     */

    private String time;
    private double price;
    private String price_sort;
    private String mill_title;
    private String goods_name;
    private int shop_count;
    private int visit_count;
    private String chart_desc;
    private ValueTrendChartBean chart_item;

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getPrice_sort() {
        return price_sort;
    }

    public void setPrice_sort(String price_sort) {
        this.price_sort = price_sort;
    }

    public String getMill_title() {
        return mill_title;
    }

    public void setMill_title(String mill_title) {
        this.mill_title = mill_title;
    }

    public String getGoods_name() {
        return goods_name;
    }

    public void setGoods_name(String goods_name) {
        this.goods_name = goods_name;
    }

    public int getShop_count() {
        return shop_count;
    }

    public void setShop_count(int shop_count) {
        this.shop_count = shop_count;
    }

    public int getVisit_count() {
        return visit_count;
    }

    public void setVisit_count(int visit_count) {
        this.visit_count = visit_count;
    }

    public String getChart_desc() {
        return chart_desc;
    }

    public void setChart_desc(String chart_desc) {
        this.chart_desc = chart_desc;
    }

    public ValueTrendChartBean getChart_item() {
        return chart_item;
    }

    public void setChart_item(ValueTrendChartBean chart_item) {
        this.chart_item = chart_item;
    }


}
