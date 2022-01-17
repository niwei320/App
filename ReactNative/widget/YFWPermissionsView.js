import React, { Component } from 'react';
import {
    View, StyleSheet, Text, Image, ScrollView, DeviceEventEmitter, TouchableOpacity
} from 'react-native';
import { BaseStyles } from '../Utils/YFWBaseCssStyle';
import YFWTitleView from '../PublicModule/Widge/YFWTitleView';
import { kScreenScaling, iphoneBottomMargin, kScreenWidth, iphoneTopMargin, darkStatusBar, REGISTER_PROTOCOL_HTML, isIphoneX ,isAndroid, PRIVACY_PROTOCOL_HTML} from '../PublicModule/Util/YFWPublicFunction';
import YFWTouchableOpacity from './YFWTouchableOpacity';
import PropTypes from 'prop-types';
import { pushNavigation } from '../Utils/YFWJumpRouting';
import YFWNativeManager from '../Utils/YFWNativeManager';
import { kIsShowPermissionsViewKey,setItem } from '../Utils/YFWStorage';

export default class YFWPermissionsView extends Component {

    static navigationOptions = ({ navigation }) => ({
        header: (<View style={{height:iphoneTopMargin(),backgroundColor:'white'}}></View>),
    });
    static propTypes = {
        closecallback: PropTypes.func
    }

    static defaultProps = {
        closecallback: () => { },
    }
    constructor(...args) {
        super(...args);
        this.state = {
            tip: '为了保证药房网商城App的正常使用以及能够向您提供优质的服务，商城App需要获取以下权限，建议您允许商城App获取相关权限。',
            agreement: '使用药房网商城App过程中，还将可能使用其他权限，详见《用户服务协议》和《隐私权政策》。',
            permissions: [
                { title: '获取设备信息', desc: '药房网商城App会获取手机设备信息，包括设备型号、IDFA(广告标识符)、设备分辨率等，用于安全加固，数据统计，消息通知等。', imageSource: require('../../img/permission_icon_phone.png'), imageStyle: { width: 20, height: 30 } },
                { title: '相机和相册', desc: '用于更换用户头像、上传凭证等功能。如您拒绝授权，您将无法使用这些功能，但这不影响您正常使用药房网商城App的其他功能。', imageSource: require('../../img/permission_icon_camera.png'), imageStyle: { width: 26, height: 24 } },
                { title: '麦克风', desc: '用于在线客服功能。如您拒绝授权，您将无法使用这些功能，但这不影响您正常使用药房网商城App的其他功能。', imageSource: require('../../img/permission_icon_microphone.png'), imageStyle: { width: 23, height: 30 } },
                { title: '定位', desc: '用于商品购买相关功能，包括就近推荐、购买路径优化等。如您拒绝授权，您将无法正常使用药房网商城App的相关功能，建议您开启定位功能。', imageSource: require('../../img/permission_icon_location.png'), imageStyle: { width: 23, height: 30 } },
            ]
        }
    }

    componentWillMount() {
        darkStatusBar()
    }
    componentDidMount() {
        YFWNativeManager.closeSplashImage()
    }


