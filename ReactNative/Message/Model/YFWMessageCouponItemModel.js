import React from 'react';
import { HTML_VERIFY } from '../../PublicModule/Util/RuleString';
import {isNotEmpty, safe, safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWMessageCouponItemModel {

    constructor(props){

        this.create_time = '';
        this.msg_type = '';
        this.content = '';

        this.is_expired = '';
        this.image_file = '';

        this.message_id = '';
        this.redirect_type = '';
        this.url = ''

        this.jumptype = ''
        this.jumpvalue = ''
        this.advisory_link = ''

        this.active = ''
        this.canJump = true
    }

    setModelData(data){

        if (isNotEmpty(data)) {
                this.message_id = safe(data.id),
                this.msg_type = safe(data.msg_type_desc),
                this.msg_type_id = safe(data.dict_msg_type),
                this.content = safe(data.content).replace(HTML_VERIFY, ''),
                this.content_all = this.content,
                this.create_time = safe(data.create_time).substring(0,10),
                this.time_division = safe(data.create_time).substring(11,19),
                this.url = safe(data.url),
                this.is_read = safeObj(data.site_message_readid),
                this.start_time = safe(data.create_time),
                this.end_time = "",
                this.image_file = "",
                this.jumptype = safe(data.jumptype),
                this.jumpvalue = safe(data.jumpvalue)
                this.advisory_link = safe(data.advisory_link)
                this.active = safe(data.active)
                this.canJump = this.jumptype.length>0 || this.jumpvalue.length>0
            }
        return this;
    }

    static getModelArray(array){
        let marray = [];
        if (isNotEmpty(array)) {
            array.forEach((item,index)=>{
                let model = new YFWMessageCouponItemModel();
                marray.push(model.setModelData(item));
            });
        }
        return marray;
    }


}