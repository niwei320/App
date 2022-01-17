import React, {Component} from 'react';
import {
    Alert,
    DeviceEventEmitter,
    FlatList,
    Image,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View, ImageBackground, StyleSheet
} from 'react-native';

import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor, yfwRedColor,yfwGreenColor
} from '../Utils/YFWColor'
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {
    darkStatusBar,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    kScreenWidth,
    min,
    mobClick,
    richText,
    safe,
    safeObj,
    strMapToObj,
    tcpImage,
    adaptSize,
    deepCopyObj,
    payOrderTip,
    isArray, kScreenHeight, kScreenScaling, safeArray, safeFloatNumber
} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWToast from "../Utils/YFWToast";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWPaymentDialogView from './View/YFWPaymentDialogView'
import YFWPackageAlertView from '../OrderPay/View/YFWPackageAlertView'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import BaseTipsDialog from "../PublicModule/Widge/BaseTipsDialog";
import StatusView from '../widget/StatusView'
import YFWOrderSettlementModel from "../OrderPay/Model/YFWOrderSettlementModel";
import {toDecimal} from "../Utils/ConvertUtils";
import AndroidHeaderBottomLine from "../widget/AndroidHeaderBottomLine";
import YFWAddressModel from "../UserCenter/Model/YFWAddressModel";
import YFWDiscountText from '../PublicModule/Widge/YFWDiscountText'
import YFWSettlementPointModel from './Model/YFWSettlementPointModel'
import {IDENTITY_CODE, IDENTITY_VERIFY, NAME} from "../PublicModule/Util/RuleString";
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_SINGLE,
    TYPE_OTC
} from "../widget/YFWPrescribedGoodsTitle";
import ActionSheet from "react-native-actionsheet";
import YFWRequestParam from "../Utils/YFWRequestParam";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWSettlementHeader from "../widget/YFWSettlementHeader";
import LinearGradient from "react-native-linear-gradient";
import YFWMoneyLabel from "../widget/YFWMoneyLabel";
import YFWRxInfoTipsAlert from './View/YFWRxInfoTipsAlert'
import CustomAlertDialog from "./View/CustomAlertDialog";
import { addLogPage, refreshRedPoint } from '../Utils/YFWInitializeRequestFunction';
import YFWNoLogisticAlertView from './View/YFWNoLogisticAlertView';
import YFWCustomTipAlertView from '../UserCenter/order/OrderDetail/YFWCustomTipAlertView';

export default class YFWOrderSettlementRootVC extends Component {


    static navigationOptions = ({ navigation }) => ({

        tabBarVisible: false,
        title:'订单结算',
        headerRight:<View width={50}/>,
    });

    constructor(...args) {
        super(...args);
        this.submitClickable = true // 是否可以点击提交
        this.RxUploadInfo = {type:0,isSuccess:false,isDouble:0,info:null} // 处方信息是否提交成功,type:0处方上传1:问诊
        this.DrugRegistrationInfo = {isSuccess:false,info:null} //用药登记
        this.state = {
            pointInfo:{},
            checkOutInfo:{},
            dataArray:[],
            defaultAddress:undefined,

            selectPackage:new Map(),
            selectCoupon:new Map(),
            selectLogistic:new Map(),
            selectShopOffers:new Map(),
            selectPlatformCoupons:new Map(),
            selectInvoice:new Map(),
            selectInvoiceIndex:'0',             //0无需、1个人、2公司
            usePoint:false,
            useBalance:false,
            selectBalance:0,
            selectPoint:0,
            isShow:false,
            medicateItem:null,//用药人信息
            inquiry_rx_images:[],
            drug_items:[],
            noProof: false,
            showAddTip:true,
            singleItemNumMap:new Map(),
            packageItemNumMap:new Map(),
        };
        this.request_again_getBuy = 0;
        this.request_again_getAddress = 0;
        this.donotHaveAddress = false;
        this.cartIDStr = ''
        this.packageIDStr = ''
        this.noLogisticDes = '当前收货地址，商家暂不配送'
        this.notSendLogisticDes = '含有不配送商品，商家暂不配送'
        this.notSendLogisticTip = '含有不配送商品'
        this.payMentInfo = null //预选支付方式

    }
    _noProofCallBack(){
        this.state.noProof = true
        this.setState({})
    }

    componentWillMount() {
        addLogPage(5)
    }

    componentDidMount () {
        this.stopTipAnimation()
        darkStatusBar();
        this.commodity = this.props.navigation.state.params.Data;
        this.fromBuyNow = this.props.navigation.state.params.fromBuyNow;
        this.extraParams = this.props.navigation.state.params.extraParams
        DeviceEventEmitter.addListener('FaPiaoBack',(value)=>{
            let data = new Map();
            data.set('value',value);
            this.setState({
                selectInvoice:data,
                selectInvoiceIndex:value.type,
            });
        });

        this.didFocus = this.props.navigation.addListener('didFocus',()=>{
            if (isEmpty(this.defaultAddress) || this.needRefreshRequestAddress) {
                this.handleData()
            }
        })

        this.changeUserDrugListener = DeviceEventEmitter.addListener('kChangeUserDrug',()=>{
            this._requestCheckOutInfo(false)
        })

        this.changeAddressListener = DeviceEventEmitter.addListener('kChangeAddress',()=>{
            this.needRefreshRequestAddress = true
        })
    }


    handleData(){

        this.request_again_getBuy = 0;
        this.request_again_getAddress = 0;
        this._requestAddressList();

    }


    componentWillUnmount() {
        this.changeUserDrugListener&&this.changeUserDrugListener.remove()
        this.changeAddressListener&&this.changeAddressListener.remove()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
        this.didFocus&&this.didFocus.remove();
    }


    // =========== Request =============

    _requestAddressList(){

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.address.getReceiptAddress');
        paramMap.set('pageSize',20);
        paramMap.set('pageIndex',1);
        viewModel.TCPRequest(paramMap , (res)=>{
            let addressArray = YFWAddressModel.getModelArray(res.result);
            if (isNotEmpty(addressArray)){

                if (addressArray.length == 0){
                    this._showNonAddressAlert();
                    if(this.statusView)this.statusView.dismiss();
                    this.donotHaveAddress = true
                    return;

                } else {
                    this.donotHaveAddress = false
                    addressArray.forEach((item, index, array)=>{
                        if (item.is_default == '1' && !this.needRefreshRequestAddress){
                            this.defaultAddress = item;
                        }
                        if (this.needRefreshRequestAddress && isNotEmpty(this.defaultAddress) && this.defaultAddress.id == item.id) {
                            this.defaultAddress = item
                        }
                    });
                    if (isEmpty(this.defaultAddress) || (isNotEmpty(this.defaultAddress) && !addressArray.some((item)=>{return item.id == this.defaultAddress.id}))){
                        this.defaultAddress = addressArray[0];
                    }
                    this.setState({
                        defaultAddress:this.defaultAddress,
                    });
                    this.needRefreshRequestAddress = false
                    this._requestCheckOutInfo(false);

                }
            }


        },()=>{
            if (this.request_again_getAddress == 3){
                if(this.statusView)this.statusView.showNetError();
            } else {
                this.request_again_getAddress ++;
                this._requestAddressList();
            }
        },false);

    }



