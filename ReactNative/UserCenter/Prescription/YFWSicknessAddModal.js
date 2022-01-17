import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
    StyleSheet,
} from 'react-native'
import YFWPopupWindow from '../../PublicModule/Widge/YFWPopupWindow'
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity'
import {darkTextColor, yfwLineColor, darkNomalColor, yfwGreenColor} from '../../Utils/YFWColor'
import {kScreenHeight, safe, safeObj, isEmpty, kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";
import {NAME, EMOJIS} from '../../PublicModule/Util/RuleString'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';


export default class YFWPatientSicknessModal extends Component {

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
                {this._renderBottomButton()}
            </YFWPopupWindow>
        )
    }

    // 标题行
    _renderTitleView() {
        let title = this.state.type ?'添加过敏源':'添加疾病'
        return(
            <View style={{width: kScreenWidth, height: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{width: 44, height: 44}}></View>
                <Text style={{color: darkTextColor(), fontSize: 15, fontWeight: '500'}}>{title}</Text>
                <TouchableOpacity onPress={() => {this.disMiss()}} activeOpacity={1} style={{width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('../../../img/close_button.png')} style={{width: 15, height: 15, resizeMode: 'stretch'}}></Image>
                </TouchableOpacity>
            </View>
        )
    }

    // 搜索框
    _renderSearch() {
        let placeholder = this.state.type ? '请输入过敏源名称':'请输入疾病名称、支持首字母、模糊搜索'
        return(
            <View style={{height: 34, marginHorizontal: 16, backgroundColor: '#F5F5F5', borderRadius: 20, flexDirection: 'row', paddingLeft: 15, paddingRight: 3,alignItems: 'center'}}>
                <TextInput
                    ref={'input'}
                    style={{flex: 1, paddingVertical: 0}}
                    placeholder={placeholder}
                    value={this.state.sickness}
                    selectionColor={yfwGreenColor()}
                    underlineColorAndroid={'transparent'}
                    returnKeyType={'search'}
                    onChangeText={(text) => {
                        text = text.replace(EMOJIS,'')
                        // 请求数据
                        this.state.sickness = text
                        this.requestDataFromServer()
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
                this.state.sickness = item.title
                this.setState({})
                this.disMiss()
                if(this.props.callBack){
                    this.props.callBack(item)
                }
                }} activeOpacity={1} style={{height: 45, paddingHorizontal: 16, justifyContent: 'center'}}>
                <Text style={{fontSize: 13, fontWeight: '500', color: darkTextColor()}}>{item.title}</Text>
            </TouchableOpacity>
        )
    }

    // 分割线
    _renderLine() {
        return(
            <View style={{height: 0.5, backgroundColor: yfwLineColor()}}></View>
        )
    }

    // 底部按钮
    _renderBottomButton() {
        return(
            <View style={{paddingVertical: 20, alignItems: 'center'}}>
                <YFWTouchableOpacity title={'保存并添加'} isEnableTouch={true} callBack={() => {
                    this.disMiss();
                    if(this.props.callBack && this.state.sickness.length>0) {
                        let item = {
                            title: this.state.sickness
                        }
                        this.props.callBack(item)
                    }
                }}/>
            </View>
        )
    }

    requestDataFromServer(){

        let params = new Map();
        let isDisease = this.state.type
        if (isDisease) {
            params.set('__cmd','guest.allergy.getListByKeywords');

        } else {
            params.set('__cmd','guest.disease.getListByKeywords');
        }

        params.set('keywords',this.state.sickness);
        params.set('top',8)
        let request = new YFWRequestViewModel()

        request.TCPRequest(params,(res)=>{
            let dataSource = []
            res.result&&res.result.map((info)=>{
                dataSource.push(
                    {title:info.disease_name?info.disease_name:info.allergy_name,
                        id:info.id}
                )
            })
            this.setState({
                dataSource:dataSource
            })
        },(error)=>{

        })

    }

    // 弹出modal
    show(type) {
        this.setState({
            sickness:'',
            type:type,
            dataSource:[],
        })
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
