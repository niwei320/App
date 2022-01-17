import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import { safe } from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDCouponModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.id = ''
        this.title = ''
        this.price = ''

        this.desc = ''
        this.time_start = ''
        this.time_end = ''
        this.status = ''
        this.type = ''
        this.min_order_total = ''
        this.btn_name = ''
        this.expiring_soon = ''
        this.shop_title = ''
        this.shop_id = ''
        this.shop_goods_id = ''
        this.goods_id = ''

     }

     static initWithModel(data){
        let instance = new YFWWDCouponModel();
        instance = data
        return instance;
     }

     static initWithData(data){
        let instance = new YFWWDCouponModel();
        instance.id = safe(data.id)
        instance.title = safe(data.title)
        instance.price = safe(data.price)

        instance.desc = safe(data.description)
        instance.time_start = safe(data.start_time)
        instance.time_end = safe(data.expire_time)
        instance.status = safe(data.dict_bool_status)
        instance.type = safe(data.dict_coupons_type)        //全场、单品、平台
        instance.min_order_total = safe(data.use_condition_price_desc)
        instance.btn_name = data.dict_bool_status == 0 ? '去使用' : data.dict_bool_status == 1?'已使用':'已过期',
        instance.expiring_soon = safe(data.expiring_soon)
        instance.shop_title = safe(data.store_title)
        instance.shop_id = safe(data.storeid)
        instance.shop_goods_id = safe(data.store_medicineid)
        instance.goods_id = safe(data.medicineid)
        instance.dict_bool_open_customer = safe(data.dict_bool_open_customer) //开户领券
        return instance;
     }


 }
