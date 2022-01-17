import React from 'react'
import {
    View,
    Dimensions,
    Modal,
    Image,
    TouchableOpacity,
    Text,
    ScrollView, DeviceEventEmitter,WebView
} from 'react-native'
import {captureRef} from "react-native-view-shot";
const {width, height} = Dimensions.get('window');
import YFWNativeManager from '../Utils/YFWNativeManager'
import {isNotEmpty, safe, yfw_domain, isEmpty, kScreenScaling, getStatusBarHeight} from "../PublicModule/Util/YFWPublicFunction";
import YFWToast from '../Utils/YFWToast';
export default class SharePosterPic extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            webHeight:height,
            linkUrl:'',
            webViewOpacity:0,
        }
        this.listener();
    }

    listener(){
        this.DeviceEventListener = DeviceEventEmitter.addListener('OpenSharePosterPicView',(link)=>{
            this.show(link)
        });
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        this.didFocus&&this.didFocus.remove()
        this.didBlur&&this.didBlur.remove()
        this.DeviceEventListener&&this.DeviceEventListener.remove()
    }

    // ===== Action =====
    closeModal() {
        this.setState({
            visible: false
        });
    }

    show(link) {
        this.setState({
            visible: true,
            linkUrl:link
        })
    }

    _shareByUmeng(type) {

        let that = this;
        captureRef(this.refs.poster, {format: 'png', quality: 0.8 }).then(
            (uri) => that._sharePoster(type,uri+'')
        ).catch(
            (error) => alert(error)
        );
    }

    _sharePoster(type,uri){

        if (type == 'save'){

            YFWNativeManager.copyImage(uri,'local')

        } else {

            let param = {title:'',
                content:'',
                image:uri}
            YFWNativeManager.sharePoster(type, param,()=>{
                this.closeModal();
            });

        }


    }




    // ====== View ======

    render() {
        let webViewMarginLeft = 60*kScreenScaling
        let webViewWidth = parseInt(width - webViewMarginLeft * 2)
        return (
            <Modal
                transparent={true}
                animationType='slide'
                visible={this.state.visible}
                onRequestClose={() => this.closeModal()}
            >
                <View style={{width:width,height:height,backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
                    <TouchableOpacity onPress={()=>this.closeModal()} style={{paddingBottom:10}} >
                        <Image style={{width:25,height:25,marginLeft:width-40,marginTop:getStatusBarHeight()+10}}
                               source={require('../../img/share_icon_cancel.png')}/>
                    </TouchableOpacity>
                    <View style={{backgroundColor:'#F5F5F5',width:webViewWidth,height:this.state.webHeight,marginLeft:webViewMarginLeft}} ref="poster">
                        <WebView
                            bounces={false}
                            ref={(webView)=>this._webView = webView}
                            scalesPageToFit={true}
                           //  useWebKit={this.useWebKit}
                            source={{uri:this.state.linkUrl,method: 'GET'}}
                            style={{width:webViewWidth, height:this.state.webHeight,backgroundColor:'white',opacity:this.state.webViewOpacity}}
                            onLoadEnd={(event)=>{this._webViewOnLoadEnd(event)}}
                            onMessage={(event)=>{this._webViewMessageMethod(event)}}
                        ></WebView>
                        {this.state.webViewOpacity==0&&
                            <Text style={{color:'#666',fontSize:14,textAlign:'center',position:'absolute',top:this.state.webHeight/2,left:0,right:0}}>{'加载中...'}</Text>
                        }
                    </View>
                    <View
                        style={{width:width,backgroundColor:'#FFFFFF',position:'absolute',left:0,top:height-170,right:width,bottom:height,height:170,alignItems:'center'}}>
                        <Text style={{color:'#666666',fontSize:14,marginTop:15}}>分享图片给好友</Text>
                        <ScrollView horizontal={true}>
                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                {this.renderShareItem('微信', require('../../img/share_0.png'), ()=> {
                                    this._shareByUmeng('wx')
                                })}
                                {this.renderShareItem('朋友圈', require('../../img/share_1.png'), ()=> {
                                    this._shareByUmeng('pyq')
                                })}
                                {this.renderShareItem('QQ', require('../../img/share_3.png'), ()=> {
                                    this._shareByUmeng('qq')
                                })}
                                {this.renderShareItem('QQ空间', require('../../img/share_4.png'), ()=> {
                                    this._shareByUmeng('qzone')
                                })}
                                {this.renderShareItem('保存', require('../../img/share_8.png'), ()=> {
                                    this._shareByUmeng('save')
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        )
    }

    renderShareItem(text, image, f) {
        return (
            <TouchableOpacity onPress={()=>f()}>
                <View style={{alignItems:'center',width:80}}>
                    <Image style={{width:40,height:40}}
                           source={image}/>
                    <Text style={{color:'#666666',fontSize:14,marginTop:5}}>{text}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    _webViewMessageMethod(event) {
        console.log(event.nativeEvent)
        let data = event.nativeEvent.data
        if (isEmpty(data)) {
            return
        }
        data = JSON.parse(data)
        if (data.type == 'get_bodyHeight') {
            let newHeight = parseFloat(data.value)
            if (this.state.webHeight == newHeight) {
                return
            }
            this.setState({
                webHeight: newHeight,
                webViewOpacity:1,
            })
        }
    }

    _webViewOnLoadEnd(event) {
        this._webView.injectJavaScript('setTimeout(() => {window.parent.postMessage(JSON.stringify({type:"get_bodyHeight",value:document.body.clientHeight}))}, 500)');
    }
}
