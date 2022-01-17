import YFWWDBaseModel from "../../Base/YFWWDBaseModel"

export class YFWWDUploadImageInfoModel extends YFWWDBaseModel{ 
    constructor(props) {
        super()
        this.type = props&&props.type || 'default'               //'default'  'image'
        this.uri = props&&props.uri || ''
        this.serviceUri = props&&props.serviceUri || ''
        this.isUploading = props&&props.isUploading || false
        this.success = props&&props.success || false
        this.name = props&&props.name || ''
    }

    static initWithModel(data){
        let instance = new YFWWDUploadImageInfoModel();
        instance = data
        return instance;
    }


}