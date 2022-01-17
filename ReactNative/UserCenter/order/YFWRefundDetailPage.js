import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Platform, FlatList,
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {backGroundColor} from "../../Utils/YFWColor";
import {isEmpty, isNotEmpty, kScreenHeight, kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";
import YFWTitleView from "../../PublicModule/Widge/YFWTitleView";
import YFWGoodsListItemView from "../../widget/YFWGoodsListItemView";
import YFWRefundDetailHeaderView from "./YFWRefundDetailHeaderView";
import YFWToast from "../../Utils/YFWToast";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import RetrunGoodsDetailInfoModel from "./Model/RetrunGoodsDetailInfoModel";
import RetrunGoodsInfoModel from "./Model/RetrunGoodsInfoModel";
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
import StatusView from "../../widget/StatusView";
import OrderClick from "./OrderClick";
import YFWLogisticsInfoView from '../View/YFWLogisticsInfoView';

export default class YFWRefundDetailPage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "退款/退货详情",
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                              onPress={()=>{
                                  navigation.goBack();
                              }}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={ require('../../../img/icon_back_gray.png')}/>
            </TouchableOpacity>
        ),
        headerRight: <View/>
    });

    constructor(parameters) {
        super(parameters);
        this.state = {
            goodsArray:[],
            refundDetailInfo:[],
        }
        this.orderNo = this.props.navigation.state.params.state.mOrderNo
        this.shopName = this.props.navigation.state.params.state.shopName
        this.pageSource = this.props.navigation.state.params.state.pageSource
        this.orderTotal = this.props.navigation.state.params.state.orderTotal
    }
//----------------------------------------------LIFECYCLE-------------------------------------------
    componentWillMount() {

    }

    componentDidMount() {
        this._requestData('init')
    }
//-----------------------------------------------METHOD---------------------------------------------

    _jumpToNegotiationPage(){
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'refund_negotiation',orderNo:this.orderNo})
    }

    _requestData(type){
        this._getReturnGoodsList()
        this._getReturnGoodsOtherInfo(type)
    }

    _getReturnGoodsOtherInfo(type) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnInfo');
        paramMap.set('orderno', this.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            this.status && this.status.dismiss()
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = RetrunGoodsDetailInfoModel.getModelArray(res.result);
            this.setState({
                refundDetailInfo: dataArray[0]
            });
        }, ()=> {this.status && this.status.showNetError()}, isEmpty(type) ? true : false);
    }

    _getReturnGoodsList() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnGoodsInfo');
        paramMap.set('orderno', this.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = RetrunGoodsInfoModel.getModelArray(res.result);
            this.setState({
                goodsArray: dataArray
            });
        }, (error)=> {}, false);
    }

    _returnButtonClick(type) {
        let buttonType;
        var item;
        if (type == 'updateReturnGoods') {//更改退货单详情
            buttonType = 'order_apply_return_update'
        } else if (type == 'orderReturnSend') {//发出退货
            buttonType = 'order_return_send'
        } else if (type == 'orderReturnSendUpdate') {//修改单号
            buttonType = 'order_return_send_update'
        } else if (type == 'cancelReturnGoods') {
            buttonType = 'order_apply_return_cancel'
        }
        item = {
            navigation: this.props.navigation,
            type: buttonType,
            orderNo: this.orderNo,
            orderTotal: this.orderTotal,
            showTips: this._showTipsDialog,
            goBack: this._goBack,
            pageSource: this.pageSource,
            data:this.props.navigation.state.params.state.data,
            logisticsInfoView:this.logisticsInfoView,
            gobackKey: this.props.navigation.state.params.state.gobackKey?this.props.navigation.state.params.state.gobackKey:this.props.navigation.state.key,
        }
        OrderClick.buttonsClick(item)
    }

    _showTipsDialog = (bean) => {
        this.tipsDialog && this.tipsDialog._show(bean)
    }

    _goBack = ()=> {
        let {goBack} = this.props.navigation
        goBack()
    }

    _trackLogistics() {
        let {navigate} =  this.props.navigation;
        let imageUrl = this.state.goodsArray[0].img_url
        pushNavigation(navigate, {type: 'get_logistics',orderNo:this.orderNo,img_url:imageUrl,from:'return'});
    }

