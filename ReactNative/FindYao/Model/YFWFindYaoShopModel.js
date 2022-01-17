import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import {isNotEmpty, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import YFWCouponModel from "./YFWCouponModel";

export default class YFWFindYaoShopModel extends Component {

    constructor(props) {
        super(props);

        this.logo_img_url = '';
        this.title = '';
        this.distance = '';
        this.star = '';
        this.shop_id = '';

    }


    setModelData(data){

        if (isNotEmpty(data)) {
            return {
                logo_img_url:safeObj(data.logo_image),
                title:data.title,
                distance:safeObj(Number.parseFloat(data.distance).toFixed(1))+'km',
                star:safeObj(Number.parseFloat(data.evaluation_star_sum).toFixed(1)),
                id : data.id,
            }
        }
    }

    static getModelArray(array) {

        let returnData = [];
        if (isNotEmpty(array)){
            array.forEach((item, index) => {
                let model = new YFWFindYaoShopModel();
                returnData.push(model.setModelData(item));
            });
        }

        return returnData;
    }


}