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
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWRequest from '../Utils/YFWRequest'
import YFWToast from '../Utils/YFWToast'
import {getItem, setItem, removeItem,kIsShowLaunchViewKey, kAccountKey} from '../Utils/YFWStorage'
import UserCenterHeader from './YFWUserCenterHeader'
import UserCenterOderItems from './UserCenterOderItems'
import UserCenterBottomItem from './UserCenterBottomItem'
var Dimensions = require('Dimensions');
var ScreenWidth = Dimensions.get('window').width;
import InviteView from '../widget/InviteView'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import {isNotEmpty,isEmpty, kScreenWidth, kScreenHeight, safe, safeObj, checkAuditStatus, mobClick} from '../PublicModule/Util/YFWPublicFunction'
import YFWStatusBar from '../widget/YFWStatusBar'
import UserCenterNavigationView from './UserCenterNavigationView'
import {refreshMessageRedPoint} from "../Utils/YFWInitializeRequestFunction";
import {pushNavigation,addSessionCount, doAfterLogin} from "../Utils/YFWJumpRouting";
import {getWinCashData} from "../Utils/YFWInitializeRequestFunction";
import YFWBlindMobileAlert from '../widget/YFWBlindMobileAlert';
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';

export default class YFWUserCenterVC extends Component {

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
                refreshMessageRedPoint();
                DeviceEventEmitter.emit('ShowInviteView', {value: true});
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
        this.configChangeListener = DeviceEventEmitter.addListener('kSystemConfigChangeNotification',(info)=>{
            this.setState({})
        })
    }

    componentWillUnmount() {
        this.didFocus && this.didFocus.remove()
        this.logoutListener && this.logoutListener.remove()
        this.configChangeListener && this.configChangeListener.remove()
    }

    componentDidMount(){
        this.logoutListener = DeviceEventEmitter.addListener('LOGOUT',()=>{
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
        this.refs.userCenterNavigationView.setOffsetProps(contentY);
    }

    _onScroll=(event)=>{
        this.headStateChange(event);
    }

    _onSrollStart(event) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate',{value:1});
        let contentY = event.nativeEvent.contentOffset.y;
        this.refs.userCenterNavigationView.setOffsetProps(contentY);
    }

    _onSrollEnd(event) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate', {value: 2});
        let contentY = event.nativeEvent.contentOffset.y;
        this.refs.userCenterNavigationView.setOffsetProps(contentY);
    }

    clickedAction(info){
        let {navigate} =  this.props.navigation;
        if (info.name && info.name.startsWith('邀请好友')) {
            getItem(kAccountKey).then((id)=> {
                if (id) {
                    mobClick('account-invite-prizes')
                    getWinCashData(navigate);
                } else {
                    pushNavigation(navigate, {type: 'get_login'});
                }
            }
        )
        } else {
            pushNavigation(navigate, {type: info.type,value:info.value})
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

            <View>
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
                        <UserCenterHeader navigation={this.props.navigation} isRefresh={this.state.isRefresh} isHeader={this.state.isHeader} fetchBannerInfo={(info)=>{
                            if (!this.isFetchBannerInfo) {
                                this.isFetchBannerInfo = true
                                this.setState({
                                    customer_join_items:info.customer_join_items,
                                    invite_win_cash_items:info.invite_win_cash_items,
                                    userName:safe(info.account_real_name).length > 0?info.account_real_name:info.account_name
                                })
                            }
                        }} />
                        {this.renderShareWinCase()}
                        <UserCenterOderItems navigation={this.props.navigation}/>
                        {this.state.customer_join_items.length>0?this.renderBannerView(this.state.customer_join_items[0],21,0):null}
                    </View>
                </ScrollView>
                <UserCenterNavigationView navigation={this.props.navigation} title={this.state.userName} bgStyle={{position:'absolute'}} ref='userCenterNavigationView'/>
                {/*<StatusView ref={(m)=>{this.statusView = m}} retry={()=>{this._request();}}/>*/}
            </View>
        );
    }

    renderShareWinCase(){
        if (!checkAuditStatus() && this.state.invite_win_cash_items.length>0){
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


