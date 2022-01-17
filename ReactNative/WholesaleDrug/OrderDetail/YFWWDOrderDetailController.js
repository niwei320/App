import React, {Component} from 'react'
import {View, FlatList, StyleSheet, TouchableOpacity, Image, Platform, BackAndroid, DeviceEventEmitter, NativeModules,Text } from 'react-native'
import {
    iphoneBottomMargin,
    isIphoneX,
    isEmpty,
    isNotEmpty,
    kScreenWidth,
    isMapEmpty,
    safe,
    kStyleWholesale
} from "../../PublicModule/Util/YFWPublicFunction"
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWWDOrderDetailModel from './Model/YFWWDOrderDetailModel'
import YFWWDOrderDetailViewModel from './ViewModel/YFWWDOrderDetailViewModel'
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import {yfwLineColor} from '../../Utils/YFWColor'
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog"
import StatusView from '../../widget/StatusView'
import ReturnTipsDialog from '../../PublicModule/Widge/ReturnTipsDialog';
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import YFWWDOrderDetailHeaderView from "./View/YFWWDOrderDetailHeaderView";
import YFWWDOrderDetailNormalCell from "./View/YFWWDOrderDetailNormalCell";
import YFWWDOrderDetailStoreCell from "./View/YFWWDOrderDetailStoreCell";
import YFWWDOrderDetailRuleCell from "./View/YFWWDOrderDetailRuleCell";
import YFWWDOrderBottomTips from "../MyOrder/View/YFWWDOrderBottomTips";
import YFWPaymentDialogView from "../../OrderPay/View/YFWPaymentDialogView";
import {YFWImageConst} from "../Images/YFWImageConst";
import YFWWDMore from '../Widget/View/YFWWDMore'
const {StatusBarManager} = NativeModules;
let _this = null

export default class YFWWDOrderDetailController extends Component {
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
        paramMap.set('__cmd', 'store.buy.order.getDetail');
        paramMap.set('orderno', this.state.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            // console.log(JSON.stringify(res))
            this.status && this.status.dismiss()
            let detailModel = YFWWDOrderDetailModel.getModelArray(res.result)
            let detailViewModel = YFWWDOrderDetailViewModel.getModelArray(detailModel)
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
                    <BaseTipsDialog ref={(item) => {this.tipsDialog = item}} from={kStyleWholesale}/>
                    <ReturnTipsDialog ref={(item) => {this.returnDialog = item}} from={kStyleWholesale}/>
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
                <Image ref={(e) => _this.headerImage=e} source={YFWImageConst.Nav_header_background_blue} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}} opacity={0}/>
                <View style={{flex:1,flexDirection:'row',alignItems:'center',position:'absolute',left:0,right:0,bottom:0,height:44}}>
                    <TouchableOpacity style={[BaseStyles.item,{width:44,height:44}]}
                                onPress={()=>{
                                this.props.navigation.state.params.state.gobackKey?this.props.navigation.goBack(this.props.navigation.state.params.state.gobackKey):this.props.navigation.goBack();
                            }}>
                        <Image style={{width:12,height:21,resizeMode:'stretch'}}
                            source={ YFWImageConst.Nav_back_white}/>
                    </TouchableOpacity>
                    <Text style={{color:'#fff',fontSize:17,fontWeight:'bold',flex:1,textAlign:'center'}}>订单详情</Text>
                    <YFWWDMore/>
                </View>
            </View>
        )
    }

    _renderItemCell({item}) {
        if (item.cell === 'order_detail_contact') {
            /** 订单状态、联系人 */
            return <YFWWDOrderDetailHeaderView
                        model={item}
                        navigation={this.props.navigation}
                        orderNo={this.state.orderNo}
                        position={this.state.position}
                        pageSource={this.state.pageSource}
                        refreshItemSendInfo={()=>this._refreshItemSendInfo()}/>

        } else if (item.cell === 'order_detail_goods') {
            /** 商品、商店 */
            return <YFWWDOrderDetailStoreCell model={item} navigation={this.props.navigation}/>

        } else if (item.cell === 'order_detail_normal') {
            /** 普通 */
            return <YFWWDOrderDetailNormalCell model={item} navigation={this.props.navigation}/>

        } else if (item.cell === 'order_detail_rules') {
            /** 签收规则 */
            return <YFWWDOrderDetailRuleCell model={item} navigation={this.props.navigation}/>

        }  else {
            /** 其他 */
            return <View/>
        }
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
                    <YFWWDOrderBottomTips data={this.state.data}
                                    navigation={this.props.navigation}
                                    _showPayDialog={this._showPayDialog}
                                    _showTipsDialog={this._showTipsDialog}
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

        if (_this.headerImage) {
            _this.headerImage.setNativeProps({
                opacity: opacity
            })
        }
    }

}