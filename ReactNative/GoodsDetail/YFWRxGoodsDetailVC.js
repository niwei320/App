import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    ScrollView,
    DeviceEventEmitter, NativeModules,
    Animated, Easing, Dimensions, FlatList, ImageBackground, TextInput, Keyboard,
} from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import YFWNoLocationHint from "../widget/YFWNoLocationHint";
import {
    convertImg,
    coverAuthorizedTitle,
    iphoneBottomMargin,
    isEmpty,
    isNotEmpty, kScreenHeight,
    kScreenWidth,
    safeObj, tcpImage
} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor, yfwGreenColor,
    yfwOrangeColor, yfwRedColor
} from "../Utils/YFWColor";
import {TYPE_DOUBLE, TYPE_NOMAL, TYPE_OTC, TYPE_SINGLE} from "../widget/YFWPrescribedGoodsTitle";
import YFWPrescribedGoodsTitle from "../widget/YFWPrescribedGoodsTitle";
import {doAfterLogin, pushNavigation} from "../Utils/YFWJumpRouting";
import YFWPopupWindow from "../PublicModule/Widge/YFWPopupWindow";
import YFWToast from "../Utils/YFWToast";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
const {StatusBarManager} = NativeModules;

export default class YFWRxGoodsDetailVC extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerLeft:
            <TouchableOpacity style={{width:29,height:29,marginLeft:13,justifyContent:'center',alignItems:'center'}}
                                     onPress={()=>navigation.goBack()}>
                {navigation.state.params.hiddenTitle?
                    <Image style={{width:11,height:20}} source={require('../../img/icon_back_gray.png')}/>:
                    <Image style={{width:29,height:29}} source={require('../../img/sx_icon_back.png')}/>
                }
            </TouchableOpacity>,
        headerTitle:!navigation.state.params.hiddenTitle?
            <View style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                <Text style={{color:'#333',fontSize:17}}>{'药品详情'}</Text>
            </View>:<View/>,
        headerRight:
            <TouchableOpacity style={{width:29,height:29,marginRight:13,justifyContent:'center',alignItems:'center'}} onPress={()=>navigation.state.params.showMenu()}>
                {navigation.state.params.hiddenTitle?
                    <Image style={{width:22,height:5,resizeMode:'stretch'}} source={require('../../img/icon_sandian_gray.png')}/>:
                    <Image style={{width:29,height:29}} source={require('../../img/sx_icon_more.png')}/>
                }
            </TouchableOpacity>,
        headerStyle: Platform.OS === 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0,
            borderBottomWidth:0
        } : {backgroundColor: 'white',borderBottomWidth:0},
    });

    constructor(props) {
        super(props);
        this.state = {
            carNumber: new YFWUserInfoManager().shopCarNum+'',
            showBottomWaring: false,
            textFocus:false,
            quantity:1,
            isCollection:false,
            popupWindowHeight:385,
            data:{
                goods_id:'',//收藏用
                scheduled_time : '24小时发货',
                imageUrl : 'https://cdn.sspai.com/2019/03/15/adeb4e8f3095df3eba10c26a33aa4b1b.png?imageMogr2/quality/95/thumbnail/!1420x708r/gravity/Center/crop/1420x708/interlace/1',
                prescriptionType : 1,
                shop_id : '',//咨询收藏用
                title : '醋酸甲羟孕酮片',
                applicability : '1.各型急性白血病，特别是急性淋巴细胞白血病、恶性淋巴瘤、非何杰金氏淋巴瘤和簟样肉芽肿、多发性骨髓病；\r\n2.头颈部癌、肺癌、各种软组织肉瘤、银屑病；\r\n3.乳腺癌、卵巢癌、富颈癌、恶性葡萄胎、绒毛膜上皮癌、睾丸癌',
                authorized_code : '国药准字Z20090905',
                standard : '2.5mg×16片/瓶',
                troche_type : ' 乳膏剂',
                short_title : ' PfizerItaliaS.R.L.',
                warning_tip : '',
                vacation : '',
                period_info : '60个月',
                reserve:300,
                lbuy_no: 10,
                prompt_url:'https://www.baidu.com', //H5单双轨说明页
                status : 'sale', //_renderFooterView
                prohibit_sales_btn_text :  '',//_renderFooterView
            },
            aptitudeModel:{
                // icon: safeObj(result.getAPPBannerBottom).imageurl,
                // link: safeObj(result.getAPPBannerBottom).link,
                // type: safeObj(result.getAPPBannerBottom).type,
                icon: 'https://cdn.sspai.com/2019/03/15/adeb4e8f3095df3eba10c26a33aa4b1b.png?imageMogr2/quality/95/thumbnail/!1420x708r/gravity/Center/crop/1420x708/interlace/1',
                link: 'https://www.baidu.com',
                type: '',
            }
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                let userInfo = YFWUserInfoManager.ShareInstance();
                // //如果进来的时候没登录，并且再次显示的时候登录了，就请求
                // if (!this.isLogin&&userInfo.hasLogin()) {
                //     this._requetCommodityDetail();
                // }
                if(YFWUserInfoManager.ShareInstance().hasLogin()){
                    this.setState({
                        carNumber:this.dealShopCarCount(new YFWUserInfoManager().shopCarNum+'')
                    })
                }
            }
        );
        DeviceEventEmitter.addListener('UserLoginSucess',(param)=>{
            this._requetCommodityDetail();
            if(YFWUserInfoManager.ShareInstance().hasLogin()){
                this.setState({
                    carNumber:this.dealShopCarCount(new YFWUserInfoManager().shopCarNum+'')
                })
            }
        })
    }

    componentDidMount() {
        this.props.navigation.setParams({
            showMenu:()=>DeviceEventEmitter.emit('OpenUtilityMenu'),
            hiddenTitle:false,
        })
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }

