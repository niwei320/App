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
    View,ImageBackground
} from 'react-native';
import YFWWDBaseView, { kNav_Linear, kNav_Defalut } from '../../Base/YFWWDBaseView';
import {
    kNavigationHeight,
    kStatusHeight,
    kScreenWidth,
    safeArray, iphoneBottomMargin
} from '../../../PublicModule/Util/YFWPublicFunction';
import { YFWImageConst } from '../../Images/YFWImageConst';
import LinearGradient from 'react-native-linear-gradient';
import YFWToast from '../../../Utils/YFWToast';
import YFWWDQualificationListView from '../../Widget/View/YFWWDListView';
import YFWPopupWindow from "../../../PublicModule/Widge/YFWPopupWindow";

export default class YFWWDAccountQualifiiyView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = this.props.model
    }

    componentWillReceiveProps(props) {
        this.props =  props
    }


    render() {
        return (
            <View style={styles.container_style}>
                {this.model.father == 'usercenter'?this.renderNavigationView(kNav_Linear,'开户资质'):this.renderNavigationView(kNav_Defalut,'开户资质')}
                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <TouchableOpacity onPress={() => this.toCustomerService()} activeOpacity={1}  style={{ height: 30, justifyContent: 'space-between',flexDirection:'row',alignItems:'center', backgroundColor: 'rgb(255,243,218)',marginHorizontal:-12,paddingHorizontal:12}}>
                        <Text style={{ fontSize: 14, color: 'rgb(252,153,36)' }}>如有疑问请联系在线客服</Text>
                        <Image source={YFWImageConst.Icon_next_orange} style={{width:7,height: 12}}/>
                    </TouchableOpacity>
                    <View style={{ height: 70, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, color: 'rgb(51,51,51)' }}>{'企业名称：'+this.model.shopName}</Text>
                        <Text style={{ fontSize: 14, color: 'rgb(65,109,255)' ,marginTop:10}}>{'资质列表'}</Text>
                    </View>
                    <YFWWDQualificationListView father={this} model={this.props.model.listInfo} navigation={this.props.navigation} listType={'list'}/>
                </View>
                {this.renderBotton()}
                {this.renderModal()}
                {this.renderTipsView()}
            </View>
        )
    }


    renderBotton() {
        return (
            <View style={{width: kScreenWidth, paddingHorizontal: 12 ,paddingBottom:31,shadowOffset:{width: 0,height:5},shadowColor:'black',shadowOpacity:0.2,elevation:10}}>
                <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => {this.modalView&& this.modalView.show()}}>
                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>+ 添加开户资料</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        )
    }

    renderModal() {
        let array = [{name:'资质证件',qualifiyType:'zzzj'},{name:'首营资质',qualifiyType:'syzz'}]
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
                                <TouchableOpacity onPress={()=>{this.modalView && this.modalView.disMiss();this.toAddInfo(item)}} style={{width:kScreenWidth,height:57,alignItems:'center',justifyContent: 'center'}}>
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
        this.setState({})
    }

    toAddInfo(item) {
        this.props.father&&this.props.father.toAddInfo&&this.props.father.toAddInfo(item)
    }

    subMethods(key,item) {
        this.props.father&&this.props.father.subMethods&&this.props.father.subMethods(key,item)
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
