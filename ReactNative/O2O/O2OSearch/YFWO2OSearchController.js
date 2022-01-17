import React, { Component } from 'react';
import { YFWO2OSearchViewModel } from './YFWO2OSearchViewModel';
import { dismissKeyboard_yfw, darkStatusBar, safeObj } from '../../PublicModule/Util/YFWPublicFunction';
import { EMOJIS } from '../../PublicModule/Util/RuleString';
import { YFWO2OSearchAPI } from './YFWO2OSearchAPI'
import { YFWO2OSearchModel } from './YFWO2OSearchModel'
import { isNotEmpty, isEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import { getItem, setItem, kO2OSearchHistoryKey } from '../../Utils/YFWStorage'
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
export default class YFWO2OSearchController extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: '搜索页及搜索结果页',
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            location: isNotEmpty(YFWUserInfoManager.ShareInstance().O2Oaddress) ? YFWUserInfoManager.ShareInstance().O2Oaddress : isNotEmpty(YFWUserInfoManager.ShareInstance().O2Ocity) ? YFWUserInfoManager.ShareInstance().O2Ocity : '暂无定位信息',
            rowCount: 0,
            showType: 1, //1:搜索历史、2：关键词相关性、3:搜索结果
            searchText: '',
            dataSource: [],
            refreshing: false,
            noMore: false,
            index: 1,
            relativeItems: [],
            firstLoad: true,
            hotWords: [],
        }
    }
    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        darkStatusBar();
        this._fetchHotWordsData()
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
    }
    //-----------------------------------------------METHOD---------------------------------------------

    _fetchResultData(keywords = '', index = 1, first) {
        this.setState({
            refreshing: false,
        })
        YFWO2OSearchAPI.getSearchMedcine(keywords, index, 'search', first).then((res) => {
            this.setState({
                firstLoad: false
            })
            if (isNotEmpty(res) && isNotEmpty(res.result)) {
                let data = YFWO2OSearchModel.setModelData(res.result);
                this.setState({
                    dataSource: index > 1 ? this.state.dataSource.concat(data) : data,
                    rowCount: res.result.rowCount,
                    refreshing: false,
                    noMore: index == res.result.pageCount,
                    index: index,
                })
            }
        }, (err) => {

        })
    }
    _fetchGetKeyWordRelative(text) {
        YFWO2OSearchAPI.getKeyWordRelative(text).then((res) => {
            if (isNotEmpty(res) && isNotEmpty(res.result)) {
                let relativeItems = []
                res.result.forEach(element => {
                    relativeItems.push({
                        item: element
                    })
                });
                this.setState({
                    relativeItems: relativeItems
                })
            }
            else
                () => { }
        }, (err) => {
        })
    }
    _fetchHotWordsData() {
        YFWO2OSearchAPI.getHotWordsData().then((res) => {
            if (isNotEmpty(res) && isNotEmpty(res.result))
                this.setState({
                    hotWords: res.result,
                });
            else
                () => { }
        }, (error) => {
        }, false);
    }
    _dealNavigation(data) {
        if (isEmpty(data)) {
            return
        }
        let { navigate } = this.props.navigation;
        pushNavigation(navigate, { ...safeObj(data) })
    }
    _goBack() {
        dismissKeyboard_yfw()
        let { goBack } = this.props.navigation;
        goBack();
    }
    //搜索框变化
    onChangeText(text) {
        text = text.replace(EMOJIS, '')
        if (text.length > 0) {
            this._fetchGetKeyWordRelative(text)
            this.setState({
                showType: 2,
                searchText: text,
                relativeItems: [],
            })
        }
        else
            this.setState({
                showType: 1,
                searchText: text
            })
    }

    searchClick(text) {
        dismissKeyboard_yfw()
        this.setState({
            searchText: text,
            showType: 3,
        })
        this._fetchResultData(text, 1, this.state.firstLoad)
        this.addHistory('goods', text)
    }
    _removeKeywords() {
        this.setState({
            searchText: '',
            showType: 1,
        });
    }
    clickShopItemMethod(searchText) {
        dismissKeyboard_yfw()
        this._fetchResultData(searchText, 1, this.state.firstLoad)
        this.setState({
            searchText: searchText,
            showType: 2,
        })
        this.setState({
            showType: 3,
        })
        this.addHistory('shop', searchText)
    }
    clickGoodsItemMethod(searchText) {
        dismissKeyboard_yfw()
        this._fetchResultData(searchText, 1, 'search', this.state.firstLoad)
        this.setState({
            searchText: searchText,
            showType: 2,
        })
        this.setState({
            showType: 3,
        })
        this.addHistory('goods', searchText)
    }
    onFocus() {
        this.setState({
            showType: this.state.searchText.length && this.state.searchText.length > 0 ? 2 : 1
        })
    }

    addHistory(type, value) {
        if (isEmpty(value)) return;
        getItem(kO2OSearchHistoryKey).then((id) => {
            var array = id;
            if (isEmpty(array)) {
                array = [];
            }
            var object = {
                type: type,
                value: value
            };
            //判断历史记录是否有重复记录
            let repeat = array.some(function (item) { return item.type == type && item.value == value });
            if (repeat) {
                array.splice(array.findIndex(item => item.type == type && item.value == value), 1);
                array.unshift(object);
            } else {
                array.unshift(object);
            }
            setItem(kO2OSearchHistoryKey, array);
        });

    }
    //-----------------------------------------------RENDER---------------------------------------------
    render() {
        return new YFWO2OSearchViewModel(this)
    }
}
