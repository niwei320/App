import React from 'react';
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import YFWMedicineInfoModel from "./YFWMedicineInfoModel"

export default class YFWShopDetailRecommendModel {

    constructor(props){

    }
    setModelData(data){
        let items = [];
        if (isNotEmpty(data)) {
            data.forEach((item,index)=> {
                items.push(YFWMedicineInfoModel.getModelArray(item));
            })
        }
        return items;
    }

    static getModelArray(array){
        let model = new YFWShopDetailRecommendModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}