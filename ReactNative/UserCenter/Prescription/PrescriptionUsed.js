/**
 * Created by admin on 2018/6/5.
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    FlatList
} from 'react-native';
const width = Dimensions.get('window').width;
import StatusView from '../../widget/StatusView'
import { darkStatusBar, isNotEmpty, kScreenWidth, itemAddKey, isIphoneX, adaptSize, mapToJson, strMapToObj } from "../../PublicModule/Util/YFWPublicFunction";
import { yfwGreenColor } from '../../Utils/YFWColor'
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import YFWPrescriptionModel from './model/YFWPrescriptionModel';
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import CountDown from './CountDown'
import YFWEmptyView from '../../widget/YFWEmptyView';


export default class PrescriptionUsed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
        }
    }

    componentDidMount() {
        darkStatusBar();
        this.requestPrescriptionData();
    }

    render() {
        if (this.state.dataArray.length > 0) {
            return (
                <View tabLabel='已使用'>
                    <View style={{ width: kScreenWidth, height: 10, backgroundColor: '#f8f8f9' }}></View>
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

                </View>)
        } else {
            return(
            <View style={{ flex:1, alignItems: 'center'}}>
                <YFWEmptyView image={require('../../../img/ic_no_quality.png')} title={ '您没有已使用的处方单'} bgColor={'transparent'} />
            </View>)
        }
    }

    requestPrescriptionData() {
        let paramMap = new Map();
        let conditions = new Map();
        let viewModel = new YFWRequestViewModel();
        conditions.set('status', '1')
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

    _renderItem = (item) => {
        const { navigate } = this.props.navigation;
        return (
            <TouchableOpacity activeOpacity={1}>
                <View style={{ backgroundColor: 'white', marginLeft: adaptSize(13), width: kScreenWidth - adaptSize(26), marginTop: adaptSize(17), paddingBottom: adaptSize(19), borderRadius: 10, shadowOffset: { width: 0, height: 5 }, shadowColor: 'black', shadowOpacity: 0.2, elevation: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: adaptSize(19), marginHorizontal: adaptSize(21) }}>
                        <Text style={{ fontSize: 16, color: 'rgb(51,51,51)' }}>用药人姓名:
                            <Text style={{ fontSize: 16, color: 'rgb(51,51,51)' }}> {item.item.name}</Text>
                        </Text>
                        <TouchableOpacity activeOpacity={1} style={[styles.button, { borderColor: yfwGreenColor(), backgroundColor: 'white', marginRight: 20 }]}>
                            <Text style={{ color: yfwGreenColor(), fontSize: 14 }}>已使用</Text>
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
                            <CountDown
                                // date={new Date(parseInt(995))}
                                date={item.item.expire_time}
                                days={{ plural: '天', singular: '天' }}
                                hours=':'
                                mins=':'
                                segs=''
                                daysStyle={styles.prescriptionInfo}
                                hoursStyle={styles.prescriptionInfo}
                                minsStyle={styles.prescriptionInfo}
                                secsStyle={styles.prescriptionInfo}
                                firstColonStyle={styles.prescriptionInfo}
                                secondColonStyle={styles.prescriptionInfo}
                            />
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
    },
    prescriptionInfo: {
        fontSize: 12,
        color: 'rgb(153,153,153)'
    }
})
