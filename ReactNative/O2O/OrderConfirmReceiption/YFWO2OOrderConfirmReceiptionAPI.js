import { YFWRequest } from "../O2OSearch/YFWO2OSearchAPI"
class YFWO2OOrderConfirmReceiptionAPI {
    static orderReceive(orderNo) {
        let paramMap = new Map(); 
        paramMap.set('__cmd', 'person.order.receive');
        paramMap.set('orderno', orderNo);
        return YFWRequest(paramMap)
    }
    static orderDetails(orderNo) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.getOrderO2OInfo');
        paramMap.set('orderno', orderNo);
        return YFWRequest(paramMap)
    }   
}
export {
    YFWO2OOrderConfirmReceiptionAPI,
}