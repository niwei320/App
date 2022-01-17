import React from 'react';
import {isNotEmpty, extractDateToYMD, safe} from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWWDSellersShopMedicinesModel {

    constructor(props){

    }

    setModelData(data){

        if (isNotEmpty(data)) {

            let tagItems = []
            if(data.dict_bool_coupon == 1){
                tagItems.push("店铺优惠券")
            }
            if(data.dict_bool_activity){
                tagItems.push("满减送活动")
            }
            tagItems.push(data.scheduled_name)

            return {
                shop_goods_id:data.id,
                title:data.store_title,
                region:data.region_name,
                price:data.real_price,
                discount:data.price_desc,
                discount_is_show:false,
                account_status:data.account_status,//开户状态
                dict_bool_papermap:data.dict_bool_papermap,//电子开户
                free_logistics_desc:data.free_logistics_desc,//满多少包邮
                send_price:data.send_price,//满多少起送
                purchase_minsum:data.purchase_minsum,//起购数量
                shipping_price:data.logistics_price,//运费，有些没有
                shop_address:data.address,
                reserve:data.reserve,//库存，有些没有
                is_add_cart: data.is_add_cart,//是否显示加入购物车
                tag_items:tagItems,//优惠标签,
                coupons_desc:data.coupons_desc,//优惠券描述，
                activity_desc:data.activity_desc,//满减活动描述
                medicine_package_desc:data.medicine_package_desc,//疗程装描述
                scheduled_name:data.scheduled_name,//商家发货时间
                shop_id:data.storeid,//商家id
                period_to:extractDateToYMD(data.period_to,'-'),
                activity_img_url:safe(data.activity_img_url)
            }
        }
    }

    static getModelArray(data){
        let model = new YFWWDSellersShopMedicinesModel();
        let ModeData =  model.setModelData(data)
        return ModeData;

    }

}