import React, { Component } from 'react';
import {
    Image,
    Platform,
    View,
    TouchableOpacity, StyleSheet
} from 'react-native';
import {mobClick, safeObj,isEmpty, isIphoneX,isNotEmpty, kScreenWidth, kScreenScaling} from "../../../PublicModule/Util/YFWPublicFunction";
var Swiper = require('react-native-swiper');
import {homeAdviewClick, wdHomeAdviewClick} from "../../../Utils/YFWInitializeRequestFunction";


export default class YFWWDHomeBannerView extends Component {


    constructor(args){
        super(args)
        this.state = {
            index:0
        }
    }

    static defaultProps = {
        imagesData:new Array(),
        backGroundImagesData:[],
        backGroundDownImagesData:[]
    }


    componentDidMount(){
        this.props.backGroundImagesData.map((item)=>{
            item.img_url = item.img_url.replace('https', 'http')
            Image.prefetch(item.img_url)
        })
        this.props.backGroundDownImagesData.map((item)=>{
            item.img_url = item.img_url.replace('https', 'http')
            Image.prefetch(item.img_url)
        })
    }

    render() {

        let swiperH = Platform.isPad?200:110*kScreenWidth/375
        let swiperMarginT = isIphoneX()?114+22:114
        swiperMarginT = swiperMarginT*kScreenScaling
        if (this._getIsWDStyle()) {
            swiperMarginT = 16*kScreenScaling
        }
        let allViewH = swiperMarginT + swiperH
        return (
            <View style={{height:allViewH}}>
                <Swiper style={{marginTop:0}} width={kScreenWidth} height={swiperH+swiperMarginT} autoplay={true} toplayTimeout={3}
                    dot={<View style={[{width:3,height:3,borderRadius:1.5,marginHorizontal:3,marginBottom:0},{backgroundColor:'rgba(255,255,255,0.5)'}]}/>}
                    activeDot={
                                <View style={[{width:9,height:3,borderRadius:1.5,marginHorizontal:3,marginBottom:0},{backgroundColor:'white'}]}/>
                            }>
                {this.renderImg(swiperH)}
                </Swiper>
            </View>
        );
    }
    _getIsWDStyle() {
        return this.props.from&&this.props.from == 'home_wd'
    }

    clickItems(badge,index){
        mobClick('home-banner'+index);
        if(isNotEmpty(badge)) {
            const {navigate} = this.props.navigation;
            wdHomeAdviewClick(navigate,badge)
        }
    }

    renderImg(imageHeight){
        var imageViews=[];
        let images = safeObj(this.props.imagesData);
        let swiperMarginT = isIphoneX()?114+22:114
        swiperMarginT = swiperMarginT*kScreenScaling
        if (this._getIsWDStyle()) {
            swiperMarginT = 16*kScreenScaling
        }

        for(let i=0;i<images.length;i++){
            images[i].img_url = images[i].img_url.replace('https', 'http')
            imageViews.push(

                <View key={'banner'+i} style={{flex:1,justifyContent: 'center',alignItems:'center',overflow:'hidden'}}>
                    <TouchableOpacity activeOpacity={1}  style={{flex:1,marginTop:swiperMarginT}}  onPress={()=>this.clickItems(images[i],i)}>
                        <Image
                            style={{width:kScreenWidth - 20*kScreenScaling,height:imageHeight,resizeMode:'contain'}}
                            source={{uri:images[i].img_url}}
                        />
                    </TouchableOpacity>
                </View>
            );
        }
        return imageViews;
    }
}