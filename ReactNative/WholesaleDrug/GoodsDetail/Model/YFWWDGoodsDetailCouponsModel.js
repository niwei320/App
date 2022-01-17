import React from 'react'
import {
    View,
} from 'react-native'
import {isEmpty} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDGoodsDetailCouponsModel extends React.Component {

    constructor(props) {
        super(props)
    }

    setModelData(array){
        let items = [];
        if(isEmpty(array)){
            return items
        }
        array.map((item,index)=> {
            items.push({
                id: item.id,
                title: item.title,
                money: item.price,
                time_start: item.start_time,
                time_end: item.end_time,
                valid_period_time: item.valid_period_time,
                use_shop_goods_id: item.store_medicineid,
                use_condition_price:item.use_condition_price,
                min_order_total: 98.00,
                get:item.get,
                aleardyget:item.aleardyget,
                type: item.coupons_type,
                use_category_id: "",
                user_quantity: 0,
                max_quantity: 0,
                end_time: "",
                user_coupon_count: item.user_coupon_count,
                max_claim_quantity:item.max_claim_quantity
            });
        });
        return items
    }

    static getModelArray(array){
        let model = new YFWWDGoodsDetailCouponsModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }
}