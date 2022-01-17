import React, {Component} from 'react';
import {
    ScrollView,
    View,
    Keyboard,
    TextInput,
    Image,
    Text,
    DeviceEventEmitter,
    TouchableOpacity, Platform,NativeModules,Dimensions
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    isNotEmpty,
    kScreenHeight,
    safeObj,
    iphoneBottomMargin,isIphoneX,iphoneTopMargin
} from "../../../PublicModule/Util/YFWPublicFunction";
import {
    yfwGreenColor,
    backGroundColor,
    darkTextColor,
    darkLightColor,
    separatorColor,
    yfwOrangeColor
} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWImagePicker from '../../../Utils/YFWImagePicker';
const width = Dimensions.get('window').width;
const {StatusBarManager} = NativeModules;
import YFWHealthAskDepartmentDialogView from '../View/YFWHealthAskDepartmentDialogView';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import YFWNativeManager from '../../../Utils/YFWNativeManager'
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager'
import YFWToast from '../../../Utils/YFWToast'
import {pushNavigation} from '../../../Utils/YFWJumpRouting'
import {NUMBERS} from "../../../PublicModule/Util/RuleString";
import AndroidHeaderBottomLine from "../../../widget/AndroidHeaderBottomLine";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWUserDetailInfoModel from "../../../UserCenter/Model/YFWUserDetailInfoModel";
import YFWMore from '../../../widget/YFWMore'
import LinearGradient from "react-native-linear-gradient";
import YFWTouchableOpacity from "../../../widget/YFWTouchableOpacity";
export default class YFWHealthAskQuestionsController extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        headerTitle: "提问",
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:40,height:40,}]}
                              onPress={()=>navigation.goBack()}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                       source={ require('../../../../img/top_back_white.png')}
                       defaultSource={require('../../../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerStyle: Platform.OS == 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white',backgroundColor: 'white'},
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'bold', fontSize:17
        },
        headerRight: (
            <YFWMore/>
        ),
        headerBackground: <Image source={require('../../../../img/Status_bar.png')} style={{width:width, flex:1, resizeMode:'stretch'}}/>,
    });

    constructor(props) {
        super(props)

        this.state = {
            isShow:true,
            title: '',
            content: '',
            gender: '',
            age: '',
            department: '',
            imageUri: '',
            userMobile:'',
            imageUrlData: [],
            beforeComit: true,
            category_id:''
        }
    }

    componentDidMount() {
        DeviceEventEmitter.addListener('DepartmentBack', (value)=> {
            this.setState(()=>({
                department: value.dep_name,
                category_id: value.dep_id,
            }));
        });
        this.getTcpUserInfo()
    }

    /**
     * TCP模式下获取用户信息，主要是为了获取mobile字段
     */
    getTcpUserInfo() {

        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.account.getAccountInfo');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let data = YFWUserDetailInfoModel.getModelData(res.result)
                this.state.userMobile=data.mobile
            });
        }

    }

    //Action
    onChangeText(type, text) {

        if (type === 'title') {

            this.setState({
                title: text,
            });

        } else if (type === 'content') {

            this.setState({
                content: text,
            });

        } else if (type === 'age') {
            this.setState({
                age: text.replace(NUMBERS,''),
            });

        }

    }

    onBlur(type,text){
        if (type === 'age') {
            try {
                let age = parseInt(text.replace(NUMBERS,''))
                if(age > 120){
                    YFWToast("年龄不能大于120岁")
                    text = '120'
                }
            }catch (e) {}
            this.setState({
                age: text.replace(NUMBERS,''),
            });
        }
    }

    onChangeGender(type) {

        this.setState({
            gender: type,
        });

    }

    clickImageMethod() {
        if(!this.imagePicker){
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.returnValue((uri)=> {
            if (isNotEmpty(uri)) {

                YFWNativeManager.tcpUploadImg(uri,(url)=>{
                    //这里只能上传一张图片，所以一直放在第一位就好啦
                    this.state.imageUrlData.unshift(url);
                    this.setState({
                        imageUri: uri,
                    });
                },(msg)=>{
                    YFWToast(msg)
                })

            }
        });
        this.imagePicker.show();
    }

    takingPicturesMethod() {


    }

    photoAlbumsMethid() {


    }

    clickDepartmentMethod() {

        this.departmentDialog.showView();

    }


    onScroll() {

        Keyboard.dismiss();

    }

    //Request


    //View

    render() {
        let btnBottom= (Platform.OS === 'ios') ? 25 :10;
        if (this.state.beforeComit) {
            return (

                <KeyboardAwareScrollView>
                    <View style={[BaseStyles.container,{height:kScreenHeight-iphoneTopMargin()}]}>
                        <AndroidHeaderBottomLine/>
                        <ScrollView style={{backgroundColor:'white'}} onScroll={()=>this.onScroll()}
                                    ref="scrollView">
                            <View style={[BaseStyles.leftCenterView,{marginTop:0,height:64,backgroundColor:'white'}]}>

                                <TextInput
                                    maxLength={100}
                                    underlineColorAndroid='transparent'
                                    style={[BaseStyles.contentWordStyle,{marginLeft:23,flex:1,paddingRight:0,marginRight:20,fontSize:16,color:'#999999',fontWeight:'600'}]}
                                    placeholder={'请输入标题'}
                                    placeholderTextColor="#999999"
                                    clearButtonMode={'unless-editing'}
                                    onChangeText={(text)=>this.onChangeText('title',text)}/>
                            </View>
                            {this.state.isShow?<View style={{width:kScreenWidth-46,marginLeft:23,flexDirection:'row',borderRadius: 7,
	backgroundColor: "#f5f8f7",flex:1,paddingTop:15,paddingBottom:17}}>
                                <View style={{flexDirection:'column',marginRight:20}}>
                                    <View style={{flexDirection:'row',alignItems:'center'}}>
                                        <Image style={{marginLeft:6,width:15,height:15}}
                                            source={require('../../../../img/healthAsk_wen.png')}>

                                        </Image>
                                        <Text style={{fontSize: 16,color: "#85a694",marginLeft:8}}>让你的问题清晰明了</Text>
                                    </View>
                                    <View style={{flexDirection:'row',alignItems:'center',marginTop:13}}>
                                        <View style={{marginLeft:9,width:2,height:2,backgroundColor: "#85a694"}}/>
                                        <Text style={{fontSize: 12,color: "#85a694",marginLeft:8}}>请咨询药品名称、功能主治、药品相互作用、用法用量、不良反应，禁忌症等内容</Text>
                                    </View>
                                    <View style={{flexDirection:'row',alignItems:'center',marginTop:6}}>
                                        <View style={{marginLeft:9,width:2,height:2,backgroundColor: "#85a694"}}/>
                                        <Text style={{fontSize: 12,color: "#85a694",marginLeft:8}}>请不要咨询疾病的诊断和治疗方法，因为不能当面确诊，不做具体问答</Text>
                                    </View>
                                    <View style={{flexDirection:'row',alignItems:'center',marginTop:6}}>
                                        <View style={{marginLeft:9,width:2,height:2,backgroundColor: "#85a694"}}/>
                                        <Text style={{fontSize: 12,color: "#85a694",marginLeft:8}}>请不要提及个人姓名、电话等个人隐私信息，以免泄露</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={()=>{
                                    this.setState({
                                        isShow:false
                                    })
                                }} style={{position:'absolute',right:0,top:17,width:40,height:18,paddingVertical:3,paddingLeft:12}}>
                                    <Image style={{width:12,height:12}}
                                     source={require('../../../../img/close_button.png')}></Image>
                                </TouchableOpacity>
                            </View>:<View/>}
                            <View style={{height:192,backgroundColor:'white'}}>
                                <TextInput
                                    maxLength={500}
                                    style={[BaseStyles.contentWordStyle,{fontSize:13,marginTop:20,marginLeft:23,width:kScreenWidth-30,height:56,marginTop:13,fontSize: 12,width:kScreenWidth-46}]}
                                    placeholder={'详细描述您的问题，方便医生诊断。'} multiline={true}
                                    placeholderTextColor="#cccccc"
                                    onChangeText={(text)=>this.onChangeText('content',text)}/>
                                <View style={[BaseStyles.leftCenterView,{height:103,marginTop:10}]}>
                                    <TouchableOpacity activeOpacity={1} onPress={()=>this.clickImageMethod()}>
                                        {this._renderImageChooseView()}
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{backgroundColor:backGroundColor(),height:10,width:kScreenWidth}}></View>
                            <View style={{height:171,backgroundColor:'white'}}>

                                <View style={{height:57}}>
                                    <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                                        <Text style={{fontSize:13,color:'#999999',marginLeft:23,marginRight:10}}>性别：</Text>
                                        {this._renderGenderItem()}
                                    </View>
                                    <View style={[BaseStyles.separatorStyle,{backgroundColor: "#cccccc",marginLeft:23,width:kScreenWidth-46,height:0.5}]}/>
                                </View>
                                <View style={{height:57}}>
                                    <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                                        <Text
                                            style={[BaseStyles.titleWordStyle,{fontSize:13,color:'#999999',marginLeft:23}]}>年龄：</Text>
                                        <TextInput
                                            maxLength={3}
                                            style={[BaseStyles.contentWordStyle,{marginLeft:10,width:kScreenWidth-70}]}
                                            placeholder={'请输入年龄（0-120岁）'}
                                            placeholderTextColor="#cccccc"
                                            keyboardType={'number-pad'}
                                            value = {this.state.age}
                                            onBlur={()=>this.onBlur('age',this.state.age)}
                                            onChangeText={(text)=>this.onChangeText('age',text)}/>
                                    </View>
                                    <View style={[BaseStyles.separatorStyle,{backgroundColor: "#cccccc",marginLeft:23,width:kScreenWidth-46,height:0.5}]}/>
                                </View>
                                <View style={{height:57}}>
                                    <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                                        <Text
                                            style={[BaseStyles.titleWordStyle,{fontSize:13,color:'#999999',marginLeft:23}]}>选择科室：</Text>
                                        <TouchableOpacity activeOpacity={1} style={{flex:1}}
                                                          onPress={()=>this.clickDepartmentMethod()}>
                                            <Text
                                                style={[BaseStyles.contentWordStyle,{marginLeft:10}]}>{this.state.department}</Text>
                                        </TouchableOpacity>
                                        <Image style={{width: 7, height: 12, marginRight: 23}}
                                               source={require('../../../../img/around_detail_icon.png')}/>
                                    </View>
                                    <View style={[BaseStyles.separatorStyle,{backgroundColor: "#cccccc",marginLeft:23,width:kScreenWidth-46,height:0.5}]}/>
                                </View>
                            </View>

                        </ScrollView>
                        <View style={{width:kScreenWidth,justifyContent:'center',alignItems:'center',bottom:iphoneBottomMargin() + btnBottom,position:'absolute'}}>
                                <YFWTouchableOpacity style_title={{height:(kScreenWidth-30)/375*40, width:kScreenWidth-30, fontSize: 16}}
                                                    title={'提交'}
                                                    callBack={() => {this._submitQuestion()}}
                                                    isEnableTouch = {true}/>
                            </View>
                        <YFWHealthAskDepartmentDialogView ref={(dialog) => { this.departmentDialog = dialog; }}/>
                    </View>
                </KeyboardAwareScrollView>
            )
        } else {
            return (<View style={[{flex: 1, backgroundColor: backGroundColor(),alignItems: 'center'}]}>
                <View style={[BaseStyles.centerItem,{marginTop:100}]}>
                    <Image source={require('../../../../img/user_center_payback_ok.png')}
                           resizeMode='cover'
                           style={{width: 180, height: 90,resizeMode:'contain'}}/>
                    <Text
                        style={[BaseStyles.contentStyle, {marginTop: 20, marginLeft: null,fontSize:16}]}>恭喜您，问题提交成功</Text>
                    <TouchableOpacity onPress={() => {
                        const {navigate} = this.props.navigation;
                        this.props.navigation.pop();
                        pushNavigation(navigate, {type: 'get_myASK'});
                    }}
                                      style={[BaseStyles.centerItem, {marginTop: 20, borderRadius: 3, backgroundColor: yfwGreenColor(),padding:10}]}
                    >
                        <Text style={{color: '#FFFFFF', fontSize: 14}}>去"我的问答"查看</Text>
                    </TouchableOpacity>
                </View>
            </View>)
        }
    }

    _renderGenderItem() {

        let menIcon = require('../../../../img/unChooseBtn.png');
        let womenIcon = require('../../../../img/unChooseBtn.png');
        if (this.state.gender == '1') {
            menIcon = require('../../../../img/chooseBtn.png');
        } else if(this.state.gender == '0'){
            womenIcon = require('../../../../img/chooseBtn.png');
        }

        return (
            <View style={[BaseStyles.leftCenterView,{}]}>
                <TouchableOpacity
                                  onPress={()=>this.onChangeGender('1')}>
                    {/* <Image style={{width: 15, height: 15, resizeMode: "contain"}}
                           source={menIcon}/> */}

                    {this.state.gender=='1'?
                        <View style={[{
                            shadowColor: "rgba(31, 219, 155, 0.4)",
                            shadowOffset: {
                                width: 0,
                                height: 2
                            },
                            shadowRadius: 5,
                            shadowOpacity: 1
                            }]}>
                            <LinearGradient colors={['rgba(31,219,155,0.9)','rgba(0,200,145,1.0)']}
                                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                                locations={[0,1]}
                                                style={[BaseStyles.leftCenterView,BaseStyles.centerItem,{ width:53,height:20,
                                                borderRadius: 7,
                                                }]}>
                                            <Text style={[BaseStyles.contentWordStyle,{color:'white'}]}>男</Text>
                            </LinearGradient>
                        </View>:<View style={[BaseStyles.leftCenterView,BaseStyles.centerItem,{ width:53,height:20,borderRadius: 7,borderStyle: "solid",borderWidth: 1,borderColor: "#1fdb9b"}]}>
                            <Text style={[BaseStyles.contentWordStyle,{color:'#1fdb9b'}]}>男</Text>
                        </View>}
                </TouchableOpacity>
                <TouchableOpacity style={{marginLeft:11}}
                                  onPress={()=>this.onChangeGender('0')}>
                    {this.state.gender=='0'?
                        <View style={[{
                            shadowColor: "rgba(31, 219, 155, 0.4)",
                            shadowOffset: {
                                width: 0,
                                height: 2
                            },
                            shadowRadius: 5,
                            shadowOpacity: 1
                            }]}>
                            <LinearGradient colors={['rgba(31,219,155,0.9)','rgba(0,200,145,1.0)']}
                                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                                locations={[0,1]}
                                                style={[BaseStyles.leftCenterView,BaseStyles.centerItem,{ width:53,height:20,
                                                borderRadius: 7,
                                                }]}>
                                            <Text style={[BaseStyles.contentWordStyle,{color:'white'}]}>女</Text>
                            </LinearGradient>
                        </View>:<View style={[BaseStyles.leftCenterView,BaseStyles.centerItem,{ width:53,height:20,borderRadius: 7,borderStyle: "solid",borderWidth: 1,borderColor: "#1fdb9b"}]}>
                        <Text style={[BaseStyles.contentWordStyle,{color:'#1fdb9b'}]}>女</Text>
                    </View>}
                </TouchableOpacity>
            </View>
        );

    }


    _renderImageChooseView() {

        if (isNotEmpty(this.state.imageUri) && this.state.imageUri.length > 0) {

            return (
                <View style={[BaseStyles.centerItem,{width:103,height:103,marginLeft:23}]}>
                    <Image style={{width: 80, height: 80, resizeMode: "contain"}}
                           source={{uri:this.state.imageUri}}/>
                </View>
            );

        } else {

            return (
                <View
                    style={[BaseStyles.centerItem,{width:103,height:103,marginLeft:23,
                        backgroundColor:'white',borderRadius: 7,
                        borderStyle: "dashed",
                        borderWidth: 1,
                        borderColor: "#cccccc"}]}>
                    <Image style={{width: 37, height: 37, resizeMode: "contain"}}
                           source={require('../../../../img/healthAsk_add_gray.png')}/>
                    <Text style={{fontSize:12,color:"#cccccc",marginTop:15}}>添加图片</Text>
                </View>
            );

        }


    }


    _submitQuestion() {

        if(this.state.title.length<10){
            YFWToast('标题不能小于10个字')
            return
        }
        if (isEmpty(this.state.gender)){
            YFWToast('请选择性别');
            return;
        }
        if(isEmpty(this.state.age)){
            YFWToast('年龄不能为空')
            return
        }
        if(isEmpty(this.state.category_id)){
            YFWToast('请选择科室')
            return
        }

        let model = {
            title: this.state.title,//标题
            description:this.state.content,//描述
            departmentid:this.state.category_id,//ID
            dict_sex:this.state.gender,//性别
            age:this.state.age,//年龄
            phone:this.state.userMobile,//电话
            intro_image:safeObj(this.state.imageUrlData)[0],//图片
        }

        let paramMap = new Map();
        paramMap.set('__cmd', 'person.ask.insert');
        paramMap.set('model', model);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if(res && res.code == 1){
                this.props.navigation.goBack()
                YFWToast("提交成功")
            }
        },(error)=>{
            if(error){
                YFWToast(error.msg)
            }
        });

    }
}