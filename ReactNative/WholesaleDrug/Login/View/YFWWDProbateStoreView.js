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
    View,ScrollView, KeyboardAvoidingView
} from 'react-native';
import YFWWDBaseView, { kNav_Linear, kBaseView_Big_Pic, kBaseView_DatePicker_Custom } from '../../Base/YFWWDBaseView';
import YFWWDProbateStoreModel from '../Model/YFWWDProbateStoreModel';
import { YFWWDUploadImageInfoModel } from '../../Widget/Model/YFWWDUploadImageInfoModel';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWWDProbateStoreView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = YFWWDProbateStoreModel.initWithModel(this.props.father.model)

    }

    componentWillReceiveProps(props) {
        this.props =  props
    }


    render() {
        let warningType
        switch (this.model.pageType) {
            case 'store':
                warningType = '营业执照'
                break;
            case 'privateUnit':
                warningType = '民办非企业单位登记证书'
                break;
            case 'institution':
                warningType = '事业单位法人证书'
                break;
        }
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Linear,'企业认证')}
                {this.renderWarningTipsBar('请按要求完成' + warningType + '认证')}
                {this.renderContent()}
                {this.renderButton('确认无误并保存', 77, this.toSave)}
                {super.renderTipsView()}
                {super.render([kBaseView_Big_Pic,kBaseView_DatePicker_Custom])}
            </View>
        )
    }

    renderContent() {
        let picTitle,msgTitle,picSrc
        switch (this.model.pageType) {
            case 'store':
                picTitle = '营业执照'
                msgTitle = '营业执照信息'
                picSrc = this.model.storeType === 'horizontal'?this.model.image_example_h:this.model.image_example_v
                break;
            case 'privateUnit':
                picTitle = '民办非企业单位登记证书'
                msgTitle = '民办非企业单位登记证书信息'
                picSrc = this.model.image_example_p
                break;
            case 'institution':
                picTitle = '事业单位法人证书'
                msgTitle = '事业单位法人证书信息'
                picSrc = this.model.image_example_i
                break;
        }
        return (
            <KeyboardAvoidingView behavior='padding' style={{flex:1}}>
                <ScrollView style={{ flex: 1, paddingHorizontal: 15, backgroundColor: 'white' }} bounces={false}>
                    {this.model.pageType == 'store'?
                        <View style={{ height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',paddingHorizontal:40 }}>
                            <TouchableOpacity onPress={()=>this.changeType('horizontal')} activeOpacity={1} style={{alignItems:'center'}}>
                                <Text style={{fontSize:14,fontWeight:'bold',color:this.model.storeType == 'horizontal'?'rgb(65,109,255)':'rgb(51,51,51)'}}>横版营业执照</Text>
                                <View style={{width:32,height:5,backgroundColor:this.model.storeType == 'horizontal'?'rgb(65,109,255)':'white',marginTop:10}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.changeType('vertical')} activeOpacity={1} style={{alignItems:'center'}}>
                                <Text style={{fontSize:14,fontWeight:'bold',color:this.model.storeType == 'vertical'?'rgb(65,109,255)':'rgb(51,51,51)'}}>竖版营业执照</Text>
                                <View style={{width:32,height:5,backgroundColor:this.model.storeType == 'vertical'?'rgb(65,109,255)':'white',marginTop:10}}/>
                            </TouchableOpacity>
                        </View>:null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 }}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>{picTitle}</Text>
                        <Text onPress={() => this.bigPicView.showView([{url:picSrc}],0,true)} style={{ fontSize: 12, color: 'rgb(31,219,155)' }}>查看示例</Text>
                    </View>
                    {this.renderImageItem(this.model.image)}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 ,marginTop:20}}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>{msgTitle}</Text>
                    </View>
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>企业名称</Text>
                        <TextInput
                            style={{ fontSize: 13, flex: 1, color: 'rgb(51,51,51)' }}
                            editable={false}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入企业名称"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.storeName}
                            onChangeText={(text) => this.textChange(text, 'name')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>注册地址</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入注册地址"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'done'}
                            value={this.model.storeAddress}
                            onChangeText={(text) => this.textChange(text, 'address')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <TouchableOpacity onPress={()=>this.selectDate()} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', width: 77 }}>营业期限</Text>
                        <Text style={{ fontSize: 13, flex: 1, color:this.model.storeStart==''&&this.model.storeEnd==''?'rgb(153,153,153)':'rgb(51,51,51)' }}>{this.model.storeStart==''&&this.model.storeEnd==''?'请选择营业期限':this.model.storeStart + ' 至 ' + this.model.storeEnd}</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' ,marginBottom:35}} />
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    renderImageItem(item) {
        let instance = YFWWDUploadImageInfoModel.initWithModel(item)
        if (instance.type != 'default') {
            if (instance.isUploading && !instance.success) {
                return (
                    <View style={{ height:150,width:kScreenWidth-30}}>
                        <Image source={{ uri: instance.uri }} style={{ flex: 1, marginRight: 8, resizeMode: 'stretch' }} />
                        <TouchableOpacity onPress={() => this.removePic()} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                        <View style={{position:'absolute',height: 130, width: kScreenWidth - 12 * 2-8,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.2)' }}>{this.renderProgressBar()}</View>
                    </View>
                );
            } else if (!instance.isUploading && instance.success) {
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.selectPic(true)} activeOpacity={1} style={{height:150,width:kScreenWidth-30 }}>
                        <Image source={{ uri: instance.uri }} style={{ flex: 1, marginRight: 8, resizeMode: 'stretch' }} />
                        <TouchableOpacity onPress={() => this.removePic()} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                );
            } else {
                return (
                    <View style={{ height:150,width:kScreenWidth-30}}>
                        <Image source={{ uri: instance.uri }} style={{ flex: 1, marginRight: 8, resizeMode: 'stretch' }} />
                        <TouchableOpacity onPress={() => this.removePic()} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                        <View style={{ position: 'absolute', height: 150, width: kScreenWidth - 30 * 2-8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <TouchableOpacity onPress={() => this.reUpload()} style={{borderRadius:12,borderWidth:1,borderColor:'rgb(65,109,255)',paddingHorizontal:10,height:24,alignItems:'center',justifyContent:'center'}}>
                                <Text style={{fontSize:13,color:'rgb(65,109,255)'}}>上传失败，请重新上传</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
        } else {
            return (
                <TouchableOpacity onPress={() => this.selectPic()} style={{}}>
                    <Image source={YFWImageConst.Icon_add_pic_probate} style={{height:(kScreenWidth-30)/2.27,width:kScreenWidth-30,resizeMode:'stretch',}} resizeMethod={'resize'}/>
                </TouchableOpacity>
            );
        }
    }

    changeType(type) {
        this.props.father&&this.props.father.changeType&&this.props.father.changeType(type)
    }

    reUpload() {
        this.props.father&&this.props.father.reUpload&&this.props.father.reUpload()
    }

    selectPic(rechoose) {
        this.props.father&&this.props.father.selectPic&&this.props.father.selectPic(rechoose)
    }

    removePic() {
        this.props.father&&this.props.father.removePic&&this.props.father.removePic()
    }

    selectDate() {
        this.dataPicker2.show(this.props.father.selectDate,undefined,[this.model.storeStart,this.model.storeEnd])
    }

    toSave = ()=>{
        this.props.father&&this.props.father.toSave&&this.props.father.toSave()
    }

    textChange(text,type) {
        this.props.father&&this.props.father.textChange&&this.props.father.textChange(text,type)
    }

    updateViews() {
        this.model = YFWWDProbateStoreModel.initWithModel(this.props.father.model)
        this.setState({})
    }
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: 'white'},
});