    render() {
        let isX = isIphoneX()
        let permissionsViewArray = this.state.permissions.map((info, index) => {
            return (
                <View style={{ ...styles.cellContainer, marginTop: index == 0 ? 0 : (isX?7:5) }}>
                    <View style={{ width: 79, ...BaseStyles.centerItem }}>
                        <Image style={{ width: 20, height: 30, ...info.imageStyle }} source={info.imageSource}></Image>
                    </View>
                    <View style={{ flex: 1, marginRight: 16 }}>
                        <Text style={{ fontSize: 14, color: "#333", fontWeight: 'bold' }}>{info.title}</Text>
                        <Text style={{ fontSize: 12, lineHeight: 15, color: "#999", marginTop: 6 }}>{info.desc}</Text>
                    </View>
                </View>
            )
        })
        let padding = 30 * kScreenScaling
        let yfwapp = '药房网商城App'
        let tips = this.state.tip.split(yfwapp)
        let agreementName = '用户服务协议'
        let yfwagreement = '《'+agreementName+'》'
        let agreements = this.state.agreement.split(yfwagreement)
        let privacyName = '隐私权政策'
        let yfwPrivacy = '《'+privacyName+'》'
        let privacys = agreements[1].split(yfwPrivacy)
        let btnWidth = (kScreenWidth - padding * 3) / 2
        let titleHeight = isAndroid()?40:34
        let btnPaddingBottom = isAndroid()?20:iphoneBottomMargin()
        return (
            <View style={[BaseStyles.container, { paddingHorizontal: padding, backgroundColor: 'white' }]}>
                <View style={{ marginTop: (isX ? 20 : 0), minHeight: titleHeight }}>
                    <YFWTitleView title={'用户告知'} style_title={{ width: 90, fontSize: 20, color: '#333', fontWeight: 'bold' }} />
                </View>
                <Text style={{ ...styles.normalText, marginTop: (isX ? 20 : 1) }}>{tips[0]}<Text style={{ color: '#1fdb9b', fontWeight: '500' }}>{yfwapp}</Text>{tips[1]}</Text>
                <ScrollView style={{ flex: 1, marginTop: (isX ? 24 : 10) }} bounces={false} showsVerticalScrollIndicator={false}>
                    {permissionsViewArray}
                </ScrollView>
                <Text style={{ ...styles.normalText, marginTop: 20 }}>{agreements[0]}
                    <Text style={{ color: '#1fdb9b', fontWeight: '500' }} onPress={() => this.gotoAgreements()}>{"《"}<Text style={{ textDecorationLine: 'underline' }}>{agreementName}</Text>{'》'}
                    </Text>
                    {privacys[0]}
                    <Text style={{ color: '#1fdb9b', fontWeight: '500' }} onPress={() => this.gotoPrivacy()}>{"《"}<Text style={{ textDecorationLine: 'underline' }}>{privacyName}</Text>{'》'}
                    </Text>
                    {privacys[1]}
                </Text>
                <View style={{ marginTop: (isX ? 38 : 12), paddingBottom: btnPaddingBottom, flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity activeOpacity={1} style={{...styles.exitBtn,width: btnWidth}} onPress={() => {
                        YFWNativeManager.exit();
                    }}>
                        <Text style={{fontSize: 16,color: "#1fdb9b", fontWeight: 'bold'}}>{'不同意并退出'}</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}></View>
                    <YFWTouchableOpacity style_title={{ width:btnWidth , fontSize: 16 }} title={'同意并使用'} isEnableTouch={true} callBack={() => {
                        this.confrimAction()
                    }} />
                </View>
            </View>
        )
    }

    gotoAgreements() {
        const { navigate } = this.props.navigation;
        pushNavigation(navigate,
            {
                type: 'get_h5',
                value: REGISTER_PROTOCOL_HTML(),
                name: '服务条款',
                title: '服务条款',
                isHiddenShare: true
            });
    }

    gotoPrivacy() {
        const { navigate } = this.props.navigation;
        pushNavigation(navigate,
            {
                type: 'get_h5',
                value: PRIVACY_PROTOCOL_HTML(),
                name: '隐私权政策',
                title: '隐私权政策',
                isHiddenShare: true
            });
    }

    confrimAction() {
        DeviceEventEmitter.emit('kPermissionsConfirm',true)
        setItem(kIsShowPermissionsViewKey,'false');
    }

}

const styles = StyleSheet.create({
    normalText: {
        fontSize: 12,
        lineHeight: 16,
        color: "#999",
    },
    cellContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 100 * kScreenScaling,
        borderRadius: 5,
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: "#1fdb9b",
        marginTop: 7,
    },
    exitBtn: {
        ...BaseStyles.centerItem,
        height: 44,
        marginTop: -8,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#1fdb9b"
    }
})