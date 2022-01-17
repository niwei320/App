import React, { Component } from 'react';
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
    View, ImageBackground
} from 'react-native';

import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor, yfwRedColor, yfwGreenColor
} from '../../Utils/YFWColor'
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
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
    isArray, safeArray
} from "../../PublicModule/Util/YFWPublicFunction";
import { BaseStyles } from "../../Utils/YFWBaseCssStyle";
import YFWToast from "../../Utils/YFWToast";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import StatusView from '../../widget/StatusView'
import { toDecimal } from "../../Utils/ConvertUtils";
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText'
import { IDENTITY_CODE, IDENTITY_VERIFY, NAME } from "../../PublicModule/Util/RuleString";
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_SINGLE,
    TYPE_OTC
} from "../../widget/YFWPrescribedGoodsTitle";
import YFWRequestParam from "../../Utils/YFWRequestParam";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import LinearGradient from "react-native-linear-gradient";
import YFWMoneyLabel from "../../widget/YFWMoneyLabel";
import YFWWDOrderSettlementModel from './Model/YFWWDOrderSettlementModel';
import YFWWDSettlementHeader from './View/YFWWDSettlementHeader';
import { pushWDNavigation, kRoute_address_manager, kRoute_address_detail } from '../YFWWDJumpRouting';
import YFWWDPackageAlertView from './View/YFWWDPackageAlertView';
import YFWWDPaymentDialogView from './View/YFWWDPaymentDialogView';
import YFWWDAddressModel from './Model/YFWWDAddressModel';
import YFWWDSettlementPointModel from './Model/YFWWDSettlementPointModel';
import {getRegistStatus} from "../../Utils/YFWInitializeRequestFunction";
import YFWWDTipsAlert from "../Widget/YFWWDTipsAlert";

export default class YFWWDOrderSettlementRootVC extends Component {


    static navigationOptions = ({ navigation }) => ({

        tabBarVisible: false,
        title: '订单结算',
        headerRight: <View width={50} />,
    });

    constructor(...args) {
        super(...args);
        this.submitClickable = true // 是否可以点击提交
        this.state = {
            pointInfo: {},
            checkOutInfo: {},
            dataArray: [],
            defaultAddress: undefined,

            selectPackage: new Map(),
            selectCoupon: new Map(),
            selectLogistic: new Map(),
            selectShopOffers: new Map(),
            selectPlatformCoupons: new Map(),
            selectInvoiceType: new Map(),
            selectInvoice: new Map(),
            usePoint: false,
            useBalance: false,
            selectBalance: 0,
            selectPoint: 0,
            isShow: false,
        };
        this.request_again_getBuy = 0;
        this.request_again_getAddress = 0;
        this.donotHaveAddress = false;
        this.cartIDStr = ''
        this.packageIDStr = ''

    }

    componentDidMount() {
        darkStatusBar();
        this.commodity = this.props.navigation.state.params.Data;

        this.didFocus = this.props.navigation.addListener('didFocus', () => {
            if (isEmpty(this.defaultAddress)) {
                this.handleData()
            }
        })

        YFWNativeManager.mobClick('b2b-ordersure-1')
    }


    handleData() {

        this.request_again_getBuy = 0;
        this.request_again_getAddress = 0;
        this._requestAddressList();

    }


    componentWillUnmount() {
        this.changeUserDrugListener && this.changeUserDrugListener.remove()
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
        this.didFocus.remove();
    }


    // =========== Request =============

    _requestAddressList() {

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.whole.address.getStoreAddress');
        paramMap.set('pageSize', 20);
        paramMap.set('pageIndex', 1);
        viewModel.TCPRequest(paramMap, (res) => {
            let addressArray = YFWWDAddressModel.getModelArray(res.result);
            if (isNotEmpty(addressArray)) {

                if (addressArray.length == 0) {
                    this._showNonAddressAlert();
                    if (this.statusView) this.statusView.dismiss();
                    this.donotHaveAddress = true
                    return;

                } else {
                    this.donotHaveAddress = false
                    addressArray.forEach((item, index, array) => {
                        if (item.is_default == '1') {
                            this.defaultAddress = item;
                        }
                    });
                    if (isEmpty(this.defaultAddress)) {
                        this.defaultAddress = addressArray[0];
                    }
                    this.setState({
                        defaultAddress: this.defaultAddress,
                    });

                    this._requestCheckOutInfo(false);

                }
            }


        }, () => {
            if (this.request_again_getAddress == 3) {
                if (this.statusView) this.statusView.showNetError();
            } else {
                this.request_again_getAddress++;
                this._requestAddressList();
            }
        }, false);

    }



