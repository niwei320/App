import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Dimensions,
    findNodeHandle,
    FlatList,
    Image,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
    Platform, NativeModules
} from 'react-native';
import { backGroundColor } from "../Utils/YFWColor";
import YFWSellersListGoodsHeaderView from './YFWSellersListGoodsHeaderView'
import YFWSellersListCellView from './YFWSellersListCellView'
import YFWSellersListStandardsChangeView from './YFWSellersListStandardsChangeView'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import { doAfterLogin, pushNavigation } from "../Utils/YFWJumpRouting";
import {
    darkStatusBar,
    iphoneBottomMargin,
    isNotEmpty,
    itemAddKey,
    safeObj, tcpImage, haslogin, safe, strMapToObj, kScreenWidth, deepCopyObj, isEmpty, safeArray
} from "../PublicModule/Util/YFWPublicFunction";
import YFWSellerListHead from './view/YFWSellerListHead'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWSellersShopListModel from './Model/YFWSellersShopListModel'
import YFWSellerMenuView from './view/YFWSellerMenuView'
import YFWSellerShopCarModal from './view/YFWSellerShopCarModal'
import { BaseStyles } from "../Utils/YFWBaseCssStyle";
import YFWToast from '../Utils/YFWToast'
import YFWNativeManager from "../Utils/YFWNativeManager";
import ModalView from "../widget/ModalView";
import StatusView from "../widget/StatusView";
import PageIndexWidget from "../widget/PageIndexWidget";
import YFWSellersListGoodsInfoModel from "./Model/YFWSellersListGoodsInfoModel";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import YFWPrestrainCacheManager, { kBillListDataKey } from '../Utils/YFWPrestrainCacheManager';
import { toDecimal } from '../Utils/ConvertUtils';
import YFWNoLocationHint from '../widget/YFWNoLocationHint'
import { addLogPage } from '../Utils/YFWInitializeRequestFunction';
import YFWSellerFilterBoxModal from './view/YFWSellerFilterBoxModal';
import YFWAlertPackageListView from '../GoodsDetail/View/YFWAlertPackageListView'

const width = Dimensions.get('window').width;

const height = Dimensions.get('window').height;
//列表滚动变化监听配置
const VIEWABILITY_CONFIG = {
    minimumViewTime: 300,
    viewAreaCoveragePercentThreshold: 10,
    waitForInteraction: true,
};
const { StatusBarManager } = NativeModules;

