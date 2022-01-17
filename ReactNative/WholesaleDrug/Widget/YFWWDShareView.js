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
import YFWToast from "../../Utils/YFWToast";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import ModalView from '../../widget/ModalView'
import {imageJoinURL, isNotEmpty, safe, safeObj, tcpImage, yfw_domain, haslogin} from "../../PublicModule/Util/YFWPublicFunction";
import {doAfterLogin, pushNavigation} from "../../Utils/YFWJumpRouting";
import {darkNomalColor, darkTextColor, separatorColor} from '../../Utils/YFWColor'
import {getWinCashData} from "../../Utils/YFWInitializeRequestFunction";
import { YFWImageConst } from '../Images/YFWImageConst';
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';

let URL = 'https://www.' + yfw_domain() + '/app/index.html';
let URL1 = '推荐@药房网商城 的手机买药app，品种丰富，全国比价，品质保障！下载地址：#https://www.'+yfw_domain()+'/app/index.html#'
const TITLE = '药房网商城App客户端';
const TITLE1 = '邀请入驻药房网商城-批发商城';
const CONTENT1 = '手机买药优选平台，品种丰富，价格实在，品质保障！';
const CONTENT2 = '点击进入店铺，浏览更多品种！';
const CONTENT3 = '点击立即注册，把货铺到全国！';

export const SHARE_WE_CHAT = 'SHARE_WE_CHAT'//分享微信
export const SHARE_WE_CHAT_MOMENT = 'SHARE_WE_CHAT_MOMENT'//分享朋友圈
export const SHARE_SINA = 'SHARE_SINA'//分享新浪
export const SHARE_QQ = 'SHARE_QQ'//分享QQ
export const SHARE_QZONE = 'SHARE_QZONE'//分享Q控件
export const SHARE_COPY_URL = 'SHARE_COPY_URL'//复制链接
export const SHARE_PIC = 'SHARE_PIC'//分享图片
export default class YFWWDShareView extends React.Component {


    static defaultProps = {}


    constructor(props) {
        super(props)
        this.state = {
            data: {page: 'home'},
        }
        this.tags = [
            {
                tag: SHARE_WE_CHAT, renderItem: ()=> {
                return this._renderShareItem(require("../../../img/share_0.png"), '微信', ()=> {
                    this._shareByUmeng('wx')
                })
            }
            },
            {
                tag: SHARE_WE_CHAT_MOMENT, renderItem: ()=> {
                return this._renderShareItem(require("../../../img/share_1.png"), '朋友圈', ()=> {
                    this._shareByUmeng('pyq')
                })
            }
            },
            {
                tag: SHARE_SINA, renderItem: ()=> {
                return this._renderShareItem(require("../../../img/share_2.png"), '微博', ()=> {
                    this._shareByUmeng('wb')
                })
            }
            },
            {
                tag: SHARE_QQ, renderItem: ()=> {
                return this._renderShareItem(require("../../../img/share_3.png"), 'QQ', ()=> {
                    this._shareByUmeng('qq')
                })
            }
            },
            {
                tag: SHARE_QZONE, renderItem: ()=> {
                return this._renderShareItem(require("../../../img/share_4.png"), 'QQ空间', ()=> {
                    this._shareByUmeng('qzone')
                })
            }
            },
            {
                tag: SHARE_COPY_URL, renderItem: ()=> {
                return this._renderShareItem(require("../../../img/share_5.png"), '复制链接', ()=> {
                    this._copLink()
                })
            }
            },
            {
                tag: SHARE_PIC, renderItem: ()=> {
                if (safe(this.state.data.type) == 'poster') {
                    return this._renderShareItem(require("../../../img/share_7.png"), '图片分享', ()=> {
                        this._sharedPic()
                    })
                }
            }
            },
        ]
    }


    componentDidMount() {

        DeviceEventEmitter.addListener('WDOpenShareView', (value)=> {
            if (isNotEmpty(value)) {
                this.show(value)
            }
        });

        this._requestShareData()
    }

