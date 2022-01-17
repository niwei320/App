import React, {Component} from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import YFWToast from "../Utils/YFWToast";
import {
    dismissKeyboard_yfw, iphoneTopMargin, is_phone_number,
    kScreenHeight,
    kScreenWidth,
    mobClick,
} from '../PublicModule/Util/YFWPublicFunction'
import YFWTitleView from "../PublicModule/Widge/YFWTitleView";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";

export default class FindPassword extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            phoneShow: false,
            img_url: require('../../img/activity_login_close.png'),
        };
    }

    componentDidMount() {
        //android返回键动作
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler&&this.backHandler.remove();
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
                <View style={{width:kScreenWidth,height:260,marginTop:63/667*kScreenHeight,paddingHorizontal:36}}>
                    <View style={{marginBottom:38, height:44,justifyContent:'center'}}>
                        <YFWTitleView style_title={{width:90,fontSize:19}} title={'找回密码'}/>
                    </View>
                    <View style={{height: 250/667*kScreenHeight}}>
                        <View style={{flexDirection:'row', alignItems: 'center'}}>
                            <TextInput style={{fontSize: 12,width:220/360*kScreenWidth, height: 40,paddingTop: 10}}
                                       maxLength={11}
                                       keyboardType='number-pad'
                                       underlineColorAndroid='transparent'
                                       placeholder="请输入绑定的手机号"
                                       placeholderTextColor="#999999"
                                       value={this.state.phone}
                                       ref={(item) => {this.userinput = item}}
                                       returnKeyType={'next'}
                                       autoFocus={true}
                                       onFocus={()=>{mobClick('getback password-phonenumber')}}
                                       onChangeText={(text) => {
                                           if (text) {
                                               this.setState(() => ({
                                                   phone: text,
                                                   phoneShow: true,
                                               }))
                                           } else {
                                               this.setState(() => ({
                                                   phone: '',
                                                   phoneShow: false,
                                               }))
                                           }

                                       }}/>
                            <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.userinput && this.userinput.focus()}}/>
                            {this._phoneShow()}
                        </View>
                        <View style={{height: 1, backgroundColor: '#DDDDDD', borderColor: "#cccccc"}}/>
                        <View style={{alignItems:'center', marginTop:70/667*kScreenHeight}}>
                            <YFWTouchableOpacity style_title={{height:(kScreenWidth-54)/304*34, width:kScreenWidth-54, fontSize: 16}} title={'下一步'}
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
            from: 'findPassword',
            mobile: this.state.phone,
            gobackKey: this.props.navigation.state.key,
            callBack:this.props.navigation.state.params?this.props.navigation.state.params.state.callBack:null
        })
    }

    _phoneShow() {
        return (
            this.state.phoneShow ?
                (
                    <TouchableOpacity onPress={() => {
                        this._showDeletePhone()
                    }}>
                        <Image style={{width: 16, height: 16, marginBottom: 7}}
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