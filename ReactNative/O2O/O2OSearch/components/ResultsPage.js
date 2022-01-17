import React from 'react';
import { FlatList, TouchableOpacity, Text, Image, View, StyleSheet } from 'react-native';
import { adaptSize, kScreenWidth, getStatusBarHeight, isEmpty, isNotEmpty, dismissKeyboard_yfw, safeArray } from '../../../PublicModule/Util/YFWPublicFunction';
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';
import YFWO2OShopingCar from '../../widgets/YFWO2OShopingCar'
export default class ResultsPage extends React.Component {
    constructor(props) {
        super(props);
    }
    _renderHeader() {
        return (
            <View key={'header'} style={[BaseStyles.leftCenterView, { justifyContent: 'space-between', marginTop: adaptSize(17), marginBottom: adaptSize(11), height: adaptSize(20) }]}>
                <TouchableOpacity activeOpacity={1}
                    style={[BaseStyles.leftCenterView, { marginLeft: adaptSize(12) }]}
                    onPress={() => { }}>
                    <Image style={{ height: adaptSize(13), width: adaptSize(12) }} source={require('../../Image/location_icon.png')} />
                    <Text numberOfLines={1}
                        style={{ marginLeft: adaptSize(5), fontSize: adaptSize(12), color: '#333333', fontWeight: 'bold', maxWidth: kScreenWidth - adaptSize(160) }}>{'定位：' + this.props.resultHeaderItem.location}</Text>
                </TouchableOpacity>
                <Text numberOfLines={1}
                    style={{ marginRight: adaptSize(13), fontSize: adaptSize(12), color: '#999999' }}>{'3.0km内 共有'}
                    <Text style={{ fontSize: adaptSize(12), color: 'rgb(87,153,247)' }}>{this.props.resultHeaderItem.rowCount}</Text>
                    {'家药店'}
                </Text>
            </View>
        );
    }
    _renderListItem = (item) => {
        return (
            <View style={{ height: adaptSize(258), backgroundColor: '#ffffff', width: adaptSize(351), borderRadius: adaptSize(7), alignSelf: 'center', marginBottom: adaptSize(10), paddingLeft: adaptSize(10), paddingTop: adaptSize(10) }}>
                <TouchableOpacity onPress={() => this.props._dealNavigation({type:'get_oto_store',data:{storeid:item.storeId, categoryID: this.props.categoryId}})} activeOpacity={1} style={{ flexDirection: 'row', marginBottom: adaptSize(11) }}>
                    <View style={{width: adaptSize(56), height: adaptSize(45), marginRight: adaptSize(12),borderWidth: adaptSize(1),borderColor: "#bfbfbf",backgroundColor:'ffffff',justifyContent:'center',alignItems:'center'}}>
                        <Image style={{ width: adaptSize(56), height: adaptSize(45), resizeMode: 'stretch' }} source={{ uri: item.logoImage }} defaultSource={require('../../../../img/default_img.png')} />
                        {/* <Image style={{ width: adaptSize(21), height: adaptSize(11), position: 'absolute' }} /> */}
                    </View>
                    <View>
                        <Text style={{ maxWidth: adaptSize(208), fontSize: 14, color: '#333333', marginBottom: adaptSize(7), includeFontPadding: false, fontWeight: 'bold' }} numberOfLines={1} >{item.storeTitle}</Text>
                        <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between', width: adaptSize(258), marginBottom: adaptSize(7) }]}>
                            <View style={[BaseStyles.leftCenterView,]}>
                                <Image style={{ width: adaptSize(12), height: adaptSize(11) }} source={require('../../Image/icon_star.png')} />
                                <Text style={{ fontSize: 12, color: '#ffb02e', marginRight: adaptSize(8) }}>{item.shopAvgLevel}</Text>
                                {item.sale_count > 0 && <Text style={{ fontSize: 11, color: '#666666' }}>{'月销   ' + item.sale_count}</Text>}
                            </View>
                            <Text style={{ fontSize: 11, color: '#666666' }}>{'距离 ' + item.distance}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 11, color: '#999999', marginRight: adaptSize(5) }}>{'起送  ￥' + item.startingPrice}</Text>
                            <Text style={{ fontSize: 11, color: '#666666' }}>{'配送费  ￥' + item.logisticsPrice}</Text>
                        </View>
                        {/* <View style={{ flexDirection: 'row' }}></View> */}
                    </View>
                </TouchableOpacity>
                <View style={[BaseStyles.container, { flex: 1, backgroundColor: '#ffffff' }]}>
                    <FlatList
                        horizontal={true}
                        keyExtractor={(item, index) => index.toString()}
                        ref={(flatList) => this._flatListMedicine = flatList}
                        data={item.medicineItems}
                        onScroll={() => { dismissKeyboard_yfw(); }}
                        renderItem={({ item, index }) => this._renderMedicineListItem(item, index)}
                        ListHeaderComponent={() => this._renderMedicineHeader(item)}
                        keyboardShouldPersistTaps={'always'}
                        ListFooterComponent={safeArray(item.medicineItems).length>4 ? () => this._renderMedicineFooter(item) : () => { return null }}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            </View>
        );
    }
    _renderMedicineListItem(item, index) {
        if (index < 4)
            return (
                <TouchableOpacity onPress={() => {console.log(1);;this.props._dealNavigation({type:'get_oto_store',data:{storeid:item.storeId, storeMedicineID: item.storeMedicineid, categoryID: this.props.categoryId}})}} activeOpacity={1} style={{ width: adaptSize(100), height: adaptSize(160), justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', marginRight: adaptSize(8) }}>
                    <Image style={{ width: adaptSize(100), height: adaptSize(100), borderRadius: adaptSize(3), resizeMode: 'stretch', borderColor: '#bfbfbf', borderWidth: adaptSize(1), }} source={{ uri: item.introImage }} defaultSource={require('../../../../img/default_shop_icon.png')}/>
                    <Text style={{ fontSize: 11, color: '#666666', width: adaptSize(100), marginTop: adaptSize(4) }} numberOfLines={1}>{isNotEmpty(item.aliasCN)?item.aliasCN + ' ' + item.nameCN:item.nameCN}</Text>
                    <Text style={{ fontSize: 11, color: '#666666', width: adaptSize(100), marginBottom: adaptSize(6) }} numberOfLines={1}>{item.standard}</Text>
                    {changePrice(item.realPrice, { fontSize: 14, color: '#ff3300' }, { fontSize: 11, color: '#ff3300' }, 1,{width:adaptSize(100)})}
                </TouchableOpacity>
            )
    }
    _renderMedicineHeader(item) {
        return (<TouchableOpacity onPress={() => this.props._dealNavigation({type:'get_oto_store',data:{storeid:item.storeId, categoryID: this.props.categoryId}})} activeOpacity={1} style={{ width: adaptSize(64), height: adaptSize(164), backgroundColor: '#ffffff' }}></TouchableOpacity>)
    }
    _renderMedicineFooter(item) {
        return (
            <TouchableOpacity onPress={() => this.props._dealNavigation({type:'get_oto_store',data:{storeid:item.storeId, categoryID: this.props.categoryId}})} activeOpacity={1} style={{ width: adaptSize(65), height: adaptSize(100), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ width: adaptSize(12),fontSize: 11, color: '#666666' }}>{'进店查看更多'}</Text>
                <View style={{
                    marginTop: adaptSize(4),
                    width: adaptSize(12),
                    height: adaptSize(12),
                    borderRadius: adaptSize(6),
                    borderWidth: adaptSize(1),
                    borderColor: "#666666",
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Image style={{ width: adaptSize(3), height: adaptSize(5),tintColor:'#666666' }} source={require('../../Image/jump_gray_icon.png')} />
                </View>
            </TouchableOpacity>
        )
    }
    _renderFooter() {
        if (this.props.noMore)
            return (
                <View style={[BaseStyles.leftCenterView, { justifyContent: 'center', marginTop: adaptSize(25), marginBottom: adaptSize(25), width: kScreenWidth }]}>
                    <View style={{ width: adaptSize(23), height: adaptSize(1), backgroundColor: '#999999' }} />
                    <Text style={{ fontSize: 12, color: '#999999', marginHorizontal: adaptSize(7) }}>{'已经没有更多药店了'}</Text>
                    <View style={{ width: adaptSize(23), height: adaptSize(1), backgroundColor: '#999999' }} />
                </View>
            )
        else {
            return <></>
        }
    }
    _renderEmpty() {
        return (
            <View style={{  alignItems: 'center'}}>
                <Image style={{ marginTop: adaptSize(135),width:adaptSize(120),height:adaptSize(120) }} source={require('../../Image/search_result_empty.png')} />
                <Text style={{fontSize:12,color:'#999999',marginTop:adaptSize(10)}}>{'找不到商品'}</Text>
            </View>
        )
    }
    render() {
        return (
            <View style={[BaseStyles.container, { flex: 1 }]}>
                {this._renderHeader()}
                {this.props.firstLoad?<View></View>:<FlatList
                    refreshing={this.props.refreshing}
                    onRefresh={() => { this.props.onRefresh(this.props.keywords, 1) }}
                    keyExtractor={(item, index) => index.toString()}
                    ref={(flatList) => this._flatList = flatList}
                    data={this.props.dataSource}
                    onScroll={() => { dismissKeyboard_yfw(); }}
                    renderItem={({ item }) => this._renderListItem(item)}
                    keyboardShouldPersistTaps={'always'}
                    onEndReached={() => {
                        console.log(this.props.noMore);
                        if (!this.props.noMore)
                            this.props.onRefresh(this.props.keywords, this.props.index + 1)
                    }}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={() => { return this._renderFooter() }}
                    ListEmptyComponent={() => { return this._renderEmpty() }}
                />}
                <YFWO2OShopingCar _dealNavigation={this.props._dealNavigation}/>
            </View>
        );
    }
}
export function changePrice(price, priceStyle, iconStyle, spaceNumber,style) {
    price = parseFloat(price).toFixed(2);
    let zhenShu = '';
    let xiaoShu = '';
    let space = '';
    let i = 0
    let xsdLocation = String(price).indexOf('.');
    if (xsdLocation !== -1) {
        zhenShu = String(price).slice(0, xsdLocation);
        xiaoShu = String(price).slice(xsdLocation + 1);
    }
    else {
        zhenShu = String(price);
    }
    if (xiaoShu.length < 2) {
        while (xiaoShu.length < 2) {
            xiaoShu = xiaoShu + '0'
        }
    }
    while (i < spaceNumber) {
        space = space + ' ';
        i++;
    }
    return (
        <View style={[{ flexDirection: 'row'},style]}>
            <Text style={priceStyle} numberOfLines={1}>
                <Text style={iconStyle}>¥</Text>
                {space}{zhenShu}
                <Text style={iconStyle}>.{xiaoShu}</Text>
            </Text>
        </View>
    )
}
const styles = StyleSheet.create({
});
