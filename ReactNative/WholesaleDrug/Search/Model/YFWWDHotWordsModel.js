import React from 'react'
import {isNotEmpty} from "../../../PublicModule/Util/YFWPublicFunction";
export default class YFWWDHotWordsModel extends React.Component {

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
        let model = new YFWWDHotWordsModel();
        let ModeData =  model.setModelData(array);
        return ModeData;

    }
}