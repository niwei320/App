/**
 * 联系商城客服
 */
import React, {Component} from 'react'
import {View, ImageBackground, Image, Text, TouchableOpacity, SectionList, StyleSheet} from 'react-native'
import {
    kScreenWidth,
    yfw_domain,
    safe,
    safeObj,
    isNotEmpty,
    isEmpty
} from '../../../PublicModule/Util/YFWPublicFunction'
import {darkLightColor,darkNomalColor,darkTextColor,yfwLineColor} from '../../../Utils/YFWColor'
import BaseTipsDialog from "../../../PublicModule/Widge/BaseTipsDialog"
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel'
import {pushNavigation} from '../../../Utils/YFWJumpRouting'
import YFWNativeManager from '../../../Utils/YFWNativeManager'
import YFWToast from '../../../Utils/YFWToast'

export default class YFWOrderDetailContactCell extends Component {

    constructor(props) {
        super(props)
        this.isERPOrder = isNotEmpty(this.props.from) && this.props.from === 'ErpOrderDetail'
    }

    render() {
        let model =safeObj(this.props.model)
        if (model.dict_sckf_off == '0') {
            return <View/>
        }
        return(
            <View style={[styles.container,{backgroundColor: this.isERPOrder?'transparent':'#fff'}]}>
                {this.isERPOrder?<View/>:this._renderContactView(model)}
            </View>
        )
    }

    _renderContactView(model) {
        return (
            <View style={{flex:1,justifyContent:'space-evenly',paddingHorizontal:13,paddingVertical:10}}>
                {this._renderContactItem(require('../../../../img/order_detail_service.png'), '联系商城客服',this._contactMallService.bind(this))}
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
            </View>
        )

    }

    _renderContactItem(icon, title, click) {
        return(
            <TouchableOpacity activeOpacity={1} style={{flex:1,flexDirection:'row',alignItems:'center', justifyContent:'space-between',height:35}} onPress={click}>
                <Image source={icon} style={{width:20,height:20,resizeMode:'contain'}}/>
                <Text style={{flex:1,fontSize:15, color:darkLightColor(), left:10}}>{title}</Text>
                <Image source={require('../../../../img/message_next.png')} style={{width:14,height:28,resizeMode:'contain'}}/>
            </TouchableOpacity>
        )
    }

    _contactMallService() {
        this._requestAdvisoryMode()
    }

    _requestAdvisoryMode() {
        let expressData = this.props.model.data
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.common.app.getOrderDetailCallType');
        viewModel.TCPRequest(paramMap, (res)=> {
            let type = res.result.type;
            if (type == '1') {
                YFWNativeManager.openZCSobot()
            } else if (type == '2') {
                let {navigate} = this.props.navigation;
                let urlData = "https://m." + yfw_domain() + "/chat" + ".html?total=" +
                    expressData.order_total + "&num=" + expressData.goods_items.length + "&orderno=" + expressData.order_no + "&status=" + expressData
                        .status_name + "&smid=" + expressData.goods_items[0].shop_goods_id + "&shopid=" + expressData.shop_id + "&type=3"
                pushNavigation(navigate, {type: 'get_h5', value: urlData, injectJsCode: false, title: '药店咨询'})
            } else if (type == '3') {
                YFWToast(res.result.context + '')
            }
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        paddingHorizontal:13,
        backgroundColor:'#fff'
    },
    goods: {
        flex:1,
        paddingHorizontal:13,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 2
        },
        elevation:2,
        shadowRadius: 4,
        shadowOpacity: 1
    }
})