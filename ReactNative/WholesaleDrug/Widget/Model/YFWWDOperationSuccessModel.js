import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import YFWWDListPageDataModel from "./YFWWDListPageDataModel";

export default class YFWWDOperationSuccessModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.headerInfo = {
            title: '',              //付款成功
            paySuccess: true,
            pageType:'',
            payType: '',                    //微信支付
            money: '',
            btArray: [],        //{ text: '查看订单', type: '' }, { text: '回到首页', type: '' }
            orderNo: '',
            couponArray:[],
        }
        this.listModel = new YFWWDListPageDataModel()
    }

    static initWithModel(data){
        let instance = new YFWWDOperationSuccessModel();
        instance.headerInfo = data.headerInfo
        instance.listModel = data.listModel
        return instance;
    }


}
