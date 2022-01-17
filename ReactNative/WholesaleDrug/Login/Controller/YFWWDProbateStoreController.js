import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDProbateStoreModel from '../Model/YFWWDProbateStoreModel';
import YFWWDProbateStoreView from '../View/YFWWDProbateStoreView';
import { YFWWDUploadImageInfoModel } from '../../Widget/Model/YFWWDUploadImageInfoModel';
import {safeObj, isStringEmpty, safe} from '../../../PublicModule/Util/YFWPublicFunction';
import YFWToast from '../../../Utils/YFWToast';

export default class YFWWDProbateStoreController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDProbateStoreModel()
        this.pageType = this.props.navigation.state.params.state.param
        this.model.pageType = this.pageType
        this.view = <YFWWDProbateStoreView ref={(view) => this.view = view} father={this} model={this.model}/>
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
        if (type == 'horizontal') {
            this.model.storeType = 'horizontal'
        } else {
            this.model.storeType = 'vertical'
        }
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
            this.model.storeName = text
        } else if (type == 'address') {
            this.model.storeAddress = text
        }
        this.view&&this.view.updateViews()
    }

    selectDate = (date) => {
        let start = this.getFormatTimeString(date[0],'年月日','yyyy-MM-dd')
        let end = this.getFormatTimeString(date[1],'年月日','yyyy-MM-dd')
        this.model.storeStart = start
        this.model.storeEnd = end
        this.view&&this.view.updateViews()
    }

    request() {
        let paramMap = new Map();
        switch (this.pageType) {
            case 'store'://营业执照认证
                paramMap.set('__cmd', 'guest.account.getStoreDataInfo')
                break;
            case 'privateUnit'://民办非企业单位登记证书
                paramMap.set('__cmd', 'guest.account.getStoreNotGovInfo')
                break;
            case 'institution'://事业单位法人证书
                paramMap.set('__cmd', 'guest.account.getStoreGovLegalInfo')
                break;
        }
        this.model.paramMap = paramMap
        this.model.getData((res) => {
            // console.log(JSON.stringify(res))
            let instance = YFWWDProbateStoreModel.initWithData(safeObj(res.result))
            this.model = instance
            this.model.pageType = this.pageType
            this.view&&this.view.updateViews()
            }, () => { })
    }

    toSave() {
        // if (isStringEmpty(this.model.storeName)) {
        //     YFWToast('请填写企业名称')
        //     return
        // }
        // if (isStringEmpty(this.model.storeAddress)) {
        //     YFWToast('请填写注册地址')
        //     return
        // }
        if (isStringEmpty(this.model.storeStart) || isStringEmpty(this.model.storeEnd)) {
            YFWToast('请填写营业期限')
            return
        }
        if (!this.model.image.success) {
            YFWToast('营业执照未上传')
            return
        }

        let paramMap = new Map();
        switch (this.pageType) {
            case 'store'://营业执照认证
                paramMap.set('__cmd', 'store.buy.app.updateStoreDataInfo_b2b')
                paramMap.set('data', {
                    licenseimage:this.model.image.serviceUri,
                    shop_register_address:this.model.storeAddress,
                    yyzz_start_time:this.model.storeStart,
                    yyzz_end_time:this.model.storeEnd,
                    temp:this.model.storeType,
                })
                break;
            case 'privateUnit'://民办非企业单位登记证书
                paramMap.set('__cmd', 'store.buy.app.uploadStoreNotGovInfo_b2b')
                paramMap.set('data', {
                    image:this.model.image.serviceUri,
                    title:this.model.storeName,
                    register_address:this.model.storeAddress,
                    start_date:this.model.storeStart,
                    end_date:this.model.storeEnd,
                })
                break;
            case 'institution'://事业单位法人证书
                paramMap.set('__cmd', 'store.buy.app.uploadStoreGovLegalInfo_b2b')
                paramMap.set('data', {
                    image:this.model.image.serviceUri,
                    title:this.model.storeName,
                    register_address:this.model.storeAddress,
                    start_date:this.model.storeStart,
                    end_date:this.model.storeEnd,
                })
                break;
        }
        this.model.paramMap = paramMap
        // console.log(JSON.stringify(paramMap.get('data')))
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
            // console.log(JSON.stringify(res))
            if(!res.result.match){
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
