
import YFWWDBaseModel from "../../Base/YFWWDBaseModel"

/**
 * 资质信息数据模型
 */
export default class YFWWDQualificationInfoModel extends YFWWDBaseModel {

    /**
    dict_store_licence_type: 14
    end_date: ""
    expiry_desc: "已过期"
    id: 224
    image_url: "http://c1.yaofangwang.net/9/2681/c9e6199d755d2ebe82e6bcf8309616da.jpg"
    isReadOnly: 0
    name: "采购委托书"
    storeid: 93531
    **/
    constructor() {
        super()
        /**通用 */
        this.id = ''
        this.image = ''
        this.name = ''
        this.expiration_date = ''       //有效期
        this.expiry_desc = ''
        this.type = ''
        this.dict_store_licence_type = ''
        this.isReadOnly = ''
        this.storeid = ''
        this.licence_code = ''
    }

    static init(data) {
        let instance = new YFWWDQualificationInfoModel()
        instance.id = data.id
        instance.image = data.image
        instance.name = data.name
        instance.expiration_date = data.expiration_date
        instance.expiry_desc = data.expiry_desc
        instance.dict_store_licence_type = data.dict_store_licence_type
        instance.type = data.type
        instance.isReadOnly = data.isReadOnly
        instance.storeid = data.storeid
        instance.licence_code = data.licence_code
        return instance
    }
}
