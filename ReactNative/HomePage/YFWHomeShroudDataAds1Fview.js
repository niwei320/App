import React, {Component} from 'react';
import {
    Image,
    Platform,
    View,
    TouchableOpacity,
    ImageBackground
} from 'react-native';

import {pushNavigation,doAfterLogin} from "../Utils/YFWJumpRouting";
import {isNotEmpty, mobClick, safeObj, kScreenWidth, isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWHomeShroudView from './YFWHomeShroudView'
import {homeAdviewClick} from '../Utils/YFWInitializeRequestFunction'
export default class YFWHomeShroudDataAds1Fview extends Component {

    static defaultProps = {
        Data: new Array(),
    }

    render() {
        var img_url = '';
        if (isNotEmpty(this.props.Data) && this.props.Data.length > 0) {
            let imgData = this.props.Data[0];
            img_url = safeObj(imgData.img_url);

            let imgheight;
            let width = isNaN(parseInt(safeObj(imgData.img_width).replace('px', '')) / 2)?0:parseInt(safeObj(imgData.img_width).replace('px', '')) / 2;
            let height = isNaN(parseInt(safeObj(imgData.img_height).replace('px', '')) / 2)?0:parseInt(safeObj(imgData.img_height).replace('px', '')) / 2;
            if (width == 0 || isEmpty(width) || height == 0 || isEmpty(height)) {
                imgheight = Platform.isPad ? 190 : 120;
            } else {
                imgheight = height * kScreenWidth / width;
            }
            return (
                <View style={{flex:1,backgroundColor:'#FFFFFF',marginTop:10,height:imgheight}}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}}
                                      onPress={()=>this.clickItems(this.props.Data[0])}>
                        <ImageBackground style={{flex:1,flexDirection:'row',alignItems:'center',height:imgheight}} resizeMode={'stretch'}
                                         source={{uri:img_url}}>
                            <View style={{flex:1}}/>
                            <YFWHomeShroudView ShroudData={this.props.adsData} navigation = {this.props.navigation} size = {imgheight-10}/>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>

            );
        } else {

            return (<View style={{marginTop:10}}/>)

        }


    }

    clickItems(badge) {

        if (isNotEmpty(badge)) {
            const {navigate} = this.props.navigation;
            homeAdviewClick(navigate,badge)
        }
    }
}

