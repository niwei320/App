/**
 * Created by admin on 2018/7/19.
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    DeviceEventEmitter,
    Platform,
    NativeModules
} from 'react-native';
const width = Dimensions.get('window').width;
import { BaseStyles } from './../Utils/YFWBaseCssStyle'
import { darkLightColor, darkNomalColor, backGroundColor, darkTextColor, yfwLineColor } from './../Utils/YFWColor'
import YFWSwitchAddressView from "../widget/YFWSwitchAddressView"
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWNativeManager from "../Utils/YFWNativeManager";
import { mapToJson, dismissKeyboard_yfw, itemAddKey, kScreenWidth, safe, safeObj } from "../PublicModule/Util/YFWPublicFunction";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import YFWToast from "../Utils/YFWToast";
import YFWAddressModel from "./Model/YFWAddressModel";
import ShippingAddressDetailModel from "./Model/ShippingAddressDetailModel";
import { EMOJIS } from '../PublicModule/Util/RuleString';
import YFWAddressTipAlert from './View/YFWAddressTipAlert';
const { StatusBarManager } = NativeModules;
export default class ShippingAddressDetail extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 50, height: 40 }]}
                onPress={() => { navigation.goBack() }}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerRight: (
            <TouchableOpacity
                onPress={() => this2.onRightTvClick(navigation)}
                hitSlop={{left:10,top:10,bottom:15,right:10}}
                activeOpacity={1}>
                <Text style={{ fontSize: 16, color: '#fff', marginRight: 5 }}
                >保存    </Text>
            </TouchableOpacity>
        ),
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor: 'transparent',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomWidth: 0 },
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{ width: kScreenWidth, flex: 1, resizeMode: 'cover' }} />,
        tabBarVisible: false,
        headerTitle: `${navigation.state.params.editType == 'update' ? "编辑地址" : "新增地址"}`,

    });

    constructor(props) {
        super(props);
        this.infoMsg = '';
        this.phoneClean = '0';
        this2 = this;
        this.state = {
            receiver: '',
            userPhone: '',
            userAddress: '',
            userAddressDetail: '',
            userRegion: '',
            isDefault: '0'
        }
    }

    checkAddressInfo() {
        if (this.state.receiver  == '' ) {
            this.infoMsg = "姓名不能为空";
            return false;
        }
        if (this.state.userPhone  == '' ) {
            this.infoMsg = "手机号码不能为空";
            return false;
        }
        if (this.state.userAddress  == '' ) {
            this.infoMsg = "地区未选择";
            return false;
        }
        this.state.userAddressDetail = safe(this.state.userAddressDetail).replace(/\s*/g,"")
        this.state.userAddressDetail = safe(this.state.userAddressDetail).replace(this.state.userAddress,'');
        this.setState({})
        if (this.state.userAddressDetail  == '' ) {
            this.infoMsg = "详细地址不能为空";
            return false;
        }
        if (this.state.receiver.length < 2) {
            this.infoMsg = "姓名至少2个字符，中文或英文";
            return false;
        }
        if (this.state.receiver.length > 12) {
            this.infoMsg = "姓名最多12个字符，中文或英文";
            return false;
        }
        let regExp = /[0-9]/;
        let hasNum = regExp.test(this.state.receiver)
        if (hasNum) {
            this.infoMsg = "姓名中不能出现数字";
            return false;
        }

        if(this.checkPoint(this.state.receiver)){
            this.infoMsg = "姓名中只能有一个点，且位置不能再两端";
            return false;
        }
        if (this.props.navigation.state.params.editType == 'update' && this.state.userPhone && this.state.userPhone.substr(3,4) == '****') {
            return true
        }
        let phone = this.state.userPhone.replace(/[^0-9]/ig, '')
        if (phone.length != 11) {
            this.infoMsg = "手机号码格式不正确";
            return false;
        }
        if (this.state.userAddress.length == 0) {
            this.infoMsg = "请选择所在地区";
            return false;
        }
        if (this.state.userAddressDetail.length < 5) {
            this.infoMsg = "详细地址不得少于5个字";
            return false;
        }
        regExp = /[`~!@#$^&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g;
        let hasSpecial = regExp.test(this.state.userAddressDetail)
        if (hasSpecial) {
            this.infoMsg = "详细地址不能输入特殊字符";
            return false;
        }
        return true;
    }


    checkPoint(str){
        let checkResult = false;
        let hasPinZH = false;
        let hasPintEN = false;

        if (str.indexOf(".") != -1) {
            hasPintEN = true
            let array = str.split('.')
            if(array.length>2){
                checkResult = true
            }
            if(safe(array[0]).length==0 || safe(array[1]).length==0){
                checkResult = true
            }
        }
        if (str.indexOf("·") != -1) {
            hasPintZN = true
            let array = str.split("·")
            if(array.length>2){
                checkResult = true
            }
            if(safe(array[0]).length==0 || safe(array[1]).length==0){
                checkResult = true
            }
        }
        if(hasPinZH&&hasPintEN){
            checkResult = true
        }
        return checkResult
    }


    onRightTvClick() {
        dismissKeyboard_yfw();
        if (this.checkAddressInfo()) {
            this.saveAddressInfo()
        } else {
            YFWToast(this.infoMsg)
        }


    }

    saveAddressInfo() {
        let address_name = this.state.userAddress + this.state.userAddressDetail;
        //地址去除空格
        address_name = address_name.replace(/\s*/g, '')
        if (this.props.navigation.state.params.editType == 'update') {
            let paramMap = new Map();
            let infoMap = new Map();

            infoMap.set('name', this.state.receiver);
            infoMap.set('id', this.props.navigation.state.params.addressData.id);
            infoMap.set('regionid', this.state.userRegion ? this.state.userRegion : this.props.navigation.state.params.addressData.region_id);
            infoMap.set('mobile', this.state.userPhone);
            infoMap.set('dict_bool_default', this.state.isDefault);
            infoMap.set('address_name', address_name);
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.address.update');
            paramMap.set('data', mapToJson(infoMap));

            viewModel.TCPRequest(paramMap, (res) => {
                if (res.code == 1) {
                    if (this.props.navigation.state.params.callBack) {
                        this.props.navigation.state.params.callBack();
                    }
                    this.props.navigation.pop();
                    DeviceEventEmitter.emit('kChangeAddress')
                }
            });
        } else {
            let paramMap = new Map();
            let infoMap = new Map();

            infoMap.set('name', this.state.receiver);
            infoMap.set('dict_bool_default', this.state.isDefault);
            infoMap.set('regionid', this.state.userRegion);
            infoMap.set('mobile', this.state.userPhone);
            infoMap.set('address_name', address_name);
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.address.insert');
            paramMap.set('data', mapToJson(infoMap));

            viewModel.TCPRequest(paramMap, (res) => {
                if (res.code == 1) {
                    if (this.props.navigation.state.params.callBack) {
                        this.props.navigation.state.params.callBack();
                    }
                    this.props.navigation.pop();
                    DeviceEventEmitter.emit('kChangeAddress')
                }
            });
        }
    }

    onRegionClick() {
        this.ref_switchaddress.showView();
        dismissKeyboard_yfw();
    }

    defaultAddress() {
        if (this.state.isDefault == '1') {
            return (
                <View style={{ justifyContent: 'flex-start', alignItems: 'center', width: 20 }}>
                    <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('../../img/chooseBtn.png')} />
                </View>
            )
        } else {
            return (
                <View style={{ justifyContent: 'flex-start', alignItems: 'center', width: 20 }}>
                    <Image style={{ width: 16, height: 16, resizeMode: 'contain' }} source={require('../../img/check_discheck.png')} />
                </View>
            )

        }
    }
    changeDefaultAddress() {
        var addressState;
        if (this.state.isDefault == '1') {
            addressState = '0';
        } else {
            addressState = '1';
        }
        this.setState(() => ({
            isDefault: addressState
        }))

    }
    requestAddressDetailData() {
        if (this.props.navigation.state.params.editType == 'update') {
            this.phoneClean = '1';
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.address.getAddressInfo');
            paramMap.set('id', this.props.navigation.state.params.addressData.id);
            viewModel.TCPRequest(paramMap, (res) => {
                let data = ShippingAddressDetailModel.getModelData(res.result);
                this.setState({
                    receiver: data.name,
                    userPhone: data.mobile,
                    userAddress: data.userAddress,
                    userAddressDetail: data.userAddressDetail,
                    isDefault: data.isDefault,
                });
            });
        }
    }

    componentDidMount() {
        this.requestAddressDetailData();
        DeviceEventEmitter.addListener('AddressBack', (value) => {
            let data = value;
            this.setState(() => ({
                userAddress: data.get('name'),
                userRegion: data.get('id'),
            }));
        });
        if (this.props.navigation.state.params.editType != 'update') {
            YFWNativeManager.getPasteboardString((stringFromClipboard)=>{
                // console.log(stringFromClipboard, 'clipboard')
                if (stringFromClipboard && safe(stringFromClipboard).length > 0) {
                    let paramMap = new Map();
                    let viewModel = new YFWRequestViewModel();
                    paramMap.set('__cmd', 'person.address.pasteAddressFormat');
                    paramMap.set('address', stringFromClipboard);
                    viewModel.TCPRequest(paramMap, (res) => {
                        let result = safeObj(safeObj(res).result)
                        //（和Taobao新增识别逻辑保持一致）支持详细地址粘贴识别；收货人信息(姓名+手机号)识别；详细地址加收货人信息识别；
                        if (safe(result.detail).length > 0 || (safe(result.person).length > 0 && safe(result.phonenum).length > 0)) {
                            this.tipsDialog&&this.tipsDialog.showView(safe(result.person).replace(/\s*/g,''),safe(result.phonenum),safe(result.regionPath),safe(result.detail),()=>{},()=>{
                                this.setState({
                                    receiver: safe(result.person).replace(/\s*/g,''),
                                    userPhone: safe(result.phonenum),
                                    userAddress: safe(result.regionPath),
                                    userRegion: safe(result.regionId),
                                    userAddressDetail: safe(result.detail),
                                    isDefault: '0',
                                });
                            })
                        }
                    });
                }
            })
        }
    }

    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }

    onFocus() {
        if (this.phoneClean == '1') {
            this.setState({
                userPhone: ''
            });
            this.phoneClean = '0';
        }

    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View>
                    <Image source={require('../../img/Status_bar.png')} style={{ width: kScreenWidth, height: 15, resizeMode: 'cover' }} />
                    <View style={{ position: 'absolute', backgroundColor: '#fff', left: 0, right: 0, top: 5, bottom: 0, borderTopLeftRadius: 7, borderTopRightRadius: 7, overflow: 'hidden' }}></View>
                </View>

                <KeyboardAwareScrollView style={{ backgroundColor: backGroundColor() }} bounces={false}>
                    <View style={styles.container}>
                        <View style={{ backgroundColor: 'white' }}>
                            <View style={[BaseStyles.leftCenterView, styles.item]}>
                                <Text style={styles.title}>姓名</Text>
                                <TextInput
                                    maxLength={16}
                                    underlineColorAndroid='transparent'
                                    ref='textinput1'
                                    style={styles.subtitle}
                                    placeholder='请输入姓名'
                                    placeholderTextColor="#999999"
                                    autoFocus={this.props.navigation.state.params.editType == 'update' ? false : true}
                                    returnKeyType={'done'}
                                    value={this.state.receiver}
                                    onChangeText={(text) => {this.onChangeText(text,1)}}
                                    onChange={(event) => this.onChangeText(event.nativeEvent.text,1)}/>
                            </View>
                            {this._renderSeparator()}
                            <View style={[BaseStyles.leftCenterView, styles.item]}>
                                <Text style={styles.title}>手机号码</Text>
                                <TextInput style={styles.subtitle}
                                    ref='textinput2'
                                    underlineColorAndroid='transparent'
                                    placeholder='请输入手机号码'
                                    placeholderTextColor="#999999"
                                    keyboardType='numeric'
                                    returnKeyType={'done'}
                                    value={this.state.userPhone}
                                    onFocus={this.onFocus.bind(this)}
                                    onChangeText={(text) => {this.onChangeText(text,2)}}
                                    onChange={(event) => this.onChangeText(event.nativeEvent.text,2)}
                                />
                            </View>
                            {this._renderSeparator()}
                            <TouchableOpacity onPress={() => this.onRegionClick()}>
                                <View style={[BaseStyles.leftCenterView, styles.item]}>
                                    <Text style={styles.title}>所在地区</Text>
                                    <Text style={styles.subtitle} ref='textinput3'>
                                        {this.state.userAddress}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            {this._renderSeparator()}
                            <View style={[BaseStyles.leftCenterView, styles.item, { height: 74, alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: 13, paddingBottom: 10 }]}>

                                <Text style={[styles.title, Platform.OS == 'android' ? { marginTop: 10 } : { marginTop: 5 }]}>详细地址</Text>
                                <TextInput
                                    placeholderTextColor="#999999"
                                    ref='textinput4'
                                    underlineColorAndroid='transparent'
                                    placeholder="请填写详细地址,不少于5个字"
                                    textAlignVertical='top'
                                    multiline={true}
                                    returnKeyType={'done'}
                                    blurOnSubmit={true}
                                    maxLength={50}
                                    style={styles.subtitle}
                                    value={this.state.userAddressDetail}
                                    onChangeText={(text) => {this.onChangeText(text,3)}}
                                    onChange={(event) => this.onChangeText(event.nativeEvent.text,3)}/>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => this.changeDefaultAddress()} activeOpacity={1}>
                            <View style={[BaseStyles.leftCenterView, styles.item, { marginTop: 15 }]}>
                                {this.defaultAddress()}
                                <Text style={{ fontSize: 15, marginLeft: 10, color: darkLightColor() }}>设为默认地址</Text>
                            </View>
                        </TouchableOpacity>
                        <YFWSwitchAddressView ref={ref_phoneInput => (this.ref_switchaddress = ref_phoneInput)} />

                    </View>
                </KeyboardAwareScrollView>
                <YFWAddressTipAlert ref={e => this.tipsDialog = e}></YFWAddressTipAlert>
            </View>
        )
    }

    _renderSeparator() {
        return <View style={{ flex: 1, marginLeft: 16, height: 1, backgroundColor: yfwLineColor(), opacity: 0.1 }}></View>
    }

    //搜索框变化
    onChangeText(text,tag){
        text = text.replace(EMOJIS,'')
        if(tag == 1){
            this.setState({
                receiver:text,
            });
        }else if(tag == 2){
            text = text.replace(/[^0-9]/ig, '');
            if (text.length > 11) return
            this.setState({
                userPhone: text
            })
        }else{
            this.setState({
                userAddressDetail:text,
            });
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    item: {
        flex: 1,
        height: 52,
        paddingLeft: 16,
        backgroundColor: '#fff'
    },
    title: {
        width: 65,
        color: darkLightColor(),
        fontSize: 15
    },
    subtitle: {
        flex: 1,
        marginHorizontal: 20,
        color: darkTextColor(),
        fontSize: 15,
    }
})
