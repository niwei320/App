import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import YFWO2OOrderDetailView from "./YFWO2OOrderDetailView";
import {
    isMapEmpty,
    isNotEmpty,
    safe,
    safeArray,
    safeNumber
} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";

export default class YFWO2OOrderDetailModel extends Component {

    static getModelArray(data) {
        let model = new YFWO2OOrderDetailModel;
        let modelData = model.setModelData(data);

        return modelData;
    }

    setModelData(data) {
        let model = {}
        if(isNotEmpty(data)){

            let rxData = ''
            if(data.rx_status_item!=''&&!isMapEmpty(data.rx_status_item)){
                rxData = {
                    title : data.rx_status_item.value,
                    content : data.rx_status_item.rx_prompt,
                    type : data.rx_status_item.type,
                    inquiry_status : data.rx_status_item.inquiry_status,
                    isClick: true
                }
            }

            let buttonsData = []
            safeArray(data.buttons).map((item,index)=>{
                buttonsData.push({
                    image:item.image,
                    text:item.text,
                    value:item.value,
                    color:item.color,
                })
            })
            let actionData = {
                dict_order_status_name_title:safe(data.dict_order_status_name_title),
                dict_order_status_name_reason:safe(data.dict_order_status_name_reason),
                buttonsData:buttonsData
            }

            let goodsArray = []
            safeArray(data.medicineList).map((item,index)=>{
                goodsArray.push({
                    store_medicineid:safe(item.store_medicineid),
                    intro_image:safe(item.intro_image),
                    dict_medicine_type:this.convertPrescriptionType(item.dict_medicine_type + ''),
                    medicine_name:safe(item.medicine_name),
                    standard:safe(item.standard),
                    unit_price:safe(item.unit_price),
                    qty:safe(item.qty),
                })
            })

            let goodsInfoData = {
                goodsArray:goodsArray,
                title:safe(data.title),
                storeid:safe(data.storeid),
                medicine_total:data.medicine_total, //商品总价+
                shipping_total:data.shipping_total, //配送费+
                packaging_total:data.packaging_total, //包装费+

                use_point:data.use_point, //积分抵扣-
                use_coupon_price:data.use_coupon_price, //商家优惠券-
                plat_coupon_price:data.plat_coupon_price, //商城优惠券-
                update_price:data.update_price, //商品优惠-

                total_price:safe(data.total_price), //订单总金额

                invoice_showname:safe(data.invoice_showname),
                invoice_title:data.invoice_title,    //isNotEmpty(data.invoice_title) true 可点击
                invoice_info:data.invoice_info,
            }

            let deliveryData = {
                expected_delivery:safe(data.expected_delivery),
                shipping_method:safe(data.shipping_method),
                shopping_address:safe(data.shopping_address),
                shopping_name:safe(data.shopping_name),
                shopping_mobile:safe(data.shopping_mobile),
            }

            let orderInfoData = {
                orderno:safe(data.orderno),
                payment_type:safe(data.payment_type),
                create_time:safe(data.create_time),
                shopping_remark:safe(data.shopping_remark),
            }

            model = {
                rxData:rxData,
                actionData: actionData,
                goodsInfoData:goodsInfoData,
                deliveryData:deliveryData,
                orderInfoData:orderInfoData,

                orderNo:data.orderno,//订单id
                storeid:data.storeid,//店铺id
                shop_title:safe(data.title),//店铺名称
                shippingMethod:data.shipping_method,//配送方式：‘门店自提’‘商家配送’
                storePhoneNumber:safe(data.o2o_store_phone),//店铺电话
                is_show_map:data.is_show_map, //是否需要显示地图
                statusName:safe(data.dict_order_status_name), //订单状态大标题
                dict_order_status_name_title:safe(data.dict_order_status_name_title),//订单状态副标题
                waitPayTime:safeNumber(data.waitpaytime),//订单状态倒计时
                waitPayTime_text:safe(data.waitpaytime_text),//地图气泡倒计时描述
                shipping_address_lat:data.shipping_address_lat,//用户配送地址 经纬度
                shipping_address_lng:data.shipping_address_lng,//用户配送地址 经纬度
                store_lat:data.lat,//店铺 经纬度
                store_lng:data.lng,//店铺 经纬度
                storelogourl:safe(data.storelogourl),//店铺头像
                dict_order_status_name_reason:safe(data.dict_order_status_name_reason),//订单状态理由
                reminderMsg:safe(data.dict_order_status_name_float),//页面提示
                store_address:safe(data.store_address),//店铺地址
                o2o_business_hours:safe(data.o2o_business_hours),//店铺营业时间
                selflift_code:safe(data.selflift_code),//自提码
                selflift_datetime:safe(data.selflift_datetime),//自提时间
                is_show_medicine_saff:safe(data.is_show_medicine_saff),//是否显示用药安全
                shopping_mobile:safe(data.shopping_mobile),//预留电话

                buttonsData:buttonsData,//按钮数据

            }
        }
        return model
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
}
