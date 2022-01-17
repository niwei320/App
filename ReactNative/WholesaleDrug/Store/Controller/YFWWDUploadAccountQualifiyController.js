import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDUploadAccountQualifiyModel, { YFWWDUploadImageInfoModel } from '../Model/YFWWDUploadAccountQualifiyModel';
import YFWWDUploadAccountQualifiyView from '../View/YFWWDUploadAccountQualifiyView';
import {
    isNotEmpty,
    isEmpty,
    safeObj,
    objToStrMap,
    safeArray, isStringEmpty
} from '../../../PublicModule/Util/YFWPublicFunction';
import YFWToast from '../../../Utils/YFWToast';
import YFWNativeManager from "../../../Utils/YFWNativeManager";
import {yfwGreenColor} from "../../../Utils/YFWColor";

export default class YFWWDUploadAccountQualifiyController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDUploadAccountQualifiyModel()
        this.view = <YFWWDUploadAccountQualifiyView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() {
        this.model.shopName = this.props.navigation.state.params.state.shopName
        this.model.id = this.props.navigation.state.params.state.id
        this.model.father = this.props.navigation.state.params.state.father
        this.model.localPic.push(new YFWWDUploadImageInfoModel())
        this.model.value = this.props.navigation.state.params.state.value
        if(isNotEmpty(this.model.value)){
            this.model.qualifiyType = this.model.value.type1 == 1?"syzz":"zzzj"
            this.model.allQualifiyTypeValue.push(this.model.value.type2)
            this.model.allQualifiyTypeDesc.push(this.model.value.name)
            this.model.selectIndex = 0
        }else {
            this.model.qualifiyType = "syzz"
            this.request()
        }
    }

    render() {
        return this.view
    }

    /******************delegete********************/

    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getSysDict')
        paramMap.set('type', 'dict_first_archives_type')
        YFWWDUploadAccountQualifiyModel.request(paramMap, (res) => {
            let data = safeObj(res.result)
            data = objToStrMap(data)
            if(data.has('14')){ // 采购委托书排第一YFWWholesaleHomePage
                this.model.allQualifiyTypeValue.push('14')
                this.model.allQualifiyTypeDesc.push(data.get('14'))
            }
            data.forEach((value,key) => {
                if(key != '14'){
                    this.model.allQualifiyTypeValue.push(key)
                    this.model.allQualifiyTypeDesc.push(value)
                }
            });
        }, (err) => { },false)
    }

    selectPic(index) {
        super.selectPic((path) => {
            this.addPic(path,index)
            this.uploadImage(path, (imageUrl) => {
              this.handleServicePic(imageUrl,index,true)
            }, () => {
                this.handleServicePic('',index,false)
            })
        })
    }

    handleServicePic(imageUrl, index, sucess) {
        if (index == -1) {
            index = this.model.localPic.length - 2
        }
        let instance = YFWWDUploadImageInfoModel.init(this.model.localPic[index])
        instance.isUploading = false
        instance.serviceUri = imageUrl
        if (sucess) {
            instance.success = true
        }
        this.model.localPic[index] = instance
        this.view.updateViews()
    }

     /**
     * 添加图片
     * @param item
     */
    addPic(path,index) {
        //{type:'default',isUploading:false,sucess:false}
        let instance = new YFWWDUploadImageInfoModel()
        instance.type = 'image'
        instance.isUploading = true
        instance.uri = path
        if (index == -1) {
            this.model.localPic.splice(this.model.localPic.length - 1, 0, instance)
        } else {
            this.model.localPic.splice(index, 1,instance)
        }
        this.view.updateViews()
    }
    removePic(index) {
        this.model.localPic.splice(index,1)
        this.view.updateViews()
    }
    reUpload(index) {
        this.model.localPic[index].isUploading = true
        this.view.updateViews()
        this.uploadImage(this.model.localPic[index].uri, (imageUrl) => {
            this.handleServicePic(imageUrl,index,true)
          }, () => {
            this.handleServicePic('',index,false)
        })
    }
    chooseQualifiyType(array) {
        this.view.showPicker(array, (value) => {
            this.model.selectIndex = this.getArrayIndexFromValue(this.model.allQualifiyTypeDesc,value)
            this.view.updateViews()
        }, () => { })
    }

    textChange(text,type) {
        if (type == 'licence_code') {
            this.model.licence_code = text
        }
        this.view&&this.view.updateViews()
    }

    copyText(text) {
        // YFWNativeManager.copyLink(text);
        YFWNativeManager.weakUpBrowser(text);
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

    saveInfo() {
        if (this.model.selectIndex == -1) {
            YFWToast('请选择资质类型')
            return
        }
        if (this.model.localPic.length == 1) {
            YFWToast('图片未上传')
            return
        }
        if (!this.checkLocalPic()) {
            YFWToast('图片未上传成功')
            return
        }
        if(this.model.qualifiyType == 'zzzj') {
            if (isStringEmpty(this.model.licence_code)) {
                YFWToast('证件编号未填写')
                return
            }
            if (this.model.allQualifiyTypeValue[this.model.selectIndex] == '7' && (isStringEmpty(this.model.start_date) || isStringEmpty(this.model.end_date))) {
                YFWToast('日期未填写')
                return
            }
        }
        if(this.model.qualifiyType == 'zzzj'){
            this.saveRequestZZZJ()
        } else if(this.model.qualifiyType == 'syzz') {
            this.saveRequestSYZZ()
        }
    }


    saveRequestZZZJ(){
        let licenceType = this.model.allQualifiyTypeValue[this.model.selectIndex]
        if (licenceType == '7'){    //食品经营许可
            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.account.uploadStoreSPJYXKZInfo')
            paramMap.set('data', {
                image:this.model.getServiceUri(),
                start_date: this.model.start_date,
                end_date: this.model.end_date,
                licence_code: this.model.licence_code,
            })
            this.model.paramMap = paramMap
            this.model.getData((res) => {
                YFWToast('保存成功')
                this.props.navigation.goBack()
            }, () => { },true)
        } else if(licenceType == '12'){     //第二类医疗器械经营备案凭证
            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.account.uploadSecondLicence')
            paramMap.set('data', {
                image:this.model.getServiceUri(),
                licence_code: this.model.licence_code,
            })
            this.model.paramMap = paramMap
            this.model.getData((res) => {
                YFWToast('保存成功')
                this.props.navigation.goBack()
            }, () => { },true)

        }
    }

    saveRequestSYZZ(){
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.settings.shopimage.SaveOrUpdte_Syzz')
        paramMap.set('data', this.model.id!=''?{
            name: this.model.allQualifiyTypeDesc[this.model.selectIndex],
            dict_first_archives_type: this.model.allQualifiyTypeValue[this.model.selectIndex],
            image: this.model.getServiceUri(),
            id:this.model.id
            } :{
            name: this.model.allQualifiyTypeDesc[this.model.selectIndex],
            dict_first_archives_type: this.model.allQualifiyTypeValue[this.model.selectIndex],
            image:this.model.getServiceUri()
        })
        YFWWDUploadAccountQualifiyModel.request(paramMap, (res) => {
            YFWToast('保存成功')
            super.backMethod()
        }, (err) => { },true)
    }

    //检查本地图片是否全部上传成功
    checkLocalPic() {
        let returnBool = true
        this.model.localPic.forEach((item,index) => {
            if (!item.success&&item.type != 'default') {
                 returnBool = false
            }
        })
        return returnBool
    }

    toCustomerService() {
        super.toCustomerService()
    }
}
