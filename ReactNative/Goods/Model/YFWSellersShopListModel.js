import React from 'react';
import {isEmpty, isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import YFWSellersShopMedicinesModel from "./YFWSellersShopMedicinesModel"

export default class YFWSellersShopListModel {

    constructor(props){

    }
    setModelData(data){
        let items = [];
        if (isNotEmpty(data)) {
            if(isEmpty(data.dataList)){
                data.dataList = []
            }
            data.dataList.forEach((item,index)=> {
                item.is_add_cart = data.show_buy_button//是否显示购物车
                items.push(YFWSellersShopMedicinesModel.getModelArray(item));
            })
        }
        return items;
    }

    static getModelArray(result){
        let model = new YFWSellersShopListModel();
        let ModeData =  model.setModelData(result)
        return ModeData;

    }


}