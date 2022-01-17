import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import YFWWDListPageDataModel from "../../Widget/Model/YFWWDListPageDataModel";

export default class YFWWDMessageListModel extends YFWWDBaseModel{ 
    constructor() {
        super()
        this.listModel = new YFWWDListPageDataModel()
    }

}