//-----------------------------------------------METHOD---------------------------------------------

    _keyboardDidShow(e) {
        //因为两个平台弹出键盘方式不同为了减少刷新时闪烁影响，ios在弹出键盘高度回调的时候重新设置弹框高度，android在输入获取焦点的时候刷新高度
        if(Platform.OS == 'ios'){
            this.setState({
                popupWindowHeight: 250 + e.endCoordinates.height
            });
        }
    }

    _keyboardDidHide() {
        this.selectNumInput && this.selectNumInput.blur();
        this.setState({
            popupWindowHeight: 385
        });
    }

    scrollLister(event){
        let contentY = event.nativeEvent.contentOffset.y;
        if (contentY > 60) {
            if(this.props.navigation.state.params.hiddenTitle){
                this.props.navigation.setParams({
                    hiddenTitle:false
                })
            }
        } else {
            if(!this.props.navigation.state.params.hiddenTitle) {
                this.props.navigation.setParams({
                    hiddenTitle: true
                })
            }
        }
        if (contentY > 120) {
            if(!this.state.showBottomWaring) {
                this.setState({
                    showBottomWaring: true,
                })
            }
        } else {
            if(this.state.showBottomWaring) {
                this.setState({
                    showBottomWaring: false,
                })
            }
        }

    }

    //跳转H5单双轨说明页
    showPrescribedTips(){
        let url = this.state.data.prompt_url
        pushNavigation(this.props.navigation.navigate,{type:'get_h5',value:url ,title:'H5单双轨说明页'})
    }

    //跳转咨询
    toConsultingMethod() {
        let {navigate} = this.props.navigation
        let shop_id = this.state.data.shop_id
        let title = this.state.data.title
        doAfterLogin(navigate,()=>{
            let data = {shop_id: shop_id, title:title};
            YFWNativeManager.openZCSobot(data);
        })
        YFWNativeManager.mobClick('product detail-service')
    }

    //平台资质证书查看
    _platAptitudeClick(model) {
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {
            type: 'get_h5',
            value: model.link,
            name: '资质证书',
            title: '资质证书',
            isHiddenShare:true,
        });
    }

    //购物车红单数字格式化
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

    //跳转购物车
    toShopCarMethod() {
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_shopping_car'});
        YFWNativeManager.mobClick('product detail-cart')
    }

    disMiss(){
        this.alertView && this.alertView.disMiss()
    }

    show(){
        this.alertView && this.alertView.show()
        this._onTextBlur()
    }

    //点击收藏
    toCollectionMethod() {

        let {navigate} = this.props.navigation;
        let goods_id = this.state.data.goods_id;
        let shop_id = this.state.data.shop_id;
        doAfterLogin(navigate, ()=> {
            let paramMap = new Map();
            if (this.state.isCollection) {
                paramMap.set('__cmd', 'person.favorite.cancelCollectStoreGoods');
            } else {
                paramMap.set('__cmd', 'person.favorite.collectStoreGoods');
            }
            paramMap.set('medicineid', goods_id);
            paramMap.set('storeid', shop_id);
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let is_favorite = false;
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
        });
        YFWNativeManager.mobClick('product detail-favorite')
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
        this.setState({textFocus:false})
    }

    _onTextFocus(){
        //因为两个平台弹出键盘方式不同为了减少闪烁影响，ios在弹出键盘高度回调的时候重新设置弹框高度，android在输入获取焦点的时候刷新高度
        if(Platform.OS == 'android'){
            this.setState({
                textFocus:true,
                popupWindowHeight: 250
            });
        } else {
            this.setState({
                textFocus: true,
            })
        }
    }

    //数量输入控制
    _inputChangeQuantity(text){
        let reserve = this.state.data.reserve
        let lbuy_no = this.state.data.lbuy_no
        if (!reserve) {
            return
        }
        let quantity = text
        try {
            quantity = Number.parseInt(String(quantity));
            if(isNaN(quantity) || !quantity){
                quantity = ''
            }else if(quantity > reserve){
                quantity = reserve
            }else if(!isNaN(lbuy_no) && lbuy_no > 0 && quantity > lbuy_no){
                quantity = lbuy_no
            }
        }catch (e) {
            quantity = ''
        }
        this.setState({quantity:quantity})

    }

    //数量减一
    _subtractionFn(){
        let reserve = this.state.data.reserve
        let quantity = this.state.quantity
        if (!reserve) {
            return
        }
        if(quantity <=1){
            return
        }
        quantity =  Number.parseInt(String(quantity))  - 1;
        this.setState({
            quantity:quantity,
        });
    }

    //数量加一
    _plusFn(){

        let reserve = this.state.data.reserve
        let lbuy_no = this.state.data.lbuy_no
        let quantity = Number.parseInt(String(this.state.quantity));
        if (!reserve) {
            return
        }
        if(isNaN(quantity) || !quantity){
            quantity = 0
        }
        quantity ++;
        if(quantity > reserve){
            YFWToast('超过库存上限',{position:kScreenHeight*0.2});
            return;
        }else if(!isNaN(lbuy_no) && lbuy_no > 0 && quantity > lbuy_no){
            YFWToast('超过限购上限',{position:kScreenHeight*0.2});
            return;
        }
        this.setState({
            quantity:quantity,
        });
    }

