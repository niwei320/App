import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView, Dimensions,
} from 'react-native';
import YFWPopupWindow from "../PublicModule/Widge/YFWPopupWindow";
import {kScreenHeight, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import YFWTouchableOpacity from "./YFWTouchableOpacity";
import ModalView from "./ModalView";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";

var Swiper = require('react-native-swiper');
const width = Dimensions.get('window').width;
const scale = (width - 80) / 3;
export default class YFWImageExampleDialog extends Component {

    constructor(parameters) {
        super(parameters);
        this.state = {
            title: this.props.title,
            imageArray:[],
        }
    }
    show(imageArray){
        this.setState({
            imageArray : imageArray
        })
        this.modal.show()
    }

    dismiss(){
        this.modal && this.modal.disMiss()
        this.props.dismiss && this.props.dismiss()
    }

    render() {
        let images = []
        this.state.imageArray.forEach((item)=>{
            images.push(<Image style={styles.proofImage} source={{uri:item}}/>)
        })
        return (
            <ModalView ref={(item)=>this.modal = item} onRequestClose={()=>{}}>
                <View style={styles.dialogView}>
                    <View style={[BaseStyles.centerItem,{marginLeft:40,marginRight:40,backgroundColor:'white',borderRadius:8}]}>
                        <TouchableOpacity style={styles.closeIcon} onPress={()=>{this.dismiss()}}>
                            <Image style={styles.closeIconImg} source={require('../../img/returnTips_close.png')} />
                        </TouchableOpacity>
                        <Text style={styles.titleText}>{this.state.title}</Text>
                        <View style={{height: scale*3.14, width: scale * 2.6, marginHorizontal: scale * 0.2,marginBottom: scale * 0.2}}>
                            <Swiper loop={false} containerStyle={{overflow: 'hidden'}} style={{marginTop:0, }} width={scale * 2.6} height={ scale*3.14} autoplay={false} toplayTimeout={3}
                                    dot={<View style={[{top:10, width:7,height:7,borderRadius:10,marginHorizontal:3,marginBottom:0},{backgroundColor:'#eeeeee'}]}/>}
                                    activeDot={
                                        <View style={[{top:10, width:10,height:10,borderRadius:10,marginHorizontal:3,marginBottom:0},{backgroundColor:'rgb(204,204,204)'}]}/>
                                    }>
                                {images}
                            </Swiper>
                        </View>
                    </View>
                </View>
            </ModalView>
        )
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
        resizeMode: 'contain',
    },
    explanationText: {
        fontSize: scale * 0.10,
        lineHeight: scale * 0.15,
        color: "#333333",
    },
    titleText: {
        marginTop: scale *0.14,
        marginBottom: scale *0.15,
        fontSize: scale * 0.17,
        fontWeight: 'bold',
        color: "#333333"
    }
});