import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import { YFWImageConst } from "../../Images/YFWImageConst";
import { safe } from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDMessageHomeItemModel extends YFWWDBaseModel{ 
    /**
     * 
     * content: "点击查看您与客服的沟通记录"
        create_time: ""
        icon: "http://c1.yaofangwang.net/common/images/app/message/icon/khfw.png"
        msg_type: "客户服务"
        msg_type_id: "-1"
        total_count: "0"
     * 
     */
    constructor() {
        super()
        this.image = ''
        this.itemTitle = ''
        this.itemContent = ''
        this.count = 0
        this.type = -2
    }

    static initWithModel(data){
        let instance = new YFWWDMessageHomeItemModel();
        instance.image = data.image
        instance.itemTitle = data.itemTitle
        instance.itemContent = data.itemContent
        instance.count = data.count
        instance.type = data.type
        return instance;
    }

    static initWithData(data){
        let instance = new YFWWDMessageHomeItemModel();
        instance.itemTitle = data.msg_type
        instance.itemContent = safe(data.content).replace(/<.*?>/ig,"")
        instance.count = data.total_count
        instance.type = data.msg_type_id
        instance.image = this.getImageIcon(instance.type)
        return instance;
    }

    static getImageIcon(type) { 
        if (type == -1) {
            return YFWImageConst.Icon_service_message
        } else if(type == 1) {
            return YFWImageConst.Icon_system_message
            
        }else if(type == 2) {
            return YFWImageConst.Icon_order_message   
        }
    }

}