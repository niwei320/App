import React from 'react';
import {isNotEmpty, safe, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDUserInfoModel {

    constructor(props){

        this.account_img_url = '';
        this.account_real_name = '';
        this.coupon_count = '';
        this.coupon_count_used = '';
        this.drug_remind_count = '';
        this.drug_remind_show = '';
        this.invite_win_cash_url = '';
        this.invite_win_cash_url_item = {};
        this.invite_win_cash_url_share = '';
        this.order_unevaluated_count = '';
        this.order_unpaid_count = '';
        this.order_unreceived_count = '';
        this.order_unsent_count = '';
        this.phone = '';
        this.point = '';
        this.return_goods_count = '';
        this.to_evaluation_count = '';
        this.to_view_message_count = '';
        this.user_favorite = ''//收藏数
        this.greeting = ''
        this.issigntody = 0
        this.browsed_count = ''//足迹数
        this.oftenMedicine_count = ''//常购
        this.suppliers_count = ''//供应商
        this.shop_name = '' //店铺名
        this.recent_buy = '0' //最近购买
        this.shop_auth_status = 0 //店铺认证状态
        this.shop_logo = ''

    }

    setModelData(data){
        if (isNotEmpty(data)) {
            this.account_img_url = safeObj(data.account_img_url);
            this.account_real_name = safe(data.account_real_name).length > 0?data.account_real_name:data.account_name;
            this.coupon_count = data.coupon_count;
            this.coupon_count_used = data.coupon_count_used;
            this.drug_remind_count = data.drug_remind_count;
            this.drug_remind_show = data.drug_remind_show;
            this.invite_win_cash_url = data.invite_win_cash_url_item;
            this.invite_win_cash_url_item = {url:''};
            this.invite_win_cash_url_share = data.invite_win_cash_url_share;
            this.order_unevaluated_count = data.order_unevaluated_count;
            this.order_unpaid_count = data.order_unpaid_count;
            this.order_unreceived_count = data.order_unreceived_count;
            this.order_unsent_count = data.order_unsent_count;
            this.phone = '';
            this.point = data.point;
            this.return_goods_count = data.return_goods_count;
            this.to_evaluation_count = '';
            this.to_view_message_count = data.message_ccount;
            this.user_favorite = data.user_favorite
            this.greeting = data.greeting
            this.issigntody = data.issigntody
            this.browsed_count = data.browsed_count
            this.suppliers_count = data.suppliers_count
            this.oftenMedicine_count = data.oftenMedicine_count
            this.shop_name = data.title 
            this.recent_buy = '本月已采购 '+ data.month_count +' 种商品'
            this.shop_auth_status = data.status
            this.shop_logo = data.Logo_image
        }
        return this;
    }



    static getModelArray(array) {
        let model = new YFWWDUserInfoModel();
        let ModeData =  model.setModelData(array);
        return ModeData;

    }


}