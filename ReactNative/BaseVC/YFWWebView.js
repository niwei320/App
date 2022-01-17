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
import {pushNavigation, doAfterLogin} from "../Utils/YFWJumpRouting";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {
    iphoneBottomMargin,
    isIphoneX,
    isNotEmpty,
    isEmpty,
    darkStatusBar,
    safeObj,
    mobClick,
    safe,
    isAndroid
} from "../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {SHARE_COPY_URL, SHARE_PIC, SHARE_QQ, SHARE_QZONE, SHARE_SINA} from "../widget/YFWShareView";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import {NavigationActions} from "react-navigation";
import YFWNativeManager from "../Utils/YFWNativeManager";
import { refreshRedPoint } from '../Utils/YFWInitializeRequestFunction';
import YFWHeaderBackground from '../WholesaleDrug/Widget/YFWHeaderBackground';
import { darkTextColor } from '../Utils/YFWColor';
var forge = require('node-forge');
// import CookieManager from '@react-native-community/cookies';
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

const ActivityUrls = [
    'm.yaofangwang.com/activity/index',
    'm.yaofangtong.com/activity/index',
    'm.yaofangwang.com/activity/branch',
    'm.yaofangtong.com/activity/branch',
]
export default class YFWWebView extends Component {


    constructor(props,context){

        super(props,context);
        state = props.navigation.state.params.state;
        this.state = state;
        this.isFromYaoShiClassRoom=this.state.isFromYaoShiClassRoom;
        this.backButtonEnabled = false;
        this.forceBackEnable = this.state.forceBackEnable || false;//强制返回
        this.listener();
        this.onBackAndroid = this.onBackAndroid.bind(this);

        this.useWebKit = true
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
        tabBarVisible: (ActivityUrls.some((url)=>{
            let paramsState = safeObj(navigation.state.params.state)
            let finalUrl = isNotEmpty(paramsState.token_value)?paramsState.token_value:paramsState.value
            finalUrl = safe(finalUrl)
            finalUrl = decodeURIComponent(finalUrl)
            return finalUrl.indexOf(url) != -1
        })),
        headerTitle:(
            <Text style={[BaseStyles.titleWordStyle,{fontSize:16,flex:1,textAlign:'center',color:safeObj(navigation.state.params.state).blueHeader?'white':darkTextColor()}]} numberOfLines={1}>{navigation.state.params.state.name&&navigation.state.params.state.name.length>0?navigation.state.params.state.name:navigation.state.params.title}</Text>
        ),
        headerLeft:(
            <TouchableOpacity style={[BaseStyles.item,{width:50}]}
                                hitSlop={{left:10,top:15,bottom:15,right:10}}
                              onPress={()=>navigation.state.params.backMethod()}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={navigation.state.params.backMethod ?(safeObj(navigation.state.params.state).blueHeader? require('../../img/top_back_white.png'):require('../../img/top_back_green.png')) :null}/>
            </TouchableOpacity>
        ),
        headerRight: (
            navigation.state.params.state.isHiddenShare?<View style={{width:50}}/>:
            <TouchableOpacity hitSlop={{left:10,top:15,bottom:15,right:10}} onPress={()=>navigation.state.params.shareMethod()}>
                <Image style={{width:22,height:22,resizeMode:'contain',marginRight:15}}
                       source={navigation.state.params.shareMethod ? require('../../img/share_icon.png') : null}/>
            </TouchableOpacity>
        ),
        headerBackground: safeObj(navigation.state.params.state).blueHeader? <YFWHeaderBackground></YFWHeaderBackground>:null
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
                        //  useWebKit={this.useWebKit}
                         source={{uri:isNotEmpty(this.state.token_value)?this.state.token_value:this.state.value,method: 'GET'}}
                         onLoadStart={(event)=>{this._webViewOnLoadStart(event)}}
                         onLoad={(event)=>{this._webViewOnLoad(event)}}
                         onLoadEnd={(event)=>{this._webViewOnLoadEnd(event)}}
                         onNavigationStateChange={(event)=>{this._webViewStateChangeMethod(event)}}
                         onMessage={(event)=>{this._webViewMessageMethod(event)}}
                         style={{width:deviceWidth, height:deviceHeight}}
                         renderError={()=>this._renderError()}
                        //  injectedJavaScript={Platform.OS == 'ios'?patchPostMessageJsCode:''}
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

        if (!this.forceBackEnable && this.backButtonEnabled){
            this._webView.goBack();
        } else {
            this.props.navigation.goBack();
        }

    }

