import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import {YFWWDUploadImageInfoModel} from "../../Store/Model/YFWWDUploadAccountQualifiyModel";
import {imgUrlReverseHander} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDProbateTreatmentModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.image = new YFWWDUploadImageInfoModel()
        this.image_example_1 = 'http://upload.yaofangwang.com/common/images/zz/yljgzyxkz.jpg'
        this.shop_title = ''             //企业名称
        this.social_code = ''           //登记号
        this.legal_person = ''         //法定代表人
        this.charge_person = ''           //企业负责人
        this.register_address = ''      //注册地址
        this.scope = ''                    //诊疗科目
        this.start_date = ''             //发证日期
        this.end_date = ''              //截止日期
    }

    static initWithModel(data){
        let instance = new YFWWDProbateTreatmentModel();
        instance = data
        return instance;
    }

    static initWithData(data) {
        let instance = new YFWWDProbateTreatmentModel();
        instance.image = String(data.image).length == 0 ? new YFWWDUploadImageInfoModel() : new YFWWDUploadImageInfoModel.init({type:'image',uri:data.image,serviceUri:imgUrlReverseHander(data.image),success:true})
        instance.charge_person = data.charge_person
        instance.start_date = data.start_date
        instance.end_date = data.end_date
        instance.legal_person = data.legal_person
        instance.social_code = data.licence_code
        instance.register_address = data.register_address
        instance.scope = data.scope
        instance.shop_title = data.title
        return instance;
    }
}
