import React from 'react'
import {
    Image,
    TouchableOpacity,
    View,
    Text
} from 'react-native'
import {
    imageJoinURL,
    iphoneBottomMargin,
    iphoneTopMargin,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth, tcpImage, isIphoneX
} from "../PublicModule/Util/YFWPublicFunction";
import {darkLightColor,orangeColor} from "../Utils/YFWColor";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import ImageViewer from 'react-native-image-zoom-viewer';

/**
 * 查看大图
 */
export default class BigPictureVC extends React.Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null,
    });

    constructor(props) {
        super(props)
        this.imgs = this.props.navigation.state.params.state.value.imgs
        this.currentIndex = this.props.navigation.state.params.state.value.index
        this.count = this.imgs.length
        this.notShowTip = this.props.navigation.state.params.state.value.notShowTip
    }

    render() {
        const images = []
        for (let i = 0; i < this.imgs.length; i++) {
            images.push({url:imageJoinURL(this.imgs[i])})
        }
        return (
            <View style={{width:kScreenWidth,height:kScreenHeight,backgroundColor:'white'}}>
                <ImageViewer
                    style={{width:kScreenWidth,height:kScreenHeight}}
                    imageUrls={images}
                    index={this.currentIndex}
                    backgroundColor={'white'}
                    saveToLocalByLongPress={false}
                    renderIndicator={()=>{return null}}
                    onChange={(index)=>{
                        this.currentIndex = index
                        this.setState({})
                    }}
                    onClick={()=>{
                        let {goBack} = this.props.navigation
                        goBack()
                    }}
                />
                {this.notShowTip?null:<View style={{flexDirection:'row',position:'absolute',bottom:isIphoneX()?44:0,backgroundColor:'#faf8dc',padding:10}}>
                    <Text style={{fontSize:12,color:orangeColor(),flex:1,textAlign: 'center'}}>注意：商品包装因厂家更换频繁，如有不符请以实物为准！</Text>
                </View>}
                <View style={[BaseStyles.centerItem,
                    {position:'absolute',right:10,bottom:50+iphoneBottomMargin() ,width:50,height:50,borderRadius:25,backgroundColor:darkLightColor()}]}>
                    <Text style={{fontSize:12,color:'white'}}>{this.currentIndex+1+'/'+this.count}</Text>
                </View>
                <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:10,top:iphoneTopMargin()}} onPress={this._picClick}>
                    <Image source={require('../../img/top_back_green.png')} style={{width:20,height:20,resizeMode: 'contain',}}/>
                </TouchableOpacity>
            </View>
        )
    }

    _picClick=()=>{
        let {goBack} = this.props.navigation
        goBack()
    }
}
