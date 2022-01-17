import React from 'react';
import {isNotEmpty, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDOrderDetailModel {

    setModelData(data) {

        if (isNotEmpty(data)) {
            let goods_items = [];
            let order_status_items = [];
            let medicine_num = 0
            let send_info = {}
            if (isNotEmpty(data.statusList)) {
                data.statusList.forEach((item, index)=> {
                    order_status_items.push({
                        name: item.dict_order_status_name,
                        datetime: item.create_time,
                        desc: item.description,
                        status: item.dict_order_status
                    });
                })
            }
            if (isNotEmpty(data.medicineList)&&data.medicineList.length>0) {
                let noPackageMedicine = {
                    package_type: -1,
                    medicine_count: data.medicineList.length,
                    data: this._getMedicenList(data.medicineList)
                }
                medicine_num = data.medicineList.length
                goods_items.push(noPackageMedicine)
            }
            if (isNotEmpty(data.packmedicine_list)&&data.packmedicine_list.length>0) {
                data.packmedicine_list.forEach((item, index) => {
                    let packageMedicine = {
                        package_type: item.package_type,
                        package_name: item.smp_name,
                        package_id: item.packageid,
                        package_num: item.smp_medicine_count,
                        data: this._getMedicenList(item.medicine_list)
                    }
                    medicine_num += item.medicine_list.length
                    goods_items.push(packageMedicine)
                })
            }
            if (isNotEmpty(data.scheduled_days_item)) {
                send_info = {
                    button_items: data.scheduled_days_item.buttons,
                    desc: data.scheduled_days_item.desc,
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
                shopping_remark: data.shopping_remark,
                prescription_audit: '',
                order_desc: '',
                shipping_name: data.traffic_name,
                shipping_no: data.trafficno,
                logistics_icon: data.traffic_icon,
                platform_yh_price: data.plat_coupon_price,
                invoice_type: data.dict_invoice_type,
                invoice_title: data.invoice_applicant,
                invoice_no: data.invoiceno,
                invoice_bool_etax: data.invoice_bool_etax,
                invoice_image: data.invoice_image,
                invoice_pdf: data.invoice_pdf,

                send_info: send_info,
                medicineCount:data.medicineCount,
                medicineKindsCount:data.store_medicineid_count,
                goods_items: goods_items,
                button_items: data.buttons,
                order_status_items: order_status_items,
                goods_count: medicine_num,

                phone_prompt: data.phone_prompt,
                phone_show_type: data.phone_show_type,
                rx_status_name: safeObj(data.rx_status_item),
                medicine_prescription: safeObj(data.medicine_prescription),
                other: safeObj(data.other),

            }
        }
    }

    /** 药品数组处理 */
    _getMedicenList(array) {
        let medicines = []
        array.forEach((item, index)=> {
            medicines.push({
                order_goods_no: item.medicine_orderno,
                shop_goods_id: item.store_medicineid,
                title: item.medicine_name,
                standard: item.standard,
                img_url: item.intro_image,
                prescription: item.is_prescription,
                price: item.unit_price,
                quantity: item.qty,
                package_name: item.package_name,
                PrescriptionType: this.convertPrescriptionType(item.dict_medicine_type + ''),
                period_to_Date:  item.periodto,//有效期
            });
        })

        return medicines
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
        let model = new YFWWDOrderDetailModel();
        let ModeData = model.setModelData(array)
        return ModeData;

    }
}
