import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    Dimensions,
    Image,
    ImageBackground,
    Platform,
    Text,
    TouchableOpacity,
    View,
    NativeModules,ScrollView,UIManager,StyleSheet,Animated,Easing,PixelRatio
} from 'react-native';
const {StatusBarManager} = NativeModules;
import YFWToast from '../Utils/YFWToast'
import {
    androidHeaderBottomLineColor,
    darkLightColor,
    darkNomalColor,
    separatorColor, yfwGreenColor,
    yfwOrangeColor,darkTextColor,
    orangeColor
} from '../Utils/YFWColor'
import {doAfterLogin, pushNavigation} from "../Utils/YFWJumpRouting";
import YFWGoodsDetailInfoVC from './YFWGoodsDetailInfoVC'
import YFWGoodsDetailInfoDetailVC from './YFWGoodsDetailInfoDetailVC'
import YFWGoodsDetailCommentsVC from './YFWGoodsDetailCommentsVC'
import YFWAlertCouponCollectionListView from './View/YFWAlertCouponCollectionListView'
import YFWAlertFavourableActivityListView from './View/YFWAlertFavourableActivityListView'
import YFWAlertPackageListView from './View/YFWAlertPackageListView'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import {
    darkStatusBar,
    iphoneBottomMargin,
    isEmpty,
    isNotEmpty,
    safeObj,
    tcpImage,
    isIphoneX,
    kScreenWidth,
    iphoneTopMargin,
    safe, getStatusBarHeight
} from "../PublicModule/Util/YFWPublicFunction";
import SharePoster from '../widget/SharePoster'
import YFWNativeManager from '../Utils/YFWNativeManager'
import RNFS from 'react-native-fs';

import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import ModalView from "../widget/ModalView";
import {ViewPager} from "rn-viewpager";
import StatusView, {DISMISS_STATUS, SHOW_LOADING} from "../widget/StatusView";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWGoodsDetailModel from "./Model/YFWGoodsDetailModel";
import {convertStar} from "../Utils/ConvertUtils";
import BaseTipsDialog from "../PublicModule/Widge/BaseTipsDialog";
import {IMG_LOADING} from "../YFWHomePage";
import YFWPrestrainCacheManager from '../Utils/YFWPrestrainCacheManager';
import LinearGradient from 'react-native-linear-gradient';
import { toDecimal } from '../Utils/ConvertUtils';
import YFWTitleView from '../PublicModule/Widge/YFWTitleView'
import YFWNoLocationHint from '../widget/YFWNoLocationHint'
import YFWAdNotificationTip from '../widget/YFWAdNotificationTip';
import YFWAlertDiscountsView from './View/YFWAlertDiscountsView';
import { addLogPage } from '../Utils/YFWInitializeRequestFunction';
import YFWAlertRuleView from './View/YFWAlertRuleView';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;



