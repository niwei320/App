import React from 'react';
import YFWWDStoreHomeView from '../View/YFWWDStoreHomeView';
import YFWWDStoreHomeModel from '../Model/YFWWDStoreHomeModel';
import {
    safeArray,
    safe,
    safeObj,
    itemAddKey,
    tcpImage,
    isNotEmpty
} from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';
import YFWWDCategoryItemModel from '../../Widget/Model/YFWWDCategoryItemModel';
import YFWWDListPageDataModel from '../../Widget/Model/YFWWDListPageDataModel';
import YFWWDMedicineInfoModel from '../../Widget/Model/YFWWDMedicineInfoModel';
import YFWWDStoreInfoModel from '../../Widget/Model/YFWWDStoreInfoModel';
import YFWToast from '../../../Utils/YFWToast';
import { pushWDNavigation, kRoute_apply_account, kRoute_shop_detail_list, kRoute_shop_goods_detail, kRoute_shop_detail_intro, kRoute_search } from '../../YFWWDJumpRouting';
import { kList_from } from '../../Base/YFWWDBaseModel';




export default class YFWWDStoreHomeController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDStoreHomeModel()
        this.model.shopInfo.shopId = this.props.navigation.state.params.state&&this.props.navigation.state.params.state.value
        this.view = <YFWWDStoreHomeView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() {
        this.request()
    }

    componentWillUnmount() {

    }

    render() {
        return this.view
    }


    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getShopInfo as getShopInfo,store.whole.app.getSpecialCategoryWhole as getCategory,store.whole.app.getStoreMedicineTop as getRecommend');
        paramMap.set('getShopInfo', {
            'storeid':this.model.shopInfo.shopId
        });
        paramMap.set('getRecommend', {
            'storeid':this.model.shopInfo.shopId,
            'count': 6
        });

        YFWWDStoreHomeModel.getStoreHomeData(paramMap, (res) => {
            let homeData = res.result['getShopInfo']
            this.handleHomeData(homeData)
            let catagoryData = res.result['getCategory']
            this.handleCategoryData(catagoryData)
            let recommendData = res.result['getRecommend']
            this.handleRecommendData(recommendData)
            this.view&&this.view.updateViews()
        }, (err) => {

        },true)
    }

    handleHomeData(data) {
        data = safeObj(data)
        let instance = new YFWWDStoreInfoModel()
        instance.shopId = String(safeObj(data.shop_id)) == ''?this.model.shopInfo.shopId:safeObj(data.shop_id)
        instance.storeName = safeObj(data.title)
        instance.isfaverate = safeObj(data.is_favorite)
        instance.storeGoodsNum = safeObj(data.onsales_medicine_count)
        instance.storeAge = safeObj(data.open_year)
        instance.dict_audit = safeObj(data.dict_audit)
        instance.open_coupons = YFWWDStoreInfoModel.getCouponArray(data.open_coupons_list)
        instance.coupon = YFWWDStoreInfoModel.getCouponArray(data.coupons_list)
        this.model.shopInfo = instance
    }


    handleCategoryData(data) {
        data = safeArray(data)
        let returnArray = []
        let listPageDataArray = []
        returnArray.push('商家优选')
        //初始化分类商品YFWWDListPageDataModel
        data.forEach((value, index) => {
            let instance = new YFWWDCategoryItemModel(safeObj(value.name), safeObj(value.id))
            this.model.catagory.push(instance)
            returnArray.push(instance.name)

            let listinstance = new YFWWDListPageDataModel()
            listinstance.needRequest = true
            listinstance.pageSize = 6
            listinstance.from = 'storehome'
            listinstance.shopId = this.model.shopInfo.shopId
            listinstance.categoryId = value.id
            listinstance.numColumns = 2
            listPageDataArray.push(listinstance)
        });
        this.model.tabs = returnArray
        this.model.dataArray.splice(1,0,...listPageDataArray)
    }

    handleRecommendData(data) {
        data = safeArray(data)
        let medicineArray = this.getMedicineArray(data)
        let instance = new YFWWDListPageDataModel()
        instance.needRequest = false
        instance.numColumns = 2
        instance.from = 'storehome'
        instance.dataArray = medicineArray
        this.model.recommend = data
        this.model.dataArray.splice(0,0,instance)
    }


