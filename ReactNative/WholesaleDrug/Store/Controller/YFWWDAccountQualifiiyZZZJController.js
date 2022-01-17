import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDAccountQualifiiyZZZJModel from '../Model/YFWWDAccountQualifiiyZZZJModel';
import YFWWDAccountQualifiiyZZZJView from '../View/YFWWDAccountQualifiiyZZZJView';
import {safeArray, safeObj} from '../../../PublicModule/Util/YFWPublicFunction';
import {
    pushWDNavigation,
    kRoute_upload_account_qualifiy, kRoute_upload_documents_guide, kRoute_probate_admin
} from '../../YFWWDJumpRouting';
import {Platform} from "react-native";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";

export default class YFWWDAccountQualifiiyZZZJController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDAccountQualifiiyZZZJModel()
        this.view = <YFWWDAccountQualifiiyZZZJView ref={(view) => this.view = view} father={this} model={this.model}/>
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
        super.backMethod()
    }

    request(isshowload) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.check_licence')
        this.model.paramMap = paramMap
        YFWWDAccountQualifiiyZZZJModel.request(paramMap, (res) => {
            this.model.shopName = safeObj(res.result.title)
            let dataArray = []
            safeArray(safeObj(res.result).list).map((item)=>{
                let dataItem = {}
                switch (item.dict_store_licence_type) {
                    case 12:
                        dataItem = {
                            type:item.dict_store_licence_type,
                            title:'第二类医疗器械经营备案凭证',
                            depict:'要求：第二类医疗器械经营备案凭证正本复印件，并加盖公章',
                            isOK:item.auth,
                        }
                        dataArray.push(dataItem)
                        break
                    case 7:
                        dataItem = {
                            type:item.dict_store_licence_type,
                            title:'食品经营许可证',
                            depict:'要求：食品经营许可证正本复印件，并加盖公章',
                            isOK:item.auth,
                        }
                        dataArray.push(dataItem)
                        break
                }
            })
            this.model.dict_store_licence_type_list = dataArray
            this.view&&this.view.updateViews()
         }, (error)=> {
        },isshowload)
    }

    toProbate (item) {
        pushWDNavigation(this.props.navigation.navigate, {
            type:kRoute_upload_documents_guide,
            badge: {
                type:kRoute_upload_account_qualifiy,
                shopName:this.model.shopName,
                father:this.model.father,
                value: {type1:0,type2:item.type,name:item.title}}
        })
    }

    toHome() {
        super.toHome()
    }

}
