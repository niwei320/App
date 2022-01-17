import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, DeviceEventEmitter,
} from 'react-native';
import {isIphoneX, kScreenWidth, safe, secretPhone} from "../../../PublicModule/Util/YFWPublicFunction";
import {
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    yfwGreenColor
} from "../../../Utils/YFWColor";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWToast from "../../../Utils/YFWToast";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWOrderDetailStoreCell from "./YFWOrderDetailStoreCell";

export default class YFWOfflineOrderDetailHeaderView extends Component {
    render() {
        let model = this.props.model;
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Image source={require('../../../../img/order_detail_header.png')} style={[styles.imageBack, {height:isIphoneX() ? 260 : 235}]}/>
                <View style={{flex:1, marginTop:isIphoneX() ? 110 : 95}}>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center',marginBottom:20, paddingHorizontal:13}}>
                        <Image source={model.order_status_icon} style={{width:32, height:32, resizeMode:'contain'}}/>
                        <Text style={styles.statusTitle}>{safe(model.order_status_title)}</Text>
                    </View>
                    <YFWOrderDetailStoreCell model={this.props.model} navigation={this.props.navigation} from={'ErpOrderDetail'}/>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    imageBack: {
        width:kScreenWidth,
        height:230,
        resizeMode:'stretch',
        position:'absolute',
    },
    statusTitle: {
        fontSize:19,
        fontWeight:'bold',
        color:'#fff', left:10
    },
})