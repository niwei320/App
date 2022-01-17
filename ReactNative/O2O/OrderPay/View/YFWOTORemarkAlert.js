import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    TextInput,
} from 'react-native'
import ModalView from '../../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty, removeEmoji, dismissKeyboard_yfw } from '../../../PublicModule/Util/YFWPublicFunction';
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';
import { o2oBlueColor } from '../../../Utils/YFWColor';


export default class YFWOTORemarkAlert extends Component {

    constructor(props) {
        super(props)
        this.state = {
            remarkText:'',
            onPressAction:()=>{}
        }
    }

    static defaultProps ={
        confirmText:'我知道了'
    }

    componentDidMount(){

    }

    showView(text,onPressAction) {
        this.setState({
            remarkText:text,
            onPressAction:onPressAction,
        })
        this.modalView && this.modalView.show()
    }

    closeView(){
        this.modalView && this.modalView.disMiss()
    }

    onclick(){
        this.closeView()
    }

    onReportTextChange(text) {
        let inputText = text.replace(removeEmoji, '');
        if (this.state.remarkText.length == 49 && text.length == 0) {//差一位到达限定字数再输入一个表情（占两位）会导致超出限定字数 --> text为空
            return
        }
        this.setState({
            remarkText: inputText
        })
    }
    _renderAlertView() {
        return(
            <View style={[{alignItems:'center',justifyContent:'center',flex:1,backgroundColor: 'rgba(0, 0, 0, 0.4)'}]}>
                <View style={{width:kScreenWidth-adaptSize(35*2),borderRadius:10,backgroundColor:'#fff'}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.closeView()}} hitSlop={{left:10,top:10,bottom:10,right:10}} style={{top:10,right:11,position:'absolute',paddingLeft:20,paddingBottom:20}}>
                        <Image source={require('../../../../img/icon_delect.png')} style={{width:14,height:14}}/>
                    </TouchableOpacity>
                    <Text style={{fontSize:16,color:'#333',fontWeight:'500',marginTop:adaptSize(16),marginLeft:14}}>{'添加备注'}</Text>
                    <View style={{flexDirection:'column',alignItems: 'flex-end', marginTop: 15, marginBottom:10,backgroundColor:'#f5f5f5',width:kScreenWidth-adaptSize(35*2)-22,marginHorizontal:11}}>
                        <TextInput underlineColorAndroid='transparent'
                                placeholder={'请输入订单备注...'}
                                placeholderTextColor={'#ccc'}
                                multiline={true}
                                maxLength={50}
                                onChangeText={this.onReportTextChange.bind(this)}
                                value={this.state.remarkText}
                                autoFocus={false}
                                returnKeyType={'done'}
                                onSubmitEditing={() => { dismissKeyboard_yfw() }}
                                style={{width:kScreenWidth-adaptSize(35*2)-22-12,
                                    minHeight: 100,
                                    color: '#666',
                                    fontSize: 12,
                                    padding: 0,
                                    backgroundColor:'#f5f5f5',
                                    textAlignVertical: 'top',
                                    marginHorizontal:6,
                                    }}/>
                        <Text style={{	fontSize: 12, color: "#ccc",marginTop: 10, marginRight: 12}}>{this.state.remarkText.length + '/50'}</Text>
                    </View>
                    {this.renderAction()}
                </View>
            </View>
        )
    }

    renderAction() {
        return  (
            <View style = {{
                height: 40, flexDirection: 'row'
            }}>
                {this.buildLeftButton()}
                <View style = {{width: 1, height: 40, backgroundColor: "#f5f5f5"}} />
                {this.buildRigthButton()}
                <View style = {{position: 'absolute',left:0,right:0, height: 1, backgroundColor: "#f5f5f5",marginHorizontal:0}} />
            </View>
        )
    }

    buildLeftButton() {
        return (
            <TouchableOpacity activeOpacity={1}
                onPress = {() => {this.closeView()}}
                style = {[BaseStyles.centerItem,{flex: 1, height: 40}]}
                >
                <Text style = {{textAlign: 'center', color: '#666'}}>{'取消'}</Text>
            </TouchableOpacity>
        )
    }
    
    buildRigthButton() {
        return (
            <TouchableOpacity activeOpacity={1}
                onPress = {() => {this.closeView();if(this.state.onPressAction){this.state.onPressAction(this.state.remarkText)}}}
                style = {[BaseStyles.centerItem,{flex: 1, height: 40}]}
                >
                <Text style = {{textAlign: 'center', color: o2oBlueColor(),fontWeight:'500'}}>{'提交'}</Text>
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
