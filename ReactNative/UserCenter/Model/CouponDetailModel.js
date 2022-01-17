import React from 'react';
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class CouponDetailModel {

    constructor(props){

    }

    setModelData(data){
        if (isNotEmpty(data)) {
            return {
                money : data.price + '',
                min_order_total : data.use_condition_price_desc + '',
                price_after_coupon : data.yhhprice,
                use_price : data.use_condition_price + '',
                type : data.dict_coupons_type + '',
                title : data.description,
                shop_title : data.store_title,
                goods_name : data.namecn,
                status:data.dict_bool_status,
                btn_name : data.dict_bool_status == 0 ? '去使用' : data.dict_bool_status == 1?'已使用':'已过期',
                time_start : data.start_time,
                time_end : data.expire_time,
                shop_id : data.storeid,
                shop_goods_id : data.store_medicineid,
                goods_id : data.medicineid,
                id : data.id,
                expiring_soon : data.expiring_soon,     // 1即将过期
                coupon_title:data.dict_coupons_type==3?data.description:(data.dict_coupons_type==2?data.namecn:data.store_title),
                image_url:isNotEmpty(data.storelogourl)?data.storelogourl:data.intro_image // 没有商家logo情况后台将返回商品图片
            }
        }

    }


    static getModelArray(array){

        let marray = [];

        if (isNotEmpty(array)){
            array.forEach((item,index)=>{
                let model = new CouponDetailModel();
                marray.push(model.setModelData(item));
            });
        }

        return marray;

    }


}