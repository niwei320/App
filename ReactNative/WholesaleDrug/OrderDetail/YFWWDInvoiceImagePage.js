import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Platform, NativeModules,
} from 'react-native';

import {YFWImageConst} from "../Images/YFWImageConst";
import {
    is_ios_hot_bundle,
    isIphoneX,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth, safe, safeArray
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import FastImage from "../../../node_modules_local/react-native-fast-image/src";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {darkTextColor, separatorColor} from "../../Utils/YFWColor";
import YFWWDTouchableOpacity from "../Widget/View/YFWWDTouchableOpacity";
import YFWHeaderLeft from "../Widget/YFWHeaderLeft";
import ModalView from "../../widget/ModalView";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";

export default class YFWWDInvoiceImagePage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        // headerTitle: '发票详情',
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            img_url:'',
            pdf_url:'',
            orderNo:'',
        }
        if (Platform.OS === 'ios') {
            this.marginTop = isIphoneX() ? 44 + 2 : 20 + 2
        } else if (Platform.Version > 19) {
            this.marginTop = NativeModules.StatusBarManager.HEIGHT
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        let info = this.props.navigation.state.params.state.value
        let urlArray = safe(info.image_url).split("|")  //info 格式 “/18/2.png|/18/1.pdf” 包含了两个文件链接第一个是png第二个是pdf
        if(isNotEmpty(info)){
            this.setState({
                img_url:safe(urlArray[0]),
                pdf_url:safe(info.pdf_url),
            })
        }
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    _share () {
        if(isNotEmpty(this.state.pdf_url)) {
            let url = this.state.pdf_url
            let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
            if(!url.startsWith('http')){
                url = 'https:' + cdn + url
            }
            this.state.pdf_url = url
            this.modalView && this.modalView.show()
        }
    }

    _shareQQ(){
        let shareType = 'qq'
        let {pdf_url} = this.state
        let param = {
            url: pdf_url,
            title: '发票信息',
            content: '点击获取发票详情信息，若下载须在pc端打开链接下载打印',
        };
        YFWNativeManager.shareWithUmeng(shareType, param, ()=> {
            this.modalView && this.modalView.disMiss()
        })
    }

    _shareWX(){
        let shareType = 'wx'
        let {pdf_url} = this.state
        let param = {
            url: pdf_url,
            title: '发票信息',
            content: '点击获取发票详情信息，若下载须在pc端打开链接下载打印',
        };
        YFWNativeManager.shareWithUmeng(shareType, param, ()=> {
            this.modalView && this.modalView.disMiss()
        })
    }

    _shareSMS(){
        let {pdf_url} = this.state
        YFWNativeManager.shareSMS('点击获取发票信息 ' + pdf_url)
    }

    closeModal() {
        this.modalView && this.modalView.disMiss()
    }


//-----------------------------------------------RENDER---------------------------------------------


    _renderContent() {
        let {img_url} = this.state
        let imageW = kScreenWidth-38
        let imageH = (kScreenWidth-38)/350*230
        return (
            <View>
                <View style={style.content}>
                    <FastImage
                        source={{uri:img_url}}
                        style={{height:imageH,width:imageW,marginVertical: 7}}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                </View>
            </View>
        )
    }

    _renderShareModel() {
        let hiddenMapNavigation = is_ios_hot_bundle()
        return(
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                <View style={{backgroundColor: 'rgba(0, 0, 0, 0.3)',flex:1}}>
                    <TouchableOpacity style={{flex:1}} onPress={this.closeModal.bind(this)}/>
                    <View style={{width:kScreenWidth,backgroundColor:'white',alignItems:'center',padding:10}}>
                        <View style={style.shareButtonView}>
                            {this._renderShareButton(YFWImageConst.Icon_share_wx,'微信', this._shareWX)}
                            {this._renderShareButton(YFWImageConst.Icon_share_qq,'QQ',this._shareQQ)}
                            {!hiddenMapNavigation&&this._renderShareButton(YFWImageConst.Icon_share_sms,'短信',this._shareSMS)}
                        </View>
                        <View style={{width:kScreenWidth-20,height:0.5,backgroundColor:separatorColor(),marginTop:20}}/>
                        <TouchableOpacity style={[BaseStyles.centerItem,{height:50,width:kScreenWidth}]}
                                          onPress={()=>this.closeModal()}>
                            <Text style={{marginTop:10,color:darkTextColor(),fontSize:17}}>取消</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalView>
        )
    }

    _renderShareButton(shareIcon, shareText, callback){
        return (
            <TouchableOpacity style={{justifyContent:'center',alignItems:'center'}} onPress={callback.bind(this)}>
                <FastImage
                    style={{height:42, width:42}}
                    source={shareIcon}
                />
                <Text style={{marginTop:4,fontSize: 14, color: "#666666"}}>{shareText}</Text>
            </TouchableOpacity>
        )
    }

    _renderBottomButton() {
        return (
            <View style={{
                width:kScreenWidth,
                position:'absolute',
                alignItems: 'center',
                bottom:isIphoneX()?88:48}}
            >
                <YFWWDTouchableOpacity
                    style_title={{ height: 44, width: kScreenWidth - 13 * 2, fontSize: 17 }}
                    title={'分享'}
                    callBack={this._share.bind(this)}
                />
                <Text style={{fontSize: 15, color: "#666666"}}>分享生成链接，电脑端打开链接下载</Text>
            </View>
        )
    }

    _renderHeaderView() {
        let marginTop = this.marginTop
        return (
            <View style={style.headerView} >
                <Image
                    source={YFWImageConst.Bg_page_header_h}
                    style={style.headerImage}
                />
                <View style={{ width: 50, height: 50, justifyContent: 'center', marginTop: marginTop }}>
                    <YFWHeaderLeft navigation={this.props.navigation}/>
                </View>
                <View style={{ flex: 1, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: marginTop }}>
                    <Text style={{ textAlign: 'center', fontSize: 17, color: '#FFF', fontWeight: 'bold' }}>发票详情</Text>
                </View>
                <View style={{width: 50,height: 50}} />
            </View>
        )
    }

    render() {
        let marginTop = this.marginTop + 50
        return (
            <View style = {{flex: 1}}>
                {this._renderHeaderView()}
                <ScrollView
                    style={{ position: 'absolute', top: marginTop, height: kScreenHeight - marginTop }}
                >
                    {this._renderContent()}
                </ScrollView>
                {isNotEmpty(this.state.pdf_url)?this._renderBottomButton():<></>}
                {this._renderShareModel()}
            </View>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        width:kScreenWidth-24,
        marginHorizontal:12,
        marginVertical:17,
        padding:7,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 7,
        shadowOpacity: 1,
        elevation: 2
    },
    headerView: {
        width: kScreenWidth,
        height: 173,
        resizeMode: 'contain',
        flexDirection: 'row'
    },
    headerImage: {
        height: 173,
        width: kScreenWidth,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        resizeMode: 'stretch'
    },
    shareButtonView: {
        backgroundColor: "white",
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        width:kScreenWidth,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'space-evenly'
    }
});
