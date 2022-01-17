import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, FlatList,
} from 'react-native';
import YFWPopupWindow from "../../../../PublicModule/Widge/YFWPopupWindow";
import {
    isEmpty, isIphoneX,
    isNotEmpty, itemAddKey,
    kScreenHeight,
    kScreenWidth
} from "../../../../PublicModule/Util/YFWPublicFunction";
import YFWTouchableOpacity from "../../../../widget/YFWTouchableOpacity";
import { o2oBlueColor } from '../../../../Utils/YFWColor';

export default class OrderTypeChooseView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            title: '',
            selectItem:{},
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
    show(title,data,selectItem,callback){
        if(isEmpty(data)){
            return
        }
        this.setState({
            data : itemAddKey(data),
            title :title,
            selectItem : isNotEmpty(selectItem)?selectItem:data.data[0],
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
        let isSelect = (item.item.text === this.state.selectItem.text)
        let itemText = item.item.text
        const otoOrder = Boolean(this.props.otoOrder)
        const actionIcon = otoOrder ? require('../../../../O2O/Image/choosed.png') : require('../../../../../img/chooseBtn.png')
        return (
            <TouchableOpacity key={index}
                              onPress={()=>{this.onItemClick(item.item)}}
                              style={{minHeight:50,width:kScreenWidth -50,marginLeft:30,marginRight: 20, flexDirection: 'row',alignItems:'center'}}>
                <Text style={{fontSize: 14, color: isSelect?"#333333":"#999999"}}>{itemText}</Text>
                <View style={{flex:1}}/>
                {isSelect?
                    <Image source={actionIcon} resizeMode='contain' style={{ width: 25, height: 25 }} />
                    :
                    <View style={{width:25}}/>
                }
            </TouchableOpacity>
        )
    }

    render() {
        let title = this.state.title
        let data = this.state.data
        const otoOrder = Boolean(this.props.otoOrder)
        return (
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                popupWindowHeight={kScreenHeight*0.6}
            >
                <View style={{flex: 1}}>
                    <View style={{ height: 50, width: kScreenWidth }}>
                        <View style={{ flexDirection: 'row', height: 45, width: kScreenWidth, justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ height: 15, width: 15, marginLeft: 18 }} />
                            <Text style={{color:"#000", fontSize:14, fontWeight: '500'}}>{title}</Text>
                            <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:0}} onPress={() => this.closeView()}>
                                <Image style={{ width: 13, height: 13, marginRight: 18 }} source={require('../../../../../img/close_button.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{height:kScreenHeight*0.6 - 50 - (isIphoneX()?110:85)}}>
                        <FlatList
                            data={data}
                            ItemSeparatorComponent={()=>( <View style={{width:kScreenWidth-75, height: 1, marginLeft: 22,opacity: 0.1, backgroundColor: "#cccccc"}}/> )}
                            renderItem = {this._renderItem.bind(this)} />
                    </View>
                    <View style={{ width: kScreenWidth - 13 * 2, marginLeft: 13, position: 'absolute', bottom: isIphoneX()?45:20}}>
                        <YFWTouchableOpacity style_title={{ height: 44, width: kScreenWidth - 13 * 2, fontSize: 17 }}
                                             title={'确定'}
                                             callBack={() => { this._confirm() }}
                                             isEnableTouch={true} 
                                             enableColors={otoOrder ? [o2oBlueColor(),o2oBlueColor()] : null}
                                            enableShaowColor={otoOrder ? 'rgba(87, 153, 247, 0.5)' : null}
                                            />

                    </View>
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