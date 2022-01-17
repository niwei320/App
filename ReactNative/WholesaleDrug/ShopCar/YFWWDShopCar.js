import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    SectionList,
    StatusBar,
    Platform,
    TouchableOpacity,
    Dimensions,
    SwipeableFlatList,
    DeviceEventEmitter, ScrollView,
    RefreshControl,
    NativeModules, Alert
} from 'react-native';

import {
    haslogin,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    kScreenWidth,
    imageJoinURL,
    dismissKeyboard_yfw,
    min,
    safe, mobClick, darkStatusBar, safeObj, tcpImage, isAndroid, deepCopyObj, kStyleWholesale
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {
    darkNomalColor, darkTextColor, separatorColor, yfwOrangeColor, backGroundColor, yfwRedColor, orangeColor
} from "../../Utils/YFWColor";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import { BaseStyles } from "../../Utils/YFWBaseCssStyle";
import YFWToast from "../../Utils/YFWToast";
import { refreshWDRedPoint } from "../../Utils/YFWInitializeRequestFunction";
import { toDecimal } from "../../Utils/ConvertUtils";
import NumAddSubDialog from "../../widget/NumAddSubDialog";
import StatusView, { SHOW_EMPTY } from '../../widget/StatusView'
import { getItem, kIsShowLaunchViewKey } from "../../Utils/YFWStorage";
import NavigationActions from '../../../node_modules_local/react-navigation/src/NavigationActions';
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView'
import YFWGoodsItem from '../../widget/YFWGoodsItem'
import LinearGradient from 'react-native-linear-gradient';
import ModalView from '../../widget/ModalView';
import YFWNoLocationHint from "../../widget/YFWNoLocationHint";
import YFWAdNotificationTip from '../../widget/YFWAdNotificationTip';
import YFWHeaderLeft from '../Widget/YFWHeaderLeft';
import YFWHeaderBackground from '../Widget/YFWHeaderBackground';
import YFWNativeManager from '../../Utils/YFWNativeManager';
import YFWMoneyLabel from '../../widget/YFWMoneyLabel';
import { YFWImageConst } from '../Images/YFWImageConst';
import YFWWDCheckButtonView from '../Widget/YFWWDCheckButtonView';
import YFWWDShopCarModel from './Model/YFWWDShopCarModel';
import YFWWDShopCarStaleCell from './View/YFWWDShopCarStaleCell';
import YFWWDShopCarPackageCellView from './View/YFWWDShopCarPackageCellView';
import YFWWDShopCarMedicinesCell from './View/YFWWDShopCarMedicinesCell';
import YFWWDSwipeRow from './View/YFWWDSwipeRow';
import YFWWDShopCarEidtBottomView from './View/YFWWDShopCarEidtBottomView';
import YFWWDShopCarBottomView from './View/YFWWDShopCarBottomView';
import {
    kRoute_shop_detail,
    pushWDNavigation,
    kRoute_shop_goods_detail,
    addSessionCount,
    kRoute_shop_detail_list,
    kRoute_goods_detail,
    kRoute_apply_account,
    doAfterLoginWithCallBack,
    kRoute_account_complement
} from '../YFWWDJumpRouting';
import YFWWDTipsAlert from '../Widget/YFWWDTipsAlert';
import YFWWDShopCarRecomendModel from './Model/YFWWDShopCarRecomendModel';
import YFWWDShopCarEmptyView from './View/YFWWDShopCarEmptyView';
import YFWWDAlertCouponCollectionListView from '../GoodsDetail/View/YFWWDAlertCouponCollectionListView';
const { StatusBarManager } = NativeModules;


export default class YFWWDShopCar extends Component {

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: isNotEmpty(navigation.state.params) && navigation.state.params.state ? false : true,
        headerTitle: '购物车',
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1
        },
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomColor: 'white' },
        headerLeft: isNotEmpty(navigation.state.params) && navigation.state.params.state ? (
            <YFWHeaderLeft from={kStyleWholesale} navigation={navigation}></YFWHeaderLeft>
        ) : <View style={{ width: 50 }} />,
        headerRight: (
            <TouchableOpacity activeOpacity={1} onPress={() => navigation.state.params.changeRightState()} disabled={navigation.state.params ? navigation.state.params.isCanEdit : false}>
                <Text style={{ fontSize: 16, color: '#fff', marginRight: 10 }}>{navigation.state.params ? navigation.state.params.title : ''}</Text>
            </TouchableOpacity>
        ),
        headerBackground: <YFWHeaderBackground from={kStyleWholesale}></YFWHeaderBackground>
    });

    constructor(...args) {
        super(...args);
        this2 = this;
        swipeRowArray = [];
        this.isDefaultLoad = true
        this.isFirstLoad = true
        this.isFirstInit = true
        this.state = {
            loading: true,
            data: [],
            selectData: [],
            editSelectData: [],
            footerData: [],
            isEdit: false,
            isCanEdit: true,
            couponInfo: { shop_goods_id: '', shop_id: '' },
            adData: [],
            editPosition: undefined,
            chooseItem: undefined,
            chooseShopId: undefined,
            selectAllStatusChange: false,
            beginEdit: false,
            afterEdit: false,
            newInstance: false,
            requestShopArray: [],
            isSetParams: false,
            isRefresh: false,
            refreshed: false,
        };
        this._dealShopCarInfo(YFWUserInfoManager.ShareInstance().shopCarInfo)
        this.handleData();
        this.listener();

    }
    onRightTvClick = () => {
        let bool = !this.state.isEdit;
        if (bool) {
            mobClick('cart-edit');
            this.state.editSelectData = [];
        }
        this.setState({
            isEdit: bool
        });
        this.props.navigation.setParams({
            title: haslogin() ? bool ? '完成' : '编辑' : '',
        })
        DeviceEventEmitter.emit('CloseSwipeRow');
        if (!bool) {
            this.state.afterEdit = true
        } else {
            this.state.beginEdit = true
        }

    }
    isCanEditeCar = () => {
        return this.state.isCanEdit;
    }
    isTabBarVisable() {
        let navigation = this.props.navigation;
        let visibal = isNotEmpty(navigation.state.params) && navigation.state.params.state ? false : true;
        return visibal;
    }
    listener() {
        this.loginListener = DeviceEventEmitter.addListener('WDUserLoginSucess',()=>{
            this._requestRecommendData();
        })
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                YFWNativeManager.changeIQKeyboardManagerEnable(true)
                if (!haslogin()) {
                    this.props.navigation.setParams({
                        title: '',
                        isCanEdit: false,
                    })
                }
                this.state.newInstance = true
                darkStatusBar();
                if (!this.isFirstLoad) {
                    this._requestCartInfoData();
                } else {
                    this.isFirstLoad = false
                }
                if(this.isFirstLoad){
                    this._requestRecommendData();
                }
                DeviceEventEmitter.emit('ShowInviteView', { value: false });

                getItem('sessionMap').then((data) => {
                    if (data) {
                        if (data['details']['YFWShopCarVC']) {

                        } else {
                            addSessionCount('YFWShopCarVC', '购物车');
                        }
                    }

                })
            }
        );

        this.willBlur = this.props.navigation.addListener('willBlur', payload => {
            YFWNativeManager.changeIQKeyboardManagerEnable(false)
            YFWUserInfoManager.ShareInstance().addCarIds.clear()
            for (let i = 0; i < this.state.selectData.length; i++) {
                let value = this.state.selectData[i];
                if (value.type == 'medicine') {
                    YFWUserInfoManager.ShareInstance().addCarIds.set(safe(value.shop_goods_id), 'id');
                } else {
                    YFWUserInfoManager.ShareInstance().addCarIds.set(safe(value.package_id), 'id');
                }
            }
            //隐藏Android端弹出的输入数量的弹窗
            DeviceEventEmitter.emit(NumAddSubDialog.TAG);
        });

        this.loginListener = DeviceEventEmitter.addListener('WDUserLoginSucess', () => {
            this.handleData()
        })
        this.Login_Off = DeviceEventEmitter.addListener('WDLogin_Off', () => {
            YFWUserInfoManager.ShareInstance().shopCarInfo = undefined
            this.handleData()
        })

        DeviceEventEmitter.addListener('canCloseSwipeRow', (is_can) => {
            this.canCloseSwipeRow = is_can;
        });

    }

    handleData() {
        let mergeRequest = true
        if (mergeRequest) {
            if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
                this._requestRecommendData();
            }
        } else {
            this._requestRecommendData();
        }
        this._requestCartInfoData(mergeRequest);
    }


    componentWillUnmount() {
        /*销毁的时候移除监听*/
        YFWNativeManager.changeIQKeyboardManagerEnable(false)
        this.didFocus.remove();
        this.willBlur.remove();
        this.didBlur && this.didBlur.remove();
        this.ShopCarInfoChange && this.ShopCarInfoChange.remove();
        this.loginListener && this.loginListener.remove()
        this.Login_Off && this.Login_Off.remove()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove()
        }
    }

    //Overrode
    //视图加载完成
    componentDidMount() {

        DeviceEventEmitter.addListener('WDLoginToUserCenter', (param) => {
            if (param == 1) {
                const { navigate } = this.props.navigation
                doAfterLoginWithCallBack(navigate, () => {
                    const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
                    this.props.navigation.dispatch(resetActionTab);
                })
            }
        })
        this.props.navigation.setParams({
            changeRightState: this.onRightTvClick,
            title: haslogin() ? '编辑' : '',
            isCanEdit: false,
        })
        this.userInfo = YFWUserInfoManager.ShareInstance();


        this.ShopCarInfoChange = DeviceEventEmitter.addListener('SHOPCAR_INFO_CHANGE', (shop_id) => {
            YFWUserInfoManager.ShareInstance().jumpToAddGoodsShopId.push(shop_id)
        })

        YFWNativeManager.mobClick('b2b-cart-1')
    }

    _view_Scrolled() {

        if (this.canCloseSwipeRow) {
            DeviceEventEmitter.emit('CloseSwipeRow');
        }
    }

    render() {
        return (
            <View style={BaseStyles.container}>
                {this.renderRoot()}
                <StatusView ref={(m) => { this.statusView = m }} initStatus={SHOW_EMPTY} retry={() => { this.handleData() }} />
                <YFWWDTipsAlert ref={(e)=>this.tipsAlert=e}></YFWWDTipsAlert>
            </View>
        );

    }

    renderRoot() {

        let cart_count = this.state.data.length;

        if (cart_count > 0 && YFWUserInfoManager.ShareInstance().hasLogin()) {
            return (
                <View style={styles.container}>
                    <YFWNoLocationHint />
                    {this._renderAdView()}
                    {this._renderList()}
                    {this.renderPrescribedTips()}
                    {this._render_BottomView()}
                    <ModalView ref={(item) => this.layer = item} animationType="fade">
                        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }} />
                    </ModalView>
                    <YFWWDAlertCouponCollectionListView
                        ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                        navigation={this.props.navigation}
                        dismiss={() => { this.layer.disMiss() }}
                        onRequestClose={() => { this.layer.disMiss() }}
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.container}>
                    {this._renderAdView()}
                    <ScrollView>
                        <View flex={1}>
                            <FlatList
                                ref={(flatList) => this._flatList = flatList}
                                extraData={this.state}
                                onRefresh={() => this._onRefresh()}
                                key={'nonData'}
                                refreshing={this.state.loading}
                                ListHeaderComponent={() => {
                                    return (
                                        <View style={{ flex: 1, height: 270 }}>
                                            <YFWWDShopCarEmptyView style={{ flex: 1 }} navigation={this.props.navigation} />
                                        </View>
                                    );
                                }}
                            />
                            {this._renderFooter()}
                        </View>
                    </ScrollView>

                </View>
            );
        }

    }
    /**
     * 适配低版本下 <下拉刷新>属性导致的 input获取焦点时的崩溃问题
     * */
    _renderList() {
        let sections = []
        this.state.data.map((info, index) => {
            sections.push({ key: index + 'se', data: [info], renderItem: ()=>this._renderSectionItem({item:info,index:index}) })
        })
        return (
            <SectionList
                ref={(flatList) => this._flatList = flatList}
                stickySectionHeadersEnabled={true}
                style={{ backgroundColor: '#fafafa' }}
                extraData={this.state}
                sections={sections}
                key={'showData'}
                refreshing={this.state.loading}
                onRefresh={this._onRefresh.bind(this)}
                onScrollBeginDrag={() => { dismissKeyboard_yfw() }}
                renderSectionHeader={this.renderSectionHeader.bind(this)}
            // ListFooterComponent={this._renderFooter()}
            />
        )
    }
    renderSectionHeader(info) {
        if (info.section.data[0].type == 'close') {
            return (<View />)
        }
        return this._renderShopInfo(info.section.data[0])

    }
    /**
     * 返回处方药提示3.1.00版本才有
     */
    renderPrescribedTips() {
        if (isEmpty(this.state.prescribedTips)) {
            return <View />
        }
        return (
            <View style={[BaseStyles.leftCenterView, { backgroundColor: "#faf8dc", width: kScreenWidth, paddingVertical: 8 }]}>
                <Text style={{ paddingLeft: 22, fontSize: 13, color: orangeColor() }} numberOfLines={2}>{this.state.prescribedTips}</Text>
            </View>
        )
    }


    // # ListView # -----------------------
    _renderSectionItem = (item) => {
        item.item.cart_items.map((shopGoodsInfo) => {
            if (shopGoodsInfo.type == 'medicines') {
                shopGoodsInfo.medicines.map((goodsInfo) => {
                    goodsInfo.position = item.index
                })
            } else {
                shopGoodsInfo.position = item.index
            }
        })
        let cartItems = itemAddKey(item.item.cart_items)
        if (item.item.type == 'close') {
            if (!cartItems || cartItems.length <= 0) {
                return (<View />)
            }
            return (
                <View style={[styles.container, { paddingBottom: Platform.OS === 'android' ? 10 : 0 }]}>
                    <View style={{ height: 22, backgroundColor: '#fafafa' }} />
                    <FlatList
                        data={[cartItems]}
                        extraData={this.state}
                        renderItem={this._renderStaleRowItem.bind(this)}
                    />
                </View>
            )
        }
        if (item.item.hiddenGoods) {
            cartItems = []
        }
        return (
            <View style={[styles.container]} key={'top' + item.index}>
                <FlatList
                    data={cartItems}
                    extraData={this.state}
                    renderItem={this._renderRowItem.bind(this)}
                    ListFooterComponent={() => this._renderSectionFooter(item)}
                />
            </View>
        );

    }

    _renderStaleRowItem = (item) => {
        return (
            <YFWWDShopCarStaleCell DataArray={item.item} selectGoodsItemMethod={(info) => { this._selectGoodsItemMethod({ item: info }) }} />
        )
    }

    _renderRowItem = (item) => {
        if (item.item.type == 'package' || item.item.type == 'courseOfTreatment') {
            return (
                <View key={item.index}>
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} >
                        <YFWWDShopCarPackageCellView Data={item.item} changeQuantity={(quantity) => this.changeItemQuantity(item, quantity)}
                            resetData={(quantity) => this.resetData(item, quantity)}
                            select={this._isSelectItem(item.item)} selectFn={() => this._selectItem(item.item)}
                            delFn={() => this.onDelGoos(item)}
                            moveFn={() => this.onMoveConllect(item)}
                            navigation={this.props.navigation} />
                    </TouchableOpacity>
                </View>
            );

        } else if (item.item.type == 'medicines') {
            return (
                <YFWWDShopCarMedicinesCell DataArray={item.item.medicines}
                    selectGoodsItemMethod={(info) => this._selectGoodsItemMethod(info)}
                    changeQuantity={(info, quantity) => this.changeItemQuantity(info, quantity)}
                    resetData={(info, quantity) => this.resetData(info, quantity)}
                    select={(info) => this._isSelectItem(info.item)}
                    selectFn={(info) => this._selectItem(info.item)}
                    delFn={(info) => this.onDelGoos(info)}
                    moveFn={(info) => this.onMoveConllect(info)}
                />
            )
        } else {
            return (
                <YFWWDSwipeRow Data={item}
                    selectGoodsItemMethod={() => this._selectGoodsItemMethod(item)}
                    changeQuantity={(quantity) => this.changeItemQuantity(item, quantity)}
                    resetData={(quantity) => this.resetData(item, quantity)}
                    select={this._isSelectItem(item.item)}
                    selectFn={() => this._selectItem(item.item)}
                    delFn={() => this.onDelGoos(item)}
                    moveFn={() => this.onMoveConllect(item)}
                />
            );

        }

    }

    _render_BottomView = () => {
        if (this.state.isEdit) {
            return (<View style={[styles.bottomView, { marginBottom: (!this.isTabBarVisable() && isIphoneX()) ? 34 : 0, }]}>
                <YFWWDShopCarEidtBottomView style={{ flex: 1 }} selectAll={this._isSelectAll()}
                    delFn={(items) => this.onDelGoos(items)}
                    scFn={(items) => this.onMoveConllect(items)}
                    selectAllFn={() => this._selectAllItems()}
                    navigation={this.props.navigation}
                    Data={this.state.isEdit ? this.state.editSelectData : this.state.selectData} />
            </View>);
        } else {
            return (<View style={[styles.bottomView, { marginBottom: (!this.isTabBarVisable() && isIphoneX()) ? 34 : 0, }]}>
                <YFWWDShopCarBottomView style={{ flex: 1 }} selectAll={this._isSelectAll()}
                    selectAllFn={() => this._selectAllItems()}
                    navigation={this.props.navigation}
                    DataAll={this.state.data}
                    Data={this.state.selectData}
                    orderSettlementMethod={()=>this._orderSettlementMethod()}
                    />
            </View>)
        }
    }

    _orderSettlementMethod() {
        let goodsInfo = this.state.selectData
        if (goodsInfo.length > 0) {
            let selectdShopSet = new Set()
            let selectdShops = []
            goodsInfo.map((item)=>{
                if(!selectdShopSet.has(item.shop_id)) {
                    selectdShops.push({item})
                }
                selectdShopSet.add(item.shop_id)
            })
            console.log(selectdShops,'select')
            let notGoBuy = selectdShops.some((info)=>{
                let item = info.item
                if (item.shop_account_status == 0) {
                    this.tipsAlert&&this.tipsAlert.showView('','暂无采购资格，请向'+item.shop_title+'申请开户。','',[{title:'申请开户',callBack:()=>{this._openAccountAction(item)}},{title:'我知道了',callBack:()=>{}}])
                    return true
                }
                let selectShopGoodsInfo = this._dealShopSelectGoods(item)
                if (selectShopGoodsInfo.sum < item.send_price) {
                    let tipText = item.shop_title+'\r\n满'+toDecimal(item.send_price)+'元起订，还差'+toDecimal(item.send_price - selectShopGoodsInfo.sum)+'元'
                    this.tipsAlert&&this.tipsAlert.showView('未达到起订金额，无法结算！',tipText,'',[{title:'去凑单',callBack:()=>{this._jumpToCollectBills(item)}},{title:'我知道了',callBack:()=>{}}])
                    return true
                }
                return false
            })
            if (!notGoBuy) {
                this.checkCartSettlement(goodsInfo, (value) => {
                    if (value) {
                        this.props.navigation.navigate("YFWWDOrderSettlementRootVC", { Data: goodsInfo });
                    }
                })
            }
        } else {
            YFWToast('请至少选择一件商品，才能结算');
        }
    }

    checkCartSettlement(commodity,back) {
        let IDarray = [];
        let pakageArray = [];
        if (isNotEmpty(commodity)) {
            commodity.map((item) => {
                if (item.type == 'package' || item.type == 'courseOfTreatment') {
                    pakageArray.push(item.package_id)
                } else {
                    IDarray.push(item.id)
                }
            });
        }
        let ids = IDarray.join(',');
        let pakageIds = pakageArray.join(',');
        if (ids.length == 0 && pakageIds.length == 0) {
            back&&back(false)
        };
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map()
        paramMap.set('__cmd', 'store.buy.cart.checkCartSettlement');
        paramMap.set('cartids', ids);
        paramMap.set('packageids', pakageIds);
        paramMap.set('need_check_categary', true);
        viewModel.TCPRequest(paramMap, (res) => {
            back&&back(true)
        }, (error) => {
            if(error.code === -101){
                let errorData = JSON.parse(error.msg)
                YFWToast(errorData.msg)
                const { navigate } = this.props.navigation;
                pushWDNavigation(navigate, { type:kRoute_account_complement,
                    value:{
                        bool_pass:errorData.bool_pass,
                        sell_storeid:errorData.sell_storeid,
                        title:errorData.title,
                        sell_title:errorData.sell_title,
                        need_add_health_products:errorData.need_add_health_products,
                        need_instruments:errorData.need_instruments,
                    }});
            } else {
                if (isNotEmpty(error.msg)) {
                    YFWToast(error.msg)
                }
            }
            back&&back(false)
        })
    }

    /**
     * 计算店铺所有选中的商品汇总信息
     * @param {*} shopInfo
     */
    _dealShopSelectGoods(shopInfo) {
        let sum = 0
        let quantity = 0;
        let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
        let allSelectData = []
        dataArray.map((goodsInfo) => {
            if (goodsInfo.shop_id == shopInfo.shop_id) {
                allSelectData.push(goodsInfo)
            }
        })
        allSelectData.map((car_item) => {
            if (car_item.type == 'package' || car_item.type == 'courseOfTreatment') {
                sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.count)
                car_item.package_medicines.forEach((value) => {
                    quantity += isNaN(Number.parseInt(value.quantity)) ? 0 : Number.parseInt(value.quantity);
                });
            } else {
                sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.quantity)
                quantity += isNaN(Number.parseInt(car_item.quantity)) ? 0 : Number.parseInt(car_item.quantity);
            }
        })
        return {sum:sum,quantity:quantity,allSelectData:allSelectData}
    }

    /**
     * 移动到收藏
     */
    onMoveConllect(item) {

        if (isEmpty(item.item.id) || item.item.id.length == 0) {
            YFWToast('请至少选择一件商品');
            return;
        }

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;

        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        let itemId = String(item.item.id);
        let cartidList = isNotEmpty(itemId) ? itemId.split('|') : [];
        if (isNotEmpty(item.item.package_medicines)) {
            cartidList = item.item.package_medicines.map((goodsInfo) => {
                return goodsInfo.id
            })
        }
        paramMap.set('__cmd', 'store.buy.cart.moveCartGoodsToFavorite');
        paramMap.set('cartidList', cartidList);
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("收藏成功");
            DeviceEventEmitter.emit('CloseSwipeRow');
            this._requestCartInfoData()
        }, (error) => {
        })

    }
    /**
     * 删除商品
     */
    onDelGoos(item) {

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.cart.deleteCartGoodsById');
        if (item.isEdit == 1) {
            if (isEmpty(item.id) || item.id.length == 0) {
                YFWToast('请至少选择一件商品');
                return;
            }
            let itemId = String(item.id);
            let cart_id_list = isNotEmpty(itemId) ? itemId.split('|') : [];
            let cartIds = [];
            let packageIds = [];
            cart_id_list.forEach((listItem, index) => {
                if (listItem.includes('TC')) {
                    packageIds.push(listItem.replace('TC', ''));
                } else {
                    cartIds.push(listItem);
                }
            });
            if (cartIds.length > 0) {
                paramMap.set('cartId', cartIds.join());
            }
            if (packageIds.length > 0) {
                paramMap.set('packageId', packageIds.join());
            }
        } else {
            if (item.item.type == 'package' || item.item.type == 'courseOfTreatment') {
                paramMap.set('packageId', item.item.package_id);
            } else {
                paramMap.set('cartId', item.item.id);
            }
        }
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("删除成功");
            DeviceEventEmitter.emit('CloseSwipeRow');
            this._requestCartInfoData()
        }, (error) => {
        })

    }

    changeItemQuantity(item, quantity) {
        this.state.editPosition = item.item.position
        if (Number.parseInt(quantity) === 0) {
            return;
        }
        if (item.item.type == 'package' || item.item.type == 'courseOfTreatment') {
            item.item.count = quantity;
            this._requestCartInfoData();
        } else {
            DeviceEventEmitter.emit('LoadProgressClose')
            item.item.quantity = quantity;
            refreshWDRedPoint();
        }
        this.setState({
            data: this.state.data,
        });
    }


    _upDataCollectBills(item, allSelectData, sum) {
        if ((this.isFirstLoad || this.isFirstInit) && this._isSelectShop(item.item)) {
            this.state.requestShopArray.push(item.item.shop_id)
            this._dealFreepostageInfo(item, allSelectData)
            this._checkIsAllBillRequestEnd()
            return
        }

        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.cart.getFreepostageAndActivityInfo');
        paramMap.set('storeid', item.item.shop_id);
        paramMap.set('price', sum);
        let viewModel = new YFWRequestViewModel();
        if (!(this.isFirstLoad || this.isFirstInit || this.state.newInstance)) {
            DeviceEventEmitter.emit('LoadProgressShow')
        }
        viewModel.TCPRequest(paramMap, (res) => {
            if (res.code == 1) {
                if (this.state.newInstance || this.state.selectAllStatusChange || this.state.afterEdit || this.state.beginEdit || this.state.refreshed) {
                    this.state.requestShopArray.push(item.item.shop_id)
                }
                if (isNotEmpty(res.result)) {
                    item.item.add_on = safeObj(res.result).add_on;
                    item.item.add_on_isshow = safeObj(res.result).add_on_isshow;
                    item.item.activesum = safeObj(res.result).activesum;
                    item.item.freepostage = safeObj(res.result).freepostage;
                    item.item.freepostage_isshow = safeObj(res.result).freepostage_isshow;
                    this._dealFreepostageInfo(item, allSelectData)
                    if (item.index == this.state.chooseItem || this.state.editPosition == item.index || item.item.shop_id == this.state.chooseShopId) {
                        this.state.chooseItem = undefined;
                        this.state.editPosition = undefined;
                        this.state.chooseShopId = undefined;
                        DeviceEventEmitter.emit('LoadProgressClose');
                        this.setState({})
                        return
                    }
                }
                this._checkIsAllBillRequestEnd()
            }
        }, (error) => { }, false);
    }
    /**
     * 处理 单品包邮  满几件包邮
     * @param {*} item
     * @param {*} allSelectData
     */
    _dealFreepostageInfo(item, allSelectData) {
        if (allSelectData && allSelectData.length > 0) {
            let allFire = allSelectData.every((medicine) => {
                return medicine.type == 'medicine' && medicine.is_freepostage == 1 && medicine.freepostagecount > 0 && medicine.quantity >= medicine.freepostagecount
            })
            if (allFire) {
                item.item.freepostage = '包邮'
                item.item.freepostage_isshow = 0
            }
        }
    }

    _isContained(aa, bb) {
        if (((aa.length < bb.length))) {
            return false;
        }
        for (var i = 0; i < bb.length; i++) {
            var flag = false;
            for (var j = 0; j < aa.length; j++) {
                if (aa[j] == bb[i].shop_id) {
                    flag = true;
                    break;
                }
            }
            if (flag == false) {
                return flag;
            }
        }
        return true;
    }

    _checkIsAllBillRequestEnd() {
        let allDataArray = []
        if (isNotEmpty(this.state.data)) {
            this.state.data.map((shopInfo) => {
                if (shopInfo.type != 'close') {
                    allDataArray.push(shopInfo)
                }
            })
        }
        let isAllrequest = this._isContained(this.state.requestShopArray, allDataArray)
        if (isAllrequest) {
            this.state.selectAllStatusChange = false
            this.state.afterEdit = false
            this.state.beginEdit = false
            this.state.newInstance = false
            this.state.refreshed = false
            this.isFirstInit = false
            this.state.requestShopArray = []
            DeviceEventEmitter.emit('LoadProgressClose');
            this.setState({})
        }
    }



    resetData(item, quantity) {

        item.item.quantity = quantity;
        this.setState({
            data: this.state.data,
        })
    }

    _renderShopInfo(item) {
        return (
            <View style={{ flex: 1, marginBottom: item.hiddenGoods ? 0 : 5 }}>
                <View style={styles.sectionHeaderView}>
                    <View style={[BaseStyles.leftCenterView, { flex: 1 }]}>
                        <View style={{ flexDirection: "row", width: kScreenWidth - 120 }} >
                            <View style={{ flex: 1, alignItems: 'center' }} flexDirection={'row'}>
                                <View style={styles.checkButton}>
                                    <YFWWDCheckButtonView style={{ flex: 1 }} select={this._isSelectShop(item)}
                                        selectFn={() => this._selectShopItems(item)} />
                                </View>
                                <TouchableOpacity activeOpacity={1} style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { this._clickShop(item) }} hitSlop={{ top: 10, left: 0, bottom: 10, right: 0 }} >
                                    <Text style={[styles.sectionHeaderTitle, { maxWidth: kScreenWidth - 120 - 30 - 40 }]} numberOfLines={2} >{item.shop_title}</Text>
                                    <Image style={{ transform: [{ rotate: '-180deg' }], tintColor: '#333', width: 7, height: 13, marginLeft: 2 }} source={YFWImageConst.Nav_back_white}></Image>
                                </TouchableOpacity>
                                {item.shop_account_status == 0 ?
                                    <TouchableOpacity activeOpacity={1} onPress={() => { this._openAccountAction(item) }} hitSlop={{ top: 10, left: 0, bottom: 10, right: 0 }} >
                                        <Text style={{ fontSize: 13, color: "#547cff", marginLeft: 3 }} numberOfLines={1} >{'申请开户'}</Text>
                                    </TouchableOpacity> : null
                                }
                            </View>
                        </View>
                        <TouchableOpacity style={[BaseStyles.centerItem, { marginLeft: 60, width: 60, height: 30 }]} onPress={() => this._expandStatusChangeAction(item)}>
                            <Text style={{ color: orangeColor(), fontSize: 12 }}>{item.hiddenGoods ? '展开' : '收起'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {this._renderCollectBills(item)}

            </View>

        );
    }

    _renderCollectBills(item) {
        if (item) {
            let showMargin = isNotEmpty(item.add_on) && isNotEmpty(item.freepostage)
            return (
                <View>
                    {this._renderCouponItem(item)}
                    <View style={{ width: kScreenWidth, backgroundColor: '#FFFFFF', paddingBottom: 9, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            {this._renderCollectItem(item)}
                            {showMargin ? <View style={{ height: 10 }} /> : null}
                            {this._renderExemptionItem(item)}
                        </View>
                        {this._renderCollectBillsButton(item)}
                    </View>
                </View>
            )
        } else {
            return (<View />)
        }
    }

    _renderCouponItem(item) {
        if ( Number.parseInt(item.shop_coupon_count)>0) {
           return (
               <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 50,backgroundColor: 'white'}}>
                   <LinearGradient colors={['rgb(0,200,145)', 'rgb(31,219,155)']}
                       start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                       locations={[0, 1]}
                       style={{ width: 32, height: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                       <Text style={{ fontSize: 10, color: 'white' }}>领券</Text>
                   </LinearGradient>
                   <Text style={{ color: darkNomalColor(), fontSize: 12, marginLeft: 7 }}>领取商家优惠券</Text>
                   <View style={{ flex: 1 ,alignItems:'flex-end'}} >
                       <TouchableOpacity style={[BaseStyles.centerItem,{width:60,height:30}]} onPress={()=>this._getShopCoupon(item)}>
                           <Text style={{color:orangeColor(),fontSize:12}}>领券</Text>
                       </TouchableOpacity>
                   </View>
               </View>)
       } else {
           return (<View />)
       }
   }

    _renderCollectItem(item) {
        if (isNotEmpty(item.add_on)) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 50 }}>
                    <LinearGradient colors={['rgb(250,171,129)', 'rgb(250,209,110)']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        locations={[0, 1]}
                        style={{ width: 32, height: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, color: 'white' }}>满减</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }} >
                        <Text style={{ color: darkNomalColor(), fontSize: 12, marginLeft: 7 }}>{item.add_on}</Text>
                    </View>
                </View>)
        } else {
            return (<View />)
        }
    }

    _renderCollectBillsButton(item) {
        if ((safeObj(item.add_on_isshow) == '0' && safeObj(item.freepostage_isshow) == '0') || (isEmpty(safeObj(item.add_on_isshow)) && isEmpty(safeObj(item.freepostage_isshow)))) {
            return (null)
        } else {
            return (<TouchableOpacity style={{ marginRight: 16 }} onPress={() => this._jumpToCollectBills(item)}>
                <Text style={{ color: orangeColor(), fontSize: 12, lineHeight: 14 }}>去凑单</Text>
            </TouchableOpacity>)
        }
    }

    _renderExemptionItem(item) {
        if (isNotEmpty(item.freepostage)) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 50, height: 15 }}>
                    <LinearGradient colors={['rgb(44,92,241)', 'rgb(124,100,247)']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        locations={[0, 1]}
                        style={{ width: 32, height: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, color: 'white' }}>包邮</Text>
                    </LinearGradient>
                    <Text style={{ color: darkNomalColor(), fontSize: 12, marginLeft: 7 }}>{item.freepostage}</Text>
                </View>
            )
        } else {
            return (<View />)
        }
    }

    _jumpToCollectBills(data) {
        const { navigate } = this.props.navigation;
        //计算选中店内商品总价
        let sum = 0
        let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
        let allSelectData = []
        dataArray.map((goodsInfo) => {
            if (goodsInfo.shop_id == data.shop_id) {
                allSelectData.push(goodsInfo)
            }
        })
        allSelectData.map((car_item) => {
            if (car_item.type == 'package' || car_item.type == 'courseOfTreatment') {
                sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.count)
            } else {
                sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.quantity)
            }
        })
        //跳转凑单页
        YFWUserInfoManager.ShareInstance().jumpToAddGoodsShopId.push(data.shop_id);
        pushWDNavigation(navigate, { type: kRoute_shop_detail_list, value: data.shop_id, priceSumInShop: sum ,from:'shopcar'});
    }


    _renderSectionFooter = (item) => {

        let info = this._dealShopSelectGoods(item.item)
        let sum = info.sum
        let quantity = info.quantity
        let allSelectData = info.allSelectData
        /*
         *  1.数量编辑
         *  2.商品选中状态变化
         *  3.商家选中状态变化
         *  4.全选状态变化
         *  5.编辑状态变化
         *  6.新的购物车被实例化
         *  7.didFocus刷新购物车
         * */
        if ((item.index == this.state.chooseItem || this.state.editPosition == item.index ||
            this.state.chooseShopId == item.item.shop_id || this.state.selectAllStatusChange ||
            this.state.afterEdit || this.state.newInstance || this.state.beginEdit || this.state.refreshed)) {
            this._upDataCollectBills(item, allSelectData, toDecimal(sum))
        }

        return (
            <View style={{ marginTop: item.item.hiddenGoods ? 0 : 2 }}>
                <View style={{ height: 45, paddingRight: 15, backgroundColor: 'white' }} flexDirection={'row'} justifyContent={'flex-end'} alignItems={'center'}>
                    <Text style={styles.sectionFooterTitle}>{'商品数量：' + quantity}</Text>
                    <Text style={[styles.sectionFooterTitle, { marginLeft: 6 }]}>{'金额总计（不含运费）：'}</Text>
                    <YFWMoneyLabel money={sum} moneyTextStyle={{ fontSize: 15 }} decimalsTextStyle={{ fontSize: 13 }}></YFWMoneyLabel>
                </View>
                <View style={{ height: 21, backgroundColor: '#fafafa' }}></View>
            </View>
        );
    }


    //列表尾
    _renderFooter() {
        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            return (
                <View style={{ flex: 1, backgroundColor: backGroundColor() }}>
                    <View style={{ flex: 1, alignItems: 'center', height: 50 }}>
                        <YFWTitleView title={'精选商品'} hiddenBgImage={true} />
                    </View>
                    <FlatList
                        style={{ paddingHorizontal: 5 }}
                        data={this.state.footerData}
                        renderItem={this._renderCommendItem.bind(this)}
                        keyExtractor={(item, index) => index}
                        numColumns={2}
                    />
                </View>
            )
        }

    }

    // # View # -------------------------------
    _renderCommendItem({ item }) {

        return (
            /**  */
            <YFWGoodsItem model={item} from={'wd_cart_list_recommend'} navigation={this.props.navigation} />
        )
    }

    //# Method # -----------------
    clickItems(info) {
        const { navigate } = this.props.navigation;
        let param = {
            type: kRoute_shop_goods_detail,
            value: info.id,
            img_url: tcpImage(info.intro_image),
            goodsInfo: info,
            price: info.old_price,
        }
        pushWDNavigation(navigate, param);

    }

    clickaddToCar(info) {
        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            this.addToCar(info)
        } else {
            let { navigate } = this.props.navigation
            doAfterLoginWithCallBack(navigate, () => {
                this.addToCar(info)
            })
        }
    }

    addToCar(info) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.cart.addCart');
        paramMap.set('quantity', 1);
        paramMap.set('storeMedicineId', info.id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('商品添加成功');
            this._requestCartInfoData();
        }, (error) => {
        });
    }
    _onRefresh() {
        this.state.isRefresh = true
        this.setState({
            loading: true,
        });
        this.handleData();

    }

    _selectAllItems() {
        this.state.selectAllStatusChange = true
        let selectItems = [];
        if (!this._isSelectAll()) {
            for (let i = 0; i < this.state.data.length; i++) {
                let shopItems = this.state.data[i];
                if (shopItems.cart_items) {
                    shopItems.cart_items.map((info) => {
                        if (info.type == 'medicines') {
                            let data = this._removeOverdueMedicine(info.medicines)
                            selectItems = selectItems.concat(data)
                        } else if (info.type == 'package' || info.type == 'courseOfTreatment') {
                            selectItems.push(info)
                        }
                    })
                }

            }
            this.state.isToSelectAll = true
        }
        if (this.state.isEdit) {
            this.setState({
                editSelectData: selectItems,
            });
        } else {
            this.setState({
                selectData: selectItems,
            });
        }


    }

    _selectItem(item) {
        this.state.chooseItem = item.position
        let items = [];

        if (this._isSelectItem(item)) {

            let b = new Set([item]);
            let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
            let set = new Set(dataArray.filter(x => !b.has(x)));
            items = Array.from(set);


        } else {

            items = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
            items.push(item);
        }

        if (this.state.isEdit) {
            this.state.editSelectData = items,
            this.setState({});
        } else {
            this.state.selectData = items,
            this.setState({});
        }

    }

    _selectShopItems(item) {
        let items = [];

        let a = new Set(this.state.isEdit ? this.state.editSelectData : this.state.selectData);
        let allMedicines = []
        item.cart_items.map((info) => {
            if (info.type == 'medicines') {
                let data = this._removeOverdueMedicine(info.medicines)
                allMedicines = allMedicines.concat(data)
            } else if (info.type == 'package' || info.type == 'courseOfTreatment') {
                allMedicines.push(info)
            }
        })
        let b = new Set(allMedicines);
        let set = new Set([...a].filter(x => !b.has(x)));
        items = Array.from(set);
        this.state.chooseShopId = item.shop_id
        if (!this._isSelectShop(item)) {
            items = items.concat(allMedicines);
            this.state.chooseShopId = item.shop_id
        }

        if (this.state.isEdit) {
            this.setState({
                editSelectData: items,
            });
        } else {
            this.setState({
                selectData: items,
            });
        }

    }

    _isSelectAll() {

        let count = 0
        for (let i = 0; i < this.state.data.length; i++) {
            let shopItems = this.state.data[i];
            if (shopItems.cart_items) {
                shopItems.cart_items.map((info) => {
                    if (info.type == 'medicines') {
                        let data = this._removeOverdueMedicine(info.medicines)
                        count += data.length
                    } else if (info.type == 'package' || info.type == 'courseOfTreatment') {
                        count++
                    }
                })
            }

        }
        let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
        if (count === dataArray.length && count > 0) {
            return true;
        } else {
            return false;
        }
    }

    _isSelectShop(item) {

        let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
        let a = new Set(dataArray);
        let allMedicines = []
        item.cart_items.map((info) => {
            if (info.type == 'medicines') {
                let data = this._removeOverdueMedicine(info.medicines)
                allMedicines = allMedicines.concat(data)
            } else if (info.type == 'package' || info.type == 'courseOfTreatment') {
                allMedicines.push(info)
            }
        })
        let b = new Set(allMedicines);
        let unionSet = new Set([...a].filter(x => b.has(x)));
        let items = Array.from(unionSet);
        if (items.length === allMedicines.length && allMedicines.length > 0) {
            return true;
        }

        return false;
    }

    _isNoGoodsBeSeclectedInShop(item) {
        let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
        let a = new Set(dataArray);
        let allMedicines = []
        item.cart_items.map((info) => {
            if (info.type == 'medicines') {
                let data = this._removeOverdueMedicine(info.medicines)
                allMedicines = allMedicines.concat(data)
            } else if (info.type == 'package' || info.type == 'courseOfTreatment') {
                allMedicines.push(info)
            }
        })
        let b = new Set(item.allMedicines);
        let unionSet = new Set([...a].filter(x => b.has(x)));
        let items = Array.from(unionSet);
        if (items.length > 0) {
            return true;
        }

        return false;
    }

    _isSelectItem(item) {

        let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;

        if (item.type == 'package' || item.type == 'courseOfTreatment') {

            if (dataArray.some(function (value) {
                return item.package_id == value.package_id
            })) {
                return true;

            }

        } else {

            if (dataArray.some(function (value) {
                return item.id == value.id
            })) {
                return true;
            }

        }


        return false;

    }


    _getShopCoupon(item) {

        mobClick('cart-list-coupon');
        let couponInfo = { shop_id: item.shop_id, shop_goods_id: '', couponArray: safeObj(item.coupons_list) };
        this.layer && this.layer.show()
        this.popupDialog && this.popupDialog.show(couponInfo);

    }

    /**
     * 点击跳转商家店铺
     * @param item
     * @private
     */
    _clickShop(item) {
        mobClick('cart-list-store');
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_shop_detail, value: item.shop_id })
    }

    _openAccountAction(item) {
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_apply_account, value: item.shop_id })
    }

    _expandStatusChangeAction(info) {
        info.hiddenGoods = !info.hiddenGoods
        this.setState({})
    }


    // # 网络请求 # ---------------------------
    // 大家推荐
    _requestRecommendData() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.medicine.getTopVisitMedicine');
        paramMap.set('limit', 6);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if (this.statusView) this.statusView.dismiss();
            let dataArray = itemAddKey(YFWWDShopCarRecomendModel.getModelArray(res.result))
            this.setState({
                footerData: dataArray,
            });

        }, (error) => {
            if (this.statusView) this.statusView.dismiss();
        }, false);

    }


    shouldComponentUpdate() {
        if (this.state.isSetParams) {
            if (haslogin()) {
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }

    _requestCartInfoData(isMerge) {

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            this.state.loading = false;
            this.setState({
                loading: false,
                isCanEdit: true,
            });
            this.statusView && this.statusView.dismiss();
            return;
        };
        let paramMap = new Map();
        if (isMerge) {
            paramMap.set('__cmd', 'store.buy.cart.getCart as getCart,store.whole.medicine.getTopVisitMedicine as getTopVisitMedicine');
            paramMap.set('getTopVisitMedicine', {
                'limit': 6
            })
            paramMap.set('getCart', {
                'isDiffLostMedicine': '1'
            })
        } else {
            paramMap.set('__cmd', 'store.buy.cart.getCart')
            paramMap.set('isDiffLostMedicine', '1')
        }

        let viewModel = new YFWRequestViewModel();
        // if(!this.isDefaultLoad && !this.state.isRefresh){
        DeviceEventEmitter.emit('LoadProgressShow');
        // }
        this.isDefaultLoad = false
        viewModel.TCPRequest(paramMap, (res) => {
            console.log(res, 'shop car')
            this.statusView && this.statusView.dismiss();
            DeviceEventEmitter.emit('LoadProgressClose');
            let carInfoData = isMerge ? res.result['getCart'] : res.result
            YFWUserInfoManager.ShareInstance().shopCarInfo = carInfoData
            this._dealShopCarInfo(carInfoData)
            if (isMerge) {
                let dataArray = []
                dataArray = itemAddKey(YFWWDShopCarRecomendModel.getModelArray(res.result['getTopVisitMedicine']))
                this.setState({
                    footerData: dataArray,
                });
            } else {
                this.setState({
                });
            }

        }, (error) => {
            DeviceEventEmitter.emit('LoadProgressClose');
            this.statusView && this.statusView.dismiss();
            this.setState({
                loading: false,
                isCanEdit: true,
            });
            this.props.navigation.setParams({
                title: '',
                isCanEdit: true,
            })
        }, false);

    }

    _dealShopCarInfo(carInfoData) {
        if (isEmpty(carInfoData)) {
            return
        }
        let data = itemAddKey(YFWWDShopCarModel.getModelArray(carInfoData));
        //下拉刷新  店铺的包邮和活动描述不变 TT-3946
        if (data.length > 0 && this.state.data.length > 0) {
            data.map((newShopItem) => {
                this.state.data.every((oldShopItem) => {
                    if (oldShopItem.shop_id == newShopItem.shop_id) {
                        newShopItem.add_on = oldShopItem.add_on
                        newShopItem.add_on_isshow = oldShopItem.add_on_isshow
                        newShopItem.freepostage = oldShopItem.freepostage
                        newShopItem.freepostage_isshow = oldShopItem.freepostage_isshow
                        newShopItem.hiddenGoods = oldShopItem.hiddenGoods
                        return false
                    } else {
                        return true
                    }
                })
            })
        }
        this.state.isSetParams = true
        this.props.navigation.setParams({
            isCanEdit: data.length > 0 ? false : true,
            title: data.length > 0 ? this.state.isEdit ? '完成' : '编辑' : '',
        })
        let new_selectData = [];
        if (YFWUserInfoManager.ShareInstance().firstTimeLoadShopCar) {
            //#9590 【药房网】商品详情页优化二期-app端 购物车首次进入全不选中
            // data.forEach((shopValue,shopIndex,shopArray)=>{
            //     shopValue.cart_items.forEach((info,index,array)=>{
            //         if (info.type == 'medicines') {
            //             let data = this._removeOverdueMedicine(info.medicines)
            //             new_selectData = new_selectData.concat(data)
            //         } else if (info.type == 'package' || info.type == 'courseOfTreatment') {
            //             new_selectData.push(info)
            //         }
            //     });
            // });
            YFWUserInfoManager.ShareInstance().firstTimeLoadShopCar = false;
        } else {
            new_selectData = this._updateChooseMedicine(data);
        }
        refreshWDRedPoint();
        this.state.data = data;
        this.state.isSetParams = false;
        this.state.selectData = new_selectData;
        this.state.editSelectData = [];
        this.state.loading = false;
        this.state.isRefresh = false;
        this.state.refreshed = true
        this.state.adData = safeObj(carInfoData).note;
        this.state.prescribedTips = safeObj(carInfoData).prompt_info
    }

    /**
     * 去除失效商品
     */
    _removeOverdueMedicine(data) {
        let returnArray = []
        data.map((info) => {
            if (info.dict_store_medicine_status > 0) {
                returnArray.push(info);
            }
        })
        return returnArray
    }

    _updateChooseMedicine(data) {

        let new_selectData = [];

        data.forEach((shopValue, shopIndex, shopArray) => {
            shopValue.cart_items.forEach((value, index, array) => {
                if (value.type == 'package' || value.type == 'courseOfTreatment') {

                    if (this.state.selectData.some(function (item) {
                        return item.package_id == value.package_id
                    })) {
                        new_selectData.push(value);
                    } else {
                        if (YFWUserInfoManager.ShareInstance().addCarIds.get(safe(value.package_id))) {
                            YFWUserInfoManager.ShareInstance().addCarIds.delete(safe(value.package_id))
                            new_selectData.push(value);
                        }
                    }
                } else if (value.type == 'medicines') {
                    value.medicines.map((info) => {
                        if (this.state.selectData.some(function (item) {
                            return item.id == info.id && info.dict_store_medicine_status > 0
                        })) {
                            new_selectData.push(info);
                        } else {
                            if (YFWUserInfoManager.ShareInstance().addCarIds.get(safe(info.shop_goods_id))) {
                                YFWUserInfoManager.ShareInstance().addCarIds.delete(safe(info.shop_goods_id))
                                if (info.dict_store_medicine_status > 0) {
                                    new_selectData.push(info);
                                }
                            }
                        }
                    })

                }

            });
        });

        return new_selectData;

    }


    //跳转商品详情
    _selectGoodsItemMethod(item) {
        mobClick('cart-list-detail');
        //关闭侧滑框
        DeviceEventEmitter.emit('CloseSwipeRow');
        let isOverdue = parseInt(safe(item.item.dict_store_medicine_status)) < 0 ? true : false
        const { navigate } = this.props.navigation;
        if (isOverdue) {
            pushWDNavigation(navigate, { type: kRoute_goods_detail, value: item.item.medicineid })
        } else {
            pushWDNavigation(navigate, { type: kRoute_shop_goods_detail, value: item.item.shop_goods_id, img_url: tcpImage(item.item.img_url) })
        }

    }

    _renderAdView() {
        return (
            <YFWAdNotificationTip info={safeObj(this.state.adData)} navigation={this.props.navigation}></YFWAdNotificationTip>
        )
    }

}


