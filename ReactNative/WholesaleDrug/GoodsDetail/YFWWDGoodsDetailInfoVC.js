import React, {Component} from 'react';
import {
    Animated,
    DeviceEventEmitter,
    Dimensions,
    Easing,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    PixelRatio,
    View
} from 'react-native';

import YFWToast from '../../Utils/YFWToast'
import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwGreenColor,
    yfwOrangeColor
} from '../../Utils/YFWColor'
import {
    isEmpty,
    isNotEmpty,
    itemAddKey,
    kScreenWidth,
    safeObj,
    safe,
    tcpImage,
    checkAuditStatus,coverAuthorizedTitle
} from "../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWQualificationView from "../../widget/YFWQualificationView";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {getItem, setItem} from "../../Utils/YFWStorage";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_SINGLE,
    TYPE_OTC
} from "../../widget/YFWPrescribedGoodsTitle";
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText';
import LinearGradient from 'react-native-linear-gradient';
import YFWWDSellsDataView from '../Widget/YFWWDSellsDataView';
import { YFWImageConst } from '../Images/YFWImageConst';
import { pushWDNavigation, doAfterLogin,kRoute_shop_goods_detail, kRoute_shop_detail, kRoute_shop_detail_list, kRoute_apply_account, kRoute_html } from '../YFWWDJumpRouting';
import YFWWDGoodsScrollListView from './View/YFWWDGoodsScrollListView';
import YFWWDGoodsDetailInfoBarnerView from './View/YFWWDGoodsDetailInfoBarnerView';
import YFWWDShopDetailRecommendModel from './Model/YFWWDShopDetailRecommendModel';

const width = Dimensions.get('window').width;

