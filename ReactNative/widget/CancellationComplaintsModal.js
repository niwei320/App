import React from 'react'
import {
    View,
    TouchableOpacity,
    Image,
    Text
} from 'react-native'

import ModalView from './ModalView'
import {kScreenWidth} from '../PublicModule/Util/YFWPublicFunction'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
export default class CancellationComplaintsModal extends React.Component {
    constructor(props) {
        super(props)
        this.callBack = undefined
    }

    showView(callBack) {
        this.callBack = callBack
        this.modalView && this.modalView.show()
    }

    closeView() {
        this.modalView && this.modalView.disMiss()
    }

    renderAlertView(){
        return(
            <TouchableOpacity style={[BaseStyles.centerItem,{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.6)'}]} activeOpacity={1} onPress={()=>this.closeView()}>
                <View style={{width:kScreenWidth-60,backgroundColor:'#FFFFFF',borderRadius:7,alignItems:'center'}}>
                    <View style={{flexDirection:'row',width:kScreenWidth-60,height:30}}>
                        <View style={{flex:1}}/>
                        <TouchableOpacity onPress={()=>{this.modalView && this.modalView.disMiss()}} activeOpacity={1} style={{width:30,height:30,justifyContent:'center',alignItems:'center'}} >
                            <Image style={{width:15,height:15,resizeMode:'contain'}}
                                   source={require('../../img/returnTips_close.png')}/>
                        </TouchableOpacity>
                    </View>
                    <Image source={require('../../img/icon_warning_compaliant.png')} style={{width:60,height:60,resizeMode:'contain',marginTop:5}}/>
                    <Text style={{fontSize:14,color:'#333333',marginTop:25}}>投诉撤销后，无法再发起，</Text>
                    <Text style={{fontSize:14,color:'#333333',marginTop:5}}>请务必确定您的诉求已得到解决。</Text>
                    <View style={{flexDirection:'row',marginTop:35,width:kScreenWidth-120,marginBottom:20,justifyContent:'space-between'}}>
                        <TouchableOpacity style={{borderColor:'#1fdb9b',borderWidth:1,width:100,height:30,borderRadius:15,justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>
                        {this.closeView()
                        this.callBack&&this.callBack()}
                        }>
                            <Text style={{fontSize:17,color:'#1fdb9b'}}>确定撤销</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{width:100,height:30,borderRadius:15,backgroundColor:'#1fdb9b',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>this.closeView()}>
                            <Text style={{fontSize:17,color:'#FFFFFF'}}>不撤销</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this.renderAlertView()}
            </ModalView>
        )
    }
}
