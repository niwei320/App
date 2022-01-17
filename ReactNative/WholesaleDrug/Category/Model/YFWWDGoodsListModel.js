import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import {
    isEmpty,
    isNotEmpty,
    kScreenWidth,
    safe,
    safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWMedicineInfoModel from "../../../FindYao/Model/YFWMedicineInfoModel";
import YFWWDMedicineInfoModel from "./YFWWDMedicineInfoModel";

export default class YFWWDGoodsListModel {

    constructor(props){

    }
    setModelData(data){
        let items = [];
        if (isNotEmpty(data)) {
            data.forEach((item)=> {
                let model = YFWWDMedicineInfoModel.getModelArray(item)
                items.push(model);
            })
        }
        return items;
    }

    static getModelArray(array){
        if(isEmpty(array)){
            return [];
        }
        let model = new YFWWDGoodsListModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}