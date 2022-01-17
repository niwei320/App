import React, {Component} from 'react';
import {
    View,  StyleSheet, FlatList,
} from 'react-native';
import {itemAddKey, kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import YFWWDSearchShopItemVIew from "../Search/View/YFWWDSearchShopItemVIew";
import StatusView from "../../widget/StatusView";
import YFWListFooterComponent from "../../PublicModule/Widge/YFWListFooterComponent";
import YFWWDMySupplierModel from "./Model/YFWWDMySupplierModel";

export default class YFWWDMySupplier extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '我的供应商',
        headerRight:<View style={{width:50}}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            pageIndex:1,
            loading:false,
            showFoot:2,
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        this._requestShopData()
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    _requestShopData() {

        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getSuppliersWholesale');
        paramMap.set('pageSize', '10');
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('orderField', 'create_time');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            console.log(JSON.stringify(res))
                this.statusView&&this.statusView.dismiss();
                let showFoot = 0;
                let responseArray = YFWWDMySupplierModel.getModelArray(res.result);
            if (this.state.pageIndex === 1 && responseArray.length === 0) {
                    this.statusView&&this.statusView.showEmptyWIthTips('暂无数据');
                    return;
                }
                if(responseArray.length < 10){
                    showFoot = 1;
                }
                responseArray = itemAddKey(responseArray, this.state.pageIndex.toString());
                this.setState({
                    data: this.state.pageIndex === 1 ? responseArray : this.state.data.concat(responseArray),
                    loading:false,
                    showFoot:showFoot,
                });
            },
            (error)=>{
                this.statusView&&this.statusView.showEmpty();
                if(error&&error.msg){
                    YFWToast(error.msg)
                }
            },false)

    }

    _onRefresh(){
        this.state.pageIndex = 1;
        this.setState({
            loading:true
        });
        this._requestShopData();

    }

    _onEndReached(){

        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this._requestShopData();

    }
//-----------------------------------------------RENDER---------------------------------------------
    _renderListItem = (item) => {
        item.item.index = item.index;
        return (
            <YFWWDSearchShopItemVIew model = {item.item} navigation = {this.props.navigation} />)
    }

    _renderFooter(){
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>
    }

    render() {
        return (
            <View style = {[style.center, {flex: 1, width:kScreenWidth, backgroundColor:'#fafafa'}]}>
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    style={{flex:1, width:kScreenWidth-12,marginTop:10}}
                    extraData={this.state}
                    data={this.state.data}
                    numColumns={1}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    renderItem = {this._renderListItem.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    keyboardShouldPersistTaps={'always'}
                />
                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{
                    this.setState({pageIndex:1});
                    this._requestShopData();
                }}/>
            </View>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});