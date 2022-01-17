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
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import {isNotEmpty} from '../../PublicModule/Util/YFWPublicFunction'

export default class Complain extends Component {


    constructor(props) {
        super(props);
        this.state = {
            data: [],
            button_items: []
        }
    }

    render() {

        /*
        * 影藏
        * */
        /*let data = this.props.datas;
        let button_items = [];
        if (isNotEmpty(data.button_items)) {
            button_items = data.button_items;O
        }
        return (
            <View>
                {this._invoiceInformation(button_items, data)}
            </View>
        )*/
        return(<View/>)
    }

    _invoiceInformation(button_items, data) {
        if (button_items.length == 0) {
            return (<View/>)
        }
        let showCompliantType = undefined
        for (let i = 0; i < button_items.length; i++) {
            if ('order_complaint' == button_items[i].value||'order_complaint_detail' == button_items[i].value) {
                showCompliantType = button_items[i].value
            }
        }
        if (isNotEmpty(showCompliantType)) {
            return (<View>
                <TouchableOpacity onPress={()=>this._jumpToComplain(data,showCompliantType)} activeOpacity={1} >
                    <View
                        style={{marginTop:10,backgroundColor:'white',flexDirection:'row',padding:10,alignItems:'center'}}>
                        <Text>投诉</Text>
                        <View style={{flex:1}}/>
                        <Image source={ require('../../../img/uc_next.png')}
                               style={{width:10,height:12,resizeMode:'contain',marginRight:10}}/>
                    </View>
                </TouchableOpacity>
            </View>)
        }
    }

    _jumpToComplain(data,type) {
        const {navigate} = this.props.navigation;
        if(type == 'order_complaint' ) {
            pushNavigation(navigate, {
                type:  'order_report',
                value: {mOrderNo: data.order_no, shopName: data.shop_title}
            })
        }else if(type == 'order_complaint_detail') {
            pushNavigation(navigate, {
                type:  'get_complain_detail',
                orderNo:data.order_no
            })
        }
    }
}