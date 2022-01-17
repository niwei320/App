/**
 * Created by weini on 2018/11/30
 */
import React from 'react';
import {imageJoinURL, isNotEmpty, safe} from "../../PublicModule/Util/YFWPublicFunction";
import {safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class DrugRemidingDetailModel {

    constructor(props) {

    }

    method1(data) {
        data = data.result;
        if (isNotEmpty(data)) {
            let item_goods = [];
            let item_timec = [];
            safeObj(data.item_goods).forEach((item, index) => {
                item_goods.push({
                    name_cn: item.namecn,
                    goods_id: item.medicineid,
                    image_url: imageJoinURL(safe(item.image)),
                    usage_fee: item.usage_num+'',
                    unit: item.unit,
                    type: '',
                    value: '',
                    id:item.id
                });
            });
            safeObj(data.item_timec).forEach((item, index) => {
                item_timec.push({
                    time_c: item.drug_timec,
                    id:item.id
                });
            });
            return {
                code: "1",
                item: {
                    id: safeObj(data.item_detail).id,
                    interval_days: safeObj(data.item_detail).interval_day,
                    start_time: safeObj(data.item_detail).start_time,
                    end_time: safeObj(data.item_detail).end_time,
                    enable: safeObj(data.item_detail).dict_enable,
                    remark: safeObj(data.item_detail).remark,
                    item_goods: item_goods,
                    item_timec: item_timec,
                }
            }
        }
    }
    /**
     *传入map对象，返回map对象
     */
    static getModelData(map) {
        let model = new DrugRemidingDetailModel();
        let ModeData = model.method1(map)
        return ModeData;

    }


}