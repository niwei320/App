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
import {getItem, setItem, removeItem,kAccountKey} from '../Utils/YFWStorage'
import {log, logErr, logWarm} from '../Utils/YFWLog'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import {doAfterLogin, pushNavigation} from "../Utils/YFWJumpRouting";
import {
    imageJoinURL,
    iphoneTopMargin,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    safeObj,
    adaptSize,
    checkAuditStatus
} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWNativeManager from  '../Utils/YFWNativeManager'
import YFWUserInfoModel from "../UserCenter/Model/YFWUserInfoModel";
import {
    getSignInData,
    postPushDeviceInfo, refreshMessageRedPoint,
    TYPE_SIGN_POINTS,
    refreshRedPoint,
    refreshOTORedPoint
} from "../Utils/YFWInitializeRequestFunction";
import RNFS from 'react-native-fs';
import YFWMessageRedPointView from '../widget/YFWMessageRedPointView';

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


export default class UserCenterHeader extends Component {


    constructor(props) {
        super(props)
        this.state = {
            isLogin: false,
            visible: false,
            datas: [],
            isRefresh: this.props.isRefresh,
            isMounted: true,
            recentBrowseCount:0
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
                    this._requestCenterInfo(ssid);
                } else {
                    this.setState({
                        isLogin: false,
                        datas:[]
                    })
                }
                this._readFile()
            }
        );
    }
    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener('userinfochange', ()=> {
            let userInfo = YFWUserInfoManager.ShareInstance();
            let ssid = userInfo.getSsid();

            if (ssid) {
                this.state.isLogin = true
                this._requestCenterInfo(ssid);
            } else {
                this.setState({
                    isLogin: false,
                    datas:[]
                })
            }
        })



        this.subscription = DeviceEventEmitter.addListener('UserLoginSucess', ()=> {
            //提交推送设备信息
            postPushDeviceInfo()
            let userInfo = YFWUserInfoManager.ShareInstance();
            let ssid = userInfo.getSsid();

            if (ssid) {
                this.state.isLogin = true
                this._requestCenterInfo(ssid);
            } else {
                this.setState({
                    isLogin: false,
                    datas:[]
                })
            }
        })
        this.logoutListener = DeviceEventEmitter.addListener('LOGOUT',()=>{
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
            getItem(kAccountKey).then((id)=> {
                if (id) {
                    this.state.isLogin = true
                    this._requestCenterInfo(id);
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
        return (
            <View style={styles.userCenterHeaderStyle}>
                <ImageBackground style={styles.userCenterHeaderStyle}
                                 source={require('../../img/personal_center_bg.png')}>
                    {this.renderSettingView()}
                    {this.renderSignInView()}
                    <View style={{position: 'absolute',top:12+iphoneTopMargin()-20+20,left:12,right:114}}>
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
            <View style={{position:'absolute',top:12+iphoneTopMargin()-20,right:7,width:100,height:28,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                <TouchableOpacity activeOpacity={1} hitSlop={{left:0,top:10,bottom:10,right:0}} onPress={()=>{
                    YFWNativeManager.mobClick('setting');
                    this.props.navigation.navigate('Setting',{
                        isLogin:this.state.isLogin,
                        callback:()=>{
                            this.setState({isLogin:false})
                        }
                    })
                }} style={{flexDirection:'row',alignContent:'center',alignItems:'center',marginRight:22}}>
                    <Image style={{width:19,height:19}} source={require('../../img/icon_setup.png')}></Image>
                    <Text accessibilityLabel='my_setting' style={{color:'#333',fontSize:14,marginLeft:2}}>{'设置'}</Text>
                </TouchableOpacity>
                <YFWMessageRedPointView messageCount={messageCount} isWhiteBg={false} navigation={this.props.navigation} callBack={()=>{}} />
            </View>
        )
    }

    renderBottomView(){

        let datasArray = [
            {title:'浏览历史',count:this.state.recentBrowseCount,extras:'get_viewd'},
            {title:'收藏',count:safeObj(this.state.datas.user_favorite),extras:'get_favorite'},
            {title:'积分',count:safeObj(this.state.datas.point),extras:'my_intergration'},
            {title:'优惠券',count:safeObj(this.state.datas.coupon_count),extras:'get_coupon'},
        ]

        let views = []

        datasArray.map((item,index)=>{
            views.push(
                <TouchableOpacity key={index+'v'} activeOpacity={1} onPress={()=>this._clickItem(item)} style={{flex:1,alignContent:'center',alignItems:'center',marginTop:38}}>
                    <Text style={{fontSize:19,color:'#333',lineHeight:20,fontWeight:'bold'}}>{item.count}</Text>
                    <Text style={{fontSize:12,color:'#666',marginTop:4,lineHeight:13}}>{item.title}</Text>
                </TouchableOpacity>
            )
        })



        return (
            <ImageBackground source={require('../../img/userCenter_itemsBg.png')} style={{resizeMode:'stretch',position:'absolute',bottom:0,left:7,right:7,height:100,flexDirection:'row',justifyContent:'space-around'}}>
                {views}
            </ImageBackground>
        )
    }

    renderSignInView(){

        if (!checkAuditStatus()){
            return (
                <TouchableOpacity onPress={this.clickSign} activeOpacity={1} style={{top:12+iphoneTopMargin()+39,right:13,position:'absolute',
                    borderRadius:10,backgroundColor:'white',flexDirection:'row',height:21,alignItems:'center'}}>
                    <Image style={{width:15,height:17,marginLeft:7}} source={require('../../img/check-in.png')} />
                    {this.state.datas.issigntody==0?<Image style={{width:adaptSize(72),height:14,marginLeft:3,marginRight:7}} source={require('../../img/signForCard.png')} />:
                        <Text style={{fontSize:14,color:'rgb(151,151,151)',marginLeft:3,marginRight:7}}>已签到</Text>
                    }
                </TouchableOpacity>
            )
        }

        return (<View/>)
    }


    renderUserState() {
        return(
            <TouchableOpacity
                style={{flexDirection: 'row',height:60}}
                activeOpacity={1}
                onPress={() =>{
                    YFWNativeManager.mobClick('account-setting');
                    const {navigate} = this.props.navigation;
                    pushNavigation(navigate, {type: 'user_info'});
                }}>
                <Image style={{width:60,height:60,borderRadius:30}} defaultSource={require('../../img/user_icon_default.png')} source={{uri:imageJoinURL(this.state.datas.account_img_url)}}/>
                <View style={{height:60,flex:1,justifyContent: 'center',marginLeft:7,marginRight:15}}>
                    <Text style={{fontSize:19,color:'#333',paddingTop: 5,includeFontPadding:false}} numberOfLines={2} >{this.state.datas.account_real_name}</Text>
                    <Text style={{fontSize:12,color:'#333',paddingTop: 5,includeFontPadding:false}} numberOfLines={2}>{this.state.datas.greeting}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    _clickItem(item){
        const {navigate} = this.props.navigation;
        switch (item.extras) {
            case 'my_intergration':
                YFWNativeManager.mobClick('account-points');
                pushNavigation(navigate, {type: 'my_intergration'});
                break;
            case 'get_favorite':
                YFWNativeManager.mobClick('account-favorite');
                pushNavigation(navigate, {type: 'get_favorite'})
                break;
            case 'get_viewd':
                YFWNativeManager.mobClick('account-scan');
                pushNavigation(navigate, {type: 'get_viewd'});
                break
            case 'get_coupon':
                YFWNativeManager.mobClick('account-coupon');
                pushNavigation(navigate, {type: 'get_coupon'});
                break
        }
    }

    _readFile() {
        const path = RNFS.DocumentDirectoryPath + '/test.txt';
        RNFS.readFile(path)
            .then((result) => {
                const dataArray = result.split("\r\n");
                dataArray.splice(dataArray.length - 1, 1);
                let count = 0
                if (isNotEmpty(dataArray) && dataArray.length > 0) {
                    let isShopMember = YFWUserInfoManager.ShareInstance().isShopMember()
                    let shop_id = YFWUserInfoManager.ShareInstance().getErpShopID()
                    for (let i = 0; i < dataArray.length; i++) {
                        let goodsInfo = JSON.parse(dataArray[i])//将item转换成json对象
                        if (isShopMember && goodsInfo.shop_id === shop_id) {
                            count ++
                        } else if (!isShopMember) {
                            count ++
                        }
                    }
                }
                this.setState({
                    recentBrowseCount:count
                })
            })
            .catch((err) => {
                console.log(err.message);
                this.setState({
                    recentBrowseCount:0
                })
            });
    }

    _requestCenterInfo(ssid) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.account.getAccountCenterInfo');
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
            let data = YFWUserInfoModel.getModelArray(res.result);
            this.setState(() => ({
                    isLogin: true,
                    datas: data,
                })
            )
            this.changeOrderItemsStatus(data)
            this._changeDrugRemindRedPointStatus(data)
            this._changeShopCarRedPointStatus();
            refreshMessageRedPoint()
        }, () => {
        }, false);
    }

    /*
    *
    * 登录成功改变 服药提醒红点
    * */
    _changeDrugRemindRedPointStatus(item){
        DeviceEventEmitter.emit('DRUGREMIND_RED_POINT',item);
    }

    /*
    *
    * 登录成功改变 购物车红点
    * */
    _changeShopCarRedPointStatus(){
        refreshRedPoint();
        refreshOTORedPoint()
    }


    /**
     * 点击跳转签到，对url做签名
     */
    clickSign = ()=> {
        if(this.clickEnable){
            YFWNativeManager.mobClick('account-sign');
            const {navigate} = this.props.navigation;
            doAfterLogin(navigate, ()=> {
                getSignInData(navigate,TYPE_SIGN_POINTS);
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
        DeviceEventEmitter.emit('ORDER_ITEMS_TIPS_NUMS',orderItemsTipsData)
    }
}

