import React from 'react';
import {isNotEmpty} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWHealthAskPharmacistHomeModel {

    constructor(props) {

    }

    setInfoData(data) {
        if (isNotEmpty(data)) {
            return  {
                real_name:data.name,
                img_url:data.intro_image,
                type:data.type,
                shop_name:data.practice_unit,
                shop_id:data.storeid,
                reply_count:data.reply_count,
                adopt_count:data.reply_accepted_count
            }
        }
    }
    setListData(data) {
        if (isNotEmpty(data))
            return  {
                ask_id:data.id,
                title:data.title,
                dep_name:data.department_name,
                reply_content:data.reply_content,
                CreateTime:data.create_time,
                status_id:'',
                status:''
            }
    }




    static getPharmacistInfo(array) {
        let model = new YFWHealthAskPharmacistHomeModel();
        let ModeData =  model.setInfoData(array)
        return ModeData;

    }

    static getPharmacistAskList(array) {
        let model = new YFWHealthAskPharmacistHomeModel();
        let returnData = [];
        array.forEach((item)=>{
            returnData.push(model.setListData(item))
        })
        return returnData;

    }
}


