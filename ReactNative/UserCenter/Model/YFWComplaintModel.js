import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWComplaintModel {

    constructor(props) {

        this.order_no = '';
        this.shop_title = '';
        this.type = '';
        this.type_name = '';
        this.status = '';
        this.status_name = '';
        this.id = '';

    }

    setModelData(data) {


        if (isNotEmpty(data)) {
            this.order_no = data.orderno;
            this.shop_title = data.short_title;
            this.title = data.title;
            this.type = data.dict_complaints_type;
            this.type_name = this.type == 1 ? '商品质量问题' : '商家服务问题';
            this.status = data.dict_complaints_status;
            this.status_name = data.dict_complaints_status_name;
            this.id = data.id;
            this.content = data.content;

        }

        return this;

    }


    static getModelArray(array) {

        let marray = [];

        if (isNotEmpty(array)) {
            array.forEach((item, index)=> {
                let model = new YFWComplaintModel();
                marray.push(model.setModelData(item));
            });
        }

        return marray;

    }


}