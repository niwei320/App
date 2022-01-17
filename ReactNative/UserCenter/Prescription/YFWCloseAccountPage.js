import React, { Component } from 'react'
import { View, SectionList, Alert, StyleSheet, Text, TextInput, Image, TouchableOpacity, NativeModules, Platform } from 'react-native'
import { BaseStyles } from '../../Utils/YFWBaseCssStyle'
import { kScreenWidth, isEmpty, kScreenScaling, iphoneBottomMargin, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';
import { EMOJIS } from '../../PublicModule/Util/RuleString';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity';
import YFWToast from '../../Utils/YFWToast';
import { pushNavigation } from '../../Utils/YFWJumpRouting';
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import YFWCloseTipAlert, { kTipTypeWarn } from '../View/YFWCloseTipAlert';
const { StatusBarManager } = NativeModules;

export default class YFWCloseAccountPage extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: "注销账号",
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1
        },
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomColor: 'white', borderBottomWidth: 0 },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 50, height: 40 }]}
                onPress={() => { navigation.goBack() }}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerRight: <View style={{ width: 50 }} />,
        headerBackground: <Image source={require('../../../img/Status_bar.png')} style={{ width: kScreenWidth, flex: 1, resizeMode: 'stretch' }} />
    });

    constructor(props) {
        super(props)
        this.state = {
            reason: '',
        }
        this.mobile = this.props.navigation.state.params.state.mobile
    }

    render() {
        return (
            <KeyboardAwareScrollView style={{ backgroundColor: '#f5f5f5' }} keyboardShouldPersistTaps='always' keyboardDismissMode='on-drag' bounces={false} >
                <View style={{justifyContent:'center',paddingBottom:iphoneBottomMargin()+10}}>
                    <View style={{ marginHorizontal: 16, marginTop: 21 }}>
                        <Text style={{ fontSize: 16, color: '#333', fontWeight: 'bold' }}>{'您提交注销申请前，请仔细确认以下须知'}</Text>
                        <Text style={{ lineHeight: 18, fontSize: 13, color: '#333', marginTop: 16 }}>{'1.  账号注销前，请将所有未完结订单（待付款、待发货、待收货、退货退款中）/未完结投诉，处理完成后方可申请'}</Text>
                        <Text style={{ lineHeight: 18, fontSize: 13, color: '#333', marginTop: 8 }}>{'2.  账号注销后，将清空手机号、用户名等账号信息和所有订单记录，此账户将无法再登录'}</Text>
                    </View>
                    <View style={{
                        marginTop: 30,
                        marginHorizontal: 13,
                        paddingBottom: 5,
                        minHeight: 232,
                        borderRadius: 7,
                        backgroundColor: "#ffffff",
                        shadowColor: "rgba(204, 204, 204, 0.6)",
                        shadowOffset: {
                            width: 0,
                            height: 4
                        },
                        shadowRadius: 8,
                        shadowOpacity: 1
                    }}>
                        <View style={{ marginLeft: 12, marginTop: 27 }}>
                            <YFWTitleView title={'注销原因'} style_title={{ width: 66, fontSize: 15 }} />
                        </View>
                        <View style={{ backgroundColor: 'white', marginTop: 15, height: 180 }}>
                            <TextInput
                                underlineColorAndroid='transparent'
                                placeholder="请填写您的注销原因和意见，我们会妥善听取您的建议优化我们的产品"
                                placeholderTextColor="#999999"
                                multiline={true}
                                maxLength={100}
                                onChangeText={this.onTextChange.bind(this)}
                                value={this.state.reason}
                                style={{ flex: 1, color: 'black', fontSize: 14, padding: 20, textAlignVertical: 'top' }}>
                            </TextInput>
                        </View>
                    </View>
                    <View style={{marginTop:70*kScreenScaling,...BaseStyles.centerItem}}>
                        <YFWTouchableOpacity isEnableTouch={true} style_title={{height: 44, width: kScreenWidth - 20, fontSize: 16 }}  title={'申请注销'} callBack={() => this._submitMethod()} />
                    </View>
                </View>
                <YFWCloseTipAlert ref={(e) => this.closeTipView = e}></YFWCloseTipAlert>
            </KeyboardAwareScrollView>
        )
    }
    onTextChange(text) {
        this.setState(() => ({
            reason: text.replace(EMOJIS, '')
        }))
    }
    _submitMethod() {
        if (isEmpty(this.state.reason)) {
            YFWToast('请填写原因')
            return
        }
        Alert.alert('','账户注销后无法恢复，且不能使用该账户注册，请谨慎操作',[{text:'申请注销',onPress:()=>{
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.account.CheckAccountCancel');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let {navigate} = this.props.navigation
                pushNavigation(navigate,{type:'close_account_confirm',reason:this.state.reason,mobile:this.mobile})
            }, (error) => {
                if (error && error.code == -100 && isNotEmpty(error.msg)) {
                    this.closeTipView.showView(kTipTypeWarn, error.msg, '知道了', () => { })
                }
            });
        }},{text:'取消',onPress:()=>{}}],{cancelable:false})
        
    }
}