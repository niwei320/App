import React from 'react';
import {
    isNotEmpty,
    safe,
    safeObj,
    isEmpty,
    safeArray,
    safeNumber
} from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWOTOSettlementModel {

    constructor(props){

    }

    setModelData(data){
        let shopmedicine = [];
        let medicate_item = {}

        if (isNotEmpty(data) && safeArray(data?.result?.list).length > 0) {

            data.result.list.forEach((item, index) => {
                let medicine = [];

                if (isNotEmpty(item.medicine_list) && safeArray(item.medicine_list).length > 0){
                    let medicineList = []
                    let packAllMedicines = 0
                    let packAllMedicinesOriginPrice = 0
                    item.medicine_list.forEach((medicineitem, index) => {
                        let amount = isNaN(parseInt(medicineitem.amount)) ? 1:parseInt(medicineitem.amount)
                        packAllMedicines += amount
                        let price = isNaN(parseFloat(medicineitem.price)) ? 1:parseFloat(medicineitem.price)
                        packAllMedicinesOriginPrice += price * amount
                        medicineList.push(
                            {
                                id: medicineitem.id,
                                shop_goods_id: medicineitem.store_medicineid,
                                title: medicineitem.medicine_name,
                                standard: medicineitem.standard,
                                img_url: medicineitem.intro_image,
                                prescription: medicineitem.prescription,
                                price: medicineitem.price_real,
                                price_old: medicineitem.price,
                                discount: medicineitem.price_desc,
                                quantity: medicineitem.amount,
                                package_id: '0',
                                reserve:medicineitem.reserve,
                                type: 'medicine',
                                PrescriptionType:this.convertPrescriptionType(medicineitem.dict_medicine_type),//单双轨 '1'='单轨' '2'=双轨
                            });
                    });
                    medicineList.length > 0 && medicine.push(
                        {
                            allCount: packAllMedicines,
                            originPrice:packAllMedicinesOriginPrice,
                            type: "medicines",
                            package_medicines: medicineList,
                        }
                    );
                }

                if (isNotEmpty(item.packmedicine_list) && safeArray(item.packmedicine_list).length > 0) {
                    item.packmedicine_list.forEach((packmedicine, index) => {
                        let packmedicine1 = [];
                        if (isNotEmpty(packmedicine.medicine_list) && safeArray(packmedicine.medicine_list).length > 0) {
                            let reserve
                            let packAllMedicines = 0
                            let packAllMedicinesOriginPrice = 0
                            packmedicine.medicine_list.forEach((medicine1,index1)=>{
                                if(isEmpty(reserve) || medicine1.reserve < reserve){
                                    reserve = medicine1.reserve
                                }
                                let amount = isNaN(parseInt(medicine1.amount)) ? 1:parseInt(medicine1.amount)
                                packAllMedicines += amount
                                let price = isNaN(parseFloat(medicine1.price)) ? 1:parseFloat(medicine1.price)
                                packAllMedicinesOriginPrice += price * amount
                                packmedicine1.push(
                                    {
                                        id: medicine1.id ,
                                        shop_goods_id: medicine1.store_medicineid ,
                                        title: medicine1.medicine_name ,
                                        standard: medicine1.standard ,
                                        img_url: medicine1.intro_image ,
                                        prescription: medicine1.prescription ,
                                        price: medicine1.price ,
                                        quantity: medicine1.amount ,
                                        reserve: medicine1.reserve ,
                                        lbuy_no: '0' ,
                                        order_no: '0' ,
                                        package_id: '0',
                                        PrescriptionType:this.convertPrescriptionType(medicine1.dict_medicine_type+'')
                                    }
                                );
                            })
                            medicine.push(
                                {
                                    package_id: packmedicine.packageid,
                                    package_name: packmedicine.smp_name,
                                    price: packmedicine.smp_price,
                                    price_old: packmedicine.smp_price,
                                    discount: packmedicine.price_desc,
                                    count: packmedicine.amount,
                                    medicine_total_price: packmedicine.medicine_total || parseFloat(packmedicine.smp_price)*parseInt(packmedicine.amount),
                                    allCount: packmedicine.smp_medicine_packmedicine_count || packAllMedicines,
                                    originPrice: packAllMedicines.smp_medicine_packmedicine_total || packAllMedicinesOriginPrice,
                                    reserve:reserve?reserve:999,
                                    type: "package",
                                    package_medicines: packmedicine1,
                                    package_type:packmedicine.package_type,
                                }
                            );

                        }

                    });
                }

                let logistic = [{
                    id:'',
                    name:'',
                    cod:"0",
                    price:item.logistcs_price || 0,
                    desc:''
                }];
                let packagelist = [{
                    id:'',
                    name:'',
                    cod:"0",
                    price:item.package_price || 0,
                    desc:''
                }];

                let coupon_items = [];
                if (isNotEmpty(item.coupons_list) && safeArray(item.coupons_list).length > 0) {
                    item.coupons_list.forEach((item,index)=>{
                        coupon_items.push({
                            name:item.name,
                            money:item.price,
                            id:item.id,
                            expire_time: this._checkTimeStyle(safe(item.expire_time)),
                            start_time: this._checkTimeStyle(safe(item.start_time)),
                            coupon_des:item.use_condition_price_desc,
                            coupon_use_desc: item.coupons_desc,//使用描述
                            dict_coupons_type: item.dict_coupons_type // 1.店铺 2.单品
                        });
                    });
                    coupon_items.push({
                        name:'不使用优惠券',
                        coupon_des:'不使用优惠券',
                        coupon_use_desc:'不使用优惠券',
                        money:'0',
                        id:''
                    });
                }

                let un_coupon_items = [];
                if (isNotEmpty(item.un_coupons_list) && safeArray(item.un_coupons_list).length > 0) {
                    item.un_coupons_list.forEach((item, index) => {
                        un_coupon_items.push({
                            name: item.name,
                            money: item.price,
                            id: item.id,
                            expire_time: this._checkTimeStyle(safe(item.expire_time)),
                            start_time: this._checkTimeStyle(safe(item.start_time)),
                            coupon_des: item.use_condition_price_desc,
                            dict_coupons_type: item.dict_coupons_type, // 1.店铺 2.单品
                            unavailabledesc:item.unavailabledesc, //不可使用原因
                            condition_price:item.condition_price, //使用条件金额
                        });
                    });
                }

                let shop_invoice_info = {
                    invoice_applicant:'',
                    invoice_code:'',
                }
                if (isNotEmpty(item.invoice_info)) {
                    shop_invoice_info = item.invoice_info
                }

                // 1 纸质  2 电子
                let shop_invoice_types = []
                if (isNotEmpty(item.invoice_types)) {
                    shop_invoice_types = String(item.invoice_types).split(',')
                }
                if (isEmpty(shop_invoice_types) || shop_invoice_types.length === 0 ) {
                    shop_invoice_types = ['1']
                }
                let shop_invoice_support_types = []
                shop_invoice_types.map((support_type)=>{
                    let desc = ''
                    let name = ''
                    if (support_type == '1') {
                        desc = '商家支持开具纸质发票，发票随货寄出或者发货后2日内寄出，若未收到可要求商家补开寄出。'
                        name = '增值税纸质普通发票'
                    } else if (support_type == '2') {
                        desc = '电子普通发票与纸质普通发票具有同等效力，可支持报销入账\r\n电子普通发票在发货后的2日内开具，若商家未开具，可联系商家开出。'
                        name = '增值税电子普通发票'
                    }
                    shop_invoice_support_types.push({type: support_type, name: name,desc: desc})
                })
                shop_invoice_support_types = shop_invoice_support_types.sort((a,b)=>{
                    return  parseInt(b.type) - parseInt(a.type)
                })
                let buyerpickupInfo = {}
                if (isNotEmpty(item.buyerpickup)) {
                    buyerpickupInfo = safeObj(item.buyerpickup)
                    buyerpickupInfo.name = buyerpickupInfo.name || '到店自提'
                }
                let sellershippingInfo = {}
                if (isNotEmpty(item.sellershipping)) {
                    sellershippingInfo = safeObj(item.sellershipping)
                    sellershippingInfo.name = sellershippingInfo.name || '门店配送'
                }
                let noLogistcsInfos = []
                let noLogistcsTip = '温馨提示：商家暂不配送'
                if (safe(item.nologistcs_type) == '2') {
                    let goodsTypes = new Set()
                    safeArray(item.logistcs_info).map((info,index)=>{
                        let subDatas = []
                        if (info.dict_bool_logistics_liquid == 0 && safeArray(item.is_liquid_item).length > 0) {
                            goodsTypes.add('液体')
                            let goodsNames = []
                            safeArray(item.is_liquid_item).map((goodsItem)=>{
                                goodsNames.push({title:'·'+safe(goodsItem.medicine_name)})
                            })
                            subDatas.push({
                                key:index+'is_liquid_item',
                                title:'液体类商品：',
                                imageSource:require('../../../../img/icon_goods_yeti.png'),
                                data:goodsNames,
                            })
                        }
                        if (info.dict_bool_logistics_mastic == 0 && safeArray(item.is_mastic_item).length > 0) {
                            goodsTypes.add('膏剂')
                            let goodsNames = []
                            safeArray(item.is_mastic_item).map((goodsItem)=>{
                                goodsNames.push({title:'·'+safe(goodsItem.medicine_name)})
                            })
                            subDatas.push({
                                key:index+'is_mastic_item',
                                title:'膏剂类商品：',
                                imageSource:require('../../../../img/icon_goods_gaoti.png'),
                                data:goodsNames,
                            })
                        }
                        if (info.dict_bool_logistics_powder == 0 && safeArray(item.is_powder_item).length > 0) {
                            goodsTypes.add('粉剂')
                            let goodsNames = []
                            safeArray(item.is_powder_item).map((goodsItem)=>{
                                goodsNames.push({title:'·'+safe(goodsItem.medicine_name)})
                            })
                            subDatas.push({
                                key:index+'is_powder_item',
                                title:'粉剂类商品：',
                                imageSource:require('../../../../img/icon_goods_fenji.png'),
                                data:goodsNames,
                            })
                        }
                        noLogistcsInfos.push({
                            key:index+info.name,
                            title:info.name+'不配送以下商品：',
                            data:subDatas
                        })
                    })
                    noLogistcsTip += Array.from(goodsTypes).join('、') +  '类商品。'
                }

                shopmedicine.push({
                    shop_id: item.storeid,
                    shop_title: item.title,
                    order_desc:'',
                    cart_items: medicine,
                    package_items: packagelist,
                    isColdPackage: safeNumber(item.is_cold_storage)==1, // 是否是冷藏包装
                    coupon_items: coupon_items,
                    un_coupon_items: un_coupon_items,
                    shop_offers_price: safe(item.activity_item),//商家优惠 ---满减金额 满X减Y元 中的Y
                    shop_offers_price_condition: safe(item.activity_condition_item), //商家优惠 档位使用条件 满X减Y元 中的X
                    logistic_items: logistic,
                    payment_items: item.payment_list,
                    discount: safe(item.return_price_total),
                    invoice_info: shop_invoice_info,
                    invoice_types: shop_invoice_support_types,
                    supportBuyerPickUp: safeNumber(item.IsSupportBuyerPickUp) == 1,//门店自提
                    buyerpickupInfo: buyerpickupInfo,//
                    supportSellerShipping: safeNumber(item.IsSupportSellerShipping) == 1,//同城配送
                    sellershippingInfo: sellershippingInfo,//
                    store_medicine_count_total: item.store_medicine_count_total,//门店总商品数
                    store_medicine_price_total: item.store_medicine_price_total + item.return_price_total,//商品总价
                    // nologistcs_type: safe(item.nologistcs_type),//不配送原因  0 正常配送  1  地区不配送  2 药品剂型原因不配送
                    // nologistcs_type:0,
                    noLogistcsInfos: safeArray(noLogistcsInfos),//不配送物流商品原因集合
                    noLogistcsTip: noLogistcsTip,//不配送商品类型提示
                    logistcs_info: safeArray(item.logistcs_info), //[{id:1,name:'xx',dict_bool_logistics_liquid:0,dict_bool_logistics_mastic:1,dict_bool_logistics_powder:0}],//不配送物流
                    is_liquid_item:safeArray(item.is_liquid_item),//符合剂型的药品集合
                    is_powder_item:safeArray(item.is_powder_item),//符合剂型的药品集合
                    is_mastic_item:safeArray(item.is_mastic_item),//符合剂型的药品集合
                });


            });

            if(isNotEmpty(safeObj(data.result).medicate_item)){
                let item = data.result.medicate_item
                medicate_item = {
                    medicate_name:item.medicate_name,
                    medicate_sex:isNotEmpty(item.medicate_sex)? (item.medicate_sex + '' === "1" ? '男' : "女"):'',
                    medicate_idcard:item.medicate_idcard,
                }
            }
        }

        let platform_coupon_list = [];
        safeArray(data?.result?.platform_coupon_list).forEach((value)=>{

            let platform_coupon_list_obj = {
                id:safe(value.id),
                money:safe(value.price),
                name:safe(value.name),
                start_time:safe(value.start_time),
                expire_time:safe(value.expire_time),
                coupon_des:safe(value.use_condition_price_desc),
                coupon_use_desc:safe(value.coupons_desc),
                dict_coupons_type:safe(value.dict_coupons_type)
            };

            platform_coupon_list.push(platform_coupon_list_obj);
        });

        if (isNotEmpty(data?.result?.medicine_disease_items) && typeof data?.result?.medicine_disease_items === 'object') {
            for (let k of Object.keys(data.result.medicine_disease_items)) {
                let diseasesArray = data.result.medicine_disease_items[k]
                if (isEmpty(diseasesArray)) {
                    diseasesArray = []
                }
                diseasesArray.map((info)=>{
                    info.namecn = k
                })
            }
        }
        let lastPayInfo = {}
        let lastOrderPayment = safeObj(data?.result?.LastOrder_payment)
        if (isEmpty(lastOrderPayment) || isEmpty(lastOrderPayment.payment_name)) {
            lastPayInfo = {
                payment_name:'支付宝支付',
                payment_nameen:'alipay',
                dict_payment:2,
            }
        } else {
            let paymentName = '在线支付'
            let endStr = '支付'
            if (safe(lastOrderPayment.payment_name).includes(endStr) && safe(lastOrderPayment.payment_name).lastIndexOf(endStr) == (safe(lastOrderPayment.payment_name).length - endStr.length)) {
                paymentName = lastOrderPayment.payment_name
            } else {
                paymentName = lastOrderPayment.payment_name+'支付'
            }
            lastPayInfo = {
                ...lastOrderPayment,
                payment_name:paymentName,
                payment_nameen:safe(lastOrderPayment.payment_nameen),
                dict_payment:safe(lastOrderPayment.dict_payment),
            }
        }
        let result = safeObj(data?.result)
        return {
            code:'1',
            shop_items:shopmedicine,
            oneShopTitle:safeObj(shopmedicine[0]).shop_title,
            platform_coupons_items:platform_coupon_list,
            compliance_prompt:safeObj(result.compliance_prompt),
            invoice_applicant:safe(safeObj(result.invoice_info).invoice_applicant),
            invoice_code:safe(safeObj(result.invoice_info).invoice_code),
            rx_img_items:[],
            is_needenrollment:result.is_needenrollment > 0,// > 0 == 用药登记模式
            medicate_info_show:result.medicate_info_show,//是否显示用药人信息 'true' = 显示 'false' = 不显示
            medicate_info_type:result.medicate_info_type,//电子处方信息 1:登记用药人（现有）2:电子处方模式3:都不要
            medicate_item:medicate_item,//用药人信息
            is_certificate_upload:( String(result.is_certificate_upload) == 'true'),//复诊记录 必传？？
            rx_mode:result.rx_mode,//电子处方模式  1、只支持电子处方  2、只支持已有处方  其他 不控制（电子处方&已有处方都可以）
            balance:result.balance,
            balance_prompt:result.balance_prompt,
            use_ratio:result.use_ratio,
            user_point:result.user_point,
            drug_items:result.drug_items,
            medicine_disease_items:result.medicine_disease_items,//每个药对应的疾病Map
            medicine_disease_xz_count:result.medicine_disease_xz_count,//每个药最大选择疾病数量
            disease_xz_add:result.disease_xz_add,//是否可自选疾病 1 允许 0 不允许
            inquiry_rx_images:result.inquiry_rx_images,
            disease_items:result.disease_items,
            rx_cid_items:result.rx_cid_items,
            disease_xz_count:result.disease_xz_count,
            lastOrder_payment:safeObj(lastPayInfo),//上一次支付方式 {dict_payment:1,//2 ali 3 wx 6 jd payment_name:'',payment_nameen:'',//wxpay alipay jdpay}
            pickup_address:result.pickup_address,//提货地址
            pickup_mobile:result.pickup_mobile,//取货人手机号
            pickup_distance:result.distance,//距离
            context:safe(result.context),//支付提示文案
            platform_yh_price:result.platform_yh_price,//平台补贴金额
            platform_yh_desc:result.plat_yh_desc,//平台补贴文案描述
            need_show_text:result.needshowtext//结算提示文案
        };
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

    _checkTimeStyle(time) {
        while (time.indexOf('-') > 0) {
            time = time.replace('-','.')
        }

        return time
    }

    static getModelValue(array){
        let model = new YFWOTOSettlementModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}
