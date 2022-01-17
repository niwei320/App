import React, {Component} from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    NativeEventEmitter, NativeModules, Platform,
    DeviceEventEmitter,
    NetInfo
} from 'react-native';
import {isNotEmpty, kScreenWidth, kScreenHeight, haslogin, isIphoneX} from "../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from '../Utils/YFWJumpRouting'

const {YFWEventManager} = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);

export class YFWLoginTip extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            showView: false,
        };
    }

    componentDidMount() {
        if (this.props.navigation) {
            this.navigation = this.props.navigation;
        }
        this.loginListener = DeviceEventEmitter.addListener('UserLoginSucess',()=>{
            this.setState({});
        });
        this.logoutListener = DeviceEventEmitter.addListener('LOGOUT',()=>{
            this.setState({});
        });

        DeviceEventEmitter.addListener('kStatusChange',(status)=>{
            if (this.loginTip) {
                this.loginTip.setNativeProps({
                    style:{height:status?45:0}
                })
            }
        })

    }

    componentWillUnmount() {
        this.loginListener&&this.loginListener.remove();
        this.logoutListener&&this.logoutListener.remove();
    }

    render() {
        return (
            this.renderLoginTipView()
        );
    }

    renderLoginTipView() {
        if (!haslogin()) {
            return (
                <View ref={(e)=>this.loginTip=e} style={{overflow:'hidden',width:kScreenWidth-20,borderRadius: 22.5,height:0,marginLeft:10,marginTop:kScreenHeight - 50 - 50 - 15 - (isIphoneX()?34:0),backgroundColor:'rgba(0,0,0,0.7)',position:'absolute'}}>
                    <TouchableOpacity onPress={()=>this.goToLogin()} style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',marginLeft:28,marginRight: 25}}>
                            <Text style={{fontSize:14,color:'white'}}>
                                登录账号开启健康生活
                            </Text>
                            <View flex={1}/>
                            <Image style={{resizeMode:'contain',width:90,height:25}}
                                   source={require('../../img/login_rk.png')}/>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (<View/>);
        }


    }

    goToLogin() {
        let {navigate} = this.navigation;
        pushNavigation(navigate, {type: 'get_login'})
    }
}