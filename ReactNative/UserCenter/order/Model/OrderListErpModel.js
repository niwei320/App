import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import {isNotEmpty, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";

export default class OrderListErpModel {

    constructor(props){

    }

    setModelData(data){
        if (isNotEmpty(data)) {
            let data_items = [];
            if (isNotEmpty(data.dataList)) {
                data.dataList.forEach((item,index)=> {
                    let goods_items = [];
                    if (isNotEmpty(item.detailList)&&item.detailList.length>0) {
                        let noPackageMedicine = {
                            package_type: -1,
                            medicine_count: item.detailList.length,
                            data: this._getGoodsModel(item.detailList)
                        }
                        goods_items.push(noPackageMedicine)
                    }
                    let buttons = [];
                    if (isNotEmpty(item.buttons)) {
                        item.buttons.forEach((button, index) => {
                            buttons.push({
                                value:button.value,
                                type:button.type,
                                waitpaytime:safeObj(button.countDownTime),
                                order_total:safeObj(button.OrderMoney),
                            })
                        })
                    }
                    data_items.push({
                        order_no:item.OrderNo,
                        shop_id:item.ShopId,
                        shop_title:safeObj(item.shopTitle),
                        order_total:item.OrderMoney,
                        status_id:'',
                        prescription_audit:"",
                        goods_count:item.detailList.length,
                        goods_items:goods_items,

                        status_name:safeObj(item.OrderStatusName),
                        button_items:buttons,
                        isSelect:true,


                        createTime:item.CreateTime,
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
                order_goods_no:gooditem.OrderNo ,
                shop_goods_id:gooditem.store_medicineid,
                title:gooditem.NameCN ,
                standard:gooditem.Standard ,
                img_url:gooditem.MedicineIntorImage ,
                prescription:gooditem.dict_bool_prescription,
                price:gooditem.UnitPrice,
                quantity:gooditem.Amount,
                // package_name:gooditem.package_name,
                PrescriptionType:this.convertPrescriptionType(gooditem.Prescription+'')
            });
        });
        return medicines;
    }

    convertPrescriptionType(type){
        if(type+'' === '1'){
            return '3'
        }
        return type+""
    }

    static getModelArray(array){
        let model = new OrderListErpModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }
}
