import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    FlatList, DeviceEventEmitter,
    Platform, NativeModules
} from 'react-native';
import {isNotEmpty, itemAddKey, safeObj, strMapToObj, dismissKeyboard_yfw, kScreenHeight, kScreenWidth, tcpImage} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWFilterBoxModal from '../../PublicModule/Widge/YFWFilterBoxModal'
import YFWSubCategoryMenuView from '../View/YFWSubCategoryMenuView'
import YFWSubCategoryItemView from '../View/YFWSubCategoryItemView'
import YFWSubCategoryCollectionItemView from '../View/YFWSubCategoryCollectionItemView'
import YFWEmptyView from '../../widget/YFWEmptyView'
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import StatusView from "../../widget/StatusView";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWShopDetailGoodsListModel from "../Model/YFWShopDetailGoodsListModel";
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import YFWPrestrainCacheManager, { kCatagaryListDataKey } from '../../Utils/YFWPrestrainCacheManager';
import {setItem} from "../../Utils/YFWStorage";
import {WaterfallList} from 'react-native-largelist-v3'
import {ChineseWithLastDateFooter, ChineseWithLastDateHeader}  from "react-native-spring-scrollview/Customize";
import YFWMore from '../../widget/YFWMore';
import YFWNoLocationHint from '../../widget/YFWNoLocationHint'
import YFWHeaderLeft from '../../WholesaleDrug/Widget/YFWHeaderLeft';
import YFWHeaderBackground from '../../WholesaleDrug/Widget/YFWHeaderBackground';
import FastImage from 'react-native-fast-image';
const {StatusBarManager} = NativeModules;


