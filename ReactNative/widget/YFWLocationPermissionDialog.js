import React from 'react'
import {
    View,
    ScrollView,
    Text,ImageBackground,
    Image, TouchableOpacity, Platform, BackAndroid, DeviceEventEmitter, Dimensions, StyleSheet
} from 'react-native'
import ModalView from "./ModalView";
import {backGroundColor, darkNomalColor, darkTextColor, o2oBlueColor, yfwGreenColor} from "../Utils/YFWColor";
import {isEmpty, kScreenWidth, safeObj} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWToast from "../Utils/YFWToast";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {center} from "react-native-fast-image";
import YFWSwitchAddressView from "./YFWSwitchAddressView";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {setItem, YFWLocationManualData} from "../Utils/YFWStorage";
import {refreshMessageRedPoint} from "../Utils/YFWInitializeRequestFunction";
const width = Dimensions.get('window').width;

/**
 * 定位权限设置
 */
export default class YFWLocationPermissionDialog extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            from:''
        }
    }
    componentDidMount() {
        this.locationDialogListener = DeviceEventEmitter.addListener('OPEN_LOCATION_DIALOG',(value)=>{
            this.show(value)
        });
        this.locationDialogListener = DeviceEventEmitter.addListener('CLOSE_LOCATION_DIALOG',(value)=>{
            this.dismiss()
        });

    }

    componentWillUnmount() {
        //移除定位弹窗开启监听
        this.locationDialogListener && this.locationDialogListener.remove()
        this.locationListener && this.locationListener.remove()
    }

    render() {
        return (
            <ModalView ref={(item)=>this.modal = item} onRequestClose={()=>{}}>
                <View style={[BaseStyles.centerItem,{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}]}>
                    <View style={[BaseStyles.centerItem,{marginLeft:40,marginRight:40,backgroundColor:'white',borderRadius:8}]}>
                        <ImageBackground style={styles.modalHeaderBackground} source={this.state.from=='oto'?require('../../img/icon_notification_another_bg.png'):require('../../img/icon_notification_bg.png')} resizeMode='stretch'>
                            <Text style={{fontSize: 21, lineHeight: 28, color: "#ffffff"}}>开启定位</Text>
                            <Image style={styles.modalHeaderLocationIcon} source={this.state.from=='oto'?require('../../img/icon_location_another.png'):require('../../img/icon_location.png')} resizeMode='stretch'/>
                            <TouchableOpacity style={styles.modalHeaderCloseIcon} onPress={()=>{this.dismiss()}}>
                                <Image style={{width: (width - 80) / 3 * 0.14,height: (width - 80) / 3 * 0.14}} source={require('../../img/icon_version_close.png')} resizeMode='stretch'/>
                            </TouchableOpacity>
                        </ImageBackground>
                        <View style={[BaseStyles.centerItem,{padding:20}]}>
                            <View style={[BaseStyles.centerItem,{paddingHorizontal:(width-80)/3/2-20}]}>
                                <Text style={{fontSize: 13, lineHeight: 25, color: "#333333"}}>系统未获取到您的定位信息，建议您打开定位或手动设置定位以便查看商品价格库存信息</Text>
                            </View>
                            <TouchableOpacity activeOpacity={1} style={[styles.btnOpen,{backgroundColor:this.state.from=='oto'?o2oBlueColor():'#1fdb9b'}]} onPress={()=>{this.openPermission()}}>
                                <Text style={{color:"#fefefe",fontSize:15}}>去开启</Text>
                            </TouchableOpacity>
                            {/*<TouchableOpacity activeOpacity={1} style={styles.btnManual} onPress={()=>{this.dismiss();this.props.showSwitchAddressView()}}>*/}
                                {/*<Text style={{color:yfwGreenColor(),fontSize:15}}>手动设置收货地址</Text>*/}
                            {/*</TouchableOpacity>*/}
                        </View>
                    </View>
                </View>
            </ModalView>
        )
    }

    show(value){
        this.setState({from:value})
        if(this.modal){
            if(!this.modal.isShow()){
                this.modal.show()
            }
        }
    }

    dismiss(){
        this.modal && this.modal.disMiss()
        this.props.dismiss && this.props.dismiss()
    }

    openPermission(){
        this.locationListener = DeviceEventEmitter.addListener('IS_OPEN_LOCATION',(isOpen)=>{
            if(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).hide_user_location != 'false'){
                //如果开启
                if(isOpen){
                    // 手动定位待确认
                    // YFWUserInfoManager.ShareInstance().setLocationManual(false);
                    // let locationManualData = {}
                    // setItem(YFWLocationManualData, locationManualData);
                    DeviceEventEmitter.emit('refresh_location');
                    DeviceEventEmitter.emit('CLOSE_LOCATION_DIALOG');
                }
                this.locationListener.remove()
            }
        })
        YFWNativeManager.openLocation()
    }

}
const styles = StyleSheet.create({
    modalHeaderBackground: {
        width:width-80,
        height:(width-80)/3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeaderLocationIcon: {
        position: 'absolute',
        left: (width - 80) / 3 * 0.37,
        top: (width - 80) / 3 * 0.29,
        width: (width - 80) / 3 * 0.37,
        height: (width - 80) / 3 * 0.48,
    },
    modalHeaderCloseIcon: {
        position: 'absolute',
        right: (width - 80) / 3 * 0.10,
        top: (width - 80) / 3 * 0.10,
    },
    btnOpen: {
        width:(width - 80) / 3 * 1.46,
        height:(width - 80) / 3 * 0.3,
        margin:10,
        marginTop:30,
        borderRadius: 20,
        backgroundColor: "#1fdb9b",
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnManual:{
        width:(width - 80) / 3 * 1.46,
        height:(width - 80) / 3 * 0.3,
        margin:10,
        marginBottom:30,
        borderRadius: 20,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#1fdb9b",
        justifyContent: 'center',
        alignItems: 'center',
    }
})