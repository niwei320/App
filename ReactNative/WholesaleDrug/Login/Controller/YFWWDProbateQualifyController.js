import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDProbateQualifyModel from '../Model/YFWWDProbateQualifyModel';
import YFWWDProbateQualifyView from '../View/YFWWDProbateQualifyView';
import { YFWWDUploadImageInfoModel } from '../../Widget/Model/YFWWDUploadImageInfoModel';
import {safeObj, isStringEmpty, safe} from '../../../PublicModule/Util/YFWPublicFunction';
import YFWToast from '../../../Utils/YFWToast';

export default class YFWWDProbateQualifyController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDProbateQualifyModel()
        this.view = <YFWWDProbateQualifyView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() {
        this.request()
    }

    render() {
        return this.view
    }

    /******************delegete********************/
    backMethod() {
        super.backMethod()
    }
    changeType(type) {
        this.model.storeType = type
        this.view&&this.view.updateViews()
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
         //{type:'default',isUploading:false,sucess:false}
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
        } else if (type == 'licence') {
            this.model.licence_code = text
        }else if (type == 'person') {
            this.model.charge_person = text
        }else if (type == 'leader') {
            this.model.quality_leader = text
        }else if (type == 'start') {
            this.model.start_date = text
        }else if (type == 'end') {
            this.model.end_date = text
        }else if (type == 'issuer') {
            this.model.license_issuer = text
        }else if (type == 'address_r') {
            this.model.register_address = text
        }else if (type == 'address_o') {
            this.model.operate_address = text
        }else if (type == 'address_w') {
            this.model.warehouse_address = text
        }else if (type == 'scope') {
            this.model.scope = text
        }
        this.view&&this.view.updateViews()
    }

    selectDate = (date,type) => {
        let dataStr = this.getFormatTimeString(date, '年月日', 'yyyy-MM-dd')
        if (type == 'start') {
            this.model.start_date = dataStr
        } else {
            this.model.end_date = dataStr
        }
        this.view&&this.view.updateViews()
    }

    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.getStoreJYXKZInfo')
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            let instance = YFWWDProbateQualifyModel.initWithData(safeObj(res.result))
            this.model = instance
            this.view&&this.view.updateViews()
            }, () => { })
    }

    toSave() {
        // if (isStringEmpty(this.model.shop_title)) {
        //     YFWToast('请填写企业名称')
        //     return
        // }
        // if (isStringEmpty(this.model.licence_code)) {
        //     YFWToast('请填写许可证号')
        //     return
        // }
        // if (isStringEmpty(this.model.charge_person)) {
        //     YFWToast('请填写企业负责人')
        //     return
        // }
        // if (isStringEmpty(this.model.quality_leader)) {
        //     YFWToast('请填写质量负责人')
        //     return
        // }
        if (isStringEmpty(this.model.start_date)) {
            YFWToast('请填写发证日期')
            return
        }
        if (isStringEmpty(this.model.end_date)) {
            YFWToast('请填写截止日期')
            return
        }
        // if (isStringEmpty(this.model.license_issuer)) {
        //     YFWToast('请填写发证单位')
        //     return
        // }
        // if (isStringEmpty(this.model.register_address)) {
        //     YFWToast('请填写注册地址')
        //     return
        // }
        // if (isStringEmpty(this.model.operate_address)) {
        //     YFWToast('请填写经营地址')
        //     return
        // }
        // if (isStringEmpty(this.model.warehouse_address)) {
        //     YFWToast('请填写仓库地址')
        //     return
        // }
        // if (isStringEmpty(this.model.scope)) {
        //     YFWToast('请填写经营范围')
        //     return
        // }
        if (!this.model.image.success) {
            YFWToast('经营许可证未上传')
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.app.uploadStoreJYXKZInfo_b2b')
        paramMap.set('data', {
            shop_title: this.model.shop_title,
            image:this.model.image.serviceUri,
            licence_code: this.model.licence_code,
            charge_person: this.model.charge_person,
            quality_leader: this.model.quality_leader,
            start_date: this.model.start_date,
            end_date: this.model.end_date,
            scope: this.model.scope,
            license_issuer: this.model.license_issuer,
            register_address: this.model.register_address,
            operate_address: this.model.operate_address,
            warehouse_address: this.model.warehouse_address
        })
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            YFWToast('保存成功')
            this.props.navigation.goBack()
        }, () => { },true)

    }


    getImageInfoForService(path) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.app.image2Text_general')
        paramMap.set('imagePath', path)
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            if(res.result.match == false){
                this.view.tipsInfo.ishowCloseIcon = false
                this.view.tipsInfo.confirmBtnText = '我知道了'
                this.view.tipsInfo.titleText = '证件识别失败'
                this.view.tipsInfo.text = '将手机处于正上方或正前方拍摄，确保页面四角完整，字迹清晰，亮度均匀。'
                this.view.tipsInfo.callback = ()=>{this.removePic()}
                this.view.showTips()
                // this.view.updateViews()
            }
            this.view&&this.view.updateViews()
            }, () => { },true)
    }
}
