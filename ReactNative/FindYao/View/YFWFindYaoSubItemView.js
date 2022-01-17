/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity, StyleSheet,
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {yfwOrangeColor,separatorColor,yfwGreenColor,darkLightColor} from '../../Utils/YFWColor'
import {kScreenWidth, tcpImage} from "../../PublicModule/Util/YFWPublicFunction";


export default class YFWFindYaoSubItemView extends Component {


    static defaultProps = {
        Data:undefined,
    }

    render() {

        let item = this.props.Data;
        return (
            <TouchableOpacity activeOpacity={1}
                style={[BaseStyles.radiusShadow,{
                    marginBottom:8,
                    backgroundColor:'white',
                    shadowColor: "rgba(204, 204, 204, 0.4)",
                    shadowOffset: {
                        width: 0,
                        height: 4
                    },
                    shadowRadius: 18,
                    shadowOpacity: 1
                }]}
                onPress={() =>{
                if (this.props.onPressDetail){
                    this.props.onPressDetail();
                }
            }} underlayColor="transparent">
                <View style={[BaseStyles.leftCenterView,{}]}>
                    <View style={{padding:11,paddingRight:0}}>
                        <Image style={{height: 63, width: 80, resizeMode: "contain"}}
                               source={{uri: item.logo_img_url}}
                               />
                    </View>
                    <View style={{flex:1,flexDirection: "column", marginLeft: 5,paddingTop:14,paddingBottom:8}}>
                        <Text style={[{marginLeft:5,fontSize:15,}]} numberOfLines={1}>{item.title}</Text>
                        <Text style={{fontSize:13,color:darkLightColor(),marginTop:10,marginLeft:5}}>{item.distance}</Text>
                        <View style={[BaseStyles.leftCenterView,{marginLeft:5,marginTop:9}]}>
                            <Image style={{height:13,width:13,resizeMode: "contain"}} source={require('../../../img/check_checked.png')}/>
                            <Text style={{fontSize:13,color:'#1fdb9b'}}> 已签约    </Text>
                            <Image style={{height:18,width:18,resizeMode: "contain"}} source={require('../../../img/findyao/sort_icon_star.png')}/>
                            <Text style={{fontSize:13,color:darkLightColor()}}>{item.star}</Text>
                        </View>
                    </View>
                    <View style={[{position:'absolute',right:0,bottom:0,height:38,width:70},BaseStyles.centerItem]}>
                        <Image source={require('../../../img/findyao/sort_icon_jdkk.png')}/>
                    </View>
                </View>
            </TouchableOpacity>

        );
    }


}



const styles = StyleSheet.create({
    button: {
        borderWidth: 0.3,
        borderColor: yfwOrangeColor(),
        borderRadius: 5,
        padding: 3,
        width:60,
        height:30,
        marginRight:10,
    }
});