const cols = 2;
const boxW = (Dimensions.get('window').width - 40) / 2;
const vMargin = (Dimensions.get('window').width - cols * boxW) / (cols + 1);
const hMargin = 10;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
    },
    footerTopTitle: {
        height: 35,
        width: Dimensions.get('window').width,
        textAlign: 'center',
        fontSize: 14,
        color: darkTextColor(),
        marginTop: 20,
    },
    item: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'

    },
    outViewStyle: {
        //    设置侧轴的对齐方式
        alignItems: 'center',
        width: boxW,
        height: boxW + 60,
        marginLeft: vMargin,
        marginTop: hMargin,
    },
    iconStyle: {
        width: boxW - 20,
        height: boxW - 20,
        marginTop: 10,
    },
    footerTitleStyle: {

        width: boxW,
        textAlign: 'center',
        fontSize: 14,
        color: darkNomalColor(),
        marginTop: 15,
    },
    footerPriceStyle: {

        width: boxW,
        textAlign: 'center',
        fontSize: 14,
        color: yfwOrangeColor(),
        marginTop: 10,
    },
    sectionHeaderView: {

        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },
    checkButton: {
        marginLeft: 21,
        width: 30,
        height: 30,
    },
    sectionHeaderTitle: {
        color: darkTextColor(),
        marginLeft: 7,
        fontWeight: 'bold',
        fontSize: 15
    },
    sectionHeaderseparator: {

        height: 1,
        marginBottom: 0,
        marginLeft: 10,
        backgroundColor: separatorColor(),
        width: Dimensions.get('window').width - 10,
    },
    sectionFooterTitle: {
        color: darkTextColor(),
        fontSize: 14
    },
    rowItem: {

        height: 100,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },
    bottomView: {
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },

    //侧滑菜单的样式
    quickAContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    quick: {
        width: 60,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
