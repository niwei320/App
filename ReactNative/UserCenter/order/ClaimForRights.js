import React from 'react'
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    TextInput,
    Image,
    DeviceEventEmitter, Platform,
    ImageBackground, NativeModules, ScrollView,
    KeyboardAvoidingView
} from 'react-native'
const width = Dimensions.get('window').width;
import YFWImagePicker from "../../Utils/YFWImagePicker"
import { dismissKeyboard_yfw, isEmpty, isNotEmpty, removeEmoji, strMapToObj, kScreenWidth, kScreenHeight } from "../../PublicModule/Util/YFWPublicFunction";
import { BaseStyles } from "../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const DEFAULT = 'default'
import YFWNativeManager from '../../Utils/YFWNativeManager'
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import { isIphoneX } from 'react-native-iphone-x-helper';
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity';
const { StatusBarManager } = NativeModules;

/**
 *  旧版申请投诉页面 待删除
 *  新版页面为 OrderReportTypePage OrderReportDetailPage
 * **/

export default class ClaimForRights extends React.Component {

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        // headerTitle: "我要投诉",
        // headerRight: <View style={{width:30}}/>
        header: null
    });

    constructor(props) {
        super(props)
        this.mSelected = 2;
        this.pics = []
        this.state = {
            typeOneStyle: {

            },
            typeTwoStyle: {

            },
            textOneStyle: { color: 'rgb(51,51,51)' },
            textTwoStyle: { color: 'rgb(153,153,153)' },
            CliamText: '',
            imageUris: [DEFAULT],
            tcpImageUrl: [],
        }
    }

    _renderHeaderView() {
        let marginTop
        if (Platform.OS === 'ios') {
            marginTop = isIphoneX() ? 44 + 2 : 20 + 2
        } else if (Platform.Version > 19) {
            marginTop = StatusBarManager.HEIGHT
        }
        return (
            <View style={{ width: kScreenWidth, height: 173, resizeMode: 'contain', flexDirection: 'row' }} >
                <Image style={{ height: 173, width: kScreenWidth, position: 'absolute', top: 0, left: 0, right: 0, resizeMode: 'stretch' }} source={require('../../../img/dingdan_bj.png')} />
                <TouchableOpacity onPress={() => this.props.navigation.goBack()} activeOpacity={1}
                    style={{ width: 50, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: marginTop }}>
                    <Image style={{ width: 11, height: 19, resizeMode: 'contain' }}
                        source={require('../../../img/dingdan_back.png')} />
                </TouchableOpacity>
                <View style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: marginTop }}>
                    <Text style={{ textAlign: 'center', fontSize: 17, color: '#FFF', fontWeight: 'bold' }}>我要投诉</Text>
                </View>
                <TouchableOpacity style={{ width: 50, height: 40, justifyContent: 'center', marginTop: marginTop }} activeOpacity={1}>
                    <Text style={{ fontSize: 15, color: '#fff' }}></Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        let magin_top = isIphoneX() ? 88 : 64

        return (
            <View style={{ flex: 1 }}>
                {this._renderHeaderView()}
                {
                    Platform.OS === 'android'?
                        <KeyboardAvoidingView
                            style={{ position: 'absolute', top: magin_top, height: kScreenHeight - magin_top }}
                            behavior='padding'
                            keyboardVerticalOffset={20}
                        >
                            <ScrollView>
                                {this._renderContent()}
                            </ScrollView>
                        </KeyboardAvoidingView>
                        :
                        <KeyboardAwareScrollView
                            style={{ position: 'absolute', top: magin_top, height: kScreenHeight - magin_top }}
                            extraScrollHeight={100}
                            keyboardDismissMode='on-drag'
                            keyboardShouldPersistTaps='never'
                            showsVerticalScrollIndicator={true}
                            scrollEnabled={true}
                            pagingEnabled={false}
                            horizontal={false}
                        >
                            {this._renderContent()}
                        </KeyboardAwareScrollView>
                }
            </View>
        )
    }

    _renderContent() {
        const orderNo = this.props.navigation.state.params.state.value.mOrderNo;
        const shopName = this.props.navigation.state.params.state.value.shopName;
        const dataLength = ['商家服务问题', '商品质量问题'];
        let magin_left = 15
        return (
            <TouchableOpacity style={{ width: kScreenWidth, marginTop: 20 }} onPress={() => { dismissKeyboard_yfw() }} activeOpacity={1}>
                <View style={{
                    width: width - magin_left * 2, marginLeft: magin_left, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'stretch', justifyContent: 'center',
                    shadowColor: "rgba(0, 0, 0, 0.2)", shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, shadowOpacity: 1, elevation: 2
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28 }}>
                        <Text style={{ fontSize: 15, color: 'rgb(51,51,51)', marginLeft: 22, width: 80 }}>订单号:</Text>
                        <Text style={{ fontSize: 15, color: 'rgb(153,153,153)', marginLeft: 10, marginRight: 22 }}>{orderNo}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 26, marginBottom: 26 }}>
                        <Text style={{ fontSize: 15, color: 'rgb(51,51,51)', marginLeft: 22, width: 80 }}>投诉商家:</Text>
                        <Text style={{ fontSize: 15, color: 'rgb(153,153,153)', marginLeft: 10, marginRight: 22, flex: 1 }} numberOfLines={2}>{shopName}</Text>
                    </View>
                </View>
                <View style={{
                    width: width - magin_left * 2, marginLeft: magin_left, marginTop: 17, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'stretch', justifyContent: 'center',
                    shadowColor: "rgba(0, 0, 0, 0.2)", shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, shadowOpacity: 1, elevation: 2
                }}>
                    <View style={{ marginLeft: 22, marginTop: 27 }}>
                        <YFWTitleView title={'投诉类型'} />
                    </View>
                    {dataLength.map((k, i) => {
                        return (
                            <TouchableOpacity activeOpacity={1} onPress={() => this._onTypeClicked(i)} key={i}
                                              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: i == 1 ? 26 : 0, height: 55 }}>
                                <Text style={[i == 0 ? this.state.textOneStyle : this.state.textTwoStyle, { marginLeft: 22 }]}>{k}</Text>
                                {i == 0 ? this.mSelected == 2 ? <Image style={{ width: 22, height: 22, resizeMode: "contain", marginRight: 22 }} source={require('../../../img/select_gou.png')} /> : <View /> :
                                    this.mSelected == 1 ? <Image style={{ width: 22, height: 22, resizeMode: "contain", marginRight: 22 }} source={require('../../../img/select_gou.png')} /> : <View />}
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <View style={{
                    width: width - magin_left * 2, marginLeft: magin_left, marginTop: 17, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'stretch', justifyContent: 'center',
                    shadowColor: "rgba(0, 0, 0, 0.2)", shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, shadowOpacity: 1, elevation: 2
                }}>
                    <View style={{ marginLeft: 22, marginTop: 27 }}>
                        <YFWTitleView title={'投诉内容'} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                        <TextInput underlineColorAndroid='transparent'
                                   placeholder={'在此填写您的投诉内容'}
                                   placeholderTextColor={'rgb(153,153,153)'}
                                   multiline={true} maxLength={500}
                                   onChangeText={this.onTextChange.bind(this)}
                                   value={this.state.CliamText}
                                   autoFocus={true}
                                   returnKeyType={'done'}
                                   onSubmitEditing={() => { dismissKeyboard_yfw() }}
                                   style={{ minHeight: 53, color: '#333333', fontSize: 15, textAlignVertical: 'top', padding: 0, marginLeft: 22, marginRight: 22, flex: 1 }}></TextInput>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 35 }}>
                        {this._renderImageChooseView()}
                    </View>
                </View>
                <View style={{ width: width - 13 * 2, marginLeft: 13, marginTop: 52, marginBottom: 52 }}>
                    <YFWTouchableOpacity style_title={{ height: 44, width: width - 13 * 2, fontSize: 17 }}
                                         title={'提交'}
                                         callBack={() => { this._uploadPic() }}
                                         isEnableTouch={true} />
                </View>
            </TouchableOpacity>
        )
    }

    _renderImageChooseView() {
        if (isNotEmpty(this.state.imageUris)) {
            return this.state.imageUris.map((item, index) => this._renderImagesItem(item, index));
        } else {
            return <View />
        }
    }

    _renderImageItemByNetType(item) {
        return (<Image style={{ width: 85, height: 85, resizeMode: "contain" }}
            source={{ uri: item }} />)

    }

    _renderImagesItem(item, index) {
        if (item != DEFAULT) {
            return (
                <View style={[BaseStyles.centerItem, { width: 93, height: 93, marginLeft: 22 }]} key={index}>
                    <TouchableOpacity onPress={() => this._selectPic(item)} activeOpacity={1}>
                        {this._renderImageItemByNetType(item)}

                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.removePic(item)} style={{ position: 'absolute', right: -8, top: -8 }}
                        activeOpacity={1}>
                        <Image style={{ width: 15, height: 15, resizeMode: "cover" }}
                            source={require('../../../img/ic_pic_del.png')} />
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={[BaseStyles.centerItem, { width: 93, height: 93, marginLeft: 22 }]} key={index}>
                    <TouchableOpacity onPress={() => this._selectPic(item)} activeOpacity={1}>
                        <Image style={{ width: 93, height: 93, resizeMode: "contain" }}
                            source={require('../../../img/upload_photo2.png')} />
                    </TouchableOpacity>
                </View>
            );
        }
    }

    onTextChange(text) {
        let inputText = text.replace(removeEmoji, '');
        this.setState({
            CliamText: inputText
        })
    }

    _onTypeClicked(number) {
        if (number == 0) {
            this.setState({
                textOneStyle: { color: 'rgb(51,51,51)' },
                textTwoStyle: { color: 'rgb(153,153,153)' }
            })
            this.mSelected = 2;
        } else {
            this.setState({
                textTwoStyle: { color: 'rgb(51,51,51)' },
                textOneStyle: { color: 'rgb(153,153,153)' },
            })
            this.mSelected = 1;
        }
    }

    _checkUploadImageStatus() {
        this.removeElement(DEFAULT)
        let localPicDataArrayLength = this.state.imageUris.length;
        let tcpImageUrlDataArrayLength = this.state.tcpImageUrl.length;
        if (localPicDataArrayLength > tcpImageUrlDataArrayLength) {
            this.state.imageUris.push(DEFAULT);
            return true
        }
        this.state.imageUris.push(DEFAULT);
        return false
    }


    /**
     * 选择图片
     * @param item
     * @private
     */
    _selectPic(item) {
        if (item != DEFAULT) {
            return
        }
        if(!this.imagePicker){
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.returnValue((result) => {
            if (isNotEmpty(result)) {
                this._uploadImage(result)
                this.addPic(result)
            }
        });
        this.imagePicker.show();
    }

    /*
     *  上传图片
     * */

    _uploadImage(url, type, pos, len) {
        if (type != 'again') {
            DeviceEventEmitter.emit('LoadProgressShow')
        }
        YFWNativeManager.tcpUploadImg(url, (imgUrl) => {
            if (type != 'again') {
                DeviceEventEmitter.emit('LoadProgressClose');
            }
            if (type == 'again' && pos == len - 1) {
                DeviceEventEmitter.emit('LoadProgressClose');
            }
            this.state.tcpImageUrl.push(imgUrl)
        }, (error) => {
            if (type != 'again') {
                DeviceEventEmitter.emit('LoadProgressClose');
            }
            if (type == 'again' && pos == len - 1) {
                DeviceEventEmitter.emit('LoadProgressClose');
            }
        })
    }

    /**
     * 添加图片
     * @param item
     */
    addPic(item) {
        this.removeElement(DEFAULT)
        let array = this.state.imageUris
        array.push(item)
        if (array.length < 3) {
            array.push(DEFAULT)
        }
        this.setState({
            imageUris: array
        });
    }

    /**
     * 删除图片
     * @param item
     */
    removePic(item) {
        this.removeElement(DEFAULT)
        this.removeElement(item)
        if (this.state.imageUris.length == 0) {
        }
        let array = this.state.imageUris
        array.push(DEFAULT)
        this.setState({
            imageUris: array
        });
    }

    /**
     * 删除元素
     * @param item
     */
    removeElement(item) {
        let index = this.state.imageUris.indexOf(item);
        if (index != -1) {
            this.state.imageUris.splice(index, 1);
            this.state.tcpImageUrl.splice(index, 1)
        }
    }

    /*
     *  图片上传失败 重新上传
     *
     * */
    upLoadPicAgain() {
        this.removeElement(DEFAULT);
        this.state.tcpImageUrl = [];
        let localLength = this.state.imageUris.length;
        for (let i = 0; i < localLength; i++) {
            this._uploadImage(this.state.imageUris[i], 'again', i, localLength)
        }
        this.state.imageUris.push(DEFAULT)
    }


    _uploadPic() {
        if (isEmpty(this.state.CliamText)) {
            YFWToast("请输入您的描述")
            return;
        }
        this._commit(this.state.tcpImageUrl)
    }




    _commit(imagList) {

        DeviceEventEmitter.emit('LoadProgressShow');
        const { goBack } = this.props.navigation
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('orderno', this.props.navigation.state.params.state.value.mOrderNo);
        paramMap.set('type', this.mSelected);
        paramMap.set('content', this.state.CliamText);
        paramMap.set('account_name', 'name');
        if (this._checkUploadImageStatus()) {
            this.upLoadPicAgain();
            YFWToast('图片上传失败，请重试');
            return;
        }
        if (isNotEmpty(imagList)) {
            paramMap.set("introImage", imagList);
        }

        paramMap.set('__cmd', 'person.order.complaint');
        viewModel.TCPRequest(paramMap, (res) => {
            DeviceEventEmitter.emit('LoadProgressClose');
            if (isNotEmpty(this.props.navigation.state.params.state.value.itemPosition)) {
                let noticeData = {
                    itemPosition: this.props.navigation.state.params.state.value.itemPosition,
                    pageSource: this.props.navigation.state.params.state.value.pageSource,
                };
                DeviceEventEmitter.emit('complain_order_status_refresh', noticeData);
            }
            YFWToast("提交成功")
            goBack()
        }, (error) => {
            DeviceEventEmitter.emit('LoadProgressClose');
        }, false)

    }

}
