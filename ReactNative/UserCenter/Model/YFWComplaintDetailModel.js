import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import {isNotEmpty, yfw_domain} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWComplaintDetailModel extends Component {

    constructor(props) {
        super(props);

        this.img_url = [];
        this.shop_reply_content = '';
        this.shop_reply_img_url = '';
        this.shop_reply_time = '';
        this.platform_reply_content = '';
        this.platform_reply_time = '';
        this.status = '';
        this.shop_title = '';
        this.order_no = '';
        this.type = '';
        this.complaints_reason = '';
        this.complaints_name = '';
        this.status_name = '';
        this.complaint_time = '';
        this.content = '';
        this.buttons = []
    }


    setModelData(data) {
        if (isNotEmpty(data)) {
            this.img_url =data.intro_image.split('|');
            this.shop_reply_content = data.reply_content;
            this.shop_reply_img_url = data.reply_image.split('|');
            this.shop_reply_time = data.reply_time;
            this.platform_reply_content = data.admin_reply_content;
            this.platform_reply_time = data.admin_reply_time;
            this.status = data.dict_complaints_status;
            this.shop_title = data.title;
            this.order_no = data.orderno;
            this.type = data.dict_complaints_type;
            this.complaints_name = (this.type == 1 || this.type == 2) ? (this.type == 1 ? '商品质量问题' : '商家服务问题'):data.complaints_name;
            this.complaints_reason = data.complaints_reason;
            this.status_name = data.dict_complaints_status_name;
            this.complaint_time = data.create_time;
            this.content = data.content;
            if(isNotEmpty(data.buttons)){
                this.buttons = data.buttons
            }
        }

        return this;

    }


    static getModel(item) {

        let model = new YFWComplaintDetailModel();
        model.setModelData(item);

        return model;

    }


}