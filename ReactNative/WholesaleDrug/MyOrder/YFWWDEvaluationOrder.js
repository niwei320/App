import React from 'react'
import {
    View,
    Text,
    Dimensions,
    TextInput,
    TouchableOpacity,
    DeviceEventEmitter,
    Platform,
    Keyboard,
    ScrollView,
    Image,
    ImageBackground,
} from 'react-native'
const width = Dimensions.get('window').width;
import StartScore from '../../UserCenter/StartScore'
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {
    dismissKeyboard_yfw,
    isEmpty,
    isNotEmpty,
    removeEmoji,
    tcpImage,
    isIphoneX,
    kScreenWidth
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWToast from "../../Utils/YFWToast";
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const SERVICE_STAR = 0  //客户服务
const SHIPPING_STAR = 1 //物流速度
const DELIVERY_STAR = 2 //发货速度
const PACKAGE_STAR = 3 //商品包装

import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText'
import { toDecimal } from '../../Utils/ConvertUtils'
import YFWWDTouchableOpacity from '../Widget/View/YFWWDTouchableOpacity';
import { replaceWDNavigation, pushWDNavigation, kRoute_operation_success } from '../YFWWDJumpRouting';

export default class YFWWDEvaluationOrder extends React.Component {

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: "订单评价",
        headerRight: <View style={{ width: 60 }}>
            <Text onPress={() => { navigation.state.params.commit() }}> 提交 </Text>
        </View>
    });

    constructor(props) {
        super(props)
        this.orderNo = this.props.navigation.state.params.state.value.orderNo
        this.shopName = this.props.navigation.state.params.state.value.shopName
        this.orderTotal = this.props.navigation.state.params.state.value.orderTotal
        this.imgUrl = this.props.navigation.state.params.state.value.img_url
        this.state = {
            evaluationText: '',
            evaluationStar: [5, 5, 5, 5]
        }

    }

    componentWillMount() {
        this.props.navigation.setParams({ commit: () => { this._commit() } });
    }

    render() {
        const dataLength = ['客户服务', '发货速度', '物流速度', '商品包装'];
        let len = (width - 50) / 5
        let arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(i);
        }
        return (
            <View style={{ flex: 1 }}>
                <KeyboardAwareScrollView style={{ backgroundColor: '#fafafa' }} keyboardShouldPersistTaps='always'
                >
                    <AndroidHeaderBottomLine />
                    <View style={[BaseStyles.radiusShadow, { backgroundColor: '#FFF', marginTop: 13, marginLeft: 13, marginRight: 13 }]}>
                        <TouchableOpacity style={{ width: width - 26 }} onPress={() => { dismissKeyboard_yfw() }} onPressIn={() => { dismissKeyboard_yfw() }}
                            activeOpacity={1}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <Image style={{ marginLeft: 10, marginTop: 15, marginBottom: 9, height: 78, width: 78 }} source={{ uri: tcpImage(this.imgUrl) }} />
                                <View style={{ marginTop: 15, marginBottom: 9, flex: 1 }}>
                                    <View style={{ marginLeft: 10, marginTop: 14, flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 12, color: 'rgba(153,153,153,1)' }}>订单:</Text>
                                        <Text style={{ fontSize: 12, color: 'rgba(51,51,51,1)' }}>{this.orderNo}</Text>
                                    </View>
                                    <View style={{ marginLeft: 10, marginTop: 8, flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 12, color: 'rgba(153,153,153,1)' }}>商家:</Text>
                                        <Text style={{ fontSize: 12, color: 'rgba(51,51,51,1)' }}>{this.shopName}</Text>
                                    </View>
                                    <View style={{ marginLeft: 10, marginTop: 8, flexDirection: 'row' }}>
                                        <YFWDiscountText navigation={this.props.navigation} style_view={{ marginTop: 0, marginLeft: 3 }} style_text={{ fontSize: 15 }} value={'¥' + toDecimal(this.orderTotal)} />
                                    </View>

                                </View>
                            </View>
                            {/* 虚线 */}
                            <View style={{ flexDirection: 'row', marginLeft: 13, marginRight: 13 }}>
                                {
                                    arr.map((item, index) => {
                                        return <Text style={[{ height: 1, width: 3, marginRight: 2, flex: 1 }, { backgroundColor: '#cccccc' }]}
                                            key={'dash' + index}> </Text>
                                    })
                                }
                            </View>
                            {
                                dataLength.map((k, i) => {
                                    return (
                                        <View
                                            style={{ backgroundColor: '#FFF', padding: 10, paddingLeft: 24, paddingTop: 20, paddingBottom: 21, flexDirection: 'row', alignItems: 'center' }}
                                            key={i}>
                                            <Text style={{ fontSize: 12, color: '#333333', marginRight: 12 }}>{k}</Text>
                                            <StartScore style={{ marginRight: 15 }} currentScore={this.state.evaluationStar[i]}
                                                type={'doEvaluation'}
                                                currentStaus={'非常好'}
                                                index={i}
                                                onResult={this.onResult} />
                                        </View>
                                    )
                                })
                            }
                            {this._renderInputView()}
                            <View style={{ padding: 7, paddingLeft: 13 }}>
                                <Text style={{ fontSize: 12, color: "#cccccc" }}>*您的评价内容将匿名展示</Text>
                            </View>
                            <BaseTipsDialog ref={(item) => { this.tipsDialog = item }} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
                <View style={{ position: 'absolute', bottom: 20, left: 0,right:0,alignItems:'center',justifyContent:'center' }}>
                    <YFWWDTouchableOpacity style_title={{ height: 42, width: kScreenWidth - 24, fontSize: 17, fontWeight: 'bold' }}
                        title={'提交'}
                        callBack={() => { this._commit() }}
                        isEnableTouch={true} />
                </View>
            </View>
        )
    }
    onTextChange(text) {
        let inputText = text.replace(removeEmoji, '')
        this.setState(() => ({
            evaluationText: inputText
        })
        )
    }

    onResult = (index, count) => {
        switch (index) {
            case SERVICE_STAR: //客户服务
                this.state.evaluationStar[0] = count;
                break
            case SHIPPING_STAR: //发货速度
                this.state.evaluationStar[1] = count;
                break
            case DELIVERY_STAR: //物流速度
                this.state.evaluationStar[2] = count;
                break
            case PACKAGE_STAR: //商品包装
                this.state.evaluationStar[3] = count;
                break
        }
    }

    _commit() {
        // replaceWDNavigation(this.props.navigation, {
        //     type: kRoute_order_operation_success, title: '评价成功',
        //     orderNo: this.orderNo,
        //     from_type: 'evaluate',
        //     from: 'order_evaluation',
        //     goBackKey: this.props.navigation.state.key,
        //     pageSource: this.props.navigation.state.params.state.value.pageSource,
        // })
        // return
        if (isEmpty(this.state.evaluationText)) {
            YFWToast("评价的内容不能为空");
            return;
        }
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.order.evaluation');
        paramMap.set('orderno', this.orderNo);
        paramMap.set("content", this.state.evaluationText);
        paramMap.set("services_star", this.state.evaluationStar[0]);
        paramMap.set("send_star", this.state.evaluationStar[1]);
        paramMap.set("logistics_star", this.state.evaluationStar[2]);
        paramMap.set("package_star", this.state.evaluationStar[3]);
        viewModel.TCPRequest(paramMap, (res) => {
            if (isNotEmpty(this.orderNo)) {
                replaceWDNavigation(this.props.navigation, {
                    type: kRoute_operation_success, title: '评价成功',
                    orderNo: this.orderNo,
                    pageType: 'evaluate',
                    from: 'order_evaluation',
                    goBackKey: this.props.navigation.state.key,
                    pageSource: this.props.navigation.state.params.state.value.pageSource,
                })
            }
        })

    }

    _renderInputView() {
        return (<View style={{
            backgroundColor: '#fff', height: 100, marginLeft: 13, marginRight: 13, borderStyle: 'solid',
            borderWidth: 0.5,
            borderColor: '#cccccc'
        }}>
            <TextInput
                underlineColorAndroid='transparent'
                placeholder="写下本次购物的体验，您的评价内容和打分都将是其他网友的参考依据，并影响该商家服务评分。"
                placeholderTextColor="#cccccc"
                multiline={true}
                onChangeText={this.onTextChange.bind(this)}
                value={this.state.evaluationText}
                autoFocus={true}
                style={{ flex: 1, color: '#333333', fontSize: 12, textAlignVertical: 'top', padding: 9, paddingTop: 8 }}>

            </TextInput>
        </View>)
    }
}
