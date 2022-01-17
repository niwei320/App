import React from 'react';
import {isNotEmpty, safe, isEmpty, safeNumber} from '../../PublicModule/Util/YFWPublicFunction';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'

export default class YFWMedicineInfoModel {

    constructor(props){

    }

    setModelData(data){
        let isTcp =  YFWUserInfoManager.defaultProps.isRequestTCP
        if (isNotEmpty(data)) {
            return {
                discount:safe(data.price_desc),
                price:data.price??data.priceMin??data.min_price,
                name:data.medicine_name,//http 取用字段,
                home_search_tcpname:data.medicine_name??(data.aliascn?data.aliascn+ ' ':'')+ data.namecn,
                troche_type:data.troche_type??data.trocheType??'',//剂型
                home_category_tcpname:data.titleAbb?(data.aliascn?data.aliascn+ ' ':'')+ data.namecn+' - '+data.titleAbb:(data.aliascn?data.aliascn+ ' ':'')+data.namecn,
                inshop_search_tcpname:data.short_title?data.medicine_name+' - '+data.short_title:data.medicine_name,
                alias_cn:data.aliascn,
                shop_medicine_id:data.storeid,
                medicine_id:data.id,
                name_cn:data.namecn,
                standard:data.standard,
                factoryName:data.title??data.mill_title,
                is_prescription:data.is_prescription,
                status:'',
                intro_image:data.intro_image,
                title:data.namecn,
                title_abb:data.short_title,
                UpdateTime:'',
                rx_info_show:'',
                store_count:data.store_count,

                store_title:data.store_title,
                scheduled_days:data.scheduled_days,
                free_logistics_desc:data.free_logistics_desc,//商家包邮
                coupons_desc:data.coupons_desc,//优惠券描述，
                activity_desc:data.activity_desc,//满减活动描述
                medicine_package_desc:data.medicine_package_desc,//多件装描述

                is_lingshou_buy:'',
                applicability:'',
                whole_sale_price:'',
                goods_id:data.medicineid,
                price_quantity:data.shopCount,
                shop_goods_id:data.id,
                img_url:isNotEmpty(data.intro_image)?data.intro_image:data.introImage,
                authorized_code:data.authorized_code??data.authorizedCode??'',
                SaleCount:'15',
                MillLockPrice:'0.00',
                IsPrescription:data.is_prescription,
                discount_str:safe(data.price_desc),
                discount_is_show:safe(data.price_desc).length>0 ? 'true':'false',
                is_add_cart:data.is_add_cart,
                /** 暂不销售 */
                isCanSale: isEmpty(data.is_buy) ? true : data.is_buy=='1',
                dict_store_medicine_status:data.dict_store_medicine_status??'',
                is_hidden_more: safeNumber(data.is_assign) == 1,//隐藏更多商家
                originData:data
            }
        }
    }

    static getModelArray(data){

        let model = new YFWMedicineInfoModel();
        let ModeData =  model.setModelData(data)
        return ModeData;

    }

      getName(data) {
        if(YFWUserInfoManager.defaultProps.isRequestTCP){
            if(isEmpty(data.medicine_name)){
                //首页搜索商品
                if(isNotEmpty(data.name)){
                    return
                }else {
                    return
                }
            }else {
                //店铺内搜索商品
            }
        }else {
            return data.medicine_name;
        }

    }
}
