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
    View,ImageBackground, ScrollView , KeyboardAvoidingView
} from 'react-native';
import YFWWDBaseView, {
    kNav_Linear,
    kNav_Defalut,
    kBaseView_DatePicker_Normal
} from '../../Base/YFWWDBaseView';
import {
    kNavigationHeight,
    kStatusHeight,
    kScreenWidth,
    isEmpty, safe, safeArray
} from '../../../PublicModule/Util/YFWPublicFunction';
import { YFWImageConst } from '../../Images/YFWImageConst';
import LinearGradient from 'react-native-linear-gradient';
import { YFWWDUploadImageInfoModel } from '../Model/YFWWDUploadAccountQualifiyModel';

export default class YFWWDUploadAccountQualifiyView extends YFWWDBaseView {

    constructor(props) {
        super(props);

    }

    componentWillReceiveProps(props) {
        this.props =  props
    }

    render() {
        let qualifiyType = this.props.model.qualifiyType
        return (
            <View style={styles.container_style}>
                {this.props.model.father == 'usercenter'?this.renderNavigationView(kNav_Linear,qualifiyType=='syzz'?'首营资质':'资质证件'):this.renderNavigationView(kNav_Defalut,'开户资质')}
                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <TouchableOpacity onPress={() => this.toCustomerService()} activeOpacity={1} style={{ height: 30, justifyContent: 'space-between',flexDirection:'row',alignItems:'center', backgroundColor: 'rgb(255,243,218)',marginHorizontal:-12,paddingHorizontal:12}}>
                        <Text style={{ fontSize: 14, color: 'rgb(252,153,36)' }}>如有疑问请联系在线客服</Text>
                        <Image source={YFWImageConst.Icon_next_orange} style={{width:7,height: 12}}/>
                    </TouchableOpacity>
                    <View style={{ height: 45, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, color: 'rgb(51,51,51)' }}>{'企业名称：'+this.props.model.shopName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => isEmpty(this.props.model.value)?this.chooseQualifiyType(this.props.model.allQualifiyTypeDesc):{}} activeOpacity={1} style={{ padding: 17, backgroundColor: 'white',borderRadius:7,alignItems: 'center',justifyContent:'space-between', flexDirection: 'row' }}>
                        <Text style={{ alignItems: 'stretch', fontSize: 14, color: 'rgb(51,51,51)' }}>资质类型</Text>
                        <View style={{flex:1, flexDirection:'row',alignItems:'center',justifyContent: 'flex-end',paddingLeft: 14}}>
                            <Text style={{ color: 'rgb(153,153,153)', fontSize: 13, }} numberOfLines={2} >{this.props.model.selectIndex !=-1?this.props.model.allQualifiyTypeDesc[this.props.model.selectIndex]:'请选择'}</Text>
                            {isEmpty(this.props.model.value)?
                                <Image source={YFWImageConst.Icon_next_orange} style={{tintColor:'rgb(204,204,204)',width:7,height: 12,marginLeft: 7}}/>
                                :<></>
                            }
                        </View>
                    </TouchableOpacity>
                    <KeyboardAvoidingView style={{flex:1}} behavior="padding" keyboardVerticalOffset={80}>
                        <ScrollView>
                            {this.renderImages()}
                            {this.renderInfo()}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
                {this.renderBotton()}
                {qualifiyType=='zzzj'?
                    <>
                        {super.render([kBaseView_DatePicker_Normal])}
                    </>
                    :<></>
                }
            </View>
        )
    }

    renderImages() {
        if(this.props.model.qualifiyType=='syzz') {
            return this.props.model.localPic.map((item, index) => this.renderImagesItem(item, index));
        } else {
            return this.renderImagesItem(this.props.model.localPic[0] , 0);
        }
    }

