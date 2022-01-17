import React, { Component } from 'react'
import { View, Image,TouchableOpacity } from 'react-native'
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import { YFWImageConst } from '../Images/YFWImageConst';
import { dismissKeyboard_yfw } from '../../PublicModule/Util/YFWPublicFunction';

export default class YFWHeaderLeft extends Component {
    render() {
        return (
            <TouchableOpacity style={[BaseStyles.item, { width: 50, height: 40 }]}
                onPress={() => {
                    dismissKeyboard_yfw();
                    this.props.navigation&&this.props.navigation.goBack();
                    this.props.goBack&&this.props.goBack()
                }}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={YFWImageConst.Nav_back_white} defaultSource={YFWImageConst.Nav_back_white} />
            </TouchableOpacity>
        )
    }
}