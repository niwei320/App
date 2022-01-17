import React from 'react';
import {isNotEmpty} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDMyRatingModel {

    constructor(props) {

        this.order_no = '';
        this.shop_title = '';
        this.service_star = '';
        this.send_star = '';
        this.logistics_star = '';
        this.package_star = '';
        this.eval_content = '';
        this.eval_create_time = '';
        this.reply_content = '';
        this.reply_time = '';

    }

    setModelData(data) {
        if (isNotEmpty(data)) {
            this.order_no = data.orderno;
            this.shop_title = data.title;
            this.service_star = data.services_star;
            this.send_star = data.send_star;
            this.logistics_star = data.logistics_star;
            this.package_star = data.package_star;
            this.eval_content = data.content;
            this.eval_create_time = data.create_time;
            this.reply_content = data.reply_content;
            this.reply_time = data.reply_time;
        }

        return this;

    }


    static getModelArray(array) {

        let marray = [];
        if (isNotEmpty(array)) {
            array.forEach((item, index)=> {

                let model = new YFWWDMyRatingModel();
                marray.push(model.setModelData(item));

            });
        }

        return marray;

    }


}