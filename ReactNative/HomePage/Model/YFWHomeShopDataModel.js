import React from 'react'
import {isNotEmpty, safe, strMapToObj} from "../../PublicModule/Util/YFWPublicFunction";
export default class YFWHomeShopDataModel extends React.Component {



    static getModelArray(shopInfo,catageArray,recomendGoodsArray,packageArray,qualificationInfo,lastDataArray) {
        let dataArray = []
        if (isNotEmpty(shopInfo)) {
            dataArray.push(
                {
                    'style':'shopInfo',
                    shopInfo:shopInfo
                }
            )
            dataArray.push(
                {
                    'style':'coupon',
                    items:shopInfo.coupons_list
                }
            )
        }
        if (isNotEmpty(packageArray)) {
            dataArray.push(
                {
                    'style':'shopPackage',
                    items:packageArray
                }
            )
        }
        if (isNotEmpty(catageArray)) {
            let lastCatageArray = []
            if (isNotEmpty(lastDataArray) && lastDataArray.length > 0) {
                lastDataArray.some((item)=>{
                    if(item.style == 'recomend') {
                        lastCatageArray = item.items
                    }
                    return item.style == 'recomend'
                })
            }
            catageArray.map((item)=>{
                let lastInfo = null
                let have = lastCatageArray.some((info)=>{
                    if (info.name == item.name) {
                        lastInfo = info
                    }
                    return info.name == item.name
                })
                if (have && isNotEmpty(lastInfo)) {
                    item.pageIndex = lastInfo.pageIndex
                    item.showFoot = lastInfo.showFoot
                    item.items = lastInfo.items
                } else {
                    item.pageIndex = 1
                    item.showFoot = 2
                    item.items = []
                }

                item.shop_id = shopInfo.shop_id
            })
            catageArray.unshift({
                name:'商家优选',
                items:recomendGoodsArray
            })
            dataArray.push(
                {
                    'style':'topMenu',
                    data:{items:catageArray},
                    shop_id:shopInfo.shop_id
                }
            )
            dataArray.push({
                'style':'recomend',
                items:catageArray,
                shop_id:shopInfo.shop_id
            })
        }
        if (isNotEmpty(qualificationInfo)) {
            dataArray.push(qualificationInfo)
        }
        return dataArray
    }
}