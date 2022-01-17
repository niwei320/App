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
import YFWNativeManager from '../../Utils/YFWNativeManager'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import YFWToast from '../../Utils/YFWToast'
import {isNotEmpty, yfw_domain} from '../../PublicModule/Util/YFWPublicFunction'
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
export default class ContactControl extends Component {

    render() {
        let expressData = this.props.datas;

        return (
            <View>
                {this._contactControl(expressData)}
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
            </View>
        )
    }

    _requestAdvisoryMode(expressData) {
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

    _contactMallService(expressData) {
        this._requestAdvisoryMode(expressData)
    }

    _contactSoler(expressData) {
        let number = expressData.shop_phone;
        let phone_show_type = expressData.phone_show_type;
        let phone_prompt = expressData.phone_prompt;
        if (phone_show_type === '0'){
            YFWNativeManager.takePhone(number)
        }else {
            let _rightClick = ()=>{
                YFWNativeManager.takePhone(number)
            }
            let bean = {
                title: "商家号码："+number+"\n\n"+phone_prompt,
                leftText: "取消",
                rightText: "拨号",
                rightClick: _rightClick
            }
            this.tipsDialog&&this.tipsDialog._show(bean);
        }
    }

    _contactControl(expressData) {
        let phone_show_type = expressData.phone_show_type;

        if (phone_show_type != '-1') {
            return (<View style={{backgroundColor:'#FFF',flexDirection:'row',padding:15,alignItems:'center'}}>
                <TouchableOpacity onPress={()=>this._contactMallService(expressData)} style={{flex:1}}>
                    <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                        <View style={{flex:1}}/>
                        <Image style={{width:15,height:15,resizeMode:'contain'}}
                               source={require('../../../img/medicine_chat.png')}/>
                        <Text style={{fontSize:14,color:'#666666',marginLeft:5}}>联系商城客服</Text>
                        <View style={{flex:1}}/>
                    </View>
                </TouchableOpacity>
                <View style={{backgroundColor:'#E5E5E5',width:0.5,height:15}}/>
                <TouchableOpacity onPress={()=>this._contactSoler(expressData)} style={{flex:1}}>
                    <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                        <View style={{flex:1}}/>
                        <Image style={{width:15,height:15,resizeMode:'contain'}}
                               source={require('../../../img/medicine_call.png')}/>
                        <Text style={{fontSize:14,color:'#666666',marginLeft:5}}>拨打商家电话</Text>
                        <View style={{flex:1}}/>

                    </View>
                </TouchableOpacity>
            </View>)
        } else {
            return (<View style={{backgroundColor:'white',flexDirection:'row',padding:15,alignItems:'center'}}>
                <TouchableOpacity onPress={()=>this._contactMallService(expressData)}
                                  style={{width:width,flexDirection:'row',alignItems:'center'}}>
                    <View style={{flex:1}}/>
                    <Image style={{width:15,height:15,resizeMode:'contain'}}
                           source={require('../../../img/medicine_chat.png')}/>
                    <Text style={{fontSize:14,color:'#666666',marginLeft:5}}>联系商城客服</Text>
                    <View style={{flex:1}}/>
                </TouchableOpacity>
            </View>)
        }

    }


}