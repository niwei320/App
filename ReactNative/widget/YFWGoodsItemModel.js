/**
 * 搭配YFWGoodsItem组件使用
 */
import React from 'react'
import {isNotEmpty, safe, tcpImage, convertImg} from "../PublicModule/Util/YFWPublicFunction"
import {toDecimal} from "../Utils/ConvertUtils";
import { kRoute_goods_detail } from '../WholesaleDrug/YFWWDJumpRouting';

export default class YFWGoodsItemModel {
    /**
     * 将解析的数据转出itemModel
     *
     * @param {数据模型} data
     * @param {数据来源} from
     */
    static getItemModel(data, from) {
        let itemModel = new YFWGoodsItemModel;
        if(isNotEmpty(data)) {
            itemModel = itemModel.setItemModel(data, from)
        }
        return itemModel;
    }

    setItemModel(data, from) {
        let goods_id = ''
        let goods_image = ''
        let goods_name = ''
        let goods_authorized_code = ''
        let goods_price = ''
        let goods_stories = ''
        let isShowStories = true
        let isShowCart = false
        let goods_mobclick = ''
        let goods_discount = ''
        let goods_standard = ''
        let navitation_params = {}

        if(from === 'cart_list_recommend') {
            /** 购物车精选商品 */
            goods_id = safe(data.id)
            goods_image = safe(data.intro_image)
            goods_name = safe(data.name_cn)
            goods_authorized_code = safe(data.authorized_code)
            goods_price = '¥'+toDecimal(safe(data.price))+'起'
            goods_stories = data.store_num
            goods_standard = safe(data.standard)
            goods_mobclick = 'cart_list_recommend'
            navitation_params = {
                type: 'get_goods_detail',
                value: goods_id
            }
        }else if(from === 'wd_cart_list_recommend') {
            /** 购物车精选商品 */
            goods_id = safe(data.id)
            goods_image = safe(data.intro_image)
            goods_name = safe(data.name_cn)
            goods_authorized_code = safe(data.authorized_code)
            goods_price = '¥'+toDecimal(safe(data.price))+'起'
            goods_stories = data.store_num
            goods_standard = safe(data.standard)
            goods_mobclick = 'wd_cart_list_recommend'
            navitation_params = {
                type: kRoute_goods_detail,
                value: goods_id
            }
        }else if(from === 'all_medicine_list'){
            /** 商家内全部商品搜索 */
            goods_id = safe(data.medicine_id)
            goods_image = safe(data.intro_image)
            goods_name = safe(data.inshop_search_tcpname)
            goods_authorized_code = safe(data.authorized_code)
            goods_price = '¥'+toDecimal(safe(data.price))
            goods_mobclick = 'all_medicine_list'
            goods_discount = data.discount
            goods_standard = safe(data.standard)
            isShowCart = data.is_add_cart
            isShowStories = false
            navitation_params = {
                type: 'get_shop_goods_detail',
                value: goods_id,
                img_url: convertImg(goods_image),
            }
        }else if(from === 'all_highlights_list') {
            goods_authorized_code = safe(data.authorized_code)
            goods_id = safe(data.id)
            goods_image = safe(data.intro_image)
            goods_name = safe(data.namecn)
            goods_price = '¥'+toDecimal(safe(data.price_min))
            goods_stories = safe(data.store_num)
            goods_standard = safe(data.standard)
            goods_mobclick = 'all_highlights_list'
            navitation_params = {
                type: 'get_goods_detail',
                value: goods_id
            }
        }else if(from === 'shop_medicine_recomand') {
            goods_authorized_code = safe(data.authorized_code)
            goods_id = safe(data.medicine_id)
            goods_image = safe(data.intro_image)
            goods_name = safe(data.name)
            goods_price = '¥'+toDecimal(safe(data.price))
            goods_discount = data.discount
            goods_standard = safe(data.standard)
            goods_mobclick = 'shop_medicine_recomand'
            isShowStories = false
            navitation_params = {
                type: 'get_shop_goods_detail',
                value: goods_id,
                img_url: convertImg(goods_image),
            }
        }else if(from === 'health_medicine_list'){
            goods_authorized_code = safe(data.authorized_code)
            goods_id = safe(data.id)
            goods_image = safe(data.intro_image)
            goods_name = safe(data.medicine_name)
            goods_price = '¥'+toDecimal(safe(data.price))+'起'
            goods_discount = data.price_desc
            goods_stories = safe(data.shopcount)
            goods_standard = safe(data.standard)
            goods_mobclick = 'health_medicine_list'
            isShowStories = false
            navitation_params = {
                type: 'get_shop_goods_detail',
                value: goods_id,
                img_url: convertImg(safe(data.intro_image_small)),
            }
        }

        return {
            goods_id: goods_id,
            goods_image: goods_image,
            goods_name: goods_name,
            goods_authorized_code: goods_authorized_code,
            goods_price: goods_price,
            goods_stories: goods_stories,
            isShowCart: isShowCart,
            goods_discount: goods_discount,
            goods_standard: goods_standard,
            goods_mobclick: goods_mobclick,
            navitation_params: navitation_params,
            model: data,
            isShowStories: isShowStories,
        }
    }
}
