import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    Text,
    View,
    ImageBackground,
    TouchableOpacity
} from 'react-native';
import {separatorColor} from "../Utils/YFWColor";
import {pushNavigation,doAfterLogin} from "../Utils/YFWJumpRouting";
import {safeObj,isEmpty,isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";

import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import {homeAdviewClick} from '../Utils/YFWInitializeRequestFunction'

var Dimensions = require('Dimensions');
var KScreenWidth = Dimensions.get('window').width;

export default class YFWHomeRecommend1View extends Component {

    static defaultProps = {
        Data:undefined,
    }

    render() {

        var imgheight;
        var dataBase = this.props.Data.items;

        var imgPath = '';
        if (this.props.Data.style === 'ads_3F_1'){
            imgPath = require('../../img/hometle_01.png');
        }else if(this.props.Data.style === 'ads_4F_1'){
            imgPath = require('../../img/hometle_02.png');
        }else if(this.props.Data.style === 'ads_5F_1'){
            imgPath = require('../../img/hometle_03.png');
        }else {
            imgPath = require('../../img/hometle_04.png');
        }

        return (
            <View style={{flex:1 }}>
                <ImageBackground style={[styles.topStyle]} source={imgPath} resizeMode={'stretch'}>
                    <Text style={{color:'white',fontSize:16,fontWeight:'500'}} >{this.props.Data.name}</Text>
                </ImageBackground>
                <View  style={[styles.viewStyle ]}>
                    {this.renderImg()}
                </View>
                <View style={{flex:1 ,backgroundColor: separatorColor(),height:0.5}}/>
            </View>

        );

    }

    renderImg(){
        var imageViews=[];
        let images = safeObj(this.props.Data.items);
        for(let i=0;i<images.length;i++){
            let imgData = images[i];
            let imgheight = imgData.img_height * KScreenWidth/2 / imgData.img_width;

            if (i !== images.length){

                imageViews.push(
                    <TouchableOpacity activeOpacity={1} key={'recT1'+i}  style={{flex:1}}  onPress={()=>this.clickItems(imgData)}>
                        <Image style={[styles.imgStyle ]}
                               height={imgheight+10}
                               key={'rec1'+i}
                               source={{uri:imgData.img_url}}/>
                    </TouchableOpacity>
                );

                if (i !== images.length){

                    imageViews.push(
                        <View key={'sep1'+i} style={{backgroundColor: separatorColor(),width:0.5,height:imgheight+20}}/>
                    );
                }


            }
        }

        return imageViews;
    }


    clickItems(badge){
        if(isNotEmpty(badge)){
            const { navigate } = this.props.navigation;
            homeAdviewClick(navigate,badge)
        }
    }
}

var styles = StyleSheet.create({
    topStyle: {
        // 背景色
        backgroundColor:'gray',
        width:KScreenWidth,
        alignItems:'center',
        justifyContent: 'center',
        height:45,
    },
    viewStyle: {
        // 背景色
        flex:1,
        flexDirection:'row',
        backgroundColor:'white',
        alignItems: 'center',
    },
    imgStyle:{
        flex:1,
        width:KScreenWidth/2,
        resizeMode:'contain',

    },
    textStyle:{
        textAlign:'center',
        color:'white',
        justifyContent: 'center',
        height:20,
    },
});