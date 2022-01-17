import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    View,
} from 'react-native'
import BaseTipsDialog from '../PublicModule/Widge/BaseTipsDialog'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';


export default class YFWReLoginView extends Component {

    constructor(props) {
        super(props);

    }

    componentDidMount() {
        DeviceEventEmitter.addListener('OpenReLoginView', () => { 
            if (!YFWUserInfoManager.ShareInstance().is_wd_user) { 
                this.showView()
            }
        });
    }

    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }

    //action
    showView() {

        let _rightClick = ()=> {
            let {navigate} = this.props.getNavigation();
            pushNavigation(navigate,{type:'get_login'});
        }
        let bean = {
            title: "登录状态已失效，请登录",
            leftText:"取消",
            rightText:"确认",
            rightClick: _rightClick
        }

        this.tipsDialog && this.tipsDialog._show(bean);

    }


    render() {
        return (
            <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
        )
    }
}