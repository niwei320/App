import React from 'react';
import {isNotEmpty, RECEIVE_PROTOCOL_HTML, isMapEmpty, safe, safeObj, RECEIVE_PROTOCOL_HTML_WD} from "../../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../../Utils/ConvertUtils";
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager'
import {YFWImageConst} from "../../Images/YFWImageConst";

export default class YFWWDOrderDetailViewModel {
    static getModelArray(data) {
        let model = new YFWWDOrderDetailViewModel;
        let modelData = model.setModelData(data);

        return modelData;
    }

    setModelData(data) {
        let header = {}
        let datasource = []

        if (isNotEmpty(data)) {
            let headerInfo = this._orderDeatilHeaderInfo(data)
            datasource.push(headerInfo)

            //电子处方信息
            if(data.rx_status_name!=''&&!isMapEmpty(data.rx_status_name)){
                datasource.push({
                    key: 'order_detail_rx_info',
                    cell: 'order_detail_rx_info',
                    data: {},
                    title : data.rx_status_name.value,
                    content : data.rx_status_name.rx_prompt,
                    type : data.rx_status_name.image_type,
                    isClick: true
                })
            }

            let store_goods_info = this._orderDeatilStoreGoodsInfo(data)
            datasource.push(store_goods_info)

            let remark_invoice_info = this._orderDeatilMarkAndInvoiceInfo(data)
            // if(remark_invoice_info.header||remark_invoice_info.items.length>0)
            datasource.push(remark_invoice_info)

            let order_price_info = this._orderDeatilPriceInfo(data)
            datasource.push(order_price_info)

            let order_tatus_info = this._orderDeatilDateInfo(data)
            datasource.push(order_tatus_info)

            let order_recive_rules = this._orderDeatilReciveInfo(data)
            datasource.push(order_recive_rules)
        }

        return {
            datasource: datasource,
            bottomButtons: data.button_items,
        };
    }

    /** 订单状态、物流、收货人信息 */
    _orderDeatilHeaderInfo(data) {
        let order_status_icon = YFWImageConst.Icon_status_icon_success
        let order_status_title = data.status_name;

        if(data.status_name === '交易完成') {

            order_status_icon = YFWImageConst.Icon_status_icon_success

        }else if(data.status_name === '交易失败' || data.status_name === '交易取消' || data.status_name === '交易关闭') {

            order_status_icon = YFWImageConst.Icon_status_icon_failed

        }else if(data.status_name === '申请退货' || data.status_name === '申请退款' || data.status_name === '同意退货'
            || data.status_name === '退货发出'|| data.status_name === '收到退货' ||data.status_name === '退货/款完成'
            || data.status_name === '商家拒绝退货/款' || data.status_name === '退货/款已取消'
            || data.status_name === '退款已取消'|| data.status_name === '商家拒绝退款' || data.status_name === '正在退款') {

                order_status_icon = YFWImageConst.Icon_status_icon_return

        }else {
            if(data.status_name === '暂未付款' ) {
                order_status_title = '等待买家付款'
            }else if(data.status_name === '等待发货' ) {
                order_status_title = '等待商家发货'
            }
            order_status_icon = YFWImageConst.Icon_status_icon_wait
        }
        let showLogisticsStatus = true
        if(data.status_name === '交易失败' || data.status_name === '交易取消' || data.status_name === '交易关闭' || data.status_name === '暂未付款' ) {
            showLogisticsStatus = false
        }

        let logistics_icon = data.logistics_icon
        let logistics_name = data.shipping_name.length > 0 ? data.shipping_name+' 单号：' : showLogisticsStatus?'暂无快递信息':''
        let logistics_detail = data.shipping_name.length > 0 ? true : false
        let logistics_number = data.shipping_no
        let contact_icon = YFWImageConst.Icon_address
        let contact_name = data.shopping_name
        let contact_mobile = data.shopping_mobile
        let contact_address = data.shopping_address
        let send_info = data.send_info
        let img_url = data.goods_items[0].data[0].img_url
        if(send_info.desc&&send_info.desc.indexOf('发货周期') != -1){
            send_info['title'] = send_info.desc.substr(0,5)
            send_info['subtitle'] = send_info.desc.substr(5,send_info.desc.length-5)
        }else {
            send_info['subtitle'] = send_info.desc
        }

        return {
            key: 'order_deatil_header',
            cell: 'order_detail_contact',
            order_status_icon: order_status_icon,
            order_status_title: order_status_title,
            order_no: data.order_no,
            logistics_icon: logistics_icon,
            logistics_name: logistics_name,
            logistics_number: logistics_number,
            logistics_detail: logistics_detail,
            contact_icon: contact_icon,
            contact_name: contact_name,
            contact_mobile: contact_mobile,
            contact_address: contact_address,
            send_notifiaction: send_info,
            img_url: img_url
        }
    }

    /** 商店、商品信息、客服 */
    _orderDeatilStoreGoodsInfo(data) {
        let store_id = data.shop_id
        let store_name = data.shop_title
        let store_phone = data.shop_phone
        let goods_items = data.goods_items
        let phone_show_type = data.phone_show_type

        return {
            key: 'order_detail_goods',
            cell: 'order_detail_goods',
            store_id: store_id,
            store_name: store_name,
            store_phone: store_phone,
            goods_items: goods_items,
            phone_show_type: phone_show_type,
            data: data
        }
    }

