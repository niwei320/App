import { deepCopyObj, itemAddKey, safe, safeArray, safeFloatNumber, safeNumber, safeObj, strMapToArray, strMapToObj } from "../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import ApiInfo from "./ApiInfo";
import {YFWSearchRequest,YFWBaseRequest,YFWGoodsRequest,YFWHomeRequest,YFWShopCartRequest,YFWSellersRequest,YFWMineRequest,YFWStoreRequest,} from "../../YFWApi"
import { DeviceEventEmitter } from "react-native";
import YFWRequestParam from "../../Utils/YFWRequestParam";
import YBApiHelper from "../Util/YBApiHelper";
let instance = null;


export default class YBAllApi {
    constructor(){
        if (!instance) {
        instance = this;
        this.searchApis = new Map()
        this.otherApis = new Map()
        this.addBuyApis = new Map()
        this._initSearchApis()
        this._initAddBuyApis()
        this._initOtherApis()
        this.fetchListener = DeviceEventEmitter.addListener('kFetchDataFromServer',(paramsMap)=>{this.dealApiFetchParams(paramsMap)})
        }
        return instance;
    }
    static ShareInstance(){
        let singleton = new YBAllApi();
        return singleton;
    }

    dealApiFetchParams(paramsMap) {
        if (paramsMap instanceof Map) {
            let copyParamsMap = new Map()
            for (let [k,v] of paramsMap) {
                copyParamsMap.set(k,v)
            }
            let paramObj = new YFWRequestParam();
            let baseParam = paramObj.getBaseParam(new Map());
            for (let [k,v] of baseParam) {
                copyParamsMap.set(k,v)
            }
            let cmd = copyParamsMap.get('__cmd')
            copyParamsMap.delete('__cmd')
            copyParamsMap.delete('timestamp')
            if (this.searchApis.get(cmd)) {
                this.searchApis.get(cmd).paramsMap = copyParamsMap
            } else if (this.addBuyApis.get(cmd)) {
                this.addBuyApis.get(cmd).paramsMap = copyParamsMap
            } else if (this.otherApis.get(cmd)) {
                this.otherApis.get(cmd).paramsMap = copyParamsMap
            }
        }
    }

