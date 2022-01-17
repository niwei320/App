import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput, FlatList,
} from 'react-native';
import YFWPopupWindow from "../../PublicModule/Widge/YFWPopupWindow";
import {kScreenHeight, kScreenWidth, safe, kScreenScaling, isIphoneX} from "../../PublicModule/Util/YFWPublicFunction";
import {darkTextColor, yfwGreenColor, yfwLineColor} from "../../Utils/YFWColor";
import Swiper from 'react-native-swiper';
import ModalView from '../../widget/ModalView';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';

export default class YFWPrescriptionExampleView  extends Component {

    constructor(props) {
        super(props);

        this.state ={
            currentIndex:0,
        }
        this.imageSources = [
            require('../../../img/img_proof_example_0.jpg'),
            require('../../../img/img_proof_example_1.jpg'),
            require('../../../img/img_proof_example_2.jpg'),
            require('../../../img/img_proof_example_3.jpg'),
        ]
    }

    render() {
        return(
            <ModalView ref={(item)=>this.modalView = item} onRequestClose={()=>{}}>
                {this._renderContent()}
            </ModalView>
        )
    }

    _renderContent() {

        let imageH = 563*kScreenScaling
        let marginH = 58*kScreenScaling
        let marginT = 10*kScreenScaling
        if (isIphoneX()) {
            marginT = 30*kScreenScaling
            marginH = 68*kScreenScaling
        }

        return (
            <View style={[{alignItems:'center',justifyContent:'center',flex:1,width:kScreenWidth,height:kScreenHeight,backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
                <TouchableOpacity activeOpacity={1} style={{width:kScreenWidth,flex:1}} onPress={()=>{this.disMiss()}}></TouchableOpacity>
                <View style={{width:kScreenWidth,height:imageH+marginH+marginT}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.disMiss()}} style={{paddingBottom:marginT,flexDirection:'row-reverse',height:24,width:kScreenWidth}}>
                        <TouchableOpacity style={{paddingHorizontal:20,paddingVertical:5,...BaseStyles.centerItem}} onPress={()=>{this.disMiss()}}>
                            <Image style={{width:14,height:14,tintColor:'white'}}  source={require('../../../img/returnTips_close.png')}></Image>
                        </TouchableOpacity>
                    </TouchableOpacity>
                    <Swiper style={{marginTop:0}} width={kScreenWidth} height={imageH+marginH} autoplay={false} index={this.state.currentIndex}
                            dot={<View style={[{width:7,height:7,borderRadius:3,marginHorizontal:3,marginTop:marginH,},{backgroundColor:'rgba(255,255,255,0.5)'}]}/>}
                            activeDot={
                                        <View style={[{width:7,height:7,borderRadius:3,marginHorizontal:3,marginTop:marginH,backgroundColor:'white'}]}>
                                        </View>
                                    }>
                        {this._renderImg(imageH)}
                    </Swiper>
                </View>
            </View>
        )
    }

    _renderImg(imageH) {

        return this.imageSources.map((imgSource)=>{
            return (
                <Image style={{width:kScreenWidth,height:imageH}} resizeMode='stretch' source={imgSource}></Image>
            )
        })
    }


    // 弹出modal
    show(index) {
        this.setState({
            currentIndex: index
        })
        this.modalView && this.modalView.show()
    }

    // 消失modal
    disMiss() {
        this.modalView && this.modalView.disMiss()
    }

}
