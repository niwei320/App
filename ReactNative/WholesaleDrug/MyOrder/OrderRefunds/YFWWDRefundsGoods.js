import React from 'react'
import {
    View,
    Text,
    Image,
    ScrollView,
    TextInput,
    Dimensions,
    TouchableOpacity,
    DeviceEventEmitter,
    Platform,
    KeyboardAvoidingView,
    NativeModules,
    ImageBackground,
    StyleSheet,
    BackHandler
} from 'react-native'
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel'
const width = Dimensions.get('window').width;
import YFWToast from '../../../Utils/YFWToast'
import { dismissKeyboard_yfw, isEmpty, isNotEmpty, strMapToObj, kScreenWidth, isIphoneX, iphoneBottomMargin, safe, kStyleWholesale } from '../../../PublicModule/Util/YFWPublicFunction'
import { darkTextColor, darkNomalColor, darkLightColor, yfwRedColor, yfwGreenColor } from '../../../Utils/YFWColor'
import YFWTitleView from '../../../PublicModule/Widge/YFWTitleView'
import YFWWDTouchableOpacity from '../../Widget/View/YFWWDTouchableOpacity'
import YFWWDReturnGoodsReseon from './View/YFWWDReturnGoodsReseon'
import YFWWDReturnGoodsList from './View/YFWWDReturnGoodsList'
import { YFWImageConst } from '../../Images/YFWImageConst';
import YFWWDRetrunGoodsInfoModel from './Model/YFWWDRetrunGoodsInfoModel';
import { pushWDNavigation, replaceWDNavigation } from '../../YFWWDJumpRouting';
const { StatusBarManager } = NativeModules
let _this = null