//-----------------------------------------------RENDER---------------------------------------------

    _renderStateHeader() {
        let buttonsData = []
        isNotEmpty(this.state.refundDetailInfo.button_items) && this.state.refundDetailInfo.button_items.map((model, index) => {
            buttonsData.push({
                title:model.text,
                method:()=>this._returnButtonClick(model.value)})
        })
        let info = this.state.refundDetailInfo
        let logicInfo = {}
        if (info.status_id == 22) {
            logicInfo.address = '地址:'+info.return_address
            logicInfo.phone = '收货人电话：'
            if(isNotEmpty(info.return_mobile)) {
                logicInfo.phone += info.return_mobile
            }
            if (isNotEmpty(info.return_phone)) {
                logicInfo.phone += " , " + info.return_phone
            }
            logicInfo.name = '收货人：'+info.return_name
        }
        let trafficInfo = {}
        if (info.status_id == 23) {
            trafficInfo.info = '退货物流：' + info.return_traffic_name +'（'+ info.return_trafficno + '）'
            if (info.traffic_state_name&&info.traffic_state_name.length > 0) {
                trafficInfo.status = '状态：' + info.traffic_state_name
            } else {
                trafficInfo.status = ''
            }
        }
        let reason = ''
        if (info.status_id == 28 || info.status_id == 26) {
            reason = this.state.refundDetailInfo.return_reply
        }
        return (
            <View style={{marginBottom:5}}>
                {
                    info.status_id == 25?
                    <YFWRefundDetailHeaderView
                        headerType={'process'}
                        isProcessing={true}
                        title = {this.state.refundDetailInfo.status_desc}
                        timeString = {this.state.refundDetailInfo.status_time}
                        money = {this.state.refundDetailInfo.return_money}
                        context1 = {this.state.refundDetailInfo.description}
                        process={[
                            {msg:'商家同意退款',timeStr:this.state.refundDetailInfo.status_time},
                            {msg:'退款中',timeStr:''},
                            {msg:'退款成功',timeStr:''},
                        ]}
                    />:
                    trafficInfo.info?
                    <YFWRefundDetailHeaderView
                        headerType={'logistics_track'}
                        callBack={()=>{this._trackLogistics()}}
                        title = {this.state.refundDetailInfo.status_desc}
                        timeString = {this.state.refundDetailInfo.status_time}
                        logisticsText1 = {trafficInfo.info}
                        context1 = {trafficInfo.status}
                        button={buttonsData}
                    />:
                    logicInfo.name?
                    <YFWRefundDetailHeaderView
                        headerType={'logistics_sent'}
                        title = {this.state.refundDetailInfo.status_desc}
                        timeString = {this.state.refundDetailInfo.status_time}
                        logisticsText1 = {logicInfo.name}
                        logisticsText2 = {logicInfo.phone}
                        context1 = {logicInfo.address}
                        button= {buttonsData}
                    />:
                    <YFWRefundDetailHeaderView
                        headerType={'buttons'}
                        title = {this.state.refundDetailInfo.status_desc}
                        timeString = {this.state.refundDetailInfo.status_time}
                        context1 = {this.state.refundDetailInfo.description}
                        reason = {reason}
                        button={buttonsData}
                    />
                }
            </View>
        )
    }

    _renderNegotiationButton() {
        return(
            <TouchableOpacity style={[styles.list,{flexDirection:'row',justifyContent:'space-between', alignItems:'center', marginTop:3}]}
                              onPress={()=>{this._jumpToNegotiationPage()}} activeOpacity={1}
            >
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Image style={{width:15,height:15,marginLeft:7,marginRight:7,resizeMode:'stretch'}}
                           source={ require('../../../img/icon_warning_green.png')}/>
                    <Text style={{fontSize: 12,color: "#333333"}}>协商详情</Text>
                </View>
                <Image style={{width:7,height:12,marginLeft:7,resizeMode:'stretch'}}
                       source={ require('../../../img/icon_arrow_gray.png')}/>
            </TouchableOpacity>
        )
    }

    _renderRefundInfo() {
        return(
            <View >
                <View style={{width:kScreenWidth-24,marginVertical:16,marginHorizontal:12,alignItems:'flex-start',justifyContent:'center'}}>
                    <Text style={{fontWeight: '500', fontSize: 13, color: "#333333"}}>退款信息</Text>
                </View>
                <View style={[styles.list,{marginTop:0,backgroundColor:"white", flexDirection:'column', paddingLeft:7, paddingRight:9, paddingVertical:6,marginBottom:5}]}>
                    <FlatList
                        data={this.state.goodsArray}
                        renderItem={this._renderRefundInfoItem}
                        listKey={(item, index) => 'key'+index}>
                        keyExtractor={(item, index) => 'key'+index}
                    </FlatList>
                    {this._renderRefundInfoFooter()}
                </View>
            </View>
        )
    }

    _renderRefundInfoItem = (item)=> {
        return (
            <View>
                <YFWGoodsListItemView
                    isSelectable={false}
                    isSelected={true}
                    isPriceRed={false}
                    goodsImgUrl={item.item.img_url}
                    goodsName={item.item.title}
                    goodsStandard={item.item.standard}
                    goodsPeriodDate={''}
                    goodsQuantity={item.item.quantity}
                    goodsPrice={item.item.price}
                    goodsPrescriptionType={item.item.PrescriptionType}
                    onMethodSelect={()=>{}}
                    onMethodQuantityChange={()=>{}}/>
            </View>
        )
    }

    _renderRefundInfoFooter(){
        if(isEmpty(this.state.refundDetailInfo)){
            return <View/>
        }
        let type = this.state.refundDetailInfo.need_return_status
        let reason = this.state.refundDetailInfo.return_reason
        let money = this.state.refundDetailInfo.return_money
        let time = this.state.refundDetailInfo.apply_time
        let refundOrderNum = this.state.refundDetailInfo.order_return_no
        return (
            <View style={{marginTop:11, marginBottom: 17, paddingHorizontal: 14}}>
                <Text style={styles.textDark}>退款类型:  <Text style={styles.textGray}>{type}</Text></Text>
                <Text style={styles.textDark}>退款原因:  <Text style={styles.textGray}>{reason}</Text></Text>
                <Text style={styles.textDark}>退款金额:  <Text style={styles.textGray}>{money}</Text></Text>
                <Text style={styles.textDark}>申请时间:  <Text style={styles.textGray}>{time}</Text></Text>
                <Text style={styles.textDark}>退款编号:  <Text style={styles.textGray}>{refundOrderNum}</Text></Text>
            </View>
        )
    }

    render() {
        let spaceBHeight = 100
        return (
            <View style={{flex:1, backgroundColor: backGroundColor()}}>
                <ScrollView style={{flex:1}}
                            showsVerticalScrollIndicator={false}>
                    {this._renderStateHeader()}
                    {this._renderNegotiationButton()}
                    {this._renderRefundInfo()}
                    <View style={{height:spaceBHeight}}/>
                </ScrollView>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                <StatusView ref={(item)=>this.status = item} retry={()=>{this._requestData()}} navigation={this.props.navigation}/>
                <YFWLogisticsInfoView ref={(e)=>this.logisticsInfoView=e}  navigation={this.props.navigation} callBack={()=>{
                    this._requestData('init')
                }} ></YFWLogisticsInfoView>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    list: {
        width: kScreenWidth-24,
        borderRadius: 7,
        marginTop:13,
        marginHorizontal:12,
        paddingHorizontal:10,
        paddingVertical:18,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        elevation:1,
        shadowRadius: 8,
        shadowOpacity: 1
    },
    textDark: {
        lineHeight:17,
        fontSize: 12,
        fontWeight:'500',
        color:'#666666'
    },
    textGray: {
        fontSize: 12,
        fontWeight:'normal',
        color:'#999999'
    }
});