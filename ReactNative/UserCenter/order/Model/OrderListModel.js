import React from 'react';
import {isNotEmpty, safeObj, safeArray, safe, isArray} from "../../../PublicModule/Util/YFWPublicFunction";

export default class OrderListModel {

    constructor(props){

    }
    setModelData(data){
        if (isNotEmpty(data)) {
            let data_items = [];
                if (isNotEmpty(data.dataList) && isArray(data.dataList)) {
                    data.dataList.forEach((item,index)=> {
                        let goods_items = [];
                        if (isNotEmpty(item.medicineList) && isArray(item.medicineList) && item.medicineList.length>0) {
                            let noPackageMedicine = {
                                package_type: -1,
                                medicine_count: item.medicineList.length,
                                data: this._getGoodsModel(item.medicineList)
                            }
                            goods_items.push(noPackageMedicine)
                        }
                        if (isNotEmpty(item.packmedicine_list) && isArray(item.packmedicine_list) && item.packmedicine_list.length>0) {
                            item.packmedicine_list.forEach((item, index) => {
                                let packageMedicine = {
                                    package_type: safe(item.package_type),
                                    package_name: safe(item.smp_name),
                                    package_id: safe(item.packageid),
                                    package_num: safe(item.smp_medicine_count),
                                    data: this._getGoodsModel(item.medicine_list)
                                }
                                goods_items.push(packageMedicine)
                            })
                        }
                        if (parseInt(item.phone_show_groupbuy_type) == 1) {//拼团详情
                            item.buttons = safeArray(item.buttons)
                            item.buttons.unshift({
                                value:'group_booking',
                                text:'拼团详情',
                                navigationParams:{
                                    type:'get_h5',
                                    name:'拼团详情',
                                    from:'group_booking',
                                    isHiddenShare:parseInt(item.dict_bool_groupbuy_head) != 1,//不是团长的 需要隐藏分享按钮
                                    value:safe(item.phone_show_groupbuy_url),
                                    share: safe(item.phone_show_groupbuy_infourl),
                                    shareTitle: safe(item.phone_show_groupbuy_title),
                                    shareContent: safe(item.phone_show_groupbuy_content),
                                    shareImage:safe(item.phone_show_groupbuy_image)
                                }
                            })
                        }
                        data_items.push({
                            order_no:item.orderno,
                            shop_id:item.storeid,
                            shop_title:safeObj(item.title),
                            order_total:safeObj(item.total_price),
                            status_id:'',
                            status_name:safeObj(item.statusName),
                            prescription_audit:"",
                            goods_count:safe(item.medicineCount),
                            goods_items:goods_items,
                            button_items:safeArray(item.buttons),
                            send_info:{
                                desc:item.scheduled_days_item.desc,
                                button_items:item.scheduled_days_item.buttons,
                            },
                            shipping_price:safe(item.shipping_total),
                            package_price:safe(item.packaging_total),
                            pickupCode:safe(item.selflift_code),
                            end_time:safe(item.self_timeTo),
                            shop_address:safe(item.address),
                            shop_lat:safe(item.lat),
                            shop_lng:safe(item.lng),
                            shipping_method:safe(item.shipping_method),
                            plan_send_time:safe(item.plan_send_time),
                            delivery_mobile:safe(item.delivery_mobile),
                            isSelect:true,
                            dict_order_sub_type: safe(item.dict_order_sub_type), // 2 O2O订单
                            shipping_method_name: safe(item.shipping_method_name),
                        })
                    })
                }
                return data_items;
        }
    }

    _getGoodsModel(array){
        let medicines = [];
            array.forEach((gooditem,index)=> {
                medicines.push({
                    order_goods_no:safe(gooditem.medicine_orderno),
                    shop_goods_id:safe(gooditem.store_medicineid),
                    title:safe(gooditem.medicine_name),
                    standard:safe(gooditem.standard),
                    img_url:safe(gooditem.intro_image),
                    prescription:safe(gooditem.dict_bool_prescription),
                    price:safe(gooditem.unit_price),
                    quantity:safe(gooditem.qty),
                    package_name:safe(gooditem.package_name),
                    PrescriptionType:this.convertPrescriptionType(safe(gooditem.dict_medicine_type))
                });
        });
        return medicines;
    }

    /**
     * 处方、单双轨字段转换
     * @param type
     */
    convertPrescriptionType(type){
        if(type+'' === '3'){
            return '1'//单轨
        }
        //TCP 和HTTP 双轨都是2
        return type+""
    }

    static getModelArray(array){
        let model = new OrderListModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}