    _shareMethod=()=>{

        if (this.state.from == 'group_booking') {
            let obj = {
                url:this.state.share,
                title:this.state.shareTitle,
                desc:this.state.shareContent,
                imgsrc:this.state.shareImage,
                isShowHead:false,
            }
            this.shareSign(obj,'only_wx')
            return
        }

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
        // let url = 'https://m.yaofangwang.com'
        // CookieManager.get(url,this.useWebKit).then((cookies) => {
        //     let sessionIDCookie = cookies['ASP.NET_SessionId']
        //     if (sessionIDCookie && sessionIDCookie.value) {
        //         console.log(sessionIDCookie,'sessionIDCookie')
        //     } else {
        //         console.log('can not fetch sessionIDCookie')
        //     }
        //     console.log('CookieManager.get ' + url + (this.useWebKit?' from webkit-view':'') + ' =>', cookies);
        // });

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
                }else if(obj.type=="get_share_wx"){
                    this.shareSign(obj,'only_wx')
                }else if(obj.type=="change_share_url" && isNotEmpty(obj.value)){
                    this.state.share = obj.value
                }else if(obj.type=="get_coupon_detail"){
                    let {navigate} = this.props.navigation;
                    doAfterLogin(navigate,()=>{
                        pushNavigation(navigate,obj);
                    })
                }else if(obj.type=="get_home_page"){
                    this.props.navigation.popToTop();
                    const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
                    this.props.navigation.dispatch(resetActionTab);
                } else if (obj.type == 'get_orderSettlement') {
                    let goodsInfoArray = []
                    if (isNotEmpty(obj.packageids)) {
                        let packageids = obj.packageids.split(',')
                        for (let index = 0; index < packageids.length; index++) {
                            let ID = packageids[index]
                            goodsInfoArray.push({type:'package',package_id:ID})
                        }
                    }
                    if (isNotEmpty(obj.cartids)) {
                        let cartids = obj.cartids.split(',')
                        for (let index = 0; index < cartids.length; index++) {
                            let ID = cartids[index]
                            goodsInfoArray.push({type:'medicine',id:ID})
                        }
                    }
                    if (!goodsInfoArray || goodsInfoArray.length == 0) {
                        return
                    }
                    // obj.type = 'get_orderSettlement'
                    // obj.packageids = '233,211'//套餐ID
                    // obj.cartids = '123,23'//单品购物车ID
                    // obj.extraParams = {} //扩展参数map
                    const {navigate} = this.props.navigation;
                    doAfterLogin(navigate,()=>{
                        let params = {Data:goodsInfoArray}
                        if (isNotEmpty(obj.extraParams)) {
                            params.extraParams = obj.extraParams
                        }
                        this.props.navigation.navigate("YFWOrderSettlementRootVC",params);
                    })
                } else if (obj.type == 'refresh_shopCar_count') {
                    refreshRedPoint()
                }
                else {
                    let {navigate} = this.props.navigation;
                    pushNavigation(navigate,obj);
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

    shareSign(data, viewType){
        let param = {
            url:data.url,
            title : data.title,
            content:data.desc,
            image : data.imgsrc,
            goneItems:[],
            isShowHead:false,
            type:data.yqurl?'webPic':'',
            linkUrl:data.yqurl,
            viewType:viewType
        };
        DeviceEventEmitter.emit('OpenShareView',param);
        if (safe(data.desc).includes('邀请') || safe(data.url).includes('appinvite')) {
            mobClick('invite-prizes-share')
        }
    }

    _webViewStateChangeMethod(event){

        // if(event.url.endsWith('.pdf' ) && isAndroid()){
        //     YFWNativeManager.weakUpBrowser(event.url);
        // }
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
