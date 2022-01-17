/**
 * Created by weini on 2018/12/8
 */
import React from 'react';
import {isNotEmpty, safe, safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class ShippingAddressDetailModel {

    constructor(props) {

    }

    method1(data) {
        if (isNotEmpty(data)) {
            
            let userAddress = '';
            if (safe(data.name_path).length > 0) {
                let adrs = data.name_path.split("|");
                for (let index = 0; index < adrs.length; index++) {
                    userAddress += adrs[index];
                }
            }
            let userAddressDetail = safe(data.address_name).replace(userAddress,'');
            return {
                id:data.id,
                region_id:data.regionid,
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
        let model = new ShippingAddressDetailModel();
        let ModeData = model.method1(map)
        return ModeData;

    }
}