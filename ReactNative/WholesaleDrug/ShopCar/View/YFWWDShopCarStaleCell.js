import React, { Component } from 'react'
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native'
import { kScreenWidth, tcpImage, safeObj } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWPrescribedGoodsTitle, { TYPE_NOMAL, TYPE_OTC, TYPE_DOUBLE, TYPE_SINGLE } from '../../../widget/YFWPrescribedGoodsTitle';
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';

export default class YFWWDShopCarStaleCell extends Component {


    constructor(args) {
        super(args)
    }

    static defaultProps = {
        DataArray: []
    }

    render() {

        if (this.props.DataArray.length == 0) {
            return (<View />)
        }
        return (
            <View style={styles.container}>
                <View style={{ overflow: 'hidden' }}>
                    {this.renderMedicineCell()}
                </View>
            </View>
        )
    }

    renderMedicineCell() {

        let allCell = []
        this.props.DataArray.map((badge, index) => {
            allCell.push(
                <TouchableOpacity key={index + 'cell'} activeOpacity={1} style={{ height: 90, backgroundColor: 'white' }} onPress={() => { this._selectGoodsItemMethod(badge) }}>
                    <View style={[BaseStyles.leftCenterView, { flex: 1 }]} >
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 6 }}>
                            <View style={{ backgroundColor: '#ccc', borderRadius: 7, height: 14, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 10, paddingHorizontal: 6, lineHeight: 14 }}>{'失效'}</Text>
                            </View>
                        </View>
                        <Image style={{ width: 60, height: 60 }}
                            source={{ uri: tcpImage(badge.img_url) }} />
                        <View style={{ marginHorizontal: 10, flex: 1, height: 60 }}>
                            {this.renderTopInfo(badge)}
                            <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between' }]}>
                                <Text style={[styles.regionStyle]}>{badge.standard}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )
        })

        return allCell

    }
    renderTopInfo(item) {
        return (
            <View style={{ justifyContent: 'space-between', flex: 1, maxHeight: 33 }}>
                {this.renderTitleView(item)}
            </View>
        )
    }

    renderTitleView(item) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if (safeObj(item).PrescriptionType + "" === "1") {
            return this.rednerPrescriptionLabel(TYPE_SINGLE, item.title)
        }
        //双轨药
        else if (safeObj(item).PrescriptionType + "" === "2") {
            return this.rednerPrescriptionLabel(TYPE_DOUBLE, item.title)
        }
        else if (safeObj(item).PrescriptionType + "" === "0") {
            return this.rednerPrescriptionLabel(TYPE_OTC, item.title)
        }
        //这里没有处方药的判断
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL, item.title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type, title) {

        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            numberOfLines={2}
            isOverdue={true}
            style={{
                fontSize: 13,
                color: '#000',
                fontWeight: 'bold',
                marginRight: 10,
                flex: 1,
                lineHeight: 16
            }}
        />
    }

    _selectGoodsItemMethod(badge) {
        if (this.props.selectGoodsItemMethod) {
            this.props.selectGoodsItemMethod(badge)
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation: 2,
        borderRadius: 8,
        marginHorizontal: 13,
        padding: 4,
    },
    regionStyle: {
        color: '#ccc',
        fontSize: 10,
    }
})