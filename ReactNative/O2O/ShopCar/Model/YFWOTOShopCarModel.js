import React from 'react';
import {isEmpty, isNotEmpty, safe, safeArray, safeFloatNumber} from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWOTOShopCarModel {

    constructor(props){

    }

    setModelData(data){
        let returnArray = [];
        let notCanSaleArray = []
        if (isNotEmpty(data)) {
            if(isEmpty(data.dataList)){
                data.dataList = []
            }
            data.dataList.forEach((item, index) => {
                let not_sales_desc = item.not_sales_desc
                let medicine = [];
                let normalMedicines = []
                if (isNotEmpty(item.medicine_list)){
                    item.medicine_list.forEach((medicineitem, index) => {
                        normalMedicines.push(
                            {
                                id:medicineitem.id ,
                                shop_goods_id: medicineitem.store_medicineid,
                                medicineid: medicineitem.medicineid,
                                title: medicineitem.medicine_name,
                                standard: medicineitem.standard,
                                img_url: medicineitem.intro_image,
                                prescription: medicineitem.prescription,
                                price: medicineitem.price_real,
                                price_old: medicineitem.price,
                                discount: medicineitem.price_desc,
                                quantity: medicineitem.amount,
                                reserve: medicineitem.reserve,
                                reserve_desc:safe(medicineitem.reserve_desc),
                                lbuy_no: '0',
                                order_no: '0',
                                package_id: '0',
                                type: 'medicine',
                                PrescriptionType:this.convertPrescriptionType(medicineitem.dict_medicine_type+''),
                                shop_id: item.storeid,
                                dict_store_medicine_status:medicineitem.dict_store_medicine_status,
                                is_freepostage:medicineitem.is_freepostage,
                                freepostagecount:medicineitem.freepostagecount,
                                isNotCanSale:isNotEmpty(not_sales_desc)
                            });
                    });
                    medicine.push({
                        type:"medicines",
                        medicines:normalMedicines,
                        shop_id: item.storeid,
                    })
                }

                if (isNotEmpty(item.packmedicine_list)) {
                    item.packmedicine_list.forEach((packmedicine, index) => {
                        let packmedicine1 = [];
                        if (isNotEmpty(packmedicine.medicine_list)) {
                            packmedicine.medicine_list.forEach((medicine1,index1)=>{
                                packmedicine1.push(
                                    {
                                        id: medicine1.id ,
                                        shop_goods_id: medicine1.store_medicineid,
                                        title: medicine1.medicine_name ,
                                        standard: medicine1.standard ,
                                        img_url: medicine1.intro_image ,
                                        prescription: medicine1.prescription ,
                                        price: medicine1.price ,
                                        quantity: medicine1.amount ,
                                        reserve: medicine1.reserve ,
                                        lbuy_no: '0' ,
                                        order_no: '0' ,
                                        package_id: packmedicine.packageid,
                                        PrescriptionType:this.convertPrescriptionType(medicine1.dict_medicine_type+'')
                                    }
                                );
                            })
                        }
                        medicine.push(
                            {
                                id:packmedicine.packageid,
                                package_id: packmedicine.packageid,
                                package_name: packmedicine.smp_name,
                                price: packmedicine.smp_price,
                                price_old: packmedicine.smp_price,
                                discount: packmedicine.price_desc,
                                count: packmedicine.amount,
                                reserve_desc:safe(packmedicine.reserve_desc),
                                type: packmedicine.package_type === 1? "courseOfTreatment":"package",
                                package_medicines: packmedicine1,
                                shop_id: item.storeid,
                            }
                        );
                    });
                }

                let couponsArray = [];
                if (isNotEmpty(item.coupons_list)){
                    item.coupons_list.forEach((coupons,index)=>{
                        couponsArray.push(
                            {
                                money:coupons.price,
                                title:coupons.title,
                                get:coupons.get,
                                id:coupons.id,
                                valid_period_time:coupons.valid_period_time,
                                start_time:coupons.start_time,
                                end_time:coupons.end_time,
                                type:coupons.coupons_type,
                                aleardyget:coupons.aleardyget,
                                max_claim_quantity:coupons.max_claim_quantity,
                                user_coupon_count:coupons.user_coupon_count,
                            }
                        );
                    });
                }
                let shopInfo = {
                    shop_id: item.storeid,
                    shop_title: item.title,
                    add_on:item.add_on,//满减提示
                    add_on_isshow:item.add_on_isshow,//满减条件 是否满足
                    freepostage:item.freepostage,//包邮提示
                    freepostage_isshow:item.freepostage_isshow,//包邮条件 是否满足
                    shipping_desc: '',
                    shop_coupon_count: safeArray(item.coupons_list).length,
                    cart_items: medicine,
                    coupons_list:couponsArray,
                    store_medicine_price_total:item.store_medicine_price_total,//药店商品总价
                    logistcs_price:safeFloatNumber(item.logistcs_price,0.0),//配送费
                    package_price:safeFloatNumber(item.package_price,0.0),//包装费
                    not_sales_desc:not_sales_desc,//不可销售原因
                    isNotCanSale:isNotEmpty(not_sales_desc)
                }
                if (isNotEmpty(shopInfo.not_sales_desc)) {
                    if (notCanSaleArray.length == 0) {
                        shopInfo.isFirst = true
                    }
                    notCanSaleArray.push(shopInfo)
                } else {
                    returnArray.push(shopInfo);
                }
                
            });
            returnArray = returnArray.concat(notCanSaleArray)

            if (isNotEmpty(data.dataList_Lose) && data.dataList_Lose.length > 0) {
                let staleGoodsArray = []
                data.dataList_Lose.forEach((medicineitem)=>{
                    staleGoodsArray.push(
                        {
                            id:medicineitem.id ,
                            shop_goods_id: medicineitem.store_medicineid,
                            medicineid: medicineitem.medicineid,
                            title: medicineitem.namecn,
                            standard: medicineitem.standard,
                            img_url: medicineitem.intro_image.split('|')[0],
                            prescription: medicineitem.prescription,
                            price: medicineitem.price_real,
                            price_old: medicineitem.price,
                            discount: medicineitem.price_desc,
                            quantity: medicineitem.amount,
                            reserve: medicineitem.reserve,
                            reserve_desc:safe(medicineitem.reserve_desc),
                            PrescriptionType:this.convertPrescriptionType(medicineitem.dict_medicine_type+''),
                            dict_store_medicine_status:-1,
                        }
                    )
                })
                returnArray.push({
                    type:'close',
                    cart_items:staleGoodsArray,
                })
            }
        }
        return returnArray;
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
        let model = new YFWOTOShopCarModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}
