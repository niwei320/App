import React, {Component} from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    separatorColor,
    darkTextColor
} from '../../Utils/YFWColor'
import ModalView from "../../widget/ModalView";
import {isEmpty, safeObj, kScreenHeight,kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";


export default class YFWAlertRuleView extends Component {

    static defaultProps = {
        data:undefined,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            dataItems:[]
        };
    }


    render() {
        var sub_items = [];
        if (this.state.dataItems && this.state.dataItems.length > 0) {
            sub_items = this.state.dataItems
        }
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="slide" onRequestClose={()=>{
                this.props.onRequestClose && this.props.onRequestClose()
                this.dismiss()
            }} >
                <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>this.dismiss()}/>
                <View style={{backgroundColor:'white',height:sub_items.length*37+58+kScreenHeight*0.3,borderTopLeftRadius: 7,borderTopRightRadius: 7}}>
                    <View style = {{height: 48,justifyContent:'center',alignItems:'center'}}>
                        <Text style = {{color: '#333', fontSize: 14,fontWeight:'normal',lineHeight: 20}}>服务说明</Text>
                        <TouchableOpacity activeOpacity = {1} style = {{width: 15, height: 15,position:'absolute', right: 12,top:13}} hitSlop={{top:20,left:20,bottom:20,right:20}} onPress = {() => this.dismiss()}>
                            <Image style = {{width: 15, height: 15}} source = {require('../../../img/icon_delect.png')} />
                        </TouchableOpacity>
                    </View>
                    {sub_items.map((item,index)=>{
                        return (
                            <View style={{marginHorizontal:30,marginVertical:17}}>
                                <View key={index+''} style={{flexDirection:'row',alignItems:'center'}}>
                                    <Image style={{width:16,height:16}} source={item.icon}></Image>
                                    <Text style={{color:darkTextColor(),fontSize:12,marginLeft:8,fontWeight:'normal'}}>{item.name}</Text>
                                </View>
                                {item.desc&&<Text style={{color:'#999',lineHeight:16,fontSize:12,marginTop:9,fontWeight:'normal'}}>{item.desc}</Text>}
                            </View>
                        )
                    })}
                    <View style={{height:10}}/>
                </View>
            </ModalView>
        );
    }

    show(dataItems){
        this.setState({
            dataItems: dataItems
        })
        this.modalView && this.modalView.show()
    }

    //关闭弹框
    dismiss(){
        this.modalView && this.modalView.disMiss()
        this.props.dismiss && this.props.dismiss()
    }

}