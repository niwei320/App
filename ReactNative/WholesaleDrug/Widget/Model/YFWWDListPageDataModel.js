import YFWWDBaseModel from "../../Base/YFWWDBaseModel"

export default class YFWWDListPageDataModel extends YFWWDBaseModel{ 
    
    constructor() { 
        super()
        /**通用 */
        this.needRequest = true
        this.numColumns = 1             //每行显示几个item
        this.dataArray = []             //YFWWDMedicineInfoModel
        this.currentPage = 1  
        this.pageSize = 20
        this.refreshing= false
        this.showFoot = 0               //2:正在加载更多数据 0:空白footer刚进入list 1:没有数据了
        this.keyword = ''

        this.from = ''                  //页面来源 storehome商家首页    storeList 商家全部商品   operationsccess 付款成功  frequentlygoods 常购商品   history 浏览历史

        /**商家首页商品 */
        this.shopId = ''
        this.categoryId = ''
        this.orderField = 'sale_count'
        this.user_city_name = ''
        this.user_region_id = ''

        /**商家全部商品 */
        this.sort = 'sale_count desc'          //默认：sale_count desc  价格升序：price asc 价格降序：price desc
                           
    }

    static init(data) { 
        let instance = new YFWWDListPageDataModel()
        instance.needRequest = data.needRequest
        instance.numColumns = data.numColumns
        instance.keyword = data.keyword
        instance.dataArray = data.dataArray
        instance.currentPage = data.currentPage
        instance.pageSize = data.pageSize
        instance.loading= data.loading
        instance.showFoot = data.showFoot
        instance.from = data.from
        instance.shopId = data.shopId
        instance.categoryId = data.categoryId
        instance.orderField = data.orderField
        instance.user_city_name = data.user_city_name
        instance.user_region_id = data.user_region_id
        instance.sort = data.sort
        instance.paramMap = data.paramMap
        instance.dataPath = data.dataPath
        return instance
    }

    static getListPageDate(paramMap, success, error, showload) {
        this.request(paramMap, (res) => {
            success && success(res)
        }, (err) => {
            error && error(err)
        }, showload)
    }
    
    getListData(success,error,showload) {
        YFWWDListPageDataModel.request(this.paramMap, (res) => {
            success && success(res)
        }, (err) => {
            error && error(err)
        }, showload)
    }
}
