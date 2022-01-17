import React, {Component} from 'react';
import {
    View,
    Image,
    DeviceEventEmitter,
    Text,
    Platform,
    TouchableOpacity,
    TextInput,Keyboard
} from 'react-native'
import ModalView from './../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty, kScreenHeight, isRealName, isEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import YFWToast from '../../Utils/YFWToast';
import {
    darkNomalColor,
    darkLightColor,
    newSeparatorColor,
    yfwGreenColor
} from '../../Utils/YFWColor'
import { IDENTITY_VERIFY, NAME, IDENTITY_CODE, EMOJIS } from '../../PublicModule/Util/RuleString';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


export default class YFWRealNameAuthenticationAlert extends Component {

    constructor(props) {
        super(props)
        this.state = {
            name: '',
            selfEnable: false,
            IDCard: '',
            callBack:()=>{}
        }
    }

    componentDidMount(){

    }

    showView(name,idCard,callBack) {
        if (isNotEmpty(name)) {
            this.state.name = name
        }
        if (isNotEmpty(idCard)) {
            this.state.IDCard = idCard
        }
        if (isNotEmpty(callBack)) {
            this.state.callBack = callBack
        }
        this.setState({
            selfEnable:this.checkBtnEnableStatus()
        })
        this.modalView && this.modalView.show()
    }

    closeView(){
        this.modalView && this.modalView.disMiss()
    }

    onclick(){
        if (!this.checkBtnEnableStatus()) {
            let message = this.checkEnableErrorMessage()
            YFWToast(message,{position:kScreenHeight*0.5,duration:4000})
            return
        }
        this.state.callBack&&this.state.callBack(this.state.name,this.state.IDCard)
        // this.closeView()
    }

    numberTextChange(number){
        let inputnumber = number.replace(IDENTITY_CODE, '');
        this.state.IDCard = inputnumber
        this.setState(()=>({
                IDCard: inputnumber,
                selfEnable:this.checkBtnEnableStatus()
            }
        ))
    }
    mobilenumberTextChange(number) {
        let inputnumber = number.replace(EMOJIS,'')
        this.state.name = inputnumber
        this.setState(()=>({
            name: inputnumber,
            selfEnable:this.checkBtnEnableStatus()
            }
        ))
    }

    checkBtnEnableStatus() {
        let message = this.checkEnableErrorMessage()
        return isEmpty(message)
    }

    checkEnableErrorMessage() {
        let message = ''
        if(this.state.name.length == 0) {
            message = '请填写姓名'
        }
        // else if(!isRealName(this.state.name)) {
        //     message = '姓名格式不正确'
        // }
        else if(this.state.IDCard.length == 0) {
            message = '请填写身份证号'
        }else if(!this.state.IDCard.match(IDENTITY_VERIFY)) {
            message = '身份证号码格式不正确'
        }
        return message
    }


    _renderAlertView() {
        return(
            <KeyboardAwareScrollView style={[{flex:1,}]} bounces={false} scrollEnabled={false}>
                <TouchableOpacity activeOpacity={1} onPress={()=>{
                    Keyboard.dismiss()
                }} style={[{alignItems:'center',justifyContent:'center',flex:1,width:kScreenWidth,height:kScreenHeight,backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{Keyboard.dismiss()}} style={{width:kScreenWidth-adaptSize(28*2),justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:'#fff'}}>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.closeView()}} style={{top:10,right:11,position:'absolute',paddingLeft:20,paddingBottom:20}}>
                            <Image source={require('../../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                        </TouchableOpacity>
                        <Text style={{fontSize:17,color:'#333',marginTop:adaptSize(28),fontWeight:'500'}}>{'实名认证'}</Text>
                        <Text style={{fontSize:13,color:'#333',marginTop:adaptSize(11)}}>{'根据国家药监局规定，购买处方药需要实名认证！'}</Text>
                        <TextInput style={{fontSize: 16,color:'#333',width:adaptSize(265), height: adaptSize(30),marginTop:adaptSize(30)}}
                            maxLength={20}
                            // keyboardType='number-pad'
                            underlineColorAndroid='transparent'
                            placeholder="请输入用药人姓名"
                            placeholderTextColor="#ccc"
                            returnKeyType={'next'}
                            value={this.state.name}
                            ref={(item) => {this.userinput = item}}
                            onSubmitEditing={()=>{this.codeInput&&this.codeInput.focus()}}
                            onChangeText={this.mobilenumberTextChange.bind(this)}/>
                        {this._renderLine()}
                        <View style={{marginTop:20,flexDirection:'row',alignItems:'center',width:adaptSize(265),height:adaptSize(30)}}>
                            <TextInput style={{fontSize:16,color:'#333',flex:1}}
                                        ref={(item)=>{this.codeInput = item}}
                                        underlineColorAndroid='transparent'
                                        // keyboardType='numeric'
                                        maxLength={20}
                                        returnKeyType={'done'}
                                        onChangeText={this.numberTextChange.bind(this)}
                                        value={this.state.IDCard}
                                        placeholderTextColor="#ccc"
                                        placeholder="请输入身份证号码">
                            </TextInput>
                            {
                                this.state.IDCard&&this.state.IDCard.length>0?
                                <TouchableOpacity activeOpacity={1} onPress={()=>{this.numberTextChange('');this.codeInput&&this.codeInput.focus()}}>
                                    <Image source={require('../../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                                </TouchableOpacity>:null
                            }
                        </View>
                        {this._renderLine()}
                        <View style={{flexDirection:'row',marginTop:adaptSize(38),marginBottom:adaptSize(21),alignItems:'center',justifyContent:'center'}}>
                            <TouchableOpacity activeOpacity={1} onPress={()=>{this.closeView()}} style={{alignItems:'center',justifyContent:'center',width:adaptSize(81),height:adaptSize(30),
                                borderRadius:adaptSize(15),backgroundColor:'white',borderColor:'rgb(33,220,157)',borderWidth:1}}>
                                <Text style={{color:'rgb(33,220,157)',fontSize:15,fontWeight:'500'}}>取  消</Text>
                            </TouchableOpacity>
                            <View style={{width:adaptSize(32)}}></View>
                            <TouchableOpacity activeOpacity={1} onPress={()=>{this.onclick()}} style={{alignItems:'center',justifyContent:'center',width:adaptSize(81),height:adaptSize(30),
                                borderRadius:adaptSize(15),backgroundColor:this.state.selfEnable?'rgb(31,219,155)':'#ccc'}}>
                                <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>认  证</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        )
    }

    _renderLine() {
        return (
            <View style={{width: adaptSize(265), height: 0.5,opacity:0.6, backgroundColor: 'rgb(204,204,204)',marginTop:adaptSize(8)}}/>
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
