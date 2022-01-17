
import {isNotEmpty, safeArray} from '../../../PublicModule/Util/YFWPublicFunction'


export default class YFWWDMySupplierModel{
    constructor(props) {
    }

    setModelData(data) {
        if (isNotEmpty(data)) {
            let dataArray = [];
            data.forEach((item, index) => {
                dataArray.push(
                    {
                        title: item.store_title,
                        id: item.storeid,
                        goods_items: item.items,
                    }
                );
            });
            return dataArray;
        } else { 
            return []
        }
    }
    /**
     * 
     * address: "北京市东城区永内东街西里11号"
dict_shop_type: 3
dict_store_status: 4
dict_store_sub_type: 0
domain_name: null
evaluation_count: 0
goods_items: []
id: 290019
id_path: "4947|40|491"
level: null
licence_code: null
logo_image: "http://c1.yaofangwang.net/common/images/default/noyaodian_logo.png"
name: "已签约"
name_path: "中国|北京市|东城区"
phone: "010-67053411"
provinceid: 40
regionid: 491
register_address: null
remarks: "药店签约状态"
sortno: 4
storeid: 290019
title: "欣百川医药(北京)有限公司"
     * 
     */
    setAllModelData(data) {
        if (isNotEmpty(data)) {
            let dataArray = [];
            data.forEach((item,index)=>{
                dataArray.push(
                    {
                        title:item.title,
                        id:item.id,
                        goods_items: item.goods_items,
                    }
                );
            });
            return dataArray;
        }
    }

    static getModelArray(array) {
        array == safeArray(array)

        let model = new YFWWDMySupplierModel();
        let ModeData =  model.setModelData(array);
        return ModeData;

    }

    static getAllSupplierArray(array) {
        array == safeArray(array)

        let model = new YFWWDMySupplierModel();
        let ModeData =  model.setAllModelData(array);
        return ModeData;

    }
}
