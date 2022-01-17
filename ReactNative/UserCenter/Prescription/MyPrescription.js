import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    DeviceEventEmitter,
    NativeModules,
    Platform,
    AppState,
    ScrollView,
    FlatList
} from 'react-native';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import ScrollableTabView, { ScrollableTabBar, } from 'react-native-scrollable-tab-view';
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import { darkStatusBar, isNotEmpty, kScreenWidth, dismissKeyboard_yfw, isIphoneX, adaptSize ,strMapToObj,itemAddKey, safe} from "../../PublicModule/Util/YFWPublicFunction";
import { BaseStyles } from "../../Utils/YFWBaseCssStyle";
import YFWEmptyView from '../../widget/YFWEmptyView'
import YFWPrescriptionModel from './model/YFWPrescriptionModel';
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import YFWScrollableTabBar from '../../PublicModule/Widge/YFWScrollableTabBar'
import YFWMore from '../../widget/YFWMore';
import { orangeColor } from '../../Utils/YFWColor'
import YFWToast from '../../Utils/YFWToast'
import { yfwGreenColor } from '../../Utils/YFWColor'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import PrescriptionUnUsed from './PrescriptionUnUsed';
import PrescriptionExceed from './PrescriptionExceed';
import PrescriptionUsed from './PrescriptionUsed';
import YFWRxInfoTipsAlert from '../../OrderPay/View/YFWRxInfoTipsAlert';


const { StatusBarManager } = NativeModules;
export default class MyPrescription extends Component {

