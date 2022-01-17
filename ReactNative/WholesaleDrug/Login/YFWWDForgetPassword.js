import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput,
} from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import MyTextInput from "../../widget/YFWTextInput";
import {isAndroid, isEmpty, kScreenWidth, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import {EMOJIS, NUMBERS, PHONE_NUMBERS} from "../../PublicModule/Util/RuleString";
import YFWWDTipsAlert from "../Widget/YFWWDTipsAlert";

export default class YFWWDForgetPassword extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '找回密码',
        headerRight: <View stlye={{width:50}}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            title:'',//企业名称
            phone:'',
            verificationCode:'',
            newPassword:'',
            newPasswordRepeat:'',
            noticeText:'获取验证码',
            noticeEnable:true,
            timerCount:60,
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillUnmount() {
        this.interval && clearInterval(this.interval);

    }

//-----------------------------------------------METHOD---------------------------------------------

    onChangeText(text,type){
        switch (type) {
            case 'title':
                text = text.replace(/ /g, '')
                this.setState({title:text})
                break;
            case 'phone':
                text = text.replace(NUMBERS,'')
                this.setState({phone:text})
                break;
            case 'verificationCode':
                text = text.replace(NUMBERS,'')
                this.setState({verificationCode:text})
                break;
            case 'newPassword':
                text = text.replace(EMOJIS,'')
                this.setState({newPassword:text})
                break;
            case 'newPasswordRepeat':
                text = text.replace(EMOJIS,'')
                this.setState({newPasswordRepeat:text})
                break;
            default:
                return
        }
    }

    requestModify() {
        let {title,phone,verificationCode,newPassword,newPasswordRepeat,noticeEnable} = this.state
        if (isEmpty(title) ||title.length < 0) {
            YFWToast('请输入企业名称')
            return
        }
        if (isEmpty(phone)) {
            YFWToast('请输入手机号码')
            return
        }
        if (!phone.match(PHONE_NUMBERS)) {
            YFWToast('请输入正确的手机号码')
            return
        }
        if (isEmpty(verificationCode) ||verificationCode.length < 6) {
            YFWToast('请输入正确的验证码')
            return
        }
        if (isEmpty(newPassword)) {
            YFWToast('请输入新密码')
            return
        }
        if (newPassword !== newPasswordRepeat) {
            YFWToast('两次密码不一致')
            return
        }
        let paramMap = new Map()
        paramMap.set('__cmd','guest.account.isValidAlterPsaByTitle')
        paramMap.set('title',title)
        paramMap.set('mobile',phone)
        paramMap.set('smcode',verificationCode)
        paramMap.set('psd',newPassword)
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if(safeObj(res.result)){
                this.tipsAlert&&this.tipsAlert.showView(
                    '密码修改成功',
                    '您的企业账号为：' + res.result,
                    '确定',
                    [],
                    ()=>{this.props.navigation&&this.props.navigation.goBack()}
                )
            }
        }, (err) =>{
            this.tipsAlert&&this.tipsAlert.showView(
                '验证失败',
                err.msg,
                '确定',
                [],
                ()=>{}
            )
        },true);
    }

    getVerificationCode() {
        let {phone,noticeEnable} = this.state
        if(!noticeEnable){
            return
        }
        if (phone === '') {
            YFWToast('请输入手机号码')
            return
        }
        this.countdownTimes()
        let paramMap = new Map()
        paramMap.set('__cmd','guest.account.sendSMS')
        paramMap.set('mobile', phone);
        paramMap.set('ip', '');
        paramMap.set('type', 2);
        paramMap.set('account_type', 3);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            let code = String(res.code);
            if (code === '1') {
                YFWToast('验证码已发送，请注意查收手机短信');
            }
        }, (err) =>{
            this.stopTimes()
        },true);
    }

    countdownTimes() {
        const codeTime = this.state.timerCount;
        const now = Date.now()
        const overTimeStamp = now + codeTime * 1000 + 100
        /*过期时间戳（毫秒） +100 毫秒容错*/
        this.interval = setInterval(() => {
            /* 切换到后台不受影响*/
            const nowStamp = Date.now();
            if (nowStamp >= overTimeStamp) {
                /* 倒计时结束*/
                this.stopTimes()
            } else {
                const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
                this.state.noticeText = leftTime + "秒后重新获取"
                this.state.noticeEnable = false
                this.setState({})
            }
        }, 1000)
    }

    stopTimes(){
        this.interval && clearInterval(this.interval);
        this.state.noticeText = '获取验证码'
        this.state.noticeEnable = true
        this.setState({})
    };


//-----------------------------------------------RENDER---------------------------------------------

    renderItem(title,placeholder,value,type){
        let maxLength = type==='phone'?11:type==='verificationCode'?6:undefined
        let keyboardType = type==='phone'||type==='verificationCode'?'numeric':'default'
        return (
            <View style={{width: kScreenWidth, height: 52, paddingHorizontal:19, flexDirection:'row', alignItems: 'center'}}>
                <Text style={{color:'rgb(51,51,51)',fontSize: 15}}>{title}</Text>
                <View style={{ flex:1, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                    <MyTextInput
                        style={{flex:1,color:'rgb(51,51,51)',fontSize: 15}}
                        placeholderTextColor={'rgb(204,204,204)'}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        value={value}
                        keyboardType={keyboardType}
                        secureTextEntry={type.startsWith('newPassword')}
                        onChangeText={(text)=>{this.onChangeText(text,type)}}
                    />
                    {type === 'verificationCode'?
                        <TouchableOpacity onPress={() => this.getVerificationCode()} activeOpacity={1} style={{ justifyContent:'center', paddingLeft:15}}>
                            <Text style={{fontSize:13,color:this.state.noticeText === '获取验证码'?'rgb(65,109,255)':'rgb(153,153,153)'}}>{this.state.noticeText}</Text>
                        </TouchableOpacity>
                        :<></>
                    }
                </View>
            </View>
        )
    }

    render() {
        let {title,phone,verificationCode,newPassword,newPasswordRepeat} = this.state
        return (
            <View style = {style.container_style}>
                <View style={{marginTop:13, backgroundColor:'white'}}>
                    {this.renderItem('企业名称：','请输入企业名称',title,'title')}
                    {this.renderItem('管理员手机号：','请输入管理员手机号',phone, 'phone')}
                    {this.renderItem('手机验证码：','请输入验证码',verificationCode, 'verificationCode')}
                    {this.renderItem('新密码：','请输入新密码',newPassword,'newPassword')}
                    {this.renderItem('确认密码：','请再次输入密码',newPasswordRepeat,'newPasswordRepeat')}
                </View>
                <View style={{width: kScreenWidth-72,height:100,shadowOffset:{width: 0,height:5},shadowColor:'black',shadowOpacity:0.2,elevation:10}}>
                    <LinearGradient
                        style={style.login_botton_style}
                        colors={['rgb(82,66,255)','rgb(65,109,255)']}
                        start={{x: 1, y: 0}}
                        end={{x: 0, y: 1}}
                        locations={[0,1]}
                    >
                        <TouchableOpacity style={{ flex: 1,alignItems:'center',justifyContent:'center'}} onPress={() => this.requestModify()}>
                            <Text style={{fontSize:17,color:'white',fontWeight:'bold'}}>确 认</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
                <YFWWDTipsAlert ref={(e)=>this.tipsAlert=e} />
            </View>
        )
    }

}

const style = StyleSheet.create({
    container_style: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    login_botton_style: { width: kScreenWidth-72,height: 42, borderRadius: 24},
});
