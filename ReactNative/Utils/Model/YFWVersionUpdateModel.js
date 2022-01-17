import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWVersionUpdateModel {

    constructor(props){

        this.updateDescription = '';
        this.updateLink = '';
        this.isNeedUpdate = '';
        this.isForceUpdate = '';
        this.new_version = '';
    }

    setModelData(data){

        let isRequestTCP = YFWUserInfoManager.defaultProps.isRequestTCP;

        if (isNotEmpty(data)) {
            if (isRequestTCP){
                this.updateDescription = data.updateDescription;
                this.updateLink = data.updateLink;
                this.isNeedUpdate = data.isNeedUpdate;
                this.isForceUpdate = 0//data.isForceUpdate;
                this.new_version = data.new_version;
            } else {
                this.updateDescription = data.update_desc;
                this.updateLink = data.update_url;
                this.isNeedUpdate = parseInt(data.version)<parseInt(data.new_version)?'1':'0';
                this.isForceUpdate = data.compulsively;
                this.new_version = data.new_version;
            }
        }

        return this;

    }

    static getModelWithData(map){
        let model = new YFWVersionUpdateModel();
        model.setModelData(map);
        return model;
    }


}