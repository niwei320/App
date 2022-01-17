import React, { Component } from 'react';
import { isNotEmpty, isEmpty, safeObj, tcpImage, iphoneBottomMargin, adaptSize, darkStatusBar, kScreenWidth, safeArray } from '../../PublicModule/Util/YFWPublicFunction';
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import { FlatList, ScrollView, View, Text, Image, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import { changePrice } from '../O2OSearch/components/ResultsPage'
import ModalView from '../../widget/ModalView'
import RetrunGoodsInfoModel from './Model/RetrunGoodsInfoModel'
import YFWImagePicker from '../../Utils/YFWImagePicker';
import YFWNativeManager from '../../Utils/YFWNativeManager'
import YFWToast from '../../Utils/YFWToast';
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
export default class YFWO2ORequestRefund extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        title: '申请退款',
        headerRight: <View width={50} />,
    });

    constructor(props) {
        super(props);
        this.state = {
            isNeedPhoto: this.props.navigation.state.params.state.isNeedPhoto || false,
            orderNo: this.props.navigation.state.params.state.orderNo || '1',
            from: this.props.navigation.state.params.state.from || '',
            pageSource:this.props.navigation.state.params.state.pageSource || '',
            gobackKey:this.props.navigation.state.params.state.gobackKey || '',
            goodsDataArray: [],
            descArray: [],
            reasonDataArray: [],
            logisticsPrice: '',
            payment: '',
            returnprice: 0,
            need_logistics_price: 1,
            choosedReason: '',
            choosedIndex: -1,
            photoArray: [],
        }
    }
    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        darkStatusBar();
        this._requestReturnGoodsDetail(this.state.orderNo)
        this._requestRefundReason(this.state.orderNo)
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
    }

    _requestReturnGoodsDetail() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getGoodsInfoAndDesc');
        paramMap.set('orderno', this.state.orderNo);
        if (this.state.from === 'confirmReceiption')
            paramMap.set('from', this.state.from);
        else { }
        viewModel.TCPRequest(paramMap, (res) => {
            console.log('请求参数', paramMap, '\n请求成功', res);
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = RetrunGoodsInfoModel.getModelArray(safeObj(res.result.medicineList));
            this.setState({
                goodsDataArray: dataArray,
                logisticsPrice: res.result.logistics_price,
                payment: res.result.payment,
                returnprice: res.result.returnprice,
                needLogisticsPrice: isNotEmpty(res.result.isZt) && res.result.isZt !== 1 ? res.result.need_logistics_price : 1,//1为需要退配送费即不显示提醒文案
            });
        }, (error) => {
            console.log('请求参数', paramMap, '\n请求成功', error);
        });
    }
    _requestRefundReason() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnReason');
        paramMap.set('orderno', this.state.orderNo);
        if (this.state.from === 'confirmReceiption')
            paramMap.set('from', this.state.from);
        else { }
        viewModel.TCPRequest(paramMap, (res) => {
            console.log('请求参数', paramMap, '\n请求成功', res);
            let dataArray = []
            safeArray(res.result).forEach(element => {
                dataArray.push({
                    reason: safeObj(element).reason || '',
                    isChoosed: false,
                })
            });
            if (isNotEmpty(dataArray[0]) && isNotEmpty(dataArray[0].reason)) {
                this.setState({
                    reasonDataArray: dataArray,
                });
            }
        }, (error) => {
            console.log('请求参数', paramMap, '\n请求成功', error);
        })
    }
    _dealNavigation(data) {
        if (isEmpty(data)) {
            return
        }
        let { navigate } = this.props.navigation;
        pushNavigation(navigate, { ...safeObj(data) })
    }
    _goBack() {
        let { goBack } = this.props.navigation;
        if (this.state.from === 'confirmReceiption')
            goBack(this.state.gobackKey);
        else {
            goBack();
        }
    }
    onChoose(reason, choosedIndex) {
        if (choosedIndex == this.state.choosedIndex) {
            let reasonDataArray = this.state.reasonDataArray
            if (this.state.choosedIndex >= 0)
                reasonDataArray[this.state.choosedIndex].isChoosed = false
            else { }
            this.setState({
                choosedReason: '',
                choosedIndex: -1,
                reasonDataArray: reasonDataArray
            })
        }
        else {
            let reasonDataArray = this.state.reasonDataArray
            if (this.state.choosedIndex >= 0)
                reasonDataArray[this.state.choosedIndex].isChoosed = false
            else { }
            reasonDataArray[choosedIndex].isChoosed = true
            this.setState({
                choosedReason: reason,
                choosedIndex: choosedIndex,
                reasonDataArray: reasonDataArray
            })
        }
    }
    selectPic() {
        if (!this.imagePicker) {
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.returnValue((result) => {
            if (isNotEmpty(result)) {
                DeviceEventEmitter.emit('LoadProgressShow')
                YFWNativeManager.tcpUploadImg(result, (imageUrl) => {
                    DeviceEventEmitter.emit('LoadProgressClose');
                    this.state.photoArray.push(imageUrl)
                    this.setState({});
                }, (err) => {
                    DeviceEventEmitter.emit('LoadProgressClose');
                    YFWToast(err)
                })
            }
        });
        this.imagePicker.show();
    }
    _removePic(index) {
        if (this.state.photoArray[index]) {
            this.state.photoArray.splice(index, 1);
            this.setState({});
        }
    }
    _checkDateIsOk() {
        if (isEmpty(this.state.choosedReason)) {
            YFWToast('请选择退款理由')
            return false
        }
        if (this.state.isNeedPhoto && safeArray(this.state.photoArray).length < 1) {
            YFWToast('请上传凭证')
            return false
        }
        return true
    }

    _commit() {
        if (!this._checkDateIsOk()) {
            return
        }
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        if (this.state.isNeedPhoto) {
            paramMap.set('__cmd', 'person.order.applyReturnGoods');
            paramMap.set('image_voucher', this.state.photoArray);
            paramMap.set('reason', this.state.choosedReason);
            paramMap.set('money', this.state.returnprice + '');
        }
        else {
            paramMap.set('__cmd', 'person.order.applyReturn');
            paramMap.set('desc', this.state.choosedReason);
        }
        paramMap.set('orderno', this.state.orderNo);
        viewModel.TCPRequest(paramMap, (res) => {
            DeviceEventEmitter.emit('order_status_refresh',this.state.pageSource)
            this._goBack()
            YFWToast("提交退款申请成功")
        }, (error) => { }, true)
    }
    //-----------------------------------------------RENDER---------------------------------------------
    _renderListItem(item) {
        return (
            <View style={{ flexDirection: 'row', marginHorizontal: adaptSize(12), marginBottom: adaptSize(13) }}>
                <View style={{ width: adaptSize(49), height: adaptSize(49), backgroundColor: 'blue', marginRight: adaptSize(12), borderRadius: adaptSize(3), borderWidth: adaptSize(1), borderColor: '#f0f0f0',justifyContent:'center',alignItems:'center' }}>
                    <Image style={{ width: adaptSize(47), height: adaptSize(47) }} source={{ uri: item.img_url }} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between' }]}>
                        <View style={BaseStyles.leftCenterView}>
                            {((item.prescriptionType + '' == '0') || (item.prescriptionType + '' == '1') || (item.prescriptionType + '' == '2') || (item.prescriptionType + '' == '3')) && <Image style={{ width: adaptSize(24), height: adaptSize(12), resizeMode: 'stretch', marginRight: adaptSize(4) }} source={(item.prescriptionType + '' == '0') ? require('../Image/ic_drug_OTC.png') : require('../Image/ic_drug_track_label.png')} />}
                            <Text style={{ maxWidth: item.prescriptionType + '' == '-1' ? adaptSize(165) : adaptSize(190), fontSize: 13, color: '#333333', includeFontPadding: false }} numberOfLines={1}>{item.title}</Text>
                        </View>
                        {changePrice(item.price, { fontSize: 14, color: '#333333' }, { fontSize: 12, color: '#333333' }, 1)}
                    </View>
                    <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between', marginTop: adaptSize(7) }]}>
                        <Text style={{ fontSize: 10, color: '#999999' }}>{item.standard}</Text>
                        <Text style={{ fontSize: 10, color: '#999999' }}>{'x' + item.quantity}</Text>
                    </View>
                </View>
            </View>
        )
    }
    _renderReasonItem(item, index) {
        return (
            <TouchableOpacity style={[BaseStyles.leftCenterView, { width: adaptSize(284), paddingVertical: adaptSize(12), justifyContent: 'space-between', }]} activeOpacity={1} onPress={() => { this.onChoose(item.reason, index) }}>
                <Text style={{ fontSize: 14, color: '#333333', includeFontPadding: false }}>{item.reason}</Text>
                {item.isChoosed ? <Image style={{ width: adaptSize(20), height: adaptSize(20) }} source={require('../Image/choosed.png')} /> : <View style={{ width: adaptSize(20), height: adaptSize(20), borderRadius: adaptSize(10), borderColor: '#dddddd', borderWidth: adaptSize(2) }} />}
            </TouchableOpacity>
        )
    }
    _renderPhotoHeader() {
        if (safeArray(this.state.photoArray).length < 9)
            return (
                <TouchableOpacity style={{ width: adaptSize(72), height: adaptSize(72), borderRadius: adaptSize(7), borderWidth: adaptSize(1), borderColor: '#f0f0f0', alignItems: 'center', marginRight: adaptSize(35), marginTop: adaptSize(5) }} activeOpacity={1} onPress={() => { this.selectPic() }}>
                    <Image style={{ width: adaptSize(23), height: adaptSize(19), marginTop: adaptSize(10) }} source={require('../Image/camera.png')} />
                    <Text style={{ fontSize: 12, color: '#666666', marginTop: adaptSize(4), includeFontPadding: false }}>
                        {'上传凭证'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999999', marginTop: adaptSize(5), includeFontPadding: false }}>
                        {'(最多9张)'}
                    </Text>
                </TouchableOpacity>
            )
        else
            return <></>
    }
    _renderPhotoListItem(item, index) {
        let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
        return (
            <View key={index} style={{ width: adaptSize(74.5), height: adaptSize(77), alignItems: 'center', marginRight: adaptSize(35), justifyContent: "flex-end" }}>
                <Image style={{ width: adaptSize(72), height: adaptSize(72), resizeMode: 'stretch' }} source={{ uri: 'http:' + cdn + '/' + item }} />
                <TouchableOpacity onPress={() => { this._removePic(index) }} activeOpacity={1} style={{ position: 'absolute', right: adaptSize(0), top: adaptSize(0) }}>
                    <Image style={{ width: adaptSize(10), height: adaptSize(10), resizeMode: 'stretch' }} source={require('../../../img/photo_Close.png')} />
                </TouchableOpacity>
            </View>
        )
    }
    render() {
        return (
            <>
                <ScrollView>
                    <View style={{ width: adaptSize(351), borderRadius: adaptSize(7), backgroundColor: '#ffffff', alignSelf: 'center', marginTop: adaptSize(6) }}>
                        <Text style={{ fontSize: 15, color: "#333333", marginLeft: adaptSize(12), marginTop: adaptSize(17), fontWeight: 'bold' }}>{'退款商品'}</Text>
                        <View style={{ width: adaptSize(328), height: adaptSize(1), backgroundColor: '#f5f5f5', alignSelf: 'center', marginTop: adaptSize(15), marginBottom: adaptSize(17) }} />
                        <FlatList
                            style={{ marginBottom: adaptSize(4), }}
                            keyExtractor={(item, index) => index.toString()}
                            data={this.state.goodsDataArray}
                            renderItem={({ item }) => this._renderListItem(item)}
                        />
                    </View>
                    <View style={{ width: adaptSize(351), paddingVertical: adaptSize(18), borderRadius: adaptSize(7), backgroundColor: '#ffffff', alignSelf: 'center', marginTop: adaptSize(6), alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingRight: adaptSize(11) }}>
                        <Text style={{ fontSize: 15, color: "#333333", marginLeft: adaptSize(12), fontWeight: 'bold' }}>{'退款金额'}</Text>
                        <View>
                            <View style={{ alignSelf: 'flex-end' }}>
                                {changePrice(this.state.returnprice, { fontSize: 14, color: '#333333' }, { fontSize: 12, color: '#333333' }, 1)}
                            </View>
                            {this.state.needLogisticsPrice == 0 && this.state.from !== 'confirmReceiption' && <View style={[BaseStyles.leftCenterView, { alignSelf: 'flex-end', marginTop: adaptSize(11), }]}><Text style={{ color: '#ff3300', fontSize: 12 }}>{'不含配送费 '}</Text>{changePrice(this.state.logisticsPrice, { fontSize: 14, color: '#ff3300' }, { fontSize: 12, color: '#ff3300' }, 1)}</View>}
                        </View>
                    </View>
                    <View style={{ width: adaptSize(351), borderRadius: adaptSize(7), backgroundColor: '#ffffff', alignSelf: 'center', marginTop: adaptSize(6), }} >
                        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: adaptSize(18) }} activeOpacity={1} onPress={() => { this.returnReasonModal && this.returnReasonModal.show() }}>
                            <Text style={{ fontSize: 15, color: "#333333", marginLeft: adaptSize(12), fontWeight: 'bold' }}>{'退款理由'}</Text>
                            <View style={[BaseStyles.leftCenterView, { marginRight: adaptSize(12) }]}>
                                <View style={{ marginRight: adaptSize(9) }}>
                                    <Text style={{ fontSize: 12, color: this.state.choosedReason.length > 0 ? '#333333' : '#999999', textAlign: 'right', height: adaptSize(15) }}>{this.state.choosedReason.length > 0 ? this.state.choosedReason : '点击选择理由（必选）'}</Text>
                                    {this.state.needLogisticsPrice == 0 && this.state.from !== 'confirmReceiption' && <Text style={{ color: '#ff3300', fontSize: 12, marginTop: adaptSize(8), textAlign: 'right' }}>{'当前配送未超时，\n申请退款将不退还配送费'}</Text>}
                                </View>
                                <Image style={{ width: adaptSize(8), height: adaptSize(14), tintColor: '#999999' }} source={require('../Image/icon_detail_white.png')}></Image>
                            </View>
                        </TouchableOpacity>
                        {this.state.isNeedPhoto &&
                            <View>
                                <View style={{ width: adaptSize(328), height: adaptSize(1), backgroundColor: '#f5f5f5', alignSelf: 'center', marginBottom: adaptSize(12) }} />
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginLeft: adaptSize(12), marginBottom: adaptSize(17), }}>
                                    {safeArray(this.state.photoArray).length > 0 ? safeArray(this.state.photoArray).map((item, index) => this._renderPhotoListItem(item, index)) : null}
                                    {this._renderPhotoHeader()}
                                </View>
                                <Text style={{ fontSize: 12, color: '#ff3300', marginLeft: adaptSize(13), marginBottom: adaptSize(16) }}>{'为了帮您更好的解决问题，请务必上传照片凭证（必传）'}</Text>
                            </View>}
                    </View>
                    <View style={{ width: adaptSize(351), height: adaptSize(48), borderRadius: adaptSize(7), backgroundColor: '#ffffff', alignSelf: 'center', marginTop: adaptSize(6), alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 15, color: "#333333", marginLeft: adaptSize(12), fontWeight: 'bold' }}>{'退款方式'}</Text>
                        <Text style={{ fontSize: 12, color: "#333333", marginRight: adaptSize(12) }}>{isNotEmpty(this.state.payment) ? this.state.payment + '返还' : ''}
                        </Text>
                    </View>
                    <View style={{ height: adaptSize(100) + iphoneBottomMargin() }} />
                </ScrollView>
                <TouchableOpacity style={{ width: adaptSize(338), height: adaptSize(50), position: 'absolute', bottom: iphoneBottomMargin() + adaptSize(32), elevation: 1, borderRadius: adaptSize(20), backgroundColor: "#5799f7", alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => { this._commit() }}>
                    <Text style={{ fontSize: 16, color: "#ffffff", fontWeight: 'bold' }}>{'提交'}</Text>
                </TouchableOpacity>
                <ModalView ref={(ModalView) => this.returnReasonModal = ModalView} animationType="fade" onRequestClose={() => { this.returnReasonModal && this.returnReasonModal.disMiss() }}>
                    <TouchableOpacity activeOpacity={1} style={{ backgroundColor: 'rgba(0,0,0,0.3)', flex: 1, justifyContent: 'flex-end', }} onPress={() => { this.returnReasonModal && this.returnReasonModal.disMiss() }}>
                        <TouchableOpacity style={{ width: kScreenWidth, alignItems: 'center', backgroundColor: '#ffffff', borderTopLeftRadius: adaptSize(7), borderTopRightRadius: adaptSize(7), borderBottomLeftRadius: 0, borderBottomRightRadius: 0, }} activeOpacity={1}>
                            <View style={[BaseStyles.leftCenterView, { width: kScreenWidth, justifyContent: 'space-between', marginBottom: adaptSize(25), marginTop: adaptSize(22) }]}>
                                <View></View>
                                <Text style={{ fontSize: 16, color: '#333333', fontWeight: 'bold', includeFontPadding: false }}>{'退款理由'}</Text>
                                <TouchableOpacity style={{ width: adaptSize(16), height: adaptSize(16), alignSelf: 'flex-end', marginRight: adaptSize(8), marginTop: adaptSize(6) }} activeOpacity={1} onPress={() => { this.returnReasonModal && this.returnReasonModal.disMiss() }} hitSlop={{ left: 15, top: 15, bottom: 15, right: 15 }}>
                                    <Image style={{ width: adaptSize(10), height: adaptSize(10), tintColor: '#cccccc' }} source={require('../Image/icon_delete_white.png')} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                style={{ marginBottom: adaptSize(27), }}
                                keyExtractor={(item, index) => index.toString()}
                                data={this.state.reasonDataArray}
                                renderItem={({ item, index }) => this._renderReasonItem(item, index)}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </ModalView>
            </>
        )
    }
}
