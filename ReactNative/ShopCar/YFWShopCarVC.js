/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    StatusBar,
    Platform,
    TouchableOpacity,
    Dimensions,
    SwipeableFlatList,
    DeviceEventEmitter, ScrollView,
    RefreshControl,
    NativeModules,Alert
} from 'react-native';

import YFWShopCarPackageCellView from './YFWShopCarPackageCellView'
import YFWShopCarBottom from './YFWShopCarBottomView'
import YFWShopCarEmpty from './YFWShopCarEmptyView'
import YFWCheckButton from '../PublicModule/Widge/YFWCheckButtonView';
import {pushNavigation,addSessionCount, doAfterLoginWithCallBack} from "../Utils/YFWJumpRouting";
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
    safe, mobClick, darkStatusBar, safeObj, tcpImage, isAndroid, deepCopyObj, safeArray, kScreenHeight
} from "../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWAlertCouponCollectionListView from '../GoodsDetail/View/YFWAlertCouponCollectionListView'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
    darkNomalColor, darkTextColor, separatorColor,yfwOrangeColor, backGroundColor,darkLightColor,orangeColor, yfwRedColor, yfwGreenColor
} from "../Utils/YFWColor";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWToast from "../Utils/YFWToast";
import YFWShopCarEidtBottom from "./YFWShopCarEidtBottomView";
import {refreshRedPoint, addLogPage} from "../Utils/YFWInitializeRequestFunction";
import YFWSwipeRow from '../widget/YFWSwipeRow'
import YFWShopCarModel from '../ShopCar/Model/YFWShopCarModel'
import YFWShopCarRecomendModel from '../ShopCar/Model/YFWShopCarRecomendModel'
import {toDecimal} from "../Utils/ConvertUtils";
import NumAddSubDialog from "../widget/NumAddSubDialog";
import StatusView, { SHOW_EMPTY } from '../widget/StatusView'
import {getItem,kIsShowLaunchViewKey} from "../Utils/YFWStorage";
import NavigationActions from '../../node_modules_local/react-navigation/src/NavigationActions';
import YFWTitleView from '../PublicModule/Widge/YFWTitleView'
import YFWGoodsItem from '../widget/YFWGoodsItem'
import LinearGradient from 'react-native-linear-gradient';
import YFWShopCarMedicinesCell from './YFWShopCarMedicinesCell';
import ModalView from '../widget/ModalView';
import YFWNoLocationHint from "../widget/YFWNoLocationHint";
import YFWShopCarStaleCell from './YFWShopCarStaleCell';
import YFWHomeShopGoodsCell from "../HomePage/YFWHomeShopGoodsCell";
import YFWShopDetailRecommendModel from "../FindYao/Model/YFWShopDetailRecommendModel";
import YFWAdNotificationTip from '../widget/YFWAdNotificationTip';
import YFWOTOShopCar from '../O2O/ShopCar/YFWOTOShopCar';
const {StatusBarManager} = NativeModules;


