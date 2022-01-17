import React, { Component } from 'react';

import {
    Image,
    TouchableOpacity,
    View,
    Text,
    FlatList, ImageBackground, TextInput, KeyboardAvoidingView, Keyboard, Platform, StyleSheet
} from 'react-native';
import {
    separatorColor,
    yfwGreenColor,
    yfwOrangeColor,
    darkTextColor,
    backGroundColor,
    yfwBlueColor
} from "../../../Utils/YFWColor";
import {
    itemAddKey,
    kScreenHeight,
    kScreenWidth,
    safe,
    isIphoneX,
    safeObj,
    isEmpty,
    isRealName,
    objToStrMap,
    mapToJson,
    iphoneBottomMargin,
    isNotEmpty, safeArray
} from "../../../PublicModule/Util/YFWPublicFunction";
import { toDecimal } from "../../../Utils/ConvertUtils";
import YFWPopupWindow from "../../../PublicModule/Widge/YFWPopupWindow";
import YFWTouchableOpacity from "../../../widget/YFWTouchableOpacity"
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';
import YFWToast from '../../../Utils/YFWToast';
import { IDENTITY_CODE, IDENTITY_VERIFY, NAME } from "../../../PublicModule/Util/RuleString";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import YFWTitleView from '../../../PublicModule/Widge/YFWTitleView';
import YFWWDTouchableOpacity from '../../Widget/View/YFWWDTouchableOpacity';


