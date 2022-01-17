/**
 * 订单详情普通cell 并排文字
 */
import React, {Component} from 'react'
import {View, FlatList, Text, TouchableOpacity, StyleSheet, Image} from 'react-native'
import {darkLightColor,darkTextColor,yfwRedColor,yfwLineColor} from '../../../Utils/YFWColor'
import YFWDiscountText from '../../../PublicModule/Widge/YFWDiscountText'
import YFWNativeManager from '../../../Utils/YFWNativeManager';
import YFWToast from '../../../Utils/YFWToast';
import {isEmpty} from "../../../PublicModule/Util/YFWPublicFunction";
import {YFWImageConst} from "../../Images/YFWImageConst";
import {kRoute_invoice_detail, kRoute_order_detail, pushWDNavigation} from "../../YFWWDJumpRouting";
export default class YFWWDOrderDetailNormalCell extends Component {
    render() {
        let model = this.props.model

        return(
            <View style={{flex:1}}>
                <FlatList
                    style={{flex:1, paddingTop:15}}
                    data={model.items}
                    renderItem={this._renderCell.bind(this)}
                    ListFooterComponent={this._renderListFooter.bind(this)}
                    ListHeaderComponent={this._renderListHeader.bind(this)}
                    keyExtractor={(item, index) => index}
                />
            </View>
        )
    }

    _renderCell({item}) {
        let textAlign = item.textAlign != undefined ? item.textAlign : 'right'
        let fontWeight = item.font_weight != undefined ? item.font_weight : 'normal'
        let subtitle = item.remark === undefined ? item.subtitle : item.subtitle + '\n' + item.remark.replace('；','，')
        return(
            <View style={{flex:1, alignItems:'flex-start', flexDirection:'row', justifyContent:'space-between', paddingBottom:15, paddingHorizontal:26}}>
                <Text style={{color:darkTextColor(), fontSize:13, fontWeight:fontWeight, marginRight:5,lineHeight:18}}>{item.title}</Text>
                {item.isPrice?<YFWDiscountText navigation={this.props.navigation} style_view={{marginLeft:7}} style_text={{fontSize:13,fontWeight:fontWeight,color:darkLightColor()}} value={subtitle}/>:
            <Text style={{flex:1, color:darkLightColor(), fontSize:13, fontWeight:fontWeight, textAlign:textAlign,lineHeight:18}}>{subtitle}</Text>}
                {this.renderAction(item)}
            </View>
        )
    }

    renderAction(item) {
        if (item.title == '订单编号:' || item.title == '销售单号:') {
            return (
                <TouchableOpacity style={{height:15,marginTop:2,borderRadius:6,borderColor:'#547cff',borderWidth:1,marginLeft:4,justifyContent:'center',alignItems:'center'}}
                                    activeOpacity={1}
                                    hitSlop={{top:10,left:10,bottom:10,right:10}}
                                    onPress={()=>{
                                        YFWToast('订单编号复制成功')
                                        YFWNativeManager.copyLink(item.subtitle)
                                    }}
                                    >
                        <Text style={{color:'#547cff',fontSize:10,marginHorizontal:4,textAlign:'center'}}>复制</Text>
                    </TouchableOpacity>
            )
        } else if( item.isClickable && item.title === '发票种类:'){
            return (
                <TouchableOpacity style={{position:'absolute',top:0,right:26,flexDirection:'row', alignItems:'center'}}
                                  activeOpacity={1}
                                  hitSlop={{top:10,left:10,bottom:10,right:10}}
                                  onPress={()=>{
                                      const {navigate} = this.props.navigation;
                                      pushWDNavigation(navigate, {type: kRoute_invoice_detail, value:item.invoiceUrls});
                                  }}
                >
                    <Text style={{color:'#547cff',fontSize:13,marginHorizontal:4,lineHeight:18}}>查看发票</Text>
                    <Image source={YFWImageConst.Icon_message_next} style={{width:14,height:14,resizeMode:'contain'}}/>
                </TouchableOpacity>
            )
        }
        return null
    }

    _renderListHeader() {
        let model = this.props.model
        if(model.header === undefined) {
            return <View/>
        }else {
            let textAlign = model.header.textAlign != undefined ? model.header.textAlign : 'right'
            let fontWeight = model.header.font_weight != undefined ? model.header.font_weight : 'normal'
            let isShowLine = model.items && model.items.length>0 ? true : false;

            return(
                <View style={{flex:1}}>
                    <View style={{flex:1, alignItems:'flex-start', flexDirection:'row', justifyContent:'space-between', paddingBottom:15, paddingHorizontal:26}}>
                        <Text style={{color:darkTextColor(), fontSize:13, fontWeight:fontWeight,marginRight:5}}>{model.header.title}</Text>
                        <Text style={{flex:1, color:darkLightColor(), fontSize:13, fontWeight:fontWeight, textAlign:textAlign}}>{model.header.subtitle}</Text>
                    </View>
                    {this._renderSeparator(isShowLine)}
                </View>
            )
        }
    }

    _renderListFooter() {
        let model = this.props.model
        if(model.footer === undefined) {
            return <View/>
        }else {
            return(
                <View style={{flex:1}}>
                    {this._renderSeparator(true)}
                    <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end', alignItems:'center', paddingVertical:15, paddingHorizontal:26}}>
                        {isEmpty(model.footer.medicineKindsCount)?null:<Text style={{color:darkTextColor(), fontSize:15}}>{'商品: ' + model.footer.medicineKindsCount + '  '}</Text>}
                        {isEmpty(model.footer.medicineCount)?null:<Text style={{color:darkTextColor(), fontSize:15}}>{'数量: ' + model.footer.medicineCount + '  '}</Text>}
                        <Text style={{color:darkTextColor(), fontSize:15}}>{'总金额: '}</Text>
                        <YFWDiscountText navigation={this.props.navigation} style_view={{marginLeft:7}} style_text={{fontSize:18,fontWeight:'500',color:yfwRedColor()}} value={model.footer.order_total}/>
                    </View>
                </View>
            )
        }
    }

    _renderSeparator(isShow) {
        if(isShow) {
            return(
                <View style={{flex:1,height:1, backgroundColor:yfwLineColor(),marginLeft:26, opacity:0.2}} ></View>
            )
        }else {
            return <View/>
        }
    }
}
