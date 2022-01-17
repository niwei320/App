import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import YFWWDBaseView from '../../Base/YFWWDBaseView'
import {isIphoneX, kScreenWidth} from '../../../PublicModule/Util/YFWPublicFunction';
import LinearGradient from 'react-native-linear-gradient';

export default class YFWWDLoginView extends YFWWDBaseView{

    constructor(props) {
        super(props);
        this.state = {
            model: this.props.model,
            passwordType: true
        }
    }

    render() {
        let pw_image = this.state.passwordType?require('../../../../img/pwd_on.png'):require('../../../../img/pwd_off.png')
        return (
            <View style={styles.container_style}>
                <Text style={styles.loginTitle_style}>企业会员登录</Text>
                <Text style={styles.loginSubTitle_style}>批发市场仅对企业客户开放，药房网商城已注册企业会员可直接登录</Text>
                <TextInput style={styles.accountInput_style}
                    ref={(item) => { this.accountInput = item }}
                    placeholderTextColor={"rgb(179,179,179)"}
                    placeholder="请输入企业会员账号"
                    underlineColorAndroid='transparent'
                    keyboardType='default'
                    returnKeyType={'next'}
                    value={this.state.model.account}
                    onChangeText={(text) => this.textChange(text, 1)}
                    onFocus={() => { }}
                />
                {this.state.model.account != '' ? < TouchableOpacity style={styles.accountInput_clear_style} onPress={()=>this.clearAccountText()}>
                    <Image style={{ width: 13, height: 13 }} source={require('../../../../img/returnTips_close.png')} />
                </TouchableOpacity>: null}
                <TextInput style={styles.pwdInput_style}
                    underlineColorAndroid='transparent'
                    placeholder="请输入密码"
                    placeholderTextColor={"rgb(179,179,179)"}
                    secureTextEntry={this.state.passwordType}
                    value={this.state.model.pwd}
                    ref={(item) => {this.passwordinput = item}}
                    onFocus={()=>{}}
                    onBlur={()=>{}}
                    onChangeText={(text) => this.textChange(text,2)}
                />
                {this.state.model.pwd != '' ? < TouchableOpacity style={styles.accountInput_clear_style} onPress={()=>this.changeSecureTextType()}>
                    <Image style={{ width: 16, height: 12 }} source={pw_image} />
                </TouchableOpacity> : null}
                <View style={{shadowOffset:{width: 0,height:5},shadowColor:'black',shadowOpacity:0.2,elevation:10}}>
                    <LinearGradient style={styles.login_botton_style} colors={['rgb(82,66,255)','rgb(65,109,255)']} start={{x: 1, y: 0}} end={{x: 0, y: 1}} locations={[0,1]}>
                        <TouchableOpacity style={{ flex: 1,alignItems:'center',justifyContent:'center'}} onPress={() => this.toLogin()}>
                            <Text style={{fontSize:17,color:'white',fontWeight:'bold'}}>登录</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                <View style={{height: 60,marginTop:15}}>
                    <View style={{height: 42, borderRadius: 21, borderWidth:1,borderColor:'rgb(50,87,234)'}}>
                        <TouchableOpacity
                            style={{flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection:'row'}}
                            activeOpacity={1} onPress={()=> this.toRegist()}>
                            <Text style={{fontSize: 17, color: 'rgb(50,87,234)', includeFontPadding:false}}>企业会员注册</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{alignItems:'flex-end'}}>
                    <TouchableOpacity onPress={() => this.toForget()}>
                        <Text style={{fontSize:14,color:'rgb(84,124,255)',alignSelf:'center'}}>忘记密码？</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    /***********方法******************/

    changeSecureTextType() {
        this.state.passwordType = !this.state.passwordType
        this.updateView()
    }

    updateView() {
        this.setState({})
    }


    /***********代理方法******************/

    textChange(text,tag) {
        this.props.father&&this.props.father.textChange&&this.props.father.textChange(text,tag)
    }

    clearAccountText() {
        this.props.father&&this.props.father.clearAccountText&&this.props.father.clearAccountText()
    }

    toLogin() {
        this.props.father&&this.props.father.toLogin&&this.props.father.toLogin()
    }

    toRegist() {
        this.props.father&&this.props.father.toRegist&&this.props.father.toRegist()
    }

    toForget() {
        this.props.father&&this.props.father.toForget&&this.props.father.toForget()
    }



}

const styles = StyleSheet.create({
    container_style: {flex:1,backgroundColor: 'white',paddingHorizontal:36},
    loginTitle_style: {fontSize:20,fontWeight:'bold',color:'rgb(51,51,51)',marginTop:isIphoneX()?64:40},
    loginSubTitle_style: {fontSize:12,color:'rgb(102,102,102)',marginTop:13,lineHeight:18},
    accountInput_style: { fontSize: 16, color: 'rgb(51,51,51)', height: 30, marginTop: 44, borderBottomWidth: 0.5, borderBottomColor: 'rgb(204,204,204)',fontWeight:'bold'},
    accountInput_clear_style: {height:30,width:13,marginTop:-30,alignSelf:'flex-end',justifyContent:'center'},
    pwdInput_style: {fontSize:16,color:'rgb(51,51,51)',height:30,marginTop:23,borderBottomWidth:0.5,borderBottomColor:'rgb(204,204,204)',fontWeight:'bold'},
    login_botton_style: { height: 42, borderRadius: 24, marginTop: 75 },
});
