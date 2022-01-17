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
    NativeModules,AppState
} from 'react-native'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import { iphoneTopMargin, itemAddKey, isEmpty, isNotEmpty, tcpImage, safeObj, adaptSize, kScreenWidth } from '../../PublicModule/Util/YFWPublicFunction'
import HighlightsRecommend from './HighlightsRecommend'
import Logisticsino from './Logisticsino'
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWToast from "../../Utils/YFWToast";
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import { BaseStyles } from "../../Utils/YFWBaseCssStyle";
import LogisticsInfoModel from './Model/LogisticsInfoModel'
import { pushNavigation } from '../../Utils/YFWJumpRouting'
import YFWSubCategoryCollectionItemView from '../../FindYao/View/YFWSubCategoryCollectionItemView'
import YFWEmptyView from '../../widget/YFWEmptyView';
const { StatusBarManager } = NativeModules;
export default class ViewLogisticsInfo extends React.Component {

    static navigationOptions = ({ navigation }) => ({

        headerTitle: "物流详情",
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1, fontSize: 16
        },
        headerRight: <View style={{width:40}}/>,
        tabBarVisible: false,
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : { borderBottomWidth: 0 },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 40, height: 40, }]}
                onPress={() => navigation.goBack()}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../../img/top_back_white.png')}
                    defaultSource={require('../../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerBackground: <Image source={require('../../../img/Status_bar.png')} style={{ width: width, flex: 1, resizeMode: 'stretch' }} />,
    });

    constructor(props) {
        super(props)

        this.orderNo = this.props.navigation.state.params.state.value||this.props.navigation.state.params.state.orderNo
        this.imgUrl = this.props.navigation.state.params.state.img_url
        this.expressNo = this.props.navigation.state.params.state.expressNo
        this.state = {
            showTips: true,
            allDataArray: [{ "info": "logisticsinfo" }, { 'info': 'highlights' }],
            dataArray: ['', '', ',', ','],
            bottomDataArray: [],
            loading: false,
            data: {},
            isOpenRemind: true,
            pageIndex: 1,
            expandForm: false

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
        this.appStateListener = AppState.addEventListener('change', (state)=>{
            if (state == 'active'){
                this._pushPermissin()
            }
        })


    }

    componentWillUnmount(){
        this.appStateListener&&this.appStateListener.removeEventListener()
        this.didFocus&&this.didFocus.remove()
    }

    componentDidMount() {
        this.requestBottomData()
        this.requestInfo()
    }

    requestInfo(item) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getShippingTrace');
        paramMap.set('orderno', this.orderNo);
        if (item === 'refresh') {
            paramMap.set('is_real_query', 1);
        }
        if (this.props.navigation.state.params.state.from == 'return') {
            paramMap.set('is_return',1)
        }
        if (this.props.navigation.state.params.state.from == 'YFWInvoiceDetailPage') {
            paramMap.set('__cmd', 'person.order.getShippingTrace_Invoice');
            paramMap.set('trafficno',this.props.navigation.state.params.state.trafficno)
            paramMap.set('orderno', this.props.navigation.state.params.state.orderNo);
        }
        viewModel.TCPRequest(paramMap, (res) => {
            if (isEmpty(res.result)) {
                return
            }
            let data = LogisticsInfoModel.getModelArray(res.result);

            if (isEmpty(data.num)) {
                if (isNotEmpty(this.expressNo)) {
                    data.num = this.expressNo;
                }
            }

            if (isEmpty(data.goodsImageUrl)) {
                data.goodsImageUrl = this.imgUrl;
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
        paramMap.set('__cmd', 'guest.medicine.getTopVisitMedicine');
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
        return (
            <View style={{ width: width, height: height - headerH, backgroundColor: '#fafafa' }}>
                {this._renderTop()}
                <FlatList style={[{ backgroundColor: '#fafafa', marginTop: 12, }]}
                    renderItem={this._renderAllItem}
                    keyExtractor={(item, index) => index + 'key'}
                    //   ListHeaderComponent={this._renderHeader}
                    data={this.state.allDataArray}
                    //   ListFooterComponent={this._renderFooter}
                    onRefresh={this.onRefresh}
                    refreshing={this.state.loading}
                >
                </FlatList>
            </View>)
    }

    _renderAllItem = (item) => {
        if (item.item.info == 'logisticsinfo') {
            let partData = isNotEmpty(this.state.data.data) ? this.state.data.data.slice(0, 3) : []
            let allData = this.state.expandForm ? this.state.data.data : partData
            if (isNotEmpty(this.state.data.data) && this.state.data.data.length > 0) {
                if (this.state.data.data.length > 3) {
                    return (
                        <Logisticsino dataArray={this.state.data.items ? this.state.data.items : allData}
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
                        <Logisticsino dataArray={this.state.data.items ? this.state.data.items : allData}
                            refreshLodisticsInfo={() => this._refreshLodisticsInfo()}
                            renderHideAndShow={() => this._renderHideAndShow()} //点击切换按钮
                            switchText={''}
                            navigation={this.props.navigation} />
                        // <View/>
                    )
                }
            } else {
                return (
                    <View style={[{width:width-24,flex:1,marginLeft:12}]}>
                        <View style={[{width:width-24,backgroundColor:'#ffffff',marginBottom:4},BaseStyles.radiusShadow]}>
                            <View style={{width:width-24,}}>
                                <View style={{width:width-24,height:51,flexDirection:'row',justifyContent:'space-between', alignItems:'center', paddingTop:10}}>
                                    <Text style={{marginLeft:23,fontSize:15,color:'#333333'}}>物流跟踪</Text>
                                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:0}} onPress={()=> this._refreshLodisticsInfo()} activeOpacity={1}>
                                        <Image source={require('../../../img/Wl_icon_sx.png')}
                                               style={{marginRight:22,width:16,height:16,resizeMode:'stretch'}}/>
                                    </TouchableOpacity>
                                </View>
                                <View style={{marginLeft:23,marginRight:22,height:1,marginBottom:12,backgroundColor:'rgba(240,240,240,1)'}}/>
                            </View>
                            <View style={{padding: 10}}>
                                <YFWEmptyView image={require('../../../img/ic_no_shipping.png')} title={'暂无物流信息'} bgColor={'white'} />
                            </View>
                        </View>
                    </View>
                )
            }
        } else if (item.item.info == 'highlights') {

            return (
                <HighlightsRecommend dataArray={this.state.bottomDataArray}
                    _refreshData={() => this._refresh()} navigation={this.props.navigation} />
            )
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
                    { backgroundColor: '#ebebeb', marginLeft: 12, marginRight: 13, marginTop: this.state.isOpenRemind?20:10, },
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
                        {this.props.navigation.state.params.state.from == 'YFWInvoiceDetailPage' ? null :
                            <Image
                                style={{marginLeft: 14, marginTop: 24, width: 55 * kScreenWidth / 414, height: 62}}
                                source={{uri: tcpImage(this.state.data.goodsImageUrl)}}
                            />
                        }
                        <View style={{ marginLeft: 12, marginTop: 24, height: 62, flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{}}>
                                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: 'rgba(51,51,51,1)' }}>快递单号：</Text>
                                    <Text style={{ fontSize: 12, color: 'rgba(153,153,153,1)' }}>{trafficNo}</Text>
                                    <TouchableOpacity activeOpacity={1}
                                        hitSlop={{left:10,top:10,bottom:10,right:10}}
                                        onPress={() => { this.copyOrderNo(trafficNo) }}
                                        style={{ marginLeft: 7, width: 20, height: 13 }}>
                                        <Image style={{ width: 12, height: 13, resizeMode: 'stretch' }}
                                            source={require('../../../img/Wl_icon_fz.png')} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginTop: 14, }}>
                                    <TouchableOpacity activeOpacity={1}
                                        hitSlop={{left:10,top:0,bottom:10,right:10}}
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
                                <Image style={{ width: 22, height: 24, resizeMode: 'stretch' }}
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
        pushNavigation(navigate, {
            type: 'get_h5',
            value: web.toString(),
            name: '物流查询',
            title: '物流查询H5',
            isHiddenShare: true,
        });
    }
}
