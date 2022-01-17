import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, ScrollView, TextInput,
} from 'react-native';
import YFWWDBaseView, {
    kBaseView_Big_Pic, kBaseView_DatePicker_Custom,
    kBaseView_DatePicker_Normal,
    kNav_Linear
} from "../../Base/YFWWDBaseView";
import YFWWDProbateQualifyModel from "../Model/YFWWDProbateQualifyModel";
import {YFWWDUploadImageInfoModel} from "../../Widget/Model/YFWWDUploadImageInfoModel";
import {kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
import {YFWImageConst} from "../../Images/YFWImageConst";
import YFWWDProbateTreatmentModel from "../Model/YFWWDProbateTreatmentModel";

export default class YFWWDProbateTreatmentView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = YFWWDProbateQualifyModel.initWithModel(this.props.father.model)

    }

    componentWillReceiveProps(props) {
        this.props =  props
    }


    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Linear,'企业认证')}
                {this.renderWarningTipsBar('请按要求完成医疗机构执业许可证认证')}
                {this.renderContent()}
                {this.renderButton('确认无误并保存', 77, this.toSave)}
                {super.render([kBaseView_Big_Pic,kBaseView_DatePicker_Custom])}
            </View>
        )
    }

    renderContent() {
        return (
            <KeyboardAvoidingView behavior='padding' style={{flex:1}}>
                <ScrollView style={{ flex: 1, paddingHorizontal: 15, backgroundColor: 'white' }} bounces={false}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 }}>
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>{'医疗机构执业许可证'}</Text>
                        <Text onPress={() => this.bigPicView.showView([{url:this.model.image_example_1}],0,true)} style={{ fontSize: 12, color: 'rgb(31,219,155)' }}>查看示例</Text>
                    </View>
                    {this.renderImageItem(this.model.image)}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 ,marginTop:20}}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>医疗机构执业许可证信息</Text>
                    </View>
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>企业名称</Text>
                        <TextInput style={{ fontSize: 13, flex: 1, color: 'rgb(51,51,51)' }}
                                   placeholderTextColor={'rgb(153,153,153)'}
                                   placeholder="请输入企业名称"
                                   underlineColorAndroid='transparent'
                                   keyboardType='default'
                                   returnKeyType={'next'}
                                   value={this.model.shop_title}
                                   onChangeText={(text) => this.textChange(text, 'name')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>登记号</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                                   placeholderTextColor={'rgb(153,153,153)'}
                                   placeholder="请输入登记号"
                                   underlineColorAndroid='transparent'
                                   keyboardType='default'
                                   returnKeyType={'next'}
                                   value={this.model.social_code}
                                   onChangeText={(text) => this.textChange(text, 'social_code')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>法定代表人</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                                   placeholderTextColor={'rgb(153,153,153)'}
                                   placeholder="请输入法定代表人"
                                   underlineColorAndroid='transparent'
                                   keyboardType='default'
                                   returnKeyType={'next'}
                                   value={this.model.legal_person}
                                   onChangeText={(text) => this.textChange(text, 'legal_person')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>主要负责人</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                                   placeholderTextColor={'rgb(153,153,153)'}
                                   placeholder="请输入主要负责人"
                                   underlineColorAndroid='transparent'
                                   keyboardType='default'
                                   returnKeyType={'next'}
                                   value={this.model.charge_person}
                                   onChangeText={(text) => this.textChange(text, 'person')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>诊疗科目</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                                   placeholderTextColor={'rgb(153,153,153)'}
                                   placeholder="请输入诊疗科目"
                                   underlineColorAndroid='transparent'
                                   keyboardType='default'
                                   returnKeyType={'next'}
                                   value={this.model.scope}
                                   onChangeText={(text) => this.textChange(text, 'scope')}
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
                                   returnKeyType={'next'}
                                   value={this.model.register_address}
                                   onChangeText={(text) => this.textChange(text, 'address_r')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <TouchableOpacity onPress={()=>this.selectDate()} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', width: 77 }}>有效期限</Text>
                        <Text style={{ fontSize: 13, flex: 1, color:this.model.start_date==''&&this.model.end_date==''?'rgb(153,153,153)':'rgb(51,51,51)' }}>{this.model.start_date==''&&this.model.end_date==''?'请选择营业期限':this.model.start_date + ' 至 ' + this.model.end_date}</Text>
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
        this.dataPicker2.show(this.props.father.selectDate,undefined,[this.model.start_date,this.model.end_date])
    }

    toSave = ()=>{
        this.props.father&&this.props.father.toSave&&this.props.father.toSave()
    }

    textChange(text,type) {
        this.props.father&&this.props.father.textChange&&this.props.father.textChange(text,type)
    }

    updateViews() {
        this.model = YFWWDProbateTreatmentModel.initWithModel(this.props.father.model)
        this.setState({})
    }
}

const styles = StyleSheet.create({
    container_style: {flex:1,backgroundColor: 'white'},
});
