import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    DeviceEventEmitter,
    TextInput,
    Animated,
    PanResponder,
    RefreshControl,
    Platform
} from 'react-native';
import {
    adaptSize, dismissKeyboard_yfw,
    getStatusBarHeight, iphoneBottomMargin, isNotEmpty, isEmpty,
    kScreenHeight,
    kScreenWidth, max, safeArray, safe, tcpImage, isAndroid
} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWDiscountText from "../../PublicModule/Widge/YFWDiscountText";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWToast from "../../Utils/YFWToast";
import YFWOTONativeMapView from "../YFWO2OShippingAddress/YFWOTONativeMapView";
import YFWPopupWindow from "../../PublicModule/Widge/YFWPopupWindow";
import StatusView from "../../widget/StatusView";
import ModalView from "../../widget/ModalView";
import YFWSellerFilterBoxView from "../../Goods/view/YFWSellerFilterBoxView";
import TimeStringText from "./components/TimeStringText";
import YFWPaymentDialogView from "../../OrderPay/View/YFWPaymentDialogView";
import YFWO2OCancelOrComfirmModal from "../widgets/YFWO2OCancelOrComfirmModal";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {getItem, kO2OSafetyTipsForSelfFetch, setItem} from "../../Utils/YFWStorage";
import YFWOTONativeOrderMapView from "./components/YFWOTONativeOrderMapView";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";

export default class YFWO2OOrderDetailView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            scrollY:new Animated.Value(adaptSize(300)),
            listScrollY:new Animated.Value(adaptSize(0)),
            scrollEnabled:false,
            statusViewHeight:50,

            isReminderShow:true,
            isGoodsShowMore:false,
            isHiddenButton:true,
            panResponder:this._initPanResponder()
        }
    }

    componentDidUpdate() {
        if(this.props.viewModel?.selfFetchInfoData?.isShowMedicineSaff){
            getItem(kO2OSafetyTipsForSelfFetch).then(
                data=>{
                    if(isEmpty(data)){
                        this._showDrugSafetyModal()
                    }
                }
            )
        }
    }

    componentDidMount() {
        this.didFocus = this.props.viewModel.navigation.addListener('didFocus',
            payload => {
                this.mapView && this.mapView.mapViewFocus()
            }
        );
        this.didBlur = this.props.viewModel.navigation.addListener('didBlur',
            payload => {
                this.mapView && this.mapView.mapViewBlur()
            }
        );
    }

    componentWillUnmount() {
        this.mapView && this.mapView.mapViewWillDisappear()
        this.didFocus && this.didFocus.remove()
        this.didBlur && this.didBlur.remove()
    }

//-----------------------------------------------METHOD---------------------------------------------

    _initPanResponder(){
        return PanResponder.create({
            onStartShouldSetPanResponder: () => !this.state.scrollEnabled,
            onPanResponderMove: (e, gestureState)=>{
                let {dy} = gestureState
                let mScrollY = dy + adaptSize(300)
                this.state.scrollY.setValue(mScrollY)
            },
            onPanResponderRelease: (e, gestureState)=>{
                // console.log(gestureState.vy)
                if(gestureState.vy > 0){
                    this.state.scrollEnabled = false
                    this.setState({})
                    Animated.spring(this.state.scrollY, { toValue: adaptSize(300),}).start(()=>{});
                } else {
                    this.state.scrollEnabled = true
                    this.setState({})
                    Animated.spring(this.state.scrollY, { toValue: 0,}).start();
                }
            }
        })
    }

    _onMomentumScrollEnd(e){
        let {scrollY} = this.state
        let y = e.nativeEvent.contentOffset.y
        if(y <= 0){
            this.setState({
                scrollEnabled : false
            })
            Animated.spring(scrollY, {
                toValue: adaptSize(300),
                duration: 1000
            }).start(
                ()=>{
                    this._scrollView && this._scrollView.scrollTo({x:0,y:0,animated:true})
                }
            );
        }
    }

    _showMoreGoods(){
        this.state.isGoodsShowMore = !this.state.isGoodsShowMore
        this.setState({})
    }

    _showModalView(){
        this.modalView && this.modalView.show()
    }

    _showHiddenButton(){
        this.state.isHiddenButton = !this.state.isHiddenButton
        this.setState({})
    }

    _closeDrugSafetyModal(){
        setItem(kO2OSafetyTipsForSelfFetch,1)
        this.drugSafetyDialog && this.drugSafetyDialog.disMiss()
    }

    _showDrugSafetyModal(){
        this.drugSafetyDialog && this.drugSafetyDialog.show()
    }

    _fetchData(){
        this.props.viewModel._fetchData && this.props.viewModel._fetchData()
    }

    _onClick(type){
        switch (type) {
            case 'order_pay':
                this.PaymentDialog.show(this.props.viewModel.orderNo,false,()=>{this._fetchData()})
                break
            case 'order_cancel':
                this.cancelModal && this.cancelModal.show()
                break
            case 'showMoreButton':
                this._showHiddenButton()
                break
            default:
                this.props.viewModel._onClicked && this.props.viewModel._onClicked(type)
        }

    }

    _toCustomerService(){
        YFWNativeManager.openZCSobot()
    }

    _pageBack(){
        this.props.viewModel._pageBack && this.props.viewModel._pageBack()
    }

    _callStore(){
        this.props.viewModel._makePhoneCall && this.props.viewModel._makePhoneCall()
    }

    _copyToClipboard(text){
        YFWToast('复制成功')
        YFWNativeManager.copyLink(text)
    }

    _gotoRxDetail(){
        this.props.viewModel._gotoRxDetail && this.props.viewModel._gotoRxDetail()
    }

    _gotoStoreDetail(){
        this.props.viewModel._gotoStoreDetail && this.props.viewModel._gotoStoreDetail()
    }

    _gotoInvoiceDetail(data){
        this.props.viewModel._gotoInvoiceDetail && this.props.viewModel._gotoInvoiceDetail(data)
    }

