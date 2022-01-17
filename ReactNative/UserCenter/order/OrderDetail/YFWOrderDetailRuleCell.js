/**
 * 订单详情签收规则
 */
import React, {Component} from 'react'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import {darkTextColor,yfwGreenColor} from '../../../Utils/YFWColor'
import {pushNavigation} from '../../../Utils/YFWJumpRouting'

export default class YFWOrderDetailRuleCell extends Component {
    render() {
        let model = this.props.model

        return(
            <TouchableOpacity style={styles.container} activeOpacity={1} onPress={this._rulesClick.bind(this)}>
                <Text style={styles.text}>
                    {model.title}
                    <Text style={{color:yfwGreenColor()}}>{model.rules}</Text>
                    <Text>{model.subtitle}</Text>
                </Text>
            </TouchableOpacity>
        ) 
    }

    _rulesClick() {
        let model = this.props.model
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {
            type: 'get_h5',
            value: model.url,
            name: '商品验收标准',
            title:'商品验收标准'
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 15
    },
    text: {
        fontSize:13, 
        color:darkTextColor()
    }
})