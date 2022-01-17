import React from 'react';
import {isNotEmpty} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWWDMedicineInfoModel from '../../Category/Model/YFWWDMedicineInfoModel';

export default class YFWWDShopDetailRecommendModel {

    constructor(props){

    }
    setModelData(data){
        let items = [];
        if (isNotEmpty(data)) {
            data.forEach((item,index)=> {
                items.push(YFWWDMedicineInfoModel.getModelArray(item));
            })
        }
        return items;
    }

    static getModelArray(array){
        let model = new YFWWDShopDetailRecommendModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}