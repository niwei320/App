import React, {Component} from 'react';
import {
    View,
    Text, StyleSheet,Image,TouchableOpacity,TextInput,
} from 'react-native'
import {isEmpty, kScreenWidth, safe, secretPhone} from '../../../PublicModule/Util/YFWPublicFunction'
import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    o2oBlueColor,
    separatorColor,
    yfwOrangeColor
} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import LinearGradient from "react-native-linear-gradient";
export default class YFWOTOSettlementHeader extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render(){
        let context ={
            name:this.props.context.name,
            mobile:this.props.context.mobile,
            province:safe(this.props.context.province),
            city:safe(this.props.context.city),
            area:safe(this.props.context.area),
            address:this.props.context.address,
            address_label:this.props.context.address_label,
            isDefault:this.props.context.isDefault,
            pickup_address:this.props.context.pickup_address,
            pickup_mobile:this.props.context.pickup_mobile,
            pickup_distance:this.props.context.pickup_distance,
            logisticType:this.props.context.logisticType,
            shopTitle:this.props.context.shopTitle,
            lastOrderPaymentName:this.props.context.lastOrderPaymentName,
        }
        let isPickup = context.logisticType == 2
        return(
            <View style={styles.container}>
                <LinearGradient colors={[o2oBlueColor(),'#f1f1f1']}
                                        start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                                        locations={[0,1]}
                                        style={{width: kScreenWidth,height: 140,position:'absolute'}}>
                </LinearGradient>
                {/* <View style={{backgroundColor:'#fff3da',height:30,flex:1,marginHorizontal:13,borderRadius:7,marginVertical:10,alignItems:'center',flexDirection:'row'}}>
                    <Image style={{width:13,height:13,marginLeft:13,}} source={require('../../../../img/o2o_icon_laba.png')}></Image>
                    <Text style={{flex:1,fontSize:12,color:'#fc9924',marginLeft:6,marginRight:10}} numberOfLines={1}>{'受目前疫情影响，尽量减少接触，降低风险，安全购药,出门戴口罩'}</Text>
                </View> */}
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.radiusShadow,styles.context,{marginTop:21}]}>
                    <View style={{backgroundColor:"#82b6ff",height:29,flexDirection:!isPickup?'row-reverse':'row',borderRadius:7,paddingTop:0,marginBottom:10}}>
                        {isPickup?this._renderMenuItemOne(isPickup):this._renderMenuItemTwo(isPickup)}
                        {!isPickup?this._renderMenuItemOne(isPickup):this._renderMenuItemTwo(isPickup)}
                    </View>
                    {this._renderAddressView(context)}
                    <View style={{height:1,backgroundColor:'#f5f5f5',marginHorizontal:13}}></View>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.props.changePayMentType&&this.props.changePayMentType()}} style={{flexDirection:'row',alignItems:'center',paddingVertical:6,paddingHorizontal:13,height:47}}>
                        <Text style={{color:'#333',fontSize:12,fontWeight:'500',flex:1}}>{'支付方式'}</Text>
                        <Text style={{fontSize:12,marginLeft:4,fontWeight:'500',color:o2oBlueColor()}}>{context.lastOrderPaymentName}</Text>
                        <Image style={{height:16,width:16,marginRight:0}}
                            source={require('../../../../img/around_detail_icon.png')}/>
                    </TouchableOpacity>
                    {
                        isPickup?
                        <View style={{flexDirection:'row',alignItems:'center',paddingVertical:6,paddingHorizontal:13,height:47}}>
                            <Text style={{color:'#333',fontSize:12,fontWeight:'500',flex:1}}>{'预留手机'}</Text>
                            <TextInput
                                ref={(e)=>{this.phoneTextInput=e}}
                                style={{minWidth: 80, textAlign: 'center',fontSize:12,fontWeight:'500',color:o2oBlueColor(),height:40}}
                                placeholder={'预留手机号'}
                                keyboardType={'numeric'}
                                maxLength={11}
                                value={context.pickup_mobile}
                                onChangeText={(text)=>{
                                    let inputnumber = text.replace(/[^\d]/g, '');
                                    this.props.changePhone&&this.props.changePhone(inputnumber)
                                }}
                                onEndEditing={()=>{}}
                            />
                            <TouchableOpacity activeOpacity={1} onPress={()=>{this.phoneTextInput&&this.phoneTextInput.focus()}} hitSlop={{left:0,top:10,bottom:10,right:10}} >
                                <Image style={{height:12,width:13,marginLeft:3}}
                                    source={require('../../../../img/o2o_icon_edit.png')}/>
                            </TouchableOpacity>
                        </View>:null
                    }
                </TouchableOpacity>
            </View>
        )
    }

    _renderAddressView(context) {
        let isPickup = context.logisticType == 2
        if (isPickup) {
            return (
                <>
                    <Text style={{color:'#333',fontSize:14,fontWeight:'bold',marginLeft:13}}>{context.shopTitle}</Text>
                    <View style={{flexDirection:'row',alignItems:'center',marginHorizontal:13,flex:1,marginTop:10}}>
                        <Text style={{color:'#333',fontSize:12,fontWeight:'500'}}>{'自提地址'}</Text>
                        <Text style={{color:'#999',fontSize:12,flex:1,textAlign:'right'}}>{context.pickup_address}</Text>
                    </View>
                    <Text style={{color:'#999',fontSize:12,textAlign:'right',marginRight:13,marginTop:4,marginBottom:10}}>{'距您 '+context.pickup_distance}</Text>
                </>
            )
        } else {
            if (isEmpty(context.address)) {
                return (
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this._renderClickCard()}} style={{height:62,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <Text style={{fontSize:16,marginLeft:13,fontWeight:'500',color:darkTextColor()}}>{'请选择收货地址'}</Text>
                        <Image style={{height:14,width:14,marginRight:15}}
                            source={require('../../../../img/around_detail_icon.png')}/>
                    </TouchableOpacity>
                )
            } else {
                return (
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this._renderClickCard()}}>
                        <View style={{flexDirection:'row',alignItems:'center',marginLeft:12}}>
                            {context.isDefault?<View style={{width:21,height:12,borderRadius:2,marginLeft:2,backgroundColor:'#ffe3e3'}}>
                                <Text style={{color:'#eb3131',fontSize:10}}>{'默认'}</Text>
                            </View>:<View/>}
                            {context.address_label?<View style={{width:21,height:12,borderRadius:2,marginLeft:context.isDefault?5:2,backgroundColor:'#e9f2ff',...BaseStyles.centerItem}}>
                                <Text style={{color:o2oBlueColor(),fontSize:10}}>{context.address_label}</Text>
                            </View>:<View/>}
                            <Text style={{fontSize:12,marginLeft:4,fontWeight:'500',color:'#999'}}>{context.province+context.city+context.area}</Text>
                        </View>
                        <View style={{minHeight:52,flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
                            <View style={{marginLeft:14,minHeight:52,justifyContent:'space-between',paddingBottom:6,flex:1}}>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Text style={{fontSize:15,marginLeft:0,fontWeight:'500',color:darkTextColor()}}>{context.address}</Text>
                                </View>
                                <Text style={{marginLeft:0,marginBottom:0,fontSize:12,color:'#999999',width:kScreenWidth-108}}
                                        numberOfLines={1}>{context.name+context.mobile}</Text>
                            </View>
                            <Image style={{height:14,width:14,marginRight:15,marginBottom:20}}
                                source={require('../../../../img/around_detail_icon.png')}/>
                        </View>
                    </TouchableOpacity>
                )
            }
        }
    }

    _renderMenuItemTwo(isPickup) {
        return (
            <TouchableOpacity style={{flex:1,backgroundColor:isPickup?'white':'#82b6ff',alignItems:'center',justifyContent:'center',borderTopRightRadius:7}} activeOpacity={1} onPress={()=>{this.props.changeLogisticType&&this.props.changeLogisticType(2)}}>
                {isPickup&&<View style={{position:'absolute',left:0,right:0,backgroundColor:'white',height:38,top:-9,borderTopRightRadius:7}}/>}
                {isPickup&&<Image style={{position:'absolute',left:-38,top:-9,width:49.5,height:38,resizeMode:'contain',transform:[{rotateY:'180deg'}]}} source={require('../../../../img/o2o_icon_corn.png')}/>}
                <Text style={{color:isPickup?o2oBlueColor():'white',fontSize:13,fontWeight:'500'}}>{'到店自提'}</Text>
            </TouchableOpacity>
        )
    }
    _renderMenuItemOne(isPickup) {
        return (
            <TouchableOpacity style={{flex:1,backgroundColor:isPickup?'#82b6ff':'white',alignItems:'center',justifyContent:'center',borderTopLeftRadius:7}} activeOpacity={1} onPress={()=>{this.props.changeLogisticType&&this.props.changeLogisticType(1)}}>
                {!isPickup&&<View style={{position:'absolute',left:0,right:0,backgroundColor:'white',height:38,top:-9,borderTopLeftRadius:7}}>
                    </View>}
                {!isPickup&&<Image style={{position:'absolute',right:-38,top:-9,width:49.5,height:38,resizeMode:'contain'}} source={require('../../../../img/o2o_icon_corn.png')}/>}
                <Text style={{color:isPickup?'white':o2oBlueColor(),fontSize:13,fontWeight:'500'}}>{'商家配送'}</Text>
            </TouchableOpacity>
        )
    }

    _renderClickCard(){
        if(this.props.changeAddress){
            this.props.changeAddress()
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
    },
    bgImg: {
        height:104,
        width:kScreenWidth
    },
    topTitle: {
        position:'absolute',
        top:22,
        color:'white',
        marginLeft:13,
        fontSize:15,
        fontWeight:'500'
    },
    context: {
        flex:1,
        width:kScreenWidth-26,
        marginLeft:13,
        backgroundColor:'#ffffff',
        justifyContent:'space-between',
        shadowOffset: {width: 9, height: 9}
    }


})