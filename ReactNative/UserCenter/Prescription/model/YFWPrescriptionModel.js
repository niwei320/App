import React, { Component } from 'react';
import {
    View,
} from 'react-native'
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager'
import { isNotEmpty } from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWPrescriptionModel {

    constructor(props) {
        this.name = '';
        this.start_time = '';
        this.expire_time = '';
        this.disease_name = '';
        this.orderno = '';
        this.img_url = '';
        this.id = ''

    }

    setModelData(data) {


        if (isNotEmpty(data) ) {

            this.name = data.real_name;
            this.start_time = data.rx_start_time;
            this.expire_time = data.rx_expire_time;
            this.disease_name = data.description;
            this.orderno = data.orderno;
            this.img_url = data.lianou_inquiry_url;
            this.id = data.id

        }

        return this;

    }


    static getModelArray(array) {

        if (array == undefined) return [];

        let marray = [];
        array.forEach((item, index) => {

            let model = new YFWPrescriptionModel();
            marray.push(model.setModelData(item));

        });

        return marray;

    }


}