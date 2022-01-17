import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import { YFWWDUploadImageInfoModel } from "../../Widget/Model/YFWWDUploadImageInfoModel";
import {imgUrlReverseHander} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDProbateQualifyModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.storeType = 'one'                // one（horizontal）、竖版 v（vertical）
        this.image = new YFWWDUploadImageInfoModel()
        this.image_example_1 = 'http://upload.yaofangwang.com/common/images/zz/xk.jpg'
        this.image_example_2 = 'http://upload.yaofangwang.com/common/images/zz/spypjyxkz.png'
        this.shop_title = ''             //企业名称
        this.licence_code = ''           //许可证号
        this.charge_person = ''           //企业负责人
        this.quality_leader = ''         //质量负责人
        this.start_date = ''             //发证日期
        this.end_date = ''              //截止日期
        this.license_issuer = ''         //发证单位
        this.register_address = ''      //注册地址
        this.operate_address = ''       //经营地址
        this.warehouse_address = ''     //仓库地址
        this.scope = ''                 //经营范围
     }

     static initWithModel(data){
         let instance = new YFWWDProbateQualifyModel();
         instance = data
         return instance;
     }

    static initWithData(data) {
         /**
          * auth: false
            charge_person: ""
            end_date: ""
            image: ""
            legal_person: ""
            licence_code: ""
            license_issuer: ""
            operate_address: ""
            quality_leader: ""
            register_address: ""
            scope: ""
            start_date: ""
            title: ""
            warehouse_address: ""
          */
      let instance = new YFWWDProbateQualifyModel();
        instance.image = String(data.image).length == 0 ? new YFWWDUploadImageInfoModel() : new YFWWDUploadImageInfoModel({type:'image',uri:data.image,serviceUri:imgUrlReverseHander(data.image),success:true})
        instance.charge_person = data.charge_person
        instance.start_date = data.start_date
        instance.end_date = data.end_date
        instance.quality_leader = data.quality_leader
        instance.licence_code = data.licence_code
        instance.license_issuer = data.license_issuer
        instance.operate_address = data.operate_address
        instance.register_address = data.register_address
        instance.scope = data.scope
        instance.shop_title = data.title
        instance.warehouse_address = data.warehouse_address
        return instance;
     }
 }
