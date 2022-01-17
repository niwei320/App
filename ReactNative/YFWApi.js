import { DeviceEventEmitter, Platform } from 'react-native'
import { isEmpty, isIphoneX, isNotEmpty, safe, safeArray, safeObj } from './PublicModule/Util/YFWPublicFunction'
import { refreshOTORedPoint } from './Utils/YFWInitializeRequestFunction'
import YFWRequestViewModel from './Utils/YFWRequestViewModel'
import YFWUserInfoManager from './Utils/YFWUserInfoManager'
class YFWBaseRequest {
  request(params, success, failer, showLoad) {
    let viewModel = new YFWRequestViewModel()
    DeviceEventEmitter.emit('kFetchDataFromServer',params)
    viewModel.TCPRequest(params, res => {
      if (success) {
        success(res)
      }
    }, error => {
      if (failer) {
        failer(error)
      }
    }, showLoad || false)
  }

  /**
   * 获取购物车数量
   * @param {*} success 
   * @param {*} failer 
   */
  getShopCartCount(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.cart.getCartCount');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取推荐商品
   * @param {*} success 
   * @param {*} failer 
   */
  getRecommendMedicine(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd','guest.medicine.getTopVisitMedicine');
    paramMap.set('limit',6);
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取实名认证状态
   * @param {*} success 
   * @param {*} failer 
   */
  getRealNameStatus(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd','person.account.isCertification')
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取实名认证状态
   * @param {*} mobile 
   * @param {*} type 
   * @param {*} ip 
   * @param {*} success 
   * @param {*} failer 
   */
  sendSMS(mobile, type, ip, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.account.sendSMS');
    paramMap.set('mobile', safe(mobile));
    paramMap.set('ip', safe(ip));
    paramMap.set('type', safe(type).length>1 ? type : 1);
    return this.request(paramMap, success, failer)
  }
}

class YFWLoginRequest extends YFWBaseRequest {

}

class YFWHomeRequest extends YFWBaseRequest {

  /**
   * 获取首页数据
   * @param {*} success 
   * @param {*} failer 
   */
  getHomeData(success, failer) {
    let paramMap = new Map()
    paramMap.set('__cmd','guest.common.app.getIndexData_new')
    paramMap.set('os',Platform.OS)
    paramMap.set('deviceName',(Platform.OS === 'ios'?isIphoneX()?'X':'N':'A'))
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取联合会员接口
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreAccountData(success, failer) {
    let paramMap = new Map()
    paramMap.set('__cmd','guest.common.app.getStoreJoinAccountInfo')
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取弹窗广告
   * @param {*} success 
   * @param {*} failer 
   */
  getAdsData(success, failer) {
    let paramMap = new Map()
    paramMap.set('__cmd', 'guest.common.app.getIndexPopupAds_new');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取底部资质图片
   * @param {*} success 
   * @param {*} failer 
   */
  getBottomAdsData(success, failer) {
    let paramMap = new Map()
    paramMap.set('__cmd','guest.common.app.getAPPBannerBottom');
    return this.request(paramMap, success, failer)
  }
}

class YFWSearchRequest extends YFWBaseRequest {
  /**
   * 找药首页数据
   * @param {*} success 
   * @param {*} failer 
   */
  getFindYaodData(success, failer) {
    let paramMap = new Map()
    paramMap.set('__cmd', 'guest.common.app.getFindYao');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取分类数据
   * @param {*} success 
   * @param {*} failer 
   */
  getCategoryData(success, failer) {
    let paramMap = new Map()
    paramMap.set('__cmd', 'guest.category.getCategoryList');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取分类商品数据
   * @param {*} conditions 
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getCategoryMedicineData(conditions, pageIndex, success, failer) {
    let paramMap = new Map()
    paramMap.set('__cmd', 'guest.medicine.getMedicines');
    paramMap.set('pageIndex', pageIndex);
    paramMap.set('pageSize', 10);
    if(safe(conditions).length>0) paramMap.set("conditions", safe(conditions));
    paramMap.set('version',YFWUserInfoManager.ShareInstance().version)
    paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
    paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
    return this.request(paramMap, success, failer)
  }

  /**
   * 热搜
   * @param {*} success 
   * @param {*} failer 
   */
  getHotSearchData(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.sitemap.getHotKeywords');
    paramMap.set('limit', 10);
    return this.request(paramMap, success, failer)
  }

  /**
   * 关键字联想
   * @param {*} keyWords 关键字
   * @param {*} success 
   * @param {*} failer 
   */
  getAssociateKeywords(keyWords, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.medicine.getAssociateKeywords');
    paramMap.set('keyword', safe(keyWords));
    paramMap.set('limit', '20');
    paramMap.set('type', 'medicine');
    return this.request(paramMap, success, failer)
  }

  /**
   * 规格搜索
   * @param {*} keyWords 
   * @param {*} success 
   * @param {*} failer 
   */
  getStandardData(keyWords, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.medicine.getSearchStandard');
    paramMap.set('keywords', safe(keyWords));
    paramMap.set('top', '10');
    return this.request(paramMap, success, failer)
  }

  /**
   * 商家搜索
   * @param {*} keyWords 
   * @param {*} pageIndex
   * @param {*} success 
   * @param {*} failer 
   */
  searchStore(keyWords, pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.getSearchShop');
    paramMap.set('keywords', safe(keyWords));
    paramMap.set('pageSize', 10);
    paramMap.set('pageIndex', pageIndex);
    paramMap.set('shoptype', 0);
    paramMap.set('regionid', 0);
    return this.request(paramMap, success, failer)
  }

  /**
   * 商家搜索
   * @param {*} keyWords 
   * @param {*} pageIndex
   * @param {*} sort 排序方式
   * @param {*} success 
   * @param {*} failer 
   */
  searchMedicine(keyWords, pageIndex, sort, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.medicine.getSearchPageData');
    paramMap.set("ip",YFWUserInfoManager.ShareInstance().deviceIp)//设备IP
    paramMap.set('pageIndex', pageIndex);
    paramMap.set('orderBy', safe(sort));
    paramMap.set('pageSize', 10);
    paramMap.set('keywords', safe(keyWords));
    paramMap.set('version',safe(YFWUserInfoManager.ShareInstance().version));
    paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
    paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
    return this.request(paramMap, success, failer)
  }

  /**
   * 商家内药品搜索
   * @param {*} keyWords
   * @param {*} pageIndex
   * @param {*} sort 排序方式
   * @param {*} shop_id 商店id
   * @param {*} success 
   * @param {*} failer 
   */
  searchStoreMedicine(keyWords, pageIndex, sort, shop_id, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineSearch');
    paramMap.set("keywords", safe(keyWords));
    paramMap.set("storeid", safe(shop_id));
    paramMap.set('orderField', safe(sort));
    paramMap.set('pageIndex', pageIndex);
    paramMap.set('pageSize', 10);
    paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
    paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取附近商店
   * @param {*} success 
   * @param {*} failer 
   */
  getNearestStore(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.getNearShop');
    paramMap.set('lat', safe(YFWUserInfoManager.ShareInstance().latitude));
    paramMap.set('lon', safe(YFWUserInfoManager.ShareInstance().longitude));
    paramMap.set('pageSize', 10);
    paramMap.set('pageIndex', 1);
    return this.request(paramMap, success, failer)
  }
}

class YFWSellersRequest extends YFWBaseRequest {

  /**
   * 获取比价页初始化数据
   * @param {*} mid 商品id
   * @param {*} conditions 筛选条件
   * @param {*} success 
   * @param {*} failer 
   */
  getSellersData(mid, conditions, success, failer) {
    let paramMap = new Map();
    let cmds = 'guest.medicine.getMedicineDetail as details,guest.medicine.getShopMedicines as shopmedicines'
    if (YFWUserInfoManager.ShareInstance().hasLogin()) {
      cmds += ',person.sameStore.getSameStoreCount as sameStoreCount'
      paramMap.set('sameStoreCount', { 'mid': safe(mid) });
    }
    paramMap.set('__cmd', cmds);
    paramMap.set('details', {
      'mid': safe(mid),
      'user_region_id': YFWUserInfoManager.ShareInstance().getRegionId(),
      'user_city_name': YFWUserInfoManager.ShareInstance().getCity(),
    });
    paramMap.set('shopmedicines', {
      'pageSize': '10',
      'pageIndex': 1,
      'conditions': safeObj(conditions),
      'user_region_id': YFWUserInfoManager.ShareInstance().getRegionId(),
      'user_city_name': YFWUserInfoManager.ShareInstance().getCity(),
    });
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取比价页商品详情
   * @param {*} mid 商品id
   * @param {*} success 
   * @param {*} failer 
   */
  getSellersMedicineData(mid, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.medicine.getMedicineDetail');
    paramMap.set('mid', safe(mid));
    paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
    paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取比价页商品列表数据
   * @param {*} conditions 筛选条件
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getSellersStoreMedicineData(conditions, pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.medicine.getShopMedicines');
    paramMap.set('pageSize', '10');
    paramMap.set('pageIndex', pageIndex);
    paramMap.set('conditions', safeObj(conditions));
    paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
    paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
    return this.request(paramMap, success, failer)
  }

  /**
   * 比价页获取商品套餐信息，用于显示购物车弹窗
   * @param {*} medicineID 
   * @param {*} success 
   * @param {*} failer 
   */
  getSellersPackageData(medicineID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.shopMedicine.getBJMedicineDetail');
    paramMap.set('store_medicine_id', safe(medicineID));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取筛选地区列表
   * @param {*} success 
   * @param {*} failer 
   */
  getRegiondData(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.sys_region.getListByParentId');
    paramMap.set('regionid', 0);
    return this.request(paramMap, success, failer)
  }
}

class YFWGoodsRequest extends YFWBaseRequest {

  /**
   * 获取商品详情
   * @param {*} medicineID 
   * @param {*} success 
   * @param {*} failer 
   */
  getMedicineData(medicineID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineDetail');
    paramMap.set('store_medicine_id', safe(medicineID));
    paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
    paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
    return this.request(paramMap, success, failer)
  }

  /**
   * 收藏商品
   * @param {*} medicineID 
   * @param {*} storeID 
   * @param {*} success 
   * @param {*} failer 
   */
  collectMedicine(medicineID, storeID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.favorite.collectStoreGoods');
    paramMap.set('medicineid', safe(medicineID));
    paramMap.set('storeid', safe(storeID));
    return this.request(paramMap, success, failer)
  }

  /**
   * 取消收藏商品
   * @param {*} medicineID 
   * @param {*} storeID 
   * @param {*} success 
   * @param {*} failer 
   */
  uncollectMedicine(medicineID, storeID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.favorite.cancelCollectStoreGoods');
    paramMap.set('medicineid', safe(medicineID));
    paramMap.set('storeid', safe(storeID));
    return this.request(paramMap, success, failer)
  }

  /**
   * 降价通知
   * @param {*} medicineID 
   * @param {*} price       当前价格
   * @param {*} lowerPrice  期望价格
   * @param {*} success 
   * @param {*} failer 
   */
  noticeOfLoweringPrice(medicineID, price, lowerPrice, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.account.setPriceOffNotice');
    paramMap.set('store_medicineid', safe(medicineID));
    paramMap.set('price', safe(price));
    paramMap.set('expect_price', safe(lowerPrice));
    paramMap.set("idfa", safe(YFWUserInfoManager.ShareInstance().idfa))//设备唯一标识符
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取评论接口
   * @param {*} storeId 药店id
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getMedicineCommentsData(storeId, pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.evaluation.getEvaluationByStoreId');
    paramMap.set('storeid', safe(storeId));
    paramMap.set('pageIndex', safe(pageIndex).length>1 ? pageIndex : 1);
    paramMap.set('pageSize', 10);
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取全部问答接口
   * @param {*} success 
   * @param {*} failer 
   */
  getMedicineQAData(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.medicine.getQuestionAskList');
    return this.request(paramMap, success, failer)
  }

}

class YFWStoreRequest extends YFWBaseRequest {
  
  /**
   * 获取药店详情
   * @param {*} storeId 
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreData(storeId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.shop.getShopInfo');
    paramMap.set('storeid', safe(storeId));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取药店资质实景图片
   * @param {*} storeId 
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreQualificationData(storeId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.shop.getShopQualification');
    paramMap.set('storeid', safe(storeId));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取商店推荐商品
   * @param {*} storeId 
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreRecommendMedicine(storeId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineTop')
    paramMap.set('storeid', safe(storeId));
    paramMap.set('count', '6')
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取商店药品分类
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreCategoryData(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.shopMedicine.getCategroyByParentId');
    return this.request(paramMap, success, failer)
  }

  /**
   * 收藏商家
   * @param {*} storeId 
   * @param {*} success 
   * @param {*} failer 
   */
  collectStore(storeId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.favorite.collectStore');
    paramMap.set('storeid', safe(storeId));
    return this.request(paramMap, success, failer)
  }

  /**
   * 取消收藏商家
   * @param {*} storeId 
   * @param {*} success 
   * @param {*} failer 
   */
  uncollectStore(storeId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.favorite.cancelCollectStore');
    paramMap.set('storeid', safe(storeId));
    return this.request(paramMap, success, failer)
  }

  /**
   * 
   * @param {*} storeId 
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreTopMills(keywords, conditions, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.store.getTopMills');
    paramMap.set('hasprice','1')
    if(isNotEmpty(keywords)) paramMap.set('keywords', safe(keywords));
    if(isNotEmpty(conditions)) paramMap.set('conditions', safeObj(conditions));
    if(isNotEmpty(conditions)) paramMap.set('limit', 1000)
    return this.request(paramMap, success, failer)
  }
}

class YFWShopCartRequest extends YFWBaseRequest {

  /**
   * 获取购物车数据
   * @param {*} isShopMember 是否是联合会员
   * @param {*} success 
   * @param {*} failer 
   */
  getShopCartData(isShopMember, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.cart.getCart')
    if(!isShopMember) paramMap.set('isDiffLostMedicine','1')
    return this.request(paramMap, success, failer)
  }

  /**
   * 购物车内商品移入收藏夹
   * @param {*} cartidList 
   * @param {*} success 
   * @param {*} failer 
   */
  collectMedicine(cartidList, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.cart.moveCartGoodsToFavorite');
    paramMap.set('cartidList', safeArray(cartidList));
    return this.request(paramMap, success, failer)
  }

  /**
   * 删除购物车内商品
   * @param {*} cartIds 商品ids
   * @param {*} packageIds 套餐ids
   * @param {*} success 
   * @param {*} failer 
   */
  deleteMedicine(cartIds, packageIds, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.cart.deleteCartGoodsById');
    if(safe(cartIds).length > 0) paramMap.set('cartId',cartIds);
    if(safe(packageIds).length > 0) paramMap.set('packageId',packageIds);
    return this.request(paramMap, success, failer)
  }

  /**
   * 清除购物车失效商品
   * @param {*} success 
   * @param {*} failer 
   */
  removeInvalidMedicine(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd','person.cart.ClearLoseMedicine')
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取店铺满减信息
   * @param {*} shop_id 商家id
   * @param {*} total 已购买总价
   * @param {*} success 
   * @param {*} failer 
   */
  getActivityInfo(shop_id, total, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd','person.cart.getFreepostageAndActivityInfo');
    paramMap.set('storeid', safe(shop_id));
    paramMap.set('price', safe(total));
    return this.request(paramMap, success, failer)
  }

  /**
   * 添加商品进入购物车
   * @param {*} medicineID 商品id
   * @param {*} quantity 数量
   * @param {*} type 是购买还是加入购物车 'buy': 加入购物车
   * @param {*} success 
   * @param {*} failer 
   */
  addMedicineToCart(medicineID, quantity, type, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.cart.addCart');
    paramMap.set('storeMedicineId', safe(medicineID));
    paramMap.set('quantity', safe(quantity).length==0? 1 : quantity);
    if(safe(type).length>0) paramMap.set('type', type)
    return this.request(paramMap, success, failer)
  }

  /**
   * 编辑商品
   * @param {*} medicineID 商品id
   * @param {*} packageId 套装id
   * @param {*} quantity 数量
   * @param {*} success 
   * @param {*} failer 
   */
  editMedicineToCart(medicineID, packageId, quantity, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.cart.editCart');
    if(safe(medicineID).length>0) paramMap.set('cartId', medicineID);
    if(safe(packageId).length>0) paramMap.set('packageId', packageId);
    paramMap.set('quantity', safe(quantity).length==0? 1 : quantity);
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取结算信息
   * @param {*} addressID 选择的地址id
   * @param {*} cartIds 
   * @param {*} pakageIds 
   * @param {*} extraParams 
   * @param {*} success 
   * @param {*} failer 
   */
  getBuyData(addressID, cartIds, pakageIds, extraParams, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.cart.getBuy');
    paramMap.set('addressid', safe(addressID));
    if(safe(cartIds).length>0) paramMap.set('cartids', cartIds);
    if(safe(pakageIds).length>0) paramMap.set('packageids', pakageIds);
    if (isNotEmpty(extraParams) && Object.prototype.toString.call(extraParams) === '[object Object]') {
      for (let k of Object.keys(extraParams)) {
          paramMap.set(k, extraParams[k]);
      }
    }
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取购买药品的诊治疾病列表
   * @param {*} rx_cid_items 药品列表
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getDiseaseByCids(rx_cid_items, pageIndex, success, failer) {
    let paramMap = new Map();
    params.set('__cmd', 'person.cart.get_disease_by_cids')
    params.set('pageIndex', safe(pageIndex).length>1 ? pageIndex : 1)
    params.set('rx_cid_items', safe(rx_cid_items))
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取上传的处方信息
   * @param {*} order_no 订单号
   * @param {*} success 
   * @param {*} failer 
   */
  getUploadRXInfo(order_no, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.order.getUploadRXInfo');
    paramMap.set('orderno', safe(order_no));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取上传的处方信息
   * @param {*} order_no    订单号
   * @param {*} rx_content  处方内容
   * @param {*} image       处方图片
   * @param {*} success 
   * @param {*} failer 
   */
  uploadRX(order_no, rx_content, image, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.order.uploadRX');
    paramMap.set('orderno', safe(order_no));
    if(safe(rx_content).length>0) paramMap.set('rx_content', safe(rx_content));
    if(safe(image).length>0) paramMap.set('rx_image', safe(image));
    return this.request(paramMap, success, failer)
  }
}

class YFWOrderRequest extends YFWBaseRequest {

  /**
   * 创建订单
   * @param {*} paramMap 商品信息、处方信息
   * @param {*} success 
   * @param {*} failer 
   */
  createOrder(param, success, failer) {
    let paramMap = new Map();
    if(isNotEmpty(param)) paramMap = param
    paramMap.set('__cmd' , 'person.order.createOrder');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取未支付订单
   * @param {*} orderNo 订单号
   * @param {*} success 
   * @param {*} failer 
   */
  getWaitPayOrder(orderNo, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.order.getNotPayOrders');
    paramMap.set('ordernos',safe(orderNo));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取支付成功信息
   * @param {*} orderNo 订单号
   * @param {*} type 类型
   * @param {*} success 
   * @param {*} failer 
   */
  getPaySuccessOrderData(orderNo, type, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.order.getOrderOperInfo');
    paramMap.set('orderno', safe(orderNo));
    paramMap.set('type', safe(type));
    paramMap.set('client','phone');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取联合会员订单信息
   * @param {*} storeID 药店id
   * @param {*} orderno 订单号
   * @param {*} success 
   * @param {*} failer 
   */
  getUnionOrderData(storeID, orderno, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.erporder.GetOrderInfo')
    paramMap.set('storeid', safe(storeID))
    paramMap.set('orderno', safe(orderno))
    return this.request(paramMap, success, failer)
  }

  /**
   * 特殊药品新增登记流程
   * @param {*} drugname      药品名称
   * @param {*} drugidcardno  身份证号码
   * @param {*} success 
   * @param {*} failer 
   */
  specialMedicineVerifyUser(drugname, drugidcardno, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.order.userverified')
    paramMap.set('name', safe(drugname))
    paramMap.set('idcardno', safe(drugidcardno))
    return this.request(paramMap, success, failer)
  }

  /**
   * 验证处方信息
   * @param {*} data_info 处方信息 { "cartids": '', "packageids": '', "rx_upload_type": '', "drugid": '', "rx_image": '', "diseaselist": '', "case_url": '' }
   * @param {*} success 
   * @param {*} failer 
   */
  verificationInquiry(data_info, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd','person.order.verificationInquiry')
    paramMap.set('data_info', safeObj(data_info))
    return this.request(paramMap, success, failer)
  }

  /**
   * 处方添加疾病
   * @param {*} keywords 搜索疾病
   * @param {*} success 
   * @param {*} failer 
   */
  getDiseaseData(keywords, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd','guest.disease.getListByKeywords');
    paramMap.set('keywords',safe(keywords));
    paramMap.set('top',10);
    return this.request(paramMap, success, failer)
  }

  /**
   * 订单支付信息
   * @param {*} orderNo 订单号
   * @param {*} success 
   * @param {*} failer 
   */
  getPayAttentionInfo(orderNo, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.getPayAttentionInfo');
    paramMap.set('ordernoList', safe(orderNo));
    return this.request(paramMap, success, failer)
  }

  /**
   * 更新ERP支付状态
   * @param {*} orderNo 订单号
   * @param {*} paytype 支付方式
   * @param {*} success 
   * @param {*} failer 
   */
  updateERPPayStatus(orderNo, paytype, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.erp_order.updatePayStatus');
    paramMap.set('orderno', safe(orderNo));
    paramMap.set('type', safe(paytype));
    return this.request(paramMap, success, failer)
  }

  /**
   * 更新支付状态
   * @param {*} orderNo 订单号
   * @param {*} paytype 支付方式
   * @param {*} success 
   * @param {*} failer 
   */
  updatePayStatus(orderNo, paytype, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.order.updateBatchPayStatus');
    paramMap.set('orderno', safe(orderNo));
    paramMap.set('type', safe(paytype));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取ERP订单支付信息
   * @param {*} paytype 支付方式
   * @param {*} orderNo 订单号
   * @param {*} storeid 商店id
   * @param {*} extendedParam 其他参数
   * @param {*} success 
   * @param {*} failer 
   */
  getPayInfoApp(paytype, orderNo, storeid, extendedParam, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.erporder.getPayInfo_app')
    paramMap.set('orderno', safe(orderNo))
    paramMap.set('storeid', safe(storeid))
    paramMap.set('type', safe(paytype));
    if(isNotEmpty(extendedParam)) paramMap.set('param', extendedParam);
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取订单支付信息
   * @param {*} paytype 支付方式
   * @param {*} orderNo 订单号
   * @param {*} extendedParam 其他参数
   * @param {*} success 
   * @param {*} failer 
   */
  getBatchOrderInfo(paytype, orderNo, extendedParam, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.getBatchOrderInfo')
    paramMap.set('ordernoList', safe(orderNo))
    paramMap.set('type', safe(paytype));
    if(isNotEmpty(extendedParam)) paramMap.set('param', extendedParam);
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取投诉详情
   * @param {*} orderNo 订单号
   * @param {*} success 
   * @param {*} failer 
   */
  getComplaintData(orderNo, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.complaints.getDetail');
    paramMap.set('orderno', safe(orderNo))
    return this.request(paramMap, success, failer)
  }

  /**
   * 取消投诉
   * @param {*} orderNo 订单号
   * @param {*} success 
   * @param {*} failer 
   */
  cancelComplaint(orderNo, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.complaints.cancel');
    paramMap.set('orderno', safe(orderNo))
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取手机号 批发
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreAccountMobile(success, failer) {
    let paramMap = new Map();
    paramMap.set("__cmd", "store.account.getAccountMobile");
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取手机号
   * @param {*} success 
   * @param {*} failer 
   */
  getPersonAccountMobile(success, failer) {
    let paramMap = new Map();
    paramMap.set("__cmd", "person.account.getAccountMobile");
    return this.request(paramMap, success, failer)
  }

  /**
   * 更新手机号 批发
   * @param {*} mobile 
   * @param {*} mobile_smscode 
   * @param {*} success 
   * @param {*} failer 
   */
  updateStoreAccountMobile(mobile, mobile_smscode, success, failer) {
    let paramMap = new Map();
    paramMap.set("__cmd", "store.account.updateMobile");
    paramMap.set("mobile", safe(mobile));
    paramMap.set("mobile_smscode", safe(mobile_smscode));
    paramMap.set("old_mobile_smscode", '');
    paramMap.set("bind_mobile", 1);
    return this.request(paramMap, success, failer)
  }

  /**
   * 更新手机号
   * @param {*} mobile 
   * @param {*} mobile_smscode 
   * @param {*} success 
   * @param {*} failer 
   */
  updatePersonAccountMobile(mobile, mobile_smscode, success, failer) {
    let paramMap = new Map();
    paramMap.set("__cmd", "person.account.updateMobile");
    paramMap.set("mobile", safe(mobile));
    paramMap.set("mobile_smscode", safe(mobile_smscode));
    paramMap.set("old_mobile_smscode", '');
    paramMap.set("bind_mobile", 1);
    return this.request(paramMap, success, failer)
  }

  /**
   * 验证手机号 批发
   * @param {*} mobile 
   * @param {*} success 
   * @param {*} failer 
   */
  verifyStoreAccountMobile(mobile, success, failer) {
    let paramMap = new Map();
    paramMap.set("__cmd", "store.account.verifyMobile");
    paramMap.set("mobile", safe(mobile));
    return this.request(paramMap, success, failer)
  }

  /**
   * 验证手机号
   * @param {*} mobile 
   * @param {*} success 
   * @param {*} failer 
   */
  verifyPersonAccountMobile(mobile, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.account.verifyMobile');
    paramMap.set("mobile", safe(mobile));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取退货款原因
   * @param {*} orderno 
   * @param {*} success 
   * @param {*} failer 
   */
  getCancelReason(orderno, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.order.getCancelReason');
    paramMap.set('orderno', safe(orderno));
    return this.request(paramMap, success, failer)
  }

  /**
   * 取消订单
   * @param {*} orderno 
   * @param {*} desc 
   * @param {*} success 
   * @param {*} failer 
   */
  cancelOrder(orderno, desc, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.order.cancel');
    paramMap.set('orderno', safe(orderno));
    paramMap.set('desc', safe(desc));
    return this.request(paramMap, success, failer)
  }

  /**
   * 取消订单
   * @param {*} orderno 
   * @param {*} type 
   * @param {*} content 
   * @param {*} imagList 
   * @param {*} success 
   * @param {*} failer 
   */
  complaintOrder(orderno, type, content, imagList, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.order.complaint');
    paramMap.set('orderno', safe(orderno));
    paramMap.set('type', safe(type));
    paramMap.set('content', safe(content));
    if(isNotEmpty(imagList)) paramMap.set("introImage", safeObj(imagList));
    paramMap.set('account_name', 'name');
    return this.request(paramMap, success, failer)
  }
}

class YFWMineRequest extends YFWBaseRequest {

  /**
   * 获取用户信息
   * @param {*} success 
   * @param {*} failer 
   */
  getAccountInfo(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.account.getAccountInfo');
    return this.request(paramMap, success, failer)
  }

  /**
   * 提交用户反馈
   * @param {*} content 
   * @param {*} mobile 
   * @param {*} qq 
   * @param {*} fromip 
   * @param {*} success 
   * @param {*} failer 
   */
  feedback(content, mobile, qq, fromip, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.feedback');
    paramMap.set('content', safe(content));
    paramMap.set('mobile', safe(mobile));
    paramMap.set('qq', safe(qq));
    paramMap.set('accountId', safe(YFWUserInfoManager.ShareInstance().ssid));
    paramMap.set('fromip', safe(fromip));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取用户收藏商品列表
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getCollectionGoodsData(pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.favorite.getUserCollectionStoreGoods');
    paramMap.set('pageIndex', pageIndex);
    paramMap.set('pageSize', '20');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取用户收藏药店列表
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getCollectionStoreData(pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.favorite.getUserCollectionStore');
    paramMap.set('pageIndex', pageIndex);
    paramMap.set('pageSize', '20');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取物流信息
   * @param {*} success 
   * @param {*} failer 
   */
  getTrafficnoList(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd','person.order.getTrafficnoList')
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取物流信息
   * @param {*} success 
   * @param {*} failer 
   */
  getMyInsuranceUrl(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd','person.account.getMyInsuranceUrl')
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取用药人信息
   * @param {*} success 
   * @param {*} failer 
   */
  getUserdrugData(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.userdrug.GetListByAccountId');
    return this.request(paramMap, success, failer)
  }

  /**
   * 更新性别
   * @param {*} sex 
   * @param {*} success 
   * @param {*} failer 
   */
  updateSexApp(sex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.account.updateSex_app');
    paramMap.set('sex', safe(sex) == '1' ? '1' : '0');
    return this.request(paramMap, success, failer)
  }

  /**
   * 更新头像
   * @param {*} image 
   * @param {*} success 
   * @param {*} failer 
   */
  updateAccountImg(image, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.account.updateAccountImg');
    paramMap.set('intro_image', safe(image));
    return this.request(paramMap, success, failer)
  }

  /**
   * 根据id，获取地址列表
   * @param {*} region_id 
   * @param {*} success 
   * @param {*} failer 
   */
  getSiblingOrChildrenListById(region_id, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.sys_region.getSiblingOrChildrenListById');
    paramMap.set('regionid', safe(region_id));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取收货地址
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getReceiveAddressData(pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.address.getReceiptAddress');
    paramMap.set('pageSize', 15);
    paramMap.set('pageIndex', pageIndex);
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取收货地址详情
   * @param {*} addressID 
   * @param {*} success 
   * @param {*} failer 
   */
  getAddressInfo(addressID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.address.getAddressInfo');
    paramMap.set('id', safe(addressID));
    return this.request(paramMap, success, failer)
  }

  /**
   * 根据剪切板内容、获取收货地址
   * @param {*} address 剪切板复制地址
   * @param {*} success 
   * @param {*} failer 
   */
  pasteAddressFormat(address, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.address.pasteAddressFormat');
    paramMap.set('address', safe(address));
    return this.request(paramMap, success, failer)
  }

  /**
   * 删除收货地址
   * @param {*} addressID 
   * @param {*} success 
   * @param {*} failer 
   */
  deleteAddress(addressID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.address.delete');
    paramMap.set('id', safe(addressID));
    return this.request(paramMap, success, failer)
  }

  /**
   * 更新收货地址
   * @param {*} addressData { name: '', id: '', regionid: '', mobile: '', dict_bool_default: '', address_name: '' }
   * @param {*} success 
   * @param {*} failer 
   */
  updateAddress(addressData, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.address.update');
    if(isNotEmpty(addressData)) paramMap.set('data', addressData);
    return this.request(paramMap, success, failer)
  }

  /**
   * 新增收货地址
   * @param {*} addressData { name: '', regionid: '', mobile: '', dict_bool_default: '', address_name: '' }
   * @param {*} success 
   * @param {*} failer 
   */
  insertAddress(addressData, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.address.insert');
    if(isNotEmpty(addressData)) paramMap.set('data', addressData);
    return this.request(paramMap, success, failer)
  }

  /**
   * 领取优惠券
   * @param {*} couponID 
   * @param {*} success 
   * @param {*} failer 
   */
  receiveCoupon(couponID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.usercoupons.acceptCoupon');
    paramMap.set('id', safe(couponID));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取用户领取优惠券列表
   * @param {*} status    发票是否被使用 
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getCouponData(status, pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.usercoupons.getPageData');
    paramMap.set('pageSize', 10);
    paramMap.set('pageIndex', safe(pageIndex).length>1 ? pageIndex : 1);
    paramMap.set('status', safe(status));
    return this.request(paramMap, success, failer)
  }

  /**
   * 删除优惠券
   * @param {*} couponID 
   * @param {*} success 
   * @param {*} failer 
   */
  receiveCoupon(couponID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.usercoupons.delete');
    paramMap.set('id', safe(couponID));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取消息列表
   * @param {*} messageType 消息类型 系统消息，订单消息
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getMessageData(messageType, pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.message.getMessageByType');
    paramMap.set('type', safe(messageType));
    paramMap.set('pageIndex', safe(pageIndex).length>1 ? pageIndex : 1);
    return this.request(paramMap, success, failer)
  }

  /**
   * 将消息置为已读
   * @param {*} messageId 消息id
   * @param {*} success 
   * @param {*} failer 
   */
  readMessage(messageId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.message.markRead');
    paramMap.set('id', safe(messageId));
    return this.request(paramMap, success, failer)
  }

  /**
   * 将全部消息置为已读、去除消息icon小红点
   * @param {*} messageTypeId 消息id
   * @param {*} success 
   * @param {*} failer 
   */
  readAllMessage(messageTypeId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.message.typeMarkRead');
    paramMap.set('msg_type_id', safe(messageTypeId));
    return this.request(paramMap, success, failer)
  }

  /**
   * 用药提醒设置
   * @param {*} conditions 提醒内容 { interval_days: '', start_time: '', end_time: '', dict_enable: '', remark: '', item_goods: '', item_timec: '', id: '' }
   * @param {*} success 
   * @param {*} failer 
   */
  submitUseMedicine(conditions, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.submitUseMedicine');
    paramMap.set('conditions', safeObj(conditions));
    return this.request(paramMap, success, failer)
  }

  /**
   * 用药提醒列表
   * @param {*} success 
   * @param {*} failer 
   */
  getUseMedicineList(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.getUseMedicineList');
    return this.request(paramMap, success, failer)
  }

  /**
   * 用药提醒详情
   * @param {*} remindId 提醒id
   * @param {*} success 
   * @param {*} failer 
   */
  getUseMedicineDetail(remindId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.getUseMedicineDetail');
    paramMap.set('remindId', safe(remindId));
    return this.request(paramMap, success, failer)
  }

  /**
   * 删除用药提醒
   * @param {*} remindId 提醒id
   * @param {*} success 
   * @param {*} failer 
   */
  getUseMedicineDetail(remindId, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.deleteUseMedicineById');
    paramMap.set('remindId', safe(remindId));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取我的投诉列表
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getComplaintsData(pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.complaints.getPageData');
    paramMap.set('pageSize', 10);
    paramMap.set('pageIndex', safe(pageIndex).length>1 ? pageIndex : 1);
    paramMap.set('conditions', { type: '-1' });
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取我的积分
   * @param {*} success 
   * @param {*} failer 
   */
  getValidPointData(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.userpoint.getValidPoint');
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取我的评论
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getEvaluationData(pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.evaluation.getPageData');
    paramMap.set('pageSize', 10);
    paramMap.set('pageIndex', safe(pageIndex).length>1 ? pageIndex : 1);
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取收藏的店铺
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getUserCollectionStoreData(pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.favorite.getUserCollectionStore');
    paramMap.set('pageIndex', safe(pageIndex).length>1 ? pageIndex : 1);
    paramMap.set('pageSize', '20');
    return this.request(paramMap, success, failer)
  }

  /**
   * 检查更新
   * @param {*} success 
   * @param {*} failer 
   */
  checkUpdate(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.checkUpdate');
    paramMap.set('version', YFWUserInfoManager.ShareInstance().version.replace(/\./g, ""));
    paramMap.set('os', Platform.OS);
    return this.request(paramMap, success, failer)
  }

  /**
   * 更新用户信息
   * @param {*} updateData 要更新的内容 { phone: '', qq: '', real_name: '' } 
   * @param {*} success 
   * @param {*} failer 
   */
  updateUserInfo(updateData, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.account.update_app');
    if(isNotEmpty(updateData)) paramMap.set('data', updateData);
    return this.request(paramMap, success, failer)
  }

  /**
   * 实名认证
   * @param {*} realName 
   * @param {*} idCardNo 
   * @param {*} type      1: 使用用药人信息快速认证 2: 手动填写认证
   * @param {*} success 
   * @param {*} failer 
   */
  verifiedRealName(realName, idCardNo, type, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.account.verified');
    paramMap.set('real_name', safe(realName));
    paramMap.set('idcard_no', safe(idCardNo));
    paramMap.set('type', safe(type));
    return this.request(paramMap, success, failer)
  }
}

class YFWOTORequest extends YFWBaseRequest {
  // 首页接口

  /**
   * 初始化首页数据
   * @param {*} success 
   * @param {*} failer 
   */
  getHomeData(success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.oto.getIndexData');
    return this.request(paramMap, success, failer)
  }

  /**
   * 附近药店接口
   * @param {*} pageIndex 
   * @param {*} success 
   * @param {*} failer 
   */
  getHomeNearbyData(pageIndex, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.common.app.oto.getNearbyO2OShop');
    paramMap.set('pageIndex', safe(pageIndex));
    paramMap.set('pageSize', 10);
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取商家信息
   * @param {*} storeID 
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreInfoData(storeID, success, failer) {
    let paramMap = new Map();
    // let cmd = 'guest.o2o.store.getShopInfo as getShopInfo,guest.o2o.store.getShopInfoImage as getShopInfoImage'
    // paramMap.set('getShopInfo', { storeid: safe(storeID) })
    // paramMap.set('getShopInfoImage', { storeid: safe(storeID) })
    // paramMap.set('__cmd', cmd)
    let cmd = 'guest.o2o.store.getShopInfo'
    paramMap.set('__cmd', cmd)
    paramMap.set('storeid',  safe(storeID))
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取商品分类
   * @param {*} categoryid 
   * @param {*} store_medicine_id 
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreCategoryData(categoryid, store_medicine_id, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.o2o.store.getMedicineCategory');
    paramMap.set('categoryid', safe(categoryid));
    paramMap.set('store_medicine', safe(store_medicine_id));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取药店某个分类下的数据
   * @param {*} storeID 
   * @param {*} categoryID 
   * @param {*} store_medicine_id 
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreCategoryMedicineData(storeID, categoryID, store_medicine_id, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.o2o.store.getShopCategoryMedicine');
    paramMap.set('storeid', safe(storeID));
    paramMap.set('id_path', safe(categoryID));
    paramMap.set('store_medicine', safe(store_medicine_id));
    return this.request(paramMap, success, failer)
  }

  /**
   * 加入购物车
   * @param {*} storeID 
   * @param {*} medicineID 
   * @param {*} quantity 
   * @param {*} success 
   * @param {*} failer 
   */
  addMedicineToShoppingCart(storeID, medicineID, quantity, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.carto2o.editCart');
    paramMap.set('storeid', safe(storeID));
    paramMap.set('store_medicineid', safe(medicineID));
    paramMap.set('quantity', safe(quantity));
    this.request(paramMap, res => { 
      success(res)
      refreshOTORedPoint()
    }, fai => {
      failer(fai)
    })
  }

  /**
   * 清空商店购物车
   * @param {*} storeID 
   * @param {*} success 
   * @param {*} failer 
   */
  clearStoreShoppingCart(storeID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.carto2o.clearCart');
    paramMap.set('storeid', safe(storeID));
    this.request(paramMap, res => { 
      success(res)
      refreshOTORedPoint()
    }, fai => {
      failer(fai)
    })
  }

  /**
   * 获取商店购物车数据
   * @param {*} storeID 
   * @param {*} success 
   * @param {*} failer 
   */
  getStoreShoppingCart(storeID, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'person.carto2o.getCart');
    paramMap.set('storeid', safe(storeID));
    return this.request(paramMap, success, failer)
  }

  /**
   * 获取搜索关键字
   * @param {*} keyWords 
   * @param {*} success 
   * @param {*} failer 
   */
  getSearchKeywords(keyWords, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.medicine.getAssociateKeywords');
    paramMap.set('keyword', keyWords);
    paramMap.set('limit', '20');
    paramMap.set('type', 'medicine');
    return this.request(paramMap, success, failer)
  }

  /**
   * 店铺内搜索
   * @param {*} storeID 
   * @param {*} keyword 
   * @param {*} success 
   * @param {*} failer 
   */
  searchStoreMedicine(storeID, keyword, success, failer) {
    let paramMap = new Map();
    paramMap.set('__cmd', 'guest.o2o.store.getShopCategoryMedicine');
    paramMap.set('storeid', safe(storeID));
    paramMap.set('name', safe(keyword));
    return this.request(paramMap, success, failer)
  }
}

module.exports = {
  YFWBaseRequest,
  YFWLoginRequest,
  YFWHomeRequest,
  YFWSearchRequest,
  YFWSellersRequest,
  YFWGoodsRequest,
  YFWStoreRequest,
  YFWShopCartRequest,
  YFWOrderRequest,
  YFWMineRequest,
  YFWOTORequest
}