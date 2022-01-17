import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDSettingView from '../View/YFWWDSettingView';
import YFWWDSettingModel from '../Model/YFWWDSettingModel';
import {
    kRoute_html,
    pushWDNavigation,
    kRoute_feedback_wd,
    kRoute_modify_password
} from '../../YFWWDJumpRouting';
import { RECEIVE_PROTOCOL_HTML_WD } from '../../../PublicModule/Util/YFWPublicFunction';
import { DeviceEventEmitter } from 'react-native';
import NavigationActions from 'react-navigation/src/NavigationActions';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';


export default class YFWWDSettingController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDSettingModel()
        this.view = <YFWWDSettingView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    render() {
        return this.view
    }

    /******************delegete********************/
    backMethod() {
        super.backMethod()
    }

    selectCell(item) {
        const { navigate } = this.props.navigation;

        if (item.title === '批发订单验收标准') {
            pushWDNavigation(navigate, {
                type: kRoute_html,
                value: RECEIVE_PROTOCOL_HTML_WD(),
                name: '商品验收标准',
                title: '商品验收标准',
                isHiddenShare: true,
            });
        } else if (item.title === '意见建议') {
            pushWDNavigation(navigate, { type: kRoute_feedback_wd })
        }  else if (item.title === '修改密码') {
            pushWDNavigation(navigate, { type: kRoute_modify_password })
        } else if (item.title === '退出登录') {
            this._changeAppStatus();
            let userInfo = new YFWUserInfoManager();
            userInfo.clearInfo()
           DeviceEventEmitter.emit('WDLogin_Off')
           this.toHome()
        }
    }

    toHome() {
        this.props.navigation.popToTop();
        const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
        this.props.navigation.dispatch(resetActionTab);
    }

    _changeAppStatus() {
        DeviceEventEmitter.emit('WD_ALL_MESSAGE_RED_POINT_STATUS')//消除消息红点
        DeviceEventEmitter.emit('WD_ORDER_ITEMS_TIPS_NUMS', [])//消除订单红点
        DeviceEventEmitter.emit('WDLOGOUT')//退出登录通知
    }
}
