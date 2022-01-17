/**
 * Created by weini on 2018/11/22
 */
import React from 'react';
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWCouponModel {

    constructor(props) {

    }


    generateMethod(data) {
        if (isNotEmpty(data)) {
            return {
                id:data.id,
                title:data.use_condition_price_desc,
                money:data.price,
                min_order_total:data.use_condition_price,
                use_shop_goods_id:data.store_medicineid,
                use_category_id:'',
                time_start:data.create_time,
                time_end:data.expire_time,
                user_quantity:'',
                max_quantity:'10000',
                max_claim_quantity:'2',
                end_time:data.expire_time,
                type:data.dict_coupons_type,
                user_coupon_count:'0',
                get:data.active,
                valid_period_time:data.create_time.substring(0,10)+' 至 '+data.expire_time.substring(0,10),
            }
        }
    }

    /**
     *传入array对象，返回array对象
     */
    static getModelArray(array) {

        let returnData = [];

        if (isNotEmpty(array)){
            array.forEach((item, index) => {
                let model = new YFWCouponModel();
                returnData.push(model.generateMethod(item));
            });
        }

        return returnData;
    }
}