import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDRegisterQualifyModel from '../Model/YFWWDRegisterQualifyModel';
import YFWWDRegisterQualifyView from '../View/YFWWDRegisterQualifyView';
import {lightStatusBar, safeArray, safeObj} from '../../../PublicModule/Util/YFWPublicFunction';
import {
    pushWDNavigation,
    kRoute_probate_admin,
    kRoute_probate_store,
    kRoute_probate_qualify,
    kRoute_probate_treatment, kRoute_upload_documents_guide
} from '../../YFWWDJumpRouting';
import YFWToast from "../../../Utils/YFWToast";
import {Platform} from "react-native";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";

export default class YFWWDRegisterQualifyController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        gesturesEnabled:navigation.state.params.state.from == 'registe'?false:true,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDRegisterQualifyModel()
        this.model.from = this.props.navigation.state.params.state.from
        this.view = <YFWWDRegisterQualifyView ref={(view) => this.view = view} father={this} model={this.model}/>
        this.backMethod = this.backMethod.bind(this)
    }

    componentDidMount() {
        this.request()
        this.addListener()
    }

    componentWillUnmount() {
        this.removeListener()
    }

    render() {
        return this.view
    }

/******************delegete********************/

    addListener() {
        this.didFocus = this.props.navigation.addListener('didFocus', () => {
            if (!this.model.first_load) {
                this.request(false)
            } else {
                this.model.first_load = false
            }
            if (Platform.OS === 'android') {
                this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                    this.backMethod();
                    return true;
                });
            }
        })
        this.didBlur = this.props.navigation.addListener('didBlur',
            payload => {
                if (Platform.OS === 'android') {
                    this.backHandler&&this.backHandler.remove();
                }
            }
        );
    }

    removeListener() {
        this.didFocus&&this.didFocus.remove()
        this.didBlur&&this.didBlur.remove()
        this.backHandler&&this.backHandler.remove();
    }

    backMethod() {
        if (this.model.from === 'registe') {
            this.toHome()
        } else {
            super.backMethod()
        }
    }

    request(isshowload) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.app.get_register_licence_status')
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            // console.log(JSON.stringify(res))
            let licence_info_done = true
            this.model.dict_store_licence_type_list = safeArray(safeObj(res.result).dict_store_licence_type_list).map((item)=>{
                let type
                switch (item.dict_store_licence_type) {
                    case '21,22':
                        type = 'admin'
                        break
                    case '1':
                        type = 'store'
                        break
                    case '4':
                        type = 'qualify'
                        break
                    case '24':
                        type = 'institution'
                        break
                    case '25':
                        type = 'privateUnit'
                        break
                    case '16':
                        type = 'treatment'
                        break
                }
                if(!item.bool_audit){
                    licence_info_done = item.bool_audit
                }
                return {
                    title:item.licence_name,
                    depict:item.descp,
                    warning_depict:item.warning_descp,
                    type:type,
                    isOK:item.bool_audit,
                }
            })
            this.model.licence_info_done = licence_info_done
            this.model.dict_account_audit = safeObj(res.result).dict_account_audit != 0
            this.view&&this.view.updateViews()
         }, (error)=> {
            // console.log(JSON.stringify(error))
        },isshowload)
    }

    toProbate(type) {
        if (type === 'admin') {
            pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_admin}})
        }else if (type === 'store') {
            pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_store,param:'store'}})
        }else if (type === 'qualify') {
            pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_qualify}})
        }else if (type === 'institution') {
            pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_store,param:'institution'}})
        }else if (type === 'privateUnit') {
            pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_store,param:'privateUnit'}})
        }else if (type === 'treatment') {
            pushWDNavigation(this.props.navigation.navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_probate_treatment}})
        }
    }

    toHome() {
        super.toHome()
    }

    toCustomerService() {
        super.toCustomerService()
    }
}
