import React, { Component } from 'react';
import {
    Image,
    View,
    Text,
} from 'react-native';
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import {kScreenWidth, safe, safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWMessageNoticeItemView extends Component {

    static defaultProps = {
        Data:undefined,
    }

    render() {
        return (
            <View style={[BaseStyles.item]}>
                <View style={[BaseStyles.radiusShadow,{width:kScreenWidth - 26,backgroundColor:'#ffffff'}]}>
                    <Text style={[BaseStyles.titleStyle,{width:kScreenWidth - 220,fontWeight:'bold',marginLeft:20, marginBottom: 5}]} numberOfLines={1}>{safe(safeObj(this.props.Data).msg_type)}</Text>
                    <View style={{flexDirection:'row',alignItems:'center',paddingBottom:3,paddingRight:24,paddingLeft:21}}>
                        <Text style={[{fontSize:12,color:'#999999',lineHeight:18,marginLeft:0,flex:1}]}>{safe(safeObj(this.props.Data).content)}</Text>
                    </View>
                    {safeObj(this.props.Data).canJump ? <View>
                        <View style={{ marginTop:5, marginHorizontal:22, height:1, backgroundColor: "rgb(235,235,235)"}}/>
                        <View style={[BaseStyles.leftCenterView,{height:32,justifyContent:'space-around'}]}>
                            <Text style={[{marginLeft:25,width:kScreenWidth-70,color:'#333333'}]}>查看详情</Text>
                            <Image source={require('../../../img/message_next.png')} resizeMode='contain' style={{ width: 12, height: 12,marginRight:24 }} />
                        </View>
                    </View> : <View style={{height: 10}}></View>}
                </View>
            </View>

        );
    }

}