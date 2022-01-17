import React from 'react';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {isEmpty, isNotEmpty, itemAddKey} from "../../PublicModule/Util/YFWPublicFunction";


let model = null
let dataArray =[]
export default class YFWCategoryModel {

    constructor(props){

    }

    static getInstance(){
        if(isEmpty(model)){
            model = new YFWCategoryModel()
        }
        return model
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
                                if (isNotEmpty(item.items)) {
                                    item.items.forEach((item,index)=> {
                                        end_items.push({
                                            id: item.id,
                                            name: item.name,
                                            intro_image: item.icon,
                                        });
                                    })
                                }
                                sub_items.push({
                                    id: item.id,
                                    name: item.name,
                                    intro_image: item.icon,
                                    categories: end_items,
                                });
                            })
                        }
                        itemData ={
                            id: item.id,
                            name: item.name,
                            intro_image: item.icon,
                            categories:sub_items,
                            app_category_ad:item.app_category_ad
                        }
                        switch (item.name){
                         case '中西药品':
                         items.push(itemData);
                         break
                         case '养生保健':
                         items.splice(1,0,itemData);
                         break
                         case '医疗器械':
                         items.splice(2,0,itemData);
                         break
                         case '计生用品':
                         items.splice(3,0,itemData);
                         break
                         case '中药饮片':
                         items.splice(4,0,itemData);
                         break
                         case '美容护肤':
                         items.splice(5,0,itemData);
                         break
                         }
                        /*items.push({
                            id: item.id,
                            name: item.name,
                            intro_image: item.icon,
                            categories:sub_items,
                        });*/
                    })
                }
                return items;
            }else {
                return data;

            }
        }
    }

    static getModelArray(array){
        let model = YFWCategoryModel.getInstance();
        let ModeData =  model.setModelData(array)
        YFWCategoryModel.setDataArray(itemAddKey(ModeData))
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