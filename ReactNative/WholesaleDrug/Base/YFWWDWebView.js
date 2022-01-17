import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
    Image,
    View,
    WebView, DeviceEventEmitter,
    BackAndroid,
    KeyboardAvoidingView
} from 'react-native';
import {pushNavigation, doAfterLogin} from "../../Utils/YFWJumpRouting";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {iphoneBottomMargin, isIphoneX, isNotEmpty, isEmpty, darkStatusBar, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import { pushWDNavigation } from '../YFWWDJumpRouting';
var forge = require('node-forge');

var {
    height: deviceHeight,
    width: deviceWidth
} = Dimensions.get('window');

let YFWAESKEY = 'yaofangwang!@#$%'

let JSCode = `
    var a = document.getElementsByTagName('a');
    for(var i = 0; i < a.length; i++){
        a[i].onclick = function (event) {
            window.postMessage(this.href);
            event.preventDefault();
        }
    }
`

const patchPostMessageFunction = function() {
    var originalPostMessage = window.postMessage;

    var patchedPostMessage = function(message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer);
    };

    patchedPostMessage.toString = function() {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
    };

    window.postMessage = patchedPostMessage;
};

const patchPostMessageJsCode = '(' + String(patchPostMessageFunction) + ')();';


export default class YFWWDWebView extends Component {


