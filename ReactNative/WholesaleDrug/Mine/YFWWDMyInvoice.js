import React, { Component } from 'react';
import {
    View, StyleSheet,TextInput,Text,TouchableOpacity
} from 'react-native';
import { itemAddKey, kScreenWidth, kStyleWholesale, strMapToObj, kScreenHeight } from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import StatusView from "../../widget/StatusView";
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import { yfwBlueColor } from '../../Utils/YFWColor';
import YFWHeaderBackground from '../Widget/YFWHeaderBackground';
import YFWHeaderLeft from '../Widget/YFWHeaderLeft';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default class YFWWDMyInvoice extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: '开票信息',
        headerTitleStyle: {fontSize: 16, color: 'white', textAlign: 'center', flex: 1},
        headerBackground:<YFWHeaderBackground from={kStyleWholesale}></YFWHeaderBackground>,
        headerLeft:<YFWHeaderLeft navigation={navigation}></YFWHeaderLeft>,
        headerRight: (
            navigation.state.params.isShow?
            <TouchableOpacity
                onPress={() => navigation.state.params.saveAction&&navigation.state.params.saveAction()}
                activeOpacity={1}>
                <Text style={{ fontSize: 16, color: '#fff', marginRight: 5 }}
                >保存    </Text>
            </TouchableOpacity>:null
        ),
    });

    constructor(props) {
        super(props);
        this.state = {
            tax_no: '',
            company_name: '',
            bank_name:'',
            bank_no:'',
            register_address:'',
            register_phone:'',
            isShow:false,
        }
        this.invoiceInfo = {}
    }

    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        this.props.navigation.setParams({
            saveAction: () => this._confirmClickInvoice(),
            isShow:false
        })
        this._fetchDataFromServer()
    }

    componentWillUnmount() {

    }

    //-----------------------------------------------METHOD---------------------------------------------

    _fetchDataFromServer() {

        let paramMap = new Map();
        paramMap.set('__cmd', 'store.finance.invoice.get');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.statusView && this.statusView.dismiss()
            console.log(JSON.stringify(res))
            let value = res.result
            this.invoiceInfo = value
            this.setState({
                tax_no: value.tax_no,
                company_name: value.company_name,
                bank_name:value.bank_name,
                bank_no:value.bank_no,
                register_address:value.register_address,
                register_phone:value.register_phone,
                isShow:value.dict_store_invoice_type == 1,
            })
            this.props.navigation.setParams({
                isShow:value.dict_store_invoice_type != 1,
            })
        },
            (error) => {
                if (error && error.msg) {
                    YFWToast(error.msg)
                }
            }, false)

    }

    clickType(isSelect, index) {
        if (index == 0) {
            this.setState({
                isShow: true,
            })
            this.props.navigation.setParams({
                isShow:false
            })
        } else {
            this.setState({
                isShow: false,
            })
            this.props.navigation.setParams({                
                isShow:true
            })
        }
    }

    _confirmClickInvoice() {
        let invoiceMap = new Map()
        invoiceMap.set('company_name', this.state.company_name)
        invoiceMap.set('tax_no', this.state.tax_no)
        if (this.state.isShow == true) {
            invoiceMap.set('dict_store_invoice_type', 1)
            this._updateInfoFromServer(invoiceMap)
            return
        }
        let toastShowPosition = kScreenHeight * 0.2 
        if (this.state.bank_name.length == 0) {
            YFWToast('请输入开户行', { position: toastShowPosition});
            return;
        }
        if (this.state.bank_no.length == 0) {
            YFWToast('请输入银行账号', { position: toastShowPosition});
            return;
        }
        if (this.state.register_phone.length == 0) {
            YFWToast('请输入注册电话', { position: toastShowPosition});
            return;
        }
        if (this.state.register_address.length == 0) {
            YFWToast('请输入注册地址', { position: toastShowPosition});
            return;
        }

        invoiceMap.set('bank_name', this.state.bank_name)
        invoiceMap.set('bank_no', this.state.bank_no)
        invoiceMap.set('register_phone', this.state.register_phone)
        invoiceMap.set('register_address', this.state.register_address)
        invoiceMap.set('dict_store_invoice_type', 2)
        this._updateInfoFromServer(invoiceMap)
    }
    
    _updateInfoFromServer(infoMap) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.finance.invoice.saveOrUpdate_WholeApp');
        paramMap.set('chose_fp',1)
        // paramMap.set('model',JSON.stringify(strMapToObj(infoMap)))
        paramMap.set('model',strMapToObj(infoMap))
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            console.log(JSON.stringify(res))
            YFWToast('保存成功')
        },
            (error) => {
                if (error && error.msg) {
                    YFWToast(error.msg)
                }
            }, false)
    }
    //-----------------------------------------------RENDER---------------------------------------------

    render() {
        return (
            <KeyboardAwareScrollView style={[{ flex: 1, width: kScreenWidth, backgroundColor: '#fafafa' }]} keyboardShouldPersistTaps='always' extraScrollHeight={20}>
                {this._renderTypeInfo()}
                {this._renderInvoiceItem()}
                <StatusView ref={(m) => { this.statusView = m }} retry={() => {
                    this._fetchDataFromServer();
                }} />
            </KeyboardAwareScrollView>
        )
    }

    _renderTypeInfo() {
        let typeName = [{ name: '增值税普通发票', status: false }, { name: '增值税专用发票 ', status: true }];
        let views = [];
        let selectIndex = this.state.isShow ? 0 : 1
        typeName.map((item, index) => {
            views.push(
                <TouchableOpacity onPress={() => {
                    this.clickType(item.status, index)
                }}>
                    <View style={[{
                        marginLeft: index == 0 ? 12 : 16,
                        marginTop: 16, paddingHorizontal: 5, height: 32, borderRadius: 16,
                        borderStyle: "solid",
                        borderWidth: 1,
                        borderColor: index == selectIndex ? yfwBlueColor() : "#999999"
                    }, BaseStyles.centerItem]}>
                        <Text style={{ fontSize: 14, color: index == selectIndex ? yfwBlueColor() : "#999999" }}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
            )
        })
        return (
            <View style={{ paddingBottom: 27,marginTop:34,width:kScreenWidth }}>
                <Text style={{ color: "#000", fontSize: 15,fontWeight:'500', marginLeft: 12 }}>发票类型</Text>
                <View style={{ flexDirection: "row" }}>
                    {views}
                </View>
            </View>
        )
    }

    _renderInvoiceItem() {
        if (this.state.isShow) {
            return (
                <View style={{ flex: 1 }}>
                    <Text style={{ color: "#000", fontSize: 15, marginLeft: 12, fontWeight: '500',marginBottom:12 }}>开票信息</Text>
                    {this._renderInputView('抬头：', false, '', this.state.company_name, (text) => { })}
                    {this._renderLineView()}
                    {this._renderInputView('税号：', false, '', this.state.tax_no, (text) => { })}
                    {this._renderLineView()}
                </View>
            )
        }
        return (
            <View style={{ flex: 1 }}>
                <Text style={{ color: "#000", fontSize: 15, marginLeft: 12, fontWeight: '500',marginBottom:12  }}>开票信息</Text>
                {this._renderInputView('抬头：', false, '', this.state.company_name, (text) => { })}
                {this._renderLineView()}
                {this._renderInputView('税号：', false, '', this.state.tax_no, (text) => { })}
                {this._renderLineView()}
                {this._renderInputView('开户银行：', true, '请填写开户行', this.state.bank_name, (text) => {
                    if (text) {
                        this.setState(() => ({
                            bank_name: text,
                        }))
                    } else {
                        this.setState(() => ({
                            bank_name: '',
                        }))
                    }
                })}
                {this._renderLineView()}
                {this._renderInputView('银行账号：', true, '请填写银行账号', this.state.bank_no, (text) => {
                    if (text) {
                        this.setState(() => ({
                            bank_no: text,
                        }))
                    } else {
                        this.setState(() => ({
                            bank_no: '',
                        }))
                    }
                })}
                {this._renderLineView()}
                {this._renderInputView('注册电话：', true, '请填写注册电话', this.state.register_phone, (text) => {
                    if (text) {
                        this.setState(() => ({
                            register_phone: text,
                        }))
                    } else {
                        this.setState(() => ({
                            register_phone: '',
                        }))
                    }
                })}
                {this._renderLineView()}
                {this._renderInputView('注册地址：', true, '请输入详细的注册地址', this.state.register_address, (text) => {
                    if (text) {
                        this.setState(() => ({
                            register_address: text,
                        }))
                    } else {
                        this.setState(() => ({
                            register_address: '',
                        }))
                    }
                })}
                {this._renderLineView()}
                <Text style={{ color: "#ff9100", fontSize: 14, marginLeft: 12, marginTop: 40 }}>{'说明：开具增值税专用发票需提供开票信息。'}</Text>
            </View>
        )
    }

    _renderInputView(leftTip, editable, placeholder, value, onChangeTextAction) {
        return (
            <View style={[BaseStyles.leftCenterView, styles.tipView]}>
                <Text style={[styles.tipTitle]}>{leftTip}</Text>
                <TextInput
                    returnKeyType={'next'}
                    // maxLength={10}
                    editable={editable}
                    underlineColorAndroid='transparent'
                    placeholder={placeholder}
                    placeholderTextColor="#ccc"
                    style={[styles.tipValue, { color: editable ? '#333' : '#999' }]}
                    value={value}
                    onFocus={() => {
                    }}
                    onEndEditing={() => {
                    }}
                    onChangeText={(text) => {
                        onChangeTextAction && onChangeTextAction(text)
                    }}
                >
                </TextInput>
            </View>
        )
    }

    _renderLineView() {
        return (
            <View style={{ width: kScreenWidth - 28, height: 1, marginLeft: 12, backgroundColor: '#ececec' }} />
        )
    }

}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    tipView: {
        height: 41, width: kScreenWidth
    },
    tipTitle: {
        marginLeft: 13, fontSize: 13, color: '#999',width:70
    },
    tipValue: {
        marginLeft: 21, fontSize: 13, width: kScreenWidth - 120
    }
});