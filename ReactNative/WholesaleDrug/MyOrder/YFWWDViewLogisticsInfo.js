import React from 'react'
import {
    View,
    Platform,
    Dimensions,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    FlatList,
    NativeModules, AppState
} from 'react-native'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import { iphoneTopMargin, itemAddKey, isEmpty, isNotEmpty, tcpImage, safeObj, adaptSize, kScreenWidth, kStyleWholesale } from '../../PublicModule/Util/YFWPublicFunction'
// import HighlightsRecommend from '../../UserCenter/order/HighlightsRecommend'
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWToast from "../../Utils/YFWToast";
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import { BaseStyles } from "../../Utils/YFWBaseCssStyle";
import YFWEmptyView from '../../widget/YFWEmptyView';
import YFWHeaderLeft from '../Widget/YFWHeaderLeft';
import YFWHeaderBackground from '../Widget/YFWHeaderBackground';
import { yfwBlueColor } from '../../Utils/YFWColor';
import { pushWDNavigation, kRoute_html } from '../YFWWDJumpRouting';
import YFWWDTraceLogisticsinfoView from './View/YFWWDTraceLogisticsinfoView';
import YFWWDLogisticsInfoModel from './Model/YFWWDLogisticsInfoModel';
const { StatusBarManager } = NativeModules;
export default class YFWWDViewLogisticsInfo extends React.Component {

