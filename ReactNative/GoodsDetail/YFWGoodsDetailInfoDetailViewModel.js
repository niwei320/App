import React from 'react'
import {
    isNotEmpty,
    safe,
    safeObj,
    kScreenWidth,
    coverAuthorizedTitle,
    convertShopImage,
    isArray,
    safeArray, isAndroid
} from "../PublicModule/Util/YFWPublicFunction";

const returnModel = {
    title: '退换货标准',
    key: 'return',
    numColumns: 1,
    isRadius: true,
    items: [
        {
            key: 'return1',
            cell: 'YFWGoodsDetailsDescriptionCell',
            title: '退换货政策',
            content: '由商品售出之日（以实际收货时间为准）起七日内符合退换货条件的商品享受退换货政策。'
        },
        {
            key: 'return2',
            cell: 'YFWGoodsDetailsDescriptionPointCell',
            title: '退换货条件',
            items: [
                '因物流配送导致外包装污损、破损的商品，请直接拒绝签收处理。',
                '经质量管理部门检验，确属产品本身存在质量问题。',
                '国家权威管理部门发布公告的产品（如停售、召回等）。',
                '因商家失误造成发货错误，如商品的名称、规格、数量、产品批次等信息与所订商品不符。']
        },
        {
            key: 'return3',
            cell: 'YFWGoodsDetailsDescriptionCell',
            title: '特殊说明',
            content: '因药品是特殊商品，依据中华人民共和国《药品经营质量管理规范》及其实施细则（GSP）、《互联网药品交易服务审批暂行规定》等法律、法规的相关规定：药品一经售出，无质量问题，不退不换。'
        },
        {
            key: 'return4',
            cell: 'YFWGoodsDetailsDescriptionLineCell',
            title: '退换货流程',
            items: [
                '1、联系商家客服或自行确认符合退换货政策。',
                '2、在线提交退换货申请及相关证明。',
                '3、退换货申请通过后寄回商品。',
                '4、确认商家为您重寄的商品或退款。']
        },
    ]
}

export default class YFWGoodsDetailInfoDetailViewModel {
    static getModelArray(data, result) {
        let model = new YFWGoodsDetailInfoDetailViewModel;
        let modelData = model.setModelData(data, result);

        return modelData;
    }

    setModelData(data, result) {
        let dataSource = []

        /** 基本信息 */
        let baseInfo = this._getBaseInfo(data, result)
        dataSource.push(baseInfo)

        /** 说明书 */
        let explainInfo = this._getExplainInfo(data, result)
        if(data.dict_bool_lock == 1){
            dataSource.push(explainInfo)
        }
        /** 服务保障 */
        let safeguardInfo = this._getSafeguardInfo(data, result)
        dataSource.push(safeguardInfo)

        return dataSource;
    }

    _getSafeguardInfo(data, result) {
        let title = '服务保障'
        let items = []

        /** 药房网承诺 */
        items.push(this._getSaferguardModel(result))

        /** 商家资质 */
        const zz_items = safeObj(safeObj(result.getShopQualification).zz_items)
        if(isArray(zz_items)&&zz_items.length>0) {
            let aptitudeImages = []
            let navigationImages = []
            for (let index = 0; index < zz_items.length; index++) {
                const element = zz_items[index];
                navigationImages.push(convertShopImage(element.show_image_suffix,element.image_url))
            }
            for (let index = 0; index < zz_items.length; index++) {
                let element = zz_items[index];
                element['key'] = index.toString()
                element['cell'] = 'YFWGoodsDetailsAptitudeImageCell'
                element.image_url = convertShopImage(element.show_image_suffix,element.image_url)
                element['navigationImages'] = navigationImages
                aptitudeImages.push(element)
            }
            items.push({title:'商家资质', key:'shopAtiude', numColumns:2, isRadius:false, items:aptitudeImages})
        }

        /** 商家实景 */
        const sj_items = safeObj(safeObj(result.getShopQualification).sj_items)
        if(isArray(sj_items)&&sj_items.length>0) {
            let aptitudeImages = []
            let navigationImages = []
            for (let index = 0; index < sj_items.length; index++) {
                const element = sj_items[index];
                navigationImages.push(convertShopImage(element.show_image_suffix,element.image_url))
            }
            for (let index = 0; index < sj_items.length; index++) {
                let element = sj_items[index];
                element['key'] = index.toString()
                element['cell'] = 'YFWGoodsDetailsImageCell'
                element['width'] = kScreenWidth-26
                element['height'] = 171/375.0*kScreenWidth
                element['padding'] = 0
                element.image_url = convertShopImage(element.show_image_suffix,element.image_url)
                element['navigationImages'] = navigationImages
                aptitudeImages.push(element)
            }
            items.push({title:'商家实景', key:'shopImage', numColumns:1, isRadius:false, items:aptitudeImages})
        }

        /** 退换货标准 */
        items.push(returnModel)

        return {
            name: title,
            items: items,
        }
    }

