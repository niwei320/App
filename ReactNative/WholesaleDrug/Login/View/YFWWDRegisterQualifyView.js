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
    View,ImageBackground, ScrollView
} from 'react-native';
import YFWWDBaseView, { kNav_Linear } from '../../Base/YFWWDBaseView';
import { YFWImageConst } from '../../Images/YFWImageConst';
import YFWWDRegisterQualifyModel from '../Model/YFWWDRegisterQualifyModel';
import YFWToast from '../../../Utils/YFWToast';
import {YFWWDUploadImageInfoModel} from "../../Widget/Model/YFWWDUploadImageInfoModel";
import {kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
import LinearGradient from "react-native-linear-gradient";

export default class YFWWDRegisterQualifyView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = YFWWDRegisterQualifyModel.initWithModel(this.props.father.model)
    }

    componentWillReceiveProps(props) {
        this.props =  props
    }


    render() {
        return (
            <View style={[styles.container_style,{backgroundColor:'white'}]}>
                {this.renderNavigationView(kNav_Linear,'注册企业会员')}
                {this.renderWarningTipsBar(this.model.licence_info_done && !this.model.dict_account_audit?'所有项目均已完成，请耐心等待系统审核！':'请按要求完成企业实名认证')}
                {this.renderContent()}
                {this.model.licence_info_done?this.renderButton('进入批发市场',77,this.toHome):this._renderCustomerServiceButton()}
            </View>
        )
    }

    renderContent() {
        let itemArray = this.model.dict_store_licence_type_list
        return (
            <ScrollView style={{ flex: 1 ,paddingVertical:13,marginBottom:35}} bounces={false}>
                {itemArray.map((item)=>{return this.renderContentItem(item)})}
                <View style={{ height: 100 }} />
            </ScrollView>
        )
    }

    renderContentItem(item){
        let {title} = item
        let {depict} = item
        let {warning_depict} = item
        let {type} = item
        let {isOK} = item
        return (
            <>
                <TouchableOpacity onPress={() => this.toProbate(type)} activeOpacity={2} style={{paddingHorizontal:12,height:103,backgroundColor:'white',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{flex:1,marginRight:42}}>
                        <Text style={{fontSize:14,color:'rgb(51,51,51)',marginBottom:9}}>{title}</Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:11}}>{depict}</Text>
                        <Text style={{color:'red',fontSize:11,marginTop:9}}>{warning_depict}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: isOK?'rgb(51,51,51)':'rgb(65,109,255)', marginRight: 14 }}>{isOK?'完成':'去认证'}</Text>
                        <Image source={YFWImageConst.Icon_message_next} style={{width:6,height:11}}/>
                    </View>
                </TouchableOpacity>
                <View style={{ height: 1,marginHorizontal:12, backgroundColor: 'rgb(204,204,204)' }} />
            </>
        )
    }

    _renderCustomerServiceButton() {
        return (
            <View style={{height: 77, width: kScreenWidth, paddingHorizontal: 36}}>
                <View style={{height: 42, borderRadius: 21, borderWidth:1,borderColor:'rgb(50,87,234)'}}>
                    <TouchableOpacity
                        style={{flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection:'row'}}
                        activeOpacity={1} onPress={()=> this.toCustomerService()}>
                        <Image style={{width: 20, height: 20, resizeMode: 'contain', marginRight:10, tintColor:'rgb(50,87,234)'}} source={require('../../../../img/bottom_icon_zixun.png')} />
                        <Text style={{fontSize: 17, color: 'rgb(50,87,234)', fontWeight: 'bold', includeFontPadding:false}}>在线咨询</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    updateViews() {
        this.model = this.props.father.model
        this.setState({})
    }

    toProbate(type) {
        this.props.father&&this.props.father.toProbate&&this.props.father.toProbate(type)
    }

    toHome = () => {
        this.props.father&&this.props.father.toHome&&this.props.father.toHome()
    }

    toCustomerService() {
        this.props.father&&this.props.father.toCustomerService&&this.props.father.toCustomerService()
    }
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FAFAFA'},
});
