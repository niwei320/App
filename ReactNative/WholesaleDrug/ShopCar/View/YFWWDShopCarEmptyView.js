import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity, Dimensions,
    ImageBackground
} from 'react-native';

import {darkNomalColor,darkTextColor,darkLightColor,separatorColor,yfwOrangeColor,yfwGreenColor} from "../../../Utils/YFWColor";
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";
import {NavigationActions} from "react-navigation";
import { doAfterLogin } from '../../YFWWDJumpRouting';


export default class YFWWDShopCarEmptyView extends Component {

    render() {

        let userInfo = YFWUserInfoManager.ShareInstance();
        if (userInfo.hasLogin()){
            return (
                <View style={styles.container}>
                    <Image source={require('../../../../img/icon_cart_empty.png')}
                           style={styles.imageStyle}/>
                    <Text style={[styles.titleStyle]}>您的购物车是空的</Text>
                    <TouchableOpacity activeOpacity={1}  
                        style={{justifyContent:'center', alignItems:'center'}}
                        onPress = {() => {
                        this.props.navigation.popToTop();
                        const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
                        this.props.navigation.dispatch(resetActionTab);
                    }}>
                        <View style={{width:77, height:23,justifyContent:'center', alignItems:'center',borderColor:'rgb(51,105,255)',borderRadius:11,borderWidth:1}} imageStyle={{resizeMode:'stretch'}}>
                            <Text style={[styles.buttonStyle, {color:'rgb(51,105,255)'}]}>去首页逛逛</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }else{
            return (
                <View style={styles.container}>
                    <Image source={require('../../../../img/icon_cart_empty.png')}
                           style={styles.imageStyle}/>
                    <Text style={styles.titleStyle}>您的购物车是空的</Text>
                    <Text style={{fontSize:12,color:darkLightColor(), bottom:5,}}>登录后即可同步您的购物车商品</Text>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this._toLoginMethod()}}>
                        <View style={{width:77, height:23,justifyContent:'center', alignItems:'center',borderColor:'rgb(51,105,255)',borderRadius:11,borderWidth:1}} imageStyle={{resizeMode:'stretch'}}>
                            <Text style={[styles.buttonStyle],{color:'rgb(51,105,255)'}}>登录</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }

    }


    _toLoginMethod(){

        let {navigate} = this.props.navigation;
        doAfterLogin(navigate);
    }



}

//设置样式
const styles = StyleSheet.create({
    container: {
        flex:1,
        height:270,
        alignItems:'center',
        justifyContent:'center',
    },
    imageStyle:{
        width:150,
        height:133,
    },
    view1Style:{
        height:35,
        width:110,
        backgroundColor:yfwGreenColor(),
        alignItems:'center',
        justifyContent:'center',
        marginTop:10,
        borderRadius:4,
        marginBottom:45,
    },
    view2Style:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
    titleStyle:{
        fontSize: 12,
        height:30,
        width : 150,
        textAlign:'center',
        color:darkLightColor(),
        marginTop:25,
    },
    buttonStyle:{
        fontSize: 12,
        color:'#26af73',
    },

});