import React, {Component,PureComponent} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image, Platform, DeviceEventEmitter, ImageBackground
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {isNotEmpty, kScreenWidth, mobClick, safeObj, tcpImage, convertImg} from "../../PublicModule/Util/YFWPublicFunction";
import {yfwOrangeColor, yfwGreenColor, yfwRedColor,darkTextColor,darkNomalColor,darkLightColor} from '../../Utils/YFWColor'
import {doAfterLogin, pushNavigation} from "../../Utils/YFWJumpRouting";
import {isEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText'
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWPrestrainCacheManager from '../../Utils/YFWPrestrainCacheManager';
import FastImage from 'react-native-fast-image'
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import DashLine from "../../widget/DashLine";
import LinearGradient from "react-native-linear-gradient";
import YFWNativeManager from '../../Utils/YFWNativeManager';

export default class YFWSubCategoryItemView extends PureComponent {

    static defaultProps = {
        Data: undefined,
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
        if(isNotEmpty(this.props.from) && this.props.from === 'search') {
            return (
                <TouchableOpacity accessibilityLabel={this.props.accessibilityLabel} activeOpacity={1} style={{backgroundColor:'white'}} onPress={()=>isNotEmpty(item.shop_medicine_id)&&item.shop_medicine_id>0&&item.store_title?this.clickItems(item):this.clickMoreStore(item)}>
                    <View style={[BaseStyles.item, {backgroundColor:'white'}]}>
                        <View style={{justifyContent:'center',height:100}}>
                            {this._renderImage(item)}
                        </View>
                        <View style={{flex:1}}>
                            <View style={[BaseStyles.leftCenterView]}>
                                {this._renderTitle(item)}
                            </View>
                            <View style={[BaseStyles.leftCenterView]}>
                                <Text style={[BaseStyles.contentStyle,{fontSize:12,marginTop:3,color:item.isCanSale?(item.standardColor?item.standardColor:darkNomalColor()):darkLightColor()}]}>{item.standard}</Text>
                            </View>
                            <View style={[BaseStyles.leftCenterView]}>
                                <Text style={[BaseStyles.contentStyle,{fontSize:12,marginTop:3,color:item.isCanSale?(item.standardColor?item.standardColor:darkNomalColor()):darkLightColor()}]}>{item.troche_type}</Text>
                            </View>
                            <View style={[BaseStyles.leftCenterView]}>
                                <Text style={[BaseStyles.contentStyle,{fontSize:12,marginTop:3,color:item.isCanSale?darkNomalColor():darkLightColor()}]}>{item.authorized_code}</Text>
                            </View>
                            {isNotEmpty(item.factoryName)?
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{fontSize:12,marginTop:3,color:item.isCanSale?darkNomalColor():darkLightColor()}]}>{item.factoryName}</Text>
                                </View>:<View/>}
                            {this.renderItem()}
                            {this.props.isShopMember?this._renderMemberBottom(item):<View>
                                {this._showPriceView(item)}
                                {this._renderBottom(item)}
                            </View>}
                        </View>
                    </View>
                    <View style={[BaseStyles.separatorStyle,{width:kScreenWidth-13,marginLeft:13,color:'#f5f5f5'}]}/>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity activeOpacity = {1} onPress = {() => this.clickMoreStore(item)}>
                    <View style = {{backgroundColor: 'white'}}>
                        <View style = {[BaseStyles.item, {
                            backgroundColor: 'white',
                            marginTop: 8,
                            paddingBottom: 3
                        }]}>
                            <View style = {{justifyContent: 'center', height: 72}}>
                                {this._renderImage(item)}
                            </View>
                            <View style = {{flex: 1}}>
                                <View style = {[BaseStyles.leftCenterView]}>
                                    {this._renderTitle(item)}

                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{fontSize:12,marginTop:3,color:'#999999'}]}>{item.authorized_code}</Text>
                                </View>
                                {this._showPriceView(item)}
                            </View>
                        </View>
                        <View style = {[BaseStyles.separatorStyle, {
                            width: kScreenWidth - 72 - 16,
                            marginLeft: 72 + 16
                        }]} />
                    </View>
                </TouchableOpacity>
            );
        }
    }

    _renderMemberBottom(item) {
        let shopCount = item.price_quantity ? item.price_quantity : item.store_count;
        let isLogin = YFWUserInfoManager.ShareInstance().hasLogin();
        return (
            <View style={[BaseStyles.leftCenterView,{alignItems:'center',flex:1,justifyContent: "space-between", marginTop:7}]}>
                <View style={{alignItems:'center',flexDirection:'row'}}>
                    <YFWDiscountText navigation={this.props.navigation}  style_view={{marginLeft:10, alignItems:'center'}} style_text={{fontSize:18,fontWeight:'500',color:item.isCanSale?yfwRedColor():darkLightColor()}} from={item.shop_goods_id>0 || isEmpty(shopCount)?'':'YFWSubCategory'}
                                    value={'¥'+toDecimal(isNotEmpty(item.price)?item.price:item.price_min)} discount={item.discount}/>
                    {this._renderDontSale(item)}
                </View>
                {isLogin?<TouchableOpacity activeOpacity={1} onPress={()=>this.addShopCar(item)} style={{marginRight:14,width:25,height:25,bottom:5}}>
                        <Image style = {{width:25,height:25,resizeMode:'contain'}} source={ require('../../../img/compare_cart_circle.png')}/>
                    </TouchableOpacity>:null}
            </View>
        );
    }
    _renderBottom(item) {
        if(this.state.hidePrice) {

        }else {
            return(item.store_title&&isNotEmpty(item.store_title)?
            <View style={{flexDirection: 'row' , justifyContent:'space-between',alignItems:'center', paddingBottom: 10,paddingLeft:10, paddingTop: 2,flex:1}}>
                <Text numberOfLines={1} style={{paddingRight: 10,paddingLeft:2,fontSize:12,color:darkNomalColor(),flex:1}}>{item.store_title}</Text>
                {
                    item.is_hidden_more?null:
                    <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={()=>this.clickMoreStore(item)} hitSlop={{top: 10, bottom: 10, left: 40, right: 10}}>
                        <Text style={{fontSize:12, color:'#1fdb9b', paddingLeft: 10}}>查看更多商家</Text>
                        <Image style={{width:6, height:11, resizeMode:'stretch', marginLeft:2,tintColor:'#1fdb9b', marginRight:10 }} source={require('../../../img/arrow_right.png')}/>
                    </TouchableOpacity>
                }
            </View>:<View style={{height: 8}}/>)
        }
    }

    _renderImage(item) {
        return (
                <FastImage style={{marginLeft:12,height:80, width:80,alignItems:'flex-end'}}
                       source={{uri: item.intro_image?tcpImage(item.intro_image):tcpImage(item.img_url)}}/>
            )
    }

    _renderTitle(item) {
        return <Text style={[BaseStyles.titleStyle,{width:kScreenWidth - 110,color:item.isCanSale?darkTextColor():darkLightColor()}]} numberOfLines={2}>{item.home_search_tcpname}</Text>
    }

    renderItem() {
        let item = this.props.Data
        if(isNotEmpty(item.free_logistics_desc)||isNotEmpty(item.activity_desc)||isNotEmpty(item.coupons_desc)||isNotEmpty(item.scheduled_days)) {
            return (<View>
                <View style = {{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 15,
                    marginLeft: 10,
                    flex: 1,
                    marginTop: 3,
                    right:3
                }}>
                    {this._renderFreeExem()}
                    {this._renderActivity()}
                    {this._renderCoupon()}
                    {this._renderScheduled()}
                </View>
            </View>)
        } else {
            return <View/>
        }
    }


    /*
    *  发货时间
    * */
    _renderScheduled(){
        if(isNotEmpty(this.props.Data?.scheduled_days)){
            return(
                <Text style={{height:15,fontSize:10,color:yfwGreenColor(),borderRadius:4,paddingTop:1,marginLeft:3,
                    paddingBottom:1,borderColor:yfwGreenColor(),borderWidth:0.5,paddingHorizontal:4}}>{this.props.Data.scheduled_days}
                </Text>)
        }
    }
    /*
    *  包邮标签
    * */
    _renderFreeExem(){
        if(isNotEmpty(this.props.Data?.free_logistics_desc)){
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
        if(isNotEmpty(this.props.Data?.activity_desc)){
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
        if(isNotEmpty(this.props.Data?.coupons_desc)){
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
        if(isNotEmpty(this.props.Data?.medicine_package_desc)) {
            return (<View style={{flexDirection:'row',marginLeft:2,marginTop:5,alignItems:'center'}}>
                <Text style={{fontSize:10,color:'#AD7E00',backgroundColor:'#FFF0BF',paddingTop:1,
                    paddingBottom:1,paddingLeft:3,paddingRight:3}}>多件装</Text>
                <Text style={{color:'#999999',fontSize:10,marginLeft:5}}>{this.props.Data?.medicine_package_desc}</Text>
            </View>)
        }
    }
    _showPriceView(item) {
        if (this.state.hidePrice) {
            return(
                <View style={[BaseStyles.leftCenterView,{alignItems:'center',flex:1,justifyContent: "space-between", marginTop:7}]}>
                    <Text style={{color:darkLightColor(), fontSize:13, fontWeight:'500', marginLeft:10}}>仅做信息展示</Text>
                    {this.props.shop_id?null:<Text style={{color:darkLightColor(), fontSize:12, marginRight:13}}>实体店购买</Text>}
                </View>
            )
        }else {
            let shopCount = item.price_quantity??item.store_count;
            return (
                <View style={[BaseStyles.leftCenterView,{alignItems:'center',flex:1,justifyContent: "space-between", marginTop:7}]}>
                    <View style={{alignItems:'center',flexDirection:'row'}}>
                        <YFWDiscountText navigation={this.props.navigation}  style_view={{marginLeft:10, alignItems:'center'}} style_text={{fontSize:18,fontWeight:'500',color:item.isCanSale?yfwRedColor():darkLightColor()}} from={item.shop_goods_id>0 || isEmpty(shopCount)?'':'YFWSubCategory'}
                                        value={'¥'+toDecimal(isNotEmpty(item.price)?item.price:item.price_min)} discount={item.discount}/>
                        {this._renderDontSale(item)}
                    </View>
                    {this._renderPriceRight(item)}
                </View>
            );
        }
    }

    /** 暂不销售标签 */
    _renderDontSale(item) {
        if(item.isCanSale){
            return <View/>
        }else {
            return(
                <View style={{height:14,paddingHorizontal:6,justifyContent:'center',alignItems:'center',borderRadius:7,backgroundColor:'#ccc',marginLeft:4}}>
                    <Text style={{color:'#fff',fontSize:10}}>暂不销售</Text>
                </View>
            )
        }
    }

    _renderPriceRight(item){
        let shopCount = item.price_quantity ? item.price_quantity : item.store_count;
        let showDisCount = item.discount && item.discount.length > 0;
        let userInfo = YFWUserInfoManager.ShareInstance();
        let isLogin = userInfo.hasLogin();
        if(isNotEmpty(this.props.from) && this.props.from === 'search'){
            if(isLogin && item.shop_goods_id>0 && item.store_title){
                return (
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.addShopCar(item)} style={{marginRight:14,width:25,height:25,bottom:12}}>
                        <Image style = {{width:25,height:25,resizeMode:'contain'}} source={ require('../../../img/compare_cart_circle.png')}/>
                    </TouchableOpacity>
                )
            } else {
                if(item.store_title&&isNotEmpty(item.store_title)){
                    return <View/>
                } else {
                    if(item.isCanSale) {
                        if(this.props.isStandardType) {
                            return (<View></View>)
                        }
                        return (
                            isNotEmpty(shopCount) && parseInt(safeObj(shopCount)) >= 0 ?
                                <Text style={[BaseStyles.contentWordStyle,{marginRight:12,fontSize:12}]}>
                                    <Text style={{color:yfwGreenColor()}}>{shopCount}</Text>{'个商家在售'}
                                </Text>:
                                <View />
                        )
                    }else {
                        return <Text style={[BaseStyles.contentWordStyle,{marginRight:12,fontSize:12}]}>实体店购买</Text>
                    }

                }
            }
        } else {
            return (
                parseInt(safeObj(shopCount)) > 0 ?
                    <Text style={[BaseStyles.contentWordStyle,{marginRight:12,fontSize:12}]}>
                        <Text style={{color:yfwGreenColor()}}>{shopCount}</Text>{'个商家在售'}
                    </Text>:
                    <View />
            )
        }
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

        if (isNotEmpty(this.props.from) && safeObj(this.props.from).from == 'search') {
            mobClick('search-result-click');
        }

        const {navigate} = this.props.navigation;
        if (isEmpty(this.props.shop_id)) {
            let shopId = this.props.Data?.goods_id??this.props.Data?.medicine_id??this.props.Data?.id;
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
            if(isNotEmpty(goodsID)){
                pushNavigation(navigate, {type: 'get_shop_goods_detail', value:goodsID ,img_url:item.intro_image?convertImg(item.intro_image):convertImg(item.img_url)})
            }
        }

    }


}
