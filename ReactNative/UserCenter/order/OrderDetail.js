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
    ImageBackground,
    ScrollView,
    DeviceEventEmitter,
    Platform,
    BackAndroid
} from 'react-native';
const width = Dimensions.get('window').width;
import OrderDetailHeader from './OrderDetailHeader';
import ExpressInformation from './ExpressInformation'
import OrderAddress from './OrderAddress'
import OrderMedicineDetai from './OrderMedicineDetai'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import ContactControl from './ContactControl'
import InvoiceInformation from './InvoiceInformation'
import PrescriptionReview from './PrescriptionReview'
import ConsumerDetails from './ConsumerDetails'
import Complain from './Complain'
import OrderProcedure from './OrderProcedure'
import OrderBottomTips from "../OrderBottomTips";
import YFWPaymentDialogView from "../../OrderPay/View/YFWPaymentDialogView"
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog"
import {iphoneBottomMargin, isIphoneX, isEmpty, isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import OrderDetailModel from './Model/OrderDetailModel'
import SendInfoTips from '../order/SendInfoTips'
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import StatusView from '../../widget/StatusView'
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
export default class OrderDetail extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        headerTitle: "订单详情",
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                              onPress={()=>{
                              navigation.state.params.state.gobackKey?navigation.goBack(navigation.state.params.state.gobackKey):navigation.goBack();
                          }}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={ require('../../../img/top_back_green.png')}
                       defaultSource={require('../../../img/top_back_green.png')}/>
            </TouchableOpacity>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            orderNo: '',
            isFistTime: true,
            pageSource: undefined,
            position: undefined,
        }
        this.state.pageSource = this.props.navigation.state.params.state.pageSource;
        this.state.position = this.props.navigation.state.params.state.position;
        this.state.orderNo = this.props.navigation.state.params.state.value;
        this.initRequest('init');
        this.onBackAndroid = this.onBackAndroid.bind(this)
        this.listener();
        this._requestData = this._requestData.bind(this)
    }

    initRequest(init) {
        this._requestData(init)
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
                this._requestData()
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

        DeviceEventEmitter.addListener('order_status_refresh_in_orderDetail', ()=> {
            this._requestData()
        })
    }

    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove()
        }
    }


    _requestData(type) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getDetail');
        paramMap.set('orderno', this.state.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            this.status && this.status.dismiss()
            this.setState(()=>({
                data: OrderDetailModel.getModelArray(res.result),
            }))
        }, (error)=> {
            this.status && this.status.showNetError()
        }, isEmpty(type) ? true : false)
    }


    render() {
        return (
            <View style={styles.container}>
                <AndroidHeaderBottomLine/>
                <ScrollView style={{backgroundColor:'#f5f5f5'}}>
                    <OrderDetailHeader datas={this.state.data}> </OrderDetailHeader>

                    <ExpressInformation datas={this.state.data}
                                        navigation={this.props.navigation}> </ExpressInformation>

                    <View style={{backgroundColor:'#FFF',marginTop:10}}>
                        <OrderAddress datas={this.state.data} sendInfo={this.state.data.send_info}> </OrderAddress>

                        <SendInfoTips sendInfoData={this.state.data.send_info} orderNum={this.state.data.goods_count}
                                      type={'detail'}
                                      orderNo={this.state.orderNo}
                                      position={this.state.position}
                                      pageSource={this.state.pageSource}
                                      from={'detail'}
                                      refreshItemSendInfo={()=>this.refreshItemSendInfo()}/>
                    </View>
                    <OrderMedicineDetai goods={this.state.data.goods_items}
                                        shopTitle={this.state.data.shop_title} shop_id={this.state.data.shop_id}
                                        navigation={this.props.navigation}> </OrderMedicineDetai>

                    <ContactControl datas={this.state.data} navigation={this.props.navigation}/>

                    <Complain datas={this.state.data} navigation={this.props.navigation}/>

                    <InvoiceInformation datas={this.state.data}/>

                    <PrescriptionReview datas={this.state.data}/>

                    <ConsumerDetails datas={this.state.data}/>

                    <OrderProcedure datas={this.state.data} navigation={this.props.navigation}/>
                </ScrollView>

                {this.renderBottomTips()}
                <YFWPaymentDialogView ref={(dialog) => {this.PaymentDialog = dialog;}}
                                      navigation={this.props.navigation}/>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                <StatusView ref={(item)=>this.status = item} retry={()=>{
                    this._requestData('refresh')}} navigation={this.props.navigation}/>
            </View>
        )
    }

    renderBottomTips() {
        if (isNotEmpty(this.state.data) && isNotEmpty(this.state.data.button_items)) {
            if (this.state.data.button_items.length > 0) {
                return <View style={{backgroundColor: "#FFFFFF", paddingBottom: 5,height:isIphoneX()?60:52}}>
                    <View style={{width:width,height:0.5,backgroundColor:'#E5E5E5'}}/>
                    <OrderBottomTips data={this.state.data}
                                     navigation={this.props.navigation}
                                     _showPayDialog={this._showPayDialog}
                                     _showTipsDialog={this._showTipsDialog}
                                     refresh={()=>{this._requestData()}}
                                     _showLoading={()=>{this._showLoading()}}
                                     _cancelLoading={()=>{this._cancelLoading()}}
                                     positionIndex={this.state.position}
                                     pageSource={this.state.pageSource}
                                     lastPage={'OrderDetail'}
                    />
                </View>
            } else {
                return <View />
            }
        } else {
            return <View />
        }
    }


    refreshItemSendInfo(position) {
        this.state.data.send_info.button_items = [];
        this.setState({})
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


}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
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
        // width:ScreenWidth/3,
        height: 2,
        backgroundColor: '#FF0000',
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
    }
})
