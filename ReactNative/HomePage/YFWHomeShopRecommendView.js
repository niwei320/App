import React, { Component } from 'react';
import {
    View,FlatList,DeviceEventEmitter,StyleSheet,TouchableOpacity,Text,Image,
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {pushNavigation, doAfterLoginWithCallBack, doAfterLogin} from "../Utils/YFWJumpRouting";
import { kScreenWidth, tcpImage, itemAddKey } from '../PublicModule/Util/YFWPublicFunction';
import { toDecimal } from '../Utils/ConvertUtils';
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
import YFWShopDetailGoodsListModel from '../FindYao/Model/YFWShopDetailGoodsListModel';
import YFWShopCategoryGoodsListView from '../FindYao/View/YFWShopCategoryGoodsListView';
import YFWToast from '../Utils/YFWToast';
import YFWHomeShopGoodsCell from './YFWHomeShopGoodsCell';

const Scale = kScreenWidth/375

export default class YFWHomeShopRecommendView extends Component {

    static defaultProps = {
        Data:[],
    }

    constructor(props) {
        super(props);
        this.state = {
            index:0,
            data:[],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        };

    }

    componentDidMount(){
        let that = this
        //定位相关显示状态监听
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            that.setState({
                noLocationHidePrice:isHide
            })
        })
        DeviceEventEmitter.addListener('homeTopIndexChange',(index)=>{
            this.state.index = index
            if (this.props.Data&&this.props.Data.length>this.state.index) {
                let info = this.props.Data[this.state.index]
                if (info&&info.items) {
                    this.state.pageIndex = info.pageIndex
                    this.state.showFoot = info.showFoot
                    this.setState({
                        index:index,
                        pageIndex:info.pageIndex,
                        showFoot:info.showFoot,
                    })
                    if (info.items.length>0) {

                    } else {
                        this._fetchDataFromServer(info)
                    }

                }
            }
        })
    }

    //@ View
    render() {
        // return (
        //     <YFWShopCategoryGoodsListView ref={(view)=>{this.listView = view}} from={'home'} shopRecommendItem = {this.props.Data[0].items} shopCategorItem = {this.props.Data.slice(1)} shopID = {this.props.shop_id} navigation = {this.props.navigation}/>
        // )
        let data = this.props.Data&&this.props.Data.length>this.state.index?this.props.Data[this.state.index].items:[]
        return(
            <View style={[BaseStyles.container,{alignItems:'center'}]}>
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    numColumns={2}
                    extraData={this.state}
                    data={data}
                    renderItem = {this._renderItem.bind(this)}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    onScroll={(e)=>{this.sectionScroll(e)}}
                />
            </View>
        );

    }

    _renderItem = (info) => {
        let isLogin = YFWUserInfoManager.ShareInstance().hasLogin()

        return (
            <YFWHomeShopGoodsCell isLogin={isLogin}
                noLocationHidePrice={this.state.noLocationHidePrice}
                item={info.item}
                doAfterLogin={()=>{this.doAfterLogin()}}
                clickItemAction={()=>{this.clickItems(info.item)}}
                addToCarAction={()=>{this.addToCar(info.item)}}></YFWHomeShopGoodsCell>
        )
    }

    sectionScroll(e) {
        if (this.state.index == 0) {
            return
        }
        let scrollY = e.nativeEvent.contentOffset.y;
        let scrollHeight = e.nativeEvent.layoutMeasurement.height;
        this.setPage(scrollY,scrollHeight)
    }

    setPage(scrollY,scrollHeight) {
        //10是分割线
        let listOffset = scrollY + scrollHeight
        let itemHeight = this.itemHeight
        // 预加载下一页
        let unShowedCount = parseInt(this.state.data.length/2 - listOffset / itemHeight)
        if ( unShowedCount < 6) {
            this._onEndReached()
        }
    }
    _onEndReached() {
        if (this.state.index == 0) {
            return
        }
        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        if (this.props.Data&&this.props.Data.length>this.state.index) {
            this._fetchDataFromServer(this.props.Data[this.state.index])
        }
    }

    _fetchDataFromServer(info){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineSearch');
        paramMap.set('storeid', info.shop_id);
        paramMap.set('categoryid', info.id);
        paramMap.set('pageSize', 20);
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('orderField', 'sale_count');
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        let lastIndex = this.state.index + ''
        let lastPageIndex = this.state.pageIndex + ''
        viewModel.TCPRequest(paramMap, (res)=> {
            lastIndex = parseInt(lastIndex)
            lastPageIndex = parseInt(lastPageIndex)
            let showFoot = 0;

            let dataArray = (res.result.dataList);

            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (lastPageIndex > 1) {
                dataArray = this.props.Data[lastIndex].items.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);

            this.props.Data[lastIndex].items = dataArray
            this.props.Data[lastIndex].showFoot = showFoot
            this.props.Data[lastIndex].pageIndex = lastPageIndex
            if (lastIndex == this.state.index) {
                this.state.loading = false
                this.state.showFoot = showFoot
                this.setState({});
            }
        }, (error)=> {
            this.setState({
                loading: false,
                showFoot: 0,
            });
        }, false);
    }

    //@ Action
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

    doAfterLogin(){

        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{});

    }

    addToCar(info){
        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            this._addToCarFromServer(info)
        } else {
            let {navigate} = this.props.navigation
            doAfterLoginWithCallBack(navigate,()=>{
                this._addToCarFromServer(info)
            })
        }
    }
    _addToCarFromServer(info) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.addCart');
        paramMap.set('quantity', 1);
        paramMap.set('storeMedicineId', info.id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('商品添加成功');
            this.getCarNumber();
        }, (error) => {
        });
    }
    getCarNumber() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.getCartCount');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.dealCarNumber(res)
        }, (error) => {
        }, false);
    }

    dealCarNumber(res) {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        new YFWUserInfoManager().shopCarNum = res.result.cartCount + ''
        DeviceEventEmitter.emit('SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
    }

    clickedIndex(index) {
        DeviceEventEmitter.emit('homeTopIndexChange',index)
    }

}

