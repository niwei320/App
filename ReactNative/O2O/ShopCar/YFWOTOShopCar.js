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
import YFWCheckButton from '../../PublicModule/Widge/YFWCheckButtonView';
import {pushNavigation,addSessionCount, doAfterLoginWithCallBack} from "../../Utils/YFWJumpRouting";
import {
    haslogin,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    kScreenWidth,
    dismissKeyboard_yfw,
    safe, mobClick, darkStatusBar, safeObj, tcpImage, isAndroid, strMapToObj, safeArray
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
    darkNomalColor, darkTextColor, separatorColor,yfwOrangeColor, backGroundColor,darkLightColor,orangeColor, yfwRedColor, yfwGreenColor
} from "../../Utils/YFWColor";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWToast from "../../Utils/YFWToast";
import {addLogPage, refreshOTORedPoint} from "../../Utils/YFWInitializeRequestFunction";
import YFWSwipeRow from '../../widget/YFWSwipeRow'
import {toDecimal} from "../../Utils/ConvertUtils";
import StatusView, { SHOW_EMPTY } from '../../widget/StatusView'
import LinearGradient from 'react-native-linear-gradient';
import YFWShopCarMedicinesCell from '../../ShopCar/YFWShopCarMedicinesCell';
import YFWMoneyLabel from '../../widget/YFWMoneyLabel';
import YFWShopCarPackageCellView from '../../ShopCar/YFWShopCarPackageCellView';
import YFWShopCarEmptyView from '../../ShopCar/YFWShopCarEmptyView';
import YFWShopCarEidtBottomView from '../../ShopCar/YFWShopCarEidtBottomView';
import YFWOTOShopCarModel from './Model/YFWOTOShopCarModel';

