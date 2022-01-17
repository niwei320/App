import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, DeviceEventEmitter,
} from 'react-native';
import ModalView from "../../../widget/ModalView";
import {
    adaptSize,
    isEmpty,
    isNotEmpty,
    kScreenWidth
} from "../../../PublicModule/Util/YFWPublicFunction";
import LinearGradient from "react-native-linear-gradient";
import {YFWImageConst} from "../../Images/YFWImageConst";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWToast from "../../../Utils/YFWToast";

export default class YFWImproveCorporateInformationDialog extends Component {


    constructor(props) {
        super(props);
        this.state = {
            button_item:[
                {
                    title: '我是连锁总店',
                    icon:YFWImageConst.Icon_chain_store,
                    dict_shop_type: 1
                },
                {
                    title: '我是连锁分店',
                    icon:YFWImageConst.Icon_single_store,
                    dict_shop_type: 2
                }
            ],
            select_item:undefined,
        }

    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        this.loginListener = DeviceEventEmitter.addListener('WDChainShopTypeNeedSet',()=>{
            this.showView()
        })
    }

    componentWillUnmount() {
        this.loginListener && this.loginListener.remove()
    }

//-----------------------------------------------METHOD---------------------------------------------

    showView() {
        this.setState({})
        this.modalView && this.modalView.show()
    }

    closeView(){
        this.state.select_item = undefined
        this.modalView && this.modalView.disMiss()
    }

    onClick(item){
        this.setState({select_item:item})
    }

    confirm(){
        let {select_item} = this.state
        if(isNotEmpty(select_item)){
            let paramMap = new Map();
            paramMap.set('__cmd', 'store.whole.app.set_shop_type');
            paramMap.set('dict_shop_type', select_item.dict_shop_type);
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res)=> {
                this.closeView()
            },(error)=>{
            },true);
        }
    }

//-----------------------------------------------RENDER---------------------------------------------

    renderButton(){
        let {button_item} = this.state
        let buttonView = []
        button_item.map((item)=>{
            let {title, icon} = item
            let {select_item} = this.state
            let isSelect = select_item === item
            buttonView.push(
                <TouchableOpacity
                    style={[isSelect?style.button_on:style.button_off,{marginBottom:9}]}
                    onPress={()=>this.onClick(item)}
                >
                    <View style={[style.options_circle,{borderWidth:isSelect?0:1}]}>
                        {isSelect?<Image style={{width:adaptSize(17),height:adaptSize(11),resizeMode: 'contain'}} source={YFWImageConst.Icon_blue_nike}/>:<></>}
                    </View>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'center'}}>
                        <Image style={{width:adaptSize(19),height:adaptSize(19),resizeMode: 'contain', tintColor:isSelect?"#ffffff":"#333333"}} source={icon}/>
                        <Text style={{marginHorizontal:adaptSize(8),fontSize: 16, color: isSelect?"#ffffff":"#333333"}}>{title}</Text>
                    </View>
                </TouchableOpacity>
            )
        })
        return buttonView
    }

    render() {
        let {select_item} = this.state
        let button_confirm_color = isNotEmpty(select_item)?['rgb(84,124,255)', 'rgb(23,107,255)']:['rgb(204,204,204)','rgb(210,210,210)']
        return (
            <ModalView
                ref={(c) => this.modalView = c}
                onRequestClose={()=>{}}
                animationType="fade"
            >
                <View style={style.modal}>
                    <View style={style.view}>
                        <Text style={[style.title,{marginBottom:adaptSize(14)}]}>请完善您的企业信息</Text>
                        {this.renderButton()}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => this.confirm()}
                        >
                            <LinearGradient
                                style={style.button_confirm}
                                colors={button_confirm_color}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                locations={[0, 1]}
                            >
                                    <Text style={{ fontSize: 15, color: 'white',}}>确认</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalView>
        )
    }

}

const style = StyleSheet.create({
    modal: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    view: {
        paddingTop:adaptSize(32),
        paddingBottom:adaptSize(17),
        width: adaptSize(278),
        height: adaptSize(328),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: adaptSize(15),
        backgroundColor: "#ffffff",
        shadowColor: "rgba(51, 51, 51, 0.1)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation:2,
    },
    button_on: {
        width: adaptSize(240),
        height: adaptSize(94),
        borderRadius: adaptSize(7),
        backgroundColor: "#547cff",
        borderWidth: 1,
        borderColor: "#547cff",
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:adaptSize(18),
    },
    button_off: {
        width: adaptSize(240),
        height: adaptSize(94),
        borderRadius: adaptSize(7),
        backgroundColor: "#ffffff",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:adaptSize(18),
    },
    title: {

        fontSize: 20,
        color: "#333333",
        fontWeight:'bold',
    },
    button_confirm: {
        marginTop:adaptSize(7),
        width: adaptSize(122),
        height: adaptSize(35),
        borderRadius: adaptSize(17),
        justifyContent:'center',
        alignItems:'center'
    },
    options_circle:{
        borderRadius: adaptSize(27),
        width: adaptSize(27),
        height: adaptSize(27),
        backgroundColor: "#ffffff",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        justifyContent:'center',
        alignItems:'center'
    }
});
