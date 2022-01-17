import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,ImageBackground, ScrollView, KeyboardAvoidingView
} from 'react-native';
import YFWWDBaseView, { kNav_Linear } from '../../Base/YFWWDBaseView';
import {
    kScreenWidth,
    kNavigationHeight,
    kScreenHeight,
    safeArray, isAndroid
} from '../../../PublicModule/Util/YFWPublicFunction';
import { YFWImageConst } from '../../Images/YFWImageConst';
import LinearGradient from 'react-native-linear-gradient';
import YFWToast from '../../../Utils/YFWToast';
import YFWWDRegisterModel from '../Model/YFWWDRegisterModel';


export default class YFWWDRegisterView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = YFWWDRegisterModel.initWithModel(this.props.model)
        this.scrollViewTop = 0
    }

    componentWillReceiveProps(props) {
        this.props =  props
    }


    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Linear,'注册企业会员')}
                {this.renderContent()}
                {this.renderAlertSheet()}
                {this.renderAddressAlert()}
            </View>
        )
    }

    renderChooseLicenceType() {
        if(safeArray(this.model.licenceTypeArray).length !== 0){
            return (
                <TouchableOpacity onPress={()=>this.chooseLicenceType()} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                    <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>执照类型</Text>
                    <Text style={{ fontSize: 13, color: this.model.licence_text==''?'rgb(153,153,153)':'rgb(51,51,51)', flex: 1 }}>{this.model.licence_text==''?'请选择执照类型':this.model.licence_text}</Text>
                    <Image source={YFWImageConst.Icon_message_next} style={{width:6,height:11}}/>
                </TouchableOpacity>
            )
        }
    }

    renderContent() {
        let associationView = (safeArray(this.model.licenceTypeArray).length !== 0)?200:150
        return (
            <KeyboardAvoidingView behavior='padding' style={{flex:1}}>
                <ScrollView style={{paddingHorizontal: 15, marginTop: 13, backgroundColor: 'white', zIndex: 1 }} scrollEnabled={!this.isShowAssociationView}>
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>企业信息</Text>
                    </View>
                    <TouchableOpacity onPress={()=>this.chooseQYTyoe()} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>企业类型</Text>
                        <Text style={{ fontSize: 13, color: this.model.qylx==''?'rgb(153,153,153)':'rgb(51,51,51)', flex: 1 }}>{this.model.qylx==''?'请选择企业类型':this.model.qylx}</Text>
                        <Image source={YFWImageConst.Icon_message_next} style={{width:6,height:11}}/>
                    </TouchableOpacity>
                    {this.renderChooseLicenceType()}
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', zIndex: 2 }}
                        onLayout={(event) => {
                        let { x, y, width, height } = event.nativeEvent.layout;
                        this.associationView_width = width
                        }}
                    >
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>企业名称</Text>
                        <TextInput style={{ fontSize: 13, flex: 1, color: 'rgb(51,51,51)' }}
                            ref={view => this.qymcInput = view}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入完整的企业名称"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'done'}
                            value={this.model.qymc}
                            onSubmitEditing={() => this.textEnd()}
                            onChangeText={(text) => this.textChange(text, 'qymc')}
                            onBlur={()=>this.loseFocus('qymc')}
                        />
                    </View>
                    {this.renderAssociationView(associationView,kScreenWidth-100,30)}
                    {this.model.licence_type != -1?
                        <>
                            <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                            <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                                <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>法定代表人</Text>
                                <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                                    placeholderTextColor={'rgb(153,153,153)'}
                                    placeholder="请输入法定代表人（与工商执照一致）"
                                    underlineColorAndroid='transparent'
                                    keyboardType='default'
                                    returnKeyType={'next'}
                                    value={this.model.frxm}
                                    onChangeText={(text) => this.textChange(text, 'frxm')}
                                />
                            </View>
                            <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                            <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                                <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>信用代码</Text>
                                <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                                    placeholderTextColor={'rgb(153,153,153)'}
                                    placeholder="请输入统一社会信用代码（与工商执照一致）"
                                    underlineColorAndroid='transparent'
                                    keyboardType='default'
                                    returnKeyType={'next'}
                                    value={this.model.xydm}
                                    onChangeText={(text) => this.textChange(text, 'xydm')}
                                />
                            </View>
                        </>
                        :<></>
                    }
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <TouchableOpacity onPress={() => this.chooseAddress()} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', width: 77 }}>所在地区</Text>
                        <Text style={{ fontSize: 13, color: this.model.szdq == '' ? 'rgb(153,153,153)' : 'rgb(51,51,51)', flex: 1 }}>{this.model.szdq == '' ? '请选择所在地区' : this.model.szdq}</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>注册地址</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入详细的注册地址"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.zcdz}
                            onChangeText={(text) => this.textChange(text, 'zcdz')}
                        />
                    </View>
                    <View style={{ height: 13, backgroundColor: '#FAFAFA' }} />


                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>账号信息</Text>
                    </View>
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>用户名</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请设置登录用户名"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.yhm}
                            onBlur={()=>this.loseFocus('yhm')}
                            onChangeText={(text) => this.textChange(text, 'yhm')}
                            onBlur={()=>this.loseFocus('yhm')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>设置密码</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入密码"
                            underlineColorAndroid='transparent'
                            keyboardType={isAndroid()?'visible-password':'default'}
                            returnKeyType={'next'}
                            value={this.model.szmm}
                            onChangeText={(text) => this.textChange(text, 'szmm')}
                            onBlur={()=>this.loseFocus('szmm')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>确认密码</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请再次输入密码"
                            underlineColorAndroid='transparent'
                            keyboardType={isAndroid()?'visible-password':'default'}
                            returnKeyType={'next'}
                            value={this.model.qrmm}
                            onChangeText={(text) => this.textChange(text, 'qrmm')}
                        />
                    </View>
                    <View style={{ height: 13, backgroundColor: '#FAFAFA' }} />


                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>管理员信息</Text>
                    </View>
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>姓名</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入您的真实姓名"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.xm}
                            onChangeText={(text) => this.textChange(text, 'xm')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>手机号码</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入手机号码"
                            underlineColorAndroid='transparent'
                            keyboardType='phone-pad'
                            returnKeyType={'next'}
                            maxLength={11}
                            value={this.model.sjhm}
                            onChangeText={(text) => this.textChange(text, 'sjhm')}
                            onBlur={()=>this.loseFocus('sjhm')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>验证码</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入验证码"
                            underlineColorAndroid='transparent'
                            keyboardType='numeric'
                            returnKeyType={'next'}
                            value={this.model.yzm}
                            maxLength={6}
                            onChangeText={(text) => this.textChange(text, 'yzm')}
                        />
                        <TouchableOpacity onPress={() => this.getVerificationCode()} activeOpacity={1} style={{ height: 25,justifyContent:'center', paddingLeft:15, borderLeftColor: 'rgb(230,230,230)', borderLeftWidth: 1 }}>
                            <Text style={{fontSize:13,color:this.model.noticeText == '获取验证码'?'rgb(65,109,255)':'rgb(153,153,153)'}}>{this.model.noticeText}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 100, backgroundColor: '#fffffff' }} />

                    <View style={{ height: 100, paddingHorizontal: 24 ,marginTop:30}}>
                        <TouchableOpacity onPress={() => this.agreeService()} activeOpacity={1} style={{marginBottom:15,flexDirection:'row',alignItems:'center'}}>
                            <Image source={this.model.isAgree?YFWImageConst.Icon_gou_blue:YFWImageConst.Icon_gou_hui} style={{ width: 14, height: 14, resizeMode: 'stretch', marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: 'rgb(51,51,51)'}} numberOfLines={2}>我已阅读并同意
                                <Text style={{ color: 'rgb(65,109,255)' }} onPress={() => this.toServiceAgreement()}>《药房网商城入驻用户服务协议》</Text>
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.5} onPress={() => this.toUploadRegister()}>
                            <LinearGradient style={{height:42,borderRadius:21}} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[1, 0]}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                                    <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>提交注册</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        )
    }



    showAlertSheet(title,array,callback) {
        this.alertSheet.showView(title,array, callback)
    }

    showAddressAlert(callback) {
        this.addressAlert.showView(callback);
    }

    chooseQYTyoe() {
        this.props.father&&this.props.father.chooseQYTyoe&&this.props.father.chooseQYTyoe()
    }

    chooseLicenceType() {
        this.props.father&&this.props.father.chooseLicenceType&&this.props.father.chooseLicenceType()
    }

    chooseAddress() {
        this.props.father&&this.props.father.chooseAddress&&this.props.father.chooseAddress()
    }

    agreeService() {
        this.props.father&&this.props.father.agreeService&&this.props.father.agreeService()
    }

    toServiceAgreement() {
        this.props.father&&this.props.father.toServiceAgreement&&this.props.father.toServiceAgreement()
    }

    textChange(text,index) {
        this.props.father&&this.props.father.textChange&&this.props.father.textChange(text,index)
    }

    textEnd() {
        this.props.father&&this.props.father.textEnd&&this.props.father.textEnd()
    }

    loseFocus(type) {
        this.props.father&&this.props.father.loseFocus&&this.props.father.loseFocus(type)
    }

    getVerificationCode() {
        if (this.model.noticeEnable) {
            this.props.father&&this.props.father.getVerificationCode&&this.props.father.getVerificationCode()
        }
    }
    toUploadRegister() {
        this.props.father&&this.props.father.toUploadRegister&&this.props.father.toUploadRegister()
    }

    updateViews() {
        this.model = this.props.father.model
        this.setState({})
    }
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FAFAFA'},
});
