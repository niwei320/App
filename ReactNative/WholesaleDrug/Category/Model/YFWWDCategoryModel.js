import React from 'react';
import {isEmpty, isNotEmpty, itemAddKey} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";

export default class YFWWDCategoryModel {

    constructor(props){
    }

    static getInstance(){
        if(isEmpty(this.model)){
            this.model = new YFWWDCategoryModel()
        }
        return this.model
    }

    setModelData(data){

        let isRequestTCP = YFWUserInfoManager.defaultProps.isRequestTCP;

        if (isNotEmpty(data)) {

            if (isRequestTCP) {
                let items = [];
                if (isNotEmpty(data)) {
                    data.forEach((item,index)=> {
                        let sub_items = [];
                        if (isNotEmpty(item.items)) {
                            item.items.forEach((item,index)=> {
                                let end_items = [];
                                if (isNotEmpty(item.medicines)) {
                                    item.medicines.forEach((item,index)=> {
                                        end_items.push({
                                            id: item.medicineid,
                                            name: item.namecn,
                                            standard: item.standard,
                                            standard_type: item.troche_type,
                                            intro_image: item.intro_image,
                                        });
                                    })
                                }
                                sub_items.push({
                                    id: item.categary_id,
                                    name: item.name,
                                    categories: end_items,
                                });
                            })
                        }
                        items.push({
                            index:index,
                            id: item.categary_id,
                            name: item.name,
                            categories:sub_items,
                            app_category_ad:item.app_category_ad===undefined?[]:item.app_category_ad
                        });
                    })
                }
                return items;
            }else {
                return data;

            }
        }
    }

    static getModelArray(array){
        let model = YFWWDCategoryModel.getInstance();
        let ModeData =  model.setModelData(array)
        YFWWDCategoryModel.setDataArray(itemAddKey(ModeData))
        return ModeData;
    }

    static getDataArray(){
        if(isEmpty(dataArray)){
            dataArray = []
        }
        return dataArray
    }

    static setDataArray(array){
        dataArray = array
    }

}
