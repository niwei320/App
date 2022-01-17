import React from 'react'
import {
    View,
} from 'react-native'
import {isEmpty} from "../../../PublicModule/Util/YFWPublicFunction";

/**
 * 健康问答详情商品推荐列表Model,TCP专用
 */
export default class YFWHealthAskDetailRecommendListModel {

    constructor() {
    }

    static getArray(array){
        if(isEmpty(array)){
            array = []
        }
        return array.map((item,index)=>{
            return {
                intro_image: item.intro_image,
                title: item.namecn,
                standard: item.standard,
                price: item.price,
                discount: item.price_desc,
                discount_is_show: item.price_desc_is_show,
                detail_id: item.id,
                shopcount: "",
                good_id: item.id
            }
        })
    }
}