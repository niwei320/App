import React, {Component} from 'react';
import { YFWRequest } from "../O2OSearch/YFWO2OSearchAPI"
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";

export default class YFWO2OOrderDetailAPI {
    static getDetail(orderNo) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.getDetail');
        paramMap.set('orderno', orderNo);
        paramMap.set('isApp', 1)
        return YFWRequest(paramMap)
    }

    static getBuyAgain(orderNo) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.buyAgain');
        paramMap.set('orderno', orderNo);
        paramMap.set('is_o2o', '1');
        return YFWRequest(paramMap)
    }

    static getOrderTrack(orderNo) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.getO2OOrderTrace');
        paramMap.set('orderno', orderNo);
        return YFWRequest(paramMap)
    }

    static deleteOrder(orderNo) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.order.delete');
        paramMap.set('orderno', orderNo);
        return YFWRequest(paramMap)
    }

    static cancelApplyReturn(orderNo) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.cancelApplyReturn');
        paramMap.set('orderno', orderNo);
        return YFWRequest(paramMap)
    }

    static cancelReturnGoods(orderNo) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.cancelReturnGoods');
        paramMap.set('orderno', orderNo);
        return YFWRequest(paramMap)
    }

    static cancelOrder(orderNo, desc) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.cancel');
        paramMap.set('orderno', orderNo);
        paramMap.set('desc', desc);
        return YFWRequest(paramMap)
    }
}

