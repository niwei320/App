import React, { Component } from 'react';

import {
    Image,
    TouchableOpacity,
    View,
    Text,
    FlatList, StyleSheet, TextInput, KeyboardAvoidingView, Keyboard, Platform,DeviceEventEmitter
} from 'react-native';
import {
    separatorColor,
    yfwGreenColor,
    yfwOrangeColor,
    darkTextColor,
    backGroundColor
} from "../../Utils/YFWColor";
import { itemAddKey, kScreenHeight, kScreenWidth, safe, isIphoneX, safeObj, isEmpty, isRealName } from "../../PublicModule/Util/YFWPublicFunction";
import { toDecimal } from "../../Utils/ConvertUtils";
import YFWPopupWindow from "../../PublicModule/Widge/YFWPopupWindow";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity"
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import YFWToast from '../../Utils/YFWToast';
import { pushNavigation } from '../../Utils/YFWJumpRouting';
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import BaseTipsDialog from '../../PublicModule/Widge/BaseTipsDialog';
export default class YFWLogisticsInfoView extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            kHeight: kScreenWidth,
            keyBoardHeight: 0,
            logistics_company:'',
            logisticsCode: '',
            orderNo:'',
            type:'',
            phone:'',
            explain:'',
        };
    }
    componentDidMount() {
        _this = this
        this.setState({
            kHeight: kScreenWidth + 60
        })
    }
    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardDidHide.bind(this));

    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }


    render() {
        return (
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => { }}
                backgroundColor={'white'}
                popupWindowHeight={this.state.kHeight + 60}
            >
                {this.renderAlertView()}
            </YFWPopupWindow>
        );
    }
    renderAlertView() {
        return (
            <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={80}
            >
                <View style={{ height: 50, width: kScreenWidth }}>
                    <View style={{ flexDirection: 'row', height: 45, width: kScreenWidth, justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ height: 15, width: 15, marginLeft: 18 }} />
                        <Text style={{color:"#000", fontSize:14, }}>填写退货物流</Text>
                        <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:0}} onPress={() => this.closeView()}>
                            <Image style={{ width: 13, height: 13, marginRight: 18 }} source={require('../../../img/photo_Close.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                <FlatList
                    data={['','']}
                    renderItem={this._renderItem.bind(this)}
                    ItemSeparatorComponent={this._separator.bind(this)}
                    style={{flex:1}}
                />
                <View style={{ position: 'absolute', bottom: 11, alignItems: 'center', marginLeft: 6 }}>
                    <YFWTouchableOpacity style_title={{ height: 44 / 667 * kScreenHeight, width: kScreenWidth - 12, fontSize: 16, }} title={'确定'}
                        callBack={() => { this._confirmClickAction() }}
                        isEnableTouch={true} />
                </View>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
            </KeyboardAvoidingView>
        );
    }

    _renderItem = (item) => {

        if (item.index == 0) {
            let have = this.state.logistics_company&&this.state.logistics_company.length>0
            let logistics_company = have?this.state.logistics_company:'请选择物流公司'
            let textColor = have?'#333':'#999'
            return (
                <TouchableOpacity activeOpacity={1} onPress={()=>this._selectLogisticsCompany()} style={styles.cellContainer}>
                    <Text style={styles.cellTitle}>{'物流公司:'}</Text>
                    <Text style={[styles.cellTitle,{marginLeft:10,flex:1,color:textColor}]}>{logistics_company}</Text>
                    <Image style={{width:8,height:12,marginRight:13}} source={require('../../../img/icon_arrow_gray.png')}></Image>
                </TouchableOpacity>
            )
        } else if (item.index == 2) {
            return (
                <View style={styles.cellContainer}>
                    <Text style={styles.cellTitle}>{'联系电话:'}</Text>
                    <TextInput
                            underlineColorAndroid='transparent'
                            placeholder={'请填写联系电话'}
                            placeholderTextColor="#999"
                            style={{marginLeft:10,fontSize:12,flex:1}}
                            value={this.state.phone}
                            maxLength={11}
                            onChangeText={(text) => {
                                if (text) {
                                    this.setState(() => ({
                                        phone: text,
                                    }))
                                } else {
                                    this.setState(() => ({
                                        phone: '',
                                    }))
                                }
                            }}
                        >
                    </TextInput>
                </View>
            )
        }  else if (item.index == 1) {
            return (
                <View style={styles.cellContainer}>
                    <Text style={styles.cellTitle}>{'物流单号:'}</Text>
                    <TextInput
                            underlineColorAndroid='transparent'
                            placeholder={'请填写物流单号'}
                            placeholderTextColor="#999"
                            style={{marginLeft:10,fontSize:12,flex:1}}
                            value={this.state.logisticsCode}
                            onChangeText={(text) => {
                                if (text) {
                                    this.setState(() => ({
                                        logisticsCode: text,
                                    }))
                                } else {
                                    this.setState(() => ({
                                        logisticsCode: '',
                                    }))
                                }
                            }}
                        >
                    </TextInput>
                </View>
            )
        }  else if (item.index == 3) {
            return (
                <View style={[{paddingHorizontal:29,backgroundColor:'white'},{flexDirection:'column'}]}>
                    <Text style={[styles.cellTitle,{marginVertical:22}]}>{'退货说明:'}</Text>
                    <View style={{marginBottom:16,backgroundColor:'#fafafa',height:85,borderRadius:2}}>
                        <TextInput
                                multiline={true}
                                maxLength={40}
                                underlineColorAndroid='transparent'
                                placeholder={'请填写退货说明'}
                                placeholderTextColor="#999"
                                style={{fontSize:12,flex:1}}
                                value={this.state.explain}
                                onChangeText={(text) => {
                                    if (text) {
                                        this.setState(() => ({
                                            explain: text,
                                        }))
                                    } else {
                                        this.setState(() => ({
                                            explain: '',
                                        }))
                                    }
                                }}
                            >
                        </TextInput>
                    </View>
                </View>
            )
        }
    }

    _separator = () => {
        return <View style={{height:1,marginLeft:12,flex:1,backgroundColor:'#f5f5f5'}}/>;
    }

    _selectLogisticsCompany() {
        if (this.props.navigation) {
            this.closeView()
            let {navigate} =  this.props.navigation;
            pushNavigation(navigate, {type: 'logistics_company',callBack:(result)=>{
                this.state.logistics_company = result[0].name
                this.showView()
            }});
        }
    }


    _keyboardDidShow(e) {
        this.setState({
            keyBoardHeight: e.endCoordinates.height,
            kHeight: Platform.OS == 'ios' ? e.endCoordinates.height + 250 + 40 : kScreenWidth

        });
    }

    _keyboardDidHide() {
        this.setState({
            keyBoardHeight: 0,
            kHeight: kScreenWidth + 60
        });
    }

    _confirmClickAction() {
        if (isEmpty(this.state.logistics_company)) {
            YFWToast('发货物流不能为空',{position:kScreenHeight*0.2})
            return
        }
        if (isEmpty(this.state.logisticsCode)) {
            YFWToast('寄回物流单号不能为空',{position:kScreenHeight*0.2})
            return
        }

        let item = {
            title: this.state.type == 'order_return_send' ? '录入成功，商家确认收货后将\n为您操作退款，请耐心等待。' : '更新成功，商家确认收货后将\n为您操作退款，请耐心等待。',
            leftText: "确定",
            leftClick: ()=> {
                this.closeView()
                // let {goBack} = this.props.navigation
                // goBack()
                this.props.callBack&&this.props.callBack()
            }
        }
        DeviceEventEmitter.emit('LoadProgressShow');
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.sendReturnGoods');
        paramMap.set('orderno', this.state.orderNo);
        paramMap.set('trafficName', safe(this.state.logistics_company));
        paramMap.set('trafficNo', safe(this.state.logisticsCode));
        viewModel.TCPRequest(paramMap, (res) => {
            DeviceEventEmitter.emit('LoadProgressClose');
            this.tipsDialog && this.tipsDialog._show(item)
        })
    }

    showWithInfo(info) {
        this.setState({
            orderNo:info.orderNo,
            type:info.type,
        })
        this.showView()
    }

    showView() {
        this.modalView && this.modalView.show()
    }

    closeView(){
        this.modalView && this.modalView.disMiss()
        this.setState({
            kHeight:kScreenWidth
        })
    }

}

const styles = {
    cellContainer: {
        height:58,
        flexDirection:'row',
        paddingLeft:29,
        alignItems:'center',
        backgroundColor:'white'
    },
    cellTitle:{
        color:'#999',
        fontSize:13
    }
}