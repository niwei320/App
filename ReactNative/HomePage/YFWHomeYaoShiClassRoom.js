import React,{Component} from 'react'
import {View,Text,TouchableOpacity,Image,ImageBackground} from 'react-native'
import YFWTextMarqueeView from '../widget/YFWTextMarqueeView';
import { pushNavigation } from '../Utils/YFWJumpRouting';
import { kScreenScaling, isNotEmpty } from '../PublicModule/Util/YFWPublicFunction';

export default class YFWHomeYaoShiClassRoom extends Component {
    constructor(args){
        super(args)
        this.moreInfo = null
    }

    static defaultProps= {
        Data:[]
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.Data) {
            nextProps.Data.map((item)=>{
                if (item.name == '药师讲堂') {
                    this.moreInfo = item
                }
            })
        }
    }

    render() {

        let texts = []
        this.props.Data.map((item)=>{
            if (item.name != '药师讲堂') {
                texts.push(item.name)
            }
        })
        if (isNotEmpty(this.props.bgImage)) {
            this.props.bgImage.img_url = this.props.bgImage.img_url.replace('https', 'http')

            return (
                <View style={{flex:1,backgroundColor:'white'}}>
                    <ImageBackground source={{uri:this.props.bgImage.img_url}} style={{height:(57+26)*kScreenScaling,paddingTop:26*kScreenScaling}}>
                        <View style={{backgroundColor:'white',marginHorizontal:13,height:42,borderRadius:21,flexDirection:'row',alignItems:'center',justifyContent:'center'}} source={require('../../img/jiangtang_bj.png')} imageStyle={{resizeMode:'stretch'}}>
                            <Image style={{width:84,height:25,marginLeft:10,bottom:-2}} source={require('../../img/jiangtang.png')}></Image>
                            <YFWTextMarqueeView bgViewStyle={{flex:1}} textStyle={{marginLeft:15,fontSize:13,color:'#333'}} textsArray={texts} callBack={(index)=>this.clickedAction(index)}></YFWTextMarqueeView>
                            <View style={{width:1,height:19,marginLeft:3,backgroundColor:'#999',borderRadius:1}}/>
                            <TouchableOpacity hitSlop={{left:0,top:12,bottom:12,right:0}} style={{paddingLeft:17,paddingRight:10,flexDirection:'row',alignItems:'center'}} touchableOpacity={1} onPress={()=>this.showMoreAction()}>
                                <Text style={{fontSize:12,color:'#333'}}>更多</Text>
                                <Image style={{width:6,height:10,marginLeft:3}} source={require('../../img/icon_arrow_gray.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>
                    <View style={{height:11,backgroundColor:'#ccc',opacity:0.1}}></View>
                </View>
            )
        }

        return (
            <View style={{flex:1,backgroundColor:'white'}}>
                <View style={{height:(57+26)*kScreenScaling,paddingTop:26*kScreenScaling}}>
                    <ImageBackground style={{marginHorizontal:13,height:42,borderRadius:21,flexDirection:'row',alignItems:'center',justifyContent:'center'}} source={require('../../img/jiangtang_bj.png')} imageStyle={{resizeMode:'stretch'}}>
                        <Image style={{width:84,height:25,marginLeft:10,bottom:-2}} source={require('../../img/jiangtang.png')}></Image>
                        <YFWTextMarqueeView bgViewStyle={{flex:1}} textStyle={{marginLeft:15,fontSize:13,color:'#333'}} textsArray={texts} callBack={(index)=>this.clickedAction(index)}></YFWTextMarqueeView>
                        <View style={{width:1,height:19,marginLeft:3,backgroundColor:'#999',borderRadius:1}}/>
                        <TouchableOpacity hitSlop={{left:0,top:12,bottom:12,right:0}} style={{paddingLeft:17,paddingRight:10,flexDirection:'row',alignItems:'center'}} touchableOpacity={1} onPress={()=>this.showMoreAction()}>
                            <Text style={{fontSize:12,color:'#333'}}>更多</Text>
                            <Image style={{width:6,height:10,marginLeft:3}} source={require('../../img/icon_arrow_gray.png')}></Image>
                        </TouchableOpacity>
                    </ImageBackground>
                </View>
                <View style={{height:11,backgroundColor:'#ccc',opacity:0.1}}></View>
            </View>
        )
    }

    showMoreAction(){
        if (this.moreInfo) {
            const {navigate} = this.props.navigation
            let info = this.moreInfo
            info.isFromYaoShiClassRoom = true
            pushNavigation(navigate,info)
        }
    }

    clickedAction(index){
        let info = this.props.Data[index]
        info.isFromYaoShiClassRoom = true
        const {navigate} = this.props.navigation
        pushNavigation(navigate,info)
    }

}