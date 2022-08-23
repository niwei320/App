package com.yaofangwang.mall.bean;

import java.io.Serializable;

public class ShopBeanHttp implements Serializable {
    /**
     *
     */
    private static final long serialVersionUID = -3046673945662725410L;
    public String id;// "9001",
    public String title;// "国大药房(八佰伴店)",
    public String phone;// "021-12345678 ",
    public String contract;// "1",
    public String star;// "4.5",
    public String longitude;// "107.152803",
    public String latitude;// "34.382391"
    public String address;//
    public String distance;
    public String logo_img_url;

    @Override
    public String toString() {
        return "ShopBeanHttp [id=" + id + ", title=" + title + ", phone=" + phone + ", contract=" + contract + ", star=" + star + ", longitude=" + longitude + ", latitude=" + latitude + ", address=";
    }

}
