import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput, FlatList,
} from 'react-native';
import YFWPopupWindow from "../../PublicModule/Widge/YFWPopupWindow";
import {kScreenHeight, kScreenWidth, safe} from "../../PublicModule/Util/YFWPublicFunction";
import {darkTextColor, yfwGreenColor, yfwLineColor} from "../../Utils/YFWColor";
import {EMOJIS, NAME} from "../../PublicModule/Util/RuleString";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";

export default class YFWPrescriptionNoProofModel extends Component {

    constructor(props) {
        super(props);

        this.state ={
            sickness: '',
            dataSource: []
        }
    }

    render() {
        return(
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => {}}
                popupWindowHeight={kScreenHeight/3}
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
            <View style={{width: kScreenWidth, height: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{width: 44, height: 44}}></View>
                <Text style={{color: darkTextColor(), fontSize: 15, fontWeight: '500'}}>就诊凭证遗失/处方不在身边？</Text>
                <TouchableOpacity onPress={() => {this.disMiss()}} activeOpacity={1} style={{width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('../../../img/close_button.png')} style={{width: 15, height: 15, resizeMode: 'stretch'}}></Image>
                </TouchableOpacity>
            </View>
        )
    }

    // 内容列表
    _renderContent() {
        return(
            <View style={{flex: 1, paddingVertical: 20,paddingHorizontal:30, alignItems:'center', justifyContent:'center'}}>
                <Text style={{fontSize: 12, color: "#999999",flex:1,marginHorizontal:13,lineHeight:13}}>请确认您已在线下医院完成就诊，但此刻就诊凭证遗失或不在身边。无历史处方、病历、住院出院记录可能会影响医生对您的病情判断。</Text>
            </View>
        )
    }
    // 底部按钮
    _renderBottomButton() {
        return(
            <View style={{paddingVertical: 20, alignItems: 'center'}}>
                <YFWTouchableOpacity title={'确认遗失或不在身边'} isEnableTouch={true} callBack={() => {
                    this.disMiss();
                    this.props.callBack && this.props.callBack()
                }}/>
            </View>
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
