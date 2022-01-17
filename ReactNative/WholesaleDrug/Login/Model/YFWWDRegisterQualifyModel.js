import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import {safeArray} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDRegisterQualifyModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.first_load = true
        this.licence_info_done = false //全部填写完成
        this.dict_account_audit = false //全部认证通过
        this.dict_store_licence_type_list = []
     }

    static initWithModel(data){
        let instance
        instance = data
        return instance;
    }

 }
