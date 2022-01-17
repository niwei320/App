import React from 'react';
import YFWWDLoginView from '../View/YFWWDLoginView'
import {LoginModel} from '../Model/YFWWDLoginModel'
import YFWToast from '../../../Utils/YFWToast';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import {
    pushWDNavigation,
    kRoute_register,
    kRoute_register_qualify,
    kRoute_apply_account,
    kRoute_account_qualifiiy,
    replaceWDNavigation,
    kRoute_forget_password
} from '../../YFWWDJumpRouting';
import {
    getPurchaseStatus,
    getRegistStatus
} from '../../../Utils/YFWInitializeRequestFunction';
import {NativeModules, Platform} from 'react-native';
import { isStringEmpty } from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWWDLogin extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerRight: null,
        headerStyle:Platform.OS == 'ios'?{borderBottomColor: 'white',backgroundColor: 'white'}:{
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + NativeModules.StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? NativeModules.StatusBarManager.HEIGHT : 0
        }
    });

    constructor(props) {
        super(props);
        this.model = new LoginModel()
        this.view = <YFWWDLoginView ref={(view)=>this.view = view} father={this} model={this.model}/>
    }

    render() {
        return this.view
    }

    textChange(text, tag) {
        if (tag == 1) {
            this.model.account = text
        }else if (tag == 2) {
            this.model.pwd = text
        }
        this.view.updateView()
    }

    clearAccountText() {
        this.model.account = ''
        this.view.updateView()
    }

    toLogin() {
        let msg = ''
        if (isStringEmpty(this.model.account)) {
            msg = '请输入账号'
        }else if (isStringEmpty(this.model.pwd)) {
            msg = '请输入密码'
        }
        if (msg != '') {
            YFWToast(msg)
            return
        }
        super.toLogin(this.model.account, this.model.pwd,false,() => {
            getPurchaseStatus((status) => {
                if (status) {
                    this.props.navigation.state.params.state.callBack && this.props.navigation.state.params.state.callBack()
                    this.props.navigation.goBack();
                } else {
                    replaceWDNavigation(this.props.navigation, {type:kRoute_register_qualify})
                }
            })
        })
    }

    toRegist() {
        pushWDNavigation(this.props.navigation.navigate, {type:kRoute_register})
    }
    toForget() {
        pushWDNavigation(this.props.navigation.navigate, {type:kRoute_forget_password})
    }
}
