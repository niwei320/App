import React, {Component} from 'react';
import {
    View,
    Image,
    DeviceEventEmitter,
    Text,
    Platform,
    TouchableOpacity,
    FlatList
} from 'react-native'
import YFWGoodsItem from '../../widget/YFWGoodsItem';
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent';
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import YFWShopDetailGoodsListModel from '../Model/YFWShopDetailGoodsListModel';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import { isNotEmpty, itemAddKey } from '../../PublicModule/Util/YFWPublicFunction';

export default class YFWShopCategoryItemGoodsListView extends Component {

    constructor(props) {
        super(props)
        this.showFoot = 2
        this.fData = this.props.dataArray
        this.categoryId = this.props.status
        this.shopID = this.props.shopID
        this.state = {
            data:[],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            sort:'sale_count'
        }
        this._requestData()
    }

    componentWillMount(){

    }
    componentWillUnmount(){

    }

    componentDidMount(){

    }

    componentWillReceiveProps(props){


    }

    render() {
        return (
            <View style={{flex:1,paddingHorizontal:7,backgroundColor:'transparent'}}>
                <FlatList
                    horizontal={false}
                    numColumns={2}
                    data={this.state.data}
                    ListHeaderComponent={this._renderHeader.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    renderItem={this._renderSubItem.bind(this)}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    onScroll={(e)=>{this.sectionScroll(e)}}
                />
            </View>
        )
    }
    sectionScroll(e) {
        let scrollY = e.nativeEvent.contentOffset.y;
        let scrollHeight = e.nativeEvent.layoutMeasurement.height;
        this.setPage(scrollY,scrollHeight)
    }

    setPage(scrollY,scrollHeight) {
        //10是分割线
        let listOffset = scrollY + scrollHeight
        let itemHeight = this.goodItem._getGoodsItemHeight()
        // 预加载下一页
        let unShowedCount = parseInt(this.state.data.length/2 - listOffset / itemHeight)
        if ( unShowedCount < 6) {
            this._onEndReached()
        }
    }

    _renderHeader() {
        return <View style={{flex:1,height:8}}/>
    }

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>
    }

    _renderSubItem({item}) {

        return <YFWGoodsItem ref={(view)=>{this.goodItem = view}} model={item} navigation={this.props.navigation} from={'shop_medicine_recomand'}/>
    }


    /******  数据   ***********/

    _requestData(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineSearch');
        paramMap.set('storeid', this.shopID);
        paramMap.set('categoryid', this.categoryId);
        paramMap.set('pageSize', 20);
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('orderField', this.state.sort);
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());

        viewModel.TCPRequest(paramMap, (res)=> {
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
        }, false);
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

}
