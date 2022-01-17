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

import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {doAfterLogin, pushNavigation, doAfterLoginWithCallBack} from "../Utils/YFWJumpRouting";
import {isEmpty, kScreenWidth, mobClick, kScreenScaling, isNotEmpty, safeArray, AdMobClick} from "../PublicModule/Util/YFWPublicFunction";
import {darkNomalColor,darkTextColor} from "../Utils/YFWColor";
import {
    getSignInData,
    SIGN_POINTS,
    TYPE_SIGN_COUPON,
    TYPE_SIGN_POINTS,
    getAuthUrl
} from "../Utils/YFWInitializeRequestFunction";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWTextMarqueeView from '../widget/YFWTextMarqueeView';
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
import FastImage from 'react-native-fast-image';
//定义一些全局的变量
var cols = 4;
var boxh = 80;
var boxw = (kScreenWidth - 13*kScreenScaling * 2) / cols;

export default class YFWHomeMenuView extends Component {


    static defaultProps = {
        badgeData:new Array(),
    }

    render() {
        let titleColor = darkNomalColor()
        if (this.props.bgData&&this.props.bgData.items&&safeArray(this.props.bgData.items).length > 0) {
            let info = this.props.bgData.items[0]
            if(isNotEmpty(info.backgroundcolor)) {
                titleColor = info.backgroundcolor
            }
            if (this.props.badgeData&&safeArray(this.props.badgeData).length > 0) {
                cols = parseInt(this.props.badgeData.length / 2) || 4
                boxw = parseInt((kScreenWidth - 13*kScreenScaling * 2) / cols)
            }
            return (
                <ImageBackground style={[styles.container,{flex:1},{paddingLeft:13*kScreenScaling,paddingRight:13*kScreenScaling}]} source={{uri:info.img_url}}>
                    {this.renderAllBadge(titleColor)}
                </ImageBackground>
            )
        }
        if (this.props.badgeData&&safeArray(this.props.badgeData).length > 0) {
            cols = parseInt(this.props.badgeData.length / 2) || 4
            boxw = parseInt(kScreenWidth / cols)
        }
        return (
            <View style={{backgroundColor:'white',flex:1}}>
                <View style={styles.container}>
                    {this.renderAllBadge(titleColor)}
                </View>
            </View>
        );
    }

    // 返回所有的包
    renderAllBadge(titleColor){

        var allBadge = [];

        let imageW = 52*kScreenWidth/375
        let imageH = 42*kScreenWidth/375
        let textSize = 12*kScreenWidth/375
        let menuaArray = safeArray(this.props.badgeData);
        for (let i=0;i<menuaArray.length;i++){

            let badge = menuaArray[i];
            let marginTop = i >= cols?19:8
            marginTop = marginTop*kScreenScaling
            allBadge.push(

                <TouchableOpacity activeOpacity={1} key={'menu'+i} style={[BaseStyles.centerItem,{width:boxw,height:imageH+2+textSize,marginTop:marginTop}]}  onPress={()=>this.clickItems(badge,i)}>
                    <FastImage style={{width:imageW,height:imageH}} source={{uri:badge.img_url}}/>
                    <Text style={{fontSize: textSize, color:titleColor,marginTop:2}}>{badge.name}</Text>
                </TouchableOpacity>

            );
        }

        // 返回数组
        return allBadge;
    }

    clickItems(badge,index){
        if (this.haveClicked) {
            return
        }
        AdMobClick(badge)
        mobClick('home-menu-'+(index+1))
        this.haveClicked = true
        setTimeout(() => {
            this.haveClicked = false
        }, 500);
        var needJumpRoute = true;
        this.needLogin = false
        if (badge.name == '商品分类'){
            mobClick('home-product-categories');
        } else if(badge.name == '附近药店'){
            mobClick('home-nearby drugstore');
        } else if(badge.name == '健康问答'){
            mobClick('home-health');
        } else if(badge.name.includes('签到')){
            mobClick('home-sign');
        } else if(badge.name == '男性'){
            mobClick('home-man');
        } else if(badge.name == '女性'){
            mobClick('home-women');
        } else if(badge.name == '老人'){
            mobClick('home-elder');
        } else if(badge.name == '儿童'){
            mobClick('home-children');
        } else if(badge.name == '批发'){
            mobClick('home-whole');
        } else if(badge.name == '915慢友节'){
            mobClick('home-menuicon-915');
        } else if(badge.name == '同病相廉'){
            mobClick('home-make-group');
        } else if(badge.name == '糖尿病'){
            mobClick('home-diabetes');
        } else if(badge.name == '高血压'){
            mobClick('home-high-blood-pressure');
        } else if(badge.name == '心脑血管'){
            mobClick('home-cardiovascular-diseases');
        } else if(badge.name == '男性健康'){
            mobClick('home-male-health');
        } else if(badge.name == '风湿骨科'){
            mobClick('home-rheumatic-orthopedics');
        } else if(badge.name == '新人专享'){
            mobClick('home-exclusive-for-new-people');
        } else if(badge.name == '药师讲堂'){
            mobClick('home-app-home-ysjt');
        } else if(badge.name == '领券中心'){
            mobClick('home-coupon-collection-center');
        } else if(badge.name == '商家入驻'){
            mobClick('home-app-store-join');
        }
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
                    this.dealJump(badge,navigate)
                })
            } else {
                this.dealJump(badge,navigate)
            }
        }
        if(!needJumpRoute){
            return
        }
        pushNavigation(navigate, badge);

    }

    dealJump(badge,navigate) {
        if (badge.name.includes("签到")) {
            getSignInData(navigate,TYPE_SIGN_POINTS);
        } else if(badge.name.includes('领券')){
            getSignInData(navigate,TYPE_SIGN_COUPON,badge.value);
            mobClick('home-couponcoupon-redemption-centre')
        } else {
            getAuthUrl(navigate,badge)
        }
        if (badge.name.includes('邀请')) {
            mobClick('home-invite-prizes')
        }
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
        paddingBottom:8*kScreenScaling
    },
    iconStyle:{
        width:52,
        height:42,
    },
    mainTitleStyle:{

    }
});
