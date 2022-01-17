import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDMessageHomeView from '../View/YFWWDMessageHomeView';
import YFWWDMessageHomeModel from '../Model/YFWWDMessageHomeModel';
import YFWWDMessageHomeItemModel from '../../Widget/Model/YFWWDMessageHomeItemModel';
import { safeObj, safeArray } from '../../../PublicModule/Util/YFWPublicFunction';
import { pushWDNavigation, kRoute_message_list } from '../../YFWWDJumpRouting';
import { kList_from } from '../../Base/YFWWDBaseModel';

export default class YFWWDMessageHomeController extends YFWWDBaseController {
    constructor(props) {
        super(props);
        this.model = new YFWWDMessageHomeModel()  
        this.view = <YFWWDMessageHomeView ref={(view) => this.view = view} father={this} model={this.model.listModel}/>
    }

    componentWillMount() { 
        
       
        this.model.listModel.from = kList_from.kList_from_message_home
        this.model.listModel.needRequest = false
        this.getParamMap()
        this.getListData()
    }

    getParamMap() { 
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.getMessageHome')
        this.model.listModel.paramMap = paramMap
    }

    toDetail(item) { 
        let instance = YFWWDMessageHomeItemModel.initWithModel(safeObj(item))
        if (instance.type == -1) {
            this.toCustomerService()
        } else { 
            const { navigate } = this.props.navigation;
            this.markMessageReaded(instance.type)
            pushWDNavigation(navigate, { type: kRoute_message_list, value: instance })
        }
    }

      /**
     * 取消栏目消息红点
     * @param data
     * @private
     */
    markMessageReaded(type) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.customerservice.sitemessage.typeMarkRead');
        paramMap.set('msg_type_id', type);
        this.model.requestWithParams(paramMap, (res) => {
        }, (erros)=> {
        }, false)
    }

  
}