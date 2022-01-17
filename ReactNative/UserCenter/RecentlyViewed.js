/**
 * Created by admin on 2018/7/19.
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    FlatList, DeviceEventEmitter
} from 'react-native';
import YFWToast from '../Utils/YFWToast'
const width = Dimensions.get('window').width;
import { separatorColor, yfwOrangeColor, darkNomalColor, darkLightColor, darkTextColor } from '../Utils/YFWColor'
import { isNotEmpty, isEmpty, kScreenWidth, darkStatusBar, adaptSize, isIphoneX } from '../PublicModule/Util/YFWPublicFunction'
import RNFS from 'react-native-fs';
import YFWEmptyView from '../widget/YFWEmptyView'
import { pushNavigation } from '../Utils/YFWJumpRouting'
import { toDecimal } from "../Utils/ConvertUtils";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import BaseTipsDialog from '../PublicModule/Widge/BaseTipsDialog'
import { SwipeListView, SwipeRow } from "react-native-swipe-list-view";
import { BaseStyles } from "../Utils/YFWBaseCssStyle";
import YFWTitleView from "../PublicModule/Widge/YFWTitleView"
import YFWDiscountText from "../PublicModule/Widge/YFWDiscountText";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWNoLocationHint from "../widget/YFWNoLocationHint";
import YFWSimpleSwipeRow from '../widget/YFWSimpleSwipeRow';
import YFWNativeManager from '../Utils/YFWNativeManager';

export default class RecentlyViewed extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 40, height: 40, }]}
                onPress={() => navigation.goBack()}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../img/top_back_white.png')}
                    defaultSource={require('../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerRight: (
            <TouchableOpacity
                hitSlop={{left:10,top:10,bottom:15,right:10}}
                onPress={() => {
                    navigation.state.params.rightClick()
                }}>
                <Text style={{ marginRight: 15, color: 'white' }}>清空</Text>
            </TouchableOpacity>
        ),
        tabBarVisible: false,
        headerTitle: "浏览历史",
        headerTitleStyle: {
            color: 'white', textAlign: 'center', flex: 1, fontWeight: 'bold', fontSize: 17
        },
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{ width: width, flex: 1, resizeMode: 'stretch' }} />,

    });

    constructor(props) {
        super(props);
        _this = this;
        this.text = '';
        this.state = {
            dataArray: [],
            hadDelete: false,
        }
        this.addListener()
    }

    addListener() {
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._readFile()
            }
        );
    }


    onRightTvClick() {

        if (this.state.dataArray.length > 0) {


            let _rightClick = () => {
                const path = RNFS.DocumentDirectoryPath + '/test.txt';
                return RNFS.unlink(path)
                    .then(() => {
                        this.setState({
                            dataArray: []
                        })
                    })
                    .catch((err) => {
                        YFWToast("清空失败，请稍后再试");
                    });
            }
            let bean = {
                title: "确定要清空浏览记录吗？",
                leftText: "确认",
                leftTextColor:'#16c08e',
                rightText: "取消",
                rightTextColor:'#999',
                leftClick: _rightClick
            }

            this.tipsDialog && this.tipsDialog._show(bean);

        }

    }

    componentDidMount() {
        darkStatusBar();
        this.props.navigation.setParams({
            rightClick: () => { this.onRightTvClick() }
        })
        this._readFile()
    }

    componentWillUnmount() {
        if (this.state.hadDelete) {
            this._restoreData(this.state.dataArray)
        }
        /*销毁的时候移除监听*/
        this.didFocus.remove();
        this.locationListener && this.locationListener.remove()
    }

    _restoreData(data) {
        const path = RNFS.DocumentDirectoryPath + '/test.txt';
        if (isEmpty(data) || data.length <= 0) {
            RNFS.unlink(path)
            return
        }
        let restoreArray = []
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].data.length; j++) {
                restoreArray.push(data[i].data[j])
            }
        }
        this._resetLocalData(restoreArray)
    }

    _readFile() {
        const path = RNFS.DocumentDirectoryPath + '/test.txt';

        return RNFS.readFile(path)
            .then((result) => {
                const dataArray = result.split("\r\n");
                dataArray.splice(dataArray.length - 1, 1);
                const data = this._dataHandling(dataArray);
                this.setState({
                    readTxtResult: result,
                    dataArray: this._categorizedDataByTime(data)
                })
            })
            .catch((err) => {
                console.log(err.message);

            });
    }

    _jumpToMedicienDetail(item) {
        const { navigate } = this.props.navigation;
        pushNavigation(navigate, { type: 'get_shop_goods_detail', value: item.shop_goods_id + "", img_url: item.img_url })
    }

    _onRowOpenFn(item){
        let a = item
    }

    _onRowDidOpen(item){
        let a = item
    }

    _renderDetailItem = (item) => {
        return (
            <YFWSimpleSwipeRow Data={item}
                            selectItemMethod={() => this._jumpToMedicienDetail(item.item)}
                            delFn={() => this.onDelGoos(item) }/>
        )
    }

    _renderItem = (item) => {
        let childListData = this.state.dataArray[item.index].data
        return (
            <View style={[{ width: width - 26, backgroundColor: 'white', marginLeft: 13, marginTop: 17, overflow: 'hidden' }, BaseStyles.radiusShadow]}>
                {this._renderTimeStamp(item)}
                <FlatList style={{ flex: 1 }}
                    renderItem={this._renderDetailItem}
                    keyExtractor={(item, index) => index + ''}
                    data={childListData}
                />
            </View>)

    }

    stringToJson(data) {
        return JSON.parse(data);
    }

    render() {
        if (isNotEmpty((this.state.dataArray)) && this.state.dataArray.length > 0) {
            return (
                <View style={{ flex: 1 }}><AndroidHeaderBottomLine />
                    <YFWNoLocationHint />
                    <FlatList style={{ width: width, backgroundColor: '#F5F5F5', flex: 1 }}
                        renderItem={this._renderItem}
                        keyExtractor={(item, index) => index + ''}
                        data={this.state.dataArray}
                    />
                    <BaseTipsDialog ref={(item) => { this.tipsDialog = item }} />
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1 }}><AndroidHeaderBottomLine />
                    <YFWEmptyView image={require('../../img/ic_no_footprint.png')} title={'暂无浏览记录'} showBackHome={true} navigation={this.props.navigation} />
                </View>
            )
        }
    }
    /**
     * 侧滑删除按钮
     * @returns {*}
     * @private
     */
    _renderQuickActions = (item) => {
        return (
            <View style={styles.quickAContent}>
                <TouchableOpacity style={[styles.quick, { backgroundColor: '#ff6e40', }]} onPress={() => { this.onDelGoos(item) }}>
                    <Text style={{ color: "#fff", textAlign: 'center' }}>删除</Text>
                </TouchableOpacity>
            </View>
        )
    }
    /**
     * 删除浏览记录
     */
    onDelGoos(item) {
        this.state.hadDelete = true
        let time = item.item.time_stamp;
        let shop_goods_id = item.item.shop_goods_id;
        let destPosition = -1;
        for (let i = 0; i < this.state.dataArray.length; i++) {
            if (time == this.state.dataArray[i].time_stamp) {
                destPosition = i;
            }
        }
        if (destPosition == -1) {
            return
        }
        let destArray = this.state.dataArray[destPosition].data
        let removePosition = -1;
        for (let i = 0; i < destArray.length; i++) {
            if (destArray[i].shop_goods_id == shop_goods_id) {
                removePosition = i
            }
        }
        if (removePosition == -1) {
            return
        }
        destArray.splice(removePosition, 1);
        if (this._checkIsAllDelete()) {
            this.setState({
                dataArray: []
            })
        } else {
            this.setState({})
        }
    }


    /*
    *  检测是否全部清除
    * */
    _checkIsAllDelete() {
        let allBeDeletedt = true
        for (let i = 0; i < this.state.dataArray.length; i++) {
            if (this.state.dataArray[i].data.length > 0) {
                allBeDeletedt = false
            }
        }
        return allBeDeletedt;
    }


    /*
    *  去除重复数据
    * */
    _dataHandling(dataArray) {
        if (isNotEmpty(dataArray) && dataArray.length > 0) {
            var temp = [];
            dataArray.reverse();
            let isShopMember = YFWUserInfoManager.ShareInstance().isShopMember()
            let shop_id = YFWUserInfoManager.ShareInstance().getErpShopID()
            for (let i = 0; i < dataArray.length; i++) {
                let goods_id = this.stringToJson(dataArray[i])//将item转换成json对象
                let added = false;
                for (let j = 0; j < temp.length; j++) {
                    if (goods_id.shop_goods_id == temp[j].shop_goods_id) {
                        added = true
                    }
                }
                if (isShopMember && goods_id.shop_id !== shop_id) {
                    added = true
                }
                if (!added) {
                    temp.push(this.stringToJson(dataArray[i]))
                }
            }
            this._resetLocalData(temp.reverse());
            return temp;
        }
    }


    _resetLocalData(data) {
        let newData = '';
        if (this.state.hadDelete) {
            data.reverse()
        }
        for (let i = 0; i < data.length; i++) {
            newData += JSON.stringify(data[i]) + '\r\n'
        }
        const path = RNFS.DocumentDirectoryPath + '/test.txt';
        return RNFS.writeFile(path, newData, 'utf8').then().catch();
    }

    _categorizedDataByTime(data) {
        data.reverse()
        var map = {},
            dest = [];
        for (var i = 0; i < data.length; i++) {
            var ai = data[i];
            if (!map[ai.time_stamp]) {
                dest.push({
                    time_stamp: ai.time_stamp,
                    data: [ai]
                });
                map[ai.time_stamp] = ai;
            } else {
                for (var j = 0; j < dest.length; j++) {
                    var dj = dest[j];
                    if (dj.time_stamp == ai.time_stamp) {
                        dj.data.push(ai);
                        break;
                    }
                }
            }
        }
        return dest;
    }

    _renderTimeStamp(item) {
        if (isNotEmpty(item.item.data) && item.item.data.length > 0) {
            return (<View style={{ paddingLeft: 22, paddingTop: 14, }}>
                <YFWTitleView style_title={{ width: 11 * this.state.dataArray[item.index].time_stamp.length, fontSize: 13 }} title={this.state.dataArray[item.index].time_stamp} />
            </View>)
        }
    }
}
