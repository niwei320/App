import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image, Platform, DeviceEventEmitter, ScrollView, ImageBackground
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {
    kScreenWidth,
    isEmpty,
    isNotEmpty,
    mobClick,
    tcpImage,
    safeObj,
    convertImg,
    checkNotLoginIsHiddenPrice, safe
} from "../../PublicModule/Util/YFWPublicFunction";
import {
    backGroundColor,
    darkNomalColor,
    yfwGreenColor,
    darkTextColor,
    darkLightColor, yfwRedColor,yfwOrangeColor
} from '../../Utils/YFWColor'
import {doAfterLogin, pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWDiscountText from "../../PublicModule/Widge/YFWDiscountText";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWPrestrainCacheManager from '../../Utils/YFWPrestrainCacheManager';
import FastImage from 'react-native-fast-image'
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import DashLine from "../../widget/DashLine";
import LinearGradient from "react-native-linear-gradient";
import YFWNativeManager from '../../Utils/YFWNativeManager';

export default class YFWSubCategoryCollectionItemView extends Component {

    static defaultProps = {
        Data:undefined,
    }

    constructor(props) {
        super(props)

        this.state = {
            hidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice()
        }
    }

    componentDidMount() {
        this.priceListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            this.setState({
                hidePrice: isHide
            })
        })
    }

    componentWillUnmount() {
        this.priceListener&&this.priceListener.remove()
    }

    render() {

        let item = this.props.Data;
        let uneven = false;
        if (item.index % 2 == 0 ){
            uneven = true;
        }

        if(isNotEmpty(this.props.from) && this.props.from === 'search'){
            return (
                <View accessibilityLabel={this.props.accessibilityLabel} style={[BaseStyles.centerItem,{backgroundColor: 'white',flex:1}]} >
                    <TouchableOpacity activeOpacity={1} style={{flex:1}}
                                      onPress={()=>isNotEmpty(item.shop_medicine_id)&&item.shop_medicine_id>0&&item.store_title?this.clickItems(item):this.clickMoreStore(item)}
                                      onLongPress={()=>{if (this.props.onLongPress)this.props.onLongPress()}}>
                        <View style={[BaseStyles.centerItem,BaseStyles.radiusShadow,{alignItems:'flex-start',width:(kScreenWidth-34)/2,backgroundColor:'white', marginVertical:5,marginHorizontal: 4.5, padding:8}]}>
                            {this._renderImage(item)}
                            <View style={{alignItems:'flex-start'}}>
                                {this._renderName(item)}
                                <Text style={{fontSize:12,height:18,paddingTop:3,color:item.isCanSale?(item.standardColor?item.standardColor:darkNomalColor()):darkLightColor()}}>{item.standard}</Text>
                                <Text style={{fontSize:12,height:18,paddingTop:3,color:item.isCanSale?'#666666':darkLightColor()}}>{item.troche_type}</Text>
                                {isNotEmpty(item.factoryName)?<Text style={{fontSize:12,height:18,paddingTop:3,color:item.isCanSale?'#666666':darkLightColor()}} numberOfLines={1} ellipsizeMode={'tail'}>{item.factoryName}</Text>:<View/>}
                                {this.renderItem()}
                                {this.props.isShopMember?this._renderMemberBottom(item):this._renderBottom(item)}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

            );
        } else {
            return (
                <View style={[BaseStyles.centerItem,{backgroundColor: backGroundColor()}]} >
                    <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>this.clickMoreStore(item)} onLongPress={()=>{if (this.props.onLongPress)this.props.onLongPress()}}>
                        <View style={[BaseStyles.centerItem,BaseStyles.radiusShadow,{width:(kScreenWidth-33)/2,backgroundColor:'white',
                            marginTop:5,marginBottom:5,marginLeft:uneven?4:4.5,marginRight:uneven?4.5:4.5, padding:8}]}>
                            {this._renderImage(item)}
                            <View style={{alignItems:'flex-start'}}>
                                {this._renderName(item)}
                                {this._renderAuthorized(item)}
                                {this._renderShopBottom(item)}
                                {item.type == 'get_shop_goods_detail'?this.renderItem():<View/>}
                                {item.type == 'get_shop_goods_detail'?this.renderStoreName(item):<View/>}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    _renderShopBottom(item) {
        let exraInfo = item.type != 'get_shop_goods_detail'?'起':''
        let isLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        let notLoginIsHiddenPrice = checkNotLoginIsHiddenPrice()
        if (this.state.hidePrice) {
            return(
                <View style={{justifyContent: "space-between", marginVertical:5,height:40,marginHorizontal:3}}>
                    <Text style={{color:darkLightColor(), fontSize:13, fontWeight:'500',marginTop:5}}>仅做信息展示</Text>
                    <Text style={{color:darkLightColor(), fontSize:12, marginRight:13}}>实体店购买</Text>
                </View>
            )
        } if (!isLogin && notLoginIsHiddenPrice&&item.type == 'get_shop_goods_detail') {
            return (
                <TouchableOpacity activeOpacity={1} onPress={()=>this.doAfterLogin()}>
                    <Text style={{fontSize: 12,color:yfwOrangeColor(),textAlign: 'left',}}>{"价格登录可见"}</Text>
                </TouchableOpacity>
            )
        } else {
            return(
                <View>
                    <View style={{flexWrap:'wrap', flexDirection:'row'}}>
                        <YFWDiscountText navigation={this.props.navigation}  style_view={{marginTop:0,marginLeft:3}} style_text={{fontSize:16,fontWeight:'500'}} value={'¥'+toDecimal(item.price)+exraInfo} discount={item.price_desc} from={''}/>
                    </View>
                    {this._showShopInfoView(item)}
                </View>
            )
        }
    }

    /**
     * 联会会员加入购物车
     * @param  item
     */
    _renderMemberBottom(item) {
        let shopCount = item.price_quantity ??item.store_count;
        let userInfo = YFWUserInfoManager.ShareInstance();
        let isLogin = userInfo.hasLogin()
        let showShopCar = isLogin
        return(
            <View  style={{width:(kScreenWidth-34)/2-16, height:30,flexDirection: 'row', justifyContent:'space-between', alignItems:'center', marginVertical: 3}}>
                <YFWDiscountText navigation={this.props.navigation}  style_view={{width:showShopCar?(kScreenWidth-34)/2-16-30:(kScreenWidth-34)/2-16,marginTop:0}} style_text={{fontSize:17, fontWeight:'500',color:item.isCanSale?yfwRedColor():darkLightColor()}} value={'¥'+toDecimal(isNotEmpty(item.price)?item.price:item.price_min)} discount={item.discount}  from={item.shop_goods_id>0 || isEmpty(shopCount)?'':'YFWSubCategory'}/>
                {/*如果为登录不显示购物车按钮*/}
                {showShopCar?
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.addShopCar(item)} style={[BaseStyles.centerItem,{width:30,height:30}]}>
                        <Image style = {{width:25,height:25,resizeMode:'contain'}} source={ require('../../../img/compare_cart_circle.png')}/>
                    </TouchableOpacity>:
                    <View/>
                }
            </View>
        )
    }

    _renderBottom(item) {
        if (this.state.hidePrice) {
            return(
                <View style={{justifyContent: "space-between", marginVertical:5,height:this.props.shop_id?25:this.props.isStandardType?30:40}}>
                    <Text style={{color:darkLightColor(), fontSize:13, fontWeight:'500',marginTop:5}}>仅做信息展示</Text>
                    {!this.props.shop_id?<Text style={{color:darkLightColor(), fontSize:12, marginRight:13}}>实体店购买</Text>:null}
                </View>
            )
        }else {
            let shopCount = item.price_quantity ? item.price_quantity : item.store_count;
            let userInfo = YFWUserInfoManager.ShareInstance();
            let isLogin = userInfo.hasLogin()
            let showShopCar = isLogin && item.shop_goods_id>0&&item.store_title
            return(
                <View>
                    <View  style={{width:(kScreenWidth-34)/2-16, height:30,flexDirection: 'row', justifyContent:'space-between', alignItems:'center', marginVertical: 3}}>
                        <YFWDiscountText navigation={this.props.navigation}  style_view={{width:showShopCar?(kScreenWidth-34)/2-16-30:(kScreenWidth-34)/2-16,marginTop:0}} style_text={{fontSize:17, fontWeight:'500',color:item.isCanSale?yfwRedColor():darkLightColor()}} value={'¥'+toDecimal(isNotEmpty(item.price)?item.price:item.price_min)} discount={item.discount}  from={item.shop_goods_id>0 || isEmpty(shopCount)?'':'YFWSubCategory'}/>
                        {/*如果为登录不显示购物车按钮*/}
                        {showShopCar?
                            <TouchableOpacity activeOpacity={1} onPress={()=>this.addShopCar(item)} style={[BaseStyles.centerItem,{width:30,height:30}]}>
                                <Image style = {{width:25,height:25,resizeMode:'contain'}} source={ require('../../../img/compare_cart_circle.png')}/>
                            </TouchableOpacity>:
                            <View/>
                        }
                    </View>
                    {isEmpty(item.store_title)?
                        (isNotEmpty(shopCount) && parseInt(safeObj(shopCount)) >= 0 ?
                            item.isCanSale ?
                            (this.props.isStandardType?
                                <View/>:
                                <Text style={[BaseStyles.contentWordStyle,{marginRight:12,fontSize:12, height:15}]}>
                                    <Text style={{color:yfwGreenColor()}}>{shopCount}</Text>{'个商家在售'}
                                </Text>
                            )
                            :
                            <Text style={[BaseStyles.contentWordStyle,{marginRight:12,fontSize:12, height:15}]}>实体店购买</Text>:<View/>) :
                        <View style={{width:(kScreenWidth-34)/2-16, height:17, paddingBottom:2, flexDirection:'row', justifyContent:'space-between',alignItems:'center'}}>
                            <Text numberOfLines={1} style={{flex:1, fontSize:12, color:darkNomalColor()}}>{item.store_title}</Text>
                            {
                                item.is_hidden_more?null:
                                <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={()=>this.clickMoreStore(item)} hitSlop={{top: 0, bottom: 10, left: 10, right: 10}}>
                                    <Text style={{fontSize:12, color:'#1fdb9b'}}>更多</Text>
                                    <Image style={{width:6, height:11, resizeMode:'stretch', marginLeft:2,tintColor:'#1fdb9b'}} source={require('../../../img/arrow_right.png')}/>
                                </TouchableOpacity>
                            }

                        </View>
                    }
                </View>
            )
        }
    }

    _renderName(item){
        let textViewSize = (kScreenWidth-34)/2-16;
        if(isNotEmpty(this.props.from) && this.props.from === 'search'){
            return (
                <View style={{height:36, marginTop:10, justifyContent:'center'}}>
                    <Text style={[BaseStyles.titleStyle,{marginTop:0,fontSize: 15,marginLeft:0,flex:1,textAlign:'left',color:item.isCanSale?darkTextColor():darkLightColor(),lineHeight:17}]} numberOfLines={2} >{item.home_search_tcpname}</Text>
                </View>
            )
        }
        if(isEmpty(this.props.shop_id)){
            return (
                <Text style={[BaseStyles.titleStyle,{marginLeft:3,fontSize: 15,width:textViewSize,textAlign:'left',color:darkTextColor(),lineHeight:17}]} numberOfLines={2} >{item.home_category_tcpname}</Text>)
        }else {
            return (
                <Text style={[BaseStyles.titleStyle,{marginLeft:3,width:textViewSize,textAlign:'left',color:darkTextColor(),lineHeight:17}]} numberOfLines={2} >{item.inshop_search_tcpname}</Text>)
        }

    }


    _renderImage(item){
        let imgSize = (kScreenWidth-34)/2-(kScreenWidth-34)/10;
        return (
                <FastImage style={{height:imgSize,width:imgSize}}
                           source={{uri:item.intro_image?tcpImage(item.intro_image):tcpImage(item.img_url)}}/>
        )

    }


    _renderAuthorized(item){
        if(isEmpty(item.standard)){
            return(<View/>)
        } else {
            return(
                <View style={[BaseStyles.leftCenterView]}>
                    <Text style={{marginTop:2,marginLeft:3,fontSize: 12,color:darkLightColor(), height:18}} numberOfLines={1}>{item.standard}</Text>
                </View>
            )
        }

    }
    _showShopInfoView(item){

        if (isEmpty(this.props.shop_id)) {
            let count =  item.price_quantity??item.store_count

            if(isEmpty(count) || item.type == 'get_shop_goods_detail'){
                return <View />
            }

            return (
                    <Text style={[BaseStyles.contentStyle, {color:darkLightColor(),marginLeft: 5,fontSize:12,marginTop:0, marginBottom:0}]}>
                        <Text style={{color:yfwGreenColor()}}>{item.price_quantity?item.price_quantity:item.store_count}</Text>
                        {'个商家在售'}
                    </Text>
            );

        }

    }
    renderItem() {
        let item = this.props.Data
        let isFromHomePage = isNotEmpty(this.props.from) && this.props.from === 'home'
        if((isFromHomePage && item.Isfreepostage == true)||isNotEmpty(item.free_logistics_desc)||isNotEmpty(item.activity_desc)||isNotEmpty(item.coupons_desc)||isNotEmpty(item.scheduled_days)){
            return(
                <View style={[{width:(kScreenWidth-34)/2-16,height:18,paddingTop:3}]}>
                    <ScrollView horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                alwaysBounceHorizontal={true}>
                        <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',right:3}}>
                            {/*{isFromHomePage?this.renderFreepostage():<View />}*/}
                            {this._renderFreeExem()}
                            {this._renderActivity()}
                            {this._renderCoupon()}
                            {this._renderScheduled()}
                        </View>
                    </ScrollView>
                </View>
            )
        } else {
            return <View/>
        }

    }


    /*
   *  发货时间
   * */
    _renderScheduled(){
        if(isNotEmpty(safeObj(this.props.Data).scheduled_days)){
            return(
                <Text style={{height:15,fontSize:10,color:yfwGreenColor(),borderRadius:4,paddingTop:1,marginLeft:3,
                    paddingBottom:1,borderColor:yfwGreenColor(),borderWidth:0.5,paddingHorizontal:4}}>{this.props.Data.scheduled_days}
                </Text>)
        }
    }
    /*
    *  包邮活动标签
    * */
    _renderFreeExem(){
        if(isNotEmpty(safeObj(this.props.Data).free_logistics_desc)){
            let colors = ['rgb(255,72,0)','rgb(250,110,96)']
            return(
                <LinearGradient colors={colors}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                locations={[0,1]}
                                style={{height: 15,borderRadius:3,justifyContent:'center',alignItems:'center', paddingHorizontal:3,marginLeft:3}}>
                    <Text style={{fontSize:10,color:'white'}}>{this.props.Data.free_logistics_desc}</Text>
                </LinearGradient>
            )
        }
    }

    /*
    *  活动
    * */
    _renderActivity(){
        if(isNotEmpty(safeObj(this.props.Data).activity_desc)){
            return(
                <ImageBackground source={require('../../../img/sx_ticket.png')} style={{height:15, alignItems:'center', justifyContent:'center',marginLeft:3,paddingHorizontal:4}} imageStyle={{resizeMode:'stretch'}}>
                    <Text style={{fontSize:10,color:yfwRedColor(),textAlignVertical:'center', includeFontPadding:false}}>{this.props.Data.activity_desc}</Text>
                </ImageBackground>)
        }
    }

    /*
    *  优惠券
    * */
    _renderCoupon(){
        if(isNotEmpty(safeObj(this.props.Data).coupons_desc)){
            return(
                <ImageBackground source={require('../../../img/sx_ticket.png')} style={{height:15, alignItems:'center', justifyContent:'center',marginLeft:3,paddingHorizontal:2}} imageStyle={{resizeMode:'stretch'}}>
                    <Text style={{fontSize:10,color:yfwRedColor(),textAlignVertical:'center', includeFontPadding:false}}>{this.props.Data.coupons_desc}</Text>
                </ImageBackground>)
        }
    }

    /*
    *  多件转
    * */
    renderMedicinePackage(){
        if(isNotEmpty(safeObj(this.props.Data).medicine_package_desc)) {
            return (<View style={{flexDirection:'row',marginLeft:2,marginTop:5,alignItems:'center'}}>
                <Text style={{fontSize:10,color:'#AD7E00',backgroundColor:'#FFF0BF',paddingTop:1,
                    paddingBottom:1,paddingLeft:3,paddingRight:3}}>多件装</Text>
                <Text style={{color:'#999999',fontSize:10,marginLeft:5}}>{this.props.Data.medicine_package_desc}</Text>
            </View>)
        }
    }

    /*
     * 是否包邮标签
     */
    renderFreepostage(){
        if (safeObj(this.props.Data).Isfreepostage == true) {
            return (
                <View style={{marginLeft:3,height:12,borderRadius:6,borderColor:'#1fdb9b',borderWidth:0.5,justifyContent:'center',alignItems:"center"}}>
                    <Text style={{fontSize:10,color:'#1fdb9b',paddingHorizontal:2}}>{'包邮'}</Text>
                </View>
            )
        }
    }

    renderStoreName(item) {
        if(isNotEmpty(item.title)){
            return <Text numberOfLines={1} style={{marginTop:3, height:18, fontSize:12, color:darkNomalColor()}}>{item.title}</Text>
        } else {
            return <View/>
        }
    }
    doAfterLogin(){
        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{});
    }

    addShopCar(item){
        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{
            this._addShopCar(item)
            // YFWNativeManager.mobClick('price page-add cart')
        });
    }

    _addShopCar(item) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.addCart');
        paramMap.set('quantity', 1);
        paramMap.set('storeMedicineId', this.props.isShopMember?item.medicine_id:item.shop_goods_id);
        YFWUserInfoManager.ShareInstance().addCarIds.set(this.props.isShopMember?item.medicine_id:item.shop_goods_id+'','id')
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('商品添加成功');
            DeviceEventEmitter.emit("SHOPCAR_INFO_CHANGE",item.shop_id)//通知购物车 该商家商品发生变化  刷新凑单数据
            this.getCarNumber();
        }, (error) => {
        });
    }

    async getCarNumber() {
        if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.getCartCount');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.dealCarNumber(res)
        }, (error) => {
            let e = error
        }, false);
    }

    dealCarNumber=(res)=>{
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        new YFWUserInfoManager().carNumber = safeObj(res.result).cartCount
        DeviceEventEmitter.emit('SHOPCAR_NUMTIPS_RED_POINT', safeObj(res.result).cartCount);
    }

    clickItems(item) {
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {
            type: 'get_shop_goods_detail',
            value: item.shop_goods_id,
            img_url:convertImg(item.img_url),
            goodsInfo:this.goodsInfoOriginData,
            price:item.price,
        });

    }
    clickMoreStore(item){

        if (isNotEmpty(this.props.from) && this.props.from.from == 'search'){
            mobClick('search-result-click');
        }

        const { navigate } = this.props.navigation;
        if (this.props.from == 'home') {
            item.value = item.id
            pushNavigation(navigate, item);
            return
        }
        if (isEmpty(this.props.shop_id)) {
            let shopId = this.props.Data?.goods_id ?? this.props.Data?.medicine_id ?? this.props.Data?.id;
            let cachedData = YFWPrestrainCacheManager.sharedManager().getCachedInfoWithKey(shopId)
            if (!cachedData) {
                cachedData = {}
            }
            pushNavigation(navigate, {
                type: 'get_goods_detail',
                value: shopId,
                cachedGoodsInfo:cachedData.goodsInfo,
                cachedShopGoodsInfo:cachedData.shopListInfo,
                goodsInfo:item.originData,
                price_quantity:item.price_quantity
            });

        } else {
            let goodsID = this.props.Data?.shop_goods_id??this.props.Data?.medicine_id

            pushNavigation(navigate, {type: 'get_shop_goods_detail', value: goodsID,img_url:convertImg(item.img_url)})

        }
    }


}
