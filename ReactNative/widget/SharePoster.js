import React from 'react'
import {
    View,
    Dimensions,
    Modal,
    Image,
    TouchableOpacity,
    Text,
    ScrollView, DeviceEventEmitter,
} from 'react-native'
import {captureRef} from "react-native-view-shot";
import ShareContentView from './ShareContentView'
import ShareQrCodeView from './ShareQrCodeView'
const {width, height} = Dimensions.get('window');
import YFWNativeManager from '../Utils/YFWNativeManager'
import {getStatusBarHeight, safe, safeObj, yfw_domain} from "../PublicModule/Util/YFWPublicFunction";
export default class SharePoster extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
        }
        this.listener();
    }

    listener(){
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this.DeviceEventListener = DeviceEventEmitter.addListener('OpenSharePicView',()=>{
                    this.show()
                });
            }
        );
        this.didBlur = this.props.navigation.addListener('didBlur',
            payload => {
                this.DeviceEventListener&&this.DeviceEventListener.remove()
            }
        );
    }

    componentDidMount() {

        if (this.props.from == 'shop') {
            this.linkUrl = url = 'https://m.' + yfw_domain() + '/yaodian/' + safe(safeObj(this.props.shareData).shopID) + '/';
        } else {
            if (this.props.type == 'Poster') {
                this.linkUrl = 'https://www.'+yfw_domain()+'/detail-'+this.props.goodsId+'.html';
            }else {
                this.linkUrl = 'https://m.'+yfw_domain()+'/medicine-'+this.props.goodsId+'.html';
            }
        }
    }

    componentWillUnmount() {
        this.didFocus&&this.didFocus.remove()
        this.didBlur&&this.didBlur.remove()
    }

    // ===== Action =====
    closeModal() {
        if (this.props.from == 'GoodsDetail') {
            setTimeout(()=>{
                DeviceEventEmitter.emit('OpenRateView');
            },1500);
        }
        this.setState({
            visible: false
        });
    }

    show() {
        this.setState({
            visible: true,
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
        return (
            <Modal
                transparent={true}
                animationType='slide'
                visible={this.state.visible}
                onRequestClose={() => this.closeModal()}
            >
                <View style={{width:width,height:height,backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
                    <TouchableOpacity onPress={()=>this.closeModal()} style={{paddingBottom:10}}>
                        <Image style={{width:25,height:25,marginLeft:width-40,marginTop:getStatusBarHeight()+10}}
                               source={require('../../img/share_icon_cancel.png')}/>
                    </TouchableOpacity>
                    <View style={{backgroundColor:'#F5F5F5',width:width-70,marginLeft:35}} ref="poster">
                        <View style={{backgroundColor:'#16c08e',height:60,alignItems:'center',justifyContent:'center'}}>
                            <Image style={{width:width -220,resizeMode:'contain',height:35}}
                                   source={require('../../img/share_poster_logo.png')}/>
                        </View>
                        <ShareContentView shareData={this.props.shareData} type={this.props.type} from={this.props.from}
                                          data={this.props.data}/>

                        <ShareQrCodeView url={this.linkUrl} desc={this.props.from=='shop' ? '查看店铺详情' : ''}/>
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
}
