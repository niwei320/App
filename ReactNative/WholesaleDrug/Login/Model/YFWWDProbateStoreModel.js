import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import { YFWWDUploadImageInfoModel } from "../../Widget/Model/YFWWDUploadImageInfoModel";
import {findIndexOf, imgUrlReverseHander, safe} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";

export default class YFWWDProbateStoreModel extends YFWWDBaseModel{
    constructor() {
        super()

        this.pageType = 'store'                     //store 营业执照认证 institution 事业单位法人证书 privateUnit 民办非企业单位登记证书
        this.storeType = 'horizontal'                //横版 h（horizontal）、竖版 v（vertical）
        this.image = new YFWWDUploadImageInfoModel()
        this.image_example_h = 'http://upload.yaofangwang.com/common/images/zz/zz.jpg'
        this.image_example_v = 'http://upload.yaofangwang.com/common/images/zz/zz2.jpg'
        this.image_example_p = 'http://upload.yaofangwang.com/common/images/zz/mbfqydw.jpg'
        this.image_example_i = 'http://upload.yaofangwang.com/common/images/zz/sydwfrzs.jpg'
        this.storeName = ''
        this.storeAddress = ''
        this.storeStart = ''
        this.storeEnd = ''
        this.storeTel = ''
     }

     static initWithModel(data){
         let instance = new YFWWDProbateStoreModel();
         instance = data
         return instance;
     }

    static initWithData(data) {
         /**
          * auth: true
            end_date: "2020-04-13"
            image: "http://c1.yaofangwang.net/19/1019/870303cbb9cbe2a8a68701359f3b9c59.jpg"
            licence_code: "4222323423"
            phone: "021-2342222"
            register_address: "Daakannfjfafa"
            start_date: "2010-01-13"
            title: ""
          */
        let instance = new YFWWDProbateStoreModel();
        instance.storeStart = data.start_date
        instance.storeEnd = data.end_date
        instance.image = String(data.image).length == 0 ? new YFWWDUploadImageInfoModel() : new YFWWDUploadImageInfoModel({type:'image',uri:data.image,serviceUri:imgUrlReverseHander(data.image),success:true})
        instance.storeTel = data.phone
        instance.storeName = data.title
        instance.storeAddress = data.register_address
        return instance;
     }


 }
