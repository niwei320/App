import React,{Component} from 'react'
import {View, SectionList, Alert, StyleSheet, DeviceEventEmitter, Image, TouchableOpacity,NativeModules,Platform} from 'react-native'
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWSettingCell from './YFWSettingCell'
import {backGroundColor} from '../Utils/YFWColor'
import YFWTitleView from '../PublicModule/Widge/YFWTitleView'
import YFWToast from "../Utils/YFWToast";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import {postPushDeviceInfo} from "../Utils/YFWInitializeRequestFunction";
import {ABOUNT_US_HTML, REGISTER_PROTOCOL_HTML, RETURN_GOODS_HTML, RECEIVE_PROTOCOL_HTML, kScreenWidth, PRIVACY_PROTOCOL_HTML} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from '../Utils/YFWBaseCssStyle'
import YFWStatusBar from '../widget/YFWStatusBar'
import NavigationActions from '../../node_modules_local/react-navigation/src/NavigationActions';
import ReturnTipsDialog from '../PublicModule/Widge/ReturnTipsDialog';
const {StatusBarManager} = NativeModules;

let _this = null;

let loginOut = {
    id: 4,
    key: 'loginOut',
    isShowHeader: false,
    data: [
        {
            id: 1,
            key: 'login',
            title: '退出登录',
        },
    ],
}

