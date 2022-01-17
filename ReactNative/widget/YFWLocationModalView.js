import React,{ Component } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native'
import ModalView from './ModalView'
import {adaptSize} from "../PublicModule/Util/YFWPublicFunction";
import {yfwGreenColor,darkTextColor,darkLightColor} from "../Utils/YFWColor";
import YFWNativeManager from "../Utils/YFWNativeManager";

export default class YFWLocationModalView extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <ModalView animationType="fade" ref={(modal) => {this.modalView = modal}}>
                {this._renderLocationView()}
            </ModalView>
        )
    }

    _renderLocationView() {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <TouchableOpacity activeOpacity={1} style={styles.close} onPress={() => {this.dismiss()}}>
                        <Image source={require('../../img/icon_shut_new.png')} style={{width:14, height: 14}}/>
                    </TouchableOpacity>
                    <Text style={{color:darkTextColor(), fontSize:15, fontWeight:"500", marginTop:adaptSize(28)}}>定位服务已关闭</Text>
                    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                        <Text style={{color:darkTextColor(), fontSize:13,textAlign:"center",lineHeight:18}} numberOfLines={2}>{"请开启定位服务，以便获取"+"\n"+"更精准的搜索结果"}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} style={styles.open} onPress={() => {this._openLocation()}}>
                        <Text style={{color:yfwGreenColor(), fontSize:15, fontWeight:"500"}}>开启定位服务</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={styles.cancel} onPress={() => {this.dismiss()}}>
                        <Text style={{color:darkLightColor(), fontSize:15, fontWeight:"500"}}>取消</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    show() {
        this.modalView && this.modalView.show()
    }

    dismiss() {
        this.modalView && this.modalView.disMiss()
    }

    _openLocation() {
        YFWNativeManager.openLocation()
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent:"center",
        alignItems:'center',
        flex:1,
        backgroundColor:'rgba(0, 0, 0, 0.3)'
    },
    content: {
        width:adaptSize(300),
        height:adaptSize(210),
        borderRadius:7,
        backgroundColor:"#fff",
        overflow:"hidden",
        justifyContent:"center",
        alignItems:'center'
    },
    close: {
        width:adaptSize(40),
        height:adaptSize(40),
        position:"absolute",
        right:0,
        top:0,
        justifyContent:"center",
        alignItems:'center',
        zIndex: 10
    },
    open: {
        borderRadius:adaptSize(15),
        width:adaptSize(130),
        height:adaptSize(30),
        borderWidth:1,
        borderColor:yfwGreenColor(),
        justifyContent:"center",
        alignItems:'center',
        marginBottom:adaptSize(10)
    },
    cancel: {
        borderRadius:adaptSize(15),
        width:adaptSize(130),
        height:adaptSize(30),
        justifyContent:"center",
        alignItems:'center',
        marginBottom:adaptSize(10)
    }
})