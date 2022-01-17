/**
 * Created by weini on 2018/12/6
 */
import React from 'react';
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWChooseAddressViewModel {

    constructor(props) {

    }

    method1(data) {
        if (isNotEmpty(data)) {
            return {
                id:data.id,
                name:data.region_name,
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
                let model = new YFWChooseAddressViewModel();
                returnData.push(model.method1(item));
            });
        }

        return returnData;
    }
}