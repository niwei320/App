import React from 'react';
import YFWWDOperationSuccessView from '../View/YFWWDOperationSuccessView'
import YFWWDOperationSuccessModel from '../Model/YFWWDOperationSuccessModel'
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import { kList_from } from '../../Base/YFWWDBaseModel';
import { kRoute_shop_goods_detail, pushWDNavigation, kRoute_goods_detail } from '../../YFWWDJumpRouting';
import YFWWDMedicineInfoModel from '../Model/YFWWDMedicineInfoModel';
import {
    tcpImage,
    safeObj,
    isNotEmpty,
    isArray,
    safeArray
} from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWWDOperationSuccessController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDOperationSuccessModel()
        this.view = <YFWWDOperationSuccessView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    componentWillMount() {
        this.model.headerInfo.title = this.props.navigation.state.params.state.title;
        this.model.headerInfo.orderNo = this.props.navigation.state.params.state.orderNo;
        this.model.headerInfo.pageType = this.props.navigation.state.params.state.pageType

        this.model.listModel.numColumns = 2
        this.model.listModel.needRequest = false
        this.model.listModel.from = kList_from.kList_from_operationsccess
        this.getParamMap()
        this.getListData()
        this.request()
    }

    request() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.order.getOrderOperInfo');
        paramMap.set('orderno', this.model.headerInfo.orderNo);
        paramMap.set('type', this.model.headerInfo.pageType);
        paramMap.set('client', 'phone');
        this.model.requestWithParams(paramMap, (res) => {
            let data = res.result;
            if (isNotEmpty(data)) {
                let buttonOrder = { text: '查看订单', type: 'get_order_detail', value: safeObj(this.model.headerInfo.orderNo) };
                let buttonHome = { text: '回到首页', type: 'get_main_page' }
                let buttonArray = []
                if (isNotEmpty(data.items['0'].buttons) && data.items['0'].buttons.length > 0) {
                    buttonArray = data.items['0'].buttons;
                    if (buttonArray.length <= 1) {
                        buttonArray.push(buttonHome)
                    }
                } else {
                    buttonArray.push(buttonOrder)
                    buttonArray.push(buttonHome)
                }
                let couponArray = []
                if (safeArray(data.items).length > 0) {
                    data.items.map((item,index)=>{
                        if(isNotEmpty(item.give_coupons) && couponArray.length < 2){
                            couponArray.push(item.give_coupons)
                        }
                    })
                }
                this.model.headerInfo.couponArray = couponArray
                this.model.headerInfo.btArray = buttonArray
                this.model.headerInfo.money = data.items['0'].total_price&&this._getTotalPrice(data.items)
                this.model.headerInfo.payType = data.items['0'].payment_name

                this.view&&this.view.updateViews()
            }

        });
    }

    _getTotalPrice(items) {
        let totalPrice = 0
        items.forEach((item) => {
            totalPrice += item.total_price
        })
        return totalPrice
    }

    getParamMap() {
        let paramMap = new Map();
        paramMap.set('__cmd','store.whole.medicine.getTopVisitMedicine');
        paramMap.set('limit', 6);
        this.model.listModel.paramMap = paramMap
    }

    render() {
        return this.view
    }

    buttonClick(value) {
        let orderNo = ''
        let isBatchOrder = false   //是否是合并支付
        if (isArray(this.model.headerInfo.orderNo)) {
            if (this.model.headerInfo.orderNo.length > 1) {
                isBatchOrder = true
            } else {
                orderNo = this.model.headerInfo.orderNo[0]
            }
        } else {
            orderNo = this.model.headerInfo.orderNo
        }
        if (value.type === 'get_order_detail' || value.type === 'get_order') {//跳转订单详情
            const { navigate } = this.props.navigation;
            if (isBatchOrder) {
                pushWDNavigation(navigate, { type: 'get_order', value: 0 })
            } else {
                pushWDNavigation(navigate, { type: 'get_order_detail', value: orderNo });
            }
        } else if (value.type === 'get_comment_detail') {//跳转评价订单页面
            let shopName = this.props.navigation.state.params.state.shopName
            let orderTotal = this.props.navigation.state.params.state.orderTotal
            let img_url = this.props.navigation.state.params.state.img_url
            const { navigate } = this.props.navigation;
            pushWDNavigation(navigate, {
                type: 'get_order_evaluation',
                value: {
                    orderNo: orderNo,
                    shopName: shopName,
                    orderTotal: orderTotal,
                    img_url: img_url,
                    gobackKey: this.props.navigation.state.key
                }
            });
        } else if (value.type === 'get_main_page') {
            super.toHome()
        } else if (value.type === 'get_my_order') {
            const { navigate } = this.props.navigation;
            pushWDNavigation(navigate, { type: 'get_order', value: 0 })
        }
    }

    toDetail(medicine) {
        let instance = YFWWDMedicineInfoModel.initWithModel(medicine)
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_goods_detail, value: instance.id, img_url: tcpImage(instance.image) })
    }

}
