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
    Dimensions,
    ImageBackground
} from 'react-native';
const width = Dimensions.get('window').width;
import {isEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWImageView from '../../widget/YFWImageView'
export default class ExpressInformation extends Component {

    render() {
        let expressData = this.props.datas;

        return(
            <View>
                {this._showExpressInfor(expressData)}
            </View>
        )
    }

    _showExpressInfor(expressData) {
        let expressNmae = expressData.shipping_name;
        let expressNo = expressData.shipping_no;
        let expressImge = expressData.logistics_icon;
        if(isEmpty(expressNmae) && isEmpty(expressNo) && isEmpty(expressImge)){
            return(<View>
                <View style={{backgroundColor:'#FFF',flexDirection:'row',alignItems:'center',height:40}}>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:12,color:'#999999',marginRight:10}}>暂无快递信息</Text>
                    <Image style={{width:12,height:12,resizeMode:'contain',marginRight:10}} source={require('../../../img/uc_next.png')}/></View>
            </View>)
        }else {
            return(
                <TouchableOpacity activeOpacity={1} onPress={()=>{this._startLogistics(expressData.order_no)}}>
                    <View style={{backgroundColor:'#fff',flexDirection:'row',padding:10,paddingLeft: 0,alignItems:'center',width:width}}>
                        <YFWImageView width = {70} height ={30} resizeMode ={'contain'} source={{uri:expressImge}}/>
                        <View style={{flex:1}}/>
                        <Text style={{fontSize:13,color:'#666666',marginRight:3}}>{expressNmae}</Text>
                        <Text style={{fontSize:13,color:'#666666',marginRight:10}}>单号：{expressNo}</Text>
                        <Image style={{width:12,height:12,resizeMode:'contain'}} source={require('../../../img/uc_next.png')}/>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    _startLogistics(orderNo){
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: "get_logistics",orderNo:orderNo,expressNo:this.props.datas.shipping_no})
    }
}