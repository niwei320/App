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

export default class InvoiceInformation extends Component {

    render() {
        let expressData = this.props.datas;

        return (
            <View>
                {this._invoiceInformation(expressData)}
            </View>
        )
    }

    _invoiceInformation(expressData) {
        let invoice_type = expressData.invoice_type;
        let invoice_title = expressData.invoice_title;
        return (<View style={{padding:10,backgroundColor:'#FFFFFF',marginTop:10}}>
                <View>
                    <Text style={{fontSize:13,color:'#666666'}}>发票类型： {invoice_type == 1?'个人发票':invoice_title == 2?'企业发票':'无需发票'}</Text>
                    <Text style={{fontSize:13,color:'#666666',marginTop:5}}>发票抬头： {invoice_title}</Text>
                </View>
            </View>
        )
    }
}