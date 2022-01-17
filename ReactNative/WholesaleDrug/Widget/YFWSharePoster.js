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
import ShareQrCodeView from '../../widget/ShareQrCodeView'
const {width, height} = Dimensions.get('window');
import YFWNativeManager from '../../Utils/YFWNativeManager'
import {isNotEmpty, safe, yfw_domain} from "../../PublicModule/Util/YFWPublicFunction";
import YFWWDShareContentView from './YFWWDShareContentView';
export default class YFWSharePoster extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            desc: '',
            data: {
              page: 'home'
            }
        }
        this.listener();
    }

    listener(){
        //监听屏幕正在显示
        // this.didFocus = this.props.navigation.addListener('didFocus',
        //     payload => {
                this.DeviceEventListener = DeviceEventEmitter.addListener('WDOpenSharePicView',(value)=>{
                    let desc = ''
                    if (value.page == 'detail') {
                      desc = '查看商品详情'
                    } else if (value.page == 'shop') {
                      desc = '查看店铺详情'
                    } else if (value.page == 'usercenter') {
                      desc = '立即注册'
                    }
                    this.linkUrl = safe(value.url).length>0 ? safe(value.url) : 'https://www.yaofangwang.com'
                    this.setState({ desc: desc, data: value })
                    this.show()
                });
            // }
        // );
        // this.didBlur = this.props.navigation.addListener('didBlur',
        //     payload => {
        //         this.DeviceEventListener&&this.DeviceEventListener.remove()
        //     }
        // );
    }

    componentDidMount() {

        // if (this.props.type == 'Poster') {
        //     this.linkUrl = 'https://www.'+yfw_domain()+'/detail-'+this.props.goodsId+'.html';
        // }else {
        //     this.linkUrl = 'https://m.'+yfw_domain()+'/medicine-'+this.props.goodsId+'.html';
        // }


    }

    componentWillUnmount () {
      this.DeviceEventListener&&this.DeviceEventListener.remove()
    }

    // ===== Action =====
    closeModal() {
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
                    <TouchableOpacity onPress={()=>this.closeModal()}>
                        <Image style={{width:25,height:25,marginLeft:width-40,marginTop:30}}
                               source={require('../../../img/share_icon_cancel.png')}/>
                    </TouchableOpacity>
                    <View style={{marginTop:10,backgroundColor:'#F5F5F5',width:width-70,marginLeft:35}} ref="poster">
                        <View style={{backgroundColor:'#547cff',height:60,alignItems:'center',justifyContent:'center', flexDirection: 'row'}}>
                            <Image style={{width:width -220,resizeMode:'contain',height:35}}
                                   source={require('../../../img/share_poster_logo.png')}/>
                            <View style={{ paddingHorizontal: 6, height: 21, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#ffffff' }}>
                              <Text style={{fontSize: 12, color: '#547cff', fontWeight: '500'}}>批发市场</Text>
                            </View>
                        </View>
                        {/* <ShareContentView shareData={this.props.shareData} type={this.props.type}
                                          data={this.props.data}/> */}
                        <YFWWDShareContentView title={this.state.data.title} data={this.state.data} shareData={this.state.data.shareData} />
                        <ShareQrCodeView url={this.linkUrl} type={2} desc={this.state.desc} />
                    </View>
                    <View
                        style={{width:width,backgroundColor:'#FFFFFF',position:'absolute',left:0,top:height-170,right:width,bottom:height,height:170,alignItems:'center'}}>
                        <Text style={{color:'#666666',fontSize:14,marginTop:15}}>分享图片给好友</Text>
                        <ScrollView horizontal={true}>
                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                {this.renderShareItem('微信', require('../../../img/share_0.png'), ()=> {
                                    this._shareByUmeng('wx')
                                })}
                                {this.renderShareItem('朋友圈', require('../../../img/share_1.png'), ()=> {
                                    this._shareByUmeng('pyq')
                                })}
                                {this.renderShareItem('QQ', require('../../../img/share_3.png'), ()=> {
                                    this._shareByUmeng('qq')
                                })}
                                {this.renderShareItem('QQ空间', require('../../../img/share_4.png'), ()=> {
                                    this._shareByUmeng('qzone')
                                })}
                                {this.renderShareItem('保存', require('../../../img/share_8.png'), ()=> {
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
