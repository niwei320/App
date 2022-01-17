import React from 'react';
import { ScrollView, TouchableOpacity, Text, Image, View, FlatList, StyleSheet } from 'react-native'
import { adaptSize, kScreenWidth, iphoneBottomMargin, isEmpty, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle'
import ModalView from '../../widget/ModalView'
import { changePrice } from '../O2OSearch/components/ResultsPage'
import YFWNativeManager from '../../Utils/YFWNativeManager'
import YFWO2OCancelOrComfirmModal from '../widgets/YFWO2OCancelOrComfirmModal'
export default class YFWO2OOrderConfirmReceiption extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    _renderProductNumberItem(item) {
        return (
            <View style={[BaseStyles.leftCenterView, { marginBottom: adaptSize(5), justifyContent: 'space-between' }]}>
                {isNotEmpty(item.batchno) ? <Text style={{ fontSize: 13, color: '#5799f7' }}>{'产品批号 ' + item.batchno}</Text> : <View />}
                <Text style={{ fontSize: 10, color: '#999999' }}>{'x' + item.qty}</Text>
            </View>
        )
    }
    _renderListItem(item) {
        return (
            <View style={{ flexDirection: 'row', marginHorizontal: adaptSize(12), marginTop: adaptSize(14),  }}>
                <View style={{ width: adaptSize(49), height: adaptSize(49), marginRight: adaptSize(12), borderRadius: adaptSize(3), borderWidth: adaptSize(1), borderColor: '#f0f0f0',justifyContent:'center',alignItems:'center' }}>
                    <Image style={{ width: adaptSize(47), height: adaptSize(47) }} source={{ uri: item.introImage }} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between' }]}>
                        <View style={BaseStyles.leftCenterView}>
                            {(item.dictMedicineType + '' == '0' || item.dictMedicineType + '' == '1' || item.dictMedicineType + '' == '2' || item.dictMedicineType + '' == '3') && <Image style={{ width: adaptSize(24), height: adaptSize(12), resizeMode: 'stretch', marginRight: adaptSize(4) }} source={item.dictMedicineType + '' == '0' ? require('../Image/ic_drug_OTC.png') : require('../Image/ic_drug_track_label.png')} />}
                            <Text style={{ maxWidth: adaptSize(150), fontSize: 13, color: '#333333', includeFontPadding: false }} numberOfLines={1}>{isNotEmpty(item.alias) ? item.alias + ' ' + item.nameCN : item.nameCN}</Text>
                        </View>
                        {changePrice(item.unitPrice, { fontSize: 14, color: '#333333' }, { fontSize: 12, color: '#333333' }, 1)}
                    </View>
                    <Text style={{ fontSize: 10, color: '#999999', marginTop: adaptSize(7) }}>{item.standard + '；' + item.authorizedCode}</Text>
                    <FlatList
                        style={{ marginTop: adaptSize(12) }}
                        keyExtractor={(item, index) => index.toString()}
                        data={item.batchinfo}
                        renderItem={({ item }) => this._renderProductNumberItem(item)}
                    />
                </View>
            </View>
        )
    }
    render() {
        let { viewModel } = this.props;
        let { dataSource, announcement, deleteIcon, productNumberTitle, contactShop, shopPhoneNumber, orderNo, pageSource, gobackKey } = viewModel;
        return (
            <>
                <ScrollView style={{ marginTop: adaptSize(7) }}>
                    <View style={{ width: adaptSize(351), borderRadius: adaptSize(7), backgroundColor: '#ffffff', alignSelf: 'center', paddingLeft: adaptSize(12) }}>
                        <View style={[BaseStyles.leftCenterView, { marginTop: adaptSize(18) }]}>
                            <Image style={{ width: adaptSize(11), height: adaptSize(14), marginRight: adaptSize(3) }} source={announcement.orangeIcon} />
                            <Text style={{ fontSize: 12, color: '#feac4c', fontWeight: 'bold' }}>{announcement.orangeTitle}</Text>
                        </View>
                        <Text style={{ fontSize: 12, lineHeight: 22, color: '#333333', marginTop: adaptSize(17), marginLeft: adaptSize(2), marginBottom: adaptSize(23) }}>{announcement.content + '（'}<Text style={{ color: 'rgb(31,219,155)' }} onPress={() => { this.exampleChartModal && this.exampleChartModal.show() }}>{announcement.greenContent}</Text>{'）'}</Text>
                    </View>
                    <View style={{ width: adaptSize(351), borderRadius: adaptSize(7), backgroundColor: '#ffffff', alignSelf: 'center', marginTop: adaptSize(6) }}>
                        <Text style={{ fontSize: 14, color: "#333333", marginLeft: adaptSize(13), marginTop: adaptSize(18) }}>{productNumberTitle.titleHeader}<Text style={{ fontSize: 14, color: "rgb(87,153,247)" }}>{productNumberTitle.blueTitle}</Text>{productNumberTitle.titleTail}</Text>
                        <View style={{ width: adaptSize(328), height: adaptSize(1), backgroundColor: '#f5f5f5', alignSelf: 'center', marginTop: adaptSize(15),marginBottom: adaptSize(14) }} />
                        <FlatList
                            style={{marginBottom:adaptSize(25)}}
                            keyExtractor={(item, index) => index.toString()}
                            data={dataSource}
                            renderItem={({ item }) => this._renderListItem(item)}
                        />
                    </View>
                    <View style={{ height: adaptSize(100) + iphoneBottomMargin() }} />
                    <ModalView ref={(ModalView) => this.exampleChartModal = ModalView} animationType="fade" onRequestClose={() => { this.exampleChartModal && this.exampleChartModal.disMiss() }}>
                        <View activeOpacity={0.3} style={{ backgroundColor: 'rgba(0,0,0,0.3)', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: adaptSize(350), height: adaptSize(180), alignItems: 'center', backgroundColor: '#ffffff', borderRadius: adaptSize(7) }}>
                                <TouchableOpacity style={{ width: adaptSize(16), height: adaptSize(16), alignSelf: 'flex-end', marginRight: adaptSize(8), marginTop: adaptSize(6) }} activeOpacity={1} onPress={() => { this.exampleChartModal && this.exampleChartModal.disMiss() }} >
                                    <Image style={{ width: adaptSize(16), height: adaptSize(16) }} source={deleteIcon} />
                                </TouchableOpacity>
                                <Image style={{ width: adaptSize(300), height: adaptSize(120) }} source={announcement.exampleChart} />
                            </View>
                        </View>
                    </ModalView>
                </ScrollView>
                <View style={[BaseStyles.leftCenterView, { position: 'absolute', justifyContent: 'space-between', bottom: iphoneBottomMargin() + adaptSize(32), paddingHorizontal: adaptSize(40), width: kScreenWidth }]}>
                    <TouchableOpacity onPress={() => { this.cancelModal && this.cancelModal.show() }} activeOpacity={1} style={{ width: adaptSize(133), height: adaptSize(40), borderRadius: adaptSize(20), borderStyle: "solid", borderWidth: 1, borderColor: "#bbbbbb", justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                        <Text style={{ fontSize: 16, color: '#666666' }}>{viewModel.button.failureAcceptance}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.confirmModal && this.confirmModal.show() }} activeOpacity={1} style={{ width: adaptSize(133), height: adaptSize(40), borderRadius: adaptSize(20), justifyContent: 'center', alignItems: 'center', backgroundColor: '#5799f7' }}>
                        <Text style={{ fontSize: 16, color: '#ffffff' }}>{viewModel.button.acceptance}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ position: 'absolute', left: adaptSize(12), bottom: iphoneBottomMargin() + adaptSize(94), backgroundColor: '#ffffff', borderRadius: adaptSize(7), elevation: 1, }}>
                    <TouchableOpacity style={[BaseStyles.leftCenterView, { width: adaptSize(51), height: adaptSize(36), alignItems: 'center', justifyContent: 'center' }]} activeOpacity={1} onPress={() => YFWNativeManager.takePhone(shopPhoneNumber)} >
                        <Image source={contactShop.icon} style={{ width: adaptSize(16), height: adaptSize(16) }} />
                        <Text style={{ fontSize: 12, color: '#5799f7' }}>{contactShop.text}</Text>
                    </TouchableOpacity>
                </View>
                <YFWO2OCancelOrComfirmModal ref={(ref) => this.cancelModal = ref} confirmText={'申请退款'} confirmOnPress={() => { this.cancelModal && this.cancelModal.disMiss(); viewModel._dealNavigation({ type: 'O2O_Request_Refund', isNeedPhoto: true, orderNo: orderNo, from: 'confirmReceiption', pageSource: pageSource, gobackKey: gobackKey }) }} title={'验证不通过'} />
                <YFWO2OCancelOrComfirmModal ref={(ref) => this.confirmModal = ref} confirmOnPress={() => { this.confirmModal && this.confirmModal.disMiss(); viewModel._fetchOrderReceive(orderNo) }} title={'验收通过，确认收货？\n一经确认，不可退款退货'} />
            </>
        );
    }
}
const styles = StyleSheet.create({

});