export default class YFWWDGoodsDetailInfoVC extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            couponArray:[],
            goods_reserve:0,
            quantity:1,
            fadeOutOpacity: new Animated.Value(0),
            shopRecommendArray:[],
            hidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice()
        };
        //获取是否第一次进入商品详情
        getItem('isFirstInGoodsDetail').then((isFirst)=>{
            this.setState({
                isFirst:isNotEmpty(isFirst)?isFirst:false
            })
        })
    }

    componentWillReceiveProps(){
        if (isNotEmpty(this.props.data.shop_id) && this.firstRequest != true){
            this.firstRequest = true
            this._requestCouponMethod();
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

        let scheduled_time = this.props.scheduled_name?this.props.scheduled_name:this.props.data.shipping_time
        let dataReferenceWholesale = safeObj(this.props.data.dataReferenceWholesale)
        return (
            <View style={{ flex:1 , backgroundColor:backGroundColor()}}>
                <View style={{ flex:1}}>
                    <View style={styles.item} height={240}>
                        <YFWWDGoodsDetailInfoBarnerView imagesData={this.props.data.img_url} getNavigation={()=>{return this.props.navigation}}/>
                    </View>
                    <View style={{height:36,backgroundColor:'#fafafa',flexDirection:'row',alignItems:'center'}}>
                        <View style={{marginLeft:15,flexDirection:'row',alignItems:'center'}}>
                            <Image style={{width:16,height:16}} source={require('../../../img/sx_icon_baozhang.png')}></Image>
                            <Text style={{color:darkTextColor(),fontSize:12,marginLeft:4,fontWeight:'500'}}>{scheduled_time}</Text>
                        </View>
                        <View style={{marginLeft:15,flexDirection:'row',alignItems:'center'}}>
                            <Image style={{width:16,height:16}} source={require('../../../img/sx_icon_baozhang.png')}></Image>
                            <Text style={{color:darkTextColor(),fontSize:12,marginLeft:4,fontWeight:'500'}}>{'品质保障'}</Text>
                        </View>
                        <View style={{marginLeft:15,flexDirection:'row',alignItems:'center'}}>
                            <Image style={{width:16,height:16}} source={require('../../../img/sx_icon_baozhang.png')}></Image>
                            <Text style={{color:darkTextColor(),fontSize:12,marginLeft:4,fontWeight:'500'}}>{'提供发票'}</Text>
                        </View>
                    </View>
                    <View style={{backgroundColor:'white'}}>
                        {this.renderPrice()}
                        {this.renderDiscountView()}
                        <View style={{width:width,flexDirection:'row',paddingLeft:15,paddingRight:15,marginTop:10}}>
                            {/*返回标题*/}
                            <View style={{flex:1}}>
                                {this.renderTitle()}
                            </View>
                            {/*分享赚现金图标*/}
                            {/* {this.renderSharedGetMoeny()} */}
                        </View>
                        {/* {this.renderPrescribedTips()} */}
                        {this.renderGoodsTypeInfo()}
                        {/* {this.renderApplicability()} */}
                        {/* {this.renderDrugTip()} */}
                        <View style={{backgroundColor:'#fafafa',height:10,width:kScreenWidth}}/>
                    </View>
                    <View style={{height:50,backgroundColor:'white'}}>
                        <View style={[styles.item,{justifyContent:'flex-start',height:50}]}>
                            <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                                <Text style={{color:darkLightColor(),fontSize:13,marginLeft:12}}>运费</Text>
                                <Text style={{color:darkTextColor(),fontSize:13,marginLeft:23}}>{this.getShippingPrice()}</Text>
                                <View style={{height:12,width:1,backgroundColor:'#ccc',marginLeft:17}}/>
                                <Text style={{color:darkTextColor(),fontSize:13,marginLeft:19}}>{this.props.data.store_address}</Text>
                                <Image style={{marginLeft:9,width:14,height:13}} source={require('../../../img/icon_fly.png')}/>
                                <Text style={{marginLeft:9,color:darkTextColor(),fontSize:13}}>{YFWUserInfoManager.ShareInstance().getCity()}</Text>
                            </View>
                        </View>
                    </View>
                    {this.renderMaxBuy()}
                    {this.renderSendInfo()}
                    {/* <View style={{backgroundColor:'white',flexDirection:'row',paddingTop:18}}>
                        <View style={{width:60}}>
                            <Text style={{marginLeft:13,color:'#999',fontSize:14}}>{'参数'}</Text>
                        </View>
                        <View style={{flex:1}}>
                            {this._renderKeyValueText(this.props.data.authorizedCode_title+'    ',this.props.data.authorized_code)}
                            {this._renderKeyValueText('规     格      ',this.props.data.Standard)}
                            {this._renderKeyValueText('剂型/型号   ',this.props.data.troche_type)}
                            {this._renderKeyValueText('生产企业    ',this.props.data.short_title)}
                            {this._renderBentrustedName()}
                            {this._renderTermOfValidity()}
                            {this.renderVacationTips(safeObj(this.props.data).warning_tip)}
                            {this.renderVacationTips(safeObj(this.props.data).vacation)}
                            {this.renderMedicationPrompt()}
                        </View>
                    </View> */}
                    <View style={{backgroundColor:'#fafafa',height:10,width:kScreenWidth}}/>
                    <YFWWDSellsDataView
                        infos={
                            [
                                { title: '零售商家', value: safe(dataReferenceWholesale.store_num )+ '家' },
                                { title: '近期销量', value: dataReferenceWholesale.sale_count },
                                { title: '我的进价', value: (isEmpty(dataReferenceWholesale.receive_price) || dataReferenceWholesale.receive_price == 0)?'---':dataReferenceWholesale.receive_price + "元" },
                            ]
                        }
                        showFlag={this.props.data.isshowrefer}
                        Data={dataReferenceWholesale}
                        ref={(item) => this.menu = item}
                        navigation={this.props.navigation}
                    />
                    {this.renderView()}
                    <View style={{backgroundColor:'white',marginTop:10,paddingTop:16}}>
                        <View style={[styles.item,{justifyContent:'center',alignItems:'flex-start',height:50}]}>
                            <View style={{flex:1,marginLeft:11,marginRight:10,justifyContent:'space-between'}}>
                                <Text numberOfLines={1} style={{color:darkTextColor(),fontSize:15,fontWeight:'500' }}>{this.props.data.shop_title}</Text>
                                <View style={{height:15,marginTop:4,flexDirection:'row',alignItems:'center'}}>
                                    {this.renderAccountInfo(safeObj(this.props.data).dict_bool_papermap)}
                                    {this.renderShopTextView(safeObj(this.props.data).shop_open_year)}
                                    {this.renderShopTextView(safeObj(this.props.data).shop_medicine_count)}
                                </View>
                            </View>
                            {this.renderContracted()}
                        </View>
                        {this.renderRecommendShopGoods()}
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingBottom:23}}>
                            <TouchableOpacity activeOpacity={1}  onPress={()=>this._toshopAllGoods()}>
                                <ImageBackground style={[styles.shopBtn,{marginLeft:28}]} imageStyle={{resizeMode:'stretch'}} source={YFWImageConst.Icon_shop_kuang}>
                                    <Image style={[styles.smallIcon,{tintColor:'#547cff'}]} source={require('../../../img/sx_icon_all.png')}/>
                                    <Text style={{color:'#547cff',fontSize:15,marginLeft:10,fontWeight:'500'}}>{'全部商品'}</Text>
                                </ImageBackground>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1}  onPress={()=>this._toshopDetail()}>
                                <LinearGradient colors={['rgb(82,66,255)','rgb(84,124,255)']}
                                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                        locations={[0,1]}
                                        style={[styles.shopBtn,{marginRight:28}]}>
                                            <Image style={styles.smallIcon} source={require('../../../img/sx_icon_dianpu.png')}/>
                                            <Text style={{color:'#fff',fontSize:15,marginLeft:10,fontWeight:'500'}}>{'进入店铺'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </View>
                    <View style={{backgroundColor:'white'}} onLayout={(e)=>{
                        this.props.commitViewLayout&&this.props.commitViewLayout(e)
                    }}>
                    </View>
                    <View style={{flex:1,height:10}}></View>
                </View>
                <YFWQualificationView
                    ref = { ref_input => (this.ref_qualificationView = ref_input)}
                    dismiss={()=>{this.props.dismissLayer&&this.props.dismissLayer()}}
                    navigation = {this.props.navigation}
                />
                {this.renderSharedSurprisesTips()}
            </View>
        );
    }


    renderAccountInfo(info) {
        if (info == 0) {
            return (
                <LinearGradient colors={['rgb(82,66,255)', 'rgb(84,124,255)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    locations={[0, 1]}
                    style={{ height: 12, borderRadius: 3, marginLeft: 3, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: 'white', paddingHorizontal: 5 }}>{'电子开户'}</Text>
                </LinearGradient>
            )
        } else {
            return null
        }
    }

    renderShopTextView(title) {
        if (isEmpty(title)) {
            return null
        }
        return (<Text style={{color:'#333',fontSize:12,marginLeft:10}}>{title}</Text>)
    }


    /**
     * 商家商品推荐
     */
    renderRecommendShopGoods(){
        let dataArray = []
        this.state.shopRecommendArray.map((item)=>{
            item.type = kRoute_shop_goods_detail
            item.id = item.medicine_id
            item.img_url = tcpImage(item.intro_image)
            dataArray.push(item)
        })
        if (dataArray.length == 0) {
            return null
        } else {
            return (
                <View style={{minHeight:130,marginTop:10,marginBottom:18}}>
                    <YFWWDGoodsScrollListView Data={dataArray} navigation={this.props.navigation}></YFWWDGoodsScrollListView>
                </View>
            )
        }
    }
    /**
     * 上市许可人
     */
    _renderBentrustedName(){
        if(isNotEmpty(this.props.data.bentrusted_store_name)){
            return(
                <View style={{flexDirection:'row', width:Dimensions.get('window').width-140,paddingBottom: 5}}>
                    <Text style={{color:'#666', fontSize:13}}>
                        {this.props.data.name_path && this.props.data.name_path.indexOf('保健') === -1? '上市许可人 ':'委托企业 '}
                    </Text>
                    <Text style={{color:'#333', fontSize:13}}>{this.props.data.bentrusted_store_name}</Text>
                </View>
            )
        }else {
            return(<View/>)
        }
    }

    /*
     * 有效期
     * */
    _renderTermOfValidity(){
        if(isNotEmpty(this.props.data.period_info) && !this.state.hidePrice){
            return this._renderKeyValueText('有 效 期      ',this.props.data.period_info)
        }else {
            return(<View/>)
        }
    }

    _renderKeyValueText(keyStr,valueStr) {
        return(
            <View style={{flexDirection:'row',}}>
                <Text style={[styles.textStyle,styles.grayText,{flex:null}]}>{keyStr}</Text>
                <Text style={[styles.textStyle,{color:darkTextColor()},{height:null,marginRight:12,marginBottom:2}]}>{valueStr}</Text>
            </View>
        )
    }

    renderGoodsTypeInfo() {
        return ( <Text style={{marginLeft:15,fontSize:14,color:'#333',marginTop:8,marginBottom:15}}>{'          '+this.props.data.Standard+'  '+this.props.data.troche_type}</Text>)
    }

    /**
     * 返回适应症
     */
    renderApplicability(){
        if(isEmpty(safeObj(this.props.data).applicability)){
            return <View />
        }
        return (
            <Text style={[styles.textStyle,{height:null,marginLeft:13,marginRight:16,marginTop:16,fontSize:12,lineHeight:18,color:'#333'}]} numberOfLines={3}>{safeObj(this.props.data.applicability).replace(/<[^>]+>/g,"").replace(/(↵|\r|\n)/g,"").trim()}</Text>
        )
    }

    renderDrugTip(){
        let tip = ''
        if(safeObj(this.props.data).PrescriptionType+"" === "1"){
            tip = '单轨制处方药指凭医师处方购买和使用的药品'
        } else if(safeObj(this.props.data).PrescriptionType+"" === "2"){
            tip = '双轨制处方药指凭医师处方或在药师指导下购买和使用的药品'
        }
        if (tip.length > 0) {
            return (
                <TouchableOpacity onPress={()=>{this.showPrescribedTips()}} activeOpacity={1}>
                    <Text style={{color:'#999',fontSize:12,marginHorizontal:12,marginTop:14,marginBottom:20}} numberOfLines={2}>{tip}
                        <Image style={{width:12,height:12,resizeMode:'contain',marginLeft:8,marginBottom:-2}} source={require('../../../img/wenhao.png')}/>
                    </Text>
                </TouchableOpacity>
            )
        } else {
            return (<View style={{height:20}}></View>)
        }
    }

    /**
     * 返回处方药提示
     */
    renderPrescribedTips(){
        //暂时只有Http有，后面去掉这个判断
        if(isNotEmpty(safeObj(this.props.data).prompt_info)){
            return (
                <TouchableOpacity activeOpacity={1} style={{backgroundColor:'#f9f9f9',paddingLeft:15,paddingRight:15,paddingTop:10,paddingBottom:10}}>
                    <Text style={{color:darkLightColor(),fontSize:14}}>{safeObj(this.props.data).prompt_info}</Text>
                </TouchableOpacity>
            )
        }
    }

    /*
    *  满减专题
    * */
    renderSeminarIcon(){//4.0.00版本先不要显示--夏超
        if(isNotEmpty(safeObj(this.props.data).st_ads_items)&& this.props.data.st_ads_items.length>0){
            let imageWidth = isNaN(parseInt(safeObj(this.props.data.st_ads_items[0].img_width).replace('px',''))/2)?0:parseInt(safeObj(this.props.data.st_ads_items[0].img_width).replace('px',''))/2;
            let imageHeight = isNaN(parseInt(safeObj(this.props.data.st_ads_items[0].img_height).replace('px',''))/2)?0:parseInt(safeObj(this.props.data.st_ads_items[0].img_height).replace('px',''))/2;
            if(imageHeight == 0 || isEmpty(imageHeight)){
                imageHeight = 20
            }
            if (imageWidth == 0 || isEmpty(imageWidth) ) {
                imageWidth = kScreenWidth-30
            }
            if(imageWidth>kScreenWidth-30){
                imageHeight = imageWidth/(kScreenWidth-30)*imageHeight
                imageWidth = kScreenWidth-30
            }
            return(
                <TouchableOpacity activeOpacity={1} onPress = {()=>this._jumpToSeninar()} style={{marginTop:10}}>
                    <Image style={{resizeMode:'stretch',width:imageWidth,marginLeft:15,height:imageHeight}} source={{uri:safeObj(safeObj(this.props.data.st_ads_items[0]).img_url)}}/>
                </TouchableOpacity>)
        } else {
            return (
                <View style={{backgroundColor:'white',height:21,marginTop:10}}/>
            )
        }
    }

    _jumpToSeninar(){
        const { navigate } = this.props.navigation;
        this.props.data.st_ads_items[0].title = '商品详情专题'
        let badge =  this.props.data.st_ads_items[0];
        pushWDNavigation(navigate,badge);
    }


    /**
     * 返回物流费用，有可能是"8.00"，有可能是"包邮"
     * @returns {*}
     */
    getShippingPrice(){
        if(this.props.data && parseInt(this.props.data.shipping_price) > 0){
            return toDecimal(this.props.data.shipping_price)
        }else{
            return this.props.data.shipping_price
        }
    }

    /**
     * 返回开户状态
     */
    renderContracted(){
        if(this.props.data.dict_bool_account_status != 0){
            return <View />
        }
        return (
            <TouchableOpacity activeOpacity={1} style={{flexDirection:'row',alignItems:'center',marginRight:13}} hitSlop={{top: 20, bottom: 20, left: 20, right: 10}}   onPress={()=>this._goOpenAccountAction()}>
                <Text style={{color:'#547cff',fontSize:13,fontWeight:'500'}}>{'申请开户'}</Text>
                <Image
                    style={{width:6,height:10,marginLeft:6,resizeMode:'contain',tintColor:'#547cff'}}
                    source={require('../../../img/icon_arrow_y.png')}
                />
            </TouchableOpacity>
        )
    }

    /**
     * 返回有效期
     * @deprecated 3.3.0废弃
     */
    renderValidity(){
        if(isEmpty(this.props.data.period_to)){
            return <View />
        }
        return(
            <View>
                <Text style={[styles.textStyle]}>
                    {'有\u0020\u0020效\u0020\u0020期'}：
                    <Text style={[styles.textStyle,{color:yfwOrangeColor()}]}>{this.props.data.period_to}</Text>
                </Text>
            </View>
        )
    }

    renderVacationTips(text){
        if(isEmpty(text)){
            return <View/>
        }
        return (
            <View style={{backgroundColor:'#FFFFF2' ,borderColor:'#F7EDCC',borderWidth:1,padding:10,marginRight:13,flexDirection:'row',alignItems:'center'}}>
                <Image source={require('../../../img/ic_vacation.png')} style={{resizeMode:'contain',marginLeft:5,width:15,height:15}}/>
                <Text style={{fontSize:13,marginLeft:10,color:yfwOrangeColor()}}>{text}</Text>
            </View>
        )
    }

    renderMedicationPrompt(){
        if(isNotEmpty(safeObj(this.props.data).medication_prompt)) {
            return (
                <View style={{backgroundColor:'white',flexDirection:'row',alignItems:'center',marginTop:1,marginBottom:20,flex:1}}>
                    <Image source={require('../../../img/sx_icon_hint.png')} style={{resizeMode:'contain',width:15,height:15,position:'absolute',left:0,top:0}}/>
                    <Text style={{color:darkLightColor(),fontSize:12,lineHeight: 16,marginLeft:2,marginRight:10,flex:1}} numberOfLines={2}>{'     '+this.props.data.medication_prompt}</Text>
                </View>
            )
        } else {
            return null
        }
    }

    /**
     * 第一次进入分享赚现金动画
     */
    renderSharedSurprisesTips(){
        let y = this.state.sharedGetMoenyY
        let isShow = safeObj(safeObj(safeObj(this.props.data)).invite_item).invite_img_show
        if(isShow && !this.state.isFirst && y && y!=0){
            y+=this.state.sharedGetMoenyHeight
            this.startShareAnima()
            setItem('isFirstInGoodsDetail',true)
            this.state.isFirst = true//判断取反，所以是true
            return (
                <Animated.View style={{position:'absolute',right:20,top:y,opacity: this.state.fadeOutOpacity}}>
                    <ImageBackground source={ require('../../../img/bubble.png')} style={{flex:1}}>
                        <Text style={{fontSize:13,color:'#F8699A',marginLeft:15,marginRight:10,marginTop:5,marginBottom:5}}>快来赚钱吧！</Text>
                    </ImageBackground>
                </Animated.View>
            )
        }
    }

    /**
     * 执行分享赚现金动画
     */
    startShareAnima() {
        this.state.fadeOutOpacity.setValue(0);
        Animated.sequence([
            Animated.timing(this.state.fadeOutOpacity, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,// 线性的渐变函数
            }),
            Animated.timing(this.state.fadeOutOpacity, {
                toValue: 0,
                duration: 1500,
                easing: Easing.linear,// 线性的渐变函数
            })
        ]).start();
    }

    /*返回标题*/
    renderTitle(){
        return this.renderTitleView()
    }

    renderTitleView() {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(this.props.data).PrescriptionType+"" === "1"){
            return this.rednerPrescriptionLabel(TYPE_SINGLE,this.props.data.title)
        }
        //双轨药
        else if(safeObj(this.props.data).PrescriptionType+"" === "2"){
            return this.rednerPrescriptionLabel(TYPE_DOUBLE,this.props.data.title)
        }
        //双轨药
        else if(safeObj(this.props.data).PrescriptionType+"" === "0"){
            return this.rednerPrescriptionLabel(TYPE_OTC,this.props.data.title)
        }
        //处方药
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL,safeObj(this.props.data).title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type,title,onClick){
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            activity_img_url={this.props.data.activity_img_url}
            onClick={()=>{onClick && onClick()}}
            style={{color:darkTextColor(),fontSize:15,flex:1,fontWeight:'bold',lineHeight:18}}
        />
    }

    /**
     * 弹出单双轨说明
     */
    showPrescribedTips(){
        if(isNotEmpty(safeObj(safeObj(this.props.data).prompt_url))) {
            pushWDNavigation(this.props.navigation.navigate, {
                type: kRoute_html,
                value: safeObj(safeObj(this.props.data).prompt_url),
                title: 'H5单双轨说明页'
            })
        }
    }



    /*返回分享赚现金图标*/
    renderSharedGetMoeny(){
        return (
            <TouchableOpacity style={{width:80,height:24,marginRight:-7}} activeOpacity={1} onPress={this._postShowShare}>
                <Image style={{width:80,height:24,resizeMode:'stretch'}} source={YFWImageConst.Share_goods}></Image>
            </TouchableOpacity>
        )
    }

    /**
     * 分享赚现金弹窗
     * @private
     */
    _postShowShare=()=>{
        this.props.shareMethod&&this.props.shareMethod()
    }

    /*返回价格视图*/
    renderPrice() {
        if(this.state.hidePrice) {
            return (
                <Text style={{fontSize:18, color:darkLightColor(), fontWeight:"500", marginLeft:13, marginTop:15, marginBottom:5}}>仅做信息展示</Text>
            )
        }else {

            let userInfo = YFWUserInfoManager.ShareInstance();
            let price = this.props.data.price?this.props.data.price:' '
            if (!this.props.data.price&&this.props.price) {
                price = this.props.price
            }
            if (userInfo.hasLogin()) {
                return (
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingLeft:13,paddingTop:7}}>
                        <Text style={{fontSize:15,color:'#666',marginRight:4,fontWeight:'500'}}>{'批发价'}</Text>
                        {/*展示价*/}
                        <YFWDiscountText navigation={this.props.navigation}  style_text={{fontSize:19,fontWeight:'500'}} value={'¥'+toDecimal(price)}/>
                        {/*折扣*/}
                        {this.renderDiscount()}
                        {/*原价*/}
                        {this.renderOriginalPrice()}
                        <View style={{flex:1}}></View>
                        {this.renderSharedGetMoeny()}
                    </View>
                )
            }
            else {
                return (
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingLeft:13,paddingTop:7}}>
                        <TouchableOpacity activeOpacity={1} style={{
                        borderWidth:1,
                        borderColor:yfwOrangeColor(),
                        borderRadius:4,
                        backgroundColor:'white',
                        paddingTop:2.5,
                        marginRight:15,
                        justifyContent:'center',
                        width:(6*14+14),
                        alignItems:'center',
                        paddingBottom:2.5,
                        marginTop:4
                    }}
                        onPress={()=>{doAfterLogin(this.props.navigation.navigate)}}
                    >
                        <Text style={{color:yfwOrangeColor(),fontSize:14}}>价格登录可见</Text>
                    </TouchableOpacity>
                    <View style={{flex:1}}></View>
                    {this.renderSharedGetMoeny()}
                    </View>
                    )
                }
        }
    }

    /**
     * 返回原始价标签
     */
    renderOriginalPrice(){
        if("true"==this.props.data.is_wireless_exclusive || "true"==this.props.data.is_seckill){
            let price = ''
            let img = ''
            let imgStyle = {width:40,height:12}
            if("true"==this.props.data.is_wireless_exclusive){
                price = "商城价: ¥ "+ toDecimal(this.props.data.original_price)
                img = require('../../../img/zhuanxiang.png')
            }else if("true"==this.props.data.is_seckill){
                img = require('../../../img/miaosha.png')
                imgStyle = {width:47,height:12}
            }
            return (
                <View style={[{flexDirection:'row',marginLeft:5},BaseStyles.centerItem]}>
                    <Image source={img} style={{resizeMode:'center'}} style={{resizeMode:'stretch',...imgStyle}}/>
                    <Text style={{marginLeft:4,color:darkNomalColor(),fontSize:12}}>{price}</Text>
                </View>
            )
        }
    }

    /**
     * 返回折扣视图标签
     * @returns {*}
     */
    renderDiscount(){
        if("true"===this.props.data.discount_is_show+''){
            return (
                <View style={[
                    BaseStyles.centerItem, {
                    backgroundColor:'rgb(236,103,98)',
                    borderRadius:4,
                    paddingLeft:3,
                    paddingRight:3,
                    paddingTop:1,
                    paddingBottom:1,
                    marginLeft: 6,
                    marginRight:6,
                }]}>
                    <Text style={{fontSize:10,color:'white',fontWeight:'500'}}>{this.props.data.discount}</Text>
                </View>
            )
        }
    }

    changeSelectItem(item){
        console.log(item)
    }

    renderDiscountView() {
        if (isNotEmpty(this.props.data.goods_id)){
            let discountInfos = []
            let tipText = '查看'
            let youhuiquanInfo = null
            if (this.state.couponArray.length > 0) {
                youhuiquanInfo = this.state.couponArray[0]
                youhuiquanInfo = parseInt(youhuiquanInfo.use_condition_price) > 0?'满'+youhuiquanInfo.use_condition_price+'减'+youhuiquanInfo.money:youhuiquanInfo.money+'元优惠券'
                discountInfos.push(this.state.couponArray[0])
                tipText = '领券'
            }
            let manjianInfo = null
            let baoyouInfo = null
            if(this.props.data.shop_promotion.length > 0 && this.props.data.shop_promotion[0].sub_items) {

                this.props.data.shop_promotion[0].sub_items.map((info,index)=>{
                    if (info.type == 0) {//满减
                        if(isEmpty(manjianInfo)){
                            manjianInfo = info
                        }
                    } else { //包邮
                        if (isEmpty(baoyouInfo) || info.name == '单品包邮') {
                            baoyouInfo = info
                        }
                    }
                })
                if (isNotEmpty(manjianInfo)) {
                    discountInfos.push(manjianInfo)
                    let use_condition_price = manjianInfo.name.split('满')[1]
                    use_condition_price = parseInt(use_condition_price.split('元')[0])
                    let money = manjianInfo.shipping_desc.split('减')[1]
                    money = parseInt(money.split('元')[0])
                    manjianInfo = '满'+use_condition_price+'减'+money
                }
                if (isNotEmpty(baoyouInfo)) {
                    discountInfos.push(baoyouInfo)
                    if (baoyouInfo.name != '单品包邮') {
                        let use_condition_price = baoyouInfo.name.split('满')[1]
                        use_condition_price = parseInt(use_condition_price.split('元')[0])
                        baoyouInfo.showName = use_condition_price +'元包邮'
                    } else {
                        baoyouInfo.showName = baoyouInfo.name
                    }
                }
            }
            let kaihulingquanInfo = null
            if(isNotEmpty(this.props.data.open_desc) && this.props.data.dict_bool_account_status == 0){
                kaihulingquanInfo = this.props.data.open_desc
                discountInfos.push(kaihulingquanInfo)
            }

            console.log(discountInfos)
            if (discountInfos.length == 0) {
                return null
            }

            return (
                <TouchableOpacity activeOpacity={1} onPress={()=>{this._getCardVoucherMethod()}} style={{paddingLeft:13,backgroundColor:'white',flexDirection:'row',flex:1,alignItems:'center'}}>
                    <View style={{marginVertical:13,flexDirection:'row',flex:1,alignItems:'center',flexWrap: 'wrap'}}>
                        {isNotEmpty(baoyouInfo)?
                            <LinearGradient colors={['rgb(255,154,103)','rgb(255,96,94)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{marginVertical:2,marginRight:8,paddingVertical:1.5,borderRadius:3,justifyContent:'center',alignItems:'center'}}>
                                <Text style={{fontSize:12,color:'white',paddingHorizontal:5}}>{baoyouInfo.showName}</Text>
                            </LinearGradient>:null
                        }
                        {isNotEmpty(youhuiquanInfo)?
                        <View style={{marginVertical:2,borderRadius:3,paddingTop:1
                            ,paddingBottom:1,paddingLeft:2,paddingRight:2,borderColor:'#FF6363',borderWidth:0.5,marginRight:8,alignItems:'center',flexDirection:'row'}}>
                                <Text style={{fontSize:12,color:'#FF6363',width:15,textAlign:'center'}}>券</Text>
                                <View style={{backgroundColor:'#FF6363',width:0.5,height:12,marginHorizontal:1}}/>
                                <Text style={{fontSize:12,color:'#FF6363',marginLeft:2}}>{youhuiquanInfo}</Text>
                        </View>:null
                        }
                        {isNotEmpty(manjianInfo)?
                        <ImageBackground source={require('../../../img/sx_ticket.png')} style={{marginVertical:2,height:17,marginRight:8,justifyContent:'center',hintColor:'#FF6363'}} imageStyle={{resizeMode:'stretch'}}>
                            <Text style={{color:'#FF6363',fontSize:12,paddingHorizontal:5}}>{manjianInfo}</Text>
                        </ImageBackground>:null
                        }
                        {isNotEmpty(kaihulingquanInfo)?
                            <View style={{marginVertical:2,borderRadius:3,paddingTop:1
                                ,paddingBottom:1,paddingLeft:2,paddingRight:2,borderColor:'#FF6363',borderWidth:0.5,marginRight:8,alignItems:'center',flexDirection:'row'}}>
                                <Text style={{fontSize:12,color:'#FF6363',marginLeft:2}}>开户领券</Text>
                            </View>:null
                        }
                    </View>
                    <Text style={{color:'#666',fontSize:13,marginRight:6}}>{tipText}</Text>
                    {this.renderMorePointMethod()}
                </TouchableOpacity>
            )
        }


        return null
    }

    /// #  View  #

    renderView(){

        // 数组
        var itemAry = [];

        if (isNotEmpty(this.props.data.goods_id)){
            if (this.state.couponArray.length > 0) {
                // itemAry.push(
                //     <View key={'cuxiao'} style={{backgroundColor:'white'}}>
                //         <TouchableOpacity  activeOpacity={1} onPress={()=>this._getCardVoucherMethod()} key={'kaquan'} style={{height:53,backgroundColor:'white',alignItems:'center',flexDirection: "row",paddingLeft:12}}>
                //             <Text style={{color:darkLightColor(),fontSize:12}}>领券</Text>
                //             <ScrollView style={[{flex:1,marginLeft:15,marginRight:10}]}
                //                         horizontal={true}
                //                         showsHorizontalScrollIndicator={false}
                //                         alwaysBounceHorizontal={true}>
                //                 {this.renderCouponScroll()}
                //             </ScrollView>
                //             {this.renderMorePointMethod()}
                //         </TouchableOpacity>
                //     </View>
                // );
            }
            if(this.props.data.shop_promotion.length > 0){

                let someActivity = this.props.data.shop_promotion[0].sub_items?this.props.data.shop_promotion[0].sub_items.slice(0,3):[]
                let allActivityView = []
                someActivity.map((info,index)=>{
                    let name = info.type == 0?'满减':'包邮'
                    let colors = info.type == 0?['rgb(250,171,129)','rgb(250,209,110)']:['rgb(44,92,241)','rgb(124,100,247)']
                    allActivityView.push(
                        <View key={index+'c'} style={{flexDirection:'row',alignItems:'center',marginBottom:13}}>
                                <LinearGradient colors={colors}
                                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                    locations={[0,1]}
                                    style={{width: 32,height: 12,borderRadius:7,justifyContent:'center',alignItems:'center'}}>
                                    <Text style={{fontSize:10,color:'white'}}>{name}</Text>
                                </LinearGradient>
                                <Text style={{color:'#333',fontSize:13,marginHorizontal:6,flex:1}} numberOfLines={1}>{info.name+info.shipping_desc}</Text>
                        </View>
                    )
                })


                // itemAry.push(
                //     <TouchableOpacity key={'cuxiao'} activeOpacity={1} key={'cuxiaoh'}
                //                       style={{backgroundColor:'white',flexDirection: "row",paddingLeft:13,paddingTop:itemAry.length>0?0:20,paddingBottom:5}}
                //                       onPress={()=>this._changeActivityMethod()}>
                //         <Text style={{color:darkLightColor(),fontSize:12}}>促销</Text>
                //         <View style={{marginLeft:22,flex:1}} >
                //             {allActivityView}
                //         </View>
                //         {this.renderMorePointMethod()}
                //     </TouchableOpacity>
                // );
            }
            let somePackage = this.props.data.shopmedicine_package
            let havePackage = false
            let haveCourseOfTreatment = false
            let packages = []
            let treatmets = []
            somePackage.map((info)=>{
                if (info.package_type == 1) {
                    haveCourseOfTreatment = true
                    treatmets.push(info)
                }
                if (info.package_type == 0) {
                    havePackage = true
                    packages.push(info)
                }
            })
            let packageViews = []
            let margin = Math.min(kScreenWidth - ( 129*2 + 59 + 21 ),10 )
            margin = 20
            packages = packages.concat(treatmets)
            packages.map((info,index)=>{
                packageViews.push(
                    <View key={index+'v'} style={{backgroundColor:'#fafafa',height:30,borderRadius:15,alignItems:'center',justifyContent:'center',marginLeft:margin,marginTop:8}}>
                        <Text style={{color:'#666',fontSize:12,marginHorizontal:20,lineHeight:14,textAlign:'center'}} numberOfLines={1}>{info.name}</Text>
                    </View>
                )
            })
            let tipText = '选择单品'
            if (havePackage) {
                tipText += '、套餐'
            }
            if (haveCourseOfTreatment) {
                tipText += '、疗程装'
            }
            let title = this.props.selectGoodsItem?'已选择:'+this.props.selectGoodsItem.name:tipText
            let marginT = itemAry.length > 0?10:0
            if(!this.state.hidePrice) {
                itemAry.push(
                    <TouchableOpacity key={'select'} activeOpacity={1} style={{flexDirection: "row",marginTop:marginT,paddingTop:20,paddingBottom:16,backgroundColor:'white'}} onPress={()=>this._changeTaocanMethod()}>
                            <Text style={[{color:darkLightColor(),marginLeft:13,fontSize:13}]}>选择</Text>
                            <View style={{marginLeft:22,flex:1}} >
                                <Text style={{color:'#333',fontSize:13,marginBottom:10}}>{title}</Text>
                                <View style={{flexDirection:'row',flexWrap:'wrap',marginLeft:-20,marginTop: somePackage.length>0?-8:0}}>
                                    {packageViews}
                                </View>
                            </View>
                            {this.renderMorePointMethod(true,this.props.data.shopmedicine_package.length)}
                    </TouchableOpacity>
                )
            }
        }

        return itemAry;

    }

    /**
     * 返回最大和限购数量
     * @returns {*}
     */
    renderMaxBuy(){
        if (!this.state.hidePrice) {

            let text = ''
            if(this.props.data.lbuy_no+'' === '0'){
                if(isEmpty(safeObj(this.props.data).max_buy_qty)||safeObj(this.props.data).max_buy_qty+'' === '0'){
                    text = ''
                }else{
                    text = `  (最大购买${this.props.data.max_buy_qty}件)`
                }
            } else if (isNotEmpty(this.props.data.lbuy_no) && this.props.data.lbuy_no != 'undefined')  {
                text = `  (限购${this.props.data.lbuy_no}件)`
            } else {
                text = ''
            }
            return (
                <View style={{backgroundColor:'white',flexDirection:'row',marginTop:-3,marginBottom:0}}>
                    <Text style={[{color:'#999',marginLeft:13,fontSize:13}]}>库存</Text>
                    <Text style={[styles.textStyle,{color:darkTextColor(),marginLeft:22}]}>{this.props.data.reserve}
                            <Text style={{color:'rgb(254,172,76)'}}>{text}</Text>
                            {this.renderPeriodInfo()}
                    </Text>
                </View>
            )
        }
    }

    /**
     * 返回起送数  起订量
     * @returns {*}
     */
    renderSendInfo(){
            let send_account = '起订量 '+ this.props.data.purchase_minsum
            let send_price = '整店'+this.props.data.send_price + '元起送'
            if (this.props.data.purchase_minsum == 0) {

            }
            if (this.props.data.send_price == 0) {

            }
            return (
                <View style={{backgroundColor:'white',flexDirection:'row',paddingTop:4,paddingBottom:10,marginBottom:0}}>
                    <Text style={[{color:'#999',marginLeft:13,fontSize:13}]}>政策</Text>
                    <Text style={[{fontSize:13,height:25,},{color:darkTextColor(),marginLeft:22}]}>{send_account}</Text>
                    <Text style={[{fontSize:13,height:25,},{color:darkTextColor(),marginLeft:10}]}>{send_price}</Text>
                    {/* <Text style={[styles.textStyle,{color:darkTextColor(),marginLeft:10}]}>{send_account}</Text> */}
                </View>
            )
    }

    renderPeriodInfo() {
        if(isNotEmpty(this.props.data.period_to_Date)){
            return(
                <Text style={[styles.grayText]}>
                    {'    有效期至   '}
                    <Text style={[styles.textStyle,{color:darkTextColor(),marginLeft:16}]}>{this.props.data.period_to_Date}</Text>
                </Text>
            )
        }else {
            return null
        }
    }

    /**
     * 添加疗程装
     * @private
     */
    _addPackage(){
        if(isEmpty(this.packageData) && isNotEmpty(this.props.data.shopmedicine_package)){
            let packages = []
            for(let i = 0 ; i<this.props.data.shopmedicine_package.length; i++ ){
                let item = this.props.data.shopmedicine_package[i]
                if(item.package_type == '1'){
                    packages.push(item)
                }
            }
            //如果有套装，自己生成一个规格为1盒的套装数据
            if(packages.length>0){
                let unit = this.props.data.Standard[this.props.data.Standard.length-1]
                let item = {
                    name:`${1+unit+"装 | "+(toDecimal(this.props.data.original_price))+"元/"+unit}`,
                    price_total:this.props.data.original_price,
                    original_price:this.props.data.original_price,
                    save_price:'0.00',
                    shop_goods_id:this.props.data.shop_goods_id
                }
                packages.unshift(item)
                packages[0].isSelect = true
            }
            this.packageData = packages
        }
    }

    /**
     * 返回套装视图
     * @param datas
     * @private
     */
    _renderPackagesView(){
        //合计
        this.packageTotalMoney = '0.00'
        //节省
        this.economizeMoney = '0.00'
        if(this.packageData){
            for(let i = 0 ; i<this.packageData.length; i++){
                let item = this.packageData[i]
                if(item.isSelect){
                    this.packageTotalMoney = item.price_total
                    this.economizeMoney = item.save_price
                    this.packageId = item.package_id
                }
            }
        }
        return (
            <View style={{backgroundColor:'white',marginTop:10}}>
                <Text style={{fontSize:12,color:darkTextColor(),margin:10}}>疗程优惠装</Text>
                <View style={{
                    paddingLeft:10,
                    paddingRight:10,
                    flexDirection:'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap:'wrap'
                }}>
                    {this._renderButton()}
                </View>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',height:35,paddingLeft:10,paddingRight:10}}>
                    <View style={{flexDirection:'row',flex:1}}>
                        <Text style={{color:darkTextColor(),fontSize:14,marginRight:4}}>合计:</Text>
                        <Text style={{color:yfwOrangeColor(),fontSize:14}}>{'¥'+toDecimal(this.packageTotalMoney)}</Text>
                    </View>
                    <View style={{flexDirection:'row',flex:1}}>
                        <Text style={{color:darkTextColor(),fontSize:14,marginRight:4}}>立省:</Text>
                        <Text style={{color:darkTextColor(),fontSize:14}}>{'¥'+toDecimal(this.economizeMoney)}</Text>
                    </View>
                </View>
            </View>
        )
    }

    _renderButton(){
        if(isNotEmpty(this.packageData)){
            return this.packageData.map((item,index)=>{return this._renderPackageButton(item,index)})
        }
    }

    /**
     * 返回套装列表
     * @param item
     * @param index
     * @returns {*}
     * @private
     */
    _renderPackageButton=(item,index)=>{
        let backgroundColor = 'white'
        let borderColor = darkTextColor()
        let textColor = darkTextColor()
        if(item.isSelect){
            backgroundColor = yfwGreenColor()
            borderColor = yfwGreenColor()
            textColor = 'white'
        }
        return(
            <TouchableOpacity
                activeOpacity={1}
                style={{
                alignItems:'center',
                height:35,
                justifyContent:'center',
                borderRadius:2,
                backgroundColor:backgroundColor,
                borderColor:borderColor,
                borderWidth:0.5,
                paddingLeft:10,
                paddingRight:10,
                marginTop:10,
                width:((width-20)/2-5)
            }} onPress={()=>{this._selectPackageItem(item)}}>
                <Text style={{fontSize:12,color:textColor}}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    /**
     * 选中的套餐
     * @param item
     * @private
     */
    _selectPackageItem(item){
        for(let i = 0 ; i <this.packageData.length;i++){
            let element = this.packageData[i]
            if(item == element){
                element.isSelect = true
            }else{
                element.isSelect = false
            }
        }
        this.setState({})
    }

    /**
     * 给外面提供选中的packageId
     * @returns {*}
     */
    getPackageId(){
        return this.packageId;
    }

    renderMorePointMethod(){
        return(
            <Image
                style={{width:7,height:13,marginLeft:0,marginRight:13,resizeMode:'contain'}}
                source={require('../../../img/toPayArrow.png')}
            />
        );
    }

    renderPaymentItem() {
        // 数组
        var itemAry = [];

        if (this.props.data.payment != null){
            // 遍历
            var dataitems = this.props.data.payment;
            for (let i = 0; i<dataitems.length; i++) {
                let dataItem = dataitems[i];
                itemAry.push(
                    <View key={i} flexDirection={'row'}  alignItems={'center'}>
                        <Image
                            style={styles.checkImgStyle}
                            source={require('../../../img/check_number_green.png')}
                        />
                        <Text style={{marginLeft:5,color:darkLightColor(),fontSize:12}}>{dataItem}</Text>
                    </View>
                );
            }
        }

        return itemAry;
    }


    renderCouponScroll(){

        // 数组
        var itemAry = [];

        // 遍历
        var dataitems = this.state.couponArray;
        for (let i = 0; i<dataitems.length; i++) {
            let dataItem = dataitems[i];
            itemAry.push(
                <View key={'coupon'+i} style={{alignItems: 'center', justifyContent: 'center',height:20,marginHorizontal:7}}>
                        <ImageBackground source={require('../../../img/sx_ticket.png')} style={{height:15}} imageStyle={{resizeMode:'stretch'}}>
                            <Text style={{color:'#ff3300',fontSize:12,paddingHorizontal:4}}>{parseFloat(dataItem.use_condition_price)>0.0 ? '满'+dataItem.use_condition_price+'减' : ''}{dataItem.money}元</Text>
                        </ImageBackground>
                </View>
            );
        }

        return itemAry;

    }

    /// #  Method  #
    //跳转商家
    _toshopDetail(){

        let {navigate} = this.props.navigation;
        pushWDNavigation(navigate,{type:kRoute_shop_detail,value:this.props.data.shop_id});
    }

    _toshopAllGoods(){
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate,{type:kRoute_shop_detail_list,value:this.props.data.shop_id});
    }

    //
    _goOpenAccountAction(){
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate,{type:kRoute_apply_account,value:this.props.data.shop_id});
    }

    //查看全部评论
    _showAllcomments(){
        this.props.selectPage(2)
        YFWNativeManager.mobClick('product detail-all ratings')
    }

    //选择套餐
    _changeTaocanMethod(){

        if (this.props.clickPopup){
            this.props.clickPopup(2);
        }
    }
    //选择促销活动
    _changeActivityMethod(){

        if (isNotEmpty(this.props.data.shop_promotion)){

            if (this.props.data.shop_promotion.length > 0){

                if (this.props.clickPopup){
                    this.props.clickPopup(1);
                }
            }
        }
        YFWNativeManager.mobClick('product detail-sales promotion')
    }

    //领取卡券
    _getCardVoucherMethod(){
        if (this.props.clickPopup){
            this.props.clickPopup(1);
        }
        YFWNativeManager.mobClick('product detail-coupon')
    }

    /// #  Request  #

    _requestCouponMethod(){
        //TCP在商品详情和商铺信息都有返回，不用请求
        let dataArray = itemAddKey(YFWWDShopDetailRecommendModel.getModelArray(safeObj(this.props.data).shop_recommend_list));
        this.setState({
            shopRecommendArray: dataArray,
            couponArray: safeObj(this.props.data).couponArray,
        })
    }

    _subtractionFn(){
        if (!this.checkReserve()) {
            return
        }
        if(this.state.quantity <=1){
            return
        }
        let quantity =  Number.parseInt(String(this.state.quantity))  - 1;

        this.updateQuantity(quantity);
    }

    _plusFn(){
        if (!this.checkReserve()) {
            return
        }
        let quantity = Number.parseInt(String(this.state.quantity))  + 1;
        if(quantity > this.props.data.reserve){
            YFWToast('超过库存上限');
            return;
        }else if(!isNaN(this.props.data.lbuy_no) && this.props.data.lbuy_no > 0 && quantity > this.props.data.lbuy_no){
            YFWToast('超过限购上限');
            return;
        }
        this.updateQuantity(quantity);

    }

    _onTextBlur(){
        let quantity = this.state.quantity
        try {
            quantity = Number.parseInt(String(quantity));
            if(isNaN(quantity) || !quantity){
                quantity = 1
            }else if(quantity<1){
                quantity = 1
            }
        }catch (e) {
            quantity = 1
        }
        this.setState({quantity:quantity})
        this.updateQuantity(quantity);
    }

    _inputChangeQuantity(text){
        if (!this.checkReserve()) {
            return
        }
        let quantity = text
        try {
            quantity = Number.parseInt(String(quantity));
            if(isNaN(quantity) || !quantity){
                quantity = ''
            }else if(quantity > this.props.data.reserve){
                quantity = this.props.data.reserve
            }else if(!isNaN(this.props.data.lbuy_no) && this.props.data.lbuy_no > 0 && quantity > this.props.data.lbuy_no){
                quantity = this.props.data.lbuy_no
            }
        }catch (e) {
            quantity = ''
        }
        this.setState({quantity:quantity})
        this.updateQuantity(quantity);

    }

    //预防未请求到库存信息的情况
    checkReserve(){
        if (this.props.data.reserve) {
            return true
        }
        return false
    }

    updateQuantity(quantity){

        this.setState({
            quantity:quantity,
        });
        if (this.props.getQuantity){
            this.props.getQuantity(quantity);
        }

    }
}

// export default {
//     changeSelectItem
// }



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: backGroundColor()
    },
    text: {
        fontSize: 20,
        textAlign: 'center'
    },
    cfyIconStyle: {
        resizeMode:'contain',
        height:15,
        width:35,
        marginLeft:2,
        marginTop:3
    },
    item: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'

    },
    shareImage: {
        width: 40,
        height: 40
    },
    shareView: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    checkImgStyle:{
        width:12,
        height:12,
        marginLeft:15,
    },
    textStyle:{
        color:'#333',
        fontSize:13,
        height:25,
        flex:1,

    },
    grayText:{color:'#666'},
    shopButtonStyle:{
        height:36,
        width:Dimensions.get('window').width-50,
        borderColor:yfwGreenColor(),
        borderWidth:1,
        borderRadius:18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    operatingBox:{

        width:90,
        height:30,
        borderColor:separatorColor(),
        borderWidth:1,
        marginLeft:25,
        marginTop:5,
        borderRadius:3,
        flexDirection: 'row',

    },
    reduce:{
        flex:1,
        width:30,
        height:30,
        alignItems:'center',
        justifyContent:'center',
    },
    btn1:{
        fontSize:14,
        color:darkTextColor(),
    },
    inputBorder:{
        borderColor:separatorColor(),
        borderLeftWidth:1,
        borderRightWidth:1,
        width:30,
        height:30,
        textAlign:'center',
        padding:0
    },
    color_disabled1:{
        color:darkLightColor(),
    },

    shopBtn:{
        width:145*kScreenWidth/375,
        height:37*kScreenWidth/375,
        borderRadius:18*kScreenWidth/375,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row'
    },
    smallIcon:{
        width:14,height:14,resizeMode:'contain'
    },

});
