import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity
} from 'react-native'
import ModalView from '../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import { yfwBlueColor } from '../../Utils/YFWColor';


export default class YFWWDTipsAlert extends Component {

    constructor(props) {
        super(props)
        this.contentInfo = this.props.contentInfo;
        this.confirmText = this.props.confirmText;
        this.showTitle = true
        this.alertTitle = '提示'
    }

    static defaultProps ={
        confirmText:'我知道了'
    }

    componentDidMount(){

    }

    showView(msg,content,confirmText,actions,confirmActions) {
        if (isNotEmpty(confirmText)) {
            this.confirmText = confirmText
        }
        if(msg){
            this.alertTitle = msg
        }
        if(content){
            this.contentInfo = content
        }
        if (actions) {
            this.actions = actions
        }
        if (confirmActions) {
            this.confirmActions = confirmActions
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

                    {this.showTitle?<Text style={{fontSize:20,color:'rgb(51,51,51)',marginTop:adaptSize(28)}}>{this.alertTitle}</Text>:null}
                    <Text style={{fontSize:14,color:'rgb(51,51,51)',marginTop:adaptSize(30),marginHorizontal:12,textAlign:'center'}}>{this.contentInfo}</Text>
                    {this.renderAction()}
                </View>
            </View>
        )
    }

    renderAction() {
        if (this.actions&&this.actions.length == 2) {
            return (
                <View style={{flexDirection:'row',marginTop:adaptSize(39),marginBottom:adaptSize(20),}}>
                        <TouchableOpacity onPress={()=>{this.onclick();this.actions[0].callBack&&this.actions[0].callBack()}} style={{alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                            borderRadius:adaptSize(15),borderWidth:1,borderColor:yfwBlueColor()}}>
                            <Text style={{color:yfwBlueColor(),fontSize:15,fontWeight:'500'}}>{this.actions[0].title}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{this.onclick();this.actions[1].callBack&&this.actions[1].callBack()}} style={{marginLeft:adaptSize(11),backgroundColor:yfwBlueColor(),alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                            borderRadius:adaptSize(15),borderWidth:1,borderColor:yfwBlueColor()}}>
                            <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>{this.actions[1].title}</Text>
                        </TouchableOpacity>

                </View>
            )
        }

        return  (
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.onclick();this.confirmActions&&this.confirmActions()}} style={{marginTop:adaptSize(48),marginBottom:adaptSize(26),alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                        borderRadius:adaptSize(15),borderWidth:1,borderColor:yfwBlueColor(),backgroundColor:yfwBlueColor()}}>
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
