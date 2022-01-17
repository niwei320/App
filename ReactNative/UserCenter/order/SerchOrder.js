/**
 * Created by admin on 2018/8/2.
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
    ImageBackground,
    ScrollView,
    DeviceEventEmitter,
    Keyboard,
    FlatList,
    Platform,
    BackAndroid,
    NativeModules,
} from 'react-native';
const {StatusBarManager} = NativeModules;
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import SerchHeader from '../../PublicModule/Widge/SerchHeader'
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWPaymentDialogView from '../../OrderPay/View/YFWPaymentDialogView'
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
import YFWOrderEmptyView from "../../widget/YFWOrderEmptyView";
import {PixelRatio} from 'react-native';
import {isNotEmpty, isEmpty, itemAddKey, safe} from '../../PublicModule/Util/YFWPublicFunction'
import OrderListItem from './OrderListItem'
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import OrderListModel from './Model/OrderListModel'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWShopDetailGoodsListHeader from "../../FindYao/View/YFWShopDetailGoodsListHeader"
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import YFWCustomTipAlertView from './OrderDetail/YFWCustomTipAlertView';
import PickupCodeAlertView from './PickupCodeAlertView';
import ReturnTipsDialog from '../../PublicModule/Widge/ReturnTipsDialog';
export default class SerchOrder extends Component {

    static navigationOptions = ({navigation}) => ({
        headerTitle: <SerchHeader onSerchClick={(text)=>navigation.state.params.searchMethod(text)}
                                                   placeholder="订单编号/商品名/商家名称"
                                                   tipsText="搜索"/>,
        headerRight: null,
        tabBarVisible: false,
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0},
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:40,height:40,}]}
                              onPress={()=>navigation.state.params.backMethod()}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={ require('../../../img/top_back_white.png')}
                       defaultSource={require('../../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerBackground: <Image source={require('../../../img/Status_bar.png')} style={{width:width, flex:1, resizeMode:'stretch'}}/>,
    });

    constructor(props) {
        super(props);
        _this = this;
        this.keyBoardIsShow = false;
        this.state = {
            keyWord: '',
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            afterSerch: false,
            refreshType: undefined,
            isRefresh: false
        }
        this.onBackAndroid = this.onBackAndroid.bind(this)
        this.listener();
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
                }
            }
        );
        this.didBlur = this.props.navigation.addListener('didBlur',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
                }
            }
        );
    }

    onRightTvClick = (text) => {
        this.keyBoardIsShow = true;
        this.state.dataArray = [];
        this.state.pageIndex = 1;
        this.state.keyWord = text;
        this._requestOrderSearchListData();
        this.lostBlur();
    }

    componentWillMount() {
        this.props.navigation.setParams({backMethod: this._backMethod});
        this.props.navigation.setParams({searchMethod: this.onRightTvClick});
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);


        /*  *  正常刷新条目 （申请退款,再次申请退款，取消申请退款,评价,确认收货,取消退货款(退货款详情)）
         * */
        this.refresh_status = DeviceEventEmitter.addListener('order_status_refresh', (pageSource)=> {
            if (pageSource == 6 || pageSource == 'PaySuccess') {
                this._refresh();
            }
        });
        /*
         *  提交处方成功
         * */
        this.uploadrecip = DeviceEventEmitter.addListener('uploadrecip_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == 6) {
                this._refreshCancleOrder(noticeData.itemPosition);
            }
        });
        /*
         *  取消订单
         * */
        this.cancelOrder = DeviceEventEmitter.addListener('cancel_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == 6) {
                this._refreshCancleOrder(noticeData.position);
            }
        });

        /*
         * 投诉
         * */
        this.complainOrder = DeviceEventEmitter.addListener('complain_order_status_refresh', (noticeData)=> {
            if (noticeData.pageSource == 6) {
                this._refreshCancleOrder(noticeData.itemPosition);
            }
        });

        /*
         *  操作商家申请延时发货
         * */

        this.delayedShipment = DeviceEventEmitter.addListener('delayed_shipment_action', (noticeData)=> {
            if (noticeData.pageSource == 6) {
                this._refreshCancleOrder(noticeData.position);
            }
        });
    }

    _backMethod = ()=> {
        this.props.navigation.state.params.state.callBack();
        this.props.navigation.goBack();
    }

    onBackAndroid = ()=> {
        this._backMethod();
        return true;
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
        this._requestOrderSearchListData(pageIndex, 'orderButtonChange', position, itemPosition);
    }


    componentWillUnmount() {
        this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
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

    //Action

    _requestOrderSearchListData(pageIndex, type, position, itemPosition) {
        let status = this.orderStatus;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getPageData');
        paramMap.set('keywords', safe(this.state.keyWord))
        paramMap.set('pageSize', 10);
        paramMap.set('del_status', 0);
        paramMap.set('isApp', 1);
        if (isEmpty(pageIndex)) {
            paramMap.set('pageIndex', this.state.pageIndex);
        } else {
            paramMap.set('pageIndex', pageIndex);
        }
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isEmpty(res.result)) {
                return
            }
            let showFoot = 0;
            let dataArray = OrderListModel.getModelArray(res.result);
            if (isNotEmpty(type)) {
                this._onReceiveEvent(type, dataArray, position, itemPosition);
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
                showFoot: showFoot,
                bottomTipArray: dataArray.button_items,
                afterSerch: true,
                loading: false,
                isRefresh: false
            });
        }, (error)=> {
            this.setState({
                loading: false,
                isRefresh: false
            })
        }, this._renderLoadingDialog());
    }

    _renderLoadingDialog() {
        if (this.state.isRefresh) {
            return false
        }
        if (this.state.pageIndex == 1) {
            return true;
        }
        return false
    }

    _keyboardDidShow() {
        this.keyBoardIsShow = true;
    }

    _keyboardDidHide() {
        this.keyBoardIsShow = false;
    }

    _onEndReached() {
        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this._requestOrderSearchListData();

    }


    _renderFooter() {

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

    _renderHeader() {
        return (<ImageBackground source={require('../../../img/Status_bar.png')} style={{width:width, height:14,}}>
                    <View style={{backgroundColor:'#ffffff',height:14,borderTopLeftRadius:7, borderTopRightRadius:7}}></View>
                </ImageBackground>)
    }

    clickItem(item) {
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_order_detail', value: this.state.dataArray[item.index].order_no})
    }

    _jumpToShopDetail(id) {
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_shop_detail', value: id})
    }


    _renderShopTitel(item) {
        let tWith;
        let resultLength = item.item.shop_title.length * 14;
        if (resultLength > width - 20 - 12 - 5 - 13 * 6 - 25 - 14) {
            if (Platform.OS == 'android') {
                tWith = width - 20 - 12 - 5 - 14 * 6 - 25
            } else {
                tWith = width - 20 - 12 - 5 - 14 * 6 - 25 - 14
            }
        } else {
            tWith = resultLength + 14;
        }
        return (
            <Text style={{fontSize:14,color:'#333333',marginLeft:5,textAlign:'center',alignSelf:'center',width:tWith}}
                  numberOfLines={1}>
                {item.item.shop_title + '  '}
            </Text>
        )
    }

    _renderItem = (item)=> {
        return (<OrderListItem navigation={this.props.navigation} itemData={item}
                               pageSource={6}
                               refreshItemSendInfo={(position)=>this.refreshItemSendInfo(position)}
                               _showPayDialog={(orderNo)=>this._showPayDialog(orderNo)}
                               _showTipsAlert={this._showTipsAlert}
                               _showPickupCodeDialog={(info)=>this._showPickupCodeDialog(info)}
                               _showReturnDialog={this._showReturnDialog}
                               _showTipsDialog={this._showTipsDialog}
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

    render() {
        if (this.state.afterSerch) {
            return (<View style={{flex:1}}>
                <AndroidHeaderBottomLine/>
                {this.renderContentView()}
            </View>)
        } else {
            return (
                <View style={{flex:1}}>
                    <AndroidHeaderBottomLine/>
                    <View style={{width:width,height:height-50,backgroundColor:'#f5f5f5'}}/>
                </View>)
        }


    }

    onRefresh = () => {
        this.state.refreshType = 'pullRefresh';
        this.state.isRefresh = true
        this._refresh();
    }

    _refresh() {
        if (isNotEmpty(this.state.refreshType)) {
            this.setState({
                loading: true
            });
        }
        this.state.refreshType = undefined;
        this.state.pageIndex = 1;
        this._requestOrderSearchListData();
    }

    _splitView() {
        return (<View style={{backgroundColor:'#F5F5F5',width:width,marginTop:10}} height={10}/>)
    }

    _renderBodyView() {

        return (<View style={{backgroundColor:'#F5F5F5',flex:1}}>
            <ImageBackground source={require('../../../img/Status_bar.png')} style={{width:width, height:14,}}>
                    <View style={{backgroundColor:'#ffffff',height:14,borderTopLeftRadius:7, borderTopRightRadius:7}}></View>
            </ImageBackground>
            <FlatList
                ref='order_list'
                style={{width:width,backgroundColor:'#FFFFFF'}}
                ItemSeparatorComponent={this._splitView}
                data={this.state.dataArray}
                renderItem={this._renderItem}
                // ListHeaderComponent={this._renderHeader.bind(this)}
                ListFooterComponent={this._renderFooter.bind(this)}
                keyExtractor={(item,index)=>index+""}
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
        </View>)
    }

    lostBlur() {
        //退出软件盘
        if (this.keyBoardIsShow) {
            Keyboard.dismiss();
        }
    }


    renderContentView() {
        if (this.state.dataArray.length > 0) {
            return (
                <View style={{flex:1}}>
                    {this._renderBodyView()}
                </View>
            )
        } else {
            return (
                <View style={{width:width,height:height}}>
                    <YFWOrderEmptyView navigation={this.props.navigation} type='serch'/>
                </View>
            )
        }
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

    _showReturnDialog = (callbcak) => {
        this.returnDialog.showView(callbcak)
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

}



