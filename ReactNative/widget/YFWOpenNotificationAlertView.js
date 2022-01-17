/**
 * Created by nw on 2018/9/12.
 */

import React, {Component} from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    Modal,
    DeviceEventEmitter,
    NativeModules,
    Platform
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import {yfwGreenColor,darkTextColor,darkLightColor} from "../Utils/YFWColor";
import YFWNativeManager from "../Utils/YFWNativeManager";
import ModalView from './ModalView'


export default class YFWOpenNotificationAlertView extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            status_modal:false,
        };
    }

    componentDidMount() {
        this.openListener = DeviceEventEmitter.addListener('OpenNotificationAlertView',()=>this.showView());
    }

    componentWillUnmount() {
        this.openListener&&this.openListener.remove();
    }

    //action
    showView() {

        YFWNativeManager.isOpenNotification((openStatus)=>{
            if (openStatus) {
                return
            }
            this.modalView && this.modalView.show()
            this.setState({
                status_modal:true,
            });
        });

    }

    onClickMethod(){

        YFWNativeManager.openSetting();

    }

    closeView(){
        this.modalView && this.modalView.disMiss()

        this.setState({
            status_modal:false,
        });
    }

    renderAlertView(){
        return(
            <View style={[BaseStyles.centerItem,{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                <View style={{width: 280, height: 335,alignItems:'center', backgroundColor:'white',borderRadius:8,marginTop:20}}>
                    <Text style={{width: 250,textAlign:'center',color:darkTextColor(),marginTop:30,fontSize:20,fontWeight:'bold'}}>
                        开启订单信息通知
                    </Text>
                    <Text style={{width: 250,textAlign:'center',color:darkLightColor(),fontSize:14,marginTop:15}}>
                        第一时间获取您的订单相关信息
                    </Text>
                    <Image style={{height: 155, width: 190,marginTop:20}} source={require('../../img/mes_open.png')}/>
                    <TouchableOpacity onPress={()=>this.onClickMethod()}>
                        <View style={[BaseStyles.centerItem,{backgroundColor:yfwGreenColor(),height: 40, width: 180, marginTop:20,borderRadius:20}]}>
                            <Text style={{color:'white',fontSize:16}}>去开启</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={()=>this.closeView()}>
                    <Image style={{height: 40, width: 40,marginTop:20}} source={require('../../img/advert_delete.png')}/>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this.renderAlertView()}
            </ModalView>
        );
    }
}