    static navigationOptions = ({ navigation }) => ({

        headerTitle: "物流详情",
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1, fontSize: 16
        },
        headerRight: <View style={{ width: 40 }} />,
        tabBarVisible: false,
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomWidth: 0 },
        headerLeft: (
            <YFWHeaderLeft navigation={navigation}></YFWHeaderLeft>
        ),
        headerBackground: <YFWHeaderBackground from={kStyleWholesale}></YFWHeaderBackground>,
    });

    constructor(props) {
        super(props)

        this.orderNo = this.props.navigation.state.params.state.orderNo
        this.imgUrl = this.props.navigation.state.params.state.img_url
        this.expressNo = this.props.navigation.state.params.state.expressNo
        this.state = {
            showTips: true,
            allDataArray: [{ "info": "logisticsinfo" }],//{ 'info': 'highlights' }
            dataArray: ['', '', ',', ','],
            bottomDataArray: [],
            loading: false,
            data: {},
            isOpenRemind: true,
            pageIndex: 1,
            expandForm: false,
            selfLogisticsInfos:[
                {title:'配送方式：',value:'自主配送'},
                {title:'配送人员：',value:'梁朝伟'},
                {title:'联系电话：',value:'12823787872'},
            ]

        }
        this.listener();
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._pushPermissin()
            }
        );
        this.appStateListener = AppState.addEventListener('change', (state) => {
            if (state == 'active') {
                this._pushPermissin()
            }
        })


    }

    componentWillUnmount() {
        this.appStateListener && this.appStateListener.removeEventListener()
        this.didFocus && this.didFocus.remove()
    }

    componentDidMount() {
        // this.requestBottomData()
        this.requestInfo()
    }

    requestInfo(item) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.getShippingTrace');
        paramMap.set('orderno', this.orderNo);
        if (item === 'refresh') {
            paramMap.set('is_real_query', 1);
        }
        if (this.props.navigation.state.params.state.from == 'return') {
            paramMap.set('is_return', 1)
        }
        viewModel.TCPRequest(paramMap, (res) => {
            if (isEmpty(res.result)) {
                return
            }
            let data = YFWWDLogisticsInfoModel.getModelArray(res.result);

            if (isEmpty(data.num)) {
                if (isNotEmpty(this.expressNo)) {
                    data.num = this.expressNo;
                }
            }
            this.setState({
                data: data,
                loading: false,
            })
        }, (error) => {
            this.setState({
                loading: false
            })
        }, true);

    }

    requestBottomData() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.medicine.getTopVisitMedicine');
        paramMap.set('limit', 6);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if (isEmpty(res.result)) return;
            let dataArray = res.result;
            this.setState({
                bottomDataArray: dataArray,
            });
        }, null, false);

    }

    onRefresh = () => {
        this.setState({
            loading: true
        });
        this.requestInfo()
    }

    render() {
        let headerH = (Platform.OS === 'ios') ? (44 + iphoneTopMargin() - 20) : Platform.Version > 19 ? 50 + StatusBarManager.HEIGHT : 50;
        let is_self_logistic = false
        if (is_self_logistic) {
            return (
                <View style={{ width: width, height: height - headerH, backgroundColor: '#fafafa' }}>
                    <View style={{
                        backgroundColor: 'white',
                        shadowColor: "rgba(204, 204, 204, 0.5)",
                        shadowOffset: {
                            width: 0,
                            height: 3
                        },
                        shadowRadius: 8,
                        shadowOpacity: 1,
                        borderRadius: 8,
                        marginTop: 15, marginHorizontal: 12, paddingVertical: 10, paddingHorizontal: 21
                    }}>
                        {this._renderTextInfoView('发货物流：','已发货',yfwBlueColor())}
                        <View style={{backgroundColor:'#ccc',height:0.5,marginHorizontal:1,opacity:0.3,marginVertical:10}}></View>
                        {this.state.selfLogisticsInfos.map((item)=>{
                            return this._renderTextInfoView(item.title,item.value)
                        })}
                <Text style={{color:'#999',fontSize:13,marginTop:15}}>{'本次订单由商家自主物流配送，如有疑问请联系商家。'}</Text>
                    </View>
                </View>
            )
        }
        return (
            <View style={{ width: width, height: height - headerH, backgroundColor: '#fafafa' }}>
                {this._renderTop()}
                <FlatList style={[{ backgroundColor: '#fafafa', marginTop: 12, }]}
                    renderItem={this._renderAllItem}
                    keyExtractor={(item, index) => index + 'key'}
                    data={this.state.allDataArray}
                    onRefresh={this.onRefresh}
                    refreshing={this.state.loading}
                >
                </FlatList>
            </View>
        )
    }

    _renderTextInfoView(title,value,textColor) {
        if (isEmpty(textColor)) {
            textColor = '#333'
        }
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' ,marginTop:5}}>
                <Text style={{ color: '#999', fontSize: 13 }}>{title}</Text>
                <Text style={{ color: textColor, fontSize: 13, marginLeft: 3 }}>{value}</Text>
            </View>
        )
    }

    _renderAllItem = (item) => {
        if (item.item.info == 'logisticsinfo') {
            let partData = isNotEmpty(this.state.data.data) ? this.state.data.data.slice(0, 3) : []
            let allData = this.state.expandForm ? this.state.data.data : partData
            if (isNotEmpty(this.state.data.data) && this.state.data.data.length > 0) {
                if (this.state.data.data.length > 3) {
                    return (
                        <YFWWDTraceLogisticsinfoView dataArray={this.state.data.items ? this.state.data.items : allData}
                            refreshLodisticsInfo={() => this._refreshLodisticsInfo()}
                            renderHideAndShow={() => this._renderHideAndShow()} //点击切换按钮
                            switchText={this.state.expandForm ? '收起快递详情' : '点击查看物流详情'}
                            switchImage={
                                this.state.expandForm ? require('../../../img/Wl_icon_dropup.png') : require('../../../img/Wl_icon_dropdown.png')
                            }
                            navigation={this.props.navigation} />
                    )
                } else {
                    return (
                        <YFWWDTraceLogisticsinfoView dataArray={this.state.data.items ? this.state.data.items : allData}
                            refreshLodisticsInfo={() => this._refreshLodisticsInfo()}
                            renderHideAndShow={() => this._renderHideAndShow()} //点击切换按钮
                            switchText={''}
                            navigation={this.props.navigation} />
                        // <View/>
                    )
                }
            } else {
                return (
                    <View style={[{ width: width - 24, flex: 1, marginLeft: 12 }]}>
                        <View style={[{ width: width - 24, backgroundColor: '#ffffff', marginBottom: 4 }, BaseStyles.radiusShadow]}>
                            <View style={{ width: width - 24, }}>
                                <View style={{ width: width - 24, height: 51, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
                                    <Text style={{ marginLeft: 23, fontSize: 15, color: '#333333' }}>物流跟踪</Text>
                                    <TouchableOpacity onPress={() => this._refreshLodisticsInfo()} activeOpacity={1}>
                                        <Image source={require('../../../img/Wl_icon_sx.png')}
                                            style={{ marginRight: 22, width: 16, height: 16, resizeMode: 'stretch' }} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginLeft: 23, marginRight: 22, height: 1, marginBottom: 12, backgroundColor: 'rgba(240,240,240,1)' }} />
                            </View>
                            <View style={{ padding: 10 }}>
                                <YFWEmptyView image={require('../../../img/ic_no_shipping.png')} title={'暂无物流信息'} bgColor={'white'} />
                            </View>
                        </View>
                    </View>
                )
            }
        } else if (item.item.info == 'highlights') {

            // return (
            //     <HighlightsRecommend dataArray={this.state.bottomDataArray}
            //         _refreshData={() => this._refresh()} navigation={this.props.navigation} />
            // )
        }
    };

    _renderHideAndShow() {
        this.setState({
            expandForm: !this.state.expandForm
        })
    }
    _renderTop() {
        let trafficNo = isNotEmpty(this.state.data.num) ? this.state.data.num : this.state.data.trafficno
        return (
            <View style={{ width: width }}>
                {this.state.isOpenRemind ? <View /> :
                    <View style={{ flexDirection: 'row', backgroundColor: '#fdf8c5', padding: 10, alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: '#EABD1C' }}>未开启通知，收不到提醒哦</Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => { YFWNativeManager.openSetting() }} activeOpacity={1}
                            style={{ borderWidth: 1, borderColor: '#EABD1C', paddingLeft: 20, paddingRight: 20, backgroundColor: '#FFEAB332', paddingBottom: 5, paddingTop: 5 }}>
                            <Text style={{ fontSize: 14, color: '#EABD1C' }}>去设置</Text>
                        </TouchableOpacity>
                    </View>}
                <View style={[
                    { backgroundColor: '#ebebeb', marginLeft: 12, marginRight: 13, marginTop: this.state.isOpenRemind ? 20 : 10, },
                    BaseStyles.radiusShadow]}>
                    <View style={[{ height: 27, flexDirection: 'row' }]}>
                        <View style={[
                            { flexDirection: 'row', backgroundColor: '#ffffff', alignItems: 'center', borderTopLeftRadius: 7, borderTopRightRadius: 7 }
                        ]}>
                            <Image style={{ marginLeft: 10, height: 27, width: 70, marginRight: 10, resizeMode: 'contain' }}
                                source={{ uri: safeObj(this.state.data.logo) }} />
                            {/* <Text style={{marginRight:17}}>{this.state.data.name}</Text> */}
                        </View>
                        <View style={{ justifyContent: 'center', marginLeft: 7 }}>
                            <Text style={{ fontSize: 13, color: '#666666' }}>{'物流状态：' + safeObj(this.state.data.state_name)}</Text>
                        </View>

                    </View>
                    <View style={[
                        { backgroundColor: '#ffffff', height: 112, flexDirection: 'row', borderBottomLeftRadius: 7, borderBottomRightRadius: 7 }
                    ]}>
                        <Image style={{ marginLeft: 14, marginTop: 24, width: 55 * kScreenWidth / 414, height: 62 }} source={{ uri: tcpImage(this.imgUrl) }} />
                        <View style={{ marginLeft: 12, marginTop: 24, height: 62, flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{}}>
                                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: 'rgba(51,51,51,1)' }}>快递单号：</Text>
                                    <Text style={{ fontSize: 12, color: 'rgba(153,153,153,1)' }}>{trafficNo}</Text>
                                    <TouchableOpacity activeOpacity={1}
                                        onPress={() => { this.copyOrderNo(trafficNo) }}
                                        style={{ marginLeft: 7, width: 20, height: 13 }}>
                                        <Image style={{ width: 12, height: 13, resizeMode: 'stretch', tintColor: yfwBlueColor() }}
                                            source={require('../../../img/Wl_icon_fz.png')} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginTop: 14, }}>
                                    <TouchableOpacity activeOpacity={1}
                                        onPress={() => { this._viewLogistics(this.state.data.web) }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12, color: 'rgba(51,51,51,1)' }}>物流网站：</Text>
                                        <Text style={{ fontSize: 12, color: 'rgba(153,153,153,1)' }}>{this.state.data.web}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity activeOpacity={1} style={[{ width: 51, height: 40, marginTop: 11, marginRight: 11, alignItems: 'center' }]}
                                onPress={() => {
                                    YFWNativeManager.takePhone(this.state.data.phone)
                                }}>
                                <Image style={{ width: 22, height: 24, resizeMode: 'stretch', tintColor: yfwBlueColor() }}
                                    source={require('../../../img/Wl_icon_kf.png')} />
                                <Text style={{ marginTop: 5, fontSize: 10, color: "#999999" }}>物流客服</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </View>
        )
    }

    _pushPermissin() {
        YFWNativeManager.isOpenNotification((openStatus) => {
            this.setState(() => ({ isOpenRemind: openStatus, }))
        });
    }

    _refreshLodisticsInfo() {
        this.requestInfo('refresh');
    }


    _refresh() {

        this.setState({
            loading: false,
            showFoot: 2
        })
        this.requestBottomData();
    }

    copyOrderNo(orderNo) {

        if (isNotEmpty(orderNo)) {
            YFWToast('复制成功');
            YFWNativeManager.copyLink(orderNo);

        }
    }

    _viewLogistics(web) {
        if (isEmpty(web)) {
            return
        }
        let { navigate } = this.props.navigation;
        pushWDNavigation(navigate, {
            type: kRoute_html,
            value: web.toString(),
            name: '物流查询',
            title: '物流查询H5',
            isHiddenShare: true,
        });
    }
}
