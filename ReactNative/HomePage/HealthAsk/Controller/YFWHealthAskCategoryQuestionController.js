import React, { Component } from 'react';
import {
    Platform,
    View,
    FlatList,
    TextInput,
    Image,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { itemAddKey, isEmpty, kScreenWidth, isNotEmpty, iphoneBottomMargin, } from "../../../PublicModule/Util/YFWPublicFunction";
import { BaseStyles } from "../../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWHealthAskQuestionItemView from '../View/YFWHealthAskQuestionItemView'
import YFWHealthAskCategoryQuestionModel from '../Model/YFWHealthAskCategoryQuestionModel'
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent'
import AndroidHeaderBottomLine from "../../../widget/AndroidHeaderBottomLine";
import ModalView from "../../../widget/ModalView";
import YFWPopupWindow from "../../../PublicModule/Widge/YFWPopupWindow";
import { pushNavigation } from "../../../Utils/YFWJumpRouting";
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
export default class YFWHealthAskCategoryQuestionController extends Component {

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item, { width: 50, height: 40 }]}
                onPress={() => { navigation.goBack() }}>
                <Image style={{ width: 11, height: 19, resizeMode: 'stretch' }}
                    source={require('../../../../img/top_back_white.png')} />
            </TouchableOpacity>
        ),
        headerTitle: (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: "center" }}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView, BaseStyles.centerItem]} onPress={() => navigation.state.params.changeHeaderState()}>
                    <Text style={{ fontSize: 16, color: 'white' }}>{navigation.state.params.title}</Text>
                    <Image style={{ width: 12, height: 12, marginLeft: 8, resizeMode: "contain" }}
                        source={navigation.state.params.icon} />
                </TouchableOpacity>
            </View>

        ),
        headerRight: (
            <TouchableOpacity style={[BaseStyles.leftCenterView, BaseStyles.centerItem, { marginRight: 20 }]} onPress={() => pushNavigation(navigation.navigate, { type: 'get_submit_ASK' })}>
                <Text style={{ fontSize: 16, color: 'white' }}>提问</Text>
            </TouchableOpacity>
        ),
        headerBackground: <Image source={require('../../../../img/Status_bar.png')} style={{ width: kScreenWidth, flex: 1, resizeMode: 'cover' }} />,
    });


    constructor(props, context) {

        super(props, context);

        this.state = {
            categoryData: [],
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            showHeader: false,
        }
    }

    componentDidMount() {

        this.categoryid = this.props.navigation.state.params.state.categoryid;
        this.py_name = this.props.navigation.state.params.state.py_name;
        this.parent_py = this.props.navigation.state.params.state.parent_py;
        this.title = this.props.navigation.state.params.state.title;
        this.props.navigation.setParams({
            title: this.title,
            changeHeaderState: this._changeHeaderStateMethod,
            icon: require('../../../../img/arrow_up_white.png'),
        })

        this._handleData();

    }

    //@ Action
    _changeHeaderStateMethod = () => {
        let showHeader = true;
        let icon = require('../../../../img/arrow_down_white.png');
        if (this.state.showHeader) {
            showHeader = false;
            icon = require('../../../../img/arrow_up_white.png');
        }
        this.setState({
            showHeader: showHeader
        });
        this.props.navigation.setParams({
            icon: icon,
        });

    }
    _clickCategoryItemMethod(badge) {
        this.setState({ showHeader: false });
        this._changeHeaderStateMethod();

        this.state.pageIndex = 1;
        this.categoryid = badge.dep_id;
        this.py_name = badge.py_name;
        this.parent_py = badge.parent_py;
        this.props.navigation.setParams({
            title: badge.dep_name,
        })
        this._handleData();
    }


    _onRefresh() {

        this.state.pageIndex = 1;
        this.setState({
            loading: true
        });
        this._handleData();

    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this._handleData();

    }



    //@Request
    _handleData() {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.ask.getDepartment');
        paramMap.set('py', this.parent_py);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            let cateoryArray = YFWHealthAskCategoryQuestionModel.getCategoryArray(res.result.items);

            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.ask.getPageData');
            paramMap.set('pageSize', 20);
            paramMap.set('pageIndex', this.state.pageIndex);
            paramMap.set('py', this.py_name);
            paramMap.set('get_reply', '1');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let showFoot = 0;
                let questionArray = YFWHealthAskCategoryQuestionModel.getQuestionArray(res.result.dataList);

                if (questionArray.length === 0) {
                    showFoot = 1;
                }
                if (this.state.pageIndex > 1) {
                    questionArray = this.state.dataArray.concat(questionArray);
                }
                questionArray = itemAddKey(questionArray);
                this.setState({
                    dataArray: questionArray,
                    categoryData: cateoryArray,
                    loading: false,
                    showFoot: showFoot,

                });

            }, (error) => {
                this.setState({
                    loading: false,
                    showFoot: 0,
                });
            }, this.state.pageIndex == 1 ? true : false);

        }, () => { }, false);

    }


    //@ View

    render() {

        let headerB= (Platform.OS === 'ios') ? (58 + iphoneBottomMargin()) :58;
        return (

            <View style={[BaseStyles.container,{backgroundColor:'white'}]}>
                <AndroidHeaderBottomLine />
                <FlatList
                    style={{marginBottom:headerB}}
                    ref={(flatList) => this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.dataArray}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    renderItem={this._renderListItem.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                />
                {this._renderBottomMenu()}
                {this._renderKindMenuList()}

            </View>
        );

    }
    //底部菜单
    _renderBottomMenu() {
        const bottom = iphoneBottomMargin();
        return (
            <View style={{ position: "absolute", bottom: bottom, height: 58, backgroundColor: 'white', width: kScreenWidth }}>
                <View style={{ backgroundColor: '#f8f8f9', width: kScreenWidth, height: 1 }} />
                <View style={{ width: kScreenWidth, height: 57, flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity activeOpacity={1} style={{ alignItems: "center", flex: 1 }} onPress={() => this._clickMyAskMethod()} >
                        <Image style={{ width: 20, height: 20 }} source={require('../../../../img/msg_cq.png')}></Image>
                        <Text style={{ fontSize: 12, color: "#333333", marginTop: 3 }}>问答</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}></View>
                    <TouchableOpacity activeOpacity={1} style={{ alignItems: "center", flex: 1, justifyContent: "center" }} onPress={() => this._clickMyMethod()}>
                        <Image style={{ width: 20, height: 23 }} source={require('../../../../img/mine_cq.png')}></Image>
                        <Text style={{ fontSize: 12, color: "#333333", marginTop: 3 }}>我的</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
     //弹框数据
    _renderKindMenuList() {
        if (this.state.showHeader && this.state.categoryData.length > 0) {
            return (
                <TouchableOpacity
                    style={{ top: 0, left: 0, position: 'absolute', width: width, height: height, backgroundColor: 'rgba(51,51,51,0.5)' }} activeOpacity={1} onPress={() => { [this.setState({ showHeader: false }), this._changeHeaderStateMethod()] }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'white', paddingBottom: 30 }}>
                        {this._renderCategoryItem(this.state.categoryData)}
                    </View>
                </TouchableOpacity>
            )
        } else {
            return (<View />)
        }
    }

    //点击提问
    _clickAskQuestionMethod() {

        const { navigate } = this.props.navigation;
        pushNavigation(navigate, { type: 'get_submit_ASK' });
    }
    //点击问答
    _clickMyAskMethod() {
        const { navigate } = this.props.navigation;
        pushNavigation(navigate, { type: 'get_ASK' });
    }
    //点击我的
    _clickMyMethod() {
        const { navigate } = this.props.navigation;
        pushNavigation(navigate, { type: 'get_myASK' });
    }
    _renderListItem = (item) => {

        return (
            <YFWHealthAskQuestionItemView  Data={item.item} navigation={this.props.navigation} />
        );

    }

    _renderFooter() {

        return <YFWListFooterComponent showFoot={this.state.showFoot} />

    }

    _renderCategoryItem(items) {
        var allBadge = [];
        if (isNotEmpty(items)) {
            for (var i = 0; i < items.length; i++) {
                let badge = items[i];
                allBadge.push(
                    <TouchableOpacity activeOpacity={1} key={'item' + i} style={{ marginLeft: 10, marginTop: 17 }} onPress={() => this._clickCategoryItemMethod(badge)}>
                        <View style={[BaseStyles.centerItem, { marginLeft: 15, borderRadius: 21, backgroundColor: "#fafafa", width: (kScreenWidth - 100) / 3, height: 36 }]}>
                            <Text style={{ fontSize: 13, color: '#333333' }}>{badge.dep_name}</Text>
                        </View>
                    </TouchableOpacity>
                );
            }
        }
        return allBadge;

    }


}

