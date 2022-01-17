import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDFrequentlyGoodsView from '../View/YFWWDFrequentlyGoodsView';
import YFWWDFrequentlyGoodsModel from '../Model/YFWWDFrequentlyGoodsModel';
import { safeArray, tcpImage } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDMedicineInfoModel from '../../Widget/Model/YFWWDMedicineInfoModel';
import { pushWDNavigation, kRoute_shop_goods_detail } from '../../YFWWDJumpRouting';
import { kList_from } from '../../Base/YFWWDBaseModel';

export default class YFWWDFrequentlyGoodsController extends YFWWDBaseController {
    constructor(props) {
        super(props);
        this.model = new YFWWDFrequentlyGoodsModel ()
        this.view = <YFWWDFrequentlyGoodsView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() {
        this.model.listModel.needRequest = true
        this.model.listModel.dataPath = 'datalist'
        this.model.listModel.from = kList_from.kList_from_frequentlygoods
        this.getParamMap()
        this.getListData()
        
    }
    
    getParamMap() { 
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.medicine.getOftenMedicine')
        this.model.listModel.paramMap =  paramMap
    }

    render() {
        return this.view
    }

    /******************delegete********************/

    toDetail(medicine) {
        let instance = YFWWDMedicineInfoModel.initWithModel(medicine)
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_shop_goods_detail, value: instance.medicinId, img_url: tcpImage(instance.image) })
    }
}