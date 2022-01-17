import React, { Component } from 'react';
import {
    Image,
    Platform,
    View,
    TouchableOpacity, StyleSheet
} from 'react-native';

import {pushNavigation,doAfterLogin} from "../Utils/YFWJumpRouting";
import {
    mobClick,
    safeObj,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    kScreenWidth,
    kScreenScaling,
    safeArray,
    isAndroid, iphoneTopMargin, AndroidBannerImageMarginT, AdMobClick
} from "../PublicModule/Util/YFWPublicFunction";

import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
var Swiper = require('react-native-swiper');
import {homeAdviewClick} from "../Utils/YFWInitializeRequestFunction";
import YFWHomeBannerBgView from './YFWHomeBannerBgView';
import FastImage from 'react-native-fast-image';


export default class YFWHomeBannerView extends Component {


    constructor(args){
        super(args)
        this.state = {
            index:0
        }
    }

    static defaultProps = {
        imagesData:new Array(),
        backGroundImagesData:[],
        backGroundDownImagesData:[]
    }


    componentDidMount(){
    }

    render() {

        let swiperH = Platform.isPad?200:140*kScreenWidth/375
        let swiperMarginT = isIphoneX()?114+22:114
        if(isAndroid()){
            swiperMarginT = AndroidBannerImageMarginT()
        }
        swiperMarginT = swiperMarginT*kScreenScaling
        let allViewH = swiperMarginT + swiperH
        return (
            <View style={{height:allViewH}}>
                <Swiper style={{marginTop:0}} width={kScreenWidth} height={swiperH+swiperMarginT} autoplay={true} toplayTimeout={3}
                    dot={<View style={[{width:9,height:3,borderRadius:1.5,marginHorizontal:3,marginBottom:0},{backgroundColor:'rgba(255,255,255,0.5)'}]}/>}
                    activeDot={
                                <View style={[{width:9,height:9,marginHorizontal:3,marginBottom:0}]}>
                                    <View style={{position:'absolute',left:0,top:3 ,width:9,height:3,borderRadius:1.5,backgroundColor:'white'}}/>
                                    <View style={{position:'absolute',left:3,top:0 ,width:3,height:9,borderRadius:1.5,backgroundColor:'white'}}/>
                                </View>
                            }>
                {this.renderImg(swiperH)}
                </Swiper>
            </View>
        );
    }

    changeBgView(index){
        let bgImageSource = require('../../img/banner_bj.png')
        let bgImageDownSource = null
        let currentBg = safeObj(safeArray(this.props.imagesData)[index]).backgroundcolor
        if (safeArray(this.props.backGroundImagesData).length > 0 && currentBg) {
            this.props.backGroundImagesData.map((bgInfo)=>{
                if (bgInfo.backgroundcolor == currentBg) {
                    bgImageSource = {uri:bgInfo.img_url}
                }
            })
        }
        if (safeArray(this.props.backGroundDownImagesData).length > 0 && currentBg) {
            this.props.backGroundDownImagesData.map((bgInfo)=>{
                if (bgInfo.backgroundcolor == currentBg) {
                    bgImageDownSource = {uri:bgInfo.img_url}
                }
            })
        }
        if (this.bgView) {
            this.bgView.changeBgSource(bgImageSource,bgImageDownSource)
        }
    }

    clickItems(badge,index){
        AdMobClick(badge)
        mobClick('home-banner'+index);
        if(badge.name && badge.name === '915慢友节'){
            mobClick('home-banner-915');
        }
        if(isNotEmpty(badge)) {
            const {navigate} = this.props.navigation;
            if(badge.name && badge.name === '药师讲堂'){
                badge.isFromYaoShiClassRoom = true
            }
            homeAdviewClick(navigate,badge)
        }
    }

    renderImg(imageHeight){
        var imageViews=[];
        let images = safeArray(this.props.imagesData);
        let bgImageSource = require('../../img/banner_bj.png')
        let bgImageDownSource = null
        let swiperMarginT = isIphoneX()?114+22:114
        if(isAndroid()){
            swiperMarginT = AndroidBannerImageMarginT()
        }
        swiperMarginT = swiperMarginT*kScreenScaling

        for(let i=0;i<images.length;i++){
            let currentBg = safeObj(this.props.imagesData[i]).backgroundcolor
            if (safeArray(this.props.backGroundImagesData).length > 0 && currentBg) {
                this.props.backGroundImagesData.some((bgInfo)=>{
                    let has = bgInfo.backgroundcolor == currentBg
                    if (has) {
                        bgImageSource = {uri:bgInfo.img_url}
                    }
                    return has
                })
            }
            if (safeArray(this.props.backGroundDownImagesData).length > 0 && currentBg) {
                this.props.backGroundDownImagesData.some((bgInfo)=>{
                    let has = bgInfo.backgroundcolor == currentBg
                    if (has) {
                        bgImageDownSource = {uri:bgInfo.img_url}
                    }
                    return has
                })
            }
            imageViews.push(

                <View key={'banner'+i} style={{flex:1,justifyContent: 'center',overflow:'hidden'}}>
                    <YFWHomeBannerBgView bgImageSource={bgImageSource} bgImageDownSource={bgImageDownSource} ref={(e)=>this.bgView=e}></YFWHomeBannerBgView>
                    <TouchableOpacity activeOpacity={1}  style={{flex:1,marginTop:swiperMarginT}}  onPress={()=>this.clickItems(images[i],i)}>
                        <FastImage
                            style={{width:kScreenWidth,height:imageHeight}}
                            resizeMode={'contain'}
                            source={{uri:images[i].img_url}}
                            resizeMethod={'resize'}
                        />
                    </TouchableOpacity>
                </View>
            );
        }
        return imageViews;
    }
}
