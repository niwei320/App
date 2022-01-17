/**
 * Created by admin on 2018/8/27.
 */
import React, {Component} from 'react';
var forge = require('node-forge');
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    DeviceEventEmitter
} from 'react-native';
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWRequest from '../Utils/YFWRequest'
import YFWToast from '../Utils/YFWToast'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {is_phone_number, is_verification_code, mobClick, safe} from "../PublicModule/Util/YFWPublicFunction";
import {get_new_ip} from "../Utils/YFWInitializeRequestFunction";
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
export default class ForgotPassword extends React.Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "找回密码",

    });

    constructor(props) {
        super(props);
        this.identifingCode = '';
        this.state = {
            userPhone: '',
            noticeText: '| 接收验证码',
            selfEnable: true,
            editNewPsw:false,
            newPwdInputTextType: true,
            newPassword:'',
            imgUrl:require('../../img/pwd_off.png')
        }
    }

    numberTextChange(number){
        let inputnumber = number.replace(/[^\d]/g, '');
        //YFWToast(this.telnumber);
        //YFWToast(+'', (typeof number)+'')
        this.setState(()=>({
                userPhone: inputnumber,
                timerCount: 60,
                counting: false,
                selfEnable: true,
            }
            )
        )
    }

    _getIdentifingCode(){

        if (!is_phone_number(this.state.userPhone)) {
            YFWToast('请输入正确的手机号码');
            return;
        }
        if (!this.state.selfEnable) {
            return
        }

        get_new_ip((ip)=>{

            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.account.sendSMS');
            paramMap.set('mobile', this.state.userPhone);
            paramMap.set('ip',ip);
            paramMap.set('type', '3');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let code = String(res.code);
                if (code === '1') {
                    //请求验证码成功 更改ui
                    this._countdownTimes()
                }
            });

        });


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
                    timerCount: codeTime,
                    noticeText: '| 获取验证码',
                    counting: false,
                    selfEnable: true
                });
                if (this.props.timerEnd) {
                    this.props.timerEnd()
                }
            } else {
                const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
                this.setState({
                    noticeText: leftTime + "s后获取",
                    selfEnable: false
                })
            }
        }, 1000)
    }

    _checkIdentifingCode(){

        if (!is_phone_number(this.state.userPhone)) {
            YFWToast('请输入正确的手机号码');
            return;
        }
        if (!is_verification_code(this.identifingCode)){
            YFWToast('请输入正确的验证码');
            return;
        }


        let paramMap = new Map();
        paramMap.set("__cmd", "guest.account.isValidSMSCode");
        paramMap.set("mobile", safe(this.state.userPhone));
        paramMap.set("smsCode", safe(this.identifingCode));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.setState({editNewPsw: true});
        });
    }

    _changeIcon() {
        if (this.state.imgUrl == require('../../img/pwd_on.png')) {
            this.setState(()=>({
                    imgUrl: require('../../img/pwd_off.png'),
                    newPwdInputTextType: true
                }
                )
            )
        } else {
            this.setState(()=>({
                    imgUrl: require('../../img/pwd_on.png'),
                    newPwdInputTextType: false
                }
                )
            )
            //this.refs.refs_newpwd.secureTextEntry=false;
        }
    }

    render(){
        const {navigate, goBack, state} = this.props.navigation;
        if(this.state.editNewPsw){
            return(<View style={{width:width,height:height,backgroundColor:'white'}}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <TextInput style={{width:width,paddingRight:0,marginLeft:15,marginTop:15,flex:1}}
                               underlineColorAndroid='transparent'
                               secureTextEntry={this.state.newPwdInputTextType}
                               onChangeText={(text)=>{this.state.newPassword = text}}
                               placeholderTextColor="#999999"
                               placeholder="请输入新密码">
                    </TextInput>
                    <TouchableOpacity
                        onPress={()=>{
                                this._changeIcon();
                                      }}>
                        <Image
                            style={{width:20,height:20,resizeMode:'contain',marginRight:15}}
                            source={ this.state.imgUrl}>

                        </Image>
                    </TouchableOpacity>
                </View>
                <View style={{marginLeft:15,width:width-30,height:1,backgroundColor:'#DDDDDD'}}></View>
                <View
                    style={{width:width-40,height:50,marginLeft:20,alignItems:'center',marginTop:60,backgroundColor:'#16c08e',borderRadius:3,justifyContent:'center'}}>
                    <TouchableOpacity style={{width:width-40,height:50,justifyContent:'center'}}
                                      onPress={()=>{
                         this._changepsw(goBack);
                    }
                }>
                        <Text style={{textAlign:'center',color:'white'}}>
                            修改密码
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>)
        }else {
            return (<View>
                <View style={{width:width,height:height,backgroundColor:'white'}}>
                    <TextInput style={{marginTop:30,marginLeft:15,marginRight:15,height:50}} underlineColorAndroid='transparent'
                               keyboardType='numeric' maxLength={11}
                               onChangeText={this.numberTextChange.bind(this)} value={this.state.userPhone}
                               placeholderTextColor="#999999"
                               returnKeyType={'next'}
                               autoFocus={true}
                               onSubmitEditing={()=>{this.verifyCodeInput && this.verifyCodeInput.focus()}}
                               placeholder="请在此输入手机号">

                    </TextInput>
                    <View style={{marginLeft:15,width:width-30,height:1,backgroundColor:'#DDDDDD'}}></View>
                    <View style={{flexDirection:'row' , alignItems:'flex-end',marginRight:15}}>
                        <TextInput style={{marginTop:10,marginLeft:15,width:250,paddingRight:0,height:50}}
                                   underlineColorAndroid='transparent' keyboardType='numeric'
                                   maxLength={6}
                                   ref={(item)=>{this.verifyCodeInput = item}}
                                   onChangeText={(text)=>{this.identifingCode = text}}
                                   placeholderTextColor="#999999"
                                   placeholder="请输入短信验证码">

                        </TextInput>
                        <View style={{marginBottom:5,flex:1}}>
                            <TouchableOpacity onPress={this._getIdentifingCode.bind(this)}>
                                <Text style={{marginBottom:15}}>{this.state.noticeText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{marginLeft:15,width:width-30,height:1,backgroundColor:'#DDDDDD'}}></View>
                    <View
                        style={{width:width-40,height:50,marginLeft:20,alignItems:'center',marginTop:60,backgroundColor:'#16c08e',borderRadius:3,justifyContent:'center'}}>
                        <TouchableOpacity style={{width:width-40,height:50,justifyContent:'center'}}
                                          onPress={()=>{
                         this._checkIdentifingCode()
                    }
                }>
                            <Text style={{textAlign:'center',color:'white'}}>
                                下一步
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>)
        }
    }

    _changepsw(goback) {
        if (this.state.newPassword.length == 0) {
            YFWToast("密码不能为空");
            return
        }
        let regex = "^(?![A-Z]+$)(?![a-z]+$)(?!\\d+$)(?![\\W_]+$)\\S{6,20}$";
        if (!this.state.newPassword.match(regex)) {
            YFWToast('密码强度不符合规则(至少6位英文字符和数字组合)');
            return
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('service', 'update_account_password_getback');
        paramMap.set('mobile', this.state.userPhone);
        var md1 = forge.md.md5.create();
        md1.update(this.state.newPassword);
        paramMap.set('password', md1.digest().toHex());
        viewModel.GET(paramMap, (res)=> {
            YFWToast("修改成功");
            goback()
        })
    }
}