/**
 * 订单详情签收规则
 */
import React, {Component} from 'react'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import {darkTextColor,yfwGreenColor} from '../../../Utils/YFWColor'
import {kRoute_html, pushWDNavigation} from "../../YFWWDJumpRouting";

export default class YFWWDOrderDetailRuleCell extends Component {
    render() {
        let model = this.props.model

        return(
            <TouchableOpacity style={styles.container} activeOpacity={1} onPress={this._rulesClick.bind(this)}>
                <Text style={styles.text}>
                    {model.title}
                    <Text style={{color:'rgb(84,124,255)'}}>{model.rules}</Text>
                    <Text>{model.subtitle}</Text>
                </Text>
            </TouchableOpacity>
        )
    }

    _rulesClick() {
        let model = this.props.model
        const {navigate} = this.props.navigation;
        pushWDNavigation(navigate, {
            type: kRoute_html,
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