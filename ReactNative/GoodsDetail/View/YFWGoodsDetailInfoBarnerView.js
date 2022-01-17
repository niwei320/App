import React, {Component} from 'react';
import {
    Image,
    TouchableOpacity,
    View,
    Platform,
    Text,
    NativeModules, DeviceEventEmitter
} from 'react-native';
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import {
    safeObj,
    kScreenWidth,
    convertImg,
    isEmpty, safe, isNotEmpty, getStatusBarHeight
} from "../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";

var Swiper = require('react-native-swiper');


export default class YFWGoodsDetailInfoBarnerView extends Component {

    static defaultProps = {
        imagesData:new Array(),
    }

    constructor(props) {
        super(props);
        this.currentIndex=0
        this.state = {
            hidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
            showed:false,//头一次加载会概率出现从最后一张切为第一张图片的问题
        }
        this.extraH = getStatusBarHeight()+50
        this.imagePaddingBottom = 10
    }

    componentDidMount() {
        this.priceListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            this.setState({
                hidePrice: isHide
            })
        })
    }

    componentWillUnmount() {
        this.priceListener&&this.priceListener.remove()
    }

    componentDidUpdate(){
        if(Platform.OS == "ios"){
            if (!this.state.showed&&this.props.imagesData.length>0) {
                setTimeout(() => {
                    this.setState({showed:true})
                }, 600);
            }
        }
    }


    render() {
        let isShowGoodSellPrice = false    //不显示多件装优惠组件renderSellView，原判断条件参数在modal中同步删除，详见#16336 后续可能做活动效果使用暂时保留。
        //如果数据源没有的时候返回了Swiper，接下来即使有数据内部也不会改变Index，Github官方已发现这个bug
        if(this.props.imagesData.length<=0){
            return(
                <View style={{height:240 + this.extraH}} />
            )
        }

        if(Platform.OS == 'ios'){
            let extraMargin = isShowGoodSellPrice?5:0
            return (
                <View>
                    <Swiper height={240 + this.extraH}
                            autoplay={false}
                            renderPagination={(index,total,swiper)=>{
                                if(isShowGoodSellPrice && index === 0){
                                    return <View/>
                                }
                                return (<View style={{paddingHorizontal:8,backgroundColor:'#000',right:13,bottom:12,position:'absolute',opacity:0.2,borderRadius:9,height:18}}>
                                    <Text style={{color:'white',fontSize:15,fontWeight:'bold'}}>{(++index)+'/'+total}</Text>
                                </View>)
                            }}
                            onIndexChanged={(index)=>{
                                this.currentIndex = index
                            }}>
                        {this.renderImg()}
                    </Swiper>
                    <Image ref={(e)=>this.placeholderImage=e} style={{position:'absolute',width:this.state.showed? 0:(kScreenWidth-10),backgroundColor:'transparent',top:this.extraH+extraMargin,left:5,right:5,height:240 - this.imagePaddingBottom - extraMargin*2, resizeMode:'contain' }}
                        source={{uri:convertImg(this.props.imagesData[0])}}></Image>
                    {!this.state.showed&&isShowGoodSellPrice&&this.renderSellView()}
                </View>
            );
        } else {
            return (
                <Swiper height={240}
                        autoplay={false}
                        renderPagination={(index,total,swiper)=>{
                            if(isShowGoodSellPrice && index === 0){
                                return <View/>
                            }
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
        let isShowGoodSellPrice = false    //不显示多件装优惠组件renderSellView，原判断条件参数在modal中同步删除，详见#16336 后续可能做活动效果使用暂时保留。
        for(let i=0;i < safeObj(this.props.imagesData).length;i++){
            let imageUrl = convertImg(this.props.imagesData[i])
            images[i] = imageUrl
            imageViews.push(
                <>
                    <TouchableOpacity
                        activeOpacity = {1}
                        key = {'banner' + i}
                        style = {{
                            flex: 1,
                            width: kScreenWidth,
                            justifyContent: 'center',
                            marginTop: getStatusBarHeight(),
                            paddingTop: 50,
                            paddingBottom:this.imagePaddingBottom,
                            borderWidth:isShowGoodSellPrice&&(i === 0)? 5 : 0,
                            borderColor: 'rgb(239, 61, 65)'
                        }}
                        onPress = {() => {
                            this._preview(images)
                        }}
                    >
                        <Image
                            style = {{flex: 1, resizeMode: 'contain', backgroundColor: 'white'}}
                            resizeMethod = {'resize'}
                            source = {{uri: imageUrl}}
                        />
                    </TouchableOpacity>
                    {isShowGoodSellPrice&&(i === 0) ?
                        this.renderSellView()
                        :<></>}
                </>
            );
        }
        return imageViews;
    }

    _preview(images){
        let {navigate} = this.props.getNavigation()
        pushNavigation(navigate,{type:'big_picture',value:{imgs:images,index:this.currentIndex}})
    }

    renderSellView() {
        let discount = safe(this.props.packageDesc) //#16336 字段已不在model中
        let price = safe(this.props.packageUnitPrice) //#16336 字段已不在model中
        return (
            <View style={{position:'absolute', bottom:0, width:kScreenWidth, height: 55, flexDirection:'row', alignItems:'flex-end'}}>
                <View style={{flex:1,paddingHorizontal:22,height:36, justifyContent:'center', backgroundColor: 'rgb(31,219,155)'}}>
                    <Text style={{fontSize:20,color: "#ffffff",fontWeight:'bold'}}>{discount}</Text>
                </View>
                <View>
                    <View style={{position: 'absolute', bottom: 0, width: 29, height: 36, backgroundColor: 'rgb(31,219,155)'}} />
                    <Image source={require('../../../img/goods_detail_sell_banner.png')}
                           style={{resizeMode: 'stretch', height: 55, width: 29}}
                    />
                </View>
                <View
                    style={{justifyContent:'center',alignItems:'center', height:55, resizeMode: 'stretch'}}
                >
                    <Image source={require('../../../img/goods_detail_sell_banner_bg.png')}
                           style={{position: 'absolute', bottom: 0,resizeMode: 'stretch', height: 55, width: '100%'}}
                    />
                    <View>
                        <Text style={{color:"#ffffff",fontSize:12}}>单件到手</Text>
                    </View>
                    <View style={[BaseStyles.leftCenterView,{flexWrap:'nowrap', paddingRight:9},this.props.style_view]}>
                        <Text style={{color: "#ffffff",includeFontPadding:false,fontSize:16,fontWeight:'bold',marginBottom:-5}}>¥</Text>
                        <Text style={{color: "#ffffff",includeFontPadding:false,fontSize:32,fontWeight:'bold'}}>{price.split('.')[0]}</Text>
                        <Text style={{color: "#ffffff",includeFontPadding:false,fontSize:24,fontWeight:'bold',marginBottom:-2.5}}>{'.'+price.split('.')[1]}</Text>
                    </View>
                </View>
            </View>
        )
    }

}

