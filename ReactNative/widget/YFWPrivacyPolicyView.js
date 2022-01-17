import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    DeviceEventEmitter, Platform
} from 'react-native'

import ModalView from './ModalView'
import {darkLightColor, darkTextColor, darkNomalColor,yfwGreenColor} from "../Utils/YFWColor";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {getItem, kIsFirstLoadLaunchKey, setItem,OpenPrivacyPolicy} from "../Utils/YFWStorage";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import {REGISTER_PROTOCOL_HTML} from "../PublicModule/Util/YFWPublicFunction";


export default class YFWPrivacyPolicyView extends Component {

    constructor(props) {
        super(props);

    }


    componentDidMount() {
        DeviceEventEmitter.addListener('OpenPrivacyPolicyView',()=>this.showView());
    }

    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }


    //action

    static hasShow(){

        getItem(OpenPrivacyPolicy).then((is_show)=> {
            if (is_show != 'true'){

                setTimeout(()=> {
                        DeviceEventEmitter.emit('OpenPrivacyPolicyView');
                    },3000)

            };
        });

    }

    showView() {

        this.modalView && this.modalView.show();

    }

    closeView(){

        this.modalView && this.modalView.disMiss();

    }

    agreeMethod(){

        setItem(OpenPrivacyPolicy,'true');
        this.closeView();
        YFWNativeManager.registBaiduManager();
    }


    disAgreeMethod(){

        YFWNativeManager.exit();

    }


    termsServiceMethod(){

        const {navigate} = this.props.getNavigation();
        pushNavigation(navigate,
            {type:'get_h5',
            value: REGISTER_PROTOCOL_HTML(),
             name: '服务条款',
             title: '服务条款',
             isHiddenShare:true});
        this.closeView();

    }


    // View
    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade" onRequestClose={()=>{}}>
                {this.renderAlertView()}
            </ModalView>
        );
    }

    renderAlertView(){

        return (
            <View style={[BaseStyles.centerItem,{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                <View style={{width: 300, height: 340,alignItems:'center', backgroundColor:'white',borderRadius:5}}>
                    <View style={[BaseStyles.centerItem,{width:300,height:70}]}>
                        <Text style={{color:darkTextColor(),fontSize:20,fontWeight:'bold'}}>药房网商城隐私政策</Text>
                    </View>
                    <View style={[BaseStyles.centerItem,{width:275}]}>
                        <Text style={{color:darkNomalColor(),fontSize:14,lineHeight:22}} numberOfLines={0}>
                            欢迎使用药房网商城，当您使用本软件时，我们可能会对您的部分个人信息进行收集、使用、共享，请仔细阅读
                            <Text style={{color:yfwGreenColor()}}>《服务条款》</Text>
                            并确认我们对您个人信息的处理规则，主要包括：
                            {'\n'}1、我们如何收集和使用个人信息
                            {'\n'}2、我们对cookie和同类技术的使用
                        </Text>
                    </View>
                    <TouchableOpacity style={{width:270,height:40,marginTop:20}} onPress={()=>this.agreeMethod()}>
                        <View style={[BaseStyles.centerItem,{flex:1,backgroundColor:yfwGreenColor(),borderRadius:3}]}>
                            <Text style={{fontSize:16,color:'white'}}>同意并使用</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[BaseStyles.centerItem,{width:270,height:40}]} onPress={()=>this.disAgreeMethod()}>
                        <Text style={{fontSize:14,color:darkNomalColor()}}>不同意并退出</Text>
                    </TouchableOpacity>
                    <View style={{position:'absolute',width:250,height:50,marginTop:100}}>
                        <TouchableOpacity style={{width:100,height:50,marginLeft:140}} onPress={()=>this.termsServiceMethod()}>
                            <View />
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        );

    }


}