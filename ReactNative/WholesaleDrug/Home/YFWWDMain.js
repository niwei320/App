/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    View,
    FlatList,
    DeviceEventEmitter,
    NativeEventEmitter,
    NativeModules,
    Text,
    Platform,
    UIManager,
    Image,
    TouchableOpacity,
    BackAndroid,
    Alert,Animated
} from 'react-native';

import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import {
    itemAddKey,
    safe,
    safeObj,
    isIphoneX,
    haslogin,
    kScreenWidth,
    iphoneTopMargin,
    kScreenHeight,
    strMapToObj,
    safeArray, tcpImage, adaptSize
} from "../../PublicModule/Util/YFWPublicFunction";
import {isNotEmpty,isEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import { backGroundColor, darkLightColor } from '../../Utils/YFWColor'
import YFWStatusBar from '../../widget/YFWStatusBar'
import {
    getWinCashShareUrl,
    dealPushNotificationResult,
    YFWWDInitializeRequestFunction,
    refreshWDMessageRedPoint,
    refreshWDRedPoint,
    changeToYFW,
    changeToWD,
    checkWDChainShopType
} from "../../Utils/YFWInitializeRequestFunction";
import YFWRefreshHeader from "../../widget/YFWRefreshHeader";
import StatusView, { DISMISS_STATUS } from '../../widget/StatusView'
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWToast from '../../Utils/YFWToast'
import {getItem,setItem} from "../../Utils/YFWStorage";
import {getInitialURL} from "react-native/Libraries/Linking/Linking";
import {analyzeUrl} from "../../Utils/SchemeAnalyzeUtil";
import NavigationActions from "../../../node_modules_local/react-navigation/src/NavigationActions";
import YFWHomeAdView from '../../widget/YFWHomeAdView'

const {YFWEventManager} = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);
let first_load = true;
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import YFWTitleView from "../../PublicModule/Widge/YFWTitleView";
import YFWWDHomeDataModel from './Model/YFWWDHomeDataModel';
import YFWWDHomeScrollListView from './View/YFWWDHomeScrollListView';
import YFWWDHomeReCommendView from './View/YFWWDHomeReCommendView';
import YFWWDHomeMarketRoom from './View/YFWWDHomeMarketRoom';
import YFWWDHomeMenuView from './View/YFWWDHomeMenuView';
import YFWWDHomeBarner from './View/YFWWDHomeBannerView'
import YFWWDHomeSearchHeaderView from './View/YFWWDHomeSearchHeaderView';
import { YFWWDLoginTip } from '../Widget/YFWWDLoginTip';
import { pushWDNavigation, kRoute_shop_detail, kRoute_shop_goods_detail, kRoute_search, doAfterLogin ,clearSessionForLaunch,clearSessionForSession,newSesscionId, doAfterLoginWithCallBack} from '../YFWWDJumpRouting';
import YFWImproveCorporateInformationDialog from "./View/YFWImproveCorporateInformationDialog";
import {YFWImageConst} from "../Images/YFWImageConst";


