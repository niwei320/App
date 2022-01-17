import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,Alert
} from 'react-native'
import ModalView from '../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import YFWNativeManager from '../../Utils/YFWNativeManager';

export const kLoginCloseAccountKey = 'login_close_account'

export const kTipTypeWarn = 'warn'
export const kTipTypeSuccess = 'success'
export const kTipTypeClosed = 'closed'
export default class YFWCloseTipAlert extends Component {

    constructor(props) {
        super(props)
        this.contentInfo = this.props.contentInfo;
        this.confirmText = this.props.confirmText;
        this.confirmCallBack = this.props.confirmCallBack;
        this.type = this.props.type;
    }

    static defaultProps ={
        confirmText:'我知道了'
    }

    componentDidMount(){

    }

    showView(type,msg,confirmText,confirmCallBack) {
        this.type = type
        if (isNotEmpty(confirmText)) {
            this.confirmText = confirmText
        }
        if(msg){
            this.contentInfo = msg
        }
        if (confirmCallBack) {
            this.confirmCallBack = confirmCallBack
        }
        this.setState({})
        this.modalView && this.modalView.show()
    }

    closeView(){
        this.modalView && this.modalView.disMiss()
    }

    onclick(){
        if (this.confirmCallBack) {
            this.confirmCallBack()
        }
        this.closeView()
    }

    _renderAlertView() {
        let tipImageSource = require('../../../img/tip_warn.png')
        let showClose = false
        let showAction = true
        if (this.type == kTipTypeWarn || this.type == kTipTypeClosed) {
            tipImageSource = require('../../../img/tip_warn.png')
            if (this.type == kTipTypeClosed) {
                showClose = true
                showAction = false
            }
        } else if (this.type == kTipTypeSuccess) {
            tipImageSource = require('../../../img/tip_success.png')
        }
        return(
            <View style={[{alignItems:'center',justifyContent:'center',flex:1,backgroundColor: 'rgba(0, 0, 0, 0.4)'}]}>
                <View style={{width:kScreenWidth-adaptSize(35*2),justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:'#fff'}}>
                    {
                        showClose?
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.closeView()}} style={{top:10,right:11,position:'absolute',paddingLeft:20,paddingBottom:20}}>
                            <Image source={require('../../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                        </TouchableOpacity>:null
                    }
                    <Image style={{width:adaptSize(47),height:adaptSize(47),marginTop:adaptSize(34)}} source={tipImageSource}></Image>
                    <Text style={{fontSize:14,color:'#333',marginTop:adaptSize(25),marginHorizontal:40,lineHeight:20,textAlign:'center',marginBottom:adaptSize(10)}}>{this.contentInfo}</Text>
                    {this.renderAction(showAction)}
                </View>
            </View>
        )
    }

    renderAction(show) {
        if (!show) {
            return null
        }
        return  (
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.onclick()}} style={{marginTop:adaptSize(48),marginBottom:adaptSize(26),alignItems:'center',justifyContent:'center',width: adaptSize(121),
                    height: adaptSize(31),
                    borderColor: "#1fdb9b",
                        borderRadius:adaptSize(15),borderWidth:1}}>
                        <Text style={{color:'#1fdb9b',fontSize:15,fontWeight:'500'}}>{this.confirmText}</Text>
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
