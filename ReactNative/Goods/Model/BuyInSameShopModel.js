import React from 'react'
import {
    View,
} from 'react-native'
import {isEmpty, safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class BuyInSameShopModel extends React.Component {

    constructor(props) {
        super(props)
    }

    setModelData(array){
        if(isEmpty(array)){
            return []
        }
        return safeObj(array).map((item,index)=>{
            let items = []
            for (let i = 0; i < safeObj(safeObj(item).shopmedicine_list).length; i++) {
                items.push({
                    shop_goods_id:item.shopmedicine_list[i].id,
                    qty:"1",//数量？
                })
            }
            return{
                title:              item.store_title,//商铺标题
                total_price:        item.total_price,//商品总价
                shipping_price:     item.logistics_price,//运费
                items:              items,//商品素组
                shop_id:            item.storeid
            }
        })
    }

    static getModelArray(data){
        let model = new BuyInSameShopModel();
        let ModeData =  model.setModelData(data)
        return ModeData;

    }
}