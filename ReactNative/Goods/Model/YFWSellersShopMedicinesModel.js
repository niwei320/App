import React from 'react';
import {isNotEmpty, safeObj, safe} from '../../PublicModule/Util/YFWPublicFunction';

export default class YFWSellersShopMedicinesModel {

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
                shipping_price:data.logistics_price,//运费，有些没有
                star:data.shop_avg_level,
                NamePath:'',//不需要了
                MillLockPrice:'0.0000',//不需要了
                shop_address:data.address,
                reserve:data.reserve,//库存，有些没有
                name_cn:'',//药名，不需要了
                standard:'',//规格，不需要了
                IsPrescription:'',
                troche_type:'',//药瓶类型，不需要了
                IsLimitUserBuy:'',//用户可购买数量
                IsLimitSales:'',//可销售数量
                phone:'',//商家电话，不需要了
                is_jump_login:'',//是否登录，不需要了
                is_jump_login_text:'',//不登录显示到价格里面，不需要了
                qrcode_url:'',//二维码，暂不需要使用
                is_add_cart: data.is_add_cart,//是否显示加入购物车
                tag_items:tagItems,//优惠标签,
                coupons_desc:data.coupons_desc,//优惠券描述，
                activity_desc:data.activity_desc,//满减活动描述
                medicine_package_desc:data.medicine_package_desc,//多件装描述
                logistics_desc:data.free_logistics_desc,//商家包邮
                scheduled_name:data.scheduled_name,//商家发货时间
                shop_id:data.storeid,//商家id
                period_to:data.period_to,
                activity_img_url:safe(data.activity_img_url),
                promotionflag: safe(data.promotionflag),
                promotion_activity_img_url: safe(data.promotion_activity_img_url), // 915图标
                activity_icon: safe(data.activity_img_url).length>0 ? safe(data.activity_img_url) : safe(data.promotionflag)==1 ? safe(data.promotion_activity_img_url) : ''  // 活动icon
            }
        }
    }

    static getModelArray(data){
        let model = new YFWSellersShopMedicinesModel();
        let ModeData =  model.setModelData(data)
        return ModeData;

    }

}