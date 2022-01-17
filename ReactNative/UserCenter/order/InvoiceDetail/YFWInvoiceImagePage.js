import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Platform, NativeModules,
} from 'react-native';
import {
    imageJoinURL,
    isEmpty,
    isIphoneX, isNotEmpty,
    kScreenHeight,
    kScreenWidth, safe, safeObj, tcpImage, isAndroid, is_ios_hot_bundle
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWHeaderLeft from "../../../WholesaleDrug/Widget/YFWHeaderLeft";
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";
import YFWTouchableOpacity from "../../../widget/YFWTouchableOpacity";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWOfflineOrderDetailModel from "../OrderDetail/Model/YFWOfflineOrderDetailModel";
import YFWOfflineOrderDetailViewModel
    from "../OrderDetail/ViewModel/YFWOfflineOrderDetailViewModel";
import YFWOrderDetailModel from "../OrderDetail/Model/YFWOrderDetailModel";
import YFWOrderDetailViewModel from "../OrderDetail/ViewModel/YFWOrderDetailViewModel";
import YFWToast from "../../../Utils/YFWToast";
import FastImage from "../../../../node_modules_local/react-native-fast-image/src";
import ModalView from "../../../widget/ModalView";
import {darkNomalColor, darkTextColor, o2oBlueColor, separatorColor} from "../../../Utils/YFWColor";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../../../Utils/YFWNativeManager";

export default class YFWInvoiceImagePage extends Component {
    static navigationOptions = ({navigation}) => {
        if (safeObj(navigation.state.params.state).from == 'oto') {
            return {
                tabBarVisible: false,
                headerTitle:'发票详情',
                headerRight:<View style={{width:50}}></View>
            }
        } else {
            return {
                tabBarVisible: false,
                header: null,
            }
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            img_url:'',
            pdf_url:'',
            orderNo:'',
            from:''
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
        let orderNo = this.props.navigation.state.params.state.orderNo
        let from = this.props.navigation.state.params.state.from
        if(isNotEmpty(info)){
            let urlArray = info.split("|")  //info 格式 “/18/2.png|/18/1.pdf” 包含了两个文件链接第一个是png第二个是pdf。pdf链接无用接口暂未去除。
            this.setState({
                img_url:urlArray[0],
                orderNo:orderNo,
                from:from,
            })
        }
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    _share () {
        let {orderNo} = this.state
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getInvoicePdf'); //订单号获取pdf下载链接
        paramMap.set('orderno', orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            if(isNotEmpty(res.result)){
                let url = res.result
                if(!url.startsWith('http') && url.startsWith('//')){
                    url = 'https:' + url
                }
                this.state.pdf_url = url
                this.modalView && this.modalView.show()
            } else {
                YFWToast('获取数据失败')
            }
        }, (error)=> {
        },false)
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
                            {this._renderShareButton(require('../../../../img/share_0.png'),'微信', this._shareWX)}
                            {this._renderShareButton(require('../../../../img/share_3.png'),'QQ',this._shareQQ)}
                            {!hiddenMapNavigation&&this._renderShareButton(require('../../../../img/icon_sms.png'),'短信',this._shareSMS)}
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
                <YFWTouchableOpacity
                    style_title={{ height: 44, width: kScreenWidth - 13 * 2, fontSize: 17 }}
                    title={'分享'}
                    callBack={this._share.bind(this)}
                    isEnableTouch={true}
                    enableColors={[o2oBlueColor(),o2oBlueColor()]}
                    enableShaowColor={'rgba(87, 153, 247, 0.5)'}
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
                    source={require('../../../../img/dingdan_bj.png')}
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
                {this.state.from != 'oto'&&this._renderHeaderView()}
                <ScrollView
                    style={this.state.from != 'oto'?{ position: 'absolute', top: marginTop, height: kScreenHeight - marginTop }:{flex:1}}
                >
                    {this._renderContent()}
                </ScrollView>
                {this._renderBottomButton()}
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