import React, { Component } from 'react';
import { YFWO2OCategoryResultViewModel } from './YFWO2OCategoryResultViewModel';
import { darkStatusBar, isNotEmpty, isEmpty, safeObj } from '../../PublicModule/Util/YFWPublicFunction';
import { YFWO2OSearchAPI } from '../O2OSearch/YFWO2OSearchAPI'
import { YFWO2OCategoryResultModel } from './YFWO2OCategoryResultModel'
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
export default class YFWO2OCategoryResultController extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: '分类结果页',
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            location: isNotEmpty(YFWUserInfoManager.ShareInstance().O2Oaddress) ? YFWUserInfoManager.ShareInstance().O2Oaddress : isNotEmpty(YFWUserInfoManager.ShareInstance().O2Ocity) ? YFWUserInfoManager.ShareInstance().O2Ocity : '暂无定位信息',
            categoryName: safeObj(this.props.navigation.state.params.state).categoryName || '营养保健',
            categoryId: safeObj(this.props.navigation.state.params.state).categoryId || 1,
            rowCount: 0,
            dataSource: [],
            refreshing: false,
            noMore: false,
            index: 1,
            firstLoad: true,
        }
    }
    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        this._fetchResultData(this.state.categoryId, 1, this.state.firstLoad)
        darkStatusBar();
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
        YFWO2OSearchAPI.getSearchMedcine(keywords, index, 'category', first).then((res) => {
            this.setState({
                firstLoad: false,
            })
            if (isNotEmpty(res) && isNotEmpty(res.result)) {
                let data = YFWO2OCategoryResultModel.setModelData(res.result);
                this.setState({
                    dataSource: index > 1 ? this.state.dataSource.concat(data) : data,
                    rowCount: res.result.rowCount,
                    refreshing: false,
                    noMore: index == res.result.pageCount,
                    index: index,
                })
            }
        }, (err) => {
            this.setState({
                firstLoad: false,
            })
        })
    }
    _dealNavigation(data) {
        if (isEmpty(data)) {
            return
        }
        let { navigate } = this.props.navigation;
        pushNavigation(navigate, { ...safeObj(data) })
    }
    _goBack() {
        let { goBack } = this.props.navigation;
        goBack();
    }
    //-----------------------------------------------RENDER---------------------------------------------
    render() {
        return new YFWO2OCategoryResultViewModel(this)
    }
}
