/**
 * Created by nw on 2018/9/12.
 */

import React, {Component} from 'react';
import {
    TouchableOpacity,
    Text,
    Image,
    View,
    Modal,
    DeviceEventEmitter, NativeModules,
    ImageBackground
} from 'react-native';
import {isNotEmpty, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {yfwGreenColor,darkNomalColor} from "../Utils/YFWColor";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWVersionUpdateModel from "../Utils/Model/YFWVersionUpdateModel";
import ModalView from './ModalView'
import YFWTouchableOpacity from '../widget/YFWTouchableOpacity'


export default class YFWVersionUpdateView extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            status_modal:false,
            updateValue:YFWVersionUpdateModel.getModelWithData(undefined),
        };
    }

    componentDidMount() {
        DeviceEventEmitter.addListener('OpenVersionUpdateAlertView',(value)=>{
            if (isNotEmpty(value)){
                this.showView(value);
            }
        });
    }

    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }

    //action
    showView(value) {
        this.modalView && this.modalView.show()

        this.setState({
            status_modal:true,
            updateValue:value,
        });
    }

    onClickMethod(){

        YFWNativeManager.openAppStore(()=>{});

    }
    closeView(){
        this.modalView && this.modalView.disMiss()

        this.setState({
            status_modal:false,
        });
    }

    _renderAlertView() {
        return(
            <View style={[BaseStyles.centerItem,{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}>
                <View style={{width:kScreenWidth-100,justifyContent:'center',alignItems:'center',borderRadius:21,backgroundColor:'#fff',}}>
                    <View style={{width:kScreenWidth-100,height:100/375.0*kScreenWidth,borderTopLeftRadius:21,borderTopRightRadius:21,overflow:1}}>
                        <Image source={require('../../img/icon_version_bg.jpg')} style={{width:kScreenWidth-100,height:100/375.0*kScreenWidth}}/>
                    </View>
                    <View style={{width:kScreenWidth-100,height:100/375.0*kScreenWidth,flexDirection:'row',position:'absolute', left:0,right:0,top:0}}>
                        <Image source={require('../../img/icon_version_plan.png')} style={{width:105/375.0*kScreenWidth,height:114/375.0*kScreenWidth,position:'absolute',left:20,top:-30}}></Image>
                        <View style={{flex:1,paddingTop:25,left:105/375.0*kScreenWidth+20}}>
                            <Text style={{color:'#fff', fontSize:21,fontWeight:'bold'}}>发现新版本</Text>
                            <Text style={{color:'#fff889', fontSize:17}}>{this.state.updateValue.new_version}</Text>
                        </View>
                        {this.state.updateValue.isForceUpdate != '1' ? <TouchableOpacity activeOpacity={1} style={{width:40,height:40,justifyContent:'center', alignItems:'center'}} onPress={()=>this.closeView()}>
                            <Image source={require('../../img/icon_version_close.png')} style={{width:15,height:15}}></Image>
                        </TouchableOpacity> : null}
                    </View>
                    <View style={{paddingHorizontal:40,paddingTop:15,paddingBottom:20,alignItems:'center'}}>
                        <Text style={{color:'#333', fontSize:17, fontWeight:'500'}}>更新说明</Text>
                        <Text style={{fontSize:12, color:'#999', lineHeight:18, marginTop:20,marginBottom:25}}>{this.state.updateValue.updateDescription}</Text>
                        <YFWTouchableOpacity title={'立即体验'} style_title={{fontSize:15, width:kScreenWidth-180,height:44}} isEnableTouch={true} callBack={()=>this.onClickMethod()}/>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        return (

            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this._renderAlertView()}
            </ModalView>
        );
    }
}