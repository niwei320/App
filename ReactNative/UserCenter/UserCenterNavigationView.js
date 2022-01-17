import React,{Component} from "react";
import {
    View,
    Image,
    TouchableOpacity,
    ImageBackground, DeviceEventEmitter,
    Text, Platform
} from 'react-native';
import {kAccountKey, removeItem} from "../Utils/YFWStorage";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {iphoneTopMargin, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import {doAfterLogin} from "../Utils/YFWJumpRouting";



export default class UserCenterNavigationView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLogin: false,
            bgColor:'rgba(255,255,255,0)',
            navigation_Title:'',
            showSetting:false,
        };
    }
    componentDidMount() {
        let userInfo = YFWUserInfoManager.ShareInstance();
        let ssid = userInfo.getSsid();
        if (ssid) {
            this.setState(()=>({
                    isLogin: true,
                }))
        }
        this.subscription = DeviceEventEmitter.addListener('UserLoginSucess', ()=> {
            let userInfo = YFWUserInfoManager.ShareInstance();
            let ssid = userInfo.getSsid();
            if (ssid) {
                this.setState(()=>({isLogin: true}));
            } else {
                this.setState(()=>({isLogin: false}));
            }
        })
    }

    setOffsetProps(newOffsetY){
        if (Platform.OS == 'ios'){
            if (newOffsetY<=50){
                this.state.bgColor = 'rgba(255,255,255,0)';
                this.state.navigation_Title = '';
                this.state.showSetting = false
            } else {
                this.state.bgColor = 'rgb(39,191,143)';
                this.state.navigation_Title = this.props.title;
                this.state.showSetting = true
            }
        } else {
            if (newOffsetY<=50){
                this.state.bgColor = 'rgba(255,255,255,0)';
                this.state.navigation_Title = '';
                this.state.showSetting = false

            } else {
                this.state.bgColor = 'rgb(39,191,143)';
                this.state.navigation_Title = this.props.title;
                this.state.showSetting = true

            }
        }
        this.setState({})
    }

    render() {
        if (!this.state.showSetting) {
            return (<View></View>)
        }
        let top = iphoneTopMargin();
        return (
            <ImageBackground source={require('../../img/Status_bar.png')} style={[this.props.bgStyle,{backgroundColor:this.state.bgColor,height:top+22,resizeMode:'stretch'}]}>
                <View style={{flexDirection:'row',width:kScreenWidth,marginTop:top-6,justifyContent:'flex-end'}}>
                    <View style={{position:'absolute',width:kScreenWidth,left:0,alignItems:'center'}}>
                        <Text style={{color:'white',fontSize:16,textAlign:'center'}}>{this.state.navigation_Title}</Text>
                    </View>
                    {this.state.showSetting?
                    <TouchableOpacity onPress={() => this.settingAction()} activeOpacity={1} hitSlop={{top:20,left:20,bottom:20,right:20}}>
                        <Text style={{color:'white',fontSize:14}}>{'设置'}</Text>
                    </TouchableOpacity>:null}
                    <View style={{width:15}}/>
                </View>
            </ImageBackground>
        );

    }

    settingAction(){
        YFWNativeManager.mobClick('setting');
        this.props.navigation.navigate('Setting',{
                    isLogin:this.state.isLogin,
                    callback:()=>{
                            this.setState({isLogin:false})
                        }
                })
    }
}
