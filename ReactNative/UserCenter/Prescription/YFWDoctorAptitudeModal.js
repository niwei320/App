import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native'
import YFWPopupWindow from '../../PublicModule/Widge/YFWPopupWindow'
import {darkTextColor, yfwGreenColor} from '../../Utils/YFWColor'
import {kScreenHeight, safe, safeObj, isIphoneX, kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWPatientSicknessModal extends Component {

    constructor(props) {
        super(props);

        this.state ={

        }
    }

    render() {
        return(
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => {}}
                popupWindowHeight={kScreenHeight*0.6}
            >
                {this._renderTitleView()}
                {this._renderContent()}
                {this._renderBottomButton()}
            </YFWPopupWindow>
        )
    }

    // 标题行
    _renderTitleView() {
        return(
            <View style={{width: kScreenWidth, height: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: darkTextColor(), fontSize: 15, fontWeight: '500'}}>药师资质证书</Text>
            </View>
        )
    }

    // 资质证书图片
    _renderContent() {
        return(
            <View style={{flex: 1, paddingHorizontal: 13}}>

            </View>
        )
    }

    // 底部按钮
    _renderBottomButton() {
        return(
            <TouchableOpacity onPress={() => {this.disMiss()}} activeOpacity={1} style={{height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: yfwGreenColor(), marginBottom: isIphoneX ? 30 : 0}}>
                <Text style={{color: '#fff', fontSize: 15}}>关闭</Text>
            </TouchableOpacity>
        )
    }

    // 弹出modal
    show() {
        this.modalView && this.modalView.show()
    }

    // 消失modal
    disMiss() {
        this.modalView && this.modalView.disMiss()
    }
}
