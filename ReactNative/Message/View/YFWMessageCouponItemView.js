import React, { Component } from 'react';
import {
    ImageBackground,
    Image,
    View,
    Text,
    Dimensions
} from 'react-native';
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import {kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWMessageCouponItemView extends Component {

    static defaultProps = {
        Data:undefined,
    }

    _renderoverView(){

        if (this.props.Data.is_expired){
            return(
                <View style={[BaseStyles.centerItem,{flex:1,height:140,backgroundColor:'rgba(52, 52, 52, 0.7)'}]}>
                    <Text style={[BaseStyles.titleStyle,{color:'white',fontWeight:'bold'}]}>活动结束</Text>
                </View>
            );
        }

    }

    render() {
        return (
            <View style={[BaseStyles.item,{marginTop:0,marginBottom:0}]}>
                <View style={[BaseStyles.borderView,{width:kScreenWidth - 40,overflow:'hidden'}]}>
                    <ImageBackground style={[BaseStyles.item,{height:140}]}
                                     source={{uri:this.props.Data.image_file}}>
                        {this._renderoverView()}
                    </ImageBackground>
                    <Text style={[BaseStyles.contentStyle,{height:30}]}>{this.props.Data.content}</Text>
                    <View style={[BaseStyles.separatorStyle,{marginTop:10,width:kScreenWidth - 50}]}/>
                    <View style={[BaseStyles.leftCenterView,{height:30,marginBottom:5}]}>
                        <Text style={[BaseStyles.contentStyle,{marginTop:0,width:kScreenWidth-70}]}>查看详情</Text>
                        <Image source={require('../../../img/around_detail_icon.png')}
                               resizeMode='cover'
                               style={{ width: 10, height: 10 }} />
                    </View>
                </View>
            </View>
        );
    }

}