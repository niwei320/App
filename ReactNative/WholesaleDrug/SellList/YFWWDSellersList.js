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
import { backGroundColor } from "../../Utils/YFWColor";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import {
    darkStatusBar,
    iphoneBottomMargin,
    isNotEmpty,
    itemAddKey,
    safeObj, tcpImage, haslogin, safe, strMapToObj, kScreenWidth, deepCopyObj, isEmpty, kStyleWholesale
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import YFWWDSellersShopListModel from './Model/YFWWDSellersShopListModel'
import YFWToast from '../../Utils/YFWToast'
import YFWNativeManager from "../../Utils/YFWNativeManager";
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import YFWPrestrainCacheManager, { kBillListDataKey } from '../../Utils/YFWPrestrainCacheManager';
import YFWNoLocationHint from '../../widget/YFWNoLocationHint'
import YFWHeaderBackground from '../Widget/YFWHeaderBackground';
import YFWHeaderLeft from '../Widget/YFWHeaderLeft';
import YFWWDSellersListGoodsHeaderView from './View/YFWWDSellersListGoodsHeaderView';
import YFWWDSellersListGoodsInfoModel from './Model/YFWWDSellersListGoodsInfoModel';
import YFWWDSellsDataView from '../Widget/YFWWDSellsDataView';
import YFWWDSellersListCellView from './View/YFWWDSellersListCellView';
import { pushWDNavigation, kRoute_goods_detail, kRoute_shop_goods_detail ,doAfterLogin} from '../YFWWDJumpRouting';
import { refreshWDRedPoint } from '../../Utils/YFWInitializeRequestFunction';
import YFWSellersListStandardsChangeView from "../../Goods/YFWSellersListStandardsChangeView";
import YFWSellerShopCarModal from "../../Goods/view/YFWSellerShopCarModal";

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
export default class YFWWDSellersList extends Component {

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerBackground: (<YFWHeaderBackground from={kStyleWholesale}></YFWHeaderBackground>),
        headerLeft: (
            <YFWHeaderLeft navigation={navigation} goBack={() => {
                navigation.state.params.goBack()
            }}></YFWHeaderLeft>
        ),
        headerRight: <View />,
        headerTitle: '更多报价',
        headerTitleStyle: {fontSize: 16, color: '#fff', textAlign: 'center', flex: 1},
        headerStyle: Platform.OS == 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomColor: 'white', backgroundColor: 'white' }
    });

    constructor(props, context) {
        super(props, context);
        let state = props.navigation.state.params.state;
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
            carNumber: new YFWUserInfoManager().wdshopCarNum + '',
            conditions: {},
            page_total: '1',
            menuSelectIndex: 0,
            currentPage: 1,
            isShowLoading: false,
            showHeaderLine: false,
            url: '',
            sale_shop_num:'',
            dataReferenceWholesale:{receive_price:'',store_num:'',sale_count:''}
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
            carNumber: new YFWUserInfoManager().wdshopCarNum + '',
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
    }

    setGoodsID(goodsID) {
        this.state.commitID = goodsID
    }

    setGoodsInfo(goodsInfoData) {
        if (goodsInfoData.mill_title && !goodsInfoData.title) {
            goodsInfoData.title = goodsInfoData.mill_title
        }
        if (goodsInfoData.authorizedCode && !goodsInfoData.authorized_code) {
            goodsInfoData.authorized_code = goodsInfoData.authorizedCode
        }
        if (goodsInfoData.is_buy && !goodsInfoData.show_buy_button) {
            goodsInfoData.show_buy_button = goodsInfoData.is_buy == '1' ? 'true' : ''
        }
        goodsInfoData.image_list = [goodsInfoData.intro_image ? goodsInfoData.intro_image : goodsInfoData.introImage]
        this.cachedGoodsInfo = goodsInfoData
        let data = YFWWDSellersListGoodsInfoModel.getGoodsInfo(goodsInfoData);
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
                        carNumber: new YFWUserInfoManager().wdshopCarNum + ''
                    })
                }
            }
        );

        DeviceEventEmitter.addListener('WDUserLoginSucess', () => {
            this.userStatusChanged = true
            this.state.pageIndex = 1
            this.state.currentPage = 1
            this.fetchAllDataFromServer()
            if (YFWUserInfoManager.ShareInstance().hasLogin()) {
                this.setState({
                    carNumber: new YFWUserInfoManager().wdshopCarNum + ''
                })
            }
        })

        DeviceEventEmitter.addListener('WDLOGOUT', () => {
            this.userStatusChanged = true
        })

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
            goBack: () => this._goBack()
        })
        this.fetchAllDataFromServer()

        YFWNativeManager.mobClick('b2b-more-1')
    }

    componentWillUnmount() {
        /*销毁的时候移除监听*/
        this.didFocus.remove()
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

    fetchAllDataFromServer() {

        if (!this.listRequest && this.state.pageIndex == 1 && this.props.navigation.state.params.state.cachedShopGoodsInfo) {
            let res = { result: this.props.navigation.state.params.state.cachedShopGoodsInfo }
            this.dealGoodsShopData(res)
        }

        if (!this.infoRequest && this.props.navigation.state.params.state.cachedGoodsInfo) {

            this.status && this.status.showLoading()
            setTimeout(() => {
                let res = { result: this.props.navigation.state.params.state.cachedGoodsInfo }
                this.dealGoodsInfoData(res)
                this.status && this.status.dismiss()
            }, 700);
        } else {

        }
        let infos =  this.props.navigation.state.params.state
        let medicine_id = infos.value
        let params = new Map();
        params.set('__cmd', 'store.whole.medicine.getMedicineDetail as details, store.whole.medicine.getMoreShopMedicinesWholesale as shopmedicines')
        let conditions = new Map()
        conditions.set('medicineid', medicine_id)
        params.set('shopmedicines', {
            pageSize: 10,
            pageIndex: 1,
            orderField: 'real_price asc',
            conditions: JSON.stringify(strMapToObj(conditions))
        })
        params.set('details', {
            medicineid: medicine_id,
        })
        let request = new YFWRequestViewModel()
        request.TCPRequest(params, (res) => {
            console.log(res, 'sell')
            if (this.haveDismiss) {
                return
            }
            if (this.isCreate != true) {
                this.isCreate = true
            }
            let goodsInfo = res['result']['details'];
            if (goodsInfo && goodsInfo.error != undefined) {
                this.status && this.status.showNetError()
            } else if (goodsInfo) {
                this.state.dataReferenceWholesale = safeObj(goodsInfo.MedicineDetail).dataReferenceWholesale.item
                this.dealGoodsInfoData({ result: safeObj(goodsInfo.MedicineDetail).shopWholesale.item })
            }
            let goodsShopInfo = res['result']['shopmedicines']
            if (goodsShopInfo && goodsShopInfo.error != undefined) {
                this.status && this.status.showNetError()
                this.setState({
                    showFoot: 0,
                });
            } else if (goodsShopInfo) {
                this.state.sale_shop_num = safeObj(goodsShopInfo.MoreShop).moreShopWholesale.item.shop_num
                this.dealGoodsShopData({ result: {dataList: safeObj(goodsShopInfo.MoreShop).dataList.items} })
            }
        }, (error) => {
            console.log(error)
        }, false)


    }
    dealGoodsInfoData(res) {
        if (!this.infoRequest) {
            YFWPrestrainCacheManager.sharedManager().addCachedInfoWithKey(this.state.commitID + 'goodsInfo', res.result)
        }

        if (this.cachedGoodsInfo) {
            if (isNotEmpty(res.result)) {
                res.result.image_list.splice(0, 1, this.cachedGoodsInfo.image_list[0])
            }
            this.cachedGoodsInfo = null
        }

        this.getSuccess(true, false)
        let data = YFWWDSellersListGoodsInfoModel.getGoodsInfo(res.result);
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
        if (!this.listRequest && this.state.pageIndex == 1 && this.props.navigation.state.params.state.cachedShopGoodsInfo) {
            let res = { result: this.props.navigation.state.params.state.cachedShopGoodsInfo }
            this.dealGoodsShopData(res)
            return
        }
        let paramMap = new Map();
        let conditions = new Map()
        let infos =  this.props.navigation.state.params.state
        let medicine_id = infos.value
        conditions.set('medicineid', medicine_id)
        paramMap.set('__cmd', 'store.whole.medicine.getMoreShopMedicinesWholesale');
        paramMap.set('pageSize', '10');
        paramMap.set('pageIndex', this.state.pageIndex + '');
        paramMap.set('conditions', JSON.stringify(strMapToObj(conditions)));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            console.log(res,'goods')
            this.dealGoodsShopData({ result: {dataList:res.result.MoreShop.dataList.items} })
        }, (error) => {
            this.status && this.status.showNetError()
            this.setState({
                showFoot: 0,
            });
        }, this.state.isShowLoading);

    }

    dealGoodsShopData(res) {
        if (this.goodsInfoOriginData) {
            res.result.show_buy_button = this.goodsInfoOriginData.show_buy_button
        }
        if (this.state.pageIndex == 1 && !this.listRequest) {
            YFWPrestrainCacheManager.sharedManager().addCachedInfoWithKey(this.state.commitID + 'shopListInfo', res.result)
        }
        this.getSuccess(false, true)
        let showFoot = 0;
        let dataArray = YFWWDSellersShopListModel.getModelArray(res.result);
        this.fetchPrestrainGoodsData(dataArray)
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
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.cart.addCart');
        paramMap.set('quantity', 1);
        paramMap.set('storeMedicineId', item.shop_goods_id);
        YFWUserInfoManager.ShareInstance().addCarIds.set(item.shop_goods_id + '', 'id')
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('商品添加成功');
            DeviceEventEmitter.emit("SHOPCAR_INFO_CHANGE", item.shop_id)//通知购物车 该商家商品发生变化  刷新凑单数据
            this.getCarNumber();
        }, (error) => {
        });
    }


    getCarNumber() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        refreshWDRedPoint((res)=>{
            this.dealCarNumber(res)
        })
    }

    dealCarNumber(res) {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        new YFWUserInfoManager().wdshopCarNum = res.result.cartCount + ''
        DeviceEventEmitter.emit('WD_SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
        this.setState({
            carNumber: res.result.cartCount,
        });
    }


    // ===== View =====
    render() {
        let listDataArray = [{ key: 'top' }, { key: 'menu' }, { key: 'header' }].concat(this.state.data)
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
                    // stickyHeaderIndices={[1]}
                    ></FlatList>
                    <YFWSellerShopCarModal navigation={this.props.navigation}
                                           shopCount={this.state.carNumber} />
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
        // console.log(item.index);
        if (item.item.key == 'top') {
            return (
                <View onLayout={(e) => {
                    let { height } = e.nativeEvent.layout;
                    this.flatListHeight = height
                }}>
                    <YFWWDSellersListGoodsHeaderView
                        Data={this.state.infoData}
                        shopCount={this.state.price_quantity}
                        showPopupDialog={() => this._showPopupDialog()}
                        navigation={this.props.navigation}
                        medicineId={this.state.commitID}
                        showSameShop={this.props.navigation.state.params.state.showSameShop} />
                </View>
            )
        }
        if (item.item.key == 'menu') {

            return (
                <View style={{ paddingTop: 10 }} onLayout={(e) => {
                    let { height } = e.nativeEvent.layout;
                    this.sectionListHeight = height
                }}>
                    <YFWWDSellsDataView
                        infos={
                            [
                                { title: '零售商家', value: safe(this.state.dataReferenceWholesale.store_num) + '家' },
                                { title: '近期销量', value: safe(this.state.dataReferenceWholesale.sale_count) },
                                { title: '我的进价', value: (isEmpty(this.state.dataReferenceWholesale.receive_price) || this.state.dataReferenceWholesale.receive_price == 0)?'---':safe(this.state.dataReferenceWholesale.receive_price)+ "元" },
                            ]
                        }
                        showFlag={this.state.dataReferenceWholesale.flag}
                        Data={this.state.dataReferenceWholesale}
                        ref={(item) => this.menu = item}
                        navigation={this.props.navigation}
                    />
                </View>
            )
        }
        if (item.item.key == 'header') {

            return (
                <View style={{ paddingVertical: 15, paddingHorizontal: 17, backgroundColor: 'white' }} >
                    <Text style={{
                        fontSize: 13,
                        lineHeight: 20,
                        fontWeight: "bold",
                        color: "#999999"
                    }}>{'共 '}
                        <Text style={{ color: '#416dff' }}>{this.state.sale_shop_num}</Text>{' 家店铺报价'}
                    </Text>
                </View>
            )
        }
        return (
            <View style={styles.item} id={item.item.shop_id}>
                <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this.selectItemIndex(item.item)}>
                    <YFWWDSellersListCellView Data={item.item} addShopCar={() => doAfterLogin(this.props.navigation.navigate, () => { this._addShopCar(item.item) })}
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
        pushWDNavigation(navigate, {
            type: kRoute_shop_goods_detail,
            value: rowData.shop_goods_id,
            img_url: tcpImage(safeObj(safeObj(this.state.infoData).img_url)),
            cachedData: cachedData,
            goodsInfo: this.goodsInfoOriginData,
            price: rowData.price,
            scheduled_name: rowData.scheduled_name,
        });

    }


    _refreshDataWithOrderType(param, index) {
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
