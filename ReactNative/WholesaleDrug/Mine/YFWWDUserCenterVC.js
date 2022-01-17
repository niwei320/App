/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    Platform,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    RefreshControl,
    DeviceEventEmitter
} from 'react-native';
import {getItem,kWDAccountKey} from '../../Utils/YFWStorage'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {isNotEmpty,isEmpty, kScreenWidth, kScreenHeight, safe, safeObj, checkAuditStatus} from '../../PublicModule/Util/YFWPublicFunction'
import YFWStatusBar from '../../widget/YFWStatusBar'
import {getWinCashData} from "../../Utils/YFWInitializeRequestFunction";
import YFWWDUserCenterHeader from './YFWWDUserCenterHeader';
import YFWWDUsercenterOderItems from './YFWWDUserCenterOderItems';
import { pushWDNavigation, kRoute_login,addSessionCount } from '../YFWWDJumpRouting';
import LinearGradient from 'react-native-linear-gradient';
import NavigationActions from 'react-navigation/src/NavigationActions';

export default class YFWWDUserCenterVC extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLogin: false,
            item: {},
            visible: false,
            isRefresh: false,
            isHeader: false,
            customer_join_items:[],//商家入驻
            invite_win_cash_items:[],//邀请赢现金
        };
        this.listener();
        this.isFetchBannerInfo = false
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                DeviceEventEmitter.emit('ShowInviteView', {value: false});
                getItem('sessionMap').then((data)=>{
                    if(data){
                        if(data['details']['YFWUserCenterVC']){

                        }else
                        {
                            addSessionCount('YFWUserCenterVC','个人中心');
                        }
                    }

                })
            }
        );
    }

    componentWillUnmount() {
        this.didFocus.remove()
        this.logoutListener && this.logoutListener.remove()
    }

    componentDidMount(){
        this.logoutListener = DeviceEventEmitter.addListener('WDLOGOUT',()=>{
            this.isFetchBannerInfo = false
            this.setState({
                userName:''
            })
        })

    }

    _onRefresh() {
        this.setState(()=>({
                isRefresh: true,
                isHeader: false
            })
        )
    }
    headStateChange(event){
        let contentY = event.nativeEvent.contentOffset.y;
    }

    _onScroll=(event)=>{
        this.headStateChange(event);
    }

    _onSrollStart(event) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate',{value:1});
        let contentY = event.nativeEvent.contentOffset.y;
    }

    _onSrollEnd(event) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate', {value: 2});
        let contentY = event.nativeEvent.contentOffset.y;
    }

    clickedAction(info){
        let {navigate} =  this.props.navigation;
        if (info.name && info.name.startsWith('邀请好友')) {
            getItem(kWDAccountKey).then((id)=> {
                if (id) {
                    getWinCashData(navigate);
                } else {
                    pushWDNavigation(navigate, {type:kRoute_login});
                }
            }
        )
        } else {
            pushWDNavigation(navigate, {type: info.type,value:info.value})
        }
    }


    renderBannerView(info,marginBottom,marginTop){
        let height = kScreenWidth*parseInt(info.img_height)/parseInt(info.img_width)
        if (!height||height<=0) {
            height = 82
        }
        if (!marginBottom) {
            marginBottom = 0
        }
        if (!marginTop) {
            marginTop = 0
        }
        //TODO:: 测试本地环境
        let imageUrl = info.img_url
        if(imageUrl.startsWith('https')){
            imageUrl = imageUrl.replace('https', 'http')
        }
        return (
            <TouchableOpacity activeOpacity={1} style={{marginTop:marginTop,marginBottom:marginBottom}} onPress={()=>{this.clickedAction(info)}} >
                <Image style={{height:height,resizeMode:'cover',width:kScreenWidth}} source={{uri:imageUrl}}></Image>
            </TouchableOpacity>
        )
    }

    render() {
        this.state.isRefresh = false;
        let userInfo = YFWUserInfoManager.ShareInstance();
        let url = 'undefined';
        if (isNotEmpty(userInfo.SystemConfig)) {
            url = userInfo.SystemConfig.ads_item;
        }
        return (

            <View style={{flex:1}}>
                <YFWStatusBar addListener={this.props.navigation.addListener}/>
                <ScrollView
                            ref="scrollView"
                            showsVerticalScrollIndicator={false}
                            onTouchStart={this._contentViewStart}
                            onScrollBeginDrag={this._onSrollStart.bind(this)}
                            onMomentumScrollEnd={this._onSrollEnd.bind(this)}
                            onScrollEndDrag={this._onSrollEnd.bind(this)}
                            onScroll={this._onScroll}
                            scrollEventThrottle={50}
                            bounces={false}
                >
                    <View style={styles.container}>
                        <YFWWDUserCenterHeader navigation={this.props.navigation} isRefresh={this.state.isRefresh} isHeader={this.state.isHeader} fetchBannerInfo={(info)=>{
                            if (info&&!this.isFetchBannerInfo) {
                                this.isFetchBannerInfo = true
                                this.setState({
                                    // customer_join_items:info.customer_join_items,
                                    invite_win_cash_items:info.invite_win_cash_items,
                                    userName:safe(info.account_real_name).length > 0?info.account_real_name:info.account_name
                                })
                            }
                        }} />
                        {this.renderShareWinCase()}
                        <YFWWDUsercenterOderItems navigation={this.props.navigation}/>
                    </View>
                    <View style={{height:60}}/>
                </ScrollView>
            </View>
        );
    }

    toHome() {
        this.props.navigation.popToTop();
        const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
        this.props.navigation.dispatch(resetActionTab);
    }

    _changeAppStatus() {
        DeviceEventEmitter.emit('WD_ALL_MESSAGE_RED_POINT_STATUS')//消除消息红点
        DeviceEventEmitter.emit('WD_ORDER_ITEMS_TIPS_NUMS', [])//消除订单红点
        DeviceEventEmitter.emit('WDLOGOUT')//退出登录通知
    }

    renderShareWinCase(){
        if (!checkAuditStatus() && this.state.invite_win_cash_items && this.state.invite_win_cash_items.length>0){
            return this.renderBannerView(this.state.invite_win_cash_items[0],0,10)
        }

        return (<View/>)
    }




    static navigationOptions = ({navigation}) => ({
        tabBarVisible: true,
        header: null,

    });
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    button: {
        width: 120,
        height: 45,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4398ff',
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Cochin',
        textAlign: 'left'
    }
});


