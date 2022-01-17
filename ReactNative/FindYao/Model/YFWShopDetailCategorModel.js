import React from 'react';
import {isNotEmpty} from '../../PublicModule/Util/YFWPublicFunction';

export default class YFWShopDetailCategorModel {

    constructor(props){

    }

    setModelData(data){

        if (isNotEmpty(data)) {
            return data;
        }
    }

    static getModelArray(array){
        let model = new YFWShopDetailCategorModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}