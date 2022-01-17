import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    DeviceEventEmitter, NativeModules, TextInput, ImageBackground
} from 'react-native';
import {
    dismissKeyboard_yfw,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth, onlyNumber, removeEmoji,
} from "../../../PublicModule/Util/YFWPublicFunction";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import YFWTouchableOpacity from "../../../widget/YFWTouchableOpacity";
import YFWToast from "../../../Utils/YFWToast";
import YFWMore from "../../../widget/YFWMore";
import YFWImagePicker from "../../../Utils/YFWImagePicker";
import YFWNativeManager from "../../../Utils/YFWNativeManager";
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";
import OrderTypeChooseView from "./View/OrderTypeChooseView";
import CounterfeitDrugExplanationView from "./View/CounterfeitDrugExplanationView";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import { o2oBlueColor } from '../../../Utils/YFWColor';
const {StatusBarManager} = NativeModules;
const IMAGE_UPLOAD_MAX = 3;
export default class OrderReportDetailPage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        // headerTitle: "申请投诉",
        header: null
    });

    constructor(props) {
        super(props);
        this.state = {
            /**
            reportTypeData:[
                    {id:3,text:'发货问题'},
                    {id:4,text:'商品问题'},
                    {id:5,text:'发票问题'},
                    {id:6,text:'商家问题'},
                    {id:7,text:'其他'}],
            reportReasonData:{
                3:[
                    {id:3,text:'物流延迟'},
                    {id:4,text:'缺货/发不了货/拒绝发货'},
                    {id:5,text:'错发/漏发/少发'},
                    {id:6,text:'异地发货'},
                    {id:7,text:'虚假发货'}
                ],
                4:[
                    {id:3,text:'退款退货'},
                    {id:4,text:'药品破损'},
                    {id:5,text:'药品批准文号/规格/有效期不符'},
                    {id:6,text:'药品有效期≤90天'},
                    {id:7,text:'药品过期'},
                    {id:5,text:'药品外包装有人为刮损/涂改'},
                    {id:5,text:'药品疑为假药/劣药'}
                ],
                5:[
                    {id:5,text:'未提供发票'},
                    {id:5,text:'使用其他发票'},
                    {id:5,text:'虚假发票'},
                    {id:5,text:'未提供任何销售凭证'},
                ],
                6:[
                    {id:5,text:'辱骂/诅咒/威胁'},
                    {id:5,text:'无法联系商家'},
                ],
                7:[],
            },
            **/
            itemPosition: this.props.navigation.state.params.itemPosition,
            pageSource: this.props.navigation.state.params.pageSource,

            reportTypeData: this.props.navigation.state.params.typeData,
            reportReasonData: this.props.navigation.state.params.reasonData,
            orderNo : this.props.navigation.state.params.orderNo,

            reportType:this.props.navigation.state.params.selectType,
            otoOrder:this.props.navigation.state.params.otoOrder,
            reportReason:'',
            reportText:'',
            imageUris:[],
            phoneNumberText:'',
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    onReportTextChange(text) {
        let inputText = text.replace(removeEmoji, '');
        this.setState({
            reportText: inputText
        })
    }

    onPhoneNumberTextChange(text) {
        let inputText = text.replace(onlyNumber, '');
        this.setState({
            phoneNumberText: inputText
        })
    }

    _selectPic() {
        if(this.state.imageUris >= IMAGE_UPLOAD_MAX){
            YFWToast('最多上传'+IMAGE_UPLOAD_MAX+'张')
            return
        }
        if(!this.imagePicker){
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.returnValue((result) => {
            if (isNotEmpty(result)) {
                DeviceEventEmitter.emit('LoadProgressShow')
                YFWNativeManager.tcpUploadImg(result, (imgUrl) => {
                    DeviceEventEmitter.emit('LoadProgressClose');
                    this.state.imageUris.push(imgUrl)
                    this.setState({});
                }, (error) => {
                    DeviceEventEmitter.emit('LoadProgressClose');
                    YFWToast('上传失败'+error)
                })
            }
        });
        this.imagePicker.show();
    }

    _removePic(index) {
        if(this.state.imageUris[index]){
            this.state.imageUris.splice(index, 1);
            this.setState({});
        }
    }

    _checkDateIsOk(){
        let isTypeOthers = this.state.reportType.text === '其他' || this.state.reportReasonData[this.state.reportType.id].length === 0
        if(!isTypeOthers && isEmpty(this.state.reportReason.text)){
            YFWToast('请选择投诉原因')
            return false
        }
        if(isEmpty(this.state.reportText)){
            YFWToast('请填写投诉说明')
            return false
        }
        let isImageNecessary = this.state.reportType.text === "发货问题" || this.state.reportType.text === "商品问题"
        if(isImageNecessary && this.state.imageUris.length === 0){
            YFWToast('请上传凭证')
            return false
        }
        if(isEmpty(this.state.phoneNumberText)){
            YFWToast('请填写联系电话')
            return false
        } else {
            if(this.state.phoneNumberText.length !== 11 || !this.state.phoneNumberText.startsWith(1)){
                YFWToast('请输入正确的手机号')
                return false
            }
        }
        return true
    }

    _commit() {
        if(!this._checkDateIsOk()){
            return
        }

        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('orderno', this.state.orderNo);
        paramMap.set('type', this.state.reportType.id);
        paramMap.set('content', this.state.reportText);
        paramMap.set('complaints_reason', this.state.reportReason.text);
        paramMap.set('account_name', 'name');
        paramMap.set('account_mobile', this.state.phoneNumberText);
        if (isNotEmpty(this.state.imageUris)) {
            paramMap.set("introImage", this.state.imageUris);
        }
        paramMap.set('__cmd', 'person.order.complaint');
        viewModel.TCPRequest(paramMap, (res) => {
            if (isNotEmpty(this.state.itemPosition)) {
                let noticeData = {
                    itemPosition: this.state.itemPosition,
                    pageSource: this.state.pageSource,
                };
                DeviceEventEmitter.emit('complain_order_status_refresh', noticeData);
            }
            this.props.navigation.goBack(this.props.navigation.state.params.goBackKey);
            YFWToast("提交成功")
        }, (error) => {}, true)

    }

//-----------------------------------------------RENDER---------------------------------------------
    _renderWarningView(){
        return (
            <View style={{flexDirection:'row',alignItems:'center',paddingTop:12,paddingBottom:10,paddingLeft: 10,paddingRight:13}}>
                <Image source={require('../../../../img/icon_warning_compaliant.png')} style={{width:27,height:27,resizeMode:'contain'}}/>
                <Text style={{	width:kScreenWidth-24-27-23,fontSize: 12, color: "#feac4c",marginLeft:8}}>{'温馨提示：投诉假药/劣药时，建议持有相关凭证，避免投诉无效，订单无法重复发起投诉。'}</Text>
            </View>
        )
    }

    _renderChooseTypeView() {
        let isReportReasonOK = isNotEmpty(this.state.reportReason)
        let reportType = this.state.reportType
        let reportReason = isReportReasonOK?this.state.reportReason:{text:'请选择投诉原因'}
        let reportTypeData = this.state.reportTypeData
        let reportReasonData = this.state.reportReasonData

        let isReasonCounterfeitDrug = reportReason.text === '药品疑为假药/劣药'
        let isTypeOthers = reportType.text === '其他' || reportReasonData[reportType.id].length === 0

        return (
            <View style={{marginVertical: 12}}>
                <TouchableOpacity style={{ marginLeft: 12,marginRight:14,height :60,flexDirection:'row', alignItems:'center'}}
                                  onPress={()=>{
                                      this.chooseView.show('投诉类型', reportTypeData, reportType, (data) => {
                                          if (this.state.reportType !== data) {
                                              this.setState({
                                                  reportType: data,
                                                  reportReason: '',
                                              })
                                          }
                                      })
                                  }}
                >
                    <Text style={{width:10,fontSize: 16,color:'#ff0101',fontWeight: 'bold'}}>{'*'}</Text>
                    <Text style={{	fontSize: 14, color: "#333333"}}>{'投诉类型'}</Text>
                    <View style={{flex:1}}/>
                    <Text style={{	fontSize: 14, color: "#333333",marginRight:8}}>{reportType.text}</Text>
                    <Image style={[style.arrowImg,{transform: [{ rotateZ: '90deg'}],}]}
                           source={require('../../../../img/message_next.png')} />
                </TouchableOpacity>
                {!isTypeOthers?
                    <View >
                        <View style={style.dividingLine}/>
                        <TouchableOpacity style={{ marginLeft: 12,marginRight:14,height :60,flexDirection:'row', alignItems:'center'}}
                                          onPress={()=>{this.chooseView.show('投诉原因',reportReasonData[reportType.id],reportReason,(data)=>{this.setState({reportReason:data})})}}>
                            <Text style={{width:10,fontSize: 16,color:'#ff0101',fontWeight: 'bold'}}>{'*'}</Text>
                            <Text style={{	fontSize: 14, color: "#333333"}}>{'投诉原因'}</Text>
                            <View style={{flex:1}}/>
                            <Text style={{	fontSize: 14, color: isReportReasonOK?'#333333':'#999999',marginRight:8}}>{reportReason.text}</Text>
                            <Image style={[style.arrowImg,{transform: [{ rotateZ: '90deg'}],}]}
                                   source={require('../../../../img/message_next.png')} />
                        </TouchableOpacity>
                    </View>
                    :null}
                {isReasonCounterfeitDrug?
                    <View style={{flex:1,alignItems:'flex-end'}}>
                        <TouchableOpacity style={{flexDirection:'row',alignItems:'center',marginRight:13}}
                                          onPress={()=>{this.explanationView.show()}}>
                            <Text style={{	fontSize: 12, color: "#999999"}}>{'假药/劣药'}</Text>
                            <Image source={require('../../../../img/icon_gary_wenhao.png')} style={{width:14,height:14,marginLeft:6,resizeMode:'contain'}}/>
                        </TouchableOpacity>
                    </View>
                    :null}
            </View>
        )
    }

    _renderInputView() {
        return (
            <View >
                <View style={{ marginLeft: 12, marginTop: 27 ,flexDirection:'row'}}>
                    <Text style={{width:10,fontSize: 16,color:'#ff0101',fontWeight: 'bold'}}>{'*'}</Text>
                    <Text style={{	fontSize: 14, color: "#333333"}}>{'投诉说明'}</Text>
                </View>
                <View style={{flexDirection:'column',alignItems: 'flex-end', marginTop: 15, marginBottom:20}}>
                    <TextInput underlineColorAndroid='transparent'
                               placeholder={'请描述具体情况，有助于投诉快速处理'}
                               placeholderTextColor={'#999999'}
                               multiline={true}
                               maxLength={200}
                               onChangeText={this.onReportTextChange.bind(this)}
                               value={this.state.reportText}
                               autoFocus={false}
                               returnKeyType={'done'}
                               onSubmitEditing={() => { dismissKeyboard_yfw() }}
                               style={style.textInput}/>
                    <Text style={{	fontSize: 14, color: "#999999",marginTop: 10, marginRight: 12}}>{this.state.reportText.length + '/200'}</Text>
                </View>
            </View>
        )
    }

    _renderUploadImageView() {
        let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
        let imageData = this.state.imageUris
        let isNecessary = this.state.reportType.text === "发货问题" || this.state.reportType.text === "商品问题"
        const { otoOrder } = this.state
        return (
            <View >
                <View style={{ marginLeft: 12, marginTop: 27 ,flexDirection:'row'}}>
                    {isNecessary?<Text style={{width:10,fontSize: 16,color:'#ff0101',fontWeight: 'bold'}}>{'*'}</Text>:null}
                    <Text style={{	fontSize: 14, color: "#333333"}}>{'上传凭证'}</Text>
                </View>
                <View style={{ flexDirection: 'row',flexWrap:'wrap',alignItems: 'center', marginTop: 10,marginLeft: 22,marginRight:12}}>
                    {imageData.length>0?imageData.map((item, index) =>{
                        return (
                            <View style={{alignItems:'center', justifyContent:'center',width: 90, height: 90,marginRight:10 }} key={index}>
                                <Image style={{ width: 90-8, height: 90-8, resizeMode: "contain" }}
                                       source={{ uri: 'http:' + cdn + '/' + imageData[index]}} />
                                <TouchableOpacity onPress={() => this._removePic(index)} style={{ position: 'absolute', right: -8, top: -8 }}
                                                  activeOpacity={1}>
                                    <Image style={{ width: 15, height: 15, resizeMode: "cover" }}
                                           source={require('../../../../img/ic_pic_del.png')} />
                                </TouchableOpacity>
                            </View>
                        );
                    }):null}
                    {imageData.length < IMAGE_UPLOAD_MAX?
                        <View style={{alignItems:'center', justifyContent:'center',width: 90, height: 90 }} key={imageData.length}>
                            <TouchableOpacity onPress={() => this._selectPic()} activeOpacity={1}>
                                {!otoOrder ? <ImageBackground style={{ width: 90, height: 90}} resizeMode='center' source={require('../../../../img/up_photo2.png')} >
                                    <Text style={{position:'absolute',bottom:8,left:0,right:0,textAlign:'center',fontSize:9,color:'#999'}} numberOfLines={2}>{'上传凭证\n（最多3张）'}</Text>
                                </ImageBackground>
                                :<View style={{width: 90, height: 90, justifyContent: 'center', alignItems: 'center', borderWidth:0.5, borderColor: '#ccc', borderRadius: 3}}>
                                    <Image source={require('../../../O2O/Image/camera.png')} style={{width: 50, height: 50, marginBottom: 10}} resizeMode={'center'} />
                                    <Text style={{position:'absolute',bottom:8,left:0,right:0,textAlign:'center',fontSize:9,color:'#999'}} numberOfLines={2}>{'上传凭证\n（最多3张）'}</Text>
                                </View>}
                            </TouchableOpacity>
                        </View>:null}
                </View>
                <Text style={{	marginLeft: 22, marginTop: 10, marginBottom: 30, fontSize: 12, color: "#feac4c", opacity: 0.9}}>{'请上传相关凭证，有助于投诉快速处理'}</Text>
            </View>
        )
    }

    _renderPhoneNumber() {
        return (
            <TouchableOpacity hitSlop={{left:0,top:10,bottom:10,right:0}} onPress={() => {this.phoneNumberInput&& this.phoneNumberInput.focus()}} activeOpacity={1}
                              style={{ marginLeft: 12, marginVertical: 17 ,flexDirection:'row', alignItems:'center'}}>
                <Text style={{width:10,fontSize: 16,color:'#ff0101',fontWeight: 'bold'}}>{'*'}</Text>
                <Text style={{	fontSize: 14, color: "#333333"}}>{'联系电话'}</Text>
                <TextInput underlineColorAndroid='transparent'
                           placeholder={'请输入正确的联系电话'}
                           placeholderTextColor={'#999999'}
                           keyboardType={'phone-pad'}
                           maxLength={11}
                           onChangeText={this.onPhoneNumberTextChange.bind(this)}
                           value={this.state.phoneNumberText}
                           autoFocus={false}
                           returnKeyType={'done'}
                           ref={(c) => this.phoneNumberInput = c}
                           onSubmitEditing={() => { dismissKeyboard_yfw() }}
                           style={{marginLeft:8,fontSize: 14, color: "#333333",padding:0}}/>
            </TouchableOpacity>
        )
    }

    _renderContent() {
        const { otoOrder } = this.state
        let isReasonCounterfeitDrug = this.state.reportReason.text === '药品疑为假药/劣药'
        return (
            <TouchableOpacity style={{ width: kScreenWidth}} onPress={() => { dismissKeyboard_yfw() }} activeOpacity={1}>
                {isReasonCounterfeitDrug?<View style={[style.content,{backgroundColor:'#faf8dc'}]}>
                    {this._renderWarningView()}
                </View>:null}
                <View style={style.content}>
                    {this._renderChooseTypeView()}
                </View>
                <View style={style.content}>
                    {this._renderInputView()}
                </View>
                <View style={style.content}>
                    {this._renderUploadImageView()}
                </View>
                <View style={style.content}>
                    {this._renderPhoneNumber()}
                </View>
                <View style={style.bottomBtmView}>
                    <YFWTouchableOpacity style_title={{ height: 44, width: kScreenWidth - 13 * 2, fontSize: 17 }}
                                         title={'提交申请'}
                                         callBack={() => { this._commit() }}
                                         isEnableTouch={true} 
                                         enableColors={otoOrder ? [o2oBlueColor(),o2oBlueColor()] : null}
                                         enableShaowColor={otoOrder ? 'rgba(87, 153, 247, 0.5)' : null}
                                         />
                </View>
            </TouchableOpacity>
        )
    }

    _renderHeaderView() {
        let marginTop
        if (Platform.OS === 'ios') {
            marginTop = isIphoneX() ? 44 + 2 : 20 + 2
        } else if (Platform.Version > 19) {
            marginTop = StatusBarManager.HEIGHT
        }
        const { otoOrder } = this.state
        const height = otoOrder ? marginTop + 50 : 173
        const backIcon = otoOrder ? require('../../../../img/icon_back_gray.png') : require('../../../../img/dingdan_back.png')
        return (
            <View style={{ width: kScreenWidth, height: height, resizeMode: 'contain', flexDirection: 'row', backgroundColor: otoOrder ? '#fff' : '#fafafa' }} >
                {!otoOrder && <Image style={{ height: height, width: kScreenWidth, position: 'absolute', top: 0, left: 0, right: 0, resizeMode: 'stretch' }} source={require('../../../../img/dingdan_bj.png')} />}
                <TouchableOpacity onPress={() => this.props.navigation.goBack()} activeOpacity={1}
                                  style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: marginTop }}>
                    <Image style={{ width: 11, height: 19, resizeMode: 'contain' }}
                           source={backIcon} />
                </TouchableOpacity>
                <View style={{ flex: 1, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: marginTop }}>
                    <Text style={{ textAlign: 'center', fontSize: 17, color: otoOrder ? '#333' : '#fff', fontWeight: 'bold' }}>申请投诉</Text>
                </View>
                <TouchableOpacity style={{ width: 50, height: 50, justifyContent: 'center', marginTop: marginTop }} activeOpacity={1}>
                    {!otoOrder && <YFWMore/>}
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        let magin_top = isIphoneX() ? 98 : 74

        return (
            <View style={{ flex: 1 , backgroundColor:'#fafafa'}}>
                {this._renderHeaderView()}
                {
                    Platform.OS === 'android'?
                        <KeyboardAvoidingView
                            style={{ position: 'absolute', top: magin_top, height: kScreenHeight - magin_top }}
                            behavior='padding'
                            keyboardVerticalOffset={20}
                        >
                            <ScrollView>
                                {this._renderContent()}
                            </ScrollView>
                        </KeyboardAvoidingView>
                        :
                        <KeyboardAwareScrollView
                            style={{ position: 'absolute', top: magin_top, height: kScreenHeight - magin_top }}
                            extraScrollHeight={100}
                            keyboardDismissMode='on-drag'
                            keyboardShouldPersistTaps='never'
                            showsVerticalScrollIndicator={true}
                            scrollEnabled={true}
                            pagingEnabled={false}
                            horizontal={false}
                        >
                            {this._renderContent()}
                        </KeyboardAwareScrollView>
                }
                <CounterfeitDrugExplanationView ref={(c) => this.explanationView = c} />
                <OrderTypeChooseView ref={(c) => this.chooseView = c} otoOrder={this.state.otoOrder} />
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
        marginTop:17,
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
    itemView: {
        flex:1,
        marginLeft:6,
        justifyContent: 'center',
        height: 72,
    },
    arrowImg: {
        width: 11,
        height: 11,
        resizeMode: 'contain'
    },
    dividingLine: {
        flex:1,
        height:1,
        marginLeft:22,
        marginRight:35,
        opacity: 0.2,
        backgroundColor:'rgb(204,204,204)'
    },
    textInput: {
        width:kScreenWidth-24-44,
        minHeight: 72,
        color: '#666666',
        fontSize: 14,
        padding: 0,
        textAlignVertical: 'top',
        marginLeft: 22,
        marginRight: 22
    },
    bottomBtmView: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop:50,
        paddingBottom:isIphoneX()?45:20
    }
});