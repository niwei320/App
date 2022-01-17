import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import { safe } from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDMessageListItemModel extends YFWWDBaseModel{ 
    /**
     * active: 1
        content: "您的批发订单已发货,运单号圆通快递(YT4378339657886)"
        create_time: "2020-03-05 10:29:48"
        dict_msg_level: 2
        dict_msg_type: 2
        id: 11688807
        img_file: ""
        jumptype: "get_order_detail"
        jumpvalue: "B911221805346314"
        msg_subtype_desc: "SENDED"
        msg_type_desc: ""
        read_count: 1401959
        read_status_name: "已读"
        title: "订单通知"
        url: ""
        
     */
    constructor() {
        super()
        this.content = ''
        this.create_time = ''
        this.dict_msg_type = -2
        this.jumptype = ''
        this.jumpvalue = ''
        this.read_count = ''

    }

    static initWithModel(data){
        let instance = new YFWWDMessageListItemModel();
        instance.content = data.content
        instance.create_time = data.create_time
        instance.dict_msg_type = data.dict_msg_type
        instance.jumptype = data.jumptype
        instance.jumpvalue = data.jumpvalue
        instance.read_count = data.read_count
        return instance;
    }

    static initWithData(data){
        let instance = new YFWWDMessageListItemModel();
        instance.content = safe(data.content).replace(/<.*?>/ig,"").replace(/&nbsp;/ig,"")
        instance.create_time = data.create_time.substring(0,10)
        instance.dict_msg_type = data.dict_msg_type
        instance.jumptype = data.jumptype
        instance.jumpvalue = data.jumpvalue
        instance.read_count = data.read_count
        return instance;
    }

}