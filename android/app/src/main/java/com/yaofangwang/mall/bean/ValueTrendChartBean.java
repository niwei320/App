package com.yaofangwang.mall.bean;

import java.io.Serializable;
import java.util.List;

/**
 * Created by marti on 2018/6/29.
 */

public class ValueTrendChartBean implements Serializable{

    private List<ItemPricesBean> item_prices;
    private List<ItemTimesBean> item_times;

    public List<ItemPricesBean> getItem_prices() {
        return item_prices;
    }

    public void setItem_prices(List<ItemPricesBean> item_prices) {
        this.item_prices = item_prices;
    }

    public List<ItemTimesBean> getItem_times() {
        return item_times;
    }

    public void setItem_times(List<ItemTimesBean> item_times) {
        this.item_times = item_times;
    }

    public static class ItemPricesBean implements Serializable{
        /**
         * time : 05-27~06-02
         * price : 25.60
         */

        private String time;
        private String price;

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public String getPrice() {
            return price;
        }

        public void setPrice(String price) {
            this.price = price;
        }
    }

    public static class ItemTimesBean implements Serializable{
        /**
         * time : 05-27~06-02
         */

        private String time;

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }
    }
}
