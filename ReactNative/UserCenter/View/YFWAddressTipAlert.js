import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,StyleSheet
} from 'react-native'
import ModalView from '../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction';


export default class YFWAddressTipAlert extends Component {

    constructor(props) {
        super(props)
        this.state = {
            receiver: '',
            userPhone: '',
            userAddress: '',
            userAddressDetail: '',
            leftCallBack:()=>{},
            rightCallBack:()=>{},
        }
    }

    static defaultProps ={
    }

    componentDidMount(){

    }

    showView(receiver,userPhone,userAddress,userAddressDetail,leftCallBack,rightCallBack) {
        this.setState({
            receiver:receiver,
            userPhone:userPhone,
            userAddress:userAddress,
            userAddressDetail:userAddressDetail,
            leftCallBack:leftCallBack,
            rightCallBack:rightCallBack
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
                        <Image source={require('../../../img/returnTips_close.png')} style={{width:14,height:14}}/>
                    </TouchableOpacity>
                    <Text style={{fontSize:16,fontWeight:'500',color:'rgb(51,51,51)',marginTop:adaptSize(28)}}>{'是否粘贴刚复制的地址信息？'}</Text>
                    <View style={{width:kScreenWidth-adaptSize(35*2),marginTop:10}}>
                        {safe(this.state.receiver).length > 0 && <View style={styles.lineContainer}>
                            <Text style={styles.leftText}>{'姓名'}</Text>
                            <Text style={styles.rightText}>{this.state.receiver}</Text>
                        </View>}
                        {safe(this.state.userPhone).length > 0 && <View style={styles.lineContainer}>
                            <Text style={styles.leftText}>{'手机号码'}</Text>
                            <Text style={styles.rightText}>{this.state.userPhone}</Text>
                        </View>}
                        {safe(this.state.userAddress).length > 0 && <View style={styles.lineContainer}>
                            <Text style={styles.leftText}>{'所在地区'}</Text>
                            <Text style={styles.rightText}>{this.state.userAddress}</Text>
                        </View>}
                        {safe(this.state.userAddressDetail).length > 0 && <View style={styles.lineContainer}>
                            <Text style={styles.leftText}>{'详细地址'}</Text>
                            <Text style={styles.rightText}>{this.state.userAddressDetail}</Text>
                        </View>}
                    </View>
                    {this.renderAction()}
                </View>
            </View>
        )
    }

    renderAction() {
        return (
            <View style={{flexDirection:'row',justifyContent:'space-evenly',marginTop:adaptSize(39),marginBottom:adaptSize(20),}}>
                    <TouchableOpacity onPress={()=>{this.onclick();this.state.leftCallBack&&this.state.leftCallBack()}} style={{alignItems:'center',justifyContent:'center',width:adaptSize(90),height:adaptSize(30),
                        borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)'}}>
                        <Text style={{color:'rgb(31,219,155)',fontSize:15,fontWeight:'500'}}>{'暂不粘贴'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{this.onclick();this.state.rightCallBack&&this.state.rightCallBack()}} style={{marginLeft:adaptSize(33),backgroundColor:'rgb(31,219,155)',alignItems:'center',justifyContent:'center',width:adaptSize(90),height:adaptSize(30),
                        borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)'}}>
                        <Text style={{color:'white',fontSize:15,fontWeight:'500'}}>{'确认粘贴'}</Text>
                    </TouchableOpacity>
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

const styles = StyleSheet.create({
    lineContainer:{
        flexDirection:'row',marginHorizontal:13,marginTop:7
    },
    leftText:{
        fontSize:14,color:'#999',textAlign:'right',minWidth:70
    },
    rightText:{
        fontSize:14,color:'#333',marginLeft:12,flex:1,lineHeight:18
    }
})
