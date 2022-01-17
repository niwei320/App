import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity, Dimensions
} from 'react-native';
import { darkNomalColor, darkTextColor, yfwGreenColor, separatorColor, yfwOrangeColor } from "../../../Utils/YFWColor";
import YFWWDCheckButtonView from '../../Widget/YFWWDCheckButtonView';

export default class YFWWDShopCarEidtBottomView extends Component {

    static defaultProps = {
        Data: [],
        selectAll: false,
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.separatorStyle} />
                <View style={styles.container}>
                    <View style={styles.checkButton}>
                        <YFWWDCheckButtonView style={{ flex: 1 }} selectFn={() => this._selectAll()}
                            select={this.props.selectAll} />
                    </View>
                    <Text style={{ marginLeft: 8, color: '#333', fontSize: 13 }}>全选</Text>
                    <View style={{ flex: 1 }} />
                    <View style={styles.view2Style}>
                        <TouchableOpacity activeOpacity={1} style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => this._orderShouCangMethod()}>
                            <Text style={styles.payStyle}>移入收藏夹</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.view3Style}>
                        <TouchableOpacity activeOpacity={1} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => this._orderDeleteMethod()}>
                            <Text style={styles.payStyle}>删除</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        );
    }


    _selectAll() {

        if (this.props.selectAllFn) {
            this.props.selectAllFn();
        }

    }
    _orderShouCangMethod() {
        let itemStr = '';
        this.props.Data.forEach((item, index) => {
            let str = '';
            if (item.type == 'package' || item.type == 'courseOfTreatment') {
                item.package_medicines.forEach((item, index) => {
                    if (index == 0) {
                        str += item.id;
                    } else {
                        str += '|' + item.id;
                    }
                });
            } else {
                str = item.id;
            }
            if (index == 0) {
                itemStr += str;
            } else {
                itemStr += '|' + str;
            }
        });
        if (this.props.scFn) {
            this.props.scFn({ item: { id: itemStr } })
        }

    }

    //删除
    _orderDeleteMethod() {
        let itemStr = '';
        this.props.Data.forEach((item, index) => {
            let str = '';
            if (item.type == 'package' || item.type == 'courseOfTreatment') {
                str = 'TC' + item.package_id;
            } else {
                str = item.id;
            }
            if (index == 0) {
                itemStr += str;
            } else {
                itemStr += '|' + str;
            }

        });
        if (this.props.delFn) {
            this.props.delFn({ id: itemStr, isEdit: 1 })
        }

    }

}

//设置样式
const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 50,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkButton: {
        marginLeft: 21,
        width: 25,
        height: 25,
    },
    view1Style: {
        flex: 1,
        height: 50,
        marginLeft: 10,
    },
    titleStyle: {

        fontSize: 16,
        height: 25,
        width: 150,
        color: darkTextColor(),
        marginTop: 10,
        marginLeft: 10,
    },
    regionStyle: {

        fontSize: 11,
        //width:100,
        color: darkNomalColor(),
        marginLeft: 10,

    },
    view2Style: {
        width: 120,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: yfwGreenColor(),
    },
    view3Style: {
        width: 80,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff3300',
        marginRight: 0,
    },

    separatorStyle: {
        backgroundColor: separatorColor(),
        height: 0.5,
        width: Dimensions.get('window').width,
    },
    payStyle: {
        color: 'white',
        fontSize: 16,
    }

});