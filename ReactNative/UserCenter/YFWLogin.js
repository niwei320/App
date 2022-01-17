/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    Image,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,Animated
} from 'react-native';
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import {
    darkStatusBar,
    dismissKeyboard_yfw,
    is_phone_number,
    isNotEmpty,
    REGISTER_PROTOCOL_HTML,
    safe,
    safeObj,
    kScreenHeight,
    kScreenWidth,
    isIphoneX, iphoneTopMargin, checkAuditStatus
} from '../PublicModule/Util/YFWPublicFunction'
import {yfwGreenColor, yfwLightGreenColor} from "../Utils/YFWColor";
import YFWNativeManager from '../Utils/YFWNativeManager'
import YFWToast from '../Utils/YFWToast'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import {mobClick,isEmpty} from '../PublicModule/Util/YFWPublicFunction'
import {LOGIN_TOKEN, setItem} from "../Utils/YFWStorage";
import YFWTitleView from "../PublicModule/Widge/YFWTitleView";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import { kLoginCloseAccountKey } from './View/YFWCloseTipAlert';

export default class Login extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null,
    });

    constructor(props) {
        super(props);
        this.userName = "";
        this.password = "";
        this.state = {
            identifingCode: '',
            isshowdelete: false,
            phone: '',
            thirdUserinfo: [],
            img_Url: require('../../img/activity_login_close.png'),
            privacyCheckAnimatedY: new Animated.Value(0),
            fadeAnim:new Animated.Value(0),
            privacyCheckBoxOK:false
        }
    }

    onRightTVClick() {
        dismissKeyboard_yfw()
        this.props.navigation.navigate('LoginByPsw', {gobackKey: this.props.navigation.state.key,callBack:this.props.navigation.state.params?this.props.navigation.state.params.state.callBack:null})
        mobClick('password login')
    }
    onLeftTVClick() {
        const {navigate, goBack, state} = this.props.navigation;
        let configInfo = YFWUserInfoManager.ShareInstance().getSystemConfig()
        if (configInfo.geetest_onelogin === 0) {
            goBack()
            return
        }
        if(this.props.navigation.state.params.state&&this.props.navigation.state.params.state.from==="oneLogin"){
            YFWNativeManager.isOneLoginPreGetTokenSuccess((isSuccess)=>{
                if(isSuccess) {
                    pushNavigation(navigate, {type: 'get_login'})
                    goBack()
                } else {
                    goBack()
                }
            })
        }else{
            goBack()
        }
    }

    numberTextChange(number) {
        let inputnumber = number.replace(/[^\d]/g, '');
        this.setState(() => ({
                    phone: inputnumber,
                    counting: false,
                    isshowdelete: true,
                }
            )
        )
    }


    componentDidMount() {

        darkStatusBar();
        const {navigate, goBack, state} = this.props.navigation;
        this.getUserInfo = DeviceEventEmitter.addListener('sss', (msg) => {
            let data = JSON.parse(msg);
            this.state.thirdUserinfo = data;
            if (isNotEmpty(data)) {
                this._requestThirdLogin(data, goBack, navigate)
            }
        });
        //android返回键动作
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onLeftTVClick();
            return true;
        });
        mobClick('login')
    }

    _requestThirdLogin(data, goback, navigate) {
        let type;
        if (data.type == 'weibo') {
            type = '1';
        } else if (data.type == 'qq'||data.type == 'QQ') {
            type = '2';
        } else if (data.type == 'alipay') {
            type = '3';
        } else {//微信
            type = '4';
        }

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.getAccountInfoByOpenKey');
        paramMap.set('open_key', data.key);
        paramMap.set('type', type);
        paramMap.set('nick_name', safe(data.nick_name));
        paramMap.set('img_url', data.img_url);
        let erpInfo = YFWUserInfoManager.ShareInstance().getErpUserInfo()
        if (isNotEmpty(erpInfo)) {
            paramMap.set('from_unionid',erpInfo['from_unionid'])
            paramMap.set('sub_siteid',erpInfo['sub_siteid'])
        }
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if (isNotEmpty(res)) {
                if (res.code == 1 && isNotEmpty(res.result) && res.result) {
                    //登陆成功
                    let userInfo = new YFWUserInfoManager;
                    userInfo.setSsid(safeObj(res.ssid));
                    DeviceEventEmitter.emit('UserLoginSucess');
                    setItem(LOGIN_TOKEN,safe(res.result.login_token))
                    goback();
                    this._dealNavigationCallBackAction()
                } else {
                    //绑定手机
                    navigate('BindUserPhoneNum', {
                        data: this.state.thirdUserinfo,
                        gobackKey: this.props.navigation.state.key,
                        callBack:this.props.navigation.state.params?this.props.navigation.state.params.state.callBack:null
                    })
                }
            }
        }, (res) => {
            let error = res
            if (error && error.code == -100 && isNotEmpty(error.msg)) {
                DeviceEventEmitter.emit(kLoginCloseAccountKey,error.msg,()=>{})
                return
            }
            if (isNotEmpty(res)&& res.code == -2) {
                //绑定手机号码
                navigate('BindUserPhoneNum', {
                    data: this.state.thirdUserinfo,
                    gobackKey: this.props.navigation.state.key,
                    callBack:this.props.navigation.state.params?this.props.navigation.state.params.state.callBack:null
                })
            }
        }, false);
    }

    privacyCheck(){
        if(!this.state.privacyCheckBoxOK){
            Animated.timing(
                this.state.fadeAnim,
                {
                    toValue: 0,
                    duration: 500,
                }).start()
        }
        this.setState({
            privacyCheckBoxOK:!this.state.privacyCheckBoxOK
        })
    }

    componentWillUnmount() {
        this.getUserInfo&&this.getUserInfo.remove()
        this.backHandler&&this.backHandler.remove();
    }

    render() {
        return (
            <TouchableOpacity style={{flex:1,backgroundColor: 'white'}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                <View style={{width: kScreenWidth, height:50,backgroundColor: 'white',flexDirection: 'row',alignItems:'center',marginTop:iphoneTopMargin() - 20}}>
                    <TouchableOpacity style={{left:0,bottom:0,position:'absolute',width:44,height:44,justifyContent:'center', alignItems:'center'}} activeOpacity={1}
                                      onPress={()=>{ this.onLeftTVClick() }}>
                        <Image style={{width:11,height:19,resizeMode:'stretch',padding: 5}}
                               source={ require('../../img/top_back_green.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityLabel='login_by_pwd' style={{right:0,bottom:0,position:'absolute',width:100,height:44,justifyContent:'center', alignItems:'center'}} activeOpacity={1}
                                      onPress={()=>{ this.onRightTVClick() }}>
                        <Text style={{fontSize: 14, color: yfwGreenColor(), marginTop:6,}}>账号密码登录</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width:kScreenWidth,height:isIphoneX()?kScreenHeight-300:kScreenHeight-260,marginTop:63/667*kScreenHeight,paddingHorizontal:36}}>
                        <View style={{marginBottom:38, height:40, justifyContent:'center'}}>
                            <YFWTitleView style_title={{width:126,fontSize:19}} title={'请输入手机号'}/>
                        </View>
                        <View style={{height: 250/667*kScreenHeight}}>
                            <View style={{flexDirection:'row', alignItems: 'center'}}>
                                <TextInput style={{fontSize: 14, width:220/360*kScreenWidth,paddingBottom:2,paddingTop: 4}}
                                           ref={(item) => {this.numberInput = item}}
                                           onChangeText={this.numberTextChange.bind(this)}
                                           underlineColorAndroid='transparent'
                                           keyboardType='number-pad'
                                           returnKeyType={'next'}
                                           maxLength={11}
                                           value={this.state.phone}
                                           onFocus={()=>{mobClick('login-phonenumber')}}
                                           placeholderTextColor="#999999"
                                           placeholder="请输入手机号码"/>
                                <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.numberInput && this.numberInput.focus()}}/>
                                {this._inputDeleteShow()}
                            </View>
                            <View style={{height: 1, backgroundColor: '#DDDDDD', borderColor: "#cccccc"}}/>
                            {/* <View style={{flex:1}}/> */}
                            <View style={{alignItems:'center',paddingTop: 50}}>
                                <YFWTouchableOpacity style_title={{height:(kScreenWidth-54)/304*34, width:kScreenWidth-54, fontSize: 16}} title={'下一步'}
                                                     callBack={()=>this._goNext()}
                                                     isEnableTouch={this.state.phone.length === 11}/>
                            </View>
                            <Animated.View style={{flexDirection: 'row',alignItems:'center',width:kScreenWidth-54,paddingTop:10,left:this.state.privacyCheckAnimatedY.interpolate({
                                    inputRange: [-1, 1],
                                    outputRange: [-10, 10]}) }}>
                                <TouchableOpacity accessibilityLabel='login_check' onPress={() => {this.privacyCheck()}} style={{paddingBottom:15,paddingRight:15,paddingTop:15}} activeOpacity={1}>
                                    <Image style={{ width: 15, height: 15, resizeMode: 'stretch'}}
                                           source={this.state.privacyCheckBoxOK?require('../../img/icon_check_green_on.png'):require('../../img/check_discheck.png')}/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this._getUserAgreement()} activeOpacity={1}>
                                    <View style={{width:kScreenWidth-54-30, paddingRight:10}}>
                                        <Text style={{color: '#999999', fontSize: 12}}> 未注册的手机号登录时自动注册，并视为同意
                                            <Text style={{fontSize: 12, color: yfwLightGreenColor() }}>《药房网用户个人服务协议》</Text>
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                            <Animated.View style={{flex:1, left:-10,top:-10, opacity: this.state.fadeAnim,}}>
                                <Image source={require('../../img/messageAngle.png')} style={{marginLeft:10,width: 16, height: 8, marginRight: 3, tintColor:'rgb(50, 50, 50)'}} />
                                <View style={{backgroundColor:'rgb(50, 50, 50)',width:150,padding:10,paddingHorizontal:15,borderRadius:3}}>
                                    <Text style={{color:'white'}}>{'请同意服务协议'}</Text>
                                </View>
                            </Animated.View>
                        </View>
                    </View>
                    {this._renderThildLogin()}
            </TouchableOpacity>
        );
    }

    _renderThildLogin() {
        if (checkAuditStatus() && Platform.OS === 'ios') {
            return null
        }
        const {navigate, goBack, state} = this.props.navigation;
        let thirdCount = 4;
        return (
            <View style={{ flexDirection: 'column', justifyContent: 'center',marginBottom:isIphoneX()?70:36,marginLeft:40}}>
                <View style={{ flexDirection:'row',width:kScreenWidth-80,alignItems:'center',height:40,justifyContent:'center'}}>
                    <View style={{backgroundColor:'#e5e5e5',width:56/360*(kScreenWidth),height:1}}/>
                    <Text style={{color: '#cccccc', fontSize: 12,marginHorizontal:15,textAlign:'center'}}>使用合作账号登录</Text>
                    <View style={{backgroundColor:'#e5e5e5',width:56/360*(kScreenWidth),height:1}}/>
                </View>
                <View style={{ flexDirection: 'row',width:kScreenWidth-80,marginTop:10}}>
                    <TouchableOpacity onPress={() => this.ThirdLogin(1)} hitSlop={{left:0,top:10,bottom:10,right:0}} style={{width:(kScreenWidth-80)/thirdCount ,alignItems:'center'}}
                                        activeOpacity={1}>
                        <Image style={{height: 30, width: 30}}
                                source={require('../../img/user_center_login1.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.ThirdLogin(2)} hitSlop={{left:0,top:10,bottom:10,right:0}} style={{width:(kScreenWidth-80)/thirdCount ,alignItems:'center'}}
                                        activeOpacity={1}>
                        <Image style={{height: 30, width: 30}}
                                source={require('../../img/user_center_login2.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.ThirdLogin(3)} hitSlop={{left:0,top:10,bottom:10,right:0}} style={{width:(kScreenWidth-80)/thirdCount ,alignItems:'center'}}
                                        activeOpacity={1}>
                        <Image style={{height: 30, width: 30}}
                                source={require('../../img/user_center_login3.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.ThirdLogin(4)} hitSlop={{left:0,top:10,bottom:10,right:0}} style={{width:(kScreenWidth-80)/thirdCount ,alignItems:'center'}}
                                                            activeOpacity={1}>
                        <Image style={{height: 30, width: 30}}
                                source={require('../../img/user_center_login4.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    _goNext(){
        if (!this.state.privacyCheckBoxOK){
            Animated.timing(
                this.state.fadeAnim,
                {
                    toValue: 1,
                    duration: 500,
            }).start()
            Animated.sequence([
                Animated.spring(this.state.privacyCheckAnimatedY, {
                    toValue: 1, speed:3000,bounciness:1
                }),
                Animated.spring(this.state.privacyCheckAnimatedY, {
                    toValue:0, speed:3000,bounciness:1
                }),
                Animated.spring(this.state.privacyCheckAnimatedY, {
                    toValue: 1, speed:3000,bounciness:1
                }),
                Animated.spring(this.state.privacyCheckAnimatedY, {
                    toValue:0, speed:3000,bounciness:1
                }),
                Animated.spring(this.state.privacyCheckAnimatedY, {
                    toValue: 1, speed:3000,bounciness:1
                }),
                Animated.spring(this.state.privacyCheckAnimatedY, {
                    toValue:0, speed:3000,bounciness:1
                }),
            ]).start(() => {
            });
            return;
        }
        if (!is_phone_number(this.state.phone)){
            YFWToast('请输入正确的手机号码');
            return;
        }
        //todo: 跳转逻辑
        const {navigate, goBack, state} = this.props.navigation;
        navigate('VerificationCode', {
            from: 'login',
            mobile: this.state.phone,
            gobackKey: this.props.navigation.state.key,
            callBack:this.props.navigation.state.params?this.props.navigation.state.params.state.callBack:null
        })
    }

    ThirdLogin(number) {
        let type=undefined;
        switch (number){
            case 1:
                type = 'ali';
                mobClick('login-alipay')
                break;
            case 2:
                type = 'wx';
                mobClick('login-wechat')
                break;
            case 3:
                type = 'qq';
                mobClick('login-qq')
                break;
            case 4:
                type = 'weibo';
                break;
        }
        this.loginByQQ(type)
    }

    loginByQQ(type) {

        const {navigate, goBack, state} = this.props.navigation;
        YFWNativeManager.openThirdLogin(type,(info)=>{

            this.state.thirdUserinfo = info;
            if (isNotEmpty(info)) {
                this._requestThirdLogin(info,goBack,navigate)
            }
        });
    }

    _dealNavigationCallBackAction(){
        if (this.props.navigation.state.params&&this.props.navigation.state.params.state&&this.props.navigation.state.params.state.callBack) {
            this.props.navigation.state.params.state.callBack()
        }
    }

    _getUserAgreement() {
        const {navigate} = this.props.navigation;
        let url = REGISTER_PROTOCOL_HTML();
        pushNavigation(navigate,{type:'get_h5',value:url,name: '服务条款',isHiddenShare:true,title:'服务条款'});
        mobClick('login-service')
        dismissKeyboard_yfw();
    }

    _inputDeleteShow() {
        return (
            this.state.isshowdelete ?
                (
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={() => {this._showDeleteCode()}}>
                        <Image style={{width: 13, height: 13}} source={this.state.img_Url}/>
                    </TouchableOpacity>
                ) : (null)
        )
    }

    _showDeleteCode() {
        if (this.numberInput != undefined){
            this.numberInput.focus();
        }
        this.setState(() => ({
            isshowdelete: false,
            phone: ''
        }))
    }
}
