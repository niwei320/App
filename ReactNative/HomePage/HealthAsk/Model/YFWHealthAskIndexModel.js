import React from 'react'
import {isEmpty, isNotEmpty, safe, safeObj, strMapToObj} from "../../../PublicModule/Util/YFWPublicFunction";
export default class YFWHealthAskIndexModel extends React.Component {

    constructor(props) {
        super(props);
        this.ads_items = [];
        this.hot_seach_items = [];
        this.new_ask_items = [];
        this.popular_ask_items = [];
        this.solve_ask_count = '';
        this.last_ask = [];
    }

    setModelData(data,solve_ask_count) {
        if (isNotEmpty(data)) {
            let hot_seach_items = [];
            if (isNotEmpty(data.hot_department_items)) {
                data.hot_department_items.forEach((item,index)=>{
                    hot_seach_items.push({
                        py_name:item.py_name,
                        parent_py:item.parent_py_name,
                        dep_name : safe(item.department_name) ,
                        dep_id :safe(item.department_id)});
                });
            }
            this.hot_seach_items = hot_seach_items;
            this.popular_ask_items = this.convertAskItem(data.hot_items);
            this.new_ask_items = this.convertAskItem(data.latest_items);
            this.solve_ask_count = {
                solve_count:'专业与药师回答，已解决'+solve_ask_count+'个问题'
            }
            this.ads_items = [
                {
                    img_url:safeObj(data.ad_detail).image,
                    type:safeObj(data.ad_detail).type,
                    value:safeObj(data.ad_detail).value,
                }
            ]
            this.last_ask = [
                {
                    reply_time:safeObj(data.last_reply).create_time,
                    intro_image:safeObj(data.last_reply).pharmacist_intro_image,
                    name:safeObj(data.last_reply).pharmacist_name
                }
            ]
            return this;
        }
    }

    convertAskItem(array){
        let items = []
        if(isEmpty(array) || safeObj(array).length === 0){
            return items
        }
       return array.map((item,index)=>{
            return {
                id:item.id,
                title:item.title,   //标题
                status_id:"",//回复状态
                reply_count:item.reply_count,//回复数量
                status:item.status_name,//状态名
                time:item.create_time,//创建时间，多少天之前
                intro_image:safe(item.pharmacist_intro_image),//医师头像
                name:safe(item.pharmacist_name),//医师姓名
                type_name:safe(item.pharmacist_type_name),//医师职称
                practice_unit:safe(item.practice_unit),//医师单位
                reply_content:safe(item.reply_content),//医师回复
            }
        })
    }

    static getModelArray(array,solve_ask_count) {
        let model = new YFWHealthAskIndexModel();
        let ModeData =  model.setModelData(array,solve_ask_count);
        return ModeData;
    }
}
