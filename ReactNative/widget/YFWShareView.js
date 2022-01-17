import React from 'react'
import {
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    Image, DeviceEventEmitter
} from 'react-native'

const {width, height} = Dimensions.get('window');
import YFWToast from "../Utils/YFWToast";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../Utils/YFWNativeManager";
import ModalView from './ModalView'
import {
    imageJoinURL,
    isNotEmpty,
    safe,
    safeObj,
    tcpImage,
    yfw_domain,
    haslogin,
    mobClick,
    kScreenHeight, kScreenWidth, adaptSize
} from "../PublicModule/Util/YFWPublicFunction";
import {doAfterLogin, pushNavigation} from "../Utils/YFWJumpRouting";
import {darkNomalColor, darkTextColor, separatorColor} from '../Utils/YFWColor'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWRequestParam from "../Utils/YFWRequestParam";
import {getWinCashData} from "../Utils/YFWInitializeRequestFunction";
import YFWPopupWindow from "../PublicModule/Widge/YFWPopupWindow";

let URL = 'https://www.' + yfw_domain() + '/app/index.html';
let URL1 = '推荐@药房网商城 的手机买药app，品种丰富，全国比价，品质保障！下载地址：#https://www.'+yfw_domain()+'/app/index.html#'
const TITLE = '药房网商城App客户端';
const TITLE1 = '药房网商城App客户端，手机买药优选平台！';
const CONTENT1 = '手机买药优选平台，品种丰富，价格实在，品质保障！';
const CONTENT2 = '品种丰富,药品正规,新人注册送20元专享券,买药放心更实惠';
const CONTENT3 = '药房网商城 - 手机买药优选平台，App购药更优惠！';

export const SHARE_WE_CHAT = 'SHARE_WE_CHAT'//分享微信
export const SHARE_WE_CHAT_MOMENT = 'SHARE_WE_CHAT_MOMENT'//分享朋友圈
export const SHARE_SINA = 'SHARE_SINA'//分享新浪
export const SHARE_QQ = 'SHARE_QQ'//分享QQ
export const SHARE_QZONE = 'SHARE_QZONE'//分享Q控件
export const SHARE_COPY_URL = 'SHARE_COPY_URL'//复制链接
export const SHARE_PIC = 'SHARE_PIC'//分享图片
export default class YFWShareView extends React.Component {


    static defaultProps = {}


    constructor(props) {
        super(props)
        this.state = {
            data: {page: 'home'},
        }
        this.tags = [
            {
                tag: SHARE_WE_CHAT, renderItem: ()=> {
                return this._renderShareItem(require("../../img/share_0.png"), '微信', ()=> {
                    this._shareByUmeng('wx')
                })
            }
            },
            {
                tag: SHARE_WE_CHAT_MOMENT, renderItem: ()=> {
                return this._renderShareItem(require("../../img/share_1.png"), '朋友圈', ()=> {
                    this._shareByUmeng('pyq')
                })
            }
            },
            {
                tag: SHARE_SINA, renderItem: ()=> {
                return this._renderShareItem(require("../../img/share_2.png"), '微博', ()=> {
                    this._shareByUmeng('wb')
                })
            }
            },
            {
                tag: SHARE_QQ, renderItem: ()=> {
                return this._renderShareItem(require("../../img/share_3.png"), 'QQ', ()=> {
                    this._shareByUmeng('qq')
                })
            }
            },
            {
                tag: SHARE_QZONE, renderItem: ()=> {
                return this._renderShareItem(require("../../img/share_4.png"), 'QQ空间', ()=> {
                    this._shareByUmeng('qzone')
                })
            }
            },
            {
                tag: SHARE_COPY_URL, renderItem: ()=> {
                return this._renderShareItem(require("../../img/share_5.png"), '复制链接', ()=> {
                    this._copLink()
                })
            }
            },
            {
                tag: SHARE_PIC, renderItem: ()=> {
                if (safe(this.state.data.type) == 'poster') {
                    return this._renderShareItem(require("../../img/share_7.png"), '图片分享', ()=> {
                        this._sharedPic()
                    })
                }
            }
            },
            {
                tag: SHARE_PIC, renderItem: ()=> {
                if (safe(this.state.data.type) == 'webPic') {
                    return this._renderShareItem(require("../../img/share_7.png"), '海报分享', ()=> {
                        this._sharedPoster()
                    })
                }
            }
            },
        ]
    }


    componentDidMount() {

        DeviceEventEmitter.addListener('OpenShareView', (value)=> {
            if (isNotEmpty(value)) {
                this.show(value)
            }
        });


    }

