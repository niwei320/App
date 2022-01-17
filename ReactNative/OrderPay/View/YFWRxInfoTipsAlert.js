import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity
} from 'react-native'
import ModalView from '../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction';


export default class YFWRxInfoTipsAlert extends Component {

    constructor(props) {
        super(props)
        this.contentInfo = this.props.contentInfo;
        this.confirmText = this.props.confirmText;
        this.showTitle = true
    }

    static defaultProps ={
        confirmText:'我知道了'
    }

    componentDidMount(){

    }

    showView(msg,confirmText) {
        if (isNotEmpty(confirmText)) {
            this.confirmText = confirmText
        }
        if(msg){
            this.contentInfo = msg
        }
        this.setState({})
        this.modalView && this.modalView.show()
    }

    closeView(){
        this.modalView && this.modalView.disMiss()
    }

    onclick(){
        this.closeView()
    }


    _renderAlertView() {
        return(
            <View style={[{alignItems:'center',justifyContent:'center',flex:1,backgroundColor: 'rgba(0, 0, 0, 0.4)'}]}>
                <View style={{width:kScreenWidth-adaptSize(35*2),justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:'#fff'}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.closeView()}} style={{top:10,right:11,position:'absolute',paddingLeft:20,paddingBottom:20}}>
                        <Image source={require('../../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                    </TouchableOpacity>
                    {this.showTitle?<Text style={{fontSize:20,color:'rgb(51,51,51)',marginTop:adaptSize(28)}}>提示</Text>:null}
                    <Text style={{fontSize:14,color:'rgb(51,51,51)',marginTop:adaptSize(30),marginHorizontal:12}}>{this.contentInfo}</Text>
                    {this.renderAction()}
                </View>
            </View>
        )
    }

    renderAction() {
        if (this.props.actions&&this.props.actions.length == 2) {
            return (
                <View style={{flexDirection:'row',marginTop:adaptSize(39),marginBottom:adaptSize(20),}}>
                        <TouchableOpacity onPress={()=>{this.onclick();this.props.actions[0].callBack&&this.props.actions[0].callBack()}} style={{alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                            borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)'}}>
                            <Text style={{color:'rgb(31,219,155)',fontSize:15,fontWeight:'500'}}>{this.props.actions[0].title}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{this.onclick();this.props.actions[1].callBack&&this.props.actions[1].callBack()}} style={{marginLeft:adaptSize(11),backgroundColor:'rgb(31,219,155)',alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                            borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)'}}>
                            <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>{this.props.actions[1].title}</Text>
                        </TouchableOpacity>

                </View>
            )
        }

        return  (
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.onclick()}} style={{marginTop:adaptSize(48),marginBottom:adaptSize(26),alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                        borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)',backgroundColor:'rgb(31,219,155)'}}>
                        <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>{this.confirmText}</Text>
                    </TouchableOpacity>
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
