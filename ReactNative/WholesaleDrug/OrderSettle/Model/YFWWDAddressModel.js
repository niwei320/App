import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager'
import {isNotEmpty} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDAddressModel {

    constructor(props){

        this.name = '';
        this.mobile = '';
        this.address = '';
        this.is_default = '';
        this.province = '';
        this.city = '';
        this.country = '';
        this.street_name = '';
        this.region_id = '';
        this.id = '';
    }

    setModelData(data){

        let isRequestTCP = YFWUserInfoManager.defaultProps.isRequestTCP;

        if (isNotEmpty(data)) {

            if (isRequestTCP) {
                this.id = data.id;
                this.region_id = data.regionid;
                this.name = data.name;
                this.mobile = data.mobile;
                this.address = data.address_name;
                this.is_default = data.dict_bool_default;
                this.city = data.city;
                this.lat = isNotEmpty(data.lat)?data.lat:'31.23224';//没有经纬度数据设置为上海市政府坐标
                this.lng = isNotEmpty(data.lng)?data.lng:'121.46902';
            }else {

                this.name = data.name;
                this.mobile = data.mobile;
                this.address = data.address;
                this.is_default = data.is_default;
                this.province = data.province;
                this.city = data.city;
                this.street_name = data.street_name;
                this.region_id = data.region_id;
                this.id = data.id;
                this.country = data.county==this.city?'':data.county;

            }

        }

        return this;

    }


    static getModelArray(array){

        if (array == undefined) return [];

        let marray = [];
        array.forEach((item,index)=>{

            let model = new YFWWDAddressModel();
            marray.push(model.setModelData(item));

        });

        return marray;

    }


}