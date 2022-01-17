import React, { Component } from 'react';
import {
    Image,
    Platform,
    View,
    TouchableOpacity
} from 'react-native';

import {pushNavigation,doAfterLogin} from "../Utils/YFWJumpRouting";
import {isNotEmpty, mobClick, safe,kScreenWidth,isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'

import {homeAdviewClick} from "../Utils/YFWInitializeRequestFunction";

export default class YFWHomeAdvertHeaderView extends Component {

    static defaultProps = {
        Data:new Array(),
    }

    render() {
        var img_url = '';
        if (this.props.Data.length > 0){
            let imgData = this.props.Data[0];
            img_url = safe(imgData.img_url);

            let imgheight;
            let width = imgData.img_width;
            let height = imgData.img_height;
            if (width == 0 || isEmpty(width) || height == 0 || isEmpty(height)){
                imgheight = Platform.isPad ? 140 : 90;
            } else {
                imgheight = height * kScreenWidth / width;
            }
            if (this.props.style === 'qualification'){
                return (
                    <View style={{marginTop:10,height:imgheight,width:kScreenWidth}}>
                        <TouchableOpacity activeOpacity={1}  style={{flex:1}}  onPress={()=>this.clickItems(this.props.Data[0])}>
                            <Image style={{flex:1}} resizeMode={'contain'}
                                   height={imgheight}
                                   source={{uri:img_url}}/>
                        </TouchableOpacity>

                    </View>

                );
            }else {
                return (
                    <View style={{flex:1,backgroundColor:'white',marginTop:10,height:imgheight+10}}>
                        <TouchableOpacity activeOpacity={1}  style={{flex:1}}  onPress={()=>this.clickItems(this.props.Data[0])}>
                            <Image style={{flex:1}} resizeMode={'stretch'}
                                   height={imgheight}
                                   source={{uri:img_url}}/>
                        </TouchableOpacity>

                    </View>

                );
            }


        } else {

            return (<View style={{marginTop:10}}/>)

        }


    }

    clickItems(badge){

        if (isNotEmpty(badge)){
            if (badge.name == '新客专享'){
                mobClick('home-new user');
            } else if(badge.name == '药师讲堂'){
                mobClick('home-f1-lesson');
            }
            const { navigate } = this.props.navigation;
            homeAdviewClick(navigate,badge)
        }

    }

}

