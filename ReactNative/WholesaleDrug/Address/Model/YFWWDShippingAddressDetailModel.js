/**
 * Created by weini on 2018/12/8
 */
import React from 'react';
import {isNotEmpty, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDShippingAddressDetailModel {

    constructor(props) {

    }

    method1(data) {
        if (isNotEmpty(data)) {
            let adrs = data.region_name_path && data.region_name_path.split("|");
            let userAddress = safeObj(adrs[1])+safeObj(adrs[2])+safeObj(adrs[3]);
            let userAddressDetail = data.address_name.split(userAddress)[1];
            return {
                id:data.id,
                regionid:data.regionid,
                name: data.name,
                mobile: data.mobile,
                userAddress:userAddress,
                userAddressDetail:userAddressDetail,
                isDefault: data.dict_bool_default,
            }
        }
    }


    /**
     *传入map对象，返回map对象
     */
    static getModelData(map) {
        let model = new YFWWDShippingAddressDetailModel();
        let ModeData = model.method1(map)
        return ModeData;

    }
}
