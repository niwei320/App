/**
 * 商店、订单商品
 */
import React, {Component} from 'react'
import {View, ImageBackground, Image, Text, TouchableOpacity, SectionList, StyleSheet} from 'react-native'
import {
    kScreenWidth,
    tcpImage,
    yfw_domain,
    safe,
    safeObj,
    isNotEmpty,
    isEmpty
} from '../../../PublicModule/Util/YFWPublicFunction'
import {darkLightColor,darkNomalColor,darkTextColor,yfwLineColor} from '../../../Utils/YFWColor'
import {toDecimal} from "../../../Utils/ConvertUtils";
import YFWDiscountText from '../../../PublicModule/Widge/YFWDiscountText'
import BaseTipsDialog from "../../../PublicModule/Widge/BaseTipsDialog"
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel'
import {pushNavigation} from '../../../Utils/YFWJumpRouting'
import YFWNativeManager from '../../../Utils/YFWNativeManager'
import YFWToast from '../../../Utils/YFWToast'
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_SINGLE,
    TYPE_OTC
} from "../../../widget/YFWPrescribedGoodsTitle";
import { getAuthUrlWithCallBack } from '../../../Utils/YFWInitializeRequestFunction';

export default class YFWOrderDetailStoreCell extends Component {

    constructor(props) {
        super(props)
        this.isERPOrder = isNotEmpty(this.props.from) && this.props.from === 'ErpOrderDetail'
        this.canClick = true
    }

