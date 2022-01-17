import React, { Component } from 'react';
import {
    Image,
    View,
    Text,
    TouchableOpacity,
    Platform,
} from 'react-native';

import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {doAfterLogin, pushNavigation, doAfterLoginWithCallBack} from "../Utils/YFWJumpRouting";
import {isEmpty, kScreenWidth, mobClick, kScreenScaling, isNotEmpty, safeObj, safeNumber, AdMobClick} from "../PublicModule/Util/YFWPublicFunction";
import {
    getAuthUrl
} from "../Utils/YFWInitializeRequestFunction";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
import FastImage from 'react-native-fast-image';
/***主会场  */
export default class YFWHomeAdsMainView extends Component {


    static defaultProps = {
    }

    render() {
        let rowData = safeObj(this.props.Data)
        let imageW = safeNumber(rowData.img_width,1125) / 2
        let imageH = safeNumber(rowData.img_height,501) / 2
        imageH = imageH*kScreenWidth/imageW
        imageW = kScreenWidth
        return  (
            <View style={BaseStyles.item}>
                <TouchableOpacity activeOpacity={1} onPress={()=>{this.clickItems(rowData)}}>
                    {
                        Platform.OS == 'ios'?
                        <Image style={{width:imageW,height:imageH}} source={{uri:rowData.img_url}}></Image>
                        :
                        <FastImage style={{width:imageW,height:imageH}} source={{uri:rowData.img_url}}></FastImage>
                    }
                </TouchableOpacity>
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

