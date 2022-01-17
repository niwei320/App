import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
export const kList_from = {
    kList_from_message_home: 'message_home',       //消息首页
    kList_from_message_list: 'message_list',       //消息首页
    
    kList_from_wdts : 'wdts',                        //我的投诉
    kList_from_history: 'history',                   //浏览历史
    kList_from_frequentlygoods: 'frequentlygoods',                   //常购商品
    kList_from_operationsccess: 'operationsccess',                   //付款成功、收货成功、评价成功
    kList_from_storehome : 'storehome',                            //商家首页
    kList_from_mycoupon: 'mycoupon',                            //我的优惠券
    kList_from_storeList : 'storeList',                            //商家全部商品
}


YFWRequestViewModel
export default class YFWWDBaseModel { 
    constructor() {
        this.paramMap = {}
        this.dataPath = 'result'            //result、datalist
        this.timerCount = 60                     //验证码时间
        this.noticeText = '获取验证码'
        this.noticeEnable = true
        this.first_load = true
        this.from=''
    }

    static request(paramMap,success,error,showload) { 
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            success&&success(res)
        }, (err) =>{
           error&&error(err)
        },showload);
    }
    
    getData(success,error,showload) { 
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(this.paramMap, (res) => {
            success&&success(res)
        }, (err) =>{
           error&&error(err)
        },typeof(showload) == 'undefined'?true:showload);
    }

    requestWithParams(paramMap,success,error,showload) { 
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            success&&success(res)
        }, (err) =>{
           error&&error(err)
        },typeof(showload) == 'undefined'?true:showload);
    }
}