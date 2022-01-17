import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import {convertShopImage, safeArray} from "../../../PublicModule/Util/YFWPublicFunction";
import { convertStar } from "../../../Utils/ConvertUtils";

export default class YFWWDStoreIntroductionModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.shopId = ''
        this.title = ''
        this.dict_store_status = false
        this.address = ''
        this.evaluation_count = ''
        this.total_star = ''
        this.service_star = ''      //客户服务评分
        this.service_rate = ''      //客户服务
        this.delivery_star = ''     //发货速度评分
        this.send_rate = ''         //发货速度
        this.shipping_star = ''     //物流速度评分
        this.logistics_rate = ''    //物流速度
        this.package_star = ''      //商品包装评分
        this.package_rate = ''      //商品包装
        this.return_rate = ''       //退单率
        this.avg_send_time = ''     //发货时长
        this.qualificationItems = []        //资质图片
        this.sceneItems = []        //实景图片

    }

    static initWithModel(data) {
        let instance = new YFWWDStoreIntroductionModel();
        instance.shopId = data.shopId
        instance.title = data.title
        instance.dict_store_status = data.dict_store_status
        instance.address = data.address
        instance.total_star = data.total_star
        instance.evaluation_count = data.evaluation_count
        instance.service_star = data.service_star      //客户服务评分
        instance.service_rate = data.service_rate      //客户服务
        instance.delivery_star = data.delivery_star     //发货速度评分
        instance.send_rate = data.send_rate         //发货速度
        instance.shipping_star = data.shipping_star     //物流速度评分
        instance.logistics_rate = data.logistics_rate    //物流速度
        instance.package_star = data.package_star      //商品包装评分
        instance.package_rate = data.package_rate      //商品包装
        instance.return_rate = data.return_rate       //退单率
        instance.avg_send_time = data.avg_send_time     //发货时长
        instance.qualificationItems = data.qualificationItems        //资质图片
        instance.sceneItems = data.sceneItems
        return instance
    }

     static initWithData(data,images){
        let instance = new YFWWDStoreIntroductionModel();
        instance.title = data.title
        instance.dict_store_status = data.dict_store_status == 4?true:false
        instance.address = data.address
        instance.evaluation_count = data.evaluation_count
        instance.total_star = convertStar(data.total_star),
        instance.service_star = convertStar(data.service_star)      //客户服务评分
        instance.service_rate = Number.parseFloat(data.service_rate).toFixed(1)+'%',      //客户服务
        instance.delivery_star = convertStar(data.send_star)     //发货速度评分
        instance.send_rate = Number.parseFloat(data.send_rate).toFixed(1)+'%'      //发货速度
        instance.shipping_star = convertStar(data.logistics_star)     //物流速度评分
        instance.logistics_rate = Number.parseFloat(data.logistics_rate).toFixed(1)+'%',   //物流速度
        instance.package_star = convertStar(data.package_star)      //商品包装评分
        instance.package_rate = Number.parseFloat(data.package_rate).toFixed(1)+'%',      //商品包装
        instance.return_rate = Number.parseFloat(data.return_rate).toFixed(1)+'%',       //退单率
        instance.avg_send_time = Number.parseFloat(data.avg_send_time).toFixed(1)+'小时',     //发货时长
        instance.qualificationItems = safeArray(images.zz_items).map((item) => { return {
            image_name:item.image_name,
            image_file: convertShopImage(item.show_image_suffix,item.image_url),
            url:convertShopImage(item.show_image_suffix,item.image_url),
        }})        //资质图片
        instance.sceneItems =  safeArray(images.sj_items).map((item) => { return {
            image_name:item.image_name,
            image_file:convertShopImage(item.show_image_suffix,item.image_url),
            url:convertShopImage(item.show_image_suffix,item.image_url),
        }})
        return instance;
     }



 }
