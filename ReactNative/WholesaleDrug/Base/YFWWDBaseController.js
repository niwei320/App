import React, { Component } from 'react';
import { View, DeviceEventEmitter, Platform } from 'react-native';
import { NavigationActions } from "react-navigation";
import YFWToast from '../../Utils/YFWToast';
import YFWImagePicker from '../../Utils/YFWImagePicker';
import { isNotEmpty, safeObj, itemAddKey, safeArray, safe } from '../../PublicModule/Util/YFWPublicFunction';
import YFWWDMedicineInfoModel from '../Widget/Model/YFWWDMedicineInfoModel';
import YFWWDQualificationInfoModel from '../Widget/Model/YFWWDQualificationInfoModel';
import YFWNativeManager from '../../Utils/YFWNativeManager';
import { YFWImageConst } from '../Images/YFWImageConst';
import YFWWDMessageHomeItemModel from '../Widget/Model/YFWWDMessageHomeItemModel';
import YFWWDMessageListItemModel from '../Widget/Model/YFWWDMessageListItemModel';
import { kList_from } from './YFWWDBaseModel';
import YFWWDComplaintListItemModel from '../Widget/Model/YFWWDComplaintListItemModel';
import YFWWDListPageDataModel from '../Widget/Model/YFWWDListPageDataModel';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import YFWWDCouponModel from '../Widget/Model/YFWWDCouponModel';

export default class YFWWDBaseController extends Component{

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
    }

    render() {
        return (
            this.view
        )
    }



    donSomething() {
        YFWToast('做一些事情')
    }
/**************************************公用业务方法  ***********************************/

    backMethod() {
        this.props.navigation&&this.props.navigation.goBack()
    }

    toHome() {
        this.props.navigation.popToTop();
        const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
        this.props.navigation.dispatch(resetActionTab);
    }

    //去客服
    toCustomerService(data) {
        YFWNativeManager.openZCSobot(data)
    }

    getMedicineArray(data, back ,key) {
        let medicineArray = []
        data.forEach((value, index) => {
            let medicine = new YFWWDMedicineInfoModel()
            medicine.image = safeObj(value.intro_image)
            medicine.id = safeObj(value.id)
            medicine.title = safeObj(value.title)
            medicine.medicinId = safeObj(value.medicineid)
            medicine.name = safeObj(value.namecn)
            medicine.mname = safeObj(value.aliascn) + safeObj(value.namecn)
            medicine.brand = safeObj(value.aliascn)
            medicine.standard = safeObj(value.standard)
            medicine.wPrice = safeObj(value.price_min)
            medicine.medicine_status = safeObj(value.dict_store_medicine_status)
            medicine.authorized_code = safeObj(value.authorized_code)
            medicine.is_add_cart = safeObj(value.is_add_cart)
            medicineArray.push(medicine)
        });
        back && back(itemAddKey(medicineArray, key))
        return medicineArray
    }

    getQualificationArray(data, back, key) {
        let qualificationArray = []
        data.forEach((value, index) => {
            let medicine = new YFWWDQualificationInfoModel()
            medicine.image = safeObj(value.image_url)
            medicine.id = safeObj(value.id)
            medicine.storeid = safeObj(value.storeid)
            medicine.name = safeObj(value.name)
            medicine.licence_code = safeObj(value.licence_code)
            medicine.expiration_date = safeObj(value.end_date)
            medicine.expiry_desc = safeObj(value.expiry_desc)
            medicine.dict_store_licence_type = safeObj(value.dict_store_licence_type)
            medicine.type = safeObj(value.type)
            medicine.isReadOnly = safeObj(value.isReadOnly)
            qualificationArray.push(medicine)
        });
        back && back(itemAddKey(qualificationArray, key))
        return qualificationArray
    }

    arrayAddKey(array) {
        return itemAddKey(array)
    }

     /**
     * 获取数组元素的index
     * @param {数组} array
     * @param {要获取index的值} value
     */
    getArrayIndexFromValue(array, value) {
        let backIndex = 0
        array.forEach((item,index) => {
            if (value == item) {
                backIndex = index
            }
        })
        return backIndex
    }

    /**
     *
     * @param {获取时间字符串} text
     */
    getFormatTimeString(text, sourceType, targetType) {
        if (text == '') {
            return ''
        }
        if (sourceType == '年月日' &&targetType == 'yyyy-MM-dd') {
            // sourceType: 2018年1月5日;
            let arr = text.match(/\d{1,}/g);
            let dataStr = ''
            arr.forEach((item,index) => {
                if (index == 0) {
                    dataStr += item
                } else {
                    dataStr += '-' + item
                }
            })
            return dataStr
        } else {
            let array = safe(text).split('-')
            return parseInt(array[0])+'年'+parseInt(array[1])+'月'+parseInt(array[2])+'日'
        }
    }

    /**校验手机号码 */
    checkPhoneNum(phone) {
        var myreg = /^(1)[0-9]{10}$/;
        if (!myreg.test(phone)) {
            return false;
        } else {
            return true;
        }
    }

    /**校验密码强度 */
    checkPassword(password) {
        var myreg = /^(?![0-9]+$)(?![a-zA-Z]+$)/;
        if (!myreg.test(password)) {
            return false;
        } else {
            return true;
        }
    }

    /**校验用户名 */
    checkUserName(userName) {
        var myreg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_]){4,18}$/;
        if (!myreg.test(userName)) {
            return false;
        } else {
            return true;
        }
    }
    /**校验企业名称 */
    checkQYName(qyName) {
        var myreg = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_]|[(]|[)]){1,30}$/;
        if (!myreg.test(qyName)) {
            return false;
        } else {
            return true;
        }
    }
    /**校验身份证 */
    checkIdCardNum(idcard) {
        var myreg = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/;
        if (!myreg.test(idcard)) {
            return false;
        } else {
            return true;
        }
    }

