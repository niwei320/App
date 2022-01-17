/**
 * Created by admin on 2018/5/23.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ImageBackground,
    ScrollView,
    TextInput,
    Platform,NativeModules
} from 'react-native';
const width = Dimensions.get('window').width;
import {
    yfwOrangeColor,
    backGroundColor,
    darkNomalColor,
    darkLightColor,
    yfwGreenColor,
    darkTextColor
} from './../Utils/YFWColor'
import {imageJoinURL, itemAddKey, kScreenWidth, yfw_domain, kScreenHeight, adaptSize} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {isEmpty, isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";
import YFWToast from "../Utils/YFWToast";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import YFWComplaintDetailModel from './Model/YFWComplaintDetailModel'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import ZoomImage from '../widget/YFWZoomImage';
import { isIphoneX } from 'react-native-iphone-x-helper';
import YFWTitleView from '../PublicModule/Widge/YFWTitleView';
import BigPictureView from '../widget/BigPictureView';
import YFWTouchableOpacity from '../widget/YFWTouchableOpacity';
import CancellationComplaintsModal from '../widget/CancellationComplaintsModal'
const {StatusBarManager} = NativeModules;

export default class ComplaintDetail extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.id = '';
        this.orderNo;
        this.state = {
            dataArray: {},
            statusColor: darkLightColor()
        }
    }

    componentDidMount() {
        this.id = this.props.navigation.state.params.state.value;
        this.orderNo = this.props.navigation.state.params.state.orderNo;
        this.requestMyComplaintDetialData();

    }

    _renderHeaderView(){
        let marginTop
         if(Platform.OS === 'ios'){
            marginTop = isIphoneX()?44+2:20+2
         }else if(Platform.Version >19){
             marginTop = StatusBarManager.HEIGHT
         }
        return (
            <View style={{width:kScreenWidth,height:173,resizeMode:'contain',flexDirection:'row'}} >
                 <Image style={{height:173,width:kScreenWidth,position:'absolute',top:0,left:0,right:0,resizeMode:'stretch'}} source={require('../../img/dingdan_bj.png')}/>
                 <TouchableOpacity onPress={()=>this.props.navigation.goBack()}  activeOpacity={1}
                                  style={{width:50,height:40,alignItems:'center',justifyContent:'center',marginTop:marginTop}}>
                    <Image style={{width:11,height:19,resizeMode:'contain'}}
                           source={ require('../../img/dingdan_back.png')}/>
                </TouchableOpacity>
                <View style={{flex:1,height:40,alignItems:'center',justifyContent:'center',marginTop:marginTop}}>
                    <Text style={{textAlign:'center',fontSize:17,color:'#FFF',fontWeight:'bold'}}>我的投诉</Text>
                </View>
                <TouchableOpacity style={{width:50,height:40,justifyContent:'center',marginTop:marginTop}} activeOpacity={1}>
                    <Text style={{fontSize:15,color:'#fff'}}></Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        let magin_top = isIphoneX()?88:64
        let statusColor = this.state.dataArray.status == 0?'rgb(254,172,76)':this.state.dataArray.status == 1?'rgb(31,219,155)':this.state.dataArray.status == 3?'rgb(31,219,155)':'rgb(204,204,204)'
        return (
            <View style={{flex:1,paddingBottom:adaptSize(52)}}>
                <AndroidHeaderBottomLine/>
                {this._renderHeaderView()}
                <ScrollView style={{position:'absolute',top:magin_top,height:kScreenHeight-magin_top}}>
                    <View style={{marginLeft:adaptSize(13),width:kScreenWidth-adaptSize(26),marginTop:adaptSize(10),paddingBottom:adaptSize(28),backgroundColor:'white',borderRadius:10}}>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(19),marginHorizontal:adaptSize(21)}}>投诉：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.state.dataArray.shop_title}</Text>
                        </Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>编号：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.state.dataArray.order_no}</Text>
                        </Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>类型：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.state.dataArray.complaints_name}</Text>
                        </Text>
                        {isNotEmpty(this.state.dataArray.complaints_reason)?<Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>原因：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.state.dataArray.complaints_reason}</Text>
                        </Text>:null}
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>状态：
                            <Text style={{color:statusColor,fontSize:13}}>{this.state.dataArray.status_name}</Text>
                        </Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:13,marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>时间：
                            <Text style={{color:'rgb(51,51,51)',fontSize:13}}>{this.state.dataArray.complaint_time}</Text>
                        </Text>
                        <View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(27)}}>
                            <YFWTitleView style_title={{fontSize:15}} title={'投诉说明'}/>
                            <Text style={{color:'rgb(51,51,51)',fontSize:13,marginTop:adaptSize(5),lineHeight:20}}>{this.state.dataArray.content}</Text>
                        </View>
                        {this.img_view()}
                    </View>
                    {this.shop_replyViwe()}
                    {this.platform_reply()}
                    {this.botton_view()}
                    <View style={{width:kScreenWidth,height:adaptSize(52)}}/>
                </ScrollView>
                <BigPictureView ref={(view)=>{this.picView = view}}/>
                <CancellationComplaintsModal ref={(cc)=>{this.cancleComplaintModal = cc}}/>
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

    img_view() {
        if (isEmpty(this.state.dataArray.img_url)) {
            return (<View/>);
        }
        if (this.state.dataArray.img_url.length == 0) {
            return (<View/>);
        }
        if (this.state.dataArray.img_url.length == 1 && this.state.dataArray.img_url[0].length <= 1) {
            return (<View/>)
        }
        let images = [];
        let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
        for (let uri of this.state.dataArray.img_url){
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

        return (
            <View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(27)}}>
                <YFWTitleView style_title={{fontSize:15}} title={'上传凭证'}/>
                <ScrollView style={{flexDirection:'row',marginTop:adaptSize(10)}} horizontal={true}>
                    {images.map((item, index)=>this._renderUserImage(item.url, index,images))}
                </ScrollView>
            </View>
        )
    }

    shop_replyViwe() {
        let replyShow = true
        let contentShow = true
        let contentImageShow = true
        if (isEmpty(this.state.dataArray.shop_reply_content)){
            contentShow = false
        }
        if (isEmpty(this.state.dataArray.shop_reply_img_url)){
            contentImageShow = false
        }
        if (contentImageShow&&this.state.dataArray.shop_reply_img_url.length == 0) {
            contentImageShow = false
        }
        if (contentImageShow&&this.state.dataArray.shop_reply_img_url.length == 1 && this.state.dataArray.shop_reply_img_url[0].length <= 1) {
            contentImageShow = false
        }
        if(!contentShow && !contentImageShow){
            replyShow = false
        }
        let images = []
        if(contentImageShow){
            let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
            for (let uri of this.state.dataArray.shop_reply_img_url){
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
            replyShow?<View style={{marginLeft:adaptSize(13),width:kScreenWidth-adaptSize(26),marginTop:adaptSize(17),paddingBottom:adaptSize(28),backgroundColor:'white',borderRadius:10}}>
                {contentShow?<View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(28)}}>
                    <YFWTitleView style_title={{fontSize:15}} title={'商家解释'}/>
                    <Text style={{marginTop:adaptSize(17),color:'rgb(51,51,51)',fontSize:13,lineHeight:20}}>{this.state.dataArray.shop_reply_content}</Text>
                </View>:null}
                {contentImageShow?<View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(27)}}>
                    <YFWTitleView style_title={{fontSize:15}} title={'举证图片'}/>
                    <ScrollView style={{flexDirection:'row',marginTop:adaptSize(10)}} horizontal={true}>
                        {images.map((item, index)=>this._renderUserImage(item.url, index,images))}
                    </ScrollView>
                </View>:null}
                <Text style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(18),fontSize:13,color:'rgb(153,153,153)'}}>{this.state.dataArray.shop_reply_time}</Text>
            </View>:null
        )

    }

    platform_reply() {
        let timeShow = true
        let isShow = true
        let contentStr
        let contentcolor
        if (isEmpty(this.state.dataArray.platform_reply_content)){
            contentStr = '商城正在处理中，请耐心等待！'
            contentcolor = 'rgb(254,172,76)'
            timeShow = false
        }else{
            contentStr = this.state.dataArray.platform_reply_content
            contentcolor = 'rgb(51,51,51)'
        }
        if(this.state.dataArray.status == '2' || this.state.dataArray.status == '0'){
            isShow = false
        }
        return (
            isShow?<View style={{marginLeft:adaptSize(13),width:kScreenWidth-adaptSize(26),marginTop:adaptSize(17),marginBottom:adaptSize(20),paddingBottom:adaptSize(28),backgroundColor:'white',borderRadius:10}}>
                <View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(28)}}>
                    <YFWTitleView style_title={{fontSize:15}} title={'商城处理'}/>
                    <Text style={{marginTop:adaptSize(17),color:contentcolor,fontSize:13,lineHeight:20}}>{contentStr}</Text>
                    {timeShow?<Text style={{marginTop:adaptSize(18),fontSize:13,color:'rgb(153,153,153)'}}>{this.state.dataArray.platform_reply_time}</Text>:null}
                </View>
            </View>:null
        );
    }

    botton_view() {
        let bottonShow = false
        if (isNotEmpty(this.state.dataArray.buttons)&&this.state.dataArray.buttons.length>0) {
            bottonShow = true
        }
        return (
            bottonShow?<View style={{marginLeft:adaptSize(13),width:kScreenWidth-adaptSize(26),marginTop:adaptSize(52)}}>
                 <YFWTouchableOpacity style_title={{height:adaptSize(42), width:kScreenWidth-adaptSize(26), fontSize: 17}} title={'撤销投诉'}
                                                     callBack={()=>this.onCancelAction()}
                                                     isEnableTouch={true}/>
            </View>:null
        )
    }


    /**
     * 请求
     */
    requestMyComplaintDetialData() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.complaints.getDetail');
        if (isNotEmpty(this.id)) {
            paramMap.set('orderno', this.id);
        }
        if (isNotEmpty(this.orderNo)) {
            paramMap.set('orderno', this.orderNo)
        }
        viewModel.TCPRequest(paramMap, (res) => {

            let result = YFWComplaintDetailModel.getModel(res.result);
            this.setState({
                dataArray: result,
            })
            switch (result.status) {
                case '0':
                    this.setState({statusColor: yfwOrangeColor()})
                    break;
                case '1':
                    this.setState({statusColor: yfwGreenColor()})
                    break;
                case '2':
                    this.setState({statusColor: darkLightColor()})
                    break;
            }

        });
    }

    cancelComplaint(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.complaints.cancel');
        if (isNotEmpty(this.orderNo)) {
            paramMap.set('orderno', this.orderNo);
        }
        if (isNotEmpty(this.id)) {
            paramMap.set('orderno', this.id);
        }
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('取消成功')
            this.props.navigation.goBack();
        });
    }

    onCancelAction() {
        this.cancleComplaintModal&&this.cancleComplaintModal.showView(()=>this.cancelComplaint())

    }

}