export default class YFWWDMain extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: true,

        header: null,
    });

    constructor(...args) {
        super(...args);
        this.isTop = true
        this.exitTime = 0
        this.state = {
            data: [],
            homeData: [],
            loading: false,
            pageIndex: 2, //加载更多推荐商品下标从 2 开始
            showFoot:2,
            fadeOpacity:new Animated.Value(0),
        };
        this.listener();
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                DeviceEventEmitter.emit('ShowInviteView', {value: false});
                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
            }
        }
        );
        this.didBlur = this.props.navigation.addListener('didBlur',
        payload => {
            if (Platform.OS === 'android') {
                BackHandler.removeEventListener('hardwareBackPress',this.onBackAndroid);
            }
        }
        );
    }

    onBackAndroid=()=>{
        return false;
    }

    componentWillMount() {
        changeToWD(() => {
            refreshWDRedPoint()
            refreshWDMessageRedPoint()
            checkWDChainShopType()
            this._requestAllHomeData()
        })
    }


    //视图加载完成
    componentDidMount() {
        DeviceEventEmitter.addListener('WDLoginToUserCenter',(param)=>{
            if (param == 0) {
                const {navigate} = this.props.navigation
                doAfterLoginWithCallBack(navigate,()=>{
                    const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
                    this.props.navigation.dispatch(resetActionTab);
                })
            }
        })
        this.loginListener = DeviceEventEmitter.addListener('WDUserLoginSucess',()=>{
            this._requestAllHomeData()
            checkWDChainShopType()
        })
        this.Login_Off = DeviceEventEmitter.addListener('WDLogin_Off',()=>{
            this._requestAllHomeData()
        })
    }

    componentWillUnmount() {
        changeToYFW()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove()
        }
        if (Platform.OS == 'android') {
            if (isNotEmpty(this.getQrCodeInfoListener)) {
                this.getQrCodeInfoListener.remove();
            }
            if (isNotEmpty(this.jumpToNearlyShopListener)) {
                this.jumpToNearlyShopListener.remove();
            }
        }

        this.threeTouchListener&&this.threeTouchListener.remove()
        this.loginListener&&this.loginListener.remove()
        this.openAlertListener&&this.openAlertListener.remove()
        this.time && clearInterval(this.time);
    }


    //@ Request
    handleData(firstLoad) {
        this._requestAllHomeData(firstLoad)
    }

    _requestAllHomeData(firstLoad){
        let params = new Map();
        params.set('__cmd','guest.common.wholesaleapp.getIndexData_Wholesale')
        params.set('os',Platform.OS)
        params.set('deviceName',(Platform.OS === 'ios'?isIphoneX()?'X':'N':'A'))
        let request = new YFWRequestViewModel()
        request.TCPRequest(params,(res)=>{
            console.log(res,'home')
            this._handle_requestHomeData_TCP(res)
        },(error)=>{
            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.endRefresh();
            }
        },false)
    }

    _fetchMoreRecommendGoods(){
        let params = new Map();
        let paramsPageIndex = this.state.pageIndex + ''
        params.set('__cmd','guest.common.wholesaleapp.getAdvantagesMedicine_PageData')
        params.set('pageIndex',paramsPageIndex)
        params.set('pageSize',10)
        let request = new YFWRequestViewModel()
        request.TCPRequest(params,(res)=>{
            console.log(res,'homeRecommendGoods')
            if(paramsPageIndex !== this.state.pageIndex + ''){ //只返回当前需要的页面数据
                return;
            }
            let dataArray = []
            if(isEmpty(this.state.homeData) || safeArray(res.result.dataList).length === 0){
                if(this.state.showFoot !== 1){
                    this.setState({
                        showFoot:1
                    })
                }
                return
            }
            this.state.pageIndex++
            dataArray = this.state.homeData
            let index = dataArray.findIndex(item=>item.style === "ads_7F_plus")
            if(index === -1){
                let data = {
                    items:res.result.dataList,
                    style:"ads_7F_plus"
                }
                safeArray(dataArray).push(data)
                this.setState({
                    homeData:dataArray
                })
            } else {
                let dataItem = dataArray[index]
                dataItem.items = safeArray(dataItem.items).concat(res.result.dataList)
                this.setState({
                    homeData:dataArray
                })
            }
            console.log(dataArray,'after')
        },(error)=>{
            if(this.state.showFoot !== 1){
                this.setState({
                    showFoot:1
                })
            }
        },false)
    }

    _handle_requestHomeData_TCP(res){
        this.state.homeData = YFWWDHomeDataModel.getModelArray(res.result.returnFinal);
        let dataArray = this._handleData();
        this.setState({
            data: dataArray,
            loading: false,
        });
        if (this.statusView)this.statusView.dismiss();
        if(Platform.OS == 'ios'){
            this.refreshHeader&&this.refreshHeader.endRefresh();
        }
    }

    //@ Action

    _handleData() {
        let dataArray = []
        if(isEmpty(this.state.homeData)){
            return dataArray
        }
        return this.state.homeData
    }

    onShareClick() {
        if(haslogin()){
            getWinCashShareUrl((res)=>{
                if(res&&res.result){
                    let data = res.result;
                    let param = {
                        url:data.url,
                        title : data.title,
                        content:data.desc,
                        image : data.imgsrc,
                        goneItems:[],
                        page:'home',
                        isShowHead:true
                    };
                    DeviceEventEmitter.emit('OpenShareView',param);
                }
            })
        }else{
            DeviceEventEmitter.emit('OpenShareView', {page: 'home',isShowHead:true});
        }
    }


    onSearchClick() {

        let {navigate} = this.props.navigation;
        let params = {
            type: kRoute_search
        }
        pushWDNavigation(navigate, params);

    }

    onSaoyisaoClick(value) {
        if (value.name == 'erpOrderScan') {
            if(Platform.OS === 'android'){
                value = JSON.parse(value.value)
            }
            return
        }

        let {navigate} = this.props.navigation;
        pushWDNavigation(navigate, {type: value.name, value: value.value});

    }


    _onRefresh() {
        this.state.pageIndex = 2;
        this.state.showFoot = 2;
        this.handleData(false)
    }

    _onEndReached() {
        this._fetchMoreRecommendGoods()
    }

    _onSrollStart(e) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate', {value: 1});
    }

    _onSrollEnd(e) {
        DeviceEventEmitter.emit('ShowInviteViewAnimate', {value: 2});
    }
    _onScrollEndDrag(e){
        this.refreshHeader&&this.refreshHeader.beginRefresh();
    }


    onRefresh = () => {
        this.state.loading =true
        this._onRefresh();
        this.setState({});
    }

    renderList(){
        let indices = Platform.select({
            android:[7],
            ios:[7]
        })
        if(Platform.OS === 'android'){
            return(
                <FlatList
                    style={{backgroundColor:backGroundColor()}}
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.data}
                    keyExtractor={(item,index)=>{return 'homeItem'+index}}
                    renderItem={this._renderItem.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    onScrollBeginDrag={this._onSrollStart.bind(this)}
                    onMomentumScrollEnd={this._onSrollEnd.bind(this)}
                    scrollEventThrottle={50}
                    onRefresh={this.onRefresh}
                    refreshing={this.state.loading}
                    ListHeaderComponent={<View style={{height: 0}}/>}
                    progressViewOffset={0}
                    onScroll={this._onScroll}
                    // stickyHeaderIndices={indices}
                />
            )
        }else {
            return(
                <FlatList
                    style={{backgroundColor:backGroundColor()}}
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.data}
                    // contentInset={{top:200,left:0,right:0,bottom:0}}
                    renderItem={this._renderItem.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    ListHeaderComponent={this._renderHeader.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    onScrollBeginDrag={this._onSrollStart.bind(this)}
                    onMomentumScrollEnd={this._onSrollEnd.bind(this)}
                    onScrollEndDrag={this._onScrollEndDrag.bind(this)}
                    onScroll={this._onScroll}
                    scrollEventThrottle={50}
                    // stickyHeaderIndices={indices}
                />
            )
        }


    }

    //@ View
    render() {
        return (
            <View style={[BaseStyles.container]}>
                <YFWStatusBar addListener={this.props.navigation.addListener} />
                <YFWWDHomeSearchHeaderView ref='searchHeaderView'
                                 canChangeColor={false}
                                 navigation={this.props.navigation}
                                 from={'home_wd'}
                                //  bgStyle={{position:'absolute'}}
                                 onShareClick={()=>{this.onShareClick()}}
                                 onSearchClick={()=>{this.onSearchClick()}}
                                 onMessageClick={()=>{this.onMessageClick()}}
                                 onSaoyisaoClick={(value)=>{this.onSaoyisaoClick(value)}}/>
                {this.renderList()}
                {this.renderGoTopBtn()}
                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{this.state.loading=false;this._requestAllHomeData()}}/>
                <YFWWDLoginTip navigation={this.props.navigation}/>
                <YFWHomeAdView ref={(ad)=>{this.homeAdView = ad}} navigation={this.props.navigation}/>
                <YFWImproveCorporateInformationDialog ref={(ad)=>{this.CorporateInformationDialog = ad}}/>
            </View>
        );
    }

    renderGoTopBtn(){
        return (
            <Animated.View style={{position:'absolute', right:10, top: kScreenHeight*(7/10), opacity:this.state.fadeOpacity}}>
                <TouchableOpacity
                    onPress={()=>{this.showTopButton && this.onGoTopClick()}}
                >
                    <Image source={YFWImageConst.Icon_go_top} style={{width: 40, height: 40,}}/>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    onGoTopClick() {

        this._flatList && this._flatList.scrollToIndex({index:0,viewPosition:0,animated:true})
        let dataArray = this.state.homeData
        let index = dataArray.findIndex(item=>item.style === "ads_7F_plus")
        if(index !== -1 && safeArray(dataArray[index].items).length > 0){
            dataArray.splice(index,1)
            dataArray.push({style:"ads_7F_plus", items:[]})
            this.state.pageIndex = 2
            this.state.showFoot = 2
            this.state.homeData = dataArray
        }
        this.time && clearInterval(this.time);
        this.time = setInterval(()=>{
            this.setState({})
        },500)
    }

    onMessageClick() {
        // const {navigate} = this.props.navigation;
        // navigate('YFWHeaderExamplePage');
    }



    _renderItem = (item) => {
        let rowData = item.item;
        // console.log(rowData)
        if (rowData.style === 'banner') {
            return (
                <View style={BaseStyles.item}>
                    <YFWWDHomeBarner from={'home_wd'} imagesData={rowData.items} backGroundImagesData={rowData.items_attach} backGroundDownImagesData={rowData.bannerBackground_down} navigation={this.props.navigation}/>
                </View>
            )
        } else if (rowData.style === 'menu') {
            return (
                <View style={BaseStyles.item} marginTop={10}>
                    <YFWWDHomeMenuView badgeData={rowData.items} bgData={rowData.menuBackground} navigation={this.props.navigation}/>
                </View>
            )
        }
        else if (rowData.style === 'ads_health' ) {
            return (
                <View style={{backgroundColor:'rgb(250,250,250)'}}>
                    <View style={{marginLeft:12,marginTop:15}}>
                        <YFWTitleView title={'专享会场'} hiddenBgImage={true} style_title={{width:66,fontSize:16}} />
                    </View>
                    <YFWWDHomeScrollListView Data={rowData.items&&rowData.items.length>0?rowData.items:[]} navigation={this.props.navigation}/>
                </View>

            )
        }
        else  if (rowData.style === 'ads_1F_1' ) {
            return (
                <View style={BaseStyles.item} >
                    <YFWWDHomeMarketRoom from={'home_wd'} Data={rowData.items} bgImage={rowData.bgImage}  navigation={this.props.navigation}/>
                </View>
            )
        }
        else if (rowData.style === 'ads_7F') {
            return (
                <View style={{}} >
                    <View style={{marginLeft:12,marginTop:15}}>
                        <YFWTitleView title={'优势品种'} hiddenBgImage={true} style_title={{width:66,fontSize:16,fontWeight:'bold'}} />
                        {/* <TouchableOpacity onPress={()=>{
                            pushWDNavigation(this.props.navigation.navigate,{
                                type:kRoute_shop_goods_detail,
                                value:16663708
                            })
                        }} style={{position:'absolute',right:13,top:6}} hitSlop={{top:15,left:20,right:13,bottom:15}}>
                            <Text style={{color:'#666',fontSize:14,}}>{'更多'}</Text>
                        </TouchableOpacity> */}
                    </View>
                    <YFWWDHomeReCommendView
                        Data={rowData.items}
                        navigation={this.props.navigation}
                    />
                </View>
            )
        } else if (rowData.style === 'ads_7F_plus') {
            return (
                <View style={{}} >
                    <YFWWDHomeReCommendView
                        Data={rowData.items}
                        navigation={this.props.navigation}
                        showFoot={this.state.showFoot}
                    />
                </View>
            )
        } else if (rowData.style === 'ads_medium') {
            let dataItem = safeObj(rowData.items[0]);
            let width= 375
            let height= 110
            let img_url = dataItem.img_url
            return (
                <View style={{backgroundColor:'rgb(250,250,250)', paddingTop:adaptSize(12)}} >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{flex:1}}
                        onPress={()=> {
                            if(isNotEmpty(safeObj(safeObj(dataItem)).type)){
                                const { navigate } = this.props.navigation;
                                pushWDNavigation(navigate, dataItem)
                            }}
                        }
                    >
                        <Image style={{width:adaptSize(width),height:adaptSize(height)}} resizeMode={'stretch'} source={{uri:img_url}}/>
                    </TouchableOpacity>
                </View>
            )
        }
        else {
            return null
        }
    }


    _renderHeader(){

        let that = this;
        return (
            <YFWRefreshHeader ref={(m)=>{this.refreshHeader = m}} toScroll={(offset)=>{
                that._flatList.scrollToOffset({offset:offset,animated:true},1)
            }} onRefresh={() => this._onRefresh()}/>
        );

    }

    _renderFooter() {

        return (null)

    }

    _onScroll=(event)=>{
        try {
            let contentY = event.nativeEvent.contentOffset.y;
            this.refs.searchHeaderView.setOffsetProps(contentY);
            if(Platform.OS == 'ios'){
                this.refreshHeader&&this.refreshHeader.onScroll(event);

            }
            if(contentY > kScreenHeight*4/5 && !this.showTopButton){
                this.showTopButton = true
                this._showTopButton()
            } else if(contentY <= kScreenHeight*4/5 && this.showTopButton){
                this.showTopButton = false
                this._hideTopButton()
            }
        }catch (e) {}
    }

    _showTopButton(){
        Animated.timing(this.state.fadeOpacity, {toValue: 1, duration: 200,}).start()
    }

    _hideTopButton(){
        Animated.timing(this.state.fadeOpacity, {toValue: 0, duration: 200,}).start()
    }

}





