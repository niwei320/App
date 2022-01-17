/**
 * Created by 12345 on 2018/4/20.
 */
import React, { Component } from 'react';
import {
    View,
    NativeModules,
    SectionList,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet, Platform
} from 'react-native';
import { BaseStyles } from "../../../Utils/YFWBaseCssStyle";
import {
    getFirstLetterPinYin,
    iphoneTopMargin,
    isNotEmpty,
    kScreenWidth,
    isEmpty,
    safeObj,
    kScreenHeight
} from "../../../PublicModule/Util/YFWPublicFunction";
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import { LargeList } from "react-native-largelist-v3";
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel';
const {StatusBarManager} = NativeModules;
export default class YFWWDLogisticsCompany extends Component {

    static navigationOptions = ({navigation}) => ({
        headerTitleStyle: {
            color: '#333',textAlign: 'center',flex: 1, fontWeight: 'normal', fontSize:17
        },
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor:'white',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0, backgroundColor:'white'},
        headerRight: (
            <TouchableOpacity activeOpacity={1}
                onPress={() => {}}>
                <Text style={{marginRight:15,fontSize:14,color:'white'}}></Text>
            </TouchableOpacity>
        ),
        tabBarVisible: false,
        headerTitle: "物流公司"

    });


    static defaultProps = {
        dataArray: [],
        selectData: [],
    }

    constructor(props, context) {

        super(props, context);
        this.state = {
            dataArray: [],
            selectData: [],
            groupArray: [],
            largeListArray: []
        }
        this.getItemLayout = sectionListGetItemLayout({
            // The height of the row with rowData at the given sectionIndex and rowIndex
            getItemHeight: (rowData, sectionIndex, rowIndex) => 45,
            // These three properties are optional
            getSeparatorHeight: () => 0, // The height of your separators
            getSectionHeaderHeight: () => 30, // The height of your section headers
            getSectionFooterHeight: () => 0, // The height of your section footers
        })
    }

    componentDidMount() {

        this._requestDataFromServer();
    }

    render() {

        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                {this.renderList()}
                {this.renderIndexesView()}
            </View>
        );

    }

    renderIndexesView() {

        if (!this.state.groupArray || this.state.groupArray.length == 0) {
            return null
        }
        let indexs = []
        this.state.groupArray.map((item, index) => {
            indexs.push(
                <TouchableOpacity hitSlop={{ top: 0, left: 15, bottom: 0, right: 5 }} onPress={() => { this._srorllToIndex(index) }}>
                    <Text style={{ color: 'white', fontSize: 12, lineHeight: 15, textAlign: 'center' }}>{item.key}</Text>
                </TouchableOpacity>
            )
        })

        return (
            <TouchableOpacity activeOpacity={1} onPress={() => { }} hitSlop={{ right: 40 }} style={{ position: 'absolute', width: 30, height: kScreenHeight, top: 0, right: 2, alignItems: 'center', justifyContent: "center" }}>
                <View style={{ backgroundColor: '#aaa', width: 22, borderRadius: 11 }}>
                    <View style={{ height: 11 }}></View>
                    {indexs}
                    <View style={{ height: 11 }}></View>
                </View>
            </TouchableOpacity>
        )
    }

    renderList() {
        if (Platform.OS == 'ios') {
            return (
                <SectionList
                    ref={(list) => this._sectionList = list}
                    renderSectionHeader={this.renderSectionHeader}
                    sections={this.state.groupArray}
                    getItemLayout={this.getItemLayout}
                // getItemLayout={(data, index) => ( {length: 45, offset: 45 * index, index} )}
                />
            );
        } else {
            return (
                <LargeList
                    ref={(list) => this._sectionList = list}     //后面在滚动时，用它来做标识，明确操作的是哪一个
                    data={this.state.largeListArray}         //传入的数据
                    // numberOfSections={()=>this.state.groupArray?this.state.groupArray.length:0}    //本数据中有多少个组
                    // numberOfRowsInSection={section => this.state.groupArray[section].data?this.state.groupArray[section].data.length:0}    //某一组中，有多少条数据
                    renderSection={this._renderLargeSectionHeader.bind(this)}           //组名的渲染方法
                    renderIndexPath={this._renderLargeListItem.bind(this)}                //组内数据的渲染方法
                    heightForIndexPath={() => 45}            //渲染每一条数据时，所占的高是多少
                    heightForSection={() => 30}      //渲染时，每个组名所占的高是多少
                />
            );
        }

    }

    _renderLargeListItem = ({ section: section, row: row }) => {
        let item = this.state.largeListArray[section].items[row]
        let textColor = item.select ? '#1fdb9b' : '#333'
        return (
            <View style={{ height: 45, backgroundColor: 'white' }}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView, { flex: 1 }]}
                    onPress={() => { this._selectGroupItem(item) }}>
                    <View style={[BaseStyles.leftCenterView, { flex: 1 }]}>
                        <Text style={[BaseStyles.titleWordStyle, { marginLeft: 27, fontSize: 15, color: textColor }]}>{item.name}</Text>
                    </View>
                    {item.select ? <Image style={{ width: 18, height: 11, resizeMode: 'contain', marginRight: 47 }}
                        source={require('../../../../img/duihao.png')} /> : null}
                </TouchableOpacity>
                <View style={[BaseStyles.separatorStyle, { marginLeft: 27 }]} />
            </View>
        );
    }

    _renderLargeSectionHeader = (section) => {
        let item = this.state.groupArray[section]
        return (
            <View style={[BaseStyles.leftCenterView, { height: 30, backgroundColor: '#fafafa' }]}>
                <Text style={{ fontSize: 15, color: '#333', marginLeft: 29 }}>{item.key}</Text>
            </View>
        );

    }
    _renderListItem = (item) => {

        let value = item.item.name
        return (
            <View style={{ height: 45, backgroundColor: 'white' }}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView, { flex: 1 }]}
                    onPress={() => this._selectItem(item.item)}>
                    <View style={[BaseStyles.leftCenterView, { flex: 1 }]}>
                        <Text style={[BaseStyles.titleWordStyle, { marginLeft: 15, fontSize: 16 }]}>{value}</Text>
                    </View>
                    {this._renderCanShowSelect(item.item)}
                </TouchableOpacity>
                <View style={[BaseStyles.separatorStyle]} />
            </View>
        );

    }


    renderSectionHeader({ section }) {

        return (
            <View style={[BaseStyles.leftCenterView, { height: 30, backgroundColor: '#fafafa' }]}>
                <Text style={{ fontSize: 15, color: '#333', marginLeft: 29 }}>{section.key}</Text>
            </View>
        );

    }

    _renderSectionList({ item }) {

        let textColor = item.select ? '#1fdb9b' : '#333'
        return (
            <View style={{ height: 45, backgroundColor: 'white' }}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView, { flex: 1 }]}
                    onPress={() => { this._selectGroupItem(item) }}>
                    <View style={[BaseStyles.leftCenterView, { flex: 1 }]}>
                        <Text style={[BaseStyles.titleWordStyle, { marginLeft: 27, fontSize: 15, color: textColor }]}>{item.name}</Text>
                    </View>
                    {item.select ? <Image style={{ width: 18, height: 11, resizeMode: 'contain', marginRight: 47 }}
                        source={require('../../../../img/duihao.png')} /> : null}
                </TouchableOpacity>
                <View style={[BaseStyles.separatorStyle, { marginLeft: 27 }]} />
            </View>
        );
    }


    _renderCanShowSelect(item) {

        if (this._includeItem(item)) {
            return (
                <Image style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 15 }}
                    source={require('../../../../img/chooseBtn.png')} />
            );
        }

    }


    //Action


    _srorllToIndex(index) {
        if (Platform.OS == 'ios') {
            this._sectionList.scrollToLocation({ sectionIndex: index, itemIndex: 0, viewOffset: 30 })
        } else {
            this._sectionList.scrollToIndexPath({ section: index, row: -1 }, true)
        }
    }

    _requestDataFromServer() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getShippingUnitList');
        viewModel.TCPRequest(paramMap, (res)=> {
            this.setState({
                dataArray: res.result
            });
            this.state.dataArray = res.result
            this.groupDataMethod()
        },(error)=>{
            console.log(error)
        });

    }

    _saveMethod() {
        if (this.props.navigation.state.params.state.callBack) {
            this.props.navigation.state.params.state.callBack(this.state.selectData);
        }
        this.props.navigation.goBack()
    }

    _selectItem(item) {

        // if (this._includeItem(item)) {
        //     this.state.selectData.splice(this.state.selectData.findIndex(x => x === item), 1)
        // } else {
        //     this.state.selectData.push(item);
        // }
        this.state.selectData = [item]

        this.setState({
            selectData: this.state.selectData,
        });


    }

    checkId(item) {
        let has = false;
        for (let i = 0; i < this.state.selectData.length; i++) {
            if (this.state.selectData[i].id == item.id) {
                has = true
            }
        }
        return has;
    }

    _includeItem(item) {
        if (typeof item == 'string') {
            if (isEmpty(item.id)) {
                return this.state.selectData.includes(item); //检测是否包含
            } else {
                { this.checkId(item) }
            }
        } else {
            return this.state.selectData.some(function (x) { //方法用于检测数组中的元素是否满足指定条件
                return x.id == item.id
            });
        }

    }

    _selectGroupItem(item) {
        this.state.selectData = [item];

        this.groupDataMethod();
        this._saveMethod()

    }

    _getIndexInArray(item) {
        let i = -1;
        for (let j = 0; j < this.state.selectData.length; j++) {
            if (this.state.selectData[j].id == item.id) {
                i = j
            }
        }
        return i;
    }


    groupDataMethod() {
        let groupBaseArray = [];
        for (let i = 0; i < this.state.dataArray.length; i++) {
            let item = this.state.dataArray[i];
            let value, id;
            value = item.name
            if (isNotEmpty(item.id)) {
                id = item.id;
            }
            let key = getFirstLetterPinYin(value).charAt(0);
            let groupArray = [];
            if (groupBaseArray.some(function (x) {
                return x.key == key
            })) {

                groupBaseArray.forEach((value, index, array) => {
                    if (value.key == key) {
                        groupArray = value.data;
                    }
                });
                if (isNotEmpty(id)) {
                    groupArray.push({ name: value, select: this._includeItem(item), id: id });
                } else {
                    groupArray.push({ name: value, select: this._includeItem(item) });
                }
            } else {
                if (isNotEmpty(id)) {
                    groupArray.push({ name: value, select: this._includeItem(item), id: id });
                } else {
                    groupArray.push({ name: value, select: this._includeItem(item) });
                }
                let groupMap = { key: key, data: groupArray, renderItem: this._renderSectionList.bind(this) };
                groupBaseArray.push(groupMap);
            }

        }

        groupBaseArray = this.sortKeyword(groupBaseArray)
        const data = [];
        for (let section = 0; section < groupBaseArray.length; ++section) {
            const sContent = { items: [] };
            for (let row = 0; row < groupBaseArray[section].data.length; ++row) {
                sContent.items.push(groupBaseArray[section].data[row]);
            }
            data.push(sContent);
        }
        this.setState({
            groupArray: groupBaseArray,
            largeListArray: data,
        });
    }

    /**
     * 排序
     * @param array
     * @returns {*}
     */
    sortKeyword(array) {
        array.sort((a, b) => {
            return a.key.localeCompare(b.key)
        })

        let index = -1
        for (let i = 0; i < array.length; i++) {
            if (safeObj(safeObj(array[i]).key) > '9') {
                index = i
                break
            }
        }

        let end = array.slice(0, index)
        let start = array.slice(index, array.length)
        start.push(...end)
        return start
    }

}



const styles = StyleSheet.create({
    contentStyle: {
        height: 50,
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 10,
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: 0.5,
        borderTopWidth: 0,
        flexDirection: "row"
    }


})