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
import YFWWDBaseView, { kNav_Linear, kBaseView_Big_Pic, kBaseView_DatePicker_Normal } from '../../Base/YFWWDBaseView';
import { YFWWDUploadImageInfoModel } from '../../Widget/Model/YFWWDUploadImageInfoModel';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDProbateQualifyModel from '../Model/YFWWDProbateQualifyModel';

export default class YFWWDProbateQualifyView extends YFWWDBaseView {

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
                {this.renderWarningTipsBar('请按要求完成药品经营许可认证')}
                {this.renderContent()}
                {this.renderButton('确认无误并保存', 77, this.toSave)}
                {super.renderTipsView()}
                {super.render([kBaseView_Big_Pic,kBaseView_DatePicker_Normal])}
            </View>
        )
    }

    renderContent() {
        return (
            <KeyboardAvoidingView behavior='padding' style={{flex:1}}>
                <ScrollView style={{ flex: 1, paddingHorizontal: 15, backgroundColor: 'white' }} bounces={false}>
                    <View style={{ height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',paddingHorizontal:40 }}>
                        <TouchableOpacity onPress={()=>this.changeType('one')} activeOpacity={1} style={{alignItems:'center'}}>
                            <Text style={{fontSize:14,fontWeight:'bold',color:this.model.storeType == 'one'?'rgb(65,109,255)':'rgb(51,51,51)'}}>药品经营许可证</Text>
                            <View style={{width:32,height:5,backgroundColor:this.model.storeType == 'one'?'rgb(65,109,255)':'white',marginTop:10}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.changeType('more')} activeOpacity={1} style={{alignItems:'center'}}>
                            <Text style={{fontSize:14,fontWeight:'bold',color:this.model.storeType == 'more'?'rgb(65,109,255)':'rgb(51,51,51)'}}>多证合一许可证</Text>
                            <View style={{width:32,height:5,backgroundColor:this.model.storeType == 'more'?'rgb(65,109,255)':'white',marginTop:10}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 }}>
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>{this.model.storeType == 'one'?'药品经营许可证':'多证合一许可证'}</Text>
                        <Text onPress={() => this.bigPicView.showView([{url:this.model.storeType == 'one'?this.model.image_example_1:this.model.image_example_2}],0,true)} style={{ fontSize: 12, color: 'rgb(31,219,155)' }}>查看示例</Text>
                    </View>
                    {this.renderImageItem(this.model.image)}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 ,marginTop:20}}>
                        <Text style={{fontSize:15,color:'black',fontWeight:'bold'}}>药品经营许可证信息</Text>
                    </View>
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>企业名称</Text>
                        <TextInput
                            style={{ fontSize: 13, flex: 1, color: 'rgb(51,51,51)' }}
                            editable={false}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入完整的企业名称"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.shop_title}
                            onChangeText={(text) => this.textChange(text, 'name')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>许可证号</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入许可证号"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.licence_code}
                            onChangeText={(text) => this.textChange(text, 'licence')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>企业负责人</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入企业负责人"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.charge_person}
                            onChangeText={(text) => this.textChange(text, 'person')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>质量负责人</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入质量负责人"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.quality_leader}
                            onChangeText={(text) => this.textChange(text, 'leader')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <TouchableOpacity onPress={()=>this.selectDate('start')} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', width: 77 }}>发证日期</Text>
                        <Text style={{ fontSize: 13, flex: 1, color:this.model.start_date==''?'rgb(153,153,153)':'rgb(51,51,51)' }}>{this.model.start_date==''?'请输入发证日期':this.model.start_date}</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <TouchableOpacity onPress={() => this.selectDate('end')} activeOpacity={1} style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', width: 77 }}>截止时间</Text>
                        <Text style={{ fontSize: 13, flex: 1, color:this.model.end_date==''?'rgb(153,153,153)':'rgb(51,51,51)' }}>{this.model.end_date==''?'请输入截止时间':this.model.end_date}</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>发证单位</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入发证单位"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.license_issuer}
                            onChangeText={(text) => this.textChange(text, 'issuer')}
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
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>经营地址</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入经营地址"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.operate_address}
                            onChangeText={(text) => this.textChange(text, 'address_o')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)' }} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>仓库地址</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入仓库地址"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'next'}
                            value={this.model.warehouse_address}
                            onChangeText={(text) => this.textChange(text, 'address_w')}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgb(204,204,204)'}} />
                    <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)',width:77}}>经营范围</Text>
                        <TextInput style={{fontSize:13,flex:1,color:'rgb(51,51,51)'}}
                            placeholderTextColor={'rgb(153,153,153)'}
                            placeholder="请输入经营范围"
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            returnKeyType={'done'}
                            value={this.model.scope}
                            onChangeText={(text) => this.textChange(text, 'scope')}
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

    selectDate(type) {
        this.dataPicker1.show(this.props.father.selectDate,type,type==='start'?this.model.start_date:this.model.end_date)
    }

    toSave = ()=>{
        this.props.father&&this.props.father.toSave&&this.props.father.toSave()
    }

    textChange(text,type) {
        this.props.father&&this.props.father.textChange&&this.props.father.textChange(text,type)
    }

    updateViews() {
        this.model = YFWWDProbateQualifyModel.initWithModel(this.props.father.model)
        this.setState({})
    }
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: 'white'},
});
