package com.yaofangwang.mall.bean;

import java.io.Serializable;
import java.util.List;

/**
 * Created by admin on 2018/10/15.
 */

public class NearShopBeanTcp {


    private List<ResultBean> result;

    public List<ResultBean> getResult() {
        return result;
    }

    public void setResult(List<ResultBean> result) {
        this.result = result;
    }

    public static class ResultBean implements Serializable {
        /**
         * Lat : 34.853774
         * Lng : 117.944877
         * address : 山东省临沂市苍山县向城镇供销大楼西二户
         * distance : 8.89
         * evaluation_star_sum : 5.0
         * id : 341370
         * phone : 0539-5452105
         * title : 兰陵县民和大药房
         */

        private String Lat;
        private String Lng;
        private String address;
        private double distance;
        private double evaluation_star_sum;
        private int id;
        private String phone;
        private String title;

        public String getLogo_image() {
            return logo_image;
        }

        public void setLogo_image(String logo_image) {
            this.logo_image = logo_image;
        }

        private String logo_image;

        public String getLat() {
            return Lat;
        }

        public void setLat(String Lat) {
            this.Lat = Lat;
        }

        public String getLng() {
            return Lng;
        }

        public void setLng(String Lng) {
            this.Lng = Lng;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public double getDistance() {
            return distance;
        }

        public void setDistance(double distance) {
            this.distance = distance;
        }

        public double getEvaluation_star_sum() {
            return evaluation_star_sum;
        }

        public void setEvaluation_star_sum(double evaluation_star_sum) {
            this.evaluation_star_sum = evaluation_star_sum;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }
    }
}
