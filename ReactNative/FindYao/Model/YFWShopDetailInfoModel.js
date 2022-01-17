import React from 'react';
import {isNotEmpty} from '../../PublicModule/Util/YFWPublicFunction';
import {convertStar} from "../../Utils/ConvertUtils";

export default class YFWShopDetailInfoModel {

    constructor(props){

        this.coupons_list = [];



    }

    setModelData(data){

        if (isNotEmpty(data) && isNotEmpty(data.shop_id)) {

            let couponsList = [];
            if (data.coupons_list) {
                data.coupons_list.forEach((item,index)=>{
                    couponsList.push(
                        {
                            money:item.price,
                            title:item.title,
                            id:item.id,
                        }
                    );
                });
            }

            return {
                shop_id:data.shop_id,
                title:data.title,
                logo_img_url:data.logo_image,
                phone:data.phone,
                address:data.address,
                business_scope:data.business_scope,
                latitude:data.latitude,
                longitude:data.longitude,
                service_star:convertStar(data.service_star),
                delivery_star:convertStar(data.send_star),
                shipping_star:convertStar(data.logistics_star),
                package_star:convertStar(data.package_star),
                total_star:convertStar(data.total_star),
                region_name:data.region_name,
                contract:data.contract,
                return_rate:Number.parseFloat(data.return_rate).toFixed(1)+'%',
                avg_send_time:Number.parseFloat(data.avg_send_time).toFixed(1)+'小时',
                open_time:data.open_time,
                evaluation_count:data.evaluation_count,
                service_rate:Number.parseFloat(data.service_rate).toFixed(1)+'%',
                send_rate:Number.parseFloat(data.send_rate).toFixed(1)+'%',
                logistics_rate:Number.parseFloat(data.logistics_rate).toFixed(1)+'%',
                package_rate:Number.parseFloat(data.package_rate).toFixed(1)+'%',
                evaluation:data.licence_items,
                is_favorite:data.is_favorite,
                coupons_list:couponsList,
                dict_store_status:data.dict_store_status
            }
        } else {
            return {
                shop_id:'',
                title:'',
                logo_img_url:'',
                phone:'',
                address:'',
                business_scope:'',
                latitude:'',
                longitude:'',
                service_star:'',
                delivery_star:'',
                shipping_star:'',
                package_star:'',
                total_star:'',
                region_name:'',
                contract:'',
                return_rate:'',
                avg_send_time:'',
                open_time:'',
                evaluation_count:'',
                service_rate:'',
                send_rate:'',
                logistics_rate:'',
                package_rate:'',
                evaluation:'',
                is_favorite:'0',
                coupons_list:[],
                dict_store_status:0
            }
        }
    }

    static getModelArray(array){
        let model = new YFWShopDetailInfoModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}