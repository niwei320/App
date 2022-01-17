import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import YFWWDListPageDataModel from "../../Widget/Model/YFWWDListPageDataModel";

export default class YFWWDStoreAllGoodsModel extends YFWWDBaseModel{ 
    constructor() {
        super()
        this.listModel = new YFWWDListPageDataModel()         
        this.priceSumInShop = null           //判断是否来着购物车凑单
        this.showCollectBillsHint = false           //是否显示包邮满减信息
        this.collectBillsInfo = {}
        this.from = ''
     }
     
 
 
 }