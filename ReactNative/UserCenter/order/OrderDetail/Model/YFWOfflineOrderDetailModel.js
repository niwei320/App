import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import {isNotEmpty, safeObj, isArray, safe} from "../../../../PublicModule/Util/YFWPublicFunction";

export default class YFWOfflineOrderDetailModel extends Component {
    constructor() {
        super();
    }

    setModelData(data) {

        if (isNotEmpty(data)) {
            let goods_items = [];
            if (isNotEmpty(data.detailList) && isArray(data.detailList) && data.detailList.length>0) {
                let noPackageMedicine = {
                    package_type: -1,
                    medicine_count: data.detailList.length,
                    data: this._getGoodsModel(data.detailList)
                }
                goods_items.push(noPackageMedicine)
            }

            return {
                order_no: safe(data.OrderNo),
                shop_id: safe(data.ShopId),
                shop_title: safe(data.shopTitle),
                order_total: safe(data.PayMoney),
                status_name:safe(data.OrderStatusName),
                shopTitle:safe(data.shopTitle),
                shopId:safe(data.ShopId),
                id:safe(data.Id),
                orderNo:safe(data.OrderNo),
                prescriptionNo:safe(data.PrescriptionNo),
                sellAccountName:safe(data.SellAccountName),
                couponPrice:safe(data.CouponPrice),
                payMent:safe(data.PayMent),
                remarks:safe(data.Remarks),
                createTime:safe(data.CreateTime),
                shopMedicineTotal:safe(data.ShopMedicineTotal),
                isSendCash:safe(data.IsSendCash),
                shopDiscountMoney:safe(data.ShopDiscountMoney),
                discountMoney:safe(data.DiscountMoney),
                medicineDiscountMoney:safe(data.MedicineDiscountMoney),
                reductionMoney:safe(data.ReductionMoney),
                orderMoney:safe(data.OrderMoney),
                pointsDeductionTotal:safe(data.PointsDeductionTotal),
                payMoney:safe(data.PayMoney),
                returnMoney:safe(data.ReturnMoney),
                storeId: safe(data.StoreId),
                goods_items:goods_items,

            }
        }
    }

    /** 药品数组处理 */
    _getGoodsModel(array){
        let medicines = [];
        array.forEach((gooditem,index)=> {
            medicines.push({
                order_goods_no:safe(gooditem.OrderNo) ,
                shop_goods_id:safe(gooditem.store_medicineid),
                title:safe(gooditem.NameCN) ,
                standard:safe(gooditem.Standard) ,
                img_url:safe(gooditem.MedicineIntorImage) ,
                prescription:safe(gooditem.dict_bool_prescription),
                price:safe(gooditem.UnitPrice),
                quantity:safe(gooditem.Amount),
                // package_name:gooditem.package_name,
                PrescriptionType:this.convertPrescriptionType(safe(gooditem.Prescription))
            });
        });
        return medicines;
    }

    /**
     * 处方、单双轨字段转换
     * @param type
     */
    convertPrescriptionType(type){
        if(type+'' === '1'){
            return '3'
        }
        return type+""
    }

    static getModelArray(array) {
        let model = new YFWOfflineOrderDetailModel();
        let ModeData = model.setModelData(array)
        return ModeData;

    }

}