import React from 'react';
import {isNotEmpty, isEmpty, safe, kScreenWidth, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import YFWMedicineInfoModel from "./YFWMedicineInfoModel"

export default class YFWShopDetailGoodsListModel {

    constructor(props){

    }
    setModelData(data,isStandardType){
        let items = [];
        if (isNotEmpty(data)) {
            data.forEach((item,index)=> {
                let model = YFWMedicineInfoModel.getModelArray(item)
                model["itemHeight"] = this._calculateCollectionItemHeight(model,isStandardType)
                model["shop_goods_id"]= item.store_medicineid
                items.push(model);
            })
        }
        return items;
    }

    /** 搜索瀑布流计算高度缓存 */
    _calculateCollectionItemHeight(item,isStandardType) {
        let itemWidth = (kScreenWidth-34)/2;
        let itemHeight = 0;

        let imageHeight = itemWidth-16;
        /** 中文长度*15 + 字母长度*10 + 数字长度*9 + 其他长度*5 */
        let letterCount = safe(item.home_search_tcpname).replace(/[^a-zA-Z]/g, '').length
        let numCount = safe(item.home_search_tcpname).replace(/\D/g, '').length;
        let chineseCount = safe(item.home_search_tcpname).match(/[\u4E00-\u9FA5]/g).length
        let otherCount = safe(item.home_search_tcpname).length-letterCount-numCount-chineseCount
        let titleWidth = chineseCount*15 + letterCount*10 + numCount*9 + otherCount*5
        // let titleHeight = (parseInt(titleWidth/(itemWidth-16))+1)*18+10
        let titleHeight = 43
        let standardHeight = 18
        let factoryHeight = 18
        let activityHeight = (safe(item.free_logistics_desc).length>0||safe(item.activity_desc).length>0||safe(item.coupons_desc).length>0||safe(item.scheduled_days).length>0)?18:0
        let priceHeight = 36
        let shopCount = item.price_quantity ? item.price_quantity : item.store_count;
        let storeNameHeight = safe(item.store_title).length>0?17:(isNotEmpty(shopCount) && parseInt(safeObj(shopCount)) >= 0 && !isStandardType ?15:0);
        let trocheTypeHeight = safe(item.troche_type).length>0?17:0
        let bottomM = 10

        itemHeight = imageHeight + titleHeight + standardHeight + factoryHeight + activityHeight + priceHeight + storeNameHeight + trocheTypeHeight + bottomM
        return itemHeight
    }

    static getModelArray(array,isStandardType){
        if(isEmpty(array)){
            return [];
        }
        let model = new YFWShopDetailGoodsListModel();
        let ModeData =  model.setModelData(array,isStandardType)
        return ModeData;

    }


}
