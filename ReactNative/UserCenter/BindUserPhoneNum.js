/**
 * Created by admin on 2018/8/27.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import YFWToast from '../Utils/YFWToast'
import {
    dismissKeyboard_yfw, iphoneTopMargin, is_phone_number,
    kScreenHeight, kScreenWidth,
} from '../PublicModule/Util/YFWPublicFunction'
import YFWTitleView from "../PublicModule/Widge/YFWTitleView";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";
export default class BindUserPhoneNum extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            identifingCode: '',
            noticeText: '接收验证码',
            noticecolor: '#16c08e',
            selfEnable: true,
            thirdUserinfo:[],
            phoneShow: false,
            vcodeShow: false,
            img_url: require('../../img/activity_login_close.png'),
            receive:'收不到短信？',
            receivecolor: '#666666',
            haveTry:'使用语音验证码',
            voice: false,
            isCallPhone: false,
            callphoneicon: null,
            bordercolor: '',
            borderwidth: null
        }
    }
    numberTextChange(number){
        let inputnumber = number.replace(/[^\d]/g, '');
        if (inputnumber) {
            this.setState(()=>({
                        phone: inputnumber,
                        timerCount: 60,
                        phoneShow: true,
                    }
                )
            )
        }else {
            this.setState(() => ({
                phone: '',
                phoneShow: false,
            }))
        }

    }

    componentDidMount(){
        const userinfoData = this.props.navigation.state.params.data
        this.state.thirdUserinfo = userinfoData;
        this.from = this.props.navigation.state.params.from || 'bindMobile'
    }

    render(){
        const {navigate, goBack, state} = this.props.navigation;
        return (
            <TouchableOpacity style={{backgroundColor: 'white', flex: 1}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                <View style={{width: kScreenWidth, height:50,backgroundColor: 'white',flexDirection: 'row',alignItems:'center',marginTop:iphoneTopMargin() - 20}}>
                    <TouchableOpacity style={{left:20,position:'absolute'}} activeOpacity={1}
                                        hitSlop={{left:20,top:15,bottom:15,right:20}}
                                      onPress={()=>{ goBack() }}>
                        <Image style={{width:11,height:19,resizeMode:'stretch',padding: 5}}
                               source={ require('../../img/top_back_green.png')}/>
                    </TouchableOpacity>
                </View>
                <View style={{width:kScreenWidth,height:260,marginTop:63/667*kScreenHeight,paddingHorizontal:36}}>
                    <View style={{marginBottom:38, height:44,justifyContent:'center'}}>
                        <YFWTitleView style_title={{width:160,fontSize:19}} title={'请输入绑定手机号'}/>
                    </View>
                    <View style={{height: 250/667*kScreenHeight}}>
                        <View style={{flexDirection:'row', alignItems: 'center'}}>
                            <TextInput style={{fontSize: 12,width:220/360*kScreenWidth, height: 40,paddingTop: 10}}
                                       maxLength={11}
                                       keyboardType='number-pad'
                                       underlineColorAndroid='transparent'
                                       placeholder="请在此输入手机号"
                                       placeholderTextColor="#999999"
                                       returnKeyType={'next'}
                                       autoFocus={false}
                                       value={this.state.phone}
                                       ref={(item) => {this.userinput = item}}
                                       onChangeText={this.numberTextChange.bind(this)}/>
                            <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.userinput && this.userinput.focus()}}/>
                            {this._phoneShow()}
                        </View>
                        <View style={{height: 1, backgroundColor: '#DDDDDD', borderStyle: "solid", borderWidth: 1, borderColor: "#cccccc"}}/>
                        <View style={{alignItems:'center', marginTop:70/667*kScreenHeight}}>
                            <YFWTouchableOpacity style_title={{height:(kScreenWidth-44)/304*44, width:kScreenWidth-24, fontSize: 16}} title={'下一步'}
                                                 callBack={()=>this._goNext()}
                                                 isEnableTouch={this.state.phone.length === 11}/>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    _goNext(){
        if (!is_phone_number(this.state.phone)){
            YFWToast('请输入正确的手机号码');
            return;
        }
        //todo: 跳转逻辑
        const {navigate, goBack, state} = this.props.navigation;
        navigate('VerificationCode', {
            from: this.from,
            mobile: this.state.phone,
            data: this.props.navigation.state.params.data,
            gobackKey: this.props.navigation.state.params.gobackKey,
            callBack:this.props.navigation.state.params.callBack
        })
    }

    _phoneShow() {
        return (
            this.state.phoneShow ?
                (
                    <TouchableOpacity
                    hitSlop={{left:10,top:10,bottom:10,right:10}}
                    onPress={() => {
                        this._showDeletePhone()
                    }}>
                        <Image style={{width: 13, height: 13,}}
                               source={this.state.img_url}/>
                    </TouchableOpacity>
                ) : (<View style={{width: 13, height: 13}}/>)
        )
    }

    _showDeletePhone() {
        if (this.userinput != undefined){
            this.userinput.focus();
        }
        this.setState(() => ({
            phone: '',
            phoneShow: false,
        }))
    }

}