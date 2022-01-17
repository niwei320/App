import React from 'react';
import {isEmpty, isNotEmpty, safeObj, safe, safeArray} from '../../PublicModule/Util/YFWPublicFunction';
import { toDecimal } from '../../Utils/ConvertUtils';
import YFWGoodsDetailCouponsModel from "./YFWGoodsDetailCouponsModel";
import YFWGoodsPackageModel from "./YFWGoodsPackageModel";

export default class YFWGoodsDetailModel {

    constructor(props){

    }

    setModelData(data){

        if (isNotEmpty(data)) {
            if(isEmpty(data.evaluation_list)){
                data.evaluation_list = []
            }
            let evaluation = safeObj(data.evaluation_list).map((item,index)=>{
                return {
                    send_star:item.send_star,
                    service_star:item.services_star,
                    package_star:item.package_star,
                    logistics_star:item.logistics_star,
                    eval_account_name:item.account_name,
                    eval_content:item.content,
                    reply_account_name:item.reply_account_name,
                    reply_time:item.reply_time,
                    reply_content:item.reply_content,
                    admin_reply_name:item.admin_reply_name,
                    admin_reply_content:item.admin_reply_content,
                    admin_reply_time:item.admin_reply_time,

                    eval_create_time:item.create_time,
                    eval_account_sex:'',
                    eval_account_intro_:'',
                    eval_account_id:item.accountid,
                    intro_image:item.intro_image,
                }
            })

            let active = []
            //TCP里面只有一个数组了
            if(safeObj(data.activity_list).length>0 || safeObj(data.freepostage_list).length>0){
                //至少保证是一个数组
                if(isEmpty(data.activity_list)){
                    data.activity_list = []
                }
               let items = data.activity_list.map((item,index)=>{
                    return {
                        name: item.name,
                        shipping_desc: item.reduce_price,
                        shipping_explain: "",
                        money_desc: "",
                        money_explain: "",
                        coupon_desc: "",
                        type:0,    //满减
                        coupon_explain: ""
                    }
                })
                //至少保证是一个数组
                if(isEmpty(data.activity_list)){
                    data.freepostage_list = []
                }
                let list = data.freepostage_list.map((item,index)=>{
                    return {
                        name: item.title,
                        shipping_desc: item.not_region_name,
                        shipping_explain: "",
                        money_desc: "",
                        money_explain: "",
                        coupon_desc: "",
                        type:1,    //包邮
                        coupon_explain: ""
                    }
                })
                let act = {
                    title: "",
                    start_time: "",
                    end_time: "",
                    remarks: "",
                    sub_items: items.concat(list)
                }
                active.push(act)
            }

            let allStandard = [
                {
                    id: safe(data.store_medicine_id),
                    real_price: toDecimal(data.real_price),
                    period_to: safe(data.period_to),
                    standard: safe(safeObj(data.medicine_info).standard),
                    troche_type: safe(safeObj(data.medicine_info).troche_type),
                    price_desc: ''
                }
            ]
            // if (safeArray(data.other_standard_list).length > 0) {
            //     allStandard = allStandard.concat(safeArray(data.other_standard_list))
            // }


            return {
                standards:                allStandard, // 所有规格的单品
                service_star:               5.0,//从商家详情里面获取
                delivery_star:              5.0,//从商家详情里面获取
                shipping_star:              5.0,//从商家详情里面获取
                package_star:               5.0,//从商家详情里面获取
                shop_logo:                  '',//店家logo,从商家详情里面获取
                shop_title:                 "",//商家名称从商家详情里面获取
                evaluation_count:           "",//评论总数从商家详情里面获取
                total_star:                 5.0,//商铺评价总分从商家详情里面获取
                shop_id:                    data.storeid,
                price:                      data.price,
                img_url:                    safeObj(safeObj(data.medicine_info).image_list),
                pubimage_list:              safeObj(safeObj(data.medicine_info).pubimage_list), // 商品宣传图片
                authorized_code:            safeObj(data.medicine_info).authorized_code,
                authorizedCode_title:       safeObj(data.medicine_info).authorizedCode_title,
                name_cn:                    safeObj(data.medicine_info).namecn,
                title:                      safeObj(data.medicine_info).aliascn+' '+safeObj(data.medicine_info).namecn,
                short_title:                safeObj(data.medicine_info).title,//生产厂家
                shop_promotion:             active,//活动freepostage_list
                shop_goods_id:              data.store_medicine_id,
                alias_cn:                   safeObj(data.medicine_info).aliascn,
                Standard:                   safeObj(data.medicine_info).standard,
                troche_type:                safeObj(data.medicine_info).troche_type,
                name_en:                    safeObj(data.medicine_info).nameen,//英文名
                alias_en:                   safeObj(data.medicine_info).py_namecn,//汉语拼音
                period:                     safeObj(data.medicine_info).period,
                mill_title:                 safeObj(data.medicine_info).title,
                goods_id:                   safeObj(data.medicine_info).id,
                package_prompt_info:        data.package_prompt_info,
                applicability:              safeObj(data.medicine_info).applicability,
                shipping_price:             data.shipping_price,
                shipping_time:              data.scheduled_days,
                question_ask_count:         data.question_ask_count,
                invite_item:        {
                    invite_img_show:        safeObj(data.invite_item).invite_img_show,
                    invite_url:             safeObj(data.invite_item).invite_url,
                },
                compliance_prompt:          data.compliance_prompt,
                prescription:               safeObj(data.medicine_info).dict_medicine_type+'',//是否是处方药 0不是 1是,
                is_wireless_exclusive:      'false',//手机专享 tcp已经没有手机专享
                is_seckill:                 safeObj(data).is_seckill_mediicne+'' === '1' ? 'true':'false',//秒杀
                original_price:             data.real_price,
                discount_is_show:           safeObj(data.price_desc).length>0 ? 'true' : 'false', //是否折扣
                discount:                   safeObj(data.price_desc),//折扣价
                reserve:                    data.reserve,
                shopmedicine_package:       YFWGoodsPackageModel.getModelArray(safeObj(data.package_list)),//套装
                evaluation:                 evaluation,
                payment:                    data.payment_list,
                status:                     data.button_show === true? 'sale' :(data.button_show == undefined || typeof (data.button_show) == 'undefined')?'default':'show', //sale加入购物车 show显示暂不销售
                prohibit_sales_btn_text:    data.prohibit_sales_btn_text,//暂不销售、售罄
                activity_prompt_info:       data.activity_prompt_info,//活动提示toast
                note:                       safeObj(data.note),//提示广告
                lbuy_no:                    data.max_buyqty+'',  //限购数量 0 不限购
                limit_buy_prompt:           safe(data.limit_buy_prompt), //限购描述 例如：近15天限购10件
                vacation:                   "",//节假日，外面赋值的字段
                shop_contracted:            "",//是否认证 '1' = 认证，外面赋值的字段
                period_to:                  safeObj(data.medicine_info).period,//有效期
                guide:                      safeObj(data.medicine_info).guide,
                dict_bool_lock:             safeObj(data.medicine_info).dict_bool_lock,//显示说明书 == 1
                couponArray:                YFWGoodsDetailCouponsModel.getModelArray(safeObj(data).coupons_list),
                warning_tip:                safeObj(data).warning_tip,
                prompt_info:                safeObj(data.buy_prompt_info)+'',//处方提示语，凭什么处方购买之类的
                PrescriptionType:           this.convertPrescriptionType(safeObj(data.medicine_info).dict_medicine_type),// 单双轨标签 1=单轨, 2=双轨
                prompt_url :                safeObj(data.medicine_info).rx_giude_url,//单双轨说明H5链接
                medication_prompt:          safeObj(data.medicine_info).medication_prompt,//保健品相关的提示语,
                st_ads_items:               data.st_ads_items,
                period_to_Date:             data.period_to,
                period_month:               safeObj(data.medicine_info).period_month,//有效期
                period_info:                safeObj(data.medicine_info).period,
                store_address:              data.store_address,//发货地址
                bentrusted_store_name:      safeObj(data.medicine_info).bentrusted_store_name, //上市许可人
                name_path:                  safeObj(data.medicine_info).special_category_name_path, //分类信息
                activity_img_url:           safe(data.activity_img_url), //活动图标--例如双十一
                get_coupon_cart_show:       data.get_coupon_cart_show,//购买弹窗是否显示有无门槛券
                get_coupon_desc:            data.get_coupon_desc ,//购买弹窗门槛券提示内容

                is_promotion_activity:      data.is_promotion_activity_medicine === 1, // 是否活动商品 e.g. 915
                activity_stage:             data.stage, // 活动阶段阶段  1.预热 2.促销 3返场
                promotion_price:            safeObj(data.promotion_price) , // 促销阶段价格
                activity_original_price:    safeObj(data.origina_price) , // 活动阶段显示的原价价格
                activity_rest_time:         safeObj(data.activity_rest_time) , // 活动阶段所剩时间 单位毫秒
                stage_icon_url:             safeObj(data.stage_icon)   , // 活动阶段icon
                stage_background_img_url:   safeObj(data.stage_background_img)   , // 活动阶段背景图片
                stage_content_img_url:      safeObj(data.stage_content_img)   , // 活动阶段标题图片
                is_fetch_from_server:       safe(data.is_fetch_from_server),//标识是否从服务端请求到的数据
                dict_bool_cold_storage:     safeObj(data.medicine_info).dict_bool_cold_storage,//是否冷链商品  1==是
            }
        }else{
            return {}
        }
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
        let model = new YFWGoodsDetailModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}
