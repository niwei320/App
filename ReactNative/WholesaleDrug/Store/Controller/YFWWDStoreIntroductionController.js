import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDStoreIntroductionModel from '../Model/YFWWDStoreIntroductionModel';
import YFWWDStoreIntroductionView from '../View/YFWWDStoreIntroductionView';
import { safeObj } from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWWDStoreIntroductionController extends YFWWDBaseController {
    constructor(props) {
        super(props);
        this.model = new YFWWDStoreIntroductionModel()
        this.model.shopId = this.props.navigation.state.params.state&&this.props.navigation.state.params.state.value
        this.view = <YFWWDStoreIntroductionView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() { 
        this.request()
    }

    render() {
        return this.view
    }

    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.shop.getShopInfo as shopInfo,guest.shop.getShopQualification as images')
        paramMap.set('shopInfo', {'storeid':this.model.shopId})
        paramMap.set('images', { 'storeid': this.model.shopId })
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            let instance = YFWWDStoreIntroductionModel.initWithData(safeObj(res.result.shopInfo), safeObj(res.result.images))
            this.model = instance
            this.view&&this.view.updateViews()
         }, (error) => { },true)
    }

    /******************delegete********************/
    backMethod() { 
        super.backMethod()
    }
}