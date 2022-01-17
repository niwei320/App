import React from 'react'
import {DeviceEventEmitter, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import ModalView from "./ModalView";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {darkNomalColor, darkTextColor, separatorColor, yfwGreenColor} from "../Utils/YFWColor";
import {isEmpty, kScreenHeight, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import {NUMBERS} from "../PublicModule/Util/RuleString";
import YFWToast from "../Utils/YFWToast";
export default class NumAddSubDialog extends React.Component {
    static TAG = 'NumAddSubDialog'
    constructor(props) {
        super(props)
        this.state={
            count:'1',
            maxCount:'10',
            resCount:'1'
        }
    }

    componentDidMount(){
        this.listener = DeviceEventEmitter.addListener((NumAddSubDialog.TAG), ()=> {
            this.dismiss()
        })
    }

    componentWillUnmount(){
        this.listener && this.listener.remove()
    }

    render() {
        return (
            <ModalView ref={(item)=>this.modalView = item} style={{flex:1}}>
                <View style={[BaseStyles.centerItem,{flex:1}]} >
                    <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem,{position:'absolute',width:kScreenWidth,height:kScreenHeight,backgroundColor:'rgba(0,0,0,0.5)'}]} onPress={()=>this.dismiss()}/>
                    <View  style={{marginLeft: 40,marginRight: 40,backgroundColor:'white',borderRadius:4,alignItems: 'center'}}>

                        <Text style={{marginTop:20,fontSize:13,color:darkTextColor()}}>请输入购买的数量</Text>

                        <View style={{marginTop: 20}}>
                            <View style={{
                                width:140,
                                height:40,
                                borderColor:separatorColor(),
                                borderWidth:1,
                                marginRight:10,
                                borderRadius:3,
                                flexDirection: 'row',
                            }}>
                                {this.state.count == 1 || this.state.count == '1'
                                    ? <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem,{width:40}]}>
                                        <Text allowFontScaling={false} style={[styles.btn1, styles.color_disabled1]}>－</Text>
                                    </TouchableOpacity>
                                    : <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem,{width:40}]} onPress={()=>this._subtractionFn()}>
                                        <Text allowFontScaling={false} style={styles.btn1}>－</Text>
                                    </TouchableOpacity>
                                }
                                <TextInput allowFontScaling={false}
                                           ref={'textInput'}
                                           style={[styles.btn1,styles.inputBorder]}
                                           value={String(this.state.count)}
                                           onChangeText={(text)=>{this.onChangeText(text)}}
                                           autoFocus={false}
                                           onBlur={()=>{this.onBlur()}}
                                           underlineColorAndroid="transparent"/>

                                <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem,{width:40}]} onPress={()=>this._plusFn()}>
                                    <Text allowFontScaling={false} style={styles.btn1}>＋</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{flexDirection:'row',height:50,marginTop:10}}>

                            <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this.dismiss()}>
                                <Text style={{fontSize:13,color:darkNomalColor()}}>取消</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem,{flex:1}]}
                                              onPress={()=>{this.onClick()}}>
                                <Text style={{fontSize:13,color:yfwGreenColor()}}>确定</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </ModalView>
        )
    }

    onClick(){
        this.dismiss();
        if(isEmpty(this.state.count)){
            return
        }
        let quantity = Number.parseInt(String(this.state.count));
        if(isNaN(quantity) || !quantity){
            return
        }
        if(this.state.count == this.state.resCount){
            return
        }
        this.props.onSureClick && this.props.onSureClick(this.state.count)
    }

    onBlur(){
        var quantity = Number.parseInt(this.state.count);
        if(isNaN(quantity) || !quantity){
            quantity = this.state.resCount
        }
        this.setState({
            count:quantity
        })
    }

    onChangeText(text){
        var quantity = Number.parseInt(text);
        if(quantity > Number.parseInt(this.state.maxCount)){
            YFWToast('超过库存上限');
            text = this.state.maxCount
        }
        this.setState({
            count:text.replace(NUMBERS,'')
        })
    }

    //Method
    _subtractionFn(){
        var quantity = Number.parseInt(this.state.count)-1;
        if(isNaN(quantity) || !quantity){
            quantity = '1'
        }
        this.setState({
            count:quantity
        })

    }

    _plusFn(){

        var quantity = Number.parseInt(this.state.count)+1;
        if(quantity > Number.parseInt(this.state.maxCount)){
            YFWToast('超过库存上限');
            return;
        }
        this.setState({
            count:quantity
        })

    }

    show(count,maxCount){
        this.setState({
            count:count+'',
            maxCount:maxCount+'',
            resCount:count+''
        })
       this.modalView && this.modalView.show()
    }

    dismiss(){
       this && this.modalView && this.modalView.disMiss()
    }
}

//设置样式
const styles = StyleSheet.create({
    btn1:{
        fontSize:14,
        color:darkTextColor(),
    },
    inputBorder:{
        borderColor:separatorColor(),
        borderLeftWidth:1,
        borderRightWidth:1,
        flex:1,
        textAlign:'center',
        padding:0
    },
});