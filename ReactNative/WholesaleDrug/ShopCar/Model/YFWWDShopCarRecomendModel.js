import React from 'react';
import {isNotEmpty, safe} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDShopCarRecomendModel {

    constructor(props) {

        this.price = '';
        this.intro_image = '';
        this.name_cn = '';
        this.id = '';
        this.discount = '';
        this.standard = '';
        this.storeid = '';
        this.authorized_code = '';
        this.store_num = ''
        this.shop_num = ''
    }

    setModelData(data) {
        if (isNotEmpty(data)) {
            this.price = data.price_min?data.price_min:data.price;
            this.intro_image = data.intro_image;
            this.name_cn = data.namecn;
            this.id = data.id;
            this.discount = data.discount;
            this.standard = data.standard;
            this.storeid = data.storeid;
            this.authorized_code = data.authorized_code;
            this.store_num = data.store_num;
            this.shop_num = data.shop_num;

            return this;
        }
    }

    static getModelArray(array) {

        if (array == undefined) return [];

        let marray = [];
        array.forEach((item, index) => {
            let model = new YFWWDShopCarRecomendModel();
            marray.push(model.setModelData(item));
        });

        return marray;

    }
}


