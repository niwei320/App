import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDMyComplaintView from '../View/YFWWDMyComplaintView';
import { safeArray } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDComplaintListItemModel from '../../Widget/Model/YFWWDComplaintListItemModel';
import { kRoute_complaint_detail, pushWDNavigation } from '../../YFWWDJumpRouting';
import YFWWDMyComplaintModel from '../Model/YFWWDMyComplaintModel';
import { kList_from } from '../../Base/YFWWDBaseModel';

export default class YFWWDMyComplaintController extends YFWWDBaseController {
    constructor(props) {
        super(props);
        this.model = new YFWWDMyComplaintModel()
        this.view = <YFWWDMyComplaintView ref={(view) => this.view = view} father={this} model={this.model.listModel}/>
    }

    
    componentWillMount() { 
        this.model.listModel.from = kList_from.kList_from_wdts
        this.model.listModel.dataPath = 'dataList'
        this.getParamMap()
        this.getListData()       
    }

    componentDidMount() { 
        this.didFocus = this.props.navigation.addListener('didFocus', () => { 
            if (!this.model.first_load) {
                this.getListData()
            } else { 
                this.model.first_load = false
            }
        })
    }

    componentWillUnmount() { 
        this.didFocus&&this.didFocus.remove()
    }
    
    getParamMap() { 
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.complaints.getPageData')
        paramMap.set('type', '-1')
        paramMap.set('pageSize', this.model.listModel.pageSize)
        paramMap.set('pageIndex', this.model.listModel.currentPage)
        this.model.listModel.paramMap =  paramMap
    }

    toDetail(item) { 
        let instance = YFWWDComplaintListItemModel.initWithModel(item)
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_complaint_detail, value: instance.orderno })
    }

}