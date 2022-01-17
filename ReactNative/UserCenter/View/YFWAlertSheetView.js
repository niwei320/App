import React, { Component } from 'react';

import {
    Image,
    TouchableOpacity,
    View,
    Text,
    FlatList, ImageBackground, TextInput, KeyboardAvoidingView, Keyboard, Platform
} from 'react-native';
import YFWPopupWindow from '../../PublicModule/Widge/YFWPopupWindow';
import { kScreenHeight, kScreenWidth, deepCopyObj, isNotEmpty, isEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import {
    separatorColor,
    yfwGreenColor,
    yfwOrangeColor,
    darkTextColor,
    backGroundColor
} from "../../Utils/YFWColor";
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity';
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';
export default class YFWAlertSheetView extends Component {


    constructor(...args) {
        super(...args);
        this.state = {
            isShow: true,
            sectionArray: [],
            dataArray: []
        };
    }

    showView(sectionArray,callBack) {
        this.modalView && this.modalView.show()
        let newSectionArray = deepCopyObj(sectionArray)
        if (!(isNotEmpty(newSectionArray[0]) && isNotEmpty(newSectionArray[0].items))) {
            this.setState({
                dataArray:newSectionArray,
                sectionArray:[]
            })
        } else {
            let selectIndex = 0
            newSectionArray.some((item,index)=>{
                if (item.select) {
                    selectIndex = index
                }
                return item.select
            })
            let obj = newSectionArray[selectIndex]
            if (isEmpty(obj) || isEmpty(obj.items)) {
                obj = {items:[]}
            }
            this.setState({
                sectionArray: newSectionArray,
                dataArray: obj.items
            })
        }

        this.callBack = callBack
    }

    render() {
        return (
            <YFWPopupWindow ref={(c) => this.modalView = c}
                onRequestClose={() => { }}
                popupWindowHeight={kScreenHeight * 0.7}>
                {this.renderAlertView()}
            </YFWPopupWindow>
        )
    }

    renderAlertView() {
        let bottomBtnHeight = 44 / 667 * kScreenHeight
        return (
            <View>
                <View style={{ height: 50, width: kScreenWidth }}>
                    <View style={{ flexDirection: 'row', height: 45, width: kScreenWidth, justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ height: 15, width: 15, marginLeft: 18 }} />
                        <Text style={{ color: "#333", fontSize: 16, }}>{'退货/款原因'}</Text>
                        <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:0}} onPress={() => this.closeView()}>
                            <Image style={{ width: 13, height: 13, marginRight: 18 }} source={require('../../../img/photo_Close.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                {this._renderMenu()}
                <FlatList
                    data={this.state.dataArray}
                    renderItem={this._renderItem.bind(this)}
                    ItemSeparatorComponent={this._separator.bind(this)}
                    style={{ flex: 1, marginBottom: bottomBtnHeight + 21 }}
                />
                <View style={{ position: 'absolute', bottom: 11, alignItems: 'center', marginLeft: 6 }}>
                    <YFWTouchableOpacity style_title={{ height: bottomBtnHeight, width: kScreenWidth - 12, fontSize: 16, }} title={'确定'}
                        callBack={() => { this._confirmClickItem() }}
                        isEnableTouch={true} />
                </View>
            </View>
        )
    }

    _renderMenu() {
        if (!this.state.sectionArray || this.state.sectionArray.length == 0) {
            return null
        }
        return (
            <View style={{ flexDirection: 'row',height:47,}}>
                {this.state.sectionArray.map((item,index) => {
                    return (
                        <TouchableOpacity activeOpacity={1} style={{ flex: 1, justifyContent: 'center',alignItems:'center' }}
                            onPress={() => this._oneTypeOfReasonSelected(index)}>
                            <YFWTitleView style_title={{ fontSize: 15,fontWeight:'400' }} title={item.title} hiddenBgImage={!item.select} />
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }

    _renderItem = (item) => {
        let isSelect = item.item.select
        let imageSource = isSelect ? require('../../../img/chooseBtn.png') : require('../../../img/check_discheck.png')
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this._selectItemAction(item.index)} style={{ height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: "#999", fontSize: 13, marginLeft: 29, width: kScreenWidth - 29 - 20 - 12 - 3 }}>{item.item.reason}</Text>
                <Image source={imageSource} style={{ width: 20, height: 20, marginRight: 12 }}></Image>
            </TouchableOpacity>
        )
    }


    _separator = () => {
        return <View style={{ height: 1, backgroundColor: '#f5f5f5', marginLeft: 12 }} />;
    }

    _oneTypeOfReasonSelected(selectIndex) {
        this.state.sectionArray.map((item,index)=>{
            item.select = index == selectIndex
        })
        this.setState({
            sectionArray:this.state.sectionArray,
            dataArray:this.state.sectionArray[selectIndex].items
        })
    }

    _selectItemAction(selectIndex) {
        let newDataArray = []
        if (this.state.sectionArray.length > 0) {
            let fatherIndex = 0
            this.state.sectionArray.some((item,index)=>{
                if (item.select) {
                    fatherIndex = index
                }
                return item.select
            })
            newDataArray = this.state.sectionArray[fatherIndex].items.map((item,index)=>{
                item.select = index == selectIndex
                return item
            })
        } else {
            newDataArray = this.state.dataArray.map((item,index)=>{
                item.select = index == selectIndex
                return item
            })
        }
        this.setState({
            dataArray:newDataArray
        })
    }

    closeView() {
        this.modalView && this.modalView.disMiss()
    }

    _confirmClickItem() {
        this.closeView()
        if (this.callBack) {
            if (this.state.sectionArray.length > 0) {
                this.callBack(this.state.sectionArray)
            } else {
                this.callBack(this.state.dataArray)
            }
        }
    }
}