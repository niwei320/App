import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    TouchableOpacity
} from 'react-native';
import {separatorColor} from "../Utils/YFWColor";
import {pushNavigation,doAfterLogin} from "../Utils/YFWJumpRouting";
import {isNotEmpty,safeObj,isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {homeAdviewClick} from '../Utils/YFWInitializeRequestFunction'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
var Dimensions = require('Dimensions');
var KScreenWidth = Dimensions.get('window').width;

export default class YFWHomeRecommend2View extends Component {

    static defaultProps = {
        Data:new Array(),
    }

    render() {
        let data = safeObj(this.props.Data);
        var img_url = '';
        if (data.length > 0){
            img_url = data[0].img_url;
        }
        return (
            <View style={[styles.viewStyle ]}>
                {this.renderImg()}
            </View>

        );
    }

    renderImg(){
        var imageViews=[];
        let images = safeObj(this.props.Data) ;
        for(let i=0;i<images.length;i++){
            let imgData = images[i];
            let imgheight = imgData.img_height * KScreenWidth/4 / imgData.img_width;

            if (i !== images.length){

                imageViews.push(
                    <TouchableOpacity activeOpacity={1} key={'recT2'+i}  style={{flex:1}}  onPress={()=>this.clickItems(imgData)}>
                        <Image style={[styles.imgStyle ]}
                               height={imgheight}
                               key={'rec2'+i}
                               source={{uri:imgData.img_url}}/>
                    </TouchableOpacity>
                );

                if (i !== images.length){

                    imageViews.push(
                        <View key={'sep2'+i} style={{backgroundColor: separatorColor(),width:0.5,height:imgheight}}/>
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

    viewStyle: {
        // 背景色
        flex:1,
        flexDirection:'row',
        backgroundColor:'white',
        alignItems: 'center',
    },
    imgStyle:{
        flex:1,
        width:KScreenWidth/4,
        resizeMode:'contain',

    },
});