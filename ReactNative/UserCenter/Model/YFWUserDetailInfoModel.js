/**
 * Created by weini on 2018/11/27
 */
import React from 'react';
import {isNotEmpty, safe} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWUserDetailInfoModel {

    constructor(props) {

    }

    method1(data) {
        if (isNotEmpty(data)) {
            return {
                account_name:data.account_name,
                real_name:data.real_name,
                idcard_no: safe(data.idcard_no),
                img_url:data.intro_image,
                sex:data.dict_sex+'',
                mobile:data.mobile,
                phone:data.phone,
                email:data.email,
                qq:data.qq,
                is_update_pwd:"true",
                isDefaultPwd:data.is_default_pwd,
                isRealName: data.dict_bool_certification==1 || data.dict_bool_certification=='1'
            }
        }
    }

    /**
     *传入map对象，返回map对象
     */
    static getModelData(map) {
        let model = new YFWUserDetailInfoModel();
        let ModeData = model.method1(map)
        return ModeData;

    }
}