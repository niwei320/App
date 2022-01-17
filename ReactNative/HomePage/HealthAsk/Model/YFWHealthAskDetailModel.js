import React from 'react';
import {isNotEmpty} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWHealthAskDetailModel {

    constructor(props){

    }

    setModelData(data){


        if (isNotEmpty(data)) {

            let item_ask_reply = [];
            if (isNotEmpty(data.reply_unaccepted_items)) {
                data.reply_unaccepted_items.forEach((item,index)=>{
                    let item_ask_append = [];
                    if (isNotEmpty(item.append_items)) {
                        item.append_items.forEach((item,index)=>{
                            item_ask_append.push({
                                desc:item.content,
                                item_ask_appendreply:item.append_reply_items
                            });
                        });
                    }

                    let buttons = []
                    if(item.askable === 1){//是否显示追问
                        buttons.push({
                            type: "submit_ask_questions_append",
                            name: "追问"
                        })
                    }
                    if(item.acceptable === 1){//是否显示采纳
                        buttons.push({
                            type: "submit_ask_questions_adopt",
                            name: "采纳"
                        })
                    }

                    item_ask_reply.push({id:item.id,
                        account_name:item.name,
                        type:item.type,
                        pharmacist_id:item.pharmacistid,
                        shop_name:item.practice_unit,
                        shop_id:item.storeid,
                        intro_image:item.intro_image,
                        desc:item.content,
                        time:item.create_time,
                        relative_goods_item:[],
                        status_id:'1',
                        status:'未采纳',
                        buttons:buttons,
                        item_ask_append:item_ask_append});
                });
            }
            if (isNotEmpty(data.reply_accepted_items)) {
                data.reply_accepted_items.forEach((item,index)=>{
                    let item_ask_append = [];
                    if (isNotEmpty(item.append_items)) {
                        item.append_items.forEach((item,index)=>{
                            item_ask_append.push({desc:item.content,
                                item_ask_appendreply:item.append_reply_items
                            });
                        });
                    }

                    let buttons = []
                    if(item.askable === 1){//是否显示追问
                        buttons.push({
                            type: "submit_ask_questions_append",
                            name: "追问"
                        })
                    }
                    if(item.acceptable === 1){//是否显示采纳
                        buttons.push({
                            type: "submit_ask_questions_adopt",
                            name: "采纳"
                        })
                    }

                    item_ask_reply.push({id:item.id,
                        account_name:item.name,
                        type:item.type,
                        pharmacist_id:item.pharmacistid,
                        shop_name:item.practice_unit,
                        shop_id:item.storeid,
                        intro_image:item.intro_image,
                        desc:item.content,
                        time:item.create_time,
                        relative_goods_item:[],//医生商品推荐
                        status_id:'3',
                        status:'已采纳',
                        buttons:buttons,//按钮
                        item_ask_append:item_ask_append});
                });
            }



            let ask_detail = {title:data.title,
                intro_image:data.intro_image,
                account_intro_image:data.account_intro_image,
                desc:data.description,
                sex:data.dict_sex,
                age:data.age,
                time:data.create_time,
                item_ask_reply:item_ask_reply,
                id:data.id
            }

            let item_related = [];
            if (isNotEmpty(data.list_related)) {
                data.list_related.forEach((item,index)=>{
                    item_related.push({
                        id:item.id,
                        title:item.title,
                        dep_name:item.department_name,
                        reply_count:item.reply_count,
                        status_id:item.dict_bool_audit,
                        status:item.dict_bool_audit==1?'已回复':'已采纳',
                        time:item.create_time,
                    });
                });
            }

            let item_medicine = [];

            return {
                ask_detail:ask_detail,
                item_related:item_related,
                item_medicine:item_medicine,
            }

        }

    }

    static getModelArray(array){
        let model = new YFWHealthAskDetailModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }


}