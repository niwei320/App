import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ImageBackground,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import ModalView from "../../widget/ModalView";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {dismissKeyboard_yfw} from "../../PublicModule/Util/YFWPublicFunction";

const width = Dimensions.get('window').width;
const scale = (width - 80) / 3;
export default class YFWPrescriptionUploadRxTipsDialog extends Component {

    constructor(parameters) {
        super(parameters);
    }

    render() {
        return (
            <ModalView ref={(item)=>this.modal = item} onRequestClose={()=>{}}>
                <View style={styles.dialogView}>
                    <View style={[BaseStyles.centerItem,{marginHorizontal:40,paddingHorizontal:40,backgroundColor:'white',borderRadius:8}]}>
                        <TouchableOpacity style={styles.closeIcon} onPress={()=>{this.dismiss()}}>
                            <Image style={styles.closeIconImg} source={require('../../../img/returnTips_close.png')} />
                        </TouchableOpacity>
                        <Text style={styles.titleText}>提示</Text>
                        <Text style={styles.contentText}>处方药需上传正规有效的处方</Text>
                        <TouchableOpacity style={{alignItems:'center',justifyContent:'center',marginBottom:30,width:100,height:36,borderRadius:18,backgroundColor:'#1fdb9b'}} onPress={()=>{this.dismiss()}}>
                            <Text style={{color:'white',fontSize:18}}>我知道了</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalView>
        )
    }


    show(type){
        if(this.modal){
            if(!this.modal.isShow()){
                this.modal.show()
            }
        }
    }

    dismiss(){
        this.modal && this.modal.disMiss()
        this.props.dismiss && this.props.dismiss()
    }


}

const styles = StyleSheet.create({
    closeIcon: {
        position: 'absolute',
        width: 30,
        height: 30,
        alignItems: 'flex-end',
        right: scale * 0.10,
        top: scale * 0.10,
    },
    closeIconImg: {
        width: scale * 0.14,
        height: scale * 0.14,
        resizeMode: 'stretch',
    },
    dialogView: {
        alignItems:'center',
        justifyContent:'center',
        flex:1,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    titleText: {marginTop: scale *0.24,
        marginBottom: scale *0.15,
        fontSize: scale * 0.20,
        fontWeight: 'bold',
        color: "#333333"
    },
    contentText: {marginTop: scale *0.24,
        marginBottom: scale *0.40,
        marginTop: scale *0.30,
        fontSize: scale * 0.14,
        color: "#666666"
    }
});