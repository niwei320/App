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
    View,
} from 'react-native';
import YFWWDBaseView from '../../Base/YFWWDBaseView';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWWDFilterBar extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.state = {
            tabs: [{name:'默认',type:'default',icontype:0,index:0},{name:'价格',type:'price',icontype:2,status:true,index:1},{name:'分类',type:'category',icontype:1,index:2,isOpen:true}], //icontype 0 没有后面的点   1一个点  2两个点(status:true/false 升序/降序)
            selectTab: {name:'默认',type:'default',icontype:0,index:0},
            priceDerection: true,
        }
        this.tableStyle = YFWUserInfoManager.ShareInstance().tableStyle
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={{ width: kScreenWidth, flexDirection: 'row', height: 60, backgroundColor: '#FFFFFF', justifyContent: 'space-around', borderTopLeftRadius: 7, borderTopRightRadius: 7 }}
                onLayout={(event)=>this._onLayout(event)}
            >
                {this.renderTabItem()}
                <TouchableOpacity style={{flex:2,height:60,alignItems:'center',justifyContent:'center'}} onPress = {()=>this.changeListStyle()} activeOpacity={1}>
                    <Image source={this.tableStyle?YFWImageConst.Icon_map:YFWImageConst.Icon_list} style={{height:16,width:16,resizeMode:'stretch'}}/>
                </TouchableOpacity>
            </View>
        )
    }

    renderTabItem() {
        return this.state.tabs.map((item, index)=> {
            let color = this.state.selectTab.index == index ? 'rgb(65,109,255)' : '#999999';
            return (
                <View key={index+'c'} style={{flex:this.state.tabs.length}}>
                    <TouchableOpacity style={{flex:1}} activeOpacity={1}
                                      onPress={()=>{this.onTabItemClick(index)}}>
                        <View style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'center'}}>
                            <Text style={{fontSize:15,color:color,fontWeight:'bold'}}>{item.name}</Text>
                            {this.renderTabIcon(item, index)}
                        </View>
                    </TouchableOpacity>
                </View>
            )
        })
    }

    renderTabIcon(item, index) {
        if (index == this.state.selectTab.index) {
            if (item.icontype == 2) {
                return (<Image source={YFWImageConst.List_order_by_desc}  style={{transform:[{rotate:item.status?'180deg':'0deg'}], resizeMode: 'contain', height: 10, width: 10, marginLeft: 5 }} />)
            } else if (item.icontype == 1) {
                return (<Image source={YFWImageConst.List_drop_down} style={{ transform: [{ rotate: '180deg' }],tintColor:'rgb(65,109,255)',resizeMode: 'contain',height:5,width:5,marginLeft:5}}/>)
            } else { 
                return <View/>
            }
        } else {
            if (item.icontype == 2) {
                return (<Image source={YFWImageConst.List_order_by_default} style={{resizeMode: 'contain',height:10,width:10,marginLeft:5}}/>)
            } else if (item.icontype == 1) {
                return (<Image source={YFWImageConst.List_drop_down} style={{resizeMode: 'contain',height:5,width:5,marginLeft:5}}/>)
            } else { 
                return <View/>
            }
        }
    }

    onTabItemClick(index) { 
        if (this.state.selectTab.icontype == 2&&this.state.selectTab.index == index) {
            this.state.selectTab.status = !this.state.selectTab.status
        } else if (this.state.selectTab.icontype == 1&&this.state.selectTab.index == index) { 
            this.state.selectTab.isOpen = !this.state.selectTab.isOpen
        }else { 
            this.state.selectTab = this.state.tabs[index]
        }
        this.setState({})
        this.props.father&&this.props.father.changeFilterStatus&&this.props.father.changeFilterStatus(this.state.tabs[index])   
    }

    changeListStyle() { 
        YFWUserInfoManager.ShareInstance().tableStyle = !this.tableStyle
        this.tableStyle = !this.tableStyle
        this.props.father&&this.props.father.changeListStyle&&this.props.father.changeListStyle(this.tableStyle)
    }
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: 'white'},
});