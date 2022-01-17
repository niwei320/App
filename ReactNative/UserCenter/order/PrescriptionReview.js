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
const height = Dimensions.get('window').height;
import {isEmpty} from '../../PublicModule/Util/YFWPublicFunction'

export default class PrescriptionReview extends Component {

    render() {
        let expressData = this.props.datas;

        return(<View/>)
        /*
        *   处方审核信息暂不展示
        * */
        /*return (
            <View>
                {this._invoiceInformation(expressData)}
            </View>
        )*/
    }

    _invoiceInformation(expressData) {
        let prescription_audit = expressData.prescription_audit;
        if (isEmpty(prescription_audit)) {
            return null
        } else {
            return (<View style={{backgroundColor:'#FFFFFF'}}>
                    <View
                        style={{backgroundColor:'#e5e5e5',width:width-10,marginLeft:10,height:0.5}}/>
                    <View style={{flexDirection:'row',padding:10}}>
                        <Text style={{fontSize:13,color:'#333333'}}>处方审核 : </Text>
                        <Text style={{width:100 ,fontSize:13,color:'#666666'}}>
                            {prescription_audit}
                        </Text>
                    </View>
                </View>
            )
        }
    }
}