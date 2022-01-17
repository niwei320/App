import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import YFWWDListPageDataModel from "../../Widget/Model/YFWWDListPageDataModel";

export default class YFWWDBrowsingHistoryModel extends YFWWDBaseModel{ 
    constructor() {
         super()
         this.listModel = new YFWWDListPageDataModel()
     }
 
 
 }