export default class YFWSettingController extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "设置",
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1
        },
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white', borderBottomWidth: 0},
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                            onPress={() => {navigation.goBack()}}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                        source={ require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerRight: <View style={{width:50}}/>,
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
    });

    constructor(props) {
        super(props)
        this.state = {
            isLogin: this.props.navigation.state.params.isLogin,
            cacheSize: '0M',
            version_num: 'v1.0.00',
            dataSource: [],
        }

        this.listener();
    }

    _getCacheSize() {
        YFWNativeManager.getCacheSize((info) => {
            this.setState({
                cacheSize: info,
            },()=>{
                this._fetchData()
            });
        });
    }

    _getVersion() {
        YFWNativeManager.getVersionNum((value)=> {
            this.setState({
                version_num: 'v' + value,
            })
        })
    }

    _fetchData() {

        var response = [
            {
                id: 1,
                key: 'clearCache',
                isShowHeader: false,
                data: [
                    {
                        id: 1,
                        key: 'info',
                        title: '账户管理',
                    },{
                        id: 2,
                        key: 'cache',
                        title: '清除图片缓存',
                        subtitle: this.state.cacheSize,
                    },
                    // {
                    //     id: 3,
                    //     key: 'util',
                    //     title: '工具',
                    // }
                ],
            },
            {
                id: 2,
                key: 'aboutWe',
                title: '关于我们',
                isShowHeader: true,
                data: [
                    {
                        id: 1,
                        key: 'feedBack',
                        title: '意见反馈',
                    },
                    {
                        id: 2,
                        key: 'goodCompent',
                        title: '给我好评',
                        subImage: require('../../img/good_reputation.png'),
                    },
                    {
                        id: 3,
                        key: 'callWe',
                        title: '联系我们',
                    },
                    {
                        id: 4,
                        key: 'about',
                        title: '关于我们',
                        subtitle: this.state.version_num,
                    },
                    {
                        id: 5,
                        key: 'safe',
                        title: '安全管理',
                    },
                ],
            },
            {
                id: 3,
                key: 'rules',
                title: '协议条款',
                isShowHeader: true,
                data: [
                    {
                        id: 1,
                        key: 'serviceRules',
                        title: '服务条款',
                    },
                    {
                        id: 4,
                        key: 'privacyRules',
                        title: '隐私政策',
                    },
                    {
                        id: 2,
                        key: 'checkRules',
                        title: '商品验收标准',
                    },
                    {
                        id: 3,
                        key: 'returnRules',
                        title: '商品退换货政策',
                    },
                ],
            }

        ]

        if (this.state.isLogin) {
            response.push(loginOut)
        }

        this.setState({
            dataSource: response,
        })

    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                DeviceEventEmitter.emit('ShowInviteView', {value: true});

                this._isShowLoginOut();
            }
        );
    }

    _isShowLoginOut() {
        let userInfo = YFWUserInfoManager.ShareInstance();
        let ssid = userInfo.getSsid();
        let isCludeLoginout = this.state.dataSource.includes(loginOut)

        if (ssid && !isCludeLoginout) {
            var dataSource = this.state.dataSource;
            dataSource.push(loginOut);
            this.setState({
                dataSource: dataSource
            })
        } else if (!ssid && isCludeLoginout) {
            var dataSource = this.state.dataSource;
            dataSource.pop(loginOut);
            this.setState({
                dataSource: dataSource
            })
        }
    }

    componentDidMount() {

        this._getVersion()
        this._getCacheSize()
        this._fetchData()

        _this = this
    }

    componentWillUnmount() {
        this.didFocus.remove()
    }

    render() {
        return(
            <View style = {styles.contanier}>
                <YFWStatusBar addListener={this.props.navigation.addListener}/>
                <ReturnTipsDialog ref={(item) => {this.returnDialog = item}}/>
                <SectionList
                sections = {this.state.dataSource}
                renderItem = {this._renderCell}
                renderSectionHeader = {this._renderSectionHeader}
                renderSectionFooter = {this._renderSectionFooter}
                ItemSeparatorComponent = {this._renderSeparator}
                ListFooterComponent = {this._renderListFooter}
                onScrollBeginDrag = {this._sectionListScrollStart}
                onScrollEndDrag = {this._sectionListScrollEnd}
                stickySectionHeadersEnabled={false}
            />

            </View>

        )
    }

    _renderListFooter=()=>{
        return (
            
            <View style={{ width: kScreenWidth, height: 50, backgroundColor: 'transform', alignItems: 'center' ,flexDirection:'row'}}>
                <TouchableOpacity style={{ flex: 1, height: 50, backgroundColor: 'transform', alignItems: 'center' }} delayLongPress={3 * 1000} onLongPress={() => {pushNavigation(this.props.navigation.navigate, { type: 'wholesale_homepage' })}}/>
                <TouchableOpacity style={{flex:1, height: 50, backgroundColor: 'transform', alignItems: 'center'}} delayLongPress = {3*1000}onLongPress={() => {pushNavigation(this.props.navigation.navigate, {type: 'test_module_one',})}}/>
            </View>
        )

    }

    /** 渲染SectionList */
    _renderCell({item}) {
        return <YFWSettingCell model={item} callBack={(item) => _this._selectCell(item)}/>
    }

    _renderSectionHeader({section}) {
        if (section.isShowHeader === true) {
            return (
                <View style={styles.sectionHeader}>
                    <YFWTitleView title={section.title}></YFWTitleView>
                </View>
            )
        }

    }

    _renderSectionFooter({item}) {
        return <View style={styles.sectionFooter}/>
    }

    _renderSeparator() {
        return (
            <View style={styles.separator}>
                <View style={{backgroundColor: backGroundColor(), height: 1}}></View>
            </View>
        )
    }
    /** 渲染SectionList */

    /** sectionList滑动方法 */
    _sectionListScrollStart() {
        DeviceEventEmitter.emit('ShowInviteViewAnimate',{value:1});
    }

    _sectionListScrollEnd() {
        DeviceEventEmitter.emit('ShowInviteViewAnimate',{value:2});
    }

    /** 点击cell的回调方法 */
    _selectCell(item) {
        const {navigate} = this.props.navigation;

        if (item.title === '账户管理') {
            YFWNativeManager.mobClick('account-setting');
            pushNavigation(navigate, {type: 'user_info'});
        } else if (item.title === '清除图片缓存') {
            this._clearCache();
        } else if (item.title === '意见反馈') {
            YFWNativeManager.mobClick('account-feedback');
            pushNavigation(navigate,{type:'get_feedback'})
        } else if (item.title === '给我好评') {
            YFWNativeManager.openAppStoreComment(()=>{});
        } else if (item.title === '联系我们') {
            YFWNativeManager.mobClick('account-contact');
            this.props.navigation.navigate('ContactUs')
        } else if (item.title === '关于我们') {
            YFWNativeManager.mobClick('account-about us');
            pushNavigation(navigate, {type: 'account_aboutus'});
        } else if (item.title === '安全管理') {
            pushNavigation(navigate, {type: 'user_info',from:'setting'});
        } else if (item.title === '服务条款') {
            YFWNativeManager.mobClick('setting-service');
            pushNavigation(navigate, {
                type: 'get_h5',
                value: REGISTER_PROTOCOL_HTML(),
                name: '服务条款',
                title: '服务条款',
                isHiddenShare:true,
            });
        }  else if (item.title === '隐私政策') {
            YFWNativeManager.mobClick('setting-privacy');
            pushNavigation(navigate, {
                type: 'get_h5',
                value: PRIVACY_PROTOCOL_HTML(),
                name: '隐私政策',
                title: '隐私政策',
                isHiddenShare:true,
            });
        } else if (item.title === '商品验收标准') {
            YFWNativeManager.mobClick('setting-goods');
            pushNavigation(navigate, {
                type: 'get_h5',
                value: RECEIVE_PROTOCOL_HTML(),
                name: '商品验收标准',
                title: '商品验收标准',
                isHiddenShare:true,
            });
        } else if (item.title === '商品退换货政策') {
            YFWNativeManager.mobClick('setting-return goods');
            pushNavigation(navigate, {
                type: 'get_h5',
                value: RETURN_GOODS_HTML(),
                name: '商品退换货政策',
                title: '商品退换货政策',
                isHiddenShare:true,
            });
        } else if (item.title === '退出登录') {
            this._loginOut();
        } else if (item.title === '工具') {
            pushNavigation(navigate, {
                type: 'test_module_one',
            });
        }
    }

    /** 每个cell的函数 */
    _clearCache() {
        YFWNativeManager.mobClick('setting-clear');
        Alert.alert(
            '提示',
            '\n是否清除缓存\n',
            [
                {
                    text: '确定', onPress: () => {
                        YFWNativeManager.clearCache((info) => {
                            YFWToast("清理成功")
                            this._getCacheSize()
                        });
                    }
                },
                {text: '取消', style: 'cancel'}],
                {cancelable: false}
        );
    }

    _loginOut() {
        const {navigate, goBack, state} = this.props.navigation;
        YFWNativeManager.mobClick('log off');
            this._changeAppStatus();
            let userInfo = new YFWUserInfoManager();
            userInfo.clearInfo();
            //提交推送设备信息
            postPushDeviceInfo()
            state.params.callback();
            goBack();
            DeviceEventEmitter.emit('Login_Off')
            const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' })
            this.props.navigation.dispatch(resetActionTab);
    }

    _changeAppStatus() {
        let clearOrderTipsNum = []
        new YFWUserInfoManager().shopCarNum = 0  //消除购物车红点
        new YFWUserInfoManager().otoShopCarNum = 0  //消除购物车红点
        new YFWUserInfoManager().messageRedPointVisible = 'false'  //消除购物车红点
        DeviceEventEmitter.emit('ALL_MESSAGE_RED_POINT_STATUS')//消除消息红点
        DeviceEventEmitter.emit('ORDER_ITEMS_TIPS_NUMS', clearOrderTipsNum)//消除订单红点
        DeviceEventEmitter.emit('DRUGREMIND_RED_POINT', {drug_remind_count:0})//消除服药提醒红点
        DeviceEventEmitter.emit('LOGOUT')//退出登录通知
    }
}

const styles = StyleSheet.create({
    contanier: {
        flex: 1,
        backgroundColor: backGroundColor(),
    },
    sectionHeader: {
        height: 40,
        backgroundColor: backGroundColor(),
        paddingLeft: 16,
    },
    sectionFooter: {
        height: 12,
        backgroundColor: backGroundColor(),
    },
    separator: {
        backgroundColor: 'white',
        paddingLeft: 16,
        height: 1,
    }
})