    render() {
        let model = this.props.model
        return(
            <View style={[styles.container,{backgroundColor: this.isERPOrder?'transparent':'#fff'}]}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{flex:1, flexDirection:'row', alignItems:'center' ,paddingVertical:10}}
                    onPress={this._gotoShop.bind(this)}>
                    <Image source={require('../../../../img/order_detail_store.png')} style={{width:14, height:14, resizeMode:'contain',tintColor:this.isERPOrder?'#fff':undefined}}/>
                    <Text style={{flex:1, color: this.isERPOrder?'#fff':darkTextColor(), fontSize:15, fontWeight:'bold', left:5}}>{model.store_name}</Text>
                </TouchableOpacity>
                <SectionList
                    style={styles.goods}
                    sections={model.goods_items}
                    renderItem={this._renderGoodsItem.bind(this)}
                    renderSectionHeader={this._renderSectionHeader.bind(this)}
                    keyExtractor={(item, index) => index}
                />
                {this.isERPOrder?<View/>:this._renderContactView(model)}
            </View>
        )
    }

    _renderGoodsItem(item) {
        return(
            <View style={{flex:1}}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{flex:1, flexDirection:'row', alignItems:'center', paddingVertical:10}}
                    onPress={() => {
                        this._gotoMedicineDetail(item.item)
                    }}>
                    <Image source={{uri:this.isERPOrder?safe(item.item.img_url):tcpImage(safe(item.item.img_url))}} style={{width:70, height:70, resizeMode:'contain'}}/>
                    <View style={{flex:1, paddingVertical:7,paddingLeft:10}}>
                        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                            <View style={{flex:1}}>
                                {this._renderTitleView(item.item)}
                            </View>
                            <View>
                                <YFWDiscountText navigation={this.props.navigation} style_view={{marginLeft:15}} style_text={{color:darkTextColor(),fontSize:15,fontWeight:'500'}} value={'¥'+toDecimal(item.item.price)}/>
                            </View>
                        </View>
                        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between',paddingTop:5}}>
                            <Text style={{color:darkLightColor(), fontSize:13}}>{item.item.standard}</Text>
                            <Text style={{color:darkLightColor(), fontSize:13}}>{'x'+item.item.quantity}</Text>
                        </View>
                        {isNotEmpty(item.item.period_to_Date)?<Text style={{fontSize:12,color:'#999',marginTop:5}}>{'有效期至:  '+item.item.period_to_Date}</Text>:null}
                    </View>
                </TouchableOpacity>
            </View>

        )
    }

    _renderSectionHeader(item) {
        if(item.section.package_type != -1) {
            return(
                <View style={{flex:1}}>
                    <View style={{flex:1,height:1, backgroundColor:yfwLineColor(), opacity:0.2}} ></View>
                    <View style={{flex:1, flexDirection:'row', paddingTop:10}}>
                        <ImageBackground source={item.section.package_type == 0 ? require('../../../../img/Label_taocan.png') : require('../../../../img/Label_liaocheng.png')} style={{width:42, height:15, justifyContent:'center', alignItems:'center', marginRight:10}} imageStyle={{resizeMode:'contain'}}>
                            <Text style={{fontSize:10, color:'#fff'}}>{item.section.package_type == 0 ? '套餐' : '多件装'}</Text>
                        </ImageBackground>
                        <Text style={{flex:1, color:darkNomalColor(), fontSize:12}}>{item.section.package_name}</Text>
                    </View>
                </View>
            )
        }else {
            return<View/>
        }
    }

    /** 前往商家 */
    _gotoShop() {
        if(this.isERPOrder){
            return
        }
        let {navigate} = this.props.navigation
        pushNavigation(navigate, {type: 'get_shop_detail', value: this.props.model.store_id})
    }

    /** 前往药品详情 */
    _gotoMedicineDetail(item) {
        if(this.isERPOrder){
            return
        }
        let {navigate} = this.props.navigation
        pushNavigation(navigate, {type: 'get_shop_goods_detail', value:item.shop_goods_id, img_url:tcpImage(safe(item.img_url))})
    }

    _renderTitleView(item) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(item).PrescriptionType+"" === "1"){
            return this._rednerPrescriptionLabel(TYPE_SINGLE,item.title)
        }
        //双轨药
        else if(safeObj(item).PrescriptionType+"" === "2"){
            return this._rednerPrescriptionLabel(TYPE_DOUBLE,item.title)
        }
        else if(safeObj(item).PrescriptionType+"" === "0") {
            return this._rednerPrescriptionLabel(TYPE_OTC,item.title)
        }
        //这里没有处方药的判断
        else {
            return this._rednerPrescriptionLabel(TYPE_NOMAL,item.title)
        }
    }
    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    _rednerPrescriptionLabel(type,title){
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={{color:darkTextColor(),fontSize:13,flex:1,lineHeight:16}}
            numberOfLines={2}
        />
    }

    _renderContactView(model) {
        if(model.phone_show_type != '-1') {
            return (
                <View style={{flex:1,justifyContent:'space-evenly',paddingHorizontal:13,paddingVertical:10}}>
                    {model.dict_advisory_notice == 0?
                        this._renderContactItem(require('../../../../img/order_detail_store_phone.png'), '拨打商家电话', this._contactStoreByPhone.bind(this))
                        :
                        this._renderContactItem(require('../../../../img/order_detail_leave_message.png'), '联系商家', this._contactStoreByMessage.bind(this))}
                    <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                </View>
            )
        }else {
            return (
                <View/>
            )
        }

    }

    _renderContactItem(icon, title, click) {
        return(
            <TouchableOpacity activeOpacity={1} style={{flex:1,flexDirection:'row',alignItems:'center', justifyContent:'space-between',height:35}} onPress={click}>
                <Image source={icon} style={{width:20,height:20,resizeMode:'contain'}}/>
                <Text style={{flex:1,fontSize:15, color:darkLightColor(), left:10}}>{title}</Text>
                <Image source={require('../../../../img/message_next.png')} style={{width:14,height:28,resizeMode:'contain'}}/>
            </TouchableOpacity>
        )
    }

    //电话联系商家
    _contactStoreByPhone() {
        this._requestServiceClick('2')
        let expressData = this.props.model.data
        let number = expressData.shop_phone;
        let phone_show_type = expressData.phone_show_type;
        let phone_prompt = expressData.phone_prompt;
        if (phone_show_type === '0'){
            YFWNativeManager.takePhone(number)
        }else {
            let _rightClick = ()=>{
                YFWNativeManager.takePhone(number)
            }
            let bean = {
                title: "商家号码："+number+"\n\n"+phone_prompt,
                leftText: "取消",
                rightText: "拨号",
                rightClick: _rightClick
            }
            this.tipsDialog&&this.tipsDialog._show(bean);
        }
    }

    //给商家留言
    _contactStoreByMessage() {
        if (!this.canClick) {
            return
        }
        this.canClick = false
        let {navigate} = this.props.navigation;
        getAuthUrlWithCallBack({value:this.props.model.advisory_link},(authUrl)=>{
            this.canClick = true
            pushNavigation(navigate, {type: 'get_h5', token_value:authUrl,isHiddenShare:true,blueHeader:true})
        })
    }

    _requestServiceClick(type) {
        /** 点击商家、商店客服统计 */

        /*应谌总要求，去除统计
        let expressData = this.props.model.data
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.insertContactRecord');
        paramMap.set('title', expressData.shop_title);
        paramMap.set('orderno', expressData.order_no);
        paramMap.set('type', type);
        if(type=='2'){
            paramMap.set('sellphone', expressData.shop_phone);
        }
        viewModel.TCPRequest(paramMap, (res)=> {},(error)=>{},false)
        */
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        paddingHorizontal:13,
        backgroundColor:'#fff'
    },
    goods: {
        flex:1,
        paddingHorizontal:13,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 2
        },
        elevation:2,
        shadowRadius: 4,
        shadowOpacity: 1
    }
})