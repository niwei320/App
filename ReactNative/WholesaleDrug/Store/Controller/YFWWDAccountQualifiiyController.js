import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDAccountQualifiiyModel from '../Model/YFWWDAccountQualifiiyModel';
import YFWWDAccountQualifiiyView from '../View/YFWWDAccountQualifiiyView';
import { safeArray } from '../../../PublicModule/Util/YFWPublicFunction';
import {
    kRoute_account_qualifiiy_zzzj,
    kRoute_probate_admin,
    kRoute_probate_qualify,
    kRoute_probate_store, kRoute_probate_treatment,
    kRoute_upload_account_qualifiy,
    kRoute_upload_documents_guide,
    pushWDNavigation
} from '../../YFWWDJumpRouting';
import YFWWDQualificationInfoModel from '../../Widget/Model/YFWWDQualificationInfoModel';

export default class YFWWDAccountQualifiiyController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDAccountQualifiiyModel()
        this.view = <YFWWDAccountQualifiiyView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() {
        this.model.listInfo.from = 'khzz'
        this.model.father = this.props.navigation.state.params.state.father
        this.model.listInfo.needRequest = false
        this.getListData(true)
    }

    componentDidMount() {
        this.didFocus = this.props.navigation.addListener('didFocus', () => {
            if (!this.model.first_load) {
                this.getListData(false)
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

    getListData(shoload) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.settings.shopimage.getSyzz_wholeapp')
        YFWWDAccountQualifiiyModel.request(paramMap, (res) => {
            this.model.shopName = res.result.title
            let data = safeArray(res.result.list)
            this.getQualificationArray(data, (array) => {
                this.model.listInfo.dataArray = array
                this.view&&this.view.updateViews()
            })

        }, (err) => { },shoload)
    }

    toAddInfo(item) {
        let {navigate} = this.props.navigation;
        if(item.qualifiyType=='syzz'){
            pushWDNavigation(navigate,{type:kRoute_upload_account_qualifiy,shopName:this.model.shopName,father:this.model.father});
        } else if(item.qualifiyType=='zzzj'){
            pushWDNavigation(navigate,{type:kRoute_account_qualifiiy_zzzj});
        }
    }

    subMethods(key, item) {
        let instance = YFWWDQualificationInfoModel.init(item)
        if (key == 'change') {
            if (instance.isReadOnly == 1) {
                this.view.tipsInfo.text = '关键资料无法自主更新，请联系客服处理。'
                this.view.showTips()
                this.view.updateViews()
            } else {
                let {type} = instance;
                let {navigate} = this.props.navigation;
                let typeZZZJ = instance.dict_store_licence_type
                if(type == '1' || (type == '0' && (typeZZZJ == '7' || typeZZZJ == '12'))){   //首营资质和 资质证件其中<第二..> <食品经营>
                    if(type == '1'){
                        pushWDNavigation(navigate,{type:kRoute_upload_account_qualifiy,shopName:this.model.shopName,id:instance.id,father:this.model.father,value: {type1:1,type2:typeZZZJ,name:instance.name}});
                    } else {
                        pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_upload_account_qualifiy,shopName:this.model.shopName,id:instance.id,father:this.model.father,value: {type1:0,type2:typeZZZJ,name:instance.name}}});
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
    }


}
