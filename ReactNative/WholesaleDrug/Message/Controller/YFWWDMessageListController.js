import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDMessageListView from '../View/YFWWDMessageListView';
import { safeObj, safeArray } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDMessageHomeItemModel from '../../Widget/Model/YFWWDMessageHomeItemModel';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { kList_from } from '../../Base/YFWWDBaseModel';
import YFWWDMessageListModel from '../Model/YFWWDMessageListModel';
import YFWWDMessageListItemModel from '../../Widget/Model/YFWWDMessageListItemModel';
import { pushWDNavigation, kRoute_order_detail, kRoute_html_static } from '../../YFWWDJumpRouting';

export default class YFWWDMessageListController extends YFWWDBaseController {
    
    constructor(props) {
        super(props);
        this.instance = YFWWDMessageHomeItemModel.initWithModel(safeObj(this.props.navigation.state.params.state.value))
        this.model = new YFWWDMessageListModel()
        this.view = <YFWWDMessageListView ref={(view) => this.view = view} father={this} model={this.model.listModel}/>   
    }

    componentWillMount() { 
        this.model.listModel.orderField = 'create_time desc'
        this.model.listModel.needRequest = true
        this.model.listModel.dataPath = 'datalist'
        this.model.listModel.from = kList_from.kList_from_message_list
        
        this.getParamMap()
        this.getListData()
    }    

    getParamMap(){ 
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.customerservice.sitemessage.getMessageByType')
        paramMap.set('type', this.instance.type);
        paramMap.set('pageIndex', this.model.listModel.currentPage);
        paramMap.set('pageSize', this.model.listModel.pageSize);
        paramMap.set('orderField', this.model.listModel.orderField);
        this.model.listModel.paramMap =  paramMap
    }

    retry() { 
        this.view.statusView && this.view.statusView.dismiss()
        this.listRefresh()
    }
    toDetail(data) {
        let instance = YFWWDMessageListItemModel.initWithModel(data)
        if (instance.jumptype == "get_order_detail") {
            pushWDNavigation(this.props.navigation.navigate, { type: kRoute_order_detail, value: instance.jumpvalue })
        } else if (instance.dict_msg_type == 1) { 
            // this.view.webViewAlert.showView(instance.content)
            pushWDNavigation(this.props.navigation.navigate, { type: kRoute_html_static, value: instance.content,title:'消息详情' })
        }
    }

}