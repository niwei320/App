import YFWWDBaseModel from "../../Base/YFWWDBaseModel";
import { safeArray } from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDRegisterModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.qylx = ''              //企业类型
        this.qylx_subtype = ''              //企业类型
        this.qylx_account_type = ''              //账号企业类型
        this.licence_text = ''      //执照类型
        this.licence_type = ''      //执照类型
        this.qylx = ''              //企业类型
        this.qymc = ''              //企业名称
        this.frxm = ''              //法人姓名
        this.xydm = ''              //信用代码
        this.szdq = ''              //所在地区
        this.szdq_value = ''              //所在地区value
        this.zcdz = ''              //注册地址
        this.yhm = ''               //用户名
        this.szmm = ''              //设置密码
        this.qrmm = ''              //确认密码
        this.xm = ''                //姓名
        this.sjhm = ''              //手机号码
        this.yzm = ''               //验证码
        this.isAgree = false        //是否同意协议
        this.canSubmit = true        //是否能够提交
        this.canSubmitTips = ''
        this.qyTypeArray = []
        this.licenceTypeArray = []
     }

     static initWithModel(data){
         let instance = new YFWWDRegisterModel();
         instance.qylx = data.qylx
         instance.qylx_subtype = data.qylx_subtype
         instance.qylx_account_type = data.qylx_account_type
         instance.licence_type = data.licence_type
         instance.qymc = data.qymc
         instance.frxm = data.frxm
         instance.xydm = data.xydm
         instance.szdq = data.szdq
         instance.szdq_value = data.szdq_value
         instance.zcdz = data.zcdz
         instance.yhm = data.yhm
         instance.szmm = data.szmm
         instance.qrmm = data.qrmm
         instance.xm = data.xm
         instance.sjhm = data.sjhm
         instance.yzm = data.yzm
         instance.isAgree = data.yzm
         instance.canSubmit = data.canSubmit
         instance.canSubmitTips = data.canSubmitTips
         instance.qyTypeArray = data.qyTypeArray
         instance.licenceTypeArray = data.licenceTypeArray

         return instance;
    }

    getAssociationViewArray(array) {
        /**
         * accountid: -1
            id: 123867
            title: "呼图壁县111团万康大药房"
         */
        return safeArray(array).map((item) => { return item.title })
    }

    getQYTypeViewArray(data) {
        let array = []
        safeArray(data).map((item,index) => {
            let children = []
            if(safeArray(item.childens).length > 0){
                //index.licence_type == -1 时为‘以上皆无’。隐藏企业名称和法人姓名。并取消对应检验。
                item.childens.map((item,index) => {
                    children.push({
                        key:'children'+index,
                        title:item.licence_name,
                        select:index===0,
                        value:index,
                        ...item
                    })
                })
            }
            array.push({
                key:'Type'+index,
                title:item.name,
                select:index===0,
                value:index,
                licenceTypeArray:children,
                ...item
            })
        })
        return array
    }


 }
