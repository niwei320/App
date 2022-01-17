import React, {Component} from 'react'
import {View, FlatList, StyleSheet, TouchableOpacity, Image, Platform, BackAndroid, DeviceEventEmitter, NativeModules,Text } from 'react-native'
import {iphoneBottomMargin, isIphoneX, isEmpty, isNotEmpty, kScreenWidth, isMapEmpty, safe} from "../../../PublicModule/Util/YFWPublicFunction"
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel'
import YFWOrderDetailModel from './Model/YFWOrderDetailModel'
import YFWOrderDetailViewModel from './ViewModel/YFWOrderDetailViewModel'
import {BaseStyles} from '../../../Utils/YFWBaseCssStyle'
import YFWOrderDetailHeaderView from './YFWOrderDetailHeaderView'
import YFWOrderDetailNormalCell from './YFWOrderDetailNormalCell'
import YFWOrderDetailRuleCell from './YFWOrderDetailRuleCell'
import YFWOrderDetailStoreCell from './YFWOrderDetailStoreCell'
import {yfwLineColor} from '../../../Utils/YFWColor'
import OrderBottomTips from '../../OrderBottomTips'
import YFWPaymentDialogView from "../../../OrderPay/View/YFWPaymentDialogView"
import BaseTipsDialog from "../../../PublicModule/Widge/BaseTipsDialog"
import StatusView from '../../../widget/StatusView'
import ReturnTipsDialog from '../../../PublicModule/Widge/ReturnTipsDialog';
import YFWMore from '../../../widget/YFWMore';
import { pushNavigation } from '../../../Utils/YFWJumpRouting';
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import YFWOfflineOrderDetailModel from "./Model/YFWOfflineOrderDetailModel";
import YFWOfflineOrderDetailViewModel from "./ViewModel/YFWOfflineOrderDetailViewModel";
import YFWOfflineOrderDetailHeaderView from "./YFWOfflineOrderDetailHeaderView";
import PickupCodeAlertView from '../PickupCodeAlertView'
import YFWOrderDetailPickupCell from './YFWOrderDetailPickupCell'
import YFWOrderDetailDeliveryCell from './YFWOrderDetailDeliveryCell'
import YFWRxInfoTipsAlert from '../../../OrderPay/View/YFWRxInfoTipsAlert'
import YFWCustomTipAlertView from './YFWCustomTipAlertView'
import YFWOrderDetailContactCell from './YFWOrderDetailContactCell'
const {StatusBarManager} = NativeModules;
let _this = null