export default class YFWSubCategoryController extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        headerTitle: `${navigation.state.params.state.name}`,
        headerTitleStyle: {fontSize: 16, color: 'white', textAlign: 'center', flex: 1},
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white', borderBottomWidth: 0},
        headerLeft: (
            <YFWHeaderLeft navigation={navigation}></YFWHeaderLeft>
        ),
        headerRight: (
            <View style={BaseStyles.rightCenterView}>
                <YFWMore/>
                <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} style={{marginRight:20}} onPress={()=>{
                    pushNavigation(navigation.navigate,{type:'get_search'});
                }}>
                    <Image style={{width: 18, height: 18}}
                           source={require('../../../img/kind_search_white.png')}/>
                </TouchableOpacity>
            </View>

        ),
        headerBackground: <YFWHeaderBackground></YFWHeaderBackground>
    });

    constructor(props, context) {

        super(props, context);
        this.state = {
            category_id: '',
            orderby: 'default',
            data: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            tableStyle: true,
            filterParam: undefined,
            filterParamJson: {},
            sort: '',
            sorttype: ''
        }
        this.state.tableStyle = YFWUserInfoManager.ShareInstance().tableStyle
        this.state.category_id = this.props.navigation.state.params.state.value;
        this._requestData();
        this.listener();
    }

    componentDidMount() {
        /*this.state.category_id = this.props.navigation.state.params.state.value;
        this._requestData();*/

    }

    componentWillUnmount() {
        if (YFWPrestrainCacheManager.sharedManager().type != kCatagaryListDataKey) {
            YFWPrestrainCacheManager.sharedManager().changeType(kCatagaryListDataKey)
        }
        YFWPrestrainCacheManager.sharedManager().clearCachedInfos()
        this.didFocus.remove();
        this.willBlur.remove();
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                DeviceEventEmitter.emit('ShowInviteView', {value: true});
                if (YFWPrestrainCacheManager.sharedManager().type != kCatagaryListDataKey) {
                    YFWPrestrainCacheManager.sharedManager().changeType(kCatagaryListDataKey)
                }
            }
        );
        this.willBlur = this.props.navigation.addListener('willBlur',
            payload => {
                DeviceEventEmitter.emit('ShowInviteView', {value: false});
            }
        );
    }

    //@ Request

    _formatOrderBy(orderby) {
        switch (orderby) {
            case 'priceasc':
                this.state.sort = 'price';
                this.state.sorttype = 'asc';
                break
            case 'pricedesc':
                this.state.sort = 'price';
                this.state.sorttype = 'desc';
                break
            case 'shopcountasc':
                this.state.sort = 'shopcount';
                this.state.sorttype = 'asc';
                break
            case 'shopcountdesc':
                this.state.sort = 'shopcount';
                this.state.sorttype = 'desc';
                break
            default:
                this.state.sort = '';
                this.state.sorttype = '';
                break
        }
    }


    _requestData() {

        let conditionsMap = new Map();
        this._formatOrderBy(this.state.orderby);
        conditionsMap.set('categoryid', this.state.category_id);
        conditionsMap.set('sort', this.state.sort);
        conditionsMap.set('sorttype', this.state.sorttype);
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getMedicines');
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('pageSize', 10);
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
            this.statusView && this.statusView.dismiss();
            let showFoot = 0;
            let dataArray = YFWShopDetailGoodsListModel.getModelArray(safeObj(res.result).dataList);
            this.fetchPrestrainGoodsData(dataArray)
            if (dataArray.length === 0) {
                showFoot = 1;
            }
            let imageSources = dataArray.map((info)=>{
                let goodsImageUrl = info.intro_image?tcpImage(info.intro_image):tcpImage(info.img_url)
                return {uri:goodsImageUrl}
            })
            FastImage.preload(imageSources)
            if (this.state.pageIndex > 1) {
                dataArray = this.state.data.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);


            this.setState({
                data: dataArray,
                loading: false,
                showFoot: showFoot,
            });
            this._waterListEndLoding()

        }, (error)=> {
            this.statusView && this.statusView.showNetError();
            this.setState({
                loading: false,
                showFoot: 0,
            });
            this._waterListEndLoding()

        }, false);

    }
    fetchPrestrainGoodsData(dataList){
        if (YFWPrestrainCacheManager.sharedManager().type != kCatagaryListDataKey) {
            YFWPrestrainCacheManager.sharedManager().changeType(kCatagaryListDataKey)
        }
        YFWPrestrainCacheManager.sharedManager().cachedNewDatasWithList(dataList)
    }


    //@ Action

    closeControlPanel() {
        this._filter.closeView();
    };

    openControlPanel() {
        this._filter.showView();
    };

    _showTypeChange() {
        setItem('CategoryTableStyle',!this.state.tableStyle?'table':'collection')
        YFWUserInfoManager.ShareInstance().tableStyle = !this.state.tableStyle
        this.setState({
            tableStyle: !this.state.tableStyle,
        });
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

    _onSrollStart(e) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate', {value: 1});
    }

    _onSrollEnd(e) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate', {value: 2});
    }


    _filterBackMethod(param, paramJson) {
        this.state.filterParam = param;
        this.state.filterParamJson = paramJson;

        this._onRefresh();
        this.closeControlPanel();
    }


    //@ View
    render() {

        return (
            <View style={[BaseStyles.container]}>
                {this._renderContent()}
                {this._renderTopMenu()}
                <YFWNoLocationHint/>
                {this._renderList()}
                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{
                    this.setState({pageIndex:1});
                    this._requestData();
                }}/>
            </View>
        );

    }

    //筛选框
    _renderContent() {

        return (
            <YFWFilterBoxModal ref={(filter)=>this._filter = filter}
                               category_id={this.state.category_id} paramJson={this.state.filterParamJson}
                               saveMethod={(param,paramJson)=>this._filterBackMethod(param,paramJson)}
                               from={'YFWSubCategoryController'}/>
        );

    }

    //菜单栏
    _renderTopMenu() {

        return (
            <YFWSubCategoryMenuView isSearch={false}
                                    refreshData={(type)=>this._refreshData(type)}
                                    tableStyle={this.state.tableStyle}
                                    onShowTypeChange={()=>this._showTypeChange()}
                                    onScreen={()=>{this.openControlPanel()}}/>
        );

    }


    //数据列表
    _renderList() {

        if (this.state.data.length > 0) {

            let numColumns = this.state.tableStyle ? 1 : 2;
            let key = this.state.tableStyle ? 'table' : 'collection';

            if (this.state.tableStyle) {
                return (
                    <View style={[BaseStyles.container,{alignItems:'center'}]}>
                        <FlatList
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
                            onMomentumScrollEnd={this._onSrollEnd.bind(this)}
                            onScrollBeginDrag={this._onSrollStart.bind(this)}
                        />
                    </View>
                );


            } else {
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
                            refreshHeader={ChineseWithLastDateHeader}
                            loadingFooter={ChineseWithLastDateFooter}
                            onLoading={() => {this._onEndReached()}}
                        />
                    </View>
                )

            }

        } else {

            return <YFWEmptyView title='暂无数据'/>
        }

    }

    _renderMedicineCollectionItem(item) {

        return (
            <YFWSubCategoryCollectionItemView Data={item}  from={'search'} navigation={this.props.navigation}/>
        )
    }
    _renderListItem = (item) => {

        item.item.index = item.index;
        if (this.state.tableStyle) {
            return (
                <YFWSubCategoryItemView Data={item.item}  from={'search'} navigation={this.props.navigation}/>
            );
        } else {
            return (
                <YFWSubCategoryCollectionItemView Data={item.item}  from={'search'} navigation={this.props.navigation}/>
            )
        }

    }

    _renderFooter() {

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

    _getMedicineCollectionItemHeight(item, index) {
        return item.itemHeight
    }

    _waterListEndLoding() {
        if(this._waterList){
            this._waterList.endRefresh();
            this._waterList.endLoading();
        }
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