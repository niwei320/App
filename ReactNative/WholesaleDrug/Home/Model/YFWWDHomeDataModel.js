import React from 'react'
import {
    isNotEmpty,
    safe,
    safeArray,
    strMapToObj
} from "../../../PublicModule/Util/YFWPublicFunction";
export default class YFWWDHomeDataModel extends React.Component {

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
                    if (isNotEmpty(data.menuBackground_up)) {
                        banner_Data.bannerBackground_down = data.menuBackground_up.items
                    }
                    let menu_Data = data.menus;
                    menu_Data.style = 'menu';
                    menu_Data.menuBackground = data.menuBackground;

                    let ads_1F_1_Data = data.Proclamation?data.Proclamation:{}          //公告
                    ads_1F_1_Data.style = 'ads_1F_1'
                    if(ads_1F_1_Data.items) {
                        let tempArray = []
                        for (let k of Object.keys(ads_1F_1_Data.items)) {
                            let ss = ads_1F_1_Data.items[k]
                            tempArray = tempArray.concat(ss)
                        }
                        ads_1F_1_Data.items = tempArray
                    } else {
                        ads_1F_1_Data.items = []
                    }
                    if (isNotEmpty(data.ysjtBackground)) {
                        ads_1F_1_Data.bgImage = data.ysjtBackground.items[0];
                    }
                    let ads_1F_1_new_data = data.singleAd_1_new;
                    if(isNotEmpty(ads_1F_1_new_data)){
                        ads_1F_1_new_data.style = 'ads_1F_1_new';
                    }
                    let ads_1F_2_new_data = data.singleAd_1_goods_new;
                    if(isNotEmpty(ads_1F_2_new_data)){
                        ads_1F_2_new_data.style='ads_1F_2_new';
                    }
                    let ads_7F_tab = data.wholesale_medicine?data.wholesale_medicine:{}
                    ads_7F_tab.style = "ads_7F"
                    let ads_7F_plus_tab = {}
                    ads_7F_plus_tab.items = []
                    ads_7F_plus_tab.style = "ads_7F_plus"
                    let ads_medium = {}
                    if(safeArray(data.Ads).length>0){
                        ads_medium.items = data.Ads??[]
                        ads_medium.style = "ads_medium"
                    }
                    let ads_health_map = data.advertisement?data.advertisement:{};
                    ads_health_map.style = 'ads_health'
                    let tempArray = []
                    for (let k of Object.keys(ads_health_map.items)) {
                        let num = parseInt(k.split('-')[-1])
                        if (isNaN(num)) {
                            tempArray.push(ads_health_map.items[k][0])
                        } else {
                            tempArray[num] = ads_health_map.items[k][0]
                        }
                    }
                    ads_health_map.items = tempArray
                    items.push(banner_Data);
                    items.push(menu_Data);
                    items.push(ads_1F_1_Data);
                    items.push(ads_health_map)
                    items.push(ads_medium)
                    items.push(ads_7F_tab)
                    items.push(ads_7F_plus_tab)
                }
        }
        return items;
    }

    static getModelArray(array) {
        let model = new YFWWDHomeDataModel();
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
