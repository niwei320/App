/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Modal,
    Text,
    View,
    Image,
    TouchableOpacity,
    FlatList, DeviceEventEmitter,NativeModules
} from 'react-native';
import YFWSearchHeader from '../../HomePage/YFWHomeSearchHeaderView'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import {iphoneTopMargin, itemAddKey, mobClick, safeObj, haslogin, kScreenHeight} from "../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {backGroundColor,yfwGreenColor,separatorColor,yfwOrangeColor,darkNomalColor,darkTextColor} from '../../Utils/YFWColor'
import YFWToast from "../../Utils/YFWToast";
import {kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";
import YFWFindYaoSubItemView from "../View/YFWFindYaoSubItemView";
import {pushNavigation,addSessionCount, doAfterLoginWithCallBack} from "../../Utils/YFWJumpRouting";
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {isNotEmpty,isEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import YFWStatusBar from '../../widget/YFWStatusBar'
import {refreshMessageRedPoint, getWinCashShareUrl} from "../../Utils/YFWInitializeRequestFunction";
import YFWRefreshHeader from '../../widget/YFWRefreshHeader'
import YFWFindYaoShopModel from "../Model/YFWFindYaoShopModel";
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView'
import {
    getItem,
    setItem,
    FindYaoPageCacheData,
    FindYaoNearCacheData
} from "../../Utils/YFWStorage";
import NavigationActions from '../../../node_modules_local/react-navigation/src/NavigationActions';
import YFWShopDetailGoodsListHeader from '../View/YFWShopDetailGoodsListHeader';
import YFWShopDetailGoodsListModel from '../Model/YFWShopDetailGoodsListModel';
import YFWShopDetailGoodsListTabMenu from '../View/YFWShopDetailGoodsListTabMenu';
import YFWNoLocationHint from '../../widget/YFWNoLocationHint';
import YFWShopDetailGoodsListItemView from '../View/YFWShopDetailGoodsListItemView';
import YFWGoodsItem from '../../widget/YFWGoodsItem';
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent';
import YFWShopDetailCategorModel from '../Model/YFWShopDetailCategorModel';
import YFWEmptyView from '../../widget/YFWEmptyView';
const {StatusBarManager} = NativeModules;

export default class YFWFindYaoController extends Component {
    constructor(props) {
        super(props)
        this.shopID = -1
        this.state = {
            showModal: false,
            showAbsoluteTop:true,
            data: [],
            shopData:[],
            loading:false,

            pageIndex: 1,
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
            isMember: YFWUserInfoManager.ShareInstance().isShopMember()
        };
        this_fy = this
        this.listener();
        this._getCacheData();
    }

    static navigationOptions = ({navigation}) => {
        let isMember = YFWUserInfoManager.ShareInstance().isShopMember()
        if (isMember) {
            return {
                tabBarVisible: true,
                translucent: false,
                headerTitle: <YFWShopDetailGoodsListHeader
                                onSerchClick={(text)=>{ this_fy.onRightTvClick(text)}}
                                placeholder="搜索店铺内商品"
                                tipsText="搜索"/>,
                headerRight: null,
                headerLeft: <View/>,
                headerStyle: Platform.OS == 'android' ? {
                    elevation: 0,
                    height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
                    paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
                } : {borderBottomWidth: 0},
                headerBackground: <Image source={require('../../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>,
            }
        }else{
            return {
                tabBarVisible: true,
                header: null,
            }
        }
    }

    listener(){
        DeviceEventEmitter.addListener('changeTabRootView', (value) => {
            this.state.isMember = value.isShopMember
            this.shopID = value.storeid
            this.props.navigation.setParams({})
            if (this.shopID != -1) {
                this._requestShopCategor()
                this._requestShopGoodsData()
            }else{
                this._requestData();
            }
        })
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                refreshMessageRedPoint()
                DeviceEventEmitter.emit('ShowInviteView',{value:true});

                getItem('sessionMap').then((data)=>{
                    if(data){
                        if(data['details']['YFWFindYaoController']){

                        }else
                        {
                            addSessionCount('YFWFindYaoController','找药');
                        }
                    }

                })

            }
        );
    }

    _getCacheData(){

        getItem(FindYaoPageCacheData).then((data)=> {

            if (isNotEmpty(data) && isNotEmpty(data.data)){

                this._handle_requestData_TCP(data.data);

            }

        });

    }

    componentWillMount(){
        this.loginListener&&this.loginListener.remove()
    }

    componentDidMount() {

        if (this.state.isMember) {
            this.loginListener = DeviceEventEmitter.addListener('UserLoginSucess',()=>{
                this._onRefresh()
            })
            DeviceEventEmitter.addListener('LoginToUserCenter',(param)=>{
                if (param == 1) {
                    const {navigate} = this.props.navigation
                    doAfterLoginWithCallBack(navigate,()=>{
                        const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
                        this.props.navigation.dispatch(resetActionTab);
                    })
                }
            })
            this.shopID = YFWUserInfoManager.ShareInstance().erpShopID;
            if (isEmpty(this.categoryID)) {
                this.categoryID = '';
            }
            //判断是否来着购物车凑单
            if (isNotEmpty(this.priceSumInShop)) {
                this._requestCollectBills(this.shopID, this.priceSumInShop);
            }
            this._requestShopCategor();
            this._requestShopGoodsData();
        }else{
            this._requestData();
            DeviceEventEmitter.addListener('LoginToUserCenter',(param)=>{
                if (param == 1) {
                    const {navigate} = this.props.navigation
                    doAfterLoginWithCallBack(navigate,()=>{
                        const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
                        this.props.navigation.dispatch(resetActionTab);
                    })
                }
            })
        }


    }

    componentWillUnmount(){
        this.didFocus.remove()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove()
        }
    }

    //@ Request
    _requestData() {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.getFindYao');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{

            this._handle_requestData_TCP(res);

            let cacheData = {type:'tcp',data:res};
            setItem(FindYaoPageCacheData,cacheData);

            if (this.refreshHeader) this.refreshHeader.endRefresh();
        },()=>{
            if (this.refreshHeader) this.refreshHeader.endRefresh();
        },isEmpty(this.state.data));

    }


    _handle_requestData_TCP(res){

        let dataDic = itemAddKey(res.result);
        let shopArray = [];
        if (isNotEmpty(dataDic.near_shop)) {
            shopArray = YFWFindYaoShopModel.getModelArray(dataDic.near_shop);
        }
        this.setState({
            data: dataDic,
            shopData:shopArray,
            loading:false,
        });

    }


    //@ Action

    _keyExtractor = (item, index) => item.key;

    showModal() {
        this.setState({
            isModal: true
        });
    }

    onRequestClose() {
        this.setState({
            isModal: false
        });
    }


    _refreshData(){

        this._requestData();

    }


    //跳转搜索页面(热门品牌)
    _toSearchMethod(item,index){
        mobClick('seek medicine-f2-adv'+(index+1));
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_search',value:item.name});
    }

    //跳转分类详情列表
    _toSubCategoryMethod(item,index){
        mobClick('seek medicine-f1-adv'+(index+1));
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_category',value:item.id,name:item.name});
    }

    //跳转分类页
    _toCategoryMethod(item,index){

        mobClick('seek medicine-adv'+(index+1));

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_all_category',index:index});
    }

    //跳转商家详情
    _toShopDetaiMethod(item){

        mobClick('seek medicine-nearby drugstore-store'+(item.index+1));
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail',value:item.id});
    }
    //分享
    onShareClick(){
        if(haslogin()){
            getWinCashShareUrl((res)=>{
                if(res&&res.result){
                    let data = res.result;
                    let param = {
                        url:data.url,
                        title : data.title,
                        content:data.desc,
                        image : data.imgsrc,
                        goneItems:[],
                        page:'home',
                        isShowHead:true
                    };
                    DeviceEventEmitter.emit('OpenShareView',param);
                }
            })
        }else{
            DeviceEventEmitter.emit('OpenShareView', {page: 'home',isShowHead:true});
        }
    }
    //跳转搜索页
    onSearchClick(){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_search'});

    }
    //扫一扫
    onSaoyisaoClick(value) {

        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: value.name, value: value.value});

    }

    //附近商家
    _nearShopMethod(){

        mobClick('seek medicine-nearby drugstore');
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_around'});
    }


    _onScroll=(event)=>{
        if(Platform.OS == 'ios'){
            let contentY = event.nativeEvent.contentOffset.y;
            this.searchHeaderView.setOffsetProps(contentY);
            if (this.refreshHeader) this.refreshHeader.onScroll(event);

        let show = (contentY >= 0);
        if (this.state.showAbsoluteTop != show){
            this.setState({
                showAbsoluteTop:show,
            });
        }
        }
    }


    //@ View
    render() {
        if (this.state.isMember) {
            return(
                <View style={[BaseStyles.container]}>
                    {/* <AndroidHeaderBottomLine/> */}
                    <YFWShopDetailGoodsListTabMenu changeKindMenuStatus={(b,d)=>this.changeKindMenuStatus(b,d)} _showTypeChange = {()=>{this._showTypeChange()}} ref={(r)=>{this.TabMenu = r}} navigation={this.props.navigation}/>
                    <YFWNoLocationHint/>
                    {this._renderCollectBillsHint()}
                    {this._renderShopGoodsList()}
                    {this._renderKindMenuList()}
                </View>
            )
        }else{
            let userInfo = YFWUserInfoManager.ShareInstance();
            let url = 'undefined';
            if(isNotEmpty(userInfo.SystemConfig)) {
                url = userInfo.SystemConfig.ads_item;
            }
            return (
                <View style={[BaseStyles.container]}>
                    <YFWStatusBar addListener={this.props.navigation.addListener}/>
                    {this._renderList()}
                    {this.renderAbsoluteHeader()}
                </View>
            );
        }

    }


    renderAbsoluteHeader(){

        if (this.state.showAbsoluteTop){
            return (
                <YFWSearchHeader ref={(m)=>{this.searchHeaderView = m}}
                                 navigation={this.props.navigation}
                                 canChangeColor={false} bgStyle={{position:'absolute'}}
                                 onShareClick={()=>{this.onShareClick()}}
                                 onSearchClick={()=>{this.onSearchClick()}}
                                 onSaoyisaoClick={(value)=>{this.onSaoyisaoClick(value)}}
                                 from={'findyao'}/>
            );
        } else {
            return (<View/>);
        }

    }

    _onSrollStart(e) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate',{value:1});
    }

    _onSrollEnd(e) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate',{value:2});
    }
    _onScrollEndDrag(e){
        if (this.refreshHeader) this.refreshHeader.beginRefresh();
    }

    onRefresh = () => {
        this.setState({
            loading: true
        });
        this._refreshData();
    }

    _renderList() {
        if (this.state.data != null ) {

            let dataArray = [{key: '分类找药', data: this.state.data.main_category},
                {key: '附近的药房', data: this.state.shopData},
                {key: '高发疾病', data: this.state.data.top_disease},
                {key: '热门品牌', data: this.state.data.top_brand}];
            if(Platform.OS == 'ios') {
                return (<FlatList
                    style={{backgroundColor:backGroundColor()}}
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={dataArray}
                    renderItem={this._renderItem.bind(this)}
                    ListHeaderComponent={this.renderHeaderComponent.bind(this)}
                    onScrollBeginDrag={this._onSrollStart.bind(this)}
                    onMomentumScrollEnd={this._onSrollEnd.bind(this)}
                    onScrollEndDrag={this._onScrollEndDrag.bind(this)}
                    onScroll={this._onScroll}
                />)
            }else{
                return (
                    <View style={{flex:1}}>
                        {this.renderHeaderComponent()}
                        <FlatList
                            style={{backgroundColor:backGroundColor(),flex:1}}
                            ref={(flatList)=>this._flatList = flatList}
                            extraData={this.state}
                            data={dataArray}
                            renderItem={this._renderItem.bind(this)}
                            onScrollBeginDrag={this._onSrollStart.bind(this)}
                            onMomentumScrollEnd={this._onSrollEnd.bind(this)}
                            onScrollEndDrag={this._onScrollEndDrag.bind(this)}
                            onScroll={this._onScroll}
                            onRefresh={this.onRefresh}
                            refreshing={this.state.loading}
                        />
                    </View>
                )
            }
        }
    }

    _renderItem = (item) => {

        return (
            <View style={[BaseStyles.container]}>
                {this.renderSectionHeader(item.item)}
                {this._renderComponent(item.item)}
            </View>
        );

    }

    _renderComponent(item){

        if (item.key == '分类找药'){
            return this._renderHeader(item.key);
        } else if(item.key == '附近的药房'){
            return this._renderNearByPharmacy(item.data);
        } else if(item.key == '高发疾病'){
            return this._renderDisease(item.data);
        } else if(item.key == '热门品牌'){
            return this._renderBrand(item.data);
        }

    }


    renderRefreshByPlatform(){
        let that = this;
        if(Platform.OS == 'ios'){
            return(<YFWRefreshHeader ref={(m)=>{this.refreshHeader = m}} toScroll={(offset)=>{
                    that._flatList.scrollToOffset({offset:offset,animated:true},1)
                    }} onRefresh={() => this._refreshData()}/>)
        }
    }


    renderHeaderComponent(){

        let that = this;
        if (this.state.showAbsoluteTop){
            let bgHeight = 30 + iphoneTopMargin();
            return (<View style={{height:bgHeight}}/>);
        } else {
            return (
                <View>
                    {this.renderRefreshByPlatform()}
                    <YFWSearchHeader ref={(m)=>{this.searchHeaderView = m}}
                                     height={100} navigation={this.props.navigation}
                                     canChangeColor={false}
                                     onShareClick={()=>{this.onShareClick()}}
                                     onSearchClick={()=>{this.onSearchClick()}}
                                     onSaoyisaoClick={(value)=>{this.onSaoyisaoClick(value)}}
                                     from={'findyao'}
                                     />
                </View>

            );
        }


    }

    renderSectionHeader(section){

        if (section.key.length > 0){
            if ("附近的药房"==section.key) {
                if (this.state.shopData.length > 0){
                    return(
                        <View style={{height:50,flex:1,backgroundColor:backGroundColor()}}>
                            <View style={{height:10}}/>
                            <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>{this._nearShopMethod()}}>
                                <View style={[BaseStyles.leftCenterView,{flex:1,justifyContent:'space-around'}]}>
                                    <View style={{marginLeft:21,flex:1,}}>
                                        <YFWTitleView title={section.key} style_title={{width:85,fontSize:15}}
                                        />
                                    </View>
                                    <Image  style={{height:15,width:15,marginRight:22}}source={require('../../../img/around_detail_icon.png')}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                } else {
                    return (<View/>);
                }

            }else if("分类找药"==section.key){
                return(
                    <View style={{height:50,flex:1,backgroundColor:backGroundColor()}}>
                        <View style={{height:10}}/>
                        <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>{this._renderCategoryMethod()}}>
                            <View style={[BaseStyles.leftCenterView,{flex:1,justifyContent:'space-around'}]}>
                                <View style={{marginLeft:21,flex:1,}}>
                                    <YFWTitleView title={section.key}
                                    />
                                </View>
                                <Image  style={{height:15,width:15,marginRight:22}}source={require('../../../img/around_detail_icon.png')}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                );
            }else {
                return(
                    <View style={{height:50,flex:1,backgroundColor:backGroundColor()}}>
                        <View style={{height:10}}/>
                        <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                            <View style={{marginLeft:21}}>
                                <YFWTitleView title={section.key}/>
                            </View>
                        </View>
                        {/* <View style={{height:0.5,backgroundColor:separatorColor()}}/> */}
                    </View>
                );
            }
        }

    }


    //药品分类
    _renderHeader() {
        if (this.state.data != null && isNotEmpty(this.state.data.main_category)) {
            let imageArray = [require('../../../img/findyao/sort_icon_zxyp.png'),require('../../../img/findyao/sort_icon_ysbj.png'),
                              require('../../../img/findyao/sort_icon_ylqx.png'),require('../../../img/findyao/sort_icon_jsyp.png'),
                              require('../../../img/findyao/sort_icon_zyyp.png'),require('../../../img/findyao/sort_icon_mrhf.png')]
            return (
                <View style={[BaseStyles.sectionListStyle,{width:kScreenWidth-30,marginLeft:15,}]}>{
                    this.state.data.main_category.map((item, i) => {
                        return (
                            <TouchableOpacity activeOpacity={1} key={i} onPress={() => this._toCategoryMethod(item,i)} underlayColor="transparent">
                                <Image style={{height:(kScreenWidth-30)/3,width:(kScreenWidth-30)/3}} source={imageArray[i]}/>

                            </TouchableOpacity>
                        );
                    })
                }
                </View>
            );
        }
    }

    _renderCategoryMethod(){
        if (this.state.data != null && isNotEmpty(this.state.data.main_category)){
            this.state.data.main_category.map((item, i) => {
                this._toCategoryMethod(item,0)
            })
        }
    }

    //附近药店
    _renderNearByPharmacy(item) {
        if (this.state.shopData.length > 0) {
            return (
                <View style={[{marginLeft:20,width:kScreenWidth-41,marginTop:8,backgroundColor:backGroundColor()}]}>
                    <FlatList
                        data={this.state.shopData}
                        extraData={this.state}
                        renderItem={({item}) => {
                            return <YFWFindYaoSubItemView Data={item} onPressDetail={this._toShopDetaiMethod.bind(this,item)}/>;
                        }}
                    />
                </View>
            );
        }
    }

    //高发疾病
    _renderDisease(info) {
        if (this.state.data != null && isNotEmpty(this.state.data.top_disease)) {
            let imageArray = [require('../../../img/findyao/sort_icon_FT.png'),require('../../../img/findyao/sort_icon_FR.png'),
                              require('../../../img/findyao/sort_icon_WY.png'),require('../../../img/findyao/sort_icon_XC.png'),
                              require('../../../img/findyao/sort_icon_GXY.png'),require('../../../img/findyao/sort_icon_TNB.png'),
                              require('../../../img/findyao/sort_icon_ZF.png'),require('../../../img/findyao/sort_icon_FSB.png'),
                              require('../../../img/findyao/sort_icon_RXA.png'),require('../../../img/findyao/sort_icon_GA.png'),
                              require('../../../img/findyao/sort_icon_TF.png'),require('../../../img/findyao/sort_icon_JZB.png')]
            return (
                <View style={[BaseStyles.sectionListStyle,{width:kScreenWidth-30,marginLeft:20}]}>{
                    this.state.data.top_disease.map((item, i) => {
                        let color = Number.parseInt(item.hot) == 1 ? yfwOrangeColor():darkNomalColor();
                        return (
                            <TouchableOpacity activeOpacity={1} key={i} onPress={() => this._toSubCategoryMethod(item,i)} underlayColor="transparent">
                                    <Image style={{
                                            width:(kScreenWidth-55)/4,
                                            height:(kScreenWidth-55)/4,
                                            marginRight:5,
                                            marginBottom:5,
                                            shadowColor: "rgba(153, 153, 153, 0.3)",
                                            shadowOffset: {
                                                width: 0,
                                                height: 6
                                            },
                                            shadowRadius: 13,
                                            shadowOpacity: 1}}
                                        source={imageArray[i]}/>
                            </TouchableOpacity>
                        );
                    })
                }
                </View>
            );
        }
    }

    //热门品牌
    _renderBrand(info) {
        if (this.state.data != null  && isNotEmpty(this.state.data.top_brand)) {
            let imageArray = [require('../../../img/findyao/sort_icon_YNBY.png'),require('../../../img/findyao/sort_icon_RH.png'),
                              require('../../../img/findyao/sort_icon_TRT.png'),require('../../../img/findyao/sort_icon_999.png'),
                              require('../../../img/findyao/sort_icon_BYS.png'),require('../../../img/findyao/sort_icon_YST.png'),
                              require('../../../img/findyao/sort_icon_TCBJ.png'),require('../../../img/findyao/sort_icon_TT.png'),
                              require('../../../img/findyao/sort_icon_PZH.png'),require('../../../img/findyao/sort_icon_SC.png'),
                              require('../../../img/findyao/sort_icon_HSY.png'),require('../../../img/findyao/sort_icon_QS.png')]
            return (
                <View style={[BaseStyles.sectionListStyle,{width:kScreenWidth-18,marginLeft:21,}]}>
                    {
                        this.state.data.top_brand.map((item, i) => {
                            return (
                                <TouchableOpacity activeOpacity={1} key={i} onPress={() => this._toSearchMethod(item,i)} underlayColor="transparent">
                                    <Image style={{height:(kScreenWidth-114)/4,width:(kScreenWidth-114)/4,marginRight:24,marginBottom:14}} source={imageArray[i]}/>
                                </TouchableOpacity>
                            );
                        })
                    }
                    <View style={{backgroundColor:backGroundColor(),height:10,width:kScreenWidth}}/>
                </View>
            );
        }
    }


    /***************************************************全部商品***************************************************************** */

    onRightTvClick = (text) => {
        this.categoryID = '';
        this.state.data = [];
        this.state.pageIndex = 1;
        this.state.KindMenuOpen = false;
        this.state.keyWords = text;
        this.TabMenu&&this.TabMenu.changeSelectedTabItem();
        this.setState({})
        this._requestShopGoodsData()
    }

    //请求包邮满减信息
    _requestCollectBills(shop_id,sum){
        let that = this
        let paramMap = new Map();
        paramMap.set('__cmd','person.cart.getFreepostageAndActivityInfo');
        paramMap.set('storeid',shop_id);
        paramMap.set('price',sum);
        let viewModel = new YFWRequestViewModel();
        DeviceEventEmitter.emit('LoadProgressShow')
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
        },(error)=>{},false);
    }

    //添加购物车成功, 刷新包邮满减信息
    _refreshCollectBillsInfo(price){
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

    _requestShopGoodsData() {
        if (this.shopID == -1){
            return
        }
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

    _onRefresh() {

        this.state.pageIndex = 1;
        this.setState({
            loading: true
        });
        this._requestShopGoodsData();

    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this._requestShopGoodsData();
    }

    _renderShopGoodsList(){
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
                <View style={{flexDirection:'row',width:kScreenWidth,backgroundColor:'#FAF8D9'}}>
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
                    <TouchableOpacity onPress={()=>_this.props.navigation.pop()}>
                        <Text style={{marginVertical:10, marginHorizontal: 16,fontSize: 12, color: '#C1AD5C'}}>去购物车</Text>
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
                    style={{width:kScreenWidth,height:kScreenHeight-50, top:51,left:0,backgroundColor:'rgba(108,108,108,0.5)' ,position:'absolute'}}>
                    <View style={{width:kScreenWidth,height:80,backgroundColor:'white'}}>
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
            this._requestShopGoodsData();
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
            this._requestShopGoodsData();
        }
    }

    _renderKindMenuList() {
        if (this.state.KindMenuOpen) {
            return (
                <TouchableOpacity
                    style={{width:kScreenWidth,height:kScreenHeight-50, top:51,left:0,backgroundColor:'rgba(108,108,108,0.5)' ,position:'absolute'}} activeOpacity={1} onPress = {()=>{this.setState({KindMenuOpen : false})}}>
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

        this._requestShopGoodsData();
    }

    _renderListItem = (item) => {

        if (this.state.tableStyle) {
            return (
                <YFWShopDetailGoodsListItemView refresh={()=>{this._onRefresh}} Data={item.item} navigation={this.props.navigation} addShopCarCallBack={(price)=>{this._refreshCollectBillsInfo(price)}}/>
            );
        } else {
            return (
                <YFWGoodsItem refresh={()=>{this._onRefresh}} model={item.item} navigation={this.props.navigation} from={'all_medicine_list'} addShopCarCallBack={(price)=>{this._refreshCollectBillsInfo(price)}}/>
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
        width: kScreenWidth / 3,
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
        width: (kScreenWidth - 20) / 2,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },


});


