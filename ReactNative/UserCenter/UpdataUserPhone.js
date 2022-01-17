/**
 * Created by admin on 2018/6/5.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    ImageBackground,
    DeviceEventEmitter
} from 'react-native';
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWRequest from '../Utils/YFWRequest'
import YFWToast from '../Utils/YFWToast'
const width = Dimensions.get('window').width;
import {BaseStyles} from '../Utils/YFWBaseCssStyle'
import {
    yfwOrangeColor,
    backGroundColor,
    darkNomalColor,
    darkLightColor,
    yfwGreenColor,
    darkTextColor,
    separatorColor,
    newSeparatorColor
} from './../Utils/YFWColor'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {
    dismissKeyboard_yfw,
    is_phone_number,
    is_verification_code,
    kScreenWidth,
    safe
} from "../PublicModule/Util/YFWPublicFunction";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import {get_new_ip, postPushDeviceInfo} from "../Utils/YFWInitializeRequestFunction";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";

export default class UpdataUserPhone extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "修改手机号码",
        headerRight:<View style={{width:50}}/>,
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'normal', fontSize:17
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                              onPress={() => {navigation.goBack()}}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                       source={ require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
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
            viewType: 'getIdentifingCode',
            updataIdentifingCode: '',
            telnumber: '',
            updatanoticeText: '获取验证码',
            updataEnableClick: true,
            updataTimeCount: 60,
            updatanoticeTitleColor: yfwGreenColor()
        }
    }

    mobilenumberTextChange(number) {
        let inputnumber = number.replace(/[^\d]/g, '');
        this.setState(()=>({
                telnumber: inputnumber,
                updataTimeCount: 60,
                counting: false,
                updataEnableClick: true,
            }
            )
        )
    }

    numberTextChange(number) {
        let inputnumber = number.replace(/[^\d]/g, '');
        if (this.state.viewType == 'getIdentifingCode') {
            this.setState(()=>({
                    IdentifingCode: inputnumber,
                    timerCount: 60,
                    counting: false,
                    selfEnable: true
                }
                )
            )
        } else {
            this.setState(()=>({
                    updataIdentifingCode: inputnumber,
                    updataTimeCount: 60,
                    counting: false,
                    updataEnableClick: true
                }
                )
            )
        }
    }


    componentDidMount() {
        this.setState({
            before_mobile: this.props.navigation.state.params.userMobile
        });


    }

    render() {
        const {navigate, state, goBack} = this.props.navigation;
        if (this.state.viewType == 'getIdentifingCode') {
            return (
                <TouchableOpacity style={{position: 'relative', flex: 1, backgroundColor:backGroundColor()}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                    <View style={[BaseStyles.item,{marginTop:10, alignItems:'flex-start', justifyContent:'flex-start',width:width,height:60}]}>
                        <Text style={[BaseStyles.titleStyle,{marginTop:20, marginLeft:40, fontSize:14, color:darkTextColor()}]}>已认证手机:</Text>
                        <Text style={[BaseStyles.titleStyle,{marginTop:20, marginLeft:10, fontSize:14, color:darkTextColor()}]}>{this.state.before_mobile}</Text>
                    </View>
                    <View style={{marginTop:10,flexDirection:'row',alignItems:'center', justifyContent:'center'}}>
                        <View style={{flex:1}}>
                            <TextInput style={{marginLeft:35,fontSize:14,color:darkNomalColor(),height:50}}
                                       underlineColorAndroid='transparent'
                                       keyboardType='numeric' maxLength={6}
                                       onChangeText={this.numberTextChange.bind(this)}
                                       value={this.state.IdentifingCode}
                                       placeholderTextColor={darkLightColor()}
                                       placeholder="请在此输入验证码">
                            </TextInput>
                        </View>
                        <View style={{width:1,backgroundColor:newSeparatorColor(),marginRight:20,height:15,marginTop:5,marginBottom:9}}/>
                        <TouchableOpacity onPress={this._updataMobilegetIdentifingCode.bind(this)}>
                            <Text style={{textAlign:'center',marginBottom:9,fontSize:14,marginRight:35,marginTop:5,color:this.state.noticeTitleColor,alignItems:'center',justifyContent:'center'}}>{this.state.noticeText}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{height:1,backgroundColor:newSeparatorColor(),opacity: 0.2,marginHorizontal:40}}/>
                    <Text style={{width:width,fontSize:14,textAlign:'center',marginTop:100,color:darkLightColor()}}>若原手机已停用，请联系商城客服修改</Text>
                    <View style={{alignItems:'center', marginTop:26}}>
                        <YFWTouchableOpacity style_title={{height:(kScreenWidth-44)/304*44, width:kScreenWidth-54, fontSize: 16}} title={'提交'}
                                             callBack={() => {this._checkIdentifingCode(state,goBack)}}
                                             isEnableTouch={true}/>
                    </View>

                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity style={{position: 'relative', flex: 1, backgroundColor:backGroundColor()}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                    <View style={[BaseStyles.item,{alignItems:'flex-start', justifyContent:'flex-start',width:width,height:60}]}>
                        <View style={{flex:1}}>
                            <TextInput style={[BaseStyles.titleStyle,{marginTop:20},{marginLeft:35},{fontSize:14},{color:darkTextColor()}]}
                                       underlineColorAndroid='transparent'
                                       keyboardType='numeric' maxLength={11}
                                       onChangeText={this.mobilenumberTextChange.bind(this)}
                                       value={this.state.telnumber}
                                       placeholderTextColor={darkLightColor()}
                                       placeholder="请输入新手机号">
                            </TextInput>
                        </View>
                    </View>
                    <View style={{height:1,backgroundColor:newSeparatorColor(),opacity: 0.2,marginHorizontal:40}}/>
                    <View style={[BaseStyles.item,{alignItems:'center', marginTop:20, justifyContent:'center'}]}>
                        <View style={{width:200}}>
                            <TextInput style={{marginLeft:35,fontSize:14,color:darkNomalColor(),height:60}}
                                       underlineColorAndroid='transparent'
                                       keyboardType='numeric' maxLength={6}
                                       onChangeText={this.numberTextChange.bind(this)}
                                       value={this.state.updataIdentifingCode}
                                       placeholderTextColor={darkLightColor()}
                                       placeholder="请在此输入验证码">
                            </TextInput>
                        </View>
                        <View style={{flex:1}}/>
                        <View style={{width:1,backgroundColor:separatorColor(),marginRight:20,height:15,marginBottom:9,marginTop:8}}/>
                        <TouchableOpacity onPress={this._updataMobilegetIdentifingCode.bind(this)}>
                            <Text style={{marginTop:8,textAlign:'center',marginBottom:9,fontSize:14,marginRight:35,color:this.state.updatanoticeTitleColor,alignItems:'center',justifyContent:'center'}}>{this.state.updatanoticeText}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{height:1,backgroundColor:newSeparatorColor(),opacity: 0.2,marginHorizontal:40}}/>
                    <View style={{alignItems:'center', marginTop:100}}>
                        <YFWTouchableOpacity style_title={{height:(kScreenWidth-44)/304*44, width:kScreenWidth-54, fontSize: 16}} title={'确认'}
                                             callBack={() => {this._updataMobileNum(state,goBack)}}
                                             isEnableTouch={true}/>
                    </View>
                </TouchableOpacity>

            )
        }
    }

    _updataMobilegetIdentifingCode() {
        if (this.state.viewType == 'getIdentifingCode') {
            if (!this.state.selfEnable) {
                return
            }
        } else {
            if (!this.state.updataEnableClick) {
                return
            }
        }

        get_new_ip((ip)=>{

            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.account.sendSMS');
            paramMap.set('ip', ip);
            if (this.state.viewType != 'getIdentifingCode') {
                paramMap.set('mobile', this.state.telnumber);
            }
            paramMap.set('type', this.state.viewType == 'getIdentifingCode' ? '3' : '2');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let code = String(res.code);
                if (code === '1') {
                    //请求验证码成功 更改ui
                    if (this.state.viewType == 'getIdentifingCode') {
                        this._countdownTimes()
                    } else {
                        this._updataMobileCountdownTimes()
                    }
                }
            });

        })


    }

    _updataMobileCountdownTimes() {
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
                    updatanoticeText: '获取验证码',
                    counting: false,
                    updataEnableClick: true,
                    updatanoticeTitleColor:yfwGreenColor()
                });
            } else {
                const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
                this.setState({
                    updatanoticeText: leftTime + "s后获取",
                    updataEnableClick: false,
                    updatanoticeTitleColor:darkLightColor()
                });
            }
        }, 1000)
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
        this.beforeCode = safe(this.state.IdentifingCode);
        if (!is_verification_code(this.beforeCode)) {
            YFWToast('请输入正确的验证码')
            return;
        }

        let paramMap = new Map();
        paramMap.set("__cmd", "guest.account.isValidSMSCode");
        paramMap.set("smsCode", safe(this.state.IdentifingCode));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.interval && clearInterval(this.interval);
            //验证通过
            this.setState({
                viewType: 'updataMobile',
                timerCount: this.state.timerCount,
                counting: false,
                updataEnableClick: true,
            });
        });
    }

    _updataMobileNum(state, goBack) {

        let mobile = safe(this.state.telnumber.replace(" ", ""));
        if (!is_phone_number(mobile)) {
            YFWToast('请输入正确的手机号码');
            return;
        }
        if (!is_verification_code(this.state.updataIdentifingCode)) {
            YFWToast('请输入正确的验证码');
            return;
        }


        let paramMap = new Map();
        paramMap.set("__cmd", "person.account.updateMobile");
        paramMap.set("mobile", mobile);
        paramMap.set("mobile_smscode", safe(this.state.updataIdentifingCode));
        paramMap.set("old_mobile_smscode", this.beforeCode);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            state.params.callback(this.state.telnumber);
            goBack();
        });
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white'
    },

    lineStyle: {
        // width:ScreenWidth/3,
        height: 2,
        backgroundColor: '#FF0000'
    },
    textMainStyle: {
        flex: 1,
        fontSize: 40,
        marginTop: 10,
        textAlign: 'center',
        color: 'black'
    },

    textHeaderStyle: {
        fontSize: 40,
        color: 'white'
    }
})
