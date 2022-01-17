import React from 'react';
import {isEmpty, isNotEmpty, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWHealthMyAskModel {

    constructor(props){

        this.title = '';
        this.reply_count = '';
        this.status = '';
        this.time = '';
        this.status_id = '';
    }

    setModelData(data){

        if (isNotEmpty(data)) {

            this.time = data.create_time;
            this.status = data.status;
            this.reply_count = data.reply_count;
            this.title = data.title;
            this.id = data.id;
            this.status_id = data.status_id;

        }

        return this;

    }


    static getModelArray(data){


        if(isEmpty(safeObj(safeObj(data).dataList))){
            safeObj(data).dataList = []
        }
        let marray = safeObj(safeObj(data).dataList).map((item,index)=>{
            let model = new YFWHealthMyAskModel();
            model.setModelData(item)
            return model

        });

        let dataInfo ={}
        if(isNotEmpty(data.profile)){
            dataInfo = {
                img_url:data.profile.intro_image,
                real_name:data.profile.real_name,
                ask_count:data.profile.ask_count,
                account_name:data.profile.account_name
            }
        }

        let model = {
            dataList : marray,
            dataInfo: dataInfo
        }

        return model;

    }



}