import React from 'react';
import {isNotEmpty, safeArray, safeObj, safe} from "../../../PublicModule/Util/YFWPublicFunction";

export default class OrderDetailModel {

    constructor(props) {

    }

    setModelData(data) {

        if (isNotEmpty(data)) {
            let goods_items = [];
            let order_status_items = [];
            let send_info = {}
            const statusList = safeArray(data.statusList)
            if (statusList.length>0) {
                data.statusList.forEach((item, index)=> {
                    order_status_items.push({
                        name: safe(item.dict_order_status_name),
                        datetime: safe(item.create_time),
                        desc: safe(item.description),
                        status: safe(item.dict_order_status)
                    });
                })
            }
            const medicineList = safeArray(data.medicineList)
            if (medicineList.length>0) {
                data.medicineList.forEach((item, index)=> {
                    goods_items.push({
                        order_goods_no: safe(item.medicine_orderno),
                        shop_goods_id: safe(item.store_medicineid),
                        title: safe(item.medicine_name),
                        standard: safe(item.standard),
                        img_url: safe(item.intro_image),
                        prescription: safe(item.is_prescription),
                        price: safe(item.unit_price),
                        quantity: safe(item.qty),
                        package_name: safe(item.package_name),
                        PrescriptionType: this.convertPrescriptionType(safe(item.dict_medicine_type))
                    });
                })
            }
            if (isNotEmpty(data.scheduled_days_item)) {
                send_info = {
                    button_items: safeObj(data.scheduled_days_item.buttons),
                    desc: safe(data.scheduled_days_item.desc),
                }
            }

            return {
                order_no: data.orderno,
                shop_id: data.storeid,
                shop_title: data.title,
                shop_phone: data.store_phone,
                order_total: data.total_price,
                goods_total: data.medicine_total,
                shipping_price: data.shipping_total,
                package_price: data.packaging_total,
                update_price: data.update_price,
                update_price_desc: data.update_price_desc,
                coupon_price: data.use_coupon_price,
                package_name: data.packaging_method,
                use_point: data.use_point * 100,//1积分1分钱
                use_point_price: data.use_point,
                status_id: data.dict_order_status,
                status_name: data.dict_order_status_name,
                shopping_name: data.shopping_name,
                shopping_mobile: data.shopping_mobile,
                shopping_address: data.shopping_address,
                prescription_audit: '',
                order_desc: '',
                shipping_name: data.traffic_name,
                shipping_no: data.trafficno,
                logistics_icon: data.traffic_icon,
                platform_yh_price: data.plat_coupon_price,
                invoice_type: data.dict_invoice_type,
                invoice_title: data.invoice_applicant,
                invoice_no: data.invoiceno,
                period_to_Date: data.period_to,//有效期
                send_info: send_info,
                goods_items: goods_items,
                button_items: data.buttons,
                order_status_items: order_status_items,
                goods_count: goods_items.length,

                phone_prompt: data.phone_prompt,
                phone_show_type: data.phone_show_type
            }
        }
    }

    /**
     * 处方、单双轨字段转换
     * @param type
     */
    convertPrescriptionType(type) {
        if (type + '' === '3') {
            return '1'//单轨
        }
        //TCP 和HTTP 双轨都是2
        return type + ""
    }

    static getModelArray(array) {
        let model = new OrderDetailModel();
        let ModeData = model.setModelData(array)
        return ModeData;

    }


}