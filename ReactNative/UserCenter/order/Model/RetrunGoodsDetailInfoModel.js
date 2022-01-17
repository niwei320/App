import {isNotEmpty} from '../../../PublicModule/Util/YFWPublicFunction'
export default class RetrunGoodsDetailInfoModel {
    constructor(props) {
    }

    setModelData(data) {

        if (isNotEmpty(data)) {
            let data_items = [];
            let button_list = [];
            data.button_list.forEach((buttonItem, index)=> {
                let item = {
                    text: buttonItem.name,
                    value: buttonItem.value
                }
                button_list.push(item)
            })
            data_items.push({
                status_name: data.status_name,
                return_reason: data.return_reason,
                return_name: data.return_name,
                return_mobile: data.return_mobile,
                return_phone: data.return_phone,
                return_address: data.return_address,
                return_reply: data.return_reply,
                return_money: data.return_money,
                button_items: button_list,
                order_return_no: data.order_returnno,
                status_id: data.status_id,
                voucher_images:data.voucher_images,
                report_images:data.report_images,
                status_time:data.status_time,
                description:data.description,
                return_traffic_name:data.return_traffic_name,
                return_trafficno:data.return_trafficno,
                traffic_state_name:data.traffic_state_name,
                apply_time:data.apply_time,
                need_return_status:data.need_return_status,
                status_desc:data.status_desc,
            })
            return data_items;
        }
    }


    static getModelArray(array) {
        let model = new RetrunGoodsDetailInfoModel();
        let ModeData = model.setModelData(array)
        return ModeData;

    }
}