    componentWillUnmount() {

        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }

    }

    _requestShareData () {
        let paramMap = new Map()
        let cmd = 'guest.whole.H5.getInviteShareConfig as getInviteShareConfig, guest.whole.H5.getStkShareConfig as getStkShareConfig, guest.whole.H5.getStoreShareConfig as getStoreShareConfig'
        paramMap.set('getInviteShareConfig')
        paramMap.set('getStkShareConfig')
        paramMap.set('getStoreShareConfig')

        paramMap.set('__cmd', cmd)
        let request = new YFWRequestViewModel()
        request.TCPRequest(paramMap, (res) => {
            if (isNotEmpty(res.result)) {
                this.shareParams = {
                    invite_title: safe(res.result.getInviteShareConfig?.b2b_invite_title_share),
                    invite_content: safe(res.result.getInviteShareConfig?.b2b_invite_content_share),
                    invite_image: safe(res.result.getInviteShareConfig?.b2b_invite_image_share),
                    stk_content: safe(res.result.getStkShareConfig?.b2b_stk_content_share),
                    sto_image: safe(res.result.getStoreShareConfig?.b2b_sto_image_share),
                    sto_content: safe(res.result.getStoreShareConfig?.b2b_sto_content_share),
                }
            }
        }, (error) => {
            console.log('分享',error)
        },false)
    }


    // ====== Action ======

    show(data) {
        this.goneItems = data.goneItems;
        this.isShowHead = data.isShowHead;
        this.modalView && this.modalView.show()
        this.state.data = data
        this.setState({
            data: data
        })
    }

    closeModal() {

        this.modalView && this.modalView.disMiss()
    }

    _shareParam(data, type) {

        let url = URL;
        let title = TITLE;
        let content = CONTENT1;

        //首页
        if (data.page == 'home') {


        } else if (data.page == 'detail') {

            // if(haslogin()){
            //     if(data.url.length > 0){
            //         //带有注册页面的商品分享
            //         url = data.url;
            //     }else{
            //         url = 'https://m.' + yfw_domain() + '/detailb2b-' + safe(data.goods_id) + '.html';
            //     }
            // }else{
            //     url = 'https://m.' + yfw_domain() + '/detailb2b-' + safe(data.goods_id) + '.html';
            // }
            // url = 'http://m.y3.com/detailb2b-' + safe(data.goods_id) + '.html';
            url = 'https://m.' + yfw_domain() + '/detailb2b-' + safe(data.goods_id) + '.html';
            title = safe(data.title);
            content = safe(data.standard) + '(' + safe(data.manfacturer) + ')' + safe(this.shareParams?.stk_content);
            if (type == 'wb') {
              title = '药品采购，就来@药房网商城 -批发市场，享#' + safe(data.title) + '#批发价采购。#商品链接#';
            }
            data.image = tcpImage(safe(data.image))
        }  else if (data.page == 'shop') {

        //   if(haslogin()){
        //       if(data.url.length > 0){
        //           //带有注册页面的商品分享
        //           url = data.url;
        //       }else{
        //           url = 'https://m.' + yfw_domain() + '/yaodian/b2b-' + safe(data.shop_id) + '.html';
        //       }
        //   }else{
        //       url = 'https://m.' + yfw_domain() + '/yaodian/b2b-' + safe(data.shop_id) + '.html';
        //   }
        //   url = 'http://m.y3.com/yaodian/b2b-' + safe(data.shop_id) + '.html';
        url = 'https://m.' + yfw_domain() + '/yaodian/b2b-' + safe(data.shop_id) + '/';
          title = safe(data.title);
          content = safe(this.shareParams?.sto_content).length>0 ? safe(this.shareParams?.sto_content) : CONTENT2;
          if (type == 'wb') {
              title = '我刚在@药房网商城 发现了一家好店，采购价超低，快来看看吧！#店铺链接#';
          }
          data.image = safe(this.shareParams?.sto_image).length>0 ? safe(this.shareParams?.sto_image) : safe(data.image)

      } else if (data.page == 'usercenter') {
            // url = 'http://m.y3.com/account/StoreRegister?type=3';
            url = 'https://m.' + yfw_domain() + '/account/StoreRegister';
            title = safe(this.shareParams?.invite_title).length>0 ? safe(this.shareParams?.invite_title) : (safe(data.title).length>0 ? safe(data.title) : TITLE1);
            content = safe(this.shareParams?.invite_content).length>0 ? safe(this.shareParams?.invite_content) : CONTENT3;
            if (type == 'wb') {
                title = '邀请入驻@药房网商城 -批发市场，把货铺到全国！#注册链接#';
            }
            data.image = safe(this.shareParams?.invite_image).length>0 ? safe(this.shareParams?.invite_image) : safe(data.image)

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
        let { data } = this.state
        let param = this._shareParam(this.state.data);
        data.url = param.url
        data.title = param.title
        data.content = param.content
        data.image = param.image
        doAfterLogin(navigate,()=>{
            DeviceEventEmitter.emit('WDOpenSharePicView', data)
        })
        this.closeModal();
    }

    // ======= View =======

    render() {

        let type = safe(this.state.data.type);

        return (

            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                <View style={{backgroundColor: 'rgba(0, 0, 0, 0.3)',flex:1}}>
                    <TouchableOpacity style={{flex:1}} onPress={()=>this.closeModal()}/>
                    {this._renderHead()}
                    <View style={{width:width,backgroundColor:'white',alignItems:'center',padding:10}}>
                        <Text style={{marginTop:10,color:darkNomalColor(),fontSize:15}}>分享到</Text>
                        <View style={[BaseStyles.sectionListStyle, {
                            backgroundColor: "white",
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 5,
                        }]}>
                            {this._renderBottom()}
                        </View>
                        <View style={{width:width-20,height:0.5,backgroundColor:separatorColor(),marginTop:20}}/>
                        <TouchableOpacity style={[BaseStyles.centerItem,{height:50,width:width}]}
                                          onPress={()=>this.closeModal()}>
                            <Text style={{marginTop:10,color:darkTextColor(),fontSize:17}}>取消</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalView>
        );
    }

    _renderHead() {
        if(this.isShowHead){
            return (
                <View style={{flexDirection:'row',backgroundColor:'#F86E47',height:55,alignItems:'center',justifyContent:'center'}}>
                    <View style={{flex:1,justifyContent:"center",marginLeft: 14}}>
                        <Text style={{fontSize:15,color:'white',fontWeight:'bold'}}>分享有奖励</Text>
                        <Text style={{fontSize:12,color:'white'}}>邀请好友
                        <Text style={{fontSize:12,color:'#FFF000'}}>完成购物</Text>，你得
                        <Text style={{fontSize:12,color:'#FFF000'}}>现金</Text>!</Text>
                    </View>
                    <TouchableOpacity onPress={()=>{
                        let {navigate} = this.props.getNavigation()
                        if(haslogin()){
                            getWinCashData(navigate,'1');
                        }else{
                            pushNavigation(navigate, {type: 'get_login'});
                        }
                        this.closeModal();
                    }} style={{marginBottom:7,marginRight:10}}>
                        <Image source={haslogin()?require('../../../img/share_toShare.png'):require('../../../img/share_toLogin.png')}
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
