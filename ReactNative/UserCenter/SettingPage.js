/**
 * Created by 12345 on 2018/4/23.
 */
import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    Image,
    TouchableOpacity,
    DeviceEventEmitter,
    Alert, Platform, NativeModules
} from 'react-native';
const width = Dimensions.get('window').width;
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWToast from "../Utils/YFWToast";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWVersionUpdateModel from "../Utils/Model/YFWVersionUpdateModel";
import {
    darkStatusBar,
    iphoneBottomMargin,
    kScreenHeight,
    RECEIVE_PROTOCOL_HTML,
    REGISTER_PROTOCOL_HTML, RETURN_GOODS_HTML
} from "../PublicModule/Util/YFWPublicFunction";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import {postPushDeviceInfo} from "../Utils/YFWInitializeRequestFunction";

const styles = StyleSheet.create({
    spiltView: {
        width: width,
        height: 10,
        backgroundColor: 'rgba(178,178,178,0.2)'
    },
    orderAndTips: {
        width: width,
        backgroundColor: "white"
    },
    TextStyle: {
        color: 'black',
        fontSize: 15,
        margin: 10
    }, innerImag: {
        width: 25,
        height: 25,
        resizeMode: 'cover',
        marginTop: 10,
        alignSelf: 'center'
    }, imgScroll: {
        width: '100%',
        height: 70,
        flexDirection: 'row'
    },
    TipsTextStyle: {
        color: 'black',
        fontSize: 15,
        marginLeft: 20,
        marginTop: 15,
        marginBottom: 15
    },
    TipsRightTextStyle: {
        color: 'black',
        fontSize: 15,
        marginRight: 20,
        marginTop: 15,
        marginBottom: 15
    }
});
export default class extends React.Component {


    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "设置",
        headerRight: <View style={{width:50}}/>

    });

    constructor(props) {
        super(props)
        this.state = {
            isLogin: false,
            cacheSize: 0,
        }
    }

    componentDidMount() {
        darkStatusBar();
        //这里获取从FirstPageComponent传递过来的参数
        this.setState({
            isLogin: this.props.navigation.state.params.isLogin
        });
        this._getCacheSize();
    }

    _getCacheSize() {
        YFWNativeManager.getCacheSize((info) => {
            this.setState({
                cacheSize: info,
            });
        });
    }

    _clearCache() {
        YFWNativeManager.mobClick('setting-clear');
        Alert.alert(
            '提示',
            '\n是否清除缓存\n',
            [
                {
                    text: '确定', onPress: () => {
                        YFWNativeManager.clearCache((info) => {
                            YFWToast("清理成功!")
                            this._getCacheSize()
                        });
                    }
                },
                {text: '取消', style: 'cancel'}],
            {cancelable: false}
        );
    }

    _changeAppStatus() {
        let clearOrderTipsNum = []
        new YFWUserInfoManager().shopCarNum = 0  //消除购物车红点
        new YFWUserInfoManager().messageRedPointVisible = 'false'  //消除购物车红点
        DeviceEventEmitter.emit('ALL_MESSAGE_RED_POINT_STATUS')//消除消息红点
        DeviceEventEmitter.emit('ORDER_ITEMS_TIPS_NUMS', clearOrderTipsNum)//消除订单红点
        DeviceEventEmitter.emit('DRUGREMIND_RED_POINT', {drug_remind_count:0})//消除服药提醒红点
        DeviceEventEmitter.emit('LOGOUT')//退出登录通知
    }

    _judgeLogin() {
        const bottom = iphoneBottomMargin();
        if (this.state.isLogin) {
            const {navigate, goBack, state} = this.props.navigation;
            return (<View style={{alignItems: 'center',marginBottom:bottom}}>
                <TouchableOpacity style={{width: width, height: 50, backgroundColor: 'transform', alignItems: 'center'}}
                                  onLongPress={() => {
                                      YFWNativeManager.changeTcpHost()
                                  }}>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    width: width,
                    height: 50,
                    backgroundColor: '#16c08e',
                    justifyContent: 'center',
                    alignItems: 'center'
                }} onPress={() => {
                    YFWNativeManager.mobClick('log off');
                    this._changeAppStatus();
                    let userInfo = new YFWUserInfoManager();
                    userInfo.clearInfo();
                    //提交推送设备信息
                    postPushDeviceInfo()
                    state.params.callback();
                    goBack();
                    DeviceEventEmitter.emit('Login_Off')
                }
                }>
                    <Text style={{fontSize: 15, color: 'white'}}>退出登录</Text>
                </TouchableOpacity>

            </View>);
        } else {
            const {navigate, goBack, state} = this.props.navigation;
            return (<View>
                <TouchableOpacity style={{width: width, height: 50, backgroundColor: 'transform', alignItems: 'center'}}
                                  onLongPress={() => {
                                      YFWNativeManager.changeTcpHost()
                                  }}>
                </TouchableOpacity>
            </View>);
        }
    }

    //Android检查更新方法
    check_Update(){
        YFWNativeManager.mobClick('setting-update');
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.common.app.checkUpdate');
        paramMap.set('version', YFWUserInfoManager.ShareInstance().version.replace(/\./g, ""));
        paramMap.set('os', Platform.OS);

        viewModel.TCPRequest(paramMap, (res) => {
            let model = YFWVersionUpdateModel.getModelWithData(res.result);
            try {
                if (Platform.OS == 'ios') {
                    if (model.isForceUpdate == '1' || model.isNeedUpdate == '1') {
                        DeviceEventEmitter.emit('OpenVersionUpdateAlertView', model);
                    }
                } else {
                    if (parseInt(model.new_version.replace(/\./g, '')) > parseInt(YFWUserInfoManager.ShareInstance().version.replace(/\./g, ''))) {
                        YFWNativeManager.downloadApk(res.result)
                    } else {
                        YFWToast("当前已是最新版本")
                    }
                }
            } catch (e) {
                YFWToast("当前已是最新版本")
            }
        }, (error) => {
        }, false);
    }


    update_botton(){
        if(Platform.OS == 'ios') {

        }else {
            return (
                <TouchableOpacity onPress={() => this.check_Update()}>
                <View style={{flexDirection: 'row', width: width}}>
                    <Text  style={[styles.TipsTextStyle,{fontWeight:('bold', '200')}]}>检查更新</Text>
                    <View style={{flex: 1}}></View>
                    <Text style={[styles.TipsRightTextStyle,{fontWeight:('bold', '200')}]}>v{YFWUserInfoManager.ShareInstance().version}</Text>
                </View>
            </TouchableOpacity>);
        }
    }

    render() {
        return (
            <View style={{justifyContent:'space-between',flex:1}}>
                <View>
                    <AndroidHeaderBottomLine/>
                    <View style={{width: width, flexDirection: 'column', backgroundColor: 'white', marginTop: 10}}>
                        <TouchableOpacity onPress={() => this._clearCache()}>
                            <View style={{flexDirection: 'row', width: width,height:50,alignItems:'center'}}>
                                <Text style={[styles.TipsTextStyle,{fontWeight:('bold', '200')}]}>清理图片缓存</Text>
                                <View style={{flex: 1}}></View>
                                <Text style={[styles.TipsRightTextStyle,{fontWeight:('bold', '200')}]}>{this.state.cacheSize}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.spiltView} height={1} marginLeft={10}/>
                        {this.update_botton()}
                    </View>

                    <View style={{width: width, flexDirection: 'column', backgroundColor: 'white', marginTop: 10}}>
                        <TouchableOpacity onPress={() => {
                            YFWNativeManager.mobClick('setting-service');
                            const {navigate} = this.props.navigation;
                            pushNavigation(navigate, {
                                type: 'get_h5',
                                value: REGISTER_PROTOCOL_HTML(),
                                name: '服务条款',
                                title: '服务条款',
                                isHiddenShare:true,
                            });
                        }
                        }>
                            <View style={{flexDirection: 'row', width: width,height:50,alignItems:'center'}}>
                                <Text style={[styles.TipsTextStyle,{fontWeight:('bold', '200')}]}>服务条款</Text>
                                <View style={{flex: 1}}></View>
                                <Image source={require('../../img/uc_next.png')}
                                       style={{
                                           width: 10,
                                           height: 12,
                                           alignSelf: 'center',
                                           marginRight: 10,
                                           resizeMode: 'contain'
                                       }}/>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.spiltView} height={1} marginLeft={20}></View>
                        <TouchableOpacity onPress={() => {
                            YFWNativeManager.mobClick('setting-goods');
                            const {navigate} = this.props.navigation;
                            pushNavigation(navigate, {
                                type: 'get_h5',
                                value: RECEIVE_PROTOCOL_HTML(),
                                name: '商品验收标准',
                                title: '商品验收标准',
                                isHiddenShare:true,
                            });
                        }
                        }>
                            <View style={{flexDirection: 'row', width: width,height:50,alignItems:'center'}}>
                                <Text style={[styles.TipsTextStyle,{fontWeight:('bold', '200')}]}>商品验收标准</Text>
                                <View style={{flex: 1}}></View>
                                <Image source={require('../../img/uc_next.png')}
                                       style={{
                                           width: 10,
                                           height: 12,
                                           alignSelf: 'center',
                                           marginRight: 10,
                                           resizeMode: 'contain'
                                       }}/>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.spiltView} height={1} marginLeft={20}></View>
                        <TouchableOpacity onPress={() => {
                            YFWNativeManager.mobClick('setting-return goods');
                            const {navigate} = this.props.navigation;
                            pushNavigation(navigate, {
                                type: 'get_h5',
                                value: RETURN_GOODS_HTML(),
                                name: '商品退货政策',
                                title: '商品退货政策',
                                isHiddenShare:true,
                            });
                        }
                        }>
                            <View style={{flexDirection: 'row', width: width,height:50,alignItems:'center'}}>
                                <Text style={[styles.TipsTextStyle,{fontWeight:('bold', '200')}]}>商品退货政策</Text>
                                <View style={{flex: 1}}></View>
                                <Image source={require('../../img/uc_next.png')}
                                       style={{
                                           width: 10,
                                           height: 12,
                                           alignSelf: 'center',
                                           marginRight: 10,
                                           resizeMode: 'contain'
                                       }}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {this._judgeLogin()}
            </View>
        );
    }
}