    _requestCheckOutInfo(refresh) {

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;

        let IDarray = [];
        let pakageArray = [];
        if (isNotEmpty(this.commodity)) {
            this.commodity.map((item) => {
                if (item.type == 'package' || item.type == 'courseOfTreatment') {
                    pakageArray.push(item.package_id)
                } else {
                    IDarray.push(item.id)
                }
            });
        }

        let ids = IDarray.join(',');
        let pakageIds = pakageArray.join(',');
        if (ids.length == 0 && pakageIds.length == 0) return;

        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.cart.getBuy as getBuy,store.finance.invoice.get as getOrderInvoice');
        paramMap.set('addressid', safe(this.defaultAddress.id));
        let buyParamMap = new Map();
        if (ids.length > 0) {
            buyParamMap.set('cartids', safe(ids));
            this.cartIDStr = safe(ids)
        }
        if (pakageIds.length > 0) {
            buyParamMap.set('packageids', safe(pakageIds));
            this.packageIDStr = safe(pakageIds)
        }
        paramMap.set('getBuy',strMapToObj(buyParamMap))
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            let settleInfo = { result: res.result['getBuy'] }
            settleInfo.result.invoice_info = res.result['getOrderInvoice']
            res = YFWWDOrderSettlementModel.getModelValue(settleInfo);
            if (isEmpty(this.disease_items)) {
                this.disease_items = res.disease_items
            }
            if (this.statusView) this.statusView.dismiss();

            let pointInfo = new YFWWDSettlementPointModel();
            pointInfo.point = res.user_point;
            pointInfo.prompt = res.balance_prompt;
            pointInfo.balance = res.balance;
            pointInfo.use_ratio = res.use_ratio;



            this.state.checkOutInfo = res;
            this.state.dataArray = itemAddKey(res.shop_items);
            this.state.selectPackage = refresh ? new Map() : this.state.selectPackage;
            this.state.selectCoupon = refresh ? new Map() : this.state.selectCoupon;
            this.state.selectLogistic = refresh ? new Map() : this.state.selectLogistic;
            this.state.selectPlatformCoupons = refresh ? new Map() : this.state.selectPlatformCoupons;
            this.state.selectInvoiceType = refresh ? new Map() : this.state.selectInvoiceType;
            this.state.pointInfo = pointInfo;

            if(res.is_first_order){
                this.tipsAlert&&this.tipsAlert.showView('提示', '注意：本单为店铺首单，商家将在3个工作日内发货', '确认')
            }

            this._setDefaultValue(res);
            if (refresh) {
                this.changeUsePointOrBalance();
            }

            this.setState({})

        }, (res) => {

            if (isNotEmpty(res) && isNotEmpty(res.code) && (String(res.code) === '-2' || String(res.code) === '-3')) {

                if (this.statusView) this.statusView.dismiss();

                if (isNotEmpty(res.msg) && res.msg.length > 0) {
                    let msg = res.msg;
                    if (String(res.code) === '-2') {
                        if (Platform.OS == 'ios') {
                            YFWNativeManager.showAlertWithTitle('', msg, () => {
                                this.props.navigation.goBack()
                            })
                        } else {
                            Alert.alert('', msg, [
                                { text: '确认', onPress: () => this.props.navigation.goBack() }
                            ], { cancelable: false });
                        }
                    } else if (String(res.code) === '-3') {
                        Alert.alert('', msg, [
                            { text: '确认', onPress: () => this.props.navigation.goBack() }
                        ], { cancelable: false });
                    }

                }

            } else {

                if (this.request_again_getBuy == 3) {
                    if (this.statusView) this.statusView.showNetError();
                } else {
                    this.request_again_getBuy++;
                    this._requestCheckOutInfo(refresh);
                }

            }

        }, refresh);

    }

    clickSubmitMethod() {
        let invoice_title = this.state.selectInvoice.get('title');
        let invoice_code = this.state.selectInvoice.get('code');
        let invoice_type = this.state.selectInvoice.get('type');
        let bank_name = this.state.selectInvoice.get('bank_name')
        let bank_no = this.state.selectInvoice.get('bank_no')
        let register_phone = this.state.selectInvoice.get('register_phone')
        let register_address = this.state.selectInvoice.get('register_address')
        if (Number.parseInt(invoice_type) == 0 || isNaN(parseInt(invoice_type))) {
            YFWToast('请选择开票信息');
            hasSubmit = false;
            return;
        }
        let hasSubmit = true;

        let listMap = new Map();
        let cartidstr = '';
        let tcpCardsIds = '';
        let tcpPackageIds = '';

        for (let i = 0; i < this.state.dataArray.length; i++) {
            let shop_item = this.state.dataArray[i];


            let goods_items = [];
            for (let j = 0; j < shop_item.cart_items.length; j++) {

                let goods_item = shop_item.cart_items[j];

                if (goods_item.type == 'package') {

                    let package_medicines = goods_item.package_medicines;
                    tcpPackageIds += (goods_item.package_id + ',');
                    package_medicines.forEach((item, index, array) => {

                        let goodsDic = {
                            cart_id: safe(item.id),
                            quantity: safe(item.quantity),
                        };
                        goods_items.push(goodsDic);
                        cartidstr = cartidstr + (item.id + ',');
                    });


                } else {

                    let goodsDic = {
                        cart_id: safe(goods_item.id),
                        quantity: safe(goods_item.quantity),
                    };
                    goods_items.push(goodsDic);
                    cartidstr = cartidstr + (goods_item.id + ',');
                    tcpCardsIds += (goods_item.id + ',');
                }

            }


            if (isEmpty(this.state.selectLogistic.get(shop_item.shop_id)) ||
                isEmpty(this.state.selectPackage.get(shop_item.shop_id))) {
                YFWToast('当前地区不配送');
                hasSubmit = false;
                return;
            }

            if (isEmpty(this.state.selectInvoiceType.get(shop_item.shop_id))) {
                YFWToast('请选择发票种类');
                hasSubmit = false;
                return;
            }

            //TCP
            let tempMap = {
                packageid: safe(safeObj(this.state.selectPackage.get(shop_item.shop_id)).id),
                logisticsid: safe(safeObj(this.state.selectLogistic.get(shop_item.shop_id)).id),
                couponsid: safe(safeObj(this.state.selectCoupon.get(shop_item.shop_id)).id),
                dict_bool_etax:safe(safeObj(this.state.selectInvoiceType.get(shop_item.shop_id)).invoice_type)=='2'?1:0, // 1 纸质 2 电子
                rx_image: "",
                rx_content: "",
                no_rx_reason: ""
            }
            //TCP
            listMap.set(shop_item.shop_id, tempMap)
        }

        if (!hasSubmit) {

            YFWToast('当前地区不配送');
            return
        }
        let _platformCoupons = { money: '0.00' };
        if (isNotEmpty(this.state.selectPlatformCoupons.money)) {
            _platformCoupons = this.state.selectPlatformCoupons;
        }

        let use_point = this.state.selectPoint / 100;
        let use_balance = Number.parseFloat(this.state.selectBalance.toString()).toFixed(2);
        let use_platformCoupons = Number.parseFloat(_platformCoupons.money).toFixed(2);

        let price = this._getTotalPrice() - use_point - use_balance - use_platformCoupons ;
        let medicateInfo = safeObj(safeObj(this.state.checkOutInfo).medicate_item)
        let info = {
            invoice_type: invoice_type,
            invoice_name: invoice_title,
            invoice_code: invoice_code,
            bank_name:bank_name,
            bank_no:bank_no,
            register_address:register_address,
            register_phone:register_phone,
            cartids: tcpCardsIds,
            packageids: tcpPackageIds,
            market: YFWUserInfoManager.ShareInstance().getMarket(),
            request_os: Platform.OS,
            use_point: safe(this.state.selectPoint.toString()),
            platform_coupon_id: safe(this.state.selectPlatformCoupons.id),
            use_balance: safe(use_balance),
            addressid: safe(this.state.defaultAddress.id),
            all_order_price_total: String(Number.parseFloat(price).toFixed(2)),
            shop_list: strMapToObj(listMap),
            medicate_name: medicateInfo.medicate_name,//用药人姓名
            medicate_idcard: medicateInfo.medicate_idcard,//用药人身份证号
            medicate_sex: medicateInfo.medicate_sex === '男' ? "1" : "0",//用药人性别
        };
        if (listMap.size == 0) return;
        if (listMap.size == 1) {
            // this._showPaymentDialog(info);//TODO 3.1.00暂时要求取消弹窗，统一跳转到待支付列表
            this._requestOrderSubmit(info);
        } else {
            this._requestOrderSubmit(info);
        }
    }

    _requestOrderSubmit(info, returnBlock) {

        if (this.submitClickable) {
            this.submitClickable = false
        } else {
            return;
        }

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.order.createOrder');
        paramMap.set('data_info', info);
        let paramObj = new YFWRequestParam();
        let params = paramObj.getBaseParam(paramMap);
        try {
            DeviceEventEmitter.emit('LoadProgressShow');
            YFWNativeManager.TCPRequest(strMapToObj(params), (res) => {
                DeviceEventEmitter.emit('LoadProgressClose');
                if (isNotEmpty(res) && isNotEmpty(res.code)) {
                    if (String(res.code) == '1') {
                        let res_items = res.result;
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
                        res_items.forEach(function (value, index, array) {
                            orderArray.push(value);
                        })

                        this.PaymentDialog.show(orderArray, true, () => {
                            let orderStr = orderArray.join(',');
                            this.toPayMethod(orderStr);
                        })

                    } else {
                        this._result_process(res)
                    }
                }

            }, (error) => {
                DeviceEventEmitter.emit('LoadProgressClose');
                this.submitClickable = true;
                error && this._result_process(error)
            });
        } catch (error) {
            DeviceEventEmitter.emit('LoadProgressClose');
            error && this._result_process(error)
            this.submitClickable = true;
        }




    }

    _result_process(res) {
        let userInfo = new YFWUserInfoManager();
        let errorMsg = isEmpty(safeObj(res).message) ? safeObj(res).msg : safeObj(res).message
        res.code = safeObj(res.code);

        this.submitClickable = true;

        if (String(res.code) == '-999' || res.code == -999) {
            userInfo.clearInfo();
        } else if (String(res.code) == '-2') {
            if (isNotEmpty(errorMsg) && errorMsg.length > 0) {
                Alert.alert('', errorMsg, [
                    { text: '确认', onPress: () => this.props.navigation.goBack() }
                ], { cancelable: false });

            }
        } else if (String(res.code) == '-1') {
            YFWToast(res.msg);
        } else {
            this.showToast(errorMsg);

        }
    }
    showToast(msg) {
        let isShow = true;
        for (let i = 0; i < filterMsg.length; i++) {
            if (msg.includes(filterMsg[i])) {
                isShow = false
                break
            }
        }
        if (isShow) {
            YFWToast(msg)
        }
    }

    _showPaymentDialog(info) {

        this.PaymentDialog.show(this.state.orderNo);
        this.orderRequestInfo = info;

    }


    paymentGetOrderNo(returnBlock) {

        this._requestOrderSubmit(this.orderRequestInfo, returnBlock);

    }


    /**
     * 提交处方回来弹出支付窗口
     * @param orderNo
     */
    rxCallback(orderNo) {
        this.PaymentDialog.show(orderNo)
    }


    payCancleMethod(orderNo) {

        if (isNotEmpty(this.state.orderNo)) {

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
    _showNonAddressAlert() {

        Alert.alert('提示', '您还没有设置收货地址，请点击这里设置！', [{
            text: '否',
            onPress: () => { this.props.navigation.goBack(); },
        },{
            text: '是',
            onPress: () => this._toAddAddressController(),
        }, ], {
            cancelable: true
        });

    }

    _toAddAddressController() {
        getRegistStatus((status)=> {
            let pageMode = status ? 'select' : 'manual'
            this.props.navigation.navigate('YFWWDShippingAddressDetail', {
                type: 'new',pageMode:pageMode, callBack: () => {
                    this.handleData();
                }
            });
        })

    }

    _setDefaultValue(res) {

        if (isNotEmpty(res.shop_items)) {

            let selectPackage = new Map();
            let selectCoupon = new Map();
            let selectLogistic = new Map();
            let selectShopOffers = new Map();
            let selectPlatformCoupons = new Map();
            let selectInvoiceType = new Map();

            res.shop_items.forEach(function (shop, index, shopItems) {

                if (shop.package_items.length > 0) {
                    selectPackage.set(shop.shop_id, shop.package_items[0]);
                }
                if (shop.coupon_items.length > 0) {
                    selectCoupon.set(shop.shop_id, shop.coupon_items[0]);
                }
                if (Number.parseFloat(shop.shop_offers_price) > 0) {
                    selectShopOffers.set(shop.shop_id, shop.shop_offers_price);
                }
                if (shop.logistic_items.length > 0) {
                    //默认包邮 * 取配送费最少的选项

                    let logistic_select = shop.logistic_items[0];
                    shop.logistic_items.forEach((logisticItem, index) => {
                        if (Number.parseFloat(logistic_select.price) > Number.parseFloat(logisticItem.price)) {
                            logistic_select = logisticItem;
                        }
                    });
                    selectLogistic.set(shop.shop_id, logistic_select);
                }
                if (safeArray(shop.invoice_types).length == 1) {
                    selectInvoiceType.set(shop.shop_id, {invoice_type:shop.invoice_types[0]});
                }
            })

            if (res.platform_coupons_items.length > 0) {
                selectPlatformCoupons = res.platform_coupons_items[0];
                res.platform_coupons_items.push({ money: '0.00', coupon_des: '不使用平台优惠券' })
            } else {

            }

            this.state.selectPackage = selectPackage;
            this.state.selectCoupon = selectCoupon;
            this.state.selectLogistic = selectLogistic;
            this.state.selectShopOffers = selectShopOffers;
            this.state.selectPlatformCoupons = selectPlatformCoupons;
            this.state.selectInvoiceType = selectInvoiceType;

        }


    }

    _getTotalPrice() {

        if (this.state.dataArray.length > 0) {

            //结算金额
            let totalPrice = 0;
            for (let i = 0; i < this.state.dataArray.length; i++) {
                let shop_item = this.state.dataArray[i];

                let _package = { price: '0.00' };
                let _logistic = { price: '0.00' };
                let _coupon = { money: '0.00' };
                let _shop_offers_price = '0.00';

                // if (isNotEmpty(this.state.selectPackage.get(shop_item.shop_id))) {
                //     _package = this.state.selectPackage.get(shop_item.shop_id);
                // }
                if (isNotEmpty(this.state.selectLogistic.get(shop_item.shop_id))) {
                    _logistic = this.state.selectLogistic.get(shop_item.shop_id);
                }
                if (isNotEmpty(this.state.selectCoupon.get(shop_item.shop_id))) {
                    _coupon = this.state.selectCoupon.get(shop_item.shop_id);
                }
                if (isNotEmpty(this.state.selectShopOffers.get(shop_item.shop_id))) {
                    _shop_offers_price = this.state.selectShopOffers.get(shop_item.shop_id);
                }

                shop_item.cart_items.forEach(function (v, i, a) {
                    if (v.type == 'package') {
                        totalPrice += Number.parseFloat(v.price).toFixed(2) * Number.parseInt(v.count);
                    } else {
                        totalPrice += Number.parseFloat(v.price).toFixed(2) * Number.parseInt(v.quantity);
                    }
                });
                totalPrice += Number.parseFloat(_package.price) + Number.parseFloat(_logistic.price)
                    - Number.parseFloat(_coupon.money) - Number.parseFloat(_shop_offers_price);

            }

            return totalPrice;
        }

        return 0;

    }


    _changeUsePointMethod(value, cut_point) {

        mobClick('order settlement-points');
        let point = 0;
        if (value) {
            point = cut_point;
        }

        this.setState({
            usePoint: value,
            selectPoint: point,
        });

    }

    _changeUseBalanceMethod(value, balance) {

        let show_balance = 0;
        if (value && this.state.useBalance == 0) {
            this._clickBalanceUseHelp();
        }
        if (value) {
            show_balance = balance;
        }

        this.setState({
            useBalance: value,
            selectBalance: show_balance,
        });

    }

    _clickBalanceUseHelp() {

        let prompt = safe(this.state.pointInfo.prompt);

        Alert.alert('奖励使用规则', richText(prompt));

    }

    _clickGoodsItemMethod(item) {

        // let {navigate} = this.props.navigation;
        // pushNavigation(navigate,{type:'get_shop_goods_detail',value:item.shop_goods_id,img_url:tcpImage(item.img_url)})

    }

    toPayMethod(orderString) {

        if (this.state.dataArray.length > 0) {

            this.props.navigation.replace('YFWWDOrderSettlementList', { orderNo: orderString, defaultAddress: this.defaultAddress });

        }

    }

    _changeAddress() {

        mobClick('order settlement-address');
        let that = this;
        let { navigate } = this.props.navigation;
        pushWDNavigation(navigate, {
            type: kRoute_address_manager, callBack: (item) => {
                this.defaultAddress = item;
                that.setState({ defaultAddress: item })

                that._requestCheckOutInfo(true);
            }, returnBack: () => {
                if (that.defaultAddress.is_default == '1') {
                    that.handleData();
                }
            }
        })

    }

    platformCouponsCell() {
        if (isNotEmpty(this.state.selectPlatformCoupons.money)) {
            return this._renderClickItemCell('platformCoupons', this.state.selectPlatformCoupons, () => {
                this.platformCouponsItemClick(this.state.checkOutInfo.platform_coupons_items, this.state.selectPlatformCoupons);
            })
        }
    }


    selectDefaultPointBalance() {


        /* 奖励金规则
        * 1. 如果可使用积分，大于订单总价 * 可使用比例，则优先使用积分并且隐藏余额
        * 2. 如果余额等于0，隐藏余额
        * 3. 如果可使用积分小于订单总价 * 可使用比例，则默认使用所有积分，采取优先使用积分原则
        *   a. 可用余额 = 订单总价 * 可使用比例 - 所有可使用积分
        *   b. 如果当前余额大于等于可用余额，则使用可用余额
        *   c. 如果当前余额小于可用余额，则使用当前余额
        * 4. 最终订单价格 = 订单总价 - 可使用积分 - 可用余额
        * */

        let _platformCoupons = { money: '0.00' };
        if (isNotEmpty(this.state.selectPlatformCoupons.money)) {
            _platformCoupons = this.state.selectPlatformCoupons;
        }

        let total_price = this._getTotalPrice() - Number.parseFloat(_platformCoupons.money);
        let point = 0;
        let balance = 0;
        let ratio = 1;
        let showBalance = true;
        if (isNotEmpty(this.state.pointInfo)) {
            point = Number.parseInt(this.state.pointInfo.point);
            balance = Number.parseInt(this.state.pointInfo.balance);
            ratio = Number.parseFloat(this.state.pointInfo.use_ratio);
        }

        let cut_point = point;
        if (total_price * 100 * ratio <= cut_point) {
            cut_point = Number.parseInt(total_price * 100 * ratio);
            showBalance = false;
        }
        if (balance == 0) {
            showBalance = false;
        }
        if (showBalance) {
            balance = min(balance, total_price * ratio - cut_point / 100);
        }

        return { cut_point: cut_point, balance: balance, showBalance: showBalance };

    }


    changeUsePointOrBalance() {

        if (this.state.usePoint || this.state.useBalance) {

            let balanceDic = this.selectDefaultPointBalance();

            if (this.state.usePoint) {

                let cut_point = balanceDic.cut_point;
                this._changeUsePointMethod(this.state.usePoint, cut_point);
            }

            if (this.state.useBalance) {

                let balance = balanceDic.balance;
                this._changeUseBalanceMethod(this.state.useBalance, balance);
            }

        }

    }


    // =========== View ==============

    render() {
        return (
            <View style={[BaseStyles.container, { backgroundColor: backGroundColor() }]}>
                <FlatList
                    ref={(flatList) => this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.dataArray}
                    key={'settlement'}
                    renderItem={this._renderItem.bind(this)}
                    ListHeaderComponent={this._renderHeader()}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onScroll={this.onScroll}
                    scrollEventThrottle={50}
                />
                {this._renderBottomView()}
                <StatusView ref={(m) => { this.statusView = m }} retry={() => { this.handleData() }} />
                <YFWWDPaymentDialogView ref={(dialog) => { this.PaymentDialog = dialog; }} navigation={this.props.navigation} from={'orderRootSettlement'} unPayCount={1} />
                <YFWWDPackageAlertView ref={(ref_alertview) => { this.packageAlertView = ref_alertview }} callback={(type, value) => {
                    if (type == 'package') {
                        this.setState({
                            selectPackage: value,
                        });
                    } else if (type == 'logistic') {
                        this.setState({
                            selectLogistic: value,
                        });

                    } else if (type == 'coupon') {
                        this.setState({
                            selectCoupon: value,
                        });
                    }
                    else if (type == 'platformCoupons') {
                        this.setState({
                            selectPlatformCoupons: value,
                        });
                    }
                    else if (type == 'invoice') {
                        this.setState({
                            selectInvoice: value,
                        });
                    }
                    else if (type == 'invoice_type') {
                        this.setState({
                            selectInvoiceType: value,
                        });
                    }
                    //重新计算抵扣积分与奖励金金额
                    this.changeUsePointOrBalance();
                }} />
                <YFWWDTipsAlert ref={(e)=>this.tipsAlert=e} />
            </View>
        );
    }

    _renderItem = (item) => {

        let cartItems = itemAddKey(item.item.cart_items, 'cart_items');

        return (
            <View style={[BaseStyles.container, { backgroundColor: 'white' }]} key={'cart_items' + item.index}>
                <FlatList
                    data={cartItems}
                    extraData={this.state}
                    renderItem={this._renderRowItem.bind(this)}
                    ListHeaderComponent={() => this._renderSectionHeader(item.item)}
                    ListFooterComponent={() => this._renderSectionFooter(item.item)}
                />
            </View>
        );

    }

    _renderBottomView() {

        let _platformCoupons = { money: '0.00' };
        if (isNotEmpty(this.state.selectPlatformCoupons.money)) {
            _platformCoupons = this.state.selectPlatformCoupons;
        }
        let price = this._getTotalPrice() - this.state.selectPoint / 100 - this.state.selectBalance - Number.parseFloat(_platformCoupons.money);
        if (isNotEmpty(this.state.dataArray) && this.state.dataArray.length > 0) {
            return (
                <View style={{ width: kScreenWidth, backgroundColor: 'white', marginBottom: (isIphoneX()) ? 34 : 0 }}>
                    {this._renderBottomAddress()}
                    <View style={{ height: 50, width: kScreenWidth, marginBottom: 0, backgroundColor: 'white' }}>
                        <View style={{ backgroundColor: separatorColor(), height: 0.5, width: kScreenWidth, marginTop: 0 }} />
                        <View style={[BaseStyles.leftCenterView, { flex: 1 }]}>
                            <View style={[BaseStyles.leftCenterView, { flex: 1, marginBottom: 2 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 }}>
                                        <Text style={{ fontSize: 15, color: darkTextColor(), marginLeft: 13 }}>{'合计:'}</Text>
                                        <YFWDiscountText navigation={this.props.navigation} style_view={{ marginTop: 0, marginLeft: 10, flex: 1 }} style_text={{ fontSize: 18, fontWeight: 'bold' }} value={'¥' + toDecimal(price)} />
                                    </View>
                                </View>
                            </View>
                            <View style={{ width: 113, height: 50, marginRight: 0, backgroundColor: yfwRedColor() }}>
                                <TouchableOpacity style={[BaseStyles.centerItem, { flex: 1 }]} onPress={() => this.clickSubmitMethod()}>
                                    <Text style={{ fontSize: 14, color: 'white', fontWeight: '500' }}>支付</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (<View />)
        }

    }

    _renderRowItem = (item) => {
        let icon = [];
        if (item.item.type == 'package') {
            switch (item.item.package_type) {
                case 1:
                    //疗程装
                    icon = (
                        <LinearGradient colors={['rgb(122,219,255)', 'rgb(72,139,255)']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            locations={[0, 1]}
                            style={{ width: 42, height: 15, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginLeft: 32 }}>
                            <Text style={{ fontSize: 10, color: 'white' }}>疗程装</Text>
                        </LinearGradient>
                    );
                    break;
                case 0:
                    //套餐
                    icon = (
                        <LinearGradient colors={['rgb(255,136,129)', 'rgb(234,80,101)']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            locations={[0, 1]}
                            style={{ width: 42, height: 15, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginLeft: 32 }}>
                            <Text style={{ fontSize: 10, color: 'white' }}>套餐</Text>
                        </LinearGradient>
                    );
                    break;
                default:
            }
            return (
                <View style={[BaseStyles.container, {
                    backgroundColor: 'white', borderRadius: 10, elevation: 1,
                    shadowColor: "rgba(204, 204, 204, 0.2)",
                    shadowOffset: {
                        width: 0,
                        height: 0
                    },
                    shadowRadius: 11,
                    shadowOpacity: 1, marginBottom: 12, marginHorizontal: 12
                }]}>
                    <View style={[BaseStyles.leftCenterView, { height: 30, width: kScreenWidth - 24, }]}>
                        {icon}
                        <Text style={{ width: kScreenWidth - 130, marginLeft: 10, color: darkNomalColor(), fontSize: 14 }}>{item.item.package_name}</Text>
                    </View>
                    {this._renderPackageItem(item.item)}
                    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 18 }}>
                        <YFWMoneyLabel moneyTextStyle={{ fontSize: 15 }} decimalsTextStyle={{ marginRight: 20, fontSize: 13 }} money={parseFloat(item.item.price) * parseInt(item.item.count)} />
                        <Text style={{ color: '#333', fontSize: 12 }}>总价: </Text>
                        <Text style={{ color: '#333', fontSize: 12, marginRight: 9 }}>件</Text>
                        <Text style={{ color: '#ff6d60', fontSize: 12, }}>{item.item.count}</Text>
                        <Text style={{ color: '#333', fontSize: 12, }}>共</Text>
                    </View>
                </View>
            );

        } else {

            return (
                <View style={{
                    height: 90, width: kScreenWidth - 24, backgroundColor: 'white', borderRadius: 10, elevation: 1,
                    shadowColor: "rgba(204, 204, 204, 0.2)",
                    shadowOffset: {
                        width: 0,
                        height: 0
                    },
                    shadowRadius: 11,
                    shadowOpacity: 1, marginBottom: 12, marginHorizontal: 12
                }}>
                    <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView, { flex: 1 }]} onPress={() => { this._clickGoodsItemMethod(item.item) }}>
                        <Image style={{ width: 67, height: 67, marginLeft: 20 }}
                            source={{ uri: tcpImage(item.item.img_url) }} />
                        <View style={{ flex: 1, height: 90, marginLeft: 20, justifyContent: 'space-between' }}>
                            <View style={{ marginTop: 13, marginRight: 17, flex: 1 }}>
                                {this.renderTitleView(item.item)}
                                <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between' }]}>
                                    <Text style={[BaseStyles.contentWordStyle]}>{item.item.standard}</Text>
                                    <Text style={[BaseStyles.contentWordStyle]}>x {item.item.quantity}</Text>
                                </View>
                                <Text style={[BaseStyles.contentWordStyle]}>{'效期: '+ item.item.period_to}</Text>
                                <View style={{ flex: 1 }} />
                            </View>
                            <YFWDiscountText navigation={this.props.navigation} style_view={{ marginRight: 15, justifyContent: 'flex-start', marginBottom: 12 }} style_text={{ fontSize: 14, fontWeight: '500' }} value={'¥' + toDecimal(item.item.price_old)} discount={item.item.discount} />
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    renderTitleView(item) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if (safeObj(item).PrescriptionType + "" === "1") {
            return this.rednerPrescriptionLabel(TYPE_SINGLE, item.title)
        }
        //双轨药
        else if (safeObj(item).PrescriptionType + "" === "2") {
            return this.rednerPrescriptionLabel(TYPE_DOUBLE, item.title)
        }
        //OTC
        else if (safeObj(item).PrescriptionType + "" === "0") {
            return this.rednerPrescriptionLabel(TYPE_OTC, item.title)
        }
        //这里没有处方药的判断
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL, item.title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type, title) {
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={[BaseStyles.titleWordStyle, { fontWeight: 'bold', lineHeight: 17 }]}
            numberOfLines={1}
        />
    }


    _renderPackageItem(item) {

        var allBadge = [];
        // 遍历json数据
        let menuaArray = item.package_medicines;
        for (var i = 0; i < menuaArray.length; i++) {
            // 取出每一个数据对象
            let badge = menuaArray[i];
            // 装入数据
            allBadge.push(
                <View style={{ height: 90 }} key={'packageCell' + i}>
                    <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView, { flex: 1 }]} onPress={() => { this._clickGoodsItemMethod(badge) }}>
                        <Image style={{ width: 67, height: 67, marginLeft: 20 }}
                            source={{ uri: tcpImage(badge.img_url) }} />
                        <View style={{ flex: 1, height: 90, marginLeft: 20, justifyContent: 'space-between' }}>
                            <View style={{ marginRight: 17, marginTop: 13, flex: 1 }}>
                                {this.renderTitleView(badge)}
                                <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between' }]}>
                                    <Text style={[BaseStyles.contentWordStyle]}>{badge.standard}
                                        <Text style={{marginLeft:10}}>{badge.period_to}</Text>
                                    </Text>
                                    <Text style={[BaseStyles.contentWordStyle]}>x {badge.quantity}</Text>
                                </View>
                                <View style={{ flex: 1 }} />
                            </View>
                            <YFWDiscountText navigation={this.props.navigation} style_view={{ marginRight: 15, justifyContent: 'flex-start', marginBottom: 12, }} style_text={{ fontSize: 14, color: darkLightColor() }} value={'¥' + toDecimal(badge.price)} discount={badge.discount} />
                        </View>
                    </TouchableOpacity>
                    <View style={[BaseStyles.separatorStyle, { marginLeft: 100, width: kScreenWidth - 100 - 36 }]} />
                </View>

            );
        }

        // 返回数组
        return allBadge;

    }

    _renderSectionHeader(item) {

        return (
            <View style={{ height: 40, width: kScreenWidth, backgroundColor: 'white' }}>
                <View style={[BaseStyles.leftCenterView, { flex: 1 }]}>
                    <Image style={{ width: 13, height: 13, marginLeft: 25, resizeMode: 'stretch' }}
                        source={require('../../../img/shops.png')} />
                    <Text style={[BaseStyles.titleWordStyle, { marginLeft: 5, fontWeight: 'bold', width: kScreenWidth - 50 }]} numberOfLines={1}>{item.shop_title}</Text>
                </View>
            </View>
        );

    }

    _renderSectionFooter(item) {

        //优惠券、包装、配送、满减
        let _package = { price: '0.00' };
        let _logistic = { price: '0.00' };
        let _coupon = { money: '0.00' };
        let _shop_offers_price = '0.00';
        let _invoice_type = {};

        // if (isNotEmpty(this.state.selectPackage.get(item.shop_id))) {
        //     _package = this.state.selectPackage.get(item.shop_id);
        // }
        if (isNotEmpty(this.state.selectLogistic.get(item.shop_id))) {
            _logistic = this.state.selectLogistic.get(item.shop_id);
        }
        if (isNotEmpty(this.state.selectCoupon.get(item.shop_id))) {
            _coupon = this.state.selectCoupon.get(item.shop_id);
        }
        if (isNotEmpty(this.state.selectShopOffers.get(item.shop_id))) {
            _shop_offers_price = this.state.selectShopOffers.get(item.shop_id);
        }
        if (isNotEmpty(this.state.selectInvoiceType.get(item.shop_id))) {
            _invoice_type = this.state.selectInvoiceType.get(item.shop_id);
        }

        //结算金额
        let totalPrice = 0;
        let totalQuantity = 0;
        item.cart_items.forEach(function (v, i, a) {
            if (v.type == 'package') {
                totalPrice += Number.parseFloat(v.price) * Number.parseInt(v.count);
                v.package_medicines.forEach((value) => {
                    totalQuantity += Number.parseInt(value.quantity);
                });
                // totalQuantity += Number.parseInt(v.count);
            } else {
                totalPrice += Number.parseFloat(v.price) * Number.parseInt(v.quantity);
                totalQuantity += Number.parseInt(v.quantity);
            }
        });
        totalPrice += Number.parseFloat(_package.price) + Number.parseFloat(_logistic.price) - Number.parseFloat(_coupon.money) - Number.parseFloat(_shop_offers_price);

        return (
            <View style={{ backgroundColor: 'white' }}>
                {/* {this._renderClickItemCell('package', _package, () => {
                    this.packageItemClick(item, this.state.selectPackage);
                })} */}
                {this._renderClickItemCell('logistic', _logistic, () => {
                    this.logisticItemClick(item, this.state.selectLogistic);
                })}
                {this._renderClickItemCell('coupon', _coupon, () => {
                    this.couponItemClick(item, this.state.selectCoupon);
                })}
                {this._renderClickItemCell('invoice_type', _invoice_type, () => {
                    this.invoiceTypeItemClick(item, this.state.selectInvoiceType);
                })}
                {this._renderShopOffersPrice(item.shop_offers_price)}
                {this._renderDiscountPrice(item.discount)}
                <View style={[BaseStyles.leftCenterView, { height: 50 }]}>
                    <View style={[BaseStyles.leftCenterView, { height: 45 }]}>
                        <Text style={[BaseStyles.contentWordStyle, { marginLeft: 15, marginRight:20, fontSize: 14 }]}>{'总计'}</Text>
                    </View>
                    <View style={[BaseStyles.rightCenterView, { flex: 1 }]}>
                        <View style={{ marginRight: 17 }}>
                            <YFWMoneyLabel moneyTextStyle={{ marginRight: 20, fontSize: 13 }} decimalsTextStyle={{ fontSize: 11 }} money={toDecimal(totalPrice)} />
                        </View>
                        <Text style={[BaseStyles.contentWordStyle, { marginLeft: 15, fontSize:13,color:'#333' }]}>品种: {item.store_medicine_count}  数量:{totalQuantity} 金额(含运费):</Text>
                    </View>
                </View>
                <View style={{ backgroundColor: backGroundColor(), height: 20 }} />
            </View>
        );

    }

    packageItemClick(value, selectvalue) {
        mobClick('order settlement-packing');
        this.packageAlertView.showView('package', value, selectvalue);
    }
    logisticItemClick(value, selectvalue) {
        mobClick('order settlement-dispatching');
        if (value.logistic_items.length > 0) {
            this.packageAlertView.showView('logistic', value, selectvalue);
        } else {
            Alert.alert('提示', '当前地区暂不提供配送', [{
                text: '是',
            }], {
                cancelable: true
            });
        }
    }
    couponItemClick(value, selectvalue) {
        this.packageAlertView.showView('coupon', value, selectvalue);
    }

    invoiceTypeItemClick(value, selectvalue) {
        this.packageAlertView.showView('invoice_type', value, selectvalue);
    }

    platformCouponsItemClick(value, selectvalue) {
        this.packageAlertView.showView('platformCoupons', value, selectvalue);
    }

    _renderClickItemCell(type, item, func) {


        let title = '';
        let content = '';
        let titleColor = '#333';

        if (type == 'package') {

            title = '包装方式';
            content = item.name + ' ' + toDecimal(item.price) + '元';

        } else if (type == 'logistic') {
            title = '配送方式';
            content = item.name ? item.name + ' ' + toDecimal(item.price) + '元' : '当前地区暂不配送';
            titleColor = item.name ? '#333' : yfwOrangeColor();

        } else if (type == 'coupon') {

            title = '优惠券';
            content = '抵用 ' + toDecimal(item.money) + '元';

        } else if (type == 'invoice') {

            title = '开票信息';
            content = item.title;

        }  else if (type == 'invoice_type') {

            title = '发票种类';
            content = isNotEmpty(item.invoice_type)?(item.invoice_type=='1'?'纸质发票':'电子发票'):'请选择';

        } else if (type == 'platformCoupons') {

            title = '平台优惠';
            content = toDecimal(item.money) + '元';

        }

        return (
            <TouchableOpacity activeOpacity={1} onPress={func} style={{backgroundColor:'white'}}>
                <View style={[BaseStyles.leftCenterView, { height: 45 }]}>
                    <Text style={[BaseStyles.contentWordStyle, { marginLeft: 15, width: 80, fontSize: 13 }]}>{title}</Text>
                    <View style={[BaseStyles.rightCenterView, { flex: 1 }]}>
                        <Text style={{ marginRight: 10, fontSize: 13, color: titleColor }}>{content}</Text>
                    </View>
                    <Image style={{ width: 13, height: 13, marginRight: 15 }}
                        source={require('../../../img/around_detail_icon.png')} />
                </View>
            </TouchableOpacity>
        );

    }

    _renderDiscountPrice(price) {

        if (Number.parseFloat(price) > 0) {

            return (
                <View style={[BaseStyles.leftCenterView, { height: 45 }]}>
                    <Text style={[BaseStyles.contentWordStyle, { marginLeft: 15, width: 80, fontSize: 14 }]}>{'返现'}</Text>
                    <View style={[BaseStyles.rightCenterView, { flex: 1 }]}>
                        <Text style={{ marginRight: 37, fontSize: 14, color: darkTextColor() }}>{'-¥' + toDecimal(price)}</Text>
                    </View>
                </View>
            );

        } else {
            return (<View />);
        }

    }

    _renderShopOffersPrice(price) {

        if (Number.parseFloat(price) > 0) {

            return (
                <View style={[BaseStyles.leftCenterView, { height: 45 }]}>
                    <Text style={[BaseStyles.contentWordStyle, { marginLeft: 15, width: 80, fontSize: 14 }]}>{'商家优惠'}</Text>
                    <View style={[BaseStyles.rightCenterView, { flex: 1 }]}>
                        <Text style={{ marginRight: 37, fontSize: 14, color: darkTextColor() }}>{'商家优惠(' + toDecimal(price) + '元)'}</Text>
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
    _renderHeader() {
        return (
            <View style={{backgroundColor:'white'}}>
                {this._renderAddressView()}
                {this._renderPayTips()}
            </View>
        )
    }

    /**
     * 尽快付款提示
     */
    _renderPayTips() {

        return (
            <View style={[BaseStyles.leftCenterView, { backgroundColor: "#faf8dc", width: kScreenWidth, paddingVertical: adaptSize(8), paddingHorizontal: adaptSize(22), marginBottom: adaptSize(8) }]}>
                <Text style={{ lineHeight: adaptSize(15), fontSize: 13, color: 'rgb(254,172,76)' }} numberOfLines={2}>{payOrderTip}</Text>
            </View>
        )
    }

    _renderAddressView() {

        if (isNotEmpty(this.state.defaultAddress) && isNotEmpty(this.state.dataArray) && this.state.dataArray.length > 0) {
            return (
                <View style={[BaseStyles.leftCenterView, { height: 166, width: kScreenWidth }]}>
                    <YFWWDSettlementHeader context={{
                        name: this.state.defaultAddress.name,
                        mobile: this.state.defaultAddress.mobile,
                        address: this.state.defaultAddress.address,
                        isDefault: this.state.defaultAddress.is_default
                    }} isTouch={true} changeAddress={() => { this._changeAddress() }} />
                </View>
            );
        } else {
            return (
                <View />
            );
        }

    }


    _renderFooter() {
        let _selectInvoice = { code: '', title: '请选择', type: '0' };
        let title = this.state.selectInvoice.get('title');
        let code = this.state.selectInvoice.get('code');
        let type = this.state.selectInvoice.get('type');
        let bank_name = this.state.selectInvoice.get('bank_name')
        let bank_no = this.state.selectInvoice.get('bank_no')
        let register_phone = this.state.selectInvoice.get('register_phone')
        let register_address = this.state.selectInvoice.get('register_address')

        if (Number.parseInt(type) == 1) {
            _selectInvoice = { code: code, title: '增值税普通发票', type: 1 };
        } else if (Number.parseInt(type) == 2) {
            _selectInvoice = { code: code, title: '增值税专用发票', type: 2 };
        }

        let balanceDic = this.selectDefaultPointBalance();
        let cut_point = balanceDic.cut_point;
        let balance = balanceDic.balance;
        let showBalance = balanceDic.showBalance;
        // 如果本地有修改，就用本地，没有就用接口返回数据
        let default_invoice = {
            invoice_name: this.state.checkOutInfo.invoice_name,
            invoice_code: this.state.checkOutInfo.invoice_code,
            invoice_register_address: isNotEmpty(register_address)?register_address:this.state.checkOutInfo.invoice_register_address,
            invoice_bank_name:isNotEmpty(bank_name)?bank_name:this.state.checkOutInfo.invoice_bank_name,
            invoice_bank_no:isNotEmpty(bank_no)?bank_no:this.state.checkOutInfo.invoice_bank_no,
            invoice_register_phone:isNotEmpty(register_phone)?register_phone:this.state.checkOutInfo.invoice_register_phone,
        }

        if (isNotEmpty(this.state.dataArray) && this.state.dataArray.length > 0) {
            return (
                <View style={{ backgroundColor: 'white' }}>
                    {this._renderClickItemCell('invoice', _selectInvoice, () => {
                        mobClick('order settlement-invoice');
                        this.packageAlertView.showView('invoice', default_invoice)
                    })}
                    {this.platformCouponsCell()}
                    {/* {this._renderPointView(cut_point)} */}
                    {/* {this._renderBalanceView(balance, showBalance)} */}
                    {/*{this._renderCompliancePromptView()}*/}
                    <View style={{ backgroundColor: backGroundColor(), height: 60 }} />
                </View>
            );

        } else {
            return (<View style={{ height: 50 }}/>)
        }


    }

    _renderPointView(cut_point) {

        if (cut_point > 0) {
            return (
                <View style={[BaseStyles.leftCenterView, { height: 45 }]}>
                    <Text style={[BaseStyles.contentWordStyle, { marginLeft: 15, fontSize: 14, width: kScreenWidth - 90 }]}>{'使用' + cut_point + '积分抵用' + toDecimal(cut_point / 100) + '元'}</Text>
                    <View style={[BaseStyles.rightCenterView, { width: 70, height: 40 }]}>
                        <Switch style={{ width: 70, height: 25, marginBottom: 10 }} value={this.state.usePoint} onValueChange={(value) => { this._changeUsePointMethod(value, cut_point) }} />
                    </View>
                </View>
            );
        } else {
            return (<View />);
        }

    }


    _renderBalanceView(balance, show) {

        if (show) {
            return (
                <View style={[BaseStyles.leftCenterView, { height: 50 }]}>
                    <View style={[BaseStyles.leftCenterView, { width: kScreenWidth - 75, height: 40 }]}>
                        <Text style={[BaseStyles.contentWordStyle, { marginLeft: 15, fontSize: 14 }]}>{'可使用奖励金额' + toDecimal(balance) + '元'}</Text>
                        <TouchableOpacity activeOpacity={1} onPress={() => { this._clickBalanceUseHelp() }}>
                            <Image style={{ width: 18, height: 18, marginLeft: 10 }}
                                source={require('../../../img/tips_help.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={[BaseStyles.rightCenterView, { width: 70, height: 40 }]}>
                        <Switch style={{ width: 70, height: 25, marginBottom: 10 }} value={this.state.useBalance} onValueChange={(value) => { this._changeUseBalanceMethod(value, balance) }} />
                    </View>
                </View>
            );
        } else {
            return (<View />);
        }

    }

    _renderCompliancePromptView() {

        if (isNotEmpty(this.state.checkOutInfo) &&
            isNotEmpty(this.state.checkOutInfo.compliance_prompt) &&
            this.state.checkOutInfo.compliance_prompt.length > 0) {

            return (
                <View style={{ backgroundColor: 'white' }}>
                    <View style={{ backgroundColor: backGroundColor(), height: 10 }} />
                    <View style={[BaseStyles.leftCenterView, { height: 50 }]}>
                        <Text style={[BaseStyles.titleWordStyle, { marginLeft: 15, marginTop: 10, fontSize: 15 }]}>郑重承诺：</Text>
                    </View>
                    <Text style={[BaseStyles.contentWordStyle, { marginBottom: 15, marginLeft: 15, width: kScreenWidth - 30, fontSize: 14, lineHeight: 22 }]}>
                        {richText(this.state.checkOutInfo.compliance_prompt)}
                    </Text>
                </View>
            );

        }
    }

    /*生成底部的地址显示*/
    _renderBottomAddress() {
        if (isNotEmpty(this.state.defaultAddress) && this.state.isShow) {
            return (
                <View style={[BaseStyles.leftCenterView, { backgroundColor: "#FFF3CA", width: kScreenWidth, height: 50 , position:'absolute',bottom:50}]}>
                    <Text style={{ paddingLeft: 10, fontSize: 14, color: yfwOrangeColor() }} numberOfLines={2}>
                        {this.state.defaultAddress.address}
                    </Text>
                </View>
            )
        } else {
            return (<View />)
        }
    }

    onScroll = (event) => {
        let y = event.nativeEvent.contentOffset.y;
        this.isShowBottomAddress(y)
    }


    isShowBottomAddress(y) {
        if (y > 111 && this.state.isShow === false) {
            this.setState({ isShow: true })
        } else if (y < 111 && this.state.isShow) {
            this.setState({ isShow: false })
        }
    }

    /**
     * 校验身份证
     */
    verifyCardNum(txt) {
        if (isEmpty(txt)) {
            return txt
        }
        txt = txt.replace(IDENTITY_CODE, '')
        return txt
    }

}

const filterMsg = ["下架", "error", "request", "系统", "服务", "__cmd", "undefined", "service"]
