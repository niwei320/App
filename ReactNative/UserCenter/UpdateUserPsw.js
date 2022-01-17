/**
 * Created by admin on 2018/6/5.
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
    ImageBackground,
    DeviceEventEmitter
} from 'react-native';
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import YFWToast from '../Utils/YFWToast'
const width = Dimensions.get('window').width;
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import {dismissKeyboard_yfw, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {androidHeaderBottomLineColor, backGroundColor, newSeparatorColor} from "../Utils/YFWColor";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";
import { EMOJIS } from '../PublicModule/Util/RuleString';

export default class UpdateUserPsw extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: `${navigation.state.params.editType == 'update'?'修改密码':'设置密码'}`,
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
            currentPassword: '',
            newPassword: '',
            imgUrl: require('../../img/pwd_off.png'),
            newPwdInputTextType: true,
            currentPwdInputype: true,
            currentPwdImgUrl: require('../../img/pwd_off.png')
        }
    }

    render() {
        const {navigate, state, goBack} = this.props.navigation;
        return (
            <TouchableOpacity style={{position: 'relative', flex: 1, backgroundColor:backGroundColor()}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                <View style={{marginTop:20,width:width}}>
                    {this._renderOldPwd()}

                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <TextInput maxLength={18} style={{width:width,paddingRight:0,marginLeft:35,height:55,flex:1}}
                                   underlineColorAndroid='transparent'
                                   secureTextEntry={this.state.newPwdInputTextType}
                                   onChangeText={(text)=>{
                                        text = text.replace(EMOJIS,'')
                                        this.state.newPassword = text
                                        this.setState({
                                            newPassword:text
                                        })
                                    }}
                                value={this.state.newPassword}
                                   placeholder="输入新密码"
                                   placeholderTextColor="#999999"
                                   ref={(item)=>{this.newPwdInput = item}}>
                        </TextInput>
                        <TouchableOpacity
                            style={{width:50,height:50,justifyContent: 'center', alignItems: 'center', marginRight:30}}
                            onPress={()=>{
                                this._changeIcon();
                                      }}>
                            <Image
                                style={{width:15,height:15,resizeMode:'contain'}}
                                source={ this.state.imgUrl}>
                            </Image>
                        </TouchableOpacity>
                    </View>
                    <View style={{height:1,backgroundColor:newSeparatorColor(),opacity: 0.2,marginHorizontal:40}}/>
                </View>
                <View style={{alignItems:'center', marginTop:80}}>
                    <YFWTouchableOpacity style_title={{height:(kScreenWidth-44)/304*44, width:kScreenWidth-24, fontSize: 16}} title={'保存'}
                                         callBack={() => {this._updataPsw(state,goBack)}}
                                         isEnableTouch={true}/>
                </View>
            </TouchableOpacity>
        )
    }


    _updataPsw(state, goBack) {
        /*if (this.state.currentPassword.length == 0 || this.state.newPassword.length == 0) {
            YFWToast("密码不能为空");
            return
        }*/
        let regex = "^(?![A-Z]+$)(?![a-z]+$)(?!\\d+$)(?![\\W_]+$)\\S{6,20}$";
        if (!this.state.newPassword.match(regex)) {
            YFWToast('密码强度不符合规则(至少6位英文字符和数字组合)');
            return
        }
        getItem(kAccountKey).then((id)=> {
            if (id) {
                let paramMap = new Map();
                paramMap.set('__cmd', 'person.account.changePwd');
                if(this.props.navigation.state.params.editType == 'update'){
                    var md2 = forge.md.md5.create();
                    md2.update(this.state.currentPassword);
                    paramMap.set('old_password', this.state.currentPassword);
                }else {
                    paramMap.set('old_password', '');
                }
                var md1 = forge.md.md5.create();
                md1.update(this.state.newPassword);
                paramMap.set('new_password', this.state.newPassword);
                let viewModel = new YFWRequestViewModel();
                viewModel.TCPRequest(paramMap, (res) => {
                    if(this.props.navigation.state.params.editType == 'update'){
                        YFWToast('修改成功');
                    }else {
                        YFWToast('设置成功');
                        DeviceEventEmitter.emit('SET_PSW_SUCCESS')
                    }
                    goBack();
                });
            } else {
                this.setState(()=>{
                        //跳转登录页面
                    })
            }
        });
    }

    _changecurrentPwdIcon() {
        if (this.state.currentPwdImgUrl == require('../../img/pwd_on.png')) {
            this.setState(()=>({
                    currentPwdImgUrl: require('../../img/pwd_off.png'),
                    currentPwdInputype: true
                }
                )
            )
        } else {
            this.setState(()=>({
                    currentPwdImgUrl: require('../../img/pwd_on.png'),
                    currentPwdInputype: false
                }
                )
            )
        }
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
        }
    }

    _renderOldPwd() {
        if(this.props.navigation.state.params.editType == 'update'){
            return(
                <View>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                    <TextInput maxLength={18} style={{width:width,paddingRight:0,marginLeft:35,height:55,flex:1}}
                               underlineColorAndroid='transparent'
                               secureTextEntry={this.state.currentPwdInputype}
                               onChangeText={(text)=>{this.state.currentPassword = text}}
                               placeholderTextColor="#999999"
                               returnKeyType={'next'}
                               autoFocus={true}
                               onSubmitEditing={()=>{this.newPwdInput && this.newPwdInput.focus()}}
                               placeholder="输入当前密码">
                    </TextInput>
                    <TouchableOpacity
                        style={{width:50,height:50,justifyContent: 'center', alignItems: 'center', marginRight:30}}
                        onPress={()=>{
                                this._changecurrentPwdIcon();
                                      }}>
                        <Image
                            style={{width:15,height:15,resizeMode:'contain'}}
                            source={ this.state.currentPwdImgUrl}>

                        </Image>
                    </TouchableOpacity>
                    </View>
                    <View style={{height:1,backgroundColor:newSeparatorColor(),opacity: 0.2,marginHorizontal:40}}/>
                </View>
            )
        }else {
            return(<View/>)
        }
    }
}
