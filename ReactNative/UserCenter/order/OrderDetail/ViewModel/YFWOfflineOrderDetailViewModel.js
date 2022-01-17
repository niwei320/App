import React, {Component} from 'react';
import {isMapEmpty, isNotEmpty, RECEIVE_PROTOCOL_HTML} from "../../../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../../../Utils/ConvertUtils";
import YFWUserInfoManager from "../../../../Utils/YFWUserInfoManager";

export default class YFWOfflineOrderDetailViewModel extends Component {
    static getModelArray(data) {
        let model = new YFWOfflineOrderDetailViewModel;
        return model.setModelData(data);
    }

    setModelData(data) {
        let header = {}
        let datasource = []

        if (isNotEmpty(data)) {
            let headerInfo = this._orderDeatilHeaderInfo(data)
            datasource.push(headerInfo)

            let order_price_info = this._orderDeatilPriceInfo(data)
            datasource.push(order_price_info)

            let order_tatus_info = this._orderDeatilDateInfo(data)
            datasource.push(order_tatus_info)

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

        }else if(data.status_name === '交易失败' || data.status_name === '交易取消' || data.status_name === '交易关闭') {

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

        let store_id = data.shop_id
        let store_name = data.shop_title
        let store_phone = data.shop_phone
        let goods_items = data.goods_items
        let phone_show_type = data.phone_show_type

        return {
            key: 'order_deatil_header',
            cell: 'offline_order_detail_goods_header',
            order_status_icon: order_status_icon,
            order_status_title: order_status_title,
            store_id: store_id,
            store_name: store_name,
            store_phone: store_phone,
            goods_items: goods_items,
            phone_show_type: phone_show_type,
            data: data
        }
    }


    /** 订单价格信息 */
    _orderDeatilPriceInfo(data) {
        let info = []

        let goods_total_amount = this._orderDetailNormalModel('商品总价:', '¥'+toDecimal(data.shopMedicineTotal));
        goods_total_amount['font_weight'] = 'bold'
        goods_total_amount['isPrice'] = true
        info.push(goods_total_amount)

        if (data.couponPrice != 0) {
            let logistics_price = this._orderDetailNormalModel('联合会员首单立减:', '¥'+toDecimal(data.couponPrice));
            logistics_price['isPrice'] = true
            info.push(logistics_price)
        }

        if (data.shopDiscountMoney != 0) {
            let logistics_price = this._orderDetailNormalModel('店铺优惠:', '¥'+toDecimal(data.shopDiscountMoney));
            logistics_price['isPrice'] = true
            info.push(logistics_price)
        }

        if (data.discountMoney != 0) {
            let logistics_price = this._orderDetailNormalModel('会员优惠:', '¥'+toDecimal(data.discountMoney));
            logistics_price['isPrice'] = true
            info.push(logistics_price)
        }

        if (data.reductionMoney != 0) {
            let package_price = this._orderDetailNormalModel('订单调减:', '¥-'+toDecimal(data.reductionMoney));
            package_price['isPrice'] = true
            info.push(package_price)
        }

        if (data.medicineDiscountMoney != 0) {
            let package_price = this._orderDetailNormalModel('商品调减:', '¥-'+toDecimal(data.medicineDiscountMoney));
            package_price['isPrice'] = true
            info.push(package_price)
        }

        if (data.pointsDeductionTotal != 0) {
            let use_point_price = this._orderDetailNormalModel('积分抵扣:', '¥-'+toDecimal(data.pointsDeductionTotal));
            use_point_price['isPrice'] = true
            info.push(use_point_price)
        }

        if (data.payMoney != 0) {
            let coupon_price = this._orderDetailNormalModel('实收:', '¥'+toDecimal(data.payMoney));
            coupon_price['isPrice'] = true
            info.push(coupon_price)
        }

        if (data.returnMoney != 0) {
            let platform_yh_price = this._orderDetailNormalModel('找零:', '¥'+toDecimal(data.returnMoney));
            platform_yh_price['isPrice'] = true
            info.push(platform_yh_price)
        }

        let order_tatal = this._orderDetailNormalModel('应收:', '¥'+toDecimal(data.orderMoney));

        return {
            key: 'order_detail_price',
            cell: 'order_detail_normal',
            items: info,
            footer: order_tatal,
        }
    }

    _orderDeatilDateInfo(data) {
        let info = []

        let order_number = this._orderDetailNormalModel('销售单号:', data.order_no);
        info.push(order_number)
        let create_time = this._orderDetailNormalModel('下单时间:', data.createTime);
        info.push(create_time)
        let sellAccountName = this._orderDetailNormalModel('营业员:', data.sellAccountName);
        info.push(sellAccountName)
        let payMent = this._orderDetailNormalModel('支付方式:', data.payMent);
        info.push(payMent)
        if (isNotEmpty(data.remarks)) {
            let remarks = this._orderDetailNormalModel('备注:', data.remarks);
            info.push(remarks)
        }

        return {
            key: 'order_detail_time',
            cell: 'order_detail_normal',
            items: info,
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