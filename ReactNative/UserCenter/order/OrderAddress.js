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
export default class OrderAddress extends Component {
    static defaultProps = {
        sendInfo: '',
    }

    render() {
        let AddressData = this.props.datas;
        let shopping_name = AddressData.shopping_name;
        let shopping_mobile = AddressData.shopping_mobile;
        let shopping_address = AddressData.shopping_address;
        let send_info = this.props.sendInfo;
        let items = send_info.button_items;
        return (
            <View style={{backgroundColor:'white',marginTop:5,marginBottom:5}}>
                <View style={{flexDirection:'row'}}>
                    <Text style={{fontSize:14,color:'#333333',marginTop:10,marginLeft:10}}>{shopping_name}</Text>
                    <Text style={{fontSize:14,color:'#333333',marginLeft:20,marginTop:10}}>{shopping_mobile}</Text>
                </View>
                <Text style={{fontSize:13,color:'#666666',marginLeft:10,marginTop:10,marginBottom:10}}>{shopping_address}</Text>
            </View>
        )
    }
}