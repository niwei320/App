package com.yaofangwang.mall.bean;

import com.baidu.location.BDLocation;

import java.io.Serializable;

/**
 * Created by marti on 2018/7/30.
 */

public class LocationInfoBean implements Serializable {
    private double longitude;           //经度
    private double latitude;            //纬度
    private String city;                //城市
    private String district;            //城区
    private String province;            //省份
    private int areaType;               //区域类型
    private long unicode;
    private long provinceCode;          //省code
    private int cityCode;               //城市code
    private int distreectCode;          //区code
    private String street;              //街道
    private String address = "上海市";             //地址 相当于 name
    private String addressStr = "";             //详细地址
    private int locType;                //定位方式
    private float radius;               //
    private boolean isGetAddrees;
    public int isSuccess = -2;            //是否定位成功，这个值不存储，记录每次程序运行的状态,-1 = 失败，0 = 成功，-2 = 无状态

    public String getAddressStr() {
        return addressStr;
    }

    public void setAddressStr(String addressStr) {
        this.addressStr = addressStr;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public int getAreaType() {
        return areaType;
    }

    public void setAreaType(int areaType) {
        this.areaType = areaType;
    }

    public long getUnicode() {
        return unicode;
    }

    public void setUnicode(long unicode) {
        this.unicode = unicode;
    }

    public long getProvinceCode() {
        return provinceCode;
    }

    public void setProvinceCode(long provinceCode) {
        this.provinceCode = provinceCode;
    }

    public int getCityCode() {
        return cityCode;
    }

    public void setCityCode(int cityCode) {
        this.cityCode = cityCode;
    }

    public int getDistreectCode() {
        return distreectCode;
    }

    public void setDistreectCode(int distreectCode) {
        this.distreectCode = distreectCode;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public boolean isGetAddrees() {
        return isGetAddrees;
    }

    public void setGetAddrees(boolean getAddrees) {
        isGetAddrees = getAddrees;
    }

    public int getLocType() {
        return locType;
    }

    public void setLocType(int locType) {
        this.locType = locType;
    }

    public float getRadius() {
        return radius;
    }

    public void setRadius(float radius) {
        this.radius = radius;
    }

    public void clear() {
        longitude = 0;
        latitude = 0;
        city = "";
        district = "";
        province = "";
        areaType = 0;
        unicode = 0;
        provinceCode = 0;
        cityCode = 0;
        distreectCode = 0;
        street = "";
        address = "";
        isGetAddrees = false;
        locType = 0;
        radius = 0;
        /*这里等于0的原因是，每次清除过后肯定是为了设置固定值，如果不是，请手动设置为-1*/
        isSuccess = 0;
    }

    public void setDataForBDLocation(BDLocation location) {
        setGetAddrees(true);
        setLocType(location.getLocType());
        setLongitude(location.getLongitude());
        setLatitude(location.getLatitude());
        setCity(location.getCity());
        setProvince(location.getProvince());
        setDistrict(location.getDistrict());
        setStreet(location.getStreet());
        String county = location.getCountry();
        setAddressStr(location.getAddrStr().startsWith(county)?location.getAddrStr().split(county)[0]:location.getAddrStr());
        /*如果没有附近地标名则用定位名*/
        if(location.getPoiList()!=null&&location.getPoiList().size()>0&&location.getPoiList().get(0)!=null){
            setAddress(location.getPoiList().get(0).getName());
        } else {
            setAddress(location.getAddress().address);
        }
        setRadius(location.getRadius());
    }
}
