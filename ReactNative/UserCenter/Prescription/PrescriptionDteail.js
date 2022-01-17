import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    NativeModules,
    Platform,
    StyleSheet,
    Text,
} from 'react-native';
const width = Dimensions.get('window').width;
import {
    kScreenWidth,
    isIphoneX,
    tcpImage, adaptSize, isEmpty, isNotEmpty
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWToast from "../../Utils/YFWToast";
import { darkNomalColor, darkTextColor, backGroundColor, yfwGreenColor } from '../../Utils/YFWColor'
import { BaseStyles } from "../../Utils/YFWBaseCssStyle";
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity'
import YFWNativeManager from '../../Utils/YFWNativeManager'
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import BigPictureView from '../../widget/BigPictureView';
const { StatusBarManager } = NativeModules;

export default class PrescriptionDetail extends Component {
    constructor(...args) {
        super(...args);
        _this = this;

        this.img = this.props.navigation.state.params.state.prescription_img_url
        if (this.img) {//如果有图片则显示大图的加载
            this.img = this.img.replace('http://c1.yaofangwang.net/', '')
        }
    }
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: "处方详情",
        headerTransparent: true,
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 50, height: 40 }]}
                onPress={() => { navigation.goBack() }}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerRight: <View style={{ width: 50 }} />,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor: 'transparent',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomWidth: 0, backgroundColor: 'transparent' },
        headerBackground: <Image source={require('../../../img/order_detail_header.png')} style={{ width: kScreenWidth, flex: 1, resizeMode: 'cover' }} opacity={0} />
    });

    render() {
        const { navigate } = this.props.navigation;
        let images = [];
        images.push({ url: _this.img })
        return (
            <View style={{ flex: 1, backgroundColor: backGroundColor() }}>
                <Image source={require('../../../img/order_detail_header.png')} style={{ width: kScreenWidth, height: 173 / 375.0 * kScreenWidth, resizeMode: 'stretch' }} />
                <View style={{ flex: 1,position:'absolute', left:0, right:0, bottom:0, top:isIphoneX() ? 88 : 64, paddingTop:20 ,paddingLeft:10,paddingRight:10}}>
                    <BigPictureView ref={(view) => { this.picView = view }} />
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => { this.picView.showView(images, 0,true) }}>
                        <Image source={{ uri: _this.img }} style={{ flex:2,resizeMode:'contain'}} />
                    </TouchableOpacity>
                    <View style={{ paddingBottom: isIphoneX() ? 60 : 40, alignItems: 'center' }}>
                        <TouchableOpacity activeOpacity={1} style={[styles.button, { borderColor: yfwGreenColor(), backgroundColor: yfwGreenColor(), marginTop: 10 }]} onPress={() => YFWNativeManager.copyImage(_this.img, 'local')}>
                            <Text style={{ color: 'white', fontSize: 17 }}>保存本地相册</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 15,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
