import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDBrowsingHistoryView from '../View/YFWWDBrowsingHistoryView';
import YFWWDBrowsingHistoryModel from '../Model/YFWWDBrowsingHistoryModel';
import YFWWDListPageDataModel from '../../Widget/Model/YFWWDListPageDataModel';
import { safeArray, safeObj, safe, tcpImage, itemAddKey } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDMedicineInfoModel from '../../Widget/Model/YFWWDMedicineInfoModel';
import { pushWDNavigation, kRoute_shop_goods_detail } from '../../YFWWDJumpRouting';
import { kList_from } from '../../Base/YFWWDBaseModel';
import YFWToast from '../../../Utils/YFWToast';

export default class YFWWDBrowsingHistoryController extends YFWWDBaseController {
    constructor(props) {
        super(props);
        this.model = new YFWWDBrowsingHistoryModel()         
        this.view = <YFWWDBrowsingHistoryView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() { 
        this.model.listModel.from = kList_from.kList_from_history
        this.model.listModel.dataPath = 'datalist'
        this.getParamMap()
        this.getListData()
    }

    getParamMap() { 
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.product.medicine.getViewHisList')
        paramMap.set('pageSize', this.model.listModel.pageSize)
        paramMap.set('pageIndex', this.model.listModel.currentPage)
        this.model.listModel.paramMap =  paramMap
    }

    render() {
        return this.view
    }

    toDetail(medicine) {
        let instance = YFWWDMedicineInfoModel.initWithModel(medicine)
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_shop_goods_detail, value: instance.medicinId, img_url: tcpImage(instance.image) })
    }

    clear() { 
        let bean = {
            title: "确定要清空浏览记录吗？",
            leftText: "取消",
            rightText: "确定",
            rightClick: this.clearRequest
        }

        this.view.tipsDialog && this.view.tipsDialog._show(bean);

    }
    
    clearRequest =()=>{ 
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.product.medicine.clearHistoryRecords')
        this.model.paramMap = paramMap
        this.model.requestWithParams(paramMap, (res) => { 
            this.model.listModel.dataArray = []
            this.model.listModel.showFoot = 0
            this.view && this.view.setState({}, () => { 
                this.view.statusView && this.view.statusView.showEmptyWIthTips('暂无数据')
            })
        }, () => { },false)
    }
}