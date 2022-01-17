/**
 * 订单详情自提
 */
import React, {Component} from 'react'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import {darkTextColor,yfwGreenColor} from '../../../Utils/YFWColor'
import YFWNativeManager from '../../../Utils/YFWNativeManager'
import { safe, safeObj, kScreenWidth, isAndroid, is_ios_hot_bundle } from '../../../PublicModule/Util/YFWPublicFunction'

export default class YFWOrderDetailPickupCell extends Component {
    render() {
        let hiddenMapNavigation = is_ios_hot_bundle()
        let shopInfo = safeObj(this.props.model.pickupInfo)
        return(
            <View style={[styles.largeButton,{paddingVertical:0,paddingHorizontal:15}]}>
                <View style={styles.infoRowStyle}>
                    <Text style={styles.infoTitle}>{'配送方式：'}</Text>
                    <Text style={styles.infoText}>{safe(shopInfo.shipping_method)}</Text>
                </View>
                <View style={styles.infoRowStyle}>
                    <Text style={styles.infoTitle}>{'自提截止：'}</Text>
                    <Text style={styles.infoText}>{safe(shopInfo.end_time)}</Text>
                </View>
                <View style={[styles.infoRowStyle,{flex:1,}]}>
                    <Text style={styles.infoTitle}>{'自提地点：'}</Text>
                    <Text style={[styles.infoText,{flex:1}]}>{safe(shopInfo.shop_address)}</Text>
                    <TouchableOpacity activeOpacity={1} hitSlop={{top:10,left:10,bottom:10,right:10}} style={{minWidth:60,height:18,marginRight:20,opacity:hiddenMapNavigation?0:1}} onPress={()=>{!hiddenMapNavigation&&this.goToShop(shopInfo)}}>
                        <Text style={{color:yfwGreenColor(),fontSize:13,marginLeft:5}}>{'点击前往'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) 
    }

    goToShop(shopInfo) {
        YFWNativeManager.goToRoutePlanning(shopInfo.shop_lat,shopInfo.shop_lng,shopInfo.shop_address)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 15
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
        flexDirection:'row',marginTop:10
    },
    infoTitle:{
        color:'#333',fontSize:13
    },
    infoText:{
        color:'#666',fontSize:13,marginLeft:3
    }
})