    _requestCheckOutInfo(refresh){


        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;

        let IDarray = [];
        let pakageArray = [];
        if (isNotEmpty(this.commodity)){
            this.commodity.map((item)=>{
                if (item.type == 'package' || item.type == 'courseOfTreatment'){
                    pakageArray.push(item.package_id)
                } else {
                    IDarray.push(item.id)
                }
            });
        }
        //去重
        IDarray = Array.from(new Set(IDarray))
        pakageArray = Array.from(new Set(pakageArray))

        let ids = IDarray.join(',');
        let pakageIds = pakageArray.join(',');
        if (ids.length == 0 && pakageIds.length == 0) return;

        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.getBuy');
        paramMap.set('addressid', safe(this.defaultAddress?.id));
        if (ids.length > 0){
            paramMap.set('cartids', safe(ids));
            this.cartIDStr = safe(ids)
        }
        if (pakageIds.length > 0){
            paramMap.set('packageids', safe(pakageIds));
            this.packageIDStr = safe(pakageIds)
        }
        if (isNotEmpty(this.extraParams) && Object.prototype.toString.call(this.extraParams) === '[object Object]') {
            for (let k of Object.keys(this.extraParams)) {
                paramMap.set(k,this.extraParams[k]);
            }
        }

        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if (!this.workData) {
                this.workData = []
                for (let key in safeObj(res.result.work_trade_items)) { 
                    let value = res.result.work_trade_items[key]
                    this.workData.push({id:key,name:value})
                }
            }
            res = YFWOrderSettlementModel.getModelValue(res);
            if ( isEmpty(this.disease_items) ) {
                this.disease_items = res.disease_items
            }
            if(
                safeObj(safeObj(res).medicate_info_show) === 'true'
            &&  safeObj(res).medicate_info_type ==='1'
            &&  isArray(res.drug_items) && res.drug_items.length>0
            && isEmpty(safeObj(this.RxUploadInfo.info).drugid) ){
                this.RxUploadInfo.info = {
                    drugid:res.drug_items[0].id,
                    rx_images:[],
                    rx_upload_type:3,
                }
            }
            DeviceEventEmitter.emit('newUserDrug',res.drug_items)
            if(this.statusView)this.statusView.dismiss();

            let pointInfo = new YFWSettlementPointModel();
            pointInfo.point = res.user_point;
            pointInfo.prompt = res.balance_prompt;
            pointInfo.balance = res.balance;
            pointInfo.use_ratio = res.use_ratio;

            //立即购买进入相关数据处理
            if (this.fromBuyNow){
                //立即购买进入只会有一个shop_items取第一个
                safeArray(res.shop_items[0].cart_items).forEach((item, index)=>{
                    if (item.type == 'medicines') {
                        item.package_medicines.forEach((suuItem)=>{
                            this.state.singleItemNumMap.set(suuItem.id,suuItem.quantity)
                        })
                    } else {
                        if(isEmpty(item.id) && isEmpty(item.count)){
                            this.state.packageItemNumMap.set(item.package_id,item.count)
                        } else {
                            this.state.singleItemNumMap.set(item.id,item.quantity)
                        }
                    }

                })
                this.state.BuyNowShopId = res.shop_items[0].shop_id
            }

            this.state.checkOutInfo = res;
            this.state.dataArray = itemAddKey(res.shop_items);
            this.state.selectPackage = refresh ? new Map() : this.state.selectPackage;
            this.state.selectCoupon = refresh ? new Map() : this.state.selectCoupon;
            this.state.selectLogistic = refresh ? new Map() : this.state.selectLogistic;
            this.state.selectPlatformCoupons = refresh ? new Map() : this.state.selectPlatformCoupons;
            this.state.pointInfo = pointInfo;

            this._setDefaultValue(res);
            if (refresh){
                this.changeUsePointOrBalance();
            }

            this.setState({})

        },(res)=>{

            if (isNotEmpty(res) && isNotEmpty(res.code) && (String(res.code) === '-2' || String(res.code) === '-3')){

                if(this.statusView)this.statusView.dismiss();

                if (isNotEmpty(res.msg) && res.msg.length > 0){
                    let msg = res.msg;
                    if (String(res.code) === '-2') {
                        if (Platform.OS == 'ios') {
                            YFWNativeManager.showAlertWithTitle('',msg,()=>{
                                this.props.navigation.goBack()
                            })
                        } else {
                            Alert.alert('',msg,[
                                {text: '确认', onPress: () => this.props.navigation.goBack()}
                            ],{cancelable: false});
                        }
                    } else if (String(res.code) === '-3') {
                        Alert.alert('',msg,[
                            {text: '确认', onPress: () => this.props.navigation.goBack()}
                        ],{cancelable: false});
                    }

                }

            } else {

                if (this.request_again_getBuy == 3){
                    if(this.statusView)this.statusView.showNetError();
                } else {
                    this.request_again_getBuy ++;
                    this._requestCheckOutInfo(refresh);
                }

            }

        },refresh);

    }

    /**
     * 判断用药人信息是否完整
     * @returns {boolean}
     */
    verifyMedicateInfo(){
        //3.1.00版本才有，并且现阶段只有HTTP才有
        if(safeObj(safeObj(this.state.checkOutInfo).medicate_info_show) === 'true' && safeObj(this.state.checkOutInfo).medicate_info_type !=='2'){
            if(isArray(this.state.checkOutInfo.drug_items)&&this.state.checkOutInfo.drug_items.length>0){
                return false
            }else{
                return true
            }
        }
        return false
    }


    stopTipAnimation() {
        setTimeout(() => {
            this.setState({
                showAddTip:false
            })
        }, 2500);
    }

    clickSubmitMethod(){
        //判断当前地区是否配送
        let noLogistic = this.state.dataArray.some((item)=>{
            if(item.nologistcs_type == 1 || item.nologistcs_type == 2){
                let msg = item.nologistcs_type == 2?this.notSendLogisticDes:this.noLogisticDes
                YFWToast(msg)
                return true
            }
        })
        if(noLogistic){
            return
        }
        //判断用药人信息是否完整
        if(this.verifyMedicateInfo()){
            YFWToast("请完善用药人信息")
            this._flatList&&this._flatList.scrollToOffset({x:0,y:0})
            if (!this.state.showAddTip) {
                this.setState({showAddTip:true})
                this.stopTipAnimation()
            }
            return
        }
        //to-do
        if(safeObj(this.state.checkOutInfo).medicate_info_type ==='2'&&!this.RxUploadInfo.isSuccess){
            // this.rxInfoAlert && this.rxInfoAlert.showView()
            YFWToast('请添加处方信息')
            this._flatList&&this._flatList.scrollToOffset({x:0,y:0})
            if (!this.state.showAddTip) {
                this.setState({showAddTip:true})
                this.stopTipAnimation()
            }
            return
        }
        if (safeObj(this.state.checkOutInfo).is_needenrollment && !this.DrugRegistrationInfo.isSuccess) {
            this._flatList&&this._flatList.scrollToOffset({x:0,y:0})
            this.tipAlert && this.tipAlert.showView('疫情防控药品等级提醒','您购买的药品含疫情防控药品，根据监管部门要求需登记用药人信息后下单。',[
                {text:'取消',onPress:()=>{},isCancel:true},
                {text:'去登记',onPress:()=>{
                    this.gotoDrugRegistration()
                }},
            ])
            return
        }
        let array = [];
        let hasSubmit = true;

        let listMap = new Map();
        let cartidstr = '';
        let tcpCardsIds = '';
        let tcpPackageIds = '';

        for (let i=0 ; i<this.state.dataArray.length ; i++){
            let shop_item = this.state.dataArray[i];
            let shop_selectInvoice = this.state.selectInvoice.get(shop_item.shop_id)
            let invoice_code = '';
            let invoice_type = 0;
            let invoice_title = '';
            let dict_bool_etax = false
            if (isNotEmpty(shop_selectInvoice)) {
                let code = shop_selectInvoice.code;
                let title = shop_selectInvoice.title;
                if (Number.parseInt(code)>0) {
                    invoice_code = code;
                    invoice_type = 1;
                    invoice_title = title;
                }
                dict_bool_etax = shop_selectInvoice.dict_bool_etax
            }
            let goods_items = [];
            for (let j = 0; j < shop_item.cart_items.length ; j++){

                let goods_item = shop_item.cart_items[j];

                if (goods_item.type == 'package'){

                    let package_medicines = goods_item.package_medicines;
                    tcpPackageIds += (goods_item.package_id+',');
                    package_medicines.forEach((item,index,array)=>{

                        let goodsDic = {
                            cart_id : safe(item.id),
                            quantity: safe(item.quantity),
                        };
                        goods_items.push(goodsDic);
                        cartidstr = cartidstr + (item.id+',');
                    });


                }else {
                    let package_medicines = goods_item.package_medicines;
                    package_medicines.forEach((item,index,array)=>{

                        let goodsDic = {
                            cart_id : safe(item.id),
                            quantity: safe(item.quantity),
                        };
                        goods_items.push(goodsDic);
                        cartidstr = cartidstr + (item.id+',');
                        tcpCardsIds += (item.id+',');
                    });

                }

            }


            if (isEmpty(this.state.selectLogistic.get(shop_item.shop_id)) ||
                isEmpty(this.state.selectPackage.get(shop_item.shop_id)) ) {
                if (shop_item.nologistcs_type == '2') {
                    YFWToast(this.notSendLogisticTip);
                } else {
                    YFWToast(this.noLogisticDes);
                }
                hasSubmit = false;
                return;
            }



            let tmpDic = {
                shop_id:safe(shop_item.shop_id),
                payment_type:'在线支付',
                package_id:safe(safeObj(this.state.selectPackage.get(shop_item.shop_id)).id),
                logistic_id:safe(safeObj(this.state.selectLogistic.get(shop_item.shop_id)).id),
                goods_items:goods_items,
                order_desc:'',
                coupon_id:safe(safeObj(this.state.selectCoupon.get(shop_item.shop_id)).id),
                invoice_code:invoice_code,
                invoice_type:invoice_type,
                invoice_title:invoice_title,
            };
            array.push(tmpDic);

            //TCP
            let tempMap = {
                packageid:safe(safeObj(this.state.selectPackage.get(shop_item.shop_id)).id),
                logisticsid:safe(safeObj(this.state.selectLogistic.get(shop_item.shop_id)).id),
                couponsid:safe(safeObj(this.state.selectCoupon.get(shop_item.shop_id)).id),
                dict_bool_etax: dict_bool_etax? 1 : 0,//是否电子发票 1是 0否
                rx_image:"",
                rx_content:"",
                no_rx_reason:"",
                invoice_type:invoice_type+"",
                invoice_name:invoice_title,
                invoice_idcard:invoice_code,
            }
            //TCP
            listMap.set(shop_item.shop_id,tempMap)
        }

        if (!hasSubmit){

            YFWToast(this.noLogisticDes);
            return
        }
        let use_balance = Number.parseFloat(this.state.selectBalance.toString()).toFixed(2);
        let price = this._getPayMoney();
        let medicateInfo = safeObj(safeObj(this.state.checkOutInfo).medicate_item)
        let info = {
            // invoice_type:invoice_type,
            // invoice_name:invoice_title,
            // invoice_idcard:invoice_code,
            cartids:tcpCardsIds,
            packageids:tcpPackageIds,
            market:YFWUserInfoManager.ShareInstance().getMarket(),
            request_os:Platform.OS,
            use_point:safe(this.state.selectPoint.toString()),
            platform_coupon_id:safe(this.state.selectPlatformCoupons.id),
            use_balance:safe(use_balance),
            addressid:safe(this.state.defaultAddress.id),
            all_order_price_total:String(Number.parseFloat(price).toFixed(2)),
            shop_list:strMapToObj(listMap),
            medicate_name:medicateInfo.medicate_name,//用药人姓名
            medicate_idcard:medicateInfo.medicate_idcard,//用药人身份证号
            medicate_sex:medicateInfo.medicate_sex === '男' ? "1" : "0",//用药人性别
        };
        if (this.RxUploadInfo.info) {//处方信息相关/问诊信息相关
            info.rx_info = deepCopyObj(this.RxUploadInfo.info)
            // info.rx_info.rx_upload_type = info.rx_info.rx_upload_type == '0'?'1':'2'
            info.rx_info.rx_upload_type = this.RxUploadInfo.isDouble == 1?3:info.rx_info.rx_upload_type
            info.rx_info.rx_images = isNotEmpty(info.rx_info.rx_images)?info.rx_info.rx_images:[]
            info.rx_info.rx_image = info.rx_info.rx_images.join('|')
            info.rx_info.case_url = isNotEmpty(info.rx_info.case_url)?info.rx_info.case_url:[]
            info.rx_info.case_url = info.rx_info.case_url.join('|')
        }
        if (safeObj(this.state.checkOutInfo).is_needenrollment) {
            info.enrollment_info = JSON.stringify(strMapToObj(this.DrugRegistrationInfo.info))
        }
        if (listMap.size == 0) return;
        if (isNotEmpty(this.extraParams) && Object.prototype.toString.call(this.extraParams) === '[object Object]') {
            for (let k of Object.keys(this.extraParams)) {
                info[k] = this.extraParams[k]
            }
        }
        console.log(info)
        if (listMap.size == 1){
            // this._showPaymentDialog(info);//TODO 3.1.00暂时要求取消弹窗，统一跳转到待支付列表
            this._requestOrderSubmit(info);
        } else {
            this._requestOrderSubmit(info);
        }
    }

    getInquiryPrice(){
        let inquiry_price = 0
        if (this.RxUploadInfo.type == 1 && this.RxUploadInfo.isSuccess && parseFloat(this.state.checkOutInfo.inquiry_real_price) > 0) {
            inquiry_price = parseFloat(this.state.checkOutInfo.inquiry_real_price)
        }
        return inquiry_price;
    }

    changePayMentType() {
        this.PaymentDialog && this.PaymentDialog.showSelect(this._getPayMoney(),this.state.checkOutInfo.context,(payType)=>{
            let payMentInfo = {}
            if (payType =='wx') {
                payMentInfo = {
                    payment_name:'微信支付',
                    payment_nameen:'wxpay',
                    dict_payment:3,
                }
            } else if (payType == 'ali') {
                payMentInfo = {
                    payment_name:'支付宝支付',
                    payment_nameen:'alipay',
                    dict_payment:2,
                }
            } else if (payType == 'jd') {
                payMentInfo = {
                    payment_name:'京东支付',
                    payment_nameen:'jdpay',
                    dict_payment:6,
                }
            } else if (payType == 'jd-bt') {
                payMentInfo = {
                    payment_name:'京东白条支付',
                    payment_nameen:'jdpay-bt',
                    dict_payment:7,
                }
            }
            this.payMentInfo = payMentInfo
            this.state.checkOutInfo.lastOrder_payment = payMentInfo
            this.setState({})
            console.log(payType)
        })
    }

    _requestOrderSubmit(info,returnBlock){

        if(this.submitClickable){
            this.submitClickable = false
        }else{
            return;
        }

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let paramMap = new Map();
        paramMap.set('__cmd' , 'person.order.createOrder');
        paramMap.set('data_info' , info);
        let paramObj = new YFWRequestParam();
        let params = paramObj.getBaseParam(paramMap);
        try {
            DeviceEventEmitter.emit('LoadProgressShow');
            YFWNativeManager.TCPRequest(strMapToObj(params),(res)=>{
                DeviceEventEmitter.emit('LoadProgressClose');
                //此处只判断res是否为空，code不等于1的情况下，res.result可能为null
                if (isNotEmpty(res) && isNotEmpty(res.code)){
                    if (String(res.code) == '1') {
                        refreshRedPoint()
                        let res_items = safeArray(res.result);
                        //TODO 3.1.00版本暂时隐藏
                        /*if(res_items.length ==1 ){
                            //单个订单

                            let orderNo = res_items[0];
                            this.state.orderNo = orderNo;
                            if (returnBlock) returnBlock(orderNo);

                        }else{
                            //多个订单
                            let orderArray = [];
                            res_items.forEach(function (value,index,array) {
                                orderArray.push(value);
                            })
                            let orderStr = orderArray.join(',');

                            this.toPayMethod(orderStr);
                        }*/
                        let orderArray = [];
                        res_items.forEach(function (value,index,array) {
                            orderArray.push(value);
                        })
                        if (isNotEmpty(this.payMentInfo) && isNotEmpty(this.payMentInfo.payment_nameen)) {
                            //前置选择了支付方式
                            this.PaymentDialog && this.PaymentDialog.payWithType(this.payMentInfo.payment_nameen,orderArray,true,()=>{
                                let orderStr = orderArray.join(',');
                                this.toPayMethod(orderStr);
                            })
                            return
                        }
                        this.PaymentDialog && this.PaymentDialog.show(orderArray,true,()=>{
                            let orderStr = orderArray.join(',');
                            this.toPayMethod(orderStr);
                        })

                    }else {
                        this._result_process(res)
                    }
                }

            },(error)=>{
                DeviceEventEmitter.emit('LoadProgressClose');
                this.submitClickable = true;
                error&&this._result_process(error)
            });
        }catch (error) {
            DeviceEventEmitter.emit('LoadProgressClose');
            error&&this._result_process(error)
            this.submitClickable = true;
        }




    }

    _result_process(res){
        let userInfo = new YFWUserInfoManager();
        let errorMsg = isEmpty(safeObj(res).message)?safeObj(res).msg : safeObj(res).message
        res.code = safeObj(res.code);

        this.submitClickable = true;

        if(String(res.code) == '-999' || res.code == -999 ){
            userInfo.clearInfo();
            DeviceEventEmitter.emit('OpenReLoginView');
        } else if(String(res.code) == '-2'){
            if (isNotEmpty(errorMsg) && errorMsg.length > 0){
                Alert.alert('',errorMsg,[
                    {text: '确认', onPress: () => this.props.navigation.goBack()}
                ],{cancelable: false});

            }
        }else if(String(res.code) == '-1'){
            YFWToast(res.msg);
        }else {
            this.showToast(errorMsg);

        }
    }
    showToast(msg){
        let isShow = true;
        for (let i = 0; i < filterMsg.length; i++) {
            if(msg.includes(filterMsg[i])){
                isShow =false
                break
            }
        }
        if(isShow){
            YFWToast(msg)
        }
    }

    _showPaymentDialog(info){

        this.PaymentDialog && this.PaymentDialog.show(this.state.orderNo);
        this.orderRequestInfo = info;

    }


    paymentGetOrderNo(returnBlock){

        this._requestOrderSubmit(this.orderRequestInfo,returnBlock);

    }


    /**
     * 提交处方回来弹出支付窗口
     * @param orderNo
     */
    rxCallback(orderNo){
        this.PaymentDialog && this.PaymentDialog.show(orderNo)
    }


    payCancleMethod(orderNo){

        if (isNotEmpty(this.state.orderNo)){

            // this.props.navigation.navigate('YFWPaySuccess', {
            //     title: '付款成功',
            //     orderNo: this.state.orderNo,
            //     type: 'payment',
            //     from: 'shopcar',
            // });

            this.toPayMethod(orderNo);
        }

    }


    // ============= Action ===============
    _showNonAddressAlert(){

        // if (this.tipsDialog) {
        //     YFWToast('show')
        //     this.tipsDialog._show({
        //         title:'您还没有设置收货地址，请点击这里设置！',
        //         leftText:'否',
        //         rightText:'是',
        //         leftTextColor:'#333',
        //         rightTextColor:'#999',
        //         rightClick:()=>{this._toAddAddressController()},
        //         leftClick:()=>{this.props.navigation.goBack()}
        //     })
        // }

        Alert.alert('提示','您还没有设置收货地址，请点击这里设置！',[{
            text:'否',
            onPress:()=>{this.props.navigation.goBack();},
        },{
            text:'是',
            onPress:()=>this._toAddAddressController(),
        },],{
            cancelable: true
        });

    }

    _toAddAddressController(){

        this.props.navigation.navigate('ShippingAddressDetail',{type:'new',callBack:()=>{
                this.handleData();
            }});

    }

    _setDefaultValue(res){

        if (isNotEmpty(res.shop_items)){

            let selectPackage = new Map();
            let selectCoupon = new Map();
            let selectLogistic = new Map();
            let selectShopOffers = new Map();
            let selectPlatformCoupons = new Map();

            safeArray(res.shop_items).forEach(function (shop,index,shopItems) {

                if (safeArray(shop.package_items).length > 0){
                    selectPackage.set(shop.shop_id , shop.package_items[0]);
                }
                if (safeArray(shop.coupon_items).length > 0){
                    selectCoupon.set(shop.shop_id , shop.coupon_items[0]);
                }
                if (safeFloatNumber(shop.shop_offers_price) > 0){
                    selectShopOffers.set(shop.shop_id , shop.shop_offers_price);
                }
                if (safeArray(shop.logistic_items).length > 0){
                    //默认包邮 * 取配送费最少的选项

                    let logistic_select = shop.logistic_items[0];
                    safeArray(shop.logistic_items).forEach((logisticItem,index)=>{
                        if (safeFloatNumber(logistic_select.price) > safeFloatNumber(logisticItem.price)){
                            logistic_select = logisticItem;
                        }
                    });
                    selectLogistic.set(shop.shop_id , logistic_select);
                } else {
                    // 自提优先
                    if (shop.supportBuyerPickUp) {
                        selectLogistic.set(shop.shop_id , shop.buyerpickupInfo);
                    } else if (shop.supportSellerShipping) {
                        selectLogistic.set(shop.shop_id , shop.sellershippingInfo);
                    }
                }
            })

            if (safeArray(res.platform_coupons_items).length > 0){
                selectPlatformCoupons = res.platform_coupons_items[0];
                res.platform_coupons_items.push({money:'0.00',coupon_des:'不使用平台优惠券',coupon_use_desc:'不使用平台优惠券'})
            }else {

            }

            this.state.selectPackage = selectPackage;
            this.state.selectCoupon = selectCoupon;
            this.state.selectLogistic = selectLogistic;
            this.state.selectShopOffers = selectShopOffers;
            this.state.selectPlatformCoupons = selectPlatformCoupons;
            this.state.drug_items = res.drug_items
            this.state.inquiry_rx_images = res.inquiry_rx_images

        }
        if (isEmpty(this.payMentInfo)) {
            this.payMentInfo = res.lastOrder_payment
        }


    }

    //商品总金额
    _getGoodsSumPrice() {
        if (this.state.dataArray.length > 0) {
            let totalPrice = 0;
            for (let i=0 ; i < this.state.dataArray.length ; i++) {

                let shop_item = this.state.dataArray[i];
                shop_item.cart_items.forEach(function(v,i,a){
                    if (v.type === 'package'){
                        totalPrice += Number.parseFloat(v.price).toFixed(2) * Number.parseInt(v.count);
                    } else {
                        v.package_medicines.forEach(function(value){
                            totalPrice += Number.parseFloat(value.price).toFixed(2) * Number.parseInt(value.quantity);
                        })
                    }
                });

                let _shop_offers_price = '0.00';
                if (isNotEmpty(this.state.selectShopOffers.get(shop_item.shop_id))) {
                    _shop_offers_price = this.state.selectShopOffers.get(shop_item.shop_id);
                }
                totalPrice -= _shop_offers_price
            }
            return totalPrice;
        }
        return 0
    }
    /** 获取所有商家商品金额 不包含平台优惠相关*/
    _getTotalPrice(){

        if (this.state.dataArray.length > 0){

            //结算金额
            let totalPrice = 0;
            for (let i=0 ; i < this.state.dataArray.length ; i++){
                let shop_item = this.state.dataArray[i];

                let _package = {price:'0.00'};
                let _logistic = {price:'0.00'};
                let _coupon = {money:'0.00'};
                let _shop_offers_price = '0.00';

                if (isNotEmpty(this.state.selectPackage.get(shop_item.shop_id))){
                    _package = this.state.selectPackage.get(shop_item.shop_id);
                }
                if (isNotEmpty(this.state.selectLogistic.get(shop_item.shop_id))){
                    _logistic = this.state.selectLogistic.get(shop_item.shop_id);
                }
                if (isNotEmpty(this.state.selectCoupon.get(shop_item.shop_id))){
                    _coupon = this.state.selectCoupon.get(shop_item.shop_id);
                }
                if (isNotEmpty(this.state.selectShopOffers.get(shop_item.shop_id))) {
                    _shop_offers_price = this.state.selectShopOffers.get(shop_item.shop_id);
                }

                shop_item.cart_items.forEach(function(v,i,a){
                    if (v.type == 'package'){
                        totalPrice += Number.parseFloat(v.price).toFixed(2) * Number.parseInt(v.count);
                    } else {
                        v.package_medicines.forEach(function(value){
                            totalPrice += Number.parseFloat(value.price).toFixed(2) * Number.parseInt(value.quantity);
                        })
                    }
                });
                totalPrice += Number.parseFloat(_package.price) + Number.parseFloat(_logistic.price)
                    - Number.parseFloat(_coupon.money) - Number.parseFloat(_shop_offers_price) ;

            }

            return totalPrice;
        }

        return 0;

    }

    _getTotalQuantity() {
        let totalQuantity = 0;
        if (this.state.dataArray.length > 0){
            for (let i=0 ; i < this.state.dataArray.length ; i++){
                let shop_item = this.state.dataArray[i];
                shop_item.cart_items.forEach(function(v,i,a){
                    if (v.type == 'package'){
                        v.package_medicines.forEach((value)=>{
                            totalQuantity += Number.parseInt(value.quantity);
                        });
                    } else {
                        v.package_medicines.forEach((value)=>{
                            totalQuantity += Number.parseInt(value.quantity);
                        })
                    }
                });
            }
        }
        return totalQuantity;
    }
    /**获取待支付金额 包含所有 */
    _getPayMoney() {
        let _platformCoupons = {money:'0.00'};
        if (isNotEmpty(this.state.selectPlatformCoupons.money)){
            _platformCoupons = this.state.selectPlatformCoupons;
        }
        let platformYH = 0
        if (this.state.checkOutInfo && Number.parseFloat(this.state.checkOutInfo.platform_yh_price) > 0) {
            platformYH = Number.parseFloat(this.state.checkOutInfo.platform_yh_price)
        }
        let inquiry_price = this.getInquiryPrice()
        let price = this._getTotalPrice() - this.state.selectPoint/100 - this.state.selectBalance - Number.parseFloat(_platformCoupons.money) + inquiry_price - platformYH;
        return price;
    }


    _changeUsePointMethod(value,cut_point){

        mobClick('order settlement-points');
        let point = 0;
        if (value){
            point = cut_point;
        }

        this.setState({
            usePoint:value,
            selectPoint:point,
        });

    }

    _changeUseBalanceMethod(value,balance){

        let show_balance = 0;
        if (value && this.state.useBalance == 0){
            this._clickBalanceUseHelp();
        }
        if (value){
            show_balance = balance;
        }

        this.setState({
            useBalance:value,
            selectBalance:show_balance,
        });

    }

    _clickBalanceUseHelp(){

        let prompt = safe(this.state.pointInfo.prompt);

        Alert.alert('奖励使用规则', richText(prompt));

    }

    _clickGoodsItemMethod(item){

        // let {navigate} = this.props.navigation;
        // pushNavigation(navigate,{type:'get_shop_goods_detail',value:item.shop_goods_id,img_url:tcpImage(item.img_url)})

    }

    toPayMethod(orderString){

        if (this.state.dataArray.length > 0){

            this.props.navigation.replace('YFWOrderSettlementListController',{orderNo:orderString,defaultAddress:this.defaultAddress});

        }

    }

    _changeAddress(){

        mobClick('order settlement-address');
        let that = this;
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'address_manager',callBack:(item)=>{
                this.defaultAddress = item;
                that.setState({defaultAddress:item})

                that._requestCheckOutInfo(true);
        },returnBack:()=>{
                if (that.defaultAddress.is_default == '1') {
                    that.handleData();
                }
        }})

    }

    platformCouponsCell(){
        if (isNotEmpty(this.state.selectPlatformCoupons.money)){
            return this._renderClickItemCell('platformCoupons',this.state.selectPlatformCoupons,()=>{
                this.platformCouponsItemClick(this.state.checkOutInfo.platform_coupons_items,this.state.selectPlatformCoupons);
            })
        }
    }

    platformYHCell(){
        if (this.state.checkOutInfo && Number.parseFloat(this.state.checkOutInfo.platform_yh_price) > 0){

            return (
                <View style={[BaseStyles.leftCenterView,{height:45}]}>
                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:20,minWidth:60,fontSize:14,color:'#333'}]}>{'平台补贴'}</Text>
                    <Text style={{marginLeft:10,fontSize:13,color:'#999',textAlign:'left'}}>{this.state.checkOutInfo.platform_yh_desc}</Text>
                    <View style={[BaseStyles.rightCenterView,{flex:1}]}>
                        <Text style={{marginRight:31,fontSize:14,color:darkTextColor()}}>{'-¥'+toDecimal(this.state.checkOutInfo.platform_yh_price)}</Text>
                    </View>
                </View>
            );
        }

    }


    selectDefaultPointBalance(){


        /* 奖励金规则
        * 1. 如果可使用积分，大于订单总价 * 可使用比例，则优先使用积分并且隐藏余额
        * 2. 如果余额等于0，隐藏余额
        * 3. 如果可使用积分小于订单总价 * 可使用比例，则默认使用所有积分，采取优先使用积分原则
        *   a. 可用余额 = 订单总价 * 可使用比例 - 所有可使用积分
        *   b. 如果当前余额大于等于可用余额，则使用可用余额
        *   c. 如果当前余额小于可用余额，则使用当前余额
        * 4. 最终订单价格 = 订单总价 - 可使用积分 - 可用余额
        * */

        let _platformCoupons = {money:'0.00'};
        if (isNotEmpty(this.state.selectPlatformCoupons.money)){
            _platformCoupons = this.state.selectPlatformCoupons;
        }
        let platformYH = 0
        if (this.state.checkOutInfo && Number.parseFloat(this.state.checkOutInfo.platform_yh_price) > 0) {
            platformYH = Number.parseFloat(this.state.checkOutInfo.platform_yh_price)
        }
        let inquiry_price = this.getInquiryPrice()
        let total_price = this._getTotalPrice() - Number.parseFloat(_platformCoupons.money) + inquiry_price - platformYH;
        let point = 0;
        let balance = 0;
        let ratio = 1;
        let showBalance = true;
        if (isNotEmpty(this.state.pointInfo)){
            point = Number.parseInt(this.state.pointInfo.point);
            balance = Number.parseInt(this.state.pointInfo.balance);
            ratio = Number.parseFloat(this.state.pointInfo.use_ratio);
        }

        let cut_point = point;
        if (total_price*100*ratio <= cut_point){
            cut_point = Number.parseInt(total_price*100*ratio);
            showBalance = false;
        }
        if (balance == 0){
            showBalance = false;
        }
        if (showBalance){
            balance = min(balance,total_price*ratio - cut_point/100);
        }

        return {cut_point : cut_point , balance : balance , showBalance : showBalance};

    }


    changeUsePointOrBalance(){

        if (this.state.usePoint || this.state.useBalance) {

            let balanceDic = this.selectDefaultPointBalance();

            if (this.state.usePoint) {

                let cut_point = balanceDic.cut_point;
                this._changeUsePointMethod(this.state.usePoint,cut_point);
            }

            if (this.state.useBalance) {

                let balance = balanceDic.balance;
                this._changeUseBalanceMethod(this.state.useBalance,balance);
            }

        }

    }

    //优惠券凑单
    _jumpToCollectBills(couponCondition){
        this.packageAlertView && this.packageAlertView.closeView()
        const { navigate } = this.props.navigation;
        YFWUserInfoManager.ShareInstance().jumpToAddGoodsShopId.push(this.state.BuyNowShopId);
        let sum = this._getGoodsSumPrice()
        pushNavigation(
            navigate,
            {
                type:'get_shop_detail_list',
                value:this.state.BuyNowShopId,
                priceSumInShop:sum,
                couponCondition:couponCondition, //优惠券信息 {condition_price: ,money: }
                settlementCallback:(info,price)=>{this._collectBillsCallback(info,price)}
            });
    }

    //优惠券凑单回调
    _collectBillsCallback(info,price) {
        //相同商品数量加一
        let newCartid = parseInt(info.package_id?info.package_id:info.id)
        if(this.state.singleItemNumMap.has(newCartid)){
            let numPlus = this.state.singleItemNumMap.get(newCartid) + 1
            this.requestChangeItemNum(info.storeMedicineId, numPlus, false,price)
        } else {
            this.commodity.push(info)
            this.disease_items = undefined
            this.RxUploadInfo = {type:0,isSuccess:false,isDouble:0,info:null}
            DeviceEventEmitter.emit('YFWShopDetailGoodsListRefreshCollectBillsInfo', price);
            this._requestCheckOutInfo(true);
        }
    }

    // 修改商品数量
    requestChangeItemNum(goodsId, quantity,isPackageID, price){
        if(isEmpty(goodsId)){
            return
        }
        this.disease_items = undefined
        this.RxUploadInfo = {type:0,isSuccess:false,isDouble:0,info:null}
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.addCart');
        paramMap.set('quantity', 1);
        paramMap.set('type','buy')
        paramMap.set('quantity', quantity);
        if(isPackageID){
            paramMap.set('packageId', goodsId);
        } else {
            paramMap.set('storeMedicineId', goodsId);
        }
        YFWUserInfoManager.ShareInstance().addCarIds.set(goodsId+'','id')
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if(isNotEmpty(price)){
                DeviceEventEmitter.emit('YFWShopDetailGoodsListRefreshCollectBillsInfo', price);
            }
            this._requestCheckOutInfo(true);
        }, (error)=>{
            this._requestCheckOutInfo(true);
        });
    }

    // =========== View ==============

    render() {
        return (
            <View style={[BaseStyles.container,{backgroundColor:'#f1f1f1'}]}>
                    <FlatList
                        ref={(flatList)=>this._flatList = flatList}
                        extraData={this.state}
                        data={this.state.dataArray}
                        key={'settlement'}
                        renderItem = {this._renderItem.bind(this)}
                        ListHeaderComponent={this._renderHeader()}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onScroll={this.onScroll}
                        scrollEventThrottle={50}
                    />
                {this._renderBottomView()}
                <CustomAlertDialog ref={(m) => this.noProofModal = m} desc={safeObj(this.state.checkOutInfo).inquiry_desc} callBack={() => {this._noProofCallBack()}}/>
                <YFWNoLogisticAlertView ref={(m) => this.noLogisticModal = m} callBack={() => {}}/>
                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{this.handleData()}}/>
                <YFWPaymentDialogView ref={(dialog) => { this.PaymentDialog = dialog; }} navigation={this.props.navigation} from={'orderRootSettlement'} unPayCount={1}/>
                {/*<BaseTipsDialog ref = {(item) => {this.tipsDialog = item}} />*/}
                {/*<YFWRxInfoTipsAlert ref = {(item) => {this.rxInfoAlert = item}} contentInfo={'请先提交问诊信息'}/>*/}
                <YFWCustomTipAlertView ref={e=> {this.tipAlert = e}}></YFWCustomTipAlertView>
                <YFWPackageAlertView
                    ref={(ref_alertview) => { this.packageAlertView = ref_alertview}}
                    callback={(type,value)=>{
                        if (type == 'package'){
                            this.setState({
                                selectPackage : value,
                            });
                        }else if (type == 'logistic') {
                            this.setState({
                                selectLogistic : value,
                            });

                        }else if (type == 'coupon'){
                            this.setState({
                                selectCoupon : value,
                            });
                        }
                        else if (type == 'platformCoupons'){
                            this.setState({
                                selectPlatformCoupons : value,
                            });
                        }
                        else if (type == 'invoice'){
                            this.setState({
                                selectInvoice : value,
                            });
                        }
                        //重新计算抵扣积分与奖励金金额
                        this.changeUsePointOrBalance();
                    }}
                    goToOrder={isNotEmpty(this.state.BuyNowShopId)?(conditionPrice)=>{this._jumpToCollectBills(conditionPrice)}:undefined}
                />
            </View>
        );
    }

    _renderItem = (item) => {

        let cartItems = itemAddKey(item.item.cart_items,'cart_items');

        return (
            <View style={[BaseStyles.container,{backgroundColor:'white',borderRadius:13,marginVertical:10}]} key={'cart_items'+item.index}>
                <FlatList
                    data = {cartItems}
                    extraData={this.state}
                    renderItem = {this._renderRowItem.bind(this)}
                    ListHeaderComponent = {()=>this._renderSectionHeader(item.item)}
                    ListFooterComponent = {()=>this._renderSectionFooter(item.item)}
                />
            </View>
        );

    }

    _renderBottomView(){

        let price = this._getPayMoney()
        let total_quantity = this._getTotalQuantity()
        if (isNotEmpty(this.state.dataArray) && this.state.dataArray.length > 0) {
            return(
                <View style={{width:kScreenWidth,backgroundColor:'white',marginBottom:(isIphoneX())?34:0}}>
                    {this._renderBottomAddress()}
                    <View style={{height:50,width:kScreenWidth,marginBottom:0,backgroundColor:'white'}}>
                        <View style={{backgroundColor:'#f1f1f1', height:1, width: kScreenWidth,marginTop:0}}/>
                        <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                            <View style={[BaseStyles.leftCenterView,{flex:1,marginBottom:2}]}>
                                <View style={{flex:1}}></View>
                                <Text style={{fontSize:14,color:'#666',marginLeft:14,fontWeight:'500'}}>{'共'+total_quantity+'件'}</Text>
                                <View style={{flexDirection:'row', alignItems:'center',marginRight:13,marginLeft:6}}>
                                    <Text style={{fontSize:15,color:darkTextColor(),fontWeight:'500'}}>{'总计：'}</Text>
                                    <YFWDiscountText navigation={this.props.navigation}  style_view={{marginLeft:4}} style_text={{fontSize:18, fontWeight:'bold'}} value={'¥'+toDecimal(price)}/>
                                </View>
                            </View>
                            <View style={{width:113,height:50,marginRight:0,backgroundColor:yfwRedColor()}}>
                                <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this.clickSubmitMethod()}>
                                    <Text style={{fontSize:14,color:'white',fontWeight:'500'}}>去支付</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (<View/>)
        }

    }

    _renderRowItem = (item) => {
        let icon=[];
        if (item.item.type == 'package'){
            switch (item.item.package_type) {
                case 1:
                    //多件装
                    icon = (
                        <LinearGradient colors={['rgb(122,219,255)','rgb(72,139,255)']}
                                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                        locations={[0,1]}
                                        style={{width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center',marginLeft:0}}>
                            <Text style={{fontSize:10,color:'white'}}>多件装</Text>
                        </LinearGradient>
                    );
                    break;
                case 0:
                    //套餐
                    icon = (
                        <LinearGradient colors={['rgb(255,136,129)','rgb(234,80,101)']}
                                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                        locations={[0,1]}
                                        style={{width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center',marginLeft:0}}>
                            <Text style={{fontSize:10,color:'white'}}>套餐</Text>
                        </LinearGradient>
                    );
                    break;
                default:
            }
            return(
                <View style={[BaseStyles.container,{backgroundColor:'white', marginHorizontal:20}]}>
                    <View style={[BaseStyles.leftCenterView,{height:30,width:kScreenWidth-40,}]}>
                        {icon}
                        <Text numberOfLines={1} style={{width:kScreenWidth-130,marginLeft:10,color:darkNomalColor(),fontSize:14}}>{item.item.package_name}</Text>
                    </View>
                    {this._renderPackageItem(item.item)}

                    <View style={{flexDirection:'row-reverse',alignItems:'center',marginBottom:18}}>
                        <View style={{marginRight:20,}}>
                            <YFWMoneyLabel moneyTextStyle={{fontSize:15,color:'#999'}} decimalsTextStyle={{fontSize:13,color:'#999'}} money={parseFloat(item.item.originPrice)}/>
                            <View style={{position:'absolute',left:0,right:0,height:1,backgroundColor:'#999',bottom:6}}></View>
                        </View>
                        <YFWMoneyLabel moneyTextStyle={{fontSize:15}} decimalsTextStyle={{marginRight:6,fontSize:13}} money={parseFloat(item.item.medicine_total_price)}/>
                        <Text style={{color:'#333',fontSize:12}}>小计: </Text>
                        <Text style={{color:'#999',fontSize:12,marginRight:5}}>共{item.item.allCount}件</Text>
                    </View>
                </View>
            );

        } else {
            return(
                <View style={[BaseStyles.container,{backgroundColor:'white',marginHorizontal:12}]}>
                    {item.item.package_medicines.map((info,medicineIndex)=>{
                        return this.renderSingleGoodCell({item:info,index:medicineIndex})
                    })}
                    <View style={{flexDirection:'row-reverse',alignItems:'center'}}>
                        <YFWMoneyLabel moneyTextStyle={{fontSize:15}} decimalsTextStyle={{marginRight:6,fontSize:13}} money={parseFloat(item.item.originPrice)}/>
                        <Text style={{color:'#333',fontSize:12}}>小计: </Text>
                        <Text style={{color:'#999',fontSize:12,marginRight:5}}>共{item.item.allCount}件</Text>
                    </View>
                </View>
            );
        }
    }

    renderSingleGoodCell(item) {
        return(
            <View key={item.index+'single'} style={{height:90,width:kScreenWidth-20,backgroundColor:'white',marginBottom:12,marginRight:20}}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView,{flex:1}]} onPress={()=>{this._clickGoodsItemMethod(item.item)}}>
                    <Image style={{width:67,height:67,marginLeft:0}}
                           source={{uri:tcpImage(item.item.img_url)}}/>
                    <View style={{flex:1,height:90,marginLeft:20, justifyContent:'space-between'}}>
                        <View style={{marginTop:13,marginRight:17,flex:1}}>
                            <View style={{flexDirection:'row'}}>
                                <View style={{flex:1,marginRight:5}}>
                                    {this.renderTitleView(item.item)}
                                </View>
                                <View>
                                    <YFWDiscountText navigation={this.props.navigation}  style_view={{marginRight:0,justifyContent:'flex-start',marginBottom:3}} style_text={{fontSize:14,fontWeight:'500',color:'#333'}} value={'¥'+toDecimal(item.item.price_old)}/>
                                    <Text style={[BaseStyles.contentWordStyle,{textAlign:'right'}]}>X{item.item.quantity}</Text>
                                </View>
                            </View>
                            <View style={[BaseStyles.leftCenterView,{justifyContent:'space-between',marginTop:5}]}>
                                <Text style={[BaseStyles.contentWordStyle]}>{item.item.standard}</Text>
                                <YFWDiscountText navigation={this.props.navigation}  style_view={{marginRight:0,justifyContent:'flex-start',marginBottom:0}} style_discount={{marginRight:0}} discount={item.item.discount}/>
                            </View>
                            <View style={{flex:1}}/>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    renderTitleView(item) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(item).PrescriptionType+"" === "1"){
            return this.rednerPrescriptionLabel(TYPE_SINGLE,item.title)
        }
        //双轨药
        else if(safeObj(item).PrescriptionType+"" === "2"){
            return this.rednerPrescriptionLabel(TYPE_DOUBLE,item.title)
        }
        //OTC
        else if(safeObj(item).PrescriptionType+"" === "0"){
            return this.rednerPrescriptionLabel(TYPE_OTC,item.title)
        }
        //这里没有处方药的判断
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL,item.title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type,title){
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={[BaseStyles.titleWordStyle,{fontWeight:'bold',lineHeight:17}]}
            numberOfLines={2}
        />
    }


    _renderPackageItem(item){

        var allBadge = [];
        // 遍历json数据
        let menuaArray = item.package_medicines;
        for (var i=0;i<menuaArray.length;i++){
            // 取出每一个数据对象
            let badge = menuaArray[i];
            // 装入数据
            allBadge.push(
                <View style={{height:90}} key={'packageCell'+i}>
                    <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView,{flex:1}]} onPress={()=>{this._clickGoodsItemMethod(badge)}}>
                        <Image style={{width:67,height:67,marginLeft:0}}
                               source={{uri:tcpImage(badge.img_url)}}/>
                        <View style={{flex:1,height:90,marginLeft:20, justifyContent:'space-between'}}>
                            <View style={{marginTop:13,marginRight:17,flex:1}}>
                                <View style={{flexDirection:'row'}}>
                                    <View style={{flex:1,marginRight:5}}>
                                        {this.renderTitleView(badge)}
                                    </View>
                                    <View>
                                        <YFWDiscountText navigation={this.props.navigation}  style_view={{marginRight:0,justifyContent:'flex-start',marginBottom:3}} style_text={{fontSize:14,fontWeight:'500',color:'#333'}} value={'¥'+toDecimal(badge.price)}/>
                                        <Text style={[BaseStyles.contentWordStyle,{textAlign:'right'}]}>X{badge.quantity}</Text>
                                    </View>
                                </View>
                                <View style={[BaseStyles.leftCenterView,{justifyContent:'space-between',marginTop:5}]}>
                                    <Text style={[BaseStyles.contentWordStyle]}>{badge.standard}</Text>
                                </View>
                                <View style={{flex:1}}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

            );
        }

        // 返回数组
        return allBadge;

    }

    _renderSectionHeader(item){

        return(
            <View style={{height:40,width:kScreenWidth,backgroundColor:'white',marginTop:10}}>
                <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                    <Image style={{width: 13, height:13, marginLeft:20, resizeMode:'stretch'}}
                            defaultSource={require('../../img/shops.png')}
                           source={require('../../img/shops.png')}/>
                    <Text style={[BaseStyles.titleWordStyle,{marginLeft:5,fontWeight:'bold',width:kScreenWidth-50}]} numberOfLines={1}>{item.shop_title}</Text>
                </View>
            </View>
        );

    }

    _renderSectionFooter(item){

        //优惠券、包装、配送、满减
        let _package = {price:'0.00'};
        let _logistic = {price:'0.00'};
        let _coupon = {money:'0.00'};
        let _shop_offers_price = '0.00';

        if (isNotEmpty(this.state.selectPackage.get(item.shop_id))){
            _package = this.state.selectPackage.get(item.shop_id);
        }
        if (isNotEmpty(this.state.selectLogistic.get(item.shop_id))){
            _logistic = this.state.selectLogistic.get(item.shop_id);
            _logistic.supportSellerShipping = item.supportSellerShipping
            _logistic.supportBuyerPickUp = item.supportBuyerPickUp
            _logistic.buyerpickupInfo = item.buyerpickupInfo
            _logistic.sellershippingInfo = item.sellershippingInfo
            item.logistic = _logistic
        }
        _logistic.nologistcs_type = item.nologistcs_type
        if (isNotEmpty(this.state.selectCoupon.get(item.shop_id))){
            _coupon = this.state.selectCoupon.get(item.shop_id);
        }
        if (isNotEmpty(this.state.selectShopOffers.get(item.shop_id))){
            _shop_offers_price = this.state.selectShopOffers.get(item.shop_id);
        }

        let _selectInvoice = {code:'', title:'请选择',type:'0'};
        let shop_selectInvoice = this.state.selectInvoice.get(item.shop_id);

        let default_invoice = {
            invoice_applicant : item.invoice_info.invoice_applicant,
            invoice_code : item.invoice_info.invoice_code,
            invoice_type:0,
            ...item
        }

        if (isNotEmpty(shop_selectInvoice)){
            let title = shop_selectInvoice.title;
            let code = shop_selectInvoice.code;
            let type = shop_selectInvoice.type;
            default_invoice.invoice_type = shop_selectInvoice.invoice_type
            default_invoice.dict_bool_etax = shop_selectInvoice.dict_bool_etax
            _selectInvoice = {code:code, title:title, type:1};
            if (Number.parseInt(code)>0) {
                _selectInvoice = {code:code, title:(shop_selectInvoice.dict_bool_etax? '增值税电子普通发票':'增值税纸质普通发票'),type:1};
            } else if(type == 0){
                _selectInvoice = {code:'', title:'无需发票',type:0};
            }
            if(isNotEmpty(title) && title.length>0) {
                // 如果本地有修改，就用本地，没有就用接口返回数据
                default_invoice.invoice_applicant = title
                default_invoice.invoice_code = code
            }
        }

        //结算金额
        let totalPrice = 0;
        let totalQuantity = 0;
        item.cart_items.forEach(function(v,i,a){
            if (v.type == 'package'){
                totalPrice += Number.parseFloat(v.price)*Number.parseInt(v.count);
                v.package_medicines.forEach((value)=>{
                    totalQuantity += Number.parseInt(value.quantity);
                });
            } else {
                v.package_medicines.forEach((value)=>{
                    totalPrice += Number.parseFloat(value.price)*Number.parseInt(value.quantity);
                    totalQuantity += Number.parseInt(value.quantity);
                })
            }
        });
        totalPrice += Number.parseFloat(_package.price) + Number.parseFloat(_logistic.price) - Number.parseFloat(_coupon.money) - Number.parseFloat(_shop_offers_price) ;

        return(
            <View style={{backgroundColor:'white',marginBottom:10}}>
                {item.isColdPackage && <View style={{paddingTop: 13, paddingHorizontal: 20}}>
                    <Text style={{fontSize: 13, color: '#feac4c'}}>订单含冷藏商品，仅支持同城配送，发货后不支持退换货</Text>
                </View>}
                {this._renderClickItemCell('package',_package,()=>{
                    this.packageItemClick(item,this.state.selectPackage);
                })}
                {this._renderClickItemCell('logistic',_logistic,()=>{
                    this.logisticItemClick(item,this.state.selectLogistic);
                })}
                {this._renderClickItemCell('coupon',_coupon,()=>{
                    this.couponItemClick(item,this.state.selectCoupon);
                })}
                {this._renderShopOffersPrice(item)}
                {this._renderDiscountPrice(item.discount)}
                {this._renderClickItemCell('invoice',_selectInvoice,()=>{
                    this.invoiceItemClick(default_invoice,this.state.selectInvoice);
                })}
                <View style={[BaseStyles.leftCenterView,{height:50}]}>
                    <View style={{flex:1}}/>
                    <Text style={[BaseStyles.contentWordStyle,{marginRight:6,fontSize:13}]}>共{totalQuantity}件</Text>
                    <View style={{marginRight:17,flexDirection:'row'}}>
                        <Text style={{color:'#333',fontSize:13,marginRight:3}}>{'合计：'}</Text>
                        <YFWMoneyLabel moneyTextStyle={{marginRight:20,fontSize:13}} decimalsTextStyle={{fontSize:11}} money={toDecimal(totalPrice)}/>
                    </View>
                </View>
            </View>
        )

    }

    packageItemClick(value,selectvalue){
        mobClick('order settlement-packing');
        this.packageAlertView && this.packageAlertView.showView('package',value,selectvalue);
    }
    logisticItemClick(value,selectvalue){
        mobClick('order settlement-dispatching');
        if (value.logistic_items.length>0 || value.supportBuyerPickUp || value.supportSellerShipping){
            this.packageAlertView && this.packageAlertView.showView('logistic',value,selectvalue);
        } else if (value.nologistcs_type == '2') {
            this.noLogisticModal && this.noLogisticModal.show(value.noLogistcsInfos,value.noLogistcsTip);
            return;
        } else{
            Alert.alert('提示',this.noLogisticDes,[{
                text:'是',
            }],{
                cancelable: true
            });
        }
    }
    invoiceItemClick(value,selectvalue) {
        mobClick('order settlement-invoice');
        this.packageAlertView && this.packageAlertView.showView('invoice',value,selectvalue)
    }
    couponItemClick(value,selectvalue){
        this.packageAlertView && this.packageAlertView.showView('coupon',value,selectvalue);
    }

    platformCouponsItemClick(value,selectvalue){
        this.packageAlertView && this.packageAlertView.showView('platformCoupons',value,selectvalue);
    }

    _renderClickItemCell(type,item,func){
        let title = '';
        let content = '';
        let desc = ''
        let titleColor = '#999';

        if (type == 'package'){

            title = '包装方式';
            desc = item.name
            content = '¥' + toDecimal(item.price);

        } else if(type == 'logistic'){

            if (item.id == -2) {
                title = '配送方式';
                desc = item.name
                content = '¥' + toDecimal(item.price);
                if (item.supportBuyerPickUp && !item.selectByUser) {
                    content += '\r\n'
                    if (item.supportBuyerPickUp){content+='支持'+item.buyerpickupInfo.name}
                }
            }else if(item.id == -3) {
                title = '配送方式';
                desc = item.name
                content = '¥' + toDecimal(item.price);
                if (item.supportSellerShipping && !item.selectByUser) {
                    content += '\r\n'
                    if (item.supportSellerShipping) {content+='支持'+item.sellershippingInfo.name}
                }
            }else{
                title = '配送方式';
                desc = item.name ? item.name:(item.nologistcs_type == '2'?this.notSendLogisticDes:this.noLogisticDes);
                content = item.name ? '¥' + toDecimal(item.price):(item.nologistcs_type == '2'?'查看':'');
                if (!item.selectByUser && (item.supportBuyerPickUp || item.supportSellerShipping)) {
                    content += '\r\n'
                    if (item.supportBuyerPickUp){content+='支持'+item.buyerpickupInfo.name}
                    if (item.supportBuyerPickUp && item.supportSellerShipping) {
                        content +='、'
                    } else {
                        content += '支持'
                    }
                    if (item.supportSellerShipping) {content += item.sellershippingInfo.name}
                }
                titleColor = item.name?'#999':yfwOrangeColor();
            }

        } else if(type == 'coupon'){

            title = '优惠券';
            desc = safe(item.coupon_use_desc) || (parseFloat(toDecimal(item.money)) > 0 ?'':'暂无可用优惠券')
            content += (parseFloat(toDecimal(item.money)) > 0 ? '-' :'')
            content += '¥'+ toDecimal(item.money);

        } else if(type == 'invoice'){

            title = '发票信息';
            content = item.title;

        }else if(type == 'platformCoupons'){

            title = '平台优惠';
            desc = safe(item.coupon_use_desc)
            content += (parseFloat(toDecimal(item.money)) > 0 ? '-' :'')
            content += '¥' + toDecimal(item.money);

        }

        return(
            <TouchableOpacity activeOpacity={1}  onPress={func}>
                <View style={[BaseStyles.leftCenterView,{height:45}]}>
                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:20,minWidth:60,fontSize:13,color:'#333',textAlign:'left'}]}>{title}</Text>
                    <Text style={{marginLeft:10,fontSize:13,color:titleColor,textAlign:'left'}}>{desc}</Text>
                    <View style={[BaseStyles.rightCenterView,{flex:1}]}>
                        <Text style={{marginRight:4,fontSize:13,color:'#333',textAlign:'right'}}>{content}</Text>
                    </View>
                    {isNotEmpty(content)&&<Image style={{width: 13, height: 13, marginRight: 15}}
                            source={require('../../img/around_detail_icon.png')}/>}
                </View>
            </TouchableOpacity>
        );

    }

    _renderDiscountPrice(price){

        if (Number.parseFloat(price) > 0){

            return (
                <View style={[BaseStyles.leftCenterView,{height:45}]}>
                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:20,width:80,fontSize:14,color:'#333'}]}>{'返现'}</Text>
                    <View style={[BaseStyles.rightCenterView,{flex:1}]}>
                        <Text style={{marginRight:31,fontSize:14,color:darkTextColor()}}>{'-¥'+toDecimal(price)}</Text>
                    </View>
                </View>
            );

        } else {
            return (<View />);
        }

    }

    _renderShopOffersPrice(item){
        let condition = item.shop_offers_price_condition
        let price = item.shop_offers_price
        if (Number.parseFloat(price) > 0){

            return (
                <View style={[BaseStyles.leftCenterView,{height:45}]}>
                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:20,width:60,fontSize:14,color:'#333'}]}>{'商家优惠'}</Text>
                    <Text style={{marginLeft:10,fontSize:13,color:'#999',textAlign:'left'}}>{'消费满'+toDecimal(condition)+'元，立减'+toDecimal(price)+'元'}</Text>
                    <View style={[BaseStyles.rightCenterView,{flex:1}]}>
                        <Text style={{marginRight:31,fontSize:14,color:darkTextColor()}}>{'-¥'+toDecimal(price)}</Text>
                    </View>
                </View>
            );

        } else {
            return (<View />);
        }

    }

    /**
     * 返回整个页面的头部
     * @returns {*}
     * @private
     */
    _renderHeader(){
        return (
            <View>
                {this._renderAddressView()}
                {/*3.1.00版本才有，并且现阶段只有HTTP才有*/}
                {this._renderRxInfo()}
                {this._renderDrugRegistrationView()}
                {this._renderPayTips()}
            </View>
        )
    }

    /**
     * 电子处方相关信息
     */
    _renderRxInfo(){
        //to-do
        if(safeObj(this.state.checkOutInfo).medicate_info_type ==='2'){
            this.RxUploadInfo.isDouble = 0
            if(this.RxUploadInfo.isSuccess){
                return (
                <View style={[BaseStyles.radiusShadow,{backgroundColor:'white',marginBottom:10,width:kScreenWidth-26, marginHorizontal:13}]}>
                    <TouchableOpacity activeOpacity={1} style={{paddingLeft:9,paddingTop: 15,paddingBottom:12, flexDirection:'row', alignItems:'center'}} onPress={()=>{
                        this.gotoInquiry()
                    }}>
                        <View >
                            {this.RxUploadInfo.type == 0?<Image style={{width:16, height:16, resizeMode:'stretch'}} source={require('../../img/icon_warning.png')}/>:
                            <Image style={{width:16, height:16, resizeMode:'stretch'}} source={require('../../img/rx_info_icon.png')}/>}
                        </View>
                        {this.RxUploadInfo.type == 0?
                        <View style={{marginLeft:5}}>
                            <Text style={{color:darkLightColor(),fontSize:13}}>处方单</Text>
                        </View>:
                        <View style={{marginLeft:5}}>
                            <Text style={{color:yfwGreenColor(),fontSize:13}}>已添加就诊信息</Text>
                            <Text style={{color:darkLightColor(),fontSize:10,marginTop:5}}>医生将根据您的就诊信息提供问诊服务。</Text>
                        </View>
                        }
                        <View style={{flexDirection:'row',alignItems:'center',flex:1,justifyContent:'flex-end',marginRight:15}}>
                            <Text style={{color:darkLightColor(),fontSize:13,marginRight:3}}>{this.RxUploadInfo.type == 0?'已上传':'查看'}</Text>
                            <Image style={{height:18,width:10}}
                                source={require('../../img/around_detail_icon.png')}/>
                        </View>
                    </TouchableOpacity>
                </View>
                )
            }else{
                let viewHeight = 54*kScreenWidth/375
                let imageSource = this.state.showAddTip?require('../../img/add_drug_gif.gif'):require('../../img/add_drug_gif_end.png')
                return(
                    <View style={[BaseStyles.radiusShadow,{backgroundColor:'#f1f1f1',marginBottom:10,width:kScreenWidth-26, marginHorizontal:13}]}>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{
                                this.gotoInquiry()
                            }}>
                            <Image source={imageSource} style={{width:kScreenWidth-26,height:viewHeight}} resizeMode={'contain'}></Image>
                        </TouchableOpacity>
                    </View>
                )
            }
        }else{
            if(safeObj(safeObj(this.state.checkOutInfo).medicate_info_show) ==='true'){
                this.RxUploadInfo.isDouble = 1
                if(!this.verifyMedicateInfo()){
                    let hasRxImages = isArray(this.RxUploadInfo.info.rx_images)&&this.RxUploadInfo.info.rx_images>0?true:false
                    return (
                        <View style={[BaseStyles.radiusShadow,{backgroundColor:'white',marginBottom:10,width:kScreenWidth-26, marginHorizontal:13}]}>
                            <TouchableOpacity activeOpacity={1} style={{paddingLeft:9,paddingTop: 15,paddingBottom:12, flexDirection:'row', alignItems:'center'}} onPress={()=>{
                                this.gotoInquiry()
                            }}>
                                <View >
                                    <Image style={{width:16, height:16, resizeMode:'stretch'}} source={require('../../img/icon_warning.png')}/>
                                </View>
                                <View style={{marginLeft:5}}>
                                    <Text style={{color:darkLightColor(),fontSize:13}}>处方信息</Text>
                                </View>
                                <View style={{flexDirection:'row',alignItems:'center',flex:1,justifyContent:'flex-end',marginRight:15}}>
                                    <Text style={{color:darkLightColor(),fontSize:13,marginRight:3}}>{hasRxImages?'已上传':'查看'}</Text>
                                    <Image style={{height:18,width:10}}
                                        source={require('../../img/around_detail_icon.png')}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                }else{
                    let viewHeight = 54*kScreenWidth/375
                    let imageSource = this.state.showAddTip?require('../../img/add_drug_gif.gif'):require('../../img/add_drug_gif_end.png')
                    return(
                        <View style={[BaseStyles.radiusShadow,{backgroundColor:'#f1f1f1',marginBottom:10,width:kScreenWidth-26, marginHorizontal:13}]}>
                            <TouchableOpacity activeOpacity={1} onPress={()=>{
                                    this.gotoInquiry()
                                }}>
                                <Image source={imageSource} style={{width:kScreenWidth-26,height:viewHeight}} resizeMode={'contain'}></Image>
                            </TouchableOpacity>
                        </View>
                    )
                }
            }else{
                this.RxUploadInfo.isDouble = 0
                return null
            }
        }

    }

    _renderDrugRegistrationView() {
        if (safeObj(this.state.checkOutInfo).is_needenrollment) {
            return (
                <View style={[BaseStyles.radiusShadow,{backgroundColor:'white',marginBottom:10,width:kScreenWidth-26, marginHorizontal:13,borderWidth: 1,borderColor: this.DrugRegistrationInfo.isSuccess?'white':'#f88163'}]}>
                    <TouchableOpacity activeOpacity={1} style={{paddingLeft:9,paddingTop: 15,paddingBottom:12, flexDirection:'row', alignItems:'center'}} onPress={()=>{
                        this.gotoDrugRegistration()
                    }}>
                        <View >
                            {this.DrugRegistrationInfo.isSuccess?<Image style={{width:16, height:16, resizeMode:'stretch'}} source={require('../../img/icon_warning_success.png')}/>:
                            <Image style={{width:16, height:16, resizeMode:'stretch'}} source={require('../../img/icon_warning.png')}/>}
                        </View>
                        <View style={{marginLeft:5}}>
                            <Text style={{color:darkTextColor(),fontSize:13,fontWeight:'500'}}>疫情防控药品登记</Text>
                            <Text style={{color:darkLightColor(),fontSize:10,fontWeight:'500',marginTop:5,maxWidth:220*kScreenScaling}}>您购买的药品含疫情防控药品，根据监管部门要求需登记用药人信息后下单</Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',flex:1,justifyContent:'flex-end',marginRight:15}}>
                            <Text style={{color:darkLightColor(),fontSize:13,marginRight:3}}>{this.DrugRegistrationInfo.isSuccess?'已登记':'去登记'}</Text>
                            <Image style={{height:18,width:10}}
                                source={require('../../img/around_detail_icon.png')}/>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
        return null
    }

    /**
     * 尽快付款提示
     */
    _renderPayTips() {

        return (
            <View style={[BaseStyles.leftCenterView,{backgroundColor: "#faf8dc",width: kScreenWidth,paddingVertical:adaptSize(8),paddingHorizontal:adaptSize(22),marginBottom:adaptSize(8)}]}>
                <Text style = {{lineHeight:adaptSize(15),fontSize: 13, color:'rgb(254,172,76)'}} >{isNotEmpty(this.state.checkOutInfo.need_show_text)?this.state.checkOutInfo.need_show_text:'依据GSP相关规定，药品一经售出，无质量问题不退不换'}</Text>
            </View>
        )
    }

    _renderAddressView(){

        if (isNotEmpty(this.state.defaultAddress) && isNotEmpty(this.state.dataArray) && this.state.dataArray.length > 0){
            return(
                <View style={[BaseStyles.leftCenterView,{height: 166, width: kScreenWidth}]}>
                    <YFWSettlementHeader context={{
                        name:this.state.defaultAddress.name,
                        mobile:this.state.defaultAddress.mobile,
                        address:this.state.defaultAddress.address,
                        isDefault:this.state.defaultAddress.is_default
                    }} isTouch={true} changeAddress={()=>{this._changeAddress()}}/>
                </View>
            );
        }else {
            return(
                <View/>
            );
        }

    }


    _renderFooter(){
        let balanceDic = this.selectDefaultPointBalance();
        let cut_point = balanceDic.cut_point;
        let balance = balanceDic.balance;
        let showBalance = balanceDic.showBalance;

        if (isNotEmpty(this.state.dataArray) && this.state.dataArray.length > 0) {
            //to-do
            let showYHPrice = parseFloat(this.state.checkOutInfo.inquiry_real_price)<parseFloat(this.state.checkOutInfo.inquiry_original_price)
            let lastOrderPaymentName = this.state.checkOutInfo?.lastOrder_payment?.payment_name || '在线支付'
            return(
                <View style={{backgroundColor:'white',borderRadius:13,paddingVertical:10,marginBottom:60}}>
                    <View style={[BaseStyles.leftCenterView,{height:45}]}>
                        <Text style={[BaseStyles.contentWordStyle,{marginLeft:20,fontSize:14,color:'#333'}]}>{'付款方式'}</Text>
                        <TouchableOpacity hitSlop={{left:0,top:10,bottom:10,right:0}} activeOpacity={1} onPress={()=>{this.changePayMentType()}} style={[BaseStyles.rightCenterView,{flex:1}]}>
                            <Image style={{width: 13, height: 13, marginRight: 15}}
                                    source={require('../../img/around_detail_icon.png')}/>
                            <Text style={{marginRight:4,fontSize:13,color:darkTextColor()}}>{lastOrderPaymentName}</Text>
                        </TouchableOpacity>
                    </View>
                    {this.RxUploadInfo.type == 1 && this.RxUploadInfo.isSuccess ?<View style={[BaseStyles.leftCenterView,{height:45}]}>
                        <Text style={[BaseStyles.contentWordStyle,{marginLeft:20,fontSize:13}]}>{'问诊费'}
                            {showYHPrice?<Text style={{color:'rgb(254,172,76)'}}>{'（'+this.state.checkOutInfo.inquiry_price_explain+'）'}</Text>:null}
                        </Text>
                        {
                            parseFloat(this.state.checkOutInfo.inquiry_real_price) > 0?
                            <TouchableOpacity hitSlop={{left:10,top:10,right:10,bottom:10}} onPress={()=>{this.noProofModal && this.noProofModal.show()}}>
                                <Image style={{width:16, height:16, resizeMode:'stretch'}}
                                    source={require('../../img/interrogation_cost.png')}/>
                            </TouchableOpacity>:
                            <View/>
                        }
                        <View style={[BaseStyles.rightCenterView,{flex:1}]}>
                            <Text style={{marginRight:35,fontSize:13,color:darkTextColor()}}>{'￥'+toDecimal(this.state.checkOutInfo.inquiry_real_price)}</Text>
                            {showYHPrice?<Text style={{marginRight:5,fontSize:13,color:darkLightColor(),textDecorationLine:'line-through'}}>{'￥'+toDecimal(this.state.checkOutInfo.inquiry_original_price)}</Text>:null}
                        </View>
                    </View>:null}
                    {this.platformCouponsCell()}
                    {this.platformYHCell()}
                    {this._renderPointView(cut_point)}
                    {this._renderBalanceView(balance,showBalance)}
                    {/*{this._renderCompliancePromptView()}*/}
                </View>
            );

        } else {
            return (<View style={{ height: 50 }}/>)
        }


    }

    _renderPointView(cut_point){

        if (cut_point > 0){
            return(
                <View style={[BaseStyles.leftCenterView,{height:45}]}>
                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:20,fontSize:14,color:'#333'}]}>{'积分抵扣'}</Text>
                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:14,fontSize:14,color:'#999'}]}>{'使用'+cut_point+'积分抵用'+toDecimal(cut_point/100)+'元'}</Text>
                    <View style={{flex:1}}></View>
                    <View style={[BaseStyles.rightCenterView,{width:70,height:40}]}>
                        <Switch style={{width:70,height:25,marginBottom:10}} value={this.state.usePoint} onValueChange={(value)=>{this._changeUsePointMethod(value,cut_point)}}/>
                    </View>
                </View>
            );
        } else {
            return (<View/>);
        }

    }


    _renderBalanceView(balance, show){

        if (show){
            return(
                <View style={[BaseStyles.leftCenterView,{height:50}]}>
                    <View style={[BaseStyles.leftCenterView,{width:kScreenWidth-75,height:40}]}>
                        <Text style={[BaseStyles.contentWordStyle,{marginLeft:20,fontSize:14,color:'#333'}]}>{'平台奖金'}</Text>
                        <Text style={[BaseStyles.contentWordStyle,{marginLeft:14,fontSize:14}]}>{'可使用奖励金额'+ toDecimal(balance)+'元'}</Text>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this._clickBalanceUseHelp()}}>
                            <Image style={{width: 18, height: 18,marginLeft: 10}}
                                   source={require('../../img/tips_help.png')}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:1}}></View>
                    <View style={[BaseStyles.rightCenterView,{width:70,height:40}]}>
                        <Switch style={{width:70,height:25,marginBottom:10}} value={this.state.useBalance} onValueChange={(value)=>{this._changeUseBalanceMethod(value,balance)}}/>
                    </View>
                </View>
            );
        } else {
            return (<View/>);
        }

    }

    _renderCompliancePromptView(){

        if (isNotEmpty(this.state.checkOutInfo) &&
            isNotEmpty(this.state.checkOutInfo.compliance_prompt) &&
            this.state.checkOutInfo.compliance_prompt.length > 0){

            return(
                <View style={{backgroundColor:'white'}}>
                    <View style={{backgroundColor:backGroundColor(),height:10}}/>
                    <View style={[BaseStyles.leftCenterView,{height:50}]}>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:15,marginTop:10,fontSize:15}]}>郑重承诺：</Text>
                    </View>
                    <Text style={[BaseStyles.contentWordStyle,{marginBottom:15,marginLeft:15,width:kScreenWidth-30,fontSize:14,lineHeight:22}]}>
                        {richText(this.state.checkOutInfo.compliance_prompt)}
                    </Text>
                </View>
            );

        }
    }

    /*生成底部的地址显示*/
    _renderBottomAddress(){
      if (isNotEmpty(this.state.defaultAddress) && this.state.isShow) {
        return (
            <View style={[BaseStyles.leftCenterView,{backgroundColor: "#FFF3CA",width: kScreenWidth,height:50}]}>
                <Text style = {{paddingLeft: 10, fontSize: 14, color: yfwOrangeColor()}} numberOfLines={2}>
                    {this.state.defaultAddress.address}
                </Text>
            </View>
        )
      } else {
        return (<View />)
      }
    }

    gotoInquiry(){
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'prescription_info',value:{
                drug_items:this.state.drug_items,
                rx_images:this.state.inquiry_rx_images,
                cachedInfo:this.RxUploadInfo.info,
                isDouble:this.RxUploadInfo.isDouble,
                disease_items:this.disease_items,
                medicine_disease_items:this.state.checkOutInfo.medicine_disease_items,
                medicine_disease_xz_count:this.state.checkOutInfo.medicine_disease_xz_count,
                disease_xz_add:this.state.checkOutInfo.disease_xz_add,
                pageType:2,
                cartIDStr:this.cartIDStr,
                packageIDStr:this.packageIDStr,
                disease_xz_count:this.state.checkOutInfo.disease_xz_count,
                is_certificate_upload:this.state.checkOutInfo.is_certificate_upload,
                rx_mode:this.state.checkOutInfo.rx_mode,
                // is_certificate_upload:false,
                rx_cid_items:this.state.checkOutInfo.rx_cid_items,
                callBack:(item)=>{
                    this.RxUploadInfo.info = item
                    this.RxUploadInfo.type = item.rx_upload_type
                    this.RxUploadInfo.isSuccess = true
                    if (safeObj(this.state.checkOutInfo).is_needenrollment) {
                        let paramsMap = this.DrugRegistrationInfo.info || new Map()
                        safeArray(this.state.drug_items).some((user)=>{
                            let has = user.id == item.drugid
                            if (has) {
                                paramsMap.set('drugname',user.real_name)
                                paramsMap.set('drugmobile',user.mobile)
                                paramsMap.set('drugidcardno',user.idcard_no)
                            }
                            return has
                        })
                        this.DrugRegistrationInfo.info = paramsMap
                    }
                    this.setState({})
            }}})
    }

    gotoDrugRegistration() {
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_drugRegistration',value:{
            data: this.DrugRegistrationInfo.info,
            workData:this.workData,
            notCheckUser:safeObj(this.state.checkOutInfo).medicate_info_type === '2',
            callBack:(info)=>{
                this.DrugRegistrationInfo.info = info
                this.DrugRegistrationInfo.isSuccess = true
                this.setState({})
            }
        }})
    }

    onScroll = (event)=>{
        let y = event.nativeEvent.contentOffset.y;
        this.isShowBottomAddress(y)
    }


    isShowBottomAddress(y){
        if(y > 111 && this.state.isShow === false){
            this.setState({isShow : true})
        }else if(y< 111 && this.state.isShow){
            this.setState({isShow : false})
        }
    }

    /**
     * 校验身份证
     */
    verifyCardNum(txt){
        if(isEmpty(txt)){
            return txt
        }
        txt = txt.replace(IDENTITY_CODE, '')
        return txt
    }

}

const styles = StyleSheet.create({
    reduce: {
        flex:1,
        width:30,
        height:30,
        alignItems:'center',
        justifyContent:'center',
    },
    operatingBox: {

        width:90,
        height:30,
        borderColor:separatorColor(),
        borderWidth:1,
        marginLeft:25,
        marginRight:15,
        marginTop:5,
        borderRadius:3,
        flexDirection: 'row',

    },
})
const filterMsg = ["error","request","__cmd","undefined","service"]
