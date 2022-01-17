import React, { Component } from 'react'
import {Text,View, TouchableOpacity, TextInput, StyleSheet, Image, Animated, DeviceEventEmitter} from 'react-native'
import YFWTitleView from '../PublicModule/Widge/YFWTitleView'
import {darkTextColor,darkLightColor} from '../Utils/YFWColor'
import {dismissKeyboard_yfw, kScreenWidth, iphoneTopMargin, mobClick,safe,
    safeObj,
    isNotEmpty,} from "../PublicModule/Util/YFWPublicFunction";
import {get_new_ip} from "../Utils/YFWInitializeRequestFunction";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWToast from '../Utils/YFWToast'
import {LOGIN_TOKEN, setItem} from "../Utils/YFWStorage";
import { kLoginCloseAccountKey } from './View/YFWCloseTipAlert';

var animatedFocusOpacity = null;

export default class YFWVerificationController extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null
    });

    constructor(props) {
        super(props);

        this.state={
            codeArray: [],
            verificationCode: '',
            telnumber: this.props.navigation.state.params.mobile,
            noticeText: '获取验证码',
            selfEnable: true,
            voice: false,
            timerCount: 60,
            receive: '接收不到？',
            haveTry: '语音验证码',
            isCallPhone: false,
            thirdUserinfo: this.props.navigation.state.params.data,
            type: '1',
            mobType: 'login-receive code',
            mobInputType: 'login input code',
            focusOpacity: new Animated.Value(0),
            isShowFocus: true,
            isSuccess: false // 防止iOS快速提交验证码
        }
    }

    componentDidMount() {

        this._getFrom();

        this._setFocusAnimated();

        this._getIdentifingCode();
    }

    _setFocusAnimated() {
        animatedFocusOpacity = Animated.timing(
            this.state.focusOpacity, // 初始值
            {
                toValue: 1, // 终点值
                duration: 1250,
            }
        );

        Animated.loop(animatedFocusOpacity).start(); // 开始动画
    }

    _getFrom() {
        var type = '1'
        var mobType = 'login-receive code'
        var mobInputType = 'getback password-input code'

        let from = this.props.navigation.state.params.from
        if (from === 'login') {
            type = '1'
            mobType = 'login-receive code'
            mobInputType = 'login input code'
        } else if (from === 'bindMobile') {
            type = '1'
            mobType = 'bindMobile login-receive code'
            mobInputType = 'bindMobile input code'
        } else if (from === 'findPassword') {
            type = '3'
            mobType = 'getback password-receive code'
            mobInputType = 'getback password-input code'
        }
        this.setState({
            type: type,
            mobType: mobType,
            mobInputType: mobInputType,
        })
    }

    /*
    60秒倒计时
     *
     * */
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
                this.callSMSVerifyStopStatus()
            } else {
                const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
                this.setState({
                    noticeText: leftTime + "秒后重新获取",
                    selfEnable: false,
                    isCallPhone: true,
                })
            }
         }, 1000)
    }

    /**
     * 发送短信验证码结束状态
     */
    callSMSVerifyStopStatus(){
        this.interval && clearInterval(this.interval);
        this.setState({
            timerCount: 60,
            noticeText: '获取验证码',
            counting: false,
            selfEnable: true,
            voice:true,
            isCallPhone: false,
        })
    };

    _getIdentifingCode() {
        if (!this.state.selfEnable) {
            return
        }
        //先设置不可点击，成功请求时会倒计改变值的，请求失败改为可点击
        this.state.selfEnable = false
        //发请求同时 更改倒计时ui
        this._countdownTimes()

        get_new_ip((ip)=>{

            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.account.sendSMS');
            paramMap.set('mobile', this.state.telnumber);
            paramMap.set('ip', ip);
            paramMap.set('type', this.state.type);
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let code = String(res.code);
                if (code === '1') {
                    YFWToast('验证码已发送，请注意查收手机短信');

                    mobClick(this.state.mobType)
                } else if (code === '-1') {
                    this.setState({
                        voice: true
                    })
                } else if (code === '-2') {
                    this.setState({
                        voice: true
                    })
                }
            },(error)=>{
                // YFWToast("验证码发送失败")
                this.callSMSVerifyStopStatus()
            });
        },(error)=>{
            YFWToast("验证码发送失败")
            this.callSMSVerifyStopStatus()
        });
    }

    _showCallPhone(){
        if (this.state.isCallPhone){
            return
        }
        this.state.isCallPhone = true

        this.setState({
            receive: '',
            haveTry: "拨打中，请注意接听（60s）",
        })
        this._callPhoneTime()

        get_new_ip((ip)=>{

            let paramMap = new Map();
            paramMap.set("__cmd", "guest.account.sendSMS");
            paramMap.set("mobile", this.state.telnumber);
            paramMap.set("ip", ip);
            paramMap.set("type", this.state.type);
            paramMap.set("isVoice", '1');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                if (res.code === '1') {
                   //发送成功
                   mobClick(this.state.mobType)
                }
            },(error)=>{
                // YFWToast("语音验证码发送失败")
                this.callPhoneVerifyStopStatus()
            })

        },(error)=>{
            YFWToast("语音验证码发送失败")
            this.callPhoneVerifyStopStatus()
        })

    }

    /**
    * 拨打电话60秒倒计时
    *
    */
    _callPhoneTime(){
        const codeTime = 60;
        const now = Date.now()
        const overTimeStamp = now + codeTime * 1000 + 100
        /*过期时间戳（毫秒） +100 毫秒容错*/
        this.interval = setInterval(() => {
            /* 切换到后台不受影响*/
            const nowStamp = Date.now();
            if (nowStamp >= overTimeStamp) {
                /* 倒计时结束*/
                this.callPhoneVerifyStopStatus()
            } else {
                const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
                this.setState({
                    haveTry: '电话拨打中，请留意来电('+leftTime+'秒)',
                    isCallPhone: true,
                    selfEnable: false,
                })
            }
        }, 1000)
    }

    /**
     * 发送语音验证码结束状态
     */
    callPhoneVerifyStopStatus(){
        /* 倒计时结束*/
        this.interval && clearInterval(this.interval);
        this.setState({
            receive:'接收不到？',
            haveTry: '语音验证码',
            isCallPhone: false,
            selfEnable: true,
        });
        if (this.props.timerEnd) {
            this.props.timerEnd()
        }
    }

    render() {
        const {navigate, goBack, state} = this.props.navigation;

        return(
            <TouchableOpacity
                style={styles.container}
                activeOpacity={1}
                onPress={() => {dismissKeyboard_yfw();}}>
                <View style={styles.headr}>
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} style={{left:10,position:'absolute'}} activeOpacity={1}
                                        onPress={()=>{ goBack() }}>
                        <Image style={{width:18,height:18,resizeMode:'contain',padding: 5}}
                                source={ require('../../img/top_back_green.png')}/>
                    </TouchableOpacity>
                </View>

                <View style={[styles.paddStyles, {height: 80}]}>
                    <YFWTitleView title={'请输入验证码'} style_title={{width: 125, fontSize: 19}}></YFWTitleView>
                </View>

                <View style={[styles.paddStyles, {justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',top:15}]}>
                    <Text style={styles.text}>验证码已发送至  <Text style={{color:darkTextColor()}}>+86  {this.state.telnumber}</Text></Text>
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} activeOpacity={1} onPress={()=>this._getIdentifingCode()}>
                        <Text style={styles.text}>{this.state.noticeText}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.paddStyles, {justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',marginTop:80}]}>
                    <View style={styles.codeItem}>
                        <Text style={styles.codeNumber}>{this.state.codeArray.length>0 ? this.state.codeArray[0] : ' '}</Text>
                        <View style={[styles.codeLine, {backgroundColor: this.state.codeArray.length>0 ? '#999999' : '#cccccc'}]}></View>
                    </View>
                    <View style={styles.codeItem}>
                        <Text style={styles.codeNumber}>{this.state.codeArray.length>1 ? this.state.codeArray[1] : ' '}</Text>
                        <View style={[styles.codeLine, {backgroundColor: this.state.codeArray.length>1 ? '#999999' : '#cccccc'}]}></View>
                    </View>
                    <View style={styles.codeItem}>
                        <Text style={styles.codeNumber}>{this.state.codeArray.length>2 ? this.state.codeArray[2] : ' '}</Text>
                        <View style={[styles.codeLine, {backgroundColor: this.state.codeArray.length>2 ? '#999999' : '#cccccc'}]}></View>
                    </View>
                    <View style={styles.codeItem}>
                        <Text style={styles.codeNumber}>{this.state.codeArray.length>3 ? this.state.codeArray[3] : ' '}</Text>
                        <View style={[styles.codeLine, {backgroundColor: this.state.codeArray.length>3 ? '#999999' : '#cccccc'}]}></View>
                    </View>
                    <View style={styles.codeItem}>
                        <Text style={styles.codeNumber}>{this.state.codeArray.length>4 ? this.state.codeArray[4] : ' '}</Text>
                        <View style={[styles.codeLine, {backgroundColor: this.state.codeArray.length>4 ? '#999999' : '#cccccc'}]}></View>
                    </View>
                    <View style={styles.codeItem}>
                        <Text style={styles.codeNumber}>{this.state.codeArray.length>5 ? this.state.codeArray[5] : ' '}</Text>
                        <View style={[styles.codeLine, {backgroundColor: this.state.codeArray.length>5 ? '#999999' : '#cccccc'}]}></View>
                    </View>
                    {this._renderFocusView()}
                    <TextInput
                        accessibilityLabel='login_sms_code'
                        style={{position:'absolute',height:40,left:36,right:36,opacity:0,}}
                        keyboardType={'number-pad'}
                        maxLength={6}
                        autoFocus={true}
                        onFocus={() => {
                            mobClick(this.state.mobInputType)
                            if (this.state.isShowFocus) {
                                return;
                            }
                            this.setState({
                                isShowFocus: true,
                            })
                            Animated.loop(animatedFocusOpacity).start()
                        }}
                        onEndEditing={() => {
                            // 停止动画、隐藏光标
                            Animated.loop(animatedFocusOpacity).stop()
                            this.setState({
                                isShowFocus: false,
                            })
                        }}
                        onChangeText={(text) => this._changeText(text)}>

                    </TextInput>
                </View>

                {this._showVoiceView()}
            </TouchableOpacity>
        )
    }

    _showVoiceView() {
        return(
            this.state.voice ? (
                <View style={[styles.paddStyles, {paddingVertical: 15,}]}>
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} style={{width:80}} activeOpacity={1} onPress={this._showCallPhone.bind(this)}>
                        <Text style={[styles.text, {color:'#1fdb9b'}]}>{this.state.haveTry}</Text>
                    </TouchableOpacity>
                </View>
            ) : (null)
        )
    }

    _renderFocusView() {
        let index = this.state.codeArray.length > 5 ? 5.3 : this.state.codeArray.length
        let foucsLeft = (kScreenWidth-142)/12 + 36 + ((kScreenWidth-142)/6+14)*index

        return(
            this.state.isShowFocus ?
                <Animated.View style={{width:2, height: 27,backgroundColor:'#45dfac',position:'absolute',opacity:this.state.focusOpacity,left:foucsLeft}}></Animated.View>
                :
                (null)
        )
    }

    _changeText(text) {
        if (text.length > 6) {
            text = text.substr(0,6);
        }

        var codeArray = [];

        for (let index = 0; index < text.length; index++) {
            codeArray.push(text.substr(index,1))
        }

        this.setState({
            codeArray: codeArray,
        })

        this._moveFoucs(text.length)

        if (text.length === 6 && !this.state.isSuccess) {
            dismissKeyboard_yfw();
            this.state.verificationCode = text;
            this.state.isSuccess = true;
            this._identifyCodeCommit();
        }
    }

    _moveFoucs(index) {
        if (index > 5) {
            // 停止动画、隐藏光标
            Animated.loop(animatedFocusOpacity).stop()
            this.setState({
                isShowFocus: false,
            })
        } else {
            if(this.state.isShowFocus) {
                return;
            }
            this.setState({
                isShowFocus: true,
            })
            Animated.loop(animatedFocusOpacity).start()
        }
    }

    _identifyCodeCommit() {
        let from = this.props.navigation.state.params.from
        if (from === 'login') {
            this._identfiyCodeLogin(this.props.navigation.goBack);
        } else if (from === 'bindMobile') {
            this._bindMobile(this.props.navigation.goBack);
        } else if (from === 'findPassword') {
            this._findPassword();
        } else if (from === 'updateMobile'){
            this._updataMobileNum(this.props.navigation.callBack)
        }
    }

    /** 登录 */
    _identfiyCodeLogin(goBack) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.login');
        paramMap.set('mobile', this.state.telnumber);
        paramMap.set('login_type', 1);
        paramMap.set('smsCode', this.state.verificationCode);
        let erpInfo = YFWUserInfoManager.ShareInstance().getErpUserInfo()
        if (isNotEmpty(erpInfo)) {
            paramMap.set('from_unionid',erpInfo['from_unionid'])
            paramMap.set('sub_siteid',erpInfo['sub_siteid'])
        }
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if (res.code == 1) {
                //state.params.callback(res.item);
                let userInfo = YFWUserInfoManager.ShareInstance();
                userInfo.setSsid(safe(res.ssid));
                DeviceEventEmitter.emit('UserLoginSucess');
                goBack(this.props.navigation.state.params.gobackKey);
                mobClick('login-submit')
                var dismissKeyboard = require('dismissKeyboard');
                dismissKeyboard();
                setItem(LOGIN_TOKEN,safe(res.login_token))
                this._dealNavigationCallBackAction()
            } else {
                YFWToast(res.msg)
                this.state.isSuccess = false;
            }
        },(error) => {
            if (error && error.code == -100 && isNotEmpty(error.msg)) {
                DeviceEventEmitter.emit(kLoginCloseAccountKey,error.msg,()=>{})
            }
            this.state.isSuccess = false;
        })
    }

    /** 绑定手机号 只有新用户用第三方登录进来，会调用的绑定手机号接口*/
    _bindMobile(goBack, state) {
        let type = '4';
        switch (this.state.thirdUserinfo.type) {
            case 'weibo':
                type = '1'
                break;
            case 'QQ':
            case 'qq':
                type = '2'
                break;
            case 'alipay':
                type = '3'
                break;
            case 'weixin':
                type = '4'
                break;
            default:
                type = '4'
                break
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.account.venderLogin');
        paramMap.set('type', type);
        paramMap.set('open_key', this.state.thirdUserinfo.key);
        paramMap.set('intro_image', this.state.thirdUserinfo.img_url);
        paramMap.set('name', this.state.thirdUserinfo.nick_name);
        paramMap.set('mobile', this.state.telnumber);
        paramMap.set('smsCode', this.state.verificationCode);
        paramMap.set('login_type', 1);
        viewModel.TCPRequest(paramMap, (res) => {
            if(res.code == 1) {
                let userInfo = YFWUserInfoManager.ShareInstance();
                userInfo.setSsid(res.ssid);
                DeviceEventEmitter.emit('UserLoginSucess');
                if(this.props.navigation.state.params.gobackKey != null){
                    goBack(this.props.navigation.state.params.gobackKey);
                } else {
                    this.props.navigation.popToTop();
                }
                var dismissKeyboard = require('dismissKeyboard');
                dismissKeyboard();
                this._dealNavigationCallBackAction()
            }else {
                this.state.isSuccess = false;
            }
        },(error) => {
            this.state.isSuccess = false;
        })
    }

    /** 找回密码 */
    _findPassword() {

        let paramMap = new Map();
        paramMap.set("__cmd", "guest.account.isValidSMSCode");
        paramMap.set("mobile", safe(this.state.telnumber));
        paramMap.set("smsCode", safe(this.state.verificationCode));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if (Number.parseInt(res.code) == 1 && res.result) {
                const {navigate} = this.props.navigation;
                this.onCallBack(navigate)
                mobClick('getback password-next')
                var dismissKeyboard = require('dismissKeyboard');
                dismissKeyboard();
            }else {
                this.state.isSuccess = false;
            }
        },(error) => {
            this.state.isSuccess = false;
        });
    }

    //绑定、更新手机号
    _updataMobileNum(callBack) {
        let paramMap = new Map();
        paramMap.set("__cmd", "person.account.updateMobile");
        paramMap.set("mobile", this.state.telnumber);
        paramMap.set("mobile_smscode", safe(this.state.verificationCode));
        paramMap.set("old_mobile_smscode", '');
        paramMap.set("bind_mobile", 1);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('绑定成功')
            YFWUserInfoManager.ShareInstance().hasBlindMobile = true;
            this.props.navigation.goBack(this.props.navigation.state.params.gobackKey)
            callBack&&callBack();
        });
    }


    onCallBack() {
        this.props.navigation.navigate('ModifyPassword', {gobackKey: this.props.navigation.state.params.gobackKey,phone: this.state.telnumber})
    }

    _dealNavigationCallBackAction(){
        if (this.props.navigation.state.params) {
            if (this.props.navigation.state.params.callBack) {
                this.props.navigation.state.params.callBack()
            } else if (this.props.navigation.state.params.state&&this.props.navigation.state.params.state.callBack) {
                this.props.navigation.state.params.state.callBack()
            }
        }
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headr: {
        width: kScreenWidth,
        height:50,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems:'center',
        marginTop:iphoneTopMargin() - 20
    },
    paddStyles: {
        paddingHorizontal: 36,
        width: kScreenWidth,
    },
    codeItem: {
        height: 40,
        width:(kScreenWidth-142)/6,
        justifyContent:'center'
    },
    codeNumber: {
        fontSize:35,
        color:darkTextColor(),
        textAlign:'center'
    },
    codeLine: {
        height:1,
        backgroundColor: '#999999',
    },
    text: {
        fontSize: 12,
        color: darkLightColor(),
    }
})