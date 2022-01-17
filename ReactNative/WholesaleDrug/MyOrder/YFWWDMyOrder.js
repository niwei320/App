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
    DeviceEventEmitter,
    NativeModules,
    Platform,
    AppState
} from 'react-native';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {
    darkStatusBar,
    isNotEmpty,
    kScreenWidth,
    isIphoneX,
    kStyleWholesale
} from "../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {orangeColor} from '../../Utils/YFWColor'
import {YFWImageConst} from "../Images/YFWImageConst";
import YFWWDOrderList from "./View/YFWWDOrderList";
import YFWScrollableTabBar from "../../PublicModule/Widge/YFWScrollableTabBar";
import {kRoute_order_search, pushWDNavigation} from "../YFWWDJumpRouting";
import YFWWDMore from '../Widget/View/YFWWDMore';
const {StatusBarManager} = NativeModules;
export default class YFWWDMyOrder extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        header: null
    });

    constructor(props) {
        super(props);
        this.state = {
            pageSource:undefined,
            notificationNotice: false,
            orderType:0,
        }
        darkStatusBar();
        this.listener();
    }

    componentWillUnmount() {
        this.didFocus&&this.didFocus.remove()
        this.appStateListener&&this.appStateListener.removeEventListener()
    }
    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._updateNotificationStatus()
            }
        );
        this.appStateListener = AppState.addEventListener('change', (state)=>{
            if (state == 'active'){
                this._updateNotificationStatus()
            }
        })
    }

    _updateNotificationStatus() {
        YFWNativeManager.isOpenNotification((openStatus) => {
             this.setState({
                 notificationNotice: !openStatus
             })
        })
    }

    onRightTvClick() {
        YFWNativeManager.mobClick('account-order-search');
        const {navigate} = this.props.navigation;
        pushWDNavigation(navigate, {
            type: kRoute_order_search, callBack: () => {
                this._changerType(this.state.pageSource)
            }
        })
    }

    _changerType(i) {
        this.state.pageSource = i;
        DeviceEventEmitter.emit('change_tabs', i)
    }

    _renderNotificationView() {
        if (this.state.notificationNotice) {
            return(
                <TouchableOpacity activeOpacity={1} onPress={() => {YFWNativeManager.startAppSettings()}} style={{height: 30, flexDirection:'row', backgroundColor:"#faf8dc",paddingHorizontal:13, alignItems:'center',justifyContent:'space-between'}}>
                    <Text style={{fontSize:13, color:orangeColor()}}>打开通知，随时接收订单状态</Text>
                    <View style={{flexDirection:"row",alignItems:'center'}}>
                        <Text style={{fontSize:13, color:orangeColor()}}>去开启</Text>
                        <Image source={YFWImageConst.Nav_back_white} style={{width: 6, height: 10,transform: [{ rotate: '180deg' }],tintColor:'rgb(254,172,76)'}}/>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    _renderNavigationHeader() {
        let navHeight;
        if(Platform.OS === 'android'){
            navHeight = Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50
        }else {
            navHeight = isIphoneX() ? 88 : 64
        }
        return(
            <View style={{width:kScreenWidth,height:navHeight,zIndex:100}}>
                <Image source={YFWImageConst.Nav_header_background_blue} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
                <View style={{flex:1,flexDirection:'row',alignItems:'center',position:'absolute',left:0,right:0,bottom:0,height:44}}>
                    <TouchableOpacity
                        style={[BaseStyles.item,{width:44,height:44,marginRight:44}]}
                        onPress={()=>{
                            // this.props.navigation.state.params.state.gobackKey?this.props.navigation.goBack(navigation.state.params.state.gobackKey):this.props.navigation.goBack();
                            this.props.navigation.goBack();
                        }}>
                        <Image style={{width: 11, height: 19, resizeMode:'stretch'}} source={YFWImageConst.Nav_back_white}/>
                    </TouchableOpacity>
                    <Text style={{color:'#fff',fontSize:17,fontWeight:'bold',flex:1,textAlign:'center'}}>我的订单</Text>
                    <View style={{flexDirection:'row',width:88,height:44,justifyContent:'flex-end'}}>
                        {this.state.orderType === 0?<TouchableOpacity
                            style={{justifyContent:'center', alignItems:'center', width:44, height:44}}
                            onPress={() => this.onRightTvClick()}>
                            <Image style={{marginRight:15,width:17,height:18}}
                                   source={YFWImageConst.Btn_bar_search}/>
                        </TouchableOpacity>:<View />}
                        <YFWWDMore/>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        let page = 0;
        if(isNotEmpty(this.props.navigation.state.params.state.value)&&'[object Number]' === Object.prototype.toString.call(this.props.navigation.state.params.state.value)){
            page = this.props.navigation.state.params.state.value;
        }
        this.state.pageSource = page;
        let tabNames =['全部','待付款','待发货','待收货','待评价','退货/款'];
        return (
            <View style={styles.container}>
                {this._renderNavigationHeader()}
                {this._renderNotificationView()}
                <View style={{flex:1}}>
                    <ScrollableTabView
                        style={styles.pagerView}
                        tabBarPosition = 'top'
                        initialPage={page}
                        renderTabBar={() => <YFWScrollableTabBar from={kStyleWholesale} isShowLine={true} tabNames={tabNames}/>}
                        onChangeTab={(obj) => {this._changerType(obj.i);}}
                    >
                        <YFWWDOrderList initPosition={page} pageSource={0} navigation={this.props.navigation} tabLabel='全部'    status={''}/>
                        <YFWWDOrderList initPosition={page} pageSource={1} navigation={this.props.navigation} tabLabel='待付款'  status={'unpaid'}/>
                        <YFWWDOrderList initPosition={page} pageSource={2} navigation={this.props.navigation} tabLabel='待发货'  status={'unsent'}/>
                        <YFWWDOrderList initPosition={page} pageSource={3} navigation={this.props.navigation} tabLabel='待收货'  status={'unreceived'}/>
                        <YFWWDOrderList initPosition={page} pageSource={4} navigation={this.props.navigation} tabLabel='待评价'  status={'unevaluated'}/>
                        <YFWWDOrderList initPosition={page} pageSource={5} navigation={this.props.navigation} tabLabel='退货/款' status={'return_goods'}/>
                    </ScrollableTabView>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white'
    },

    textMainStyle: {
        flex: 1,
        fontSize: 40,
        marginTop: 10,
        textAlign: 'center',
        color: 'black'
    },

    textHeaderStyle: {
        fontSize: 40,
        color: 'white',
    }
})
