/**
 * Created by admin on 2018/6/5.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
    ImageBackground,
    DeviceEventEmitter, Platform
} from 'react-native';
import EditView from '../widget/EditView'
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWRequest from '../Utils/YFWRequest'
import Navigation from "react-navigation";
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import YFWToast from '../Utils/YFWToast'
import TopBar from './TopBar'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import {
    yfwOrangeColor,
    backGroundColor,
    darkNomalColor,
    darkLightColor,
    yfwGreenColor,
    darkTextColor,
    separatorColor
} from './../Utils/YFWColor'
import {log, logErr, logWarm} from '../Utils/YFWLog'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {
    darkStatusBar,
    imageJoinURL,
    isNotEmpty,
    itemAddKey,
    mapToJson,
    safe,
    safeArray,
    isEmpty,
    kScreenWidth,
    safeObj
} from "../PublicModule/Util/YFWPublicFunction";
import YFWSellerCollectionModel from "./Model/YFWSellerCollectionModel";
import YFWImagePicker from "../Utils/YFWImagePicker";
import ActionSheet from 'react-native-actionsheet'
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWUserDetailInfoModel from "./Model/YFWUserDetailInfoModel";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {newSeparatorColor} from "../Utils/YFWColor";
import YFWMore from '../widget/YFWMore';
import { pushNavigation } from '../Utils/YFWJumpRouting';

export default class UserInfo extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: (!(navigation.state.params&&navigation.state.params.state&&navigation.state.params.state.from == 'setting')?"账户信息":'安全管理'),
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'normal', fontSize:17
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                              onPress={() => {navigation.goBack()}}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                       source={ require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerRight: (
            <YFWMore/>
        ),
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            data: '',
            userName: '',
            sex: '',
            userMobile: '',
            userTel: '',
            userQq: '',
            imageUri: '',
            saveImageDataArray: [],
            isDefaultPwd:undefined,
            isRealName: false
        }
    }

    componentDidMount() {

        darkStatusBar();
        if (!this._checkIsCloseType()) {
            this._requestUserInfo();
        }
        this.updataSex = DeviceEventEmitter.addListener('usersexchange', (sex)=> {
            //进行网络请求 更新性别
            this._updataSex();
            this.setState({sex: sex});
        })
        this.updataPsw =  DeviceEventEmitter.addListener('SET_PSW_SUCCESS',()=>{
            this.setState({isDefaultPwd:false})
        })
        this.updataRealName =  DeviceEventEmitter.addListener('VERIFY_REALNAME_SUCCESS',(value)=>{
            this.setState({ isRealName:true })
            this.state.data.real_name = safe(safeObj(value).realName)
            this.state.data.idcard_no = safe(safeObj(value).idCardNo)
        })

    }

    componentWillUnmount(){
        this.updataSex&&this.updataSex.remove();
        this.updataPsw&&this.updataPsw.remove();
        this.updataRealName && this.updataRealName.remove();
    }

    _renderUserIcon(){
        if(Platform.OS == 'ios') {
            return (
                <View style={styles.imgShadowStyle}>
                    <Image style={styles.imgStyle} source={{uri: imageJoinURL(this.state.imageUri)}} />
                </View>
            )
        }else {
            return (
                <View style={styles.imgShadowStyle}>
                    <Image style={styles.imgStyle} source={{uri: this.state.imageUri}} />
                </View>
            )
        }
    }


    render() {
        if (this._checkIsCloseType()) {
            return (
                <View style={{flex:1, backgroundColor:backGroundColor()}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        this._killAccount()
                    }}>
                        <View
                            style={{flexDirection:'row',height:50,padding:12,alignItems:'center',backgroundColor:'white'}}>
                            <Text style={styles.itemTitleStyle}>注销账号</Text>
                            <View style={{flex:1}}/>
                            <Image style={styles.nextBtnStyle}
                                source={ require('../../img/uc_next.png')}>
                            </Image>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
        return (
            <View style={{flex:1, backgroundColor:backGroundColor()}}>
                <View style={{backgroundColor:'white'}}>
                    <TouchableOpacity activeOpacity={1} onPress={this._chooseUserPic.bind(this)}>
                        <View style={{flexDirection:'row',padding:12,alignItems:'center',height:90}}>
                            <Text style={styles.itemTitleStyle}>头像</Text>
                            <View style={{flex:1}}/>
                            {this._renderUserIcon()}
                            <Image style={styles.nextBtnStyle}
                                   source={ require('../../img/uc_next.png')}>
                            </Image>
                        </View>
                    </TouchableOpacity>
                    {this._renderSeparator()}
                    {/* <TouchableOpacity activeOpacity={1} onPress={()=>{
                        YFWNativeManager.mobClick('account-my account-info-name');
                        let {navigate} = this.props.navigation
                        pushNavigation(navigate,{
                            type:'user_change_name',
                            newName:this.state.userName,
                            callback:(name)=>{
                              this.setState(()=>({
                              userName:name
                                  }))
                            }})}}>
                        <View style={{flexDirection:'row',padding:12,height:50,alignItems:'center'}}>
                            <Text style={styles.itemTitleStyle}>真实姓名</Text>
                            <View style={{flex:1}}/>
                            <Text numberOfLines={1} style={{flex:2,color:darkLightColor(),fontSize:14,textAlign: 'right'}}>{this.state.userName}</Text>
                            <Image style={styles.nextBtnStyle}
                                   source={ require('../../img/uc_next.png')}>
                            </Image>
                        </View>
                    </TouchableOpacity> */}
                    {this._renderSeparator()}
                    <TouchableOpacity activeOpacity={1} onPress={this._showActionSheet.bind(this)}>
                        <View style={{flexDirection:'row',height:50,padding:12,alignItems:'center'}}>
                            <Text style={styles.itemTitleStyle}>性别</Text>
                            <View style={{flex:1}}/>
                            <Text
                                style={{color:darkLightColor(),fontSize:14}}>{isEmpty(this.state.sex)?'':this.state.sex == '1'?'男':'女'}</Text>
                            <Image style={[styles.nextBtnStyle, {opacity: this.state.isRealName ? 0 : 1}]}
                                   source={ require('../../img/uc_next.png')}>
                            </Image>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{backgroundColor:'white',marginTop:10}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        this._verifyRealName()
                    }}>
                        <View style={{flexDirection:'row',height:50,padding:12,alignItems:'center'}}>
                            <Text style={[styles.itemTitleStyle, {flex: 1}]}>实名认证</Text>
                            <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'center'}}>
                                <Image style={{width: 14, height: 16, marginRight: 8, opacity: this.state.isRealName ? 1 : 0}} source={ require('../../img/icon_real_name_success.png')}></Image>
                                <Text numberOfLines={1} style={{color:darkLightColor(),fontSize:14,textAlign: 'right'}}>{this.state.isRealName ? '已实名' : '未实名'}</Text>
                                <Image style={styles.nextBtnStyle} source={ require('../../img/uc_next.png')}></Image>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {this._renderSeparator()}
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        YFWNativeManager.mobClick('account-my account-info-phone number');
                        if(safe(this.state.userMobile) == ''){
                            this.props.navigation.navigate('BindUserPhoneNum', {gobackKey:this.props.navigation.state.key,from:'updateMobile',callBack:()=>{
                                this._requestUserInfo();
                            }})
                        }else{
                            this.props.navigation.navigate('UpdataUserPhone',{
                                userMobile:this.state.userMobile,
                                callback:(mobile)=>{
                                  this.setState(()=>({
                                  userMobile:mobile
                                      }))
                                }})
                        }

                        }}>
                        <View style={{flexDirection:'row',height:50,padding:12,alignItems:'center'}}>
                            <Text style={styles.itemTitleStyle}>手机</Text>
                            <View style={{flex:1}}/>
                            <Text numberOfLines={1} style={{flex:2,color:darkLightColor(),fontSize:14,textAlign: 'right'}}>{this.state.userMobile}</Text>
                            <Image style={styles.nextBtnStyle}
                                   source={ require('../../img/uc_next.png')}>
                            </Image>
                        </View>
                    </TouchableOpacity>
                    {this._renderSeparator()}
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        YFWNativeManager.mobClick('account-my account-info-qq');
                        let {navigate} = this.props.navigation
                        pushNavigation(navigate,{
                            type:'user_change_qq',
                            callback:(userQq)=>{
                                this.setState(()=>({
                                    userQq:userQq
                                }))
                            }})}}>
                        <View style={{flexDirection:'row',height:50,padding:12,alignItems:'center'}}>
                            <Text style={styles.itemTitleStyle}>QQ</Text>
                            <View style={{flex:1}}/>
                            <Text numberOfLines={1} style={{flex:2,color:darkLightColor(),fontSize:14,textAlign: 'right'}}>{this.state.userQq}</Text>
                            <Image style={styles.nextBtnStyle}
                                   source={ require('../../img/uc_next.png')}>
                            </Image>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{marginTop:10,backgroundColor:'white'}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        YFWNativeManager.mobClick('account-my account-info-password');
                        this._updataPwd()
                    }}>
                        <View
                            style={{flexDirection:'row',height:50,padding:12,alignItems:'center'}}>
                            <Text style={styles.itemTitleStyle}>密码</Text>
                            <View style={{flex:1}}/>
                            <Text style={{color:darkLightColor(),fontSize:14}}>{this.state.isDefaultPwd?'设置密码':'修改密码'}</Text>
                            <Image style={styles.nextBtnStyle}
                                source={ require('../../img/uc_next.png')}>
                            </Image>
                        </View>
                    </TouchableOpacity>
                </View>
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={'性别'}
                    options={['男', '女', '取消']}
                    cancelButtonIndex={2}
                    // destructiveButtonIndex={1}       //显示红的字体
                    onPress={(index) => {
                        if (index == 0){
                            this.state.sex = '1'
                            this._updataSex()
                        }else if (index == 1) {
                            this.state.sex = '0'
                            this._updataSex()
                        }
                    }}
                />
            </View>
        )
    }

    _verifyRealName () {
        YFWNativeManager.mobClick('account-my account-info-verifyName');
        const { navigate } = this.props.navigation
        const { isRealName } = this.state
        if (isRealName) {
            const realName = isRealName ? this.state.data.real_name : '' 
            const idCardNo = isRealName ? this.state.data.idcard_no : '' 
            pushNavigation(navigate, { type:'verify_real_name', from: 'UserInfo', isRealName: isRealName, realName: realName, idCardNo: idCardNo })
        } else {
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.userdrug.GetListByAccountId');
            viewModel.TCPRequest(paramMap, (res)=> {
                let patients = []
                safeArray(res.result).map(patientTtem => {
                    if (patientTtem.dict_bool_certification == 1) {
                        patients.push(patientTtem)
                    }
                })
                if (patients.length == 0) {
                    pushNavigation(navigate, { type:'verify_real_name', from: 'UserInfo', isRealName: false, realName: '', idCardNo: ''})
                } else {
                    pushNavigation(navigate, { type:'verify_fast_real_name', from: 'UserInfo', patients: patients })
                }
            },(error)=>{
                if (isNotEmpty(error) && isNotEmpty(error.msg)) {
                    YFWToast(error.msg)
                }
            })
        }
    }

    _renderSeparator() {
        return <View style={{height:1,backgroundColor:newSeparatorColor(),opacity: 0.2,marginLeft:16}}/>
    }

    _checkIsCloseType() {
        return this.props.navigation.state.params&&this.props.navigation.state.params.state&&this.props.navigation.state.params.state.from == 'setting'
    }
    _killAccount() {
        let {navigate} = this.props.navigation
        pushNavigation(navigate,{type:'close_account',mobile:this.state.userMobile})
    }
    _updataPwd(){
        let type;
        if(this.state.isDefaultPwd){
            type = 'create'
        }else {
            type = 'update'
        }
        let {navigate} = this.props.navigation
        pushNavigation(navigate,{type:'user_change_pwd',editType:type})
    }

    _showActionSheet = () => {
        if (this.state.isRealName) {
            return
        }
        YFWNativeManager.mobClick('account-my account-info-sex');
        this.ActionSheet.show()
    }

    _chooseUserPic() {
        YFWNativeManager.mobClick('account-my account-info-headimage');
        if(!this.imagePicker){
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.setAllowsEditing(true);
        this.imagePicker.returnValue((uri)=> {
            if (isNotEmpty(uri)) {
                this.state.saveImageDataArray.push(uri)
                this.setState({
                    imageUri: uri,
                });
                this._updataUserPic(uri);
            }
        });
        this.imagePicker.show();
    }

    _updataSex() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.account.updateSex_app');
        paramMap.set('sex', this.state.sex == '1' ? '1' : '0');
        viewModel.TCPRequest(paramMap, (res) => {
            this.setState({
            })
            YFWToast('修改成功')
        });
    }

    _updataUserPic(uri) {
        YFWNativeManager.tcpUploadImg(uri, (image) => {

            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.account.updateAccountImg');
            paramMap.set('intro_image', safe(image));
            viewModel.TCPRequest(paramMap, (res) => {
                YFWToast('修改成功')
            });

        });
    }

    _requestUserInfo(){
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.account.getAccountInfo');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            let data = YFWUserDetailInfoModel.getModelData(res.result)
            this.setState(() => ({
                data: data,
                userName: safe(data.real_name).length > 0?data.real_name:data.account_name,
                sex: data.sex,
                userMobile: data.mobile,
                userTel: data.phone,
                userQq: data.qq,
                imageUri: data.img_url,
                isDefaultPwd:data.isDefaultPwd,
                isRealName: data.isRealName
            }))
        });
    }

}
const styles = StyleSheet.create({
    itemTitleStyle: {
        color: darkTextColor(),
        fontSize: 14,
        marginLeft:4
    },
    imgStyle: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    imgShadowStyle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        elevation: 5,
        shadowColor: "rgba(0, 0, 0, 0.11)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 7,
        shadowOpacity: 2
    },
    nextBtnStyle: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
        marginLeft: 10
    }
})
