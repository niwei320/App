import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDComplaintDetailModel from '../Model/YFWWDComplaintDetailModel';
import YFWWDComplaintDetailView from '../View/YFWWDComplaintDetailView';
import { safeObj, isNotEmpty } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWToast from '../../../Utils/YFWToast';

export default class YFWWDComplaintDetailController extends YFWWDBaseController {
    constructor(props) {
        super(props);
        this.model = new YFWWDComplaintDetailModel()
        this.view = <YFWWDComplaintDetailView ref={(view) => this.view = view} father={this} model={this.model} />
    }
    
    componentWillMount() { 
        this.model.orderno = this.props.navigation.state.params.state.value
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.complaints.getDetail')
        paramMap.set('orderno', this.model.orderno)
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            let data = safeObj(res.result)
            let instance = YFWWDComplaintDetailModel.initFromData(data);
            this.model = instance
            this.view&&this.view.updateViews()
         }, () => { },true)
    }


    cancelComplaint(){
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.complaints.cancel');     
        paramMap.set('orderno', this.model.orderno);
        this.model.paramMap = paramMap
        this.model.getData(() => { 
            YFWToast('撤销成功')
            this.props.navigation.goBack();
        })
    }
   
}