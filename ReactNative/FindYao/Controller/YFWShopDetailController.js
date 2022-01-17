import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    ImageBackground,
    TouchableOpacity,
    FlatList,
    ScrollView,
    BackAndroid,
    DeviceEventEmitter,
    NativeModules
} from 'react-native';
import YFWToast from "../../Utils/YFWToast";
import {yfwGreenColor, yfwOrangeColor, darkLightColor, separatorColor, backGroundColor,darkNomalColor,darkTextColor} from "../../Utils/YFWColor";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWShopDetailHeaderView from '../View/YFWShopDetailHeaderView'
import YFWShopDetailGoodsListCollectionItemView from '../View/YFWShopDetailGoodsListCollectionItemView'
import {
    iphoneBottomMargin,
    isIphoneX,
    itemAddKey,
    kScreenWidth,
    isNotEmpty,
    darkStatusBar,
    safe,
    safeObj,
    tcpImage,
    convertShopImage
} from "../../PublicModule/Util/YFWPublicFunction";
import {doAfterLogin, pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWShopDetailInfoModel from "../Model/YFWShopDetailInfoModel";
import YFWShopDetailCategorModel from "../Model/YFWShopDetailCategorModel";
import YFWShopDetailRecommendModel from "../Model/YFWShopDetailRecommendModel";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWShopCategoryGoodsListView from '../View/YFWShopCategoryGoodsListView';
import YFWMore from '../../widget/YFWMore';
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import SharePoster from '../../widget/SharePoster';
import YFWShopDetailIntroModel from '../Model/YFWShopDetailIntroModel';
const {StatusBarManager} = NativeModules;

export default class YFWShopDetailController extends Component {

    static navigationOptions = ({navigation}) => ({
        gesturesEnabled:navigation.state.params.state.from === 'map'?false:true,
        tabBarVisible: false,
        header:null
    });

    constructor(props) {

        super(props)
        if(isNotEmpty(this.props.navigation.state.params.shop_id)){
            this.shopID = this.props.navigation.state.params.shop_id;
        }else {
            this.shopID = this.props.navigation.state.params.state.value;
            this.from = this.props.navigation.state.params.state.from;
            this.props.navigation.setParams({searchMethod: this._searchMethod.bind(this)})
        }
        this.state = {
            shopDetailItem: null,
            couponItem: [],
            shopCategorItem: [],
            shopRecommendItem: [],
            shareData: {
                type : 'poster',
                page: 'shop',
                shopID: this.shopID,
                title: '',
                image: '',
                content: '更多商品，速来围观'
            }
        };
        this.onBackAndroid = this.onBackAndroid.bind(this)
        this.listener();
        this.handleData();

    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
                }
            }
        );
        this.didBlur = this.props.navigation.addListener('didBlur',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
                }
            }
        );

    }


    onBackAndroid = ()=> {
        this.props.navigation.goBack();
        if (this.props.navigation.state.params.state.from == 'native') {
            YFWNativeManager.reactBack();
        }
        return true;
    }


    componentDidMount() {
        darkStatusBar();
    }


    handleData(){

        this._requestData();
        this._requestShopCategor();
        this._requestShopRecommend();

    }


    //@ Request
    _requestData() {

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        let cmd = 'guest.shop.getShopInfo as ShopInfo,guest.shop.getShopQualification as ShopQualification'
        // paramMap.set('__cmd', 'guest.shop.getShopInfo');
        // paramMap.set('storeid', this.shopID);
        paramMap.set('ShopInfo', {'storeid': this.shopID});
        paramMap.set('ShopQualification', {'storeid': this.shopID});
        paramMap.set('__cmd', cmd);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isNotEmpty(res.result)) {

                let dataArray = YFWShopDetailInfoModel.getModelArray(res.result.ShopInfo);
                let qual = YFWShopDetailIntroModel.getModelArray(safeObj(res.result.ShopQualification).sj_items)
                var logo = ''
                if (safe(dataArray.logo_img_url).length > 0) {
                    logo = dataArray.logo_img_url
                    logo = logo.indexOf('noyaodian_logo.png') == -1 ? logo : (qual.length>0 ? convertShopImage(qual[0].show_image_suffix,qual[0].image_file) : '')
                } else {
                    logo = qual.length>0 ? convertShopImage(qual[0].show_image_suffix,qual[0].image_file) : ''
                }
                let { shareData } = this.state
                shareData.title = safe(dataArray.title)
                shareData.image = logo
                shareData.shopID = safe(dataArray.shop_id)
                this.setState({
                    shopDetailItem:dataArray,
                    couponItem:dataArray.coupons_list,
                    shareData: shareData
                });
            }

        },(error)=>{

        });

    }


    _requestShopCategor() {

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shopMedicine.getCategroyByParentId');
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = YFWShopDetailCategorModel.getModelArray(res.result);
            dataArray = itemAddKey(dataArray);
            this.setState({
                shopCategorItem: dataArray,
            });

        },(error)=>{

        });

    }

    _requestShopRecommend() {


        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineTop');
        paramMap.set('storeid', this.shopID);
        paramMap.set('count', 6);
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = YFWShopDetailRecommendModel.getModelArray(res.result);
            dataArray = itemAddKey(dataArray);
            this.setState({
                shopRecommendItem: dataArray,
            });
            this.listView && this.listView.refreshView()
        });

    }



    //@ Action
    //商家简介
    _shopJianJieMethod(){

        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail_intro',value:this.shopID});

    }
    //全部商品
    _shopAllGoodsMethod(){

        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail_list',value:this.shopID});

    }
    //在线咨询
    _shopOnlineAdvisoryMethod(){
        const { navigate } = this.props.navigation;
        doAfterLogin(navigate,()=>{
            let data = {shop_id : this.shopID};
            YFWNativeManager.openZCSobot(data);
        })
    }

    //跳转商家商品分类
    _toShopGoodsCategoryMethod(item){

        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail_list',value:this.shopID,category_id:item.id});

    }

    //领取优惠券
    _getCouponMethod(item){

        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{

            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.usercoupons.acceptCoupon');
            paramMap.set('id', item.id);
            viewModel.TCPRequest(paramMap, (res)=> {
                YFWToast('领取成功');
            });

        })


    }

    //跳转搜索页
    _searchMethod(){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_search',shop_id:this.shopID});

    }

    //@ View
    render() {
        return (
            <View style={[BaseStyles.container]}>
                {this._renderTopView()}
                {this._renderBottomMenu()}
            </View>
        );
    }

    _renderTopView(){
        let topViewHeight = this.state.couponItem.length>0?410:400-58
        return (
            <View style={{width:kScreenWidth,height:topViewHeight}}>
                <Image style={{height:topViewHeight,width:kScreenWidth,position:'absolute',top:-1,left:0,right:0,resizeMode:'stretch'}} source={require('../../../img/shop_bg.png')}/>
                {this._renderHeaderView()}
                {this._renderHeaderItem()}
                {this.state.couponItem.length>0?this._renderCouponItem():null}
            </View>
        )
    }

    _renderHeaderView(){
        let marginTop
        if(Platform.OS === 'ios'){
            marginTop = isIphoneX()?44+2:20+2
        }else if(Platform.Version >19){
            marginTop = StatusBarManager.HEIGHT
        }
        let headerHeight = marginTop+40+18
        return (
            <View style={{width:kScreenWidth,height:headerHeight,resizeMode:'contain',flexDirection:'row'}} >
                 <TouchableOpacity onPress={()=>{
                                  this.props.navigation.goBack()
                                  if(Platform.OS == 'android'){
                                    if(this.props.navigation.state.params.state.from == 'native'){
                                        YFWNativeManager.reactBack();
                                    }
                                  }else {
                                    if (this.props.navigation.state.params.state.from == 'map'){
                                        // pushNavigation(navigation.navigate,{type:'get_shop_around'});
                                        if(Platform.OS == 'ios'){
                                            YFWNativeManager.backChange();
                                        }
                                    }
                                  }
                              }}  activeOpacity={1}
                                  style={{width:50,height:40,justifyContent:'center',marginTop:marginTop}}>
                    <Image style={{width:11,height:19,marginLeft:12,resizeMode:'contain'}}
                           source={ require('../../../img/dingdan_back.png')}/>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,height:40,justifyContent:'center',marginTop:marginTop,marginLeft:1,marginRight:5}}
                    onPress={()=>{this.props.navigation.state.params.searchMethod()}}>
                    <View style={{height:34,borderRadius:17,backgroundColor:'rgba(255,255,255,0.3)',alignItems:'center',flexDirection:'row'}}>
                        <Image style={{width: 15, height: 16, marginLeft:15}} source={require('../../../img/kind_search_white.png')}/>
                        <Text  style={{padding:0,flex:1,marginLeft:10,marginRight:10,fontSize:14,color:'white'}} numberOfLines={1}>批准文号、通用名、商品名、症状</Text>
                    </View>
                </TouchableOpacity>
                <View style={{width:50,height:40,marginTop:marginTop,justifyContent:'center'}}>
                    <YFWMore fromPage='shop' shareData={this.state.shareData} />
                </View>
                <SharePoster shareData = {this.state.shareData} from = 'shop' type="Poster" navigation = {this.props.navigation}/>
            </View>
        )
    }

    //商家头部信息
    _renderHeaderItem() {
        if (this.state.shopDetailItem != null) {
            return <YFWShopDetailHeaderView Data={this.state.shopDetailItem} navigation={this.props.navigation} toDetail={()=>{this._shopJianJieMethod()}}/>
        }
    }

    //商家优惠券
    _renderCouponItem() {

        if (this.state.couponItem.length > 0){

            return(
                <View style={{height:58,width:kScreenWidth,marginTop:12}}>
                    <ScrollView horizontal={true} style={{width:kScreenWidth-12*2,marginLeft:12}}>
                        {
                            this.state.couponItem.map((item, i) => {
                                return (
                                    <TouchableOpacity key={i} style={[BaseStyles.leftCenterView]}
                                                      onPress={() => this._getCouponMethod(item)} underlayColor="transparent">
                                        <View style={[{height: 62, width: 150 , marginLeft:i==0?0:6,justifyContent:"center"}]}>
                                            <Image source={require('../../../img/coupon_bg.png')} style={{resizeMode:'stretch',height: 62, width: 150,position:'absolute',top:0,left:0}}/>
                                            <View style={{width:76,height:62,alignItems:'center',justifyContent:'center'}}>
                                                <Text style={{fontSize:15,color:'white',fontWeight:'700',marginTop:-3}}>¥
                                                    <Text style={{fontSize:21,fontWeight:'900'}}>{item.money}</Text>
                                                </Text>
                                                <Text style={{fontSize:10,color:'white'}}> {item.title ? item.title : ('满'+Number.parseInt(item.min_order_total)+'即可使用')} </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </ScrollView>
                </View>
            );
        }


    }

    _renderListView(){
        return (
            <View style={{width:kScreenWidth,flex:1}}>
                <YFWShopCategoryGoodsListView ref={(view)=>{this.listView = view}} shopRecommendItem = {this.state.shopRecommendItem} shopCategorItem = {this.state.shopCategorItem} shopID = {this.shopID} navigation = {this.props.navigation}/>
            </View>
        )
    }

    //底部菜单
    _renderBottomMenu(){
        const bottom = iphoneBottomMargin();
        let marginT = (this.state.couponItem.length>0?410:400-58) - (this.state.couponItem.length>0?70:0) - (Platform.Version >= 19?StatusBarManager.HEIGHT:0) - (16+35+50)-58
        return(
            <View style={{flex:1,marginTop:Platform.OS === 'ios'?isIphoneX()?-140:-164:-marginT}}>
                {this._renderListView()}
                <View style={[BaseStyles.separatorStyle,{marginLeft:0,width:kScreenWidth}]}/>
                <View style={{height: 50, marginBottom:bottom,backgroundColor: "white", flexDirection: "row"}}>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this._shopJianJieMethod()}>
                            <Image style={{width:18,height:18,resizeMode:'contain'}} source={ require('../../../img/bottom_icon_dianpu.png')}/>
                            <Text style={{color:'rgb(51,51,51)',fontSize:10,marginTop:6}}>商家简介</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[BaseStyles.verticalSeparatorStyle,{height:50}]}/>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this._shopAllGoodsMethod()}>
                            <Image style={{width:18,height:18,resizeMode:'contain'}} source={ require('../../../img/bottom_icon_all.png')}/>
                            <Text style={{color:'rgb(51,51,51)',fontSize:10,marginTop:6}}>全部商品</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[BaseStyles.verticalSeparatorStyle,{height:50}]}/>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this._shopOnlineAdvisoryMethod()}>
                            <Image style={{width:18,height:18,resizeMode:'contain'}} source={ require('../../../img/bottom_icon_zixun.png')}/>
                            <Text style={{color:'rgb(51,51,51)',fontSize:10,marginTop:6}}>在线咨询</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({

    row2: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: kScreenWidth / 3,
        height: 55,
        borderWidth: 0.25,
        borderColor: separatorColor(),
        backgroundColor: 'white',
        justifyContent: "center",
        alignItems: "center",
    },
    row: {
        margin: 5,
        flexDirection: "column",
        backgroundColor: '#FFFFFF',
        flexWrap: "wrap",
        width: (kScreenWidth - 20) / 2,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },
})
