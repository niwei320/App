import React from 'react'
import {
    Image, Text,
    View, TouchableOpacity
} from 'react-native'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {backGroundColor, yfwGreenColor} from "../Utils/YFWColor";
import {NavigationActions} from "react-navigation";
import YFWNativeManager from "../Utils/YFWNativeManager";
import { adaptSize } from '../PublicModule/Util/YFWPublicFunction';

/**
 * 订单列表空列表视图
 */
export default class YFWOrderEmptyView extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style = {[{flex: 1, backgroundColor: backGroundColor(),alignItems: 'center'}]}>
                <View style={[BaseStyles.centerItem,{marginTop:100}]}>
                    <Image source = {require('../../img/ic_no_order.png')}
                           style={{ width: adaptSize(167), height: adaptSize(167),resizeMode:'contain'}} />
                    <Text style = {[BaseStyles.contentStyle, {marginTop: 20, marginLeft: null}]}>{this.props.type == 'serch'?'没有相关订单':'暂无订单'}</Text>
                    <TouchableOpacity onPress = {() => {
                        YFWNativeManager.mobClick('account-order-home');
                        this.props.navigation.popToTop();
                        const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
                        this.props.navigation.dispatch(resetActionTab);
                    }} style = {[BaseStyles.centerItem, {marginTop: 20, borderRadius: 3, backgroundColor: yfwGreenColor(),padding:10}]}
                    >
                        <Text style = {{color: '#FFFFFF', fontSize: 14}}>去首页逛逛</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}