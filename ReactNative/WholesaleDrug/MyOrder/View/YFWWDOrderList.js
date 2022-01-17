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
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent'
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel';
import {
    adaptSize,
    itemAddKey,
    kScreenHeight, kScreenWidth,
    kStyleWholesale, payOrderTip, safe, safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";
import BaseTipsDialog from "../../../PublicModule/Widge/BaseTipsDialog";
import {isNotEmpty, isEmpty} from '../../../PublicModule/Util/YFWPublicFunction'
import StatusView from '../../../widget/StatusView'
import ReturnTipsDialog from '../../../PublicModule/Widge/ReturnTipsDialog';
import YFWWDOrderListItem from "./YFWWDOrderListItem";
import YFWWDOrderListModel from "../Model/YFWWDOrderListModel";
import YFWToast from "../../../Utils/YFWToast";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {YFWImageConst} from "../../Images/YFWImageConst";
import YFWWDPaymentDialogView from "../../OrderSettle/View/YFWWDPaymentDialogView";
import YFWWDMergePayBottomView from '../../Widget/View/YFWWDMergePayBottomView';


export default class YFWWDOrderList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            loading: false,
            pageIndex: 1,
            showFoot: 2,

            isChangeTab: false,
            isFirstTimeIn: true,
            isAfterErrorRefresh: false,

            headerTipsData:{},
            headerTipsShow:true
        };
        this.pageSource = this.props.pageSource
        this.orderStatus = this.props.status;
        this.keyWord = this.props.keyWord;

        if(this.props.from !== 'searchOrder'){
            if (this.props.initPosition === this.pageSource) {
                this._requestOrderListData();
            }
        }

    }

    componentDidMount() {
        this.tabchange = DeviceEventEmitter.addListener('change_tabs', (position)=> {
            if (position == this.pageSource) {
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

        /*  正常刷新条目 （申请退款,再次申请退款，取消申请退款,评价,确认收货,取消退货款(退货款详情)）*/
        this.refresh_status = DeviceEventEmitter.addListener('order_status_refresh', (pageSource)=> {
            if (pageSource == this.pageSource || pageSource == 'PaySuccess') {
                this._refreshAndGoTop();
            }
        });

        /* 取消订单 */
        this.cancelOrder = DeviceEventEmitter.addListener('cancel_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == this.pageSource) {
                if(this.pageSource === 1){
                    this._deleteSingleItem()
                } else {
                    this._refreshSingleItem(noticeData.position);
                }
            }
        });

        /* 操作商家申请延时发货 */
        this.delayedShipment = DeviceEventEmitter.addListener('delayed_shipment_action', (noticeData)=> {
            if (noticeData.pageSource == this.pageSource) {
                this._refreshSingleItem(noticeData.position);
            }
        });

        /* 投诉 */
        this.complainOrder = DeviceEventEmitter.addListener('complain_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == this.pageSource) {
                this._refreshSingleItem(noticeData.itemPosition)
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

    _requestOrderListData(pageIndex, position, itemPosition) {
        let status = this.orderStatus;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.getPageData');
        paramMap.set('order_status', status);
        paramMap.set('keywords', safe(this.keyWord))
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
            let dataArray = YFWWDOrderListModel.getModelArray(res.result);
            if (isNotEmpty(position)) {
                this._changeSingleItem(dataArray, position, itemPosition);
                return
            }
            if (this.state.pageIndex == 1 && dataArray.length === 0) {
                this.status && this.status.showEmptyOrder()
                return
            }
            if (dataArray.length < 10) {
                showFoot = 1;
            } else {
                showFoot = 2;
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
                isAfterErrorRefresh: false,
            });
        }, (error)=> {
            this.status && this.status.showNetError()
            this.setState({
                loading: false
            })
        }, this._needShowLoadingDialog(isNotEmpty(position)));
    }

    _changeSingleItem(newDataArray, position, itemPosition) {
        this.state.dataArray[itemPosition] = newDataArray[position];
        this.setState({})
    }

    _deleteSingleItem(index) {
        //拿到了需要修改的条目的position
        this.state.dataArray.splice(index, 1);
        var newDataArray = this.state.dataArray;
        this.setState({dataArray: newDataArray});
        if (newDataArray.length === 0) {
            this.status && this.status.showEmptyOrder();
        }
    }

    _needShowLoadingDialog(isChangeSingle) {
        if (this.state.isAfterErrorRefresh) {
            return false
        }
        if (this.state.isFirstTimeIn) {
            return false;
        }
        if (this.state.isChangeTab || isChangeSingle) {
            return true
        }
        return false
    }
    _searchOrderMethod(keyWords) {
        this.state.dataArray = [];
        this.state.pageIndex = 1;
        this.keyWord = keyWords;
        this.status && this.status.showLoading()
        this._requestOrderListData();
    }
    _refreshSingleItem(itemPosition) {

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
        this._requestOrderListData(pageIndex, position, itemPosition);
    }

    /* 去除单个Item*/
    _refreshItemStatus(index) {
        this.state.dataArray.splice(index, 1);
        let newDataArray = this.state.dataArray
        this.setState({dataArray: newDataArray});
    }

    /* 清空Item延期请求*/
    refreshItemSendInfo(position) {
        if (isNotEmpty(position)) {
            this.state.dataArray[position].send_info.button_items = [];
            this.setState({})
        }
    }

    onRefresh() {
        this.state.loading = true
        this.setState({
            loading: true
        });
        this._refreshAndGoTop();
    }

    _refreshAndGoTop() {
        if (isNotEmpty(this.refs.order_list) && !this.state.loading) {
            this.refs.order_list.scrollToOffset({offset: 0, animated: false});
        }
        this.state.pageIndex = 1;
        this._requestOrderListData()
    }

    _onEndReached() {
        if (this.state.showFoot != 1) {
            this.state.pageIndex++;
            this.setState({
                showFoot: 2
            });
            this._requestOrderListData();
        }
    }

    afterErrorRefresh() {
        this.state.isAfterErrorRefresh = true;
        this._requestOrderListData();
    }

    _mergeToPay(orderArray) {
        if(orderArray.length>0){
            this.PaymentDialog.show(orderArray,true)
        }else{
            YFWToast('请至少选择一个订单支付!')
        }
    }

    _showPayDialog = (order_no)=> {
        this.PaymentDialog.show(order_no);
    }

    _showTipsDialog = (bean) => {
        this.tipsDialog && this.tipsDialog._show(bean)
    }

    _showReturnDialog = (callbcak) => {
        this.returnDialog.showView(callbcak)
    }