    _initSearchApis() {
        let obj_getHotKeywords = {
            cmd:'guest.sitemap.getHotKeywords',
            cmdCN:'热门搜索',
            requestClass:YFWSearchRequest,
            functionName:'getHotSearchData'
            }
        this.searchApis.set(obj_getHotKeywords.cmd,(new ApiInfo()).initWithMap(obj_getHotKeywords))

        let obj_getAssociateKeywords = {
            cmd:'guest.medicine.getAssociateKeywords',
            cmdCN:'搜索联想词',
            requestClass:YFWSearchRequest,
            functionName:'getAssociateKeywords',
            params:['感冒'],
            paramsFetchRule:[{
                cmd: 'guest.sitemap.getHotKeywords',
                key: null,
                valueType: 'array',
                valueIndex:0,
                valueName:'keywords_name',
            }],
        }
        this.searchApis.set(obj_getAssociateKeywords.cmd,(new ApiInfo()).initWithMap(obj_getAssociateKeywords))

        let obj_getSearchStandard = {
            cmd:'guest.medicine.getSearchStandard',
            cmdCN:'药品规格',
            requestClass:YFWSearchRequest,
            functionName:'getStandardData',
            params:['999'],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getAssociateKeywords',
                key: null,
                valueType: 'array',
                valueIndex:0,
                valueName:null,
            }],
        }
        this.searchApis.set(obj_getSearchStandard.cmd,(new ApiInfo()).initWithMap(obj_getSearchStandard))

        let obj_getSearchPageData = {
            cmd:'guest.medicine.getSearchPageData',
            cmdCN:'搜索商品',
            requestClass:YFWSearchRequest,
            functionName:'searchMedicine',
            params:['999',1,''],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getAssociateKeywords',
                key: null,
                valueType: 'array',
                valueIndex:0,
                valueName:null,
            }],
        }
        this.searchApis.set(obj_getSearchPageData.cmd,(new ApiInfo()).initWithMap(obj_getSearchPageData))

        let obj_getMedicineDetail = {
            cmd:'guest.medicine.getMedicineDetail',
            cmdCN:'比价商品信息',
            requestClass:YFWSellersRequest,
            functionName:'getSellersMedicineData',
            params:['521443'],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getSearchPageData',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'medicineid',
            }],
        }
        this.searchApis.set(obj_getMedicineDetail.cmd,(new ApiInfo()).initWithMap(obj_getMedicineDetail))

        let conditions = {
            "sort": "distance",//默认距离排序
            "sorttype": "asc",
            "medicineid": '521443',
            "discount": "0", //是否选中多件优惠
            "lat": YFWUserInfoManager.ShareInstance().latitude,
            "lng": YFWUserInfoManager.ShareInstance().longitude,
            "user_city_name": YFWUserInfoManager.ShareInstance().getCity(),
            "user_region_id": YFWUserInfoManager.ShareInstance().getRegionId(),
        }
        let obj_getShopMedicines = {
            cmd:'guest.medicine.getShopMedicines',
            cmdCN:'比价商家列表',
            requestClass:YFWSellersRequest,
            functionName:'getSellersStoreMedicineData',
            params:[JSON.stringify(conditions),1],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getSearchPageData',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'medicineid',
                valueDealFunction:(item)=>{
                conditions.medicineid = item
                return JSON.stringify(conditions)
                }
            }],
            businessTestParams:[0],
            businessTestParamsFetchRule:[{
                cmd: 'guest.medicine.getMedicineDetail',
                valueType: 'object',
                key:'shop_num',
            }],
            businessTestFunction:(res,self)=>{
                console.log(self.businessTestParams)
                let scores = []
                self.businessTestScores = scores
                return scores
            }
        }
        this.searchApis.set(obj_getShopMedicines.cmd,(new ApiInfo()).initWithMap(obj_getShopMedicines))

        let obj_getShopMedicinesAndDetail = {
            cmd:'guest.medicine.getMedicineDetail as details,guest.medicine.getShopMedicines as shopmedicines',
            cmdCN:'比价商品信息和商家列表',
            requestClass:YFWSellersRequest,
            functionName:'getSellersData',
            params:['521443',JSON.stringify(conditions)],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getSearchPageData',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'medicineid',
            },{
                cmd: 'guest.medicine.getSearchPageData',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'medicineid',
                valueDealFunction:(item)=>{
                conditions.medicineid = item
                return JSON.stringify(conditions)
                }
            }],
            businessTestFunction:(res,self,callBack)=>{
                let result = safeObj(res.result)
                let detailsInfo = safeObj(result.details)
                let shopmedicinesInfo = safeObj(result.shopmedicines)
                let shop_num = safeNumber(detailsInfo.shop_num,-1)
                let scores = []
                if (shop_num == -1) {
                    scores.push({result:false,desc:'获取异常',title:'在售商家数'})
                } else {
                    let real_pageCount = Math.ceil(shop_num/10)
                    let yilaiApiInfo = this.searchApis.get('guest.medicine.getShopMedicines')
                    safeArray(yilaiApiInfo.params)[1] = real_pageCount
                    YBApiHelper.fetchDataFromServer(yilaiApiInfo).then((info)=>{
                        let result = safeObj(safeObj(info.result).result)
                        let real_shop_num = safeArray(result.dataList).length + 10 * Math.max(real_pageCount - 1,0)
                        let passStatus = real_shop_num == shop_num
                        scores.push({result:passStatus,desc:(passStatus)?shop_num+'家':'期望'+shop_num+'家，'+'实际'+real_shop_num+'家',title:'在售商家数'})
                    },(error)=>{
                        scores.push({result:false,desc:'获取异常',title:'在售商家数'})
                    }).finally(()=>{
                        self.businessTestScores = scores
                        callBack&&
                        Object.prototype.toString.call(callBack) === '[object Function]'&&
                        callBack()
                    })
                }
                return scores
            }
        }
        this.searchApis.set(obj_getShopMedicinesAndDetail.cmd,(new ApiInfo()).initWithMap(obj_getShopMedicinesAndDetail))

        let obj_getBJMedicineDetail = {
            cmd:'guest.shopMedicine.getBJMedicineDetail',
            cmdCN:'商品加购套餐信息',
            requestClass:YFWSellersRequest,
            functionName:'getSellersPackageData',
            params:[''],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.searchApis.set(obj_getBJMedicineDetail.cmd,(new ApiInfo()).initWithMap(obj_getBJMedicineDetail))

    }

    _initAddBuyApis() {
        let obj_getStoreMedicineDetail = {
            cmd:'guest.shopMedicine.getStoreMedicineDetail',
            requestClass:YFWGoodsRequest,
            cmdCN:'商品详情',
            functionName:'getMedicineData',
            params:['26258705'],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.addBuyApis.set(obj_getStoreMedicineDetail.cmd,(new ApiInfo()).initWithMap(obj_getStoreMedicineDetail))

        let obj_addCart = {
            cmd:'person.cart.addCart',
            cmdCN:'加入购物车/立即购买',
            requestClass:YFWShopCartRequest,
            functionName:'addMedicineToCart',
            params:['26258705',1,'buy'],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.addBuyApis.set(obj_addCart.cmd,(new ApiInfo()).initWithMap(obj_addCart))

        let obj_getReceiptAddress = {
            cmd:'person.address.getReceiptAddress',
            cmdCN:'收货地址列表',
            requestClass:YFWMineRequest,
            functionName:'getReceiveAddressData',
            params:[1]
        }
        this.addBuyApis.set(obj_getReceiptAddress.cmd,(new ApiInfo()).initWithMap(obj_getReceiptAddress))

        let obj_getBuy = {
            cmd:'person.cart.getBuy',
            cmdCN:'结算信息',
            requestClass:YFWShopCartRequest,
            functionName:'getBuyData',
            params:['','','',''],
            paramsFetchRule:[{
                cmd: 'person.address.getReceiptAddress',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            },
            {
                cmd: 'person.cart.addCart',
                key: 'cartids',
                valueType: 'array',
                valueDealFunction: (item) => {
                item = safeArray(item)
                return item.join(',')
                }
            },
            {
                cmd: 'person.cart.addCart',
                key: 'packageids',
                valueType: 'array',
                valueDealFunction: (item) => {
                item = safeArray(item)
                return item.join(',')
                }
            }],
        }
        this.addBuyApis.set(obj_getBuy.cmd,(new ApiInfo()).initWithMap(obj_getBuy))
    }

    _initOtherApis() {
        let obj_getCartCount = {
            cmd:'person.cart.getCartCount',
            cmdCN:'购物车数量角标',
            requestClass:YFWBaseRequest,
            functionName:'getShopCartCount',
        }
        this.otherApis.set(obj_getCartCount.cmd,(new ApiInfo()).initWithMap(obj_getCartCount))

        let obj_getTopVisitMedicine = {
            cmd:'guest.medicine.getTopVisitMedicine',
            cmdCN:'推荐商品列表',
            requestClass:YFWBaseRequest,
            functionName:'getRecommendMedicine',
        }
        this.otherApis.set(obj_getTopVisitMedicine.cmd,(new ApiInfo()).initWithMap(obj_getTopVisitMedicine))

        let obj_isCertification = {
            cmd:'person.account.isCertification',
            cmdCN:'实名认证状态',
            requestClass:YFWBaseRequest,
            functionName:'getRealNameStatus',
        }
        this.otherApis.set(obj_isCertification.cmd,(new ApiInfo()).initWithMap(obj_isCertification))

        let obj_getFindYao = {
            cmd:'guest.common.app.getFindYao',
            cmdCN:'找药首页',
            requestClass:YFWSearchRequest,
            functionName:'getFindYaodData',
        }
        this.otherApis.set(obj_getFindYao.cmd,(new ApiInfo()).initWithMap(obj_getFindYao))

        let obj_getCategoryList = {
            cmd:'guest.category.getCategoryList',
            cmdCN:'商品分类',
            requestClass:YFWSearchRequest,
            functionName:'getCategoryData',
        }
        this.otherApis.set(obj_getCategoryList.cmd,(new ApiInfo()).initWithMap(obj_getCategoryList))

        let conditionsMap = new Map()
        conditionsMap.set('categoryid', 70);
        conditionsMap.set('sort', '');
        conditionsMap.set('sorttype', '');
        let obj_getMedicines = {
            cmd:'guest.medicine.getMedicines',
            cmdCN:'某子分类商品列表',
            requestClass:YFWSearchRequest,
            functionName:'getCategoryMedicineData',
            params:[JSON.stringify(strMapToObj(conditionsMap)),1]
        }
        this.otherApis.set(obj_getMedicines.cmd,(new ApiInfo()).initWithMap(obj_getMedicines))

        let obj_getSearchShop = {
            cmd:'guest.common.app.getSearchShop',
            cmdCN:'商家搜索',
            requestClass:YFWSearchRequest,
            functionName:'searchStore',
            params:['上海',1]
        }
        this.otherApis.set(obj_getSearchShop.cmd,(new ApiInfo()).initWithMap(obj_getSearchShop))

        let obj_getNearShop = {
            cmd:'guest.common.app.getNearShop',
            cmdCN:'附近商家',
            requestClass:YFWSearchRequest,
            functionName:'getNearestStore',
        }
        this.otherApis.set(obj_getNearShop.cmd,(new ApiInfo()).initWithMap(obj_getNearShop))

        let obj_getStoreMedicineSearch = {
            cmd:'guest.shopMedicine.getStoreMedicineSearch',
            cmdCN:'商家内搜索商品',
            requestClass:YFWSearchRequest,
            functionName:'searchStoreMedicine',
            params:['999',1,'','110'],
            paramsFetchRule:[{},{},{},
            {
                cmd: 'guest.common.app.getSearchShop',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.otherApis.set(obj_getStoreMedicineSearch.cmd,(new ApiInfo()).initWithMap(obj_getStoreMedicineSearch))

        let obj_collectStoreGoods = {
            cmd:'person.favorite.collectStoreGoods',
            requestClass:YFWGoodsRequest,
            cmdCN:'收藏商品',
            functionName:'collectMedicine',
            params:['26258705',''],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            },
            {
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'storeid',
            }],
        }
        this.otherApis.set(obj_collectStoreGoods.cmd,(new ApiInfo()).initWithMap(obj_collectStoreGoods))

        let obj_cancelCollectStoreGoods = {
            cmd:'person.favorite.cancelCollectStoreGoods',
            requestClass:YFWGoodsRequest,
            cmdCN:'取消收藏商品',
            functionName:'uncollectMedicine',
            params:['26258705',''],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            },
            {
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'storeid',
            }],
        }
        this.otherApis.set(obj_cancelCollectStoreGoods.cmd,(new ApiInfo()).initWithMap(obj_cancelCollectStoreGoods))

        let obj_setPriceOffNotice = {
            cmd:'person.account.setPriceOffNotice',
            requestClass:YFWGoodsRequest,
            cmdCN:'降价通知',
            functionName:'noticeOfLoweringPrice',
            params:['26258705',1],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            },{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'real_price',
            },{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'real_price',
                valueDealFunction:(price)=>{
                    return safeFloatNumber(price,'1.0') - 0.5
                }
            }],
        }
        this.otherApis.set(obj_setPriceOffNotice.cmd,(new ApiInfo()).initWithMap(obj_setPriceOffNotice))


        let obj_getEvaluationByStoreId = {
            cmd:'guest.evaluation.getEvaluationByStoreId',
            requestClass:YFWGoodsRequest,
            cmdCN:'评论列表',
            functionName:'getMedicineCommentsData',
            params:['26258705',1],
            paramsFetchRule:[{
                cmd: 'guest.medicine.getShopMedicines',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'storeid',
            }],
        }
        this.otherApis.set(obj_getEvaluationByStoreId.cmd,(new ApiInfo()).initWithMap(obj_getEvaluationByStoreId))

        let obj_getQuestionAskList = {
            cmd:'guest.medicine.getQuestionAskList',
            requestClass:YFWGoodsRequest,
            cmdCN:'常见问题问答',
            functionName:'getMedicineQAData',
        }
        this.otherApis.set(obj_getQuestionAskList.cmd,(new ApiInfo()).initWithMap(obj_getQuestionAskList))

        let obj_getShopInfo = {
            cmd:'guest.shop.getShopInfo',
            cmdCN:'店铺详情',
            requestClass:YFWStoreRequest,
            functionName:'getStoreData',
            params:['999'],
            paramsFetchRule:[
            {
                cmd: 'guest.common.app.getSearchShop',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.otherApis.set(obj_getShopInfo.cmd,(new ApiInfo()).initWithMap(obj_getShopInfo))

        let obj_getShopQualification = {
            cmd:'guest.shop.getShopQualification',
            cmdCN:'店铺资质照片',
            requestClass:YFWStoreRequest,
            functionName:'getStoreQualificationData',
            params:['999'],
            paramsFetchRule:[
            {
                cmd: 'guest.common.app.getSearchShop',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.otherApis.set(obj_getShopQualification.cmd,(new ApiInfo()).initWithMap(obj_getShopQualification))

        let obj_getStoreMedicineTop = {
            cmd:'guest.shopMedicine.getStoreMedicineTop',
            cmdCN:'店铺推荐商品',
            requestClass:YFWStoreRequest,
            functionName:'getStoreRecommendMedicine',
            params:['999'],
            paramsFetchRule:[
            {
                cmd: 'guest.common.app.getSearchShop',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.otherApis.set(obj_getStoreMedicineTop.cmd,(new ApiInfo()).initWithMap(obj_getStoreMedicineTop))

        let obj_getCategroyByParentId = {
            cmd:'guest.shopMedicine.getCategroyByParentId',
            cmdCN:'店铺商品分类',
            requestClass:YFWStoreRequest,
            functionName:'getStoreCategoryData',
        }
        this.otherApis.set(obj_getCategroyByParentId.cmd,(new ApiInfo()).initWithMap(obj_getCategroyByParentId))

        let obj_collectStore = {
            cmd:'person.favorite.collectStore',
            cmdCN:'收藏店铺',
            requestClass:YFWStoreRequest,
            functionName:'collectStore',
            params:['999'],
            paramsFetchRule:[
            {
                cmd: 'guest.common.app.getSearchShop',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.otherApis.set(obj_collectStore.cmd,(new ApiInfo()).initWithMap(obj_collectStore))

        let obj_cancelCollectStore = {
            cmd:'person.favorite.cancelCollectStore',
            cmdCN:'取消收藏店铺',
            requestClass:YFWStoreRequest,
            functionName:'uncollectStore',
            params:['999'],
            paramsFetchRule:[
            {
                cmd: 'guest.common.app.getSearchShop',
                key: 'dataList',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }],
        }
        this.otherApis.set(obj_cancelCollectStore.cmd,(new ApiInfo()).initWithMap(obj_cancelCollectStore))

        let obj_getIndexData_new = {
            cmd:'guest.common.app.getIndexData_new',
            cmdCN:'首页',
            requestClass:YFWHomeRequest,
            functionName:'getHomeData',
            businessTestFunction:(res,self)=>{
                let scores = []
                let result = safeObj(res.result)
                let data_items = safeObj(result.data_items)
                let bannerArray = safeArray(safeObj(data_items.banner).items)
                scores.push({result:(bannerArray.length > 0),desc:bannerArray.length+'条',title:'Banner数据'})
                let menuArray = safeArray(safeObj(data_items.menus).items)
                scores.push({result:(menuArray.length > 0),desc:menuArray.length+'条',title:'金刚区数据'})
                let ysjtArray = safeArray(safeObj(data_items.singleAd_1).items)
                scores.push({result:(ysjtArray.length > 0),desc:ysjtArray.length+'条',title:'药师讲堂数据'})
                let adArray = safeArray(safeObj(data_items.singleAd_1_goods_new).items)
                scores.push({result:(adArray.length > 0),desc:adArray.length+'条',title:'商城频道数据'})
                let goodsArray = safeArray(safeObj(data_items.ads_7F_tab).items)
                scores.push({result:(goodsArray.length > 0),desc:goodsArray.length+'条',title:'底部商品数据'})
                self.businessTestScores = scores
                return scores
            }
        }
        this.otherApis.set(obj_getIndexData_new.cmd,(new ApiInfo()).initWithMap(obj_getIndexData_new))

        let obj_getStoreJoinAccountInfo = {
            cmd:'guest.common.app.getStoreJoinAccountInfo',
            cmdCN:'联合会员信息',
            requestClass:YFWHomeRequest,
            functionName:'getStoreAccountData',
        }
        this.otherApis.set(obj_getStoreJoinAccountInfo.cmd,(new ApiInfo()).initWithMap(obj_getStoreJoinAccountInfo))

        let obj_getIndexPopupAds_new = {
            cmd:'guest.common.app.getIndexPopupAds_new',
            cmdCN:'首页弹框广告',
            requestClass:YFWHomeRequest,
            functionName:'getAdsData',
        }
        this.otherApis.set(obj_getIndexPopupAds_new.cmd,(new ApiInfo()).initWithMap(obj_getIndexPopupAds_new))

        let obj_getAPPBannerBottom = {
            cmd:'guest.common.app.getAPPBannerBottom',
            cmdCN:'首页平台资质广告',
            requestClass:YFWHomeRequest,
            functionName:'getBottomAdsData',
        }
        this.otherApis.set(obj_getAPPBannerBottom.cmd,(new ApiInfo()).initWithMap(obj_getAPPBannerBottom))

        let obj_getAccountInfo = {
            cmd:'person.account.getAccountInfo',
            cmdCN:'账户信息',
            requestClass:YFWMineRequest,
            functionName:'getAccountInfo',
        }
        this.otherApis.set(obj_getAccountInfo.cmd,(new ApiInfo()).initWithMap(obj_getAccountInfo))

        let obj_getUserCollectionStoreGoods = {
            cmd:'person.favorite.getUserCollectionStoreGoods',
            cmdCN:'收藏商品列表',
            requestClass:YFWMineRequest,
            functionName:'getCollectionGoodsData',
            params:[1]
        }
        this.otherApis.set(obj_getUserCollectionStoreGoods.cmd,(new ApiInfo()).initWithMap(obj_getUserCollectionStoreGoods))

        let obj_getUserCollectionStore = {
            cmd:'person.favorite.getUserCollectionStore',
            cmdCN:'收藏店铺列表',
            requestClass:YFWMineRequest,
            functionName:'getCollectionStoreData',
            params:[1]
        }
        this.otherApis.set(obj_getUserCollectionStore.cmd,(new ApiInfo()).initWithMap(obj_getUserCollectionStore))

        let obj_getTrafficnoList = {
            cmd:'person.order.getTrafficnoList',
            cmdCN:'最新物流信息列表',
            requestClass:YFWMineRequest,
            functionName:'getTrafficnoList',
        }
        this.otherApis.set(obj_getTrafficnoList.cmd,(new ApiInfo()).initWithMap(obj_getTrafficnoList))

        let obj_GetListByAccountId= {
            cmd:'person.userdrug.GetListByAccountId',
            cmdCN:'用药人列表',
            requestClass:YFWMineRequest,
            functionName:'getUserdrugData',
        }
        this.otherApis.set(obj_GetListByAccountId.cmd,(new ApiInfo()).initWithMap(obj_GetListByAccountId))

        let obj_getMyInsuranceUrl = {
            cmd:'person.account.getMyInsuranceUrl',
            cmdCN:'我的保单URL',
            requestClass:YFWMineRequest,
            functionName:'getMyInsuranceUrl',
        }
        this.otherApis.set(obj_getMyInsuranceUrl.cmd,(new ApiInfo()).initWithMap(obj_getMyInsuranceUrl))

        let obj_getAddressInfo = {
            cmd:'person.address.getAddressInfo',
            cmdCN:'地址详情',
            requestClass:YFWMineRequest,
            functionName:'getAddressInfo',
            params:[1],
            paramsFetchRule:[{
                cmd: 'person.address.getReceiptAddress',
                valueType: 'array',
                valueIndex:0,
                valueName:'id',
            }]
        }
        this.otherApis.set(obj_getAddressInfo.cmd,(new ApiInfo()).initWithMap(obj_getAddressInfo))

        let obj_pasteAddressFormat = {
            cmd:'person.address.pasteAddressFormat',
            cmdCN:'获取前切板内容解析地址',
            requestClass:YFWMineRequest,
            functionName:'pasteAddressFormat',
            params:['上海市浦东新区盛夏路666号上投盛银大厦D栋8楼\r\n王小二 13677778888'],
        }
        this.otherApis.set(obj_pasteAddressFormat.cmd,(new ApiInfo()).initWithMap(obj_pasteAddressFormat))

        let obj_insertAddress = {
            cmd:'person.address.insert',
            cmdCN:'新增收货地址',
            requestClass:YFWMineRequest,
            functionName:'insertAddress',
            params:[''],
            paramsFetchRule:[{
                cmd: 'person.address.pasteAddressFormat',
                valueType: 'object',
                key:null,
                valueDealFunction:(result)=>{
                    result = safeObj(result)
                    let info = {
                        name: safe(result.person).replace(/\s*/g,''),
                        mobile: safe(result.phonenum),
                        regionid: safe(result.regionId),
                        address_name: safe(result.detail),
                        dict_bool_default: '0',
                    }
                    return JSON.stringify(info)
                }
            }]
        }
        this.otherApis.set(obj_insertAddress.cmd,(new ApiInfo()).initWithMap(obj_insertAddress))

        let obj_updateAddress = {
            cmd:'person.address.update',
            cmdCN:'更新收货地址',
            requestClass:YFWMineRequest,
            functionName:'updateAddress',
            params:[''],
            paramsFetchRule:[{
                cmd: 'person.address.insert',
                valueType: 'object',
                key:null,
                valueDealFunction:(result)=>{
                    result = safeObj(result)
                    let info = {
                        id:result,
                        name: '王雷',
                        mobile: '18877776666',
                        regionid: 523,
                        address_name: '上投盛银大厦D栋8楼',
                        dict_bool_default: '0',
                    }
                    return JSON.stringify(info)
                }
            }]
        }
        this.otherApis.set(obj_updateAddress.cmd,(new ApiInfo()).initWithMap(obj_updateAddress))

        let obj_delectAddress = {
            cmd:'person.address.delete',
            cmdCN:'删除收货地址',
            requestClass:YFWMineRequest,
            functionName:'deleteAddress',
            params:[''],
            paramsFetchRule:[{
                cmd: 'person.address.insert',
                valueType: 'object',
                key:null,
            }]
        }
        this.otherApis.set(obj_delectAddress.cmd,(new ApiInfo()).initWithMap(obj_delectAddress))

        let obj_getCouponData_unUsed = {
            cmd:'person.usercoupons.getPageData',
            cmdCN:'用户优惠券列表--未使用',
            requestClass:YFWMineRequest,
            functionName:'getCouponData',
            params:['0',1]
        }
        this.otherApis.set(obj_getCouponData_unUsed.cmd,(new ApiInfo()).initWithMap(obj_getCouponData_unUsed))

        let obj_getPageData_complaints = {
            cmd:'person.complaints.getPageData',
            cmdCN:'我的投诉列表',
            requestClass:YFWMineRequest,
            functionName:'getComplaintsData',
            params:[1]
        }
        this.otherApis.set(obj_getPageData_complaints.cmd,(new ApiInfo()).initWithMap(obj_getPageData_complaints))

        let obj_getValidPointData = {
            cmd:'person.userpoint.getValidPoint',
            cmdCN:'我的积分',
            requestClass:YFWMineRequest,
            functionName:'getValidPointData',
        }
        this.otherApis.set(obj_getValidPointData.cmd,(new ApiInfo()).initWithMap(obj_getValidPointData))

        let obj_getEvaluationData = {
            cmd:'person.evaluation.getPageData',
            cmdCN:'我的评价列表',
            requestClass:YFWMineRequest,
            functionName:'getEvaluationData',
            params:[1]
        }
        this.otherApis.set(obj_getEvaluationData.cmd,(new ApiInfo()).initWithMap(obj_getEvaluationData))

        let obj_checkUpdate = {
            cmd:'guest.common.app.checkUpdate',
            cmdCN:'检查更新',
            requestClass:YFWMineRequest,
            functionName:'checkUpdate',
        }
        this.otherApis.set(obj_checkUpdate.cmd,(new ApiInfo()).initWithMap(obj_checkUpdate))
    }

    getAllOtherApis() {
        return itemAddKey(strMapToArray(this.otherApis),'other')
    }

    getAllOtherApisMap() {
        return this.otherApis
    }

    getAllSearchApis() {
        return itemAddKey(strMapToArray(this.searchApis),'search')
    }

    getAllSearchApisMap() {
        return this.searchApis
    }

    getAllAddBuyApis() {
        return itemAddKey(strMapToArray(this.addBuyApis),'buy')
    }
    getAllApis() {
        let allApis = []
        allApis = allApis.concat(this.getAllSearchApis())
        allApis = allApis.concat(this.getAllAddBuyApis())
        allApis = allApis.concat(this.getAllOtherApis())
        return allApis
    }
}