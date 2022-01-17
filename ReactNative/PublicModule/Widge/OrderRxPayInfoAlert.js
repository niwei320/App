import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity
} from 'react-native'
import ModalView from '../../widget/ModalView';
import { kScreenWidth, adaptSize, safe } from '../Util/YFWPublicFunction';


export default class OrderRxPayInfoAlert extends Component {

    constructor(props) {
        super(props)

    }

    componentDidMount(){

    }

    showView() {
        this.modalView && this.modalView.show()
    }

    closeView(){
        this.modalView && this.modalView.disMiss()
    }

    onclick(){
        this.closeView()
    }

    //to-do
    toPay(){

    }


    _renderAlertView() {
        return(
            <View style={[{alignItems:'center',justifyContent:'center',flex:1,backgroundColor: 'rgba(0, 0, 0, 0.4)'}]}>
                <View style={{width:kScreenWidth-adaptSize(35*2),justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:'#fff'}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.closeView()}} style={{top:10,right:11,position:'absolute',paddingLeft:20,paddingBottom:20}}>
                        <Image source={require('../../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                    </TouchableOpacity>
                    <Text style={{fontSize:20,color:'rgb(51,51,51)',marginTop:adaptSize(28)}}>提示</Text>
                    <Text style={{fontSize:14,color:'rgb(51,51,51)',marginTop:adaptSize(30)}}>您的订单包含互联网医院问诊开方服务，</Text>
                    <Text style={{fontSize:14,color:'rgb(51,51,51)',marginTop:adaptSize(2)}}>请先支付问诊服务费</Text>
                    <View style={{flexDirection:'row',marginTop:adaptSize(48),marginBottom:adaptSize(26)}}>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.onclick()}} style={{alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                            borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)'}}>
                            <Text style={{color:'rgb(31,219,155)',fontSize:15,fontWeight:'500'}}>取消</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.toPay()}} style={{marginLeft:adaptSize(30),alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                            borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)',backgroundColor:'rgb(31,219,155)'}}>
                            <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>立即支付</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        )
    }

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this._renderAlertView()}
            </ModalView>
        )
    }



}
