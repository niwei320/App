import React, {Component} from 'react';
import {
    ScrollView,
    Image,
    Platform,
    View,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';
import {isIphoneX, kScreenHeight, kScreenWidth,iphoneBottomMargin} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../Utils/YFWNativeManager";
import FastImage from "react-native-fast-image";

var styles = StyleSheet.create({
    contentContainer: {
        width: kScreenWidth*4,
        height: kScreenHeight,
    },
    backgroundImage: {
        width: kScreenWidth,
        height: kScreenHeight,
        justifyContent:'center',
        alignItems:'center',
    },
});
let image1 = require('../../img/introduce1.png');
let image2 = require('../../img/introduce2.png');
let image3 = require('../../img/introduce3.png');
let image4 = require('../../img/introduce4.png');
let imageX1 = require('../../img/introduceX1.jpg');
let imageX2 = require('../../img/introduceX2.jpg');
let imageX3 = require('../../img/introduceX3.jpg');
let imageX4 = require('../../img/introduceX4.jpg');
let imagePad1 = require('../../img/introduce1.png');
let imagePad2 = require('../../img/introduce2.png');
let imagePad3 = require('../../img/introduce3.png');

//iPad 版本需要将这段解注释，并导入图片
// imagePad1 = require('../../img/introducePad1.png');
// imagePad2 = require('../../img/introducePad2.png');
// imagePad3 = require('../../img/introducePad3.png');

export default class YFWLaunchView extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            status_modal:false,}
    }

    componentDidMount() {
        this.showView();
    }

    showView(){
        YFWNativeManager.closeSplashImage()

        this.modalView && this.modalView.show()

        this.setState({
            status_modal:true,
        });
    }
    closeView(){
        if (this.props.changeStatus) {
            this.props.changeStatus();
        }
        this.modalView && this.modalView.disMiss()

        this.setState({
            status_modal:false,
        });
    }

    renderAlertView(){

        // let img1 = Platform.isPad ? imagePad1 : isIphoneX()?imageX1:image1;
        // let img2 = Platform.isPad ? imagePad2 : isIphoneX()?imageX2:image2;
        // let img3 = Platform.isPad ? imagePad3 : isIphoneX()?imageX3:image3;
        let img1 = isIphoneX()?imageX1:image1;
        let img2 = isIphoneX()?imageX2:image2;
        let img3 = isIphoneX()?imageX3:image3;
        let img4 = isIphoneX()?imageX4:image4;

        let width = isIphoneX() ? 316 : 276
        let height = isIphoneX() ? 665 : 580
        return (
            <ScrollView
                style={{backgroundColor: 'white'}}
                contentContainerStyle={styles.contentContainer}
                bounces={false}
                pagingEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.backgroundImage}>
                    <FastImage source={img1} defaultSource={img1} resizeMode='contain' style={{width:width/375.0*kScreenWidth, height:height/375.0*kScreenWidth}} />
                </View>
                <View style={styles.backgroundImage}>
                    <FastImage source={img2} defaultSource={img2} resizeMode='contain' style={{width:width/375.0*kScreenWidth, height:height/375.0*kScreenWidth}} />
                </View>
                <View style={styles.backgroundImage}>
                    <FastImage source={img3} defaultSource={img3} resizeMode='contain' style={{width:width/375.0*kScreenWidth, height:height/375.0*kScreenWidth}} />
                </View>
                <View style={styles.backgroundImage}>
                    <ImageBackground source={img4} defaultSource={img4} style={{width:width/375.0*kScreenWidth, height:height/375.0*kScreenWidth,alignItems:'center',justifyContent:'flex-end'}} imageStyle={{resizeMode:'center'}}>
                        <TouchableOpacity style={{width:183,height:45}} onPress={()=>this.closeView()} activeOpacity={1} accessibilityLabel={'go_next'}>
                            <FastImage source={require('../../img/introduce_button.png')} style={{width:183,height:45}}/>
                        </TouchableOpacity>
                    </ImageBackground>
                </View>
            </ScrollView>
        );

    }
    render() {
        return (
                this.renderAlertView()
        );

    }
};



