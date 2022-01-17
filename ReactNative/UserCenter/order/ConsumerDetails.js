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
import {toDecimal} from "../../Utils/ConvertUtils";
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class ConsumerDetails extends Component {

    render() {
        let expressData = this.props.datas;

        return (
            <View>
                {this._contactControl(expressData)}
            </View>
        )
    }



    _renderPackagePrice(price,type){
        let text;
        switch (type){
            case 'package':
                text = '包装费'
                break
            case 'point':
                text = '积分抵扣'
                break
            case 'coupon':
                text = '商家优惠券'
                break
            case 'update':
                text = '商品优惠'
                break
            case 'platform':
                text = '商城优惠券'
                break
        }
        if(isNotEmpty(price)&&!isNaN(Number.parseFloat(price))&&Number.parseFloat(price)>0){
            return(
                <View style={{flexDirection:'row',marginTop:10,marginLeft:10,marginRight:10}}>
                    <Text style={{fontSize:12,color:'#666666'}}>{text}：</Text>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:12,color:'#666666'}}>¥ {toDecimal(price)}</Text>
                </View>
            )
        }else {
            return(
                <View/>
            )
        }
    }


    _contactControl(expressData) {
        let use_point_price = expressData.use_point_price;//积分抵扣
        let update_price = expressData.update_price;//商品优惠
        let update_price_desc = expressData.update_price_desc;//商品优惠描述
        let platform_yh_price = expressData.platform_yh_price;//商城优惠券
        let shipping_price = expressData.shipping_price;//运费
        let package_price = expressData.package_price;//包装费
        let coupon_price = expressData.coupon_price;//商家优惠券
        let goods_total = expressData.goods_total;//总价
        let order_total = expressData.order_total;//订单总价

        return (<View>
            <View style={{backgroundColor:'white',marginTop:10}}>
                <View style={{flexDirection:'row',marginTop:10,marginLeft:10,marginRight:10}}>
                    <Text style={{fontSize:13,color:'#333333'}}>商品总价：</Text>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:13,color:'#333333'}}>¥ {toDecimal(goods_total)}</Text>
                </View>
                <View style={{flexDirection:'row',marginTop:10,marginLeft:10,marginRight:10}}>
                    <Text style={{fontSize:12,color:'#666666'}}>配送费：</Text>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:12,color:'#666666'}}>¥ {toDecimal(shipping_price)}</Text>
                </View>
                {this._renderPackagePrice(package_price,'package')}
                {this._renderPackagePrice(use_point_price,'point')}
                {this._renderPackagePrice(coupon_price,'coupon')}
                {this._renderPackagePrice(update_price,'update')}
                {this._renderPackagePrice(platform_yh_price,'platform')}
                <View style={{flexDirection:'row',marginTop:10,marginLeft:10,marginRight:10}}>
                    <Text style={{fontSize:12,color:'#666666'}}>备注：</Text>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:12,color:'#666666',maxWidth:width-44}}> {update_price_desc}</Text>
                </View>
                <View style={{width:width-20,marginLeft:10,height:0.5,backgroundColor:'#E5E5E5',marginTop:5}}>

                </View>
                <View style={{flexDirection:'row',padding:10}}>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:14,color:'black'}}>订单总金额：</Text>
                    <Text style={{fontSize:14,color:'#FF6E40'}}>¥ {toDecimal(order_total)}</Text>
                </View>
            </View>
        </View>)
    }
}