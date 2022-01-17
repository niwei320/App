import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    View,ImageBackground
} from 'react-native';
import YFWWDBaseView from '../../Base/YFWWDBaseView';
import { kScreenWidth, kStatusHeight, kNavigationHeight, isNotEmpty } from '../../../PublicModule/Util/YFWPublicFunction';
import { YFWImageConst } from '../../Images/YFWImageConst';
import YFWWDOperationSuccessModel from '../Model/YFWWDOperationSuccessModel';
import {backGroundColor, yfwGreenColor} from "../../../Utils/YFWColor";
import YFWWDGoodsListView from './YFWWDListView';
import DashLine from "../../../widget/DashLine";
import {toDecimal} from "../../../Utils/ConvertUtils";
import YFWToast from "../../../Utils/YFWToast";

export default class YFWWDOperationSuccessView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = YFWWDOperationSuccessModel.initWithModel(this.props.model)
    }

    componentWillReceiveProps(props) {
        this.model =  YFWWDOperationSuccessModel.initWithModel(props.model)
    }

    updateViews() {
        this.setState({})
    }

    render() {
        return (
            <ScrollView style={styles.container_style}>
                <ImageBackground source={YFWImageConst.Bg_success} style={{ width: kScreenWidth, height: 300}}>
                    <View style={{height:kNavigationHeight,paddingTop:kStatusHeight,flexDirection:'row',justifyContent:'space-between'}}>
                        <TouchableOpacity onPress={() => this.backMethod()} activeOpacity={1} style={styles.backbotton_style}>
                            <Image style={styles.backicon_style} source={ YFWImageConst.Nav_back_white}/>
                        </TouchableOpacity>
                        <View/>
                    </View>
                    {this.renderMsg()}
                    {this.renderBtn()}
                </ImageBackground>
                {this.renderCoupon()}
                <View style={{ flex: 1, marginHorizontal: 13 }}>
                    <View style={{height:54,alignItems:'center',justifyContent:'center'}}>
                        <Text style={{fontSize:15,color:'rgb(51,51,51)'}}>大家关注</Text>
                    </View>
                    <YFWWDGoodsListView father={this} model={this.model.listModel} navigation = {this.props.navigation} listType='collection'/>
                </View>
            </ScrollView>
        )
    }

    renderMsg() {
        let title = this.model.headerInfo.title
        let paySuccess = this.model.headerInfo.paySuccess
        let payType = this.model.headerInfo.payType
        let price = this.model.headerInfo.money
        let scale = kScreenWidth / 360
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center',  marginTop:30}}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image style={{ width: 30 * scale, height: 30 * scale, resizeMode: 'stretch' }} source={YFWImageConst.Icon_status_icon_success} />
                    <Text style={{ fontSize: 18 * scale, color: "white", fontWeight: 'bold', marginLeft: 8 * scale }}>{title}</Text>
                </View>
                {paySuccess ?
                    <View>
                        {isNotEmpty(payType) ? <View style={{ flexDirection: 'row', paddingTop: 15 * scale, alignItems: 'center' }}>
                            <Image style={{ width: 13 * scale, height: 13 * scale, resizeMode: 'stretch', marginRight: 10 * scale }} source={YFWImageConst.Icon_wallet} />
                            <Text style={{ fontSize: 12 * scale, color: "white" }}>支付方式: </Text>
                            <Text style={{ fontSize: 12 * scale, color: "white" }}>{payType}</Text>
                        </View> : <View />}
                        {isNotEmpty(price) ? <View style={{ flexDirection: 'row', paddingTop: 10 * scale, alignItems: 'center' }}>
                            <Image style={{ width: 13 * scale, height: 13 * scale, resizeMode: 'stretch', marginRight: 10 * scale }} source={YFWImageConst.Icon_price} />
                            <Text style={{ fontSize: 12 * scale, color: "white" }}>支付金额: </Text>
                            <Text style={{ fontSize: 12 * scale, color: "white", fontWeight: 'bold' }}>{toDecimal(price)}</Text>
                        </View> : <View />}
                    </View>
                    : <View />}
            </View>
        )
    }

    renderBtn(){
        let buttonArray = this.model.headerInfo.btArray;
        let allButton = [];
        buttonArray.forEach((item,index)=> {
            allButton.push(
                <TouchableOpacity style={styles.button} onPress={()=>this.buttonClick(item)}>
                    <Text style={{fontSize: 14, color: 'rgb(84, 124, 255)'}}>{item.text}</Text>
                </TouchableOpacity>
            )
        })
        return (
            <View style={{flexDirection:'row', justifyContent:'center',marginTop:33}}>
                {allButton}
            </View>
        )
    }

    renderCoupon() {
        let couponArray = this.model.headerInfo.couponArray;
        if(couponArray.length < 1){
            return
        }
        let allCoupon = [];
        couponArray.forEach((item,index)=> {
            let imageUrl = YFWImageConst.Icon_coupon
            let describe = parseInt(item.use_condition_price) === 0 ?"无门槛":"满" + item.use_condition_price + "元可用"
            let price = item.price
            let shopTilte = item.title

            allCoupon.push(
                <View style={styles.coupon}>
                    <View style={{flex:1,flexDirection:'row',height:60,paddingHorizontal:20,justifyContent:'center',alignItems:'center'}}>
                        <Image style={{height:40,width:40, margin:4,resizeMode:'stretch'}} source={imageUrl}/>
                        <View style={{flex:1,marginLeft:4}}>
                            <Text style={{fontWeight: "bold", fontSize: 14, color: "#333333"}}>{describe}</Text>
                        </View>
                        <Text style={{fontSize: 20, color: "#c63a3d"}}>¥<Text style={{fontSize: 28, fontWeight:'bold'}}>{price}</Text></Text>
                    </View>
                    <DashLine height={1} backgroundColor={'#bfbfbf'} len={30} flexD={0}/>
                    <View style={{flex:1,flexDirection:'row',height:24,paddingHorizontal:20,alignItems: 'center'}}>
                        <Text style={{fontSize: 12, color: "#333333"}} numberOfLines ={1} >{shopTilte}</Text>
                    </View>
                </View>
            )
        })
        let title = "您获得" + couponArray.length +"张优惠券"
        return (
            <View style={{alignItems:'center', backgroundColor:'rgb(76,81,255)'}}>
                <Text style={{fontWeight: "bold", fontSize: 16, color: "#fefefc"}}>{title}</Text>
                {allCoupon}
                <Text style={{fontSize: 12, color: "#ffffff", marginVertical:10}}>优惠券将在交易完成后赠送</Text>
            </View>
        )
    }

    buttonClick(value) {
        this.props.father&&this.props.father.buttonClick&&this.props.father.buttonClick(value)
    }

    toDetail(medicine) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(medicine)
    }
}
const styles = StyleSheet.create({
    container_style: { flex: 1, backgroundColor: '#FAFAFA' },
    backbotton_style: { width: 50, height: kNavigationHeight-kStatusHeight, justifyContent: 'center'},
    backicon_style: { width: 11, height: 19, marginLeft: 12, resizeMode: 'contain' },
    button: {
        width: 135/360*kScreenWidth,
        height: 33/360*kScreenWidth,
        marginHorizontal:11/360*kScreenWidth,
        borderRadius: 17/360*kScreenWidth,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(84, 124, 255, 0.5)",
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
    coupon:{
        marginTop:10,
        paddingTop:5,
        width:kScreenWidth-70,
        borderRadius: 7,
        backgroundColor: "#fefefc",
        shadowColor: "rgba(41, 31, 154, 0.3)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 7,
        shadowOpacity: 1,
        elevation: 3,
    }
});
