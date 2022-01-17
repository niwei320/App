import React, {Component} from 'react';
import {
    View,
    TextInput,
    Image,
    Text,
    TouchableOpacity, StyleSheet, DeviceEventEmitter,
} from 'react-native';
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {isNotEmpty, kScreenHeight, kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
import {
    yfwGreenColor,
    backGroundColor,
    darkTextColor,
    darkLightColor,
    separatorColor,
    yfwOrangeColor
} from '../../../Utils/YFWColor'
import ModalView from '../../../widget/ModalView'
import YFWToast from "../../../Utils/YFWToast";



export default class YFWHealthAskDetailAppendQuestionsView extends Component {

    static defaultProps = {
        Data:undefined,
    }

    constructor(props) {
        super(props)

        this.state = {
            textValue:'',
        }
    }

    componentDidMount() {

        this.openListener = DeviceEventEmitter.addListener('OpenAskDetailAppendQSView',(value)=>{
            if(value){
                this.show()
            }else{
                this.closeModal()
            }
        });

    }

    componentWillUnmount() {

        this.openListener&&this.openListener.remove();

    }



    //Action

    show() {

        this.modalView && this.modalView.show()

    }

    closeModal() {

        this.modalView && this.modalView.disMiss()

    }

    onChangeText(text){

        this.setState({
            textValue:text,
        });

    }

    submitMethod(){

        if (this.state.textValue.length == 0){
            YFWToast('提交内容不能为空');
            return;
        }

        if (this.props.submitMethod) {
            this.props.submitMethod(this.state.textValue);
        }

    }

    clear(){

        this.setState({
            textValue:'',
        });

    }


    //View
    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                <View style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
                    <View style={{height:200,width:kScreenWidth,backgroundColor:'white',marginTop:20}}>
                        <TextInput style={[BaseStyles.contentWordStyle,{marginTop:20,marginLeft:15,width:kScreenWidth-30,height:130}]}
                                   placeholder={'请输入追问内容'}  maxLength={500}  multiline={true}
                                   placeholderTextColor="#999999"
                                   value = {this.state.textValue}
                                   onChangeText={(text) => {this.onChangeText(text)}}/>
                        <View style={[BaseStyles.leftCenterView,{height:50}]}>
                            <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                                <Text style={[BaseStyles.contentWordStyle,{marginLeft:15}]}>{this.state.textValue.length}/500</Text>
                            </View>
                            <TouchableOpacity onPress={()=>this.submitMethod()}>
                                <View style={[BaseStyles.centerItem,{width:70,height:30,marginRight:15,backgroundColor:yfwGreenColor(),borderRadius:5}]}>
                                    <Text style={{fontSize:12,color:'white'}}>追问</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity onPress={()=>this.closeModal()}>
                        <View style={{width:kScreenWidth,height:kScreenHeight-220}}/>
                    </TouchableOpacity>
                </View>
            </ModalView>

        )
    }
}