import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    BackAndroid,
    DeviceEventEmitter,
    FlatList,
    NativeModules
} from 'react-native';
import YFWNativeManager from "../Utils/YFWNativeManager";
import {NavigationActions} from "react-navigation";
import {
    iphoneTopMargin,
    isNotEmpty,
    itemAddKey, kScreenHeight,
    kScreenWidth,
    safeObj,
    isArray,
    safe,
    isAndroid,
    is_ios_hot_bundle, getStatusBarHeight, safeArray
} from "../PublicModule/Util/YFWPublicFunction";
import YFWTitleView from "../PublicModule/Widge/YFWTitleView";
import YFWGoodsItem from "../widget/YFWGoodsItem";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {center} from "../../node_modules_local/react-native-fast-image/src";
import {
    backGroundColor,
    darkLightColor,
    orangeColor,
    yfwGreenColor,
} from "../Utils/YFWColor";
import {pushNavigation, doAfterLogin} from "../Utils/YFWJumpRouting";
import YFWShopCarRecomendModel from "../ShopCar/Model/YFWShopCarRecomendModel";
import { getSignInData, TYPE_SIGN_POINTS } from '../Utils/YFWInitializeRequestFunction';
import YFWNotificationView from '../widget/YFWNotificationView'
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import YFWHomeAdView from "../widget/YFWHomeAdView";
import {toDecimal} from "../Utils/ConvertUtils";
const {StatusBarManager} = NativeModules;

/**
 * 支付成功、评价成功、收货成功页面
 */

export default class YFWOrderSuccessPage extends Component {
    static navigationOptions = ({navigation}) => ({
        gesturesEnabled:false,
        tabBarVisible: false,
        header:null,
        });

    constructor(props) {
        super(props);
        this.state = {
            buttonArray: [{text:'我的订单',type:'get_my_order'},{text:'回到首页',type:'get_main_page'}],
            invite_win_cash_url_share:'',
            ad_app_payment:{},
            status_name:'',
            title_share:'',
            content_share:'',
            image_url_share:'',
            prompt_image:'',
            prompt:'',
            payType:'',
            price:'',
            orderNo:'',
            shopName:'',
            shopInfo:{},
            RecommendData:[],
            headerOpacity: 0,
            pageType:[{key:'payment', cnName:'付款成功'},{key:'received', cnName:'收货成功'},{key:'evaluate', cnName: '评价成功'}]
        };
        this.onBackAndroid = this.onBackAndroid.bind(this)
        this.listener();
    }

    componentWillMount(){
        this.props.navigation.state.backMethod = this._backMethod
    }

