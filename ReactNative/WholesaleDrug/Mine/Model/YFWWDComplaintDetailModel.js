import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import { isNotEmpty } from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDComplaintDetailModel extends YFWWDBaseModel{ 
    constructor(props) {
        super(props);
        this.orderno = ''
        this.img_url = '';
        this.shop_reply_content = '';
        this.shop_reply_img_url = '';
        this.shop_reply_time = '';
        this.platform_reply_content = '';
        this.platform_reply_time = '';
        this.status = '';
        this.shop_title = '';
        this.type = '';
        this.complaints_reason = '';
        this.complaints_name = '';
        this.status_name = '';
        this.complaint_time = '';
        this.content = '';
        this.buttons = []
        this.dict_complaints_color = ''
        this.dict_complaints_status_name = ''
    }


    static initWithModel(data) {
        let instance = new YFWWDComplaintDetailModel();
        instance = data
        return instance;
    }

    static initFromData(data) {
        let instance = new YFWWDComplaintDetailModel();
        if (isNotEmpty(data)) {
            instance.img_url = data.intro_image.split('|');
            instance.shop_reply_content = data.reply_content;
            instance.shop_reply_img_url = data.reply_image.split('|');
            instance.shop_reply_time = data.reply_time;
            instance.platform_reply_content = data.admin_reply_content;
            instance.platform_reply_time = data.admin_reply_time;
            instance.status = data.dict_complaints_status;
            instance.shop_title = data.title;
            instance.orderno = data.orderno;
            instance.type = data.dict_complaints_type;
            instance.complaints_name = (instance.type == 1 || instance.type == 2) ? (instance.type == 1 ? '商品质量问题' : '商家服务问题'):data.complaints_name;
            instance.complaints_reason = data.complaints_reason;
            instance.complaint_time = data.create_time;
            instance.content = data.content;
            instance.dict_complaints_color = instance.status == 0?'rgb(254,172,76)':instance.status == 1?'rgb(31,219,155)':instance.status == 3?'rgb(31,219,155)':'rgb(204,204,204)'
            instance.dict_complaints_status_name = instance.status == 0?'待处理':instance.status == 1?'已处理':instance.status == 3?'商家已回复':'已撤销'
            if(isNotEmpty(data.buttons)){
                instance.buttons = data.buttons
            }
        }
        return instance;
    }

}