let ShareInstance = null
export default class YFWSellersListView extends Component {

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{ width: kScreenWidth, flex: 1, resizeMode: 'stretch' }} />,
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 50, height: 40 }]}
                onPress={() => {
                    navigation.goBack()
                    navigation.state.params.goBack()
                }}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerRight: <YFWSellerListHead shareMethod={() => navigation.state.params._shareMethod()}
            navigation={navigation} />,
        headerStyle: Platform.OS == 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomColor: 'white', backgroundColor: 'white' }
    });

    constructor(props, context) {
        super(props, context);
        let state = safeObj(safeObj(props.navigation.state.params).state);
        this.sectionListHeight = 0
        this.flatListHeight = 0
        this.menuY = -1; //菜单的Y轴位置
        _this = this;
        this.firstLoad = true
        this.haveDismiss = false
        this.userStatusChanged = false
        this.state = {
            commitID: state.value,
            infoData: [],
            data: [],
            pageIndex: 1,
            showFoot: 3,
            orderType: '',
            price_quantity: '0',
            carNumber: new YFWUserInfoManager().shopCarNum + '',
            conditions: {},
            page_total: '1',
            menuSelectIndex: 0,
            currentPage: 1,
            isShowLoading: false,
            showHeaderLine: false,
            url: '',
            filterParam: undefined,
            filterParamJson: {},
            packageModel: {
                shop_id: 0,
                medicine_id: 0,
                img_url: [],
                Standard: '',
                name_cn: '',
                title: '',
                authorized_code: '',
                status: '',
                price: '',
                period_to_Date: '',
                reserve: 0,
                get_coupon_desc: '',
                prohibit_sales_btn_text: '',
                lbuy_no: '',
                max_buy_qty: '',
                get_coupon_cart_show: 0,
                shopmedicine_package: []
            }
        };
        this.onCreate()
        if (!ShareInstance) {
            this.showedCount = 0
            ShareInstance = this
        }
        ShareInstance.state.pageIndex = 1
        ShareInstance.state.commitID = state.value
        ShareInstance.haveDismiss = false

        return ShareInstance
    }

    static sharedInstance() {
        return ShareInstance
    }

    clearStatus() {
        this.setState({
            price_quantity: '0',
            carNumber: new YFWUserInfoManager().shopCarNum + '',
            page_total: '1',
            url: ''
        })
        this.state.commitID = ''
        this.state.currentPage = 1
        this.state.pageIndex = 1
        this.state.data = []
        this.state.infoData = []
        this.state.showFoot = 3
        this.state.orderType = ''
        this.state.conditions = {}
        this.state.menuSelectIndex = 0
        this.state.isShowLoading = false
        this.state.showHeaderLine = false
        this.firstLoad = true
        this.isCreate = false
        this.noFirstDisplay = false
        this.haveDismiss = false
        this.state.filterParam = undefined;
        this.state.filterParamJson = {};
    }

    setGoodsID(goodsID) {
        this.state.commitID = goodsID
    }

    setGoodsInfo(goodsInfoData) {
        goodsInfoData = safeObj(goodsInfoData)
        if (goodsInfoData.mill_title && !goodsInfoData.title) {
            goodsInfoData.title = goodsInfoData.mill_title
        }
        if (goodsInfoData.authorizedCode && !goodsInfoData.authorized_code) {
            goodsInfoData.authorized_code = goodsInfoData.authorizedCode
        }
        if (goodsInfoData.is_buy && !goodsInfoData.show_buy_button) {
            goodsInfoData.show_buy_button = goodsInfoData.is_buy == '1' ? 'true' : ''
        }
        if (goodsInfoData.trocheType && !goodsInfoData.troche_type) {
            goodsInfoData.trocheType = goodsInfoData.troche_type
        }
        goodsInfoData.image_list = [goodsInfoData.intro_image ? goodsInfoData.intro_image : goodsInfoData.introImage]
        this.cachedGoodsInfo = goodsInfoData
        let data = YFWSellersListGoodsInfoModel.getGoodsInfo(goodsInfoData);
        this.state.infoData = itemAddKey(data)
        this.setState({})
    }

    setShopCount(shopCount) {
        this.state.price_quantity = shopCount
    }


    /**
     * 初始化的时候请求所有接口
     */
    onCreate() {
        this.loadStartTime = new Date().getTime()
    }


    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if (this.userStatusChanged) {
                    this.userStatusChanged = false
                    this.state.pageIndex = 1
                    this.state.currentPage = 1
                    this.fetchAllDataFromServer()
                }
                if (YFWUserInfoManager.ShareInstance().hasLogin()) {
                    this.setState({
                        carNumber: new YFWUserInfoManager().shopCarNum + ''
                    })
                }
            }
        );

        DeviceEventEmitter.addListener('SameStorClick', () => {
            this._flatList && this._flatList.scrollToOffset(0)
        })

        DeviceEventEmitter.addListener('UserLoginSucess', () => {
            this.userStatusChanged = true
            this.state.pageIndex = 1
            this.state.currentPage = 1
            this.fetchAllDataFromServer()
            if (YFWUserInfoManager.ShareInstance().hasLogin()) {
                this.setState({
                    carNumber: new YFWUserInfoManager().shopCarNum + ''
                })
            }
        })

        DeviceEventEmitter.addListener('LOGOUT', () => {
            this.userStatusChanged = true
        })

    }

    componentWillMount() {
        addLogPage(1)
    }

    componentDidMount() {
        if (this.props.navigation.state.params.state && this.props.navigation.state.params.state.goodsInfo) {
            this.setGoodsInfo(this.props.navigation.state.params.state.goodsInfo)
        }
        if (this.props.navigation.state.params.state && this.props.navigation.state.params.state.price_quantity) {
            this.setState({
                price_quantity: this.props.navigation.state.params.state.price_quantity
            })
        }
        darkStatusBar()
        this.listener()
        this.props.navigation.setParams({
            _shareMethod: this._shareMethod.bind(this),
            goBack: () => this._goBack()
        })
        this.fetchAllDataFromServer()
    }

    componentWillUnmount() {
        /*销毁的时候移除监听*/
        this.didFocus&&this.didFocus.remove()
        YFWPrestrainCacheManager.sharedManager().clearCachedInfos()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }

    /**判断是否请求完成
     * @param info
     * @param list
     */
    getSuccess(info, list) {
        if (this.infoRequest != true) {
            this.infoRequest = info
        }
        if (this.listRequest != true) {
            this.listRequest = list
        }
        if (this.infoRequest && this.listRequest) {
            this.status && this.status.dismiss()
        }
    }

    getFilterConditionInfo() {
        let conditions = {
            "sort": "",//默认排序
            "sorttype": "",
            "medicineid": this.state.commitID,
            "discount": "0", //是否选中多件优惠
            "lat": YFWUserInfoManager.ShareInstance().latitude,
            "lng": YFWUserInfoManager.ShareInstance().longitude,
            "user_city_name": YFWUserInfoManager.ShareInstance().getCity(),
            "user_region_id": YFWUserInfoManager.ShareInstance().getRegionId(),
        }

        if (this.state.conditions) {
            conditions.discount = this.state.conditions.isPackage ? "1" : "0"
            conditions.isPromotionActivity = this.state.conditions.isPromotionActivity
            switch (this.state.conditions.sort) {
                case "":    //综合排序
                    conditions.sort = "score"
                    conditions.sorttype = "desc"
                    break
                case "evaluationdesc"://评价从高到低
                    conditions.sort = "level"
                    conditions.sorttype = "desc"
                    break
                case "stockdesc":   //库存从高到低
                    conditions.sort = "reserve"
                    conditions.sorttype = "desc"
                    break
                case "distanceasc"://距离
                    conditions.sort = "distance"
                    conditions.sorttype = "asc"
                    break
                case "pricedesc":   //价格降序
                    conditions.sort = "sprice"
                    conditions.sorttype = "desc"
                    break
                case "priceasc"://价格升序
                    conditions.sort = "sprice"
                    conditions.sorttype = "asc"
                    break
            }
        }
        if (isNotEmpty(this.state.filterParam)) {
            for (let [k,v] of this.state.filterParam) {
                if (k == 'aliascn') {
                    const period_type = v
                    conditions["period_type"] = period_type=="one" ? "1" : (period_type=="two" ? "2" : (period_type=="three" ? "3" : "0"))
                } else if (k == 'titleAbb') {
                    conditions["discount"] = v.indexOf("a")!=-1 ? "1" : "0"
                    conditions["is_activity"] = v.indexOf("b")!=-1 ? "1" : "0"
                    conditions["is_coupons"] = v.indexOf("c")!=-1 ? "1" : "0"
                } else if (k == 'standard') {
                    conditions["regionid"] = v
                } else if (k == 'minPrice') {
                    conditions['min_price'] = v
                } else if (k == 'maxPrice') {
                    conditions['max_price'] = v
                }
            }
        }
        return conditions
    }

    fetchAllDataFromServer() {

        let conditions = {};

        if (!this.listRequest && this.state.pageIndex == 1 && safeObj(this.props.navigation.state.params.state).cachedShopGoodsInfo) {
            let res = { result: this.props.navigation.state.params.state.cachedShopGoodsInfo }
            this.dealGoodsShopData(res)
        } else {
            conditions = this.getFilterConditionInfo()
        }

        if (!this.infoRequest && safeObj(this.props.navigation.state.params.state).cachedGoodsInfo) {

            this.status && this.status.showLoading()
            setTimeout(() => {
                let res = { result: this.props.navigation.state.params.state.cachedGoodsInfo }
                this.dealGoodsInfoData(res)
                this.status && this.status.dismiss()
            }, 700);
        } else {

        }

        let paramMap = new Map();
        let cmds = 'guest.medicine.getMedicineDetail as details,guest.medicine.getShopMedicines as shopmedicines'

        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            cmds += ',person.sameStore.getSameStoreCount as sameStoreCount'
            paramMap.set('sameStoreCount',{'mid':this.state.commitID});
        }
        paramMap.set('__cmd', cmds);

        paramMap.set('details', {
            'mid': this.state.commitID,
            'user_region_id': YFWUserInfoManager.ShareInstance().getRegionId(),
            'user_city_name': YFWUserInfoManager.ShareInstance().getCity(),
        });

        paramMap.set('shopmedicines', {
            'pageSize': '10',
            'pageIndex': this.state.pageIndex,
            'conditions': conditions,
            'user_region_id': YFWUserInfoManager.ShareInstance().getRegionId(),
            'user_city_name': YFWUserInfoManager.ShareInstance().getCity(),
        });
        let viewModel = new YFWRequestViewModel();
        this.startRequestTime = new Date().getTime()
        viewModel.TCPRequest(paramMap, (res) => {
            if (this.haveDismiss) {
                return
            }
            if (this.isCreate != true) {
                this.state.requestEndTime = new Date().getTime() - this.startRequestTime
                this.state.connectServerTime = toDecimal(res.connectServerTime * 1000)
                this.state.sendParamTime = toDecimal(res.sendParamTime * 1000)
                this.state.getResponseTime = toDecimal(res.getAllResponseTime * 1000)
                this.state.unpackTime = toDecimal(res.unpackTime * 1000)
                this.state.getResponseTimeArray = res.getResponseTimeArray
                this.isCreate = true
            }
            let result = safeObj(res.result)
            let goodsInfo = result['details'];
            if (goodsInfo && goodsInfo.error != undefined) {
                this.status && this.status.showNetError()
            } else if (goodsInfo) {
                this.dealGoodsInfoData({ result: goodsInfo })
            }


            let goodsShopInfo = result['shopmedicines']
            if (goodsShopInfo && goodsShopInfo.error != undefined) {
                this.status && this.status.showNetError()
                this.setState({
                    showFoot: 0,
                });
            } else if (goodsShopInfo) {
                if (goodsInfo) {
                    goodsShopInfo.show_buy_button = goodsInfo.show_buy_button
                }
                this.dealGoodsShopData({ result: goodsShopInfo })

            }
            if (YFWUserInfoManager.ShareInstance().hasLogin()) {
                let sameStoreInfo = result['sameStoreCount']
                this.dealSameStoreCount({result:sameStoreInfo})
            }
        }, (e) => {
            this.status && this.status.showNetError()
        }, false);


    }

    //获取商品详情信息 @ Request @ -------------------
    async getgoodsInfoData() {
        if (!this.infoRequest && safeObj(this.props.navigation.state.params.state).cachedGoodsInfo) {

            this.status && this.status.showLoading()
            setTimeout(() => {
                let res = { result: this.props.navigation.state.params.state.cachedGoodsInfo }
                this.dealGoodsInfoData(res)
                this.status && this.status.dismiss()
            }, 700);
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getMedicineDetail');
        paramMap.set('mid', this.state.commitID);
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.dealGoodsInfoData(res)
        }, (e) => {
            this.status && this.status.showNetError()
        }, false);


    }

    dealGoodsInfoData(res) {
        res = safeObj(res)
        res.result = safeObj(res.result)
        if (!this.infoRequest) {
            YFWPrestrainCacheManager.sharedManager().addCachedInfoWithKey(this.state.commitID + 'goodsInfo', res.result)
        }

        if (this.cachedGoodsInfo && safeArray(this.cachedGoodsInfo.image_list).length > 0) {
            safeArray(res.result.image_list).splice(0, 1, this.cachedGoodsInfo.image_list[0])
            this.cachedGoodsInfo = null
        }

        this.getSuccess(true, false)
        let data = YFWSellersListGoodsInfoModel.getGoodsInfo(res.result);
        this.goodsInfoOriginData = res.result
        this.setState({
            infoData: data,
            price_quantity: safeObj(res.result).shop_num,//报价商家数
        })
    }

    componentDidUpdate() {
        if (this.isCreate && this.firstLoad) {
            this.state.loadEndTime = new Date().getTime() - this.loadStartTime
            this.firstLoad = false
        }
    }

    //获取商家列表
    async getGoodsShopData() {
        if (!this.listRequest && this.state.pageIndex == 1 && safeObj(this.props.navigation.state.params.state).cachedShopGoodsInfo) {
            let res = { result: this.props.navigation.state.params.state.cachedShopGoodsInfo }
            this.dealGoodsShopData(res)
            return
        }
        let paramMap = new Map();
        let conditions = this.getFilterConditionInfo()

        paramMap.set('__cmd', 'guest.medicine.getShopMedicines');
        paramMap.set('pageSize', '10');
        paramMap.set('pageIndex', this.state.pageIndex + '');
        paramMap.set('conditions', conditions);
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.dealGoodsShopData(res)
        }, (error) => {
            this.status && this.status.showNetError()
            this.setState({
                showFoot: 0,
            });
        }, this.state.isShowLoading);

    }

    dealGoodsShopData(res) {
        res = safeObj(res)
        res.result = safeObj(res.result)
        if (this.goodsInfoOriginData) {
            res.result.show_buy_button = this.goodsInfoOriginData.show_buy_button
        }
        if (this.state.pageIndex == 1 && !this.listRequest) {
            YFWPrestrainCacheManager.sharedManager().addCachedInfoWithKey(this.state.commitID + 'shopListInfo', res.result)
        }
        this.getSuccess(false, true)
        let showFoot = 0;
        let dataArray = YFWSellersShopListModel.getModelArray(res.result);
        this.fetchPrestrainGoodsData(dataArray)
        if (res.result.invite_item) {
            this.state.url = safe(res.result.invite_item.invite_url)
        }
        if (dataArray.length < 10) {
            showFoot = 1;
        }
        if (this.state.pageIndex > 1 && this.state.data.length >= 10) {
            dataArray = this.state.data.concat(dataArray);
        }
        dataArray = itemAddKey(dataArray);

        let pageTotal = safeObj(res.result).pageCount

        if (isEmpty(pageTotal)) {
            pageTotal = 0
        }
        pageTotal += 1
        //分页总数
        this.pageView && this.pageView.setProgress(this.state.currentPage, pageTotal)
        this.state.showFoot = showFoot
        this.setState({
            data: dataArray,
            page_total: pageTotal
        });
    }

    fetchPrestrainGoodsData(list) {
        if (YFWPrestrainCacheManager.sharedManager().type != kBillListDataKey) {
            YFWPrestrainCacheManager.sharedManager().changeType(kBillListDataKey)
        }
        YFWPrestrainCacheManager.sharedManager().cachedNewDatasWithList(list)
    }

    /**
     * 获取TCP同店购数量
     * */
    getTcpSameStoreCount() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.sameStore.getSameStoreCount');
        paramMap.set('mid', this.state.commitID);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.dealSameStoreCount(res)
        }, (error) => {
            let e = error
        }, false);
    }

    dealSameStoreCount(res) {
        safeObj(this.state.infoData).type = safeObj(res.result).isInSameStore ? "2" : "1"
        safeObj(this.state.infoData).tdg_goods_count = safeObj(res.result).sameStoreCount
        if (this.state.infoData && this.state.infoData.tdg_goods_count > 0) {
            //通知同店购的红点显示
            DeviceEventEmitter.emit('SHOW_SAME_SHOP_RED_POINT', { value: true })
        } else {
            DeviceEventEmitter.emit('SHOW_SAME_SHOP_RED_POINT', { value: false })
        }
        this.setState({})
    }

    _addShopCar(item) {
        if (this.state.packageModel.medicine_id == item.shop_goods_id) {
            this.packageAlert && this.packageAlert.show(0)
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.shopMedicine.getBJMedicineDetail');
        paramMap.set('store_medicine_id', item.shop_goods_id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.dealAlertPackageInfo(item, safeObj(res.result))
        }, (error) => {
        });
    }

    _addShopCarMethod (item) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.addCart');
        paramMap.set('quantity', item.quantity);

        let addCarID = item.package_id;
        if (item.buyType != 'single') {
            paramMap.set('packageId', addCarID );
        } else {
            paramMap.set('storeMedicineId', addCarID );
        }
        YFWUserInfoManager.ShareInstance().addCarIds.set(addCarID + '', 'id')
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('商品添加成功');
            DeviceEventEmitter.emit("SHOPCAR_INFO_CHANGE", this.state.packageModel.shop_id)//通知购物车 该商家商品发生变化  刷新凑单数据
            this.getCarNumber();
        }, (error) => {
        });
    }

    dealAlertPackageInfo (item, result) {
        const { infoData } = this.state
        let medicineModel = {
            shop_id: safe(item.shop_id),
            medicine_id: safe(item.shop_goods_id),
            img_url: safeArray(infoData.image_list),
            Standard: safe(infoData.standard),
            name_cn: safe(infoData.name_cn),
            title: safe(infoData.title),
            authorized_code: safe(infoData.authorized_code),
            status: 'sale',
            price: toDecimal(item.price),
            period_to_Date: safe(item.period_to),
            reserve: safeObj(item.reserve),
            get_coupon_desc: safe(item.coupons_desc),
            prohibit_sales_btn_text: '',
            lbuy_no: safeObj(result.max_buyqty),
            limit_buy_prompt: safe(result.limit_buy_prompt),
            max_buy_qty: safeObj(result.max_buyqty),
            get_coupon_cart_show: 0,
            shopmedicine_package: [],
            standards: [
                {
                    id: safe(item.shop_goods_id),
                    real_price: toDecimal(item.price),
                    period_to: safe(item.period_to),
                    standard: safe(infoData.standard),
                    troche_type: safe(infoData.troche_type),
                    price_desc: ''
                }
            ]
        }
        // if (isNotEmpty(result) && safeArray(result.OtherStandard).length > 0) {
        //     medicineModel.standards = medicineModel.standards.concat(safeArray(result.OtherStandard))
        // }
        if (isNotEmpty(result) && safeArray(result.Packages).length > 0) {
            medicineModel.shopmedicine_package = safeArray(result.Packages).map(packageItem => {
                let packageModel = {
                    goods_count: safeObj(packageItem.medicine_count),
                    name: safe(packageItem.name),
                    name_aliase: safe(packageItem.name_aliase),
                    original_price: safe(packageItem.original_price),
                    package_id: safe(packageItem.package_id),
                    package_type: safeObj(packageItem.package_type),
                    price_total: safeObj(packageItem.price),
                    save_price: safeObj(packageItem.save_price),
                    shop_goods_id: safe(packageItem.store_medicineid)
                }
                packageModel.sub_items = safeArray(packageItem.medicine_list).map(medicineItem => {
                    return {
                        image_url: safe(medicineItem.image_url),
                        name_cn: safe(medicineItem.namecn),
                        period_to_Date: safe(medicineItem.period_to),
                        price: safe(medicineItem.price),
                        quantity: safe(medicineItem.quantity),
                        standard: safe(medicineItem.standard),
                        title: safe(medicineItem.medicine_name),
                    }
                })

                return packageModel
            })
        }
        this.state.packageModel = medicineModel
        this.setState({ packageModel: medicineModel })

        this.packageAlert && this.packageAlert.show(0, null, true)
    }

    getCarNumber() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.getCartCount');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.dealCarNumber(res)
        }, (error) => {
            let e = error
        }, false);
    }

    dealCarNumber(res) {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        new YFWUserInfoManager().shopCarNum = res.result.cartCount + ''
        DeviceEventEmitter.emit('SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
        this.setState({
            carNumber: res.result.cartCount,
        });
    }


    // ===== View =====
    render() {
        let listDataArray = [{ key: 'top' }, { key: 'menu' }].concat(this.state.data)
        return (
            <View style={{ flex: 1 }}>
                <YFWNoLocationHint />
                {this._renderHeaderLine()}
                <View style={styles.container}>
                    <FlatList
                        extraData={this.state}
                        data={listDataArray}
                        renderItem={this._renderItem.bind(this)}
                        ref={(flatList) => this._flatList = flatList}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1}
                        onScroll={(e) => { this.sectionScroll(e) }}
                        scrollEventThrottle={100}
                        stickyHeaderIndices={[1]}
                    ></FlatList>
                    <ModalView ref={(item) => this.layer = item} animationType="fade">
                        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }} />
                    </ModalView>
                    <YFWSellersListStandardsChangeView ref={'Standards'} Data={this.state.infoData}
                        navigation={this.props.navigation}
                        standards={safeObj(safeObj(this.state.infoData).goods_standard)}
                        changeStandarsMethod={(standars) => this._changeStandarsMethod(standars)}
                        dismiss={() => { this.layer.disMiss() }}
                    />
                    <YFWSellerShopCarModal navigation={this.props.navigation}
                        shopCount={this.state.carNumber} />
                    <TouchableOpacity activeOpacity={1}
                        style={{ position: 'absolute', right: 10, bottom: 60 + iphoneBottomMargin() }} onPress={() => {
                            this._flatList&&this._flatList.scrollToOffset(0)
                            YFWNativeManager.mobClick('price page-top')
                        }}>
                        <Image source={require('../../img/ic_to_top.png')}
                            style={{ width: 45, height: 45, resizeMode: 'contain' }} />
                    </TouchableOpacity>
                    <PageIndexWidget ref={(item) => { this.pageView = item }} />
                    <YFWSellerFilterBoxModal ref={(filter)=>this._filter = filter}
                                category_id={this.state.category_id} paramJson={this.state.filterParamJson}
                                saveMethod={(param,paramJson)=>this._filterBackMethod(param,paramJson)}
                                from={'YFWSellerController'}/>
                    <YFWAlertPackageListView ref={e => this.packageAlert = e} data={this.state.packageModel}
                                // _changeSelectItem={(item)=>{
                                //     this._changeSelectItem(item)
                                // }}
                                addShopCarMethod={(package_id)=>{
                                    this._addShopCarMethod(package_id)
                                }}
                                // byNowMethod={(package_id)=>{
                                //     this._byNowMethod(package_id)
                                // }}
                                navigation={this.props.navigation}
    />
                    {/* <StatusView ref={(item)=>this.status = item} retry={()=>{
                        this.state.isShowLoading = false
                        this.getGoodsShopData()
                    }}/> */}
                </View>
            </View>
        );

    }

    /**
     * 返回记录加载速度
     * @returns {*}
     */
    renderLoadTime() {
        return (
            <View style={{ justifyContent: 'center', position: 'absolute', right: 0, top: height / 5, backgroundColor: '#892b60', height: 30, borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }}>
                <Text style={{ color: 'white' }}>{this.state.loadEndTime}ms</Text>
            </View>
        )
    }

    /**
     * 返回记录加载速度
     * @returns {*}
     */
    renderRequestTime() {
        let allTime = this.state.getResponseTimeArray ? this.state.getResponseTimeArray.map((time) => {
            return { time: toDecimal(time * 1000), title: '', color: '#ff3300' }
        }) : []
        allTime = allTime.concat([
            // {time:this.state.connectServerTime,title:'链接服务器',color:'#ff3300'},
            // {time:this.state.sendParamTime,title:'发参数',color:'#892b60'},
            { time: this.state.getResponseTime, title: '得到响应', color: '#ff3300' },
            { time: this.state.unpackTime, title: '解析', color: '#ff3300' },
            { time: this.state.requestEndTime, title: '总耗时', color: '#ff3300' },])
        let views = []
        allTime.map((item, index) => {

            views.push(
                <View style={{ justifyContent: 'center', position: 'absolute', right: 0, top: height / 5 + 40 * (index + 1), backgroundColor: item.color, height: 30, borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }}>
                    <Text style={{ color: 'white' }}>{item.title + item.time}ms</Text>
                </View>
            )
        })
        return (views)
    }


    closeControlPanel() {
        this._filter&&this._filter.closeView();
    };

    openControlPanel() {
        this._filter&&this._filter.showView();
    };

    _filterBackMethod(param, paramJson) {
        this.state.filterParam = param;
        this.state.filterParamJson = paramJson;
        this.closeControlPanel();
        this.state.pageIndex = 1;
        this.state.isShowLoading = true
        this.getGoodsShopData();
    }

    //  @ listView @ --------------------------------

    sectionScroll(e) {
        let scrollY = e.nativeEvent.contentOffset.y;
        this.setPage(scrollY)
        if (Platform.OS == 'android') {
            if (scrollY <= 0) {
                this.setState({
                    showHeaderLine: false
                })
            } else {
                this.setState({
                    showHeaderLine: true
                })
            }
        }
    }

    /**
     * 设置页数
     */
    setPage(scrollY) {
        //10是分割线
        let listOffset = scrollY - (this.flatListHeight + this.sectionListHeight - 20)
        let average = height / 100
        let count = average + listOffset / 100
        //预加载下一页  cell height = 85
        let unShowedCount = parseInt(this.state.data.length - scrollY / 85)
        if (unShowedCount < 10) {
            this._onEndReached()
        }
        let page = parseInt(count / 10) + 1
        this.state.currentPage = page
        this.pageView && this.pageView.setProgress(page, this.state.page_total)
    }

    _renderItem = (item) => {
        // YFWToast(item.index);
        // console.log(item.index);
        if (item.item.key == 'top') {
            return (
                <View onLayout={(e) => {
                    let { height } = e.nativeEvent.layout;
                    this.flatListHeight = height
                }}>
                    <YFWSellersListGoodsHeaderView
                        Data={this.state.infoData}
                        shopCount={this.state.price_quantity}
                        showPopupDialog={() => this._showPopupDialog()}
                        navigation={this.props.navigation}
                        medicineId={this.state.commitID}
                        sameStoreChangeAction={()=>{this.getTcpSameStoreCount()}}
                        showSameShop={this.props.navigation.state.params.state.showSameShop} />
                </View>
            )
        }
        if (item.item.key == 'menu') {
            const isPromotion = safeObj(this.state.infoData).is_promotion_activity_screen || false
            return (
                <View onLayout={(e) => {
                    let { height } = e.nativeEvent.layout;
                    this.sectionListHeight = height
                }}>
                    <YFWSellerMenuView
                        ref={(item) => this.menu = item}
                        navigation={this.props.navigation}
                        isPromotion={isPromotion}
                        showPopupDialog={() => this._showPopupDialog()}
                        getOrdertype={(param, index) => this._refreshDataWithOrderType(param, index)} />

                </View>
            )
        }
        return (
            <View style={styles.item} id={item.item.shop_id}>
                <TouchableOpacity accessibilityLabel={'shop_'+item.index} activeOpacity={1} style={{ flex: 1 }} onPress={() => this.selectItemIndex(item.item)}>
                    <YFWSellersListCellView accessibilityLabel={'shop_'+item.index+'_addcar'} Data={item.item} addShopCar={() => doAfterLogin(this.props.navigation.navigate, () => { this._addShopCar(item.item) })}
                        navigation={this.props.navigation} />
                </TouchableOpacity>
            </View>
        )

    }

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot} />
    }

    _goBack() {
        this.haveDismiss = true
        this.state.infoData = []
        if (ShareInstance && ShareInstance.showedCount >= 7) {
            ShareInstance = null
        } else if (ShareInstance) {
            ShareInstance.showedCount++
            ShareInstance.haveDismiss = true
        }
    }


    _shareMethod() {
        let userInfo = YFWUserInfoManager.ShareInstance();
        let ads_item = safeObj(safeObj(userInfo.SystemConfig).ads_item);
        let isShowHead = (isNotEmpty(ads_item.isappear) && String(ads_item.isappear) == 'true')
        if (isNotEmpty(this.state.infoData.title)) {
            let param = {
                page: 'seller',
                goods_id: this.props.navigation.state.params.state.value,
                title: this.state.infoData.title,
                image: this.state.infoData.img_url,
                url: this.state.url,
                isShowHead: isShowHead
            };

            DeviceEventEmitter.emit('OpenShareView', param);
        }

    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.state.showFoot = 2
        this.setState({});
        this.state.isShowLoading = false
        this.getGoodsShopData();

    }

    selectItemIndex(rowData) {

        let { navigate } = this.props.navigation;
        let cachedData = YFWPrestrainCacheManager.sharedManager().getCachedInfoWithKey(rowData.shop_goods_id)
        pushNavigation(navigate, {
            type: 'get_shop_goods_detail',
            value: rowData.shop_goods_id,
            img_url: tcpImage(safeObj(safeObj(this.state.infoData).img_url)),
            cachedData: cachedData,
            goodsInfo: this.goodsInfoOriginData,
            price: rowData.price,
            scheduled_name: rowData.scheduled_name,
        });

    }


    _refreshDataWithOrderType(param, index) {
        if (param&&param.sort == 'filter') {
            this.openControlPanel()
            return
        }
        this.state.pageIndex = 1;
        this.state.conditions = param;
        this.state.isShowLoading = true
        this.getGoodsShopData();
    }

    _showPopupDialog() {
        this.layer && this.layer.show()
        this.refs['Standards'] && this.refs['Standards'].show();
        YFWNativeManager.mobClick('price page-spec')
    }

    _changeStandarsMethod(standars) {

        this.state.commitID = standars.id;
        this.state.pageIndex = 1;
        this.refs['Standards'] && this.refs['Standards'].clickItemSelect(0);
        this.state.isShowLoading = true
        this.getGoodsShopData();
        this.getgoodsInfoData();
    }

    _renderHeaderLine() {
        if (this.state.showHeaderLine) {
            return (<AndroidHeaderBottomLine ref={'headerLine'} />)
        } else {
            return (<View style={{ width: width, height: 0.5, backgroundColor: '#FFFFFF' }} />)
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: backGroundColor()
    },
    text: {
        fontSize: 20,
        textAlign: 'center'
    },
    item: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'

    },
});