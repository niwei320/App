/**
 * Created by weini on 2018/11/23
 */
import React from 'react';
import {isEmpty, isNotEmpty, safeObj, safe} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWSellersListGoodsInfoModel {

    constructor(props) {

    }

    method1(data) {
        if (isNotEmpty(data)) {
            let standerds = [];
            if(isNotEmpty(data.standards)){
                data.standards.map((item,index)=>{
                    standerds.push({
                        id:item.id,
                        standard:item.standard,
                    });
                });
            }
            return {
                authorized_code:data.authorized_code,
                authorizedCode_title:data.authorizedCode_title,
                title: data.medicine_name?data.medicine_name : data.aliascn+' '+data.namecn,
                name_cn:data.namecn,
                standard:data.standard,
                LicenseRegisterImage:'',
                LicenseRegisterEndDate:'',
                applicability:safeObj(data.applicability).replace("<p>","").replace("</p>",""),
                islock:data.dict_bool_lock,
                IsHalfLock:data.dict_bool_half_lock,
                mill_title:data.title,
                img_url:safeObj(data.image_list)[0],
                image_list:data.image_list,
                IntroImage:'',
                goods_id:data.id+"",
                troche_type:data.troche_type,
                name_path:data.special_category_name_path,
                IsLimitSales:false,
                prescription:data.dict_medicine_type+'',               //是否是处方药 0不是 1 是
                goods_guid_show:isNotEmpty(data.guide)?'true':"false",         //是否有说明书
                advisory_button_show:'false',   //咨询处方，不需要
                rx_info_show:'true',    //是否打码，不需要
                status:data.show_buy_button==='true'?'show':'hide',          //是否显示隐藏加入同店购按钮
                share:'',           //分享链接
                chart_show_status:true,//是否显示价格趋势图标按钮,TCP一直显示
                goods_standard:     standerds,//选择规格
                type:'',           //同店购按钮文字，1 = 加入同店购，2 = 取消
                tdg_goods_count:'',//同店购数量
                guide:             data.guide,//说明书
                short_title:       data.short_title,//TCP端的厂商名
                prompt_info:       data.buy_prompt_info,//处方提示语，凭什么处方购买之类的
                PrescriptionType:  this.convertPrescriptionType(data.dict_medicine_type),//单双轨标签 1=单轨, 2=双轨
                prompt_url :  data.rx_giude_url,//单双轨说明H5链接
                isCanSale: data.show_buy_button==='false'?false:true,
                dict_bool_cold_storage: data.dict_bool_cold_storage,//是否冷藏药品 1==冷藏
                bentrusted_store_name:      safeObj(data.medicine_info).bentrusted_store_name, //上市许可人
                is_promotion_activity_screen: data.is_promotion_activity_screen || false // 915活动
            }
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

    static getGoodsInfo(map) {
        let model = new YFWSellersListGoodsInfoModel();
        let ModeData = model.method1(map)
        return ModeData;

    }
}