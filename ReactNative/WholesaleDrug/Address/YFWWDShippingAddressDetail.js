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
import { BaseStyles } from './../../Utils/YFWBaseCssStyle'
import { darkLightColor, darkNomalColor, backGroundColor, darkTextColor, yfwLineColor } from './../../Utils/YFWColor'
import YFWSwitchAddressView from "../../widget/YFWSwitchAddressView"
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {
    mapToJson,
    dismissKeyboard_yfw,
    itemAddKey,
    kScreenWidth,
    safe,
    isEmpty,
    isNotEmpty
} from "../../PublicModule/Util/YFWPublicFunction";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import YFWToast from "../../Utils/YFWToast";
import { EMOJIS } from '../../PublicModule/Util/RuleString';
import YFWWDShippingAddressDetailModel from "./Model/YFWWDShippingAddressDetailModel";
import {YFWImageConst} from "../Images/YFWImageConst";
import YFWHeaderLeft from "../Widget/YFWHeaderLeft";
import YFWWDChooseAddressView from "./View/YFWWDChooseAddressView";
import YFWWDSwitchAddressView from "../Widget/View/YFWWDSwitchAddressView";
import {getRegistStatus} from "../../Utils/YFWInitializeRequestFunction";
const { StatusBarManager } = NativeModules;
export default class YFWWDShippingAddressDetail extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1
        },
        headerLeft: <YFWHeaderLeft navigation={navigation}/>,
        headerRight: (
            <TouchableOpacity
                onPress={() => this2.onRightTvClick(navigation)}
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
        headerBackground: <Image source={YFWImageConst.Nav_header_background_blue} style={{ width: kScreenWidth, flex: 1, resizeMode: 'cover' }} />,
        tabBarVisible: false,
        headerTitle: `${navigation.state.params.type == 'update' ? "编辑地址" : "新增地址"}`,

    });

    constructor(props) {
        super(props);
        this.infoMsg = '';
        this.phoneClean = '0';
        this2 = this;
        this.state = {
            pageMode:this.props.navigation.state.params.pageMode,

            receiver: '',
            userPhone: '',
            regionid: '',
            userAddress: '',
            userAddressDetail: '',
            isDefault: '0',
            storeAddressData:[],
        }
    }

    checkAddressInfo() {
        if (this.state.receiver  == '' ) {
            this.infoMsg = "收货人不能为空";
            return false;
        }
        if (this.state.userPhone  == '' ) {
            this.infoMsg = "手机号码不能为空";
            return false;
        }
        if(this.state.pageMode === 'manual'){
            if(this.state.regionid == ''){
                this.infoMsg = "请选择收货地址";
                return false;
            }
        }
        if (this.state.userAddressDetail  == '' ) {
            this.infoMsg = this.state.pageMode === 'manual'?"请填写收货地址":"请选择收货地址";
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
        if (this.props.navigation.state.params.type == 'update' && this.state.userPhone && this.state.userPhone.substr(3,4) == '****') {
            return true
        }
        let phone = this.state.userPhone.replace(/[^0-9]/ig, '')
        if (phone.length != 11) {
            this.infoMsg = "手机号码格式不正确";
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
            hasPinZH = true
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
        let address_name = this.state.pageMode === 'manual'?this.state.userAddress + this.state.userAddressDetail:this.state.userAddressDetail;
        //地址去除空格
        address_name = address_name.replace(/\s*/g, '')
        if (this.props.navigation.state.params.type == 'update') {
            let paramMap = new Map();
            let infoMap = new Map();

            infoMap.set('name', this.state.receiver);
            infoMap.set('id', this.props.navigation.state.params.addressData.id);
            infoMap.set('mobile', this.state.userPhone);
            infoMap.set('dict_bool_default', this.state.isDefault);
            infoMap.set('address_name', address_name);
            isNotEmpty(this.state.regionid) && this.state.pageMode === 'manual'?infoMap.set('regionid', this.state.regionid):null;
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'store.whole.address.update');
            paramMap.set('data', mapToJson(infoMap));

            viewModel.TCPRequest(paramMap, (res) => {
                if (res.code == 1) {
                    if (this.props.navigation.state.params.callBack) {
                        this.props.navigation.state.params.callBack();
                    }
                    this.props.navigation.pop();
                }
            },(error)=>{
                console.log(JSON.stringify(error))
            });
        } else {
            let paramMap = new Map();
            let infoMap = new Map();

            infoMap.set('name', this.state.receiver);
            infoMap.set('dict_bool_default', this.state.isDefault);
            infoMap.set('mobile', this.state.userPhone);
            infoMap.set('address_name', address_name);
            isNotEmpty(this.state.regionid) && this.state.pageMode === 'manual'?infoMap.set('regionid', this.state.regionid):null;
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'store.whole.address.insert');
            paramMap.set('data', mapToJson(infoMap));

            viewModel.TCPRequest(paramMap, (res) => {
                if (res.code == 1) {
                    if (this.props.navigation.state.params.callBack) {
                        this.props.navigation.state.params.callBack();
                    }
                    this.props.navigation.pop();
                }
            },(error)=>{
                console.log(JSON.stringify(error))
            });
        }
    }

    onRegionClick() {
        let {pageMode} = this.state
        if(pageMode === 'manual'){
            this.addressAlert.showView((item) => {
                this.setState({
                    userAddress: safe(item.get('name')),
                    regionid:safe(item.get('id')),
                })
            })
        } else {
            this.ref_switchaddress.show(this.state.storeAddressData, this.state.userAddressDetail, (data) => {
                this.setState({
                    userAddressDetail: data,
                })
            })
        }
        dismissKeyboard_yfw();
    }

    defaultAddress() {
        if (this.state.isDefault == '1') {
            return (
                <View style={{ justifyContent: 'flex-start', alignItems: 'center', width: 20 }}>
                    <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={YFWImageConst.Icon_select_blue} />
                </View>
            )
        } else {
            return (
                <View style={{ justifyContent: 'flex-start', alignItems: 'center', width: 20 }}>
                    <Image style={{ width: 16, height: 16, resizeMode: 'contain' }} source={YFWImageConst.Icon_unChooseBtn} />
                </View>
            )

        }
    }
    changeDefaultAddress() {
        var addressState;
        if (this.state.isDefault === '1') {
            addressState = '0';
        } else {
            addressState = '1';
        }
        this.setState(() => ({
            isDefault: addressState
        }))

    }
    requestAddressDetailData() {
        if (this.props.navigation.state.params.type === 'update') {
            this.phoneClean = '1';
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'store.whole.address.getReturnStoreAddress');
            paramMap.set('id', this.props.navigation.state.params.addressData.id);
            viewModel.TCPRequest(paramMap, (res) => {
                // console.log(JSON.stringify(res))
                let data = YFWWDShippingAddressDetailModel.getModelData(res.result);
                this.setState({
                    receiver: data.name,
                    regionid:data.regionid,
                    userPhone: data.mobile,
                    userAddress: data.userAddress,
                    userAddressDetail: data.userAddressDetail,
                    isDefault: data.isDefault,
                });
            });
        }
    }
    requestStoreAddressData() {
        let {pageMode} = this.state
        if(pageMode !== 'manual'){
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'store.whole.address.getShopAddressSelect');
            viewModel.TCPRequest(paramMap, (res) => {
                // console.log(JSON.stringify(res))
                let data = new Set(res.result)
                this.setState({
                    userAddressDetail:this.state.userAddress + this.state.userAddressDetail,
                    storeAddressData:Array.from(data)
                })
            },(error)=>{
            });
        }
    }

    componentDidMount() {
        this.requestAddressDetailData();
        this.requestStoreAddressData();
    }

    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }

    onFocus() {
        if (this.phoneClean === '1') {
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
                    <Image source={YFWImageConst.Nav_header_background_blue} style={{ width: kScreenWidth, height: 15, resizeMode: 'cover' }} />
                    <View style={{ position: 'absolute', backgroundColor: '#fff', left: 0, right: 0, top: 5, bottom: 0, borderTopLeftRadius: 7, borderTopRightRadius: 7, overflow: 'hidden' }}></View>
                </View>

                <KeyboardAwareScrollView style={{ backgroundColor: backGroundColor() }} bounces={false}>
                    <View style={styles.container}>
                        <View style={{ backgroundColor: 'white' }}>
                            <View style={[BaseStyles.leftCenterView, styles.item]}>
                                <Text style={styles.title}>收货人</Text>
                                <TextInput
                                    maxLength={16}
                                    ref='textinput1'
                                    style={styles.subtitle}
                                    underlineColorAndroid='transparent'
                                    placeholder='请输入姓名'
                                    placeholderTextColor="#999999"
                                    autoFocus={this.props.navigation.state.params.type == 'update' ? false : true}
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
                                    <Text style={styles.title}>{this.state.pageMode === 'manual'?'收货地址':'收货地址'}</Text>
                                    <Text style={styles.subtitle} ref='textinput3'>
                                        {this.state.pageMode === 'manual'?
                                            isEmpty(this.state.userAddress)?'请选择':this.state.userAddress
                                            :
                                            isEmpty(this.state.userAddressDetail)?'请选择':this.state.userAddressDetail
                                        }
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            {this.state.pageMode === 'manual'?
                                <>
                                    {this._renderSeparator()}
                                    <View style={[BaseStyles.leftCenterView, styles.item, { height: 74, alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: 13, paddingBottom: 10 }]}>
                                        <Text style={[styles.title, Platform.OS == 'android' ? { marginTop: 10 } : { marginTop: 5 }]}>详细地址</Text>
                                        <TextInput
                                            placeholderTextColor="#999999"
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
                                </>
                                :<></>
                            }
                        </View>
                        <TouchableOpacity onPress={() => this.changeDefaultAddress()} activeOpacity={1}>
                            <View style={[BaseStyles.leftCenterView, styles.item, { marginTop: 15 }]}>
                                {this.defaultAddress()}
                                <Text style={{ fontSize: 15, marginLeft: 10, color: darkLightColor() }}>设为默认地址</Text>
                            </View>
                        </TouchableOpacity>
                        <YFWWDChooseAddressView ref={ref_phoneInput => (this.ref_switchaddress = ref_phoneInput)} />
                        <YFWWDSwitchAddressView ref={view =>this.addressAlert = view} />
                    </View>
                </KeyboardAwareScrollView>
            </View>
        )
    }

    _renderSeparator() {
        return <View style={{ flex: 1, marginLeft: 16, height: 1, backgroundColor: yfwLineColor(), opacity: 0.1 }}/>
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
        } else {
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
