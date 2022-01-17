import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    DeviceEventEmitter,
    FlatList,
} from 'react-native';
import {isEmpty, isNotEmpty, itemAddKey, kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import OrderListItem from "./OrderListItem";
import YFWListFooterComponent from "../../PublicModule/Widge/YFWListFooterComponent";
import StatusView from "../../widget/StatusView";
import YFWPaymentDialogView from "../../OrderPay/View/YFWPaymentDialogView";
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
import ReturnTipsDialog from "../../PublicModule/Widge/ReturnTipsDialog";
import OrderListErpModel from "./Model/OrderListErpModel";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWOfflineOrderDetailModel from "./OrderDetail/Model/YFWOfflineOrderDetailModel";
import {pushNavigation} from "../../Utils/YFWJumpRouting";

export default class OrderOffline extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isFirstTimeIn: true,
            pageIndex: 1,
            refreshType: undefined,
            loading: false,
            showFoot: 2,
            dataArray: [],
            isChangeTab: false,
            isAfterErrorRefresh: false,
        };
        this.orderStatus = this.props.status;
        this._requestOrderListData();
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        this.tabchange = DeviceEventEmitter.addListener('changer_erp_tabs', (position)=> {
            let needRefresh = false
            switch (position) {
                case 0:if(this.orderStatus === "") needRefresh = true;break;
                case 1:if(this.orderStatus === "10") needRefresh = true;break;
                case 2:if(this.orderStatus === "14") needRefresh = true;break;
            }
            if(needRefresh){
                if (isNotEmpty(this.refs.order_list)) {
                    this.refs.order_list.scrollToOffset({offset: 0, animated: false});
                }
                this.state.dataArray = [];
                this.state.pageIndex = 1;
                this.state.showFoot = 2;
                this.state.isChangeTab = true;
                this._requestOrderListData()
            }
        })
        this.refreshStatus = DeviceEventEmitter.addListener('erp_order_status_refresh', (data)=> {
            if (data === 'PaySuccess') {
                this._refresh();
            }
        });

    }

    componentWillUnmount() {
        this.tabchange && this.tabchange.remove();
        this.refreshStatus && this.refreshStatus.remove();
    }

