import React from 'react';
import {isNotEmpty, RECEIVE_PROTOCOL_HTML, isMapEmpty, safe, safeObj} from "../../../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../../../Utils/ConvertUtils";
import YFWUserInfoManager from '../../../../Utils/YFWUserInfoManager'

export default class YFWOrderDetailViewModel {
    static getModelArray(data) {
        let model = new YFWOrderDetailViewModel;
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

            let remark_invoice_info = this._orderInvoiceInfo(data)
            // if(remark_invoice_info.header||remark_invoice_info.items.length>0)
            datasource.push(remark_invoice_info)

            let pickupInfo = this._orderPickupCodeInfo(data)
            if (isNotEmpty(pickupInfo)) {
                datasource.push(pickupInfo)
            }
            let deliveryInfo = this._orderSameCityDeliveryInfo(data)
            if (isNotEmpty(deliveryInfo)) {
                datasource.push(deliveryInfo)
            }

            let order_price_info = this._orderDeatilPriceInfo(data)
            datasource.push(order_price_info)

            let order_tatus_info = this._orderDeatilDateInfo(data)
            datasource.push(order_tatus_info)

            let order_contact_info = this._orderDeatilPlatformContactInfo(data)
            datasource.push(order_contact_info)

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
        let order_status_icon = require('../../../../../img/order_status_icon_success.png')
        let order_status_title = data.status_name;

        if(data.status_name === '交易完成') {

            order_status_icon = require('../../../../../img/order_status_icon_success.png')

        } else if(data.status_name === '配送中') {

            order_status_icon = require('../../../../../img/order_status_icon_send.png')

        } else if(data.status_name === '已签收') {

            order_status_icon = require('../../../../../img/order_status_icon_receive.png')

        } else if(data.status_name === '交易失败' || data.status_name === '交易取消' || data.status_name === '交易关闭') {

            order_status_icon = require('../../../../../img/order_status_icon_failed.png')

        }else if(data.status_name === '申请退货' || data.status_name === '申请退款' || data.status_name === '同意退货'
            || data.status_name === '退货发出'|| data.status_name === '收到退货' ||data.status_name === '退货/款完成'
            || data.status_name === '商家拒绝退货/款' || data.status_name === '退货/款已取消'
            || data.status_name === '退款已取消'|| data.status_name === '商家拒绝退款' || data.status_name === '正在退款') {

                order_status_icon = require('../../../../../img/order_status_icon_return.png')

        }else {
            if(data.status_name === '暂未付款' ) {
                order_status_title = '等待买家付款'
            }else if(data.status_name === '等待发货' ) {
                order_status_title = '等待商家发货'
            }
            order_status_icon = require('../../../../../img/order_status_icon_wait.png')
        }
        let statuImageSources = []
        let sub_desc_title = ''
        let showAddress = false
        if (data.status_name === '等待自提' || data.shipping_method === '门店自提') {
            if (data.status_name === '等待自提' && isNotEmpty(data.end_time)) {
                sub_desc_title = '请于'+ data.end_time + '前到店自提'
            }
            statuImageSources = [
                {
                    image:require('../../../../../img/icon_pickup_1.png'),
                    width:30,
                    height:33,
                    marginTop:20,
                    desc:'订单付款'
                },
                {
                    image:require('../../../../../img/icon_pickup_2.png'),
                    width:33,
                    height:33,
                    marginTop:20,
                    desc:'前往门店'
                },
                {
                    image:require('../../../../../img/icon_pickup_3.png'),
                    width:30,
                    height:33,
                    marginTop:20,
                    desc:'凭码取货'
                },
            ]
        } else if (data.status_name === '等待配送' || data.shipping_method === '同城配送') {
            if (data.status_name === '配送中' && isNotEmpty(data.plan_send_time)) {
                sub_desc_title = '预计' + data.plan_send_time + '送达'
            }
            showAddress = true
            statuImageSources = [
                {
                    image:require('../../../../../img/icon_pickup_1.png'),
                    width:30,
                    height:33,
                    marginTop:6,
                    desc:'订单付款'
                },
                {
                    image:require('../../../../../img/icon_pickup_2.png'),
                    width:33,
                    height:33,
                    marginTop:6,
                    desc:'门店配送'
                },
                {
                    image:require('../../../../../img/icon_pickup_4.png'),
                    width:30,
                    height:33,
                    marginTop:6,
                    desc:'凭码签收',
                    showExplain:true,
                    explainText:'为了保障您的权益，请在配送员送货上门再出示签收码',
                },
            ]
        }
        let showLogisticsStatus = true
        if(data.status_name === '交易失败' || data.status_name === '交易取消' || data.status_name === '交易关闭' || data.status_name === '暂未付款' ) {
            showLogisticsStatus = false
        }

        let logistics_icon = data.logistics_icon
        let logistics_name = data.shipping_name.length > 0 ? data.shipping_name+' 单号：' : showLogisticsStatus?'暂无快递信息':''
        let logistics_detail = data.shipping_name.length > 0 ? true : false
        let logistics_number = data.shipping_no
        let contact_icon = require('../../../../../img/order_detail_location.png')
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
            sub_desc_title: sub_desc_title,
            statuImageSources: statuImageSources,
            showAddress: showAddress,
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

    /** 商店、商品信息、商家留言/电话 */
    _orderDeatilStoreGoodsInfo(data) {
        let store_id = data.shop_id
        let store_name = data.shop_title
        let store_phone = data.shop_phone
        let goods_items = data.goods_items
        let phone_show_type = data.phone_show_type
        let dict_advisory_notice = data.dict_advisory_notice
        let advisory_link = data.advisory_link

        return {
            key: 'order_detail_goods',
            cell: 'order_detail_goods',
            store_id: store_id,
            store_name: store_name,
            store_phone: store_phone,
            goods_items: goods_items,
            phone_show_type: phone_show_type,
            dict_advisory_notice: dict_advisory_notice,
            advisory_link: advisory_link,
            data: data
        }
    }
    /** 商城客服 */
    _orderDeatilPlatformContactInfo(data) {
        let store_id = data.shop_id
        let store_name = data.shop_title
        let store_phone = data.shop_phone
        let goods_items = data.goods_items
        let phone_show_type = data.phone_show_type
        let dict_sckf_off = data.dict_sckf_off
        let advisory_link = data.advisory_link

        return {
            key: 'order_detail_platform_contact',
            cell: 'order_detail_platform_contact',
            store_id: store_id,
            store_name: store_name,
            store_phone: store_phone,
            goods_items: goods_items,
            phone_show_type: phone_show_type,
            dict_sckf_off: dict_sckf_off,
            advisory_link: advisory_link,
            data: data
        }
    }

    /** 买家备注、发票信息 */
    _orderInvoiceInfo(data) {
        return {
            cell: 'order_invoice_normal',
            title: data.invoice_showname,
            isClick:isNotEmpty(data.invoice_title),
            info: data.invoice_info,
        }
    }
    /** 自提信息 */
    _orderPickupCodeInfo(data) {
        let pickupInfo = null
        if (data.status_name === '等待自提') {
            pickupInfo = {
                shipping_method: data.shipping_method,
                end_time: data.end_time,
                shop_address:data.shop_address,
                shop_lat:data.shop_lat,
                shop_lng:data.shop_lng,
            }
            return {
                key: 'order_deatil_pickup',
                cell: 'order_detail_pickup',
                pickupInfo: pickupInfo,
            }
        }
        return null
    }
    /** 同城配送信息 */
    _orderSameCityDeliveryInfo(data) {
        let deliveryInfo = null
        if (data.status_name === '配送中') {
            deliveryInfo = {
                shipping_method: data.shipping_method,
                plan_send_time: data.plan_send_time,
                delivery_name:data.delivery_name,
                delivery_mobile:data.delivery_mobile,
            }
            return {
                key: 'order_deatil_delivery',
                cell: 'order_deatil_delivery',
                deliveryInfo: deliveryInfo,
            }
        }
        return null
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
            let use_point_price = this._orderDetailNormalModel('积分抵扣:', '-¥'+toDecimal(data.use_point_price));
            use_point_price['isPrice'] = true
            info.push(use_point_price)
        }

        if (data.coupon_price != 0) {
            let coupon_price = this._orderDetailNormalModel('商家优惠券:', '-¥'+toDecimal(data.coupon_price));
            coupon_price['isPrice'] = true
            info.push(coupon_price)
        }

        if (data.platform_yh_price != 0) {
            let platform_yh_price = this._orderDetailNormalModel('商城优惠券:', '-¥'+toDecimal(data.platform_yh_price));
            platform_yh_price['isPrice'] = true
            info.push(platform_yh_price)
        }

        if (data.update_price != 0) {
            let update_price = this._orderDetailNormalModel('商品优惠:', '-¥'+toDecimal(data.update_price));
            update_price['isPrice'] = true
            info.push(update_price)
        }

        let order_tatal = this._orderDetailNormalModel('订单总金额:', '¥'+toDecimal(data.order_total));

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
            rules: '《药房网商城商品验收标准》',
            subtitle: '对货品进行签收',
            url: RECEIVE_PROTOCOL_HTML(),
        }
    }

    /** 普通model */
    _orderDetailNormalModel(title, subtitle) {
        return {
            title: title,
            subtitle: subtitle,
        }
    }
}