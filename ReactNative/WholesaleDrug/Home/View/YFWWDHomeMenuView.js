import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity,
    Platform,
    NativeModules,ImageBackground
} from 'react-native';

import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {isEmpty, kScreenWidth, mobClick, kScreenScaling, isNotEmpty, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";
import {darkNomalColor,darkTextColor} from "../../../Utils/YFWColor";
import {
    TYPE_SIGN_COUPON,
    TYPE_SIGN_POINTS,
    getWDSignInData,
    getWDAuthUrl, TYPE_SIGN_WD_COUPON
} from "../../../Utils/YFWInitializeRequestFunction";
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';
import { pushWDNavigation,doAfterLogin, kRoute_all_category, kRoute_account_qualifiiy, kRoute_apply_account, kRoute_probate_store, kRoute_all_supplier } from '../../YFWWDJumpRouting';
//定义一些全局的变量
var cols = 5;
var boxh = 80;
var boxw = (kScreenWidth-(2*15*kScreenScaling)) / cols;

export default class YFWWDHomeMenuView extends Component {


    static defaultProps = {
        badgeData:new Array(),
    }

    render() {
        let titleColor = darkNomalColor()
        if (this.props.bgData&&this.props.bgData.items&&this.props.bgData.items.length > 0) {
            let info = this.props.bgData.items[0]
            if(isNotEmpty(info.backgroundcolor)) {
                titleColor = info.backgroundcolor
            }
            return (
                <ImageBackground style={[styles.container,{flex:1}]} source={{uri:info.img_url}}>
                    {this.renderAllBadge(titleColor)}
                </ImageBackground>
            )
        }
        return (
            <View style={{flex:1}}>
                <View style={styles.container}>
                    {this.renderAllBadge(titleColor)}
                </View>
            </View>
        );
    }

    // 返回所有的包
    renderAllBadge(titleColor){

        var allBadge = [];

        let imageW = 44*kScreenWidth/375
        let imageH = 44*kScreenWidth/375
        let textSize = 12*kScreenWidth/375
        let menuaArray = this.props.badgeData;
        for (var i=0;i<menuaArray.length;i++){

            let badge = menuaArray[i];
            let marginTop = i>4?19:8
            marginTop = marginTop*kScreenScaling
            allBadge.push(

                <TouchableOpacity activeOpacity={1} key={'menu'+i} style={[BaseStyles.centerItem,{width:boxw,height:imageH+2+textSize,marginTop:marginTop}]}  onPress={()=>this.clickItems(badge)}>
                    <Image style={{width:imageW,height:imageH}} source={{uri:badge.img_url}}/>
                    <Text style={{fontSize: textSize, color:titleColor,marginTop:6}}>{badge.name}</Text>
                </TouchableOpacity>

            );
        }

        // 返回数组
        return allBadge;
    }

    dealPix(sizeInfo){
        return isNaN(parseInt(safeObj(sizeInfo).replace('px',''))/2)?0:parseInt(safeObj(sizeInfo).replace('px',''))/2;
    }

    clickItems(badge){
        if (this.haveClicked) {
            return
        }
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
            if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
                needJumpRoute = false
            }
            doAfterLogin(navigate,()=>{

                if (badge.name.includes("签到")) {
                    getWDSignInData(navigate,TYPE_SIGN_POINTS);
                    needJumpRoute = false;
                } else if(badge.name.includes('领券')){
                    getWDSignInData(navigate,TYPE_SIGN_WD_COUPON);
                    needJumpRoute = false;
                } else {
                    getWDAuthUrl(navigate,badge)
                    needJumpRoute = false;
                }
            })
        }
        if(!needJumpRoute){
            return
        }
        pushWDNavigation(navigate, badge);

    }


}



//设置样式
const styles = StyleSheet.create({
    container: {
        //    确定主轴的方向
        flexDirection:'row',
        //    一行显示不完的话换行显示
        flexWrap:'wrap',
        //    换行以后
        paddingBottom:8*kScreenScaling,
        paddingHorizontal:15*kScreenScaling,
    },
    iconStyle:{
        width:52,
        height:42,
    },
    mainTitleStyle:{

    }
});
