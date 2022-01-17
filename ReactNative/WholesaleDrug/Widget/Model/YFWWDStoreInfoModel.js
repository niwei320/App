import YFWWDBaseModel from "../../Base/YFWWDBaseModel"
import { safeArray } from "../../../PublicModule/Util/YFWPublicFunction"
import YFWWDCouponModel from "./YFWWDCouponModel"

/**
 * 商家信息数据模型
 */
export default class YFWWDStoreInfoModel  extends YFWWDBaseModel{
    constructor() {
        super()
        this.shopId = ''
        this.storeName = ''
        this.isfaverate = false
        this.storeAge = ''
        this.storeGoodsNum = ''
        this.dict_audit = -1
        this.open_coupons = []        //YFWWDCouponModel 开户优惠券
        this.coupon = []        //YFWWDCouponModel 优惠券
    }

    static init(data) {
        let instance = new YFWWDStoreInfoModel()
        instance.shopId = data.shopId
        instance.storeName = data.storeName
        instance.isfaverate = data.isfaverate
        instance.storeAge = data.storeAge
        instance.storeGoodsNum = data.storeGoodsNum
        instance.dict_audit = data.dict_audit
        instance.open_coupons = this.getCouponArray(data.open_coupons_list)
        instance.coupon = this.getCouponArray(data.coupons_list)
        return instance
    }

    static getCouponArray(data) {
        data = safeArray(data)
        return data.map((item) => {return YFWWDCouponModel.initWithData(item) })
    }
}
