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
                    prescriptionType: gooditem.dict_medicine_type,
                    standard:gooditem.standard,
                })
            })
            return data_items;
        }
    }

    static getModelArray(array) {
        let model = new RetrunGoodsInfoModel();
        let ModeData = model.setModelData(array)
        return ModeData;

    }


}