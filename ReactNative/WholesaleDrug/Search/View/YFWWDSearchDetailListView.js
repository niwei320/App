import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    DeviceEventEmitter,
    Alert,
    FlatList, Animated, Easing, Platform,
} from 'react-native';
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";
import {
    darkStatusBar, iphoneBottomMargin, isAndroid, isEmpty, isIphoneX,
    isNotEmpty,
    itemAddKey, kScreenHeight, kScreenWidth, kStyleWholesale,
    safe, safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWPrestrainCacheManager, {kSearchListDataKey} from "../../../Utils/YFWPrestrainCacheManager";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWToast from "../../../Utils/YFWToast";
import {setItem} from "../../../Utils/YFWStorage";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import StatusView from "../../../widget/StatusView";
import YFWFilterBoxModal from "../../../PublicModule/Widge/YFWFilterBoxModal";
import YFWNoLocationHint from "../../../widget/YFWNoLocationHint";
import {backGroundColor, yfwGreenColor} from "../../../Utils/YFWColor";
import YFWSubCategoryCollectionItemView
    from "../../../FindYao/View/YFWSubCategoryCollectionItemView";
import YFWListFooterComponent from "../../../PublicModule/Widge/YFWListFooterComponent";
import {YFWImageConst} from "../../Images/YFWImageConst";
import YFWWDSearchShopItemVIew from "./YFWWDSearchShopItemVIew";
import YFWWDGoodsListMenuView from "../../Category/View/YFWWDGoodsListMenuView";
import YFWWDGoodsListModel from "../../Category/Model/YFWWDGoodsListModel";
import YFWWDSeacrchShopModel from "../Model/YFWWDSeacrchShopModel";
import YFWWDGoodsListItemView from "../../Category/View/YFWWDGoodsListItemView";
import { pushWDNavigation, kRoute_goods_detail, kRoute_shoppingcar ,doAfterLogin} from '../../YFWWDJumpRouting';

export default class YFWWDSearchDetailListView extends Component {


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
            // associationGoodsOrShopsData:[],
            pageIndex:1,
            loading:false,
            showFoot:2,
            tableStyle:true,
            filterParam:undefined,
            filterParamJson:{},
            sort:'',
            sorttype:'',
            showTop:true,
            shopCarNum:new YFWUserInfoManager().wdshopCarNum + '',
            scrollPageIndex:1,
            _scrollY:new Animated.Value(0),
        }
        this.state.tableStyle = YFWUserInfoManager.ShareInstance().tableStyle
    }

    componentDidMount() {
        darkStatusBar();
        this._handleData(this.props.keyWords);
        this.didFocus = this.props.navigation.addListener('didFocus',(playLoad)=>{
            // if (YFWPrestrainCacheManager.sharedManager().type != kSearchListDataKey) {
            //     YFWPrestrainCacheManager.sharedManager().changeType(kSearchListDataKey)
            // }
        })
        this.carNumChangeListener = DeviceEventEmitter.addListener('WD_SHOPCAR_NUMTIPS_RED_POINT',(value)=>{
            this.setState({shopCarNum:value})
        })
    }

    componentWillUnmount(){
        this.didFocus.remove()
        // YFWPrestrainCacheManager.sharedManager().clearCachedInfos()
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
            if (this.props.type === 'goods') {
                this._requestGoodsData(keyWords);
            } else {
                this._requestShopData(keyWords);
            }
        }

    }

    _requestShopGoodsData(keyWords){

        this.keyWords = keyWords;

            let paramMap = new Map();
            this._formatOrderBy(this.state.orderby);
            paramMap.set('__cmd', 'store.whole.app.getStoreMedicineSearchWhole');
            paramMap.set('pageIndex', this.state.pageIndex);
            paramMap.set('pageSize', 10);
            paramMap.set("keywords", keyWords);
            paramMap.set('orderField', this.state.sort);
            paramMap.set("storeid", this.props.shop_id);
            paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
            paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
            this.tcp_requestViewModel(paramMap);

    }

    _requestGoodsData(keyWords) {
        this.keyWords = keyWords;
        let paramMap = new Map();
        this._formatOrderBy(this.state.orderby);
        paramMap.set('__cmd', 'store.whole.medicine.getSearchPageData');
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
        this.tcp_requestViewModel(paramMap);
    }

    _formatOrderBy(orderby) {
        switch (orderby){
            case 'price_asc':
                this.state.sort = 'price asc';
                break
            case 'price_desc':
                this.state.sort = 'price desc';
                break
            case 'sales_asc':
                this.state.sort = 'shopCount asc';
                break
            case 'sales_desc':
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
        paramMap.set('__cmd', 'store.whole.app.getSearchShop');
        paramMap.set('keywords', safe(keyWords));
        // paramMap.set('lat', safe(user.latitude));
        // paramMap.set('lon', safe(user.longitude));
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('shoptype', 3);
        paramMap.set('regionid', 0);
        // paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        // paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
                this.statusView&&this.statusView.dismiss();
                let showFoot = 0;
                let responseArray = YFWWDSeacrchShopModel.getModelArray(res.result.dataList);

                if(this.state.pageIndex === 1 && responseArray.length === 0){
                    // 第一次搜索商家无数据，推荐列表
                    // this._requestAssociationGoodsOrShopsData();
                    return;
                }

                if(responseArray.length < 10){
                    showFoot = 1;
                }

                responseArray = itemAddKey(responseArray, this.state.pageIndex.toString());

                this.setState({
                    data: this.state.pageIndex === 1 ? responseArray : this.state.data.concat(responseArray),
                    // associationGoodsOrShopsData:[],
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


    // 推荐列表请求
    // _requestAssociationGoodsOrShopsData(){
    //     if (isNotEmpty(this.props.shop_id)){
    //
    //
    //     } else {
    //         if(this.props.type === 'goods'){
    //             let paramMap = new Map();
    //             paramMap.set('__cmd','guest.medicine.getTopVisitMedicine');
    //             paramMap.set('limit',6);
    //             this._requestAssociationGoodsOrShopsViewModel_tcp(paramMap,true)
    //         }else {
    //             let user =  YFWUserInfoManager.ShareInstance();
    //             let paramMap = new Map();
    //             paramMap.set('__cmd', 'guest.common.app.getNearShop');
    //             paramMap.set('lat', safe(user.latitude));
    //             paramMap.set('lon', safe(user.longitude));
    //             paramMap.set('pageSize', 10);
    //             paramMap.set('pageIndex', 1);
    //             let viewModel = new YFWRequestViewModel();
    //             viewModel.TCPRequest(paramMap , (res)=>{
    //                 this.statusView&&this.statusView.dismiss();
    //                 let showFoot = 0;
    //                 let responseArray = YFWWDSeacrchShopModel.getModelArray(res.result.dataList);
    //                 responseArray = itemAddKey(responseArray);
    //                 this.setState({
    //                     associationGoodsOrShopsData:responseArray,
    //                     data:[],
    //                     pageIndex:1,
    //                     loading:false,
    //                     showFoot:0,
    //                 });
    //             },(error)=>{
    //                 this.statusView&& this.statusView.showNetError();
    //                 this.setState({
    //                     loading:false,
    //                     showFoot:0,
    //                 });
    //             },false)
    //         }
    //
    //     }
    //
    // }
    // _requestAssociationGoodsOrShopsViewModel_tcp(paramMap,isGoods){
    //     let viewModel = new YFWRequestViewModel();
    //     viewModel.TCPRequest(paramMap , (res)=>{
    //         this.statusView&& this.statusView.dismiss();
    //         let dataArray = SerchResultTopVisitMedicineModle.getModelArray(res.result);
    //         dataArray = itemAddKey(dataArray);
    //         let newStyle = isGoods?true:this.state.tableStyle;
    //         this.setState({
    //             associationGoodsOrShopsData:dataArray,
    //             data:[],
    //             pageIndex:1,
    //             loading:false,
    //             showFoot:0,
    //             tableStyle:newStyle,
    //         });
    //
    //     },(error)=>{
    //         this.statusView&& this.statusView.showNetError();
    //         this.setState({
    //             loading:false,
    //             showFoot:0,
    //         });
    //     },false)
    // }


    tcp_requestViewModel(paramMap){

        let viewModel = new YFWRequestViewModel();

        viewModel.TCPRequest(paramMap , (res)=>{
            // console.log(res)
            DeviceEventEmitter.emit('LoadProgressClose');
            this.statusView&&this.statusView.dismiss();
            let showFoot = 0;
            if(this.state.pageIndex == 1 && isEmpty(res.result)){
                return
            }
            let dataArray = YFWWDGoodsListModel.getModelArray(res.result.dataList);
            //预加载相关
            // this.fetchPrestrainGoodsData(dataArray)
            if (dataArray.length === 0){
                showFoot = 1;
            }
            if (this.state.pageIndex > 1){
                dataArray = this.state.data.concat(dataArray);
            } else {
                if (dataArray.length == 0 ) {
                    //推荐商品
                    // this._requestAssociationGoodsOrShopsData();
                }
            }
            dataArray = itemAddKey(dataArray);
            this.setState({
                data:dataArray,
                // associationGoodsOrShopsData:[],
                loading:false,
                showFoot:showFoot,
            });
            console.log('endRef')
        }, (error) => {
            DeviceEventEmitter.emit('LoadProgressClose');
            this.statusView&&this.statusView.showNetError();
            this.setState({
                loading:false,
                showFoot:0,
            });
        },false);
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
                onPress:()=>{pushWDNavigation(this.props.navigation.navigate,{type:kRoute_goods_detail,value:goodsId,showSameShop:true})},
            }],{
                cancelable: false
            });
        })
    }




    //@ Action

    closeControlPanel() {
        this._filter.closeView();
    };

    openControlPanel() {
        this._filter.showView();
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
        this._onRefresh();
        this.closeControlPanel();
    }


    _addSameShopCar(item){

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

    _onScroll(event) {
        //防误触
        if (Math.abs(this.PreScrollY - event.nativeEvent.contentOffset.y) < 50) {
            return
        }
        if (((Platform.OS == 'android' && event.nativeEvent.velocity.y > 0 )|| Platform.OS == 'ios'&& event.nativeEvent.contentOffset.y - this.PreScrollY > 0)&& event.nativeEvent.contentOffset.y > 200) {
            this.props.animatedUp && this.props.animatedUp()
            this._AnimatedUp()
        } else {
            this.props.animatedDown && this.props.animatedDown()
            this._AnimatedDown()
        }
        this.PreScrollY = event.nativeEvent.contentOffset.y
    }

    _AnimatedUp(){

        if (this.scrollUP) {
            return
        }
        this.scrollUP = true
        let upHeight = 50
        Animated.spring(this.state._scrollY, {
            toValue: - upHeight,
            duration: 300,
            easing: Easing.linear,// 线性的渐变函数
        }).start();

    }

    _AnimatedDown() {

        if (!this.scrollUP) {
            return
        }
        this.scrollUP = false
        Animated.timing(this.state._scrollY, {
            toValue: 0,
            duration: 200,
            easing: Easing.linear,// 线性的渐变函数
        }).start();
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

        if (this.state.data.length == 0) {
            return (
                this._renderAnotherList()
            );
        } else {
            return (
                <View style={[BaseStyles.container]}>
                    {this._renderContent()}
                    {this._renderTopMenu()}
                    {this._renderList()}
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
                               from = {'YFWWDSearchDetailListView'}/>
        );

    }

    //菜单栏
    _renderTopMenu() {

        if (this.props.type === 'goods') {
            return (
                <View style={{zIndex:10}}>
                    <YFWWDGoodsListMenuView isSearch={false}
                                            refreshData={(type)=>this._refreshData(type)}
                                            onScreen={()=>{this.openControlPanel()}}/>
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


    //数据列表
    _renderList() {

        let key = 'collection';
        if (this.state.data.length > 0) {

            if (this.props.type === 'goods'){
                    return (
                        <Animated.View style={{top:isAndroid()?0:this.state._scrollY}}>
                            <FlatList
                                data={this.state.data}
                                extraData={this.state}
                                renderItem = {this._renderListItem.bind(this)}
                                ListFooterComponent={this._renderFooter.bind(this)}
                                onEndReached={this._onEndReached.bind(this)}
                                onEndReachedThreshold={0.1}
                                onRefresh={() => this._onRefresh()}
                                refreshing={this.state.loading}
                                keyboardShouldPersistTaps={'always'}
                                onScroll={this._onScroll.bind(this)} // 每次滚动记录滚动位置
                                scrollEventThrottle={16} // 设置 onScroll 触发频率，一般为 16
                            />
                        </Animated.View>
                    );
            } else {
                return (
                    <View style={[BaseStyles.container,{backgroundColor:'white'}]}>
                        {this._renderShopTopBackgroundView()}
                        <FlatList
                            ref={(flatList)=>this._flatList = flatList}
                            style={{position: 'absolute', left:8,right:0,top:0,bottom:0}}
                            extraData={this.state}
                            data={this.state.data}
                            numColumns={1}
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
                    // data={this.state.associationGoodsOrShopsData}
                    data={[]}
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
            <View style={{paddingBottom: 10}}>
                {this._renderTopTipVuew()}
                {/*<View style={{marginLeft:10,marginTop:10,width:kScreenWidth,height:headerHeight, justifyContent:'center'}}>*/}
                    {/*<YFWTitleView title={this.props.type == 'goods'?'热门搜索':'相关商家'} from={kStyleWholesale}/>*/}
                    {/*<View style={{backgroundColor: raiusBackgrounColor, width: kScreenWidth, height:7, marginLeft:-10, borderTopLeftRadius:7,borderTopRightRadius:7}}></View>*/}
                {/*</View>*/}
            </View>
        )
    }

    _renderTopTipVuew(){
        if (this.props.type == 'goods') {
            return (
                <View style={[BaseStyles.centerItem,BaseStyles.radiusShadow,{height:260,borderRadius: 7,flexDirection:'column', justifyContent:'flex-start',backgroundColor:'white'}]}>
                    <Image style={{height:81,width:132, marginTop:27}} source={YFWImageConst.Bg_search_empty} />
                    <Text style={ {textAlign :'center',color:'#999',fontSize: 13,marginTop:20}} >{'抱歉,没有找到商品哦~'}</Text>
                </View>

            )
        } else {
            return (
                <View style={[BaseStyles.centerItem,styles.RadiusShadow,{marginHorizontal:10 ,height:260/375*kScreenWidth, borderRadius: 7, backgroundColor:'white'}]}>
                    <Image style={{height:81,width:132}} source={YFWImageConst.Bg_search_empty} />
                    <Text style={ {textAlign :'center',color:'#999',fontSize: 13,marginTop:20}} >{'抱歉，没有找到商家哦~'}</Text>
                </View>
            )
        }
    }

    _renderShopTopBackgroundView() {
        return <Image source={YFWImageConst.Nav_header_background_blue}  ref={(e)=>{this.topView=e}} style={{width:kScreenWidth,height:25,resizeMode:'stretch'}}/>
    }

    _getMedicineCollectionItemHeight(item, index) {
        return item.itemHeight
    }

    _renderMedicineCollectionItem(item) {
        return(
            <YFWSubCategoryCollectionItemView
                from={'search'} Data={item}
                shop_id={this.props.shop_id}
                isShopMember={this.props.isShopMember}
                navigation={this.props.navigation} onLongPress={()=>{this._addSameShopCar(item)}}/>
        )
    }

    _renderListItem = (item) => {

        item.item.index = item.index;
        if (this.props.type === 'goods'){
            return(
                <YFWWDGoodsListItemView from={'search'} Data={item.item} shop_id={this.props.shop_id} isShopMember={this.props.isShopMember} navigation={this.props.navigation}/>
            );

        } else{

            return (<YFWWDSearchShopItemVIew model={item.item} navigation={this.props.navigation}/>)
        }

    }


    _renderFooter(){

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

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

    _gotoShopcar() {
        let {navigate} = this.props.navigation
        pushWDNavigation(navigate,{type:kRoute_shoppingcar})
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