    _getExplainInfo(data, result) {
        let title = '说明书'
        let items = []
        let notice = {
            key: 'notice',
            cell: 'YFWGoodsDetailsNoticeCell',
            content: '友情提示：商品说明书均由药房网商城客服手工录入，可能会与实际有所误差，仅供参考，具体请以实际商品为准。'
        }

        if(isNotEmpty(data.guide)) {
            let guides = []
            let guideKeys = Object.keys(data.guide)

            for (let index = 0; index < guideKeys.length; index++) {
                const element = guideKeys[index];
                guides.push(
                    {
                        key: index.toString(),
                        cell: 'YFWGoodsDetailsDescriptionCell',
                        title: '【' + element + '】',
                        content: data.guide[element]
                    }
                )
            }

            items.push({title:'说明书', key:'guides', numColumns:1, isRadius:true, items:guides})
        }

        return {
            name: title,
            notice: notice,
            items: items
        }
    }

    _getBaseInfo(data, result) {
        let title = '基本信息'
        let items = []
        let notice = undefined

        /** 药房网承诺 */
        // items.push(this._getSaferguardModel(result))
        /** 基本信息 */
        let infoArray = [
            {key: '1', cell: 'YFWGoodsDetailsNormalCell', title:'通用名：', subtitle: safe(data.name_cn),},
            {key: '2', cell: 'YFWGoodsDetailsNormalCell', title:'商品品牌：', subtitle: safe(data.alias_cn)},
            {key: '3', cell: 'YFWGoodsDetailsNormalCell', title:safe(data.authorizedCode_title), subtitle: safe(data.authorized_code)},
            {key: '4', cell: 'YFWGoodsDetailsNormalCell', title:'包装规格：', subtitle: safe(data.Standard)},
            {key: '5', cell: 'YFWGoodsDetailsNormalCell', title:'剂型/型号：', subtitle: safe(data.troche_type)},
            {key: '6', cell: 'YFWGoodsDetailsNormalCell', title:'英文名称：', subtitle: safe(data.name_en)},
            {key: '7', cell: 'YFWGoodsDetailsNormalCell', title:'汉语拼音：', subtitle: safe(data.alias_en)},
            {key: '8', cell: 'YFWGoodsDetailsNormalCell', title:'有效期：', subtitle: safe(data.period)},
            {key: '9', cell: 'YFWGoodsDetailsNormalCell', title:'生产企业：', subtitle: safe(data.mill_title)},
        ]
        if(data.package_prompt_info&&data.package_prompt_info.length>0) {
            notice = {
                key: 'notice',
                cell: 'YFWGoodsDetailsNoticeCell',
                content: data.package_prompt_info
            }
        }
        let baseInfo = {
            title: '基本信息',
            key: 'baseInfo',
            numColumns: 1,
            isRadius: true,
            items: infoArray
        }
        items.push(baseInfo)

        /** 商品图片 */
        let goodsImages = safeArray(data.pubimage_list).length>0 ? safeArray(data.pubimage_list) : safeArray(data.img_url)
        if(safeArray(data.pubimage_list).length > 0){
            goodsImages = goodsImages.map((value, index) => {
                let imageModel = {
                    key: index.toString(),
                    cell: 'YFWGoodsDetailsPubImageCell',
                    image_url: safe(value),
                    width: isAndroid()?kScreenWidth/2:kScreenWidth,
                    height: isAndroid()?kScreenWidth/2:0,
                    onLoad:0,
                    opacity:0,
                    padding:36,
                }
                return imageModel
            })
            items.push({key:'goodsPubImage', numColumns:1, isRadius:false, items:goodsImages})
        } else if(safeArray(data.img_url).length > 0){
            goodsImages = goodsImages.map((value, index) => {
                let imageModel = {
                    key: index.toString(),
                    cell: 'YFWGoodsDetailsImageCell',
                    image_url: this._convertWatermark(safe(value)),
                    width: kScreenWidth-100,
                    height: kScreenWidth-100,
                    padding:36,
                }
                return imageModel
            })
            items.push({key:'goodsImage', numColumns:1, isRadius:false, items:goodsImages})
        }

        return {
            name: title,
            notice: notice,
            items: items
        }
    }

    /** 药房网承诺 */
    _getSaferguardModel(result) {
        let items = [
            {
                key: 'safe1',
                cell: 'YFWGoodsDetailsDescriptionCell',
                icon: require('../../img/sx_icon_zhibao.png'),
                title: '品质保障',
                content: '药房网商城在售商品均由正规实体签约商家供货，商家提供品质保证。在购物过程中发现任何商家有违规行为，请直接向我们投诉举报！'
            },
            {
                key: 'safe2',
                cell: 'YFWGoodsDetailsDescriptionCell',
                icon: require('../../img/sx_icon_piao.png'),
                title: '提供发票',
                content: '药房网商城所有在售商家均可提供商品发票'
            }
        ]

        if(safe(safeObj(result.getAPPBannerBottom).link).length > 0){
            items.push(
                {
                    key: 'safe3',
                    cell: 'YFWGoodsDetailsAptitudeCell',
                    icon: safe(safeObj(result.getAPPBannerBottom).imageurl),
                    link: safe(safeObj(result.getAPPBannerBottom).link),
                    type: safe(safeObj(result.getAPPBannerBottom).type),
                }
            )
        }
        return {
            title: '药房网商城承诺',
            key: 'saferguard',
            numColumns: 1,
            isRadius: true,
            items: items
        }
    }

    /**
     * 转换水印图
     * @param img
     * @returns {string}
     */
    _convertWatermark(img){
        if(img.includes('default')){
            return img;
        }else{
            return img+"_syp.jpg"
        }
    }

}
