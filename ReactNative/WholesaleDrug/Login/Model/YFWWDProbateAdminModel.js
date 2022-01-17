import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import { YFWWDUploadImageInfoModel } from "../../Widget/Model/YFWWDUploadImageInfoModel";
import {imgUrlReverseHander} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDProbateAdminModel extends YFWWDBaseModel{
    constructor(props) {
       super(props)
       this.idcard_pic_front = new YFWWDUploadImageInfoModel({name:'front'})
       this.idcard_pic_background = new YFWWDUploadImageInfoModel({ name: 'background' })
       this.idcard_pic_front_example = 'http://upload.yaofangwang.com/common/images/id-card1.png'
       this.idcard_pic_back_example = 'http://upload.yaofangwang.com/common/images/id-card2.png'
       this.name = ''
       this.idcard_num = ''
    }


     static initWithModel(data){
        let instance = new YFWWDProbateAdminModel();
        instance = data
        return instance;
     }


    static initWithData(data) {
         /**
          * auth: false
            idcardno: ""
            image_back: ""
            image_front: ""
            name: ""
          */
        let instance = new YFWWDProbateAdminModel();
       instance.idcard_pic_front = String(data.image_front).length == 0 ? new YFWWDUploadImageInfoModel({name:'front'}) : new YFWWDUploadImageInfoModel({type:'image',uri:data.image_front,serviceUri:imgUrlReverseHander(data.image_front),success:true,name:'front'})
        instance.idcard_pic_background = String(data.image_front).length == 0 ? new YFWWDUploadImageInfoModel({name:'background'}) : new YFWWDUploadImageInfoModel({type:'image',uri:data.image_back,serviceUri:imgUrlReverseHander(data.image_back),success:true,name:'background'})
        instance.name = data.name
        instance.idcard_num = data.idcardno
        return instance;
     }


 }
