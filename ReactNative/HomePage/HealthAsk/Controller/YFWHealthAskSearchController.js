import React, { Component } from 'react';
import {
    Platform,
    View,
    FlatList,
    TextInput,
    Image,
    Text,
    TouchableOpacity,
    Keyboard,
    NativeModules,
    StatusBar,
    ImageBackground,
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    kScreenHeight,
    isNotEmpty,
    isIphoneX,
    iphoneTopMargin
} from "../../../PublicModule/Util/YFWPublicFunction";
import { yfwGreenColor, backGroundColor, darkTextColor, darkLightColor, separatorColor } from '../../../Utils/YFWColor'
import { pushNavigation } from "../../../Utils/YFWJumpRouting";
import { BaseStyles } from "../../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWHealthAskQuestionItemView from '../View/YFWHealthAskQuestionItemView'
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent'
import YFWEmptyView from '../../../widget/YFWEmptyView'
import YFWHealthAskAssociationItemView from "../View/YFWHealthAskAssociationItemView";
import YFWHealthAskSearchItemModel from "../../../HomePage/HealthAsk/Model/YFWHealthAskSearchItemModel";
import YFWHealthAskIndexModel from "../Model/YFWHealthAskIndexModel";
import { EMOJIS } from '../../../PublicModule/Util/RuleString';
const { StatusBarManager } = NativeModules;
export default class YFWHealthAskSearchController extends Component {

    static navigationOptions = ({ navigation }) => ({

        tabBarVisible: false,
        header: null,
    });


    static defaultProps = {

    }

    constructor(props, context) {

        super(props, context);

        this.state = {
            searchText: '',
            edit: true,
            type: 1,
            dataInfo: {},
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
        }
    }

    componentDidMount() {

        this._handleData();

    }

    //@ Action

    //点击热搜
    _clickHotItemMethod(badge) {

        const { navigate } = this.props.navigation;
        pushNavigation(navigate, { type: 'get_ASK_all_category', categoryid: badge.dep_id, title: badge.dep_name, py_name: badge.py_name, parent_py: badge.parent_py ? badge.parent_py : badge.py_name });

    }

    //搜索框变化
    onChangeText(text) {
        text = text.replace(EMOJIS, '')
        this.setState({
            searchText: text,
            edit: true,
        });

        if (text.length > 0) {

            if (this.state.type != 2) {
                this.setState({
                    type: 2,
                });
            }
            this._requestSearchResult(text, true);


        } else {
            this.setState({
                type: 1,
                resetFilter: true,
            });
        }

    }

    clickSearchMethod(keywords) {
        Keyboard.dismiss();

        if (keywords.length > 0) {
            this._requestSearchData(keywords);
            this.setState({
                selectedIndex: 1,
            })
        }
    }


    _onRefresh() {

        this.state.pageIndex = 1;
        this.setState({
            loading: true
        });
        this._requestSearchData(this.keyWords);

    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this._requestSearchData(this.keyWords);

    }


