import React, {Component} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Dimensions, Image, DeviceEventEmitter
} from 'react-native'
import TextInputLayout from "../widget/TextInputLayout";
import {darkLightColor} from "../Utils/YFWColor";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWToast from "../Utils/YFWToast";
var forge = require('node-forge');
const width = Dimensions.get('window').width;
import {
    dismissKeyboard_yfw,
    kScreenHeight,
    kScreenWidth,
    mobClick
} from '../PublicModule/Util/YFWPublicFunction'
import {iphoneTopMargin,isEmpty} from '../PublicModule/Util/YFWPublicFunction'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWTitleView from "../PublicModule/Widge/YFWTitleView";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";
import { EMOJIS } from '../PublicModule/Util/RuleString';


export default class ModifyPassword extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            passwordCheck: '',
            passwordShow: false,
            passwordCheckShow: false,
            passwordType: true,
            passwordCheckType: true,
            imgUrl: require('../../img/pwd_off.png'),
            imgCheckUrl: require('../../img/pwd_off.png'),
            img_url: require('../../img/activity_login_close.png'),

        };
    }

    render() {
        const {navigate, goBack, state} = this.props.navigation;
        return (
                <TouchableOpacity style={{backgroundColor: 'white', flex: 1}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                    <View style={{width: kScreenWidth, height:50,backgroundColor: 'white',flexDirection: 'row',alignItems:'center',marginTop:iphoneTopMargin() - 20}}>
                        <TouchableOpacity style={{left:0,bottom:0,position:'absolute',width:44,height:44,justifyContent:'center', alignItems:'center'}} activeOpacity={1}
                                          onPress={()=>{ goBack() }}>
                            <Image style={{width:11,height:19,resizeMode:'stretch',padding: 5}}
                                   source={ require('../../img/top_back_green.png')}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{width:kScreenWidth, height:270, marginTop:63/667*kScreenHeight, paddingHorizontal:36}}>
                        <View style={{marginBottom:38, height:44, justifyContent:'center'}}>
                            <YFWTitleView style_title={{width:90, fontSize:19}} title={'重置密码'}/>
                        </View>
                        <View style={{height: 250/667*kScreenHeight}}>
                            <View style={{flexDirection:'row', alignItems: 'center', paddingTop:35/667*kScreenHeight}}>
                                <TextInput style={{width:kScreenWidth-72-43, fontSize: 12, paddingTop: 10}}
                                           underlineColorAndroid='transparent'
                                           autoFocus={true}
                                           returnKeyType={'next'}
                                           onSubmitEditing={()=>{this.nextpassword && this.nextpassword.focus()}}
                                           placeholder="请输入密码(字母加数字组合，不少于6位)"
                                           placeholderTextColor="#999999"
                                           secureTextEntry={this.state.passwordType}
                                        //    multiline={!this.state.passwordShow}
                                           value={this.state.password}
                                           onFocus={()=>{
                                               mobClick('getback password-input password')
                                           }}
                                           onChangeText={this.numberTextChange.bind(this)}>
                                </TextInput>
                                {this._passwordShow()}
                                <TouchableOpacity activeOpacity={1} onPress={() => {this._changecurrentPwdIcon()}}>
                                    <Image style={{width: 15, height: 12, resizeMode: 'contain', marginLeft: 15}} source={this.state.imgUrl}/>
                                </TouchableOpacity>
                            </View>
                            <View style={{height: 1, backgroundColor: '#DDDDDD', borderColor: "#cccccc"}}/>
                            <View style={{flexDirection:'row', alignItems: 'center', paddingTop:35/667*kScreenHeight}}>
                                <TextInput style={{width:kScreenWidth-72-43, fontSize: 12, paddingTop: 10}}
                                            ref={(item) => {this.nextpassword = item}}
                                           underlineColorAndroid='transparent'
                                           placeholder="请重新输入密码"
                                           placeholderTextColor="#999999"
                                           secureTextEntry={this.state.passwordCheckType}
                                           value={this.state.passwordCheck}
                                           onFocus={()=>{
                                               mobClick('getback password-input password')
                                           }}
                                           onChangeText={this.numberCheckTextChange.bind(this)}>
                                </TextInput>
                                {this._passwordCheckShow()}
                                <TouchableOpacity activeOpacity={1} onPress={() => {this._changecurrentCheckPwdIcon()}}>
                                    <Image style={{width: 15, height: 12, resizeMode: 'contain', marginLeft: 15}} source={this.state.imgCheckUrl}/>
                                </TouchableOpacity>
                            </View>
                            <View style={{height: 1, backgroundColor: '#DDDDDD', borderColor: "#cccccc"}}/>



                            <View style={{alignItems:'center', marginTop:70/667*kScreenHeight}}>
                                <YFWTouchableOpacity style_title={{height:(kScreenWidth-54)/304*34, width:kScreenWidth-54, fontSize: 16}} title={'修改密码'}
                                                     callBack={() => {
                                                         mobClick('getback password-submit');
                                                         this._onpressModeify(goBack, this.props.navigation.state.params.phone)
                                                     }}
                                                     isEnableTouch={this.state.password.length > 5 && this.state.passwordCheck.length > 5}/>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
        )
    }

    numberTextChange(number) {
        if (number) {
            number = number.replace(EMOJIS,'')
            this.setState(() => ({
                passwordShow: true,
                password: number
            }))
        } else {
            this.setState(() => ({
                passwordShow: false,
                password: ''
            }))
        }

    }

    numberCheckTextChange(number) {
        if (number) {
            number = number.replace(EMOJIS,'')
            this.setState(() => ({
                passwordCheckShow: true,
                passwordCheck: number
            }))
        } else {
            this.setState(() => ({
                passwordCheckShow: false,
                passwordCheck: ''
            }))
        }

    }


    _passwordShow() {
        return (
            this.state.passwordShow ?
                (
                    <TouchableOpacity onPress={() => {
                        this._showDeletePassword()
                    }}>
                        <Image style={{width: 13, height: 13}}
                               source={this.state.img_url}/>
                    </TouchableOpacity>
                ) : (<View style={{width: 13, height: 13}}/>)
        )
    }
    _passwordCheckShow() {
        return (
            this.state.passwordCheckShow ?
                (
                    <TouchableOpacity onPress={() => {
                        this._showDeletePasswordCheck()
                    }}>
                        <Image style={{width: 13, height: 13}}
                               source={this.state.img_url}/>
                    </TouchableOpacity>
                ) : (<View style={{width: 13, height: 13}}/>)
        )
    }

    _showDeletePassword() {
        this.setState(() => ({
            password: '',
            passwordShow: false,
        }))
    }

    _showDeletePasswordCheck() {
        this.setState(() => ({
            passwordCheck: '',
            passwordCheckShow: false,
        }))
    }

    _changecurrentPwdIcon() {
        if (this.state.imgUrl == require('../../img/pwd_on.png')) {
            this.setState(() => ({
                        imgUrl: require('../../img/pwd_off.png'),
                        passwordType: true
                    }
                )
            )
        } else {
            this.setState(() => ({
                        imgUrl: require('../../img/pwd_on.png'),
                        passwordType: false
                    }
                )
            )
        }
    }

    _changecurrentCheckPwdIcon() {
        if (this.state.imgCheckUrl == require('../../img/pwd_on.png')) {
            this.setState(() => ({
                        imgCheckUrl: require('../../img/pwd_off.png'),
                        passwordCheckType: true
                    }
                )
            )
        } else {
            this.setState(() => ({
                        imgCheckUrl: require('../../img/pwd_on.png'),
                        passwordCheckType: false
                    }
                )
            )
        }
    }

    _onpressModeify(goback, phone) {

        if (isEmpty(this.state.password) || this.state.password.length == 0){
            YFWToast('密码不能为空');
            return;
        }

        if (this.state.password !== this.state.passwordCheck){
            YFWToast('两次密码输入不同');
            return;
        }

        let regex = "^(?![A-Z]+$)(?![a-z]+$)(?!\\d+$)(?![\\W_]+$)\\S{6,20}$";
        if (!this.state.password.match(regex)) {
            YFWToast('密码强度不符合规则(至少6位英文字符和数字组合)');
            return
        }

        let paramMap = new Map();
        paramMap.set("__cmd", "guest.account.changePwdByMobile");
        paramMap.set("mobile", phone);
        paramMap.set("new_password", this.state.password);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if (Number.parseInt(res.code) == 1) {
                goback(this.props.navigation.state.params.gobackKey);
                var dismissKeyboard = require('dismissKeyboard');
                dismissKeyboard();
            } else {
                YFWToast(res.msg);
            }
        });
    }

}