    static navigationOptions = ({ navigation }) => ({

        headerRight: <View style={{ width: 50 }} />,
        tabBarVisible: false,
        headerTitle: "我的处方",
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1, fontWeight: 'bold', fontSize: 17
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 40, height: 40, }]}
                onPress={() => navigation.goBack()}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../../img/top_back_white.png')}
                    defaultSource={require('../../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerRight: <View style={{ width: 50 }} />,
        headerBackground: <Image source={require('../../../img/Status_bar.png')} style={{ width: kScreenWidth, flex: 1, resizeMode: 'stretch' }} />
    });



    constructor(props) {
        super(props);
        this_2 = this
        this.state = {
            pageSource: undefined,
            notificationNotice: false,
            initialPage: 0,
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
        }
        this.deleteInfo = null

        darkStatusBar();
        this.listener();
    }
    componentDidMount() {
        darkStatusBar();
        this.requestPrescriptionData();
    }
    componentWillUnmount() {
        this.didFocus.remove()
        this.appStateListener && this.appStateListener.removeEventListener()
    }

    _seachOrderCallBack() {
        DeviceEventEmitter.emit('change_tabs', this.state.pageSource)
    }

    _changerType(i) {
        this.state.pageSource = i;
        DeviceEventEmitter.emit('change_tabs', i)
    }

    listener() {
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._updateNotificationStatus()
            }
        );
        this.appStateListener = AppState.addEventListener('change', (state) => {
            if (state == 'active') {
                this._updateNotificationStatus()
            }
        })
    }

    _updateNotificationStatus() {
        YFWNativeManager.isOpenNotification((openStatus) => {
            this.setState({
                notificationNotice: !openStatus
            })
        })
    }
    render() {
        const { navigate } = this.props.navigation;
        if (this.state.dataArray.length > 0) {
            return (
                <View >
                    <FlatList
                        ItemSeparatorComponent={this._splitView}
                        renderItem={this._renderItem}
                        keyExtractor={(item, index) => item.order_no}
                        data={this.state.dataArray}
                        listKey={(item, index) => item.order_no}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1}
                        refreshing={this.state.loading}
                        onRefresh={this.onRefresh} >
                    </FlatList>
                    <YFWRxInfoTipsAlert ref = {(item) => {this.rxInfoAlert = item}}  actions={[{title:'取消',callBack:()=>{this.deleteInfo = null}},{title:'确定',callBack:()=>{this._requestDelete(this.deleteInfo)}}]}/>
                </View>)
        } else {
            return(
            <View style={{ flex:1, alignItems: 'center'}}>
                <YFWEmptyView image={require('../../../img/ic_no_quality.png')} title={ '您没有处方单'} bgColor={'transparent'} />
            </View>)
        }
    }

    requestPrescriptionData() {
        let paramMap = new Map();
        let conditions = new Map();
        let viewModel = new YFWRequestViewModel();
        conditions.set('status', '2')
        paramMap.set('__cmd', 'person.account.getPageData_person');
        paramMap.set('pageSize', 10);
        paramMap.set('conditions', strMapToObj(conditions));
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('orderFiled', '');
        viewModel.TCPRequest(paramMap, (res) => {
            let showFoot = 0;
            let dataArray = YFWPrescriptionModel.getModelArray(res.result.dataList);
            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.dataArray.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);

            this.setState({
                dataArray: dataArray,
                loading: false,
                showFoot: showFoot
            });
        }, (error) => {
            this.setState({
                loading: false
            })
        }, this.state.pageIndex == 1 ? true : false);

    }

    _splitView() {
        return (
            <View style={{ backgroundColor: '#F5F5F5', width: width }} height={0} />
        );
    }


    _onEndReached() {
        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this.requestPrescriptionData();
    }

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot} />
    }

    _showPrescriptionPic(url) {
        const { navigate } = this.props.navigation;
        if (isNotEmpty(url)) {
            pushNavigation(navigate, { type: 'Prescription_Detail', prescription_img_url: url })
        }
    }

    _delectAction(info) {
        this.deleteInfo=info;this.rxInfoAlert && this.rxInfoAlert.showView("是否确定删除该处方信息？")
    }
    _requestDelete(info) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.account.pseudoDelete');
        paramMap.set('inquiryid', safe(info.item.id));
        viewModel.TCPRequest(paramMap, (res) => {
            if (res.result) {
                this.state.dataArray.splice(info.index,1)
                this.setState({})
                if (this.state.dataArray.length == 0) {
                    this.state.pageIndex = 1
                    this.requestPrescriptionData()
                }
            }
        }, (error) => {
            if (error&&error.msg) {
                YFWToast(error.msg)
            } else {
                YFWToast('操作失败')
            }
        });
    }

    _renderItem = (item) => {
        const { navigate } = this.props.navigation;
        return (
            <TouchableOpacity activeOpacity={1}>
            <View style={{ backgroundColor: 'white', marginLeft: adaptSize(13), width: kScreenWidth - adaptSize(26), marginTop: adaptSize(17), paddingBottom: adaptSize(19), borderRadius: 10, shadowOffset: { width: 0, height: 5 }, shadowColor: 'black', shadowOpacity: 0.2, elevation: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: adaptSize(19), marginLeft: adaptSize(21) }}>
                    <Text style={{ fontSize: 16, color: 'rgb(51,51,51)' }}>用药人姓名:
                        <Text style={{ fontSize: 16, color: 'rgb(51,51,51)' }}> {item.item.name}</Text>
                    </Text>
                    <View style={{flex:1}}></View>
                    <TouchableOpacity activeOpacity={1} style={[styles.button, { borderColor: '#a9a9a9', backgroundColor: 'white', marginRight: 10 }]} onPress={() => { this._delectAction(item) }}>
                        <Text style={{ color: '#999', fontSize: 12 }}>删除</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={[styles.button, { borderColor: yfwGreenColor(), backgroundColor: yfwGreenColor(), marginRight: 12 }]} onPress={() => { this._showPrescriptionPic(item.item.img_url) }}>
                        <Text style={{ color: 'white', fontSize: 12 }}>查看详情</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', marginTop: adaptSize(15), marginHorizontal: adaptSize(21) }}>确诊疾病名称:
                    <Text style={{ fontSize: 13, color: 'rgb(153,153,153)' }}> {item.item.disease_name}</Text>
                </Text>
                <Text style={{ fontSize: 13, color: 'rgb(153,153,153)', marginTop: adaptSize(10), marginHorizontal: adaptSize(21) }}>关联订单:
                    <Text style={{ fontSize: 13, color: 'rgb(153,153,153)' }}>  {item.item.orderno}</Text>
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: adaptSize(10), marginHorizontal: adaptSize(21) }}>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Text style={{ fontSize: 12, color: 'rgb(153,153,153)' }}>开方:</Text>
                        <Text numberOfLines={1} style={{ fontSize: 12, color: 'rgb(153,153,153)', flex: 1 }}> {item.item.start_time} </Text>

                    </View>
                </View>
            </View>
        </TouchableOpacity>
        );
    };
}


onRefresh = () => {
    this.setState({
        loading: true
    });
    this.requestPrescriptionData();
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    pagerView: {
        flex: 3,
        backgroundColor: 'white'
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    button: {
        paddingHorizontal: 15,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
