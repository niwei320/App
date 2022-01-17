import React from 'react';
import YFWWDBaseController from "../../Base/YFWWDBaseController";
import YFWWDProbateTreatmentModel from "../Model/YFWWDProbateTreatmentModel";
import YFWWDProbateTreatmentView from "../View/YFWWDProbateTreatmentView";
import {YFWWDUploadImageInfoModel} from "../../Widget/Model/YFWWDUploadImageInfoModel";
import {isStringEmpty, safe, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWToast from "../../../Utils/YFWToast";

export default class YFWWDProbateTreatmentController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDProbateTreatmentModel()
        this.view = <YFWWDProbateTreatmentView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentDidMount() {
        this.request()
    }

    render() {
        return this.view
    }

    /******************delegete********************/
    backMethod() {
        super.backMethod()
    }

    removePic() {
        this.model.image = new YFWWDUploadImageInfoModel()
        this.view&&this.view.updateViews()
    }

    reUpload() {
        this.model.image.isUploading = true
        this.view.updateViews()
        this.uploadImage(this.model.image.uri, (imageUrl) => {
            this.getImageInfoForService(imageUrl)
            this.handleServicePic(imageUrl,true)
        }, () => {
            this.handleServicePic('',false)
        })
    }

    selectPic(rechoose) {
        super.selectPic((path) => {
            this.addPic(path,rechoose)
            this.uploadImage(path, (imageUrl) => {
                this.getImageInfoForService(imageUrl)
                this.handleServicePic(imageUrl, true)
            }, () => {
                this.handleServicePic('',false)
            })
        })
    }

    addPic(path,rechoose) {
        if (rechoose) {
            this.model.image.success = false
        }
        this.model.image.type = 'image'
        this.model.image.isUploading = true
        this.model.image.uri = path
        this.view.updateViews()
    }

    handleServicePic(imageUrl, sucess) {
        this.model.image.isUploading = false
        this.model.image.serviceUri = imageUrl
        if (sucess) {
            this.model.image.success = true
        }
        this.view.updateViews()
    }

    textChange(text,type) {
        if (type == 'name') {
            this.model.shop_title = text
        } else if (type == 'social_code') {
            this.model.social_code = text
        }else if (type == 'person') {
            this.model.charge_person = text
        }else if (type == 'legal_person') {
            this.model.legal_person = text
        }else if (type == 'start') {
            this.model.start_date = text
        }else if (type == 'end') {
            this.model.end_date = text
        }else if (type == 'address_r') {
            this.model.register_address = text
        }else if (type == 'scope') {
            this.model.scope = text
        }
        this.view&&this.view.updateViews()
    }

    selectDate = (date) => {
        let start = this.getFormatTimeString(date[0],'年月日','yyyy-MM-dd')
        let end = this.getFormatTimeString(date[1],'年月日','yyyy-MM-dd')
        this.model.start_date = start
        this.model.end_date = end
        this.view&&this.view.updateViews()
    }

    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.getStoreHosInfo')
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            // console.log(JSON.stringify(res))
            this.model = YFWWDProbateTreatmentModel.initWithData(safeObj(res.result))
            this.view&&this.view.updateViews()
        }, () => { })
    }

    toSave() {
        // if (isStringEmpty(this.model.shop_title)) {
        //     YFWToast('请填写企业名称')
        //     return
        // }
        // if (isStringEmpty(this.model.social_code)) {
        //     YFWToast('请填写登记号')
        //     return
        // }
        // if (isStringEmpty(this.model.legal_person)) {
        //     YFWToast('请填写法定代表人')
        //     return
        // }
        // if (isStringEmpty(this.model.charge_person)) {
        //     YFWToast('请填写主要负责人')
        //     return
        // }
        // if (isStringEmpty(this.model.scope)) {
        //     YFWToast('请填写诊疗科目')
        //     return
        // }
        // if (isStringEmpty(this.model.register_address)) {
        //     YFWToast('请填写注册地址')
        //     return
        // }
        if (isStringEmpty(this.model.start_date)) {
            YFWToast('请填写有效期限')
            return
        }
        if (isStringEmpty(this.model.end_date)) {
            YFWToast('请填写有效期限')
            return
        }
        if (!this.model.image.success) {
            YFWToast('医疗机构执业许可证未上传')
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.app.uploadStoreHosInfo_b2b')
        paramMap.set('data', {
            image:this.model.image.serviceUri,
            title: this.model.shop_title,
            address: this.model.register_address,
            start_date: this.model.start_date,
            end_date: this.model.end_date,
            social_code: this.model.social_code,
            scope: this.model.scope,
            legal_person: this.model.legal_person,
            charge_person: this.model.charge_person,
        })
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            YFWToast('保存成功')
            this.props.navigation.goBack()
        }, () => { },true)

    }


    getImageInfoForService(path) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.image2Text_hospital')
        paramMap.set('imagePath', path)
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            // console.log(JSON.stringify(res))
            if(this.model.charge_person == '') this.model.charge_person = safe(res.result.charge_person);
            if(this.model.legal_person == '') this.model.legal_person = safe(res.result.legal_person);
            if(this.model.social_code == '') this.model.social_code = safe(res.result.social_code);
            if(this.model.register_address == '') this.model.register_address = safe(res.result.register_address);
            if(this.model.scope == '') this.model.scope = safe(res.result.scope);
            if(this.model.end_date == '') this.model.end_date = safe(res.result.end_date);
            if(this.model.start_date == '') this.model.start_date = safe(res.result.start_date);
            this.view&&this.view.updateViews()
        }, () => { },false)
    }
}
