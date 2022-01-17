import React, { Component } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View, ScrollView, KeyboardAvoidingView
} from 'react-native';
import YFWWDBaseView, { kNav_Linear, kBaseView_Big_Pic } from '../../Base/YFWWDBaseView';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDProbateAdminModel from '../Model/YFWWDProbateAdminModel';
import { YFWWDUploadImageInfoModel } from '../../Widget/Model/YFWWDUploadImageInfoModel';

export default class YFWWDProbateAdminView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = YFWWDProbateAdminModel.initWithModel(this.props.father.model)
    }

    componentWillReceiveProps(props) {
        this.props = props
    }


    render() {
        return (
            <View style={styles.container_style}>
                {super.render([kBaseView_Big_Pic])}
                {this.renderNavigationView(kNav_Linear,'企业认证')}
                {this.renderWarningTipsBar('请按要求完成管理员身份认证')}
                {this.renderContent()}
                {this.renderButton('确认无误并保存', 77, this.toSave)}
            </View>
        )
    }

    renderContent() {
        return (
            <KeyboardAvoidingView behavior='padding' style={{flex:1}}>
                <ScrollView style={{ flex: 1, paddingHorizontal:15, backgroundColor: 'white'}} bounces={false}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 }}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>身份证人像面</Text>
                        <Text onPress={() => this.bigPicView.showView([{url:this.model.idcard_pic_front_example}],0,true)} style={{ fontSize: 12, color: 'rgb(31,219,155)' }}>查看示例</Text>
                    </View>
                    {this.renderImageItem(this.model.idcard_pic_front)}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 }}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>身份证国徽面</Text>
                        <Text onPress={() => this.bigPicView.showView([{url:this.model.idcard_pic_back_example}],0,true)} style={{ fontSize: 12, color: 'rgb(31,219,155)' }}>查看示例</Text>
                    </View>
                    {this.renderImageItem(this.model.idcard_pic_background)}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 ,marginTop:20}}>
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
                            value={this.model.name}
                            onChangeText={(text) => this.textChange(text, 'xm')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>身份证号</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入身份证号"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'done'}
                            maxLength={18}
                            value={this.model.idcard_num}
                            onChangeText={(text) => this.textChange(text, 'sfzh')}
                        />
                    </View>
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
                        <TouchableOpacity onPress={() => this.removePic(instance.name)} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                        <View style={{position:'absolute',height: 130, width: kScreenWidth - 12 * 2-8,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.2)' }}>{this.renderProgressBar()}</View>
                    </View>
                );
            } else if (!instance.isUploading && instance.success) {
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.selectPic(instance.name,true)} activeOpacity={1} style={{height:150,width:kScreenWidth-30 }}>
                        <Image source={{ uri: instance.uri }} style={{ flex: 1, marginRight: 8, resizeMode: 'stretch' }} />
                        <TouchableOpacity onPress={() => this.removePic(instance.name)} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                );
            } else {
                return (
                    <View style={{ height:150,width:kScreenWidth-30}}>
                        <Image source={{ uri: instance.uri }} style={{ flex: 1, marginRight: 8, resizeMode: 'stretch' }} />
                        <TouchableOpacity onPress={() => this.removePic(instance.name)} style={{ position: 'absolute', top: -8, right: 0 }} activeOpacity={1}>
                            <Image style={{ width: 15, height: 15, resizeMode: "cover" }} source={YFWImageConst.Icon_del_pic} />
                        </TouchableOpacity>
                        <View style={{ position: 'absolute', height: 150, width: kScreenWidth - 30 * 2-8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <TouchableOpacity onPress={() => this.reUpload(instance.name)} style={{borderRadius:12,borderWidth:1,borderColor:'rgb(65,109,255)',paddingHorizontal:10,height:24,alignItems:'center',justifyContent:'center'}}>
                                <Text style={{fontSize:13,color:'rgb(65,109,255)'}}>上传失败，请重新上传</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
        } else {
            return (
                <TouchableOpacity onPress={() => this.selectPic(instance.name)} style={{}}>
                    <Image source={instance.name=='front'?YFWImageConst.Icon_add_idcard_front:YFWImageConst.Icon_add_idcard_background} style={{height:(kScreenWidth-30)/2.27,width:kScreenWidth-30,resizeMode:'stretch'}} resizeMethod={'resize'}/>
                </TouchableOpacity>
            );
        }
    }


    updateViews() {
        this.model = this.props.father.model
        this.setState({})
    }

    reUpload(type) {
        this.props.father&&this.props.father.reUpload&&this.props.father.reUpload(type)
    }

    selectPic(type,rechoose) {
        this.props.father&&this.props.father.selectPic&&this.props.father.selectPic(type,rechoose)
    }

    removePic(type) {
        this.props.father&&this.props.father.removePic&&this.props.father.removePic(type)
    }

    textChange(text,type) {
        this.props.father&&this.props.father.textChange&&this.props.father.textChange(text,type)
    }

    toSave = ()=>{
        this.props.father&&this.props.father.toSave&&this.props.father.toSave()
    }

}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: 'white'},
});