export default class YFWOTOShopCar extends Component {
    constructor(...args) {
        super(...args);
        this.isDefaultLoad = true
        this.state = {
            loading: true,
            data: [],
            selectData:[],
            editSelectData:[],
            isEdit:false,
            isCanEdit:true,
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
            showType:'oto',//btc  oto 
        };
        this.handleData();
        this.listener();

    }
    onRightTvClick = ()=> {
        let bool = !this.props.isEdit;
        if (bool) {
            mobClick('cart-edit');
            this.state.editSelectData = [];
        }
        this.setState({
            isEdit : bool
        });

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
                this.handleData()
            }
        );
        this.loginListener = DeviceEventEmitter.addListener('UserLoginSucess',()=>{
            this.handleData()
        })
        this.Login_Off = DeviceEventEmitter.addListener('Login_Off',()=>{
            this.handleData()
        })

        DeviceEventEmitter.addListener('canCloseSwipeRow', (is_can) => {
            this.canCloseSwipeRow = is_can;
        });

    }

    handleData(){
        let mergeRequest = true
        this._requestCartInfoData(mergeRequest);
    }


    componentWillUnmount(){
        /*销毁的时候移除监听*/
        this.didFocus&&this.didFocus.remove();
        this.loginListener&&this.loginListener.remove()
        this.Login_Off&&this.Login_Off.remove()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove()
        }
        YFWUserInfoManager.ShareInstance().addCarOTOIds.clear()
        for(let i =0;i<this.state.selectData.length;i++){
            let value = this.state.selectData[i];
            if(value.type == 'medicine'){
                YFWUserInfoManager.ShareInstance().addCarOTOIds.set(safe(value.shop_goods_id),'id');
            }else{
                YFWUserInfoManager.ShareInstance().addCarOTOIds.set(safe(value.package_id),'id');
            }
        }
    }

    componentWillMount() {
        addLogPage(3)
    }

    //Overrode
    //视图加载完成
    componentDidMount(){
        this.userInfo = YFWUserInfoManager.ShareInstance();
    }

    _view_Scrolled(){

        if (this.canCloseSwipeRow){
            DeviceEventEmitter.emit('CloseSwipeRow');
        }
    }

    render() {
        return (
            <View style={BaseStyles.container}>
                {this._renderShopCarContent()}
                <StatusView ref={(m)=>{this.statusView = m}} initStatus={SHOW_EMPTY} retry={()=>{this.handleData()}}/>
            </View>
        );

    }

    renderRoot(){
        return (
            <View style={styles.container}>
                {this._renderShopCarContent()}
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
                                            <YFWShopCarEmptyView style={{flex:1}} from={'oto'} navigation={this.props.navigation}/>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    </ScrollView>
            )
        }
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
            <View style={[BaseStyles.leftCenterView,{backgroundColor: "#faf8dc",paddingVertical:8,marginBottom:(!this.isTabBarVisable()&&isIphoneX()&&!this.props.isEdit)?34:0}]}>
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
        return (
            <View style={[styles.container,{paddingBottom:Platform.OS==='android'?10:0}]} key={'top'+item.index}>
                {(isNotEmpty(item.item.not_sales_desc)&&item.item.isFirst)&&
                    <View style={[styles.container,{paddingBottom:Platform.OS==='android'?10:0,backgroundColor:'#f5f5f5'}]}>
                        <View style={{height:44,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
                            <Text style={{color:'#333',fontSize:15,marginLeft:13,fontWeight:'500'}}>{'不可购商品'}</Text>
                            <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} activeOpacity={1} onPress={()=>{this.removeAllStaleGoods(cartItems)}} >
                                <Text style={{color:'#feb35e',fontSize:15,marginRight:16}}>{'清空失效商品'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
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
        if (this.props.isEdit){
            return (
                <View style={[styles.bottomView,{marginBottom:(!this.isTabBarVisable()&&isIphoneX())?34:0,}]}>
                    <YFWShopCarEidtBottomView style={{flex:1}} selectAll={this._isSelectAll()}
                                        hiddenCollection={true}
                                        delFn={(items)=>this.onDelGoos(items)}
                                        scFn={(items)=>this.onMoveConllect(items)}
                                        selectAllFn={()=>this._selectAllItems()}
                                        navigation={this.props.navigation}
                                        Data={this.props.isEdit?this.state.editSelectData:this.state.selectData}/>
                </View>
            );
        } else {
            return null
        }
    }

    /**
     * 移动到收藏
     */
    onMoveConllect(item){

    }

    removeAllStaleGoods(items) {
        Alert.alert('','确认清空失效商品吗？',[
            {text:'确认',onPress:()=>{this.removeAllStaleGoodsFromServer()}},
            {text:'取消',onPress:()=>{}}
        ])

    }

    removeAllStaleGoodsFromServer() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let request = new YFWRequestViewModel()
        let params = new Map()
        params.set('__cmd','person.carto2o.ClearLoseMedicine')
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
        let shop_ids = {};
        let shop_ids_map = new Map()
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.carto2o.deleteCartGoodsById');
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
            let shop_ids_set = new Set()
            this.state.editSelectData.map((info)=>{
                if (shop_ids_set.has(info.shop_id)) {
                    let shop_goods_ids = safeArray(shop_ids_map.get(info.shop_id))
                    shop_goods_ids.push(info.shop_goods_id)
                } else {
                    shop_ids_map.set(info.shop_id,[info.shop_goods_id])
                }
                shop_ids_set.add(info.shop_id)
            })
            shop_ids = strMapToObj(shop_ids_map)
        } else {
            if(item.item.type == 'package' || item.item.type == 'courseOfTreatment'){
                paramMap.set('packageId',item.item?.package_id);
            }else {
                paramMap.set('cartId',item.item?.id);
            }
            shop_ids_map.set(item.item?.shop_id,[item.item?.shop_goods_id])
            shop_ids = strMapToObj(shop_ids_map)
        }
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("删除成功");
            DeviceEventEmitter.emit('kOTOShoppingCartDelete',shop_ids)
            DeviceEventEmitter.emit('CloseSwipeRow');
            this._requestCartInfoData()
        },(error)=>{
        })

    }

    changeItemQuantity(item,quantity){
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

    resetData(item,quantity){
    }

    _renderShopInfo(item){
        return (
            <View style={{flex:1}}>
                <View style={{backgroundColor:backGroundColor(),height:21,width:kScreenWidth}}/>
                <View style={styles.sectionHeaderView}>
                    <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                        <View  style={{flexDirection:"row",width:kScreenWidth-80,alignItems:'center'}} >
                            <View style={[styles.checkButton,{marginLeft:8,justifyContent:'center'}]}>
                                {isNotEmpty(item.not_sales_desc)?
                                <View style={{width:23,height:23,backgroundColor:'#ccc',borderRadius:11.5}}></View>:
                                <YFWCheckButton style={{flex:1}} select={this._isSelectShop(item)}
                                                selectFn={()=>this._selectShopItems(item)}/>}
                            </View>
                            <TouchableOpacity activeOpacity={1} onPress={()=>{this._clickShop(item)}} hitSlop={{top:10,left:0,bottom:10,right:0}} >
                                <Text style={styles.sectionHeaderTitle} numberOfLines={2} >{item.shop_title}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {isNotEmpty(item.not_sales_desc)?
                        <View style={{flexDirection:'row',flex:1}}>
                            <View style={{backgroundColor:'#fff5e9',borderRadius:3,paddingHorizontal:6,height:17,marginLeft:44,}}>
                                <Text style={{color:'#feac4c',fontSize:12}}>{item.not_sales_desc}</Text>
                            </View>
                            <View style={{flex:1}}/>
                        </View>
                        :null}
                </View>
            </View>

        );
    }


    _renderSectionFooter = (item) =>{
            let sum = 0
            let dataArray = this.props.isEdit ? this.state.editSelectData : this.state.selectData;
            let allSelectData = []
            safeArray(dataArray).map((goodsInfo)=>{
                if (goodsInfo.shop_id == item.item?.shop_id) {
                    allSelectData.push(goodsInfo)
                }
            })
            if (item.item?.isNotCanSale || this.props.isEdit || allSelectData.length == 0) {
                return <View/>
            }
            allSelectData.map((car_item)=>{
                if (car_item.type == 'package' || car_item.type == 'courseOfTreatment') {
                    sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.count)
                } else {
                    sum += isNaN(Number.parseFloat(car_item.price)) ? 0.00 : Number.parseFloat(car_item.price) * Number.parseInt(car_item.quantity)
                }
            })
            sum += item.item?.package_price + item.item?.logistcs_price
            return (
                <View style={{flex:1,backgroundColor:'white'}}>
                    <View style={{height:1,backgroundColor:'#f5f5f5',marginLeft:6,opacity:0.8}}></View>
                    {this._renderSingleInfoView('包装费','',item.item?.package_price)}
                    {this._renderSingleInfoView('配送费','',item.item?.logistcs_price)}
                    {this._renderSingleInfoView('小计','',sum,yfwRedColor())}
                    {!this.props.isEdit&&<View style={{flexDirection:'row-reverse',paddingHorizontal:13,marginTop:18,marginBottom:21}}>
                        <YFWTouchableOpacity
                            style_title={{ height: 26, width: 82, fontSize: 14 }}
                            title={'去结算'}
                            callBack={()=>{this._orderSettlementSubmit(item.item)}}
                            isEnableTouch={true}
                            enableColors={['rgb(255,51,0)','rgb(255,110,74)']}
                            enableShaowColor={"rgba(255, 51, 0, 0.3)"}
                        />
                    </View>}
                </View>
            )
    }

    _renderSingleInfoView(title,desc,content,moneyColor) {
        return(
            <View style={[BaseStyles.leftCenterView,{height:35,marginLeft:19,marginRight:13}]}>
                <Text style={[BaseStyles.contentWordStyle,{minWidth:60,fontSize:13,color:'#666',textAlign:'left'}]}>{title}</Text>
                <Text style={{marginLeft:10,fontSize:13,color:'#999',textAlign:'left'}}>{desc}</Text>
                <View style={[BaseStyles.rightCenterView,{flex:1}]}>
                    <YFWMoneyLabel moneyTextStyle={{marginRight:0,fontSize:16,color:moneyColor?moneyColor:"#333"}} decimalsTextStyle={{fontSize:13,color:moneyColor?moneyColor:'#333'}} money={toDecimal(content)}/>
                </View>
            </View>
        );
    }

    //# Method # ----------------
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
        if (this.props.isEdit){
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
            let dataArray = this.props.isEdit?this.state.editSelectData:this.state.selectData;
            let set = new Set(dataArray.filter(x => !b.has(x)));
            items = Array.from(set);


        }else{

            items = this.props.isEdit?this.state.editSelectData:this.state.selectData;
            items.push(item);
        }

        if (this.props.isEdit){
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

        let a = new Set(this.props.isEdit?this.state.editSelectData:this.state.selectData);
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

        if (this.props.isEdit){
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
        let dataArray = this.props.isEdit?this.state.editSelectData:this.state.selectData;
        if (count === dataArray.length && count > 0){
            return true;
        }else{
            return false;
        }
    }

    _isSelectShop(item){

        let dataArray = this.props.isEdit?this.state.editSelectData:this.state.selectData;
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
        let dataArray = this.props.isEdit?this.state.editSelectData:this.state.selectData;
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

        let dataArray = this.props.isEdit?this.state.editSelectData:this.state.selectData;

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

    _orderSettlementSubmit(item) {
        let dataArray = this.state.selectData;
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
        if (items.length == 0) {
            YFWToast('至少选择一件商品')
            return
        }
        //shop_id  shop_goods_id
        this.props.navigation.navigate("YFWOTOOrderSettlement",{Data:items});
    }

    /**
     * 点击跳转商家店铺
     * @param item
     * @private
     */
    _clickShop(item){
        // mobClick('cart-list-store');
        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_oto_store',data:{storeid:item.shop_id,cartfold:true,storeMedicineID: safe(item.shop_goods_id)}})
    }


    // # 网络请求 # ---------------------------
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
        paramMap.set('__cmd','person.carto2o.getCart')
        let viewModel = new YFWRequestViewModel();
        // if(!this.isDefaultLoad && !this.state.isRefresh){
            DeviceEventEmitter.emit('LoadProgressShow');
        // }
        this.isDefaultLoad = false
        viewModel.TCPRequest(paramMap , (res)=>{
            this.statusView && this.statusView.dismiss();
            DeviceEventEmitter.emit('LoadProgressClose');
            let carInfoData = res.result
            this._dealShopCarInfo(carInfoData)
            this.setState({
            });

        },(error)=>{
            DeviceEventEmitter.emit('LoadProgressClose');
            this.statusView && this.statusView.dismiss();
            this.setState({
                loading:false,
                isCanEdit:true,
            });
        },false);

    }

    _dealShopCarInfo(carInfoData) {
        if (isEmpty(carInfoData)) {
            return
        }
        let data = itemAddKey(YFWOTOShopCarModel.getModelArray(carInfoData));
        this.props.requestDataCallBack&&this.props.requestDataCallBack(data)
        this.state.isSetParams = true
        let new_selectData = this._updateChooseMedicine(data);
        refreshOTORedPoint();
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
                        if(YFWUserInfoManager.ShareInstance().addCarOTOIds.get(safe(value.package_id))){
                            YFWUserInfoManager.ShareInstance().addCarOTOIds.delete(safe(value.package_id))
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
                            if(YFWUserInfoManager.ShareInstance().addCarOTOIds.get(safe(info.shop_goods_id))){
                                YFWUserInfoManager.ShareInstance().addCarOTOIds.delete(safe(info.shop_goods_id))
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
        this._clickShop(item.item)
        //关闭侧滑框
        DeviceEventEmitter.emit('CloseSwipeRow');
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

        minHeight:60,
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
        // width:Dimensions.get('window').width,
        backgroundColor:'white',
    },
});
