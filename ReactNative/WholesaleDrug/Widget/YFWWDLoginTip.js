import React, { Component } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    NativeEventEmitter, NativeModules, Platform,
    DeviceEventEmitter,
    NetInfo
} from 'react-native';
import { isNotEmpty, kScreenWidth, kScreenHeight, haslogin, isIphoneX } from "../../PublicModule/Util/YFWPublicFunction";
import { YFWImageConst } from '../Images/YFWImageConst';
import LinearGradient from 'react-native-linear-gradient';
import { pushWDNavigation, kRoute_login } from '../YFWWDJumpRouting';

const { YFWEventManager } = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);

export class YFWWDLoginTip extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            showView: false,
        };
    }

    componentDidMount() {
        if (this.props.navigation) {
            this.navigation = this.props.navigation;
        }
        this.loginListener = DeviceEventEmitter.addListener('WDUserLoginSucess', () => {
            this.setState({});
        });
        this.logoutListener = DeviceEventEmitter.addListener('WDLOGOUT', () => {
            this.setState({});
        });

        DeviceEventEmitter.addListener('kWDStatusChange', (status) => {
            if (this.loginTip) {
                this.loginTip.setNativeProps({
                    style: { height: status ? 45 : 0 }
                })
            }
        })

    }

    componentWillUnmount() {
        this.loginListener && this.loginListener.remove();
        this.logoutListener && this.logoutListener.remove();
    }

    render() {
        return (
            this.renderLoginTipView()
        );
    }

    renderLoginTipView() {
        if (!haslogin()) {
            return (
                <View ref={(e) => this.loginTip = e} style={{ overflow: 'hidden', width: kScreenWidth - 20, height: 45, borderRadius: 22.5, marginLeft: 10, marginTop: kScreenHeight - 50 - 50 - 15 - (isIphoneX() ? 34 : 0), backgroundColor: 'rgba(0,0,0,0.7)', position: 'absolute' }}>
                    <TouchableOpacity onPress={() => this.goToLogin()} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: 7, marginRight: 17 }}>
                        <Image style={{ resizeMode: 'contain', width: 37, height: 37 }}
                            source={YFWImageConst.Market_icon_user} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 14, color: 'white', fontWeight: '500' }}>
                                {'批发市场仅对企业客户开放'}
                            </Text>
                            <Text style={{ fontSize: 12, color: 'white', marginTop: 5, fontWeight: '500' }}>
                                {'登录后才可以浏览商品和交易'}
                            </Text>
                        </View>
                        <View flex={1} />
                        <LinearGradient
                            colors={['rgb(255,184,68)', 'rgb(255,139,62)']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            locations={[1, 0]}
                            style={{ borderRadius: 13, height: 26, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>{'登录/注册'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (<View />);
        }


    }

    goToLogin() {
        let { navigate } = this.navigation;
        pushWDNavigation(navigate, { type: kRoute_login })
    }
}
