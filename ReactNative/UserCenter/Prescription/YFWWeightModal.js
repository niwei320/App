import React,{ Component } from 'react'
import { View, Text, TouchableOpacity} from 'react-native'
import ModalView from '../../widget/ModalView'
import { kScreenWidth } from '../../PublicModule/Util/YFWPublicFunction';

export default class YFWWeightModal extends Component {
    render() {
        return(
            <ModalView animationType="fade" ref={(modal) => {this.modalView = modal}}>
                <TouchableOpacity onPress={() => {this._dismiss()}} activeOpacity={1} style={{backgroundColor:'rgba(0, 0, 0, 0.3)', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: '#fff', marginHorizontal: 13, borderRadius: 7, width: kScreenWidth-26}}>
                        <Text style={{color: '#333', fontSize: 15, fontWeight: '500', marginVertical: 13, textAlign: 'center'}}>温馨提示</Text>
                        <View style={{height: 0.5, backgroundColor: '#ccc'}}></View>
                        <Text style={{color: '#333', fontSize: 13, fontWeight: '300', marginVertical: 13, textAlign: 'center'}}>请确认您的体重信息是否正确，单位公斤(Kg)</Text>
                        <View style={{height: 0.5, backgroundColor: '#ccc'}}></View>
                        <TouchableOpacity activeOpacity={1} onPress={() => {this._dismiss()}}>
                        <Text style={{color: '#333', fontSize: 15, fontWeight: '500', marginVertical: 13, textAlign: 'center'}}>关闭</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </ModalView>
        )
    }

    show() {
        this.modalView && this.modalView.show()
    }

    _dismiss() {
        this.modalView && this.modalView.disMiss()
    }
}