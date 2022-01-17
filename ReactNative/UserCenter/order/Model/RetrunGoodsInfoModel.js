import React from 'react';
import {isNotEmpty, tcpImage, safe} from "../../../PublicModule/Util/YFWPublicFunction";

export default class RetrunGoodsInfoModel {

    constructor(props) {
    }

    setModelData(data) {

        if (isNotEmpty(data)) {
            let data_items = [];
            data.forEach((gooditem, index)=> {
                data_items.push({
                    title: gooditem.name,
                    price: gooditem.price,
                    authorized_code: gooditem.authorized_code,
                    quantity: gooditem.quantity,
                    img_url: tcpImage(gooditem.image),
                    order_medicineno: gooditem.order_medicineno,
                    PrescriptionType: this.convertPrescriptionType(safe(gooditem.dict_medicine_type)),
                    standard:gooditem.standard,
                    select:true
                })
            })
            return data_items;
        }
    }

    /**
     * 处方、单双轨字段转换
     * @param type
     */
    convertPrescriptionType(type){
        if(type+'' === '3'){
            return '1'//单轨
        }
        //TCP 和HTTP 双轨都是2
        return type+""
    }


    static getModelArray(array) {
        let model = new RetrunGoodsInfoModel();
        let ModeData = model.setModelData(array)
        return ModeData;

    }


}