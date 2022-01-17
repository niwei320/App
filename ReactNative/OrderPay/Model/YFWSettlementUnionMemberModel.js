import React, {Component} from 'react';
import {isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWSettlementUnionMemberModel extends Component {

    constructor(props) {
        super(props);

        this.default = {
            phoneNumber : '',
            discountText : '',
            price : '',
            priceOld : '',
            goodsData : [],
        };

    }


    setModelData(data){

        if (isNotEmpty(data)) {
            let goodsData = []
            if (isNotEmpty(data.sminfo)) {
                data.sminfo.forEach((item)=>{
                    goodsData.push({
                        name:item.aliascn + ' ' + item.namecn,
                        standard:item.standard,
                        counter:item.amount,
                        medicinetype:item.medicinetype,
                        unit:item.unit,
                    })
                })
            }
            return {
                phoneNumber:data.mobile,
                discountText:data.coupon_price_desc,
                price:data.pay_price,
                priceOld:data.receive_money,
                goodsData:goodsData,
                couponPrice:data.coupon_price,
            }


        }

        return this.default;
    }


    static getModelValue(data){
        let model = new YFWSettlementUnionMemberModel();
        return model.setModelData(data);

    }


}