    renderImagesItem(item, index) {
        let instance = YFWWDUploadImageInfoModel.init(item)
        if (item.type != 'default') {
            if (instance.isUploading && !instance.success) {
                return (
                    <View style={{ height: 130, width: kScreenWidth - 12 * 2, marginTop: 17, flexDirection: 'row' }}>
                        <Image source={{ uri: item.uri }} style={{ flex: 1, marginRight: 8, resizeMode: 'stretch' }} />
                        <TouchableOpacity onPress={() => this.removePic(index)} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                        <View style={{position:'absolute',height: 130, width: kScreenWidth - 12 * 2-8,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.2)' }}>{this.renderProgressBar()}</View>
                    </View>
                );
            } else if (!instance.isUploading && instance.success) {
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.selectPic(index)} activeOpacity={1} style={{ height: 130, width: kScreenWidth - 12 * 2, marginTop: 17, flexDirection: 'row' }}>
                        <Image source={{ uri: item.uri }} style={{ flex: 1, marginRight: 8, resizeMode: 'stretch' }} />
                        <TouchableOpacity onPress={() => this.removePic(index)} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                );
            } else {
                return (
                    <View style={{ height: 130, width: kScreenWidth - 12 * 2, marginTop: 17, flexDirection: 'row' }}>
                        <Image source={{ uri: item.uri }} style={{ flex: 1, marginRight: 8, resizeMode: 'stretch' }} />
                        <TouchableOpacity onPress={() => this.removePic(index)} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                        <View style={{ position: 'absolute', height: 130, width: kScreenWidth - 12 * 2-8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <TouchableOpacity onPress={() => this.reUpload(index)} style={{borderRadius:12,borderWidth:1,borderColor:'rgb(65,109,255)',paddingHorizontal:10,height:24,alignItems:'center',justifyContent:'center'}}>
                                <Text style={{fontSize:13,color:'rgb(65,109,255)'}}>上传失败，请重新上传</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
        } else {
            return (
                <TouchableOpacity onPress={() => this.selectPic(-1)} activeOpacity={1}>
                    <Image source={YFWImageConst.Icon_add_pic} style={{height:130,width:kScreenWidth-12*2,marginTop:17,resizeMode:'stretch'}}/>
                </TouchableOpacity>
            );
        }
    }

    renderInfo() {
        if(this.props.model.selectIndex == -1 || safeArray(this.props.model.allQualifiyTypeValue).length <= 0){
            return <></>
        }
        let qualifiyType = this.props.model.qualifiyType
        let licenceType = safe(this.props.model.allQualifiyTypeValue[this.props.model.selectIndex])
        let infoItemArray = []
        switch (qualifiyType) {
            case "syzz":
                if(licenceType == '14'){
                    infoItemArray.push(
                        <View style={{flexDirection:'row', justifyContent: 'space-between', alignItems:'center'}}>
                            <Text style={{fontSize: 13, color: "#999999"}}>打开模板下载链接</Text>
                            <TouchableOpacity onPress={()=>{this.copyText(this.props.model.ExampleLink)}}>
                                <Text style={{fontSize: 13, lineHeight: 18, color: "#3972e7"}}>打开链接</Text>
                            </TouchableOpacity>
                        </View>
                    )
                } else {
                    return <></>
                }
                break;
            case "zzzj":
                switch (licenceType) {
                    case '12': //第二类医疗器械经营备案凭证
                        infoItemArray.push(
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                                <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>备案编号</Text>
                                <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                                           placeholderTextColor={'rgb(153,153,153)'}
                                           placeholder="请填写备案编号"
                                           underlineColorAndroid='transparent'
                                           keyboardType='default'
                                           value={this.props.model.licence_code}
                                           onChangeText={(text) => this.textChange(text, 'licence_code')}
                                />
                            </View>
                        )
                        break;
                    case '7': //食品经营许可证
                        infoItemArray.push(
                            <>
                                <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                                    <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>许可证号</Text>
                                    <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                                               placeholderTextColor={'rgb(153,153,153)'}
                                               placeholder="请填写许可证号"
                                               underlineColorAndroid='transparent'
                                               keyboardType='default'
                                               returnKeyType={'next'}
                                               value={this.props.model.licence_code}
                                               onChangeText={(text) => this.textChange(text, 'licence_code')}
                                    />
                                </View>
                                <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                                <TouchableOpacity onPress={()=>this.selectDate('start')} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                                    <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', width: 77 }}>发证日期</Text>
                                    <Text style={{ fontSize: 13, flex: 1, color:this.props.model.start_date==''?'rgb(153,153,153)':'rgb(51,51,51)' }}>{this.props.model.start_date==''?'请输入发证日期':this.props.model.start_date}</Text>
                                    {this.props.model.start_date==''?
                                        <Image source={YFWImageConst.Icon_next_orange} style={{tintColor:'rgb(204,204,204)',width:7,height: 12,marginLeft: 7}}/>
                                        :<></>
                                    }
                                </TouchableOpacity>
                                <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                                <TouchableOpacity onPress={() => this.selectDate('end')} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                                    <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', width: 77 }}>截止时间</Text>
                                    <Text style={{ fontSize: 13, flex: 1, color:this.props.model.end_date==''?'rgb(153,153,153)':'rgb(51,51,51)' }}>{this.props.model.end_date==''?'请输入截止时间':this.props.model.end_date}</Text>
                                    {this.props.model.end_date==''?
                                        <Image source={YFWImageConst.Icon_next_orange} style={{tintColor:'rgb(204,204,204)',width:7,height: 12,marginLeft: 7}}/>
                                        :<></>
                                    }
                                </TouchableOpacity>
                            </>
                        )
                        break;
                    default:
                        return <></>
                }
                break;
            default:
                return <></>
        }
        return (
            <View style={{borderRadius: 7, marginVertical:26,padding:15,backgroundColor: "#ffffff"}}>
                {infoItemArray}
            </View>
        )
    }

    renderBotton() {
        return (
            <View style={{width: kScreenWidth, paddingHorizontal: 12 ,paddingBottom:31}}>
                <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.saveInfo()}>
                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>保存</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        )
    }


    backMethod() {
        this.props.father&&this.props.father.backMethod&&this.props.father.backMethod()
    }

    updateViews() {
        this.setState({})
    }

    selectPic(index) {
        this.props.father&&this.props.father.selectPic&&this.props.father.selectPic(index)
    }
    removePic(index) {
        this.props.father&&this.props.father.removePic&&this.props.father.removePic(index)
    }
    reUpload(index) {
        this.props.father&&this.props.father.reUpload&&this.props.father.reUpload(index)
    }

    chooseQualifiyType(array) {
        this.props.father&&this.props.father.chooseQualifiyType&&this.props.father.chooseQualifiyType(array)
    }

    showPicker(array,confirm,cancel) {
        super.showPicker(array,confirm,cancel)
    }

    saveInfo() {
        this.props.father&&this.props.father.saveInfo&&this.props.father.saveInfo()
    }

    textChange(text,type) {
        this.props.father&&this.props.father.textChange&&this.props.father.textChange(text,type)
    }

    selectDate(type) {
        this.dataPicker1.show(this.props.father.selectDate,type,type==='start'?this.props.model.start_date:this.props.model.end_date)
    }

    copyText(text) {
        this.props.father&&this.props.father.copyText&&this.props.father.copyText(text)
    }

    toCustomerService() {
        this.props.father&&this.props.father.toCustomerService&&this.props.father.toCustomerService()
    }
}

//导入kNavigationHeight、kStatusHeight
const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FAFAFA'},
   backbotton_style: { width: 50, height: kNavigationHeight-kStatusHeight, justifyContent: 'center'},
    backicon_style: { width: 11, height: 19, marginLeft: 12, resizeMode: 'contain', tintColor: 'rgb(51,51,51)' },
    bottom_botton_style: {height:42,borderRadius:21}
});
