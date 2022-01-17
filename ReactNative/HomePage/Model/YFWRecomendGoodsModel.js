import React from 'react';
import {isEmpty, isNotEmpty, kScreenWidth, safe} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWRecomendGoodsModel {

    constructor(props) {
    }

    setModelData(data) {
        if (isNotEmpty(data)) {
            data.home_category_tcpname = data.alt_name?data.alt_name:data.name_cn
            data.store_count = data.shop_num
            data.height = this._getItemHeight(data)
            }
            return data;
    }

    //计算item高度
    _getItemHeight = (item) => {
        let itemWidth = (kScreenWidth-34)/2;
        let imageHeight = itemWidth-16;
        let letterCount = item.home_category_tcpname.replace(/[^a-zA-Z]/g, '').length
        let numCount = item.home_category_tcpname.replace(/\D/g, '').length;
        let chineseCount = item.home_category_tcpname.match(/[\u4E00-\u9FA5]/g).length
        let otherCount = item.home_category_tcpname.length-letterCount-numCount-chineseCount
        let titleWidth = chineseCount*15 + letterCount*10 + numCount*9 + otherCount*5
        let titleHeight = (parseInt(titleWidth/(itemWidth-16))+1)*17
        let standardHeight = isEmpty(item.standard)?0:18
        let activityHeight = (safe(item.free_logistics_desc).length>0||safe(item.activity_desc).length>0||safe(item.coupons_desc).length>0||safe(item.scheduled_days).length>0)?18:0
        let priceHeight = (isEmpty(item.price_quantity?item.price_quantity:item.store_count) || item.type == 'get_shop_goods_detail')?20:35
        let storeNameHeight = item.type == 'get_shop_goods_detail'&&isNotEmpty(item.title)?21:0;
        let bottomM = 10

        return imageHeight + titleHeight + standardHeight + activityHeight + priceHeight + storeNameHeight + bottomM
    }

    static getModelArray(array) {

        let marray = [];

        if (isNotEmpty(array)){
            array.forEach((item, index) => {
                let model = new YFWRecomendGoodsModel();
                marray.push(model.setModelData(item));
            });
        }

        return marray;

    }
}


