import React from 'react';
import { FlatList, TouchableOpacity, Text, Image, View, StyleSheet } from 'react-native';
import { adaptSize, kScreenWidth, getStatusBarHeight, isEmpty, isNotEmpty, dismissKeyboard_yfw, } from '../../../PublicModule/Util/YFWPublicFunction';
import { BaseStyles } from "../../../Utils/YFWBaseCssStyle";
export default class SearchTextRelative extends React.Component {
    constructor(props) {
        super(props);
    }
    _renderHeader() {
        return (
            <View key={'header'}>
                <TouchableOpacity activeOpacity={1}
                    style={[BaseStyles.leftCenterView, styles.headerImage]}
                    onPress={() => { this.props.clickMethod.clickShopItemMethod(this.props.searchText) }}>
                    <Image style={{ height: adaptSize(18), width: adaptSize(18) }} source={this.props.relative.shopIcon} />
                    <Text numberOfLines={4}
                        style={{ marginLeft: adaptSize(9), marginRight: adaptSize(15), fontSize: adaptSize(15), color: '#666666' }}>{this.props.relative.searchTextFirstHalf + this.props.searchText + this.props.relative.searchTextFinalHalf}</Text>
                </TouchableOpacity>
                <View style={{ backgroundColor: '#f5f5f5', height: 1, width: kScreenWidth }} />
            </View>
        );
    }

    _renderListItem = (item) => {
        return (
            <View style={{ height: adaptSize(43) }}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView, { flex: 1 }]}
                    onPress={() => this.props.clickMethod.clickGoodsItemMethod(item.item)}>
                    <Text style={[BaseStyles.titleWordStyle, { marginLeft: adaptSize(13), fontSize: adaptSize(15), fontWeight: 'normal' }]}>{item.item}</Text>
                </TouchableOpacity>
                <View style={{ backgroundColor: '#f5f5f5', height: adaptSize(1), width: kScreenWidth - adaptSize(13), marginLeft: adaptSize(13) }} />
            </View>
        );
    }
    render() {
        return (
            <View style={[BaseStyles.container, { backgroundColor: 'white', flex: 1 }]}>
                <FlatList
                    ref={(flatList) => this._flatList = flatList}
                    extraData={item => item.id}
                    data={this.props.relativeItems}
                    onScroll={() => { dismissKeyboard_yfw(); }}
                    renderItem={({ item }) => this._renderListItem(item)}
                    // ListHeaderComponent={() => this._renderHeader()}
                    keyboardShouldPersistTaps={'always'}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    headerImage: {
        flex: 1,
        paddingRight: adaptSize(15),
        paddingLeft: adaptSize(13),
        paddingBottom: adaptSize(18),
        paddingTop: adaptSize(19)
    }
});
