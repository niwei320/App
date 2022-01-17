import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    TouchableOpacity, Dimensions
} from 'react-native';
import { YFWImageConst } from '../Images/YFWImageConst';
import FastImage from "../../../node_modules_local/react-native-fast-image/src";


export default class YFWWDCheckButtonView extends Component {

    static defaultProps = {
        select: false,
    }

    render() {
        return (
            <View style={styles.operatingBtn}>
                <TouchableOpacity activeOpacity={0.8}
                    disabled={this.props.isOverdue ? true : false}
                    hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                    style={[styles.operatingBtnBox, { width: 25, height: 25 }]}
                    onPress={() => this.selectFn()}>
                    {this.props.select
                        ? <FastImage source={YFWImageConst.Icon_select_blue}
                            resizeMode='contain'
                            style={{ width: 25, height: 25 }} />
                        : <View style={{width: 21,
                            height: 21,
                            borderRadius:21,
                            borderStyle: "solid",
                            borderWidth: 1,
                            borderColor: "#999999"}}/>
                    }
                </TouchableOpacity>
            </View>
        );
    }


    selectFn() {
        if (this.props.selectFn) {
            this.props.selectFn();
        }
    }

}

//设置样式
const styles = StyleSheet.create({
    operatingBtn: {
        flex: 1,
        height: 40,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    operatingBtnBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

});