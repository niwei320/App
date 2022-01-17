import YFWWDBaseModel from '../../Base/YFWWDBaseModel';
import YFWWDStoreInfoModel from '../../Widget/Model/YFWWDStoreInfoModel';

/**
 * 商家首页数据模型
 */
export default class YFWWDStoreHomeModel extends YFWWDBaseModel{ 
    constructor() {
        super()
        this.shopInfo = new YFWWDStoreInfoModel()
        this.catagory = [],
        this.tabs = [],
        this.dataArray = []    //[YFWWDListPageDataModel,...]
        this.listModel = []
        this.listIndex = 0
    }
  
    static getStoreHomeData(paramMap,success, error ,showload) { 
        this.request(paramMap, (res) => { 
            success&&success(res)
        }, (err) => { 
            error&&error(err)
        },showload)
    }


}