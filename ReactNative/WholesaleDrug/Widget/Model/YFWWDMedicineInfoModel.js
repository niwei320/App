import YFWWDBaseModel, { kList_from } from "../../Base/YFWWDBaseModel"
import { safeObj } from "../../../PublicModule/Util/YFWPublicFunction"

/**
 * 商品信息数据模型
 */
export default class YFWWDMedicineInfoModel extends YFWWDBaseModel { 

    constructor() {
        super()
        /**通用 */
        this.id = ''
        this.medicinId = ''
        this.image = ''
        this.name = ''
        this.mname = ''     //带品牌药名
        this.brand = ''     //品牌
        this.standard = ''   //规格
        this.wPrice = ''   //批发价
        this.medicine_status = ''   //右上角促销、新品标签
        this.authorized_code = ''
        this.is_add_cart = false
        this.reserve = 0        //库存
        this.period_to = ''     //有效期至
        this.title = ''         //商家
        this.troche_type = ''         //商家
        //常购商品
        this.recently_purchased = ''    //最近采购
        this.purchased_count = ''       //采购数量
        this.unit = ''       //单位
        this.recently_sold  = ''       //最近销售
    }

    static initWithModel(data) { 
        let instance = new YFWWDMedicineInfoModel()
        instance.id = data.id
        instance.medicinId = data.medicinId
        instance.image = data.image
        instance.name = data.name
        instance.mname = data.mname
        instance.brand = data.brand
        instance.standard = data.standard
        instance.wPrice = data.wPrice
        instance.medicine_status = data.medicine_status
        instance.authorized_code = data.authorized_code
        instance.is_add_cart = data.is_add_cart
        instance.reserve = data.reserve
        instance.period_to = data.period_to
        instance.recently_purchased = data.recently_purchased
        instance.purchased_count = data.purchased_count
        instance.recently_sold = data.recently_sold
        instance.unit = data.unit
        instance.title = data.title

        instance.recently_purchased = data.recently_purchased
        instance.purchased_count = data.purchased_count
        instance.unit = data.unit
        instance.recently_sold = data.recently_sold

        return instance
    }

    static initWithData(data,from) { 
        let instance = new YFWWDMedicineInfoModel()
        instance.image = data.intro_image
        instance.id = data.id
        instance.title = data.title
        instance.medicinId = data.medicineid
        instance.name = data.namecn
        instance.brand = data.aliascn+' '
        instance.standard = data.standard
        instance.reserve = data.reserve
        instance.wPrice = data.price_min
        instance.medicine_status = data.dict_store_medicine_status
        instance.authorized_code = data.authorized_code
        instance.is_add_cart = data.is_add_cart
        instance.mname = instance.brand + instance.name
        if (from == kList_from.kList_from_operationsccess) {
            /** 
            aliascn: "同仁堂"
            authorized_code: "国药准字Z11020091"
            id: 281724
            intro_image: "http://c1.yaofangwang.net/common/upload/medicine/281/281724/1b100d2b-5062-441e-8ed7-aa39f506cf306926.jpg"
            namecn: "同仁乌鸡白凤丸"
            price_min: 16
            short_title: "同仁堂制药"
            standard: "9gx10丸/盒"
            store_num: 2
            storeid: 698
            troche_type: "大蜜丸剂"
            **/
            instance.authorized_code = data.authorized_code
            instance.brand = data.aliascn+' '
            instance.id = data.id
            instance.image = data.intro_image
            instance.name = data.namecn
            instance.mname = instance.brand + instance.name
            instance.wPrice = data.price_min
            instance.title = data.short_title
            instance.standard = data.standard
            instance.reserve = data.store_num
            instance.medicinId = data.storeid
            instance.troche_type = data.troche_type
            instance.mname = instance.brand + instance.name
        }
        if (from == kList_from.kList_from_frequentlygoods) {
            /**
             * alias: "999"
                count: 2
                intro_image: "http://c1.yaofangwang.net/common/upload/medicine/261/261440/d0fb5793-6745-497d-ac1b-b9321bdeaedc1543.jpg"
                medicineid: 261440
                namecn: "感冒灵颗粒"
                reserve: 302
                sale_count: 5
                standard: "10gx9袋/盒"
                store_medicineid: 16663379
                sum: 196
                title: "华润三九医药股份有限公司"
                troche_type: "颗粒剂"
             */
            instance.brand = data.alias
            instance.recently_purchased = data.count
            instance.purchased_count = data.sum
            instance.unit = ''      /**todo */
            instance.recently_sold = data.sale_count
            instance.medicinId = data.store_medicineid
            instance.id = data.medicineid
            instance.wPrice = data.receive_price
            instance.mname = instance.brand +' '+instance.name
        }
        if (from == kList_from.kList_from_history) {
            instance.image = data.image
            instance.mname = data.medicine_name
            instance.wPrice = data.price
            instance.title = data.title
            instance.medicinId = data.store_medicineid
            instance.id = data.medicineid
        }
        if (from == kList_from.kList_from_storehome) {
            instance.image = data.intro_image
            instance.id = data.id
            instance.medicinId = data.medicineid
            instance.name = data.namecn
            instance.mname = data.medicine_name
            instance.brand = data.aliascn
            instance.standard = data.standard
            instance.wPrice = data.price
            instance.medicine_status = safeObj(data.dict_store_medicine_status)
        }
        if (from == kList_from.kList_from_storeList) {
            instance.image = safeObj(data.intro_image)
            instance.id = safeObj(data.id)
            instance.medicinId = safeObj(data.medicineid)
            instance.name = safeObj(data.namecn)
            instance.mname = safeObj(data.medicine_name)
            instance.brand = safeObj(data.aliascn)
            instance.standard = safeObj(data.standard)
            instance.wPrice = safeObj(data.price)
            instance.medicine_status = safeObj(data.dict_store_medicine_status)
            instance.authorized_code = safeObj(data.authorized_code)
            instance.is_add_cart = safeObj(data.is_add_cart)
            instance.reserve = safeObj(data.reserve)
            instance.period_to = safeObj(data.period_to)
        }
        return instance
    }
}