    /** 买家备注、发票信息 */
    _orderDeatilMarkAndInvoiceInfo(data) {
        let info = []
        let textAlign = 'left'
        let isClickable = false
        let invoiceUrls = {}

        /*if(isNotEmpty(data.update_price_desc)) {
            let order_remark = this._orderDetailNormalModel('买家备注:', data.update_price_desc);
            order_remark['textAlign'] = textAlign
            header = order_remark
        }*/

        if (isNotEmpty(data.invoice_title)) {
            if(data.invoice_bool_etax==1 && isNotEmpty(data.invoice_image)){
                isClickable = true
                invoiceUrls.image_url = data.invoice_image
                invoiceUrls.pdf_url = data.invoice_pdf
            }

            let isEtax = data.invoice_bool_etax==1 ? '电子发票':'纸质发票'
            let invoice_bool_etax = this._orderDetailNormalModel('发票种类:', isEtax);
            invoice_bool_etax['textAlign'] = textAlign
            invoice_bool_etax['isClickable'] = isClickable
            invoice_bool_etax['invoiceUrls'] = invoiceUrls
            info.push(invoice_bool_etax)

            let type = data.invoice_type==1 ? '增值税普通发票':'增值税专用发票'
            let invoice_type = this._orderDetailNormalModel('发票类型:', type);
            invoice_type['textAlign'] = textAlign
            info.push(invoice_type)

            let invoice_name = this._orderDetailNormalModel('发票抬头:', data.invoice_title);
            invoice_name['textAlign'] = textAlign
            info.push(invoice_name)
        }else{
            let invoice_type = this._orderDetailNormalModel('发票类型:', "无需发票");
            invoice_type['textAlign'] = textAlign
            info.push(invoice_type)
        }

        return {
            key: 'order_detail_remark',
            cell: 'order_detail_normal',
            items: info,
        }
    }

    /** 订单价格信息 */
    _orderDeatilPriceInfo(data) {
        let info = []

        let goods_total_amount = this._orderDetailNormalModel('商品总价:', '¥'+toDecimal(data.goods_total));
        goods_total_amount['font_weight'] = 'bold'
        goods_total_amount['isPrice'] = true
        info.push(goods_total_amount)

        if (data.shipping_price != 0) {
            let logistics_price = this._orderDetailNormalModel('配送费:', '¥'+toDecimal(data.shipping_price));
            logistics_price['isPrice'] = true
            info.push(logistics_price)
        }

        if (data.package_price != 0) {
            let package_price = this._orderDetailNormalModel('包装费:', '¥'+toDecimal(data.package_price));
            package_price['isPrice'] = true
            info.push(package_price)
        }

        if (data.use_point_price != 0) {
            let use_point_price = this._orderDetailNormalModel('积分抵扣:', '¥-'+toDecimal(data.use_point_price));
            use_point_price['isPrice'] = true
            info.push(use_point_price)
        }

        if (data.coupon_price != 0) {
            let coupon_price = this._orderDetailNormalModel('商家优惠券:', '¥-'+toDecimal(data.coupon_price));
            coupon_price['isPrice'] = true
            info.push(coupon_price)
        }

        if (data.platform_yh_price != 0) {
            let platform_yh_price = this._orderDetailNormalModel('商城优惠券:', '¥-'+toDecimal(data.platform_yh_price));
            platform_yh_price['isPrice'] = true
            info.push(platform_yh_price)
        }

        if (data.update_price != 0) {
            let update_price = this._orderDetailNormalModel('商品优惠:', '¥'+toDecimal(data.update_price));
            update_price['isPrice'] = true
            info.push(update_price)
        }

        let order_tatal = this._orderDetailFooterModel(data.medicineCount, data.medicineKindsCount, '¥'+toDecimal(data.order_total));

        return {
            key: 'order_detail_price',
            cell: 'order_detail_normal',
            items: info,
            footer: order_tatal,
        }
    }

    _orderDeatilDateInfo(data) {
        let info = []

        let order_number = this._orderDetailNormalModel('订单编号:', data.order_no);
        info.push(order_number)

        // 订单状态
        let order_status_items = data.order_status_items
        let userInfo = YFWUserInfoManager.ShareInstance();
        let orderStatusMap =  userInfo.getSystemConfig().orderMap;

        if (isNotEmpty(order_status_items)) {

            order_status_items.forEach((item, index) => {
                let name = isNotEmpty(orderStatusMap)?orderStatusMap[item.status]:item.name
                let time = this._orderDetailNormalModel(name+':', item.datetime);
                if(item.desc && item.desc.length > 0) {
                    if(item.status == 16){
                        time['remark'] = '商家退款(1-2个工作日内到账)' + item.desc
                    }else{
                        time['remark'] = item.desc
                    }
                }
                info.push(time)
            })
        }

        return {
            key: 'order_detail_time',
            cell: 'order_detail_normal',
            items: info,
        }
    }

    /** 验收标准 */
    _orderDeatilReciveInfo(data) {
        return {
            key: 'order_detail_rules',
            cell: 'order_detail_rules',
            title: '请按照',
            rules: '《药房网商城批发订单验收标准》',
            subtitle: '对货品进行签收',
            url: RECEIVE_PROTOCOL_HTML_WD(),
        }
    }

    /** 普通model */
    _orderDetailNormalModel(title, subtitle) {
        return {
            title: title,
            subtitle: subtitle,
        }
    }
    /** 特殊model */
    _orderDetailFooterModel(medicineCount, medicineKindsCount,order_total) {
        return {
            medicineCount: medicineCount,
            medicineKindsCount: medicineKindsCount,
            order_total: order_total,
        }
    }
}
