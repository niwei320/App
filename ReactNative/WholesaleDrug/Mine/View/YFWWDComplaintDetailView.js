import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,ScrollView
} from 'react-native';
import YFWWDBaseView, { kNav_Linear, kNav_Bg } from '../../Base/YFWWDBaseView';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { kNavigationHeight, kStatusHeight, adaptSize, isNotEmpty, kScreenHeight, kScreenWidth, tcpImage, isEmpty } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDComplaintDetailModel from '../Model/YFWWDComplaintDetailModel';
import YFWWDBigPictureView from '../../Widget/YFWWDBigPictureView';
import YFWWDTouchableOpacity from '../../Widget/View/YFWWDTouchableOpacity';
import CancellationComplaintsModal from '../../../widget/CancellationComplaintsModal';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';

export default class YFWWDComplaintDetailView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = YFWWDComplaintDetailModel.initWithModel(this.props.model)
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Bg,'投诉详情',173,YFWImageConst.Bg_page_header_h)}
                {this.renderContent()}
                <YFWWDBigPictureView ref={(view) => { this.picView = view }} />
                <CancellationComplaintsModal ref={(cc)=>{this.cancleComplaintModal = cc}}/>
            </View>
        )
    }

    renderContent() { 
        return (
            <View style={{width:kScreenWidth,height:kScreenHeight-kNavigationHeight,paddingTop:10}}>
                <ScrollView style={{marginHorizontal:adaptSize(13),paddingBottom:adaptSize(52)}}>
                    <View style={{paddingBottom:adaptSize(28),backgroundColor:'white',borderRadius:10,flex:1}}>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(19),marginHorizontal:adaptSize(21)}}>投诉：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.model.shop_title}</Text>
                        </Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>编号：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.model.orderno}</Text>
                        </Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>类型：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.model.complaints_name}</Text>
                        </Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>状态：
                            <Text style={{color:this.model.dict_complaints_color,fontSize:13}}>{this.model.dict_complaints_status_name}</Text>
                        </Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>时间：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.model.complaint_time}</Text>
                        </Text>
                        <View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(27)}}>
                            <Text style={{fontSize:15,fontWeight:'bold',color:'rgb(51,51,51)'}}>投诉内容</Text>
                            <Text style={{color:'rgb(51,51,51)',fontSize:13,marginTop:adaptSize(20),lineHeight:20}}>{this.model.content}</Text>
                        </View>
                        {this.img_view()}
                    </View>
                    {this.shop_replyViwe()}
                    {this.platform_reply()}
                    {this.botton_view()}
                    <View style={{width:kScreenWidth,height:adaptSize(52)}}/>
                </ScrollView>
            </View>

        )
    }

    img_view() {
        if (isEmpty(this.model.img_url)) {
            return (<View/>);
        }
        if (this.model.img_url.length == 0) {
            return (<View/>);
        }
        if (this.model.img_url.length == 1 && this.model.img_url[0].length <= 1) {
            return (<View/>)
        }
        let images = [];
        let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
        for (let uri of this.model.img_url){
            let imageUri;
            if(uri.startsWith('/')){
                imageUri = 'http:'+cdn+uri.trim()
            }else if(uri.startsWith('http')){
                imageUri =  uri.trim()
            }else {
                imageUri = 'http:'+cdn+'/'+uri.trim()
            }
            images.push({ url: imageUri })
        }

        return (
            <View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(27)}}>
                <Text style={{fontSize:15,fontWeight:'bold',color:'rgb(51,51,51)'}}>上传凭证</Text>
                <ScrollView style={{flexDirection:'row',marginTop:adaptSize(10)}} horizontal={true}>
                    {images.map((item, index)=>this._renderUserImage(item.url, index,images))}
                </ScrollView>
            </View>
        )
    }

    _renderImageforNetType(uri) {
        if (isNotEmpty(uri)) {
            return (
                <Image source={{uri:uri}} style={{width:adaptSize(95),height:adaptSize(95),resizeMode:'contain'}}/>
            )
        }
    }

    _renderUserImage(uri, index,images) {
        return (
            <TouchableOpacity activeOpacity={1} style={{width:adaptSize(95),height:adaptSize(95),marginLeft:index==0?0:adaptSize(15)}}
                  key={index} onPress={()=>{this.picView.showView(images,index)}}>
                {this._renderImageforNetType(uri)}
            </TouchableOpacity>)
    }

    shop_replyViwe() {
        let replyShow = true
        let contentShow = true
        let contentImageShow = true
        if (isEmpty(this.model.shop_reply_content)){
            contentShow = false
        }
        if (isEmpty(this.model.shop_reply_img_url)){
            contentImageShow = false
        }
        if (contentImageShow&&this.model.shop_reply_img_url.length == 0) {
            contentImageShow = false
        }
        if (contentImageShow&&this.model.shop_reply_img_url.length == 1 && this.model.shop_reply_img_url[0].length <= 1) {
            contentImageShow = false
        }
        if(!contentShow && !contentImageShow){
            replyShow = false
        }
        let images = []
        if(contentImageShow){
            let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
            for (let uri of this.model.shop_reply_img_url){
                let imageUri;
                if(uri.startsWith('/')){
                    imageUri = 'http:'+cdn+uri.trim()
                }else if(uri.startsWith('http')){
                    imageUri =  uri.trim()
                }else {
                    imageUri = 'http:'+cdn+'/'+uri.trim()
                }
                images.push({url:imageUri})
            }
        }
        return (
            replyShow?<View style={{width:kScreenWidth-adaptSize(26),marginTop:adaptSize(17),paddingBottom:adaptSize(28),backgroundColor:'white',borderRadius:10}}>
                {contentShow?<View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(28)}}>
                    <Text style={{fontSize:15,fontWeight:'bold',color:'rgb(51,51,51)'}}>商家解释</Text>
                    <Text style={{marginTop:adaptSize(17),color:'rgb(51,51,51)',fontSize:13,lineHeight:20}}>{this.model.shop_reply_content}</Text>
                </View>:null}
                {contentImageShow?<View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(27)}}>
                    <Text style={{fontSize:15,fontWeight:'bold',color:'rgb(51,51,51)'}}>举证图片</Text>
                    <ScrollView style={{flexDirection:'row',marginTop:adaptSize(10)}} horizontal={true}>
                        {images.map((item, index)=>this._renderUserImage(item.url, index,images))}
                    </ScrollView>
                </View>:null}
                <Text style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(18),fontSize:13,color:'rgb(153,153,153)'}}>{this.model.shop_reply_time}</Text>
            </View>:null
        )

    }

    platform_reply() {
        let timeShow = true
        let isShow = true
        let contentStr
        let contentcolor
        if (isEmpty(this.model.platform_reply_content)){
            contentStr = '商城正在处理中，请耐心等待！'
            contentcolor = 'rgb(254,172,76)'
            timeShow = false
        }else{
            contentStr = this.model.platform_reply_content
            contentcolor = 'rgb(51,51,51)'
        }
        if(this.model.status == '2' || this.model.status == '0'){
            isShow = false
        }
        return (
            isShow?<View style={{width:kScreenWidth-adaptSize(26),marginTop:adaptSize(17),marginBottom:adaptSize(20),paddingBottom:adaptSize(28),backgroundColor:'white',borderRadius:10}}>
                <View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(28)}}>
                    <Text style={{fontSize:15,fontWeight:'bold',color:'rgb(51,51,51)'}}>商城处理</Text>
                    <Text style={{marginTop:adaptSize(17),color:contentcolor,fontSize:13,lineHeight:20}}>{contentStr}</Text>
                    {timeShow?<Text style={{marginTop:adaptSize(18),fontSize:13,color:'rgb(153,153,153)'}}>{this.model.platform_reply_time}</Text>:null}
                </View>
            </View>:null
        );
    }

    botton_view() {
        let bottonShow = false
        if (isNotEmpty(this.model.buttons)&&this.model.buttons.length>0) {
            bottonShow = true
        }
        return (
            bottonShow?<View style={{width:kScreenWidth-adaptSize(26),marginTop:adaptSize(52)}}>
                 <YFWWDTouchableOpacity style_title={{height:adaptSize(42), width:kScreenWidth-adaptSize(26), fontSize: 17}} title={'撤销投诉'}
                                                     callBack={()=>this.onCancelAction()}
                                                     isEnableTouch={true}/>
            </View>:null
        )
    }

    updateViews() { 
        this.model = this.props.father.model
        this.setState({})
    }

    onCancelAction() {
        this.cancleComplaintModal&&this.cancleComplaintModal.showView(()=>this.props.father.cancelComplaint())

    }
}

//导入kNavigationHeight、kStatusHeight
const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FAFAFA'},
   backbotton_style: { width: 50, height: kNavigationHeight-kStatusHeight, justifyContent: 'center'},
    backicon_style: { width: 11, height: 19, marginLeft: 12, resizeMode: 'contain'},
});