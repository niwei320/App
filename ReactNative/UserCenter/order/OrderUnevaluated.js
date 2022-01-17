/**
 * Created by admin on 2018/6/5.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    FlatList,
    Platform,
    DeviceEventEmitter
} from 'react-native';
const width = Dimensions.get('window').width;
import OrderListItem from './OrderListItem'
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import {itemAddKey} from "../../PublicModule/Util/YFWPublicFunction";
import YFWPaymentDialogView from '../../OrderPay/View/YFWPaymentDialogView'
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
import {isNotEmpty, isEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import StatusView from '../../widget/StatusView'
import OrderListModel from "./Model/OrderListModel";
import ReturnTipsDialog from '../../PublicModule/Widge/ReturnTipsDialog';

export default class OrderUnevaluated extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            isChangeTab: false,
            isFirstTimeIn: true,
            afretErrorRefresh: false,
            refreshType: undefined
        }
        this.orderStatus = this.props.status;
        if (this.props.initPosition == 4) {
            this._requestOrderList();
        }
    }

    componentDidMount() {
        this.tabchange = DeviceEventEmitter.addListener('change_tabs', (position)=> {
            if (position == 4) {
                if (isNotEmpty(this.refs.order_list)) {
                    this.refs.order_list.scrollToOffset({offset: 0, animated: false});
                }
                this.state.dataArray = [];
                this.state.pageIndex = 1;
                this.state.showFoot = 2;
                this.state.isChangeTab = true;
                this._requestOrderList()
            }
        })


        /*  *  正常刷新条目 （申请退款,再次申请退款，取消申请退款,评价,确认收货,取消退货款(退货款详情)）
         * */
        this.refresh_status = DeviceEventEmitter.addListener('order_status_refresh', (pageSource)=> {
            if (pageSource == 4) {
                this._refresh();
            }
        });
        /*
         * 投诉
         * */
        this.complainOrder = DeviceEventEmitter.addListener('complain_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == 4) {
                this._refreshAppointItem(noticeData.itemPosition);
            }
        });
    }

    _refreshAppointItem(itemPosition) {
        if (isEmpty(itemPosition))return
        //计算position处于哪一页 计算pageIndex
        let pageIndex, position;
        if (Number.isInteger(itemPosition / 10)) {
            pageIndex = itemPosition / 10 + 1;
            position = 0;
        } else {
            pageIndex = Math.ceil(itemPosition / 10)
            position = itemPosition % 10;
        }
        this._requestOrderList(pageIndex, 'orderButtonChange', position, itemPosition);
    }

    componentWillUnmount() {
        this.tabchange && this.tabchange.remove();
        this.refresh_status && this.refresh_status.remove();
        this.complainOrder && this.complainOrder.remove();
    }

    _needShowLoadingDialog(type) {
        if (this.state.afretErrorRefresh) {
            return false
        }
        if (this.state.isFirstTimeIn) {
            return false
        }
        if (this.state.isChangeTab || isNotEmpty(type)) {
            return true
        }
        return false
    }

    _onReceiveEvent(type, dataArray, position, itemPosition) {
        switch (type) {
            case 'orderButtonChange':
                this._onCancelOrderEvent(dataArray, position, itemPosition);
                break
        }
    }

    _onCancelOrderEvent(dataArray, position, itemPosition) {
        let newItemData = dataArray[position];
        this.state.dataArray[itemPosition] = newItemData;
        this.setState({})
    }

    _requestOrderList(pageIndex, type, position, itemPosition) {
        let status = this.orderStatus;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getPageData');
        paramMap.set('order_status', status);
        paramMap.set('del_status', 0);
        paramMap.set('pageSize', 10);
        paramMap.set('isApp', 1);
        if (isEmpty(pageIndex)) {
            paramMap.set('pageIndex', this.state.pageIndex);
        } else {
            paramMap.set('pageIndex', pageIndex);
        }
        viewModel.TCPRequest(paramMap, (res)=> {
            this.status && this.status.dismiss();
            let showFoot = 0;
            let dataArray = OrderListModel.getModelArray(res.result);
            if (isNotEmpty(type)) {
                this._onReceiveEvent(type, dataArray, position, itemPosition);
                return
            }
            if (this.state.pageIndex == 1 && dataArray.length == 0) {
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
                isAferErrorRefresh: false
            });
        }, (error)=> {
            this.status && this.status.showNetError()
            this.setState({
                loading: false
            })
        }, this._needShowLoadingDialog());
    }


    _renderItem = (item)=> {
        return (<OrderListItem navigation={this.props.navigation} itemData={item}
                               pageSource={4}
                               refreshItemSendInfo={(position)=>this.refreshItemSendInfo(position)}
                               _showPayDialog={(orderNo)=>this._showPayDialog(orderNo)}
                               _showTipsDialog={this._showTipsDialog}
                               _showReturnDialog={this._showReturnDialog}
                               _refreshItemStatus={(index)=>this._refreshItemStatus(index)}/>);

    };

    refreshItemSendInfo(position) {
        if (isNotEmpty(position)) {
            this.state.dataArray[position].send_info.button_items = [];
            this.setState({})
        }
    }

    _refreshItemStatus(index) {
        //拿到了需要修改的条目的position
        var newDataArray = []
        this.state.dataArray.splice(index, 1);
        newDataArray = this.state.dataArray
        this.setState({dataArray: newDataArray});
    }

    _splitView() {
        return (
            <View style={{backgroundColor:'#F5F5F5',width:width,marginTop:10}} height={10}/>
        );
    }

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot} from = {'order'}/>
    }

    _renderHeader() {
        return <View style={{backgroundColor:'#F5F5F5',width:width}} height={10}/>
    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this._requestOrderList();

    }

    afretErrorRefresh() {
        this.state.isAferErrorRefresh = true;
        this._requestOrderList();
    }

    render() {
        return (
            <View style={{flex:1}}>
                {this.renderContent()}
                <StatusView ref={(item)=>this.status = item} retry={()=>{
                    this.afretErrorRefresh() }} navigation={this.props.navigation}/>
            </View>)
    }

    onRefresh = () => {
        this.state.refreshType = 'pullRefresh';
        this._refresh();
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
        this._requestOrderList()
    }


    renderContent() {
        return (
            <View style={{backgroundColor:'#F5F5F5',flex:1}}>
                <FlatList
                    ref='order_list'
                    style={{width:width,backgroundColor:'#FFFFFF'}}
                    ItemSeparatorComponent={this._splitView}
                    data={this.state.dataArray}
                    renderItem={this._renderItem}
                    keyExtractor={(item,index)=>index+""}
                    ListHeaderComponent={this._renderHeader.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    onRefresh={this.onRefresh}
                    refreshing={this.state.loading}
                >
                </FlatList>
                <YFWPaymentDialogView ref={(dialog) => { this.PaymentDialog = dialog; }}
                                      navigation={this.props.navigation}/>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                <ReturnTipsDialog ref={(item) => {this.returnDialog = item}}/>
            </View>
        )
    }

    /**
     * 弹出支付框
     * @private
     */
    _showPayDialog = (order_no)=> {
        this.PaymentDialog.show(order_no);
    }

    /**
     * 弹出提示框
     * @param bean
     * @private
     */
    _showTipsDialog = (bean) => {
        this.tipsDialog && this.tipsDialog._show(bean)
    }

    _showReturnDialog = (callbcak) => {
        this.returnDialog.showView(callbcak)
    }
}