    componentDidMount() {
        this._requestBackValue();
        this._requestRecommendData()
        setTimeout(()=>{
            DeviceEventEmitter.emit('OpenRateView');
        },1500);

    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid);
                }
                this.refs.headerImage.setNativeProps({
                    opacity: this.state.headerOpacity
                })
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

    //Request
    _requestBackValue(){

        this.state.orderNo = this.props.navigation.state.params.orderNo;
        this.state.pageType = this.props.navigation.state.params.type;
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let orderNo = this.props.navigation.state.params.orderNo;
        let type = this.props.navigation.state.params.type;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getOrderOperInfo');
        paramMap.set('orderno', orderNo);
        paramMap.set('type', type);
        paramMap.set('client','phone');
        viewModel.TCPRequest(paramMap,(res)=>{
            let data = res.result;
            if (isNotEmpty(data)){
                let buttonOrder = {text:'查看订单',type:'get_order_detail',value:safeObj(orderNo)};
                let buttonHome = {text:'回到首页',type:'get_main_page'}
                let buttonArray = []
                if(isNotEmpty(data.items['0'].buttons)&&data.items['0'].buttons.length>0) {
                    buttonArray = data.items['0'].buttons;
                    if(buttonArray.length <= 1){
                        buttonArray.push(buttonHome)
                    }
                } else {
                    buttonArray.push(buttonOrder)
                    buttonArray.push(buttonHome)
                }
                let shopItem = {}
                if (isNotEmpty(data.items) && data.items.length == 1) {
                    shopItem = data.items[0]
                }
                let new_shop_info = {
                    shop_name: safe(shopItem.title),
                    shop_address: safe(shopItem.address),
                    shop_lat: safe(shopItem.lat),
                    shop_lng: safe(shopItem.lng),
                    end_time: safe(shopItem.selflifttimeTo),
                }
                if(type === 'payment' && safeArray(res.result.ad_app_payment_pop).length > 0){
                    this.homeAdView&&this.homeAdView.showView(res.result.ad_app_payment_pop[0])
                }
                this.setState({
                    buttonArray:buttonArray,
                    invite_win_cash_url_share:data.invite_win_cash_url_share,
                    ad_app_payment:data.ad_app_payment['0'],
                    title_share:data.title_share,
                    prompt_image:data.prompt_image,
                    content_share:data.content_share,
                    image_url_share:data.share_image,
                    status_name:data.items['0'].status_name,
                    prompt:type==='evaluate'?'':data.prompt,
                    payType:data.items['0'].payment_name,
                    price:this._getTotalPrice(data.items),
                    shopInfo:new_shop_info,
                });
            }

        });

    }

    _getTotalPrice(items){
        let totalPrice = 0
        items.forEach((item)=>{
             totalPrice += item.total_price
        })
        return toDecimal(totalPrice)
    }

    _requestRecommendData(){
        let paramMap = new Map();
        paramMap.set('__cmd','guest.medicine.getTopVisitMedicine');
        paramMap.set('limit',6);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            let dataArray = itemAddKey(YFWShopCarRecomendModel.getModelArray(res.result))
            this.setState({
                RecommendData:dataArray,
            });
        },(error)=>{
        },false);
    }

    goToShop(shopInfo) {
        YFWNativeManager.goToRoutePlanning(shopInfo.shop_lat,shopInfo.shop_lng,shopInfo.shop_address)
    }

    //Action
    onBackAndroid=()=>{
        this._backMethod();
        return true;
    }

    _backMethod=()=>{
        if (this.props.navigation.state.params.from === 'orderSettlement'|| this.props.navigation.state.params.from ==='orderRootSettlement'){
            let unPayCount = this.props.navigation.state.params.unPayCount
            if(unPayCount <= 1){
                YFWNativeManager.removeVC();
                this.props.navigation.popToTop();
                const resetActionTab = NavigationActions.navigate({ routeName: 'ShopCarNav' });
                this.props.navigation.dispatch(resetActionTab);
            } else{
                this.props.navigation.goBack();
            }
        } else if(this.props.navigation.state.params.from === 'orderList' || this.props.navigation.state.params.from === 'orderDetail'){
            //刷新列表状态
            DeviceEventEmitter.emit('order_status_refresh', 'PaySuccess');
            this.props.navigation.goBack();
        } else if(this.props.navigation.state.params.from === 'order_evaluation'){
            //刷新列表状态
            DeviceEventEmitter.emit('order_status_refresh', 'PaySuccess');
            let pageSource = this.props.navigation.state.params.pageSource;
            if (isNotEmpty(pageSource)) {
                DeviceEventEmitter.emit('order_status_refresh', pageSource);
            }
            this.props.navigation.goBack(this.props.navigation.state.params.goBackKey);
        }else {
            this.props.navigation.popToTop();
        }
    }

    _buttonClick(value){
        let orderNo = ''
        let isBatchOrder = false   //是否是合并支付
        if(isArray(this.state.orderNo)){
            if(this.state.orderNo.length>1){
                isBatchOrder = true
            }else{
                orderNo = this.state.orderNo[0]
            }
        }else{
            orderNo = this.state.orderNo
        }
        if (value.type === 'get_order_detail' || value.type === 'get_order') {//跳转订单详情
            const {navigate} = this.props.navigation;
            if(isBatchOrder){
                pushNavigation(navigate,{type:'get_order',value:0})
            }else{
                pushNavigation(navigate, {type: 'get_order_detail', value: orderNo});
            }
        } else if (value.type === 'get_order_detail_o2o'){//跳转O2O订单详情
            const {navigate} = this.props.navigation;
            pushNavigation(navigate, {type: 'O2O_order_detail', orderNo: orderNo});
        } else if (value.type === 'get_comment_detail'){//跳转评价订单页面
            let shopName = this.props.navigation.state.params.shopName
            let orderTotal = this.props.navigation.state.params.orderTotal
            let img_url = this.props.navigation.state.params.img_url
            const {navigate} = this.props.navigation;
            pushNavigation(navigate, {
                type: 'order_evaluation',
                value: {
                    orderNo: orderNo,
                    shopName: shopName,
                    orderTotal:orderTotal,
                    img_url:img_url,
                    gobackKey: this.props.navigation.state.key
                }
            });
        } else if (value.type === 'get_main_page'){
            this.props.navigation.popToTop();
            const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
            this.props.navigation.dispatch(resetActionTab);
        } else if (value.type === 'get_my_order'){
            const {navigate} = this.props.navigation;
            pushNavigation(navigate,{type:'get_order',value:0})
        }
    }

    _toShare(){
        let param = {
            title : this.state.title_share,
            url:this.state.invite_win_cash_url_share,
            image:this.state.image_url_share,
            content:this.state.content_share,
        };
        DeviceEventEmitter.emit('OpenShareView',param);

    }

    _clickAd(adBadge){
        if (adBadge.name && adBadge.name.startsWith('签到')) {
            if(this.canNotClick){return}
            const {navigate} = this.props.navigation;
            doAfterLogin(navigate, ()=> {
                this.canNotClick = true
                getSignInData(navigate,TYPE_SIGN_POINTS);
                setTimeout(() => {
                    this.canNotClick = false
                }, 1000);
            })
        } else {
            pushNavigation(this.props.navigation.navigate, adBadge);
        }
    }

    //Render
    render() {
        return (
            <View style = {{flex:1,backgroundColor: backGroundColor()}}>

                <FlatList
                    data={this.state.RecommendData}
                    ListHeaderComponent={this._renderMainView()}
                    renderItem={(item)=>this._renderCommendItem(item)}
                    keyExtractor={(item, index) => index}
                    numColumns={2}
                    onScrollBeginDrag={(e) => this._listScroll(e)}
                    onScroll={(e) => this._listScroll(e)}
                    onScrollEndDrag={(e) => this._listScroll(e)}
                />
                {this._renderHeader()}
                <YFWHomeAdView ref={(ad)=>{this.homeAdView = ad}} navigation={this.props.navigation} showClose={false}/>
            </View>
        )
    }

    _renderMainView=()=>{
        let hasPrompt = this.state.prompt.length > 0?true:false
        let maringTop = getStatusBarHeight() + (this.state.prompt.length > 0? 50 :0);
        return(
            <View >
                <Image style={{width:kScreenWidth,height: maringTop}} source={require('../../img/pay_success_status_bar.png')}/>
                <View>
                    <Image style={[styles.backgroundImg,{top:hasPrompt?0:-20}]} source={require('../../img/pay_success_bk.png')}/>
                    <View style={{justifyContent:'center', alignItems: 'center', width:kScreenWidth, height:hasPrompt?(kScreenHeight/3-50):(kScreenHeight/3-70),paddingTop:iphoneTopMargin()-20}}>
                        {this._renderMsg()}
                    </View>
                    {this._renderBtn()}
                    {this._renderLargeBtn()}
                    {this._renderShopInfoView()}
                    <View style={{ alignItems:'center', height: 50}}>
                        <YFWTitleView title={'精选商品'}/>
                    </View>
                </View>
                {this._renderPromptView()}
            </View>
        )
    }

    _renderHeader() {
        let headerMargin = this.state.prompt.length > 0 ? (iphoneTopMargin() - 20)  : (iphoneTopMargin() - 20)
        return(
            <View style={{top:0,paddingTop:headerMargin,position:'absolute',resizeMode:'stretch'}}>
                <Image ref={'headerImage'} style={{top:0,height:50+headerMargin,position:'absolute',resizeMode:'stretch'}} opacity={0} source={require('../../img/pay_success_status_bar.png')}/>
                <View style={[styles.header,{marginTop:0}]}>
                    <TouchableOpacity style={{width:50,height:50,alignItems:'center',justifyContent:'center'}} activeOpacity={1}
                                      onPress={()=>{this.props.navigation.state.backMethod()}}>
                        <Image style={styles.backButton}
                               source={ require('../../img/top_back_white.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    _renderMsg(){
        let title = this.props.navigation.state.params.title;
        let paySuccess = this.state.pageType === 'payment';
        let payType = this.state.payType;
        let price = this.state.price;
        let scale = kScreenWidth/360
        return(
            <View style={{justifyContent:'center', alignItems: 'center',flex:1}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Image style={{width:30*scale, height:30*scale, resizeMode:'stretch'}} source={require('../../img/order_status_icon_success.png')}/>
                    <Text style={{fontSize: 18*scale, color: "white", fontWeight: 'bold', marginLeft: 8*scale}}>{title}</Text>
                </View>
                {paySuccess?
                    <View>
                        {isNotEmpty(payType)?<View style={{flexDirection:'row',paddingTop:15*scale, alignItems:'center'}}>
                            <Image style={{width:13*scale, height:13*scale, resizeMode:'stretch',marginRight: 10*scale}} source={require('../../img/icon_wallet.png')}/>
                            <Text style={{fontSize: 12*scale, color: "white"}}>支付方式: </Text>
                            <Text style={{fontSize: 12*scale, color: "white"}}>{payType}</Text>
                        </View>:<View />}
                        {isNotEmpty(price)?<View style={{flexDirection:'row',paddingTop:10*scale, alignItems:'center'}}>
                            <Image style={{width:13*scale, height:13*scale, resizeMode:'stretch',marginRight: 10*scale}} source={require('../../img/icon_price.png')}/>
                            <Text style={{fontSize: 12*scale, color: "white"}}>支付金额: </Text>
                            <Text style={{fontSize: 12*scale, color: "white", fontWeight: 'bold'}}>{price}</Text>
                        </View>:<View />}
                        <YFWNotificationView notiType="payment"/>
                    </View>
                    :<View/>}
            </View>
        )
    }

    _renderBtn(){
        let buttonArray = this.state.buttonArray;
        let allButton = [];
        buttonArray.forEach((item,index)=> {
            allButton.push(
                <TouchableOpacity style={styles.button} onPress={()=>this._buttonClick(item)}>
                    <Text style={{fontSize: 14, color: yfwGreenColor()}}>{item.text}</Text>
                </TouchableOpacity>
            )
        })
        return (
            <View style={{flexDirection:'row', justifyContent:'center'}}>
                {allButton}
            </View>
        )
    }

    _renderLargeBtn(){
        //预留广告位
        let text1 = '抽奖送好礼，积分领不停';
        let text2 = '邀请好友注册，最多赚500元/人';
        let adBadge = this.state.ad_app_payment;
        let img_url = adBadge.img_url?{uri:adBadge.img_url.replace('https', 'http')}:require('../../img/choujiang.png')
        let ad_name = adBadge.name?adBadge.name:text1
        return (
            <View style={styles.largeButton}>
                <TouchableOpacity style={styles.largeButtonItem} onPress={()=>adBadge?this._clickAd(adBadge):{}}>
                    <Image style={{width:70, height:25, resizeMode:'contain'}} source={img_url}/>
                    <Image style={{width:6, height:11, right:0, position:'absolute'}} source={require('../../img/toPayArrow.png')}/>
                    <Text style={{fontSize: 12, color: darkLightColor(), textAlign: 'center',marginLeft:10}}>{ad_name}</Text>
                </TouchableOpacity>
                <View style={styles.segmentation}/>
                <TouchableOpacity style={styles.largeButtonItem} onPress={()=>this._toShare()}>
                    <Image style={{width:72, height:25}} source={require('../../img/zhuanxianjin.png')}/>
                    <Image style={{width:6, height:11, right:0, position:'absolute'}} source={require('../../img/toPayArrow.png')}/>
                    <Text style={{fontSize: 12, color: darkLightColor(),marginLeft:10}}>{text2}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    _renderShopInfoView() {
        let shopInfo = this.state.shopInfo
        if (isNotEmpty(shopInfo.shop_name)) {
            let hiddenMapNavigation = is_ios_hot_bundle()
            return (
                <View style={[styles.largeButton,{paddingVertical:5,paddingHorizontal:15}]}>
                    <View style={styles.infoRowStyle}>
                        <Text style={styles.infoTitle}>{'自提截止：'}</Text>
                        <Text style={styles.infoText}>{safe(shopInfo.end_time)}</Text>
                    </View>
                    <View style={styles.infoRowStyle}>
                        <Text style={styles.infoTitle}>{'店铺名称：'}</Text>
                        <Text style={styles.infoText}>{safe(shopInfo.shop_name)}</Text>
                    </View>
                    <View style={[styles.infoRowStyle,{flex:1,}]}>
                        <Text style={styles.infoTitle}>{'自提地点：'}</Text>
                        <Text style={[styles.infoText,{flex:1}]}>{safe(shopInfo.shop_address)}</Text>
                        <TouchableOpacity activeOpacity={1} hitSlop={{top:10,left:10,bottom:10,right:10}} style={{minWidth:60,height:18,opacity:hiddenMapNavigation?0:1}} onPress={()=>{!hiddenMapNavigation&&this.goToShop(shopInfo)}}>
                            <Text style={{color:yfwGreenColor(),fontSize:13,marginLeft:5}}>{'点击前往'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        return null
    }

    _renderPromptView(){
        if (this.state.prompt.length > 0) {
            let marginTop = getStatusBarHeight()
            return (
                <View style={{backgroundColor:'rgb(254,249,202)', width: kScreenWidth, top: 50 + (marginTop), position:'absolute'}}>
                    <Text style={{paddingVertical:10,paddingHorizontal:15,color:orangeColor(), fontSize:12 , lineHeight:15}} numberOfLines={0}>
                        {this.state.prompt}
                    </Text>
                </View>
            );
        } else {
            return (<View/>);
        }
    }

    _renderCommendItem=({item})=> {
        return(
            <YFWGoodsItem model={item} from={'cart_list_recommend'} navigation={this.props.navigation}/>
        )
    }

    _listScroll(e) {
        let scrollY = e.nativeEvent.contentOffset.y;
        let opacity = scrollY/100.0
        if(opacity < 0){
            opacity = 0
        }else if( opacity > 1) {
            opacity = 1
        }
        this.state.headerOpacity = opacity;
        if (this.refs.headerImage) {
            this.refs.headerImage.setNativeProps({
                opacity: opacity
            })
        }
    }

}

const styles = StyleSheet.create({
    header: {
        width: kScreenWidth,
        height:50,
        flexDirection:'row',
        alignItems:'center',
        marginTop:iphoneTopMargin() - 20,
    },
    backButton: {
        width:11,
        height:19,
        resizeMode:'stretch',
        padding: 5
    },
    backgroundImg: {
        left:0,
        top:0,
        width:kScreenWidth,
        height:583/750*kScreenWidth,
        position:'absolute',
        resizeMode:'stretch',
    },
    button: {
        width: 135/360*kScreenWidth,
        height: 33/360*kScreenWidth,
        marginHorizontal:11/360*kScreenWidth,
        borderRadius: 17/360*kScreenWidth,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(31, 184, 132, 0.5)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        elevation: 3,
        shadowRadius: 7,
        shadowOpacity: 1,
        alignItems:'center',
        justifyContent:'center'
    },
    largeButton:{
        width: kScreenWidth-24,
        marginHorizontal:12,
        marginTop:25,
        marginBottom:10,
        paddingHorizontal:15,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        elevation: 3,
        shadowRadius: 7,
        shadowOpacity: 1
    },
    largeButtonItem:{
        flexDirection:'row', justifyContent:'flex-start', alignItems:'center', paddingVertical: 10
    },
    segmentation:{
        height: 0.5, backgroundColor: "#dddddd"
    },
    infoRowStyle: {
        flexDirection:'row',marginTop:10
    },
    infoTitle:{
        color:'#333',fontSize:13
    },
    infoText:{
        color:'#666',fontSize:13,marginLeft:3
    }

});
