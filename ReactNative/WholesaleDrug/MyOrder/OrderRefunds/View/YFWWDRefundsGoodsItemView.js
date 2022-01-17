import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput, Platform,
} from 'react-native';
import { isEmpty, isNotEmpty, safeObj } from "../../../../PublicModule/Util/YFWPublicFunction";
import YFWMoneyLabel from "../../../../widget/YFWMoneyLabel";
import YFWToast from "../../../../Utils/YFWToast";
import { NUMBERS } from "../../../../PublicModule/Util/RuleString";
import { TYPE_DOUBLE, TYPE_NOMAL, TYPE_OTC, TYPE_SINGLE } from "../../../../widget/YFWPrescribedGoodsTitle";
import YFWPrescribedGoodsTitle from "../../../../widget/YFWPrescribedGoodsTitle";
import { YFWImageConst } from '../../../Images/YFWImageConst';

export default class YFWWDRefundsGoodsItemView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isSelectable: Boolean(this.props.isSelectable),
            isSelected: Boolean(this.props.isSelected),
            isPriceRed: Boolean(this.props.isPriceRed),
            itemHeight: Number(this.props.itemHeight),
            itemWidth: Number(this.props.itemWidth),
            goodsImgUrl: this.props.goodsImgUrl,
            goodsName: this.props.goodsName,
            goodsStandard: this.props.goodsStandard,
            goodsPeriodDate: this.props.goodsPeriodDate,
            goodsQuantity: this.props.goodsQuantity,
            goodsPrice: this.props.goodsPrice,
            goodsPrescriptionType: this.props.goodsPrescriptionType,
            onMethodSelect: this.props.onMethodSelect ? this.props.onMethodSelect : () => { },
            onMethodQuantityChange: this.props.onMethodQuantityChange ? this.props.onMethodQuantityChange : () => { },
            onMethodOnBlur: this.props.onMethodOnBlur ? this.props.onMethodOnBlur : () => { },
            onMethodOnSubmitEditing: this.props.onMethodOnSubmitEditing ? this.props.onMethodOnSubmitEditing : () => { },

            goodsQuantityEdit: this.props.goodsQuantity,
        }
    }

    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillReceiveProps(nextProps) {
        this.setState({
            isSelectable: Boolean(this.props.isSelectable),
            isPriceRed: Boolean(nextProps.isPriceRed),
            itemHeight: Number(nextProps.itemHeight),
            itemWidth: Number(nextProps.itemWidth),
            goodsImgUrl: nextProps.goodsImgUrl,
            goodsName: nextProps.goodsName,
            goodsStandard: nextProps.goodsStandard,
            goodsPeriodDate: nextProps.goodsPeriodDate,
            goodsQuantity: nextProps.goodsQuantity,
            goodsPrice: nextProps.goodsPrice,
            goodsPrescriptionType: nextProps.goodsPrescriptionType,
            onMethodSelect: nextProps.onMethodSelect ? nextProps.onMethodSelect : () => { },
            onMethodQuantityChange: this.props.onMethodQuantityChange ? this.props.onMethodQuantityChange : () => { },
            onMethodOnBlur: nextProps.onMethodOnBlur ? nextProps.onMethodOnBlur : () => { },
            onMethodOnSubmitEditing: nextProps.onMethodOnSubmitEditing ? nextProps.onMethodOnSubmitEditing : () => { },
        })
    }

    componentDidMount() {

    }

    //-----------------------------------------------METHOD---------------------------------------------

    _methodSelect() {
        this.state.isSelected = !this.state.isSelected
        this.setState({})
        this.state.onMethodSelect && this.state.onMethodSelect(this.state)
    }

    _methodPlus() {
        let quantity = this.state.goodsQuantityEdit + 1;
        if (quantity <= this.state.goodsQuantity) {
            this.setState({
                goodsQuantityEdit: quantity
            })
            this.state.onMethodQuantityChange && this.state.onMethodQuantityChange(quantity)
        } else {
            YFWToast('超过上限');
        }
    }

    _methodSub() {
        let quantity = this.state.goodsQuantityEdit - 1;
        if (quantity > 0) {
            this.setState({
                goodsQuantityEdit: quantity
            })
            this.state.onMethodQuantityChange && this.state.onMethodQuantityChange(quantity)
        }
    }

    _methodOnChangeText(text) {
        let quantity = Number.parseInt(text.replace(NUMBERS, ''));
        if (quantity > Number.parseInt(this.state.goodsQuantity)) {
            YFWToast('超过上限');
            quantity = this.state.goodsQuantity
        }
        if (isNaN(quantity)) {
            quantity = ''
        } else {
            this.state.onMethodQuantityChange && this.state.onMethodQuantityChange(quantity)
        }
        this.setState({
            goodsQuantityEdit: quantity
        })
    }

    _methodOnBlur() {
        let quantity = Number.parseInt(this.state.goodsQuantityEdit);
        if (isNaN(quantity) || !quantity) {
            quantity = this.state.goodsQuantity
        }
        this.setState({
            goodsQuantityEdit: quantity
        })
        this.state.onMethodQuantityChange && this.state.onMethodQuantityChange(quantity)
        this.state.onMethodOnBlur && this.state.onMethodOnBlur()
    }

    _methodOnSubmitEditing() {
        let quantity = Number.parseInt(this.state.goodsQuantityEdit);
        if (isNaN(quantity) || !quantity) {
            quantity = this.state.goodsQuantity
        }
        this.setState({
            goodsQuantityEdit: quantity
        })
        this.state.onMethodQuantityChange && this.state.onMethodQuantityChange(quantity)
        this.state.onMethodOnSubmitEditing && this.state.onMethodOnSubmitEditing()
    }

    //-----------------------------------------------RENDER---------------------------------------------
    _renderCheckIcon() {
        if (this.state.isSelectable) {
            return (
                <Image style={{ width: 22, height: 22, marginLeft: 7, marginRight: 11, resizeMode: 'stretch' }}
                    source={this.state.isSelected ? YFWImageConst.Icon_select_blue : require('../../../../../img/check_discheck.png')} />
            )
        } else {
            return <View style={{ width: 12 }} />
        }
    }

    _renderGoodsInfo() {
        let hasPeriod = isNotEmpty(this.state.goodsPeriodDate)
        let period_to = this.state.goodsPeriodDate.includes('有效期') ? this.state.goodsPeriodDate : ('有效期至：' + this.state.goodsPeriodDate)
        return (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Image style={{ width: 58, height: 58, marginRight: this.state.isSelectable ? 0 : 7, resizeMode: 'stretch' }}
                    source={{ uri: this.state.goodsImgUrl }} />
                <View style={{ flex: 1, marginHorizontal: 8, marginVertical: 7, justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            {this._renderTitleView()}
                        </View>
                        {this._renderGoodsInfoPrice()}
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: "#999999" }} ellipsizeMode={'tail'}>{this.state.goodsStandard}</Text>
                            {hasPeriod ? <Text style={{ fontSize: 11, color: "#999999" }} ellipsizeMode={'tail'}>{period_to}</Text> : <View />}
                        </View>
                        {this._renderGoodsInfoCounter()}
                    </View>
                </View>
            </View>
        )
    }

    _renderGoodsInfoPrice() {
        let priceColor = this.state.isPriceRed ? '#ff3300' : '#999999'
        return (
            <View style={{ width: 60, PaddingLeft: 10, justifyContent: 'center', alignItems: 'flex-end' }}>
                <YFWMoneyLabel moneyTextStyle={{ fontSize: 12, color: priceColor }} decimalsTextStyle={{ fontSize: 10, color: priceColor }} money={parseFloat(this.state.goodsPrice)}></YFWMoneyLabel>
            </View>
        )
    }

    _renderGoodsInfoCounter() {
        if (this.state.isSelectable) {
            return (
                <View style={{
                    width: 73, height: 22, marginLeft: 5, flexDirection: 'row',
                    borderRadius: 2, borderStyle: "solid", borderWidth: 0.3, borderColor: "#cccccc"
                }}>
                    <TouchableOpacity style={{ width: 22, justifyContent: 'center', alignItems: 'center' }}
                        activeOpacity={1}
                        onPress={() => (this._methodSub())}>
                        <Text style={{ fontSize: 17, color: "#999999", includeFontPadding: false }}>-</Text>
                    </TouchableOpacity>
                    <View style={{ borderWidth: 0.3, borderColor: "#cccccc" }} />
                    {this._renderGoodsInfoCounterInput()}
                    <View style={{ borderWidth: 0.3, borderColor: "#cccccc" }} />
                    <TouchableOpacity style={{ width: 22, justifyContent: 'center', alignItems: 'center' }}
                        activeOpacity={1}
                        onPress={() => (this._methodPlus())}>
                        <Text style={{ fontSize: 17, color: "#999999", includeFontPadding: false }}>+</Text>
                    </TouchableOpacity>
                </View>
            )
        } else {
            return <Text style={{ fontSize: 11, color: "#999999" }}>x{this.state.goodsQuantity}</Text>
        }
    }

    _renderGoodsInfoCounterInput() {
        return (
            <View style={{ flex: 1 }}>
                <TextInput allowFontScaling={false}
                    ref={'textInput'}
                    style={{ textAlign: 'center', padding: 0 }}
                    onSubmitEditing={(event) => this._methodOnSubmitEditing(event)}
                    onBlur={(event) => this._methodOnBlur(event)}
                    value={String(this.state.goodsQuantityEdit)}
                    onChangeText={(text) => { this._methodOnChangeText(text) }}
                    keyboardType={Platform.OS == 'ios' ? "number-pad" : "numeric"}
                    returnKeyType={'done'}
                    autoFocus={false}
                    underlineColorAndroid="transparent" />
            </View>
        )
    }

    _renderTitleView() {
        let type = this.state.goodsPrescriptionType
        let title = this.state.goodsName
        if (safeObj(type) + "" === "1") {
            return this._renderPrescriptionLabel(TYPE_SINGLE, title)
        }
        //双轨药
        else if (safeObj(type) + "" === "2") {
            return this._renderPrescriptionLabel(TYPE_DOUBLE, title)
        }
        else if (safeObj(type) + "" === "0") {
            return this._renderPrescriptionLabel(TYPE_OTC, title)
        }
        //这里没有处方药的判断
        else {
            return this._renderPrescriptionLabel(TYPE_NOMAL, title)
        }
    }

    _renderPrescriptionLabel(type, title) {
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={{ flex: 1, fontSize: 12, fontWeight: '500', marginLeft: 3, color: "#333333" }}
            numberOfLines={2}
        />
    }

    render() {
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this._methodSelect()}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: this.state.itemHeight,
                    width: this.state.itemWidth,
                }}>
                    {this._renderCheckIcon()}
                    {this._renderGoodsInfo()}
                </View>
            </TouchableOpacity>
        )
    }

}