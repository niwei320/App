import React, { Component } from 'react';
import {
    Image,
    View,
    Text,
    TouchableOpacity,
    NativeModules,ImageBackground
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {doAfterLogin, pushNavigation, doAfterLoginWithCallBack} from "../Utils/YFWJumpRouting";
import {isEmpty, kScreenWidth, mobClick, kScreenScaling, isNotEmpty, safeNumber, safeObj, safeArray, AdMobClick} from "../PublicModule/Util/YFWPublicFunction";
import {
    getAuthUrl
} from "../Utils/YFWInitializeRequestFunction";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
import FastImage from 'react-native-fast-image';
/***分会场  */
export default class YFWHomeAdsSubView extends Component {


    static defaultProps = {
    }

    render() {
        let rowData = safeObj(this.props.Data)
        let imageW = safeNumber(rowData.img_width,1125) / 2
        let imageH = safeNumber(rowData.img_height,374) / 2
        imageH = imageH*kScreenWidth/imageW
        imageW = kScreenWidth
        let count = safeArray(rowData.items).length
        return  (
            <View style={BaseStyles.item}>
                <ImageBackground style={{width:imageW,height:imageH,flexDirection:'row',justifyContent:'center',paddingHorizontal:6*kScreenScaling,}} source={{uri:rowData.bgImage}}>
                    {rowData.items&&rowData.items.map((item,index)=>{
                        let imageW = safeNumber(item.img_width,309) / 2
                        let imageH = safeNumber(item.img_height,327) / 2
                        let maxW = (kScreenWidth - 13 * kScreenScaling * 2 - 6 * kScreenScaling * (count - 1 + 4)) / count
                        imageH = imageH * maxW / imageW
                        imageW = maxW
                        return (
                            <TouchableOpacity activeOpacity={1} onPress={()=>{this.clickItems(item)}}>
                                <FastImage style={{width:imageW,height:imageH,marginLeft:index != 0 ?6*kScreenScaling:0}} source={{uri:item.img_url}}></FastImage>
                            </TouchableOpacity>
                        )
                    })}
                </ImageBackground>
            </View>
        )
    }

    
    clickItems(badge){
        if (isEmpty(badge) || this.haveClicked) {
            return
        }
        AdMobClick(badge)
        this.haveClicked = true
        setTimeout(() => {
            this.haveClicked = false
        }, 500);
        var needJumpRoute = true;
        this.needLogin = false
        const {navigate} = this.props.navigation;
        if(badge.type == 'get_h5'){
            if(badge.is_login == '1'){
                this.needLogin = true
            }
        }

        if(this.needLogin){
            needJumpRoute = false
            if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
                doAfterLoginWithCallBack(navigate,()=>{
                    getAuthUrl(navigate,badge)
                })
            } else {
                getAuthUrl(navigate,badge)
            }
        }
        if(!needJumpRoute){
            return
        }
        pushNavigation(navigate, badge);
    }


}