//==============================================RENDER==============================================

    _renderSplitView() {
        return <View style={{backgroundColor:'#FAFAFA',width:width,marginTop:10}} height={10}/>
    }

    _renderHeader() {
        return <View style={{backgroundColor:'#FAFAFA',width:width}} height={10}/>
    }

    _renderItem = (item)=> {
        return (
            <YFWWDOrderListItem navigation={this.props.navigation} itemData={item}
                                pageSource={this.pageSource}
                                refreshItemSendInfo={(position)=>this.refreshItemSendInfo(position)}
                                _showPayDialog={(orderNo)=>this._showPayDialog(orderNo)}
                                _showTipsDialog={this._showTipsDialog}
                                _showReturnDialog={this._showReturnDialog}
                                _refreshSelectState = {()=>{this.setState({});}}
                                _refreshItemStatus={(index)=>this._refreshItemStatus(index)}/>
        );
    };

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>
    }

    _renderPayOrderTip() {
        switch (this.orderStatus) {
            case 'unpaid':
                return (
                    <View style={[BaseStyles.leftCenterView,{backgroundColor: "#faf8dc",width: kScreenWidth,paddingVertical:adaptSize(8),paddingHorizontal:adaptSize(22)}]}>
                        <Text style = {{lineHeight:adaptSize(15),fontSize: 13, color:'rgb(254,172,76)'}} numberOfLines={2}>{payOrderTip}</Text>
                    </View>
                )
            case 'unsent':
            case 'unreceived':
                let data = safeObj(this.state.headerTipsData.items)
                if(this.state.headerTipsShow && safeObj(data.name).length>0){
                    return (
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:14,width:kScreenWidth,height:30,backgroundColor:'rgb(51,51,51)'}}>
                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                <Image source={{uri:data.img_url}} style={{width:14,height:14,resizeMode:'contain'}}/>
                                <Text style={{marginLeft:10,color:'rgb(230,214,193)',fontSize:12}}>{data.name}</Text>
                            </View>
                            <TouchableOpacity style={{height:30,justifyContent:'center'}} activeOpacity={1} onPress={()=>{this.setState({headerTipsShow:false})}}>
                                <Image source={YFWImageConst.Icon_order_tips_clear_icon} style={{width:10,height:10,resizeMode:'contain'}}/>
                            </TouchableOpacity>
                        </View>
                    )
                } else{
                    return null
                }

        }
    }

    render() {
        return (
            <View style={{flex:1}}>
                <View style={{backgroundColor:'#FAFAFA',flex:1}}>
                    {this._renderPayOrderTip()}
                    <FlatList
                        ref='order_list'
                        style={{width:width,backgroundColor:'#FFFFFF'}}
                        data={this.state.dataArray}
                        keyExtractor={(item,index)=>index+""}
                        ListHeaderComponent={this._renderHeader.bind(this)}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        ItemSeparatorComponent={this._renderSplitView.bind(this)}
                        renderItem={this._renderItem.bind(this)}
                        onRefresh={this.onRefresh.bind(this)}
                        refreshing={this.state.loading}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1}
                    />
                    {this.orderStatus==='unpaid'?
                        <YFWWDMergePayBottomView
                            allData={this.state.dataArray}
                            _refreshSelectState = {()=>{this.setState({})}}
                            toPay={(orderArray)=>this._mergeToPay(orderArray)}/>
                        :null
                    }
                    <YFWWDPaymentDialogView ref={(dialog) => { this.PaymentDialog = dialog; }}
                                          navigation={this.props.navigation} from={'orderList'}/>
                    <BaseTipsDialog ref={(item) => {this.tipsDialog = item}} from={kStyleWholesale}/>
                    <ReturnTipsDialog ref={(item) => {this.returnDialog = item}} from={kStyleWholesale}/>
                </View>
                <StatusView ref={(item)=>this.status = item} retry={()=>{
                    this.afterErrorRefresh()}} navigation={this.props.navigation}/>
            </View>
        )
    }
}
