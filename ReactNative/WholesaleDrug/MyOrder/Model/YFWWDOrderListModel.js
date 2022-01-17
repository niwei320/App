import React from 'react';
import {isNotEmpty, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDOrderListModel {

    constructor(props){

    }
    setModelData(data){
        if (isNotEmpty(data)) {
            let data_items = [];
                if (isNotEmpty(data.dataList)) {
                    data.dataList.forEach((item,index)=> {
                        let goods_items = [];
                        if (isNotEmpty(item.medicineList)&&item.medicineList.length>0) {
                            let noPackageMedicine = {
                                package_type: -1,
                                medicine_count: item.medicineList.length,
                                data: this._getGoodsModel(item.medicineList)
                            }
                            goods_items.push(noPackageMedicine)
                        }
                        if (isNotEmpty(item.packmedicine_list)&&item.packmedicine_list.length>0) {
                            item.packmedicine_list.forEach((item, index) => {
                                let packageMedicine = {
                                    package_type: item.package_type,
                                    package_name: item.smp_name,
                                    package_id: item.packageid,
                                    package_num: item.smp_medicine_count,
                                    data: this._getGoodsModel(item.medicine_list)
                                }
                                goods_items.push(packageMedicine)
                            })
                        }
                        data_items.push({
                            order_no:item.orderno,
                            shop_id:item.storeid,
                            shop_title:safeObj(item.title),
                            order_total:item.total_price,
                            status_id:'',
                            status_name:safeObj(item.statusName),
                            prescription_audit:"",
                            goods_count:item.medicineCount,
                            goods_kinds_count:item.store_medicine_count,
                            goods_items:goods_items,
                            button_items:item.buttons,
                            send_info:{
                                desc:item.scheduled_days_item.desc,
                                button_items:item.scheduled_days_item.buttons,
                            },
                            shipping_price:item.shipping_total,
                            package_price:item.packaging_total,

                            isSelect:true
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
                    order_goods_no:gooditem.medicine_orderno,
                    shop_goods_id:gooditem.store_medicineid,
                    title:gooditem.medicine_name,
                    standard:gooditem.standard,
                    img_url:gooditem.intro_image,
                    prescription:gooditem.dict_bool_prescription,
                    price:gooditem.unit_price,
                    quantity:gooditem.qty,
                    package_name:gooditem.package_name,
                    PrescriptionType:this.convertPrescriptionType(gooditem.dict_medicine_type+'')
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
        let model = new YFWWDOrderListModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}