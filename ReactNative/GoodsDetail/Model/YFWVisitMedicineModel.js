import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import {isNotEmpty, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWMessageCouponItemModel from "../../Message/Model/YFWMessageCouponItemModel";

export default class YFWVisitMedicineModel extends Component {

    constructor(props) {
        super(props);

        this.intro_image = '';
        this.name_cn = '';
        this.price = '';
        this.medicine_id = '';
        this.shop_medicine_id = '';

    }


    setModelData(data){

        let isRequestTCP = YFWUserInfoManager.defaultProps.isRequestTCP;

        if (isNotEmpty(data)) {

            if (isRequestTCP) {

                this.intro_image = data.intro_image;
                this.name_cn = data.namecn;
                this.price = data.price;
                this.medicine_id = data.id;
                this.shop_medicine_id = data.storeid;

            } else {

                this.intro_image = data.intro_image;
                this.name_cn = data.name_cn;
                this.price = data.price;
                this.medicine_id = data.medicine_id;
                this.shop_medicine_id = data.shop_medicine_id;

            }

        }

        return this;

    }


    static getModelArray(array){

        let marray = [];
        if (isNotEmpty(array)) {
            array.forEach((item,index)=>{
                let model = new YFWVisitMedicineModel();
                marray.push(model.setModelData(item));
            });
        }

        return marray;

    }


}