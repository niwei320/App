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
export default class OrderDetailHeader extends Component {

    render() {
        let detailData =  this.props.datas;
        let header_bg;
        if ("等待买家付款"== detailData.status_name||'暂未付款' == detailData.status_name) {
            header_bg = require('../../../img/order_header_pay.png')
        } else if ("等待商家发货"== detailData.status_name|| '等待发货' == 'detailData.status_name') {
            header_bg = require('../../../img/order_header_box.png')
        } else if ("暂未收货"== detailData.status_name) {
            header_bg = require('../../../img/order_header_delivery.png')
        } else if ("交易完成" == detailData.status_name) {
            header_bg = require('../../../img/order_header_success.png')
        } else if ("交易失败"== detailData.status_name||"交易取消" == detailData.status_name) {
            header_bg = require('../../../img/order_header_fail.png')
        } else if ("申请退货" == detailData.status_name || "同意退货" == detailData.status_name || "退货发出" == (detailData.status_name) || "收到退货" == (detailData.status_name) || "退货/款完成" == (detailData.status_name) ||
            "商家拒绝退货/款" == (detailData.status_name) || "退货/款已取消" == detailData.status_name) {
            header_bg = require('../../../img/order_header_returm.png')
        } else if ("申请退款"== (detailData.status_name) || "退款已取消" == (detailData.status_name) || "商家拒绝退款" == (detailData.status_name) || "正在退款" ==(detailData.status_name) || '交易关闭' == detailData.status_name) {
            header_bg = require('../../../img/order_header_money.png')
        } else {
            header_bg = require('../../../img/order_header_box.png')
        }
        return(
        <ImageBackground style={{width:width,height:85,alignItems:'center',flexDirection:'row'}}
                         source={header_bg}>
            {this._renderStatuTest(detailData.status_name)}
        </ImageBackground>
        )
    }
    _renderStatuTest(status_name){
        if(status_name == '等待发货'){
            return(<Text style={{fontSize:16,color:'#fff',marginLeft:30}}>等待商家发货</Text>)
        }else if(status_name == '暂未付款'){
            return(<Text style={{fontSize:16,color:'#fff',marginLeft:30}}>等待买家付款</Text>)
        }else {
            return(<Text style={{fontSize:16,color:'#fff',marginLeft:30}}>{status_name}</Text>)
        }
    }
}