export default class YFWWDPackageAlertView extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            kHeight: kScreenWidth,
            keyBoardHeight: 0,
            status_modal: false,
            advertType: '',
            adverData: undefined,
            selectValue: undefined,
            invoice_code: '',
            invoice_title: '',
            invoice_person: new Map(),
            invoice_bank_name: '',
            invoice_bank_no: '',
            invoice_register_phone: '',
            invoice_register_address: '',
            invoice_type: '',             //1 纸质发票 2 电子发票
            isShow: true,
            logisticType: 0,                  //0 普通快递 1 门店配送 2上门自提
        };
    }
    componentDidMount() {
        this.setState({
            kHeight: this.state.advertType == 'invoice' ? kScreenWidth + 60 : kScreenWidth
        })
    }
    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardDidHide.bind(this));

    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow(e) {
        this.setState({
            keyBoardHeight: e.endCoordinates.height,
            kHeight: Platform.OS == 'ios' ? e.endCoordinates.height + 250 + 40 : kScreenWidth

        });
    }

    _keyboardDidHide() {
        this.setState({
            keyBoardHeight: 0,
            kHeight: kScreenHeight*0.6 + 60
        });
    }

    //Action

    alertViewTitle() {
        if (this.state.advertType == 'package') {
            return <Text style={{ color: "#000", fontSize: 14, fontWeight: 'bold', }}>包装方式</Text>
        } else if (this.state.advertType == 'logistic') {
            return <Text style={{ color: "#000", fontSize: 14, fontWeight: 'bold', }}>配送方式</Text>
        } else if (this.state.advertType == 'coupon') {
            return <Text style={{ color: "#000", fontSize: 14, fontWeight: 'bold', }}>优惠券</Text>
        } else if (this.state.advertType == 'platformCoupons') {
            return <Text style={{ color: "#000", fontSize: 14, fontWeight: 'bold', }}>平台优惠</Text>
        } else if (this.state.advertType == 'invoice') {
            return <Text style={{ color: "#000", fontSize: 14, fontWeight: 'bold', }}>填写发票信息</Text>
        } else if (this.state.advertType === 'invoice_type') {
            return <Text style={{ color: "#000", fontSize: 14, fontWeight: 'bold', }}>选择发票种类</Text>
        }
    }
    alertTypeViewHeader() {
        if (this.state.advertType === 'invoice') {
            let typeName = [{ name: '增值税普通发票', status: false }]
            if(isNotEmpty(this.state.invoice_code)){
                typeName.push({ name: '增值税专用发票 ', status: true })
            }
            let views = [];
            let selectIndex = this.state.isShow ? 0 : 1
            typeName.map((item, index) => {
                views.push(
                    this.renderTypeClickBtn(item.name, index == selectIndex, () => {this.clickType(item.status, index)})
                )
            })
            return (
                <View>
                    <Text style={{ color: "#000", fontSize: 14, marginLeft: 12 }}>发票类型</Text>
                    <View style={{ flexDirection: "row",paddingBottom: 17 }}>
                        {views}
                    </View>
                </View>
            )
        } else if (this.state.advertType === 'invoice_type') {//发票种类是否电子
            let invoice_types_views = [];
            let invoice_types = safeArray(safeObj(this.state.adverData).invoice_types)
            if(isEmpty(this.state.invoice_type)){
                this.state.invoice_type = invoice_types[0]
            }
            invoice_types.map((item, index) => {
                if(item === '1'){
                    invoice_types_views.push(
                        this.renderTypeClickBtn(
                            '纸质发票',
                            this.state.invoice_type === '1',
                            () => {this.setState({invoice_type:'1'})}
                        )
                    )
                } else if(item === '2'){
                    invoice_types_views.push(
                        this.renderTypeClickBtn(
                            '电子发票',
                            this.state.invoice_type === '2',
                            () => {this.setState({invoice_type:'2'})}
                        )
                    )
                }
            })
            return (
                <View>
                    <Text style={{ color: "#000", fontSize: 14, marginLeft: 12 }}>发票种类</Text>
                    <View style={{ flexDirection: "row",paddingBottom: 17 }}>
                        {invoice_types_views}
                    </View>
                </View>
            )
        }
        else {
            return <View />
        }
    }

    renderTypeClickBtn(title, isSelected, onPressFun){
        return (
            <TouchableOpacity
                onPress={() => {
                    onPressFun && onPressFun()
                }}
                style={[{
                    marginLeft:12,
                    marginTop: 17,
                    paddingHorizontal: 10,
                    height: 25,
                    borderRadius: 16,
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: isSelected ? yfwBlueColor() : "#999999",
                }, BaseStyles.centerItem]}
            >
                <Text style={{ fontSize: 14, color: isSelected ? yfwBlueColor() : "#999999" }}>{title}</Text>
            </TouchableOpacity>
        )
    }

    clickType(isSelect, index) {
        //无需发票和我要发票内容显示
        if (index == 0) {
            this.setState({
                isShow: true,
                kHeight: kScreenHeight * 0.4,
            })
        } else {
            this.setState({
                isShow: false,
                kHeight: kScreenHeight * 0.6 + 60
            })
        }
    }

    alertViewHeaderTitle() {
        if (this.state.advertType == 'package') {
            return <Text style={{ color: "#000", fontSize: 13, marginLeft: 12 }}>选择包装方式</Text>
        } else if (this.state.advertType == 'logistic') {
            if (this.state.adverData.sellershipping == '' && this.state.adverData.packedup == '') {
                return <Text style={{ color: "#000", fontSize: 13, marginLeft: 12 }}>选择配送方式</Text>
            } else {
                return (
                    <View style={{ height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                        <TouchableOpacity activeOpacity={1} style={{ justifyContent: 'center', alignItems: 'center', height: 40 }} onPress={() => { this.setState({ logisticType: 0 }) }}>
                            {this.state.logisticType == 0 ?
                                <YFWTitleView title={'普通快递'} style_title={{ width: 80, fontSize: 15, fontWeight: 'normal' }} hiddenBgImage={false} />
                                : <Text style={{ fontSize: 14, color: 'rgb(153,153,153)' }}>普通快递</Text>
                            }
                        </TouchableOpacity>
                        {
                            this.state.adverData.sellershipping != '' ?
                                <TouchableOpacity activeOpacity={1} style={{ justifyContent: 'center', alignItems: 'center', height: 40 }} onPress={() => { this.setState({ logisticType: 1 }) }}>
                                    {this.state.logisticType == 1 ?
                                        <YFWTitleView title={'门店配送'} style_title={{ width: 80, fontSize: 15, fontWeight: 'normal' }} hiddenBgImage={false} />
                                        : <Text style={{ fontSize: 14, color: 'rgb(153,153,153)' }}>门店配送</Text>
                                    }
                                </TouchableOpacity> : null
                        }
                        {
                            this.state.adverData.packedup != '' ?
                                <TouchableOpacity activeOpacity={1} style={{ justifyContent: 'center', alignItems: 'center', height: 40 }} onPress={() => { this.setState({ logisticType: 2 }) }}>
                                    {this.state.logisticType == 2 ?
                                        <YFWTitleView title={'上门自提'} style_title={{ width: 80, fontSize: 15, fontWeight: 'normal' }} hiddenBgImage={false} />
                                        : <Text style={{ fontSize: 14, color: 'rgb(153,153,153)' }}>上门自提</Text>
                                    }
                                </TouchableOpacity> : null
                        }
                    </View>
                )
            }
        } else if (this.state.advertType == 'coupon') {
            let couponLength = this.state.adverData.coupon_items.length - 1;
            let title = couponLength > 0 ? '可用优惠券(' + couponLength.toString() + ')' : '';
            return <Text style={{ color: "#000", fontSize: 13, marginLeft: 12 }}>{title}</Text>
        } else if (this.state.advertType == 'platformCoupons') {
            return <Text style={{ color: "#000", fontSize: 13, marginLeft: 12 }}>可用优惠券</Text>
        } else if (this.state.advertType == 'invoice') {
            return <View />
        }
    }
    flatListDataArray() {
        let data = Array();
        if (this.state.advertType == 'package') {
            data = this.state.adverData.package_items;
        } else if (this.state.advertType == 'logistic') {
            data = this.state.adverData.logistic_items;
        } else if (this.state.advertType == 'coupon') {
            data = this.state.adverData.coupon_items;
        } else if (this.state.advertType == 'platformCoupons') {
            data = this.state.adverData;
        } else if (this.state.advertType == 'invoice') {
            data = ['sss'];
        }
        itemAddKey(data);
        return data;
    }

    showView(type, value, selectv) {
        this.modalView && this.modalView.show()
        this.state.advertType = type
        this.state.adverData = value
        this.state.selectValue = selectv
        this.state.kHeight = kScreenWidth
        if (type === 'invoice_type') {
            if(isNotEmpty(selectv) && isNotEmpty(selectv.get(value.shop_id))){
                this.state.invoice_type = selectv.get(value.shop_id).invoice_type
            } else {
                this.state.invoice_type = ''
            }
        }
        if (type === 'invoice') {
                this.state.invoice_code = value.invoice_code
                this.state.invoice_title = value.invoice_name
                this.state.invoice_bank_name = value.invoice_bank_name
                this.state.invoice_bank_no = value.invoice_bank_no
                this.state.invoice_register_address = value.invoice_register_address
                this.state.invoice_register_phone = value.invoice_register_phone
                this.state.kHeight = this.state.isShow?kScreenHeight * 0.4:kScreenHeight * 0.6 + 60
        }

        this.setState({})
    }

    closeView() {
        this.modalView && this.modalView.disMiss()
    }

    clickItem(item) {
        if (this.state.advertType == 'platformCoupons') {
            this.setState({
                selectValue: item,
            });
            if (this.props.callback) {
                this.props.callback(this.state.advertType, item.item)
            }
        } else if (this.state.advertType == 'invoice') {

        } else {
            let selectMap = this.state.selectValue;
            selectMap.set(this.state.adverData.shop_id, item.item);
            this.setState({
                selectValue: selectMap,
            });
            if (this.props.callback) {
                this.props.callback(this.state.advertType, selectMap)
            }
        }

        this.closeView();
    }

    _confirmClickInvoice() {
        if (this.state.isShow == true) {
            let invoiceMap = this.state.invoice_person
            invoiceMap.set('title', this.state.invoice_title)
            invoiceMap.set('code', this.state.invoice_code)
            invoiceMap.set('type', 1)
            this.setState({
                selectValue: invoiceMap
            })
            if (this.props.callback) {
                this.props.callback(this.state.advertType, invoiceMap)
            }
            this.closeView();
            return;
        }
        let toastShowPosition = kScreenHeight * 0.2
        if (this.state.invoice_bank_name.length == 0) {
            YFWToast('请输入开户行', { position: toastShowPosition});
            return;
        }
        if (this.state.invoice_bank_no.length == 0) {
            YFWToast('请输入银行账号', { position: toastShowPosition});
            return;
        }
        if (this.state.invoice_register_phone.length == 0) {
            YFWToast('请输入注册电话', { position: toastShowPosition});
            return;
        }
        if (this.state.invoice_register_address.length == 0) {
            YFWToast('请输入注册地址', { position: toastShowPosition});
            return;
        }
        let invoiceMap = this.state.invoice_person
        invoiceMap.set('title', this.state.invoice_title)
        invoiceMap.set('code', this.state.invoice_code)
        invoiceMap.set('bank_name', this.state.invoice_bank_name)
        invoiceMap.set('bank_no', this.state.invoice_bank_no)
        invoiceMap.set('register_phone', this.state.invoice_register_phone)
        invoiceMap.set('register_address', this.state.invoice_register_address)
        invoiceMap.set('type', 2)
        this.setState({
            selectValue: invoiceMap
        })
        if (this.props.callback) {
            this.props.callback(this.state.advertType, invoiceMap)
        }
        this.closeView();
    }

    _renderItem = (item) => {
        if (this.state.advertType === 'coupon') {
            return this._renderCouponItem(item);
        } else if (this.state.advertType == 'invoice') {
            return this._renderInvoiceItem(item, this.state.isShow);
        } else if (this.state.advertType == 'invoice_type') {
            return <></>;
        } else if (this.state.advertType == 'platformCoupons') {
            return this._renderPlatfromCouponItem(item);
        } else {
            return this._renderNormalItem(item);
        }
    }

    _renderInvoiceItem(item, isShow) {
        if (isShow) {
            return (
                <View style={{ flex: 1 }}>
                    <Text style={{ color: "#000", fontSize: 14, marginLeft: 12, fontWeight: '500' }}>开票信息</Text>
                    {this._renderInputView('抬头：', false, '', this.state.invoice_title, (text) => {})}
                    {this._renderLineView()}
                    {this._renderInputView('税号：', false, '', this.state.invoice_code, (text) => {})}
                    {this._renderLineView()}
                </View>
            )
        }
        return (
            <KeyboardAwareScrollView style={{ flex: 1}}>
                <Text style={{ color: "#000", fontSize: 14, marginLeft: 12, fontWeight: '500' }}>开票信息</Text>
                {this._renderInputView('抬头：', false, '', this.state.invoice_title, (text) => {})}
                {this._renderLineView()}
                {this._renderInputView('税号：', false, '', this.state.invoice_code, (text) => {})}
                {this._renderLineView()}
                {this._renderInputView('开户银行：', true, '请填写开户行', this.state.invoice_bank_name, (text) => {
                    if (text) {
                        this.setState(() => ({
                            invoice_bank_name: text,
                        }))
                    } else {
                        this.setState(() => ({
                            invoice_bank_name: '',
                        }))
                    }
                })}
                {this._renderLineView()}
                {this._renderInputView('银行账号：', true, '请填写银行账号', this.state.invoice_bank_no, (text) => {
                    if (text) {
                        this.setState(() => ({
                            invoice_bank_no: text,
                        }))
                    } else {
                        this.setState(() => ({
                            invoice_bank_no: '',
                        }))
                    }
                })}
                {this._renderLineView()}
                {this._renderInputView('注册电话：', true, '请填写注册电话', this.state.invoice_register_phone, (text) => {
                    if (text) {
                        this.setState(() => ({
                            invoice_register_phone: text,
                        }))
                    } else {
                        this.setState(() => ({
                            invoice_register_phone: '',
                        }))
                    }
                })}
                {this._renderLineView()}
                {this._renderInputView('注册地址：', true, '请输入详细的注册地址', this.state.invoice_register_address, (text) => {
                    if (text) {
                        this.setState(() => ({
                            invoice_register_address: text,
                        }))
                    } else {
                        this.setState(() => ({
                            invoice_register_address: '',
                        }))
                    }
                })}
                {this._renderLineView()}
                <Text style={{ color: "#000", fontSize: 14, marginLeft: 12, fontWeight: '500',marginTop:12 }}>说明</Text>
                <Text style={{ color: "#999", fontSize: 13, marginLeft: 12, marginTop:16,marginBottom:55 }}>开具增值税专用发票需提供开票信息。</Text>
            </KeyboardAwareScrollView>
        )
    }

    _renderInputView(leftTip, editable, placeholder, value, onChangeTextAction) {
        return (
            <View style={[BaseStyles.leftCenterView, styles.tipView]}>
                <Text style={[styles.tipTitle]}>{leftTip}</Text>
                <TextInput
                    returnKeyType={'next'}
                    // maxLength={10}
                    editable={editable}
                    underlineColorAndroid='transparent'
                    placeholder={placeholder}
                    placeholderTextColor="#ccc"
                    style={[styles.tipValue,{color:editable?'#333':'#999'}]}
                    value={value}
                    onFocus={() => {
                    }}
                    onEndEditing={() => {
                    }}
                    onChangeText={(text) => {
                        onChangeTextAction && onChangeTextAction(text)
                    }}
                >
                </TextInput>
            </View>
        )
    }

    _renderLineView() {
        return (
            <View style={{ width: kScreenWidth - 28, height: 1, marginLeft: 12, backgroundColor: '#ececec' }} />
        )
    }

    /**
     * 商家模式配送方式
     * @param  item
     */
    _renderLogisticView(data) {
        if (this.state.advertType == 'logistic') {
            if (this.state.logisticType == 1) {
                let height = (kScreenWidth - 10) / 350 * 67;
                return (
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'rgb(153,153,153)', fontSize: 13, marginHorizontal: 20, marginBottom: 20 }}>配送时间</Text>
                        <View style={{ flex: 1 }}>
                            <ImageBackground style={{ resizeMode: 'cover', justifyContent: 'space-between', marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', width: kScreenWidth - 10, height: height, paddingBottom: 3 / 67 * (height) }}
                                source={require('../../../../img/button_card.png')}>
                                <View style={{ justifyContent: 'center', marginLeft: 27 }}>
                                    <Text style={{ color: '#FFF', fontSize: 15 }}>{this.state.adverData.sellershipping.delivery_time_info}</Text>
                                </View>
                                <View style={{ justifyContent: 'center', marginRight: 27 }}>
                                    <Text style={{ color: '#FFF', width: 60, fontSize: 15, fontWeight: 'bold' }}>¥{toDecimal(this.state.adverData.sellershipping.price)}</Text>
                                </View>
                            </ImageBackground>
                        </View>
                        <View style={{ alignItems: 'center', paddingBottom: iphoneBottomMargin() }}>
                            <YFWTouchableOpacity style_title={{ height: 42, marginHorizontal: 20, fontSize: 17, }} title={'确定'} isEnableTouch={true}
                                callBack={() => {
                                    let item = {}
                                    this.clickItem({ item: this.state.adverData.sellershipping })
                                }} />
                        </View>
                    </View>
                )
            } else if (this.state.logisticType == 2) {
                let height = (kScreenWidth - 10) / 350 * 67;
                return (
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'rgb(153,153,153)', fontSize: 13, marginHorizontal: 20, marginBottom: 20 }}>自提地点:
                            <Text style={{ color: 'rgb(51,51,51)' }}>{this.state.adverData.packedup.packedup_address}</Text>
                        </Text>
                        <View style={{ flex: 1 }}>
                            <ImageBackground style={{ resizeMode: 'cover', justifyContent: 'flex-start', marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', width: kScreenWidth - 10, height: height, paddingBottom: 3 / 67 * (height) }}
                                source={require('../../../../img/button_card.png')}>
                                <View style={{ justifyContent: 'center', marginLeft: 27 }}>
                                    <Text style={{ color: '#FFF', fontSize: 15 }}>{this.state.adverData.packedup.packedup_time}</Text>
                                </View>
                            </ImageBackground>
                        </View>
                        <View style={{ alignItems: 'center', paddingBottom: iphoneBottomMargin() }}>
                            <YFWTouchableOpacity style_title={{ height: 42, marginHorizontal: 20, fontSize: 17, }} title={'确定'} isEnableTouch={true}
                                callBack={() => {
                                    this.clickItem({ item: this.state.adverData.packedup })
                                }} />
                        </View>
                    </View>
                )
            } else {
                return <FlatList
                    data={data}
                    renderItem={this._renderItem.bind(this)}
                    ListFooterComponent={this._footer.bind(this)}
                    ItemSeparatorComponent={this._separator.bind(this)}
                    ListEmptyComponent={this._emptyView.bind(this)}
                    style={{ flex: 1 }}
                />
            }
        } else {
            return <FlatList
                data={data}
                renderItem={this._renderItem.bind(this)}
                ListFooterComponent={this._footer.bind(this)}
                ItemSeparatorComponent={this._separator.bind(this)}
                ListEmptyComponent={this._emptyView.bind(this)}
                style={{ flex: 1 }}
            />
        }

    }

    _renderNormalItem(item) {
        let itemSelected;
        if (this.state.advertType === 'platformCoupons') {
            if (this.state.selectValue.item === undefined) {
                itemSelected = (item.item.id === this.state.selectValue.id);
            } else {
                itemSelected = (item.item.id === this.state.selectValue.item.id);
            }
        } else {
            if (this.state.selectValue.get(this.state.adverData.shop_id)) {
                itemSelected = item.item.id === this.state.selectValue.get(this.state.adverData.shop_id).id;
            } else {
                return <View />;
            }
        }
        if (itemSelected) {
            let height = (kScreenWidth - 10) / 350 * 67;
            return (
                <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this, item)}>
                    <ImageBackground style={{ resizeMode: 'cover', justifyContent: 'space-between', marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', width: kScreenWidth - 10, height: height, paddingBottom: 3 / 67 * (height) }}
                        source={require('../../../../img/button_card.png')}>
                        <View style={{ justifyContent: 'center', marginLeft: 27, width: 150 }}>
                            <Text style={{ color: '#FFF', fontSize: 15 }}>{item.item.name}</Text>
                        </View>
                        <View style={{marginRight:8,flexDirection:'row'}}>
                            <View style={{ justifyContent: 'center'}}>
                                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: 'bold' ,textAlign:'right'}}>¥{item.item.price ? toDecimal(item.item.price) : toDecimal(item.item.money)}</Text>
                            </View>
                            <View style={{ justifyContent: 'center', width: 50 }}>
                                <Image style={{ width: 20, height: 20, marginLeft: 15 }} resizeMode={'contain'} source={require('../../../../img/chooseBtnWhite.png')} />
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            );
        } else {
            //未选择情况, 按钮背景切图不带阴影,切图大小不一致
            let height = (kScreenWidth - 10) / 350 * 67;
            let marginAdd = 7 / 350 * (kScreenWidth - 10);
            let marginTop = 2 / 350 * (kScreenWidth - 10);
            let marginBottom = 9 / 350 * (kScreenWidth - 10);
            return (
                <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this, item)}>
                    <View style={{
                        backgroundColor: backGroundColor(),
                        justifyContent: 'space-between',
                        marginHorizontal: 5 + marginAdd,
                        marginTop: marginTop,
                        marginBottom: marginBottom,
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: kScreenWidth - 10 - marginAdd * 2,
                        height: height - marginTop - marginBottom,
                        borderRadius: 7,
                        borderStyle: "solid",
                        borderWidth: 1,
                        borderColor: "#1fdb9b"
                    }}>
                        <View style={{ justifyContent: 'center', marginLeft: 27 - marginAdd, width: 150 }}>
                            <Text style={{ color: yfwGreenColor(), fontSize: 15 }}>{item.item.name}</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <View style={{ justifyContent: 'center'}}>
                                <Text style={{ color: yfwGreenColor(), fontSize: 15, fontWeight: 'bold' ,textAlign:'right'}}>¥{item.item.price ? toDecimal(item.item.price) : toDecimal(item.item.money)}</Text>
                            </View>
                            <View style={{ justifyContent: 'center', width: 50 }}>
                                <Image style={{ width: 20, height: 20, marginLeft: 15 }} resizeMode={'contain'} source={require('../../../../img/checkout_unsel.png')} />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
    }


    _renderPlatfromCouponItem(item) {
        let isSelect = true
        if (this.state.selectValue.item === undefined) {
            isSelect = (item.item.id === this.state.selectValue.id);
        } else {
            isSelect = (item.item.id === this.state.selectValue.item.id);
        }

        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    flex: 1,
                    marginHorizontal: 12,
                    height: 100 / 375.0 * kScreenWidth,
                    paddingRight: 12,
                    backgroundColor: '#fff',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}
                onPress={this.clickItem.bind(this, item)}
            >
                {parseInt(safe(item.item.money)) != 0 ?
                    <ImageBackground source={require('../../../../img/icon_coupon_backimage.png')} style={{ height: 100 / 375.0 * kScreenWidth, width: 110 / 375.0 * kScreenWidth, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 21, fontWeight: 'bold' }}>￥<Text style={{ fontSize: 42 }}>{safe(item.item.money)}</Text></Text>
                        <Text style={{ color: '#fff', fontSize: 14 }}>{safe(item.item.coupon_des)}</Text>
                    </ImageBackground> : null}
                {parseInt(safe(item.item.money)) != 0 ?
                    <View style={{ flex: 1, height: 100 / 375.0 * kScreenWidth, paddingLeft: 14, paddingVertical: 20 / 375.0 * kScreenWidth, justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row' }}>
                            {safe(item.item.dict_coupons_type).length > 0 ? <View style={{ borderColor: yfwGreenColor(), borderWidth: 1, borderRadius: 7, height: 16, paddingLeft: 5, paddingRight: 5, justifyContent: 'center', alignItems: 'center', marginRight: 5 }}>
                                <Text style={{ color: yfwGreenColor(), fontSize: 12, includeFontPadding: false }}>{'平台'}</Text>
                            </View> : null}
                            <Text style={{ color: darkTextColor(), fontSize: 14, fontWeight: 'bold' }}>{'所有在售商品可用'}</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#666' }}>{'全商城'}</Text>
                        <Text style={{ color: darkTextColor(), fontSize: 12 }}>{safe(item.item.start_time).replace(/[-]/g, '.') + '-' + safe(item.item.expire_time).replace(/[-]/g, '.')}</Text>
                    </View> :
                    <View style={{ flex: 1, height: 100 / 375.0 * kScreenWidth, paddingLeft: 14, justifyContent: 'center' }}>
                        <Text style={{ color: darkTextColor(), fontSize: 14, fontWeight: 'bold' }}>{safe(item.item.coupon_des)}</Text>
                    </View>}
                <Image source={isSelect ? require('../../../../img/icon_coupon_select.png') : require('../../../../img/icon_coupon_normal.png')} style={{ width: 25, height: 25, resizeMode: 'stretch' }}></Image>
            </TouchableOpacity>
        );
    }

    _renderCouponItem(item) {
        let isSelect
        if (this.state.selectValue.get(this.state.adverData.shop_id)) {
            isSelect = item.item.id === this.state.selectValue.get(this.state.adverData.shop_id).id;
        } else {
            return <View />;
        }

        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    flex: 1,
                    marginHorizontal: 12,
                    height: 100 / 375.0 * kScreenWidth,
                    paddingRight: 12,
                    backgroundColor: '#fff',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}
                onPress={this.clickItem.bind(this, item)}
            >
                {parseInt(safe(item.item.money)) != 0 ?
                    <ImageBackground source={require('../../../../img/icon_coupon_backimage.png')} style={{ height: 100 / 375.0 * kScreenWidth, width: 110 / 375.0 * kScreenWidth, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 21, fontWeight: 'bold' }}>￥<Text style={{ fontSize: 42 }}>{safe(item.item.money)}</Text></Text>
                    </ImageBackground> : null}
                {parseInt(safe(item.item.money)) != 0 ?
                    <View style={{ flex: 1, height: 100 / 375.0 * kScreenWidth, paddingLeft: 14, paddingVertical: 20 / 375.0 * kScreenWidth, justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {safe(item.item.dict_coupons_type).length > 0 ? <View style={{ borderColor: yfwGreenColor(), borderWidth: 1, borderRadius: 7, height: 16, paddingLeft: 5, paddingRight: 5, justifyContent: 'center', alignItems: 'center', marginRight: 5 }}>
                                <Text style={{ color: yfwGreenColor(), fontSize: 12, includeFontPadding: false }}>{safe(item.item.dict_coupons_type) == '1' ? '店铺' : '单品'}</Text>
                            </View> : null}
                            <Text style={{ color: darkTextColor(), fontSize: 14, fontWeight: 'bold' }}>{safe(item.item.coupon_des)}</Text>
                        </View>
                        <Text style={{ color: darkTextColor(), fontSize: 12 }}>{safe(item.item.start_time) + '-' + safe(item.item.expire_time)}</Text>
                    </View> :
                    <View style={{ flex: 1, height: 100 / 375.0 * kScreenWidth, paddingLeft: 14, justifyContent: 'center' }}>
                        <Text style={{ color: darkTextColor(), fontSize: 14, fontWeight: 'bold' }}>{safe(item.item.coupon_des)}</Text>
                    </View>}
                <Image source={isSelect ? require('../../../../img/icon_coupon_select.png') : require('../../../../img/icon_coupon_normal.png')} style={{ width: 25, height: 25, resizeMode: 'stretch' }}></Image>
            </TouchableOpacity>
        );
    }

    _separator = () => {
        return <View style={{ height: 10, backgroundColor: backGroundColor() }} />;
    }

    _header = () => {
        return (
            <View>
                {this.alertTypeViewHeader()}
                {this.alertViewHeaderTitle()}
                <View style={{ height: 10, backgroundColor: backGroundColor() }} />
            </View>
        )
    }

    _footer = () => {
        return <View style={{ height: 20, backgroundColor: backGroundColor() }} />;
    }

    _emptyView() {
        if (this.state.advertType === 'coupon') {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
                    <Image source={require('../../../../img/cart_coupon_empty.png')} style={{ width: 175, height: 110, bottom: 10 }}></Image>
                    <Text style={{ fontSize: 12, color: '#999999' }}>暂无可用优惠券</Text>
                </View>)
        } else {
            return <View />;
        }
    }


    renderAlertView() {
        return (
            <View>
                <View style={{ height: 50, width: kScreenWidth }}>
                    <View style={{ flexDirection: 'row', height: 45, width: kScreenWidth, justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ height: 15, width: 15, marginLeft: 18 }} />
                        {this.alertViewTitle()}
                        <TouchableOpacity onPress={() => this.closeView()}>
                            <Image style={{ width: 13, height: 13, marginRight: 18 }} source={require('../../../../img/close_button.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                {this._header()}
                {this.state.advertType == 'logistic' ? this._renderLogisticView(this.flatListDataArray()) :
                    this.state.advertType === 'invoice' ? this._renderItem({}):
                    <FlatList
                        data={this.flatListDataArray()}
                        renderItem={this._renderItem.bind(this)}
                        ListFooterComponent={this._footer.bind(this)}
                        ItemSeparatorComponent={this._separator.bind(this)}
                        ListEmptyComponent={this._emptyView.bind(this)}
                        style={{ flex: 1 }}
                    />
                }
                {this.state.advertType === 'invoice' ? <View style={{ position: 'absolute', bottom: 11, alignItems: 'center', marginLeft: 6 }}>
                    <YFWWDTouchableOpacity style_title={{ height: 44, width: kScreenWidth - 12, fontSize: 16, }} title={'确定'}
                        callBack={() => { this._confirmClickInvoice() }}
                        isEnableTouch={true} />
                </View> : <View />}
                {this.state.advertType === 'invoice_type' ?
                    <View style={{ position: 'absolute', bottom: 11, alignItems: 'center', marginLeft: 6 }}>
                        <YFWWDTouchableOpacity
                            style_title={{ height: 44, width: kScreenWidth - 12, fontSize: 16, }} title={'确定'}
                            callBack={() => { this.clickItem({item:{invoice_type:this.state.invoice_type}}) }}
                            isEnableTouch={true}
                        />
                    </View> : <View />}
            </View>
        );
    }

    render() {
        return (
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => { }}
                popupWindowHeight={this.state.advertType == 'invoice' ? (this.state.isShow ? kScreenHeight * 0.5 : this.state.kHeight + 60) : this.state.kHeight}
            >
                {this.renderAlertView()}
            </YFWPopupWindow>
        );
    }

    /**
     * 校验身份证
     */
    verifyCardNum(txt) {
        if (isEmpty(txt)) {
            return txt
        }
        txt = txt.replace(IDENTITY_CODE, '')
        return txt
    }


}

const styles = StyleSheet.create({
    tipView: {
        height: 41, width: kScreenWidth
    },
    tipTitle: {
        marginLeft: 13, fontSize: 13, color: '#999',width:70
    },
    tipValue: {
        marginLeft: 21, fontSize: 13, width: kScreenWidth - 120
    }
})
