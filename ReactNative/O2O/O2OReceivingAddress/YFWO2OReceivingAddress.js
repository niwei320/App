import React, { Component } from 'react';
import { isNotEmpty, isEmpty, safeObj, iphoneBottomMargin, adaptSize, lightStatusBar, kScreenWidth, safeArray } from '../../PublicModule/Util/YFWPublicFunction';
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import { FlatList, ScrollView, View, Text, Image, TouchableOpacity, NativeModules, Platform } from 'react-native';
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import ModalView from '../../widget/ModalView'
import YFWNativeManager from '../../Utils/YFWNativeManager'
import YFWToast from '../../Utils/YFWToast';
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import { o2oBlueColor } from '../../Utils/YFWColor'
import { addEventListener } from 'react-native/Libraries/Linking/Linking';
export default class YFWO2OReceivingAddress extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        title: '选择收货地址',
        headerRight: <View width={50} />,
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
        this.callBack = this.props.navigation.state.params.state.callBack
        this.state = {
            dataSource: [],
            normal: [],
            noLocation: [],
            outOfDistance: [],
            firstLoad: true,
        }
    }
    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        lightStatusBar();
        this._fetchReceiptAddress()
        this.didFocus = this.props.navigation.addListener('didFocus', () => this._fetchReceiptAddress());
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
    }

    _fetchReceiptAddress() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.common.app.oto.getO2oAddressList');
        paramMap.set('storeid', this.props.navigation.state.params.state.storeid);
        viewModel.TCPRequest(
            paramMap,
            (res) => {
                let noLocation = []
                let outOfDistance = []
                let normal = []
                console.log(res.result)
                if (res.code === '1' || res.code === 1) {
                    safeArray(res.result).map((item) => {
                        if (isEmpty(item.location_address)) {
                            noLocation.push(item)
                        }
                        else if (item.isChaoThree == 1 && isNotEmpty(item.location_address)) {
                            outOfDistance.push(item)
                        }
                        else {
                            normal.push(item)
                        }
                    })
                    this.setState({
                        dataSource: res.result,
                        normal: normal,
                        noLocation: noLocation,
                        outOfDistance: outOfDistance,
                        firstLoad: false,
                    })
                } else { }
            },
            (error) => {
                console.log(error);
            },
            true,
        );
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
    //-----------------------------------------------RENDER---------------------------------------------
    _defaultLable(type) {
        return <View style={{ width: adaptSize(25), height: adaptSize(13), backgroundColor: type == 'gray' ? '#eeeeee' : '#ffe3e3', justifyContent: 'center', alignItems: 'center', marginRight: adaptSize(5), borderRadius: adaptSize(3) }}><Text style={{ fontSize: 10, color: type == 'gray' ? '#999999' : '#eb3131', includeFontPadding: false, textAlign: 'center', lineHeight: adaptSize(13), }}>
            {'默认'}
        </Text></View>
    }
    _Lable(text, type) {
        return <View style={{ backgroundColor: type == 'gray' ? '#eeeeee' : '#e9f2ff', width: adaptSize(25), height: adaptSize(13), marginRight: adaptSize(5), borderRadius: adaptSize(3) }}>
            <Text style={{ fontSize: 10, color: type == 'gray' ? '#999999' : '#5799f7', includeFontPadding: false, textAlign: 'center', lineHeight: adaptSize(13), }}>
                {text}
            </Text>
        </View>
    }
    _renderItem(item, index, type) {
        item.address_name = item.address_name.replace(item.province, '')
        item.address_name = item.address_name.replace(item.city, '')
        item.address_name = item.address_name.replace(item.area, '')
        return (
            <>
                {index > 0 && <View style={{ width: kScreenWidth, height: adaptSize(0.5), backgroundColor: '#eeeeee' }} />}
                <TouchableOpacity key={index} style={{ height: adaptSize(91), width: kScreenWidth, backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} activeOpacity={1} onPress={
                    () => {
                        if (type == 'gray')
                            () => { }
                        else {
                            if (isNotEmpty(this.callBack)) {
                                this.callBack(item)
                            };
                            this._goBack()
                        }
                    }}>
                    <View>
                        <View style={[BaseStyles.leftCenterView, { marginLeft: adaptSize(20) }]}>
                            {item.dict_bool_default == '1' && this._defaultLable(type)}
                            {isNotEmpty(item.address_label) && this._Lable(item.address_label, type)}
                            <Text style={{ fontSize: 12, color: '#999999', includeFontPadding: false, maxWidth: adaptSize(250) }} numberOfLines={1}>{(item.province || '') + ' ' + (item.province == item.city ? '' : ((item.city || '') + ' ')) + (item.area || '')}</Text>
                        </View>
                        <Text style={{ fontSize: 14, color: type == 'gray' ? '#999999' : '#333333', fontWeight: 'bold', includeFontPadding: false, marginLeft: adaptSize(20.5), maxWidth: adaptSize(300), marginTop: adaptSize(7) }} numberOfLines={1}>{item.address_name}</Text>
                        <Text style={{ fontSize: 12, color: '#999999', includeFontPadding: false, marginLeft: adaptSize(20), maxWidth: adaptSize(200), marginTop: adaptSize(11) }} numberOfLines={1}>{item.name + ' ' + item.mobile}</Text>
                    </View>
                    <TouchableOpacity onPress={() => { this._dealNavigation({ type: 'O2O_Receiving_Address_Edit', editType: 'update', addressData: item, }) }} activeOpacity={1} hitSlop={{left:10,top:10,bottom:10,right:10}}>
                        <Image style={{ width: adaptSize(14), height: adaptSize(15), marginRight: adaptSize(30) }} source={require('../Image/edit_icon.png')} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </>
        )
    }
    render() {
        return (
            <>
                {safeArray(this.state.dataSource).length > 0 ?
                    <ScrollView>
                        {this.state.normal.map((item, index) => this._renderItem(item, index))}
                        {this.state.noLocation.length > 0 && <Text style={{ fontSize: 12, color: '#5799f7', marginTop: adaptSize(16), marginBottom: adaptSize(10), marginLeft: adaptSize(20) }}>{'以下地址同城配送需重新编辑定位'}</Text>}
                        {this.state.noLocation.length > 0 && this.state.noLocation.map((item, index) => this._renderItem(item, index, 'gray'))}
                        {this.state.outOfDistance.length > 0 && <Text style={{ fontSize: 12, color: '#5799f7', marginTop: adaptSize(16), marginBottom: adaptSize(10), marginLeft: adaptSize(20) }}>{'以下地址超出配送范围'}</Text>}
                        {this.state.outOfDistance.length > 0 && this.state.outOfDistance.map((item, index) => this._renderItem(item, index, 'gray'))}
                        <View style={{ height: iphoneBottomMargin() + adaptSize(89), }} />
                    </ScrollView> : !this.state.firstLoad &&
                    <>
                        <Image source={require('../../../img/ic_no_address.png')} style={{ alignSelf: "center", marginTop: adaptSize(140) }} />
                        <Text style={{ alignSelf: "center", color: '#999999', fontSize: 12 }}>{'暂无收货地址'}</Text>
                    </>}
                <TouchableOpacity style={{ width: adaptSize(338), height: adaptSize(40), borderRadius: adaptSize(20), shadowColor: "rgba(87, 153, 247, 0.5)", shadowOffset: { width: 0, height: adaptSize(3), }, shadowRadius: adaptSize(7), shadowOpacity: 1, backgroundColor: o2oBlueColor(), alignSelf: 'center', position: 'absolute', bottom: iphoneBottomMargin() + adaptSize(29), elevation: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }} activeOpacity={1} onPress={() => { this._dealNavigation({ type: 'O2O_Receiving_Address_Edit', editType: 'add' }) }}>
                    <Image style={{ marginRight: adaptSize(5), width: adaptSize(17), height: adaptSize(17) }} source={require('../Image/add_icon_white.png')} />
                    <Text style={{ fontSize: 16, color: "#ffffff", fontWeight: 'bold' }}>{'新增收货地址'}</Text>
                </TouchableOpacity>
            </>
        )
    }
}

