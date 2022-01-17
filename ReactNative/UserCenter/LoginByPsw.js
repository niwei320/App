/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    DeviceEventEmitter
} from 'react-native';
import YFWToast from '../Utils/YFWToast'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import {
    dismissKeyboard_yfw,
    safe,
    kScreenWidth,
    kScreenHeight,
    iphoneTopMargin,
    isNotEmpty,
    haslogin
} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {yfwGreenColor,} from '../Utils/YFWColor'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import {mobClick,isEmpty} from '../PublicModule/Util/YFWPublicFunction'
import {LOGIN_TOKEN, setItem} from '../Utils/YFWStorage'
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";
import YFWTitleView from "../PublicModule/Widge/YFWTitleView";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import YFWCloseTipAlert, { kTipTypeClosed, kLoginCloseAccountKey } from './View/YFWCloseTipAlert';


export default class LoginByPsw extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            password: '',
            passwordShow: false,
            passwordType: true,
            img_show_pw_url: require('../../img/pwd_off.png'),
            img_url: require('../../img/activity_login_close.png'),
        };
    }

    componentDidMount() {
        //android返回键动作
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this._backMethod();
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler&&this.backHandler.remove();
    }

    _changecurrentPwdIcon() {
        this.setState(() => ({
                    img_show_pw_url: this.state.passwordType?require('../../img/pwd_on.png'):require('../../img/pwd_off.png'),
                    passwordType: !this.state.passwordType
                }
            )
        )
    }

    _backMethod(){
        if(this.props.navigation.state.params.state&&this.props.navigation.state.params.state.from==="oneLogin"){
            let userInfo = YFWUserInfoManager.ShareInstance();
            if (!userInfo.hasLogin() && (userInfo.enableOnLogin || userInfo.getSystemConfig().geetest_onelogin === 0 )) {
                userInfo.enableOnLogin = false
                pushNavigation(this.props.navigation.navigate, {type: 'get_login'});
            }
        }
        this.props.navigation.goBack()
    }

    render() {
        const {navigate, goBack, state} = this.props.navigation;
        return (
            <TouchableOpacity onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1} style={{backgroundColor: 'white', flex: 1}}>
                <View style={{width: kScreenWidth, height:50,backgroundColor: 'white',flexDirection: 'row',alignItems:'center',marginTop:iphoneTopMargin() - 20}}>
                    <TouchableOpacity style={{left:0,bottom:0,position:'absolute',width:44,height:44,justifyContent:'center', alignItems:'center'}} activeOpacity={1}
                                      onPress={()=>{this._backMethod()}}>
                        <Image style={{width:11,height:19,resizeMode:'stretch',padding: 5}}
                               source={ require('../../img/top_back_green.png')}/>
                    </TouchableOpacity>
                </View>
                <View style={{width:kScreenWidth, height:270, marginTop:63/667*kScreenHeight, paddingHorizontal:36/667*kScreenHeight}}>
                    <View style={{marginBottom:38/667*kScreenHeight, height:40/667*kScreenHeight, justifyContent:'center'}}>
                        <YFWTitleView style_title={{width:90, fontSize:19}} title={'密码登录'}/>
                    </View>
                    <View style={{height: 250/667*kScreenHeight}}>
                        <View style={{flexDirection:'row', alignItems: 'center'}}>
                            <TextInput style={{fontSize: 14, width:220/360*kScreenWidth,paddingBottom:2,paddingTop: 4}}
                                       numberOfLines={1}
                                       underlineColorAndroid='transparent'
                                       placeholder="请输入手机号、邮箱或用户名"
                                       placeholderTextColor="#999999"
                                       returnKeyType={'next'}
                                       autoFocus={true}
                                       onSubmitEditing={()=>{this.passwordinput && this.passwordinput.focus()}}
                                       value={this.state.userName}
                                       ref={(item) => {this.userinput = item}}
                                       onFocus={()=>{
                                        this.setState({
                                            userNameShow:this.state.userName&&this.state.userName.length>0
                                        })
                                        mobClick('password login-phone number')
                                        }}
                                       onBlur={()=>{
                                           this.setState({
                                               userNameShow:false
                                           })
                                       }}
                                       onChangeText={this._TextChange.bind(this)}/>
                            <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.userName && this.userName.focus()}}/>
                            {this._userNameShow()}
                        </View>
                        <View style={{height: 1, backgroundColor: '#DDDDDD', borderColor: "#cccccc"}}/>
                        <View style={{flexDirection:'row', alignItems: 'center', paddingTop:15/667*kScreenHeight}}>
                            <TextInput style={{width:kScreenWidth-72-43, fontSize: 14,paddingBottom:2, paddingTop: 10}}
                                       underlineColorAndroid='transparent'
                                       placeholder="请输入密码"
                                       placeholderTextColor="#999999"
                                       secureTextEntry={this.state.passwordType}
                                       value={this.state.password}
                                       ref={(item) => {this.passwordinput = item}}
                                       onFocus={()=>{
                                        this.setState({
                                            passwordShow:this.state.password&&this.state.password.length>0
                                        })
                                        mobClick('password login-password')
                                        }}
                                        onBlur={()=>{
                                            this.setState({
                                                passwordShow:false
                                            })
                                        }}
                                       onChangeText={(text) => {
                                               this.setState({
                                                   password: text?text:'',
                                                   passwordShow: text?true:false,
                                               })
                                       }}/>
                            {this._passwordShow()}
                            <TouchableOpacity activeOpacity={1} hitSlop={{left:0,top:10,bottom:10,right:10}} onPress={() => {this._changecurrentPwdIcon()}}>
                                <Image style={{width: 15, height: 12, resizeMode: 'contain', marginLeft: 15}} source={this.state.img_show_pw_url}/>
                            </TouchableOpacity>
                        </View>
                        <View style={{height: 1, backgroundColor: '#DDDDDD', borderColor: "#cccccc"}}/>
                        <TouchableOpacity style={{width:100}} hitSlop={{left:0,top:0,bottom:10,right:0}} onPress={() => {
                            mobClick('password login-forget password')
                            pushNavigation(navigate, {type: 'find_password'});
                            mobClick('getback password')
                            var dismissKeyboard = require('dismissKeyboard');
                            dismissKeyboard();
                        }}>
                            <Text style={{fontSize: 12, color: yfwGreenColor(), marginTop:6,}}>忘记密码？</Text>
                        </TouchableOpacity>
                        <View style={{alignItems:'center', marginTop:70/667*kScreenHeight}}>
                            <YFWTouchableOpacity style_title={{height:(kScreenWidth-54)/304*34, width:kScreenWidth-54, fontSize: 16}} title={'登 录'}
                                                 callBack={() => {this._onPressCallback(goBack, state)}}
                                                 isEnableTouch={!isEmpty(this.state.password) && !isEmpty(this.state.userName)}/>
                        </View>
                    </View>
                </View>
                {/* <View style={{flex:1}}/> */}
            </TouchableOpacity>
        );
    }

    _TextChange(number) {
        if (number) {
            this.setState(() => ({
                userName: number,
                userNameShow:true,
            }))
        } else {
            this.setState(() => ({
                userName: '',
                userNameShow:false,
            }))
        }
    }

    _userNameShow() {
        return (
            this.state.userNameShow ?
                (
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={() => {this._showDeletePhone()}}>
                        <Image style={{width: 13, height: 13}} source={this.state.img_url}/>
                    </TouchableOpacity>
                ) : (null)
        )
    }

    _showDeletePhone() {
        if (this.userinput != undefined){
            this.userinput.focus();
        }
        this.setState(() => ({
            userName: '',
            userNameShow: false,
            inputoneFocus: false
        }))
    }

    _passwordShow() {
        return (
            this.state.passwordShow ?
                (
                    <TouchableOpacity hitSlop={{left:15,top:10,bottom:10,right:0}} onPress={() => {this._showDeletePassword()}}>
                        <Image style={{width: 13, height: 13}} source={this.state.img_url}/>
                    </TouchableOpacity>
                ) : (<View style={{width: 13, height: 13}}/>)
        )
    }

    _showDeletePassword() {
        if (this.passwordinput != undefined){
            this.passwordinput.focus();
        }
        this.setState(() => ({
            password: '',
            passwordShow: false,
        }))
    }

    _onPressCallback(goBack, state) {

        if (isEmpty(this.state.userName) || this.state.userName.length == 0){
            YFWToast('用户名不能为空');
            return;
        }
        if (isEmpty(this.state.password) || this.state.password.length == 0){
            YFWToast('密码不能为空');
            return;
        }


        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.account.login');
        paramMap.set('userName', this.state.userName);
        paramMap.set('password', this.state.password);
        paramMap.set('login_type', 2);
        let erpInfo = YFWUserInfoManager.ShareInstance().getErpUserInfo()
        if (isNotEmpty(erpInfo)) {
            paramMap.set('from_unionid',erpInfo['from_unionid'])
            paramMap.set('sub_siteid',erpInfo['sub_siteid'])
        }
        viewModel.TCPRequest(paramMap, (res) => {
            if (res.code === '1' || res.code == 1) {
                // log('传递ssid:' + res.result.ssid);
                let userInfo = YFWUserInfoManager.ShareInstance();
                userInfo.setSsid(safe(res.ssid));//ssid传入一个死值
                DeviceEventEmitter.emit('UserLoginSucess');
                goBack(this.props.navigation.state.params.gobackKey);
                mobClick('password login-submit')
                setItem(LOGIN_TOKEN,safe(res.result.login_token))
                this._dealNavigationCallBackAction()
            } else {
                YFWToast(res.msg);
            }
        }, (error) =>{
            if (error && error.code == -100 && isNotEmpty(error.msg)) {
                DeviceEventEmitter.emit(kLoginCloseAccountKey,error.msg,()=>{})
                return
            }
            if (isNotEmpty(error)&&isNotEmpty(error.msg)) {
                YFWToast(error.msg)
            }
        });
    };

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