export default class YFWOrderDetailController extends Component {
    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        header: null
    });

    constructor(props) {
        super(props);
        _this= this;

        this.state = {
            data: undefined,
            dataSource: [],
            bottomItems: [],
            orderNo: '',
            pageSource: undefined,
            position: undefined,
            isFistTime: true,
            refreshing:false,
        }

        this.state.orderNo = this.props.navigation.state.params.state.value;
        this.state.pageSource = this.props.navigation.state.params.state.pageSource;
        this.state.position = this.props.navigation.state.params.state.position;
        this.isERPOrder = isEmpty(this.props.navigation.state.params.state.isERPOrder)?false:this.props.navigation.state.params.state.isERPOrder;
        this.listener();
        this.onBackAndroid = this.onBackAndroid.bind(this)
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {

                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
                }
                if (this.state.isFistTime) {
                    this.state.isFistTime = false;
                    return
                }
                this._fetchOrderDetailData();
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

    onBackAndroid = ()=> {
        let {goBack} = this.props.navigation;
        goBack(this.props.navigation.state.params.state.gobackKey);
        return true;
    }

    componentDidMount() {
        this._fetchOrderDetailData();

        DeviceEventEmitter.addListener('order_status_refresh_in_orderDetail', ()=> {
            this._fetchOrderDetailData();
        })
    }

    componentWillUnmount() {
        this.didFocus.remove()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove()
        }
    }

    _fetchOrderDetailData(type) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        if(this.isERPOrder){
            paramMap.set('__cmd', 'person.erporder.getERPOrderDetail');
            paramMap.set('orderno', this.state.orderNo);
        } else {
            paramMap.set('__cmd', 'person.order.getDetail');
            paramMap.set('orderno', this.state.orderNo);
            paramMap.set('isApp', 1)
        }
        viewModel.TCPRequest(paramMap, (res)=> {
            // console.log(JSON.stringify(res))
            this.status && this.status.dismiss()
            let detailModel
            let detailViewModel
            if(this.isERPOrder) {
                detailModel = YFWOfflineOrderDetailModel.getModelArray(res.result)
                detailViewModel = YFWOfflineOrderDetailViewModel.getModelArray(detailModel)
            } else {
                detailModel = YFWOrderDetailModel.getModelArray(res.result)
                detailViewModel = YFWOrderDetailViewModel.getModelArray(detailModel)
            }
            this.setState(()=>({
                data: detailModel,
                dataSource: detailViewModel.datasource,
                bottomItems: detailViewModel.bottomButtons,
                refreshing:false,
            }))
        }, (error)=> {
            this.status && this.status.showNetError()
            this.setState({refreshing:false})
        },isEmpty(type) ? true : false)
    }

    render() {
        return(
            <View style={{flex:1}}>
                <StatusView ref={(item)=>this.status = item} retry={()=>{
                    this._fetchOrderDetailData('refresh')}} navigation={this.props.navigation}/>
                {this._renderNavigationHeader()}
                <View style={{position:'absolute',left:0,top:0,right:0,bottom:0}}>
                    <FlatList
                        ref={(e) => this._flatlist = (e)}
                        style={{backgroundColor:'#fff'}}
                        extraData={this.state}
                        data={this.state.dataSource}
                        renderItem={this._renderItemCell.bind(this)}
                        ItemSeparatorComponent={this._renderSeparator.bind(this)}
                        ListFooterComponent={this._renderListFooter.bind(this)}
                        onScroll={(e) => this._listScroll(e)}
                        refreshing = {this.state.refreshing}
                        onRefresh = {()=>{this.setState({refreshing:true});this._fetchOrderDetailData()}}
                    />
                    {this._renderBottomTips()}
                    <YFWPaymentDialogView ref={(dialog) => {this.PaymentDialog = dialog;}}
                                        navigation={this.props.navigation} from={'orderDetail'}/>
                    <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                    <ReturnTipsDialog ref={(item) => {this.returnDialog = item}}/>
                    <PickupCodeAlertView ref={e => {this.pickupCodeDialog=e}}></PickupCodeAlertView>
                    <YFWCustomTipAlertView ref={e=> {this.tipAlert = e}}></YFWCustomTipAlertView>
                </View>
            </View>
        )
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
                <Image ref={(e) => _this.headerImage=e} source={require('../../../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}} opacity={0}/>
                <View style={{flex:1,flexDirection:'row',alignItems:'center',position:'absolute',left:0,right:0,bottom:0,height:44}}>
                    <TouchableOpacity style={[BaseStyles.item,{width:44,height:44}]}
                                onPress={()=>{
                                this.props.navigation.state.params.state.gobackKey?this.props.navigation.goBack(this.props.navigation.state.params.state.gobackKey):this.props.navigation.goBack();
                            }}>
                        <Image style={{width:12,height:21,resizeMode:'stretch'}}
                            source={ require('../../../../img/top_back_white.png')}
                            defaultSource={require('../../../../img/top_back_white.png')}/>
                    </TouchableOpacity>
                    <Text style={{color:'#fff',fontSize:17,fontWeight:'bold',flex:1,textAlign:'center'}}>订单详情</Text>
                    <YFWMore/>
                </View>
            </View>
        )
    }

    _renderItemCell({item}) {
        if (item.cell === 'order_detail_contact') {
            /** 订单状态、联系人 */
            return <YFWOrderDetailHeaderView
                        model={item}
                        navigation={this.props.navigation}
                        orderNo={this.state.orderNo}
                        position={this.state.position}
                        pageSource={this.state.pageSource}
                        refreshItemSendInfo={()=>this._refreshItemSendInfo()}/>

        } else if (item.cell === 'order_detail_goods') {
            /** 商品、商店 */
            return <YFWOrderDetailStoreCell model={item} navigation={this.props.navigation}/>

        } else if (item.cell === 'order_detail_platform_contact') {
            /** 联系商城客服 */
            return <YFWOrderDetailContactCell model={item} navigation={this.props.navigation}/>
        } else if (item.cell === 'order_detail_normal') {
            /** 普通 */
            return <YFWOrderDetailNormalCell model={item} navigation={this.props.navigation}/>

        } else if (item.cell === 'order_detail_rules') {
            /** 签收规则 */
            return <YFWOrderDetailRuleCell model={item} navigation={this.props.navigation}/>

        } else if (item.cell === 'order_detail_rx_info') {
            /** 处方信息 */
            return this._renderRxInfoCellView(item)
        } else if (item.cell === 'offline_order_detail_goods_header') {
            /** 处方信息 */
            return <YFWOfflineOrderDetailHeaderView model={item} navigation={this.props.navigation}/>
        } else if (item.cell === 'order_invoice_normal') {
            /** 发票信息 */
            return this._renderInvoiceView(item)
        } else if (item.cell === "order_detail_pickup") {
            /** 自提 */
            return <YFWOrderDetailPickupCell model={item}></YFWOrderDetailPickupCell>
        } else if (item.cell === "order_deatil_delivery") {
            /** 同城配送 */
            return <YFWOrderDetailDeliveryCell model={item}></YFWOrderDetailDeliveryCell>
        } else {
            /** 其他 */
            return <View/>
        }
    }

    _renderInvoiceView (item) {
        // console.log(JSON.stringify(item))
        return (
            <TouchableOpacity style={{paddingHorizontal:16,paddingVertical:10,minHeight:40,justifyContent:'space-between', flexDirection:'row',alignItems : 'center'}}
                              onPress={()=>{
                                  if(item.isClick){
                                      let {navigate} = this.props.navigation;
                                      pushNavigation(navigate,{type:'invoice_detail_page',value:item.info,orderNo:this.state.orderNo})
                                  }
                              }} activeOpacity={1}>
                <Text style={{marginLeft:10,fontSize:13,color:'#333333'}} >发票类型:   <Text style={{color:'#999999'}}>{item.title}</Text></Text>
                {item.isClick?<Image source={require('../../../../img/message_next.png')} style={{marginRight:10,width:14,height:28,resizeMode:'contain'}}/>:
                    <View  style={{width:14,height:28}}/>}
            </TouchableOpacity>
        )
    }

    _renderRxInfoCellView(item){
        let image = item.type==0?require('../../../../img/icon_warning.png'):require('../../../../img/sx_icon_baozhang.png')
        return (
            <TouchableOpacity style={{paddingHorizontal:13,paddingVertical:10,marginHorizontal:13,marginBottom:10,minHeight:40,justifyContent:'space-between', flexDirection:'row',alignItems : 'center',
                borderRadius: 7,backgroundColor: "#ffffff",shadowColor: "rgba(204, 204, 204, 0.6)",shadowOffset: {width: 0,height: 4},elevation:2,shadowRadius: 8,shadowOpacity: 1}}
                onPress={()=>{
                    if(item.isClick){
                        let {navigate} = this.props.navigation;
                        pushNavigation(navigate,{type:'prescription_result',value:item.data,orderNo:this.state.orderNo})
                    }
                }} activeOpacity={1}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Image style={{width:16, height:16, resizeMode:'stretch'}} source={image}/>
                    <View style={{justifyContent:'center'}}>
                        <Text style={{marginLeft:10,fontSize:13,color:'#666666'}}>{item.title}</Text>
                        {safe(item.content).length>0?<Text style={{marginLeft:10,fontSize:13,color:'#999999',marginTop:5}}>{item.content}</Text>:null}
                    </View>
                </View>
                {item.isClick?<Image source={require('../../../../img/message_next.png')} style={{width:14,height:28,resizeMode:'contain'}}/>:
                <View  style={{width:14,height:28}}/>}
            </TouchableOpacity>
        )
    }

    _renderListFooter() {
        return <View style={{flex:1, height:15, backgroundColor:yfwLineColor(), opacity:0.1}}/>
    }

    _renderSeparator(item) {
        if(item.leadingItem.cell == 'order_detail_contact') {
            return <View></View>
        }else {
            return (
                <View style={{flex:1, height:15, backgroundColor:yfwLineColor(), opacity:0.1}}/>
            )
        }
    }

    _renderBottomTips() {
        if (isNotEmpty(this.state.bottomItems)) {
            if (this.state.bottomItems.length > 0) {
                return <View style={{backgroundColor: "#FFFFFF",paddingBottom:isIphoneX()?20:0}}>
                    <View style={{width:kScreenWidth,height:0.5,backgroundColor:'#E5E5E5'}}/>
                    <View style={{width:kScreenWidth,height:5,backgroundColor:'#FFFFFF'}}/>
                    <OrderBottomTips data={this.state.data}
                                    navigation={this.props.navigation}
                                    _showPayDialog={this._showPayDialog}
                                    _showPickupCodeDialog={()=>{this._showPickupCodeDialog(this.state.data)}}
                                    _showTipsDialog={this._showTipsDialog}
                                    _showTipsAlert={this._showTipsAlert}
                                    _showReturnDialog={this._showReturnDialog}
                                    refresh={(index)=>{this._refreshAction(index)}}
                                    _showLoading={()=>{this._showLoading()}}
                                    _cancelLoading={()=>{this._cancelLoading()}}
                                    positionIndex={this.state.position}
                                    pageSource={this.state.pageSource}
                                    lastPage={'OrderDetail'}
                                    gobackKey={this.props.navigation.state.key}
                    />
                </View>
            } else {
                return <View />
            }
        } else {
            return <View />
        }
    }

    _refreshAction(index) {
        if (isNotEmpty(index)) {
            this.props.navigation.state.params&&this.props.navigation.state.params.state.refreshAction&&this.props.navigation.state.params.state.refreshAction(index)
            this.props.navigation.goBack();
        } else {
            this._fetchOrderDetailData();
        }
    }

    _refreshItemSendInfo(position) {
        this._fetchOrderDetailData();
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
    _showPayDialog = (orderNO) => {
        this.PaymentDialog.show(orderNO)
    }

    /**
     * 弹出提示框
     * @param bean
     * @private
     */
    _showTipsDialog = (bean) => {
        this.tipsDialog && this.tipsDialog._show(bean)
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

    _listScroll(e) {
        let scrollY = e.nativeEvent.contentOffset.y;
        let opacity = scrollY/40.0
        if(opacity < 0){
            opacity = 0
        }else if( opacity > 1) {
            opacity = 1
        }

        if (_this && _this.headerImage) {
            _this.headerImage.setNativeProps({
                opacity: opacity
            })
        }
    }

}