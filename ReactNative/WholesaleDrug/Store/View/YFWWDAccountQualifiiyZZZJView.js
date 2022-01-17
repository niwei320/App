import React, { Component } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,ImageBackground, ScrollView
} from 'react-native';
import YFWWDBaseView, { kNav_Linear } from '../../Base/YFWWDBaseView';
import { YFWImageConst } from '../../Images/YFWImageConst';
import YFWWDAccountQualifiiyZZZJModel from '../Model/YFWWDAccountQualifiiyZZZJModel';

export default class YFWWDAccountQualifiiyZZZJView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = YFWWDAccountQualifiiyZZZJModel.initWithModel(this.props.father.model)
    }

    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Linear,'资质证件')}
                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <TouchableOpacity onPress={() => this.toCustomerService()} activeOpacity={1}  style={{ height: 30, justifyContent: 'space-between',flexDirection:'row',alignItems:'center', backgroundColor: 'rgb(255,243,218)',marginHorizontal:-12,paddingHorizontal:12}}>
                        <Text style={{ fontSize: 14, color: 'rgb(252,153,36)' }}>如有疑问请联系在线客服</Text>
                        <Image source={YFWImageConst.Icon_next_orange} style={{width:7,height: 12}}/>
                    </TouchableOpacity>
                    <View style={{ height: 70, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, color: 'rgb(51,51,51)' }}>{'企业名称：'+this.model.shopName}</Text>
                        <Text style={{ fontSize: 14, color: 'rgb(65,109,255)' ,marginTop:10}}>{'资质列表'}</Text>
                    </View>
                    {this.renderContent()}
                </View>
            </View>
        )
    }

    renderContent() {
        let itemArray = this.model.dict_store_licence_type_list
        if(itemArray.length >0){
            return (
                <ScrollView style={{ flex: 1 ,paddingVertical:13,backgroundColor:'white',marginBottom:35}} bounces={false}>
                    {itemArray.map((item)=>{return this.renderContentItem(item)})}
                    <View style={{ height: 100, backgroundColor: '#fffffff' }} />
                </ScrollView>
            )
        }
    }

    renderContentItem(item){
        let {title} = item
        let {depict} = item
        let {type} = item
        let {isOK} = item
        return (
            <>
                <TouchableOpacity onPress={() => isOK?{}:this.toProbate(item)} activeOpacity={2} style={{paddingHorizontal:12,height:103,backgroundColor:'white',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{flex:1,marginRight:42}}>
                        <Text style={{fontSize:14,color:'rgb(51,51,51)',marginBottom:9}}>{title}</Text>
                        <Text style={{color:'rgb(153,153,153)',fontSize:11}}>{depict}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: isOK?'rgb(51,51,51)':'rgb(65,109,255)', marginRight: 14 }}>{isOK?'完成':'去认证'}</Text>
                    </View>
                </TouchableOpacity>
                <View style={{ height: 1,marginHorizontal:12, backgroundColor: 'rgb(204,204,204)' }} />
            </>
        )
    }

    toCustomerService() {
        this.props.father&&this.props.father.toCustomerService&&this.props.father.toCustomerService()
    }

    updateViews() {
        this.model = this.props.father.model
        this.setState({})
    }

    toProbate(item) {
        this.props.father&&this.props.father.toProbate&&this.props.father.toProbate(item)
    }

    toHome = () => {
        this.props.father&&this.props.father.toHome&&this.props.father.toHome()
    }
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FAFAFA'},
});
