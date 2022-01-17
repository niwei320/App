import React from 'react';
import {isNotEmpty, safe} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWHealthAskSearchItemModel {

    constructor(props) {
        this.id="";
        this.title="";
        this.dep_name="";
        this.reply_count="";
        this.status_id="";
        this.status="";
        this.time="";
    }

    setModelData(data) {
        if (isNotEmpty(data)) {
            this.id=data.id;
            this.title=data.title;
            this.dep_name=data.department_name;
            this.reply_count=data.reply_count;
            this.status_id='';
            this.status=data.status;
            this.time=data.create_time;
            return this;
        }
    }

    static getModelArray(array) {
        let marray = [];
        array.forEach((item, index) => {
            let model = new YFWHealthAskSearchItemModel();
            marray.push(model.setModelData(item));
        });

        return marray;

    }
}


