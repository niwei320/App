import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity
} from 'react-native'
import ModalView from '../../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty } from '../../../PublicModule/Util/YFWPublicFunction';


export default class YFWCustomTipAlertView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            title:'',
            content:'',
            actions:[],
        }
    }

    static defaultProps ={
        confirmText:'我知道了'
    }

    componentDidMount(){

    }

    showView(title,msg,actions) {
        this.setState({
            title:title,
            content:msg,
            actions:actions
        })
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
                        <Image source={require('../../../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                    </TouchableOpacity>
                    {isNotEmpty(this.state.title)&&this.state.title.length > 0?<Text style={{fontSize:20,color:'rgb(51,51,51)',marginTop:adaptSize(28)}}>{this.state.title}</Text>:null}
                    <Text style={{fontSize:14,color:'rgb(51,51,51)',marginTop:adaptSize(30),lineHeight:16,marginHorizontal:30,textAlign:'center'}}>{this.state.content}</Text>
                    {this.renderAction()}
                </View>
            </View>
        )
    }

    renderAction() {
        if (isNotEmpty(this.state.actions) && this.state.actions.length > 0) {
            return (
                <View style={{flexDirection:'row',marginTop:adaptSize(39),marginBottom:adaptSize(20),}}>
                    {this.state.actions.map((info,index)=>{
                        let backgroundColor = info.isCancel?'white':'rgb(31,219,155)'
                        let textColor = info.isCancel?'rgb(31,219,155)':'white'
                        return (
                            <TouchableOpacity key={index+''} onPress={()=>{this.onclick();info.onPress&&info.onPress()}} style={{marginRight:(index < (this.state.actions.length - 1))?adaptSize(11):0,backgroundColor:backgroundColor,alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                                borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)'}}>
                                <Text style={{color:textColor,fontSize:15,fontWeight:'500'}}>{info.text}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            )
        }

        return  (
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.onclick()}} style={{marginTop:adaptSize(48),marginBottom:adaptSize(26),alignItems:'center',justifyContent:'center',width:adaptSize(77),height:adaptSize(30),
                        borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)',backgroundColor:'rgb(31,219,155)'}}>
                        <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>{'我知道了'}</Text>
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
