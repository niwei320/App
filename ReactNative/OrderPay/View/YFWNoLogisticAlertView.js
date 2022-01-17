import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,SectionList
} from 'react-native';
import YFWPopupWindow from "../../PublicModule/Widge/YFWPopupWindow";
import {kScreenHeight, kScreenWidth, safe, kScreenScaling, safeArray} from "../../PublicModule/Util/YFWPublicFunction";
import {darkTextColor, yfwGreenColor, yfwLineColor} from "../../Utils/YFWColor";
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';

export default class YFWNoLogisticAlertView  extends Component {

    constructor(props) {
        super(props);

        this.state ={
            noLogistcsTip: '温馨提示：商家暂不配送液体、粉剂、膏剂类商品。',
            dataSource: [
                // {key:'y',title:'普通快递不配送以下商品：',data:[
                //     {key:'y',title:'液体类商品：',imageSource:require('../../../img/icon_goods_yeti.png'),data:[
                //         {key:'',title:'· 消爽 金莲花胶囊（胶囊剂）'},
                //         {key:'',title:'· 消爽 金莲花胶囊（胶囊剂）'},
                //     ]},
                // ]},
            ]
        }
    }

    render() {
        return(
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => {}}
                backgroundColor={'white'}
                popupWindowHeight={this.getContainerHeight()}>
                {this._renderTitleView()}
                {this._renderContent()}
                {this._renderBottomButton()}
            </YFWPopupWindow>
        )
    }

    // 标题行
    _renderTitleView() {
        return(
            <View style={{width: kScreenWidth, height: 34, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{width: 44, height: 34}}></View>
                <Text style={{color: darkTextColor(), fontSize: 14, fontWeight: '500'}}>不配送商品</Text>
                <TouchableOpacity onPress={() => {this.disMiss()}} activeOpacity={1} style={{width: 44, height: 34, alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('../../../img/close_button.png')} style={{width: 15, height: 15, resizeMode: 'stretch'}}></Image>
                </TouchableOpacity>
            </View>
        )
    }

    // 内容列表
    _renderContent() {
        return(
            <SectionList
                style={{flex:1,marginBottom:20}}
                extraData={this.state}
                sections = {this.state.dataSource}
                renderItem = {this._renderCell}
                renderSectionHeader = {this._renderSectionHeader}
                stickySectionHeadersEnabled={false}
                >
            </SectionList>
        )
    }

    _renderSectionHeader = (info) =>{
        return (
            <View style={{marginTop:20,marginBottom:0,backgroundColor:'white',width:kScreenWidth,paddingLeft:20,...BaseStyles.leftCenterView}}>
                <Text style={{color:'#333',fontSize:15,fontWeight:'500',}}>{info.section.title}</Text>
            </View>
        )
    }

    _renderCell = (info) => {
        return (
            <View>
                <View style={{marginTop:20,marginBottom:14,backgroundColor:'white',width:kScreenWidth,paddingLeft:20,...BaseStyles.leftCenterView}}>
                    <Image style={{width:20,height:20,resizeMode:'contain'}} source={info.item.imageSource}></Image>
                    <Text style={{color:'#333',fontSize:15,fontWeight:'500',marginLeft:10}}>{info.item.title}</Text>
                </View>
                {info.item.data.map((item,index)=>{
                    return <Text key={index+info.title} style={{color:'#666',fontSize:12,fontWeight:'bold',lineHeight:25,marginLeft:47*kScreenScaling}}>{item.title}</Text>
                })}
            </View>
        )
    }
    // 底部按钮
    _renderBottomButton() {
        return(
            <View style={{ alignItems: 'center',marginBottom:10}}>
                {this.renderTipView()}
                <TouchableOpacity style={{backgroundColor:yfwGreenColor(),height:50,...BaseStyles.centerItem,width:kScreenWidth}}
                    activeOpacity={1} onPress={()=>{this.disMiss();this.props.callBack && this.props.callBack()}}>
                    <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>我知道了</Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderTipView() {
        return (
            <TouchableOpacity style={{...BaseStyles.leftCenterView,height:34,backgroundColor:'rgb(250,248,220)',width:kScreenWidth}} activeOpacity={1} onPress={() => { this._onAdClick() }}>
                <Image style={{width:18,height:18,marginLeft:12,marginRight:8,tintColor:'#feac4c'}} source={require('../../../img/icon_warm.png')}></Image>
                <Text style={{ color:'#feac4c',fontSize:13 }}>{this.state.noLogistcsTip}</Text>
            </TouchableOpacity>
        )
    }

    getContainerHeight() {
        let minHeight = 84 + 34 + 20
        let containerHeight = minHeight
        for (let index = 0; index < this.state.dataSource.length; index++) {
            containerHeight += 60
            let section = this.state.dataSource[index];
            for (let i = 0; i < safeArray(section.data).length; i++) {       
                let element = safeArray(section.data)[i]
                containerHeight += safeArray(element.data).length * 25
            }
        }
        if (containerHeight > kScreenHeight*0.7) {
            containerHeight = kScreenHeight*0.7
        } else if (containerHeight < kScreenHeight*0.5) {
            containerHeight = kScreenHeight*0.5 + minHeight
        }
        return containerHeight
    }


    // 弹出modal
    show(dataSource,noLogistcsTip) {
        dataSource = safeArray(dataSource)
        this.state.dataSource = dataSource
        this.state.noLogistcsTip = noLogistcsTip
        this.setState({dataSource:dataSource,noLogistcsTip:noLogistcsTip})
        this.modalView && this.modalView.show()
    }

    // 消失modal
    disMiss() {
        this.modalView && this.modalView.disMiss()
    }

}
