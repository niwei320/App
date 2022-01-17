import React, {Component} from 'react';
import {
    ImageBackground,
    View,
    Text,
    Image
} from 'react-native';
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import {kScreenWidth,safe, safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWMyMessageItemView extends Component {

    static defaultProps = {
        Data: undefined,
    }

    _renderRedPoint() {
        let count = Number.parseInt(this.props.Data.total_count);
        if (count > 0) {
            return (
                <View style={[BaseStyles.topRightPoint,{marginTop:-5,marginRight:-5}]}/>
            );
        } else {
            return (<View/>)
        }
    }

    render() {
        let count = Number.parseInt(this.props.Data.total_count);
        if(this.props.Data.key=='0'){
            var image = require('../../../img/icon_message_kh.png')
        }else if(this.props.Data.key=='1'){
            var image = require('../../../img/icon_message_xt.png')
        }else if(this.props.Data.key=='2'){
            var image = require('../../../img/icon_message_dd.png')
        }else{
            var image = require('../../../img/icon_message_yh.png')
        }
        this.props.Data.content = safe(safeObj(this.props.Data).content).replace('<p>','').replace('</p>','').replace('<br>','').replace('</br>','')
        return (
            <View style={[{paddingHorizontal:13,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}]}>
                <View style={[BaseStyles.item,BaseStyles.radiusShadow,{backgroundColor:'#FFF',}]}>
                    <View style={{justifyContent:'center',height:90}}>
                        <ImageBackground style={[BaseStyles.imageStyle,{alignItems:'flex-end',height:43,width:43,marginLeft:15}]}
                                         source={image}>
                            {/* {this._renderRedPoint()} */}
                        </ImageBackground>
                    </View>
                    <View style={{flex:1,justifyContent:'center'}}>
                        <View style={[BaseStyles.leftCenterView]}>
                            <Text
                                style={[BaseStyles.titleStyle,{width:kScreenWidth - 220,marginLeft:16,fontSize:15,marginTop:0}]}
                                numberOfLines={1}>{this.props.Data.msg_type}</Text>
                            {this._renderCreatTime()}

                        </View>
                        <View style={[BaseStyles.leftCenterView,{paddingRight:77,paddingLeft:16}]}>
                            {count>0?<View style={{width:8,height:8,marginTop:12,borderRadius:4,backgroundColor:'rgba(254,119,55,0.8)'}}/>:<View/>}
                            <Text
                                style={[BaseStyles.contentStyle,{marginTop:12,marginLeft:count>0?2:0,color:'#999999',fontSize:12}]}
                                numberOfLines={1}>{this.props.Data.content}</Text>
                        </View>
                        <Image style={{position:'absolute',right:23,width:38,height:38,resizeMode:'stretch'}} source={require('../../../img/icon_message_tz.png')}/>
                    </View>
                </View>
            </View>
        );
    }

    _renderCreatTime() {
        let content = this.props.Data.content;
        if (!content.match('目前暂无')) {
            return (
                <Text
                    style={[BaseStyles.contentStyle,{fontSize:11,color:'#999999',marginTop:0}]}>{this.props.Data.create_time}</Text>
            )
        }
    }
}