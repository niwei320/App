import React, {Component} from 'react'
import {View, Text, Image, TouchableOpacity, StyleSheet, Alert} from 'react-native'
import {darkTextColor, darkLightColor} from '../Utils/YFWColor'

export default class YFWSettingCell extends Component {
    render() {

        let model = this.props.model;

        return(
            <TouchableOpacity style = {styles.container} onPress={this._onPressClick.bind(this)} activeOpacity={0.8}>
                <Text style = {styles.title}>{model.title}</Text>
                <View style = {styles.rightView}>
                    {this._renderRightView(model)}
                    <Image source={require('../../img/uc_next.png')} style={styles.detail}/>
                </View>
            </TouchableOpacity>
        )
    }

    _onPressClick() {
        if(this.props.callBack) {
            this.props.callBack(this.props.model);
        }
    }

    _renderRightView(model) {
        var items = []

        if(model.subImage) {
            items.push(<Image key={'1'} source={model.subImage} style = {styles.rightImage}/>)
        }

        if(model.subtitle) {
            items.push(<Text key={'2'} style = {styles.subtitle}>{model.subtitle}</Text>)
        }
        return items;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        height: 52,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: darkTextColor(),
        fontSize: 15,
    },
    rightView: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'row',
        height: 52,
    },
    subtitle: {
        color: darkLightColor(),
        fontSize: 15,
        right: 24,
    },
    detail: {
        width: 7,
        height: 12,
    },
    rightImage: {
        height: 12,
        width: 99,
        right: 24,
    }
})