//-----------------------------------------------RENDER---------------------------------------------

    _renderPriceText(price,size,isBold,color){
        return (
            <>
                <Text style={{color:color??'#333', fontSize:adaptSize(size-2)}}>{price<0?'- ¥ ':'¥ '}
                    <Text style={{fontWeight:isBold?'bold':undefined,fontSize:adaptSize(size)}}>{safeArray(toDecimal(price<0?(-price):price)?.split('.'))[0]}</Text>
                    <Text style={{fontWeight:isBold?'bold':undefined,fontSize:adaptSize(size-2)}}>{'.' + safeArray(toDecimal(price<0?(-price):price)?.split('.'))[1]??'00'}</Text>
                </Text>
            </>
        )
    }

    _renderHeaderView(){
        let {listScrollY} = this.state
        let {statusName} = this.props.viewModel
        return (
            <View
                style={{
                    height: adaptSize(50) + getStatusBarHeight(),
                    paddingTop:getStatusBarHeight(),
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent: 'flex-end',
                    width:kScreenWidth,
                }}
                >
                <Animated.View
                    style={{
                        position:'absolute',
                        height: adaptSize(50) + getStatusBarHeight(),
                        paddingTop:getStatusBarHeight(),
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent: 'center',
                        width:kScreenWidth,
                        backgroundColor: '#fff',
                        opacity:listScrollY.interpolate({
                            inputRange: [0, this.state.statusViewHeight, this.state.statusViewHeight+1],
                            outputRange: [0, 1, 1]
                        }),
                    }}
                >
                    <Text style={{fontSize: adaptSize(16), color: "#333333", fontWeight: 'bold'}}>{statusName}</Text>
                </Animated.View>
                <View
                    style={{
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent: 'space-between',
                        width:kScreenWidth,
                    }}
                >
                    <TouchableOpacity
                        style={{width:adaptSize(50),height:adaptSize(50), justifyContent:'center', alignItems:'center'}}
                        onPress={()=>{this._pageBack()}}
                    >
                        <Image style={{width:adaptSize(8),height:adaptSize(14),resizeMode:'stretch',tintColor:'#333'}}
                               source={ require('../../../img/top_back_green.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{width:adaptSize(50),height:adaptSize(50), justifyContent:'center', alignItems:'center'}}
                        onPress={()=>{this._toCustomerService()}}
                    >
                        <Image style={{width:adaptSize(19),height:adaptSize(19),resizeMode:'contain'}}
                               source={ require('../Image/icon_customer_service.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    _renderMapView(){
        let {scrollY} = this.state
        let {mapData} = this.props.viewModel
        return (
            <Animated.View
                style={{position:'absolute',width:kScreenWidth,height:kScreenHeight,backgroundColor:'rgb(221,255,243)',
                    opacity:scrollY.interpolate({
                        inputRange: [0, adaptSize(100), adaptSize(280), adaptSize(280)],
                        outputRange: [0, 0, 1, 1]
                    }),
                }}>
                <YFWOTONativeOrderMapView
                    ref={e => this.mapView = e}
                    style={{width:kScreenWidth,height:kScreenHeight}}
                    mapData={mapData}
                    onClick={()=>{this._showModalView()}}
                    onTimeOut={()=>{this._fetchData()}}
                />
            </Animated.View>
        )
    }

    _renderMapRefreshBtn(){
        let {scrollY, scrollEnabled} = this.state
        let {isNeedMap} = this.props.viewModel
        if(scrollEnabled || !isNeedMap){
            return <></>
        }
        return (
            <Animated.View
                style={{
                    position:'absolute',
                    top:0,
                    width:kScreenWidth,
                    paddingHorizontal:adaptSize(12),
                    opacity:scrollY.interpolate({
                        inputRange: [0, adaptSize(280), adaptSize(280)],
                        outputRange: [0, 1, 1]
                    }),
                }}
            >
                <TouchableOpacity onPress={()=>{this._fetchData()}} activeOpacity={1} style={[style.cardStyle,BaseStyles.centerItem,{elevation:0,width: adaptSize(32), height: adaptSize(32),}]}>
                    <Image style={{width:adaptSize(17),height:adaptSize(17)}}
                           source={require('../Image/icon_reLocation.png')}/>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    _renderStatusView(){
        let {scrollY, scrollEnabled} = this.state
        let {statusName, isNeedMap} = this.props.viewModel
        if(isEmpty(statusName)){
            return <></>
        }
        return (
            <Animated.View
                onLayout={(e)=>{
                    let {x, y, width, height} = e.nativeEvent.layout;
                    this.state.statusViewHeight = height
                }}
                style={{
                    width:kScreenWidth,
                    height: adaptSize(40),
                    paddingLeft:adaptSize(19),
                    opacity:isNeedMap?
                        scrollY.interpolate({
                            inputRange: [0, adaptSize(280), adaptSize(280)],
                            outputRange: [1, 0, 0]
                        })
                        :1,
                }}
            >
                <TouchableOpacity style={{ flexDirection:'row', alignItems: 'center',height:adaptSize(40)}}
                                  onPress={()=>{isNeedMap?scrollEnabled && this._showModalView():this._showModalView()}}>
                    <Text style={{fontWeight:'bold', fontSize: adaptSize(18), color: "#333333"}}>{statusName}</Text>
                    <Image style={{width:adaptSize(10),height:adaptSize(16),marginLeft:adaptSize(8),resizeMode:'stretch',tintColor:'#333'}}
                           source={require('../Image/jump_gray_icon.png')}/>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    _renderReminderView(){
        let {isReminderShow} = this.state
        let {reminderMsg} = this.props.viewModel
        if(isEmpty(reminderMsg)){
            return <></>
        }
        return (
            <View style={{alignItems: 'center'}}>
                {isReminderShow?
                    <View style={[style.cardStyle,{paddingHorizontal:adaptSize(12)}]}>
                        <View style={{width:kScreenWidth-adaptSize(48),flexDirection:'row',paddingVertical:adaptSize(11)}}>
                            <Image style={{width:adaptSize(16),height:adaptSize(16),marginRight:adaptSize(5),resizeMode:'stretch'}}
                                   source={require('../Image/icon_bells.png')}/>
                            <View style={{width:kScreenWidth-adaptSize(94)}}>
                                <Text style={{fontSize: adaptSize(12), color: "#333333", fontWeight:'bold'}}>{reminderMsg}</Text>
                            </View>
                            <TouchableOpacity onPress={()=>{this.setState({isReminderShow:false})}}>
                                <Image style={{width:adaptSize(10),height:adaptSize(10),marginTop:adaptSize(3),marginLeft:adaptSize(5),resizeMode:'stretch',tintColor:'#cccccc'}}
                                       source={require('../Image/icon_delete_white.png')}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    :<></>
                }
            </View>
        )
    }

    _renderActionView(){
        let {actionData} = this.props.viewModel
        if(isEmpty(actionData)){
            return <></>
        }
        let {statusText,buttonsData, statusReason} = actionData
        let buttons = []
        safeArray(buttonsData).map((item, index)=>{
            let {text, color, image, value} = item
            buttons.push(
                <TouchableOpacity
                    key={'buttons'+index}
                    style={{height:adaptSize(45), justifyContent:'space-between', alignItems:'center'}}
                    onPress={()=>{this._onClick(value)}}
                >
                    {isNotEmpty(image)?
                        <Image
                            style={{width:adaptSize(23),height:adaptSize(23),resizeMode:'contain',tintColor:color}}
                            source={image}
                        />
                        :
                        <View style={{width:adaptSize(23),height:adaptSize(23)}}/>}
                    <Text style={{fontSize: adaptSize(11), color: color}}>{text}</Text>
                </TouchableOpacity>
            )
        })
        let {isHiddenButton} = this.state
        return (
            <View style={[style.cardStyle,{justifyContent:'space-between',paddingTop:adaptSize(16),paddingHorizontal:adaptSize(12)}]}>
                <Text style={{fontWeight: "bold", fontSize: adaptSize(16), color: "#333333"}}>{statusText}</Text>
                {isNotEmpty(statusReason)?<Text style={{fontSize: adaptSize(12), color: "#666", marginTop: adaptSize(10)}}>{statusReason}</Text>:<></>}
                <View style={{height:adaptSize(80),justifyContent: 'space-around',alignItems:'center',flexDirection:'row',width:kScreenWidth-adaptSize(48)}}>
                    {buttons}
                </View>
                {isHiddenButton?
                    <></>
                    :
                    <TouchableOpacity
                        onPress={()=>{
                            this._onClick('showMoreButton')
                            this._onClick('order_complaint')
                        }}
                        style={{position:'absolute',right:adaptSize(10),bottom:adaptSize(60),alignItems:'center'}}
                    >
                        <View style={{
                            minWidth:adaptSize(65),
                            padding:adaptSize(10),
                            borderRadius: adaptSize(7),
                            backgroundColor: "#ffffff",
                            shadowColor: "rgba(0, 0, 0, 0.06)",
                            shadowOffset: {
                                width: 0,
                                height: 2
                            },
                            shadowRadius: adaptSize(7),
                            shadowOpacity: adaptSize(1),
                            elevation:3
                        }}
                        >
                            <Text>投诉</Text>
                        </View>
                        <Image style={{width:adaptSize(10),height:adaptSize(6),resizeMode:'stretch',tintColor:'#eee'}}
                               source={require('../../../img/xiala.png')}/>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    _renderRXView(){
        let {rxData, isDeliveryOrder} = this.props.viewModel
        if(isEmpty(rxData)){
            return <></>
        }
        let {title, isFail} = rxData
        let rxStatusTitle = '就诊信息已填写'
        let rxHitText = isDeliveryOrder?'填写就诊信息 > 医院开方 > 商家审方接单 > 骑手配送'
                                       :'填写就诊信息 > 医院开方 > 商家审方接单 > 到店自提'
        return (
            <View style={[style.cardStyle,{paddingHorizontal:adaptSize(12)}]}>
                <View style={{flexDirection:'row',width:kScreenWidth-adaptSize(48), height: adaptSize(42),alignItems: 'center'}}>
                    <View style={{backgroundColor:'#ffe5ec', width: adaptSize(39), height: adaptSize(14),borderRadius: adaptSize(3), justifyContent: 'center', alignItems:'center'}}>
                        <Text style={{fontSize: adaptSize(11),color:'#ff0048',includeFontPadding:false}}>处方药</Text>
                    </View>
                    <Text style={{fontSize: adaptSize(10), color: "#999999",width:kScreenWidth-adaptSize(87), marginLeft:adaptSize(2)}}>{rxHitText}</Text>
                </View>
                <TouchableOpacity onPress={()=>{this._gotoRxDetail()}} style={{width:kScreenWidth-adaptSize(48),paddingVertical:adaptSize(16), height: adaptSize(72),justifyContent:'space-between',borderTopWidth:1,borderColor:'#f5f5f5'}}>
                    <View style={{flexDirection:'row',alignItems: 'center'}}>
                        <Text style={{flex:1, fontSize: adaptSize(14), color: "#5799f7", fontWeight:'bold'}}>{rxStatusTitle}</Text>
                        <Text style={{fontSize: adaptSize(12), color: isFail?'#ff3300':"#5799f7"}}>{title}</Text>
                        <Image style={{width:adaptSize(9),height:adaptSize(14),marginLeft:adaptSize(5),resizeMode:'stretch',tintColor:'#cccccc'}}
                               source={require('../Image/jump_gray_icon.png')}/>
                    </View>
                    <Text style={{fontSize: adaptSize(11), color: "#333333"}}>医生将根据您的就诊信息开具处方</Text>
                </TouchableOpacity>
            </View>
        )
    }

    _renderGoodsInfoView(){
        let {goodsInfoData} = this.props.viewModel
        if(isEmpty(goodsInfoData)){
            return
        }
        let {shopName, discount, pay, goodsData, infoData} = goodsInfoData

        let {selfFetchInfoData, isDeliveryOrder} = this.props.viewModel
        let isShowOrderBuyAgain = false
        if(!isDeliveryOrder && isNotEmpty(selfFetchInfoData)){
            isShowOrderBuyAgain = selfFetchInfoData.isShowOrderBuyAgain
        }
        let {isGoodsShowMore} = this.state
        let goodsBundle = []
        goodsData.map((item,index)=>{
            let {image,name,icon,standard,price,quantity,id} = item
            if(!isGoodsShowMore && index > 2){
                return
            }
            goodsBundle.push(
                <View key={'goodsBundle'+index} style={{flexDirection:'row',alignItems: 'center', height:adaptSize(60)}}>
                    <View style={{height: adaptSize(47), width:adaptSize(47), borderRadius: adaptSize(3),borderWidth: adaptSize(1), borderColor: "#f0f0f0"}}>
                        <Image style={{height: adaptSize(45), width:adaptSize(45),resizeMode:'contain'}}
                               source={{uri:tcpImage(safe(image))}}/>
                    </View>
                    <View style={{marginLeft:adaptSize(13), flex:1}}>
                        <View style={{flexDirection:'row', alignItems: 'center', height:23}}>
                            {isNotEmpty(icon)?
                                <Image style={{height: adaptSize(12), width:adaptSize(20), marginRight:adaptSize(4),resizeMode:'stretch'}}
                                       source={icon}/>
                                       :<></>}
                            <View style={{width:adaptSize(180)}}>
                                <Text style={{fontSize: adaptSize(13), color: "#333333"}} numberOfLines={1}>{name}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', height:23}}>
                            <Text style={{fontSize: adaptSize(10), color: "#999999"}}>{standard}</Text>
                        </View>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                        <View style={{flexDirection:'row', alignItems: 'center', height:23}}>
                            {this._renderPriceText(price, 14, true)}
                        </View>
                        <View style={{flexDirection:'row', height:23}}>
                            <Text style={{fontSize: adaptSize(10), color: "#999999"}}>{'x ' + quantity}</Text>
                        </View>
                    </View>
                </View>
            )
        })
        if(goodsData.length > 3){
            goodsBundle.push(
                <TouchableOpacity onPress={()=>{this._showMoreGoods()}} style={{height:adaptSize(40), alignItems: 'center',}}>
                    <View style={{flexDirection:'row',alignItems: 'center'}}>
                        <Text style={{fontSize: adaptSize(10), color: "#999999"}}>{!isGoodsShowMore?'展开':'收起'}{"（共"+goodsData.length+"件）"}</Text>
                        <Image style={{width:adaptSize(9),height:adaptSize(5),marginLeft:adaptSize(5),resizeMode:'stretch',tintColor:'#999'}}
                               source={!isGoodsShowMore?require('../../../img/arrow_down_white.png'):require('../../../img/arrow_up_white.png')}/>
                    </View>
                </TouchableOpacity>
            )
        }
        let infoBundle = []
        infoData.map((item,index)=>{
            let {title, price ,invoiceData} = item
            infoBundle.push(
                <View key={'infoBundle'+index} style={{height:adaptSize(30), flexDirection:'row', justifyContent:'space-between', alignItems: 'center'}}>
                    <Text style={{fontSize: adaptSize(12), color: "#666666"}}>{title}</Text>
                    {invoiceData?
                        <TouchableOpacity
                            onPress={()=>invoiceData.hasInvoice && this._gotoInvoiceDetail(invoiceData.invoice_info)}
                            activeOpacity={1}
                            style={{flexDirection: 'row',alignItems:'center'}}
                        >
                            <Text style={style.infoMsg}>{invoiceData.title}</Text>
                            {invoiceData.hasInvoice?<Image style={{width:adaptSize(7),height:adaptSize(14),marginLeft:adaptSize(4),resizeMode:'stretch',tintColor:'#ccc'}}
                                       source={require('../Image/icon_detail_white.png')}/>:<></>}
                        </TouchableOpacity>
                        :
                        <View style={{flexDirection:'row', alignItems: 'center'}}>
                           {this._renderPriceText(price, 14, true)}
                        </View>
                    }
                </View>
            )
        })
        return (
            <View style={[style.cardStyle,{paddingHorizontal:adaptSize(12)}]}>
                <View
                    style={{
                        width:kScreenWidth-adaptSize(48),
                        flexDirection:'row',
                        justifyContent: 'space-between',
                        paddingVertical:adaptSize(16),
                        alignItems:'center',
                        borderBottomWidth:1,
                        borderColor:'#f5f5f5'
                    }}
                >
                    <TouchableOpacity
                        onPress={()=>{this._gotoStoreDetail()}}
                        style={{flexDirection:'row', alignItems:'center',}}
                    >
                        <Text style={{maxWidth:isShowOrderBuyAgain?adaptSize(240):adaptSize(290),fontSize: adaptSize(15), color: "#333333", fontWeight:'bold'}} numberOfLines={1}>{shopName}</Text>
                        <Image style={{width:adaptSize(9),height:adaptSize(14),marginLeft:adaptSize(5),resizeMode:'stretch',tintColor:'#cccccc'}}
                               source={require('../Image/jump_gray_icon.png')}/>
                    </TouchableOpacity>
                    {isShowOrderBuyAgain?
                        <TouchableOpacity
                            onPress={()=>{this._onClick('order_buy_again')}}
                            style={{flexDirection:'row', alignItems:'center',}}
                        >
                            <Image style={{width:adaptSize(16),height:adaptSize(18),marginLeft:adaptSize(6),resizeMode:'stretch',tintColor:'#5799f7'}}
                                   source={require('../Image/icon_again_order.png')}/>
                            <Text style={{fontSize: adaptSize(13), color: "#5799f7"}}>{'再来一单'}</Text>
                        </TouchableOpacity>
                        :
                        <></>
                    }
                </View>

                <View style={{paddingVertical:adaptSize(10)}}>
                    {goodsBundle}
                </View >

                <View style={{paddingBottom:adaptSize(10)}}>
                    {infoBundle}
                </View >

                <View style={{width:kScreenWidth-adaptSize(48),flexDirection:'row',alignItems: 'flex-end',paddingVertical:adaptSize(16),borderTopWidth:1,borderColor:'#f5f5f5'}}>
                    <Image style={{width:adaptSize(16),height:adaptSize(16),marginRight:adaptSize(5),resizeMode:'stretch'}}
                           source={require('../Image/phone_blue.png')}/>
                    <TouchableOpacity onPress={()=>{this._callStore()}}>
                        <Text style={{fontSize: adaptSize(12), color: "#5799f7"}}>商家电话</Text>
                    </TouchableOpacity>
                    <View style={{flex:1,width:100, flexDirection:'row',justifyContent:'flex-end', alignItems: 'flex-end'}}>
                        {isNotEmpty(discount) && toDecimal(discount) !== '0.00'?
                            <Text style={{fontSize: adaptSize(12), color: "#666666"}}>已优惠 <Text style={{color: "#ff3300"}}>￥{toDecimal(discount)}</Text></Text>
                            :<></>
                        }
                        <Text style={{fontSize: adaptSize(12), color: "#666666"}}>  实付 </Text>
                        <YFWDiscountText style_view={{marginTop:0}} style_text={{fontSize:adaptSize(16),color:'#333333',fontWeight:'bold'}} value={'¥'+toDecimal(pay)}/>
                    </View>
                </View>
            </View>
        )
    }

    _renderDeliveryInfoView(){
        let {deliveryData} = this.props.viewModel
        if(isEmpty(deliveryData)){
            return <></>
        }
        let {expectedTime,deliveryType,address,name,phone} = deliveryData
        return (
            <View style={[style.cardStyle,{paddingHorizontal:adaptSize(12)}]}>
                <View style={{width:kScreenWidth-adaptSize(48),flexDirection:'row',paddingVertical:adaptSize(16),alignItems:'center',borderBottomWidth:1,borderColor:'#f5f5f5'}}>
                    <Text style={{fontSize: adaptSize(15), color: "#333333", fontWeight:'bold'}}>配送信息</Text>
                </View>
                <View style={{paddingVertical:adaptSize(10)}}>
                    <View style={style.infoItem}>
                        <Text style={style.infoTitle}>期望时间</Text>
                        <Text style={style.infoMsg}>{expectedTime}</Text>
                    </View>
                    <View style={[style.infoItem]}>
                        <Text style={style.infoTitle}>配送地址</Text>
                        <Text style={style.infoMsg}>{address + '\r\n' + name + ' ' + phone}</Text>
                    </View>
                    <View style={style.infoItem}>
                        <Text style={style.infoTitle}>配送方式</Text>
                        <Text style={style.infoMsg}>{deliveryType}</Text>
                    </View>
                </View>
            </View>
        )
    }

    _renderOrderInfoView(){
        let {orderInfoData} = this.props.viewModel
        if(isEmpty(orderInfoData)){
            return
        }
        let {orderId,time,payType,remark} = orderInfoData
        return (
            <View style={[style.cardStyle,{paddingHorizontal:adaptSize(12)}]}>
                <View style={{width:kScreenWidth-adaptSize(48),flexDirection:'row',paddingVertical:adaptSize(16),alignItems:'center',borderBottomWidth:1,borderColor:'#f5f5f5'}}>
                    <Text style={{fontSize: adaptSize(15), color: "#333333", fontWeight:'bold'}}>订单信息</Text>
                </View>
                <View style={{paddingVertical:adaptSize(10)}}>
                    <View style={style.infoItem}>
                        <Text style={style.infoTitle}>订单号</Text>
                        <View style={{flexDirection: 'row',alignItems:'center'}}>
                            <Text style={style.infoMsg}>{orderId}</Text>
                            <TouchableOpacity onPress={()=>this._copyToClipboard(orderId)} hitSlop={{left:10,top:10,bottom:10,right:10}}>
                                <Image style={{width:adaptSize(12),height:adaptSize(12),marginLeft:adaptSize(5),resizeMode:'stretch'}}
                                       source={require('../Image/icon_copy.png')}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {isNotEmpty(payType)?
                        <View style = {style.infoItem}>
                            <Text style = {style.infoTitle}>支付方式</Text>
                            <Text style = {style.infoMsg}>{payType}</Text>
                        </View> : <></>
                    }
                    <View style={style.infoItem}>
                        <Text style={style.infoTitle}>下单时间</Text>
                        <Text style={style.infoMsg}>{time}</Text>
                    </View>
                    {isNotEmpty(remark)?
                        <View style={[style.infoItem,{height:undefined,alignItems: 'flex-start', paddingTop:adaptSize(6), paddingBottom:adaptSize(10)}]}>
                            <Text style={style.infoTitle}>下单备注</Text>
                            <Text style={[style.infoMsg,{width:adaptSize(180),textAlign:'right'}]}>{remark}</Text>
                        </View>
                        :<></>
                    }
                </View>

            </View>
        )
    }

    _renderSelfFetchInfoView(){
        let {selfFetchInfoData} = this.props.viewModel
        if(isEmpty(selfFetchInfoData)){
            return <></>
        }
        let {statusTitle,
            waitPayTime,
            statusReason,
            shopName,
            fetchCode,
            businessHours,
            shopAddress,
            fetchTime,
            phone,
            buttonsData,
            isShowMedicineSaff,
        } = selfFetchInfoData
        let buttonBundle = []
        safeArray(buttonsData).map((item,index)=>{
            let {isPayButton,text,value} = item
            buttonBundle.push(
                <TouchableOpacity
                    key={'buttonBundle'+index}
                    onPress={()=>{this._onClick(value)}}
                    style={{margin:adaptSize(6),justifyContent:'center',alignItems:'center',minWidth: adaptSize(88),paddingHorizontal:adaptSize(5), height: adaptSize(29), borderRadius: adaptSize(14), backgroundColor: isPayButton?'#5799f7':'#fff', borderWidth: 1, borderColor: isPayButton?'#5799f7':'#bbbbbb'}}
                >
                    <Text style={{fontSize: adaptSize(13), color: isPayButton?"#ffffff":'#666666'}}>{text}</Text>
                </TouchableOpacity>
            )
        })
        return (
            <View style={[style.cardStyle]}>
                <View style={{width:kScreenWidth-adaptSize(48),paddingHorizontal:adaptSize(12),paddingVertical:adaptSize(16),borderBottomWidth:1,borderColor:'#f5f5f5'}}>
                     {safe(statusTitle).search('X') === -1 ?
                         <Text style={{fontSize: adaptSize(15), color: "#333333", fontWeight:'bold'}}>
                            {statusTitle}
                         </Text>
                         :
                         <Text style={{fontSize: adaptSize(15), color: "#333333", fontWeight:'bold'}}>
                             {safe(statusTitle).split('X')[0] + ' '}
                             {waitPayTime > 0?<TimeStringText style={{color:'#ff3300'}} timeString={waitPayTime} callBack={()=>{this._fetchData()}}/>:<></>}
                             {' ' + safe(statusTitle).split('X')[1]}
                         </Text>
                     }
                    {isNotEmpty(statusReason)?
                        <Text style={{fontSize: adaptSize(12), color: "#666666", marginTop: adaptSize(6)}}>{statusReason}</Text>
                        :<></>
                    }
                </View>
                <View style={{paddingVertical:adaptSize(10),paddingHorizontal:adaptSize(12)}}>
                    <View style={{paddingBottom:adaptSize(15), justifyContent: 'space-between',width:kScreenWidth-adaptSize(48),flexDirection:'row',alignItems:'center'}}>
                        <View style={{flexDirection: 'row',alignItems:'center'}}>
                            <Image style={{width:adaptSize(14),height:adaptSize(14),marginRight:adaptSize(5),resizeMode:'stretch',tintColor:'#333333'}}
                                   source={require('../Image/shops.png')}/>
                            <Text style={{fontSize: adaptSize(14), color: "#333333", fontWeight:'bold', width:isNotEmpty(fetchCode)?adaptSize(190):adaptSize(250)}} numberOfLines={1}>{shopName}</Text>
                        </View>
                        <View>
                            {isNotEmpty(fetchCode)?
                                <Text style={{fontSize: adaptSize(14), color: "#333333", fontWeight: 'bold'}}>自提码 <Text style={{color:"#5799f7"}}>{fetchCode}</Text></Text>
                                :<></>
                            }
                        </View>
                    </View>
                    {isNotEmpty(businessHours) && <View style={style.infoItem}>
                        <Text style={[style.infoTitle,{fontSize: adaptSize(14)}]}>营业时间</Text>
                        <Text style={[style.infoMsg,{fontSize: adaptSize(14)}]}>
                            {'每日'}
                            <Text style={{color: "#5799f7"}}>{safe(businessHours).split('-')[0]}</Text>
                            {
                                safe(businessHours).split('-').length > 1?
                                    <>
                                        <Text style={{color: "#333333"}}>{'到'}</Text>
                                        <Text style={{color: "#5799f7"}}>{safe(businessHours).split('-')[1]}</Text>
                                    </>
                                :<></>
                            }
                        </Text>
                    </View>}
                    <View style={style.infoItem}>
                        <Text style={[style.infoTitle,{fontSize: adaptSize(14)}]}>商家地址</Text>
                        <View style={{flexDirection: 'row',alignItems:'center'}}>
                            <Text style={[style.infoMsg,{fontSize: adaptSize(14)}]}>{shopAddress}</Text>
                            <TouchableOpacity onPress={()=>this._copyToClipboard(shopAddress)} hitSlop={{left:10,top:10,bottom:10,right:10}}>
                                <Image style={{width:adaptSize(12),height:adaptSize(12),marginLeft:adaptSize(5),resizeMode:'stretch'}}
                                       source={require('../Image/icon_copy.png')}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {isEmpty(fetchTime)?
                        <></>:
                        <View style={style.infoItem}>
                            <Text style={[style.infoTitle,{fontSize: adaptSize(14)}]}>自提时间</Text>
                            <Text style={[style.infoMsg,{fontSize: adaptSize(14)}]}>{fetchTime}</Text>
                        </View>
                    }
                    <View style={style.infoItem}>
                        <Text style={[style.infoTitle,{fontSize: adaptSize(14)}]}>预留电话</Text>
                        <Text style={[style.infoMsg,{fontSize: adaptSize(14)}]}>{phone}</Text>
                    </View>
                </View>
                <View style={{flexDirection: 'row',marginBottom:adaptSize(15),width:kScreenWidth - adaptSize(24),paddingHorizontal:adaptSize(6) ,flexWrap:'wrap'}}>
                    {buttonBundle}
                </View>
                {isShowMedicineSaff?
                    <TouchableOpacity
                        onPress={()=>{this._showDrugSafetyModal()}}
                        style={{
                            backgroundColor: "#fffff5",
                            height: adaptSize(30),
                            flexDirection: 'row',
                            alignItems:'center',
                            justifyContent: 'space-between',
                            paddingHorizontal:adaptSize(12),
                            borderBottomLeftRadius: adaptSize(7),
                            borderBottomRightRadius: adaptSize(7),
                        }}
                    >
                        <Text style={{color: "#feac4c", fontSize: adaptSize(12)}}>用药安全提醒</Text>
                        <Text style={{color: "#5799f7", fontSize: adaptSize(12)}}>点击查看</Text>
                    </TouchableOpacity>
                    :<></>}
            </View>
        )
    }

    _renderOrderStatusModal(){
        let {statusList} = this.props.viewModel
        if(isEmpty(statusList)){
            return <></>
        }
        let orderStatusArray = statusList
        let orderStatusBundle = []
        orderStatusArray.map((item,index)=>{
            let {statusText,create_time, statusMsg} = item
            let isFirst = index === 0
            let isLast = index === orderStatusArray.length - 1
            orderStatusBundle.push(
                <View key={'orderStatusBundle' + index} style={{height:adaptSize(60), flexDirection: 'row', justifyContent: 'space-between', alignItems:'center'}}>
                    <View style={{flexDirection: 'row', alignItems:'center'}}>
                        {isFirst && isLast?
                            <></>:
                            <View
                                style={{
                                    backgroundColor:'#abccfb',
                                    width:adaptSize(1),
                                    height:(isFirst||isLast)?adaptSize(30):adaptSize(60),
                                    top:(isFirst||isLast)?(isFirst?adaptSize(16):-adaptSize(16)):adaptSize(0),
                                    left:adaptSize(8)
                                }}
                            />
                        }
                        <View style={[BaseStyles.centerItem,{padding:adaptSize(2), backgroundColor:'#fff'}]}>
                            <View style={[style.bluePoint,{borderColor:isLast?'#abccfb':'#5799f7'}]}/>
                        </View>
                        <View style={{paddingTop:adaptSize(18),width:isNotEmpty(create_time)?adaptSize(180):adaptSize(290), height:adaptSize(60), paddingLeft:adaptSize(12)}}>
                            <Text style={{fontSize: adaptSize(14), color: "#333333"}}>
                                {statusText}
                                {isNotEmpty(statusMsg)?
                                    <Text style={{fontSize: adaptSize(12), color: "#666666"}}>
                                        {'\r\n' + statusMsg}
                                    </Text>:<></>}
                            </Text>
                        </View>
                    </View>
                    <Text style={{fontSize: adaptSize(12), color: "#333333"}}>{create_time}</Text>
                </View>
            )
        })
        let popupWindowHeight = Math.min((orderStatusArray.length + 1) * adaptSize(60) + adaptSize(80),kScreenHeight*(3/5))
        return (
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => {}}
                backgroundColor={'white'}
                popupWindowHeight={popupWindowHeight}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',height:adaptSize(60),width:kScreenWidth,paddingHorizontal:adaptSize(18), }}>
                    <View/>
                    <Text style={{fontSize: 16, color: "#333333", fontWeight: 'bold'}}>订单跟踪</Text>
                    <TouchableOpacity
                        hitSlop={{left:10,top:10,bottom:10,right:10}}
                        onPress={()=>{this.modalView && this.modalView.disMiss()}}
                    >
                        <Image style={{width:adaptSize(10),height:adaptSize(10),resizeMode:'stretch',tintColor:'#ccc'}}
                               source={require('../Image/icon_delete_white.png')}/>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    style={{paddingHorizontal:adaptSize(24), height:popupWindowHeight - adaptSize(60) -adaptSize(80)}}
                >
                    {orderStatusBundle}
                    <View style={{height:adaptSize(80)}}/>
                </ScrollView>
            </YFWPopupWindow>
        )
    }

    _renderDrugSafetyModal(){
        return (
            <ModalView
                ref={(c) => this.drugSafetyDialog = c}
                animationType="fade"
                transparent={true}
            >
                <View style={[{alignItems:'center',justifyContent:'center',flex:1,backgroundColor: 'rgba(0, 0, 0, 0.4)'}]}>
                    <View style={{
                        width: adaptSize(324),
                        height: adaptSize(360),
                        borderRadius:adaptSize(7),
                        backgroundColor:'#fff',
                        paddingVertical:adaptSize(37),
                        paddingHorizontal:adaptSize(17),
                    }}>
                        <Text style={{width: adaptSize(290),marginBottom:adaptSize(20),textAlign:'center',fontSize: adaptSize(16), color: "#333333", fontWeight: 'bold'}}>购药安全提醒</Text>
                        <Text style={{fontSize: adaptSize(12),marginBottom:adaptSize(17), color: "#feac4c", fontWeight: 'bold'}}>为保证购药安全，请确认所收商品相关信息，包括：</Text>
                        <Text style={{fontSize: adaptSize(12), color: "#333333", lineHeight: 22,}}>{'1.查看商品外包装，确认是否有人为刮损、涂改； \r\n2.查看商品[生产日期、有效期至]，确认是否已过期； \r\n3.查看商品[规格、数量、批准文号]，确认是否一致； \r\n4.查看商品，确认是否破损；'}</Text>
                        <Text style={{fontSize: adaptSize(12), color: "#ff3300"}}>一经确认，不可退款退货</Text>
                        <TouchableOpacity
                            onPress={()=>{this._closeDrugSafetyModal()}}
                            style={[BaseStyles.centerItem,{position:'absolute',left:adaptSize(95),bottom:adaptSize(37),width: adaptSize(133), height: adaptSize(40), borderRadius: adaptSize(20), backgroundColor: "#5799f7"}]}
                        >
                            <Text style={{fontSize: adaptSize(16), color: "#ffffff"}}>我知道了</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalView>
        )
    }

    render() {
        let {scrollY,listScrollY, scrollEnabled,panResponder } = this.state
        let {isDeliveryOrder, isNeedMap} = this.props.viewModel
        return (
            <View style={{flex:1,backgroundColor:'#f5f5f5'}}>
                {isNeedMap && this._renderMapView()}
                {this._renderHeaderView()}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={{
                        top:isNeedMap?
                            scrollY.interpolate({
                                inputRange: [-1,0, kScreenHeight],
                                outputRange: [0, 0, kScreenHeight]
                            }):0,
                        flex:1}}
                >
                    <Animated.View
                        style={{
                            height:kScreenHeight,
                            width:kScreenWidth,
                            position:'absolute',
                            backgroundColor:'#f5f5f5',
                            opacity: scrollY.interpolate({
                                inputRange: [0, adaptSize(280), adaptSize(280)],
                                outputRange: [1, 0, 0]
                            })
                        }}
                    />
                    <ScrollView
                        ref={(scrollView)=>this._scrollView = scrollView}
                        style={{flex:1}}
                        contentContainerStyle={style.scrollViewContainer}
                        onMomentumScrollEnd={isNeedMap&&isAndroid()?this._onMomentumScrollEnd.bind(this):()=>{}}
                        scrollEnabled={isNeedMap?scrollEnabled:true}
                        onScrollEndDrag={isNeedMap&&!isAndroid()?this._onMomentumScrollEnd.bind(this):()=>{}}
                        onScroll={Animated.event([{ nativeEvent: {contentOffset: {y: listScrollY}}}])}
                        showsVerticalScrollIndicator={false}
                    >
                        {isDeliveryOrder?
                            <>
                                {this._renderStatusView()}
                                {this._renderMapRefreshBtn()}
                                {this._renderReminderView()}
                                {this._renderActionView()}
                                {this._renderRXView()}
                                {this._renderGoodsInfoView()}
                                {this._renderDeliveryInfoView()}
                                {this._renderOrderInfoView()}
                            </>
                            :
                            <>
                                {this._renderStatusView()}
                                {this._renderMapRefreshBtn()}
                                {this._renderReminderView()}
                                {this._renderSelfFetchInfoView()}
                                {this._renderRXView()}
                                {this._renderGoodsInfoView()}
                                {this._renderOrderInfoView()}
                            </>

                        }
                    </ScrollView>
                </Animated.View>
                {this._renderOrderStatusModal()}
                {this._renderDrugSafetyModal()}
                <YFWO2OCancelOrComfirmModal
                    ref={(ref) => this.cancelModal = ref}
                    title={'确定取消订单吗?'}
                    confirmText={'确定'}
                    confirmOnPress={()=>{
                        this.cancelModal && this.cancelModal.disMiss()
                        this.props.viewModel._onClicked && this.props.viewModel._onClicked('order_cancel')
                    }}
                />
                <YFWPaymentDialogView
                    ref={(dialog) => {this.PaymentDialog = dialog;}}
                    navigation={this.props.viewModel.navigation}
                />
            </View>
        )
    }

}

const style = StyleSheet.create({
    scrollViewContainer: {
        alignItems: 'center',
        paddingBottom: 50+iphoneBottomMargin(),
    },
    cardStyle:{
        width: kScreenWidth-adaptSize(24),
        marginTop:adaptSize(6),
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(0, 0, 0, 0.04)",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 13,
        shadowOpacity: 1,
        elevation:1,
    },
    infoItem:{
        alignItems: 'flex-start',
        paddingBottom:adaptSize(15),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoTitle:{
        fontSize: adaptSize(12),
        color: "#666666"
    },
    infoMsg:{
        fontSize: adaptSize(12),
        width:adaptSize(200),
        textAlign:'right',
        fontWeight:'bold',
        color: "#333333"
    },
    bluePoint:{
        width: adaptSize(11),
        height: adaptSize(11),
        borderRadius:adaptSize(9),
        borderStyle: "solid",
        borderWidth: adaptSize(3),
        borderColor: "#5799f7",
    }
});
