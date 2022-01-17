import React, {Component} from 'react';
import {
    View,
    Text, StyleSheet,
    AppState
} from 'react-native'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {yfwOrangeColor, yfwRedColor} from '../../Utils/YFWColor'
import YFWNativeManager from "../../Utils/YFWNativeManager";
import { safe } from '../Util/YFWPublicFunction';

export default class YFWDiscountText extends Component {

    static defaultProps = {
        style_view:{},
        style_text:{},
        style_discount:{},
        style_discount_text:{},
        value:'',
        discount:'',
        dsicountShowUp:false,
    }

    render() {
        if (this.props.dsicountShowUp) {

            return (
                <View style={[BaseStyles.leftCenterView,{flexWrap:'wrap'},this.props.style_view]}>
                    {this._renderDiscount()}
                    {this._renderText()}
                </View>
            )

        } else if(this.props.from == 'YFWSellersList'){
            return (
                <View style={[{flexWrap:'wrap'},this.props.style_view]}>
                    {this._renderText()}
                    {this._renderDiscount()}
                </View>
            )
        }else {
            return (
                <View style={[BaseStyles.leftCenterView,{flexWrap:'nowrap'},this.props.style_view]}>
                    {this._renderTextCamelCase()}
                    {this._renderDiscount()}
                </View>
            )

        }
    }

    _renderText(){

        let textArray = this.props.value.split();

        var allBadge = [];

        for (var i=0;i<textArray.length;i++){
            // 取出每一个数据对象
            let badge = textArray[i];
            // 装入数据
            allBadge.push(
                <View key={'badge'+i}>
                    <Text style={[{fontSize:13,color:yfwOrangeColor(),textAlign:'right'},this.props.style_text]}>{badge}</Text>
                </View>

            );
        }

        // 返回数组
        return allBadge;

    }

    //驼峰方式渲染价格字段 参数this.props.value 传入格式 '¥16.00'
    _renderTextCamelCase(){
        let price = safe(this.props.value)
        const minus = price.indexOf('-') != -1
        price = minus ? price.replace(/-/g, '') : price

        let textArray = price.split('¥');
        //兼容'￥','¥'两种标识
        if(textArray.length <= 1){
            textArray = price.split('￥');
        }
        if(textArray.length <= 1){
            return <View/>
        }
        let priceTextArray =  textArray[1].split(".");
        if(priceTextArray.length<2){
            return <View/>
        }
        if(this.props.from === 'YFWSubCategory'){
            priceTextArray[1] = priceTextArray[1] + '起'
        }
        let textSize = this.props.style_text.fontSize == null?16:this.props.style_text.fontSize;
        let textWeight =  this.props.style_text.fontWeight == null ? 'normal' : this.props.style_text.fontWeight;
        let textColor = this.props.style_text.color == null ? yfwRedColor() : this.props.style_text.color;

        var allBadge = [];
        allBadge.push(
            <View key={'￥'}>
                <Text style={{color: textColor,includeFontPadding:false,marginBottom:-2.5,fontSize:textSize-4,fontWeight:textWeight}}>{minus?'-¥':'¥'}</Text>
            </View>
        );
        let bigTextArray = priceTextArray[0].split("");
        for (var i=0;i<bigTextArray.length;i++){
            // 取出每一个数据对象
            let badge = bigTextArray[i];
            // 装入数据
            allBadge.push(
                <View key={'price'+i}>
                    <Text style={{color: textColor,marginBottom:0,includeFontPadding:false,fontSize:textSize,fontWeight:textWeight}}>{badge}</Text>
                </View>
            );
        }
        allBadge.push(
            <View key={'price.'}>
                <Text style={{color: textColor,includeFontPadding:false,marginBottom:-2.5,fontSize:textSize-4,fontWeight:textWeight}}>.</Text>
            </View>
        );
        let smallTextArray = priceTextArray[1].split("");
        for (var i=0;i<smallTextArray.length;i++){
            // 取出每一个数据对象
            let badge = smallTextArray[i];
            // 装入数据
            allBadge.push(
                <View key={'number'+i}>
                    <Text style={{color: textColor,includeFontPadding:false,marginBottom:-2.5,fontSize:textSize-4,fontWeight:textWeight}}>{badge}</Text>
                </View>
            );
        }
        // 返回数组
        return allBadge

    }
    //折扣返现
    _renderDiscount(){
        if (this.props.discount.length > 0 && Number.parseInt(this.props.discount) != 1){
            if(this.props.from == 'YFWSellersList'){
                return(
                    <View style={[styles.discountStyle,{backgroundColor:yfwOrangeColor()},this.props.style_discount]}>
                        <Text style={[styles.textStyle,{color:'#FFFFFF'}, this.props.style_discount_text]}>{this.props.discount}</Text>
                    </View>
                );
            }else {
                return(
                    <View style={[styles.discountStyle,{borderWidth:1,borderColor:yfwOrangeColor()},this.props.style_discount]}>
                        <Text style={[styles.textStyle,{color:yfwOrangeColor()}, this.props.style_discount_text]}>{this.props.discount}</Text>
                    </View>
                );
            }

        } else {

            return(
                <View/>
            );

        }

    }


}

const styles = StyleSheet.create({

    discountStyle: {
        alignItems:'center',
        justifyContent:'center',
        marginLeft:5,
        marginRight:5,
        borderRadius:3,
        paddingLeft:1,
        paddingRight:1,
    },
    textStyle:{
        fontSize:9,
        marginLeft:2,
        marginRight:2,
        textAlign: 'center',
    }
})