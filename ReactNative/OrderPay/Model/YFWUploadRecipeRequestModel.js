import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import {isEmpty, isNotEmpty, safe} from "../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWOrderSettlementModel from "./YFWOrderSettlementModel";

export default class YFWUploadRecipeRequestModel extends Component {

    constructor(props) {
        super(props);

        this.default = {
            orderno : '',
            prompt_info : '',
            title : '',
            medicine_list : [],
            upload_type_list : [],
        };

    }


    setModelData(data){

        if (isNotEmpty(data)) {

                let upload_type_list = [
                    {
                        type : '1',
                        value : '上传处方照片',
                        prompt_info : '请上传与订单商品相符的正规医生处方清晰图片，不符合要求的处方照片一律不能审核通过。',
                    },
                    //暂时隐藏处方信息提交
                    /*{
                        type : '2',
                        value : '登记处方信息',
                        prompt_info : '申明：本单仅作为方便药师审核处方用，请根据处方单如实填写。',
                    }*/
                ]
                data.upload_type_list = upload_type_list
                return data;

        } else {

            return this.default;

        }

    }


    static getModelValue(data){
        let model = new YFWUploadRecipeRequestModel();
        let ModeData =  model.setModelData(data)
        return ModeData;

    }


}