export default class YFWGoodsDetailRootVC extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null,
    });

    constructor(...args) {
        super(...args);
        let userInfo = YFWUserInfoManager.ShareInstance();
        this.isLogin = userInfo.hasLogin()
        this.showImg = false
        this.img = this.props.navigation.state.params.state.img_url
        if(this.img){//如果有图片则显示大图的加载
            this.showImg = true
        }
        this.goodsInfoOriginData = this.props.navigation.state.params.state.goodsInfo
        this.goodsInfoRequest = false;
        this.shopInfoRequest = false;

        this.state = {
            selectIndex: 0,
            selectDetailTabIndex:0,
            detailinfoData: {},
            couponArray: [],
            isCollection: false,
            carNumber: new YFWUserInfoManager().shopCarNum+'',
            quantity:1,
            pageIndex:0,
            goodsScrollOffset:0,//商品页面滑动的偏差
            titleWhite: `rgba(255,255,255,0)`,  //头部颜色
            titleGreen: `rgba(39,191,143,0)`,
            titleGray: `rgba(102,102,102,0)`,
            titleOpacity:0,
            selectGoodsItem:null,
            commentsAnimatedLeft: new Animated.Value(kScreenWidth),
            notice: [],
            hidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice()
        };
        this.listener()
        this.loadStartTime = new Date().getTime()
    }

    listener(){
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                let userInfo = YFWUserInfoManager.ShareInstance();
                //如果进来的时候没登录，并且再次显示的时候登录了，就请求
                if (!this.isLogin&&userInfo.hasLogin()) {
                    this._requetCommodityDetail();
                }
                if(YFWUserInfoManager.ShareInstance().hasLogin()){
                    this.props.navigation.setParams({
                        carNumber:this.dealShopCarCount(new YFWUserInfoManager().shopCarNum+'')
                    })
                    this._getCartGoodsCountMethod()
                }
            }
        );
        this.userLoginListener = DeviceEventEmitter.addListener('UserLoginSucess',(param)=>{
            this._requetCommodityDetail();
            if(YFWUserInfoManager.ShareInstance().hasLogin()){
                this.props.navigation.setParams({
                    carNumber:this.dealShopCarCount(new YFWUserInfoManager().shopCarNum+'')
                })
            }
        })
        this.priceListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            this.setState({
                hidePrice: isHide
            })
        })
    }

    /**判断是否请求完成
     * @param info
     * @param list
     */
    getSuccess(goodsInfo,shopInfo){
        if(!this.goodsInfoRequest){
            this.goodsInfoRequest = goodsInfo
        }
        if(!this.shopInfoRequest){
            this.shopInfoRequest = shopInfo
        }
        if(this.goodsInfoRequest){
            // if (this.isCreate != true) {
            //     this.state.loadEndTime = new Date().getTime() - this.loadStartTime
            //     this.isCreate = true
            // }
            if (this.showImg) {
                this.showImg = false;
                DeviceEventEmitter.emit('LoadProgressClose');
                this.setState({});
            }else {
                this.statusView && this.statusView.dismiss()
            }
        }
    }

    componentDidUpdate(){
        if (this.isCreate && this.firstLoad) {
            this.state.loadEndTime = new Date().getTime() - this.loadStartTime
            this.firstLoad = false
        }
    }

    componentWillUnmount(){
        this.didFocus.remove()
        this.layer && this.layer.disMiss()
        this.userLoginListener&&this.userLoginListener.remove()
        this.priceListener&&this.priceListener.remove()
    }

    componentWillMount() {
        addLogPage(2)
    }

    componentDidMount() {
        this.props.navigation.setParams({
            changePage:(index)=>this.changePage(index),
            goBack:()=>this.goBack(),
            goShopCar:()=>this.toShopCarMethod(),
            showMenu:()=>DeviceEventEmitter.emit('OpenUtilityMenu'),
            showWhite:false,
            hiddenTitle:false,
        })
        if (this.goodsInfoOriginData) {
            this.goodsInfoOriginData.medicine_name = this.goodsInfoOriginData.aliascn&&this.goodsInfoOriginData.aliascn.length>0?this.goodsInfoOriginData.aliascn + ' ' :''
            this.goodsInfoOriginData.medicine_name += this.goodsInfoOriginData.namecn + ' - ' + this.goodsInfoOriginData.short_title
            if (this.showImg) {
                this.showImg = false
            }
            this.setState({
                detailinfoData:YFWGoodsDetailModel.getModelArray({medicine_info:this.goodsInfoOriginData})
            })

        }
        else {
        }
        this.fetchAllDataFromServer()
        //适配状态栏变白
        darkStatusBar()
    }



    px2dp(px) {
        return px * width / 375
    }

    selectPage(index){
        // this.vp&&this.vp.setPage(index)
        Animated.timing(this.state.commentsAnimatedLeft,{
            toValue:0,
            duration:300,
            easing:Easing.linear,
        }).start(()=>{
            this.state.commentsAnimatedLeft.setValue(0)
        })
        this.props.navigation.setParams({
            hiddenTitle:true,
            showWhite:true,
        })
    }

    goBack(){
        if (this.state.commentsAnimatedLeft._value == 0) {
            Animated.timing(this.state.commentsAnimatedLeft,{
                toValue:kScreenWidth,
                duration:300,
                easing:Easing.linear,
            }).start(()=>{
                this.state.commentsAnimatedLeft.setValue(kScreenWidth)
                this.props.navigation.setParams({
                    hiddenTitle:false,
                    showWhite:true,
                })
            })
        } else {
            this.props.navigation.goBack()
        }
    }

    render() {
        let extraHear = getStatusBarHeight() + 50 + (this.state.hidePrice?20+PixelRatio.getFontScale()*12:0)//自定头部及开启定位tip偏移量
        // this.getSuccess()
        return (
            <View flex={1} >
                <View style={{flex:1}}>
                    <ScrollView style={{flex:1,backgroundColor:"#fafafa"}}
                                ref={(item)=>{this.vp = item}}
                                bounces={false}
                                onScroll={(e)=>{this.scrollLister(e)}}
                                scrollEventThrottle={50}
                                onMomentumScrollEnd={() => {
                                    this.headTabSelect = false
                                    this.selectDetailTab = false}}
                                stickyHeaderIndices={[1]}
                                onContentSizeChange={() => {
                                    if(this.selectDetailTab) {
                                        this.vp.scrollTo({x:0,y: this.infoViewPageY})
                                    }
                                }}
                    >
                        <View style={{flex:1}}>
                            <YFWGoodsDetailInfoVC flex={1} data={this.state.detailinfoData}
                                                  scheduled_name={this.props.navigation.state.params.state.scheduled_name}
                                                  selectGoodsItem={this.state.selectGoodsItem}
                                                  navigation={this.props.navigation}
                                                  countdown={this.priceCountdown}
                                                  countdownCallback={()=>{this._requetCommodityDetail()}}
                                                  price={this.props.navigation.state.params.state.price}
                                                  clickPopup={(index,info)=>{
                                                      this._clickPopupMethod(index,info);
                                                  }}
                                                  getQuantity={(quantity)=>{
                                                      this.state.quantity = quantity;
                                                  }}
                                                  collectionRefresh={(is_favorite)=>{
                                                      this.setState({
                                                          isCollection: is_favorite,
                                                      });
                                                  }}
                                                  dismissLayer={()=>{this.layer && this.layer.disMiss()}}
                                                  showLayer={()=>{this.layer && this.layer.show()}}
                                                  ref = {(item)=>{this.goodsInfoView = item}}
                                                  shareMethod={()=>this.onShareClick()}
                                                  selectPage={(index)=>this.selectPage(index)}
                                                  commitViewLayout={(e)=>{this.commitViewLayout(e)}}
                            />
                        </View>
                        <View style={{flex:1, top:-extraHear}}>
                            {this._renderDetailInfoTabPatch()}
                            {this._renderDetailInfoTabView()}
                            {this.state.notice&&this.state.notice.length>0 ? this._renderNoticeView() : null}
                            <View style={{width:kScreenWidth,height:0.5,backgroundColor:"#fafafa"}}></View>
                        </View>
                        <View style={{flex:1, top:-extraHear}}>
                            <YFWGoodsDetailInfoDetailVC goodsId={this.id} selectIndex={this.state.selectDetailTabIndex} flex={1} ref={'detailInfoDetail'} data={this.state.detailinfoData} navigation={this.props.navigation}/>
                        </View>

                    </ScrollView>
                    {this.renderHeader()}
                    <View style={{position:'absolute', top:getStatusBarHeight() + 50}}>
                        <YFWNoLocationHint/>
                    </View>
                    <Animated.View style={{width:kScreenWidth,left:this.state.commentsAnimatedLeft,top:getStatusBarHeight() + 50,bottom:0,backgroundColor:'orange',position:'absolute',}}>
                            <YFWGoodsDetailCommentsVC flex={1} ref={'detailComments'} data={this.state.detailinfoData} navigation={this.props.navigation}/>
                    </Animated.View>
                    {this._renderAdView()}
                    {this._renderDonSaleTips()}
                    {this.renderBottomToolView()}
                </View>
                {this.renderStatus()}
                {/* {this.renderHead()} */}
                {/*Modal是弹窗遮罩层，具体页面写在这个控件之上，弹窗写在这个之下*/}
                <ModalView ref={(item)=>this.layer = item} animationType = "fade">
                    <View style={{flex:1,backgroundColor:'rgba(0, 0, 0, 0.3)'}}/>
                </ModalView>
                <YFWAlertDiscountsView
                    ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                    data={this.state.detailinfoData}
                    dismiss={()=>{this.layer.disMiss()}}
                    navigation = {this.props.navigation}
                    onRequestClose={()=>{this.layer.disMiss()}}
                ></YFWAlertDiscountsView>
                <YFWAlertRuleView ref={(e)=>this.ruleView = e}
                    dismiss={()=>{
                        this.layer.disMiss()
                    }}
                    onRequestClose={()=>{this.layer.disMiss()}}
                    ></YFWAlertRuleView>
                {this.renderAlertFavourableActivityListView()}
                <YFWAlertPackageListView ref={'package'} data={this.state.detailinfoData}
                                         _changeSelectItem={(item)=>{
                                             this._changeSelectItem(item)
                                         }}
                                         addShopCarMethod={(package_id)=>{
                                             this._addShopCarMethod(package_id)
                                         }}
                                         byNowMethod={(package_id)=>{
                                             this._byNowMethod(package_id)
                                         }}
                                         navigation={this.props.navigation}
                />
                <SharePoster shareData = {this.state.detailinfoData} goodsId ={this.props.navigation.state.params.state.value} from = 'GoodsDetail' type="Poster" navigation = {this.props.navigation}/>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                {/* {this.renderLoadTime()}
                {this.renderRequestTime()} */}
            </View>
        );
    }

    _renderDetailInfoTabPatch() { //解决 DetailInfoTab 顶部悬停问题
        let extraHear = getStatusBarHeight() + 50 + (this.state.hidePrice?20+PixelRatio.getFontScale()*12:0)//自定头部及开启定位tip偏移量
        return (
            <View style={{width:kScreenWidth,height:extraHear,backgroundColor:"transparent"}}>
                {safe(this.state.detailinfoData.evaluation).length == 0?
                    <>
                        <TouchableOpacity style={{flex:1}} onPress={()=>{this.goodsInfoView && this.goodsInfoView._startQa()}}/>
                        <TouchableOpacity style={{marginBottom:10, height:40}} onPress={()=>{this.goodsInfoView && this.goodsInfoView._showAllcomments()}}/>
                    </>
                    :
                    <></>
                }
            </View>
        )
    }

    _renderDetailInfoTabView() {
        let isShow = this.state.detailinfoData.dict_bool_lock == 1
        return(
            <View style={{width:kScreenWidth, height:50,marginTop:-1,backgroundColor:'#fff', justifyContent:'space-evenly', alignItems:'center', flexDirection:'row', paddingBottom:5}}>
                <TouchableOpacity activeOpacity={1} style={{justifyContent:'center', alignItems:'center',height:50}} onPress={()=> {this._changeIndex(0)}}>
                    <YFWTitleView type='tab' title={'基本信息'} style_title={{width:100,fontSize:15}} hiddenBgImage={this.state.selectDetailTabIndex != 0}/>
                </TouchableOpacity>
                {isShow ? <TouchableOpacity activeOpacity={1} style={{justifyContent:'center', alignItems:'center',height:50}} onPress={()=> {this._changeIndex(1)}}>
                    <YFWTitleView type='tab' title={'说明书'} style_title={{width:70,fontSize:15}} hiddenBgImage={this.state.selectDetailTabIndex != 1}/>
                </TouchableOpacity> : null}
                <TouchableOpacity activeOpacity={1} style={{justifyContent:'center', alignItems:'center',height:50}} onPress={()=> {this._changeIndex(isShow?2:1)}}>
                    <YFWTitleView type='tab' title={'服务保障'} style_title={{width:100,fontSize:15}} hiddenBgImage={this.state.selectDetailTabIndex != (isShow?2:1)}/>
                </TouchableOpacity>
            </View>
        )
    }

    _renderNoticeView() {
        return(
            <View style={{padding:13, backgroundColor: "#faf8dc", flex:1}}>
                <Text style={{fontSize:12,color:orangeColor(),flex:1}}>{this.state.notice}</Text>
            </View>
        )
    }

    _changeIndex(index) {

        if(this.setState.selectDetailTabIndex != index){

            this.selectDetailTab = true;

            let notice = []
            if(index == 0) {
                notice = safe(safeObj(this.state.detailinfoData).package_prompt_info)
            }else if(index == 1 && safeObj(this.state.detailinfoData).dict_bool_lock == 1) {
                notice = '友情提示：商品说明书均由药房网商城工作人员手工录入，可能会与实际有所误差，仅供参考，具体请以实际商品为准。'
            }
            this.setState({
                selectDetailTabIndex: index,
                notice: notice
            })
        }
    }

    _renderAdView() {
        return (
            <YFWAdNotificationTip info={safeObj(this.state.detailinfoData).note} navigation={this.props.navigation}></YFWAdNotificationTip>
        )
    }

    _renderDonSaleTips() {
        if(safe(safeObj(this.state.detailinfoData).prompt_info).length > 0) {
            return(
                <View style={{backgroundColor:'#000000', opacity:0.7, paddingVertical:10,paddingHorizontal:20}}>
                    <Text style={{color:'#fff', fontSize:14, lineHeight:20}}>{safeObj(this.state.detailinfoData).prompt_info}</Text>
                </View>
            )
        }else {
            return <View/>
        }
    }

    renderBottomToolView(){
        const bottom = iphoneBottomMargin()
        return (
            <View style={{height:50+bottom,marginLeft:0,marginRight:0,backgroundColor:'white'}}>
                        <View style={{backgroundColor:'#ccc',height:0.5,opacity:0.3,width:Dimensions.get('window').width-210}}/>
                        <View style={{flex:1,flexDirection: 'row'}}>
                            <TouchableOpacity activeOpacity={1} style={[styles.btn,{marginLeft:21*kScreenWidth/375}]}
                                                hitSlop={{left:15,top:0,bottom:0,right:5}}
                                              onPress={()=>this.toConsultingMethod()}>

                                    <Image
                                        style={{width:20,height:19,resizeMode:'contain'}}
                                        source={require('../../img/md_btn1.png')}/>
                                    <Text
                                        style={styles.btnTitle}>咨询</Text>
                            </TouchableOpacity>
                            <View style={{flex:1}}/>
                            <TouchableOpacity activeOpacity={1} style={[styles.btn]}
                                                hitSlop={{left:5,top:0,bottom:0,right:5}}
                                              onPress={()=>this.toShopDetailMethod()}>
                                    <Image
                                        style={{width:18,height:18,resizeMode:'contain'}}
                                        source={require('../../img/md_btn2.png')}/>
                                    <Text
                                        style={styles.btnTitle}>店铺</Text>
                            </TouchableOpacity>
                            <View style={{flex:1}}/>
                            <TouchableOpacity activeOpacity={1} style={[styles.btn,{marginRight:21*kScreenWidth/375}]}
                                                hitSlop={{left:5,top:0,bottom:0,right:15}}
                                              onPress={()=>this.toCollectionMethod()}>
                                    <Image
                                        style={{width:19,height:19,resizeMode:'contain'}}
                                        source={this.state.isCollection?require('../../img/md_btn3_on.png'):require('../../img/md_btn3.png')}/>
                                    <Text
                                        style={[styles.btnTitle]}>{this.state.isCollection ? '已收藏' : '收藏'}</Text>
                            </TouchableOpacity>
                            {/* {this.renderShopCar()} */}
                            {this._renderBottomRightView()}
                        </View>
                        <View style={{height:bottom,backgroundColor:'white'}}></View>
            </View>
        )
    }

    /**
     * 返回记录加载速度
     * @returns {*}
     */
    renderLoadTime(){
        return(
            <View style={{justifyContent:'center',position:'absolute',right:0,top:height/5,backgroundColor:'#892b60',height:30,borderTopLeftRadius:15,borderBottomLeftRadius:15}}>
                <Text style={{color:'white'}}>{this.state.loadEndTime }ms</Text>
            </View>
        )
    }

    /**
     * 返回记录加载速度
     * @returns {*}
     */
    renderRequestTime(){
        let allTime = this.state.getResponseTimeArray?this.state.getResponseTimeArray.map((time)=>{
            return {time:toDecimal(time*1000),title:'',color:'#ff3300'}
        }):[]
        allTime = allTime.concat([
            // {time:this.state.connectServerTime,title:'链接服务器',color:'#ff3300'},
            // {time:this.state.sendParamTime,title:'发参数',color:'#892b60'},
            {time:this.state.getResponseTime,title:'得到响应',color:'#ff3300'},
            {time:this.state.unpackTime,title:'解析',color:'#ff3300'},
            {time:this.state.requestEndTime,title:'总耗时',color:'#ff3300'},])
        let views = []
        allTime.map((item,index)=>{

            views.push(
                <View key={index+'c'} style={{justifyContent:'center',position:'absolute',right:0,top:height/5+40*(index+1),backgroundColor:item.color,height:30,borderTopLeftRadius:15,borderBottomLeftRadius:15}}>
                    <Text style={{color:'white'}}>{item.title+ item.time }ms</Text>
                </View>
            )
        })
        return(views)
    }


    /**
     * 返回购物车样式
     * @returns {*}
     */
    renderShopCar(){
        let view = null
        if(parseInt(this.state.carNumber) > 0){
            let num = this.state.carNumber
            let minWidth = 18
            if(parseInt(this.state.carNumber)>99){
                num = "99+"
                minWidth = 22
            }
            view = (
                <ImageBackground
                    style={{width:22,height:22}}
                    source={require('../../img/md_btn4.png')}>
                    <View style={{minWidth:minWidth,height:18,backgroundColor:yfwOrangeColor(),
                        borderRadius:9,marginLeft:14,marginTop:-3,alignItems: 'center',justifyContent: 'center'}}>
                        <Text style={{color:'white',fontSize:12}}>{num}</Text>
                    </View>
                </ImageBackground>
            )
        }else{
            view = <Image style = {{width: 22, height: 22, resizeMode: 'contain'}} source = {require('../../img/md_btn4.png')} />
        }
        return (
            <TouchableOpacity activeOpacity={1} style={{width:(Dimensions.get('window').width-100)/4}}
                              onPress={()=>this.toShopCarMethod()}>
                <View style={{ alignItems: 'center', justifyContent: 'center',flex:1}}>
                    {view}
                    <Text style={{color:darkNomalColor(),marginTop:2,fontSize:12,textAlign:'center'}}>购物车</Text>
                </View>
            </TouchableOpacity>
        )
    }

    _renderBottomRightView() {
        if(this.state.hidePrice) {
            let viewW = 105*kScreenWidth/375
            return (
                <TouchableOpacity activeOpacity={1} onPress={() => {YFWNativeManager.openLocation()}} style={{marginRight:0,width:viewW*2,height:50,backgroundColor:'#ccc',justifyContent:'center',alignItems:'center'}}>
                    <Text style={{color:'white',fontSize:15,fontWeight:'bold'}}>开启定位后加入购物车</Text>
                </TouchableOpacity>
            )
        }else {
            return [this.renderAddShopCar(),this.renderByNow()]
        }
    }

    renderAddShopCar(){
        let text = '加入购物车'
        let textColor = 'white'
        let isClick = true
        let viewW = 105*kScreenWidth/375
        let backColors = ['rgb(255,151,29)','rgb(253,179,92)']
        if(this.state.detailinfoData.is_promotion_activity
            && this.state.detailinfoData.activity_stage == 1
            && "true" !== this.state.detailinfoData.is_seckill
        ){
            text = '一键加购享\r\n优惠'
            backColors = ['rgb(31,219,155)','rgb(0,200,145)']
        }
        if(safeObj(this.state.detailinfoData.status) != 'sale'){
            text = '暂不销售'
            if (isNotEmpty(this.state.detailinfoData.prohibit_sales_btn_text)) {
                text = this.state.detailinfoData.prohibit_sales_btn_text
            }
            bgColor = separatorColor()
            textColor = darkLightColor()
            isClick = false
            if (this.state.detailinfoData.status == 'default') {
                return (
                    <View key={'1shop'} style={{width:viewW}}/>
                )
            } else {
                return (
                    <View key={'1shop'} style={{marginRight:0,width:viewW*2,height:50,backgroundColor:'#ccc',justifyContent:'center',alignItems:'center'}}>
                        <Text style={{color:'white',fontSize:15,fontWeight:'bold'}}>{text}</Text>
                    </View>
                )
            }
        }
        return (
            <TouchableOpacity key={'1shop'} activeOpacity={1} style={{marginRight:0,width:viewW,height:50}}
                              onPress={()=>{if(isClick){this.addShopCarMethod(0)}}}>
                <LinearGradient colors={backColors}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{flex:1,alignItems: 'center', justifyContent: 'center'}}>
                                            <Text style={{color:textColor,fontSize:15,fontWeight:'bold',textAlign:'center'}}>{text}</Text>
                                            </LinearGradient>
            </TouchableOpacity>
        )
    }

    renderByNow(){
        let text = '立即购买'
        let textColor = 'white'
        let isClick = true
        let viewW = 105*kScreenWidth/375
        if(safeObj(this.state.detailinfoData.status) != 'sale'){
            text = '暂不销售'
            bgColor = separatorColor()
            textColor = darkLightColor()
            isClick = false
            if (this.state.detailinfoData.status == 'default') {
                return (
                    <View key={'2shop'} style={{width:viewW}}/>
                )
            } else {
                return (
                    <View key={'2shop'}/>
                )
            }
        }
        return (
            <TouchableOpacity key={'2shop'} activeOpacity={1} style={{marginRight:0,width:viewW,height:50}}
                              onPress={()=>{if(isClick){this.addShopCarMethod(1)}}}>
                <LinearGradient colors={['rgb(255,51,0)','rgb(255,110,74)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{flex:1,alignItems: 'center', justifyContent: 'center'}}>
                                            <Text style={{color:textColor,fontSize:15,fontWeight:'bold'}}>{text}</Text>
                                            </LinearGradient>
            </TouchableOpacity>
        )

    }

    scrollLister(event){
        let contentY = event.nativeEvent.contentOffset.y;
        if (contentY > 60) {
            if(!this.props.navigation.state.params.showWhite || this.props.navigation.state.params.hiddenTitle) {
                this.props.navigation.setParams({
                    showWhite: true,
                    hiddenTitle: false
                })
            }
        } else {
            if(this.props.navigation.state.params.showWhite || !this.props.navigation.state.params.hiddenTitle) {
                this.props.navigation.setParams({
                    showWhite: false,
                    hiddenTitle: true
                })
            }
        }
        if(!this.headTabSelect) {
            if (this.infoViewPageY && contentY >= this.infoViewPageY) {
                this._setPage(2)
            } else if (this.commitViewPageY && contentY < this.commitViewPageY) {
                this._setPage(0)
            } else {
                this._setPage(1)
            }
        }
    }

    changePage(index){
        this.headTabSelect = true;

        if (index == 0) {
            this.vp.scrollTo({x:0,y:0})
        } else if (index == 1) {
            this.vp.scrollTo({x:0,y:this.commitViewPageY})

        } else {
            this.vp.scrollTo({x:0,y:this.infoViewPageY})
        }

        this._setPage(index)
    }

    _setPage(index) {
        if(index != this.props.navigation.state.params.selectIndex) {
            this.props.navigation.setParams({
                selectIndex:index
            })
        }
    }


    commitViewLayout(e){
        UIManager.measure(e.target, (x, y, width, height, pageX, pageY)=> {
            let navHeight = 0
            if(Platform.OS == 'android') {
                navHeight = Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50
            }else {
                navHeight = isIphoneX() ? 88 : 64;
            }
            this.commitViewPageY = pageY-40-navHeight
            this.infoViewPageY = pageY+height+10-navHeight
        })
    }

    /**
     * 返回一个自定义的头部
     * @returns {*}
     */
    renderHeader(){
        let {navigation} = this.props
        let headerStyle = {
            backgroundColor: navigation.state.params.showWhite?'white':'transparent',
            elevation: 0,
            height: getStatusBarHeight() + 50,
            paddingTop: getStatusBarHeight(),
            borderBottomWidth:0
        }
        return (
            <View ref={(item)=>this.titleView=item} style={[headerStyle,{width:kScreenWidth,flexDirection:'row',justifyContent:'space-between', alignItems:'center', position:'absolute', top:0}]}>
                <TouchableOpacity style={{width:88,height:29,marginLeft:13,justifyContent:'center'}}
                                    hitSlop={{left:15,top:10,bottom:5,right:-30}}
                                  onPress={()=>navigation?.state?.params?.goBack()??{}}>
                    {navigation.state.params.showWhite?
                        <Image ref={(item)=>this.titleBack=item} style={{width:11,height:20}} source={require('../../img/icon_back_gray.png')}/>
                        : <Image style={{width:29,height:29}} source={require('../../img/sx_icon_back.png')}/>
                    }
                </TouchableOpacity>
                {navigation.state.params.showWhite&&!navigation.state.params.hiddenTitle?
                    <View ref={(item)=>this.titleTextView=item} style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                        <TouchableOpacity hitSlop={{left:10,top:10,bottom:0,right:5}} style={{}} activeOpacity={1} onPress={()=>navigation.state.params.changePage(0)}>
                            <Text ref={(item)=>this.titleText1=item} style={{color:navigation.state.params.selectIndex==0?'#1FDB9B': '#333',fontSize:17}}>{'商品'}</Text>
                            <LinearGradient
                                ref={(item)=>this.titleTextLine1=item}
                                colors={['rgb(94,227,255)','rgb(71,222,179)','rgb(47,216,102)']}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                locations={[0,0.38,1]}
                                style={{width:35,height:4,marginTop:6,opacity:navigation.state.params.selectIndex==0?1:0}}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity hitSlop={{left:5,top:10,bottom:0,right:5}} style={{marginLeft:20}} activeOpacity={1} onPress={()=>navigation.state.params.changePage(1)}>
                            <Text ref={(item)=>this.titleText2=item} style={{color:navigation.state.params.selectIndex==1?'#1FDB9B': '#333',fontSize:17}}>{'评价'}</Text>
                            <LinearGradient
                                ref={(item)=>this.titleTextLine2=item}
                                colors={['rgb(94,227,255)','rgb(71,222,179)','rgb(47,216,102)']}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                locations={[0,0.38,1]}
                                style={{width:35,height:4,marginTop:6,opacity:navigation.state.params.selectIndex==1?1:0}}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity hitSlop={{left:5,top:10,bottom:0,right:5}} style={{marginLeft:20}} activeOpacity={1} onPress={()=>navigation.state.params.changePage(2)}>
                            <Text ref={(item)=>this.titleText3=item} style={{color:navigation.state.params.selectIndex==2?'#1FDB9B': '#333',fontSize:17}}>{'详情'}</Text>
                            <LinearGradient
                                ref={(item)=>this.titleTextLine3=item}
                                colors={['rgb(94,227,255)','rgb(71,222,179)','rgb(47,216,102)']}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                locations={[0,0.38,1]}
                                style={{width:35,height:4,marginTop:6,opacity:navigation.state.params.selectIndex==2?1:0}}
                            />
                        </TouchableOpacity>
                    </View>:<View/>}
                <View style={{width:88,height:29,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                    <TouchableOpacity hitSlop={{left:5,top:10,bottom:0,right:5}} style={{width:40,height:29,justifyContent:'center',alignItems:'center'}} onPress={()=>navigation.state.params.goShopCar()}>
                        {navigation.state.params.showWhite?
                            <Image ref={(item)=>this.titleShopCar=item} style={{width:19,height:18}} source={require('../../img/sx_icon_cart_up.png')}></Image>:
                            <Image style={{width:29,height:29}} source={require('../../img/sx_icon_cart.png')}></Image>
                        }
                        {navigation.state.params.carNumber?
                            <View style={{position:'absolute',borderRadius:8,height:16,minWidth:16,maxWidth:40,backgroundColor:'#ff3300',right:navigation.state.params.carNumber.length>2?-10:-5,top:-5,alignItems:'center',justifyContent:'center'}}>
                                <Text style={{color:'white',fontSize:10,padding:3,lineHeight:10,textAlign:'center',fontWeight:'500'}} numberOfLines={1}>{navigation.state.params.carNumber}</Text>
                            </View>
                            :null}

                    </TouchableOpacity>
                    <TouchableOpacity accessibilityLabel='medicine_detail_more' hitSlop={{left:5,top:10,bottom:0,right:5}} style={{width:29,height:29,marginLeft:17,marginRight:13,justifyContent:'center',alignItems:'center'}} onPress={()=>navigation.state.params.showMenu()}>
                        {navigation.state.params.showWhite?
                            <Image ref={(item)=>this.titleMore=item} style={{width:22,height:5,resizeMode:'stretch'}} source={require('../../img/icon_sandian_gray.png')}></Image>:
                            <Image style={{width:29,height:29}} source={require('../../img/sx_icon_more.png')}></Image>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    /**
     * 通过View的内部属性设置，这样不会全局render
     * @param view
     * @param color
     */
    changeColor(view,color){
        view.setNativeProps({
            style:color
        })
    }

    /**
     * 返回状态页，如果传了大图，就显示大图状态，如果没传就显示自定义状态页
     * @returns {*}
     */
    renderStatus(){
        if(this.img && this.showImg){
            return this.renderStatusImg()
        }else{
            return <StatusView ref={(item)=>this.statusView=item}
                               initStatus={(this.img && !this.showImg)?DISMISS_STATUS:SHOW_LOADING}
                               marginTop={Platform.OS === 'ios'?0:(Platform.Version >= 19 ?StatusBarManager.HEIGHT:0)}
                               retry={()=>{
                                   this.fetchAllDataFromServer()
                               }} />
        }
    }

    renderStatusImg(){
        let extraHeight = Platform.OS == 'ios'?0:(Platform.Version >= 19 ?StatusBarManager.HEIGHT:0)
        return (
            <View style={{width:width,height:height + extraHeight,backgroundColor:'white',position:'absolute'}}>
                <Image style={{width:width,height:230,resizeMode:'contain',marginTop:extraHeight+50}} source={{uri:this.img}} resizeMethod={'resize'}/>
                <View style={[BaseStyles.centerItem,{width:width,height:height,position:'absolute'}]}>
                    {
                        this.disMissLoading?
                        <View/>:
                        <View
                            style={[{position:'absolute',top:'50%',bottom:"50%",marginLeft:'auto',marginRight:'auto'},
                                BaseStyles.centerItem]}>
                            <Image style={{height: 40, width:40,resizeMode:'contain'}} source={IMG_LOADING}/>
                        </View>
                    }
                </View>
            </View>
        )
    }


    renderAlertFavourableActivityListView() {

        if (this.state.detailinfoData.shop_promotion != null) {

            if (this.state.detailinfoData.shop_promotion.length > 0) {

                return (
                    <YFWAlertFavourableActivityListView
                        ref={'favourable'}
                        data={this.state.detailinfoData}
                        dismiss={()=>{
                            this.layer.disMiss()
                        }}
                        onRequestClose={()=>{this.layer.disMiss()}}
                    />
                );

            }

        }

    }

    //加入购物车
    addShopCarMethod(type) {
        this.refs.package.show(type);
        YFWNativeManager.mobClick('product detail-add cart')
    }

    //跳转咨询
    toConsultingMethod() {
        let {navigate} = this.props.navigation
        doAfterLogin(navigate,()=>{
            let data = {shop_id: this.state.detailinfoData.shop_id,
                title:this.state.detailinfoData.title};
            YFWNativeManager.openZCSobot(data);
        })
        YFWNativeManager.mobClick('product detail-service')
    }

    //跳转店铺
    toShopDetailMethod() {

        if (isNotEmpty(this.state.detailinfoData.shop_id)) {
            let {navigate} = this.props.navigation;
            pushNavigation(navigate, {type: 'get_shop_detail', value: this.state.detailinfoData.shop_id});
        }
        YFWNativeManager.mobClick('product detail-shop')
    }

    //点击收藏
    toCollectionMethod() {

        let {navigate} = this.props.navigation;
        doAfterLogin(navigate, ()=> {
            this._collectionGoods()
        });
        YFWNativeManager.mobClick('product detail-favorite')
    }

    //跳转购物车
    toShopCarMethod() {

        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_shopping_car'});
        YFWNativeManager.mobClick('product detail-cart')
    }

    //弹框
    _clickPopupMethod(index,info) {

        if (index === 0) {
            this.layer && this.layer.show()
            this.refs.favourable.show()
        } else if (index === 1) {
            this.layer && this.layer.show()
            this.popupDialog && this.popupDialog.show(this.state.detailinfoData);
        } else if (index === 2) {
            this.refs.package.show(null,info);
        } else if (index === 3) {
            this.layer && this.layer.show()
            this.ruleView && this.ruleView.show(info)
        }

    }

    onShareClick(){
        YFWNativeManager.mobClick("product detail-share")
        let userInfo = YFWUserInfoManager.ShareInstance();
        let ads_item = safeObj(safeObj(userInfo.SystemConfig).ads_item);
        let isShowHead = (isNotEmpty(ads_item.isappear) &&  String(ads_item.isappear) == 'true')
        if (isNotEmpty(this.state.detailinfoData.title)) {
            let param = {page : 'detail',
                type : 'poster',
                goods_id : this.props.navigation.state.params.state.value,
                title : this.state.detailinfoData.title,
                image : this.state.detailinfoData.img_url.length>0 ? this.state.detailinfoData.img_url[0] : '',
                from : 'GoodsDetail',
                url:isNotEmpty(this.state.detailinfoData.invite_item)?this.state.detailinfoData.invite_item.invite_url:'',
                isShowHead:isShowHead
            };

            DeviceEventEmitter.emit('OpenShareView',param);
        }

    }

    fetchAllDataFromServer(){
        this._requetCommodityDetail()
    }

    fetchOtherDataFromServer(){
        if(!isEmpty(this.storeId)){
            this.getIdentity(this.storeId)
        }
    }

    //商品详情接口
    _requetCommodityDetail() {
            //活动倒计时时间不能从缓存取
            // if (!this.goodsInfoRequest&&this.props.navigation.state.params.state.cachedData) {
            //     let res = {result:this.props.navigation.state.params.state.cachedData}
            //     this.dealCommodityDetailData(res)
            //     return;
            // }
            let goodsID = this.props.navigation.state.params.state.value
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineDetail');
            paramMap.set('store_medicine_id', goodsID);
            paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
            paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
            this.startRequestTime = new Date().getTime()
            viewModel.TCPRequest(paramMap, (res)=> {
                if (this.isCreate != true) {
                    this.state.requestEndTime = new Date().getTime() - this.startRequestTime
                    this.state.connectServerTime = toDecimal(res.connectServerTime*1000)
                    this.state.sendParamTime = toDecimal(res.sendParamTime*1000)
                    this.state.getResponseTime = toDecimal(res.getAllResponseTime*1000)
                    this.state.unpackTime = toDecimal(res.unpackTime*1000)
                    this.state.getResponseTimeArray = res.getResponseTimeArray
                    this.isCreate = true
                }
                this.dealCommodityDetailData(res,goodsID)
                this.fetchOtherDataFromServer()
            },(error)=>{
                this.dealCommodityDetailError(error)
            },false);

    }

    dealCommodityDetailError(error) {
        if(error && error.code+"" === "-2" && safeObj(error.msg).includes("下架")){
            this.showErrorDialog(error.msg)
        }else{
            this.showImg = false
            this.statusView && this.statusView.showNetError()
        }
    }

    dealCommodityDetailData(res,goodsID){
        if (goodsID&&!this.goodsInfoRequest&&res.result) {
            YFWPrestrainCacheManager.sharedManager().addCachedInfoWithKey(goodsID+'goodsInfo',res.result)
        }
        if(res.result){
            let goodsDic = safeObj(res.result)
            if(goodsDic.medicineid){
                //商品不存在，只会返回一个比价页需要用的id
                this.showNotGoodsDialog(safe(goodsDic.medicineid))
                this.statusView && this.statusView.showEmpty()
                this.disMissLoading = true
                this.setState({})
                return;
            }

             this.getSuccess(true,false)
             //通过商家接口获取是否认证，如果上一页面没有传递，就这里请求
             if(isEmpty(this.storeid)){
                 this.getIdentity(safe(goodsDic.storeid))
             }
             goodsDic.is_fetch_from_server = 'true'
             let model = YFWGoodsDetailModel.getModelArray(goodsDic)
            //  if (model.is_seckill == 'true' && isNotEmpty(model.activity_prompt_info)) {
            //     YFWToast(model.activity_prompt_info)
            //  }
            if(model.is_promotion_activity
                && isNotEmpty(model.activity_rest_time)
                && parseInt(model.activity_rest_time) < 86400000 //大于24小时不显示
                && (model.activity_stage == 2 || model.activity_stage == 3) //2促销、3返场阶段显示倒计时
            ){
                this.priceCountdown = (Date.parse(new Date())/1000) + parseInt(model.activity_rest_time/1000)
            }
             this.setState({
                 detailinfoData:model,
                 isCollection : safe(goodsDic.is_favorite),
                 notice: model.package_prompt_info
             });
         }else{
             this.showErrorDialog("商品不存在!")
             this.statusView && this.statusView.showEmpty();
         }

    }

    showErrorDialog(msg){
        let bean = {
            title: msg,
            leftText: "确定",
            leftTextColor: yfwGreenColor(),
            isTouchCancel:false,
            leftClick: ()=> {
                this.props.navigation.goBack()
            }
        }
        this.tipsDialog&&this.tipsDialog._show(bean)
    }

    /**
     * 弹出商品不存在的提示，
     * 返回上一页
     * 去比价页看看
     * 这种情况是商品存在过数据库，但是已经被删除了，而不是一个完全不存在的商品
     * 完全不存在的商品res为null
     */
    showNotGoodsDialog(medicineid){
        let bean = YFWUserInfoManager.ShareInstance().isShopMember()?{
            title: "商品已下架!",
            leftText: "返回",
            leftTextColor: yfwGreenColor(),
            isTouchCancel:false,
            leftClick: ()=> {
                this.props.navigation.goBack()
            }
        }:{
            title: "商品已下架!",
            leftText: "返回",
            rightText:'去比价页看看',
            leftTextColor: yfwGreenColor(),
            rightTextColor:yfwGreenColor(),
            isTouchCancel:false,
            leftClick: ()=> {
                this.props.navigation.goBack()
            },
            rightClick:()=>{
                this.props.navigation.replace('YFWSellersListView',{state:{value: medicineid}});
            }
        }
        this.tipsDialog&&this.tipsDialog._show(bean)
    }

    /**
     * 获取商家是否认证
     */
    getIdentity(storeId){
        if(isEmpty(storeId)){
            return
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shop.getShopInfo');
        paramMap.set('storeid', storeId);
        viewModel.TCPRequest(paramMap, (res)=> {
            this.dealShopInfo(res)
        },(error)=>{
            let e = error;

        },false);
    }

    dealShopInfo(res){
        this.getSuccess(false,true)
        //是否认证
        if(res.result){
            this.state.detailinfoData.shop_contracted =safeObj(res.result).dict_store_status==4?1:-1;
            this.state.detailinfoData.service_star=convertStar(res.result.service_star)//服务
            this.state.detailinfoData.delivery_star=convertStar(res.result.send_star)//发货
            this.state.detailinfoData.shipping_star=convertStar(res.result.logistics_star)//物流
            this.state.detailinfoData.package_star=convertStar(res.result.package_star)//包装
            this.state.detailinfoData.evaluation_count=res.result.evaluation_count//评论总数
            this.state.detailinfoData.shop_title=res.result.title//店铺名称
            this.state.detailinfoData.shop_logo=res.result.logo_image//店铺Logo
            this.state.detailinfoData.total_star=res.result.total_star//店铺总评分
        }
        this.saveHistory()
        this.setState({})
    }

    /**
     * 保存历史记录
     */
    saveHistory(){
        const RecentlyBean = {
            shop_goods_id: this.props.navigation.state.params.state.value,
            time_stamp: this.currentDate(),
            shop_id:this.state.detailinfoData.shop_id+'',
            shop_name: this.state.detailinfoData.shop_title,
            medicine_price: this.state.detailinfoData.price,
            img_url: tcpImage(isEmpty(this.state.detailinfoData.img_url) || this.state.detailinfoData.img_url.length <= 0 ? '' : this.state.detailinfoData.img_url[0]),
            authCode: this.state.detailinfoData.authorized_code,
            standard: this.state.detailinfoData.Standard,
            name_cn: this.state.detailinfoData.name_cn
        }
        this.writeFile(RecentlyBean)
    }

    currentDate() {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let myDate = date.getDate();
        let timestamp = year + '年' + month + '月' + myDate + '日';
        return timestamp;
    }

    /*将文本写入本地 txt*/
    writeFile(RecentlyBean) {
        // create a path you want to write to
         const path = RNFS.DocumentDirectoryPath + '/test.txt';
         let text = JSON.stringify(RecentlyBean)
         RNFS.readFile(path)
            .then((result) => {
                const dataArray = result.split("\r\n");
                dataArray.splice(dataArray.length - 1, 1);
                let haveSave = dataArray.some((info)=>{
                    let infoObj = JSON.parse(info)
                    return infoObj.shop_goods_id == RecentlyBean.shop_goods_id && infoObj.time_stamp == RecentlyBean.time_stamp
                })
                if (!haveSave) {
                    return RNFS.appendFile(path, text + '\r\n', 'utf8')
                            .then((success) => {
                            })
                            .catch((err) => {
                            });
                }

            })
            .catch((err) => {
                return RNFS.appendFile(path, text + '\r\n', 'utf8')
                            .then((success) => {
                            })
                            .catch((err) => {
                            });
            });




    }

    //改变选中规格
    _changeSelectItem(item) {
        if(this.state.selectGoodsItem !== item){
            this.setState({
                selectGoodsItem:item
            })
        }
    }

    //加入购物车接口
    _addShopCarMethod(item) {
        let {navigate} = this.props.navigation
        doAfterLogin(navigate,()=>{
            this.setState({
                selectGoodsItem:item
            })
            this._addShopCar(item,false)
        })
    }

    _byNowMethod(item){
        let {navigate} = this.props.navigation
        doAfterLogin(navigate,()=>{
            this.setState({
                selectGoodsItem:item
            })
            this._addShopCar(item,true)
        })
    }

  /**
   * 添加到购物车
   * @param item
   * @private
   */
  _addShopCar(item, isByNow){
          let paramMap = new Map();
          paramMap.set('__cmd', 'person.cart.addCart');
          paramMap.set('quantity', item.quantity);
          if (isByNow) {
            paramMap.set('type','buy')
          }

          let addCarID = item.package_id;
          if (item.buyType != 'single') {
              paramMap.set('packageId', addCarID );
          } else {
              paramMap.set('storeMedicineId', addCarID );
          }
          YFWUserInfoManager.ShareInstance().addCarIds.set(addCarID+'','id')
          let viewModel = new YFWRequestViewModel();
          viewModel.TCPRequest(paramMap, (res)=> {
              this._getCartGoodsCountMethod()
              if (isByNow) {
                let info = {}
                if (item.buyType == 'single' && res.result && res.result.cartids) {
                    info.id = res.result.cartids.join(',')
                } else if (res.result && res.result.packageids) {
                    info.type = 'package'
                    info.package_id = res.result.packageids.join(',')
                }
                this.props.navigation.navigate(
                      "YFWOrderSettlementRootVC",
                      {
                          Data: [info],
                          fromBuyNow:true,
                      })
               } else {
                YFWToast('商品添加成功');
                DeviceEventEmitter.emit("SHOPCAR_INFO_CHANGE",this.state.detailinfoData.shop_id)//通知购物车 该商家商品发生变化  刷新凑单数据
               }

          });
    }

    //收藏接口
    _collectionGoods(){
            let paramMap = new Map();
            if (this.state.isCollection) {
                paramMap.set('__cmd', 'person.favorite.cancelCollectStoreGoods');
            } else {
                paramMap.set('__cmd', 'person.favorite.collectStoreGoods');
            }
            paramMap.set('medicineid', this.state.detailinfoData.goods_id);
            paramMap.set('storeid', this.state.detailinfoData.shop_id);
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                var is_favorite = false;
                if (this.state.isCollection) {
                    YFWToast('取消收藏成功');
                } else {
                    YFWToast('收藏成功');
                    is_favorite = true;
                }
                this.setState({
                    isCollection: is_favorite,
                });
            });
    }


    //获取购物车数量接口
    _getCartGoodsCountMethod() {
            if(!YFWUserInfoManager.ShareInstance().hasLogin()){
                return
            }
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.cart.getCartCount');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                this.dealCarGoodsCount(res)
            },(error)=>{},false);
    }

    dealCarGoodsCount(res){
        if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            return
        }
        this.props.navigation.setParams({
            carNumber: this.dealShopCarCount(res.result.cartCount),
        });
        new YFWUserInfoManager().shopCarNum = res.result.cartCount+'';
        DeviceEventEmitter.emit('SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
    }

    dealShopCarCount(carCount){
        let num = null
        if(parseInt(carCount) > 0){
            num = carCount
            if(parseInt(carCount)>99){
                num = "99+"
            }
        }
        return num
    }

}

const styles = StyleSheet.create({
    btnTitle:{
        color:darkTextColor(),fontWeight:'bold',marginTop:6,fontSize:10,textAlign:'center',width:32
    },
    btn:{
        alignItems: 'center', justifyContent: 'center'
    }
})