export default class YFWShopCarVC extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: isNotEmpty(navigation.state.params)&&navigation.state.params.state? false:true,
        headerTitle: '购物车',
        // headerTitleStyle: {
        //     color: 'white',textAlign: 'center',flex: 1
        // },
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {backgroundColor: 'white',},
        headerLeft: isNotEmpty(navigation.state.params)&&navigation.state.params.state?(
            <TouchableOpacity activeOpacity={1} style={[BaseStyles.item,{width:50}]}
                            hitSlop={{left:10,top:10,bottom:10,right:10}}
                            onPress={()=>{
                                navigation.goBack();
                            }}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                    source={ require('../../img/top_back_green.png')}/>
            </TouchableOpacity>
        ) :<View style={{width:50}}/>,
        headerRight: (
            <TouchableOpacity activeOpacity={1} hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={()=>navigation.state.params.changeRightState()} disabled={navigation.state.params?navigation.state.params.isCanEdit:false}>
                <Text style={{fontSize:16,color:'#333',marginRight:10}}>{navigation.state.params?navigation.state.params.title:''}</Text>
            </TouchableOpacity>
        ),
        // headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
    });

    constructor(...args) {
        super(...args);
        this2=this;
        swipeRowArray=[];
        this.isDefaultLoad = true
        this.isFirstLoad = true
        this.isFirstInit = true
        this.isERPUnionMode = YFWUserInfoManager.ShareInstance().isShopMember()
        this.state = {
            loading: true,
            data: [],
            otoData:[],
            selectData:[],
            editSelectData:[],
            footerData:[],
            isEdit:false,
            isCanEdit:true,
            couponInfo:{shop_goods_id:'',shop_id:''},
            adData:[],
            editPosition:undefined,
            chooseItem:undefined,
            chooseShopId:undefined,
            selectAllStatusChange:false,
            beginEdit:false,
            afterEdit:false,
            newInstance:false,
            requestShopArray:[],
            isSetParams:false,
            isRefresh:false,
            refreshed:false,
            showType:safeObj(safeObj(this.props.navigation.state.params).state).showType || 'btc',//btc  oto 
        };
        this._dealShopCarInfo(YFWUserInfoManager.ShareInstance().shopCarInfo)
        this.handleData();
        this.listener();

    }
    onRightTvClick = ()=> {
        let bool = !this.state.isEdit;
        if (bool) {
            mobClick('cart-edit');
            this.state.editSelectData = [];
        }
        this.setState({
            isEdit : bool
        });
        this.props.navigation.setParams({
            title: haslogin()? bool?'完成':'编辑':'',
        })
        this.otoShopCar&&this.otoShopCar.setState({})
        DeviceEventEmitter.emit('CloseSwipeRow');
        if(!bool){
            this.state.afterEdit = true
        } else {
            this.state.beginEdit = true
        }

    }
    isCanEditeCar = ()=> {
        return this.state.isCanEdit;
    }
    isTabBarVisable() {
        let navigation = this.props.navigation;
        let visibal =  isNotEmpty(navigation.state.params)&&navigation.state.params.state? false:true;
        return visibal;
    }
    listener(){
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if(!haslogin()){
                    this.props.navigation.setParams({
                        title:'',
                        isCanEdit:false,
                    })
                }
                this.state.newInstance = true
                darkStatusBar();
                if(!this.isDefaultLoad){
                    if(this.isERPUnionMode !== YFWUserInfoManager.ShareInstance().isShopMember()){
                        this.isERPUnionMode = YFWUserInfoManager.ShareInstance().isShopMember()
                        this._requestRecommendData();
                    }
                }
                if (!this.isFirstLoad) {
                    this._requestCartInfoData();
                } else {
                    this.isFirstLoad = false
                }
                DeviceEventEmitter.emit('ShowInviteView',{value:false});

                getItem('sessionMap').then((data)=>{
                    if(data){
                        if(data['details']['YFWShopCarVC']){

                        }else
                        {
                            addSessionCount('YFWShopCarVC','购物车');
                        }
                    }

                })
            }
        );

        this.willBlur = this.props.navigation.addListener('willBlur',payload => {
            YFWUserInfoManager.ShareInstance().addCarIds.clear()
            for(let i =0;i<this.state.selectData.length;i++){
                let value = this.state.selectData[i];
                if(value.type == 'medicine'){
                    YFWUserInfoManager.ShareInstance().addCarIds.set(safe(value.shop_goods_id),'id');
                }else{
                    YFWUserInfoManager.ShareInstance().addCarIds.set(safe(value.package_id),'id');
                }
            }
            //隐藏Android端弹出的输入数量的弹窗
            DeviceEventEmitter.emit(NumAddSubDialog.TAG);
        });

        this.loginListener = DeviceEventEmitter.addListener('UserLoginSucess',()=>{
            this.handleData()
        })
        this.Login_Off = DeviceEventEmitter.addListener('Login_Off',()=>{
            YFWUserInfoManager.ShareInstance().shopCarInfo = undefined
            this.handleData()
        })

        DeviceEventEmitter.addListener('canCloseSwipeRow', (is_can) => {
            this.canCloseSwipeRow = is_can;
        });

    }

    handleData(){
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


    componentWillUnmount(){
        /*销毁的时候移除监听*/
        this.didFocus.remove();
        this.willBlur.remove();
        this.didBlur&&this.didBlur.remove();
        this.ShopCarInfoChange&&this.ShopCarInfoChange.remove();
        this.loginListener&&this.loginListener.remove()
        this.Login_Off&&this.Login_Off.remove()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove()
        }
    }

    componentWillMount() {
        addLogPage(3)
    }

    //Overrode
    //视图加载完成
    componentDidMount(){

        DeviceEventEmitter.addListener('LoginToUserCenter',(param)=>{
            if (param == 2) {
                const {navigate} = this.props.navigation
                doAfterLoginWithCallBack(navigate,()=>{
                    const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
                    this.props.navigation.dispatch(resetActionTab);
                })
            }
        })
        this.props.navigation.setParams({
            changeRightState:this.onRightTvClick,
            title:haslogin()?'编辑':'',
            isCanEdit:false,
        })
        this.userInfo = YFWUserInfoManager.ShareInstance();


        this.ShopCarInfoChange= DeviceEventEmitter.addListener('SHOPCAR_INFO_CHANGE',(shop_id)=>{
            YFWUserInfoManager.ShareInstance().jumpToAddGoodsShopId.push(shop_id)
        })
    }

    _view_Scrolled(){

        if (this.canCloseSwipeRow){
            DeviceEventEmitter.emit('CloseSwipeRow');
        }
    }

    render() {
        return (
            <View style={BaseStyles.container}>
                {this.renderRoot()}
                <StatusView ref={(m)=>{this.statusView = m}} initStatus={SHOW_EMPTY} retry={()=>{this.handleData()}}/>
            </View>
        );

    }

    renderRoot(){

        let cart_count = this.state.data.length;
        let hasLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        let hasData = cart_count > 0 && hasLogin
        return (
            <View style={styles.container}>
                {hasData&&<YFWNoLocationHint/>}
                {this._renderAdView()}
                {this._renderTopMenu()}
                {this._renderShopCarContent()}
                {this._renderOTOShopCarContent()}
            </View>
        );
    }

    _renderShopCarContent() {
        let cart_count = this.state.data.length;
        let hasLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        let hasData = cart_count > 0 && hasLogin
        if (hasData) {
            return (
                <>
                    {this._renderList()}
                    {this.renderPrescribedTips()}
                    {this._render_BottomView()}
                    <ModalView ref={(item)=>this.layer = item} animationType = "fade">
                        <View style={{flex:1,backgroundColor:'rgba(0, 0, 0, 0.3)'}}/>
                    </ModalView>
                    <YFWAlertCouponCollectionListView
                        ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                        navigation = {this.props.navigation}
                        dismiss={()=>{this.layer && this.layer.disMiss()}}
                        onRequestClose={()=>{this.layer && this.layer.disMiss()}}
                    />
                </>
            )
        } else {
            return (
                    <ScrollView>
                        <View flex={1}>
                            <FlatList
                                ref={(flatList)=>this._flatList = flatList}
                                extraData={this.state}
                                onRefresh={() => this._onRefresh()}
                                key={'nonData'}
                                refreshing={this.state.loading}
                                ListHeaderComponent = {()=>{
                                    return(
                                        <View style={{flex:1 , height:270}}>
                                            <YFWShopCarEmpty style={{flex:1}} navigation={this.props.navigation}/>
                                        </View>
                                    );
                                }}
                            />
                            {this._renderFooter()}
                        </View>
                    </ScrollView>
            )
        }
    }

    _renderOTOShopCarContent() {
        let o2o_show = YFWUserInfoManager.ShareInstance().getSystemConfig().o2o_show
        if (parseInt(o2o_show) == 0) {
            return null
        }
        let showOTOShop = this.state.showType == 'oto'
        return (
            <View style={{position:'absolute',top:50,left:0,right:0,bottom:showOTOShop?0:kScreenHeight,opacity:showOTOShop?1:0}}>
                <YFWOTOShopCar ref={(e)=>this.otoShopCar=e} requestDataCallBack={(data)=>{
                    this.state.isSetParams = true
                    this.props.navigation.setParams({
                        isCanEdit:data.length>0?false:true,
                        title:data.length>0?this.state.isEdit?'完成':'编辑':'',
                    })
                    this.state.isSetParams = false
                }} navigation={this.props.navigation} isEdit={this.state.isEdit}/>
            </View>
        )
    }

    _renderTopMenu() {
        let o2o_show = YFWUserInfoManager.ShareInstance().getSystemConfig().o2o_show
        if (parseInt(o2o_show) == 0) {
            return null
        }
        return (
            <View style={{flexDirection:'row',alignItems:'center',height:50}}>
                <TouchableOpacity style={{flex:1,backgroundColor:'white',...BaseStyles.centerItem}} onPress={()=>{this.setState({showType:'btc'});this.state.showType = 'btc';this.handleData()}}>
                    <Text style={{color:"#333",fontSize:this.state.showType!='oto'?16:14,fontWeight:this.state.showType!='oto'?'bold':'400'}}>{'健康商城'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,backgroundColor:'white',...BaseStyles.centerItem}} onPress={()=>{this.setState({showType:'oto'});this.state.showType = 'oto';this.otoShopCar&&this.otoShopCar.handleData&&this.otoShopCar.handleData()}}>
                    <Text style={{color:"#333",fontSize:this.state.showType=='oto'?16:14,fontWeight:this.state.showType=='oto'?'bold':'400'}}>{'药迅达'}</Text>
                </TouchableOpacity>
                <View style={{height:1,left:0,right:0,bottom:0,backgroundColor:'#f5f5f5',position:'absolute'}}/>
            </View>
        )
    }
    /**
     * 适配低版本下 <下拉刷新>属性导致的 input获取焦点时的崩溃问题
     * */
    _renderList(){
        if(isAndroid() && Platform.Version <= 19){
            return(
                <View flex={1}>
                    <FlatList
                        ref={(flatList)=>this._flatList = flatList}
                        extraData={this.state}
                        data={this.state.data}
                        key={'showData'}
                        renderItem = {this._renderItem.bind(this)}
                        ListFooterComponent={this._renderFooter()}
                    />
                </View>
            )
        }else {
            return(
                <KeyboardAwareScrollView style={{backgroundColor:'#fafafa'}} keyboardShouldPersistTaps='always' extraScrollHeight={20}
                    onScroll={()=>this._view_Scrolled()}
                    onScrollBeginDrag = {()=>{dismissKeyboard_yfw()}}
                    scrollEventThrottle={50}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            onRefresh={this._onRefresh.bind(this)}
                            colors={['#333333']}
                            progressBackgroundColor="#ffffff" />
                    }
                >
                <ScrollView>
                    <FlatList
                        ref={(flatList)=>this._flatList = flatList}
                        extraData={this.state}
                        data={this.state.data}
                        key={'showData'}
                        renderItem = {this._renderItem.bind(this)}
                        ListFooterComponent={this._renderFooter()}
                    />
                </ScrollView>
                </KeyboardAwareScrollView>
            )
        }
    }
    /**
     * 返回处方药提示3.1.00版本才有
     */
    renderPrescribedTips(){
        if(isEmpty(this.state.prescribedTips)){
            return <View />
        }
        return (
            <View style={[BaseStyles.leftCenterView,{backgroundColor: "#faf8dc",width: kScreenWidth,paddingVertical:8}]}>
                <Text style = {{paddingLeft: 22, fontSize: 13, color: orangeColor()}} numberOfLines={2}>{this.state.prescribedTips}</Text>
            </View>
        )
    }


    // # ListView # -----------------------


    _renderItem = (item) => {
        if(isEmpty(item.item?.cart_items)){
            return <View/>
        }
        safeArray(item.item.cart_items).map((shopGoodsInfo)=>{
            if (shopGoodsInfo.type == 'medicines') {
                safeArray(shopGoodsInfo.medicines).map((goodsInfo)=>{
                    goodsInfo.position = item.index
                })
            } else {
                shopGoodsInfo.position = item.index
            }
        })
        let cartItems = itemAddKey(item.item.cart_items)
        if (item.item.type == 'close') {
            if (!cartItems || cartItems.length <= 0) {
                return (<View/>)
            }
            return (
                <View style={[styles.container,{paddingBottom:Platform.OS==='android'?10:0}]}>
                    <View style={{height:22,backgroundColor:'#fafafa'}}/>
                    <View style={{height:44,backgroundColor:'#fff',alignItems:'flex-end',justifyContent:'center'}}>
                        <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} activeOpacity={1} onPress={()=>{this.removeAllStaleGoods(cartItems)}} >
                            <Text style={{color:'#feac4c',fontSize:15,marginRight:24}}>{'清空失效商品'}</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                    data = {[cartItems]}
                    extraData={this.state}
                    renderItem = {this._renderStaleRowItem.bind(this)}
                />
                </View>
            )
        }
        return (
            <View style={[styles.container,{paddingBottom:Platform.OS==='android'?10:0}]} key={'top'+item.index}>
                {this._renderShopInfo(item.item)}
                <FlatList
                    data = {cartItems}
                    extraData={this.state}
                    renderItem = {this._renderRowItem.bind(this)}
                    ListFooterComponent = {()=>this._renderSectionFooter(item)}
                />
            </View>
        );

    }

    _renderStaleRowItem = (item) => {
        return (
            <YFWShopCarStaleCell DataArray={item?.item} selectGoodsItemMethod={(info)=>{this._selectGoodsItemMethod({item:info})}}/>
        )
    }

    _renderRowItem = (item) => {
        if (item.item?.type == 'package' || item.item?.type == 'courseOfTreatment') {
            return (
                <View key={item.index}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}} >
                        <YFWShopCarPackageCellView accessibilityLabel={'shop_'+item.item.position+'_medicine_'+item.index} Data={item.item} changeQuantity={(quantity)=>this.changeItemQuantity(item,quantity)}
                                                   resetData={(quantity)=>this.resetData(item,quantity)}
                                                   select={this._isSelectItem(item?.item)} selectFn={()=>this._selectItem(item?.item)}
                                                   delFn={()=>this.onDelGoos(item)}
                                                   moveFn={()=>this.onMoveConllect(item)}
                                                   navigation={this.props.navigation}/>
                    </TouchableOpacity>
                </View>
            );

        }else if (item.item?.type == 'medicines') {
            return (
                <YFWShopCarMedicinesCell DataArray={item.item.medicines}
                                        showType={this.state.showType}
                                        startPosition={item.index}
                                        selectGoodsItemMethod={(info)=>this._selectGoodsItemMethod(info)}
                                        changeQuantity={(info,quantity)=>this.changeItemQuantity(info,quantity)}
                                        resetData={(info,quantity)=>this.resetData(info,quantity)}
                                        select={(info)=>this._isSelectItem(info?.item)}
                                        selectFn={(info)=>this._selectItem(info?.item)}
                                        delFn={(info)=>this.onDelGoos(info)}
                                        moveFn={(info)=>this.onMoveConllect(info)}
                />
            )
        } else {
            return (
                <YFWSwipeRow Data={item}
                             selectGoodsItemMethod={()=>this._selectGoodsItemMethod(item)}
                             changeQuantity={(quantity)=>this.changeItemQuantity(item,quantity)}
                             resetData={(quantity)=>this.resetData(item,quantity)}
                             select={this._isSelectItem(item?.item)}
                             selectFn={()=>this._selectItem(item?.item)}
                             delFn={()=>this.onDelGoos(item)}
                             moveFn={()=>this.onMoveConllect(item)}
                />
            );

        }

    }

    _render_BottomView = ()=>{
        if (this.state.isEdit){
            return (<View style={[styles.bottomView,{marginBottom:(!this.isTabBarVisable()&&isIphoneX())?34:0,}]}>
                <YFWShopCarEidtBottom style={{flex:1}} selectAll={this._isSelectAll()}
                                      delFn={(items)=>this.onDelGoos(items)}
                                      scFn={(items)=>this.onMoveConllect(items)}
                                      selectAllFn={()=>this._selectAllItems()}
                                      navigation={this.props.navigation}
                                      Data={this.state.isEdit?this.state.editSelectData:this.state.selectData}/>
            </View>);
        } else {
            return (<View style={[styles.bottomView,{marginBottom:(!this.isTabBarVisable()&&isIphoneX())?34:0,}]}>
                <YFWShopCarBottom style={{flex:1}} selectAll={this._isSelectAll()}
                                  selectAllFn={()=>this._selectAllItems()}
                                  navigation={this.props.navigation}
                                  DataAll={this.state.data}
                                  Data={this.state.selectData}/>
            </View>)
        }
    }

    /**
     * 移动到收藏
     */
    onMoveConllect(item){

        if (isEmpty(item.item?.id) || item.item.id.length == 0){
            YFWToast('请至少选择一件商品');
            return;
        }

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;

        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        let itemId = String(item.item?.id);
        let cartidList = isNotEmpty(itemId)?itemId.split('|'):[];
        if (isNotEmpty(item.item?.package_medicines)) {
            cartidList = safeArray(item.item?.package_medicines).map((goodsInfo)=>{
                return goodsInfo.id
            })
        }
        paramMap.set('__cmd', 'person.cart.moveCartGoodsToFavorite');
        paramMap.set('cartidList',cartidList);
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("收藏成功");
            DeviceEventEmitter.emit('CloseSwipeRow');
            this._requestCartInfoData()
        },(error)=>{
        })

    }

    removeAllStaleGoods(items) {
        Alert.alert('','清空失效商品确认',[
            {text:'确认',onPress:()=>{this.removeAllStaleGoodsFromServer()}},
            {text:'取消',onPress:()=>{}}
        ])

    }

    removeAllStaleGoodsFromServer() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let request = new YFWRequestViewModel()
        let params = new Map()
        params.set('__cmd','person.cart.ClearLoseMedicine')
        request.TCPRequest(params,(res)=>{
            if (res.result) {
                this._requestCartInfoData()
            }
            let title = res.result?'清除成功':'操作失败'
            YFWToast(title)
        },(error)=>{

        })
    }

    /**
     * 删除商品
     */
    onDelGoos(item){

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        if (isEmpty(item)) return;
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.deleteCartGoodsById');
        if (item.isEdit == 1){
            if (isEmpty(item.id) || item.id?.length == 0){
                YFWToast('请至少选择一件商品');
                return;
            }
            let itemId = String(item.id);
            let cart_id_list = isNotEmpty(itemId)?itemId.split('|'):[];
            let cartIds = [];
            let packageIds = [];
            cart_id_list.forEach((listItem,index)=>{
                if (listItem.includes('TC')){
                    packageIds.push(listItem.replace('TC',''));
                } else {
                    cartIds.push(listItem);
                }
            });
            if (cartIds.length > 0){
                paramMap.set('cartId',cartIds.join());
            }
            if (packageIds.length > 0){
                paramMap.set('packageId',packageIds.join());
            }
        } else {
            if(item.item.type == 'package' || item.item.type == 'courseOfTreatment'){
                paramMap.set('packageId',item.item?.package_id);
            }else {
                paramMap.set('cartId',item.item?.id);
            }
        }
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("删除成功");
            DeviceEventEmitter.emit('CloseSwipeRow');
            this._requestCartInfoData()
        },(error)=>{
        })

    }

    changeItemQuantity(item,quantity){
        this.state.editPosition = item.item?.position
        if (Number.parseInt(quantity) === 0){
            return;
        }
        if (item.item?.type == 'package' || item.item?.type == 'courseOfTreatment'){
            item.item.count = quantity;
            this._requestCartInfoData();
        } else {
            DeviceEventEmitter.emit('LoadProgressClose')
            item.item.quantity = quantity;
            refreshRedPoint();
        }
        this.setState({
            data:this.state.data,
        });
    }


    _upDataCollectBills(item,allSelectData,sum){
        if ((this.isFirstLoad || this.isFirstInit) && this._isSelectShop(item.item)) {
            this.state.requestShopArray.push(item.item?.shop_id)
            this._dealFreepostageInfo(item,allSelectData)
            this._checkIsAllBillRequestEnd()
            return
        }

        let paramMap = new Map();
        paramMap.set('__cmd','person.cart.getFreepostageAndActivityInfo');
        paramMap.set('storeid',item.item?.shop_id);
        paramMap.set('price',sum);
        let viewModel = new YFWRequestViewModel();
        if (!(this.isFirstLoad || this.isFirstInit || this.state.newInstance)) {
            DeviceEventEmitter.emit('LoadProgressShow')
        }
        viewModel.TCPRequest(paramMap , (res)=>{
            if(res.code == 1){
                if(this.state.newInstance||this.state.selectAllStatusChange||this.state.afterEdit||this.state.beginEdit||this.state.refreshed){
                    this.state.requestShopArray.push(item.item.shop_id)
                }
                if(isNotEmpty(res?.result)){
                        item.item.add_on = safeObj(res.result).add_on;
                        item.item.add_on_isshow = safeObj(res.result).add_on_isshow;
                        item.item.activesum = safeObj(res.result).activesum;
                        item.item.freepostage = safeObj(res.result).freepostage;
                        item.item.freepostage_isshow = safeObj(res.result).freepostage_isshow;
                        this._dealFreepostageInfo(item,allSelectData)
                        if(item.index == this.state.chooseItem||this.state.editPosition == item.index||item.item.shop_id == this.state.chooseShopId){
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
        },(error)=>{},false);
    }
    /**
     * 处理 单品包邮  满几件包邮
     * @param {*} item
     * @param {*} allSelectData
     */
    _dealFreepostageInfo(item,allSelectData) {
        if (allSelectData&&allSelectData.length > 0 ) {
            let allFire = allSelectData.every((medicine)=>{
                return medicine.type == 'medicine' && medicine.is_freepostage == 1 && medicine.freepostagecount > 0 && medicine.quantity >= medicine.freepostagecount
            })
            if (allFire) {
                item.item.freepostage = '包邮'
                item.item.freepostage_isshow = 0
            }
        }
    }

    _isContained(aa, bb) {
        if(((aa.length < bb.length))) {
            return false;
        }
        for (var i = 0; i < bb.length; i++) {
            var flag = false;
            for(var j = 0; j < aa.length; j++){
                if(aa[j] == bb[i].shop_id){
                    flag = true;
                    break;
                }
            }
            if(flag == false){
                return flag;
            }
        }
        return true;
    }

    _checkIsAllBillRequestEnd() {
        let allDataArray = []
        if (isNotEmpty(this.state.data)) {
            safeArray(this.state.data).map((shopInfo)=>{
                if (shopInfo.type != 'close') {
                    allDataArray.push(shopInfo)
                }
            })
        }
        let isAllrequest = this._isContained(this.state.requestShopArray,allDataArray)
        if(isAllrequest){
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



    resetData(item,quantity){

        item.item.quantity = quantity;
        this.setState({
            data:this.state.data,
        })
    }

    _renderShopInfo(item){
        return (
            <View style={{flex:1}}>
                <View style={{backgroundColor:backGroundColor(),height:21,width:kScreenWidth}}/>
                <View style={styles.sectionHeaderView}>
                    <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                        <View  style={{flexDirection:"row",width:kScreenWidth-120}} >
                            <View style={{flex:1 ,alignItems:'center'}} flexDirection={'row'}>
                                <View style={styles.checkButton}>
                                    <YFWCheckButton style={{flex:1}} select={this._isSelectShop(item)}
                                                    selectFn={()=>this._selectShopItems(item)}/>
                                </View>
                                <TouchableOpacity activeOpacity={1} onPress={()=>{this._clickShop(item)}} hitSlop={{top:10,left:0,bottom:10,right:0}} >
                                    <Text style={styles.sectionHeaderTitle} numberOfLines={2} >{item.shop_title}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {Number.parseInt(item.shop_coupon_count)>0 ?
                            <TouchableOpacity style={[BaseStyles.centerItem,{marginLeft:60,width:60,height:30}]} onPress={()=>this._getShopCoupon(item)}>
                                <Text style={{color:orangeColor(),fontSize:12}}>领券</Text>
                            </TouchableOpacity> : <View/>}
                    </View>
                </View>
                {this._renderCollectBills(item)}

            </View>

        );
    }

    _renderCollectBills(item){
        if(item){
            let showMargin = isNotEmpty(item.add_on)&&isNotEmpty(item.freepostage)
            return (
                <View style={{width:kScreenWidth,backgroundColor:'#FFFFFF',paddingBottom:9,flexDirection:'row'}}>
                    <View style={{flex:1}}>
                        {this._renderCollectItem(item)}
                        {showMargin?<View style={{height:10}}/>:null}
                        {this._renderExemptionItem(item)}
                    </View>
                    {this._renderCollectBillsButton(item)}
                </View>
            )
        }else {
            return(<View/>)
        }
    }

    _renderCollectItem(item){
        if(isNotEmpty(item.add_on)){
            return(
                <View style={{flex:1,flexDirection:'row',alignItems:'center',marginLeft:50}}>
                    <LinearGradient colors={['rgb(250,171,129)','rgb(250,209,110)']}
                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                            locations={[0,1]}
                            style={{width: 32,height: 12,borderRadius:6,justifyContent:'center',alignItems:'center'}}>
                            <Text style={{fontSize:10,color:'white'}}>满减</Text>
                    </LinearGradient>
                    <Text style={{color:darkNomalColor(),fontSize:12,marginLeft:7}}>{item.add_on}</Text>
                    <View style={{flex:1}}/>
                </View>)
        }else {
            return(<View/>)
        }
    }

    _renderCollectBillsButton(item){
        if((safeObj(item.add_on_isshow) == '0'&& safeObj(item.freepostage_isshow) == '0') ||(isEmpty(safeObj(item.add_on_isshow))&&isEmpty(safeObj(item.freepostage_isshow)))){
            return(null)
        }else {
            return(<TouchableOpacity hitSlop={{left:10,top:5,bottom:10,right:10}} style={{marginRight:16}} onPress = {()=>this._jumpToCollectBills(item)}>
                <Text style={{color:orangeColor(),fontSize:12,lineHeight:14}}>去凑单</Text>
            </TouchableOpacity>)
        }
    }

    _renderExemptionItem(item){
        if(isNotEmpty(item.freepostage)){
            return(
                <View style={{flex:1,flexDirection:'row',alignItems:'center',marginLeft:50,height:15}}>
                <LinearGradient colors={['rgb(44,92,241)','rgb(124,100,247)']}
                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                            locations={[0,1]}
                            style={{width: 32,height: 12,borderRadius:6,justifyContent:'center',alignItems:'center'}}>
                            <Text style={{fontSize:10,color:'white'}}>包邮</Text>
                </LinearGradient>
                    <Text style={{color:darkNomalColor(),fontSize:12,marginLeft:7}}>{item.freepostage}</Text>
                </View>
            )
        }else {
            return(<View/>)
        }
    }

    _jumpToCollectBills(data){
        const { navigate } = this.props.navigation;
        //计算选中店内商品总价
        let sum = 0
        let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
        let allSelectData = []
        safeArray(dataArray).map((goodsInfo)=>{
            if (goodsInfo.shop_id == data.shop_id) {
                allSelectData.push(goodsInfo)
            }
        })
        allSelectData.map((car_item)=>{
            if (car_item.type == 'package' || car_item.type == 'courseOfTreatment') {
                sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.count)
            } else {
                sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.quantity)
            }
        })
        //跳转凑单页
        YFWUserInfoManager.ShareInstance().jumpToAddGoodsShopId.push(data.shop_id);
        pushNavigation(navigate,{type:'get_shop_detail_list',value:data.shop_id, priceSumInShop:sum});
    }


    _renderSectionFooter = (item) =>{

            let sum = 0
            let dataArray = this.state.isEdit ? this.state.editSelectData : this.state.selectData;
            let allSelectData = []
            safeArray(dataArray).map((goodsInfo)=>{
                if (goodsInfo.shop_id == item.item?.shop_id) {
                    allSelectData.push(goodsInfo)
                }
            })
            allSelectData.map((car_item)=>{
                if (car_item.type == 'package' || car_item.type == 'courseOfTreatment') {
                    sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.count)
                } else {
                    sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.quantity)
                }
            })
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
                this.state.chooseShopId == item.item?.shop_id || this.state.selectAllStatusChange ||
                this.state.afterEdit || this.state.newInstance || this.state.beginEdit || this.state.refreshed)) {
                this._upDataCollectBills(item,allSelectData, toDecimal(sum))
            }

            return (<View/>)
    }


    //列表尾
    _renderFooter() {

        return (
            <View style={{flex:1, backgroundColor:backGroundColor()}}>
                <View style={{flex:1, alignItems:'center', height: 50}}>
                    <YFWTitleView title={'精选商品'}/>
                </View>
                <FlatList
                    style={{paddingHorizontal:5}}
                    data={this.state.footerData}
                    renderItem={this._renderCommendItem.bind(this)}
                    keyExtractor={(item, index) => index}
                    numColumns={2}
                />
            </View>
        )

    }

    // # View # -------------------------------
    _renderCommendItem({item}) {

        if(YFWUserInfoManager.ShareInstance().isShopMember()){
            item.id = item.medicine_id
            item.old_price = toDecimal(item.price)
            item.medicine_name = item.name
            return(
                <YFWHomeShopGoodsCell item={item} from={'cart_list_recommend'} clickItemAction={()=>{this.clickItems(item)}} addToCarAction={()=>{this.clickaddToCar(item)}}/>
            )
        }

        return(
            /**  */
            <YFWGoodsItem model={item} from={'cart_list_recommend'} navigation={this.props.navigation}/>
        )
    }

    //# Method # -----------------
    clickItems(info){
        const { navigate } = this.props.navigation;
        let param = {
            type: 'get_shop_goods_detail',
            value: info.id,
            img_url: tcpImage(info.intro_image),
            goodsInfo:info,
            price: info.old_price,
        }
        pushNavigation(navigate,param);

    }

    clickaddToCar(info){
        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            this.addToCar(info)
        } else {
            let {navigate} = this.props.navigation
            doAfterLoginWithCallBack(navigate,()=>{
                this.addToCar(info)
            })
        }
    }

    addToCar(info){
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.addCart');
        paramMap.set('quantity', 1);
        paramMap.set('storeMedicineId', info.id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('商品添加成功');
            this._requestCartInfoData();
        }, (error) => {
        });
    }
    _onRefresh(){
        this.state.isRefresh = true
        this.setState({
            loading:true,
        });
        this.handleData();

    }

    _selectAllItems(){
        this.state.selectAllStatusChange = true
        let selectItems = [];
        if (!this._isSelectAll()){
            for (let i  =0 ;i < this.state.data.length;i++){
                let shopItems = this.state.data[i];
                if (shopItems.cart_items) {
                    safeArray(shopItems.cart_items).map((info)=>{
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
        if (this.state.isEdit){
            this.setState({
                editSelectData:selectItems,
            });
        } else {
            this.setState({
                selectData:selectItems,
            });
        }


    }

    _selectItem(item){
        this.state.chooseItem = item.position
        let items = [];

        if(this._isSelectItem(item)){

            let b = new Set([item]);
            let dataArray = this.state.isEdit?this.state.editSelectData:this.state.selectData;
            let set = new Set(dataArray.filter(x => !b.has(x)));
            items = Array.from(set);


        }else{

            items = this.state.isEdit?this.state.editSelectData:this.state.selectData;
            items.push(item);
        }

        if (this.state.isEdit){
            this.setState({
                editSelectData:items,
            });
        } else {
            this.setState({
                selectData:items,
            });
        }

    }

    _selectShopItems(item){
        let items = [];

        let a = new Set(this.state.isEdit?this.state.editSelectData:this.state.selectData);
        let allMedicines = []
        safeArray(item.cart_items).map((info)=>{
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
        if(!this._isSelectShop(item)) {
            items = items.concat(allMedicines);
            this.state.chooseShopId = item.shop_id
        }

        if (this.state.isEdit){
            this.setState({
                editSelectData:items,
            });
        } else {
            this.setState({
                selectData:items,
            });
        }

    }

    _isSelectAll(){

        let count = 0
        for (let i  =0 ;i < this.state.data.length;i++){
            let shopItems = this.state.data[i];
            if (shopItems.cart_items) {
                safeArray(shopItems.cart_items).map((info)=>{
                    if (info.type == 'medicines') {
                        let data = this._removeOverdueMedicine(info.medicines)
                        count += data.length
                    } else if (info.type == 'package' || info.type == 'courseOfTreatment') {
                        count++
                    }
                })
            }

        }
        let dataArray = this.state.isEdit?this.state.editSelectData:this.state.selectData;
        if (count === dataArray.length && count > 0){
            return true;
        }else{
            return false;
        }
    }

    _isSelectShop(item){

        let dataArray = this.state.isEdit?this.state.editSelectData:this.state.selectData;
        let a = new Set(dataArray);
        let allMedicines = []
        safeArray(item.cart_items).map((info)=>{
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
        if (items.length === allMedicines.length && allMedicines.length > 0){
            return true;
        }

        return false;
    }

    _isNoGoodsBeSeclectedInShop(item){
        let dataArray = this.state.isEdit?this.state.editSelectData:this.state.selectData;
        let a = new Set(dataArray);
        let allMedicines = []
        safeArray(item.cart_items).map((info)=>{
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
        if (items.length >0){
            return true;
        }

        return false;
    }

    _isSelectItem(item){

        let dataArray = this.state.isEdit?this.state.editSelectData:this.state.selectData;

        if (item.type == 'package' || item.type == 'courseOfTreatment') {

            if (dataArray.some(function (value) {
                    return item.package_id == value.package_id
                })){
                return true;

            }

        } else {

            if (dataArray.some(function (value) {
                    return item.id == value.id
                })){
                return true;
            }

        }


        return false;

    }


    _getShopCoupon(item){

        mobClick('cart-list-coupon');
        let couponInfo = {shop_id:item.shop_id,shop_goods_id:'',couponArray:safeObj(item.coupons_list)};
        this.layer && this.layer.show()
        this.popupDialog && this.popupDialog.show(couponInfo);

    }

    /**
     * 点击跳转商家店铺
     * @param item
     * @private
     */
    _clickShop(item){
        mobClick('cart-list-store');
        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail',value:item.shop_id})
    }


    // # 网络请求 # ---------------------------
    // 大家推荐
    _requestRecommendData(){
        if(YFWUserInfoManager.ShareInstance().isShopMember()){
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineTop')
            paramMap.set('storeid',YFWUserInfoManager.ShareInstance().getErpShopID());
            paramMap.set('count','6')
            viewModel.TCPRequest(paramMap, (res) => {
                let dataArray = itemAddKey(YFWShopDetailRecommendModel.getModelArray(res.result));
                this.setState({
                    footerData: dataArray,
                })
                if (this.statusView) this.statusView.dismiss();
            }, (error) => {
                if (this.statusView) this.statusView.dismiss();
            }, false)
        } else {
            let paramMap = new Map();
            paramMap.set('__cmd','guest.medicine.getTopVisitMedicine');
            paramMap.set('limit',6);
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap , (res)=>{
                if (this.statusView) this.statusView.dismiss();
                let dataArray = itemAddKey(YFWShopCarRecomendModel.getModelArray(res.result))
                this.setState({
                    footerData:dataArray,
                });

            },(error)=>{
                if (this.statusView) this.statusView.dismiss();
            },false);
        }

    }


    shouldComponentUpdate(){
        if(this.state.isSetParams){
            if(haslogin()){
                return false
            }else {
                return true
            }
        }else {
            return true
        }
    }

    _requestCartInfoData(isMerge){

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            this.state.loading = false;
            this.setState({
                loading:false,
                isCanEdit:true,
            });
            this.statusView&&this.statusView.dismiss();
            return;
        };
        let paramMap = new Map();
        let isShopMember = YFWUserInfoManager.ShareInstance().isShopMember()
        if (isMerge) {
            if(isShopMember){
                paramMap.set('__cmd', 'person.cart.getCart as getCart,guest.shopMedicine.getStoreMedicineTop as getStoreMedicineTop');
                paramMap.set('getStoreMedicineTop',{
                    'storeid':YFWUserInfoManager.ShareInstance().getErpShopID(),
                    'count':'6',
                })
            } else {
                paramMap.set('__cmd', 'person.cart.getCart as getCart,guest.medicine.getTopVisitMedicine as getTopVisitMedicine');
                paramMap.set('getTopVisitMedicine',{
                    'limit':6
                })
                paramMap.set('getCart',{
                    'isDiffLostMedicine':'1'
                })
            }
        } else {
            paramMap.set('__cmd', 'person.cart.getCart')
            paramMap.set('isDiffLostMedicine','1')
        }
        let viewModel = new YFWRequestViewModel();
        // if(!this.isDefaultLoad && !this.state.isRefresh){
            DeviceEventEmitter.emit('LoadProgressShow');
        // }
        this.isDefaultLoad = false
        viewModel.TCPRequest(paramMap , (res)=>{
            this.statusView && this.statusView.dismiss();
            DeviceEventEmitter.emit('LoadProgressClose');
            let carInfoData = isMerge?res.result['getCart']:res.result
            YFWUserInfoManager.ShareInstance().shopCarInfo = carInfoData    
            this._dealShopCarInfo(carInfoData)
            if (isMerge) {
                let dataArray = []
                if (isShopMember) {
                    dataArray = itemAddKey(YFWShopDetailRecommendModel.getModelArray(res.result['getStoreMedicineTop']));
                } else {
                    dataArray = itemAddKey(YFWShopCarRecomendModel.getModelArray(res.result['getTopVisitMedicine']))
                }
                this.setState({
                    footerData:dataArray,
                });
            } else {
                this.setState({
                });
            }

        },(error)=>{
            DeviceEventEmitter.emit('LoadProgressClose');
            this.statusView && this.statusView.dismiss();
            this.setState({
                loading:false,
                isCanEdit:true,
            });
            this.props.navigation.setParams({
                title:'',
                isCanEdit:true,
            })
        },false);

    }

    _dealShopCarInfo(carInfoData) {
        if (isEmpty(carInfoData)) {
            return
        }
        let data = itemAddKey(YFWShopCarModel.getModelArray(carInfoData));
        //下拉刷新  店铺的包邮和活动描述不变 TT-3946
        if (data.length > 0 && this.state.data.length > 0) {
            data.map((newShopItem)=>{
                this.state.data.every((oldShopItem)=>{
                    if (oldShopItem.shop_id == newShopItem.shop_id) {
                        newShopItem.add_on = oldShopItem.add_on
                        newShopItem.add_on_isshow = oldShopItem.add_on_isshow
                        newShopItem.activesum = oldShopItem.activesum
                        newShopItem.freepostage = oldShopItem.freepostage
                        newShopItem.freepostage_isshow = oldShopItem.freepostage_isshow
                        return false
                    } else {
                        return true
                    }
                })
            })
        }
            
            this.state.isSetParams = true
            this.props.navigation.setParams({
                isCanEdit:data.length>0?false:true,
                title:data.length>0?this.state.isEdit?'完成':'编辑':'',
            })
            let new_selectData = [];
            if (YFWUserInfoManager.ShareInstance().firstTimeLoadShopCar){
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
            refreshRedPoint();
            this.state.data = data
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
    _removeOverdueMedicine(data){
        let returnArray = []
        safeArray(data).map((info)=>{
            if (info.dict_store_medicine_status > 0){
                returnArray.push(info);
            }
        })
        return returnArray
    }

    _updateChooseMedicine(data){

        let  new_selectData = [];

        data.forEach((shopValue,shopIndex,shopArray)=>{
            safeArray(shopValue.cart_items).forEach((value,index,array)=>{
                if (value.type == 'package' || value.type == 'courseOfTreatment') {

                    if (this.state.selectData.some(function (item) {
                            return item.package_id == value.package_id
                        })){
                        new_selectData.push(value);
                    }else{
                        if(YFWUserInfoManager.ShareInstance().addCarIds.get(safe(value.package_id))){
                            YFWUserInfoManager.ShareInstance().addCarIds.delete(safe(value.package_id))
                            new_selectData.push(value);
                        }
                    }
                } else if (value.type == 'medicines') {
                    safeArray(value.medicines).map((info)=>{
                        if (this.state.selectData.some(function (item) {
                            return item.id == info.id && info.dict_store_medicine_status > 0
                            })){
                            new_selectData.push(info);
                        }else{
                            if(YFWUserInfoManager.ShareInstance().addCarIds.get(safe(info.shop_goods_id))){
                                YFWUserInfoManager.ShareInstance().addCarIds.delete(safe(info.shop_goods_id))
                                if(info.dict_store_medicine_status > 0){
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
    _selectGoodsItemMethod(item){
        mobClick('cart-list-detail');
        //关闭侧滑框
        DeviceEventEmitter.emit('CloseSwipeRow');
        let isOverdue = parseInt(safe(item.item.dict_store_medicine_status))<0?true:false
        const { navigate } = this.props.navigation;
        if(isOverdue){
            pushNavigation(navigate, {type: 'get_goods_detail', value: item.item?.medicineid})
        }else{
            pushNavigation(navigate,{type:'get_shop_goods_detail',value:item.item?.shop_goods_id,img_url:tcpImage(item.item.img_url)})
        }

    }

    _renderAdView() {
        return (
            <YFWAdNotificationTip info={safeObj(this.state.adData)} navigation={this.props.navigation}></YFWAdNotificationTip>
        )
    }

}


const cols = 2;
const boxW = (Dimensions.get('window').width-40) / 2;
const vMargin = (Dimensions.get('window').width - cols*boxW)/(cols+1);
const hMargin = 10;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        alignItems: 'stretch',
        justifyContent:'flex-start',
        backgroundColor: 'white',
    },
    footerTopTitle:{
        height:35,
        width:Dimensions.get('window').width,
        textAlign:'center',
        fontSize: 14,
        color:darkTextColor(),
        marginTop:20,
    },
    item:{
        marginTop:0,
        marginLeft:0,
        marginRight:0,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'

    },
    outViewStyle:{
        //    设置侧轴的对齐方式
        alignItems:'center',
        width:boxW,
        height:boxW + 60,
        marginLeft:vMargin,
        marginTop:hMargin,
    },
    iconStyle:{
        width:boxW - 20,
        height:boxW - 20,
        marginTop:10,
    },
    footerTitleStyle:{

        width:boxW,
        textAlign:'center',
        fontSize: 14,
        color:darkNomalColor(),
        marginTop:15,
    },
    footerPriceStyle:{

        width:boxW,
        textAlign:'center',
        fontSize: 14,
        color:yfwOrangeColor(),
        marginTop:10,
    },
    sectionHeaderView:{

        height:50,
        width:Dimensions.get('window').width,
        backgroundColor:'white',
    },
    checkButton:{
        marginLeft:21,
        width:30,
        height:30,
    },
    sectionHeaderTitle:{
        color:darkTextColor(),
        marginLeft:7,
        fontWeight:'bold',
        fontSize:15
    },
    sectionHeaderseparator:{

        height:1,
        marginBottom:0,
        marginLeft:10,
        backgroundColor:separatorColor(),
        width:Dimensions.get('window').width-10,
    },
    sectionFooterTitle:{
        color:darkNomalColor(),
        marginRight:15,
        fontSize:15
    },
    rowItem:{

        height:100,
        width:Dimensions.get('window').width,
        backgroundColor:'white',
    },
    bottomView:{
        height:50,
        width:Dimensions.get('window').width,
        backgroundColor:'white',
    },

    //侧滑菜单的样式
    quickAContent:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    quick:{
        width:60,
        padding:10,
        justifyContent:'center',
        alignItems:'center'
    }
});
