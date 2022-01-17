import React, { Component } from 'react';
import { isNotEmpty, isEmpty, safeObj, iphoneBottomMargin, adaptSize, lightStatusBar, kScreenWidth, safeArray, safe, dismissKeyboard_yfw, mapToJson, isAndroid, is_phone_number } from '../../PublicModule/Util/YFWPublicFunction';
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import { EMOJIS, PHONE_NUMBERS } from '../../PublicModule/Util/RuleString';
import { Switch, TextInput, View, Text, Image, TouchableOpacity, NativeModules, Platform, DeviceEventEmitter } from 'react-native';
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import YFWO2OCancelOrComfirmModal from '../widgets/YFWO2OCancelOrComfirmModal'
import YFWToast from '../../Utils/YFWToast';
import { o2oBlueColor } from '../../Utils/YFWColor'
export default class YFWO2OReceivingAddress extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        title: navigation.state.params.state.editType == 'update' ? "编辑收货地址" : "新增收货地址",
        headerRight: navigation.state.params.state.editType == 'update' ? <TouchableOpacity
            onPress={() => this2.onRightTvClick(navigation)}
            hitSlop={{ left: 10, top: 10, bottom: 15, right: 10 }}
            activeOpacity={1}>
            <Text style={{ fontSize: 13, color: '#ffffff', marginRight: adaptSize(13), fontWeight: 'bold' }}
            >{'删除地址'}</Text>
        </TouchableOpacity> : <View width={50} />,
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1
        },
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor: o2oBlueColor(),
            height: Platform.Version >= 19 ? adaptSize(50) + NativeModules.StatusBarManager.HEIGHT : adaptSize(50),
            paddingTop: Platform.Version >= 19 ? NativeModules.StatusBarManager.HEIGHT : 0
        } : { borderBottomColor: 'white', borderBottomWidth: 0, backgroundColor: o2oBlueColor() },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: adaptSize(50), height: adaptSize(40) }]}
                onPress={() => { navigation.goBack() }}>
                <Image style={{ width: adaptSize(11), height: adaptSize(19), resizeMode: 'stretch' }}
                    source={require('../../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
    });

    constructor(props) {
        super(props);
        this2 = this
        this.address_name = ''
        this.address_name = safeObj(this.props.navigation.state.params.state.addressData).address_name || ''
        this.address_name = this.address_name.replace(safeObj(this.props.navigation.state.params.state.addressData).province || '', '')
        this.address_name = this.address_name.replace(safeObj(this.props.navigation.state.params.state.addressData).city || '', '')
        this.address_name = this.address_name.replace(safeObj(this.props.navigation.state.params.state.addressData).area || '', '')
        this.address_name = this.address_name.replace(safeObj(this.props.navigation.state.params.state.addressData).location_address || '', '')
        this.state = {
            receiver: safeObj(this.props.navigation.state.params.state.addressData).name || '',
            userPhone: safeObj(this.props.navigation.state.params.state.addressData).mobile || '',
            regionalLevel: (safeObj(this.props.navigation.state.params.state.addressData).province || '') + ' ' + ((safeObj(this.props.navigation.state.params.state.addressData).province || '') == (safeObj(this.props.navigation.state.params.state.addressData).city || '') ? '' : (safeObj(this.props.navigation.state.params.state.addressData).city || '') + ' ') + (safeObj(this.props.navigation.state.params.state.addressData).area || ''),
            userAddressDetail: this.address_name,
            label: safeObj(this.props.navigation.state.params.state.addressData).address_label || '',
            forRegionId: '',
            isDefault: safeObj(this.props.navigation.state.params.state.addressData).dict_bool_default,
            province: safeObj(this.props.navigation.state.params.state.addressData).province || '',
            city: safeObj(this.props.navigation.state.params.state.addressData).city || '',
            area: safeObj(this.props.navigation.state.params.state.addressData).area || '',
            location_address: safeObj(this.props.navigation.state.params.state.addressData).location_address || '',
        }
    }
    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        lightStatusBar();
        this.requestAddressDetailData()
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {

    }
    requestAddressDetailData() {
        if (this.props.navigation.state.params.state.editType == 'update') {
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.address.getAddressInfo');
            paramMap.set('id', safeObj(this.props.navigation.state.params.state.addressData).id || 1);
            viewModel.TCPRequest(paramMap, (res) => {
                console.log(res.result);
                this.setState({
                    userPhone: res.result.mobile,
                });
            }, () => { }, true);
        }
    }

    checkPoint(str) {
        let checkResult = false;
        let hasPinZH = false;
        let hasPintEN = false;

        if (str.indexOf(".") != -1) {
            hasPintEN = true
            let array = str.split('.')
            if (array.length > 2) {
                checkResult = true
            }
            if (safe(array[0]).length == 0 || safe(array[1]).length == 0) {
                checkResult = true
            }
        }
        if (str.indexOf("·") != -1) {
            hasPintZN = true
            let array = str.split("·")
            if (array.length > 2) {
                checkResult = true
            }
            if (safe(array[0]).length == 0 || safe(array[1]).length == 0) {
                checkResult = true
            }
        }
        if (hasPinZH && hasPintEN) {
            checkResult = true
        }
        return checkResult
    }

    checkAddressInfo() {
        if (this.state.receiver == '') {
            this.infoMsg = "姓名不能为空";
            return false;
        }
        if (this.state.userPhone == '') {
            this.infoMsg = "手机号码不能为空";
            return false;
        }
        if (this.state.regionalLevel == '') {
            this.infoMsg = "地区未选择";
            return false;
        }
        this.state.userAddressDetail = safe(this.state.userAddressDetail).replace(/\s*/g, "")
        this.state.userAddressDetail = safe(this.state.userAddressDetail).replace(this.state.location, '');
        this.setState({})
        if (this.state.userAddressDetail == '') {
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

        if (this.checkPoint(this.state.receiver)) {
            this.infoMsg = "姓名中只能有一个点，且位置不能再两端";
            return false;
        }
        if (!is_phone_number(this.state.userPhone)) {
            this.infoMsg = "手机号码格式不正确";
            return false;
        }
        if (this.state.regionalLevel.length == 0) {
            this.infoMsg = "请选择所在地区";
            return false;
        }
        regExp = /[`~!@#$^&*()=|{}':;'\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'？\s]/g;
        let hasSpecial = regExp.test(this.state.userAddressDetail)
        if (hasSpecial) {
            this.infoMsg = "详细地址不能输入特殊字符";
            return false;
        }
        if (isEmpty(this.state.location_address)) {
            this.infoMsg = "定位信息不能为空";
            return false;
        }
        return true;
    }

    saveAddressInfo() {
        if (!this.checkAddressInfo()) {
            YFWToast(this.infoMsg)
            return
        }
        console.log(this.state.regionalLevel, this.state.location_address, this.state.userAddressDetail);
        let address_name = this.state.regionalLevel + this.state.location_address + this.state.userAddressDetail;
        //地址去除空格
        address_name = address_name.replace(/\s*/g, '')
        let region_name = isNotEmpty(this.state.area) ? this.state.area : isNotEmpty(this.state.city) ? this.state.city : isNotEmpty(this.state.province) ? this.state.province : '';
        if (this.props.navigation.state.params.state.editType == 'update') {
            let paramMap = new Map();
            let infoMap = new Map();
            infoMap.set('location_address', this.state.location_address)
            infoMap.set('name', this.state.receiver);
            infoMap.set('id', safeObj(this.props.navigation.state.params.state.addressData).id);
            infoMap.set('region_name', region_name);
            infoMap.set('mobile', this.state.userPhone);
            infoMap.set('dict_bool_default', this.state.isDefault);
            infoMap.set('address_name', address_name);
            infoMap.set('address_label', this.state.label);
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.address.update');
            paramMap.set('data', mapToJson(infoMap));
            console.log(paramMap);
            viewModel.TCPRequest(paramMap, (res) => {
                DeviceEventEmitter.emit('kChangeAddress')
                this._goBack()
            });
        } else {
            let paramMap = new Map();
            let infoMap = new Map();
            infoMap.set('location_address', this.state.location_address)
            infoMap.set('name', this.state.receiver);
            infoMap.set('dict_bool_default', this.state.isDefault);
            infoMap.set('region_name', region_name);
            infoMap.set('mobile', this.state.userPhone);
            infoMap.set('address_name', address_name);
            infoMap.set('address_label', this.state.label);
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.address.insert');
            paramMap.set('data', mapToJson(infoMap));
            console.log(paramMap);
            viewModel.TCPRequest(paramMap, (res) => {
                DeviceEventEmitter.emit('kChangeAddress')
                this._goBack()
            });
        }
    }
    _dealNavigation(data) {
        if (isEmpty(data)) {
            return
        }
        let { navigate } = this.props.navigation;
        pushNavigation(navigate, { ...safeObj(data) })
    }
    _goBack() {
        let { goBack } = this.props.navigation;
        goBack();
    }
    onChangeText(text, tag) {
        text = text.replace(EMOJIS, '')
        if (tag == 1) {
            this.setState({
                receiver: text,
            });
        } else if (tag == 2) {
            text = text.replace(/[^0-9]/ig, '');
            if (text.length > 11) return
            this.setState({
                userPhone: text
            })
        } else {
            this.setState({
                userAddressDetail: text,
            });
        }
    }
    callBack(locationInfo) {
        console.log('locationInfo', locationInfo);
        let location_address = safeObj(locationInfo).address + safeObj(locationInfo).street.replace(safeObj(locationInfo).province || '', '').replace(safeObj(locationInfo).city || '', '').replace(safeObj(locationInfo).area || '', '');
        this.setState({
            regionalLevel: (safeObj(locationInfo).province || '') + ' ' + ((safeObj(locationInfo).province || '') == (safeObj(locationInfo).city || '') ? '' : (safeObj(locationInfo).city || '') + ' ') + (safeObj(locationInfo).area || ''),
            province: safeObj(locationInfo).province || '',
            city: safeObj(locationInfo).city || '',
            area: safeObj(locationInfo).area || '',
            location_address: location_address || '',
        })
    }
    onRightTvClick() {
        dismissKeyboard_yfw();
        this.viewModal && this.viewModal.show()
    }

    deleteAddress = () => {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.address.delete');
        paramMap.set('id', safeObj(this.props.navigation.state.params.state.addressData).id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            DeviceEventEmitter.emit('kChangeAddress')
            this.viewModal && this.viewModal.disMiss();
            YFWToast("删除成功")
            this._goBack()
        }, (error) => {
        })
    }
    //-----------------------------------------------RENDER---------------------------------------------
    _Lable(text) {
        if (this.state.label === text)
            return (
                <TouchableOpacity style={{ backgroundColor: '#e9f2ff', width: adaptSize(38), height: adaptSize(16), marginRight: adaptSize(5), borderRadius: adaptSize(3), justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.setState({ label: '' }) }} activeOpacity={1}>
                    <Text style={{ fontSize: 12, color: '#5799f7', includeFontPadding: false, textAlign: 'center', }} >
                        {text}
                    </Text>
                </TouchableOpacity>
            )
        else
            return (
                <TouchableOpacity style={{ backgroundColor: '#ffffff', width: adaptSize(38), height: adaptSize(16), marginRight: adaptSize(5), borderRadius: adaptSize(3), borderWidth: adaptSize(1), borderColor: '#999999', justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.setState({ label: text }) }} activeOpacity={1}>
                    <Text style={{ fontSize: 12, color: '#999999', includeFontPadding: false, textAlign: 'center' }} >
                        {text}
                    </Text>
                </TouchableOpacity>
            )
    }
    render() {
        return (
            <>
                <View style={[BaseStyles.leftCenterView, { width: kScreenWidth, height: adaptSize(47), backgroundColor: '#ffffff' }]}>
                    <Text style={{ fontSize: 14, color: '#333333', width: adaptSize(60), marginLeft: adaptSize(21) }}>
                        {'收货人'}
                    </Text>
                    <TextInput style={{ color: '#333333', fontSize: 14, marginLeft: adaptSize(12), width: adaptSize(257) }} value={this.state.receiver} placeholder={'请填写收货人姓名'} placeholderTextColor={'#999999'} onChangeText={(text) => this.onChangeText(text, 1)} returnKeyType={'done'} blurOnSubmit={true} />
                </View>
                <View style={{ width: kScreenWidth, height: adaptSize(0.5), backgroundColor: '#eeeeee' }} />
                <View style={[BaseStyles.leftCenterView, { width: kScreenWidth, height: adaptSize(47), backgroundColor: '#ffffff' }]}>
                    <Text style={{ fontSize: 14, color: '#333333', width: adaptSize(60), marginLeft: adaptSize(21) }}>
                        {'手机号码'}
                    </Text>
                    <TextInput style={{ color: '#333333', fontSize: 14, marginLeft: adaptSize(12), width: adaptSize(257) }} value={this.state.userPhone} keyboardType={'numeric'} maxLength={11} placeholder={'请填写收货人手机号码'} placeholderTextColor={'#999999'} onChangeText={(text) => this.onChangeText(text, 2)} />
                </View>
                <View style={{ width: kScreenWidth, height: adaptSize(0.5), backgroundColor: '#eeeeee' }} />
                <View style={{ width: kScreenWidth, backgroundColor: '#ffffff', paddingTop: adaptSize(17), paddingBottom: this.props.navigation.state.params.state.editType == 'update' ? adaptSize(10) : adaptSize(17), flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: '#333333', width: adaptSize(60), marginLeft: adaptSize(21) }}>
                        {'所在地区'}
                    </Text>
                    {this.props.navigation.state.params.state.editType == 'update' ?
                        <View style={[BaseStyles.leftCenterView, { marginLeft: adaptSize(12), justifyContent: 'space-between', width: kScreenWidth - adaptSize(93) }]}>
                            <View style={{ width: adaptSize(215) }}>
                                <Text style={{ fontSize: 14, color: '#333333', fontWeight: 'bold', maxWidth: adaptSize(200) }} numberOfLines={1}>{this.state.regionalLevel}</Text>
                                {isNotEmpty(this.state.location_address) ?
                                    <Text style={{ fontSize: 12, color: '#999999', marginTop: adaptSize(12), maxWidth: adaptSize(200) }} numberOfLines={2}>
                                        {this.state.location_address}
                                    </Text> :
                                    <Text style={{ fontSize: 12, color: '#ff3300', marginTop: adaptSize(12) }} numberOfLines={1}>
                                        {'所在地区需重新定位'}
                                    </Text>}
                            </View>
                            <TouchableOpacity style={[BaseStyles.leftCenterView]} activeOpacity={1} onPress={() => { this._dealNavigation({ type: 'O2O_shipping_address', from: 'map', callback: (locationInfo) => this.callBack(locationInfo) }) }}>
                                <Image style={{ width: adaptSize(15), height: adaptSize(15), marginRight: adaptSize(4) }} source={require('../Image/location_icon_receive.png')} />
                                <Text style={{ fontSize: 14, color: "#5799f7", marginRight: adaptSize(26) }}>{'定位'}</Text>
                            </TouchableOpacity>
                        </View> :
                        <View style={[BaseStyles.leftCenterView, { marginLeft: adaptSize(12), justifyContent: 'space-between', width: kScreenWidth - adaptSize(93) }]}>
                            {isNotEmpty(this.state.location_address) ?
                                <View style={{ width: adaptSize(215) }}>
                                    <Text style={{ fontSize: 14, color: '#333333', fontWeight: 'bold', maxWidth: adaptSize(200) }} numberOfLines={1}>{this.state.regionalLevel}</Text>
                                    <Text style={{ fontSize: 12, color: '#999999', marginTop: adaptSize(12), maxWidth: adaptSize(200) }} numberOfLines={2}>
                                        {this.state.location_address}
                                    </Text>
                                </View> :
                                <TextInput style={{ fontSize: 14, color: '#999999' }} placeholder={'省市区县、乡镇等'} placeholderTextColor={'#999999'} editable={false} />}
                            <TouchableOpacity style={[BaseStyles.leftCenterView]} activeOpacity={1} onPress={() => { this._dealNavigation({ type: 'O2O_shipping_address', from: 'map', callback: (locationInfo) => this.callBack(locationInfo) }) }}>
                                <Image style={{ width: adaptSize(15), height: adaptSize(15), marginRight: adaptSize(4) }} source={require('../Image/location_icon_receive.png')} />
                                <Text style={{ fontSize: 14, color: "#5799f7", marginRight: adaptSize(26) }}>{'定位'}</Text>
                            </TouchableOpacity>
                        </View>}
                </View>
                <View style={{ width: kScreenWidth, height: adaptSize(0.5), backgroundColor: '#eeeeee' }} />
                <View style={{ width: kScreenWidth, flexDirection: 'row', paddingBottom: adaptSize(25), backgroundColor: '#ffffff', height: adaptSize(80) }}>
                    <Text style={{ fontSize: 14, color: '#333333', width: adaptSize(60), marginLeft: adaptSize(21), marginTop: adaptSize(17) }}>
                        {'详细地址'}
                    </Text>
                    <TextInput style={{ flex: 1, color: '#333333', fontSize: 14, marginLeft: adaptSize(12), width: adaptSize(257), textAlignVertical: 'top', padding: 0, marginTop: isAndroid() ? adaptSize(17) : adaptSize(12), }} underlineColorAndroid='transparent' multiline={true} placeholder={'如道路、门牌号、小区、楼栋号、单元室等...'} placeholderTextColor={'#999999'} value={this.state.userAddressDetail} onChangeText={(text) => this.onChangeText(text, 3)} returnKeyType={'done'} blurOnSubmit={true} />
                </View>
                <View style={[BaseStyles.leftCenterView, { width: kScreenWidth, height: adaptSize(47), backgroundColor: '#ffffff', marginTop: adaptSize(14) }]}>
                    <Text style={{ fontSize: 14, color: '#333333', width: adaptSize(60), marginLeft: adaptSize(21) }}>
                        {'标签'}
                    </Text>
                    <View style={[BaseStyles.leftCenterView, { marginLeft: adaptSize(12) }]}>
                        {this._Lable('家')}
                        {this._Lable('公司')}
                        {this._Lable('学校')}
                    </View>
                </View>
                <View style={{ width: kScreenWidth, height: adaptSize(0.5), backgroundColor: '#eeeeee' }} />
                <View style={[BaseStyles.leftCenterView, { width: kScreenWidth, height: adaptSize(47), backgroundColor: '#ffffff', justifyContent: 'space-between' }]}>
                    <View style={[BaseStyles.leftCenterView, { marginLeft: adaptSize(21) }]}>
                        <Text style={{ fontSize: 14, color: '#333333' }}>
                            {'设为默认地址'}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#feac4c', marginLeft: adaptSize(8) }}>
                            {'（每次下单会默认使用该地址）'}
                        </Text>
                    </View>
                    <Switch
                        style={{ marginRight: adaptSize(27) }}
                        trackColor={{ false: "#999999", true: "#5799f7" }}
                        thumbColor={"#ffffff"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => { this.state.isDefault == '1' ? this.setState({ isDefault: '0' }) : this.setState({ isDefault: '1' }) }}
                        value={this.state.isDefault == '1'} />
                </View>
                <TouchableOpacity style={{ width: adaptSize(338), height: adaptSize(40), borderRadius: adaptSize(20), shadowColor: "rgba(87, 153, 247, 0.5)", shadowOffset: { width: 0, height: adaptSize(3), }, shadowRadius: adaptSize(7), shadowOpacity: 1, backgroundColor: o2oBlueColor(), alignSelf: 'center', position: 'absolute', bottom: iphoneBottomMargin() + adaptSize(29), elevation: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }} activeOpacity={1} onPress={() => { this.saveAddressInfo() }}>
                    <Text style={{ fontSize: 16, color: "#ffffff", fontWeight: 'bold' }}>{'保存'}</Text>
                </TouchableOpacity>
                <YFWO2OCancelOrComfirmModal ref={(ref) => this.viewModal = ref} confirmOnPress={() => { this.deleteAddress() }} title={'确定删除该收货地址吗？'} hiddenIcon={true} />
            </>
        )
    }
}