    componentWillUnmount() {

        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }

    }


    // ====== Action ======

    show(data) {
        this.goneItems = data.goneItems;
        this.isShowHead = data.isShowHead;
        this.modalView && this.modalView.show()
        this.state.data = data
        if(safe(this.state.data.viewType) === 'only_wx'){
            this.tags = [
                {
                    tag: SHARE_WE_CHAT, renderItem: () => {
                        return this._renderShareItem(require("../../img/share_0.png"), '微信', () => {
                            this._shareByUmeng('wx')
                        })
                    }
                }
            ]
            this.weight = 1
        }
        this.setState({
            data: data
        })
    }

    closeModal() {

        if(this.state.data.from == 'GoodsDetail'){
            setTimeout(()=>{
                DeviceEventEmitter.emit('OpenRateView');
            },1500);
        }
        this.modalView && this.modalView.disMiss()
    }

    _shareParam(data, type) {

        let url = URL;
        let title = TITLE;
        let content = CONTENT1;

        //首页
        if (data.page == 'home') {
            if(haslogin()&&data.url){
                //分享赢现金链接
                url = safe(data.url);
                title = safe(data.title);
                content = safe(data.content);
            }else{
                if (type == 'wx') {
                    title = TITLE1;
                }
                if (type == 'wb') {
                    url = URL;
                    content = URL1;
                }
                if (type == 'wx' || type == 'pyq'||type == 'qq'||type == 'qzone') {
                    content = CONTENT2;
                }
            }
        } else if (data.page == 'detail') {

            if(haslogin()){
                if(data.url.length > 0){
                    //带有注册页面的商品分享
                    url = data.url;
                }else{
                    url = 'https://m.' + yfw_domain() + '/detail-' + safe(data.goods_id) + '.html';
                }
            }else{
                url = 'https://m.' + yfw_domain() + '/detail-' + safe(data.goods_id) + '.html';
            }
            title = safe(data.title);
            content = CONTENT3;
            if (type == 'wb') {
                content = '我在@药房网商城 找到了#' + safe(data.title) + '#，分享给大家！#' + url + '#';
            }
            data.image = tcpImage(safe(data.image));
        } else if (data.page == 'seller') {
            if(haslogin()){
                if(data.url.length > 0){
                    //带有注册页面的商品分享
                    url = data.url;
                }else{
                    url =  'https://m.' + yfw_domain() + '/medicine-' + safe(data.goods_id) + '.html';
                }
            }else{
                url =  'https://m.' + yfw_domain() + '/medicine-' + safe(data.goods_id) + '.html';
            }
            title = safe(data.title);
            content = CONTENT3;
            if (type == 'wb') {
                content = '我在@药房网商城 找到了#' + safe(data.title) + '#，分享给大家！#' + url + '#';
            }
            data.image = tcpImage(safe(data.image));

        } else if (data.page == 'shop') {

            url = 'https://m.' + yfw_domain() + '/yaodian/' + safe(data.shopID) + '/';
            title = safe(data.title);
            content = safe(data.content);
            if (type == 'wb') {
                content = '我在@药房网商城 找到了#' + safe(data.title) + '#，分享给大家！#' + url + '#';
            }
            data.image = safe(data.image);
        } else if (data.page == 'h5') {

            url = safe(data.url);
            title = safe(data.title);
            content = safe(data.content);
            data.image = tcpImage(safe(data.image));
            if (type == 'wx') {
                title = '' + safe(data.title) + '—药房网商城，手机买药优选平台！';
            }
            if (type == 'wx' || type == 'pyq' || type == 'qq' || type == 'qzone') {
                let desc = isNotEmpty(data.content) ? data.content : CONTENT2;
                content = desc;
            }

        } else {

            url = safe(data.url);
            title = safe(data.title);
            content = safe(data.content);

        }

        return {url: url, title: title, content: content, image: imageJoinURL(safeObj(data.image)), from: data.from};

    }


    _shareByUmeng(type) {

        let param = this._shareParam(this.state.data, type);
        let shareType = type
        if( type == 'wx' && this.state.data.isFromYaoShiClassRoom){
            shareType = 'wxMini'
        }
        YFWNativeManager.shareWithUmeng(shareType, param, ()=> {
            this.closeModal();
        });
    }

    _copLink() {

        let param = this._shareParam(this.state.data);
        let url = param.url;

        if (isNotEmpty(url)) {

            YFWNativeManager.copyLink(url);
            YFWToast('复制成功');

        }

    }

    /**
     * 分享图片
     * @private
     */
    _sharedPic() {
        let {navigate} = this.props.getNavigation()
        doAfterLogin(navigate,()=>{
            DeviceEventEmitter.emit('OpenSharePicView')
        })
        this.closeModal();
    }

    _sharedPoster() {
        let {navigate} = this.props.getNavigation()
        doAfterLogin(navigate,()=>{
            DeviceEventEmitter.emit('OpenSharePosterPicView',this.state.data.linkUrl)
        })
        this.closeModal();
    }

    // ======= View =======

    render() {

        let type = safe(this.state.data.type);
        let viewType = safe(this.state.data.viewType);

        switch (viewType) {
            case 'only_wx':
                return (
                    <YFWPopupWindow
                        ref={(c) => this.modalView = c}
                        onRequestClose={() => {}}
                        backgroundColor={'white'}
                        popupWindowHeight={230}
                    >
                        {this._renderContents()}
                    </YFWPopupWindow>
                )
            default:
                return (
                    <ModalView ref={(c) => this.modalView = c} animationType="fade">
                        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.3)',flex:1}}>
                            <TouchableOpacity style={{flex:1}} onPress={()=>this.closeModal()}/>
                            {this._renderHead()}
                            {this._renderContents()}
                        </View>
                    </ModalView>
                );
        }
    }

    _renderContents(){
        return (
            <View style={{width:width,backgroundColor:'white',alignItems:'center',padding:10,marginTop:10}}>
                <Text style={{marginTop:10,color:darkNomalColor(),fontSize:15}}>分享到</Text>
                <View style={[BaseStyles.sectionListStyle, {
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 5,
                    backgroundColor: 'white'
                }]}>
                    {this._renderBottom()}
                </View>
                <View style={{width:width-20,height:0.5,backgroundColor:separatorColor(),marginTop:20}}/>
                <TouchableOpacity style={[BaseStyles.centerItem,{height:50,width:width}]}
                                  onPress={()=>this.closeModal()}>
                    <Text style={{marginTop:10,color:darkTextColor(),fontSize:17}}>取消</Text>
                </TouchableOpacity>
            </View>
        )
    }

    _renderHead() {
        if(this.isShowHead){
            return (
                <View style={{flexDirection:'row',backgroundColor:'#F86E47',height:55,alignItems:'center',justifyContent:'center', top:10}}>
                    <View style={{flex:1,justifyContent:"center",marginLeft: 14}}>
                        <Text style={{fontSize:15,color:'white',fontWeight:'bold'}}>分享有奖励</Text>
                        <Text style={{fontSize:12,color:'white'}}>邀请好友
                        <Text style={{fontSize:12,color:'#FFF000'}}>完成购物</Text>，你得
                        <Text style={{fontSize:12,color:'#FFF000'}}>现金</Text>!</Text>
                    </View>
                    <TouchableOpacity onPress={()=>{
                        let {navigate} = this.props.getNavigation()
                        if(haslogin()){
                            mobClick('product-detail-share-check-the-reward')
                            getWinCashData(navigate,'1');
                        }else{
                            pushNavigation(navigate, {type: 'get_login'});
                        }
                        this.closeModal();
                    }} style={{marginBottom:7,marginRight:10}}>
                        <Image source={haslogin()?require('../../img/share_toShare.png'):require('../../img/share_toLogin.png')}
                            style={{resizeMode:'contain',width:100,height:57}}/>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    _renderBottom() {
        this.weight = 4//标准一行四个
        if (isNotEmpty(this.goneItems)) {
            let count = this.tags.length - this.goneItems.length
            if (count >= 4) {
                this.weight = 4
            } else {
                this.weight = count;
            }
        }
        return this.tags.map((item)=> {
            return this._renderItem(item)
        });
    }

    _renderItem(item) {
        if (isNotEmpty(this.goneItems)) {
            if (!this.goneItems.includes(item.tag)) {
                return item.renderItem()
            }
        } else {
            return item.renderItem()
        }
    }


    _renderShareItem(source, title, onPress) {
        return (
            <TouchableOpacity key={title} onPress={onPress}
                              style={[BaseStyles.centerItem,{width:((width-20)/this.weight),marginTop:20}]}
            >
                <Image style={{width:45,height:45}}
                       source={source} defaultSource={source}/>
                <Text style={{marginTop:10,color:darkNomalColor(),fontSize:13}}>{title}</Text>
            </TouchableOpacity>
        );
    }
}
