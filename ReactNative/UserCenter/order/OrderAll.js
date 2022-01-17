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
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import {itemAddKey} from "../../PublicModule/Util/YFWPublicFunction";
import YFWPaymentDialogView from '../../OrderPay/View/YFWPaymentDialogView'
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
import {PixelRatio} from 'react-native';
import {isNotEmpty, isEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import OrderListItem from './OrderListItem'
import StatusView from '../../widget/StatusView'
import OrderListModel from "./Model/OrderListModel";
import ReturnTipsDialog from '../../PublicModule/Widge/ReturnTipsDialog';
import PickupCodeAlertView from './PickupCodeAlertView';
import YFWCustomTipAlertView from './OrderDetail/YFWCustomTipAlertView';


export default class OrderAll extends Component {

    constructor(props) {
        super(props);
        this.imageScale = Platform.OS === 'ios' ? 1 : PixelRatio.get();
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            isChangeTab: false,
            isFirstTimeIn: true,
            isAferErrorRefresh: false,
            refreshType: undefined
        };
        this.orderStatus = this.props.status;
        if (this.props.initPosition == 0) {
            this._requestOrderListData();
        }

    }

    componentDidMount() {
        this.tabchange = DeviceEventEmitter.addListener('change_tabs', (position)=> {
            if (position == 0) {
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

        /*  正常刷新条目 （申请退款,再次申请退款，取消申请退款,评价,确认收货,取消退货款(退货款详情)）
         * */
        this.refresh_status = DeviceEventEmitter.addListener('order_status_refresh', (pageSource)=> {
            if (pageSource == 0 || pageSource == 'PaySuccess') {
                this._refresh();
            }
        });
        /*
         *  提交处方成功
         * */
        this.uploadrecip = DeviceEventEmitter.addListener('uploadrecip_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == 0) {
                this._refreshCancleOrder(noticeData.itemPosition)
            }
        });
        /*
         *  取消订单
         * */
        this.cancelOrder = DeviceEventEmitter.addListener('cancel_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == 0) {
                this._refreshCancleOrder(noticeData.position);
            }
        });

        /*
         *  操作商家申请延时发货
         * */

        this.delayedShipment = DeviceEventEmitter.addListener('delayed_shipment_action', (noticeData)=> {
            if (noticeData.pageSource == 0) {
                this._refreshCancleOrder(noticeData.position);
            }
        });

        /*
         * 投诉
         * */
        this.complainOrder = DeviceEventEmitter.addListener('complain_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == 0) {
                this._refreshCancleOrder(noticeData.itemPosition)
            }
        });
    }

    componentWillUnmount() {
        this.tabchange && this.tabchange.remove();
        this.cancelOrder && this.cancelOrder.remove();
        this.refresh_status && this.refresh_status.remove();
        this.uploadrecip && this.uploadrecip.remove();
        this.complainOrder && this.complainOrder.remove();
        this.delayedShipment && this.delayedShipment.remove();
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

    _needShowLoadingDialog(type) {
        if (this.state.isAferErrorRefresh) {
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


    _requestOrderListData(pageIndex, type, position, itemPosition) {
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
        }, this._needShowLoadingDialog(type));
    }

    _renderItem = (item)=> {
        return (<OrderListItem navigation={this.props.navigation} itemData={item}
                               pageSource={0}
                               refreshItemSendInfo={(position)=>this.refreshItemSendInfo(position)}
                               _showPayDialog={(orderNo)=>this._showPayDialog(orderNo)}
                               _showTipsAlert={this._showTipsAlert}
                               _showPickupCodeDialog={(info)=>this._showPickupCodeDialog(info)}
                               _showTipsDialog={this._showTipsDialog}
                               _showReturnDialog={this._showReturnDialog}
                               _refreshItemStatus={(index)=>this._refreshItemStatus(index)}/>);
    };

    _refreshItemStatus(index) {

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
        this._requestOrderListData();

    }

    afretErrorRefresh() {
        this.state.isAferErrorRefresh = true;
        this._requestOrderListData();
    }

    render() {
        return (
            <View style={{flex:1}}>
                {this.renderContent()}
                <StatusView ref={(item)=>this.status = item} retry={()=>{
                    this.afretErrorRefresh()}} navigation={this.props.navigation}/>
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
        this._requestOrderListData()
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
                                      navigation={this.props.navigation} from={'orderList'}/>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                <ReturnTipsDialog ref={(item) => {this.returnDialog = item}}/>
                <YFWCustomTipAlertView ref={e=> {this.tipAlert = e}}></YFWCustomTipAlertView>
                <PickupCodeAlertView ref={e => {this.pickupCodeDialog=e}}></PickupCodeAlertView>
            </View>
        )
    }
    /**
     * 弹出自取码
     * @private
     */
    _showPickupCodeDialog = (info)=> {
        this.pickupCodeDialog && this.pickupCodeDialog.show(info);
    }
    /**
     * 弹出提示框
     * @param bean
     * @private
     */
    _showTipsAlert = (title,msg,actions) => {
        this.tipAlert && this.tipAlert.showView(title,msg,actions)
    }
    /**
     * 弹出支付框
     * @private
     */
    _showPayDialog = (order_no)=> {
        this.PaymentDialog && this.PaymentDialog.show(order_no);
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

    refreshItemSendInfo(position) {
        if (isNotEmpty(position)) {
            this.state.dataArray[position].send_info.button_items = [];
            this.setState({})
        }
    }

    /* 取消订单成功后 刷新列表
     * */
    _refreshCancleOrder(itemPosition) {

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
        this._requestOrderListData(pageIndex, 'orderButtonChange', position, itemPosition);
    }
}