//-----------------------------------------------METHOD---------------------------------------------

    _onCancelOrderEvent(dataArray, position, itemPosition) {
        this.state.dataArray[itemPosition] = dataArray[position];
        this.setState({})
    }

    _onReceiveEvent(type, dataArray, position, itemPosition) {
        switch (type) {
            case 'orderButtonChange':
                this._onCancelOrderEvent(dataArray, position, itemPosition);
                break
        }
    }

    _requestOrderListData(pageIndex, type, position, itemPosition) {
        let status = this.orderStatus;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        if (isEmpty(pageIndex)) {
            pageIndex = this.state.pageIndex;
        }
        paramMap.set('__cmd', 'person.erporder.getERPOrderList');
        paramMap.set("conditions", {
            pageSize:'10',
            pageIndex:pageIndex.toString(),
            status:status,
        });
        viewModel.TCPRequest(paramMap, (res)=> {
            // console.log(JSON.stringify(res))
            this.status && this.status.dismiss();
            let showFoot = 0;
            let dataArray = OrderListErpModel.getModelArray(res.result);
            if (isNotEmpty(type)) {
                this._onReceiveEvent(type, dataArray, position, itemPosition);
                return
            }
            if (isEmpty(dataArray) || this.state.pageIndex === 1 && dataArray.length === 0) {
                this.status && this.status.showEmptyOrder()
                return
            }
            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.dataArray.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);
            this.setState({
                dataArray: dataArray,
                loading: false,
                showFoot: showFoot,
                isChangeTab: false,
                isFirstTimeIn: false,
                isAfterErrorRefresh: false
            });
        }, ()=> {
            this.status && this.status.showNetError()
            this.setState({
                loading: false
            })
        }, this._needShowLoadingDialog(type));
    }


    _refresh() {
        if (isNotEmpty(this.refs.order_list) && isEmpty(this.state.refreshType)) {
            this.refs.order_list.scrollToOffset({offset: 0, animated: false});
        }
        if (isNotEmpty(this.state.refreshType)) {
            this.setState({
                loading: true
            });
        }
        this.state.refreshType = undefined;
        this.state.pageIndex = 1;
        this._requestOrderListData()
    }

    _onRefresh = () => {
        this.state.refreshType = 'pullRefresh';
        this._refresh();
    }

    _onEndReached() {
        if (this.state.showFoot !== 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this._requestOrderListData();

    }

    _afterErrorRefresh() {
        this.state.isAfterErrorRefresh = true;
        this._requestOrderListData();
    }

    _showPayDialog = (order_no)=> {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.erporder.getERPOrderDetail');
        paramMap.set('orderno', order_no);
        viewModel.TCPRequest(paramMap, (res)=> {
            let detailModel = YFWOfflineOrderDetailModel.getModelArray(res.result)
            let {navigate} = this.props.navigation;
            pushNavigation(navigate,{type:'settlement_union_member',params:{
                    storeid:detailModel.storeId,
                    orderno:order_no
                }})
        },()=>{},true)
    }

    _showTipsDialog = (bean) => {
        this.tipsDialog && this.tipsDialog._show(bean)
    }

    _showReturnDialog = (callbcak) => {
        this.returnDialog.showView(callbcak)
    }

    _refreshItemStatus(index) {
        //拿到了需要修改的条目的position
        this.state.dataArray.splice(index, 1);
        let newDataArray = this.state.dataArray
        this.setState({dataArray: newDataArray});
    }

    _refreshItemSendInfo(position) {
        if (isNotEmpty(position)) {
            this.state.dataArray[position].send_info.button_items = [];
            this.setState({})
        }
    }

    _needShowLoadingDialog(type) {
        if (this.state.isAfterErrorRefresh) {
            return false
        }
        if (this.state.isFirstTimeIn) {
            return false;
        }
        if (this.state.isChangeTab || isNotEmpty(type)) {
            return true
        }
        return false
    }
//-----------------------------------------------RENDER---------------------------------------------

    _renderHeader() {
        return <View style={{backgroundColor:'#F5F5F5',width:kScreenWidth,height:10}} />
    }

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

    _renderSplitView() {
        return <View style={{backgroundColor:'#F5F5F5',width:kScreenWidth,marginTop:10,height:10}}/>;
    }

    _renderItem = (item) => {
        return (
            <OrderListItem itemData={item}
                           pageSource={0}
                           navigation={this.props.navigation}
                           refreshItemSendInfo={(position)=>this._refreshItemSendInfo(position)}
                           _showPayDialog={(order_no)=>{this._showPayDialog(order_no)}}
                           _showTipsDialog={this._showTipsDialog}
                           _showReturnDialog={this._showReturnDialog}
                           _refreshItemStatus={(index)=>this._refreshItemStatus(index)}
                           isERPOrder={true}
            />
        );
    };

    renderContent() {
        return (
            <View style={{backgroundColor:'#F5F5F5',flex:1}}>
                <FlatList
                    keyExtractor={(item,index)=>index+""}
                    ref={(ref)=>this.order_list = ref}
                    data={this.state.dataArray}
                    refreshing={this.state.loading}
                    onRefresh={this._onRefresh.bind(this)}
                    renderItem={this._renderItem.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    ListHeaderComponent={this._renderHeader.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    ItemSeparatorComponent={this._renderSplitView.bind(this)}
                    style={{height:'100%',width:kScreenWidth,backgroundColor:'#FFFFFF'}}
                />
                <YFWPaymentDialogView ref={(dialog) => {this.PaymentDialog = dialog}}
                                      navigation={this.props.navigation}
                                      from={'ERP_order'}/>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                <ReturnTipsDialog ref={(item) => {this.returnDialog = item}}/>
            </View>
        )
    }

    render() {
        return (
            <View style={{flex:1}}>
                {this.renderContent()}
                <StatusView ref={(item)=>this.status = item}
                            navigation={this.props.navigation}
                            retry={()=>{this._afterErrorRefresh()}}/>
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