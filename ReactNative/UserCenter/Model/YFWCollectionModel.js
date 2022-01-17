import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWGoodsCollectionModel {

    constructor(props){

        this.shop_goods_id = '';
        this.imageUrl = '';
        this.name = '';
        this.storeName = '';
        this.price = '';
        this.storeid = '';
        this.is_invalid = '';
    }

    setModelData(data){
        if (isNotEmpty(data)) {
                this.shop_goods_id = data.id;
                this.medicineid = data.medicineid;
                this.img_url = data.imageUrl;
                this.title = data.name;
                this.shop_title = data.storeName;
                this.price = data.price;
                this.storeid = data.storeid;
                this.is_invalid = data.is_invalid+'';
        }
        return this;
    }


    static getModelArray(array){

        let marray = [];

        if (isNotEmpty(array)){
            array.forEach((item,index)=>{
                let model = new YFWGoodsCollectionModel();
                marray.push(model.setModelData(item));
            });
        }

        return marray;

    }


}