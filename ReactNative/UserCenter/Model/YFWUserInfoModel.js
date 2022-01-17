import React from 'react';
import {isNotEmpty, safe, safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWUserInfoModel {

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
        this.user_favorite = ''
        this.greeting = ''
        this.issigntody = 0

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
        }
        return this;
    }



    static getModelArray(array) {
        let model = new YFWUserInfoModel();
        let ModeData =  model.setModelData(array);
        return ModeData;

    }


}