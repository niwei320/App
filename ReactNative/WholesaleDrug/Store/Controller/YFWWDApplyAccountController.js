import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDApplyAccountModel from '../Model/YFWWDApplyAccountModel'
import YFWWDApplyAccountView from '../View/YFWWDApplyAccountView'
import {
    safeObj,
    safe,
    isNotEmpty,
    safeArray,
    darkStatusBar
} from '../../../PublicModule/Util/YFWPublicFunction';
import {
    kRoute_account_qualifiiy,
    kRoute_probate_admin,
    kRoute_probate_qualify,
    kRoute_probate_store,
    kRoute_probate_treatment,
    kRoute_upload_account_qualifiy,
    kRoute_upload_documents_guide,
    pushWDNavigation
} from '../../YFWWDJumpRouting';
import YFWToast from "../../../Utils/YFWToast";


export default class YFWWDApplyAccountController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDApplyAccountModel()
        this.model.storeid = this.props.navigation.state.params.state&&this.props.navigation.state.params.state.value
        this.view = <YFWWDApplyAccountView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() {
        this.request()
    }

    componentDidMount() {
        darkStatusBar();
        this.didFocus = this.props.navigation.addListener('didFocus', () => {
            if (!this.model.first_load) {
                this.request(false)
            } else {
                this.model.first_load = false
            }
        })
    }

    componentWillUnmount() {
        this.didFocus&&this.didFocus.remove()
    }

    render() {
        return this.view
    }

    /******************delegete********************/


    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.customer.sto_store_custom_detail.Checkexchange_new')
        paramMap.set('storeid', this.model.storeid)
        paramMap.set('fouce_base_licence', 1)
        YFWWDApplyAccountModel.request(paramMap, (res) => {
            this.model.shopName = safeObj(res.result).title
            this.model.pageType = safeObj(res.result).type
            this.model.isapply = safeObj(res.result).isapply
            this.model.electronicInfo.list = this.getUnElectronicInfoList(res.result.list)
            this.model.status = safeObj(res.result).status
            this.model.dict_audit = safeObj(res.result).dict_audit
            this.model.dict_audit_reason = safeObj(res.result).dict_audit_reason
            this.model.store_phone = safeObj(res.result).store_phone
            this.requestExtral()
        }, (err) => { },true)
    }

    getUnElectronicInfoList(data) {
        data = safeArray(data)
        let missingList = []
        data.map((item,indxe)=>{
            if(item.status != 1 && item.edit == true){
                let nameArray = safe(item.name).split('/')
                if(nameArray.length === 1){
                    missingList.push(item)
                } else {
                    let type2Array = safe(item.type2).split('/')
                    nameArray.forEach((v,i)=>{
                        missingList.push({...item,name:nameArray[i],type2:type2Array[i]})
                    })
                }
            }
        })
        this.model.electronicInfo.missingList = missingList
        return data
    }

    //纸质开户信息
    requestExtral() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.customer.sto_store_whole_standard.getStoreWholeStandard')
        paramMap.set('storeId', this.model.storeid)
        YFWWDApplyAccountModel.request(paramMap, (res) => {
            let data = safeObj(res.result)
            this.model.paperInfo.campData = safeObj(data.campData)
            this.model.paperInfo.id = safeObj(data.id)
            this.model.paperInfo.mail_address = safeObj(data.mail_address)
            this.model.paperInfo.mobile = safeObj(data.mobile)
            this.model.paperInfo.shopping_name = safeObj(data.shopping_name)
            this.model.paperInfo.storeid = safeObj(data.storeid)
            this.model.paperInfo.title = safeObj(data.title)
            if (isNotEmpty(this.view) && isNotEmpty(this.view.tipsInfo)) {
                this.view.tipsInfo.text = '\r\n您的开户申请已提交，请耐心等待卖家处理。咨询电话：'+ this.model.store_phone + '\r\n'
                this.view.tipsInfo.specialText.text = this.model.store_phone
                this.view.tipsInfo.specialText.color = 'rgb(51,105,255)'
                this.view.tipsInfo.ishowCloseIcon = false
            }
            if (this.model.dict_audit == 0&&this.model.status&&this.model.isapply ==1) {
                this.view&&this.view.showTips&&this.view.showTips(true)
            }
            this.view&&this.view.updateViews()
        }, (err) => { },true)
    }

    toOpenAccount() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.customer.sto_store_custom_detail.ExchangeData')
        paramMap.set('storeid', this.model.storeid)
        paramMap.set('fouce_base_licence', 1)
        if (this.model.dict_audit == 2) {
            paramMap.set('type', 1)
        }
        YFWWDApplyAccountModel.request(paramMap, (res) => {
            this.model.isapply = 1
            this.view.showTips()
            this.view.updateViews()
        }, (err) => { },true)
    }

    jumpToAddInfo(item) {
        let {navigate} = this.props.navigation;
        let type = item.type1
        let typeZZZJ = item.type2
        if(type == '1' || (type != '1' && (typeZZZJ == '7' || typeZZZJ == '12'))){   //首营资质和 资质证件其中<第二..> <食品经营>
            if(type == '1'){
                pushWDNavigation(navigate,{type:kRoute_upload_account_qualifiy,shopName:this.model.shopName,value: {type1:type,type2:typeZZZJ,name:item.name}});
            } else {
                pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_upload_account_qualifiy,shopName:this.model.shopName,value: {type1:type,type2:typeZZZJ,name:item.name}}});
            }
        } else { //其他资质证件
            switch (typeZZZJ+'') {
                case '21,22':
                    pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_admin}})
                    break
                case '1':
                    pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_store,param:'store'}})
                    break
                case '4':
                    pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_qualify}})
                    break
                case '24':
                    pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_store,param:'institution'}})
                    break
                case '25':
                    pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_store,param:'privateUnit'}})
                    break
                case '16':
                    pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_treatment}})
                    break
            }
        }
    }

}
