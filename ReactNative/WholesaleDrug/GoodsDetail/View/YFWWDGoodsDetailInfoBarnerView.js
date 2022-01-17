import React, {Component} from 'react';
import {Dimensions, Image, TouchableOpacity, View, Platform,Text} from 'react-native';
import {safeObj, kScreenWidth, convertImg} from "../../../PublicModule/Util/YFWPublicFunction";
import { pushWDNavigation, kRoute_big_picture } from '../../YFWWDJumpRouting';

var Swiper = require('react-native-swiper');


export default class YFWWDGoodsDetailInfoBarnerView extends Component {

    static defaultProps = {
        imagesData:new Array(),
    }

    constructor(props) {
        super(props);
        this.currentIndex=0
        //头一次加载会概率出现从最后一张切为第一张图片的问题
        this.showed=false
    }

    componentDidUpdate(){
        if(Platform.OS == "ios"){
            if (!this.showed&&this.props.imagesData.length>0) {
                this.showed = true
                setTimeout(() => {
                    if (this.placeholderImage) {
                        this.placeholderImage.setNativeProps({
                            style:{width:0,height:0}
                        })
                    }
                }, 600);
            }
        }
    }
    componentWillReceiveProps(){
        if(Platform.OS == "ios"){
            this.showed = false
            if (this.placeholderImage) {
                this.placeholderImage.setNativeProps({
                    style:{position:'absolute',width:kScreenWidth,top:0,left:0 , resizeMode:'contain' , backgroundColor:'white'}
                })
            }
        }
    }


    render() {
        //如果数据源没有的时候返回了Swiper，接下来即使有数据内部也不会改变Index，Github官方已发现这个bug
        if(this.props.imagesData.length<=0){
            return(
                <View style={{height:240}} />
            )
        }
        if(Platform.OS == 'ios'){
            return (
                <View>
                    <Swiper height={240}
                            autoplay={false}
                            renderPagination={(index,total,swiper)=>{
                                return (<View style={{paddingHorizontal:8,backgroundColor:'#000',right:13,bottom:12,position:'absolute',opacity:0.2,borderRadius:9,height:18}}>
                                    <Text style={{color:'white',fontSize:15,fontWeight:'bold'}}>{(++index)+'/'+total}</Text>
                                </View>)
                            }}
                            onIndexChanged={(index)=>{
                                this.currentIndex = index
                            }}>
                        {this.renderImg()}
                    </Swiper>
                    <Image ref={(e)=>this.placeholderImage=e} style={{position:'absolute',width:kScreenWidth,top:0,left:0 ,height:240, resizeMode:'contain' , backgroundColor:'white'}}
                           source={{uri:convertImg(this.props.imagesData[0])}}></Image>
                </View>
            );
        } else {
            return (
                <Swiper height={240}
                        autoplay={false}
                        renderPagination={(index,total,swiper)=>{
                            return (<View >
                                <Text style={{paddingHorizontal:8,right:13,bottom:12,position:'absolute',opacity:0.2,borderRadius:9,height:18,color:'white',fontSize:15,backgroundColor:'#000',fontWeight:'bold',includeFontPadding:false}}>{(++index)+'/'+total}</Text>
                            </View>)
                        }}
                        onIndexChanged={(index)=>{
                            this.currentIndex = index
                        }}>
                    {this.renderImg()}
                </Swiper>
            )
        }
    }


    renderImg(){
        var imageViews=[];
        let images = []
        for(let i=0;i < safeObj(this.props.imagesData).length;i++){
            let imageUrl = convertImg(this.props.imagesData[i])
            images[i] = imageUrl
            imageViews.push(
            <TouchableOpacity activeOpacity={1} key={'banner'+i} style={{flex:1,width:kScreenWidth,justifyContent: 'center',backgroundColor:'white'}} onPress={()=>{this._preview(images)}}>
                <Image
                    style={{flex:1 , resizeMode:'contain' , backgroundColor:'white'}}
                    source={{uri:imageUrl}}
                />
            </TouchableOpacity>



            );
        }
        return imageViews;
    }

    _preview(images){
        let {navigate} = this.props.getNavigation()
        pushWDNavigation(navigate,{type:kRoute_big_picture,value:{imgs:images,index:this.currentIndex}})
    }
}

