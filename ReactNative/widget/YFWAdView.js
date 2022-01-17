import React, {Component} from 'react';
import {
    Image,
    View,
    Platform,
    TouchableOpacity,
    DeviceEventEmitter,
    Text, NativeModules,
} from 'react-native';
import {iphoneTopMargin, isIphoneX, isNotEmpty, kScreenHeight, kScreenWidth, safeObj, safe} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {getItem, kIsFirstLoadLaunchKey, kOpenFullAdData, setItem} from "../Utils/YFWStorage";
import YFWNativeManager from "../Utils/YFWNativeManager";
import { isCurrentInDateRange } from '../Utils/YFWInitializeRequestFunction';
let defaultImage = require('../../img/Default.jpg');
let defaultXImage = require('../../img/DefaultX.jpg');
let defaultPadImage = require('../../img/DefaultPad.png');
var YFWBridgeManager = NativeModules.YFWBridgeManager;

export default class YFWAdView extends Component {

    constructor(...args) {
        super(...args);
        this.loadEnd = false;
        this.state = {
            data:null,
            status_modal:false,
            imgUrlStr:'',
            showTimeSecond:0,
            waitingTimeSecond:3,
        }
    }
    componentWillMount(){
        getItem(kIsFirstLoadLaunchKey).then((id)=> {
            if (id == 'true') {
                this.closeView();
                setItem(kIsFirstLoadLaunchKey,'false');
            } else {
                getItem('FullAdsCasheData').then((data)=>{
                    let adInfo = safeObj(safeObj(data).data)
                    let startDate = safe(adInfo.start);
                    let endDate = safe(adInfo.end);
                    let isInTime = isCurrentInDateRange(startDate,endDate)
                    if(data && data.is_show && isInTime){
                        this.startTimer(true);
                        this.showView(data.data,data.second,data.is_show);
                    }else{
                        YFWNativeManager.closeSplashImage()
                        this.closeView()
                    }
                },(error)=>{
                    YFWNativeManager.closeSplashImage()
                    this.closeView()
                })
            }
        });
    }
    componentWillUpdate(){

        // if (this.loadEnd){
        //     YFWNativeManager.closeSplashImage()
        //     if (this.state.imgUrlStr.length > 0){
        //         this.startTimer(false);
        //     }
        // }
    }

    componentDidUpdate(){

        if (this.loadEnd){
            YFWNativeManager.closeSplashImage()
            if (this.state.imgUrlStr.length > 0){
                this.startTimer(false);
            }
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        this.clearTimer();
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }

    showView(value,timeSecond,isShow){
        if (this.state.waitingTimeSecond <= 0){
            this.closeView()
            return;
        }
        if (!value||!isShow) {
            this.closeView();
        } else {
            this.setState({
                status_modal:true,
                imgUrlStr:value.img_url,
                showTimeSecond:timeSecond,
                data:value,
            });
        }
    }

    closeView(){
        setTimeout(()=>{
            YFWNativeManager.closeSplashImage()
        },1000)
        if (this.props.closecallback) {
            this.props.closecallback();
        }
        this.clearTimer();
        this.setState({
            status_modal:false,
            waitingTimeSecond:0,
        });
    }
    startTimer(isWaiting){
        this.clearTimer();
        if (isWaiting){
            this.timer = setInterval(
                ()=>{
                    let remainingSeconds = this.state.waitingTimeSecond;
                    if (remainingSeconds <= 0) {
                        this.closeView();
                        this.clearTimer();
                    }
                    this.state.waitingTimeSecond = remainingSeconds -1
                }, 1000)
        }else {
            this.timer = setInterval(
                ()=>{
                    let showTimeSecond = this.state.showTimeSecond;
                    if (showTimeSecond <= 0) {
                        this.closeView();
                        this.clearTimer();
                    }
                    this.setState({})
                    this.state.showTimeSecond = showTimeSecond -1
                }, 1000)
        }
    }
    clearTimer(){
        if(isNotEmpty(this.timer)){
            clearInterval(this.timer);
        }
    }
    imageLoadEnd(){
        this.loadEnd = true
        this.setState({})
    }
    showAdDetail(){
        setItem(kOpenFullAdData,this.state.data)
        this.closeView();
        // const {navigate} = this.navigation;
        // pushNavigation(navigate,this.state.data);

    }
    renderAlertView(){
        return (
            <View style={[{width:kScreenWidth,height:kScreenHeight,flex: 1,flexDirection:'column', alignItems: 'stretch', justifyContent:'flex-start'}]}>
                {this.renderMainImageView()}
                {this.renderSkipView()}

            </View>
        );

    }
    renderSkipView(){
        return (
            <TouchableOpacity onPress={()=>{this.closeView()}}>
                <View style={[BaseStyles.centerItem,{width:65,height:29,borderRadius:3,marginLeft:kScreenWidth-10-65,marginTop:iphoneTopMargin()-10,backgroundColor:'rgba(70,70,70,0.6)'}]}>
                    <Text style={{color:'white',fontSize:13}}>{'0'+this.state.showTimeSecond+' 跳过'}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    renderMainImageView(){
        if (Platform.OS == 'ios') {
            if (YFWBridgeManager.changeNavigation) {
                return (
                    <TouchableOpacity onPress={() => {this.showAdDetail()}} style={{position: 'absolute', width: kScreenWidth, height: kScreenHeight}}>
                        <Image onLoadEnd={() => {this.imageLoadEnd()}}
                               style={{resizeMode: 'stretch', width: kScreenWidth, height: kScreenHeight, position: 'absolute'}}
                               source={{uri: this.state.imgUrlStr}}/>
                    </TouchableOpacity>
                )
            }else {
                return (
                    <TouchableOpacity onPress={()=>{this.showAdDetail()}} style={{position:'absolute',width:kScreenWidth,height:kScreenHeight}}>
                        <Image style={{resizeMode:'stretch',width:kScreenWidth,height:kScreenHeight}} source={Platform.isPad?defaultPadImage:isIphoneX()?defaultXImage:defaultImage } />
                        <Image onLoadEnd={()=>{this.imageLoadEnd()}}
                               style={{resizeMode:'stretch',width:kScreenWidth,height:kScreenHeight,position:'absolute'}}
                               source={{uri:this.state.imgUrlStr} }/>
                    </TouchableOpacity>
                )
            }
        }else {
            return (
                <TouchableOpacity onPress={()=>{this.showAdDetail()}} style={{position:'absolute',width:kScreenWidth,height:kScreenHeight}}>
                    <Image style={{resizeMode:'contain',width:kScreenWidth,height:kScreenHeight}} source={Platform.isPad?defaultPadImage:isIphoneX()?defaultXImage:defaultImage } />
                    <Image onLoadEnd={()=>{this.imageLoadEnd()}}
                           style={{resizeMode:'stretch',width:kScreenWidth,height:kScreenHeight,position:'absolute'}}
                           source={{uri:this.state.imgUrlStr} }/>
                </TouchableOpacity>
            )
        }


    }
    render() {
        if(this.state.status_modal){

            return (
                <View style={{position: 'absolute'}}>
                    {this.renderAlertView()}
                </View>
            );
        }else{
            return (<View />)
        }
    }
};



