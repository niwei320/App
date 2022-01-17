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
import Swiper from 'react-native-swiper';

const width = Dimensions.get('window').width;
const scale = (width - 80) / 3;
export default class YFWPrescriptionExampleDialog extends Component {

    constructor(parameters) {
        super(parameters);
        this.state = {
            type:0
        }
        this.imageSources = [
            require('../../../img/img_proof_example_0.jpg'),
            require('../../../img/img_proof_example_1.jpg'),
            require('../../../img/img_proof_example_2.jpg'),
            require('../../../img/img_proof_example_3.jpg'),
        ]
    }

    render() {
        switch (this.state.type) {
            case 0:
                return (
                    <ModalView ref={(item)=>this.modal = item} onRequestClose={()=>{}}>
                        <View style={styles.dialogView}>
                            <View style={[BaseStyles.centerItem,{marginLeft:40,marginRight:40,backgroundColor:'white',borderRadius:8}]}>
                                <TouchableOpacity style={styles.closeIcon} onPress={()=>{this.dismiss()}}>
                                    <Image style={styles.closeIconImg} source={require('../../../img/returnTips_close.png')} />
                                </TouchableOpacity>
                                <Text style={styles.titleText}>处方示例</Text>
                                <Image style={styles.prescriptionImage} source={require('../../../img/img_prescription.jpg')}/>
                                <View style={{marginTop: scale *0.14,marginBottom: scale *0.17}}>
                                    <Text style={styles.explanationText}>1、用药人信息与登记的用药人信息一致</Text>
                                    <Text style={styles.explanationText}>2、用药信息与订单的商品信息一致</Text>
                                    <Text style={styles.explanationText}>3、必须要有医生签字和盖章</Text>
                                </View>
                            </View>
                        </View>
                    </ModalView>
                )
            case 1:
                let imageW = 227
                let imageH = 189
                return (
                    <ModalView ref={(item)=>this.modal = item} onRequestClose={()=>{}}>
                        <View style={styles.dialogView}>
                            <View style={[BaseStyles.centerItem,{marginLeft:40,marginRight:40,backgroundColor:'white',borderRadius:8}]}>
                                <TouchableOpacity style={styles.closeIcon} onPress={()=>{this.dismiss()}}>
                                    <Image style={styles.closeIconImg} source={require('../../../img/returnTips_close.png')} />
                                </TouchableOpacity>
                                <View style={{flexDirection:'row',marginTop:34,paddingLeft:24,paddingRight:24}}>
                                    <Image style={{width:18,height:18}} source={require('../../../img/tip_warn.png')}></Image>
                                    <View style={{marginLeft:5,marginTop:2}}>
                                        <Text style={{color:'#333',fontSize:14,fontWeight:'bold'}}>{'注意以下事项'}</Text>
                                        <Text style={{color:'#333',fontSize:14,marginTop:5}}>{'·用药人姓名，必须与凭证中一致；'}</Text>
                                        <Text style={{color:'#333',fontSize:14,marginTop:5}}>{'·所购药品，必须与凭证中一致；'}</Text>
                                        <Text style={{color:'#333',fontSize:14,fontWeight:'bold',marginTop:5}}>{'否则将开方失败'}</Text>
                                    </View>
                                </View>
                                <View style={{marginTop:20,width:imageW,height:imageH,borderRadius: 7,borderStyle: "solid",borderWidth: 1,borderColor: "#e3e3e3"}}>
                                    <View style={{width:imageW,height:imageH,overflow: 'hidden'}}>
                                        <Swiper style={{marginTop:0}} width={imageW} height={imageH} autoplay={false}
                                                dot={<View style={[{width:7,height:7,borderRadius:3,marginHorizontal:3,},{backgroundColor:'rgba(0,0,0,0.2)'}]}/>}
                                                activeDot={
                                                            <View style={[{width:7,height:7,borderRadius:3,marginHorizontal:3,backgroundColor:'#000'}]}/>
                                                        }>
                                            {this._renderImg(imageW,imageH)}
                                        </Swiper>
                                    </View>
                                </View>
                                <TouchableOpacity style={{alignItems:'center',justifyContent:'center',marginBottom:20,width:228,height:33,borderRadius:17,marginTop:20,backgroundColor:'#1fdb9b'}} onPress={()=>{this.props.uploadAction&&this.props.uploadAction()}}>
                                    <Text style={{color:'white',fontSize:18}}>立即上传</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ModalView>
                )
            case 2:
                return (
                    <ModalView ref={(item)=>this.modal = item} onRequestClose={()=>{}}>
                        <View style={styles.dialogView}>
                            <View style={[BaseStyles.centerItem,{marginLeft:40,marginRight:40,backgroundColor:'white',borderRadius:8}]}>
                                <TouchableOpacity style={styles.closeIcon} onPress={()=>{this.dismiss()}}>
                                    <Image style={styles.closeIconImg} source={require('../../../img/returnTips_close.png')} />
                                </TouchableOpacity>
                                <Text style={styles.titleText}>处方示例</Text>
                                <View style={{height: scale*3.14, width: scale * 2.6, marginHorizontal: scale * 0.2,marginBottom: scale * 0.2}}>
                                <Image style={styles.proofImage} source={require('../../../img/prescription.jpg')}/>
                                </View>
                            </View>
                        </View>
                    </ModalView>
                )
            default:
                return <View />
        }
    }

    _renderImg(imageW,imageH) {

        return this.imageSources.map((imgSource,index)=>{
            return (
                <TouchableOpacity activeOpacity={1} onPress={()=>{this.props.showLargeImage&&this.props.showLargeImage(index)}}>
                    <Image style={{width:imageW,height:imageH}} resizeMode='contain' source={imgSource}></Image>
                </TouchableOpacity>
            )
        })
    }


    show(type){
        if(this.modal){
            if(!this.modal.isShow()){
                this.setState({
                    type:type
                })
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
    dialogView: {
        alignItems:'center',
        justifyContent:'center',
        flex:1,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
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
    prescriptionImage: {
        width: scale * 1.87,
        height: scale * 2.56,
        marginHorizontal: scale * 0.6,
        resizeMode: 'stretch',
    },
    proofImage: {
        width: scale * 2.6,
        height: scale * 3.14,
        resizeMode: 'stretch',
    },
    explanationText: {
        fontSize: scale * 0.10,
        lineHeight: scale * 0.15,
        color: "#333333",
    },
    titleText: {marginTop: scale *0.24,
        marginBottom: scale *0.15,
        fontSize: scale * 0.17,
        fontWeight: 'bold',
        color: "#333333"
    }
});
