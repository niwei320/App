import React from 'react';
import { ScrollView, TouchableOpacity, Text, Image, View, Alert, StyleSheet } from 'react-native';
import { adaptSize, kScreenWidth, isEmpty, isNotEmpty, safeArray, itemAddKey } from '../../../PublicModule/Util/YFWPublicFunction';
import { BaseStyles } from "../../../Utils/YFWBaseCssStyle";
import { getItem, setItem, removeItem, kO2OSearchHistoryKey } from '../../../Utils/YFWStorage'
export default class HistoryAndHotWords extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deleteStatus: false,
            historySeacrchArray: [],
        }
        this._requestHistoryData();
    }

    clearHistoryMethod() {
        this.setState({
            deleteStatus: !this.state.deleteStatus,
        })
    }

    removeHistory(info) {
        console.log(info);
        if (isEmpty(info) || isEmpty(info.value)) return;
        let type = info.type
        let value = info.value
        getItem(kO2OSearchHistoryKey).then((id) => {
            var array = id;
            if (isEmpty(array)) {
                array = [];
            }
            let repeat = array.some(function (item) { return item.type == type && item.value == value });
            if (repeat) {
                array.splice(array.findIndex(item => item.type == type && item.value == value), 1);
            }
            setItem(kO2OSearchHistoryKey, array);
            this.setState({
                historySeacrchArray: itemAddKey(array),
                deleteStatus: array.length > 0
            })
        });
    }

    clearHistoryMethodAlert() {
        Alert.alert('', '是否全部删除搜索历史', [
            {
                text: '确定',
                onPress: () => {
                    removeItem(kO2OSearchHistoryKey);
                    this.setState({
                        historySeacrchArray: [],
                        deleteStatus: false
                    });
                }
            },
            {
                text: '取消',
                onPress: () => { }
            }
        ])
    }
    _requestHistoryData() {
        getItem(kO2OSearchHistoryKey).then((array) => {
            if (isNotEmpty(array)) {
                let dataArray = array;
                dataArray = itemAddKey(dataArray);
                this.setState({
                    historySeacrchArray: dataArray,
                });
            }
        });
    }
    _renderHistoryView() {
        if (isNotEmpty(this.state.historySeacrchArray) && safeArray(this.state.historySeacrchArray).length > 0) {
            return (
                <View >
                    <View style={[BaseStyles.leftCenterView, { width: kScreenWidth, justifyContent: 'space-between' }]}>
                        <View style={[BaseStyles.titleWordStyle, { marginLeft: adaptSize(19), marginTop: adaptSize(23), }]}>
                            <Text style={{ fontSize: 14, color: '#333333', fontWeight: 'bold' }}>{this.props.historySearch.titleText}</Text>
                        </View>
                        {this.state.deleteStatus ?
                            <View style={{ ...BaseStyles.leftCenterView, ...BaseStyles.centerItem, marginTop: adaptSize(21), marginRight: adaptSize(15) }}>
                                <TouchableOpacity activeOpacity={1}
                                    hitSlop={{ left: 10, top: 10, bottom: 10, right: 10 }}
                                    onPress={() => this.clearHistoryMethodAlert()}>
                                    <Text style={{ fontSize: 12, color: '#666' }}>{this.props.historySearch.deleteAllText}</Text>
                                </TouchableOpacity>
                                <View style={{ width: adaptSize(1), height: adaptSize(9), borderRadius: adaptSize(2), backgroundColor: '#999', marginHorizontal: adaptSize(6) }} />
                                <TouchableOpacity activeOpacity={1}
                                    hitSlop={{ left: 10, top: 10, bottom: 10, right: 10 }}
                                    onPress={() => this.setState({ deleteStatus: false })}>
                                    <Text style={{ fontSize: 12, color: "#fe0000" }}>{this.props.historySearch.deleteComplete}</Text>
                                </TouchableOpacity>
                            </View> :
                            <TouchableOpacity activeOpacity={1}
                                style={[{ marginRight: adaptSize(14), marginTop: adaptSize(21) }]}
                                hitSlop={{ left: 10, top: 10, bottom: 10, right: 10 }}
                                onPress={() => this.clearHistoryMethod()}>
                                <Image style={{ height: adaptSize(17), width: adaptSize(14), resizeMode: 'stretch' }}
                                    source={this.props.historySearch.deleteAllIcon} />
                            </TouchableOpacity>}
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingRight: adaptSize(5), paddingLeft: adaptSize(12), paddingTop: adaptSize(10), marginBottom: adaptSize(48) }}>
                        {this._renderHistoryItem()}
                    </View>
                </View>
            );
        }
    }
    _renderHistoryItem() {
        var allBadge = [];
        let historyArray = safeArray(this.state.historySeacrchArray);
        for (var i = 0; i < historyArray.length; i++) {
            let badge = historyArray[i];
            allBadge.push(
                <View key={i}>
                    <TouchableOpacity activeOpacity={1} key={'history' + i} style={{ marginBottom: adaptSize(7), marginRight: adaptSize(7), borderRadius: adaptSize(14), backgroundColor: '#e9f2ff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}
                        onPress={() => this.props.clickMethod.clickItemMethod(badge.type, badge.value)}>
                        <Text style={[{ color: '#5799f7', fontSize: 11 }, { marginLeft: adaptSize(19), marginRight: this.state.deleteStatus ? 0 : adaptSize(19), marginTop: adaptSize(9), marginBottom: adaptSize(9), maxWidth: adaptSize(12 * 14) }]} numberOfLines={2}>
                            {badge.type == 'shop' ? badge.value + '商家' : badge.value}
                        </Text>
                        {this.state.deleteStatus && <TouchableOpacity onPress={() => this.removeHistory(badge)} activeOpacity={1}><Image style={{ width: adaptSize(7), height: adaptSize(7), marginRight: adaptSize(6), marginLeft: adaptSize(6), tintColor: '#5799f7', alignSelf: 'center' }} source={this.props.historySearch.deleteIcon} /></TouchableOpacity>}
                    </TouchableOpacity>
                </View>
            );
        }
        return allBadge
    }
    _renderHotWordsView() {
        if (isNotEmpty(this.props.hotWords) && safeArray(this.props.hotWords).length > 0) {
            return (
                <View >
                    <View style={[BaseStyles.leftCenterView, { width: kScreenWidth, justifyContent: 'flex-start' }]}>
                        <View style={[BaseStyles.titleWordStyle, { marginLeft: adaptSize(19), marginTop: adaptSize(23), }]}>
                            <Text style={{ fontSize: 14, color: '#333333', fontWeight: 'bold' }}>{this.props.hotSearch.titleText}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingRight: adaptSize(5), paddingLeft: adaptSize(12), paddingTop: adaptSize(10), }}>
                        {this._renderHotWordsItem()}
                    </View>
                </View>
            );
        }
    }
    _renderHotWordsItem() {
        var allBadge = [];
        let hotArray = safeArray(this.props.hotWords);
        for (var i = 0; i < hotArray.length; i++) {
            let badge = hotArray[i].keywords_name;
            allBadge.push(
                <View key={i}>
                    <TouchableOpacity activeOpacity={1} key={'hot' + i} style={{ marginLeft: 0, marginTop: 0, marginBottom: adaptSize(7), marginRight: adaptSize(7), borderRadius: adaptSize(14), backgroundColor: '#fafafa', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', maxWidth: adaptSize(12 * 14) }}
                        onPress={() => this.props.clickMethod.clickGoodsItemMethod(badge)}>
                        <Text style={[{ color: '#666666', fontSize: 11 }, { marginLeft: adaptSize(19), marginRight: adaptSize(19), marginTop: adaptSize(9), marginBottom: adaptSize(9), }]} numberOfLines={2}>
                            {badge}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return allBadge
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={[BaseStyles.container, { backgroundColor: 'white' }]}>
                    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={'always'}>
                        {this._renderHistoryView()}
                        {this._renderHotWordsView()}
                    </ScrollView>
                </View>
            </View>
        );
    }

}
const styles = StyleSheet.create({

});
