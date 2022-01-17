import React, { Component } from 'react';

import {
    Image,
    TouchableOpacity,
    View,
    Text,
    FlatList, ImageBackground, TextInput, KeyboardAvoidingView, Keyboard, Platform
} from 'react-native';
import { kScreenHeight, kScreenWidth, deepCopyObj } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDTouchableOpacity from '../../Widget/View/YFWWDTouchableOpacity'
import { YFWImageConst } from '../../Images/YFWImageConst';
import YFWWDPopupWindow from './YFWWDPopupWindow';
export default class YFWWDAlertSheet extends Component {


    constructor(...args) {
        super(...args);
        this.selectItem = {}
        this.state = {
            title:'',
            dataArray: []           //[{title:'sss',value:22,select:true}.....]
        };
    }

    showView(title,array,callBack) {
        this.state.title = title
        this.state.dataArray = array
        this.handleSelectItem()
        this.callBack = callBack
        this.setState({})
        this.modalView && this.modalView.show()
    }

    render() {
        return (
            <YFWWDPopupWindow ref={(c) => this.modalView = c}
                onRequestClose={() => this.closeView()}
                popupWindowHeight={kScreenHeight * 0.7}>
                {this.renderAlertView()}
            </YFWWDPopupWindow>
        )
    }

    renderAlertView() {
        let bottomBtnHeight = 44 / 667 * kScreenHeight
        return (
            <View>
                <View style={{ height: 50, width: kScreenWidth }}>
                    <View style={{ flexDirection: 'row', height: 45, width: kScreenWidth,paddingHorizontal:18, justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: "#333", fontSize: 16, }}>{this.state.title}</Text>
                        <TouchableOpacity onPress={() => this.closeView()}>
                            <Image style={{ width: 13, height: 13}} source={YFWImageConst.Icon_close} />
                        </TouchableOpacity>
                    </View>
                </View>
                <FlatList
                    data={this.state.dataArray}
                    renderItem={this._renderItem.bind(this)}
                    ItemSeparatorComponent={this._separator.bind(this)}
                    style={{ flex: 1, marginBottom: bottomBtnHeight + 21 }}
                />
                <View style={{ position: 'absolute', bottom: 11, alignItems: 'center', marginLeft: 6 }}>
                    <YFWWDTouchableOpacity style_title={{ height: bottomBtnHeight, width: kScreenWidth - 12, fontSize: 16, }} title={'确定'}
                        callBack={() => { this._confirmClickItem() }}
                        isEnableTouch={true} />
                </View>
            </View>
        )
    }

    _renderItem = (item) => {
        let isSelect = item.item.select
        let imageSource = isSelect ? YFWImageConst.Icon_select_blue : YFWImageConst.Icon_gou_hui
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this._selectItemAction(item.item)} style={{ height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Image source={imageSource} style={{ width: 20, height: 20, marginLeft:18,marginRight: 10 }}/>
                <Text style={{ color: "rgb(51,51,51)", fontSize: 15, flex:1}}>{item.item.title}</Text>
            </TouchableOpacity>
        )
    }


    _separator = () => {
        return <View style={{ height: 1, backgroundColor: '#f5f5f5', marginLeft: 12 }} />;
    }


    _selectItemAction(selectItem) {
        this.state.dataArray.forEach((item) => {
            if (selectItem.value == item.value && selectItem.title == item.title) {
                item.select = true
            } else {
                item.select = false
            }
        })
        this.setState({})
    }

    handleSelectItem(selectItem) {
        this.state.dataArray.forEach((item) => {
            if (selectItem) {
                if (selectItem.value == item.value && selectItem.title == item.title) {
                    item.select = true
                } else {
                    item.select = false
                }
            } else {
                if (item.select) {
                    this.selectItem = item
                }
            }
        })
    }

    closeView() {
        this.handleSelectItem(this.selectItem)
        this.modalView && this.modalView.disMiss()
    }

    _confirmClickItem() {
        this.handleSelectItem()
        this.callBack&&this.callBack(this.selectItem)
        this.closeView()
    }
}
