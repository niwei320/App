import React from 'react'
import {
    View,
} from 'react-native'
import {isEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWGoodsDetailQAModel {

    constructor() {

    }
    setModelData(array){
        let items = [];
        if(isEmpty(array)){
            return items
        }
        let logisticsQa = {ask_items:[],type_name:"物流问题"}//物流问题
        let goodsQa = {ask_items:[],type_name:"商品问题"}//商品问题
        let payQa = {ask_items:[],type_name:"支付问题"}//支付问题
        let prescriptionQa = {ask_items:[],type_name:"处方问题"}//处方问题
        let priceQa = {ask_items:[],type_name:"价格问题"}//价格问题
        array.map((item,index)=> {
            switch (item.dict_question_ask_type) {
                case 1:
                    logisticsQa.ask_items.push({title:item.title,content:item.content})
                    break
                case 2:
                    goodsQa.ask_items.push({title:item.title,content:item.content})
                    break
                case 3:
                    payQa.ask_items.push({title:item.title,content:item.content})
                    break
                case 4:
                    prescriptionQa.ask_items.push({title:item.title,content:item.content})
                    break
                case 5:
                    priceQa.ask_items.push({title:item.title,content:item.content})
                    break
            }
        });
        items.push(logisticsQa)
        items.push(goodsQa)
        items.push(payQa)
        items.push(prescriptionQa)
        items.push(priceQa)
        return items
    }

    static getModelArray(array){
        let model = new YFWGoodsDetailQAModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }

}