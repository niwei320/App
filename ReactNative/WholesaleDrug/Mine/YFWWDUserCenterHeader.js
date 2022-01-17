/**
 * Created by admin on 2018/4/27.
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    MapLayout,
    ImageBackground,
    TouchableOpacity,
    bool,
    func,
    DeviceEventEmitter,
    NativeModules, Platform
} from 'react-native';
import {getItem, setItem, kWDAccountKey} from '../../Utils/YFWStorage'
import {log, logErr, logWarm} from '../../Utils/YFWLog'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {
    imageJoinURL,
    iphoneTopMargin,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    safeObj,
    adaptSize,
    checkAuditStatus,
    kStyleWholesale
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWNativeManager from  '../../Utils/YFWNativeManager'
import {
    postPushDeviceInfo,
    TYPE_SIGN_POINTS,
    refreshWDRedPoint,
    refreshWDMessageRedPoint,
    getWDSignInData, getPurchaseStatus
} from "../../Utils/YFWInitializeRequestFunction";
import RNFS from 'react-native-fs';
import YFWWDMessageRedPointView from '../Widget/View/YFWWDMessageRedPointView';
import { YFWImageConst } from '../Images/YFWImageConst';
import LinearGradient from 'react-native-linear-gradient';
import YFWWDUserInfoModel from './Model/YFWWDUserInfoModel';
import { pushWDNavigation,doAfterLogin, kRoute_favorite, kRoute_viewd_history, kRoute_supplier, kRoute_frequently_goods, kRoute_browsing_history, kRoute_store_info, kRoute_message_home, kRoute_account_setting } from '../YFWWDJumpRouting';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const styles = StyleSheet.create({
    userCenterHeaderStyle: {
        width: width,
        height: 170+iphoneTopMargin(),
    },
    userCenterHeaderBgStyle: {
        position: 'absolute',//相对父元素进行绝对定位
    },
    textStyle: {
        fontSize: 15,
        color: 'white'
    }
});


export default class YFWWDUserCenterHeader extends Component {


    constructor(props) {
        super(props)
        this.state = {
            isLogin: false,
            visible: false,
            datas: [],
            isRefresh: this.props.isRefresh,
            isMounted: true,
            auth_status:false,
        };
        this.clickEnable = true;
        this.listener()
    }
    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                let userInfo = YFWUserInfoManager.ShareInstance();
                let ssid = userInfo.getSsid();
                if (ssid) {
                    this.state.isLogin = true
                    this._requestCenterInfo();
                } else {
                    this.setState({
                        isLogin: false,
                        datas:[]
                    })
                }
            }
        );
    }

    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener('userinfochange', ()=> {
            let userInfo = YFWUserInfoManager.ShareInstance();
            let ssid = userInfo.getSsid();

            if (ssid) {
                this.state.isLogin = true
                this._requestCenterInfo();
            } else {
                this.setState({
                    isLogin: false,
                    datas:[]
                })
            }
        })



        this.subscription = DeviceEventEmitter.addListener('WDUserLoginSucess', ()=> {
            //提交推送设备信息
            postPushDeviceInfo()
            let userInfo = YFWUserInfoManager.ShareInstance();
            let ssid = userInfo.getSsid();

            if (ssid) {
                this.state.isLogin = true
                this._requestCenterInfo();
            } else {
                this.setState({
                    isLogin: false,
                    datas:[]
                })
            }
        })
        this.logoutListener = DeviceEventEmitter.addListener('WDLOGOUT',()=>{
            YFWUserInfoManager.ShareInstance().clearInfo()
            this.setState({
                isLogin: false,
                datas:[]
            })
        })
    }


    componentWillUnmount() {
        // 移除
        this.subscription.remove();
        this.state.isMounted = false;
        this.didFocus.remove();
        this.logoutListener && this.logoutListener.remove()
    }

    setOffsetProps(newOffsetY){


    }

    componentWillReceiveProps(nextProps) {
        log("componentWillReceiveProps")
        if (!nextProps.isHeader) {
            getItem(kWDAccountKey).then((id)=> {
                if (id) {
                    this.state.isLogin = true
                    this._requestCenterInfo();
                } else {
                    this.setState({
                        isLogin: false,
                        datas:[]
                    })
                }
            });
        }
    }

    render() {
        let bgImageSource = YFWImageConst.Nav_header_background_blue
        return (
            <View style={styles.userCenterHeaderStyle}>
                <ImageBackground style={styles.userCenterHeaderStyle}
                                    source={bgImageSource}>
                    {this.renderSettingView()}
                    <View style={{position: 'absolute',top:12+iphoneTopMargin()-20+20,left:12,right:0}}>
                        {this.renderUserState()}
                    </View>
                    {this.renderBottomView()}
                </ImageBackground>
            </View>
        );
    }

    renderSettingView(){

        let messageCount = this.state.datas.to_view_message_count?parseInt(this.state.datas.to_view_message_count):null
        return(
            <View style={{ position: 'absolute', top: 12 + iphoneTopMargin() - 20, right: 7, width: 100, height: 28, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                <TouchableOpacity activeOpacity={1} onPress={() => { pushWDNavigation(this.props.navigation.navigate, {type:kRoute_account_setting})}} style={{flexDirection:'row',alignContent:'center',alignItems:'center',marginRight:10}}>
                    <Image style={{width:22,height:22,tintColor:'white'}} source={YFWImageConst.Icon_icon_setup}/>
                </TouchableOpacity>
                <View style={{flex:1}}/>
                <YFWWDMessageRedPointView messageCount={messageCount} isWhiteBg={true} navigation={this.props.navigation} callBack={()=>{}} />
            </View>
        )
    }

    renderBottomView(){

        let datasArray =
        [
            {title:'最近浏览',count:safeObj(this.state.datas).browsed_count,extras:'get_viewd'},
            {title:'我的收藏',count:safeObj(this.state.datas).user_favorite,extras:'get_favorite'},
            {title:'常购商品',count:safeObj(this.state.datas).oftenMedicine_count,extras:'my_intergration'},
            {title:'供应商',count:safeObj(this.state.datas).suppliers_count,extras:'get_supplier'},
        ]

        let views = []

        datasArray.map((item,index)=>{
            views.push(
                <TouchableOpacity key={index+'v'} activeOpacity={1} onPress={()=>this._clickItem(item)} style={{flex:1,alignContent:'center',alignItems:'center',marginTop:18}}>
                    <Text style={{fontSize:19,color:'#333',lineHeight:20,fontWeight:'bold'}}>{item.count}</Text>
                    <Text style={{fontSize:12,color:'#666',marginTop:4,lineHeight:13}}>{item.title}</Text>
                </TouchableOpacity>
            )
        })
        let colors = ['rgb(255,255,255)','rgb(240,243,255)']
        return(
            <LinearGradient colors={colors}
                            start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                            locations={[0,1]}
                            style={{borderTopLeftRadius:10,borderTopRightRadius:10, paddingHorizontal:3,height:80,position:'absolute',bottom:0,left:13,right:13,flexDirection:'row',justifyContent:'space-around'}}>
                                {views}
            </LinearGradient>
        )
    }


    renderUserState() {
        let textColor = 'white'
        let textWeight = '500'
        let name = this.state.datas.shop_name
        let tips = this.state.datas.recent_buy
        let auth_status_icon = this.state.auth_status?YFWImageConst.Icon_shop_auth:YFWImageConst.Icon_shop_no_auth
        return(
            <TouchableOpacity
                style={{flexDirection: 'row',height:60,alignItems:'center'}}
                activeOpacity={1}
                onPress={() =>{
                    const {navigate} = this.props.navigation;
                    pushWDNavigation(navigate, {type: kRoute_store_info});
                }}>
                <Image style={{width:60,height:60,borderRadius:30}} defaultSource={this.state.datas.shop_logo} source={auth_status_icon}/>
                <View style={{height:60,flex:1,justifyContent: 'center',marginLeft:7,marginRight:15}}>
                    <Text style={{fontSize:19,color:textColor,paddingTop: 5,includeFontPadding:false,fontWeight:textWeight}} numberOfLines={1} ellipsizeMode={'middle'} >{name}</Text>
                    <Text style={{fontSize:12,color:textColor,paddingTop: 5,includeFontPadding:false}} numberOfLines={2}>{tips}</Text>
                </View>
                <Image style={{transform:[{rotate:'180deg'}],width:8,height:13,marginRight:17}} source={YFWImageConst.Nav_back_white}></Image>
            </TouchableOpacity>
        )
    }

    _clickItem(item){
        const {navigate} = this.props.navigation;
        switch (item.extras) {
            case 'my_intergration':
                // YFWNativeManager.mobClick('account-points');
                pushWDNavigation(navigate, {type: kRoute_frequently_goods});
                break;
            case 'get_favorite':
                // YFWNativeManager.mobClick('account-favorite');
                pushWDNavigation(navigate, {type: kRoute_favorite})
                break;
            case 'get_viewd':
                // YFWNativeManager.mobClick('account-scan');
                pushWDNavigation(navigate, {type: kRoute_browsing_history});
                break
            case 'get_supplier':
                // YFWNativeManager.mobClick('account-coupon');
                pushWDNavigation(navigate, {type: kRoute_supplier});
                break
        }
    }

    _requestCenterInfo() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getStoreCenterInfo');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if (this.props.fetchBannerInfo) {
                this.props.fetchBannerInfo(res.result)
            }
            if (!this.state.isLogin) {
                this.setState(() => ({
                        isLogin: false,
                        datas: []
                    })
                )
                return
            }
            let data = YFWWDUserInfoModel.getModelArray(res.result);
            this.setState(() => ({
                    isLogin: true,
                    datas: data,
                })
            )
            getPurchaseStatus((status)=>{
                this.state.auth_status = status
                this.setState({})
            })
            this.changeOrderItemsStatus(data)
            this._changeShopCarRedPointStatus();
            refreshWDMessageRedPoint()
        }, () => {
        }, false);
    }

    /*
    *
    * 登录成功改变 购物车红点
    * */
    _changeShopCarRedPointStatus(){
        refreshWDRedPoint();
    }


    /**
     * 点击跳转签到，对url做签名
     */
    clickSign = ()=> {
        if(this.clickEnable){
            YFWNativeManager.mobClick('account-sign');
            const {navigate} = this.props.navigation;
            doAfterLogin(navigate, ()=> {
                getWDSignInData(navigate,TYPE_SIGN_POINTS);
            })
            setTimeout(()=>{
                this.clickEnable = true;
            },3000)
        }
        this.clickEnable = false;
    }

    _startMsg = ()=> {
        YFWNativeManager.mobClick('account-message');
        const {navigate} = this.props.navigation;
        doAfterLogin(navigate, ()=> {
            let badge = new Map();
            DeviceEventEmitter.emit('ShowInviteView', {value: false});
            navigate('YFWMyMessageController', {state: badge});
        })
    }

    /*
     *  改变订单红点状态
     * */
    changeOrderItemsStatus(item) {
        let orderItemsTipsData = [];
        orderItemsTipsData.push(item.order_unpaid_count);
        orderItemsTipsData.push(item.order_unsent_count);
        orderItemsTipsData.push(item.order_unreceived_count);
        orderItemsTipsData.push(item.order_unevaluated_count);
        orderItemsTipsData.push(item.return_goods_count);
        DeviceEventEmitter.emit('WD_ORDER_ITEMS_TIPS_NUMS',orderItemsTipsData)
    }
}

