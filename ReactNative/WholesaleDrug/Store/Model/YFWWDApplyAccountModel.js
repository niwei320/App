import YFWWDBaseModel from "../../Base/YFWWDBaseModel";

export default class YFWWDApplyAccountModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.first_load = true
        this.storeid = ''
        this.shopName = ''          //企业名称跳转补充资料使用
        this.pageType = -1          //0：电子   1：纸质
        this.isapply = -1          //0：未申请   1：已申请
        //dict_audit 审核状态：0 待审 2拒绝 ，dict_audit_reason 审核拒绝理由 ，store_phone 商家电话
        this.dict_audit ='',
        this.dict_audit_reason ='',
        this.store_phone='',
        this.status='',
        this.electronicInfo = {
            list: [],
            missingList:[],
        }
        this.paperInfo = {
            campData: [],       //{ value: "3", name: "采购委托书"}
            mail_address: '',
            mobile: '',
            shopping_name: '',
            storeid: '',
            title: '',              //商家名
            id:''
        }

    }

    static initWithModel(data){
        let instance = new YFWWDApplyAccountModel();
        instance = data
        return instance;
    }


}
