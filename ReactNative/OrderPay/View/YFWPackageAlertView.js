import React, {Component} from 'react';

import {
    Image,
    TouchableOpacity,
    View,
    Text,
    FlatList, ImageBackground,TextInput,KeyboardAvoidingView,Keyboard,Platform,ScrollView
} from 'react-native';
import {
    separatorColor,
    yfwGreenColor,
    yfwOrangeColor,
    darkTextColor,
    backGroundColor,
    o2oBlueColor
} from "../../Utils/YFWColor";
import {
    itemAddKey,
    kScreenHeight,
    kScreenWidth,
    safe,
    isIphoneX,
    safeObj,
    isEmpty,
    isRealName,
    objToStrMap,
    mapToJson,
    iphoneBottomMargin,
    strMapToObj,
    isAndroid,
    kScreenScaling
} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWPopupWindow from "../../PublicModule/Widge/YFWPopupWindow";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity"
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import YFWToast from '../../Utils/YFWToast';
import {IDENTITY_CODE, IDENTITY_VERIFY, NAME} from "../../PublicModule/Util/RuleString";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';


export default class YFWPackageAlertView extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            kHeight:kScreenWidth,
            keyBoardHeight:0,
            status_modal:false,
            advertType:'',
            adverData:undefined,
            selectValue:undefined,
            coupon_type_select_index:0, //0 可用优惠 1 不可用优惠券
            invoice_code:'',
            invoice_title:'',
            invoice_person:new Map(),
            invoice_gongsi:new Map(),
            isNotNeedInvoice:true,
            invoice_select_index: 0,
            promptContext: '1.发票金额不含优惠券、满减、积分等优惠扣减金额；\n2.商家若无法开具电子普通发票，则开具纸质发票，发票随货寄出或者发货后2日内寄出，若未收到可要求商家补开并寄出；\n3.电子发票：\n(1)电子普通发票是税局认可的有效付款凭证，其法律效力、基本用途、基本使用规定同纸质发票，可支持报销入账，如需纸质发票可自行打印下载；\n(2)电子普通发票则在发货后2日内开出，若商家未开出可联系商家开出；\n(3)用户可点击“我的订单-查看发票”查询，分享链接至电脑端下载打印。',
            logisticType:1,                  //1 普通快递 2 门店配送 3 门店自提
        };
        this.initKHeight = kScreenHeight*0.7
    }
    componentDidMount(){
        this.setState({
            kHeight:this.state.advertType == 'invoice'?kScreenWidth+60:kScreenWidth
        })
    }
    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardDidHide.bind(this));

    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow(e) {
        let kHeight = this.initKHeight
        if (Platform.OS == 'ios') {
            let keyboarH = e.endCoordinates.height+250+40
            if (keyboarH > kHeight) {
                kHeight = keyboarH
            }
        }
        this.setState({
            keyBoardHeight: e.endCoordinates.height,
            kHeight:kHeight
        });
    }

    _keyboardDidHide() {
        this.setState({
          keyBoardHeight: 0,
          kHeight: this.initKHeight
        });
    }

    //Action

    alertViewTitle(){
        if (this.state.advertType == 'package') {
            return <Text style={{color:"#000", fontSize:14, fontWeight: 'bold', }}>包装方式</Text>
        }else if(this.state.advertType == 'logistic'){
            return <Text style={{color:"#000", fontSize:14, fontWeight: 'bold', }}>配送方式</Text>
        }else if (this.state.advertType == 'coupon') {
            return <Text style={{color:"#000", fontSize:14, fontWeight: 'bold', }}>优惠券</Text>
        } else if (this.state.advertType == 'platformCoupons') {
            return <Text style={{color:"#000", fontSize:14, fontWeight: 'bold', }}>平台优惠</Text>
        } else if(this.state.advertType == 'invoice') {
            return <Text style={{color:"#000", fontSize:14, fontWeight: 'bold', }}>填写发票信息</Text>
        }
    }
    alertTypeViewHeader(){
        if(this.state.advertType == 'invoice'){
            let typeName =[{name:'无需发票',status:false},{name:'我要发票',status:true}];
            let views = [];
            let selectIndex = this.state.isNotNeedInvoice?0:1
            typeName.map((item,index)=>{
                views.push(
                    <TouchableOpacity key={index+'invoice'} onPress={()=>{
                        this.clickType(item.status,index)
                    }}>
                        <View style={[{marginLeft:index==0?12:16,
                            marginTop:16,width:100,height:25,borderRadius: 16,
                            borderStyle: "solid",
                            borderWidth: 1,
                            borderColor:index==selectIndex?(this.props.from!='oto'?'#1fdb9b':o2oBlueColor()): "#999999"},BaseStyles.centerItem]}>
                                <Text style={{fontSize:14,color:index==selectIndex?(this.props.from!='oto'?'#1fdb9b':o2oBlueColor()): "#999999"}}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )
            })
            let invoice_types =  safeObj(this.state.adverData).invoice_types
            if (isEmpty(invoice_types)) {
                invoice_types = []
            }
            let invoice_type_desc = ''
            let typesViews = []
            let select_type_index = this.state.invoice_select_index
            if (select_type_index >= invoice_types.length) {
                select_type_index = 0
            }
            invoice_types.map((item,index)=>{
                let is_select = index == select_type_index
                if (is_select) {
                    invoice_type_desc = item.desc
                }
                typesViews.push(
                    <TouchableOpacity key={index+'invoice'} onPress={()=>{
                        this.clickInvoiceType(is_select,index)
                    }}>
                        <View style={[{marginLeft:index==0?12:16,
                            marginTop:16,minWidth:100,height:25,borderRadius: 16,
                            borderStyle: "solid",
                            borderWidth: 1,
                            borderColor:is_select ?(this.props.from!='oto'?'#1fdb9b':o2oBlueColor()): "#999999"},BaseStyles.centerItem]}>
                                <Text style={{fontSize:14,color:is_select ?(this.props.from!='oto'?'#1fdb9b':o2oBlueColor()): "#999999",marginHorizontal:12}}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )
            })
            return(
                <View style={{paddingBottom:10}}>
                    <Text style={{color:"#000", fontSize:14, marginLeft:12}}>需要发票</Text>
                    <View style={{flexDirection:"row"}}>
                        {views}
                    </View>
                    {this.state.isNotNeedInvoice
                    ?null
                    :<View style={{marginTop:10}}>
                        <Text style={{color:"#000", fontSize:14, marginLeft:12}}>发票类型</Text>
                        <View style={{flexDirection:"row"}}>
                            {typesViews}
                        </View>
                        <Text style={{color:"#999", fontSize:12,lineHeight:16, marginHorizontal:12,marginTop:10}}>{invoice_type_desc}</Text>
                    </View>
                    }
                </View>
            )
        } else if(this.state.advertType == 'coupon'){
            let {coupon_type_select_index} = this.state
            let couponNum = this.state.adverData.coupon_items.length - 1
            let unCouponNum = this.state.adverData.un_coupon_items.length
            return (
                <View style = {{paddingBottom: 10}}>
                    <View style = {{flexDirection: "row"}}>
                        <TouchableOpacity
                            style={{flex:1, alignItems:'center', }}
                            onPress={()=>{this.setState({coupon_type_select_index:0})}}
                        >
                            <Text style={{fontSize: 14, color: "#333333",fontWeight:coupon_type_select_index===0?'bold':'normal'}}>可用优惠券{couponNum > 0?'('+couponNum+')':''}</Text>
                            {coupon_type_select_index===0?<View style={{marginTop:3,width: 40, height: 3, borderRadius: 2, backgroundColor: "#1fdb9b"}}/>:null}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{flex:1, alignItems:'center', }}
                            onPress={()=>{this.setState({coupon_type_select_index:1})}}
                        >
                            <Text style={{fontSize: 14, color: "#333333",fontWeight:coupon_type_select_index===1?'bold':'normal'}}>不可用优惠券{unCouponNum > 0?'('+unCouponNum+')':''}</Text>
                            {coupon_type_select_index===1?<View style={{marginTop:3,width: 40, height: 3, borderRadius: 2, backgroundColor: "#1fdb9b"}}/>:null}
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }else{
            return <View/>
        }
    }

    clickType(isSelect,index){
        //无需发票和我要发票内容显示
        if(index==0){
            this.setState({
                isNotNeedInvoice:true,
                kHeight: this.initKHeight,
            })
        }else{
            this.setState({
                isNotNeedInvoice:false,
                kHeight:this.initKHeight
            })
        }
    }

    clickInvoiceType(isSelect,index){
        this.setState({
            invoice_select_index:index
        })
    }

    alertViewHeaderTitle(){
        if (this.state.advertType == 'package') {
            return <Text style={{color:"#000", fontSize:13, marginLeft:12}}>选择包装方式</Text>
        }else if(this.state.advertType == 'logistic'){
            if (!this.state.adverData.supportBuyerPickUp && !this.state.adverData.supportSellerShipping) {
                return <Text style={{color:"#000", fontSize:13, marginLeft:12}}>选择配送方式</Text>
            }else{
                let textWidth = 80
                return (
                    <View style={{height:40,flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
                        {this.state.adverData.logistic_items&&this.state.adverData.logistic_items.length>0&&<TouchableOpacity activeOpacity={1} style={{justifyContent:'center', alignItems:'center',height:40}} onPress={()=> {this.setState({logisticType:1})}}>
                            {this.state.logisticType == 1?
                            <YFWTitleView title={'普通快递'} style_title={{width:textWidth,fontSize:15,fontWeight:'normal'}} hiddenBgImage={false}/>
                            :<Text style={{fontSize:14,color:'rgb(153,153,153)',width:textWidth,textAlign:'center'}}>普通快递</Text>
                            }
                        </TouchableOpacity>}
                        {
                            this.state.adverData.supportSellerShipping?
                            <TouchableOpacity activeOpacity={1} style={{justifyContent:'center', alignItems:'center',height:40}} onPress={()=> {this.setState({logisticType:2})}}>
                            {this.state.logisticType == 2?
                            <YFWTitleView title={safeObj(this.state.adverData.sellershippingInfo).name} style_title={{width:textWidth,fontSize:15,fontWeight:'normal'}} hiddenBgImage={false}/>
                            :<Text style={{fontSize:14,color:'rgb(153,153,153)',width:textWidth,textAlign:'center'}}>{safeObj(this.state.adverData.sellershippingInfo).name}</Text>
                            }
                            </TouchableOpacity>:null
                        }
                        {
                            this.state.adverData.supportBuyerPickUp?
                            <TouchableOpacity activeOpacity={1} style={{justifyContent:'center', alignItems:'center',height:40}} onPress={()=> {this.setState({logisticType:3})}}>
                            {this.state.logisticType == 3?
                            <YFWTitleView title={safeObj(this.state.adverData.buyerpickupInfo).name} style_title={{width:textWidth,fontSize:15,fontWeight:'normal'}} hiddenBgImage={false}/>
                            :<Text style={{fontSize:14,color:'rgb(153,153,153)',width:textWidth,textAlign:'center'}}>{safeObj(this.state.adverData.buyerpickupInfo).name}</Text>
                            }
                            </TouchableOpacity>:null
                        }
                        <View style={{position:'absolute',bottom:0,backgroundColor:'#eee',height:1,left:30,right:0}}></View>
                    </View>
                )
            }
        }else if (this.state.advertType == 'coupon') {
            return <View/>
        } else if (this.state.advertType == 'platformCoupons') {
            return <Text style={{color:"#000", fontSize:13, marginLeft:12}}>可用优惠券</Text>
        } else if(this.state.advertType == 'invoice') {
            return <View/>
        }
    }
    flatListDataArray(){
        let data = Array();
        if (this.state.advertType == 'package') {
            data = this.state.adverData.package_items;
        }else if(this.state.advertType == 'logistic'){
            data = this.state.adverData.logistic_items;
        }else if(this.state.advertType == 'coupon'){
            if(this.state.coupon_type_select_index==0){
                data = this.state.adverData.coupon_items;
            } else {
                data = this.state.adverData.un_coupon_items;
            }
        }else if(this.state.advertType == 'platformCoupons'){
            data = this.state.adverData;
        }else if(this.state.advertType == 'invoice') {
            data = ['sss'];
        }
        itemAddKey(data);
        return data;
    }

    showView(type,value,selectv) {
        this.modalView && this.modalView.show()
        let new_logisticType = 1
        if (type == 'logistic') {
            let select_logistic = safeObj(value.logistic)
            if (parseInt(select_logistic.id) == -3) {
                new_logisticType = 3
            } else if (parseInt(select_logistic.id) == -2) {
                new_logisticType = 2
            }
        }
        this.setState({
            advertType:type,
            adverData:value,
            selectValue:selectv,
            logisticType:new_logisticType,
            kHeight:kScreenWidth
        });
        if(type == 'invoice'){
            let invoice_types =  safeObj(value).invoice_types
            if (isEmpty(invoice_types)) {
                invoice_types = []
            }
            let invoice_select_index = 0
            if (invoice_types.length > 0) {
                let DZIndex = 0
                let ZZIndex = 0
                let haveDZInvoice = false
                invoice_types.map((info,index)=>{
                    let have = info.type == '2'
                    if (have) {
                        DZIndex = index
                        haveDZInvoice = true
                    } else {
                        ZZIndex = index
                    }
                })
                if (haveDZInvoice && value.invoice_type == 2) {
                    invoice_select_index = DZIndex
                } else if (value.invoice_type == 1) {
                    invoice_select_index = ZZIndex
                }
            }
            this.setState({
                invoice_code:value.invoice_code,
                invoice_title:value.invoice_applicant,
                invoice_select_index: invoice_select_index,
                advertType:type,
                adverData:value,
                selectValue:selectv,
                isNotNeedInvoice:value.invoice_type == 0,
                kHeight:value.invoice_type == 0?kScreenWidth:this.initKHeight
            })
        }
        if(type == 'coupon') {
            this.setState({
                kHeight:kScreenHeight *0.7
            })
        }
    }

    closeView(){
        this.modalView && this.modalView.disMiss()
        this.setState({
            kHeight:kScreenWidth
        })
    }

    clickItem(item) {
        if (this.state.advertType == 'platformCoupons') {
            this.setState({
                selectValue:item,
            });
            if (this.props.callback) {
                this.props.callback(this.state.advertType,item.item)
            }
        }else if (this.state.advertType == 'invoice') {

        }else {
            let selectMap = this.state.selectValue;
            selectMap.set(this.state.adverData.shop_id,item.item);
            this.setState({
                selectValue:selectMap,
            });
            if (this.props.callback) {
                this.props.callback(this.state.advertType,selectMap)
            }
        }

        this.closeView();
    }

    _confirmClickItem(title,code) {
        if(this.state.isNotNeedInvoice==true){
            let invoiceMap = this.state.invoice_person
            invoiceMap.set('title','')
            invoiceMap.set('code','')
            invoiceMap.set('type',0)
            invoiceMap.set('invoice_type',0)
            let selectMap = this.state.selectValue;
            selectMap.set(this.state.adverData.shop_id,strMapToObj(invoiceMap));
            this.setState({
                selectValue:selectMap,
            });
            if (this.props.callback) {
                this.props.callback(this.state.advertType,selectMap)
            }
            this.closeView();
            return;
        }
        if (code.length == 0){
            YFWToast('请输入身份证号');
            return;
        }
        if (!code.match(IDENTITY_VERIFY)){
            YFWToast('请输入正确的身份证号');
            return;
        }
        let invoice_types =  safeObj(this.state.adverData).invoice_types
        if (isEmpty(invoice_types)) {
            invoice_types = []
        }
        let dict_bool_etax = invoice_types[this.state.invoice_select_index].type == '2'
        let invoiceMap = this.state.invoice_person
        invoiceMap.set('title','个人')
        invoiceMap.set('code',code)
        invoiceMap.set('type',1)
        invoiceMap.set('dict_bool_etax',dict_bool_etax)
        invoiceMap.set('invoice_type',dict_bool_etax? 2 : 1)
        let selectMap = this.state.selectValue;
        selectMap.set(this.state.adverData.shop_id,strMapToObj(invoiceMap));
        this.setState({
            selectValue:selectMap,
        });
        if (this.props.callback) {
            this.props.callback(this.state.advertType,selectMap)
        }
        this.closeView();
    }

    _renderItem = (item) => {
        if (this.state.advertType === 'coupon') {
            return this._renderCouponItem(item);
        }else if (this.state.advertType == 'invoice') {
            return !this.state.isNotNeedInvoice?this._renderInvoiceItem(item):<View/>;
        } else if (this.state.advertType == 'platformCoupons') {
            return this._renderPlatfromCouponItem(item);
        } else {
            return this._renderNormalItem(item);
        }
    }

    _renderInvoiceItem(item) {
        return (
            <View style={{flex:1}}>
                    {!this.state.isNotNeedInvoice?<Text style={{color:"#000", fontSize:14, marginLeft:12}}>发票抬头</Text>:<View/>}
                    {
                        this.props.from!='oto'?
                        <ImageBackground
                            source={require('../../../img/button_pay.png')}
                            style={[{height:37, width:104, marginLeft:5, marginTop:10, paddingBottom:6,alignItems:'center',justifyContent:'center'}]}
                            imageStyle={{resizeMode:'stretch'}}>
                            <Text style={{fontWeight: 'bold',color: '#FFFFFF',fontSize:12,includeFontPadding:false}}>个人</Text>
                        </ImageBackground>:
                        <View style={{marginLeft:5, marginTop:10}}>
                            <YFWTouchableOpacity style_title={{height:25, width:80, paddingBottom:6, fontSize: 14,}} title={'个人'}
                            callBack={()=>{}}
                            enableColors={[o2oBlueColor(),o2oBlueColor()]}
                            enableShaowColor={'rgba(87, 153, 247, 0.5)'}
                            isEnableTouch={true}/>
                        </View>
                    }
                    <Text style={{color:"#000", fontSize:14, marginLeft:12, marginTop:17}}>开票信息</Text>
                    <View style={[BaseStyles.leftCenterView,{marginTop:8,height:41,width:kScreenWidth}]}>
                        <Text style={{marginLeft:13, fontSize:12, color:darkTextColor()}}>身份证号</Text>
                        <TextInput
                            returnKeyType={'done'}
                            maxLength={18}
                            underlineColorAndroid='transparent'
                            placeholder={'请填写您的身份证号码'}
                            placeholderTextColor="#cccccc"
                            style={{marginLeft:21,fontSize:12,width:kScreenWidth-28}}
                            value={this.state.invoice_code}
                            onChangeText={(text) => {
                                if (text) {
                                    this.setState(() => ({
                                        invoice_code:safeObj(this.verifyCardNum(text)),
                                    }))
                                } else {
                                    this.setState(() => ({
                                        invoice_code: '',
                                    }))
                                }
                            }}
                        >
                        </TextInput>
                    </View>
                    <View style={{width:kScreenWidth-28,height:1,marginLeft:12,backgroundColor:'#ececec'}}/>
                    <View style={[BaseStyles.leftCenterView,{marginTop:8,height:41,width:kScreenWidth}]}>
                        <Text style={{marginLeft:13, fontSize:12, color:darkTextColor()}}>发票内容</Text>
                        <TextInput
                            editable={false}
                            underlineColorAndroid='transparent'
                            style={{marginLeft:21,fontSize:12,width:kScreenWidth-28,color:darkTextColor()}}
                            value={'商品明细'}
                        >
                        </TextInput>
                    </View>
                    <View style={{width:kScreenWidth-28,height:1,marginLeft:12,backgroundColor:'#ececec'}}/>
                    <Text style={[BaseStyles.titleWordStyle,{color:"#666", fontSize:12, marginLeft:12, marginTop:10}]}>发票须知：</Text>
                    <ScrollView style={{flex:1,marginBottom:4,marginTop:10}}>
                        <View style={{flex:1}}>
                            <Text
                                style={[BaseStyles.contentWordStyle,
                                    {width:kScreenWidth-32,marginLeft:16,fontSize:12,letterSpacing:2,lineHeight:19,color:'#666666'}
                                    ]}>{this.state.promptContext}</Text>
                        </View>
                    </ScrollView>
            </View>


        )
    }

    /**
     * 商家模式配送方式
     * @param  item
     */
    _renderLogisticView(data){
        if (this.state.advertType == 'logistic') {
            if(this.state.logisticType == 2){
                let height = (kScreenWidth-10)/350*67;
                let info = safeObj(this.state.adverData.sellershippingInfo)
                return (
                    <View style={{flex:1}}>
                        <View style={{flex:1}}>
                            <Text style={{fontSize:14,color:'#666',textAlign:'left',marginHorizontal:15,marginVertical:15}}>{safe(info.msg)}</Text>
                            <ImageBackground style={{resizeMode:'cover',justifyContent:'space-between',marginHorizontal:5,flexDirection:'row',alignItems:'center',width:kScreenWidth-10,height:height,paddingBottom:3/67*(height)}}
                                            source={require('../../../img/button_card.png')}>
                                <View style={{justifyContent:'center',marginLeft:27}}>
                                    <Text style={{color:'#FFF',fontSize:15}}>{safe(info.name)}</Text>
                                </View>
                                <View style={{justifyContent:'center',marginRight:27}}>
                                    <Text style={{color:'#FFF',width:60,fontSize:15,fontWeight:'bold'}}>¥{toDecimal(info.price)}</Text>
                                </View>
                            </ImageBackground>

                        </View>
                        <View style={{alignItems:'center',paddingBottom:iphoneBottomMargin()}}>
                            <YFWTouchableOpacity style_title={{height:42,marginHorizontal:20, fontSize: 17,}} title={'确定'} isEnableTouch={true}
                                callBack={()=>{
                                    info.selectByUser = true
                                    this.clickItem({item:info})
                                }} />
                        </View>
                    </View>
                )
            } else if(this.state.logisticType == 3){
                let height = 34*kScreenScaling;
                let width = kScreenWidth - 33*kScreenScaling
                let info = safeObj(this.state.adverData.buyerpickupInfo)
                return (
                    <View style={{flex:1}}>
                        <Text style={{color:yfwGreenColor(),fontSize:13,marginHorizontal:26,marginTop:10,marginBottom:22,lineHeight:16}}>{safe(info.msg)}</Text>
                        <View style={{flexDirection:'row',justifyContent:'center',marginHorizontal:26,marginBottom:20}}>
                            <Text style={{color:'#333',fontSize:13,width:60}}>自提地点:</Text>
                            <Text style={{color:'#999',fontSize:13,marginLeft:5,flex:1}}>{  safe(info.address)}</Text>
                        </View>
                        <Text style={{color:'#333',fontSize:13,marginHorizontal:26,marginBottom:20}}>自提时间</Text>
                        <View style={{flex:1,alignItems:'center'}}>
                            <ImageBackground resizeMode={'stretch'} style={{justifyContent:'center',marginHorizontal:5,flexDirection:'row',alignItems:'center',width:width,height:height}}
                                            source={require('../../../img/button_card.png')}>
                                <View style={{justifyContent:'center',marginBottom:4}}>
                                    <Text style={{color:'#FFF',fontSize:15,textAlign:'center'}}>{safe(info.business_hours)}</Text>
                                </View>
                            </ImageBackground>
                        </View>
                        <View style={{alignItems:'center',paddingBottom:iphoneBottomMargin()}}>
                            <YFWTouchableOpacity style_title={{height:42, marginHorizontal:20, fontSize: 17,}} title={'确定'} isEnableTouch={true}
                                callBack={()=>{
                                    info.selectByUser = true
                                    this.clickItem({item:info})
                                }}/>
                        </View>
                    </View>
                )
            }else{
                return <FlatList
                        data={data}
                        renderItem={this._renderItem.bind(this)}
                        ListFooterComponent={this._footer.bind(this)}
                        ItemSeparatorComponent={this._separator.bind(this)}
                        ListEmptyComponent={this._emptyView.bind(this)}
                        style={{flex:1}}
                    />
            }
        }else{
            return <FlatList
                        data={data}
                        renderItem={this._renderItem.bind(this)}
                        ListFooterComponent={this._footer.bind(this)}
                        ItemSeparatorComponent={this._separator.bind(this)}
                        ListEmptyComponent={this._emptyView.bind(this)}
                        style={{flex:1}}
                    />
        }

    }

    _renderPackageColdItem (item) {
        let itemSelected = false
        if (this.state.selectValue.get(this.state.adverData.shop_id)) {
            itemSelected = item.item.id === this.state.selectValue.get(this.state.adverData.shop_id).id;
        }

        if (itemSelected) {
            let height = (kScreenWidth-10)/350*67;
            return (
                <View>
                    <ImageBackground style={{resizeMode:'cover',justifyContent:'flex-start',marginHorizontal:5,flexDirection:'row',alignItems:'center',width:kScreenWidth-10,height:height,paddingBottom:3/67*(height)}}
                                    source={require('../../../img/button_card.png')}>
                        <View style={{marginLeft:27,width:150,flexDirection: 'row', alignItems: 'center'}}>
                            <Image style={{width: 15, height: 15, marginRight: 5}} source={require('../../../img/icon_snow.png')} />
                            <Text style={{color:'#FFF',fontSize:15, fontWeight: '500'}}>{item.item.name}</Text>
                        </View>
                        <View style={{justifyContent:'center',marginLeft:kScreenWidth - 170 - 50 -50 - 30,width:50}}>
                            <Text style={{color:'#FFF',width:60,fontSize:15,fontWeight:'500'}}>¥{item.item.price?toDecimal(item.item.price):toDecimal(item.item.money)}</Text>
                        </View>
                        <View style={{justifyContent:'center',width:50}}>
                            <Image style={{width:20,height:20,marginLeft:15}} resizeMode={'contain'} source={require('../../../img/chooseBtnWhite.png')}/>
                        </View>
                    </ImageBackground>
                </View>
            );
        } else {
            //未选择情况, 按钮背景切图不带阴影,切图大小不一致
            let height = (kScreenWidth-10)/350*67;
            let marginAdd = 7/350*(kScreenWidth-10);
            let marginTop = 2/350*(kScreenWidth-10);
            let marginBottom = 9/350*(kScreenWidth-10);
            return (
                <View style={{
                    backgroundColor:backGroundColor(),
                    justifyContent:'flex-start',
                    marginHorizontal:5 + marginAdd,
                    marginTop: marginTop,
                    marginBottom: marginBottom,
                    flexDirection:'row',
                    alignItems:'center',
                    width:kScreenWidth - 10 - marginAdd * 2,
                    height:height-marginTop-marginBottom,
                    borderRadius: 7,
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: "#dddddd"}}>
                    <View style={{justifyContent:'center',marginLeft:27-marginAdd,width:150}}>
                        <Text style={{color:'#dddddd',fontSize:15, fontWeight: '500'}}>{item.item.name}</Text>
                    </View>
                    <View style={{justifyContent:'center',marginLeft:kScreenWidth - 170 - 50 -50 - 30,width:50}}>
                        <Text style={{color:'#dddddd',width:60,fontSize:15,fontWeight:'500'}}>¥{item.item.price?toDecimal(item.item.price):toDecimal(item.item.money)}</Text>
                    </View>
                    <View style={{justifyContent: 'center', width: 50, paddingLeft: 15}}>
                        <View style={{justifyContent:'center',width:20, backgroundColor: backGroundColor(), borderRadius: 10, height: 20, borderWidth:1, borderStyle: 'solid', borderColor: '#dddddd'}}></View>
                    </View>
                </View>
            );
        }
    }

    _renderNormalItem(item) {
        let itemSelected;
        if (this.state.advertType === 'platformCoupons' ) {
            if(this.state.selectValue.item === undefined){
                itemSelected = (item.item.id === this.state.selectValue.id);
            }else {
                itemSelected = (item.item.id === this.state.selectValue.item.id);
            }
        }else {
            if (this.state.selectValue.get(this.state.adverData.shop_id)) {
                itemSelected = item.item.id === this.state.selectValue.get(this.state.adverData.shop_id).id;
            } else {
                return <View/>;
            }
        }
        if (itemSelected){
            let height = (kScreenWidth-10)/350*67;
            return (
                <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item)}>
                    <ImageBackground style={{resizeMode:'cover',justifyContent:'flex-start',marginHorizontal:5,flexDirection:'row',alignItems:'center',width:kScreenWidth-10,height:height,paddingBottom:3/67*(height)}}
                                    source={require('../../../img/button_card.png')}>
                        <View style={{justifyContent:'center',marginLeft:27,width:150}}>
                            <Text style={{color:'#FFF',fontSize:15}}>{item.item.name}</Text>
                        </View>
                        <View style={{justifyContent:'center',marginLeft:kScreenWidth - 170 - 50 -50 - 30,width:50}}>
                            <Text style={{color:'#FFF',width:60,fontSize:15,fontWeight:'bold'}}>¥{item.item.price?toDecimal(item.item.price):toDecimal(item.item.money)}</Text>
                        </View>
                        <View style={{justifyContent:'center',width:50}}>
                            <Image style={{width:20,height:20,marginLeft:15}} resizeMode={'contain'} source={require('../../../img/chooseBtnWhite.png')}/>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            );
        } else {
            //未选择情况, 按钮背景切图不带阴影,切图大小不一致
            let height = (kScreenWidth-10)/350*67;
            let marginAdd = 7/350*(kScreenWidth-10);
            let marginTop = 2/350*(kScreenWidth-10);
            let marginBottom = 9/350*(kScreenWidth-10);
            return (
                <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item)}>
                    <View style={{
                        backgroundColor:backGroundColor(),
                        justifyContent:'flex-start',
                        marginHorizontal:5 + marginAdd,
                        marginTop: marginTop,
                        marginBottom: marginBottom,
                        flexDirection:'row',
                        alignItems:'center',
                        width:kScreenWidth - 10 - marginAdd * 2,
                        height:height-marginTop-marginBottom,
                        borderRadius: 7,
                        borderStyle: "solid",
                        borderWidth: 1,
                        borderColor: "#1fdb9b"}}>
                        <View style={{justifyContent:'center',marginLeft:27-marginAdd,width:150}}>
                            <Text style={{color:yfwGreenColor(),fontSize:15}}>{item.item.name}</Text>
                        </View>
                        <View style={{justifyContent:'center',marginLeft:kScreenWidth - 170 - 50 -50 - 30,width:50}}>
                            <Text style={{color:yfwGreenColor(),width:60,fontSize:15,fontWeight:'bold'}}>¥{item.item.price?toDecimal(item.item.price):toDecimal(item.item.money)}</Text>
                        </View>
                        <View style={{justifyContent:'center',width:50}}>
                            <Image style={{width:20,height:20,marginLeft:15}} resizeMode={'contain'} source={require('../../../img/checkout_unsel.png')}/>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
    }


    _renderPlatfromCouponItem(item) {
        let isSelect = true
        if(this.state.selectValue.item === undefined){
            isSelect = (item.item.id === this.state.selectValue.id);
        }else {
            isSelect = (item.item.id === this.state.selectValue.item.id);
        }

        return(
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    flex: 1,
                    marginHorizontal:12,
                    height:100/375.0*kScreenWidth,
                    paddingRight: 12,
                    backgroundColor: '#fff',
                    justifyContent:'space-between',
                    alignItems:'center',
                    flexDirection:'row'}}
                onPress={this.clickItem.bind(this,item)}
                >
                {parseInt(safe(item.item.money))!=0 ?
                    <ImageBackground source={require('../../../img/icon_coupon_backimage.png')} imageStyle={this.props.from!='oto'?{}:{tintColor:o2oBlueColor()}} style={{height:100/375.0*kScreenWidth, width:110/375.0*kScreenWidth, justifyContent:'center', alignItems:'center'}}>
                        <Text style={{color: '#fff', fontSize:21, fontWeight:'bold'}}>￥<Text style={{fontSize:42}}>{safe(item.item.money)}</Text></Text>
                        <Text style={{color:'#fff',fontSize:14}}>{safe(item.item.coupon_des)}</Text>
                    </ImageBackground> : null}
                {parseInt(safe(item.item.money))!=0 ?
                    <View style={{flex:1, height:100/375.0*kScreenWidth, paddingLeft:14, paddingVertical:20/375.0*kScreenWidth, justifyContent:'space-between'}}>
                        <View style={{flexDirection:'row'}}>
                            {safe(item.item.dict_coupons_type).length > 0 ? <View style={{borderColor:this.props.from!='oto'?yfwGreenColor():o2oBlueColor(), borderWidth:1, borderRadius:7, height:16, paddingLeft:5,paddingRight:5, justifyContent:'center', alignItems:'center',marginRight:5}}>
                                <Text style={{color:this.props.from!='oto'?yfwGreenColor():o2oBlueColor(), fontSize:12, includeFontPadding:false}}>{'平台'}</Text>
                            </View> : null}
                            <Text style={{color:darkTextColor(), fontSize:14,fontWeight:'bold'}}>{'所有在售商品可用'}</Text>
                        </View>
                        <Text style={{fontSize:12,color:'#666'}}>{'全商城'}</Text>
                        <Text style={{color:darkTextColor(), fontSize:12}}>{safe(item.item.start_time).replace(/[-]/g,'.')+'-'+safe(item.item.expire_time).replace(/[-]/g,'.')}</Text>
                    </View> :
                    <View style={{flex:1, height:100/375.0*kScreenWidth, paddingLeft:14, justifyContent:'center'}}>
                        <Text style={{color:darkTextColor(), fontSize:14,fontWeight:'bold'}}>{safe(item.item.coupon_des)}</Text>
                    </View>}
                    <Image source={isSelect ? (this.props.from!='oto'?require('../../../img/icon_coupon_select.png'):require('../../O2O/Image/choosed.png')) : require('../../../img/icon_coupon_normal.png')} style={{width:25, height:25, resizeMode:'stretch',tintColor:this.props.from!='oto'?null:o2oBlueColor()}}></Image>
            </TouchableOpacity>
        );
    }

    _renderCouponItem(item) {
        let {coupon_type_select_index} = this.state
        let isSelect
        if(coupon_type_select_index === 0) {
            if (this.state.selectValue.get(this.state.adverData.shop_id)) {
                isSelect = item.item.id === this.state.selectValue.get(this.state.adverData.shop_id).id;
            } else {
                return <View/>;
            }

            return(
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        flex: 1,
                        marginHorizontal:12,
                        height:100/375.0*kScreenWidth,
                        paddingRight: 12,
                        backgroundColor: '#fff',
                        justifyContent:'space-between',
                        alignItems:'center',
                        flexDirection:'row'}}
                    onPress={this.clickItem.bind(this,item)}
                >
                    {parseInt(safe(item.item.money))!=0 ?
                        <ImageBackground source={require('../../../img/icon_coupon_backimage.png')} style={{height:100/375.0*kScreenWidth, width:110/375.0*kScreenWidth, justifyContent:'center', alignItems:'center'}}>
                            <Text style={{color: '#fff', fontSize:21, fontWeight:'bold'}}>￥<Text style={{fontSize:42}}>{safe(item.item.money)}</Text></Text>
                        </ImageBackground> : null}
                    {parseInt(safe(item.item.money))!=0 ?
                        <View style={{flex:1, height:100/375.0*kScreenWidth, paddingLeft:14, paddingVertical:20/375.0*kScreenWidth, justifyContent:'space-between'}}>
                            <View style={{flex:1, flexDirection:'row'}}>
                                {safe(item.item.dict_coupons_type).length > 0 ? <View style={{borderColor:yfwGreenColor(), borderWidth:1, borderRadius:7, height:16, paddingLeft:5,paddingRight:5, justifyContent:'center', alignItems:'center',marginRight:5}}>
                                    <Text style={{color:yfwGreenColor(), fontSize:12, includeFontPadding:false}}>{safe(item.item.dict_coupons_type) == '1'?'店铺':'单品'}</Text>
                                </View> : null}
                                <Text style={{color:darkTextColor(), fontSize:14,fontWeight:'bold'}}>{safe(item.item.coupon_des)}</Text>
                            </View>
                            <Text style={{color:darkTextColor(), fontSize:12}}>{safe(item.item.start_time)+'-'+safe(item.item.expire_time)}</Text>
                        </View> :
                        <View style={{flex:1, height:100/375.0*kScreenWidth, paddingLeft:14, justifyContent:'center'}}>
                            <Text style={{color:darkTextColor(), fontSize:14,fontWeight:'bold'}}>{safe(item.item.coupon_des)}</Text>
                        </View>}
                    <Image source={isSelect ? require('../../../img/icon_coupon_select.png') : require('../../../img/icon_coupon_normal.png')} style={{width:25, height:25, resizeMode:'stretch'}}></Image>
                </TouchableOpacity>
            );
        } else {
            return(
                <View style={{flex:1, marginHorizontal:12, paddingRight: 12,backgroundColor: '#fff'}}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            flex: 1,
                            height:100/375.0*kScreenWidth,
                            justifyContent:'space-between',
                            alignItems:'center',
                            flexDirection:'row'}}
                    >
                        {parseInt(safe(item.item.money))!=0 ?
                            <ImageBackground source={require('../../../img/icon_coupon_backimage.png')} style={{height:100/375.0*kScreenWidth, width:110/375.0*kScreenWidth, justifyContent:'center', alignItems:'center'}}>
                                <Text style={{color: '#fff', fontSize:21, fontWeight:'bold'}}>￥<Text style={{fontSize:42}}>{safe(item.item.money)}</Text></Text>
                            </ImageBackground> : null}
                        {parseInt(safe(item.item.money))!=0 ?
                            <View style={{flex:1, height:100/375.0*kScreenWidth, paddingLeft:14, paddingVertical:20/375.0*kScreenWidth, justifyContent:'space-between'}}>
                                <View style={{flex:1, flexDirection:'row'}}>
                                    {safe(item.item.dict_coupons_type).length > 0 ? <View style={{borderColor:yfwGreenColor(), borderWidth:1, borderRadius:7, height:16, paddingLeft:5,paddingRight:5, justifyContent:'center', alignItems:'center',marginRight:5}}>
                                        <Text style={{color:yfwGreenColor(), fontSize:12, includeFontPadding:false}}>{safe(item.item.dict_coupons_type) == '1'?'店铺':'单品'}</Text>
                                    </View> : null}
                                    <Text style={{color:darkTextColor(), fontSize:14,fontWeight:'bold'}}>{safe(item.item.coupon_des)}</Text>
                                </View>
                                <Text style={{color:darkTextColor(), fontSize:12}}>{safe(item.item.start_time)+'-'+safe(item.item.expire_time)}</Text>
                            </View> :
                            <View style={{flex:1, height:100/375.0*kScreenWidth, paddingLeft:14, justifyContent:'center'}}>
                                <Text style={{color:darkTextColor(), fontSize:14,fontWeight:'bold'}}>{safe(item.item.coupon_des)}</Text>
                            </View>
                        }
                        {item.item.dict_coupons_type==1 && this.props.goToOrder ?
                            <View style={{height:100/375.0*kScreenWidth, paddingVertical:13/375.0*kScreenWidth,justifyContent:'flex-end'}}>
                                <TouchableOpacity
                                    onPress={()=>{
                                        this.props.goToOrder({condition_price:item.item.condition_price,money:item.item.money})
                                    }}
                                >
                                    <ImageBackground
                                        style={{width:79,height:39,alignItems: 'center',justifyContent: 'center'}}
                                        source={require('../../../img/button_djlq.png')}
                                    >
                                        <Text style={{color:'white',fontSize:12,top:-4}}>去凑单</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                            :null
                        }
                    </TouchableOpacity>
                    <View style={{paddingVertical:5,paddingHorizontal: 12}}>
                        <Text style={{fontSize: 13, color: "#333333"}}>{safe(item.item.unavailabledesc)}</Text>
                    </View>
                </View>
            );
        }

    }

    _separator = () => {
        return <View style={{height:10,backgroundColor:backGroundColor()}}/>;
    }

    _header = () => {
        return (
            <View>
                {this.alertTypeViewHeader()}
                {this.alertViewHeaderTitle()}
                <View style={{height:10,backgroundColor:backGroundColor()}}/>
            </View>
        )
    }

    _footer = () => {
        if (this.state.advertType == 'package' && this.state.adverData.isColdPackage) {

            return (
                <View style={{padding: 12}}>
                    <Text style={{color: '#feac4c', fontSize: 12, lineHeight: 17}}>温馨提示：订单中包含必须使用冷藏包装配送的商品，须选择冷藏包装！</Text>
                </View>
            )
        } else {

            return <View style={{height:20,backgroundColor:backGroundColor()}}/>;
        }
    }

    _emptyView() {
        if (this.state.advertType === 'coupon') {
            return (
                <View style={{flex:1, justifyContent:'center', alignItems:'center', paddingTop:50}}>
                    <Image source={require('../../../img/cart_coupon_empty.png')} style={{width:175, height:110, bottom:10}}></Image>
                    <Text style={{fontSize:12, color:'#999999'}}>暂无优惠券</Text>
                </View>)
        }else {
            return <View/>;
        }
    }


     renderAlertView(){
        return(
         <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={isAndroid()?0:150}
         >
             <View style={{height:50,width:kScreenWidth}}>
                 <View style={{flexDirection:'row',height:45,width:kScreenWidth, justifyContent:'space-between', alignItems: 'center'}}>
                     <View style={{height:15,width:15,marginLeft:18}}/>
                     {this.alertViewTitle()}
                     <TouchableOpacity hitSlop={{left:15,top:10,bottom:10,right:0}} onPress={()=>this.closeView()}>
                         <Image style={{width:13,height:13,marginRight:18} } source={require('../../../img/close_button.png')}/>
                     </TouchableOpacity>
                 </View>
             </View>
             {this._header()}
             {this.state.advertType == 'logistic'?this._renderLogisticView(this.flatListDataArray()):
                this.renderContentView()
             }
             {this.state.advertType === 'invoice'
            ?<View style={{marginBottom:11,height:44/667*kScreenHeight,alignItems:'center',marginLeft:6}}/>
            :<View/>}
            {this.state.advertType === 'invoice'
            ?<View style={{position:'absolute',bottom:11,alignItems:'center',marginLeft:6}}>
                <YFWTouchableOpacity style_title={{height:44/667*kScreenHeight, width:kScreenWidth-12, fontSize: 16,}} title={'确定'}
                                            callBack={()=>{this._confirmClickItem(this.state.invoice_title,this.state.invoice_code)}}
                                            enableColors={this.props.from!='oto'?null:[o2oBlueColor(),o2oBlueColor()]}
                                            enableShaowColor={this.props.from!='oto'?null:'rgba(87, 153, 247, 0.5)'}
                                            isEnableTouch={true}/>
            </View>
            :<View/>}
         </KeyboardAvoidingView>
        );
    }

    renderContentView () {
        if (this.state.advertType == 'logistic') {
            return this._renderLogisticView(this.flatListDataArray())
        } else if (this.state.advertType == 'package') {
            if (this.state.adverData.isColdPackage) {
                
                return <FlatList
                        data={this.flatListDataArray()}
                        renderItem={this._renderPackageColdItem.bind(this)}
                        ListFooterComponent={this._footer.bind(this)}
                        ItemSeparatorComponent={this._separator.bind(this)}
                        ListEmptyComponent={this._emptyView.bind(this)}
                        style={{flex:1}}
                    />
            } else {
                return <FlatList
                        data={this.flatListDataArray()}
                        renderItem={this._renderItem.bind(this)}
                        ListFooterComponent={this._footer.bind(this)}
                        ItemSeparatorComponent={this._separator.bind(this)}
                        ListEmptyComponent={this._emptyView.bind(this)}
                        style={{flex:1}}
                    />
            }
        } else {
            return  <FlatList
                    data={this.flatListDataArray()}
                    renderItem={this._renderItem.bind(this)}
                    ListFooterComponent={this._footer.bind(this)}
                    ItemSeparatorComponent={this._separator.bind(this)}
                    ListEmptyComponent={this._emptyView.bind(this)}
                    style={{flex:1}}
                />
        }
    }

    render() {
        return (
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => {}}
                popupWindowHeight={this.state.advertType == 'invoice'?(this.state.isNotNeedInvoice?kScreenHeight*0.4:this.state.kHeight+60):this.state.kHeight}
            >
                {this.renderAlertView()}
            </YFWPopupWindow>
        );
    }

    /**
     * 校验身份证
     */
    verifyCardNum(txt){
        if(isEmpty(txt)){
            return txt
        }
        txt = txt.replace(IDENTITY_CODE, '')
        return txt
    }


}