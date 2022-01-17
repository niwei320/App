import React, { Component } from 'react';
import {
    Image,View
} from 'react-native';
import {
    kScreenWidth,
    kScreenScaling,
    isIphoneX,
    isNotEmpty,
    iphoneTopMargin, isAndroid, AndroidBannerImageMarginT
} from '../PublicModule/Util/YFWPublicFunction';
import FastImage from 'react-native-fast-image';

export default class YFWHomeBannerBgView extends Component {

    constructor(args){
        super(args)
    }

    render(){
        let bgImageH = isIphoneX()?(197+22):197
        bgImageH = bgImageH*kScreenScaling
        let tempH = 57*kScreenScaling

        if(isAndroid()){
            bgImageH = ((AndroidBannerImageMarginT() + 140)/254*197)*kScreenScaling
            tempH = ((AndroidBannerImageMarginT() + 140)/254*57)*kScreenScaling
        }
        return (
            <View style={{height:bgImageH+tempH,position:'absolute',top:0,left:0,width:kScreenWidth}}>
                {isNotEmpty(this.props.bgImageSource) &&<FastImage style={{height:bgImageH,width:kScreenWidth}}
                            resizeMode='stretch'
                            source={this.props.bgImageSource}
                            resizeMethod={'resize'}
                />}
                {isNotEmpty(this.props.bgImageDownSource)&&<FastImage style={{height:tempH,width:kScreenWidth,backgroundColor:'white'}}
                            resizeMode='stretch'
                            source={this.props.bgImageDownSource}
                            resizeMethod={'resize'}
                />}
            </View>
        )
    }
}
