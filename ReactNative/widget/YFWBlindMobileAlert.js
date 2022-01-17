import React, {Component} from 'react';
import {
    View,
    Image,
    DeviceEventEmitter,
    Text,
    Platform,
    TouchableOpacity,
    TextInput
} from 'react-native'
import ModalView from './ModalView';
import { kScreenWidth, adaptSize, safe } from '../PublicModule/Util/YFWPublicFunction';
import YFWVerificationCodeText from './YFWVerificationCodeText';
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWToast from '../Utils/YFWToast';
import {
    darkNomalColor,
    darkLightColor,
    newSeparatorColor,
    yfwGreenColor
} from './../Utils/YFWColor'
import {setItem} from "./../Utils/YFWStorage"
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
import { get_new_ip } from '../Utils/YFWInitializeRequestFunction';


export default class YFWBlindMobileAlert extends Component {

    constructor(props) {
        super(props)
        this.state = {
            phone: '',
            selfEnable: true,
            noticeText: '获取验证码',
            IdentifingCode: '',
            noticeTitleColor: yfwGreenColor(),
            timerCount: 60,
            isSelect: false
        }
    }

    componentDidMount(){

    }

    showView() {
        this.modalView && this.modalView.show()
    }

    closeView(){
        if(this.state.isSelect){
            YFWUserInfoManager.ShareInstance().isShowBlindMobileTips = false
            setItem('IsShowBlindMobileTips','false')
        }
        this.modalView && this.modalView.disMiss()
    }

    onclick(){
        if(this.state.IdentifingCode.length != 6){
            YFWToast('请输入正确的6位数验证码')
            return
        }
        let paramMap = new Map();
        paramMap.set("__cmd", "person.account.updateMobile");
        paramMap.set("mobile", this.state.phone);
        paramMap.set("mobile_smscode", safe(this.state.IdentifingCode));
        paramMap.set("old_mobile_smscode", '');
        paramMap.set("bind_mobile", 1);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWUserInfoManager.ShareInstance().hasBlindMobile = true;
            YFWToast('绑定成功')
        });
        this.state.phone = ''
        this.state.IdentifingCode = ''
        this.state.isSelect = false
        this.closeView()
    }

    numberTextChange(number){
        let inputnumber = number.replace(/[^\d]/g, '');
        this.setState(()=>({
                IdentifingCode: inputnumber,
                timerCount: 60,
                selfEnable: true
            }
            )
        )
    }
    mobilenumberTextChange(number) {
        let inputnumber = number.replace(/[^\d]/g, '');
        if (inputnumber) {
            this.setState(()=>({
                        phone: inputnumber,
                        timerCount: 60,
                    }
                )
            )
        }else {
            this.setState(() => ({
                phone: '',
            }))
        }
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
            if (nowStamp >= overTimeStamp - 1000) {
                /* 倒计时结束*/
                this.callSMSVerifyStopStatus()
            } else {
                const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
                this.setState({
                    noticeText: leftTime + "秒后重新获取",
                    selfEnable: false,
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
            selfEnable: true,
        })
    };
    _getIdentifingCode() {
        if (!this.state.selfEnable) {
            return
        }
        if(this.state.phone.length == 0){
            YFWToast('请输入手机号')
            return
        }else if(this.state.phone.length != 11){
            YFWToast('请输入正确的11位手机号')
            return
        }
        //先设置不可点击，成功请求时会倒计改变值的，请求失败改为可点击
        this.state.selfEnable = false
        //发请求同时 更改倒计时ui
        this._countdownTimes()
        this.codeInput && this.codeInput.focus()

        get_new_ip((ip)=>{
            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.account.sendSMS');
            paramMap.set('mobile', this.state.phone);
            paramMap.set('ip', ip);
            paramMap.set('type', 1);
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let code = String(res.code);
                if (code === '1') {
                    YFWToast('验证码已发送，请注意查收手机短信');

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

    _renderAlertView() {
        return(
            <View style={[{alignItems:'center',justifyContent:'center',flex:1,backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}>
                <View style={{width:kScreenWidth-adaptSize(35*2),justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:'#fff'}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.closeView()}} style={{top:10,right:11,position:'absolute',paddingLeft:20,paddingBottom:20}}>
                        <Image source={require('../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                    </TouchableOpacity>
                    <Text style={{fontSize:13,color:'rgb(51,51,51)',marginTop:adaptSize(28)}}>您的账号安全系数较低，</Text>
                    <Text style={{fontSize:13,color:'rgb(51,51,51)',marginTop:adaptSize(11)}}>建议绑定手机号哦!</Text>
                    <TextInput style={{fontSize: 13,width:adaptSize(250), height: adaptSize(30),paddingTop: 10,marginTop:adaptSize(50)}}
                        maxLength={11}
                        keyboardType='number-pad'
                        underlineColorAndroid='transparent'
                        placeholder="请在此输入手机号"
                        placeholderTextColor="#999999"
                        returnKeyType={'next'}
                        value={this.state.phone}
                        ref={(item) => {this.userinput = item}}
                        onChangeText={this.mobilenumberTextChange.bind(this)}/>
                    <View style={{width: adaptSize(250), height: 1, backgroundColor: 'rgb(204,204,204)',marginTop:adaptSize(8)}}/>
                    <View style={{marginTop:10,flexDirection:'row',alignItems:'center',width:adaptSize(250)}}>
                        <View style={{width:adaptSize(120)}}>
                            <TextInput style={{fontSize:13,color:darkNomalColor(),height:adaptSize(30)}}
                                        ref={(item)=>{this.codeInput = item}}
                                        underlineColorAndroid='transparent'
                                        keyboardType='numeric' maxLength={6}
                                        onChangeText={this.numberTextChange.bind(this)}
                                        value={this.state.IdentifingCode}
                                        placeholderTextColor={darkLightColor()}
                                        placeholder="请在此输入验证码">
                            </TextInput>
                        </View>
                        <View style={{flex:1}}/>
                        <View style={{width:1,backgroundColor:newSeparatorColor(),marginRight:10,height:15}}/>
                        <TouchableOpacity onPress={this._getIdentifingCode.bind(this)}>
                            <Text style={{textAlign:'center',fontSize:16,color:this.state.noticeTitleColor,alignItems:'center',justifyContent:'center'}}>{this.state.noticeText}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: adaptSize(250), height: 1, backgroundColor: 'rgb(204,204,204)',marginTop:adaptSize(8)}}/>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.onclick()}} style={{marginTop:adaptSize(48),marginBottom:adaptSize(15),alignItems:'center',justifyContent:'center',width:adaptSize(100),height:adaptSize(30),
                        borderRadius:adaptSize(15),backgroundColor:'rgb(31,219,155)'}}>
                        <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>确  定</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginBottom:adaptSize(25)}}
                        onPress={()=>{this.setState({isSelect:!this.state.isSelect})}}
                    >
                        {this.state.isSelect?<Image style={{resizeMode:'contain',width:adaptSize(10),height:adaptSize(10)}} source={require('../../img/blind_phone_select.png')}/>
                        :<Image style={{resizeMode:'contain',width:adaptSize(10),height:adaptSize(10)}} source={require('../../img/blind_phone_unselect.png')}/>}
                        <Text style={{fontSize:11,color:'rgb(153,153,153)',marginLeft:adaptSize(5)}}>下次不再提醒</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this._renderAlertView()}
            </ModalView>
        )
    }



}
