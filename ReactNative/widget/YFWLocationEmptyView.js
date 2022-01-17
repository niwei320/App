import React,{ Component } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native'
import {adaptSize} from "../PublicModule/Util/YFWPublicFunction";
import {yfwGreenColor,darkTextColor,darkLightColor} from "../Utils/YFWColor";
import YFWNativeManager from "../Utils/YFWNativeManager";
import LinearGradient from 'react-native-linear-gradient';

export default class YFWLocationEmptyView extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return(
            <View style={styles.container}>
                <View style={{flex:1}}></View>
                <Image source={require('../../img/icon_location_empty.png')} style={{width:adaptSize(149),height:adaptSize(140)}}></Image>
                <Text style={styles.desc}>{"请开启定位服务权限"+"\n"+"以获得更精准的搜索结果"}</Text>
                <LinearGradient
                    colors={['#5ee3ff','#44d5ba','#29c775']}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    locations={[1,0]}
                    style={[styles.open,{padding:1,width:adaptSize(102),height:adaptSize(27),borderRadius:adaptSize(13.5),}]}>
                        <TouchableOpacity activeOpacity={1} onPress={() => {this._openLocation()}} style={[styles.open,{backgroundColor:"#fff"}]}>
                            <Text style={{color:"#26af73", fontSize:12}}>开启定位服务</Text>
                        </TouchableOpacity>
                </LinearGradient>
                <View style={{flex:2}}></View>
            </View>
        )
    }

    _openLocation() {
        YFWNativeManager.openLocation()
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    },
    desc: {
        color:darkLightColor(),
        fontSize:13,
        lineHeight:20,
        marginVertical:adaptSize(16),
        textAlign:"center"
    },
    open: {
        width:adaptSize(100),
        height:adaptSize(25),
        borderRadius:adaptSize(12.5),
        justifyContent:"center",
        alignItems:'center',
    }
})