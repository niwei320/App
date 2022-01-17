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
import {itemAddKey, kScreenWidth, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import YFWPaymentDialogView from '../../OrderPay/View/YFWPaymentDialogView'
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
import {isNotEmpty, isEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import OrderListItem from './OrderListItem'
import StatusView from '../../widget/StatusView'
import OrderListModel from "./Model/OrderListModel";
import ReturnTipsDialog from '../../PublicModule/Widge/ReturnTipsDialog';
import {getItem, KIsShowReceiptLottery, kLastDateLaunchApp} from "../../Utils/YFWStorage";
import PickupCodeAlertView from './PickupCodeAlertView';
import YFWCustomTipAlertView from './OrderDetail/YFWCustomTipAlertView';


export default class OrderUnreceived extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            isChangeTab: false,
            isFirstTimeIn: true,
            isAferErrorRefresh: false,
            refreshType: undefined,
            headerTipsData:{},
            headerTipsShow:true
        }
        this.orderStatus = this.props.status;
        if (this.props.initPosition == 3) {
            this._requestOrderList();
        }
    }

    componentDidMount() {
        if (this.props.initPosition == 3) {
            this._openReceiptLottery()
        }
        this.tabchange = DeviceEventEmitter.addListener('change_tabs', (position)=> {
            if (position == 3) {
                if (isNotEmpty(this.refs.order_list)) {
                    this.refs.order_list.scrollToOffset({offset: 0, animated: false});
                }
                this.state.dataArray = [];
                this.state.pageIndex = 1;
                this.state.showFoot = 2;
                this.state.isChangeTab = true;
                this._requestOrderList()
                this._openReceiptLottery()
            }
        })


        /*  *  正常刷新条目 （申请退款,再次申请退款，取消申请退款,评价,确认收货,取消退货款(退货款详情)）
         * */
        this.refresh_status = DeviceEventEmitter.addListener('order_status_refresh', (pageSource)=> {
            if (pageSource == 3) {
                this._refresh();
            }
        });


        /*
         * 投诉
         * */
        this.complainOrder = DeviceEventEmitter.addListener('complain_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == 3) {
                this._refreshAppointItem(noticeData.itemPosition);
            }
        });
    }

    _openReceiptLottery() {
        // getItem(KIsShowReceiptLottery).then((isNotShowAgain)=> {
        //     if(!isNotShowAgain){
        //         DeviceEventEmitter.emit('showReceiptLottery', 'open')
        //     }
        // })
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
        if (this.state.isAferErrorRefresh) {
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
            this.state.headerTipsData = safeObj(res.result.order_list_ads)
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
                               pageSource={3}
                               refreshItemSendInfo={(position)=>this.refreshItemSendInfo(position)}
                               _showPayDialog={(orderNo)=>this._showPayDialog(orderNo)}
                               _showTipsDialog={this._showTipsDialog}
                               _showReturnDialog={this._showReturnDialog}
                               _showTipsAlert={this._showTipsAlert}
                               _showPickupCodeDialog={(info)=>this._showPickupCodeDialog(info)}
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

    _renderHeaderTips() {
        let data = safeObj(this.state.headerTipsData.items)
        if (safeObj(data.name).length>0) {
            return (
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:14,width:kScreenWidth,height:30,backgroundColor:'rgb(51,51,51)'}}>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={{uri:data.img_url}} style={{width:14,height:14,resizeMode:'contain'}}/>
                        <Text style={{marginLeft:10,color:'rgb(230,214,193)',fontSize:12}}>{data.name}</Text>
                    </View>
                    <TouchableOpacity style={{height:30,justifyContent:'center'}} activeOpacity={1} onPress={()=>{this.setState({headerTipsShow:false})}}>
                        <Image source={require('../../../img/ordertips_clear_icon.png')} style={{width:10,height:10,resizeMode:'contain'}}/>
                    </TouchableOpacity>
                </View>
            )
        }else{
            return null
        }
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
                {this.state.headerTipsShow?this._renderHeaderTips():null}
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
                <PickupCodeAlertView ref={e => {this.pickupCodeDialog=e}}></PickupCodeAlertView>
                <YFWCustomTipAlertView ref={e=> {this.tipAlert = e}}></YFWCustomTipAlertView>
            </View>
        )
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
     * 弹出自取码
     * @private
     */
    _showPickupCodeDialog = (info)=> {
        this.pickupCodeDialog && this.pickupCodeDialog.show(info);
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
}
