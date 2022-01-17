import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDProbateAdminModel from '../Model/YFWWDProbateAdminModel';
import YFWWDProbateAdminView from '../View/YFWWDProbateAdminView';
import {safeObj, isStringEmpty, safe} from '../../../PublicModule/Util/YFWPublicFunction';
import { YFWWDUploadImageInfoModel } from '../../Widget/Model/YFWWDUploadImageInfoModel';
import YFWToast from '../../../Utils/YFWToast';

export default class YFWWDProbateAdminController extends YFWWDBaseController {

    constructor(props) {
        super(props);
        this.model = new YFWWDProbateAdminModel()
        this.view = <YFWWDProbateAdminView ref={(view) => this.view = view} father={this} model={this.model} />
    }

    render() {
        return this.view
    }

    componentWillMount() {

        this.request()
    }

    /******************delegete********************/
    backMethod() {
        super.backMethod()
    }

    removePic(type) {
        if (type == 'front') {
            this.model.idcard_pic_front = new YFWWDUploadImageInfoModel({name:'front'})
        } else {
            this.model.idcard_pic_background = new YFWWDUploadImageInfoModel({name:'background'})
        }
        this.view&&this.view.updateViews()

    }

    reUpload(type) {
        let uri = ''
        if (type == 'front') {
            this.model.idcard_pic_front.isUploading = true
            uri = this.model.idcard_pic_front.uri
        } else {
            this.model.idcard_pic_background.isUploading = true
            uri = this.model.idcard_pic_background.uri
        }
        this.view.updateViews()
        this.uploadImage(uri, (imageUrl) => {
            if (type == 'front') {
                this.getImageInfoForService(imageUrl)
            }
            this.handleServicePic(imageUrl,type,true)
          }, () => {
            this.handleServicePic('',type,false)
        })
    }

    selectPic(type,rechoose) {
        super.selectPic((path) => {
            this.addPic(path,type,rechoose)
            this.uploadImage(path, (imageUrl) => {
                if (type == 'front') {
                    this.getImageInfoForService(imageUrl)
                }
                this.handleServicePic(imageUrl, type, true)
            }, () => {
                this.handleServicePic('',type,false)
            })
        })
    }

    addPic(path,type,rechoose) {
         //{type:'default',isUploading:false,sucess:false}
        if (type == 'front') {
            if (rechoose) {
                this.model.idcard_pic_front.success = false
            }
            this.model.idcard_pic_front.type = 'image'
            this.model.idcard_pic_front.isUploading = true
            this.model.idcard_pic_front.uri = path
        } else {
            if (rechoose) {
                this.model.idcard_pic_background.success = false
            }
            this.model.idcard_pic_background.type = 'image'
            this.model.idcard_pic_background.isUploading = true
            this.model.idcard_pic_background.uri = path
        }
        this.view.updateViews()
    }

    handleServicePic(imageUrl, type, sucess) {
        if (type == 'front') {
            this.model.idcard_pic_front.isUploading = false
            this.model.idcard_pic_front.serviceUri = imageUrl
            if (sucess) {
                this.model.idcard_pic_front.success = true
            }
        } else {
            this.model.idcard_pic_background.isUploading = false
            this.model.idcard_pic_background.serviceUri = imageUrl
            if (sucess) {
                this.model.idcard_pic_background.success = true
            }
        }
        this.view.updateViews()
    }

    textChange(text,type) {
        if (type == 'xm') {
            this.model.name = text
        } else {
            this.model.idcard_num = text
        }
        this.view&&this.view.updateViews()
    }

    toSave() {
        if (isStringEmpty(this.model.name)) {
            YFWToast('请填写姓名')
            return
        }
        if (isStringEmpty(this.model.idcard_num)) {
            YFWToast('请填写身份证号码')
            return
        }
        if (!this.model.idcard_pic_front.success) {
            YFWToast('身份证人像面未上传')
            return
        }
        if (!this.model.idcard_pic_background.success) {
            YFWToast('身份证国徽面未上传')
            return
        }
        if (!this.checkIdCardNum(this.model.idcard_num)) {
            YFWToast('身份证号码不对')
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.app.updateStoreAdminInfo_b2b')
        paramMap.set('data', {
            real_name:this.model.name,
            real_idcard:this.model.idcard_num,
            admin_sfz_reverse:this.model.idcard_pic_front.serviceUri,
            admin_sfz_front:this.model.idcard_pic_background.serviceUri
        })
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            YFWToast('保存成功')
            this.props.navigation.goBack()
        }, () => { },true)

    }

    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.getStoreAdminInfo')
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            let instance = YFWWDProbateAdminModel.initWithData(safeObj(res.result))
            this.model = instance
            this.view&&this.view.updateViews()
            }, () => { })
    }

    getImageInfoForService(path) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.image2Text_idcard_front')
        paramMap.set('imagePath', path)
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            //result: {name: "", idcardno: ""}
            if (res.result.idcardno == '' && res.result.name == '') {
                YFWToast('请上传真实的身份证人像照')
                return
            } else {
                if (this.model.idcard_num == '') {
                    this.model.idcard_num = safe(res.result.idcardno)
                }
                if (this.model.name=='') {
                    this.model.name = safe(res.result.name)
                }
                this.view&&this.view.updateViews()
            }
            }, () => { },false)
    }
}
