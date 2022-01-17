import React from 'react';
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWShopDetailIntroModel {

    constructor(props){

    }
    setModelData(data){
        let items = [];
        if (isNotEmpty(data)) {
            data.forEach((item,index)=> {
                items.push({
                    image_file:item.image_url,
                    image_name:item.image_name,
                    show_image_suffix:item.show_image_suffix,
                });
            })
        }
        return items;
    }

    static getModelArray(array){
        let model = new YFWShopDetailIntroModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}