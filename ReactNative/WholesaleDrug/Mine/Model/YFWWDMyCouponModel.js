import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import YFWWDListPageDataModel from "../../Widget/Model/YFWWDListPageDataModel";

export default class YFWWDMyCouponModel extends YFWWDBaseModel{ 
    constructor() {
        super()
        this.listModel = new YFWWDListPageDataModel()
        this.type = '0'
     }
 
 }