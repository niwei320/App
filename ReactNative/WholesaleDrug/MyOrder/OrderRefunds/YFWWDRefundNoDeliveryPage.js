import React from 'react'
import {
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    DeviceEventEmitter,
    Platform,
    NativeModules,
    StyleSheet, ScrollView
} from 'react-native'

import {
    itemAddKey,
    isEmpty,
    isNotEmpty,
    iphoneBottomMargin,
    kScreenHeight, kScreenWidth, isIphoneX, deepCopyObj, kStyleWholesale
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const { StatusBarManager } = NativeModules;
import { toDecimal } from "../../../Utils/ConvertUtils";
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle'
import { backGroundColor, darkLightColor, darkTextColor, yfwRedColor } from "../../../Utils/YFWColor";
import YFWTitleView from "../../../PublicModule/Widge/YFWTitleView";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import YFWGoodsListItemView from "../../../widget/YFWGoodsListItemView";
import YFWToast from '../../../Utils/YFWToast';
import YFWWDTouchableOpacity from '../../Widget/View/YFWWDTouchableOpacity';
import YFWWDAlertSheetView from './View/YFWWDAlertSheetView';
import { pushWDNavigation, replaceWDNavigation } from '../../YFWWDJumpRouting';
import { YFWImageConst } from '../../Images/YFWImageConst';
import YFWWDRetrunGoodsInfoModel from './Model/YFWWDRetrunGoodsInfoModel';
/** 未发货 申请退款 */
export default class YFWWDRefundNoDeliveryPage extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: "申请退款",
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 50, height: 40 }]}
                onPress={() => {
                    navigation.goBack();
                }}>
                <Image style={{ width: 10, height: 16, resizeMode: 'stretch' }}
                    source={require('../../../../img/icon_back_gray.png')} />
            </TouchableOpacity>
        ),
        headerRight: <View />
    });

    constructor(props) {
        super(props)
        this.state = {
            reasonDataArray: [],
            goodsDataArray: [],
            reason: '',
            isUnit: false,//是否可拆分
            selectIndex: 0,
            orderNo: '',
            orderTotal: undefined,
            pageSource: undefined
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

    onBackAndroid = () => {
        this.props.navigation.goBack();
        return true;
    }


    componentDidMount() {
        this.state.orderNo = this.props.navigation.state.params.state.value.orderNo;
        this.state.lastPage = this.props.navigation.state.params.state.value.lastPage;
        this.state.orderTotal = this.props.navigation.state.params.state.value.orderTotal;
        this.state.pageSource = this.props.navigation.state.params.state.value.pageSource;
        this._requestReturnGoodsDetail();
        this._requestRefundReason();
    }

    _requestRefundReason() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.getReturnReason');
        paramMap.set('orderno', this.state.orderNo);
        viewModel.TCPRequest(paramMap, (res) => {
            let dataArray = itemAddKey(res.result);
            if (isNotEmpty(dataArray[0].reason)) {
                this.setState({
                    reasonDataArray: dataArray,
                });
            }
        })


    }

    _requestReturnGoodsDetail() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.getGoodsInfo');
        paramMap.set('orderno', this.state.orderNo);
        viewModel.TCPRequest(paramMap, (res) => {
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = YFWWDRetrunGoodsInfoModel.getModelArray(res.result);
            this.setState({
                goodsDataArray: dataArray
            });
        });

    }

    _showReasonAlert() {
        this.sheetView.showView(this.state.reasonDataArray, (allReason) => {
            let selectIndex = 0
            allReason.some((item, index) => {
                if (item.select) {
                    selectIndex = index
                }
                return item.select
            })
            let info = allReason[selectIndex]
            if(info.select) {
                this.state.reasonDataArray = deepCopyObj(allReason)
                this.setState({
                    reason: info.reason,
                })
            }
        })
    }

    _commit() {
        if (isEmpty(this.state.reason)) {
            YFWToast('请选择原因')
            return
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.applyReturn');
        paramMap.set('orderno', this.state.orderNo);
        paramMap.set('desc', this.state.reason);
        viewModel.TCPRequest(paramMap, (res) => {
            if (isNotEmpty(this.state.pageSource)) {
                DeviceEventEmitter.emit('order_status_refresh', this.state.pageSource);
            }
            replaceWDNavigation(this.props.navigation, {
                type: 'check_order_status_vc',
                title: '申请退款',
                tips: '您的申请已经提交，请等待商家确认',
                orderNo: this.state.orderNo,
                lastPage: this.state.lastPage,
                gobackKey: this.props.navigation.state.params.state.gobackKey
            })

        })

    }

    _splitView(item) {
        if (item.index < this.state.goodsDataArray.length - 1) {
            return (
                <View style={{ height: 1, borderStyle: "solid", borderWidth: 0.3, borderColor: "#eeeeee", width: width }} />
            );
        }
    }

    _renderItem = (item) => {
        return (
            <View>
                <YFWGoodsListItemView
                    isPriceRed={true}
                    isSelectable={this.state.isUnit}
                    isSelected={false}
                    goodsImgUrl={item.item.img_url}
                    goodsName={item.item.title}
                    goodsStandard={item.item.standard}
                    goodsPeriodDate={''}
                    goodsQuantity={item.item.quantity}
                    goodsPrice={item.item.price}
                    goodsPrescriptionType={item.item.PrescriptionType}
                    methodSelect={() => { }}
                    methodSub={() => { }}
                    methodPlus={() => { }}
                    methodOnChangeText={() => { }} />
                {this._splitView(item)}
            </View>
        )
    }

    _renderChooseGoods() {
        return (
            <View >
                <View style={{ width: kScreenWidth - 24, marginHorizontal: 12, height: 50, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <YFWTitleView title={'退货商品'} hiddenBgImage={true} />
                </View>
                <View style={[styles.list, { backgroundColor: "white", flexDirection: 'column', paddingLeft: 7, paddingRight: 9, paddingVertical: 6, }]}>
                    <FlatList
                        data={this.state.goodsDataArray}
                        renderItem={this._renderItem}
                        listKey={(item, index) => 'key' + index}>
                    </FlatList>
                </View>
            </View>
        )
    }

    _renderTips() {
        let tip2 = '超过约定时间未发货订单自动关闭，平台查实后会对商家严厉处罚'
        return (
            <View style={[styles.list, { backgroundColor: "#f5f5f5", shadowColor: 'transparent', elevation: 0, paddingHorizontal: 16, paddingVertical: 13 }]}>
                <View style={{ flax: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7 }}>
                        <Image style={{ width: 12, height: 12, resizeMode: 'stretch' }}
                            source={YFWImageConst.Icon_tip} />
                        <Text style={{ marginLeft: 7, fontSize: 14, color: '#8589a6', fontWeight: '500' }}>温馨提示</Text>
                    </View>
                    <View style={{ flexDirection: 'row', minHeight: 15 }}>
                        <View style={{ height: 2, width: 2, marginTop: 7, marginLeft: 3, backgroundColor: '#8589a6', borderRadius: 10 }} />
                        <Text style={{ fontSize: 12, color: darkLightColor(), marginLeft: 13 }}>{tip2}</Text>
                    </View>
                </View>
            </View>
        )
    }

    _renderChooseReason() {
        return (
            <TouchableOpacity style={[styles.list, { backgroundColor: "white", height: 50, justifyContent: 'center', paddingHorizontal: 0 }]}
                onPress={() => this._showReasonAlert()}
            >
                <View style={{ flax: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: darkTextColor(), marginLeft: 17 }}>退款原因:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                        <Text style={{ fontSize: 13, color: darkLightColor() }}>{isEmpty(this.state.reason) ? '请选择' : this.state.reason}</Text>
                        <Image style={{ width: 7, height: 12, marginLeft: 7, resizeMode: 'stretch' }}
                            source={require('../../../../img/icon_arrow_gray.png')} />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    _renderAmount() {
        return (
            <View style={{ width: width - 24, marginHorizontal: 12, height: 50, justifyContent: 'center' }}>
                <View style={{ width: width - 24, flax: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: darkTextColor(), marginLeft: 17 }}>退款金额:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: yfwRedColor() }}>¥{toDecimal(this.state.orderTotal)}</Text>
                    </View>
                </View>
            </View>
        )
    }

    _renderSubmitButton() {
        let BottomMargin = iphoneBottomMargin() + 26;
        return (
            <View style={{ width: kScreenWidth, justifyContent: 'center', alignItems: 'center', bottom: BottomMargin, position: 'absolute', }}>
                <YFWWDTouchableOpacity style_title={{ height: (kScreenWidth - 24) / 350 * 42, width: kScreenWidth - 24, fontSize: 17, fontWeight: 'bold' }}
                    title={'提交'}
                    callBack={() => { this._commit() }}
                    isEnableTouch={true} />
            </View>
        )
    }

    render() {
        let spaceBHeight = kScreenHeight / 5
        return (
            <View style={{ flex: 1, backgroundColor: backGroundColor() }}>
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {this._renderChooseGoods()}
                    {this._renderTips()}
                    {this._renderChooseReason()}
                    {this._renderAmount()}
                    <View style={{ height: spaceBHeight }} />
                </ScrollView>
                {this._renderSubmitButton()}
                <YFWWDAlertSheetView ref={(e) => this.sheetView = e}></YFWWDAlertSheetView>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    list: {
        width: width - 24,
        borderRadius: 7,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: 13,
        marginHorizontal: 12,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 5
        },
        elevation: 1,
        shadowRadius: 8,
        shadowOpacity: 1
    },
    imageBack: {
        width: width,
        height: 198 / 360 * width,
        resizeMode: 'stretch',
        top: 0,
        left: 0,
        position: 'absolute',
        flexDirection: 'row'
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT + 17 : 50 + 17 + (isIphoneX() ? 24 : 0)
    },
});
