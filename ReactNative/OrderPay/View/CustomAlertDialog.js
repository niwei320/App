import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput, FlatList,
} from 'react-native';
import YFWPopupWindow from "../../PublicModule/Widge/YFWPopupWindow";
import {kScreenHeight, kScreenWidth, safe} from "../../PublicModule/Util/YFWPublicFunction";
import {darkTextColor, yfwGreenColor, yfwLineColor} from "../../Utils/YFWColor";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";

export default class CustomAlertDialog  extends Component {

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
                popupWindowHeight={kScreenHeight/4}>
                {this._renderTitleView()}
                {this._renderContent()}
                {this._renderBottomButton()}
            </YFWPopupWindow>
        )
    }

    // 标题行
    _renderTitleView() {
        return(
            <View style={{width: kScreenWidth, height: 34, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{width: 44, height: 34}}></View>
                <Text style={{color: darkTextColor(), fontSize: 14, fontWeight: '500'}}>问诊费说明</Text>
                <TouchableOpacity onPress={() => {this.disMiss()}} activeOpacity={1} style={{width: 44, height: 34, alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('../../../img/close_button.png')} style={{width: 15, height: 15, resizeMode: 'stretch'}}></Image>
                </TouchableOpacity>
            </View>
        )
    }

    // 内容列表
    _renderContent() {
        return(
            <View style={{flex: 1, padding: 20, alignItems:'center', justifyContent:'center'}}>
                <Text style={{fontSize: 12, color: "#999999"}}>{this.props.desc}</Text>
            </View>
        )
    }
    // 底部按钮
    _renderBottomButton() {
        return(
            <View style={{ alignItems: 'center',marginBottom:10}}>
                <YFWTouchableOpacity title={'我知道了'} isEnableTouch={true} callBack={() => {
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
