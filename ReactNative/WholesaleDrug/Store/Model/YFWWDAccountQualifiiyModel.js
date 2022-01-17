import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import YFWWDListPageDataModel from "../../Widget/Model/YFWWDListPageDataModel";

export default class YFWWDAccountQualifiiyModel extends YFWWDBaseModel{ 
    constructor() {
        super()
        this.shopName = ''
        this.first_load = true
        this.listInfo = new YFWWDListPageDataModel()
    }
}