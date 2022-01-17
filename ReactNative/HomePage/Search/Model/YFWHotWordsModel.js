import React from 'react'
import {isEmpty, isNotEmpty, safeArray} from "../../../PublicModule/Util/YFWPublicFunction";
export default class YFWHotWordsModel extends React.Component {

    constructor(props) {
        super(props);

    }

    setModelData(data) {
        if (isNotEmpty(data)) {
            let items = [];
            if (isNotEmpty(data)) {
                data.forEach((item,index)=>{
                    items.push(item.keywords_name);
                });
            }
            return items;
        }
    }

    static getModelArray(array) {
        if(isEmpty(array)){
            return [];
        }
        let model = new YFWHotWordsModel();
        let ModeData =  model.setModelData(array);
        return ModeData;

    }
}
