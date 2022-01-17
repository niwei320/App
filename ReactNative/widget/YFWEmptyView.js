/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text
} from 'react-native';

import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {backGroundColor, yfwGreenColor} from "../Utils/YFWColor";
import {NavigationActions} from "../../node_modules_local/react-navigation";
import YFWNativeManager from "../Utils/YFWNativeManager";
import { adaptSize } from '../PublicModule/Util/YFWPublicFunction';
import {getSignInData, TYPE_SIGN_COUPON} from "../Utils/YFWInitializeRequestFunction";



export default class YFWEmptyView extends React.Component {

    static defaultProps = {
        title:'',
    }

    constructor(props) {
        super(props);
        this.image = this.props.image || require('../../img/empty_page.png')
        this.bgColor = this.props.bgColor || backGroundColor()
    }

    render() {
        return (

            <View style = {[BaseStyles.centerItem,{flex:1,backgroundColor:this.bgColor }]}>
                <View style = {{width:200,height:300,alignItems:'center'}}>
                    <Image source={this.image}
                           resizeMode='cover'
                           style={{ width: adaptSize(167), height: adaptSize(167) }}/>
                    <Text style={[BaseStyles.contentStyle,{marginTop:20,color:'#999999',marginLeft:0}]}>{this.props.title}</Text>
                    {this.showBackHome()}
                </View>
            </View>

        );
    }


    showBackHome(){

        if (this.props.showBackHome){

            return(
                <TouchableOpacity onPress = {() => {
                    YFWNativeManager.mobClick('account-order-home');
                    this.props.navigation.popToTop();
                    const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
                    this.props.navigation.dispatch(resetActionTab);
                }} style = {[BaseStyles.centerItem, {marginTop: 20, borderRadius: 3, backgroundColor: yfwGreenColor(),padding:10}]}
                >
                    <Text style = {{color: '#FFFFFF', fontSize: 14}}>去首页逛逛</Text>
                </TouchableOpacity>
            );

        } else if(this.props.showGetCoupon){

            return(
                <TouchableOpacity onPress = {() => {
                    let {navigate} = this.props.navigation
                    getSignInData(navigate,TYPE_SIGN_COUPON);
                }} style = {[BaseStyles.centerItem, {marginTop: 20, borderRadius: 3, borderStyle: "solid", borderWidth: 1, borderColor: "#bbbbbb",paddingHorizontal:10,paddingVertical:7}]}
                >
                    <Text style = {{color: '#666666', fontSize: 15,includeFontPadding:false}}>前往领券中心></Text>
                </TouchableOpacity>
            );
        } else {

            return (<View/>);

        }


    }


}

