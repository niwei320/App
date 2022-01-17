import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWSellerCollectionModel {

    constructor(props){

        this.address = '';
        this.imageUrl = '';
        this.name = '';
        this.storeId = '';

    }

    setModelData(data){

        let isRequestTCP = YFWUserInfoManager.defaultProps.isRequestTCP;

        if (isNotEmpty(data)) {
                this.address = data.address;
                this.intro_image = data.imageUrl;
                this.shop_title = data.name;
                this.shop_id = data.storeId;
        }
        return this;
    }


    static getModelArray(array){

        let marray = [];

        if (isNotEmpty(array)){
            array.forEach((item,index)=>{
                let model = new YFWSellerCollectionModel();
                marray.push(model.setModelData(item));
            });
        }

        return marray;

    }


}