    constructor(props,context){

        super(props,context);
        state = props.navigation.state.params.state;
        this.state = state;
        this.isFromYaoShiClassRoom=this.state.isFromYaoShiClassRoom;
        this.backButtonEnabled = false;
        this.listener();
        this.onBackAndroid = this.onBackAndroid.bind(this);
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid);
                }
            }
        );
        this.didBlur = this.props.navigation.addListener('didBlur',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress',this.onBackAndroid);
                }
            }
        );
    }


    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle:(
            <Text style={[BaseStyles.titleWordStyle,{fontSize:16,flex:1,textAlign:'center'}]} numberOfLines={1}>{navigation.state.params.state.name&&navigation.state.params.state.name.length>0?navigation.state.params.state.name:navigation.state.params.title}</Text>
        ),
        headerLeft:(
            <TouchableOpacity style={[BaseStyles.item,{width:50}]}
                              onPress={()=>navigation.state.params.backMethod()}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={navigation.state.params.backMethod ? require('../../../img/top_back_green.png') :null}/>
            </TouchableOpacity>
        ),
        headerRight: (
            navigation.state.params.state.isHiddenShare?<View style={{width:50}}/>:
            <TouchableOpacity onPress={()=>navigation.state.params.shareMethod()}>
                <Image style={{width:22,height:22,resizeMode:'contain',marginRight:15}}
                       source={navigation.state.params.shareMethod ? require('../../../img/share_icon.png') : null}/>
            </TouchableOpacity>
        ),
    });

    componentWillMount(){

        this.props.navigation.setParams({ backMethod:this._backMethod });
        this.props.navigation.setParams({ shareMethod:this._shareMethod});

    }

    componentDidMount() {
        darkStatusBar();
    }


    componentWillUnmount(){

    }


    render() {
        const bottom = iphoneBottomMargin();
        return (
            <KeyboardAvoidingView style={[styles.container,{marginBottom:bottom}]} style={{backgroundColor:'#F5F5F5',flex:1}} behavior="padding"
                                  keyboardVerticalOffset={80}>
                <AndroidHeaderBottomLine/>
                <WebView bounces={false}
                         ref={(webView)=>this._webView = webView}
                         scalesPageToFit={true}
                         source={{uri:isNotEmpty(this.state.token_value)?this.state.token_value:this.state.value,method: 'GET'}}
                         onLoadStart={(event)=>{this._webViewOnLoadStart(event)}}
                         onLoad={(event)=>{this._webViewOnLoad(event)}}
                         onLoadEnd={(event)=>{this._webViewOnLoadEnd(event)}}
                         onNavigationStateChange={(event)=>{this._webViewStateChangeMethod(event)}}
                         onMessage={(event)=>{this._webViewMessageMethod(event)}}
                         style={{width:deviceWidth, height:deviceHeight}}
                         renderError={()=>this._renderError()}
                         // injectedJavaScript={YFWUserInfoManager.defaultProps.isRequestTCP?'':patchPostMessageJsCode}
                         nativeConfig={{
                             props:{
                                 backgroundColor: '#ffffff',
                                 flex:1,
                             }
                         }}
                >
                </WebView>
            </KeyboardAvoidingView>
        );
    }


    onBackAndroid=()=>{
        this._backMethod()
        return true
    }

    _backMethod=()=>{

        if (this.backButtonEnabled){
            this._webView.goBack();
        } else {
            this.props.navigation.goBack();
        }

    }

    _shareMethod=()=>{

        let url = this.state.value;
        let shareUrl = this.state.share;

        let param = {page : 'h5',
            title : this.props.navigation.state.params.title?this.props.navigation.state.params.title:safeObj(this.props.navigation.state.params.state).name,
            url:(isNotEmpty(shareUrl)&&shareUrl.length>0 )? shareUrl: url,
            isFromYaoShiClassRoom:this.isFromYaoShiClassRoom
        };

        DeviceEventEmitter.emit('OpenShareView',param);

    }

    _renderError(){
        return <View style={{width: 0, height: 0}}/>
    };

    _webViewOnLoad(event) {

        // if (!YFWUserInfoManager.defaultProps.isRequestTCP){
        //     if (this.props.navigation.state.params.state.injectJsCode == undefined) {
        //         this._webView.injectJavaScript(JSCode);
        //     }
        // }

    }

    _webViewOnLoadStart(event) {
        // if (!YFWUserInfoManager.defaultProps.isRequestTCP){
        //     if (this.props.navigation.state.params.state.injectJsCode == undefined) {
        //         this._webView.injectJavaScript(JSCode);
        //     }
        // }
    }

    _webViewOnLoadEnd(event) {
        // if(this.state.isOpenShare){
        //     this._webView.injectJavaScript('document.getElementsByClassName("js_yaoqing")[0].click()');
        // }
    }

    _webViewMessageMethod(event){


        let data = event.nativeEvent.data;

        if(isEmpty(data)){
            return
        }

        try {

            let obj = JSON.parse(data)
            obj.value = obj.id;
            if(obj.type=="get_save_photo"){
                obj.value = obj.imgsrc;
            }
            if(isNotEmpty(obj.type)){
                if(obj.type=="get_share"){
                    this.shareSign(obj)
                }else if(obj.type=="change_share_url" && isNotEmpty(obj.value)){
                    this.state.share = obj.value
                }else if(obj.type=="get_coupon_detail"){
                    let {navigate} = this.props.navigation;
                    doAfterLogin(navigate,()=>{
                        pushWDNavigation(navigate,obj);
                    })
                }else{
                    let {navigate} = this.props.navigation;
                    pushWDNavigation(navigate,obj);
                }
            }else{
                this._webView.injectJavaScript('window.location.href=\''+data+'\'');
            }

        } catch (e) {


        }



        // if (YFWUserInfoManager.defaultProps.isRequestTCP){
        //
        //     let data = event.nativeEvent.data;
        //
        //     if(isEmpty(data)){
        //         return
        //     }
        //     let obj = JSON.parse(data)
        //     obj.value = obj.id;
        //     if(obj.type=="get_save_photo"){
        //         obj.value = obj.imgsrc;
        //     }
        //     if(isNotEmpty(obj.type)){
        //         if(obj.type=="get_share"){
        //             this.shareSign(obj)
        //         }else{
        //             let {navigate} = this.props.navigation;
        //             pushNavigation(navigate,obj);
        //         }
        //     }else{
        //         this._webView.injectJavaScript('window.location.href=\''+data+'\'');
        //     }
        //
        // } else {
        //
        //
        //     let data = event.nativeEvent.data;
        //
        //     if (isNotEmpty(data)){
        //
        //         if (data.includes('javascript:openApp')) {
        //
        //             let jsonString = data.substring(data.indexOf('{'),data.indexOf('}')+1);
        //
        //             if (isNotEmpty(jsonString) && jsonString.length > 0){
        //
        //                 let json = JSON.parse(jsonString);
        //                 json.value = json.id;
        //
        //                 let {navigate} = this.props.navigation;
        //                 pushNavigation(navigate,json);
        //
        //             }
        //
        //         }
        //
        //         // if(data.type=="get_save_photo"){
        //         //     data.value = data.imgsrc;
        //         // }
        //         //点击H5内部链接弹出分享弹窗
        //         else if(data.type == 'get_share'){
        //             this.shareSign(data)
        //         }
        //         else {
        //             this._webView.injectJavaScript('window.location.href=\''+data+'\'');
        //         }
        //
        //     }
        //
        // }

    }

    shareSign(data){
        let param = {
            url:data.url,
            title : data.title,
            content:data.desc,
            image : data.imgsrc,
            goneItems:[],
            isShowHead:false
        };
        DeviceEventEmitter.emit('OpenShareView',param);
    }

    _webViewStateChangeMethod(event){


        if (event.title.length > 0){

            this.title = event.title;
            this.backButtonEnabled = event.canGoBack;
            this.props.navigation.setParams({
                title:this.title,
            })
            if(this.isFromYaoShiClassRoom){
                this.state.share = safeObj(event.url).replace(/_android\./g,".").replace(/_ios\./g,".")
            }
        }


    }

    _getlinkurl(){

        let url = this.state.value;

        var aesCipher = forge.cipher.createDecipher('AES-ECB', YFWAESKEY);
        aesCipher.start();
        aesCipher.update(url);
        if (!aesCipher.finish()) {
            throw new Error('decrypt error');
        }
        var aid = aesCipher.output;
        let result = url + '&aid=' + aid;

        return result;
    }


}



const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});