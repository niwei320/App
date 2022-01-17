/**
 * 订单详情同城配送
 */
import React, {Component} from 'react'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import {darkTextColor,yfwGreenColor} from '../../../Utils/YFWColor'
import YFWNativeManager from '../../../Utils/YFWNativeManager'
import { safe, safeObj, kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction'

export default class YFWOrderDetailDeliveryCell extends Component {
    render() {
        let deliveryInfo = safeObj(this.props.model.deliveryInfo)
        return(
            <View style={[styles.largeButton,{paddingVertical:0,paddingHorizontal:15}]}>
                <View style={[styles.infoRowStyle,{marginTop:5}]}>
                    <Text style={styles.infoTitle}>{'配送方式：'}</Text>
                    <Text style={styles.infoText}>{safe(deliveryInfo.shipping_method)}</Text>
                </View>
                <View style={styles.infoRowStyle}>
                    <Text style={styles.infoTitle}>{'送达时间：'}</Text>
                    <Text style={styles.infoText}>{safe(deliveryInfo.plan_send_time)}</Text>
                </View>
                <View style={[styles.infoRowStyle]}>
                    <Text style={styles.infoTitle}>{'配送人员：'}</Text>
                    <Text style={[styles.infoText]}>{safe(deliveryInfo.delivery_name)}</Text>
                </View>
                <View style={[styles.infoRowStyle]}>
                    <Text style={[styles.infoTitle]}>{'配送员电话：'}</Text>
                    <Text style={[styles.infoText]}>{safe(deliveryInfo.delivery_mobile)}</Text>
                    <TouchableOpacity activeOpacity={1} hitSlop={{top:10,left:10,bottom:10,right:10}} style={{minWidth:60,height:18,marginLeft:10}} onPress={()=>{this.callPhone(deliveryInfo.delivery_mobile)}}>
                        <Text style={{color:yfwGreenColor(),fontSize:13,marginLeft:5}}>{'拨打电话'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) 
    }

    callPhone(mobile) {
        YFWNativeManager.takePhone(mobile)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    text: {
        fontSize:13, 
        color:darkTextColor()
    },
    largeButton:{
        width: kScreenWidth,
        marginHorizontal:12,
        marginVertical:14,
        paddingHorizontal:15,
        backgroundColor: "#ffffff",
    },
    infoRowStyle: {
        flexDirection:'row',marginTop:13
    },
    infoTitle:{
        color:'#333',fontSize:13
    },
    infoText:{
        color:'#666',fontSize:13,marginLeft:3
    }
})