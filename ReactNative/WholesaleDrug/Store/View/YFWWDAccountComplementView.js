import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, ScrollView,
} from 'react-native';
import YFWWDBaseView from "../../Base/YFWWDBaseView";
import {
    iphoneBottomMargin,
    kNavigationHeight,
    kScreenWidth,
    kStatusHeight, safeArray
} from "../../../PublicModule/Util/YFWPublicFunction";
import {YFWImageConst} from "../../Images/YFWImageConst";
import YFWNativeManager from "../../../Utils/YFWNativeManager";
import YFWToast from "../../../Utils/YFWToast";
import LinearGradient from "react-native-linear-gradient";
import YFWPopupWindow from "../../../PublicModule/Widge/YFWPopupWindow";
import YFWWDAccountComplementModel from "../Model/YFWWDAccountComplementModel";

export default class YFWWDAccountComplementView extends YFWWDBaseView {
    constructor(props) {
        super(props);
        this.data = this.props.model
        this.isOpen = false
    }

    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView()}
                {this.renderContent()}
                {this.renderButton()}
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
                    <Text style={{ fontSize: 17, color: 'rgb(51,51,51)' }}>开户资质补充</Text>
                </View>
                <TouchableOpacity style={styles.backbotton_style} />
            </View>
        )
    }

    renderContent() {
        return (
            <ScrollView style={{ flex: 1, paddingHorizontal: 12 }}>
                <View style={{ height: 45, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, color: 'rgb(51,51,51)' }}>{this.data.shopName}</Text>
                </View>
                <View>
                    <View style={{ paddingVertical: 14, justifyContent: 'center'}}>
                        <Text style={{ fontSize: 13, color: 'rgb(153,153,153)' }}>{'您的订单内含有食品/器械商品，需要补充相关的资质'}</Text>
                    </View>
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
                </View>
            </ScrollView>
        )

    }

    renderButton() {
        return (
            <View style={{ height: 73, width: kScreenWidth, paddingHorizontal: 12 }}>
                <LinearGradient style={styles.bottom_botton_style} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => {
                        if(safeArray(this.data.electronicInfo.missingList).length === 0){
                            this.backMethod()
                        } else {
                            this.modalView && this.modalView.show()
                        }
                    }}>
                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>{safeArray(this.data.electronicInfo.missingList).length === 0?'完成':'补充资质'}</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        )
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
        this.data = this.props.father.model
        this.setState({})
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
