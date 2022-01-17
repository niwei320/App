/**
 * Created by admin on 2018/5/22.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const spiltView = {
    width: width,
    height: 10,
    backgroundColor: 'rgba(178,178,178,0.2)',
    marginTop: 15
}
export default class TopBar extends Component {

    render() {
        if(this.props.left == 'others'){
            let leftUrl = this.props.leftUrl;
            return(
                <View style={{backgroundColor:'white'}}>
                    <View style={{width:width,height:30,paddingLeft:10,paddingRight:10,paddingBottom:15,paddingTop:15,flexDirection:'row'}}>
                        <TouchableOpacity onPress={this.props.backFunc} style={{width:30,height:30}}>
                            <Image style={{width:15,height:15,resizeMode:'contain',justifyContent:'center'}}
                                   source={ leftUrl}>
                            </Image>
                        </TouchableOpacity>
                        <Text
                            style={{height:30,justifyContent:'center',textAlign:'center', flex:1,fontSize:16,color:'black'}}>
                            {this.props.titleTvText}
                        </Text>
                        <TouchableOpacity onPress={this.props.rightTvClick} style={{height:30}}>
                            <Text
                                style={{height:30,justifyContent:'center',textAlign:'center',fontSize:14,color:'#16c08e'}}>
                                {this.props.rightTvText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={spiltView} height={1}></View>
                </View>
            );
        }
        if (this.props.type == 'img') {
            let url = this.props.imgUrl;
            return (
                <View style={{backgroundColor:'white'}}>
                    <View style={{width:width,height:30,paddingLeft:10,paddingRight:10,paddingBottom:15,paddingTop:15,flexDirection:'row'}}>
                        <TouchableOpacity onPress={this.props.backFunc} style={[BaseStyles.centerItem,{width:30,height:30}]}>
                            <Image style={{width:10,height:16,resizeMode:'stretch'}}
                                   source={ require('../../img/top_back_green.png')}/>
                        </TouchableOpacity>
                        <Text
                            style={{height:30,justifyContent:'center',textAlign:'center',flex:1,fontSize:16,color:'black'}}>
                            {this.props.titleTvText}
                        </Text>
                        <Image style={{width:20,height:20,resizeMode:'contain'}}
                               source={url}>
                        </Image>
                    </View>
                    <View style={spiltView} height={1}></View>
                </View>
            );
        } else {
            return (
                <View style={{backgroundColor:'white'}}>
                    <View style={{width:width,height:30,paddingLeft:10,paddingRight:10,paddingBottom:15,paddingTop:15,flexDirection:'row'}}>
                        <TouchableOpacity onPress={this.props.backFunc} style={[BaseStyles.centerItem,{width:30,height:30}]}>
                            <Image style={{width:10,height:16,resizeMode:'stretch'}}
                                   source={ require('../../img/top_back_green.png')}/>
                        </TouchableOpacity>
                        <Text
                            style={{height:30,justifyContent:'center',textAlign:'center', flex:1,fontSize:16,color:'black'}}>
                            {this.props.titleTvText}
                        </Text>
                        <TouchableOpacity onPress={this.props.rightTvClick} style={{height:30}}>
                            <Text
                                style={{height:30,justifyContent:'center',textAlign:'center',fontSize:14,color:'#16c08e'}}>
                                {this.props.rightTvText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={spiltView} height={1}></View>
                </View>
            );
        }
    }
}