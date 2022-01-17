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
import {isNotEmpty, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../Utils/YFWNativeManager";

const {YFWEventManager} = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);

export class YFWNoNetWorkTipView extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            showView: false,
        };
    }

    componentWillMount() {
        if (Platform.OS == 'android') {
            /*
             判断刚开启应用时的网络状态
             * */
            NetInfo.isConnected.fetch().done((isConnected) => {
                if(!isConnected){
                    this.setState({
                        showView:true
                    })
                }
            });

            /*
             *  判断使用过程中的网络状态
             * */

            NetInfo.addEventListener('change', (status)=>{
                if(status == 'NONE'){
                    this.setState({
                        showView:true
                    })
                }else {
                    this.setState({
                        showView:false
                    })
                }
            });
        } else {
            this.netWorkListener = iOSManagerEmitter.addListener('netWorkChanged', (data)=> {
                this.setState({
                    showView: !data.reachable,
                });
            });
        }


    }

    componentWillUnmount() {
        if (isNotEmpty(this.netWorkListener)) {
            this.netWorkListener.remove();
        }
        NetInfo.removeEventListener('change');

    }

    render() {
        return (
            this.renderNoNetWorkView()
        );
    }

    renderNoNetWorkView() {
        if (this.state.showView) {
            return (
                <TouchableOpacity
                    onPress={()=>this.goToNetWorkSetting()}
                    style={{width:kScreenWidth,height:50,marginTop:60,backgroundColor:'rgba(70,70,70,0.9)',position:'absolute'}}>
                    <View >
                        <View
                            style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:25}}>
                            <Image style={{resizeMode:'contain',width:25,height:18,marginLeft:10}}
                                   source={require('../../img/noNetWorkIcon.png')}/>
                            <Text style={{fontSize:14,color:'white',width:250,height:18,marginLeft:20}}>
                                {'网络请求失败，请检查您的网络设置'}</Text>
                            <Image style={{resizeMode:'contain',width:25,height:18,marginRight:10,marginLeft:10}}
                                   source={require('../../img/arrow_right_white.png')}/>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (<View></View>);
        }


    }

    goToNetWorkSetting() {
        YFWNativeManager.openSetting();
    }
}