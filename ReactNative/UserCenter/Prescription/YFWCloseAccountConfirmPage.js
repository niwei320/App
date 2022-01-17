/**
 * Created by admin on 2018/6/5.
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Keyboard,
    DeviceEventEmitter
} from 'react-native';
import YFWToast from '../../Utils/YFWToast'
const width = Dimensions.get('window').width;
import { BaseStyles } from '../../Utils/YFWBaseCssStyle'
import {
    yfwOrangeColor,
    backGroundColor,
    darkNomalColor,
    darkLightColor,
    yfwGreenColor,
    darkTextColor,
    separatorColor,
    newSeparatorColor
} from './../../Utils/YFWColor'
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {
    dismissKeyboard_yfw,
    is_phone_number,
    is_verification_code,
    kScreenWidth,
    safe,
    isNotEmpty,
    isEmpty
} from "../../PublicModule/Util/YFWPublicFunction";
import { get_new_ip, postPushDeviceInfo } from "../../Utils/YFWInitializeRequestFunction";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import YFWCloseTipAlert, { kTipTypeWarn, kTipTypeSuccess } from '../View/YFWCloseTipAlert';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import NavigationActions from '../../../node_modules_local/react-navigation/src/NavigationActions';

export default class YFWCloseAccountConfirmPage extends Component {

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: "账号验证",
        headerRight: <View style={{ width: 50 }} />,
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1, fontWeight: 'normal', fontSize: 17
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 50, height: 40 }]}
                onPress={() => { navigation.goBack() }}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerBackground: <Image source={require('../../../img/Status_bar.png')} style={{ width: kScreenWidth, flex: 1, resizeMode: 'stretch' }} />
    });

    constructor(props) {
        super(props);
        this.state = {
            before_mobile: '',
            noticeText: '获取验证码',
            IdentifingCode: '',
            selfEnable: true,
            timerCount: 60,
            counting: false,
            noticeTitleColor: yfwGreenColor(),
            telnumber: '',
        }
        this.reason = this.props.navigation.state.params.state.reason
    }

    mobilenumberTextChange(number) {
        let inputnumber = number.replace(/[^\d]/g, '');
        this.setState(() => ({
            telnumber: inputnumber,
            updataTimeCount: 60,
            counting: false,
        }
        )
        )
    }

    numberTextChange(number) {
        let inputnumber = number.replace(/[^\d]/g, '');
        this.setState(() => ({
            IdentifingCode: inputnumber,
        }
        )
        )
    }


    componentDidMount() {
        this.setState({
            before_mobile: this.props.navigation.state.params.state.mobile
        });
    }

    render() {
        return (
            <TouchableOpacity style={{ position: 'relative', flex: 1, backgroundColor: backGroundColor() }} onPress={() => { dismissKeyboard_yfw() }} activeOpacity={1}>
                <Text style={{ fontSize: 16, color: '#333', fontWeight: 'bold', marginTop: 22, marginLeft: 32, marginBottom: 20 }}>{'申请注销前需进行账号验证确认'}</Text>
                {this._renderContent()}
            </TouchableOpacity>
        )
    }

    _renderContent() {
        const { navigate, state, goBack } = this.props.navigation;
        let tipText = isNotEmpty(this.state.before_mobile) ? '若原手机已停用，请联系商城客服修改' : ''
        return (
            <View style={{ flex: 1, backgroundColor: backGroundColor() }} onPress={() => { dismissKeyboard_yfw() }} activeOpacity={1}>
                {
                    isNotEmpty(this.state.before_mobile) ?
                        <View style={[BaseStyles.item, { marginTop: 10, alignItems: 'flex-start', justifyContent: 'flex-start', width: width, height: 60 }]}>
                            <Text style={[BaseStyles.titleStyle, { marginTop: 20, marginLeft: 40, fontSize: 14, color: darkTextColor() }]}>已认证手机:</Text>
                            <Text style={[BaseStyles.titleStyle, { marginTop: 20, marginLeft: 10, fontSize: 14, color: darkTextColor() }]}>{this.state.before_mobile}</Text>
                        </View> :
                        <View>
                            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ flex: 1 }}>
                                    <TextInput style={[BaseStyles.titleStyle, { marginTop: 20 }, { marginLeft: 35 }, { fontSize: 14, height: 50 }, { color: darkTextColor() }]}
                                        underlineColorAndroid='transparent'
                                        keyboardType='numeric' maxLength={11}
                                        autoFocus={true}
                                        onChangeText={this.mobilenumberTextChange.bind(this)}
                                        value={this.state.telnumber}
                                        placeholderTextColor={darkLightColor()}
                                        placeholder="请输入手机号码">
                                    </TextInput>
                                </View>
                            </View>
                            <View style={{ height: 1, backgroundColor: newSeparatorColor(), opacity: 0.2, marginHorizontal: 40 }} />
                        </View>
                }
                <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <TextInput style={{ marginLeft: 35, fontSize: 14, color: darkNomalColor(), height: 50 }}
                            underlineColorAndroid='transparent'
                            keyboardType='numeric' maxLength={6}
                            ref={(e) => this.codeInput = e}
                            onChangeText={this.numberTextChange.bind(this)}
                            value={this.state.IdentifingCode}
                            placeholderTextColor={darkLightColor()}
                            placeholder="请输入验证码">
                        </TextInput>
                    </View>
                    <View style={{ width: 1, backgroundColor: newSeparatorColor(), marginRight: 20, height: 15, marginTop: 5, marginBottom: 9 }} />
                    <TouchableOpacity onPress={this._updataMobilegetIdentifingCode.bind(this)}>
                        <Text style={{ textAlign: 'center', marginBottom: 9, fontSize: 14, marginRight: 35, marginTop: 5, color: this.state.noticeTitleColor, alignItems: 'center', justifyContent: 'center' }}>{this.state.noticeText}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 1, backgroundColor: newSeparatorColor(), opacity: 0.2, marginHorizontal: 40 }} />
                <Text style={{ width: width, fontSize: 14, textAlign: 'center', marginTop: 100, color: darkLightColor() }}>{tipText}</Text>
                <View style={{ alignItems: 'center', marginTop: 26 }}>
                    <YFWTouchableOpacity style_title={{ height: (kScreenWidth - 44) / 304 * 44, width: kScreenWidth - 54, fontSize: 16 }} title={'提交'}
                        callBack={() => { this._checkIdentifingCode(state, goBack) }}
                        isEnableTouch={true} />
                </View>
                <YFWCloseTipAlert ref={(e) => this.closeTipView = e}></YFWCloseTipAlert>
            </View>
        )
    }

    _updataMobilegetIdentifingCode() {
        if (isEmpty(this.state.before_mobile)) {
            let mobile = safe(this.state.telnumber.replace(" ", ""));
            if (!is_phone_number(mobile)) {
                YFWToast('请输入正确的手机号码');
                return;
            }
        }
        get_new_ip((ip) => {
            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.account.sendSMS');
            paramMap.set('ip', ip);
            paramMap.set('type', '1');
            if (isEmpty(this.state.before_mobile)) {
                paramMap.set('mobile', this.state.telnumber);
            }
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let code = String(res.code);
                if (code === '1') {
                    //请求验证码成功 更改ui
                    this._countdownTimes()
                    YFWToast('验证码已发送，请注意查收手机短信');
                    this.codeInput && this.codeInput.focus()
                }
            });

        })
    }

    _countdownTimes() {
        const codeTime = this.state.timerCount;
        const now = Date.now()
        const overTimeStamp = now + codeTime * 1000 + 100
        /*过期时间戳（毫秒） +100 毫秒容错*/
        this.interval = setInterval(() => {
            /* 切换到后台不受影响*/
            const nowStamp = Date.now();
            if (nowStamp >= overTimeStamp) {
                /* 倒计时结束*/
                this.interval && clearInterval(this.interval);
                this.setState({
                    updataTimeCount: codeTime,
                    noticeText: '获取验证码',
                    counting: false,
                    selfEnable: true,
                    noticeTitleColor: yfwGreenColor()
                });
            } else {
                const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
                this.setState({
                    noticeText: leftTime + "s后获取",
                    selfEnable: false,
                    noticeTitleColor: darkLightColor()
                });
            }
        }, 1000)
    }

    _checkIdentifingCode(state, goBack) {
        let smsCode = safe(this.state.IdentifingCode)
        if (!is_verification_code(smsCode)) {
            YFWToast('请输入正确的验证码')
            return;
        }
        Keyboard.dismiss()
        let paramMap = new Map();
        paramMap.set("__cmd", "person.account.AccountCancel");
        paramMap.set("smsCode", safe(smsCode));
        if (isEmpty(this.state.before_mobile)) {
            paramMap.set("mobile", safe(this.state.telnumber))
        }
        paramMap.set("cancel_reason", this.reason);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.interval && clearInterval(this.interval);
            this.closeTipView.showView(kTipTypeSuccess, '您的账户注销成功', '确定', () => {
                this._loginOut()
            })
        }, (error) => {
            if (error && error.code == -100 && isNotEmpty(error.msg)) {
                this.closeTipView.showView(kTipTypeWarn, error.msg, '知道了', () => { })
            }
        });
    }

    _loginOut() {
        this._changeAppStatus();
        let userInfo = new YFWUserInfoManager();
        userInfo.clearInfo();
        //提交推送设备信息
        postPushDeviceInfo()
        DeviceEventEmitter.emit('Login_Off')
        this.props.navigation.popToTop()
        const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' })
        this.props.navigation.dispatch(resetActionTab);
    }

    _changeAppStatus() {
        let clearOrderTipsNum = []
        new YFWUserInfoManager().shopCarNum = 0  //消除购物车红点
        new YFWUserInfoManager().messageRedPointVisible = 'false'  //消除购物车红点
        DeviceEventEmitter.emit('ALL_MESSAGE_RED_POINT_STATUS')//消除消息红点
        DeviceEventEmitter.emit('ORDER_ITEMS_TIPS_NUMS', clearOrderTipsNum)//消除订单红点
        DeviceEventEmitter.emit('DRUGREMIND_RED_POINT', { drug_remind_count: 0 })//消除服药提醒红点
        DeviceEventEmitter.emit('LOGOUT')//退出登录通知
    }
}
