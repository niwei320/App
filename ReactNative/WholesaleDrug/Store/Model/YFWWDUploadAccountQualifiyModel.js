import YFWWDBaseModel from "../../Base/YFWWDBaseModel";

export default class YFWWDUploadAccountQualifiyModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.ExampleLink = "http://www.yaofangwang.com/agreement/采购委托书.pdf"
        this.localPic = []          //[YFWWDUploadImageInfoModel,...]
        this.allQualifiyTypeDesc = []
        this.allQualifiyTypeValue = []
        this.selectIndex = -1
        this.shopName = ''
        this.id = ''                //更新资料需要传id

        this.qualifiyType='syzz'
        this.licence_code=''
        this.start_date=''
        this.end_date=''

    }

    static init(){
        let instance = new YFWWDUploadAccountQualifiyModel();

        return instance;
    }

    getServiceUri() {
        let uriStr = ''
        this.localPic.forEach((item) => {
            if (item.type != 'default') {
                if (uriStr == '') {
                    uriStr = item.serviceUri
                } else {
                    uriStr = uriStr + '|' + item.serviceUri
                }
            }
        })
        return uriStr
    }


}

export class YFWWDUploadImageInfoModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.type = 'default'
        this.uri = ''
        this.serviceUri = ''
        this.isUploading = false
        this.success = false
    }

    static init(data){
        let instance = new YFWWDUploadImageInfoModel();
        instance.isUploading = data.isUploading
        instance.serviceUri = data.serviceUri
        instance.uri = data.uri
        instance.success = data.success
        instance.type = data.type
        return instance;
    }


}
