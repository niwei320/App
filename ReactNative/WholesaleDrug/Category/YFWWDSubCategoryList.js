import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    FlatList,
    NativeModules, Animated, Easing, DeviceEventEmitter,
} from 'react-native';
import YFWHeaderLeft from "../Widget/YFWHeaderLeft";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWHeaderBackground from "../Widget/YFWHeaderBackground";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWPrestrainCacheManager, {kCatagaryListDataKey} from "../../Utils/YFWPrestrainCacheManager";
import {
    isAndroid,
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    kScreenWidth, kStyleWholesale,
    safeObj,
    strMapToObj
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWShopDetailGoodsListModel from "../../FindYao/Model/YFWShopDetailGoodsListModel";
import YFWNoLocationHint from "../../widget/YFWNoLocationHint";
import StatusView from "../../widget/StatusView";
import YFWFilterBoxModal from "../../PublicModule/Widge/YFWFilterBoxModal";
import YFWEmptyView from "../../widget/YFWEmptyView";
import YFWSubCategoryItemView from "../../FindYao/View/YFWSubCategoryItemView";
import YFWListFooterComponent from "../../PublicModule/Widge/YFWListFooterComponent";
import YFWWDGoodsListMenuView from "./View/YFWWDGoodsListMenuView";
import YFWWDMedicineInfoModel from "./Model/YFWWDMedicineInfoModel";
import YFWWDGoodsListModel from "./Model/YFWWDGoodsListModel";
import YFWWDGoodsListItemView from "./View/YFWWDGoodsListItemView";
import {YFWImageConst} from "../Images/YFWImageConst";
import {kRoute_search, pushWDNavigation} from "../YFWWDJumpRouting";
import YFWWDMore from '../Widget/View/YFWWDMore';

const {StatusBarManager} = NativeModules;
export default class YFWWDSubCategoryList extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        header: null
    });

    constructor(props, context) {

        super(props, context);
        this.state = {
            data: [],
            category_id: '',
            orderby: 'create_time desc',//default
            pageIndex: 1,
            showFoot: 2,
            loading: false,
            filterParam: undefined,
            filterParamJson: {},
            _scrollY:new Animated.Value(0),
            _fadeInOpacity:new Animated.Value(1),
        }
        this.state.category_id = this.props.navigation.state.params.state.value;
        this._requestData();
        this.listener();
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        // if (YFWPrestrainCacheManager.sharedManager().type != kCatagaryListDataKey) {
        //     YFWPrestrainCacheManager.sharedManager().changeType(kCatagaryListDataKey)
        // }
        // YFWPrestrainCacheManager.sharedManager().clearCachedInfos()
        this.didFocus.remove();
        this.willBlur.remove();
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                // if (YFWPrestrainCacheManager.sharedManager().type != kCatagaryListDataKey) {
                //     YFWPrestrainCacheManager.sharedManager().changeType(kCatagaryListDataKey)
                // }
            }
        );
        this.willBlur = this.props.navigation.addListener('willBlur',
            payload => {
            }
        );
    }

    _requestData() {

        let conditionsMap = new Map();
        conditionsMap.set('categoryid', this.state.category_id+'');
        // conditionsMap.set('categoryid', '1,2');
        let paramMap = new Map();
        // paramMap.set('__cmd', 'guest.common.wholesaleapp.getShopMedicinesForWholeSale');
        paramMap.set('__cmd', 'store.whole.medicine.getShopMedicinesForWholeSale');
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('pageSize', 10);
        paramMap.set('orderField', this.state.orderby);
        paramMap.set('version',YFWUserInfoManager.ShareInstance().version)
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        if (isNotEmpty(this.state.filterParam)) {
            for (let [k,v] of this.state.filterParam) {
                if(k == 'titleAbb'){
                    conditionsMap.set('millid',v)
                }else {
                    conditionsMap.set(k, v);
                }
            }
        }
        paramMap.set("conditions", strMapToObj(conditionsMap));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            console.log(JSON.stringify(res))
            this.statusView && this.statusView.dismiss();
            DeviceEventEmitter.emit('LoadProgressClose');
            let showFoot = 0;
            let dataArray = YFWWDGoodsListModel.getModelArray(safeObj(res.result).dataList);
            // this.fetchPrestrainGoodsData(dataArray)
            if (dataArray.length < 10) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.data.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);
            this.setState({
                data: dataArray,
                loading: false,
                showFoot: showFoot,
            });
        }, (error)=> {
            this.statusView && this.statusView.showNetError();
            DeviceEventEmitter.emit('LoadProgressClose');
            this._AnimatedDown()
            this.setState({
                loading: false,
                showFoot: 0,
            });
        }, false);

    }

    // fetchPrestrainGoodsData(dataList){
    //     if (YFWPrestrainCacheManager.sharedManager().type != kCatagaryListDataKey) {
    //         YFWPrestrainCacheManager.sharedManager().changeType(kCatagaryListDataKey)
    //     }
    //     YFWPrestrainCacheManager.sharedManager().cachedNewDatasWithList(dataList)
    // }


    closeControlPanel() {
        this._filter.closeView();
    };

    openControlPanel() {
        this._filter.showView();
    };

    _refreshData(type) {
        this.state.orderby = type;
        this._AnimatedDown()
        this._flatList&&this._flatList.scrollToOffset(0)
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

    _onScroll(event) {
        // console.log(event.nativeEvent)
        // return
        //防误触
        if (Math.abs(this.PreScrollY - event.nativeEvent.contentOffset.y) < 50) {
            return
        }
        if (((Platform.OS == 'android' && event.nativeEvent.velocity.y > 0 )|| Platform.OS == 'ios'&& event.nativeEvent.contentOffset.y - this.PreScrollY > 0)&& event.nativeEvent.contentOffset.y > 200) {
            this._AnimatedUp()
        } else {
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

        Animated.timing(this.state._fadeInOpacity, {
            toValue: 0,
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
        Animated.timing(this.state._fadeInOpacity, {
            toValue: 1,
            duration: 200,
            easing: Easing.linear,// 线性的渐变函数
        }).start();
    }

    _filterBackMethod(param, paramJson) {
        this.state.filterParam = param;
        this.state.filterParamJson = paramJson;

        this._AnimatedDown()
        this._flatList&&this._flatList.scrollToOffset(0)
        this._onRefresh();
        this.closeControlPanel();
    }

    render() {
        let statusBarHeight = isAndroid() ?
            (Platform.Version > 19 ? StatusBarManager.HEIGHT : 0)
            : (isIphoneX() ? 46  : 22 );
        let hideHeadTop = statusBarHeight + 100
        const shadowOpacity = this.state._fadeInOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
        });
        return (
            <View style={[BaseStyles.container,{backgroundColor:'#fff'}]}>
                {this._renderFilterBoxModal()}
                {this._renderList()}
                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{
                    this.setState({pageIndex:1});
                    this._requestData();
                }} marginTop={hideHeadTop/2}
                />
                <Animated.View style={{position:'absolute',top:this.state._scrollY}}>
                    <Animated.View style={{opacity:this.state._fadeInOpacity}}>
                        {this._renderHeader()}
                    </Animated.View>
                    {this._renderTopMenu()}
                    <YFWNoLocationHint/>
                    <Animated.View style={{width:kScreenWidth,height:2,backgroundColor:'rgba(204,204,204,0.3)',opacity:shadowOpacity}}/>
                </Animated.View>
            </View>
        );

    }

    _renderHeader() {
        let height = isAndroid() ?
            (Platform.Version > 19 ? StatusBarManager.HEIGHT + 50 : 50)
            : (isIphoneX() ? 46 + 50 : 22 + 50);
        let {name} = this.props.navigation.state.params.state
        return (
            <View style={{height:height ,width:kScreenWidth,justifyContent:'flex-end',}}>
                <View style={{position: 'absolute', top: 0 , left: 0 , height:height}}>
                    <YFWHeaderBackground from={kStyleWholesale}/>
                </View>
                <View style={{height:50,flexDirection: 'row', alignItems:'center', justifyContent:'space-between'}}>
                    <View style={{width:68}}>
                        <YFWHeaderLeft navigation={this.props.navigation}/>
                    </View>
                    <Text style={{maxWidth:kScreenWidth-200,fontSize: 16,color: "#ffffff",textShadowColor:'#fff'}}
                          numberOfLines={2}
                          ellipsizeMode={'tail'}>{name}</Text>
                    <View style={BaseStyles.rightCenterView}>
                        <YFWWDMore />
                        <TouchableOpacity onPress = {() => {pushWDNavigation(this.props.navigation.navigate, {type: kRoute_search});}}>
                            <Image style = {{width: 18, height: 18, marginRight: 20}}
                                   source = {YFWImageConst.Btn_bar_search} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    //筛选框
    _renderFilterBoxModal() {

        return (
            <YFWFilterBoxModal ref={(filter)=>this._filter = filter}
                               category_id={this.state.category_id} paramJson={this.state.filterParamJson}
                               saveMethod={(param,paramJson)=>this._filterBackMethod(param,paramJson)}
                               from={'YFWWDSubCategoryList'}/>
        );

    }

    //菜单栏
    _renderTopMenu() {
        return (
            <YFWWDGoodsListMenuView isSearch={false}
                                    refreshData={(type)=>this._refreshData(type)}
                                    onScreen={()=>{this.openControlPanel()}}/>
        );
    }


    //数据列表
    _renderList() {

        if (this.state.data.length > 0) {
            let statusBarHeight = isAndroid() ?
                (Platform.Version > 19 ? StatusBarManager.HEIGHT : 0)
                : (isIphoneX() ? 46  : 22 );
            let upHeight = 50
            let hideHeadTop = statusBarHeight + 50
            let showHeadTop = statusBarHeight + 100
            const modalHeight = this.state._scrollY.interpolate({
                inputRange: [-upHeight, 0],
                outputRange: [hideHeadTop, showHeadTop],
            });
            return (
                <Animated.View style={[BaseStyles.container,{alignItems:'center',backgroundColor: "white",paddingTop:isAndroid()?hideHeadTop:modalHeight}]}>
                    <FlatList
                        ref={(flatList)=>this._flatList = flatList}
                        extraData={this.state}
                        data={this.state.data}
                        onRefresh={() => this._onRefresh()}
                        refreshing={this.state.loading}
                        renderItem={this._renderListItem.bind(this)}
                        progressViewOffset={upHeight}
                        ListHeaderComponent={<View style={{height:isAndroid()?upHeight:0}}/>}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1}
                        onScroll={this._onScroll.bind(this)} // 每次滚动记录滚动位置
                        scrollEventThrottle={16} // 设置 onScroll 触发频率，一般为 16
                        bounces={false}
                    />
                </Animated.View>
            );
        } else {
            return <YFWEmptyView image={YFWImageConst.Bg_search_empty} title='暂无数据'/>
        }

    }

    _renderListItem = (item) => {
        item.item.index = item.index;
        return (
            <YFWWDGoodsListItemView Data={item.item} navigation={this.props.navigation}/>
        );

    }

    _renderFooter() {

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

}

const styles = StyleSheet.create({

    drawer: {shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
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
    contentStyle: {
        height: 50,
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 10,
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: 1,
        borderTopWidth: 0,
        flexDirection: "row"
    }


})
