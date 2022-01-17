import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput, FlatList, DeviceEventEmitter,
} from 'react-native';
import YFWPopupWindow from "../../PublicModule/Widge/YFWPopupWindow";
import {isNotEmpty, kScreenHeight, kScreenWidth, safe} from "../../PublicModule/Util/YFWPublicFunction";
import {darkTextColor, yfwGreenColor, yfwLineColor} from "../../Utils/YFWColor";
import {NAME, EMOJIS} from "../../PublicModule/Util/RuleString";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";

export default class YFWInquirySicknessAddModal extends Component {

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
                popupWindowHeight={kScreenHeight*0.8}
            >
                {this._renderTitleView()}
                {this._renderSearch()}
                {this._renderContentList()}
            </YFWPopupWindow>
        )
    }

    // 标题行
    _renderTitleView() {
        return(
            <View style={{width: kScreenWidth, height: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{width: 44, height: 44}}></View>
                <Text style={{color: darkTextColor(), fontSize: 15, fontWeight: '500'}}>添加确诊疾病</Text>
                <TouchableOpacity onPress={() => {this.disMiss()}} activeOpacity={1} style={{width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('../../../img/close_button.png')} style={{width: 15, height: 15, resizeMode: 'stretch'}}></Image>
                </TouchableOpacity>
            </View>
        )
    }

    // 搜索框
    _renderSearch() {
        return(
            <View style={{height: 34, marginHorizontal: 16, backgroundColor: '#F5F5F5', borderRadius: 20, flexDirection: 'row', paddingLeft: 15, paddingRight: 3,alignItems: 'center'}}>
                <TextInput
                    ref={'input'}
                    style={{flex: 1, paddingVertical: 0}}
                    placeholder={'请输入疾病名称，支持首字母、模糊搜索'}
                    value={this.state.sickness}
                    selectionColor={yfwGreenColor()}
                    underlineColorAndroid={'transparent'}
                    returnKeyType={'search'}
                    onChangeText={(text) => {
                        text = text.replace(EMOJIS,'')
                        // 请求数据
                        this._requestSearch(text)
                        this.state.sickness = text
                        this.setState({})
                    }}
                    onEndEditing={(event) => {
                        this.state.sickness = safe(this.state.sickness).replace().replace(NAME,"")
                        this.setState({})
                    }}
                ></TextInput>
                {this.state.sickness.length > 0 ?
                    <TouchableOpacity onPress={() => {
                        this.state.sickness = ''
                        this.setState({})
                    }} activeOpacity={1} style={{height: 34, width: 34, justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('../../../img/icon_delect.png')} style={{width: 13, height: 13}}/>
                    </TouchableOpacity>:
                    <View/>
                }
            </View>
        )
    }

    // 内容列表
    _renderContentList() {
        return(
            <View style={{flex: 1, paddingHorizontal: 13}}>
                <FlatList
                    data = {this.state.dataSource}
                    extraData = {this.state}
                    renderItem = {this._renderItemCell.bind(this)}
                    ItemSeparatorComponent = {this._renderLine.bind(this)}
                    ListEmptyComponent = {this._renderEmptyView.bind(this)}
                    keyExtractor = {(item, index) => index}
                    keyboardShouldPersistTaps={'always'}
                    keyboardDismissMode='on-drag'
                />
            </View>
        )
    }

    // cell
    _renderItemCell({item}) {
        return(
            <TouchableOpacity onPress={() => {
                this.disMiss();
                this.setState({dataSource: [],sickness:''})
                if(this.props.callBack && item.disease_name.length>0) {
                    let sickness = {
                        name: item.disease_name,
                        id:item.id+'',
                    }
                    this.props.callBack(sickness)
                }
            }} activeOpacity={1} style={{height: 45, paddingHorizontal: 16, justifyContent: 'center'}}>
                <Text style={{fontSize: 13, fontWeight: '500', color: darkTextColor()}}>{item.disease_name}</Text>
            </TouchableOpacity>
        )
    }

    // 无数据时的占位图
    _renderEmptyView() {
        if(this.state.sickness.length == 0) {
            return <View></View>
        }else {
            return(
                <View style={{paddingVertical: 15, alignItems: 'center'}}>
                    <Text style={{color: darkTextColor(), fontSize: 15,}}>
                        无
                        <Text style={{color: yfwGreenColor()}}>"{this.state.sickness}"</Text>
                        的搜索结果，请重新输入
                    </Text>
                </View>
            )
        }
    }

    _requestSearch(keywords){
        let paramMap = new Map();
        paramMap.set('__cmd','guest.disease.getListByKeywords');
        paramMap.set('keywords',safe(keywords));
        paramMap.set('top',10);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap,(res)=>{
            this.setState({
                dataSource: res.result
            });
        },(res)=>{
        },false);
    }

    // 分割线
    _renderLine() {
        return(
            <View style={{height: 0.5, backgroundColor: yfwLineColor()}}></View>
        )
    }

    // 弹出modal
    show() {
        this.modalView && this.modalView.show()
        setTimeout(() => {
            if (this.refs.input) {
                this.refs.input.focus()
            }
        }, 200);
    }

    // 消失modal
    disMiss() {
        this.modalView && this.modalView.disMiss()
    }
}
