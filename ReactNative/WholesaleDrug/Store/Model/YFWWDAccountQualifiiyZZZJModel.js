import YFWWDBaseModel from "../../Base/YFWWDBaseModel";

export default class YFWWDAccountQualifiiyZZZJModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.first_load = true
        this.dict_store_licence_type_list = []
        this.shopName = ''
     }

    static initWithModel(data){
        let instance
        instance = data
        return instance;
    }

 }
