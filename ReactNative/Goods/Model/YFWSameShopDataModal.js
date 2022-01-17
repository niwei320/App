import React from 'react'
import {
    View,
} from 'react-native'

import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {isNotEmpty, safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWSameShopDataModal extends React.Component {
    constructor(props){
        super(props)
        this.goodsID = '';
        this.name = '';
        this.imageUrl = '';
    }

    setModelData(data){

        let isRequestTCP = YFWUserInfoManager.defaultProps.isRequestTCP;

        if (isNotEmpty(data)) {

            if (isRequestTCP) {
                let imgs = safeObj(data.intro_image).split("|")
                let img = imgs.length>0?imgs[0]:""
                this.goodsID = data.id;
                this.name = data.namecn;
                this.imageUrl = img;
                this.medicineid = data.medicineid

            }else {

                this.goodsID = data.good_id;
                this.name = data.name_cn;
                this.imageUrl = data.image_file;
            }

        }

        return this;

    }


    static getModelArray(array){

        let marray = [];

        if (isNotEmpty(array)){
            array.forEach((item,index)=>{
                let model = new YFWSameShopDataModal();
                marray.push(model.setModelData(item));
            });
        }

        return marray;

    }
}