/******************delegete********************/

    /**点击头部搜索栏 */
    toSearch() {
        pushWDNavigation(this.props.navigation.navigate, {type:kRoute_search,shop_id:this.model.shopInfo.shopId})
    }

    /**收藏、取消收藏商家 */
    toCollect() {
        let service = 'store.account.collectStore';
        let toastType = '收藏';
        if (this.model.shopInfo.isfaverate) {
            service = 'store.account.cancelCollectStore';
            toastType = '取消收藏';
        }
        let paramMap = new Map();
        paramMap.set('__cmd', service);
        paramMap.set('storeid', this.model.shopInfo.shopId);
        YFWWDStoreHomeModel.request(paramMap, (res) => {
            YFWToast(toastType + '成功');
            this.model.shopInfo.isfaverate = !this.model.shopInfo.isfaverate
            this.view.updateViews()
        }, ((error) => {

        }));
    }

    /**申请开户 */
    toOpenAccount() {
        let {navigate} = this.props.navigation;
        pushWDNavigation(navigate,{value:this.model.shopInfo.shopId,type:kRoute_apply_account});
    }

    /**scrollview切换tab */
    onChangeTab(value) {
        let list_index = value.i
        this.model.listIndex = list_index
        let instance = YFWWDListPageDataModel.init(this.model.dataArray[list_index])
        if (!instance.needRequest) {
            return
        }
        if (instance.dataArray.length == 0) {
            this.getListData(instance, (data) => {
                this.getMedicineArray(data, (medicineArray) => {
                    instance.dataArray = medicineArray
                    if (instance.currentPage == 1&&data.length < instance.pageSize) {
                        instance.showFoot = 1
                    }
                    this.model.dataArray[list_index] = instance
                    this.view.updateViews()
                })
            })
        }

    }

    /**
     * 获取YFWWDMedicineInfoModel类型数组
     * @param {原始数据} data
     * @param {回调} back
     * @param {为数组添加 'key' } key
     */
    getMedicineArray(data, back, key) {
        let medicineArray = []
        data.forEach((value, index) => {
            let medicine = YFWWDMedicineInfoModel.initWithData(value,kList_from.kList_from_storehome)
            medicineArray.push(medicine)
        });
        back && back(itemAddKey(medicineArray, key))
        return medicineArray
    }

    /**
     * 获取原始数据数组
     * @param {YFWWDListPageDataModel} instance
     * @param {数据回调} back
     */
    getListData(instance,back,isrefresh) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getStoreMedicineSearchWhole')
        paramMap.set('storeid', instance.shopId);
        paramMap.set('categoryid', instance.categoryId);
        paramMap.set('pageSize', instance.pageSize);
        paramMap.set('pageIndex', instance.currentPage);
        paramMap.set('orderField', instance.orderField);
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        YFWWDListPageDataModel.getListPageDate(paramMap, (res) => {
            let data = safeArray(res.result.dataList)
            back&&back(data)
        }, (err) => {

        },isrefresh?false:instance.currentPage == 1?true:false)
    }

    /**列表下拉刷新 */
    listRefresh() {
        let pageParams = YFWWDListPageDataModel.init(this.model.dataArray[this.model.listIndex])
        pageParams.currentPage = 1
        pageParams.showFoot = 0
        pageParams.dataArray = []
        pageParams.refreshing = true
        this.view.updateViews()
        this.getListData(pageParams, (data) => {
            this.getMedicineArray(data, (medicineArray) => {
                pageParams.refreshing = false
                pageParams.dataArray = medicineArray
                this.model.dataArray[this.model.listIndex] = pageParams
                this.view.updateViews()
            })
        },true)
    }

    /**列表到底部触发的加载数据方法 */
    onEndReached() {
        let pageParams = YFWWDListPageDataModel.init(this.model.dataArray[this.model.listIndex])
        if (pageParams.dataArray.length < pageParams.pageSize&&pageParams.currentPage == 1) {
            pageParams.showFoot = 1

            this.model.dataArray[this.model.listIndex] = pageParams
            this.view.updateViews()
        } else if (pageParams.showFoot == 1) {
            return
        }else {
            pageParams.showFoot = 2
            this.view.updateViews()
            pageParams.currentPage++
            this.getListData(pageParams, (data) => {
                if (data.length < pageParams.pageSize) {
                    pageParams.showFoot = 1
                }
                this.getMedicineArray(data, (medicineArray) => {
                    pageParams.dataArray.push(...medicineArray)
                    this.model.dataArray[this.model.listIndex] = pageParams
                    this.view.updateViews()
                },pageParams.dataArray.length)

            })
        }
    }

    /**点击商家简介 */
    shopJianJieMethod() {
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_shop_detail_intro, value:this.model.shopInfo.shopId })
    }

    /**点击全部商品 */
    shopAllGoodsMethod() {
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_shop_detail_list, value:this.model.shopInfo.shopId })
    }

    /**点击线在咨询 */
    shopOnlineAdvisoryMethod() {
        this.toCustomerService({shop_id : this.model.shopInfo.shopId})
    }

    toDetail(medicine) {
        let instance = YFWWDMedicineInfoModel.initWithModel(medicine)
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_shop_goods_detail, value: instance.id, img_url: tcpImage(instance.image) })
    }

    getCouponMethod(item) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.usercoupons.acceptCoupon');
        paramMap.set('id', item.id);
        this.model.requestWithParams(paramMap, (res)=> {
            YFWToast('领取成功');
        });
    }

}
