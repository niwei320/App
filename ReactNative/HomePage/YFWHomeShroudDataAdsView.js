import React from 'react'
import {
    View,
    Platform,
    Image,
    TouchableOpacity,
    PixelRatio,StyleSheet
} from 'react-native'

import {
    isNotEmpty,
    safeObj,
    safe,
    kScreenWidth,
    isEmpty,
    max,
    mobClick,
    safeArray,
    AdMobClick
} from "../PublicModule/Util/YFWPublicFunction";
import {homeAdviewClick} from '../Utils/YFWInitializeRequestFunction'
import FastImage from 'react-native-fast-image';
const px2dp = px=>PixelRatio.roundToNearestPixel(px);
export default class YFWHomeShroudDataAdsView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        if(isNotEmpty(this.props.Data)&&safeArray(this.props.Data).length >= 3){
            let data_one = safeObj(this.props.Data[0]);
            let data_two = safeObj(this.props.Data[1]);
            let data_three = safeObj(this.props.Data[2]);

            let imgheight_one;
            let width_one = this._dealNumber(data_one.img_width);
            let width_two = this._dealNumber(data_two.img_width);
            let height_one = this._dealNumber(data_one.img_height);
            let height_two = this._dealNumber(data_two.img_height);
            let height_three = this._dealNumber(data_three.img_height);

            if (width_one == 0 || isEmpty(width_one) || width_two == 0 || isEmpty(width_two)|| height_one == 0 || isEmpty(height_one)) {
                imgheight_one = Platform.isPad ? 190 : 120;
            } else {
                imgheight_one = max(height_one,(height_two+height_three)) * kScreenWidth / (width_one+width_two);
            }
            return (
                <View style={{width:kScreenWidth,height:imgheight_one,flexDirection:'row'}}>
                    <TouchableOpacity onPress = {()=>this._onShroundItemClick(data_one)} style={{width:imgheight_one,height:imgheight_one}} activeOpacity={1}>
                        <FastImage style={[styles.imageView,{width:imgheight_one}]} resizeMode='stretch' source={{uri:safeObj(safeObj(data_one).img_url)}}/>
                    </TouchableOpacity>
                    <View style={{flex:1,height:imgheight_one}}>
                        <TouchableOpacity onPress = {()=>this._onShroundItemClick(data_two)} style={{flex:1}} activeOpacity={1}>
                            <FastImage style={styles.imageView} resizeMode='stretch' source={{uri:safeObj(safeObj(data_two).img_url)}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress = {()=>this._onShroundItemClick(data_three)} style={{flex:1}} activeOpacity={1}>
                            <FastImage style={styles.imageView} resizeMode='stretch' source={{uri:safeObj(safeObj(data_three).img_url)}}/>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }else {
            return (<View/>)
        }

    }

    _dealNumber(numStr) {
        let num = parseInt(safe(numStr).replace('px',''))
        return isNaN(num) ? 0: num /2
    }

    _onShroundItemClick(badge){
        AdMobClick(badge)
        if(isNotEmpty(safeObj(safeObj(badge)).type)){
            const {navigate} = this.props.navigation;
            switch (safeObj(safeObj(badge).name)) {
                case '限时购':
                    mobClick('home-channel-time-limit-sales');
                    break;
                case '新上药店':
                    mobClick('home-channel-new-store');
                    break;
                case '热搜排行榜':
                    mobClick('home-channel-ranking-list');
                    break;
            }
            homeAdviewClick(navigate,badge)
        }
    }
}

const styles = StyleSheet.create({
    imageView:{
        flex:1,
    }
})
