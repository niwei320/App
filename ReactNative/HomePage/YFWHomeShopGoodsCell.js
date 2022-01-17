import React, { Component } from 'react';
import {
    View,FlatList,DeviceEventEmitter,StyleSheet,TouchableOpacity,Text,Image,
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {pushNavigation, doAfterLoginWithCallBack} from "../Utils/YFWJumpRouting";
import {yfwOrangeColor} from '../Utils/YFWColor'
import {
    kScreenWidth,
    tcpImage,
    itemAddKey,
    adaptSize,
    isNotEmpty,
    checkNotLoginIsHiddenPrice
} from '../PublicModule/Util/YFWPublicFunction';
import { toDecimal } from '../Utils/ConvertUtils';
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

const Scale = kScreenWidth/375

export default class YFWHomeShopGoodsCell extends Component {

    static defaultProps = {
        item:{},
        clickItemAction:()=>{},
        addToCarAction:()=>{},
    }
    static propTypes = {
        item: PropTypes.object,
        clickItemAction: PropTypes.func,
        addToCarAction: PropTypes.func,
    }

    render() {
        let info = {item:this.props.item}
        let prices = toDecimal(info.item.old_price).split('.')
        let hasLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        let goodType = info.item.dict_store_medicine_status
        let colors = []
        switch (goodType) {
            case '精选' :
                colors = ['rgb(251,122,82)','rgb(253,98,57)']
                break;
            case '促销' :
                colors = ['rgb(255,201,86)','rgb(255,153,7)']
                break;
            case '新品' :
                colors = ['rgb(251,122,82)','rgb(253,98,57)']
                break;
            case '推荐' :
                colors = ['rgb(255,201,86)','rgb(255,153,7)']
                break;
            default:
                colors = ['rgb(255,201,86)','rgb(255,153,7)']
                break;
        }
        let notLoginIsHiddenPrice = checkNotLoginIsHiddenPrice()
        return(
            <TouchableOpacity  onLayout = {(event)=>{this.itemHeight = event.nativeEvent.layout.height}} activeOpacity={1} onPress={()=>this.clickItems(info.item)} style={[styles.cellContainer,{marginLeft:info.index % 2 == 0?0:10}]}>
                <Image style={{height:124*Scale,flex:1,resizeMode:'contain'}} source={{uri:tcpImage(info.item.intro_image)}}></Image>
                <Text style={{fontSize:12,color:'#333',marginLeft:12,marginTop:2,fontWeight:'500'}}>{info.item.medicine_name}</Text>
                <Text style={{fontSize:10,color:'#999',marginLeft:12}}>{info.item.standard}</Text>
                {this.props.noLocationHidePrice?<Text style={{fontSize: 11,color: "#999999",marginLeft:12}}>仅做信息展示</Text>:
                    <TouchableOpacity activeOpacity={1} style={{marginLeft:12}} onPress={()=>{notLoginIsHiddenPrice&&this.doAfterLogin()}}>
                        {hasLogin || !notLoginIsHiddenPrice ? (<Text style={{fontSize:14,color:'#ef0000',fontWeight:'500',marginTop:4}}>{'￥'+prices[0]}<Text style={{fontSize:10}}>{'.'+prices[1]}</Text></Text>):
                            (<Text style={styles.priceStyle}>{"价格登录可见"}</Text>)}
                    </TouchableOpacity>

                }

                {
                    hasLogin&&!this.props.noLocationHidePrice?
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.addToCar(info.item)}} style={{...BaseStyles.centerItem,width:27,height:27,position:'absolute',bottom:12,right:12}}>
                        <Image style={{width:27,height:27}} source={require('../../img/add_car_green.png')}></Image>
                    </TouchableOpacity>:null
                }
                {isNotEmpty(goodType)?<LinearGradient colors={colors}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                locations={[0,1]} style={{height:adaptSize(18), paddingHorizontal:adaptSize(6),flex:1,justifyContent:'center',position:'absolute',top:adaptSize(10),left:adaptSize(8)
                    ,borderRadius:adaptSize(9)}}>
                    <Text style={{color:'#fff2ee',fontSize:11,fontWeight:'500'}}>{goodType}</Text>
                </LinearGradient>:null}
            </TouchableOpacity>
        )
    }


    //@ Action
    clickItems(info){
        this.props.clickItemAction&&this.props.clickItemAction(info)
    }

    addToCar(info){
        this.props.addToCarAction&&this.props.addToCarAction(info)
    }
    doAfterLogin(){
        this.props.doAfterLogin&&this.props.doAfterLogin()
    }
}


const styles = StyleSheet.create({
    cellContainer:{
        borderRadius: 10,
        backgroundColor: "#ffffff",
        paddingTop:10,
        paddingBottom:10,
        marginBottom:10,
        width:(kScreenWidth-33)/2
    },
    priceStyle:{
        fontSize: 12,
        color:yfwOrangeColor(),
        textAlign: 'left',
    },
})