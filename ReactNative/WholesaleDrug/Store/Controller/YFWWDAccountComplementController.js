import React from 'react';
import YFWWDBaseController from "../../Base/YFWWDBaseController";
import {
    darkStatusBar, isNotEmpty,
    safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";
import {
    kRoute_upload_account_qualifiy,
    kRoute_upload_documents_guide,
    pushWDNavigation
} from "../../YFWWDJumpRouting";
import YFWWDAccountComplementView from "../View/YFWWDAccountComplementView";
import YFWWDAccountComplementModel from "../Model/YFWWDAccountComplementModel";

export default class YFWWDAccountComplementController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDAccountComplementModel()
        if(isNotEmpty(this.props.navigation.state.params.state?.value)) {
            let data = this.props.navigation.state.params.state.value
            this.model.storeid = data.sell_storeid;
            this.model.shopName = data.sell_title;
            this.model.accountShopName = data.title;
            this.model.need_add_health_products = data.need_add_health_products;    //食品经营许可证
            this.model.need_instruments = data.need_instruments;                    //第二类医疗器械经营备案凭证
            this.getUnElectronicInfoList({
                has_health_products:!data.need_add_health_products,
                has_instruments:!data.need_instruments})
        }
        this.view = <YFWWDAccountComplementView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentDidMount() {
        darkStatusBar();
        this.didFocus = this.props.navigation.addListener('didFocus', () => {
            this.model.first_load = false
            this.request()
        })
    }

    componentWillUnmount() {
        this.didFocus&&this.didFocus.remove()
    }

    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.cart.check_second_categary_licence')
        paramMap.set('need_add_health_products', this.model.need_add_health_products)
        paramMap.set('need_instruments', this.model.need_instruments)
        YFWWDAccountComplementModel.request(paramMap, (res) => {
            this.getUnElectronicInfoList(res.result)
            this.view&&this.view.updateViews()
        }, (err) => { },true)
    }

    getUnElectronicInfoList(data) {
        let list = []
        let missingList = []
        if(this.model.need_add_health_products){            //食品经营许可证
            list.push({name:'食品经营许可证',status:data.has_health_products})
            if(!data.has_health_products){
                missingList.push({name:'食品经营许可证',typeZZZJ:'7',status:data.has_health_products})
            }
        }
        if(this.model.need_instruments) {               //第二类医疗器械经营备案凭证
            list.push({name:'第二类医疗器械经营备案凭证',status:data.has_instruments})
            if(!data.has_instruments){
                missingList.push({name:'第二类医疗器械经营备案凭证',typeZZZJ:'12',status:data.has_instruments})
            }
        }
        this.model.electronicInfo.list = list
        this.model.electronicInfo.missingList = missingList
    }

    jumpToAddInfo(item) {
        let {navigate} = this.props.navigation;
        let type = '2'
        let typeZZZJ = item.typeZZZJ
        pushWDNavigation(navigate, {type:kRoute_upload_documents_guide,badge:{type:kRoute_upload_account_qualifiy,shopName:this.model.accountShopName,value: {type1:type,type2:typeZZZJ,name:item.name}}});
    }

    render() {
        return this.view
    }
}
