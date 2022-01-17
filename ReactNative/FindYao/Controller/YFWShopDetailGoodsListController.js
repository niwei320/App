import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    FlatList,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Platform,
    NativeModules, DeviceEventEmitter
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    isNotEmpty,
    kScreenWidth,
    safeObj
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWNativeManager from '../../Utils/YFWNativeManager'
import YFWShopDetailGoodsListItemView from "../View/YFWShopDetailGoodsListItemView";
import YFWEmptyView from '../../widget/YFWEmptyView'
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import YFWShopDetailGoodsListModel from "../Model/YFWShopDetailGoodsListModel";
import YFWShopDetailGoodsListHeader from '../View/YFWShopDetailGoodsListHeader'
import YFWShopDetailGoodsListTabMenu from '../View/YFWShopDetailGoodsListTabMenu'
import YFWShopDetailCategorModel from "../Model/YFWShopDetailCategorModel";
import YFWGoodsItem from '../../widget/YFWGoodsItem'
import {pushNavigation, doAfterLoginWithCallBack} from "../../Utils/YFWJumpRouting"
import {yfwGreenColor,darkTextColor} from '../../Utils/YFWColor'
import {setItem} from "../../Utils/YFWStorage"
import YFWNoLocationHint from '../../widget/YFWNoLocationHint'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const {StatusBarManager} = NativeModules;
import NavigationActions from '../../../node_modules_local/react-navigation/src/NavigationActions';
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWToast from "../../Utils/YFWToast";
export default class YFWShopDetailGoodsListController extends Component {