    //@Request
    _handleData() {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.ask.getIndex_APP');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            let dataArray = YFWHealthAskIndexModel.getModelArray(res.result);
            this.setState({
                dataInfo: dataArray,
            });

        });

    }
    _requestSearchData(keywords) {
        this._requestSearchResult(keywords, false);
    }


    _requestSearchResult(keywords, isAssociation) {

        let isShowLoading = !isAssociation && this.state.pageIndex == 1 ? true : false

        let paramMap = new Map();
        let index = isAssociation ? 1 : this.state.pageIndex;
        let type = isAssociation ? 'seach' : '';
        paramMap.set('__cmd', 'guest.ask.getPageData');
        paramMap.set('keywords', keywords);
        paramMap.set('pageSize', 18);
        paramMap.set('pageIndex', index);
        // paramMap.set('type',type);

        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {

            let showFoot = 0;
            let dataArray = YFWHealthAskSearchItemModel.getModelArray(res.result.dataList);

            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1 && !isAssociation) {
                dataArray = this.state.dataArray.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);

            let newType = isAssociation ? 2 : 3;
            this.setState({
                dataArray: dataArray,
                loading: false,
                showFoot: showFoot,
                type: newType,
            });

        }, () => { }, isShowLoading);

    }


    //@ View

    render() {

        return (
            <View style={[BaseStyles.container]}>
                {this._renderSearchHeader()}
                {this._renderBodyView()}
            </View>
        );

    }


    _renderBodyView() {



        if (this.state.type == 1) {

            return (
                <View style={{ flex: 1 }}>
                    {this._renderHotView()}
                </View>
            );

        } else if (this.state.type == 2) {

            return (
                <View style={{ flex: 1 }}>
                    {this._renderAssociationList()}
                </View>
            );

        } else if (this.state.type == 3) {

            return (
                <View style={{ flex: 1 }}>
                    {this._renderDetailListItem()}
                </View>
            );
        }


    }


    _renderHotView() {


        if (isNotEmpty(this.state.dataInfo.hot_seach_items) && this.state.dataInfo.hot_seach_items.length > 0) {
            return (
                <View style={[BaseStyles.container, { height: kScreenHeight, backgroundColor: '#fff' }]}>
                    <View style={[BaseStyles.leftCenterView, { height: 30, width: kScreenWidth, marginTop: 10 }]}>
                        <Text style={{ marginLeft: 16, flex: 1, fontSize: 14, color: darkTextColor() }}>热搜</Text>
                    </View>
                    <View style={{ flexDirection: 'row', backgroundColor: '#fff', flexWrap: 'wrap', marginLeft: 8, width: kScreenWidth - 32 }}>
                        {this._renderHotItem()}
                    </View>
                </View>
            );
        }

    }

    _renderHotItem() {

        var allBadge = [];
        let hotArray = this.state.dataInfo.hot_seach_items;

        for (var i = 0; i < hotArray.length; i++) {

            let badge = hotArray[i];
            allBadge.push(

                <TouchableOpacity activeOpacity={1} key={'history' + i} style={{ marginLeft: 10, marginTop: 10 }} onPress={() => this._clickHotItemMethod(badge)}>
                    <View style={[BaseStyles.centerItem, { borderRadius: 21, backgroundColor: '#fafafa', height: 38 }]}>
                        <Text style={{ fontSize: 13, color: '#666666', paddingLeft: 20, paddingRight: 20 }}>
                            {badge.dep_name}
                        </Text>
                    </View>
                </TouchableOpacity>

            );
        }

        return allBadge;

    }


    //@ 搜索结果页
    _renderDetailListItem() {

        if (this.state.dataArray.length > 0) {

            return (
                <View style={[BaseStyles.container]}>
                    <FlatList
                        ref={(flatList) => this._flatList = flatList}
                        extraData={this.state}
                        data={this.state.dataArray}
                        numColumns={1}
                        keyboardShouldPersistTaps={'always'}
                        renderItem={this._renderListItem.bind(this)}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1} />
                </View>
            );


        } else {

            return <YFWEmptyView title='暂无数据' />

        }


    }
    //@ 联想搜索页
    _renderAssociationList() {

        return (
            <View style={[BaseStyles.container]}>
                <FlatList
                    extraData={this.state}
                    data={this.state.dataArray}
                    numColumns={1}
                    keyboardShouldPersistTaps={'always'}
                    renderItem={this._renderAssociationListItem.bind(this)}
                    ListEmptyComponent={() => {
                        return <View />
                    }}
                />
            </View>
        );


    }
    _renderAssociationListItem = (item) => {

        return (
            <YFWHealthAskAssociationItemView Data={item.item} navigation={this.props.navigation} />
        );

    }

    _renderListItem = (item) => {

        return (
            <YFWHealthAskQuestionItemView Data={item.item} navigation={this.props.navigation} from={'searchList'}/>
        );

    }

    _renderFooter() {

        return <YFWListFooterComponent showFoot={this.state.showFoot} />

    }


    _renderSearchHeader() {

        let headerH = (Platform.OS === 'ios') ? (24 + iphoneTopMargin()) : Platform.Version > 19 ? StatusBarManager.HEIGHT + 50 : 50;

        return (
            <ImageBackground style={{ width: kScreenWidth, height: headerH, alignItems: 'flex-end', justifyContent: 'flex-end', resizeMode: 'stretch' }}
                source={require('../../../../img/Status_bar.png')}
            >
                <StatusBar barStyle="light-content" />

                <View style={[BaseStyles.leftCenterView, { height: 50 }]}>
                    <View>
                        <TouchableOpacity style={[BaseStyles.item, { width: 50 }]}
                            onPress={() => {
                                this.props.navigation.goBack();
                            }}>
                            <Image style={{ width: 11, height: 19, resizeMode: 'contain' }}
                                source={require('../../../../img/top_back_white.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={[BaseStyles.centerItem, { flex: 1 }]}>
                        <View style={[BaseStyles.leftCenterView, { width: kScreenWidth - 100, height: 34, borderRadius: 17, backgroundColor: 'white' }]}>
                            <Image style={{ width: 15, height: 15, resizeMode: 'contain', marginLeft: 10 }}
                                source={require('../../../../img/top_bar_search.png')}
                                defaultSource={require('../../../../img/top_bar_search.png')} />
                            <TextInput ref={(searchInput) => this._searchInput = searchInput}
                                placeholder={'请输入疾病或症状'} style={{ flex: 1, marginLeft: 5, padding: 0 }}
                                placeholderTextColor="#cccccc"
                                onChangeText={(text) => { this.onChangeText(text) }}
                                onSubmitEditing={(event) => { this.clickSearchMethod(event.nativeEvent.text) }}
                                value={this.state.searchText}
                                returnKeyType={'search'}
                                underlineColorAndroid='transparent'
                            >
                                {/* {this._textInputText()} */}
                            </TextInput>
                        </View>
                    </View>
                    <View style={{ width: 40, height: 40, marginRight: 10 }} >
                        <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem, { flex: 1 }]} onPress={() => this.clickSearchMethod(this.state.searchText)}>
                            <Text style={{ fontSize: 16, color: 'white' }}>搜索</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* <View style={{ height: 0.5, width: kScreenWidth, backgroundColor: '#666666' }} /> */}

            </ImageBackground>

        );

    }

    _textInputText() {

        if (!this.state.edit) {
            return (
                <Text>{this.state.searchText}</Text>
            );
        }

    }



}

