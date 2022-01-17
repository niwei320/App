import React from 'react'
import {
    View,
} from 'react-native'
import {isEmpty, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDGoodsPackageModel{

    constructor() {}

    setModelData(array){
        let items = []
        if(isEmpty(array)){
            return items
        }
        array.map((item,index)=>{
            items.push({
                package_id: item.package_id,
                name_aliase: item.name_aliase,
                name: item.name,
                price_total: item.price,
                shop_goods_id: item.store_medicineid,
                package_type: item.package_type,
                goods_count: item.medicine_count,
                original_price: item.original_price,
                save_price: item.save_price,
                sub_items:this.setPageckData(safeObj(item.medicine_list))
            })
        })
        return items
    }

    setPageckData(array){
        let items = []
        if(isEmpty(array)){
            return items
        }
        array.map((item,index)=>{
            items.push({
                title: item.medicine_name,
                standard: item.standard,
                price: item.price,
                quantity: item.quantity,
                image_url: item.image_url,
                period_to_Date: item.period_to,//有效期
            })
        })
        return items
    }

    static getModelArray(array){
        let model = new YFWWDGoodsPackageModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }
}