//-----------------------------------------------RENDER---------------------------------------------

    _renderImageHeader(){
        let scheduled_time = this.state.data.scheduled_time
        let imageUrl = this.state.data.imageUrl
        return (
            <View>
                <View style={{height:240,width:kScreenWidth, backgroundColor:'red'}}>
                    <Image
                        style={{flex:1 , resizeMode:'contain' , backgroundColor:'white'}}
                        source={{uri:imageUrl}}
                    />
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',position:'absolute',top:95,left:0,width:kScreenWidth,height: 50,paddingHorizontal:10,backgroundColor:'rgba(247,81,59,0.5)'}}>
                        <Text style={{fontSize: 13, color: "#ffffff",fontWeight:'bold'}}>{'根据国家药监局规定，查阅处方药销售信息，需先开电子处方。'}</Text>
                    </View>
                </View>
                <View style={{height:36,backgroundColor:'#fafafa',flexDirection:'row',alignItems:'center'}}>
                    <View style={{marginLeft:15,flexDirection:'row',alignItems:'center'}}>
                        <Image style={{width: 16, height: 16}} source={require('../../img/sx_icon_baozhang.png')}/>
                        <Text style={{color:darkTextColor(),fontSize:12,marginLeft:4,fontWeight:'500'}}>{scheduled_time}</Text>
                    </View>
                    <View style={{marginLeft:15,flexDirection:'row',alignItems:'center'}}>
                        <Image style={{width: 16, height: 16}} source={require('../../img/sx_icon_baozhang.png')}/>
                        <Text style={{color:darkTextColor(),fontSize:12,marginLeft:4,fontWeight:'500'}}>{'品质保障'}</Text>
                    </View>
                    <View style={{marginLeft:15,flexDirection:'row',alignItems:'center'}}>
                        <Image style={{width: 16, height: 16}} source={require('../../img/sx_icon_baozhang.png')}/>
                        <Text style={{color:darkTextColor(),fontSize:12,marginLeft:4,fontWeight:'500'}}>{'提供发票'}</Text>
                    </View>
                </View>
            </View>
        )
    }

    _renderTitleView() {
        let prescriptionType = this.state.data.prescriptionType
        let title = this.state.data.title
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(prescriptionType+"" === "1"){
            return this._renderPrescriptionLabel(TYPE_SINGLE,title,()=>{this.showPrescribedTips()})
        }
        //双轨药
        else if(prescriptionType+"" === "2"){
            return this._renderPrescriptionLabel(TYPE_DOUBLE,title,()=>{this.showPrescribedTips()})
        }
        //双轨药
        else if(prescriptionType+"" === "0"){
            return this._renderPrescriptionLabel(TYPE_OTC,title,()=>{this.showPrescribedTips()})
        }
        //处方药
        else {
            return this._renderPrescriptionLabel(TYPE_NOMAL,title)
        }
    }

    _renderPrescriptionLabel(type,title,onClick){
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            // activity_img_url={this.props.data.activity_img_url}
            onClick={()=>{onClick && onClick()}}
            style={{color:darkTextColor(),fontSize:15,flex:1,fontWeight:'bold',lineHeight:18}}
        />
    }

    _renderGoodsInfo(){
        let authorized_code = this.state.data.authorized_code
        let standard = this.state.data.standard
        let troche_type = this.state.data.troche_type
        let short_title = this.state.data.short_title
        let warning_tip = this.state.data.warning_tip
        let vacation = this.state.data.vacation
        let period_info = this.state.data.period_info
        return (
            <View style={{backgroundColor:'white',flexDirection:'row',paddingTop:18}}>
                <View style={{width:60}}>
                    <Text style={{marginLeft:13,color:'#999',fontSize:14}}>{'参数'}</Text>
                </View>
                <View style={{flex:1,marginBottom:19}}>
                    {this._renderKeyValueText(coverAuthorizedTitle(authorized_code),authorized_code.trim())}
                    {this._renderKeyValueText('规格',standard.trim(),this._renderMaxBuy())}
                    {this._renderKeyValueText('剂型',troche_type.trim())}
                    {this._renderKeyValueText('生产企业',short_title.trim())}
                    {isNotEmpty(period_info)?this._renderKeyValueText('有效期',period_info.trim()):<View/>}
                    {this.renderVacationTips(safeObj(warning_tip))}
                    {this.renderVacationTips(safeObj(vacation))}
                </View>
            </View>
        )
    }

    _renderAptitudeView(){
        let model = [{
            icon: require('../../img/sx_icon_zhibao.png'),
            title: '品质保障',
            content: '药房网商城在售商品均由正规实体签约商家供货，商家提供品质保证。在购物过程中发现任何商家有违规行为，请直接向我们投诉举报！'
        }, {
            icon: require('../../img/sx_icon_piao.png'),
            title: '提供发票',
            content: '药房网商城所有在售商家均可提供商品发票'
        }
        ]
        return (
            <View style={{flex:1, paddingHorizontal:13, backgroundColor:backGroundColor()}}>
                <View style={{flex:1,paddingTop:18, paddingBottom:10}}>
                    <Text style={{color:darkTextColor(), fontSize:14, fontWeight:'bold'}}>{'服务保障'}</Text>
                </View>
                <View style={[styles.contentRadius, {flex:1, paddingTop:15}]}>
                    <Text style={{flex:1,paddingBottom:18, paddingHorizontal:15,fontSize: 14, color: "rgb(31,219,155)"}}>{'药房网商城承诺'}</Text>
                    {this._renderDescriptionCell(model[0])}
                    {this._renderDescriptionCell(model[1])}
                    {this._renderAptitudeCell()}
                </View>
            </View>
        )
    }

    _renderDescriptionCell(item) {
        let model = item
        return (
            <View style={{flex:1, paddingHorizontal:15}}>
                <View style={{flexDirection:'row', paddingBottom:8,alignItems:'center'}}>
                    {model.icon ? <Image source={model.icon} style={{width:15, height:15, marginRight:3, resizeMode:'contain'}}/> : null}
                    <Text style={{flex:1,color:darkTextColor(), fontSize:12, fontWeight:'bold'}}>{model.title}</Text>
                </View>
                <View style={{flex:1,paddingBottom:15}}>
                    <Text style={{color:darkNomalColor(), fontSize:12, lineHeight:17}}>{model.content}</Text>
                </View>
            </View>
        )
    }
    _renderAptitudeCell() {
        let model = this.state.aptitudeModel
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {this._platAptitudeClick(model)}} style={{overflow:'hidden',borderBottomLeftRadius:7,borderBottomRightRadius:7}}>
                <Image source={{uri:model.icon}} style={{width:kScreenWidth-26, height:70/375.0*kScreenWidth, resizeMode:'stretch'}}/>
            </TouchableOpacity>
        )
    }

    _renderBottomWaringView(){
        if(this.state.showBottomWaring){
            return (
                <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',position:'absolute',bottom:50+iphoneBottomMargin(),left:0,width:kScreenWidth,height:35,paddingHorizontal:22,backgroundColor:'rgba(247,81,59,0.5)'}}>
                    <Text style={{fontSize: 12, color: "#ffffff",fontWeight:'bold',padding:0}}>{'根据国家药监局规定，查阅处方药销售信息，需先开电子处方。'}</Text>
                </View>
            )
        }
    }
    _renderBottomToolView(){
        const bottom = iphoneBottomMargin()
        let isCollection = this.state.isCollection
        return (
            <View style={{height:50+bottom,marginLeft:0,marginRight:0,backgroundColor:'white'}}>
                <View style={{backgroundColor:'#ccc',height:0.5,opacity:0.3,width:Dimensions.get('window').width-210}}/>
                <View style={{flex:1,flexDirection: 'row', justifyContent:'space-around'}}>
                    <View style={{flex:1,flexDirection: 'row', justifyContent:'space-around'}}>
                        <TouchableOpacity activeOpacity={1} style={styles.btn}
                                          onPress={()=>{this.toConsultingMethod()}}>
                            <Image
                                style={{width:20,height:19,resizeMode:'contain'}}
                                source={require('../../img/md_btn1.png')}/>
                            <Text
                                style={styles.btnTitle}>咨询</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={styles.btn}
                                          onPress={()=>{this.toCollectionMethod()}}>
                            <Image
                                style={{width:19,height:19,resizeMode:'contain'}}
                                source={isCollection?require('../../img/md_btn3_on.png'):require('../../img/md_btn3.png')}/>
                            <Text
                                style={[styles.btnTitle]}>{isCollection ? '已收藏' : '收藏'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{justifyContent:'center',alignItems:'center'}} onPress={()=>this.toShopCarMethod()}>
                            <View>
                                <Image style={{width: 19, height: 18}} source={require('../../img/sx_icon_cart_up.png')}/>
                                {this.state.carNumber?
                                    <View style={{position:'absolute',borderRadius:8,height:16,minWidth:16,maxWidth:40,backgroundColor:'#ff3300',right:this.state.carNumber.length>2?-10:-5,top:-5,alignItems:'center',justifyContent:'center'}}>
                                        <Text style={{color:'white',fontSize:10,padding:3,lineHeight:10,textAlign:'center',fontWeight:'500'}} numberOfLines={1}>{this.state.carNumber}</Text>
                                    </View>
                                    :null}
                            </View>
                            <Text
                                style={[styles.btnTitle,{width:null}]}>{'购物清单'}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={() => {this.show()}} style={{marginRight:0,width:181*kScreenWidth/375,height:50,backgroundColor:'#ccc',justifyContent:'center',alignItems:'center'}}>
                        <LinearGradient colors={['rgb(255,51,0)','rgb(255,110,74)']}
                                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                        locations={[0,1]}
                                        style={{flex:1,width:'100%',alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{color:'white',fontSize:15,fontWeight:'bold'}}>加入需求清单</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <View style={{height:bottom,backgroundColor:'white'}}/>
            </View>
        )
    }

    _renderApplicability(){
        let applicability = this.state.data.applicability
        if(isNotEmpty(safeObj(applicability))) {
            return (
                <Text style = {[styles.textStyle, {
                    height: null,
                    marginLeft: 13,
                    marginRight: 16,
                    marginTop: 16,
                    marginBottom: 20,
                    fontSize: 12,
                    lineHeight: 18,
                    color: '#666666'
                }]}
                      numberOfLines = {3}>{safeObj(applicability).replace(/<[^>]+>/g, "").replace(/(↵|\r|\n)/g, "").trim()}</Text>
            )
        } else {
            return <View />
        }
    }

    /**
     * 返回限购数量
     * @returns {*}
     */
    _renderMaxBuy(){
        let max_buy_qty = this.state.data.reserve
        let lbuy_no = this.state.data.lbuy_no
        let text = ''
        if(lbuy_no+'' === '0'){
            if(isEmpty(max_buy_qty)||max_buy_qty+'' === '0'){
                text = ''
            }else{
                text = `  (最大购买${max_buy_qty}件)`
            }
        } else if (isNotEmpty(lbuy_no) && lbuy_no != 'undefined')  {
            text = `  (限购${lbuy_no}件)`
        } else {
            text = ''
        }
        return (<Text style={{color:'rgb(254,172,76)'}} numberOfLines={1}>{text}</Text>)

    }

    _renderKeyValueText(keyStr,valueStr,textView) {
        return(
            <View style={{flexDirection:'row',}}>
                <Text style={[styles.textStyle,styles.grayText,{flex:null,textAlign:'justify',width:70*kScreenWidth/375}]}>{keyStr}</Text>
                <Text style={[styles.textStyle,{color:darkTextColor()},{height:null,marginRight:12,marginBottom:2}]}>{valueStr}{textView}</Text>
            </View>
        )
    }

    renderVacationTips(text){
        if(isEmpty(text)){
            return <View/>
        }
        return (
            <View style={{backgroundColor:'#FFFFF2' ,borderColor:'#F7EDCC',borderWidth:1,padding:10,marginRight:13,flexDirection:'row',alignItems:'center'}}>
                <Image source={require('../../img/ic_vacation.png')} style={{resizeMode:'contain',marginLeft:5,width:15,height:15}}/>
                <Text style={{fontSize:13,marginLeft:10,color:yfwOrangeColor()}}>{text}</Text>
            </View>
        )
    }

    _renderAlertView(){
        let alertHeight = this.state.popupWindowHeight
        let textFocus = false  //this.state.textFocus
        return (
            <YFWPopupWindow ref={(c) => this.alertView = c}
                            onRequestClose={()=>{
                                this.disMiss()
                            }}
                            popupWindowHeight={alertHeight}
                            backgroundColor={'white'}>
                <View style={{marginHorizontal:12,marginTop:15, alignItems:'center'}}>
                    {this._renderAlertTitle()}
                    {textFocus?<View />:
                        <ScrollView style={{flex:1,width:kScreenWidth-24, height:kScreenHeight/7*5/2}}
                                    ref={(e)=>{this.scrollView = e}}
                                    showsVerticalScrollIndicator = {false}>
                            {this._renderAlertGoodsButton()}
                        </ScrollView>}
                    {this._renderAlertSelectNum()}
                    {this._renderFooterView()}
                </View>
            </YFWPopupWindow>
        )
    }

    _renderAlertTitle(){
        // let ImgUrl = {uri:tcpImage(this.state.data.img_url?this.state.data.img_url['0']:this.state.data.img_url)};
        let ImgUrl = {uri:'https://cdn.sspai.com/2019/03/15/adeb4e8f3095df3eba10c26a33aa4b1b.png?imageMogr2/quality/95/thumbnail/!1420x708r/gravity/Center/crop/1420x708/interlace/1'};
        let authorized_code = this.state.data.authorized_code;
        let price = this.state.data.price;
        let name = this.state.data.title;
        let isSelectItem = true;

        return(
            <View style={{height:110,width:kScreenWidth-24,alignItems:'flex-start',flexDirection:'row',justifyContent:'flex-start'}}>
                <Image style={styles.titleImage}
                           source={ImgUrl}/>
                <View style={{flex:1,height:110,paddingTop:0,paddingLeft:22,justifyContent:'flex-start'}}>
                    <Text style={{marginTop:5,fontSize:14,fontWeight:'500',color:darkTextColor(),width:kScreenWidth-180}} numberOfLines={2}>
                        {name}
                    </Text>
                    <Text style={{fontSize:12,color:darkLightColor(),width:kScreenWidth-180, marginTop:2}} numberOfLines={1}>
                        {authorized_code}
                    </Text>
                    <Text style={{marginTop:10,fontSize:15,fontWeight: '500',color:'#ff3300'}} >{'价格问诊后可见'}</Text>
                    <Text style={{fontSize:12,color:darkTextColor(),width:kScreenWidth-180, marginTop:4}}>
                        {isSelectItem?'已选择：':'未选择'}{name}
                    </Text>
                </View>
                <TouchableOpacity activeOpacity={1} style={{width:20,height:20,marginRight:10,alignItems: 'center',justifyContent: 'center'}}
                                  hitSlop={{top:20,left:20,bottom:20,right:20}}
                                  onPress={()=>this.disMiss()}>
                    <Image style={{width:15,height:15}}
                           source={require('../../img/close_button.png')}/>
                </TouchableOpacity>
            </View>
        )
    }

    _renderAlertGoodsButton() {

        let btnStyle = styles.ovalItemButton  //styles.ovalItemButtonUn
        let textStyle = styles.itemText  //styles.itemTextUn
        let standard = '2.5mg×16片/瓶'
        return(
            <View style={{marginTop:10}}>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={btnStyle} onPress={()=>{}}>
                        <Text style={textStyle}>{standard}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //选择数量
    _renderAlertSelectNum(){
        return(
            <View key={'kucun'} style={{flexDirection:'row',height:50,backgroundColor:'white',marginTop:10,alignItems:'center',marginBottom:20}}>
                <View style={{flexDirection:'row',marginTop:13,width:kScreenWidth-140}}>
                    <Text style={{color:darkTextColor(), fontSize:13}}>{'数量'}{this._renderMaxBuy()}</Text>
                </View>
                <View style={styles.operatingBox}>
                    <TouchableOpacity
                        activeOpacity={1} style={styles.reduce} onPress={()=>this._subtractionFn()}>
                        <View style={styles.reduce}>
                            <Text allowFontScaling={false} style={{}}>—</Text>
                        </View>
                    </TouchableOpacity>
                    <TextInput allowFontScaling={false}
                               ref={(e)=>{this.selectNumInput = e}}
                               style={{
                                   borderColor:separatorColor(),
                                   borderLeftWidth:1,
                                   borderRightWidth:1,
                                   flex:1,
                                   textAlign:'center',
                                   padding:0}}
                               value={String(this.state.quantity)}
                               returnKeyType={'done'}
                               keyboardType="numeric"
                               onChangeText={(txt)=>{this._inputChangeQuantity(txt)}}
                               autoFocus={false}
                               onFocus={()=>{this._onTextFocus()}}
                               onBlur={()=>{this._onTextBlur()}}
                               underlineColorAndroid="transparent">
                    </TextInput>
                    <TouchableOpacity
                        activeOpacity={1} style={styles.reduce} onPress={()=>this._plusFn()}>
                        <View style={styles.reduce}>
                            <Text allowFontScaling={false} style={{}}>＋</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    _renderFooterView() {
        let text = '加入需求清单';
        let textFocus = this.state.textFocus;
        let type = this.state.data.status;
        let sales_btn_text = this.state.data.prohibit_sales_btn_text;
        if(textFocus){
            if(Platform.OS === 'android'){
                return (
                    <View style={{height:50, width:kScreenWidth, alignItems:'flex-end', backgroundColor:backGroundColor()}}>
                        <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center', paddingHorizontal:20}} onPress={()=>{this.selectNumInput && this.selectNumInput.blur()}}>
                            <Text style={{fontSize:16, color:yfwOrangeColor()}}>完成</Text>
                        </TouchableOpacity>
                    </View>
                )
            } else {
                return <View/>
            }
        }else {
            if (safeObj(type) == 'sale') {
                return (
                    <View style={{height:50 , width:kScreenWidth, marginBottom:iphoneBottomMargin(), backgroundColor: yfwRedColor()}}>
                        <TouchableOpacity activeOpacity={1} style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{}}>
                            <LinearGradient colors={['rgb(255,51,0)','rgb(255,110,74)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{flex:1,width:'100%',alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{color:'white',fontSize:16,fontWeight:'500'}}>{text}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )
            }else{
                if (isNotEmpty(sales_btn_text)) {
                    text = sales_btn_text
                } else {
                    text = '暂不销售'
                }
                return (
                    <View style={{height:50 , width:kScreenWidth,marginBottom:iphoneBottomMargin(),backgroundColor:'#ccc'}} >
                        <TouchableOpacity activeOpacity={1} style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
                            <Text style={{color:'white',fontSize:16,fontWeight:'500'}}>{text}</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        }
    }

    render() {
        return (
            <View style = {{flex: 1}}>
                <YFWNoLocationHint/>
                <ScrollView style={{flex:1}}
                            ref={(item)=>{this.vp = item}}
                            bounces={false}
                            onScroll={(e)=>{this.scrollLister(e)}}
                            scrollEventThrottle={50}
                            stickyHeaderIndices={[1]}
                >
                    <View style={{flex:1}}>
                        {this._renderImageHeader()}
                        <View style={{backgroundColor:'white'}}>
                            <Text style={{marginHorizontal:13,marginVertical:18,color:yfwOrangeColor(),fontSize:16,fontWeight:'bold'}}>
                                {'价格问诊后可见'}
                            </Text>
                            <View style={{marginHorizontal:12}}>
                                {this._renderTitleView()}
                            </View>
                            {this._renderApplicability()}
                            <View style={styles.spaceView}/>
                            {this._renderGoodsInfo()}
                            {this._renderAptitudeView()}
                            <View style={styles.spaceView}/>
                        </View>
                    </View>
                </ScrollView>
                {this._renderBottomWaringView()}
                {this._renderBottomToolView()}
                {this._renderAlertView()}
            </View>
        )
    }

}

const styles = StyleSheet.create({
    btnTitle:{
        color:darkTextColor(),fontWeight:'bold',marginTop:6,fontSize:10,textAlign:'center',width:32
    },
    btn:{
        alignItems: 'center', justifyContent: 'center'
    },
    contentRadius: {
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(206, 206, 206, 0.28)",
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowRadius: 4,
        shadowOpacity: 1
    },
    textStyle:{
        color:'#333',
        fontSize:13,
        height:25,
        flex:1,
    },
    grayText: {color: '#666'},
    titleImage: {
        width: 96,
        height: 96,
        resizeMode: 'contain',
        borderWidth: 0.5,
        borderColor: "#dddddd",
    },
    ovalItemButton: {
        // height: 30,
        justifyContent:'center',
        paddingHorizontal:18,
        paddingVertical:4.5,
        marginVertical:4.5,
        borderRadius: 100,
        backgroundColor: '#e8fbf5',
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: yfwGreenColor()
    },
    ovalItemButtonUn: {
        // height: 30,
        justifyContent:'center',
        paddingHorizontal:18,
        paddingVertical:4.5,
        marginVertical:4.5,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: backGroundColor(),
        backgroundColor: backGroundColor()
    },
    itemText: {
        fontWeight:'500',
        fontSize: 13,
        color: "#1fdb9b"
    },
    itemTextUn: {
        fontWeight:'500',
        fontSize: 13,
        color: "#666666"
    },
    operatingBox: {

        width:90,
        height:30,
        borderColor:separatorColor(),
        borderWidth:1,
        marginLeft:25,
        marginTop:5,
        borderRadius:3,
        flexDirection: 'row',

    },
    reduce: {
        flex:1,
        width:30,
        height:30,
        alignItems:'center',
        justifyContent:'center',
    },
    spaceView:{
        backgroundColor:'#fafafa',
        height:10,
        width:kScreenWidth
    }
});