import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDRegisterModel from '../Model/YFWWDRegisterModel';
import YFWWDRegisterView from '../View/YFWWDRegisterView';
import {
    REGISTER_PROTOCOL_HTML,
    strMapToObj,
    isStringEmpty,
    safe, safeArray
} from '../../../PublicModule/Util/YFWPublicFunction';
import { pushWDNavigation, kRoute_html, kRoute_register_qualify } from '../../YFWWDJumpRouting';
import YFWToast from '../../../Utils/YFWToast';
import { DeviceEventEmitter } from 'react-native';
import {EMOJIS} from "../../../PublicModule/Util/RuleString";

export default class YFWWDRegisterController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDRegisterModel()
        this.view = <YFWWDRegisterView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentDidMount() {
        this.getQYType()
        this.view.associationViewBlock = this.associationViewItemClick
    }

    render() {
        return this.view
    }

    /******************delegete********************/
    backMethod() {
        super.backMethod()
    }

    getQYType() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.getStoreRegister_TypeList');
        this.model.requestWithParams(paramMap, (res) => {
            // console.log(JSON.stringify(res))
            this.model.qyTypeArray = this.model.getQYTypeViewArray(res.result)
            this.view&&this.view.updateViews()
        }, () => {
        })
    }

    chooseQYTyoe() {
        this.view.showAlertSheet('企业类型',this.model.qyTypeArray, (item) => {
            this.model.qylx = item.name
            this.model.qylx_subtype = item.subtype
            this.model.qylx_account_type = item.account_type
            this.model.licence_type = ''
            this.model.licence_text = ''
            this.model.licenceTypeArray = item.licenceTypeArray
            this.view&&this.view.updateViews()
        })
    }

    chooseLicenceType() {
        this.view.showAlertSheet('执照类型',this.model.licenceTypeArray, (item) => {
            this.model.licence_type = item.licence_type
            this.model.licence_text = item.licence_name
            this.view&&this.view.updateViews()
        })
    }

    chooseAddress() {
        this.view.showAddressAlert((item) => {
            this.model.szdq = item.get('name'),
            this.model.szdq_value = item.get('id'),
            this.view&&this.view.updateViews()
        })
    }

    getVerificationCode() {
        if (this.model.sjhm == '') {
            YFWToast('请输入手机号码')
            return
        }
        this.countdownTimes()
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.sendSMS');
        paramMap.set('mobile', this.model.sjhm);
        paramMap.set('ip', '');
        paramMap.set('type', 2);
        paramMap.set('account_type', 3);
        this.model.requestWithParams(paramMap, (res) => {
            let code = String(res.code);
            if (code === '1') {
                YFWToast('验证码已发送，请注意查收手机短信');
            }
        }, () => {
            this.stopTimes()
        })
    }

    toServiceAgreement() {
        pushWDNavigation(this.props.navigation.navigate, {type: kRoute_html,value:REGISTER_PROTOCOL_HTML(),name: '服务协议',title:'服务协议'});
    }

    agreeService() {
        this.model.isAgree = !this.model.isAgree
        this.view&&this.view.updateViews()
    }

    toUploadRegister() {
        this.cheakInfo()
        if (this.model.canSubmit) {
            this.uploadRegister()
        }
    }

    openAssociationView() {
        this.view.isShowAssociationView = true
        this.view.updateViews()
    }
    closeAssociationView() {
        this.view.isShowAssociationView = false
        this.view.updateViews()
    }

    textChange(text, index) {
        if (index == 'qymc') {
            this.model.qymc = text.replace(/ /g, '')
            this.openAssociationView()
            this.getAssociationViewData()
        }else if (index == 'frxm') {
            this.model.frxm = text
        }else if (index == 'xydm') {
            this.model.xydm = text
        }else if (index == 'zcdz') {
            this.model.zcdz = text
        }else if (index == 'yhm') {
            this.model.yhm = text.replace(EMOJIS,'')
        }else if (index == 'szmm') {
            this.model.szmm = text
        }else if (index == 'qrmm') {
            this.model.qrmm = text
        }else if (index == 'xm') {
            this.model.xm = text.replace(EMOJIS,'')
        } else if (index == 'sjhm') {
            this.model.sjhm = text
        }else if (index == 'yzm') {
            this.model.yzm = text
        }
        this.view&&this.view.updateViews()
    }

    associationViewItemClick = (item) => {
        this.model.qymc = item
        this.closeAssociationView()
        this.checkShopTitleFromService()
    }

    //点击键盘 确认按钮
    textEnd() {
        this.closeAssociationView()
    }

    //失去焦点
    loseFocus(type) {
        if (type == 'qymc') {
            if (!this.checkQYName()) {
                this.model.canSubmit = false
                this.model.canSubmitTips = '请输入1-30位汉字或英文字母或数字'
            } else {
                this.checkShopTitleFromService((value) => {
                    if (value) {
                        this.model.canSubmit = false
                        this.model.canSubmitTips = '该企业名称已注册！'
                    }else {
                        this.model.canSubmitTips = ''
                        this.model.canSubmit = true
                    }
                    this.showTips()
                })
                return
            }
        } else if (type == 'yhm') {
            if (!this.checkUserName(this.model.yhm)) {
                this.model.canSubmit = false
                this.model.canSubmitTips = '请输入4-18位汉字、数字及字母组合'
            } else {
                this.checkUserNameFromService((value) => {
                    if (value) {
                        this.model.canSubmit = false
                        this.model.canSubmitTips = '该用户名已注册！'
                    } else {
                        this.model.canSubmitTips = ''
                        this.model.canSubmit = true
                    }
                    this.showTips()
                })
                return
            }
        }else if (type == 'sjhm') {
            if (!this.checkPhoneNum(this.model.sjhm)) {
                this.model.canSubmit = false
                this.model.canSubmitTips = '手机号码格式不对'
            } else {
                this.model.canSubmit = true
                this.model.canSubmitTips = ''
            }
        }else if (type == 'szmm') {
            if (!this.checkPassword(this.model.szmm)) {
                this.model.canSubmit = false
                this.model.canSubmitTips = '请输入6-20位数字和字符组合'
            } else {
                this.model.canSubmit = true
                this.model.canSubmitTips = ''
            }
        }

        this.showTips()
    }

    cheakInfo() {
        if (isStringEmpty(this.model.qylx)) {
            this.model.canSubmitTips = '请选择企业类型'
            this.model.canSubmit = false
        }else if (safeArray(this.model.licenceTypeArray).length> 0 && isStringEmpty(this.model.licence_type)) {
            this.model.canSubmitTips = '请选择执照类型'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.qymc)) {
            this.model.canSubmitTips = '请输入企业名称'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.frxm) && this.model.licence_type != -1) {
            this.model.canSubmitTips = '请输入法人姓名'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.xydm) && this.model.licence_type != -1) {
            this.model.canSubmitTips = '请输入信用代码'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.szdq)) {
            this.model.canSubmitTips = '请选择所在地区'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.zcdz)) {
            this.model.canSubmitTips = '请输入注册地址'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.yhm)) {
            this.model.canSubmitTips = '请输入用户名'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.szmm)) {
            this.model.canSubmitTips = '请输入密码'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.qrmm)) {
            this.model.canSubmitTips = '请再次输入密码'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.xm)) {
            this.model.canSubmitTips = '请输入姓名'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.sjhm)) {
            this.model.canSubmitTips = '请输入手机号码'
            this.model.canSubmit = false
        }else if (isStringEmpty(this.model.yzm)) {
            this.model.canSubmitTips = '请输入验证码'
            this.model.canSubmit = false
        }else if (this.model.szmm != this.model.qrmm) {
            this.model.canSubmitTips = '两次输入的密码不一致'
            this.model.canSubmit = false
        }else if (!this.model.isAgree) {
            this.model.canSubmitTips = '请勾选服务协议'
            this.model.canSubmit = false
        }else {
            this.model.canSubmit = true
            this.model.canSubmitTips = ''
        }
        this.showTips()
    }

    showTips() {
        if (!this.model.canSubmit) {
            YFWToast(this.model.canSubmitTips)
        }
    }

    //获取联想企业名称
    getAssociationViewData() {
        if(safe(this.model.qymc).trim().length === 0){
            this.view.associationViewArray = []
            this.view.isShowAssociationView = false
            this.view.updateViews()
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.store.getShopListByKeyword');
        paramMap.set('keyword', this.model.qymc);
        paramMap.set('limit', 10);
        this.model.requestWithParams(paramMap, (res) => {
            this.view.associationViewArray = this.model.getAssociationViewArray(res.result)
            if(safeArray(this.view.associationViewArray).length === 0){
                this.view.isShowAssociationView = false
            }
            this.view.updateViews()
         }, (error) => { },false)
    }

    //判断企业名称是否已注册
    checkShopTitleFromService(back) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.store.isExistedShopTitle');
        paramMap.set('keyword', this.model.qymc);
        this.model.requestWithParams(paramMap, (res) => {
            back&&back(res.result)
            // this.view.associationViewArray = this.model.getAssociationViewArray(res.result)
            // this.view.updateViews()
         }, (error) => { },false)
    }
    //判断用户名是否存在
    checkUserNameFromService(back) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.IsAccountNameExist');
        paramMap.set('account_name', this.model.yhm);
        this.model.requestWithParams(paramMap, (res) => {
            back&&back(res.result)
         }, (error) => { },false)
    }

    uploadRegister() {
        DeviceEventEmitter.emit('LoadProgressShow')
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.storeRegister_new');
        let datamMap = new Map();
        datamMap.set('shop_title', this.model.qymc);
        datamMap.set('subtype', this.model.qylx_subtype);
        datamMap.set('account_type', this.model.qylx_account_type);
        if(!isStringEmpty(this.model.licence_type)) datamMap.set('licence_type', this.model.licence_type);
        datamMap.set('account_name', this.model.yhm);
        datamMap.set('password', this.model.szmm);
        datamMap.set('mobile', this.model.sjhm);
        datamMap.set('smscode', this.model.yzm);
        datamMap.set('social_code', this.model.xydm);
        datamMap.set('legal_person', this.model.frxm);
        datamMap.set('saleid', '');             //销售人员
        datamMap.set('code', '');               //合伙人
        datamMap.set('regionid', this.model.szdq_value);
        datamMap.set('detail_shop_address', this.model.zcdz);
        datamMap.set('from_unionid', '');       //联盟Id
        datamMap.set('subSiteId', '');          //联盟子站点ID
        datamMap.set('register_type', 1);                  //1（仅注册）或2（上传资质图片）
        datamMap.set('fromsource','10') //注册来源 App
        paramMap.set('data',strMapToObj(datamMap))
        // console.log(JSON.stringify(strMapToObj(datamMap)))
        this.model.requestWithParams(paramMap, (res) => {
            YFWToast('提交注册成功！')
            this.toLogin(this.model.yhm, this.model.szmm, true, () => {
                pushWDNavigation(this.props.navigation.navigate, {type:kRoute_register_qualify,from:'registe'})
            })
         }, (error) => {
            DeviceEventEmitter.emit('LoadProgressClose')
        },false)
    }

}
