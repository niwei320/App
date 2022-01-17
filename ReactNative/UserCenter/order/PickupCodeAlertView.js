import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,StyleSheet
} from 'react-native'
import ModalView from '../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty, safeObj, isAndroid, is_ios_hot_bundle } from '../../PublicModule/Util/YFWPublicFunction';
import LinearGradient from 'react-native-linear-gradient';
import { yfwGreenColor } from '../../Utils/YFWColor';
import YFWNativeManager from '../../Utils/YFWNativeManager';
import QRCode from 'react-native-qrcode-svg';

export default class PickupCodeAlertView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            shopInfo:{}
        }
    }

    static defaultProps ={
        confirmText:'我知道了'
    }

    componentDidMount(){

    }

    show(info,code,end_time,shop_name,shop_address,shop_lng,shop_p) {
        this.setState({
            shopInfo:info
        })
        this.modalView && this.modalView.show()
    }

    close(){
        this.modalView && this.modalView.disMiss()
    }

    goToShop(shopInfo) {
        YFWNativeManager.goToRoutePlanning(shopInfo.shop_lat,shopInfo.shop_lng,shopInfo.shop_address)
    }

    _renderAlertView() {
        let colors = ['rgb(40,225,164)','rgb(31,219,155)']
        let locations = [0,1]
        let containerW = kScreenWidth-adaptSize(45*2)
        let shopInfo = safeObj(this.state.shopInfo)
        let pickupCode = safe(shopInfo.pickupCode)
        let isShopSend = shopInfo.shipping_method == '同城配送'
        let shop_name = safe(shopInfo.shop_title)
        if (shop_name.length > 21) {
            shop_name = shop_name.substr(0,21)+'...'
        }
        let send_time = safe(shopInfo.plan_send_time)
        if (send_time.indexOf('1900') != -1) {
            send_time = ''
        }
        let hiddenMapNavigation = is_ios_hot_bundle()
        return(
            <View style={[{alignItems:'center',justifyContent:'center',flex:1,backgroundColor: 'rgba(0, 0, 0, 0.4)'}]}>
                <View style={{width:containerW,justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:'#fff',overflow:'hidden'}}>
                    <View>
                        <LinearGradient colors={colors}
                                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                        locations={locations}
                                        style={{minHeight:isShopSend?100:128,width:containerW,paddingLeft:16,paddingBottom:10}}>
                                            {isShopSend?
                                            <View>
                                                <Text style={{color:'#fff',fontSize:14,fontWeight:'bold',marginTop:25,marginBottom:15,lineHeight:16,width:190}} numberOfLines={2}>{shop_name+'为您配送'}</Text>
                                                {isNotEmpty(send_time)&&<Text style={{color:'#fff',fontSize:12,fontWeight:'500',marginTop:0,marginBottom:0}}>{'送达时间：'+safe(shopInfo.plan_send_time)}</Text>}
                                            </View>
                                            :
                                            <View>
                                                <Text style={{color:'#fff',fontSize:14,fontWeight:'bold',marginTop:25,marginBottom:15}}>{safe(shopInfo.shop_title)}</Text>
                                                <View style={styles.infoRowStyle}>
                                                    <Text style={styles.infoTitle}>{'自提截止：'}</Text>
                                                    <Text style={styles.infoText}>{safe(shopInfo.end_time)}</Text>
                                                </View>
                                                <View style={[styles.infoRowStyle,]}>
                                                    <Text style={styles.infoTitle}>{'自提地点：'}</Text>
                                                    <Text style={[styles.infoText,{flex:1}]}>{safe(shopInfo.shop_address)}</Text>
                                                    <TouchableOpacity activeOpacity={1} hitSlop={{top:10,left:10,bottom:10,right:10}} style={{minWidth:60,height:14,backgroundColor:'#fff',borderRadius:7,marginRight:10,...styles.centerItem,opacity:hiddenMapNavigation?0:1}} onPress={()=>{!hiddenMapNavigation&&this.goToShop(shopInfo)}}>
                                                        <Text style={{color:yfwGreenColor(),fontSize:12}}>{'点击前往'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            }
                                            
                        </LinearGradient>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.close()}} style={{top:10,right:11,position:'absolute',paddingLeft:20,paddingBottom:20}}>
                            <Image source={require('../../../img/returnTips_close.png')} style={{width:14,height:14,tintColor:'white'}}/>
                        </TouchableOpacity>
                    </View>
                    {isShopSend&&<Text style={{color:'#333',fontSize:11,marginTop:15,marginBottom:0}}>{'请在配送员送货上门出示签收码'}</Text>}
                    <Text style={{color:'#333',fontSize:11,marginTop:30,marginBottom:14}}>{'提货凭证'}</Text>
                    {isNotEmpty(pickupCode) &&
                    <QRCode
                        value={pickupCode}
                        size={150}
                        bgColor='black'
                        fgColor='white'>
                    </QRCode>}
                    <View style={{height: 33,minWidth:140,paddingHorizontal:15,marginTop:24,marginBottom:32,borderRadius: 3,borderStyle: "solid",borderWidth: 1,borderColor: "#bfbfbf",...styles.centerItem}}>
                        <Text style={{color:'#999',fontSize:12}}>{'提货码:'}
                            <Text style={{color:'#333'}}>{pickupCode}</Text>
                        </Text>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this._renderAlertView()}
            </ModalView>
        )
    }


}

const styles = StyleSheet.create({
    infoRowStyle: {
        flexDirection:'row',marginTop:3
    },
    infoTitle:{
        color:'#fff',fontSize:12
    },
    infoText:{
        color:'#fff',fontSize:12,marginLeft:3
    },
    centerItem: {
        justifyContent:'center',alignItems:'center'
    }
})