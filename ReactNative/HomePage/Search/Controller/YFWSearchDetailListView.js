import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    Text,
    Image, Alert, SwipeableFlatList, ScrollView,
    NativeModules,DeviceEventEmitter
} from 'react-native';
import {
    itemAddKey,
    kScreenWidth,
    safe,
    isEmpty,
    darkStatusBar,
    safeObj,
    isNotEmpty,
    iphoneBottomMargin,
    kScreenHeight,
    isAndroid,
    tcpImage,
    safeArray
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel'
import YFWFilterBoxModal from '../../../PublicModule/Widge/YFWFilterBoxModal'
import YFWSubCategoryMenuView from '../../../FindYao/View/YFWSubCategoryMenuView'
import YFWSubCategoryItemView from '../../../FindYao/View/YFWSubCategoryItemView'
import YFWSubCategoryCollectionItemView from '../../../FindYao/View/YFWSubCategoryCollectionItemView'
import YFWSearchDetailListShopItemView from '../View/YFWSearchDetailListShopItemView'
import YFWEmptyView from '../../../widget/YFWEmptyView'
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent'
import StatusView from "../../../widget/StatusView";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {separatorColor,backGroundColor,yfwGreenColor} from "../../../Utils/YFWColor";
import {setItem} from "../../../Utils/YFWStorage"
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";
import YFWShopDetailGoodsListModel from "../../../FindYao/Model/YFWShopDetailGoodsListModel";
import YFWToast from '../../../Utils/YFWToast'
import {doAfterLogin, pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWSeacrchShopModel from '../Model/YFWSeacrchShopModel'
import SerchResultTopVisitMedicineModle from '../Model/SerchResultTopVisitMedicineModle'
import YFWPrestrainCacheManager, { kSearchListDataKey } from '../../../Utils/YFWPrestrainCacheManager';
import YFWTitleView from "../../../PublicModule/Widge/YFWTitleView";
import YFWSearchShopResultCell from '../View/YFWSearchShopResultCell'
import {WaterfallList} from 'react-native-largelist-v3'
import {ChineseWithLastDateFooter, ChineseWithLastDateHeader}  from "react-native-spring-scrollview/Customize";
import YFWNoLocationHint from '../../../widget/YFWNoLocationHint'
import { SwipeListView } from 'react-native-swipe-list-view';
import YFWAdNotificationTip from '../../../widget/YFWAdNotificationTip';
import LinearGradient from 'react-native-linear-gradient'
import FastImage from 'react-native-fast-image';

export default class YFWSearchDetailListView extends Component {


    static defaultProps = {
        keyWords:'',
        type:'goods',
        shop_id:'',
    }

    constructor(props, context) {

        super(props, context);
        this.state = {
            orderby:'',
            data: [],
            associationGoodsOrShopsData:[],
            pageIndex:1,
            loading:false,
            showFoot:2,
            tableStyle:true,
            filterParam:undefined,
            filterParamJson:{},
            sort:'',
            sorttype:'',
            showType:'',
            sectionListData:[],
            showTop:true,
            shopCarNum:new YFWUserInfoManager().shopCarNum + '',
            scrollPageIndex:1,
        }
        this.state.tableStyle = YFWUserInfoManager.ShareInstance().tableStyle
        this.allPage = 1
        this.standardColors = ['#999','#a5953e','#2f779d',]
    }

    componentDidMount() {
        darkStatusBar();
        if(isNotEmpty(this.props.keyWordsStandard)){  //若有规格信息，修改筛选数据
            let standard = this.props.keyWordsStandard
            if(isNotEmpty(standard)){
                let param = new Map();
                param.set('standard',standard)
                let paramJson = {
                    selectName: [],
                    selectForm: [],
                    selectStand: [standard],
                    selectProduce: [],
                };
                DeviceEventEmitter.emit('kStandardChange',paramJson.selectStand)
                this._setFilter(param, paramJson)
            }
        }
        this._handleData(this.props.keyWords);
        this.didFocus = this.props.navigation.addListener('didFocus',(playLoad)=>{
            if (YFWPrestrainCacheManager.sharedManager().type != kSearchListDataKey) {
                YFWPrestrainCacheManager.sharedManager().changeType(kSearchListDataKey)
            }
        })
        this.carNumChangeListener = DeviceEventEmitter.addListener('SHOPCAR_NUMTIPS_RED_POINT',(value)=>{
            this.setState({shopCarNum:value})
        })
    }

    componentWillUnmount(){
        this.didFocus.remove()
        YFWPrestrainCacheManager.sharedManager().clearCachedInfos()
        this.carNumChangeListener&&this.carNumChangeListener.remove()
    }

    componentWillReceiveProps(nextProps){

        if (nextProps.resetFilter) {
            this._resetFilter()
        }

    }

    _resetFilter(){
        this.state.filterParamJson = {};
        this.state.filterParam = undefined;
    }

    _setFilter(filterParam, filterParamJson){
        this.state.filterParamJson = filterParamJson;
        this.state.filterParam = filterParam;
    }

    //@ Request

    _requestHandleData(keyWords) {
        this.state.pageIndex = 1;
        this._handleData(keyWords);
    }

    _handleData(keyWords, type) {
        if (isNotEmpty(this.props.shop_id)) {

            this._requestShopGoodsData(keyWords);

        } else {
            if (type == 'click') {
                this.state.pageIndex = 1;
            }

            if (this.props.type === 'goods'){
                this._requestGoodsData(keyWords);
            } else {
                this._requestShopData(keyWords);
            }

        }

    }

    _requestGoodsData(keyWords) {
        this.keyWords = keyWords;
            let paramMap = new Map();
            this._formatOrderBy(this.state.orderby);
            paramMap.set('__cmd', 'guest.medicine.getSearchPageData');
            paramMap.set("ip",YFWUserInfoManager.ShareInstance().deviceIp)//设备IP
            paramMap.set('pageIndex', this.state.pageIndex);
            paramMap.set('orderBy', this.state.sort);
            paramMap.set('pageSize', 10);
            paramMap.set('keywords',keyWords);
            paramMap.set('version',safe(YFWUserInfoManager.ShareInstance().version));
            paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
            paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
            if (isNotEmpty(this.state.filterParam)){
                for (let [k,v] of this.state.filterParam) {
                    paramMap.set(k,v);
                }
            }
            paramMap.set('orderby_type','standard_orderby')
            this.tcp_requestViewModel(paramMap);
            DeviceEventEmitter.emit('kSearchTextChange',keyWords)
    }

    _formatOrderBy(orderby) {
        switch (orderby){
            case 'priceasc':
                this.state.sort = 'price asc';
                break
            case 'pricedesc':
                this.state.sort = 'price desc';
                break
            case 'shopcountasc':
                this.state.sort = 'shopCount asc';
                break
            case 'shopcoundesc':
                this.state.sort = 'shopCount desc';
                break
            default:
                this.state.sort = '';
                this.state.sorttype = '';
                break
        }
    }

    _requestShopData(keyWords) {
        this.keyWords = keyWords;
        // 搜索商家
            let user =  YFWUserInfoManager.ShareInstance();
            let paramMap = new Map();
            // paramMap.set('__cmd', 'guest.common.app.getNearShop');
            paramMap.set('__cmd', 'guest.common.app.getSearchShop');
            paramMap.set('keywords', safe(keyWords));
            // paramMap.set('lat', safe(user.latitude));
            // paramMap.set('lon', safe(user.longitude));
            paramMap.set('pageSize', 10);
            paramMap.set('pageIndex', this.state.pageIndex);
            paramMap.set('shoptype', 0);
            paramMap.set('regionid', 0);
            // paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
            // paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap , (res)=>{
                this.statusView&&this.statusView.dismiss();
                let showFoot = 0;
                let responseArray = YFWSeacrchShopModel.getModelArray(res.result.dataList);

                if(this.state.pageIndex === 1 && responseArray.length === 0){
                    // 第一次搜索商家无数据
                    this._requestAssociationGoodsOrShopsData();
                    return;
                }

                if(responseArray.length < 10){
                    showFoot = 1;
                }

                responseArray = itemAddKey(responseArray, this.state.pageIndex.toString());

                this.setState({
                    data: this.state.pageIndex === 1 ? responseArray : this.state.data.concat(responseArray),
                    associationGoodsOrShopsData:[],
                    loading:false,
                    showFoot:showFoot,
                });
            },
                (error)=>{
                    this.statusView&&this.statusView.dismiss();
                    if(error&&error.msg){
                        YFWToast(error.msg)
                    }

                },false)

    }


    _requestShopGoodsData(keyWords){

        this.keyWords = keyWords;

            let paramMap = new Map();
            this._formatOrderBy(this.state.orderby);
            paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineSearch');
            paramMap.set('pageIndex', this.state.pageIndex);
            paramMap.set('pageSize', 10);
            paramMap.set("keywords", keyWords);
            paramMap.set('orderField', this.state.sort);
            paramMap.set("storeid", this.props.shop_id);
            paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
            paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
            this.tcp_requestViewModel(paramMap);

    }

    _requestAssociationGoodsOrShopsData(){
        if (isNotEmpty(this.props.shop_id)){


        } else {
                if(this.props.type === 'goods'){
                    let paramMap = new Map();
                    paramMap.set('__cmd','guest.medicine.getTopVisitMedicine');
                    paramMap.set('limit',6);
                    this._requestAssociationGoodsOrShopsViewModel_tcp(paramMap,true)
                }else {
                    let user =  YFWUserInfoManager.ShareInstance();
                    let paramMap = new Map();
                    paramMap.set('__cmd', 'guest.common.app.getNearShop');
                    paramMap.set('lat', safe(user.latitude));
                    paramMap.set('lon', safe(user.longitude));
                    paramMap.set('pageSize', 10);
                    paramMap.set('pageIndex', 1);
                    let viewModel = new YFWRequestViewModel();
                    viewModel.TCPRequest(paramMap , (res)=>{
                        this.statusView&&this.statusView.dismiss();
                        let showFoot = 0;
                        let responseArray = YFWSeacrchShopModel.getModelArray(res.result.dataList);
                        responseArray = itemAddKey(responseArray);
                        this.setState({
                            associationGoodsOrShopsData:responseArray,
                            data:[],
                            pageIndex:1,
                            loading:false,
                            showFoot:0,
                        });
                    },(error)=>{
                        this.statusView&& this.statusView.showNetError();
                        this.setState({
                            loading:false,
                            showFoot:0,
                        });
                    },false)
                }

        }

    }
    _requestAssociationGoodsOrShopsViewModel_tcp(paramMap,isGoods){
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            this.statusView&& this.statusView.dismiss();
            let dataArray = SerchResultTopVisitMedicineModle.getModelArray(res.result);
            dataArray = itemAddKey(dataArray);
            let newStyle = isGoods?true:this.state.tableStyle;
            this.setState({
                associationGoodsOrShopsData:dataArray,
                data:[],
                pageIndex:1,
                loading:false,
                showFoot:0,
                tableStyle:newStyle,
            });

        },(error)=>{
            this.statusView&& this.statusView.showNetError();
            this.setState({
                loading:false,
                showFoot:0,
            });
        },false)
    }


    tcp_requestViewModel(paramMap){

        let viewModel = new YFWRequestViewModel();

        viewModel.TCPRequest(paramMap , (res)=>{
            console.log(res)
            this.statusView&&this.statusView.dismiss();
            let showFoot = 0;
            if(this.state.pageIndex == 1 && isEmpty(res.result)){

                return
            }
            let isStandardType = safeObj(res.result.exact_query) == 1
            let dataArray = YFWShopDetailGoodsListModel.getModelArray(res.result.dataList,isStandardType);
            this.fetchPrestrainGoodsData(dataArray)

            if (dataArray.length === 0){
                showFoot = 1;
            }
            if (this.state.pageIndex > 1){

                dataArray = this.state.data.concat(dataArray);

            } else {
                if (dataArray.length == 0 ) {
                    this._requestAssociationGoodsOrShopsData();
                }
            }
            dataArray = itemAddKey(dataArray);
            let newSectionListArray = []
            let standardSets = new Set()
            let currentColorIndex = 0
            let imageSources = dataArray.map((info,index)=>{
                let sectionKey = info.name_cn+info.standard
                if(standardSets.has(sectionKey)) {
                    let saveIndex = 0
                    let have = newSectionListArray.some((item,index)=>{
                        let has = item.sectionKey == sectionKey
                        if (has) {
                            saveIndex = index
                        }
                        return has
                    })
                    if (have) {
                        this._dealStandardColor(isStandardType,info,currentColorIndex)
                        newSectionListArray[saveIndex].data&&newSectionListArray[saveIndex].data.push(info)
                    } else {
                        currentColorIndex++
                        this._dealStandardColor(isStandardType,info,currentColorIndex)
                        newSectionListArray.push(
                            {title:info.standard,sectionKey:sectionKey,data:[info]}
                        )
                    }
                } else {
                    newSectionListArray.push(
                        {title:info.standard,sectionKey:sectionKey,data:[info]}
                    )
                    currentColorIndex++
                    this._dealStandardColor(isStandardType,info,currentColorIndex)
                }
                standardSets.add(sectionKey)
                let goodsImageUrl = info.intro_image?tcpImage(info.intro_image):tcpImage(info.img_url)
                return {uri:goodsImageUrl}
            })
            FastImage.preload(imageSources)
            let allListCount = parseInt(res.result.rowCount)
            if (showFoot == 1) {
                allListCount = dataArray.length
            }
            if (isNaN(allListCount)) {
                allListCount = 0
            }
            let allPage = parseInt(allListCount/10)
            if (allPage == 0 || allListCount%10 > 0) {
                allPage += 1
            }
            this.allPage = allPage

            this.setState({
                showType:isStandardType?'section':'',
                sectionListData:newSectionListArray,
                data:dataArray,
                associationGoodsOrShopsData:[],
                loading:false,
                showFoot:showFoot,
            });
            console.log('endRef')
            this._waterListEndLoding()
        },(error)=>{
            this.statusView&&this.statusView.showNetError();
            this.setState({
                loading:false,
                showFoot:0,
            });
            this._waterListEndLoding()
        },false);
    }

    _dealStandardColor(isStandardType,info,currentColorIndex) {
        if (isStandardType && isEmpty(info.standardColor)) {
            info.standardColor = this.standardColors[currentColorIndex%this.standardColors.length]
        }
    }

    _waterListEndLoding() {
        if(this._waterList){
            this._waterList.endRefresh();
            this._waterList.endLoading();
        }
    }

    //预加载
    fetchPrestrainGoodsData(dataList){
        if (YFWPrestrainCacheManager.sharedManager().type != kSearchListDataKey) {
            YFWPrestrainCacheManager.sharedManager().changeType(kSearchListDataKey)
        }
        YFWPrestrainCacheManager.sharedManager().cachedNewDatasWithList(dataList)
    }

    addGoodsToSameShop(goodsId){
        const {navigate} = this.props.navigation;
            doAfterLogin(navigate,()=>{
                this.addGoodsToSameShop_Tcp(goodsId)
            });

    }
    addGoodsToSameShop_Tcp(goodsId) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.sameStore.addSameStore');
        paramMap.set('medicineid', goodsId);
        paramMap.set('qty', '1');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if (res.code == '1') {
                YFWToast(safeObj(res.result).msg)
                //刷新数据源
            }
        },(error)=>{
            //消息已经在errorConfig里面弹了
            Alert.alert('提示',safeObj(error.msg),[{
                text:'继续浏览',
                onPress:()=>{},
            },{
                text:'前往查看',
                onPress:()=>{pushNavigation(this.props.navigation.navigate,{type:'get_goods_detail',value:goodsId,showSameShop:true})},
            }],{
                cancelable: false
            });
        })
    }




    //@ Action

    closeControlPanel() {
        this._filter && this._filter.closeView();
    };

    openControlPanel() {
        this._filter && this._filter.showView();
    };

    _showTypeChange(){
        YFWUserInfoManager.ShareInstance().tableStyle = !this.state.tableStyle
        setItem('CategoryTableStyle',!this.state.tableStyle?'table':'collection')
        this.listViewH = null;
        this.setState({
            tableStyle:!this.state.tableStyle,
            showTop:false
        });
    }

    _refreshData(type){
        this.state.orderby = type;
        this._onRefresh();
    }

    _onRefresh(){
        console.log('beginRef')
        this.state.pageIndex = 1;
        this.setState({
            loading:true
        });
        this._handleData(this.keyWords);

    }

    _onEndReached(){

        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this._handleData(this.keyWords);

    }

    _filterBackMethod(param,paramJson){

        this.state.filterParam = param;
        this.state.filterParamJson = paramJson;
        DeviceEventEmitter.emit('kStandardChange',paramJson.selectStand)
        this._onRefresh();
        this.closeControlPanel();
    }


    _addSameShopCar(item){
        if (item.isCanSale) {
            Alert.alert('是否加入同店购','',[{
                text:'否',
                onPress:()=>{},
            },{
                text:'是',
                onPress:()=>{this.addGoodsToSameShop(item.goods_id)},
            }],{
                cancelable: false
            });
        }

    }


    //@ View

    render(){

        return (
            <View style={[BaseStyles.container]}>
                {this.renderRoot()}
                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{
                    this.setState({pageIndex:1});
                    this._handleData(this.props.keyWords);
                }}/>
            </View>
        );

    }

    renderRoot() {

        if (this.state.associationGoodsOrShopsData.length > 0) {
            return (
                this._renderAnotherList()
            );
        } else {
            return (
                <View style={[BaseStyles.container]}>
                    {this._renderContent()}
                    {this._renderTopMenu()}
                    {this._renderList()}
                    {this._renderIndicatorView()}
                </View>
            );
        }


    }

    //筛选框
    _renderContent() {

        return (
            <YFWFilterBoxModal ref={(filter)=>this._filter = filter}
                              keywords={this.keyWords}  paramJson={this.state.filterParamJson}
                              saveMethod={(param,paramJson)=>this._filterBackMethod(param,paramJson)}
            from = {'YFWSearchDetailListView'}/>
        );

    }

    //菜单栏
    _renderTopMenu() {

        if (isNotEmpty(this.props.shop_id)){

            return (
                <View>
                    <YFWSubCategoryMenuView hasScreening={false}
                                            tableStyle={this.state.tableStyle}
                                            refreshData={(type)=>this._refreshData(type)}
                                            onShowTypeChange={()=>this._showTypeChange()}/>
                    <YFWNoLocationHint/>
                </View>

            );

        } else {

            if (this.props.type === 'goods') {
                return (
                    <View style={{zIndex:10}}>
                        {/* {this.state.showType == 'section'?<YFWAdNotificationTip info={{content:'根据国家药监局规定，查阅处方药销售信息，需先开电子处方。'}} textStyle={{fontSize:12,color:'#feac4c'}} navigation={this.props.navigation}/>:null} */}
                        <YFWSubCategoryMenuView hasPriceCount={true}
                                                showType={this.state.showType}
                                                tableStyle={this.state.tableStyle}
                                                refreshData={(type)=>this._refreshData(type)}
                                                onShowTypeChange={()=>this._showTypeChange()}
                                                onScreen={()=>{this.openControlPanel()}}
                                                standardChange={(standards)=>{this._standardChangeAction(standards)}}
                                                />
                        <YFWNoLocationHint/>
                    </View>

                );
            }else {
                return(
                    <View style={{position:'absolute', zIndex:10}}>
                        <YFWNoLocationHint/>
                    </View>
                )
            }

        }

    }


    //数据列表
    _renderList() {

        if (this.state.data.length > 0) {

            let numColumns = this.state.tableStyle?1:2;
            let key = this.state.tableStyle?'table':'collection';
            let backgroundColor = 'white'
            if (this.props.type === 'goods' && !this.state.tableStyle){
                backgroundColor = backGroundColor();
            }

            if (this.props.type === 'goods'){
                if(this.state.tableStyle) {
                    // if (this.state.showType == 'section') {
                    //     return (
                    //         <SwipeListView
                    //             useSectionList
                    //             stickySectionHeadersEnabled={false}
                    //             sections={this.state.sectionListData}
                    //             renderItem={this._renderListItem.bind(this)}
                    //             renderHiddenItem={this._renderQuickActions.bind(this)}
                    //             renderSectionHeader={({ section }) => (
                    //                 <View style={{paddingVertical:21,paddingHorizontal:19,backgroundColor:'white',flexDirection:'row',alignItems:'center'}}>
                    //                     <View style={{width: 3,height: 14,backgroundColor: "#1fdb9b"}}></View>
                    //                     <Text style={{marginLeft:8,fontSize: 12,color: "#1fdb9b",fontWeight:'500'}}>{'规格:'+section.title}</Text>
                    //                 </View>
                    //             )}
                    //             leftOpenValue={0}
                    //             rightOpenValue={-100}
                    //             ListFooterComponent={this._renderFooter.bind(this)}
                    //             onEndReached={this._onEndReached.bind(this)}
                    //             onEndReachedThreshold={0.1}
                    //             onRefresh={() => this._onRefresh()}
                    //             refreshing={this.state.loading}
                    //             keyboardShouldPersistTaps={'always'}
                    //             onScrollBeginDrag={(event)=>this.props._onSrollStart&&this.props._onSrollStart(event)}
                    //             onMomentumScrollEnd={(event)=>this.props._onSrollEnd&&this.props._onSrollEnd(event)}
                    //             onScroll={(event)=>this.props._onScroll&&this.props._onScroll(event)}
                    //         />
                    //     )
                    // }
                    return (
                        <SwipeableFlatList
                            ref={(m)=>{this.swipeList = m}}
                            data={this.state.data}
                            extraData={this.state}
                            renderItem = {this._renderListItem.bind(this)}
                            ListFooterComponent={this._renderFooter.bind(this)}
                            onEndReached={this._onEndReached.bind(this)}
                            onEndReachedThreshold={0.1}
                            onRefresh={() => this._onRefresh()}
                            refreshing={this.state.loading}
                            bounceFirstRowOnMount={false}
                            maxSwipeDistance={100}
                            renderQuickActions={this._renderQuickActions.bind(this)}
                            removeClippedSubviews={true}
                            keyboardShouldPersistTaps={'always'}
                            onScrollBeginDrag={(event)=>{this._dealOnScrollBeginDrag(event)}}
                            onMomentumScrollEnd={(event)=>{this._dealOnMomentumScrollEnd(event)}}
                            onScroll={(event)=>{this._dealOnScroll(event)}}
                        />
                    );
                }else {
                    return(
                        <View style={{backgroundColor:'white',flex:1,paddingLeft:5}}>
                            <WaterfallList
                                ref={(water) => this._waterList=water}
                                style={{flex:1,width:kScreenWidth-10}}
                                data={this.state.data}
                                numColumns={2}
                                renderItem={this._renderMedicineCollectionItem.bind(this)}
                                heightForItem={this._getMedicineCollectionItemHeight.bind(this)}
                                onRefresh={() => {this._onRefresh()}}
                                allLoaded={this.state.showFoot != 0}
                                refreshHeader={ChineseWithLastDateHeader}
                                loadingFooter={ChineseWithLastDateFooter}
                                onLoading={() => {this._onEndReached()}}
                                keyboardShouldPersistTaps={'always'}
                                onScrollBeginDrag={(event)=>{this._dealOnScrollBeginDrag(event)}}
                                onMomentumScrollEnd={(event)=>{this._dealOnMomentumScrollEnd(event)}}
                                onScroll={(event)=>{this._dealOnScroll(event)}}
                            />
                        </View>
                    )
                }
            } else {
                return (
                    <View style={[BaseStyles.container,{backgroundColor:'white'}]}>
                        { this.props.type === 'goods' ? <View/> : this._renderShopTopBackgroundView()}
                        <FlatList
                            ref={(flatList)=>this._flatList = flatList}
                            style={{position: 'absolute', left:8,right:0,top:0,bottom:0}}
                            extraData={this.state}
                            data={this.state.data}
                            numColumns={this.props.type === 'goods' ? numColumns : 1}
                            key={key}
                            onRefresh={() => this._onRefresh()}
                            refreshing={this.state.loading}
                            renderItem = {this._renderListItem.bind(this)}
                            ListFooterComponent={this._renderFooter.bind(this)}
                            onEndReached={this._onEndReached.bind(this)}
                            onEndReachedThreshold={0.1}
                            onScroll={(e) => this._flatListScroll(e)}
                            onScrollBeginDrag={(e) => this._flatListScrollStart(e)}
                            keyboardShouldPersistTaps={'always'}
                        />
                    </View>
                );
            }
        } else if (isNotEmpty(this.props.shop_id) && this.props.type == 'goods' && this.state.data.length == 0) {
            return (
                <View style={[BaseStyles.centerItem,BaseStyles.radiusShadow,{height:260,borderRadius: 7,flexDirection:'column', justifyContent:'flex-start',backgroundColor:'white'}]}>
                    <Image style={{height:81,width:132, marginTop:27}} source={require('../../../../img/ic_no_goods_shops.png')} />
                    <Text style={ {textAlign :'center',color:'#999',fontSize: 13,marginTop:20}} >{'抱歉,没有找到商品哦~'}</Text>
                </View>
            )
        }

    }
    //推荐列表
    _renderAnotherList() {
        let topM = this.props.type == 'goods' ? 50 : 0;
        //只有商品搜索支持两种cell显示方式
        let numColumns = !this.props.type === 'goods'||this.state.tableStyle?1:2;
        let key = !this.props.type === 'goods'||this.state.tableStyle?'table':'collection';
        return (
            <View style={[BaseStyles.container]}>
                {this.props.type == 'goods'? this._renderContent(): this._renderShopTopBackgroundView()}
                {this.props.type == 'goods'? this._renderTopMenu(): <View style={{position:'absolute',zIndex:10}}><YFWNoLocationHint/></View>}
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    style={this.props.type == 'goods'?{flex:1}:{position: 'absolute', left:!this.state.tableStyle?5:0,right:!this.state.tableStyle?5:0,top:topM,bottom:0}}
                    // style={{position: 'absolute', left:!this.state.tableStyle?5:0,right:!this.state.tableStyle?5:0,top:topM,bottom:0}}
                    extraData={this.state}
                    data={this.state.associationGoodsOrShopsData}
                    numColumns={this.props.type === 'goods' ? numColumns : 1}
                    key={key}
                    renderItem = {this._renderListItem.bind(this)}
                    ListHeaderComponent = {this._renderListHeader.bind(this)}
                    onScroll = {(e) => this._flatListScroll(e)}
                    onScrollBeginDrag = {(e) => this._flatListScrollStart(e)}
                    keyboardShouldPersistTaps={'always'}
                />
            </View>
        )
    }

    _renderListHeader() {
        let numColumns = !this.props.type === 'goods'||this.state.tableStyle?1:2;
        let raiusBackgrounColor = this.props.type === 'goods' && numColumns === 1? 'white' : backGroundColor()
        let headerHeight = this.props.type === 'goods' && numColumns === 1 ? 50 : 45

        return(
            <View>
                {this._renderTopTipVuew()}
                <View style={{marginLeft:10,marginTop:10,width:kScreenWidth,height:headerHeight, justifyContent:'center'}}>
                    <YFWTitleView title={this.props.type == 'goods'?'热门搜索':'相关商家'}/>
                    <View style={{backgroundColor: raiusBackgrounColor, width: kScreenWidth, height:7, marginLeft:-10, borderTopLeftRadius:7,borderTopRightRadius:7}}></View>
                </View>
            </View>
        )
    }

    _renderTopTipVuew(){
        if (this.props.type == 'goods') {
            return (
                <View style={[BaseStyles.centerItem,BaseStyles.radiusShadow,{height:260,borderRadius: 7,flexDirection:'column', justifyContent:'flex-start',backgroundColor:'white'}]}>
                    <Image style={{height:81,width:132, marginTop:27}} source={require('../../../../img/ic_no_goods_shops.png')} />
                    <Text style={ {textAlign :'center',color:'#999',fontSize: 13,marginTop:20}} >{'抱歉,没有找到商品哦~'}</Text>
                </View>

            )
        } else if (!isNotEmpty(this.props.shop_id)) {
            return (
                <View style={[BaseStyles.centerItem,styles.RadiusShadow,{marginHorizontal:10 ,height:260/375*kScreenWidth, borderRadius: 7, backgroundColor:'white'}]}>
                    <Image style={{height:81,width:132}} source={require('../../../../img/ic_no_goods_shops.png')} />
                    <Text style={ {textAlign :'center',color:'#999',fontSize: 13,marginTop:20}} >{'抱歉，没有找到商家哦~'}</Text>
                </View>
            )
        }
    }

    _renderShopTopBackgroundView() {
        return <Image source={require('../../../../img/Status_bar.png')}  ref={(e)=>{this.topView=e}} style={{width:kScreenWidth,height:25,resizeMode:'stretch'}}/>
    }

    _getMedicineCollectionItemHeight(item, index) {
        return item.itemHeight
    }

    _renderMedicineCollectionItem(item) {
        return(
            <YFWSubCategoryCollectionItemView
                    from={'search'} Data={item}
                    isStandardType={this.state.showType == 'section'}
                    shop_id={this.props.shop_id}
                    isShopMember={this.props.isShopMember}
                    navigation={this.props.navigation} onLongPress={()=>{this._addSameShopCar(item)}}/>
        )
    }

    _renderListItem = (item) => {

        item.item.index = item.index;
        if (this.props.type === 'goods'){
            if (this.state.tableStyle){
                return(
                    <YFWSubCategoryItemView accessibilityLabel={'medicine_'+item.index} from={'search'} isStandardType={this.state.showType == 'section'} Data={item.item} shop_id={this.props.shop_id} isShopMember={this.props.isShopMember} navigation={this.props.navigation}/>
                );
            } else{
                return(
                    <YFWSubCategoryCollectionItemView accessibilityLabel={'medicine_'+item.index} from={'search'} Data={item.item}
                                                    isStandardType={this.state.showType == 'section'}
                                                      shop_id={this.props.shop_id}
                                                      isShopMember={this.props.isShopMember}
                                                      navigation={this.props.navigation} onLongPress={()=>{this._addSameShopCar(item.item)}}/>
                )
            }

        } else{

            // return (<YFWSearchDetailListShopItemView Data={item.item} navigation={this.props.navigation} />);
            return (<YFWSearchShopResultCell model={item.item} navigation={this.props.navigation}/>)
        }

    }

    _renderQuickActions=(item)=> {
        return (
            <View style={styles.quickAContent}>
                <TouchableOpacity  style={[styles.quick,{backgroundColor:item.item.isCanSale?yfwGreenColor():'#ccc'}]} onPress={()=>{
                    // this.swipeList.safeCloseOpenRow();
                    item.item.isCanSale&&this.addGoodsToSameShop(item.item.goods_id);
                }}>
                    <Text style={{color:"white",textAlign:'center',fontSize:15,fontWeight:'bold'}}>加入同店购</Text>
                </TouchableOpacity>
            </View>
        )
    }

    _renderFooter(){

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

    _renderIndicatorView() {
        if (this.state.showType == 'section') {
            return (
                <View style={{position:'absolute',right:13,paddingVertical:10,bottom:iphoneBottomMargin()+90}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this._gotoShopcar()}} style={{...styles.circleShadowStyle}}>
                        <LinearGradient colors={['rgb(0,200,145)','rgb(31,219,155)']}
                                            start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                                            locations={[0,1]}
                                            style={{...styles.circleBtnStyle}}>
                                            <Image style={{width:23,height:23,tintColor:'white'}} source={require('../../../../img/md_btn4.png')}></Image>

                        </LinearGradient>
                        {this._renderCarNumber()}
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this._scrollToTopAction()}} style={{marginTop:23,...styles.circleShadowStyle}}>
                        <LinearGradient colors={['rgb(0,200,145)','rgb(31,219,155)']}
                                            start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                                            locations={[0,1]}
                                            style={{...styles.circleBtnStyle}}>
                                            {
                                                this.state.showTop&&this.state.scrollPageIndex>1?
                                                <View>
                                                    <Image style={{width:22,height:10,transform:[{rotate:'-180deg'}],tintColor:'white'}} source={require('../../../../img/icon_arrow_down.png')} ></Image>
                                                </View>:
                                                <View style={{...BaseStyles.centerItem}}>
                                                    <Text style={{fontSize:14,color:'#fefefe',fontWeight:'bold'}}>{this.state.scrollPageIndex}</Text>
                                                    <View style={{height:1,backgroundColor:'#b6f6e2',width:25}}></View>
                                                    <Text style={{fontSize:12,color:'#fefefe'}}>{this.allPage}</Text>
                                                </View>
                                            }
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )
        }
        return null
    }

    _renderCarNumber() {
        let carNum = this.state.shopCarNum
        if (Number.parseInt(carNum) > 0){
            let num = carNum
            let minWidth = 14
            if(Number.parseInt(carNum) > 99){
                num = "99+"
                minWidth = 22
            }
            return (
                <View style={{position:'absolute',top:-2,right:-5,minWidth:minWidth,height:14,borderRadius:14,borderColor:'#ff3300',borderWidth:1,backgroundColor:'white',...BaseStyles.centerItem}}>
                        <Text style={{color:'#ff3300',fontSize:11,marginHorizontal:1}}>{num}</Text>
                </View>
            )
        }
        return null
    }

    _dealOnScrollBeginDrag(event) {
        if (this.state.showType !== 'section') {
            return
        }
        this.listViewH = event.nativeEvent.layoutMeasurement.height
        if (this.state.pageIndex <= 2 && isEmpty(this.renderdViewH)) {
            this.renderdViewH = event.nativeEvent.contentSize.height
        }
        this.props._onSrollStart&&this.props._onSrollStart(event);
        this.setState({showTop:false});
    }

    _dealOnMomentumScrollEnd(event) {
        if (this.state.showType !== 'section') {
            return
        }
        this.props._onSrollEnd&&this.props._onSrollEnd(event);
        this.setState({showTop:true})
    }

    _dealOnScroll(event) {
        if (this.state.showType !== 'section') {
            return
        }
        this.props._onScroll&&this.props._onScroll(event)
        let scrollY = event.nativeEvent.contentOffset.y + this.listViewH
        let pageIndex = parseInt(scrollY/(this.renderdViewH+10))
        if (isNaN(pageIndex)) {
            pageIndex = 1
        } else {
            pageIndex += 1
        }
        if (pageIndex !== this.state.scrollPageIndex) {
            this.state.scrollPageIndex = pageIndex
            this.setState({scrollPageIndex:pageIndex})
        }
    }

    _standardChangeAction(standards) {
        let param = this.state.filterParam;
        if (isEmpty(param)) {
            param = new Map()
        }
        param.set('standard',standards)
        let paramJson = this.state.filterParamJson
        if (isEmpty(paramJson)) {
            paramJson = {}
        }
        paramJson.selectStand  = standards.split(',')
        this._setFilter(param, paramJson)
        this._onRefresh();
    }

    /** flatList 滑动监听 */
    _flatListScrollStart(e) {
        this._topViewHeight(e)
    }

    _flatListScroll(e) {
        this._topViewHeight(e)
    }

    _topViewHeight(e) {
        if (!this.topView) {
            return;
        }

        if (this._flatList === e) {
            return;
        }

        let scrollY = e.nativeEvent.contentOffset.y;
        let topHeight = 25 - scrollY;
        if(topHeight > 25) {
            topHeight = 25;
        }else if(topHeight < 0) {
            topHeight = 0;
        }
        this.topView.setNativeProps({
            style:{height: topHeight}
        })
    }

    _scrollToTopAction() {
        if (this.state.showTop) {
            if (this.swipeList&&this.swipeList._flatListRef&&this.swipeList._flatListRef.scrollToOffset) {
                this.swipeList._flatListRef.scrollToOffset({ animated: true, offset: 0 });
            }
            if ( this._waterList&&this._waterList.scrollTo) {
                this._waterList.scrollTo({x:0,y:0},true);
                //模拟scroll滚动事件
                this.props._onSrollStart&&this.props._onSrollStart({nativeEvent:{
                    layoutMeasurement:{height:this.listViewH},
                    contentSize:{height:this.renderdViewH},
                    contentOffset:{x:0,y:kScreenHeight}
                }});
                this.setState({showTop:false,scrollPageIndex:1});
                this.props._onScroll&&this.props._onScroll({nativeEvent:{
                    layoutMeasurement:{height:this.listViewH},
                    contentSize:{height:this.renderdViewH},
                    contentOffset:{x:0,y:0}
                }})
            }
        }
    }
    _gotoShopcar() {
        let {navigate} = this.props.navigation
        pushNavigation(navigate,{type:'get_shopping_car'})
    }
}

const styles = StyleSheet.create({

    btnStyle: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row"
    },
    orderByStyle: {
        marginLeft: 5,
        height: 10,
        width: 5
    },
    contentStyle:{
        height:50,
        alignItems:"center",
        justifyContent:"space-between",
        paddingLeft:10,
        borderBottomColor:'#E5E5E5',
        borderBottomWidth: 1,
        borderTopWidth:0,
        flexDirection:"row"
    },
    quickAContent:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    quick:{
        width:100,
        padding:5,
        justifyContent:'center',
        alignItems:'center'
    },
    RadiusShadow:{
        shadowColor: "rgba(206, 206, 206, 0.28)",
        shadowOffset: {width: 1, height: 1},
        elevation: 4,
        shadowRadius: 4,
        shadowOpacity: 1
    },

    circleShadowStyle:{
        minWidth: 35,
        minHeight: 35,
        shadowColor: "rgba(31, 219, 155, 0.5)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 7,
        shadowOpacity: 1
    },
    circleBtnStyle:{
        minWidth: 35,height: 35,borderRadius:35,justifyContent:'center',alignItems:'center'
    }


})