export default class YFWWDRefundsGoods extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: "申请退货/款",
        headerRight: <View style={{ width: 50 }} />,
        headerTitleStyle: {
            color: '#333', textAlign: 'center', flex: 1, fontSize: 16
        },
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor: 'white',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomWidth: 0, backgroundColor: 'white' },
    });




    constructor(props) {
        super(props)
        _this = this
        this.orderNo = this.props.navigation.state.params.state.orderNo;
        this.title = this.props.navigation.state.params.state.title;
        this.orderTotal = this.props.navigation.state.params.state.orderTotal;
        this.packagePrice = parseFloat(safe(this.props.navigation.state.params.state.package_price));
        this.shippingPrice = parseFloat(safe(this.props.navigation.state.params.state.shipping_price));
        this.pageSource = this.props.navigation.state.params.state.pageSource;
        this.lastPage = this.props.navigation.state.params.state.lastPage;
        this.returnType = this.props.navigation.state.params.state.returnType;
        this.state = {
            inputMoney: '',
            orderDetailData: [],
            tips: '',
            selectType: 1
        }
        this.commitable = true;
        this._onTextChange = this._onTextChange.bind(this);
        this.noReceiveTips = [
            '一旦退款完成，积分/优惠券不返还',
            '由于商家原因而导致用户退款，请选择对应理由，平台查实后会对商家严厉处罚'
        ];
        this.receiveTips = [
            '一旦退款完成，积分/优惠券不返还',
            '由于商家原因而导致用户不得不退款，请选择对应理由，平台查实后会对商家严厉处罚',
            '为了提高退款效率，请根据不同的凭证说明上传正确凭证'
        ];
    }

    componentDidMount() {
        this._requestReturnGoodsDetail();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        let navigation = this.props.navigation
        navigation.state.params.state.gobackKey ? navigation.goBack(navigation.state.params.state.gobackKey) : navigation.goBack();
        return true;
    }
    _requestReturnGoodsDetail() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.getGoodsInfo');
        paramMap.set('orderno', this.orderNo);
        viewModel.TCPRequest(paramMap, (res) => {
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = YFWWDRetrunGoodsInfoModel.getModelArray(res.result);
            this.setState({
                orderDetailData: dataArray
            });
        });

    }

    editGoodsNum(index, num) {
        this.state.orderDetailData[index].returnNumber = num
    }
    editGoodsSelect(index, isSelect) {
        this.state.orderDetailData[index].select = isSelect
    }

    render() {
        let bgViewH = 210 * kScreenWidth / 375
        let packageShippingPrice = this.packagePrice + this.shippingPrice
        let editEnable = this.returnType == 2 //|| (this.returnType == 1 && this.state.selectType == 2)
        let tipsArray = editEnable ? this.receiveTips : this.noReceiveTips
        return (
            <KeyboardAvoidingView style={{ backgroundColor: '#fafafa', flex: 1 }} behavior="padding"
                keyboardVerticalOffset={80} >
                {
                    this.returnType == 1 ?
                        <View style={{ height: 47, flexDirection: 'row', backgroundColor: 'white', alignItems: 'center' }}>
                            <TouchableOpacity activeOpacity={1} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => this._typeChangeAction(1)}>
                                <Text style={{ fontSize: 15,fontWeight:this.state.selectType != 1?'400':'900' }} >{'未收货'}</Text>
                                {/* <YFWTitleView from={kStyleWholesale} style_title={{ fontSize: 15 }} title={'未收货'} hiddenBgImage={this.state.selectType != 1}/> */}
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => this._typeChangeAction(2)}>
                                <Text style={{ fontSize: 15,fontWeight:this.state.selectType != 2?'400':'900' }} >{'已收货'}</Text>
                                {/* <YFWTitleView from={kStyleWholesale} style_title={{ fontSize: 15 }} title={'已收货'} hiddenBgImage={this.state.selectType != 2} /> */}
                            </TouchableOpacity>
                        </View> : null
                }
                <ScrollView
                    onScrollBeginDrag={this._listScroll.bind(this)}
                    onScroll={this._listScroll.bind(this)}
                    onScrollEndDrag={this._listScroll.bind(this)}
                    showsVerticalScrollIndicator={false}>
                    <YFWWDReturnGoodsList data={this.state.orderDetailData} isCanEdit={editEnable}
                        editGoodsSelect={(index, isSelect) => this.editGoodsSelect(index, isSelect)}
                        editGoodsNum={(index, num) => this.editGoodsNum(index, num)} />
                    <View style={styles.tipContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Image source={YFWImageConst.Icon_tip} style={{ width: 12, height: 12 }}></Image>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: "#8589a6", marginLeft: 5 }}>{'温馨提示'}</Text>
                        </View>
                        {tipsArray.map((item) => {
                            return (
                                <View style={{ flexDirection: 'row', marginVertical: 2.5 }}>
                                    <View style={{ backgroundColor: '#8589a6', width: 2, height: 2, borderRadius: 2, marginHorizontal: 5, marginTop: 5 }}></View>
                                    <Text style={{ color: '#999', fontSize: 12 }}>{item}</Text>
                                </View>
                            )
                        })}
                    </View>
                    <YFWWDReturnGoodsReseon orderNo={this.orderNo} returnType={this.returnType} type={this.state.selectType} orderTotal={this.orderTotal} packageShippingPrice={packageShippingPrice} ref='choose_reason' />
                    <View style={{ marginHorizontal: 10, marginTop: 50, marginBottom: iphoneBottomMargin() }}>
                        <YFWWDTouchableOpacity style_title={{ height: 44, width: kScreenWidth - 20, fontSize: 16 }} title={'提交'}
                            callBack={() => this._commit()}
                            isEnableTouch={true} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
    _renderHeaderItem(title, content, contentColor) {
        let color = contentColor != undefined ? contentColor : darkLightColor()
        return (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: -20 }}>
                <Text style={{ color: darkTextColor(), fontSize: 15 }}>{title}</Text>
                <Text style={{ color: color, fontSize: 15, flex: 1 }}>{content}</Text>
            </View>
        )
    }

    _listScroll(e) {
        let scrollY = e.nativeEvent.contentOffset.y;
        let opacity = scrollY / 40.0
        if (opacity < 0) {
            opacity = 0
        } else if (opacity > 1) {
            opacity = 1
        }

        this.state.headerOpacity = opacity;

        if (_this.headerImage) {
            _this.headerImage.setNativeProps({
                opacity: opacity
            })
        }
    }

    _typeChangeAction(type) {
        if (type == 1) {

        } else {

        }
        this.setState({
            selectType: type
        })
    }

    _commit() {
        if (!this.commitable) {
            return;
        }
        this.commitable = false;
        this.timer = setTimeout(() => {
            this.commitable = true;
        }, 2000);
        let reason = this.refs.choose_reason.getReason();
        let imageDataArray = this.refs.choose_reason.getUploadImage_tcp();
        let reportDataArray = this.refs.choose_reason.getUpLoadReport_tcp();
        let money = this.refs.choose_reason.getReturnMoney()
        if (this.returnType == 2) {
            let have = this.state.orderDetailData.some((item) => {
                return item.select
            })
            if (!have) {
                YFWToast('至少选一件商品')
                return
            }
            let info = this._getOrderInfo();
            this._requestRefunds(money, info, reason, imageDataArray, reportDataArray)
        } else if (this.returnType == 1 && this.state.selectType == 1) {
            this._requestRefundWithOutGoods(reason)
        } else {
            this._requestRefunds(money, undefined, reason, imageDataArray, reportDataArray)
        }

    }

    _requestRefunds(money, info, reason, imageDataArray, reportDataArray) {
        this.uploadeRetrunInfoTcp(reason, money, info, imageDataArray, reportDataArray);

    }

    _requestRefundWithOutGoods(reason) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.applyReturn');
        paramMap.set('orderno', this.orderNo);
        paramMap.set('desc', reason);
        viewModel.TCPRequest(paramMap, (res) => {
            if (isNotEmpty(this.pageSource)) {
                DeviceEventEmitter.emit('order_status_refresh', this.pageSource);
            }
            replaceWDNavigation(this.props.navigation, {
                type: 'check_order_status_vc',
                title: '申请退款',
                tips: '您的申请已经提交，请等待商家确认',
                orderNo: this.orderNo,
                lastPage: this.lastPage,
                gobackKey: this.props.navigation.state.params.state.gobackKey
            })

        })
    }

    uploadeRetrunInfoTcp(reason, money, info, imageDataArray, reportDataArray) {
        /*
         *
         *  判断图片传输过程是否出现异常
         *    - 走失败回调
         *    - 服务器没有任何回调
         *
         * */
        let status = this.refs.choose_reason.getUserChoosePicStatus_tcp();
        if (status) {
            /*
             *  如果为true   保存本地图片的长度大于服务器返回的链接数组的长度表示上传的过程中出现过异常
             * */
            this.refs.choose_reason.upLoadImageAgain_tcp();
            YFWToast('图片上传失败，请重试');
            return;
        }
        let upLoadReportStatus = this.refs.choose_reason.getUpLoadReportStatus_tcp()
        if (upLoadReportStatus) {
            this.refs.choose_reason.getUpLoadReportPicAgain_tcp();
            YFWToast('图片上传失败，请重试');
            return;
        }
        if (imageDataArray == null) {
            imageDataArray = [];
        }
        if (reportDataArray == null) {
            reportDataArray = [];
        }


        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.applyReturnGoods');
        paramMap.set('orderno', this.orderNo);
        paramMap.set('image_voucher', imageDataArray);
        paramMap.set('image_report', reportDataArray);
        paramMap.set('reason', reason);
        paramMap.set('money', money + '');
        if (isNotEmpty(info)) {
            paramMap.set('returnGoodsInfo', strMapToObj(info));
        }
        viewModel.TCPRequest(paramMap, (res) => {
            if (res.code == '1') {
                DeviceEventEmitter.emit('order_status_refresh', this.pageSource);
                replaceWDNavigation(this.props.navigation, {
                    type: 'check_order_status_vc',
                    title: '申请退货/款',
                    tips: '您的申请已经提交，请等待商家确认',
                    orderNo: this.orderNo,
                    lastPage: this.lastPage,
                    gobackKey: this.props.navigation.state.params.state.gobackKey
                })
            } else if (res.code == '-1') {
                YFWToast(res.msg)
            }
        }, (error) => {

        });
    }

    _getOrderInfo() {
        let infoMap = new Map();
        for (let i = 0; i < this.state.orderDetailData.length; i++) {
            let info = this.state.orderDetailData[i]
            let order_medicineno = info.order_medicineno;
            let quantity = info.quantity;
            if (info.returnNumber > 0) {
                quantity = info.returnNumber
            }
            if (!info.select) {
                quantity = 0
            }
            infoMap.set(order_medicineno, quantity);
        }
        return infoMap


    }

    _onTextChange(text) {
        let inputMoney = text.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
        this.setState({ inputMoney: inputMoney })
    }

}
const styles = StyleSheet.create({
    content: {
        flex: 1,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        paddingHorizontal: 20,
        marginHorizontal: 13,
        paddingTop: 17,
    },
    tipContainer: {
        borderRadius: 7,
        backgroundColor: "#f5f5f5",
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginHorizontal: 13,
        marginTop: 20
    }
})
