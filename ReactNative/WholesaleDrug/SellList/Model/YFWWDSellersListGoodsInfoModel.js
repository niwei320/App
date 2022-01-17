
import {isEmpty, isNotEmpty, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";
export default class YFWWDSellersListGoodsInfoModel {

    constructor(props) {

    }

    method1(data) {
        if (isNotEmpty(data)) {
            let standerds = [];
            return {
                authorized_code:data.authorized_code,
                authorizedCode_title:data.authorizedCode_title,
                title:data.aliascn+' '+data.namecn,
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
                goods_id:data.id+"",
                troche_type:data.troche_type,
                name_path:data.special_category_name_path,
                IsLimitSales:false,
                prescription:data.dict_medicine_type+'',               //是否是处方药 0不是 1 是
                goods_guid_show:isNotEmpty(data.guide)?'true':"false",         //是否有说明书
                goods_standard:     standerds,//选择规格
                guide:             data.guide,//说明书
                short_title:       data.short_title,//TCP端的厂商名
                prompt_info:       data.buy_prompt_info,//处方提示语，凭什么处方购买之类的
                PrescriptionType:  this.convertPrescriptionType(data.dict_medicine_type),//单双轨标签 1=单轨, 2=双轨
                prompt_url :  data.rx_giude_url,//单双轨说明H5链接
                isCanSale: data.show_buy_button==='false'?false:true,
                bentrusted_store_name:      safeObj(data.medicine_info).bentrusted_store_name, //上市许可人
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
        let model = new YFWWDSellersListGoodsInfoModel();
        let ModeData = model.method1(map)
        return ModeData;

    }
}