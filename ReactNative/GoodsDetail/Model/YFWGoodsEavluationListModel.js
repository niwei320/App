import React from 'react'
import {
    View,
} from 'react-native'
import { safe } from '../../PublicModule/Util/YFWPublicFunction';
//商品评论列表
export default class YFWGoodsEavluationListModel extends React.Component {

    constructor(props) {
        super(props)
    }

    setModelData(array){
        let evaluation = [];
        array.map((item,index)=> {
            evaluation.push({
                send_star:safe(item.send_star),
                service_star:safe(item.services_star),
                package_star:safe(item.package_star),
                logistics_star:safe(item.logistics_star),
                eval_account_name:safe(item.account_name),
                eval_content:safe(item.content),
                reply_account_name:safe(item.reply_account_name),
                reply_time:safe(item.reply_time),
                reply_content:safe(item.reply_content),
                admin_reply_name:safe(item.admin_reply_name),
                admin_reply_content:safe(item.admin_reply_content),
                admin_reply_time:safe(item.admin_reply_time),
                intro_image:safe(item.intro_image),
                eval_create_time:safe(item.create_time),
                eval_account_sex:'',
                eval_account_intro_:'',
                eval_account_id:safe(item.accountid)
            });
        });
        return evaluation
    }

    static getModelArray(array){
        let model = new YFWGoodsEavluationListModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }
}