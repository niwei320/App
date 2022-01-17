import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import {isNotEmpty, safeArray, safeObj} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWOrderSettlementListModel extends Component {

    constructor(props) {
        super(props);

        this.shop_title = '';
        this.order_no = '';
        this.goods_count = '';
        this.order_total = '';
        this.button_items = [];

    }

    setModelData(data){

        if (isNotEmpty(data)) {

            let buttons = [];
            if (data.buttons){
                data.buttons.forEach((item,index)=>{
                    buttons.push(
                        {
                            text:item.title,
                            value:item.action == 'pay' ? 'order_pay' : item.action == 'rx_upload' ? 'order_rx_submit' : item.action == 'pay_not'?'order_pay_not':'',
                            prompt_info:item.prompt_info,
                            is_weak:item.is_weak
                        }
                    );
                });
            }

            return {
                shop_title:data.title,
                order_no:data.orderno,
                goods_count:data.medicineQty,
                order_total:data.total_price,
                button_items : buttons,
            }
        } else {
            return {
                shop_title:'',
                order_no:'',
                goods_count:'',
                order_total:'',
                button_items : [],
            }
        }

    }

    static getModelArray(array) {

        let returnData = [];

        if (isNotEmpty(array) && safeArray(array).length > 0 ){
            array.forEach((item, index) => {
                let model = new YFWOrderSettlementListModel();
                returnData.push(model.setModelData(item));
            });
        }

        return returnData;
    }


}
