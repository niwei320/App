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
    DeviceEventEmitter,
    NativeModules,
    Platform,
    AppState
} from 'react-native';

import ScrollableTabView, {ScrollableTabBar,} from 'react-native-scrollable-tab-view';
import OrderAll from './order/OrderAll'
import OrderUnpay from './order/OrderUnpay'
import OrderUnsend from './order/OrderUnsend'
import OrderUnreceived from './order/OrderUnreceived'
import OrderUnevaluated from './order/OrderUnevaluated'
import OrderRenturn from './order/OrderRenturn'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {darkStatusBar,isNotEmpty,kScreenWidth,dismissKeyboard_yfw,isIphoneX} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWScrollableTabBar from '../PublicModule/Widge/YFWScrollableTabBar'
import YFWMore from '../widget/YFWMore';
import {orangeColor} from '../Utils/YFWColor'
import OrderOffline from "./order/OrderOffline";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import ModalView from "../widget/ModalView";
const {StatusBarManager} = NativeModules;
export default class MyOrder extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        header: null
    });

    constructor(props) {
        super(props);
        this.state = {
            pageSource:undefined,
            notificationNotice: false,
            orderType:0,
        }
        darkStatusBar();
        this.listener();
    }

    componentWillUnmount() {
        this.didFocus && this.didFocus.remove()
        this.showReceiptLottery && this.showReceiptLottery.remove()
        this.appStateListener&&this.appStateListener.removeEventListener()
    }

    onRightTvClick() {
        YFWNativeManager.mobClick('account-order-search');
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_order_search',callBack:()=>{this._seachOrderCallBack()}})
    }

    _seachOrderCallBack(){
        DeviceEventEmitter.emit('change_tabs', this.state.pageSource)
    }

    _onOrderTypeChange(i) {
        this.setState({
            orderType:i
        })
    }

    _changerType(i) {
        this.state.pageSource = i;
        DeviceEventEmitter.emit('change_tabs', i)
    }
    _changerERPOrderType(i) {
        this.state.pageSource = i;
        DeviceEventEmitter.emit('changer_erp_tabs', i)
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._updateNotificationStatus()
            }
        );
        this.appStateListener = AppState.addEventListener('change', (state)=>{
            if (state == 'active'){
                this._updateNotificationStatus()
            }
        })
        this.showReceiptLottery = DeviceEventEmitter.addListener('showReceiptLottery', (msg) => {
                this.receiptLotteryModal && this.receiptLotteryModal.show()
            }
        );
    }

    _updateNotificationStatus() {
        YFWNativeManager.isOpenNotification((openStatus) => {
            this.setState({
                notificationNotice: !openStatus
            })
        })
    }

    render() {
        let page = 0;
        if(isNotEmpty(this.props.navigation.state.params.state.value)&&'[object Number]' === Object.prototype.toString.call(this.props.navigation.state.params.state.value)){
            page = this.props.navigation.state.params.state.value;
        }
        //let page = this.props.navigation.state.params.state.value;
        this.state.pageSource = page;
        let tabNames =['商城订单','零售订单'];
        let onlineTabNames =['全部','待付款','待发货','待收货','待评价','退货/款'];
        let offlineOrderTabNames =['全部','待付款','已付款'];
        let isShowOfflineOrder = YFWUserInfoManager.ShareInstance().isShopMember();//显示零售订单
        return (
            <View style={styles.container}>
                {this._renderReceiptLotteryModal()}
                {this._renderNavigationHeader()}
                {this._renderNotificationView()}
                <View style={{flex:1}}>
                    {isShowOfflineOrder?
                        <ScrollableTabView
                            style={styles.pagerView}
                            tabBarPosition = 'top'
                            initialPage={0}
                            onScroll={()=>{}}
                            tabBarBackgroundColor='#FFFFFF'
                            tabBarActiveTextColor='#16c08e'
                            // tabBarUnderlineStyle={styles.lineStyle}
                            renderTabBar={() => <YFWScrollableTabBar tabNames={tabNames} width={kScreenWidth/2}/>}
                            onChangeTab={(obj) => {this._onOrderTypeChange(obj.i)}}
                        >
                            {this._renderOnlineOrderList(page,onlineTabNames,'greenBg')}
                            {this._renderOfflineOrderList(offlineOrderTabNames,'greenBg')}
                        </ScrollableTabView>
                        :
                        this._renderOnlineOrderList(page,onlineTabNames)
                    }
                </View>
            </View>
        )
    }
    _renderOnlineOrderList(page,tabNames, tabStyle) {
        return (
                <ScrollableTabView
                    style={styles.pagerView}
                    tabBarPosition = 'top'
                    initialPage={page}
                    tabBarBackgroundColor='#FFFFFF'
                    tabBarActiveTextColor='#16c08e'
                    // tabBarUnderlineStyle={styles.lineStyle}
                    renderTabBar={() => <YFWScrollableTabBar tabStyle={tabStyle} tabNames={tabNames}/>}
                    onChangeTab={(obj) => {this._changerType(obj.i);}}
                >
                    <OrderAll tabLabel='全部' status={''} initPosition={page} navigation={this.props.navigation}/>
                    <OrderUnpay tabLabel='待付款' status={'unpaid'} initPosition={page}
                                navigation={this.props.navigation}/>
                    <OrderUnsend tabLabel='待发货' status={'unsent'} initPosition={page}
                                 navigation={this.props.navigation}/>
                    <OrderUnreceived tabLabel='待收货' status={'unreceived'} initPosition={page}
                                     navigation={this.props.navigation}/>
                    <OrderUnevaluated tabLabel='待评价' status={'unevaluated'} initPosition={page}
                                      navigation={this.props.navigation}/>
                    <OrderRenturn tabLabel='退货/款' status={'return_goods'} initPosition={page}
                                  navigation={this.props.navigation}/>
                </ScrollableTabView>
        )
    }

    _renderOfflineOrderList(tabNames, tabStyle) {
        return (
                <ScrollableTabView
                    style={styles.pagerView}
                    tabBarPosition = 'top'
                    initialPage={0}
                    tabBarBackgroundColor='#FFFFFF'
                    tabBarActiveTextColor='#16c08e'
                    // tabBarUnderlineStyle={styles.lineStyle}
                    renderTabBar={() => <YFWScrollableTabBar tabNames={tabNames} tabStyle={tabStyle} width={kScreenWidth/3}/>}
                    onChangeTab={(obj) => {this._changerERPOrderType(obj.i);}}
                >
                    <OrderOffline tabLabel='全部' status={''} navigation={this.props.navigation}/>
                    <OrderOffline tabLabel='待付款' status={'10'} navigation={this.props.navigation}/>
                    <OrderOffline tabLabel='待发货' status={'14'} navigation={this.props.navigation}/>
                </ScrollableTabView>
        )
    }

    _close() {
        this.receiptLotteryModal && this.receiptLotteryModal.disMiss()
    }
    _renderReceiptLotteryModal() {
        return (
            <ModalView
                ref={(item)=>this.receiptLotteryModal = item}
                onRequestClose={()=>{}}
            >
                <View style={styles.dialogView}>
                    <TouchableOpacity style={styles.closeIcon} onPress={this._close.bind(this)}>
                        <Image style={{width:279,height:342}} resizeMode={'contain'} resizeMethod={'resize'} source={require('../../img/img_receipt_lotter.png')} />
                    </TouchableOpacity>
                </View>
            </ModalView>
        )
    }
    _renderNotificationView() {
        if (this.state.notificationNotice) {
            return(
                <TouchableOpacity activeOpacity={1} onPress={() => {this._openNotification()}} style={{height: 30, flexDirection:'row', backgroundColor:"#faf8dc",paddingHorizontal:13, alignItems:'center',justifyContent:'space-between'}}>
                    <Text style={{fontSize:13, color:orangeColor()}}>打开通知，随时接收订单状态</Text>
                    <View style={{flexDirection:"row",alignItems:'center'}}>
                        <Text style={{fontSize:13, color:orangeColor()}}>去开启</Text>
                        <Image source={require('../../img/icon_arrow_y.png')} style={{width:6,height:10}}></Image>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    _openNotification() {
        YFWNativeManager.startAppSettings()
    }

    _renderNavigationHeader() {
        let navHeight = 64
        if(Platform.OS == 'android'){
            navHeight = Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50
        }else {
            navHeight = isIphoneX() ? 88 : 64
        }
        return(
            <View style={{width:kScreenWidth,height:navHeight,zIndex:100}}>
                <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
                <View style={{flex:1,flexDirection:'row',alignItems:'center',position:'absolute',left:0,right:0,bottom:0,height:44}}>
                    <TouchableOpacity
                        style={[BaseStyles.item,{width:44,height:44,marginRight:44}]}
                        onPress={()=>{
                            this.props.navigation.state.params.state.gobackKey?this.props.navigation.goBack(navigation.state.params.state.gobackKey):this.props.navigation.goBack();
                        }}>
                        <Image style={{width:12,height:21,resizeMode:'stretch'}}
                            source={ require('../../img/top_back_white.png')}
                            defaultSource={require('../../img/top_back_white.png')}/>
                    </TouchableOpacity>
                    <Text style={{color:'#fff',fontSize:17,fontWeight:'bold',flex:1,textAlign:'center'}}>我的订单</Text>
                    <View style={{flexDirection:'row',width:88,height:44,justifyContent:'flex-end'}}>
                        {this.state.orderType === 0?<TouchableOpacity
                            style={{justifyContent:'center', alignItems:'center', width:44, height:44}}
                            onPress={() => this.onRightTvClick(this.props.navigation)}>
                            <Image style={{marginRight:15,width:17,height:18}}
                                source={require('../../img/kind_search_white.png')}/>
                        </TouchableOpacity>:<View />}
                        <YFWMore/>
                    </View>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white'
    },

    lineStyle: {
        height: 2,
        backgroundColor: '#16c08e',
    },
    textMainStyle: {
        flex: 1,
        fontSize: 40,
        marginTop: 10,
        textAlign: 'center',
        color: 'black'
    },

    textHeaderStyle: {
        fontSize: 40,
        color: 'white',
    },

    dialogView: {
        alignItems:'center',
        justifyContent:'center',
        flex:1,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
})
