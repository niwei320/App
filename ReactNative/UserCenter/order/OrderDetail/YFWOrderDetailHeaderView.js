/**
 * 订单状态、物流、联系人
 */
import React, {Component} from 'react'
import {View, ImageBackground, Image, Text, TouchableOpacity, StyleSheet,DeviceEventEmitter} from 'react-native'
import {
    kScreenWidth,
    isIphoneX,
    safe,
    secretPhone,
    kScreenScaling,
    isAndroid
} from '../../../PublicModule/Util/YFWPublicFunction'
import {darkLightColor,darkTextColor,darkNomalColor,yfwGreenColor} from '../../../Utils/YFWColor'
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel'
import YFWToast from '../../../Utils/YFWToast'
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';

export default class YFWOrderDetailHeaderView extends Component {
    render() {
        let model = this.props.model;
        let logistics_detail = model.logistics_detail
        let viewHeight = 50
        if(model.send_notifiaction&&model.send_notifiaction.button_items!=undefined&&model.send_notifiaction.button_items.length>0){
            viewHeight = kScreenWidth > 375 ? 120 : 130
        }else if(model.send_notifiaction&&model.send_notifiaction.desc!=undefined&&model.send_notifiaction.desc.length>0){
            viewHeight = 85
        }
        if (model.logistics_name.length == 0) {
            viewHeight = 30
        }
        if (model.showAddress) {
            viewHeight = 50
            if (model.sub_desc_title) {
                viewHeight += 40
            }
            if (isAndroid() && model.statuImageSources.length>1){
                viewHeight += 30
            }
        }

        //to-do
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Image source={require('../../../../img/order_detail_header.png')} style={[styles.imageBack, {height:isIphoneX() ? 260 : 235}]}/>
                <View style={{flex:1, height:viewHeight}}></View>
                <View style={{flex:1, position:'absolute', left:0, right:0, bottom:0, top:isIphoneX() ? 110 : 95, paddingHorizontal:13}}>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center',marginBottom:20}}>
                        <Image source={model.order_status_icon} style={{width:32, height:32, resizeMode:'contain'}}/>
                        <Text style={styles.statusTitle}>{safe(model.order_status_title)}</Text>
                    </View>
                    {model.sub_desc_title?<Text style={[styles.statusTitle,{textAlign:'center',marginBottom:20,fontSize:16,fontWeight:'500'}]}>{safe(model.sub_desc_title)}</Text>:null}
                    {
                        model.statuImageSources&&model.statuImageSources.length >0?
                        <View style={[styles.content, {marginBottom:15}]}>
                            {model.showAddress&&
                            <View style={[{ paddingHorizontal:13,
                                paddingVertical:15,
                                justifyContent:'space-between',
                                flexDirection:'row',
                                alignItems : 'center'}]}>
                                <Image source={model.contact_icon} style={{width:18,height:18,resizeMode:'contain'}}/>
                                <View style={{flex:1, paddingLeft:10, justifyContent:'space-between'}}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: darkTextColor(), fontSize: 15, fontWeight: 'bold' }} numberOfLines={1}>{safe(model.contact_name) + '   ' + secretPhone(safe(model.contact_mobile))}</Text>
                                    </View>
                                    <Text style={{color:darkLightColor(), fontSize:13, top:5}} numberOfLines={1}>{safe(model.contact_address)}</Text>
                                </View>
                            </View>}
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',flex:1}}>
                                {model.statuImageSources.map((sourceInfo,sourceIndex)=>{
                                    let imageW = (sourceInfo.width)
                                    let imageH = (sourceInfo.height)
                                    let marginT = sourceInfo.marginTop
                                    return (
                                        <View key={sourceIndex+'s'} style={{flexDirection:'row'}}>
                                            <View style={{...BaseStyles.centerItem}}>
                                                <Image style={{width:imageW,height:imageH}} source={sourceInfo.image}></Image>
                                                <Text style={{color:'#333',fontSize:13,marginTop:marginT}}>{safe(sourceInfo.desc)}</Text>
                                                {sourceInfo.showExplain&&
                                                <TouchableOpacity style={{padding:1,position:'absolute',bottom:-2,right:-20}} hitSlop={{top:20,left:20,bottom:20,right:20}} activeOpacity={1} onPress={()=>{
                                                    sourceInfo.explainText&&YFWToast(sourceInfo.explainText)
                                                    }}>
                                                    <Image style={{width:15,height:15}} source={require('../../../../img/interrogation_cost.png')}></Image>
                                                </TouchableOpacity>}
                                            </View>
                                            {sourceIndex < (model.statuImageSources.length - 1)&&<View style={{width:55*kScreenScaling,marginTop:20,height:2,marginHorizontal:5,borderRadius:1,backgroundColor:yfwGreenColor()}}/>}
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    :
                        <View style={[styles.content, {marginBottom:15}]}>
                            {model.logistics_name.length > 0?<TouchableOpacity activeOpacity={1} style={styles.logistics} onPress={this._startLogistics.bind(this)}>
                                <Image source={{uri:model.logistics_icon}} style={{width:logistics_detail?80:0,height:40,resizeMode:'contain'}}/>
                                <Text style={{fontSize:15,color:darkLightColor(),flex:1, textAlign:logistics_detail?'right':'left'}} numberOfLines={1}>{safe(model.logistics_name)+safe(model.logistics_number)}</Text>
                                <Image source={require('../../../../img/message_next.png')} style={{width:14,height:28,resizeMode:'contain',opacity:logistics_detail?1:0}}/>
                            </TouchableOpacity>:null}

                            <View style={styles.contact}>
                                <Image source={model.contact_icon} style={{width:18,height:18,resizeMode:'contain'}}/>
                                <View style={{flex:1, paddingLeft:10, justifyContent:'space-between'}}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: darkTextColor(), fontSize: 15, fontWeight: 'bold' }} numberOfLines={1}>{safe(model.contact_name) + '   ' + secretPhone(safe(model.contact_mobile))}</Text>
                                    </View>
                                    <Text style={{color:darkLightColor(), fontSize:13, top:5}} numberOfLines={1}>{safe(model.contact_address)}</Text>
                                </View>
                            </View>
                            {this._renderNotifyView(model)}
                            <Image source={require('../../../../img/order_detail_color_line.png')} style={{width:kScreenWidth-26, height:3, resizeMode:'contain'}}/>
                        </View>
                    }
                </View>
            </View>
        )
    }

    _renderNotifyView(model) {
        if(model.send_notifiaction&&model.send_notifiaction.button_items!=undefined&&model.send_notifiaction.button_items.length>0){
            return(
                <View style={{paddingHorizontal:13}}>
                    <View style={{flexDirection:'row',alignItems:'flex-start',paddingTop:10,paddingBottom:15}}>
                        <Text style={{color:darkTextColor(), fontSize:13}}>{safe(model.send_notifiaction.title)}</Text>
                        <Text style={{color:darkLightColor(), fontSize:13, flex:1}}>{safe(model.send_notifiaction.subtitle)}</Text>
                    </View>
                    {this._renderSendItems(model.send_notifiaction.button_items)}
                </View>
            )
        }else if(model.send_notifiaction&&model.send_notifiaction.desc!=undefined&&model.send_notifiaction.desc.length>0){
            return(
                <View style={{paddingHorizontal:13, flexDirection:'row', alignItems:'center', paddingBottom:20}}>
                    <Text style={{color:darkTextColor(), fontSize:13}}>{safe(model.send_notifiaction.title)}</Text>
                    <Text style={{color:darkLightColor(), fontSize:13, flex:1}}>{safe(model.send_notifiaction.subtitle)}</Text>
                </View>
            )
        }else {
            return <View/>
        }
    }

    _renderSendItems(items) {
        return(
            <View style={{flexDirection:'row', justifyContent:'flex-end', alignItems:'center',paddingBottom:15}}>
                {items.map((item, index)=>this._renderButtonsItem(item, index))}
            </View>
        )
    }

    _renderButtonsItem(item, index) {
        let color = index%2 == 0 ? yfwGreenColor() : darkNomalColor()
        return(
            <TouchableOpacity
                activeOpacity={1}
                style={{height:24,paddingHorizontal:15,marginLeft:20,borderWidth:1,borderRadius:12,borderColor:color,alignItems:'center',justifyContent:'center'}}
                onPress={()=>this._buttonItemsClick(index)}>
                <Text style={{color:color,fontSize:12}}>{safe(item.text)}</Text>
            </TouchableOpacity>
        )
    }

    _buttonItemsClick(index) {
        let message = index == 0 ? '您同意了商家的延期发货请求': '您拒绝了商家的延期发货请求'
        let isConfirm = index == 0 ? 1 : 0
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.delaySend');
        paramMap.set('orderno', this.props.orderNo);
        paramMap.set('isConfirm', isConfirm);
        viewModel.TCPRequest(paramMap, (res)=> {
            YFWToast(message)
            this.props.refreshItemSendInfo()
            refreshOrderStatusData = {
                pageSource: this.props.pageSource,
                position: this.props.position
            }
            DeviceEventEmitter.emit('delayed_shipment_action', refreshOrderStatusData)
        })
    }

    _startLogistics(){
        let model = this.props.model;
        if(model.logistics_number && model.logistics_number.length > 0) {
            const {navigate} = this.props.navigation;
            pushNavigation(navigate, {type: "get_logistics",orderNo:model.order_no,expressNo:model.logistics_number,img_url:model.img_url})

        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:'#fff'
    },
    imageBack: {
        width:kScreenWidth,
        height:230,
        resizeMode:'stretch'
    },
    statusTitle: {
        fontSize:19,
        fontWeight:'bold',
        color:'#fff', left:10
    },
    content: {
        flex:1,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        elevation:2,
        shadowRadius: 8,
        shadowOpacity: 1
    },
    logistics: {
        paddingHorizontal:13,
        paddingTop:10,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    contact: {
        flex:1,
        paddingHorizontal:13,
        paddingVertical:15,
        justifyContent:'space-between',
        alignItems:'flex-start',
        flexDirection:'row',
        alignItems : 'center'
    }
})