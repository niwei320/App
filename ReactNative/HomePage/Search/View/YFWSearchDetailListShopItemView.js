/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity, StyleSheet,
} from 'react-native';
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {yfwOrangeColor,separatorColor,yfwGreenColor,darkLightColor} from '../../../Utils/YFWColor'
import {isNotEmpty, kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";


export default class YFWSearchDetailListShopItemView extends Component {


    static defaultProps = {
        Data:undefined,
    }

    render() {

        let item = this.props.Data;
        return (
            <TouchableOpacity activeOpacity={1} onPress={() =>{this.clickShopItemMethod()}} underlayColor="transparent">
                <View style={[BaseStyles.leftCenterView,{height:100 , backgroundColor:'white'}]}>
                    <View style={{marginLeft:15}}>
                        <Image style={{height: 70, width: 87, resizeMode: "contain"}}
                               source={{uri: item.logo_img_url}}
                               defaultSource={require('../../../../img/default_shop_icon.png')}/>
                    </View>
                    <View style={{flex:1,flexDirection: "column", marginLeft: 5}}>
                        <Text style={[BaseStyles.titleStyle,{width:kScreenWidth-130,fontSize:15}]} numberOfLines={2} >{item.title}</Text>
                        <View style={[BaseStyles.leftCenterView,{height:30,marginLeft:5,marginTop:15}]}>
                            <Image style={{height:13,width:13,resizeMode: "contain"}} source={require('../../../../img/yiqianyue.png')}/>
                            <Text style={{fontSize:13,color:yfwGreenColor()}}> 签约</Text>
                            {this._renderStart(item.star)}
                            <Text style={{fontSize:13,color:yfwOrangeColor(),flex:1}}>  {item.star}</Text>
                            <Text style={{fontSize:13,color:yfwGreenColor(),marginRight:15}}>  {item.distance}</Text>
                        </View>
                    </View>
                </View>
                <View style={{marginTop:0,width:kScreenWidth,height:0.5,backgroundColor:separatorColor()}}/>
            </TouchableOpacity>

        );
    }

    _renderStart(star){

        let realWidth = 60;
        if (isNotEmpty(star) || Number.parseFloat(star) > 0) {
            realWidth = 60 * Number.parseFloat(star) / 5 ;
        }

        return(
            <View style={[BaseStyles.leftCenterView,{marginLeft:15,overflow:'hidden'}]}>
                <Image style={{height:12,width:12,resizeMode: "contain"}} source={require('../../../../img/green_star.png')}/>
                <Image style={{height:12,width:12,resizeMode: "contain"}} source={require('../../../../img/green_star.png')}/>
                <Image style={{height:12,width:12,resizeMode: "contain"}} source={require('../../../../img/green_star.png')}/>
                <Image style={{height:12,width:12,resizeMode: "contain"}} source={require('../../../../img/green_star.png')}/>
                <Image style={{height:12,width:12,resizeMode: "contain"}} source={require('../../../../img/green_star.png')}/>
            </View>
        );
    }


    clickShopItemMethod(){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail',value:this.props.Data.id});

    }


}

