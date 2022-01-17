import React from 'react';
import {isNotEmpty, safeObj, safeArray, safe, isArray} from "../../../../PublicModule/Util/YFWPublicFunction";

export default class YFWOrderDetailModel {

    setModelData(data) {

        if (isNotEmpty(data)) {
            let goods_items = [];
            let order_status_items = [];
            let medicine_num = 0
            let send_info = {}
            if (isNotEmpty(data.statusList) && isArray(data.statusList)) {
                data.statusList.forEach((item, index)=> {
                    order_status_items.push({
                        name: safe(item.dict_order_status_name),
                        datetime: safe(item.create_time),
                        desc: safe(item.description),
                        status: safeObj(item.dict_order_status)
                    });
                })
            }
            if (isNotEmpty(data.medicineList) && isArray(data.medicineList) && data.medicineList.length>0) {
                let noPackageMedicine = {
                    package_type: -1,
                    medicine_count: data.medicineList.length,
                    data: this._getMedicenList(data.medicineList)
                }
                medicine_num = data.medicineList.length
                goods_items.push(noPackageMedicine)
            }
            if (isNotEmpty(data.packmedicine_list) && isArray(data.packmedicine_list) && data.packmedicine_list.length>0) {
                data.packmedicine_list.forEach((item, index) => {
                    let packageMedicine = {
                        package_type: safe(item.package_type),
                        package_name: safe(item.smp_name),
                        package_id: safe(item.packageid),
                        package_num: safe(item.smp_medicine_count),
                        data: this._getMedicenList(safeArray(item.medicine_list))
                    }
                    medicine_num += safeArray(item.medicine_list).length
                    goods_items.push(packageMedicine)
                })
            }
            if (isNotEmpty(data.scheduled_days_item)) {
                send_info = {
                    button_items: safeArray(data.scheduled_days_item.buttons),
                    desc: safe(data.scheduled_days_item.desc),
                }
            }
            if (parseInt(data.phone_show_groupbuy_type) == 1) {//拼团详情
                data.buttons = safeArray(data.buttons)
                data.buttons.unshift({
                    value:'group_booking',
                    text:'拼团详情',
                    navigationParams:{
                        type:'get_h5',
                        name:'拼团详情',
                        from:'group_booking',
                        value:safe(data.phone_show_groupbuy_url),
                        isHiddenShare:parseInt(data.dict_bool_groupbuy_head) != 1,//不是团长的 需要隐藏分享按钮
                        share: safe(data.phone_show_groupbuy_infourl),
                        shareTitle: safe(data.phone_show_groupbuy_title),
                        shareContent: safe(data.phone_show_groupbuy_content),
                        shareImage:safe(data.phone_show_groupbuy_image)
                    }
                })
            }

            return {
                order_no: safe(data.orderno),
                shop_id: safe(data.storeid),
                shop_title: safe(data.title),
                shop_phone: safe(data.store_phone),
                order_total: safe(data.total_price),
                goods_total: safe(data.medicine_total),
                shipping_price: safe(data.shipping_total),
                package_price: safe(data.packaging_total),
                update_price: safe(data.update_price),
                update_price_desc: safe(data.update_price_desc),
                coupon_price: safe(data.use_coupon_price),
                package_name: safe(data.packaging_method),
                use_point: safeObj(data.use_point) * 100,//1积分1分钱
                use_point_price: safeObj(data.use_point),
                status_id: safe(data.dict_order_status),
                status_name: safe(data.dict_order_status_name),
                shopping_name: safe(data.shopping_name),
                shopping_mobile: safe(data.shopping_mobile),
                shopping_address: safe(data.shopping_address),
                shopping_remark: safe(data.shopping_remark),
                prescription_audit: '',
                order_desc: '',
                shipping_name: safe(data.traffic_name),
                shipping_no: safe(data.trafficno),
                logistics_icon: safe(data.traffic_icon),
                platform_yh_price: safe(data.plat_coupon_price),
                invoice_type: safe(data.dict_invoice_type),
                invoice_title: safe(data.invoice_applicant),
                invoice_showname: safe(data.invoice_showname),
                invoice_info: safeObj(data.invoice_info),
                invoice_no: safe(data.invoiceno),

                send_info: send_info,
                goods_items: goods_items,
                button_items: data.buttons,
                order_status_items: order_status_items,
                goods_count: medicine_num,

                phone_prompt: safe(data.phone_prompt),
                phone_show_type: safe(data.phone_show_type),
                dict_advisory_notice: safe(data.dict_advisory_notice),
                dict_sckf_off:safe(data.dict_sckf_off),
                rx_status_name: safeObj(data.rx_status_item),
                medicine_prescription: safeObj(data.medicine_prescription),
                other: safeObj(data.other),
                pickupCode:safe(data.selflift_code),
                end_time:safe(data.selflift_datetime),
                shop_address:safe(data.store_address),
                shop_lat:safeObj(data.lat),
                shop_lng:safeObj(data.lng),
                shipping_method:safe(data.shipping_method),
                plan_send_time:safe(data.plan_send_time),
                delivery_name:safe(data.delivery_name),
                delivery_mobile:safe(data.delivery_mobile),
                advisory_link:safe(data.advisory_link),
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
        let model = new YFWOrderDetailModel();
        let ModeData = model.setModelData(array)
        return ModeData;

    }
}