/**
 * Created by nw on 2018/9/12.
 */

import React from 'react';
import {
    DeviceEventEmitter,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SwipeRow } from 'react-native-swipe-list-view';
import {
    backGroundColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor,
    darkLightColor
} from "../Utils/YFWColor";
import { BaseStyles } from "../Utils/YFWBaseCssStyle";
import { kScreenWidth, safeObj, tcpImage, safe } from "../PublicModule/Util/YFWPublicFunction";
import { toDecimal } from "../Utils/ConvertUtils";
import YFWDiscountText from '../PublicModule/Widge/YFWDiscountText';
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';


export default class YFWSimpleSwipeRow extends SwipeRow {

    constructor(...args) {
        super(...args);
        this.state = {
            selectSwipeRow:{},
            noLocationHidePrice:YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        };
    }

    componentDidMount() {
        this.simple_Listener = DeviceEventEmitter.addListener('CloseSimpleSwipeRow', () => {
            if (this.state.selectSwipeRow != this.swipeRow) {
                this.swipeRow && this.swipeRow.closeRow();
            }
            this.state.selectSwipeRow = {};
        });
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE', (isHide) => {
            this.setState({
                noLocationHidePrice: isHide
            })
        })
    }

    componentWillUnmount() {
        this.simple_Listener && this.simple_Listener.remove()
        this.locationListener && this.locationListener.remove()
    }

    _delFn() {
        if (this.props.delFn) {
            this.props.delFn();
            DeviceEventEmitter.emit('CloseSimpleSwipeRow');
        }
    }

    _selectItemMethod() {
        if (this.props.selectItemMethod) {
            this.props.selectItemMethod()
        }
    }

    _onRowOpenFn() {
        this.state.selectSwipeRow = this.swipeRow;
        DeviceEventEmitter.emit('CloseSimpleSwipeRow');

    }

    render() {
        let item = this.props.Data;
        let shop_name = item.item.shop_name
        let name = shop_name.substr(0, 35);
        return (
            <SwipeRow
                ref={(c) => this.swipeRow = c}
                key={item.index}
                rightOpenValue={-60}
                previewOpenValue={-40}
                swipeToOpenPercent={10}
                swipeToClosePercent={10}
                onRowOpen={() => this._onRowOpenFn()}
                previewOpenDelay={3000}
                disableRightSwipe={true}>
                <View style={styles.quickAContent}>
                    <TouchableOpacity style={[styles.quick, { backgroundColor: '#ff6e40', }]} onPress={() => { this._delFn() }}>
                        <Text style={{ color: "#fff", textAlign: 'center' }}>删除</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.rowItem} key={item.index}>
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this._selectItemMethod()}>
                        <View style={{ height: item.index == 0 ? 0 : 2, backgroundColor: "#F5f5f5", marginLeft: 99, marginRight: 35 }} />
                        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 18 }}>
                            <Image style={[BaseStyles.imageStyle]}
                                source={{ uri: item.item.img_url }}
                            />
                            <View style={{ marginLeft: 10, width: kScreenWidth - 138, paddingBottom: 12 }}>
                                <Text numberOfLines={1} style={{ fontSize: 15, color: darkTextColor(), marginTop: 8 }}>{item.item.name_cn}</Text>
                                <Text numberOfLines={1}
                                    style={{ fontSize: 12, color: darkLightColor(), marginTop: 4, lineHeight: 18, }}
                                >{item.item.standard}</Text>
                                <Text numberOfLines={2}
                                    style={{ fontSize: 12, color: darkLightColor(), marginTop: 4, lineHeight: 18, }}
                                >商家: {shop_name.length > 35 ? name + '...' : name}</Text>
                            </View>
                        </View>
                        {this.state.noLocationHidePrice ? <Text style={{ position: 'absolute', right: 18, bottom: 10, fontSize: 12, color: "#999999" }}>仅做信息展示</Text> :
                            <View style={{ position: 'absolute', right: 18, bottom: 10, }}>
                                <YFWDiscountText navigation={this.props.navigation} style_view={{ marginTop: 0 }} style_text={{ fontSize: 16, fontWeight: '500' }} value={'¥' + toDecimal(item.item.medicine_price)} />
                            </View>
                        }
                    </TouchableOpacity>

                </View>
            </SwipeRow>
        );

    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: backGroundColor(),
    },

    rowItem: {
        backgroundColor: 'white',
    },
    bottomView: {
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },

    //侧滑菜单的样式
    quickAContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    quick: {
        width: 60,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
});