import YFWWDBaseModel from "../../Base/YFWWDBaseModel";

export default class YFWWDComplaintListItemModel extends YFWWDBaseModel{ 
    /**
     *  active: 1
        buy_storeid: 338958
        content: "123123123211"
        create_time: "2020-03-31 19:40:53"
        dict_complaints_status: 0
        dict_complaints_type: 7
        orderno: "B911221805346314"
        short_title: "成都御惠堂"
        title: "成都御惠堂大药房有限公司"
     */
    constructor() {
        super()
        this.active = '',
        this.buy_storeid = ''
        this.content = ''
        this.create_time = ''
        this.dict_complaints_status = ''
        this.dict_complaints_color = ''
        this.dict_complaints_name = ''

        this.dict_complaints_type = ''
        this.orderno = ''
        this.short_title = ''
        this.title = ''
    }

    static initWithModel(data){
        let instance = new YFWWDComplaintListItemModel();
        instance.active = instance.active,
        instance.buy_storeid = data.buy_storeid,
        instance.content = data.content
        instance.create_time = data.create_time
        instance.dict_complaints_status = data.dict_complaints_status
        instance.dict_complaints_color = data.dict_complaints_color
        instance.dict_complaints_name = data.dict_complaints_name
        instance.dict_complaints_type = data.dict_complaints_type
        instance.orderno = data.orderno
        instance.short_title = data.short_title
        instance.title = data.title
        return instance;
    }

    static initWithData(data){
        let instance = new YFWWDComplaintListItemModel();
        instance.active = instance.active,
        instance.buy_storeid = data.buy_storeid,
        instance.content = data.content
        instance.create_time = data.create_time
        instance.dict_complaints_status = data.dict_complaints_status
        instance.dict_complaints_color = instance.dict_complaints_status == 0?'rgb(254,172,76)':instance.dict_complaints_status == 1?'rgb(31,219,155)':instance.dict_complaints_status == 3?'rgb(31,219,155)':'rgb(204,204,204)'
        instance.dict_complaints_name = instance.dict_complaints_status == 0?'待处理':instance.dict_complaints_status == 1?'已处理':instance.dict_complaints_status == 3?'商家已回复':'已撤销'
        instance.dict_complaints_type = data.dict_complaints_type
        instance.orderno = data.orderno
        instance.short_title = data.short_title
        instance.title = data.title
        return instance;
    }


}