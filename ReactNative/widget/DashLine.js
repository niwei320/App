import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet,
} from 'react-native';
export default class DashLine extends Component {
    render() {

        return <View style={{height: this.props.height,flexDirection:this.props.flexD == 1?'column':'row'}}>
            {this._renderLine()}
        </View>
    }

    _renderLine() {
        var len = this.props.len;
        var arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(<View key={'DashLine'+i} style={[this.props.flexD == 1? styles.dashItem:styles.rowItem, {backgroundColor: this.props.backgroundColor}]}/>);
        }
        return arr
    }
}
const styles = StyleSheet.create({
    dashItem: {
        height: 2,
        width: 1,
        marginTop: 2,
        flex: 1,
    },
    rowItem:{
        height:1,
        width:2,
        marginLeft:2,
        flex:1
    }
})