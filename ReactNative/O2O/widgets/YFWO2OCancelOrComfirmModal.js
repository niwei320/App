import React, { Component } from 'react';
import ModalView from '../../widget/ModalView'
import { isNotEmpty, isEmpty, adaptSize } from '../../PublicModule/Util/YFWPublicFunction';
import { TextInput, TouchableOpacity, Text, Image, View, FlatList, StyleSheet } from 'react-native';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle'
export default class YFWO2OCancelOrComfirmModal extends Component {
    constructor(props) {
        super(props);
    }
    
    show() {
        this.modalView && this.modalView.show()
    }
    disMiss() {
        this.modalView && this.modalView.disMiss()
    }
    render() {
        return (
            <ModalView ref={(modalView) => this.modalView = modalView} animationType="fade" onRequestClose={() => {
                this.disMiss()
            }}>
                <View activeOpacity={0.3} style={{ backgroundColor: 'rgba(0,0,0,0.3)', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={[{ width: adaptSize(239), alignItems: 'center', backgroundColor: '#ffffff', borderRadius: adaptSize(7) }, this.props.containerStyle]}>
                        {this.props.hiddenIcon == true ? <View style={{ marginTop: adaptSize(22) }} /> : <TouchableOpacity style={[{ width: adaptSize(16), height: adaptSize(16), alignSelf: 'flex-end', marginRight: adaptSize(8), marginTop: adaptSize(6) }, this.props.closeTouchableStyle]} activeOpacity={1} onPress={() => { this.disMiss() }} >
                            <Image style={[{ width: adaptSize(16), height: adaptSize(16) }, this.props.closeImageStyle]} source={isNotEmpty(this.props.closeImage) ? this.props.closeImage : require('../Image/delete_icon.png')} />
                        </TouchableOpacity>}
                        <Text style={[{ fontSize: 14, color: '#333333', fontWeight: 'bold', marginTop: adaptSize(6) }, this.props.titleStyle]}>{isNotEmpty(this.props.title) ? this.props.title : '标题'}</Text>
                        <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between', marginTop: adaptSize(20), marginBottom: adaptSize(14), paddingHorizontal: adaptSize(40), width: adaptSize(239) }]}>
                            <TouchableOpacity activeOpacity={1} style={[{ width: adaptSize(70), height: adaptSize(28), borderRadius: adaptSize(20), borderStyle: "solid", borderWidth: 1, borderColor: "#5799f7", justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }, this.props.cancelButtonStyle]} onPress={() => { this.disMiss() }}>
                                <Text style={[{ fontSize: 13, color: '#5799f7' }, this.props.cancelTextStyle]}>{isNotEmpty(this.props.cancelText) ? this.props.cancelText : '取消'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={[{ width: adaptSize(70), height: adaptSize(28), borderRadius: adaptSize(20), justifyContent: 'center', alignItems: 'center', backgroundColor: '#5799f7' }, this.props.confirmButtonStyle]} onPress={() => { this.props.confirmOnPress() }}>
                                <Text style={[{ fontSize: 13, color: '#ffffff' }, this.props.confirmTextStyle]}>{isNotEmpty(this.props.confirmText) ? this.props.confirmText : '确定'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ModalView >
        )
    }
}