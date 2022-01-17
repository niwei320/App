/**
 * Created by weini on 2018/12/8
 */
import React from 'react';
import {imageJoinURL, isNotEmpty, safe} from "../../PublicModule/Util/YFWPublicFunction";

export default class DrugRemindListModel {

    constructor(props) {

    }

    method1(data) {
        if (isNotEmpty(data)) {
            return {
                id:data.id,
                interval_days:safe(data.interval_day),
                start_time:safe(data.start_time),
                end_time:safe(data.end_time),
                enable:safe(data.dict_enable),
                remark:safe(data.remark),
                name_cn:safe(data.namecn),
                image_url:imageJoinURL(safe(data.image)),
                desc:safe(data.timec_desc)
            }
        }
    }

    /**
     *传入array对象，返回array对象
     */
    static getModelData(array) {

        let returnData = [];

        if (isNotEmpty(array)){
            array.forEach((item, index) => {
                let model = new DrugRemindListModel();
                returnData.push(model.method1(item));
            });
        }

        return returnData;
    }
}