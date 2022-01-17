import YFWUserInfoManager from "./YFWUserInfoManager";
import YFWRequestViewModel from "./YFWRequestViewModel";

let instance = null
//搜索列表
export const kSearchListDataKey = 'kSearchListDataKey'
//商品详情
export const kBillListDataKey = 'kBillListDataKey'
//分类列表
export const kCatagaryListDataKey = 'kCatagaryListDataKey'
export default class YFWPrestrainCacheManager {

    constructor(){
        if (!instance) {
            instance = this

            this.cachedSearchListInfosMap = new Map()
            this.cachedBillListInfosMap = new Map()
            this.cachedEnable = false
            this.type = kSearchListDataKey
        }
        return instance
    }
    static sharedManager(params) {
        return new YFWPrestrainCacheManager()
    }

    changeCacheEnable(enable){
        this.cachedEnable = enable
    }

    changeType(newType){
        this.type = newType
    }

    clearCachedInfos(){
        this.getCachedInfosMap().clear()
        console.log('clear cachedInfo')
        console.log(this.cachedSearchListInfosMap)
        console.log(this.cachedBillListInfosMap)
    }

    cachedNewDatasWithList(list) {
        if (typeof (list) != 'object'||!this.cachedEnable) {
            return
        }
        switch (this.type) {
            case kSearchListDataKey:
                {
                    list.map((item)=>{
                        this._getGoodsShopData(item.goods_id)
                        this._getgoodsInfoData(item.goods_id)
                    })
                }
                break;
            case kCatagaryListDataKey:
                {
                    list.map((item)=>{
                        this._getGoodsShopData(item.medicine_id)
                        this._getgoodsInfoData(item.medicine_id)
                    })
                }
                break;
            case kBillListDataKey:
                {
                    list.map((item)=>{
                        this._getStoreMedicineDetail(item.shop_goods_id)
                    })
                }
                break;
        
            default:
                break;
        }
    }

    getCachedInfosMap(){
        switch (this.type) {
            case kSearchListDataKey:
                return this.cachedSearchListInfosMap
                break;
            case kCatagaryListDataKey:
                return this.cachedSearchListInfosMap
                break;
            case kBillListDataKey:
                return this.cachedBillListInfosMap
                break;
            default:
                break;
        }
        return new Map()
    }

    getCachedInfoWithKey(key){
        if (!key) {
            return {}
        }
        switch (this.type) {
            case kSearchListDataKey:
                {
                    let cachedMap = this.getCachedInfosMap()
                    let goodsInfo = cachedMap.get(key+'goodsInfo')
                    let shopListInfo = cachedMap.get(key+'shopListInfo')
                    return {goodsInfo:goodsInfo,shopListInfo:shopListInfo}
                }
                break;
            case kCatagaryListDataKey:
                {
                    let cachedMap = this.getCachedInfosMap()
                    let goodsInfo = cachedMap.get(key+'goodsInfo')
                    let shopListInfo = cachedMap.get(key+'shopListInfo')
                    return {goodsInfo:goodsInfo,shopListInfo:shopListInfo}
                }
                break;
            case kBillListDataKey:
                {
                    let cachedMap = this.getCachedInfosMap()
                    let goodsInfo = cachedMap.get(key+'goodsInfo')
                    return goodsInfo
                }
                break;
            default:
                return {}
                break;
        }
    }

    addCachedInfoWithKey(key,data){
        if (!key||!data||!this.cachedEnable) {
            return
        }
        let cachedMap = this.getCachedInfosMap()
        let cachedData = cachedMap.get(key)
        if (!cachedData) {
            cachedMap.set(key,data)
        }
    }

   
   _getStoreMedicineDetail(goodsId){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineDetail');
        paramMap.set('store_medicine_id', goodsId);
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        viewModel.TCPRequest(paramMap, (res)=> {
            if(res.result){}
            this.cachedBillListInfosMap.set(goodsId+'goodsInfo',res.result)
            console.log(goodsId+'goodsInfo cached'+res.result)
        },(error)=>{
            console.log(goodsId+'goodsInfo cached fail'+error)
        },false);
   }     


    //获取商品详情信息 @ Request @ -------------------
    _getgoodsInfoData(goodsId) {
        let goodsInfo = this.cachedSearchListInfosMap.get(goodsId+'goodsInfo')
        if (goodsInfo) {
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getMedicineDetail');
        paramMap.set('mid', goodsId);
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.cachedSearchListInfosMap.set(goodsId+'goodsInfo',res.result)
            console.log(goodsId+'goodsInfo cached'+res.result)
        }, (e) => {
            console.log(goodsId+'goodsInfo cached fail'+e)
        }, false);

    }

    //获取商家列表
    _getGoodsShopData(goodsId) {
        let shopListInfo = this.cachedSearchListInfosMap.get(goodsId+'shopListInfo')
        if (shopListInfo) {
            return
        }
        let paramMap = new Map();
        let conditions = {
            "sort": "",
            "sorttype": "",
            "medicineid": goodsId,
            "is_freepostage": "0",
            "lat": YFWUserInfoManager.ShareInstance().latitude,
            "lng": YFWUserInfoManager.ShareInstance().longitude,
            "user_city_name": YFWUserInfoManager.ShareInstance().getCity(),
            "user_region_id": YFWUserInfoManager.ShareInstance().getRegionId(),
        }
        paramMap.set('__cmd', 'guest.medicine.getShopMedicines');
        paramMap.set('pageSize', '10');
        paramMap.set('pageIndex', '1');
        paramMap.set('conditions', conditions);
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {

            this.cachedSearchListInfosMap.set(goodsId+'shopListInfo',res.result)
            console.log(goodsId+'shopListInfo cached'+res.result)

        }, (error) => {
            console.log(goodsId+'shopListInfo cached fail'+error)

        }, false);
    }



}