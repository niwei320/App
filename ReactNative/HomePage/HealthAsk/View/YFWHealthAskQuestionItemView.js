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
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import {mobClick} from '../../../PublicModule/Util/YFWPublicFunction'
import {darkNomalColor, yfwGreenColor, yfwOrangeColor} from "../../../Utils/YFWColor";
import { red } from 'ansi-colors';

export default class YFWHealthAskQuestionItemView extends Component {

    static defaultProps = {
        Data:undefined,
        from:undefined
    }

    render() {

        let item = this.props.Data;

        let icon;
        let statusColor =darkNomalColor()
        if (item.status === "待回复" || item.status === "未回复"){
            icon = require('../../../../img/icon_weihuifu.png');
        } else if (item.status == '已回复'){
            icon = require('../../../../img/icon_yihuifu.png');
            statusColor = '#1fdb9b'
        } else if (item.status == '已采纳'){
            icon = require('../../../../img/icon_yicaina.png');
            statusColor = "#feac4c"
        }
        if(this.props.from=='pharmacist_ask'){
            return (
                <TouchableOpacity activeOpacity={1} onPress={() =>{this.clickItemMethod()}} underlayColor="transparent">
                    <View style={{width:kScreenWidth,flex:1,backgroundColor:'white',paddingVertical:20}}>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:23,marginRight:23,fontSize: 13,color: "#333333"}]} numberOfLines={1}>{item.title}</Text>
                        <View style={[BaseStyles.leftCenterView,{marginTop:13}]}>
                            <Text style={{color: "#1fdb9b",fontSize:11,marginLeft:23}}>{item.reply_count}</Text>
                            <Text style={[BaseStyles.contentWordStyle,{fontSize:11,color:'#999999'}]}>条回复</Text>
                            {/* <Image style={{width: 15, height: 15, marginLeft: 10}}
                                source={icon}/>
                            <Text style={[BaseStyles.contentWordStyle,{marginLeft:5,width:70,color:statusColor}]}>{item.status}</Text> */}
                            <Text style={[BaseStyles.contentWordStyle,{marginLeft:22,fontSize:11,color:'#999999'}]}>{item.time}</Text>
                        </View>
                    </View>
                    <View style={[BaseStyles.separatorStyle,{marginLeft:23,width:kScreenWidth-46}]}/>
                </TouchableOpacity>

            );
        }else if(this.props.from === 'searchList') {
            return (
                <TouchableOpacity style={{backgroundColor:'white'}} activeOpacity={1} onPress={() =>{this.clickItemMethod()}} underlayColor="transparent">
                    <View style = {{width:kScreenWidth,flex:1}}>
                        <View style={{flexDirection:'row',marginVertical:10,width:kScreenWidth}}>
                            <Text style={[styles.overdueStyle,{marginRight:23,marginLeft:22,fontSize: 13}]} numberOfLines={1} ellipsizeMode={'tail'}>{item.title}</Text>
                        </View>
                        <View style={[BaseStyles.leftCenterView,{paddingHorizontal:22}]}>
                            <Text style={{flex:1,fontSize: 13,color: "#999999"}}>{item.reply_count}条回复</Text>
                            <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                                <Image style={{width: 15, height: 15, resizeMode:'contain'}} source={icon}/>
                                <Text style={{marginLeft:4,color:statusColor,fontSize: 13}}>{item.status}</Text>
                            </View>
                            <Text style={{flex:1.5,fontSize: 13,color: "#999"}}>{item.time}</Text>
                        </View>
                    </View>
                    <View style={[BaseStyles.separatorStyle,{marginLeft:23,marginTop:8,width:kScreenWidth-46}]}/>
                </TouchableOpacity>
            )
        }else {
            return(
                <TouchableOpacity activeOpacity={1} onPress={() =>{this.clickItemMethod()}} underlayColor="transparent">
                    <View style = {{width:kScreenWidth,flex:1,backgroundColor:'white',marginTop:12}}>
                        <View style={{flexDirection:'row',marginBottom:20,width:kScreenWidth}}>
                            <Image style={[styles.cfyIconStyle,{position:'absolute'}]} source={require('../../../../img/wen_icon.png')}/>
                            <Text style={[styles.overdueStyle,{marginRight:23,marginLeft:22
        }]} numberOfLines={2}>       {item.title}</Text>
                        </View>
                        {(item.status === "待回复" || item.status === "未回复")?<View/>:<View style={{marginBottom:20}}>
                            <View style={{flexDirection:'row',flex:1,alignItems:'center',marginRight:23,justifyContent:'space-between'}}>
                                <View style={{flexDirection:'row',alignItems:'center',}}>
                                    <Image style={{width:30,height:30,marginLeft:23,borderRadius:15}} source={{uri:item.intro_image}}/>
                                    <Text style={{fontSize: 12,color: "#999999",marginLeft:10}}>{item.name}</Text>
                                    <View style={{paddingHorizontal:5,paddingVertical:1,borderRadius: 3,backgroundColor: "#f5f5f5",marginLeft:10}}>
                                        <Text style={{fontSize: 11,color: item.type_name=='药师'?"#dab96b":"#ec8028"}}>{item.type_name}</Text>
                                    </View>
                                </View>
                                <View style={{flex:1,marginLeft:3,marginRight:0}}>
                                    <Text style={{fontSize: 11,color: "#666666",}} numberOfLines={1}>{item.practice_unit}</Text>
                                </View>
                            </View>
                            <Text style={{marginLeft:23,marginRight:29,marginTop:10,fontSize: 12,lineHeight: 16,color: "#333333",marginTop:10}} numberOfLines={2}>{item.reply_content}</Text>
                        </View>}
                        <View style={[BaseStyles.leftCenterView,{justifyContent:'space-between'}]}>
                            <Text style={{marginLeft:23,fontSize: 11,color: "#999999"}}>{item.time}</Text>
                            <View style={{marginRight:23,flexDirection:'row',alignItems:'center'}}>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Image style={{width: 15, height: 15, resizeMode:'contain'}}
                                    source={icon}/>
                                    <Text style={{marginLeft:4,color:statusColor,fontSize: 11}}>{item.status}</Text>
                                </View>
                                <View style={{flexDirection:'row',alignItems:'center',marginLeft:22}}>
                                    <Text style={{fontSize: 13,color: "#1fdb9b"}}>{item.reply_count}</Text>
                                    <Text style={{fontSize: 13,color: "#999999"}}>条回复</Text>
                                    <Image style={{width: 5, height: 10,marginLeft:3}}
                                   source={require('../../../../img/around_detail_icon.png')}/>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[BaseStyles.separatorStyle,{marginLeft:23,width:kScreenWidth-46,marginTop:14}]}/>
                </TouchableOpacity>

            )
        }
    }

    clickItemMethod(){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_ask_detail',value:this.props.Data.id});

        mobClick('health-hot question')
    }


}

const styles = StyleSheet.create({
    titleStyle: {
        fontSize: 13,
        lineHeight:16,
        color: '#000',
        fontWeight:'bold',
        marginRight: 10,
        flex:1
    },
    titleStyleLines: {
        fontSize: 13,
        lineHeight:14,
        color: '#000',
        fontWeight:'bold',
        marginRight: 10,
        flex:1
    },
    cfyIconStyle: {
        resizeMode:'contain',
        height:25,
        marginLeft:5
    },
    overdueStyle: {
        fontSize:15,
        color: '#333333',
        lineHeight: 21,
    }
})