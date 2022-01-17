import React from 'react'
import {isNotEmpty, safe, strMapToObj, safeArray, isArray, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
export default class YFWHomeDataModel extends React.Component {

    constructor(props) {
        super(props);

    }

    setModelData(data) {
        let items = [];
        if (isNotEmpty(data)) {
                if (isNotEmpty(data)) {
                    let banner_Data = data.banner;
                    banner_Data.style ='banner';
                    banner_Data.bannerBackground_down=[];
                    if (isNotEmpty(data.menuBackground_up)&&isNotEmpty(data.menuBackground_up.items)&&isArray(data.menuBackground_up.items)&&data.menuBackground_up.items.length > 0) {
                        banner_Data.bannerBackground_down = data.menuBackground_up.items
                    }
                    let menu_Data = safeObj(data.menus);
                    menu_Data.style = 'menu';
                    menu_Data.menuBackground = safeObj(data.menuBackground);
                    menu_Data.items  = safeArray(menu_Data.items)

                    let ads_1F_1_Data = data.singleAd_1;
                    ads_1F_1_Data.style = 'ads_1F_1';
                    ads_1F_1_Data.bgImage = ''
                    if (isNotEmpty(data.ysjtBackground)&&isNotEmpty(data.ysjtBackground.items)&&isArray(data.ysjtBackground.items)&&data.ysjtBackground.items.length > 0) {
                        ads_1F_1_Data.bgImage = data.ysjtBackground.items[0];
                    }
                    let ads_1F_2_new_data = data.singleAd_1_goods_new || {};
                    if(isNotEmpty(ads_1F_2_new_data)){
                        ads_1F_2_new_data.style='ads_1F_2_new';
                    }
                    let ads_7F_tab = data.ads_7F_tab?data.ads_7F_tab:{}
                    ads_7F_tab.style = "ads_7F"
                    let ads_health_map = data.ads_health_map?data.ads_health_map:{}
                    ads_health_map.style = 'ads_health'
                    items.push(banner_Data);
                    items.push(menu_Data);
                    if (data.ads_promotion && data.ads_promotion.items && safeArray(data.ads_promotion.items).length > 0) {
                        let ads_main = {
                            style:'ads_main',
                            items:data.ads_promotion.items[0],
                        }
                        items.push(ads_main)
                    } else {
                        items.push(ads_1F_1_Data);
                    }
                    if (data.ads_promotion_category && data.ads_promotion_category.items && safeArray(data.ads_promotion_category.items).length > 0) {
                        let subItems = []
                        let backgroundItem = {}
                        data.ads_promotion_category.items.map((info)=>{
                            if (info.type == "background") {
                                backgroundItem = info
                            } else {
                                subItems.push(info)
                            }
                        })
                        let ads_sub = {
                            style:'ads_sub',
                            bgImage: backgroundItem.img_url,
                            img_width:backgroundItem.img_width,
                            img_height:backgroundItem.img_height,
                            items:subItems,
                        }
                        items.push(ads_sub)
                    } else {
                        if(isNotEmpty(ads_1F_2_new_data)){
                            items.push(ads_1F_2_new_data);
                        }
                    }
                    
                    items.push(ads_health_map)
                    items.push({style:'findDrug'})
                    items.push({style:'topMenu',data:ads_7F_tab})
                    items.push(ads_7F_tab)
                }
        }
        return items;
    }

    static getModelArray(array) {
        let model = new YFWHomeDataModel();
        let ModeData =  model.setModelData(array);
        return ModeData;

    }

    static getQualificationData(data) {
        let qualification_data = {};
        if (isNotEmpty(data)){
            qualification_data = {
                "type": "qualification",
                "style": "qualification",
                "items": [{
                    "img_width": null,
                    "img_url": data.imageurl,
                    "img_height": null,
                    "name": "资质证书",
                    "title":"资质证书",
                    "type": "get_h5",
                    "isHiddenShare":true,
                    "value": data.link,
                }]
            };
        }
        return qualification_data;

    }
}