    static navigationOptions = ({navigation}) => ({

        headerTitle: <YFWShopDetailGoodsListHeader onSerchClick={(text)=>{
                navigation.state.params.searchMethod(text)
        }}
                                                   placeholder="搜索店铺内商品"
                                                   tipsText="搜索"/>,
        headerRight: null,
        tabBarVisible: false,
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0},
        headerLeft:
            <TouchableOpacity style={[BaseStyles.item,{width:40,height:40,}]}
                              onPress={()=>{

                                  navigation.state.params.backMethod()
                                  }}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={ require('../../../img/top_back_white.png')}
                       defaultSource={require('../../../img/top_back_white.png')}/>
            </TouchableOpacity>,
        headerBackground: <Image source={require('../../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>,
    });


    constructor(props, context) {

        super(props, context);
        this.iconStata = true;
        this.fist_load = true
        this.afterLoadData = false
        _this = this
        this.state = {
            data: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            tableStyle: true,
            KindMenuOpen: false,
            ColligationMenuOpen: false,
            showCollectBillsHint:false,
            collectBillsInfo:{},
            shopCategorItem: [],
            selectCategoryItem: -1,
            keyWords:'',
            sort:'sale_count desc', //sale_count
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        }
        this.state.tableStyle = YFWUserInfoManager.ShareInstance().tableStyle
        this.iconStata = this.state.tableStyle;
    }

    onRightTvClick = (text) => {
        this.categoryID = '';
        this.state.data = [];
        this.state.pageIndex = 1;
        this.state.KindMenuOpen = false;
        this.state.keyWords = text;
        this.TabMenu&&this.TabMenu.changeSelectedTabItem();
        this.setState({})
        this._requestData()
    }

    componentDidMount() {
        this.loginListener = DeviceEventEmitter.addListener('UserLoginSucess',()=>{
            this._onRefresh()
        })
        this.loginToListener = DeviceEventEmitter.addListener('LoginToUserCenter',(param)=>{
            if (param == 1) {
                const {navigate} = this.props.navigation
                doAfterLoginWithCallBack(navigate,()=>{
                    const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
                    this.props.navigation.dispatch(resetActionTab);
                })
            }
        })
        if (YFWUserInfoManager.ShareInstance().erpShopID != -1) {
            this.shopID = YFWUserInfoManager.ShareInstance().erpShopID;
        }else{
            this.shopID = this.props.navigation.state.params.state.value;
            this.categoryID = this.props.navigation.state.params.state.category_id;
            this.priceSumInShop = this.props.navigation.state.params.state.priceSumInShop; //凑单页活动金额
            this.couponCondition = this.props.navigation.state.params.state.couponCondition; //结算页优惠券凑单 条件金额
            this.goShop = this.props.navigation.state.params.state.goShop;
        }

        if (isEmpty(this.categoryID)) {
            this.categoryID = '';
        }
        //判断是否来着购物车凑单
        if (isNotEmpty(this.priceSumInShop) && isEmpty(this.couponCondition)) {
            this._requestCollectBills(this.shopID, this.priceSumInShop);
        }
        //来自结算页 优惠券凑单
        if(isNotEmpty(this.couponCondition)){
            this.collectBillsListener = DeviceEventEmitter.addListener('YFWShopDetailGoodsListRefreshCollectBillsInfo',(result)=>{
                YFWToast('商品添加成功');
                this.priceSumInShop = this.priceSumInShop + parseFloat(safeObj(result))
                this.setState({})
            })
        }
        this._requestShopCategor();
        this._requestData();

    }
    //请求包邮满减信息
    _requestCollectBills(shop_id,sum){
        let that = this
        let paramMap = new Map();
        paramMap.set('__cmd','person.cart.getFreepostageAndActivityInfo');
        paramMap.set('storeid',shop_id);
        paramMap.set('price',sum);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            if(res.code == 1){
                if(isNotEmpty(res.result)){
                    let collectBillsInfo = {
                        add_on : safeObj(res.result).add_on,
                        add_on_isshow : safeObj(res.result).add_on_isshow,
                        freepostage : safeObj(res.result).freepostage,
                        freepostage_isshow : safeObj(res.result).freepostage_isshow,
                    }
                    that.setState({
                        collectBillsInfo: collectBillsInfo,
                        showCollectBillsHint:true
                    })
                }
            }
        },(error)=>{},true);
    }

    //添加购物车成功, 刷新包邮满减信息
    _refreshCollectBillsInfo(price, cartId){
        //来自结算页回调,返回购物车id
        if(this.props.navigation.state.params.state.settlementCallback && isNotEmpty(this.priceSumInShop)){
            this.props.navigation.state.params.state.settlementCallback(cartId,price)
            return
        }
        //判断是否来着购物车凑单
        if (isNotEmpty(this.priceSumInShop)){
            this.priceSumInShop = this.priceSumInShop + parseFloat(safeObj(price))
            this._requestCollectBills(this.shopID, this.priceSumInShop)
        }
    }

    _requestShopCategor() {

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shopMedicine.getCategroyByParentId');
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = YFWShopDetailCategorModel.getModelArray(res.result);
            dataArray = itemAddKey(dataArray);
            this.setState({
                shopCategorItem: dataArray,
            });

        }, (error)=> {

        },this.state.pageIndex == 1 ? true : false);

    }

    componentWillUnmount(){
        this.loginListener && this.loginListener.remove()
        this.loginToListener && this.loginToListener.remove()
        this.collectBillsListener && this.collectBillsListener.remove()
    }

    componentWillMount() {

        this.props.navigation.setParams({backMethod: this._backMethod});
        this.props.navigation.setParams({searchMethod: this.onRightTvClick});
        this.loginListener&&this.loginListener.remove()
    }

    _backMethod = ()=> {
        this.props.navigation.goBack();
    }

    //@ Request

    _requestData() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineSearch');
        paramMap.set('storeid', this.shopID);
        paramMap.set('categoryid', this.categoryID);
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('orderField', this.state.sort);
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        this.afterLoadData = false
        if(isNotEmpty(this.state.keyWords)){
            paramMap.set('keywords',this.state.keyWords)
        }
        viewModel.TCPRequest(paramMap, (res)=> {
            this.afterLoadData = true
            let showFoot = 0;

            let dataArray = YFWShopDetailGoodsListModel.getModelArray(res.result.dataList);

            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.data.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);
            this.state.data = dataArray
            this.state.loading = false
            this.state.showFoot = showFoot
            this.setState({});

        }, (error)=> {
            this.setState({
                loading: false,
                showFoot: 0,
            });
        }, this.state.pageIndex == 1 ? true : false);

    }

    _showTypeChange = ()=> {
        this.state.tableStyle = !this.state.tableStyle
        YFWUserInfoManager.ShareInstance().tableStyle = this.state.tableStyle
        this.TabMenu&&this.TabMenu.refreshView(this.state.tableStyle);
        setItem('CategoryTableStyle',this.state.tableStyle?'table':'collection')
        this.setState({});
    }

    _refreshData(type) {
        this.state.orderby = type;
        this._onRefresh();
    }

    _onRefresh() {

        this.state.pageIndex = 1;
        this.setState({
            loading: true
        });
        this._requestData();

    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this._requestData();

    }


    //@ View
    render() {

        return(
            <View style={[BaseStyles.container]}>
                {/* <AndroidHeaderBottomLine/> */}
                <YFWShopDetailGoodsListTabMenu changeKindMenuStatus={(b,d)=>this.changeKindMenuStatus(b,d)} _showTypeChange = {()=>{this._showTypeChange()}} ref={(r)=>{this.TabMenu = r}} navigation={this.props.navigation}/>
                <YFWNoLocationHint/>
                {this._renderCollectBillsHint()}
                {this._renderList()}
                {this._renderKindMenuList()}
            </View>
        )
    }

    _renderList(){
        if (this.state.data.length > 0) {
            let numColumns = this.state.tableStyle ? 1 : 2;
            let key = this.state.tableStyle ? 'table' : 'collection';
            let padding_value = key==='collection' ? 5 : 0;
            return (
                <FlatList
                    style={{paddingHorizontal:padding_value, backgroundColor:'#fff'}}
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.data}
                    numColumns={numColumns}
                    key={key}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    renderItem={this._renderListItem.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                />

            );
        } else {
            if(this.afterLoadData){
                return <YFWEmptyView title='暂无数据'/>
            }
        }
    }

    _renderCollectBillsHint(){
        if(this.state.showCollectBillsHint){
            return (
                <View style={{flexDirection:'row',width:width,backgroundColor:'#FAF8D9'}}>
                    <View style={{flex:1, marginVertical:10, marginHorizontal: 16}}>
                        {this.state.collectBillsInfo.add_on != ''?
                            <Text style={{fontSize: 12, color: '#FEAC4C'}}>{this.state.collectBillsInfo.add_on?this.state.collectBillsInfo.add_on:''}</Text>
                            : <View />
                        }
                        {this.state.collectBillsInfo.freepostage != '' ?
                            <Text style = {{fontSize: 12,color: '#FEAC4C'}}>{this.state.collectBillsInfo.freepostage ? this.state.collectBillsInfo.freepostage : ''}</Text>
                            :<View />
                        }
                    </View>
                    <TouchableOpacity onPress={()=>{
                        if (_this.goShop) {
                            pushNavigation(_this.props.navigation.navigate,{type:'get_shopping_car'})
                        } else {
                            _this.props.navigation.pop()
                        }
                        }}>
                        <Text style={{marginVertical:10, marginHorizontal: 16,fontSize: 12, color: '#C1AD5C'}}>去购物车</Text>
                    </TouchableOpacity>
                </View>
            )
        }else if(this.priceSumInShop && this.couponCondition){
            let orderPrice = this.priceSumInShop
            let couponCondition = this.couponCondition.condition_price
            let discountedMoney = this.couponCondition.money
            let differencePrice = toDecimal(couponCondition - orderPrice)
            let hit_text = ''
            if(differencePrice > 0){
                hit_text = '满'+couponCondition+'减'+discountedMoney+'，'+'还差'+ differencePrice
            } else {
                hit_text = '已满'+couponCondition+'元，已减'+discountedMoney
            }
            return (
                <View style={{flexDirection:'row',width:width,backgroundColor:'#FAF8D9'}}>
                    <View style={{flex:1, marginVertical:10, marginHorizontal: 16}}>
                        <Text style={{fontSize: 12, color: '#FEAC4C'}}>{hit_text}</Text>
                    </View>
                    <TouchableOpacity onPress={()=>{
                        _this.props.navigation.pop()
                    }}>
                        <Text style={{marginVertical:10, marginHorizontal: 16,fontSize: 12, color: '#C1AD5C'}}>去结算</Text>
                    </TouchableOpacity>
                </View>
            )
        }else {
            return (<View/>)
        }
    }

    _renderColligation() {
        if (this.state.ColligationMenuOpen) {
            return (
                <View
                    style={{width:width,height:height-50, top:51,left:0,backgroundColor:'rgba(108,108,108,0.5)' ,position:'absolute'}}>
                    <View style={{width:width,height:80,backgroundColor:'white'}}>
                    </View>
                </View>
            )
        } else {
            return (<View/>)
        }
    }

    changeKindMenuStatus(index,priceDerection) {
        if (index==0) {
            this.categoryID = '';
            this.state.data = [];
            this.state.pageIndex = 1;
            // this.state.keyWords = '';
            this.state.sort = 'sale_count desc';
            this.state.KindMenuOpen = false
            this.state.selectCategoryItem = -1
            this._requestData();
        }
        else if(index == 2){
            this.setState({
                KindMenuOpen: !this.state.KindMenuOpen
            })
        }else {
            // this.categoryID = '';
            this.state.data = [];
            this.state.pageIndex = 1;
            // this.state.keyWords = '';
            if(priceDerection){
                this.state.sort = 'price asc';
            }else {
                this.state.sort = 'price desc';
            }
            this.state.KindMenuOpen = false
            this._requestData();
        }
    }

    _renderKindMenuList() {
        if (this.state.KindMenuOpen) {
            return (
                <TouchableOpacity
                    style={{width:width,height:height-50, top:51,left:0,backgroundColor:'rgba(108,108,108,0.5)' ,position:'absolute'}} activeOpacity={1} onPress = {()=>{this.setState({KindMenuOpen : false})}}>
                    <View style={[BaseStyles.sectionListStyle,{paddingVertical:13,backgroundColor:'#fff'}]} >
                        { this.state.shopCategorItem.map((item,index)=> {
                            let textColor = this.state.selectCategoryItem === index ? yfwGreenColor() : darkTextColor()
                            let borderColor = this.state.selectCategoryItem === index ? yfwGreenColor() : '#cccccc'
                            return(
                                <TouchableOpacity key={index} onPress={() => this._toShopGoodsCategoryMethod(item,index)} underlayColor="transparent">
                                    <View style={[styles.row2,{paddingHorizontal:15,paddingVertical:10}]}>
                                        <View style={{flex:1, height:24, borderColor:borderColor, borderWidth:1, borderRadius:12,justifyContent:'center', alignItems:'center'}}>
                                            <Text style={{fontSize:12,color:textColor,fontWeight:'500'}}>{item.name}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </TouchableOpacity>
            )
        } else {
            return (<View/>)
        }
    }

    _toShopGoodsCategoryMethod(item, index){
        this.categoryID = item.id;
        this.state.data = [];
        this.state.pageIndex = 1;
        this.state.KindMenuOpen = false;
        // this.state.keyWords = '';
        // this.state.sort=''

        if(this.state.selectCategoryItem != index) {
            this.setState({
                selectCategoryItem: index
            })
        }else {
            this.categoryID = '';
            this.setState({
                selectCategoryItem: -1
            })
        }

        this._requestData();
    }

    _renderListItem = (item) => {
        let isSettlementCallback = isNotEmpty(this.props.navigation.state.params.state.settlementCallback)
        let singleItemNumMap = this.props.navigation.state.params.state.singleItemNumMap
        if (this.state.tableStyle) {
            return (
                <YFWShopDetailGoodsListItemView
                    refresh={()=>{this._onRefresh}}
                    Data={item.item}
                    navigation={this.props.navigation}
                    addShopCarCallBack={(price, info)=>{this._refreshCollectBillsInfo(price, info)}}
                    isSettlementCallback = {isSettlementCallback}
                    singleItemNumMap = {singleItemNumMap}
                />
            );
        } else {
            return (
                <YFWGoodsItem
                    refresh={()=>{this._onRefresh}}
                    model={item.item}
                    navigation={this.props.navigation}
                    from={'all_medicine_list'}
                    addShopCarCallBack={(price, info)=>{this._refreshCollectBillsInfo(price, info)}}
                    isSettlementCallback = {isSettlementCallback}
                    singleItemNumMap = {singleItemNumMap}
                />
            )
        }

    }

    _renderFooter() {

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }


}
const styles = StyleSheet.create({

    row2: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: width / 3,
        height: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: "center",
        alignItems: "center",
    },
    row: {
        margin: 5,
        flexDirection: "column",
        backgroundColor: '#FFFFFF',
        flexWrap: "wrap",
        width: (width - 20) / 2,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },
})