/*******************************登录 **********************************/
    toLogin(usr,pwd,noToast,callback) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.account.login');
        paramMap.set('userName', usr);
        paramMap.set('password', pwd);
        paramMap.set('login_type', '2');
        paramMap.set('sub_type', '1');
        this.model.requestWithParams(paramMap, (res) => {
            !noToast&&YFWToast('登录成功！')
            let userInfo = YFWUserInfoManager.ShareInstance();
            userInfo.setSsid(safe(res.ssid));
            this.loginGetStoreInfo()
            DeviceEventEmitter.emit('WDUserLoginSucess');
            callback&&callback()

            YFWNativeManager.mobClick('b2b-login-1')
        }, (err) => {

        },true)
    }

    loginGetStoreInfo() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.account.getAccountInfo')
        this.model.requestWithParams(paramMap, () => {}, () => { },false)

    }

    /*******************************加入购物车 **********************************/
    addShopCar(medicine, count) {
        let instance = YFWWDMedicineInfoModel.initWithModel(medicine)
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.cart.addCart');
        paramMap.set('quantity', count);
        paramMap.set('storeMedicineId', instance.id);
        YFWUserInfoManager.ShareInstance().addCarIds.set(instance.id + '', 'id')
        this.model.requestWithParams(paramMap, (res) => {
            YFWToast('商品添加成功');
            // DeviceEventEmitter.emit("SHOPCAR_INFO_CHANGE", '')//通知购物车 该商家商品发生变化  刷新凑单数据
            this.getCartGoodsCountMethod();
        }, () => { },true)
    }
    //获取购物车数量接口
    getCartGoodsCountMethod() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.cart.getCartCount');
        this.model.requestWithParams(paramMap, (res) => {
            this.dealCarGoodsCount(res)
        }, (error) => { }, false);
    }

    dealCarGoodsCount(res) {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        DeviceEventEmitter.emit('WD_SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
    }





    /*******************************图片选择、图片上传 **********************************/
      /**
     * 选择图片
     * @param item
     * @private
     */
    selectPic(back) {
        if( !this.imagePicker){
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.setMaxSize({width:1280,height:1280})
        if (Platform.OS == 'ios') {
            this.imagePicker.setQuality(1)
        }
        this.imagePicker.returnValue((result)=> {
            if (isNotEmpty(result)) {
                back&&back(result)
                // this.uploadImage(result)
                // this.addPic(result)
            }

        });
          this.imagePicker.show();
    }

    /*
     *  上传图片
     * */

    uploadImage(url,success,error) {
        YFWNativeManager.tcpUploadImg(url, (imgUrl)=> {
            success&&success(imgUrl)
        }, (err)=> {
            error&&error(err)
        })
    }



    countdownTimes() {
        const codeTime = this.model.timerCount;
        const now = Date.now()
        const overTimeStamp = now + codeTime * 1000 + 100
        /*过期时间戳（毫秒） +100 毫秒容错*/
        this.interval = setInterval(() => {
            /* 切换到后台不受影响*/
            const nowStamp = Date.now();
            if (nowStamp >= overTimeStamp) {
                /* 倒计时结束*/
                this.stopTimes()
            } else {
                const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
                this.model.noticeText = leftTime + "秒后重新获取",
                this.model.noticeEnable = false
                this.view&&this.view.updateViews()
            }
         }, 1000)
    }

     /**
     * 发送短信验证码结束状态
     */
    stopTimes(){
        this.interval && clearInterval(this.interval);
        this.model.noticeText = '获取验证码'
        this.model.noticeEnable = true
        this.view&&this.view.updateViews()
    };

/***************************************flatlist delegate  ***************************/

    getListData(isShowLoad) {
        this.view.statusView&&this.view.statusView.dismiss&&this.view.statusView.dismiss()
        this.model.listModel.getData((res) => {
            let data = []
            if (this.model.listModel.dataPath == 'result') {
                data = safeArray(res.result)
            } else {
                data = safeArray(res.result.dataList)
            }
            data = this.handleOriginalData(data)
            if (this.model.listModel.currentPage == 1) {
                if (data.length == 0) {
                    if (this.model.listModel.from == kList_from.kList_from_message_list) {
                        this.view.statusView&& this.view.statusView.showEmptyWIthTips && this.view.statusView.showEmptyWIthTips('没有最新' + this.instance.itemTitle, YFWImageConst.Icon_no_message)
                    } else {
                        this.view.statusView && this.view.statusView.showEmptyWIthTips&& this.view.statusView.showEmptyWIthTips('暂无数据')
                    }
                    this.view&&this.view.updateViews()
                } else {
                    this.model.listModel.dataArray = data
                    this.view&&this.view.updateViews()
                }
            } else {
                if (data.length < this.model.listModel.pageSize) {
                    this.model.listModel.showFoot = 1
                }
                this.model.listModel.dataArray.push(...data)
            }

        }, (err) => {
            this.view&&this.view.statusView&&this.view.statusView.showRequestError()
        },isShowLoad?isShowLoad:true)
    }

       /**列表下拉刷新 */
    listRefresh() {
        this.model.listModel.showFoot = 0
        this.model.listModel.dataArray = []
        this.view.updateViews()
        this.model.listModel.currentPage = 1
        this.model.listModel.refreshing = true
        this.getParamMap&&this.getParamMap()
        this.getListData(true)
    }

    onEndReached() {
        if (this.model.listModel.dataArray.length < this.model.listModel.pageSize&&this.model.listModel.currentPage == 1) {
            this.model.listModel.showFoot = 1
            this.view.updateViews()
        } else if (this.model.listModel.showFoot == 1) {
            return
        }else {
            this.model.listModel.showFoot = 2
            this.view.updateViews()
            this.model.listModel.currentPage++
            this.getParamMap&&this.getParamMap()
            this.getListData(false)
        }
    }

    //从原始数据获得 模型数据
    handleOriginalData(origindata) {
        let returnArray = []
        if (this.model.listModel.from == kList_from.kList_from_message_home) {
            origindata.forEach((item) => {
                let data = YFWWDMessageHomeItemModel.initWithData(safeObj(item))
                returnArray.push(data)
            })
        }else if (this.model.listModel.from == kList_from.kList_from_message_list) {
            origindata.forEach((item) => {
                let data =  YFWWDMessageListItemModel.initWithData(safeObj(item))
                returnArray.push(data)
            })
        }else if (this.model.listModel.from == kList_from.kList_from_wdts) {
            origindata.forEach((item) => {
                let data =  YFWWDComplaintListItemModel.initWithData(safeObj(item))
                returnArray.push(data)
            })
        }else if (this.model.listModel.from == kList_from.kList_from_history) {
            origindata.forEach((temp) => {
                let medicineArray = []
                for (var key in temp) {
                    safeArray(temp[key]).forEach((item) => {
                        let data = YFWWDMedicineInfoModel.initWithData(safeObj(item),kList_from.kList_from_history)
                        medicineArray.push(data)
                    })
                }
                let instance = new YFWWDListPageDataModel()
                instance.needRequest = false
                instance.from = kList_from.kList_from_history
                instance.dataArray = itemAddKey(medicineArray)
                returnArray.push({title:this.getFormatTimeString(key),model:instance})
            })
        }else if (this.model.listModel.from == kList_from.kList_from_frequentlygoods) {
            origindata.forEach((item) => {
                let data = YFWWDMedicineInfoModel.initWithData(safeObj(item),kList_from.kList_from_frequentlygoods)
                returnArray.push(data)
            })
        }else if (this.model.listModel.from == kList_from.kList_from_operationsccess) {
            origindata.forEach((item) => {
                let data = YFWWDMedicineInfoModel.initWithData(safeObj(item),kList_from.kList_from_operationsccess)
                returnArray.push(data)
            })
        }else if (this.model.listModel.from == kList_from.kList_from_mycoupon) {
            origindata.forEach((item) => {
                let data = YFWWDCouponModel.initWithData(safeObj(item))
                returnArray.push(data)
            })
        }else if (this.model.listModel.from == kList_from.kList_from_storeList) {
            origindata.forEach((item) => {
                let data = YFWWDMedicineInfoModel.initWithData(safeObj(item),kList_from.kList_from_storeList)
                returnArray.push(data)
            })
        }else {
            origindata.forEach((value, index) => {
                let medicine = new YFWWDMedicineInfoModel()
                medicine.image = safeObj(value.intro_image)
                medicine.id = safeObj(value.id)
                medicine.title = safeObj(value.title)
                medicine.medicinId = safeObj(value.medicineid)
                medicine.name = safeObj(value.namecn)
                medicine.mname = safeObj(value.aliascn) + safeObj(value.namecn)
                medicine.brand = safeObj(value.aliascn)
                medicine.standard = safeObj(value.standard)
                medicine.wPrice = safeObj(value.price_min)
                medicine.medicine_status = safeObj(value.dict_store_medicine_status)
                medicine.authorized_code = safeObj(value.authorized_code)
                medicine.is_add_cart = safeObj(value.is_add_cart)
                returnArray.push(medicine)
            });
        }
        return itemAddKey(returnArray,this.model.listModel.dataArray.length)
    }

}
