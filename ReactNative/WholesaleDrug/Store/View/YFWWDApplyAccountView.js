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
    View,ScrollView
} from 'react-native';
import YFWWDBaseView from '../../Base/YFWWDBaseView';
import {
    kNavigationHeight,
    kStatusHeight,
    kScreenWidth,
    iphoneBottomMargin, safeArray
} from '../../../PublicModule/Util/YFWPublicFunction';
import { YFWImageConst } from '../../Images/YFWImageConst';
import LinearGradient from 'react-native-linear-gradient';
import YFWWDApplyAccountModel from '../Model/YFWWDApplyAccountModel';
import YFWNativeManager from '../../../Utils/YFWNativeManager';
import YFWToast from '../../../Utils/YFWToast';
import YFWPopupWindow from "../../../PublicModule/Widge/YFWPopupWindow";

export default class YFWWDApplyAccountView extends YFWWDBaseView {
    //pageType 0 电子 1 纸质
    constructor(props) {
        super(props);
        this.data = YFWWDApplyAccountModel.initWithModel(this.props.model)
        this.isOpen = false
    }

    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView()}
                {this.renderContent()}
                {this.renderBotton()}
                {this.renderModal()}
                {this.renderTipsView()}
            </View>
        )
    }

    renderNavigationView() {
        return (
            <View style={{height:kNavigationHeight,paddingTop:kStatusHeight,flexDirection:'row',justifyContent:'space-between',backgroundColor:'white'}}>
                <TouchableOpacity onPress={() => this.backMethod()} activeOpacity={1} style={styles.backbotton_style}>
                    <Image style={styles.backicon_style} source={ YFWImageConst.Nav_back_white}/>
                </TouchableOpacity>
                <View style={{flex:1,height:kNavigationHeight-kStatusHeight,flexDirection:"row",justifyContent:'center',alignItems:'center',}}>
                    <Text style={{ fontSize: 17, color: 'rgb(51,51,51)' }}>申请开户</Text>
                </View>
                <TouchableOpacity style={styles.backbotton_style} />
            </View>
        )
    }

    renderContent() {
        if (this.data.pageType == 0) {
            return (
                <ScrollView style={{ flex: 1, paddingHorizontal: 12 }}>
                    <View style={{ height: 45, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, color: 'rgb(51,51,51)' }}>{this.data.paperInfo.title}</Text>
                    </View>
                    {   this.data.dict_audit != 2?
                        <View>
                            <View style={{ paddingHorizontal: 21, paddingTop: 17, paddingBottom: 20, backgroundColor: 'rgb(245,245,245)' }}>
                                <Text style={{ alignItems: 'stretch', fontSize: 14, color: 'rgb(84,124,255)' }}>电子开户要求:</Text>
                                {this.data.electronicInfo.list.map((item) => {return <View style={{ alignItems: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                    <View style={{flex:1}}>
                                        <Text style={{ fontSize: 12, color: 'rgb(153,153,153)' }}>{'· ' + item.name}</Text>
                                    </View>
                                    {item.status != 1?
                                        <Text style={{ fontSize: 12, color: 'rgb(255,51,0)' }}>缺失</Text>
                                    :<Text style={{ fontSize: 12, color: '#1fdb9b' }}>完成</Text>
                                    }
                                </View>})}
                            </View>
                            <View style={{ paddingVertical: 14, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, color: 'rgb(153,153,153)' }}>{this.data.status?'您的电子开户资料已完整':'您的电子开户资料不完整，请尽快完善后提交审核。'}</Text>
                            </View>
                        </View> :
                        <View style={{ paddingVertical: 14, justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 13, color: 'rgb(153,153,153)' }}>{'拒绝原因：'+this.data.dict_audit_reason}</Text>
                        </View>
                    }
                </ScrollView>
            )
        } else if (this.data.pageType == 1) {
            return (
                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <View style={{ height: 30, justifyContent: 'center', backgroundColor: 'rgb(255,243,218)',marginHorizontal:-12,paddingHorizontal:12}}>
                        <Text style={{ fontSize: 14, color: 'rgb(252,153,36)' }}>本店仅支持纸质开户，请尽快按要求邮寄开户资料。</Text>
                    </View>
                    <View style={{ height: 45, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, color: 'rgb(51,51,51)' }}>{this.data.paperInfo.title}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 21, paddingTop: 17, paddingBottom: 20, backgroundColor: 'rgb(245,245,245)' }}>
                        <View style={{ alignItems: 'stretch', flexDirection: 'row' }}>
                            <Image style={{ width: 11, height: 11 ,alignSelf:'center'}} source={YFWImageConst.Icon_licence} />
                            <Text style={{ alignItems: 'stretch', fontSize: 14, color: 'rgb(84,124,255)' }}>  开户资料要求:</Text>
                        </View>
                        {
                            this.data.paperInfo.campData.map((item) => {
                                return (
                                    <View style={{ alignItems: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                        <Text style={{ fontSize: 12, color: 'rgb(153,153,153)' }}>{'·    ' + item.name}</Text>
                                    </View>
                                )
                            })
                        }
                        <View style={{ alignItems: 'stretch', flexDirection: 'row', marginTop: 17 }}>
                            <Image style={{ width: 11, height: 12, alignSelf:'center'}} source={YFWImageConst.Icon_address_blue} />
                            <Text style={{ alignItems: 'stretch', fontSize: 14, color: 'rgb(84,124,255)' }}>  寄送地址:</Text>
                        </View>
                        <View style={{ alignItems: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 12, color: 'rgb(153,153,153)' }}>{'·    ' + this.data.paperInfo.shopping_name+'  '+this.data.paperInfo.mobile}</Text>
                        </View>
                        <View style={{ alignItems: 'stretch', flexDirection: 'row', marginTop: 10 }}>
                            <Text style={{ fontSize: 12, color: 'rgb(153,153,153)' }}>{'·    ' + this.data.paperInfo.mail_address+'  '}</Text>
                            <TouchableOpacity onPress={() => { YFWNativeManager.copyLink(this.data.paperInfo.mail_address);YFWToast('复制成功')}}>
                                <Text style={{ fontSize: 12, color: 'rgb(84,124,255)' }}>复制地址</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        } else {
            return <View/>
        }
    }

    renderBotton() {
        if (this.data.pageType == 0) {
            if (this.data.status) {
                if (this.data.isapply == 0) {
                    return (
                        <View style={{ height: 73, width: kScreenWidth, paddingHorizontal: 12 }}>
                            <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                                <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.toOpenAccount()}>
                                    <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>申请开户</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    )
                } else {
                    if (this.data.dict_audit == 0) {//等待
                        return (
                            <View style={{ width: kScreenWidth, paddingHorizontal: 12 }}>
                                <View style={{ height: 40, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 11, color: 'rgb(51,51,51)' }}>您的开户申请已提交，请耐心等待卖家处理。</Text>
                                    <Text style={{ fontSize: 11, color: 'rgb(51,51,51)' }}>咨询电话：<Text onPress={() => YFWNativeManager.takePhone(this.data.store_phone)} style={{ fontSize: 11, color: 'rgb(84,124,255)' }}>{this.data.store_phone}</Text></Text>
                                </View>
                            </View>
                        )
                    } else {
                        return (
                            <View style={{ height: 73, width: kScreenWidth, paddingHorizontal: 12 }}>
                                <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.toOpenAccount()}>
                                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>申请开户</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        )
                    }
                }
            } else {
                return (
                    <View style={{ height: 73, width: kScreenWidth, paddingHorizontal: 12 }}>
                        <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                            <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => {
                                this.modalView && this.modalView.show()
                            }}>
                                <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>+ 添加开户资料</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )
            }
        } else if (this.data.pageType == 1) {
            if (this.data.status) {
                if (this.data.isapply == 0) {
                    return (
                        <View style={{ height: 73, width: kScreenWidth, paddingHorizontal: 12 }}>
                            <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                                <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.toOpenAccount()}>
                                    <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>申请开户</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    )
                } else {
                    if (this.data.dict_audit == 0) {//等待
                        return (
                            <View style={{ height: 100, width: kScreenWidth, paddingHorizontal: 12 }}>
                                <View style={{ height: 40, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 11, color: 'rgb(51,51,51)' }}>您的开户申请已提交，请耐心等待卖家处理。</Text>
                                    <Text style={{ fontSize: 11, color: 'rgb(51,51,51)' }}>咨询电话：<Text onPress={() => YFWNativeManager.takePhone(this.data.store_phone)} style={{ fontSize: 11, color: 'rgb(84,124,255)' }}>{this.data.store_phone}</Text></Text>
                                </View>
                                <LinearGradient style={styles.bottom_botton_style} colors={['rgb(204,204,204)', 'rgb(204,204,204)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => { }}>
                                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>申请开户中...</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        )
                    } else {
                        return (
                            <View style={{ height: 73, width: kScreenWidth, paddingHorizontal: 12 }}>
                                <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.toOpenAccount()}>
                                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>申请开户</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        )
                    }
                }
            } else {
                return (
                    <View style={{ height: 73, width: kScreenWidth, paddingHorizontal: 12 }}>
                        <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                            <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.toOpenAccount()}>
                                <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>申请开户</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )

            }
        } else {
            return <View/>
        }
    }


    renderModal() {
        if(safeArray(this.data.electronicInfo.missingList).length === 0){
            return <></>
        }
        let array = safeArray(this.data.electronicInfo.missingList)
        return (
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => {}}
                popupWindowHeight={45 + array.length*57 + iphoneBottomMargin()}
            >
                <View style={{flex: 1, paddingTop:15,paddingBottom:30 + iphoneBottomMargin()}}>
                    {array.map((item)=>{
                        return (
                            <>
                                <TouchableOpacity onPress={()=>{this.modalView && this.modalView.disMiss();this.jumpToAddInfo(item)}} style={{width:kScreenWidth,height:57,alignItems:'center',justifyContent: 'center'}}>
                                    <Text style={{fontSize: 16, color: "#999999"}}>{item.name}</Text>
                                </TouchableOpacity>
                                <View style={{width:kScreenWidth-48,marginLeft:24,height:StyleSheet.hairlineWidth,backgroundColor:'#999999'}}/>
                            </>
                        )
                    })}
                </View>
            </YFWPopupWindow>
        )
    }

    backMethod() {
        this.props.father&&this.props.father.backMethod&&this.props.father.backMethod()
    }

    updateViews() {
        this.data = YFWWDApplyAccountModel.initWithModel(this.props.father.model)            //componentWillReceiveProps没有调用,故在此赋值
        this.setState({})
    }

    toOpenAccount() {
        this.props.father&&this.props.father.toOpenAccount&&this.props.father.toOpenAccount()
    }

    jumpToAddInfo(item) {
        this.props.father&&this.props.father.jumpToAddInfo&&this.props.father.jumpToAddInfo(item)
    }
}

const styles = StyleSheet.create({
    container_style: { flex: 1, backgroundColor: '#FAFAFA' },
    backbotton_style: { width: 50, height: kNavigationHeight - kStatusHeight, justifyContent: 'center' },
    backicon_style: { width: 11, height: 19, marginLeft: 12, resizeMode: 'contain', tintColor: 'rgb(51,51,51)' },


    bottom_botton_style: {height:42,borderRadius:21}
});
