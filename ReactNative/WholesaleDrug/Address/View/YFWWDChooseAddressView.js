import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, FlatList,
} from 'react-native';
import {
    isEmpty, isIphoneX,
    isNotEmpty,
    itemAddKey, kScreenHeight,
    kScreenWidth
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWPopupWindow from "../../../PublicModule/Widge/YFWPopupWindow";
import YFWTouchableOpacity from "../../../widget/YFWTouchableOpacity";
import {YFWImageConst} from "../../Images/YFWImageConst";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import LinearGradient from "react-native-linear-gradient";

export default class YFWWDChooseAddressView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            selectItem:'',
            callback:()=>{}
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------
    show(data,selectItem,callback){
        if(isEmpty(data)){
            return
        }
        this.setState({
            data : itemAddKey(data),
            selectItem : isNotEmpty(selectItem)?selectItem:data[0],
            callback:callback
        })
        this.modalView.show()
    }

    closeView(){
        this.modalView.disMiss()
    }

    _confirm(){
        this.state.callback && this.state.callback(this.state.selectItem)
        this.modalView.disMiss()
    }

    onItemClick(item){
        this.setState({
            selectItem:item
        })
    }

//-----------------------------------------------RENDER---------------------------------------------

    _renderItem(item,index){
        let isSelect = (item.item === this.state.selectItem)
        let itemText = item.item
        return (
            <TouchableOpacity activeOpacity={1}
                              onPress={()=>{this.onItemClick(item.item)}}
                              style={{minHeight:50,width:kScreenWidth -50,marginLeft:30,marginRight: 20, flexDirection: 'row',alignItems:'center'}}>
                {isSelect?
                    <Image source={YFWImageConst.Icon_select_blue} resizeMode='contain' style={{ width: 25, height: 25 }} />
                    :
                    <View style={[BaseStyles.centerItem,{padding: 2}]}>
                        <Image source={YFWImageConst.Icon_unChooseBtn} resizeMode='contain' style={{ width: 21, height: 21,}} />
                    </View>
                }
                <Text style={{marginLeft:10,width: kScreenWidth - 80, fontSize: 14, color: isSelect?"#333333":"#999999"}} numberOfLines={2} >{itemText}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        let title = '请选择收货地址'
        let data = this.state.data
        return (
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                popupWindowHeight={kScreenHeight*0.6}
            >
                <View style={{flex: 1}}>
                    <View style={{ height: 50, width: kScreenWidth }}>
                        <View style={{ flexDirection: 'row', height: 45, width: kScreenWidth, justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{flex:1, color:"#000", fontSize:14, marginLeft: 18 , fontWeight: '500'}}>{title}</Text>
                            <TouchableOpacity onPress={() => this.closeView()}>
                                <Image style={{ width: 13, height: 13, marginRight: 18 }} source={YFWImageConst.Icon_close} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{height:kScreenHeight*0.6 - 50 - 110}}>
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => index+'address'}
                            ItemSeparatorComponent={()=>( <View style={{width:kScreenWidth-75, height: 1, marginLeft: 22,opacity: 0.1, backgroundColor: "#cccccc"}}/> )}
                            renderItem = {this._renderItem.bind(this)} />
                        <Text style={{paddingHorizontal:25, fontSize: 12, color: "#999999",marginVertical:10}}>
                            {'说明：收货地址仅支持企业资质中载明的注册地址、经营地址、仓库地址等，若您的证件地址未录入，请联系客服处理。'}
                        </Text>
                    </View>

                    <TouchableOpacity  style={{kScreenWidth:kScreenWidth-26, paddingHorizontal:13, height: 42,borderRadius: 21, marginBottom:isIphoneX()? 60 : 40}} onPress={() => this._confirm()}>
                        <LinearGradient
                            style={{flex:1,alignItems:'center',borderRadius: 21,justifyContent:'center',elevation:2}}
                            colors={['#416dff','#5242ff']}
                            start={{x: 0, y: 1}}
                            end={{x: 1, y: 0}}
                            locations={[0,1]}>
                            <Text style={{fontSize:17,color:'white',fontWeight:'bold'}}>{'确定'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </YFWPopupWindow>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});