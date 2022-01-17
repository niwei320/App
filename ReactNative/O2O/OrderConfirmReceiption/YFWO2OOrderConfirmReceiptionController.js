import React, { Component } from 'react';
import { YFWO2OOrderConfirmReceiptionViewModel } from './YFWO2OOrderConfirmReceiptionViewModel';
import { YFWO2OOrderConfirmReceiptionModel } from './YFWO2OOrderConfirmReceiptionModel'
import { darkStatusBar } from '../../PublicModule/Util/YFWPublicFunction';
import { isNotEmpty, isEmpty, safeObj } from '../../PublicModule/Util/YFWPublicFunction';
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import { View,DeviceEventEmitter } from 'react-native';
import { YFWO2OOrderConfirmReceiptionAPI } from './YFWO2OOrderConfirmReceiptionAPI'
import YFWToast from '../../Utils/YFWToast';
export default class YFWO2OOrderConfirmReceiptionController extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        title: '确认收货',
        headerRight: <View width={50} />,
    });

    constructor(props) {
        super(props);
        this.state = {
            shopPhoneNumber: '',
            orderNo: this.props.navigation.state.params.state.orderNo || '1',
            pageSource:this.props.navigation.state.params.state.pageSource || '',
            gobackKey:this.props.navigation.state.key || '',
            dataSource: []
        }
    }
    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        darkStatusBar();
        this._fetchOrderDetails(this.state.orderNo)
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
    }
    //-----------------------------------------------METHOD---------------------------------------------
    _fetchOrderReceive(orderNo) {
        YFWO2OOrderConfirmReceiptionAPI.orderReceive(orderNo).then((res) => {
            YFWToast('确认收货成功')
            this._goBack()
            DeviceEventEmitter.emit('order_status_refresh',this.state.pageSource)
        }, (err) => {
        })
    }
    _fetchOrderDetails(orderNo) {
        YFWO2OOrderConfirmReceiptionAPI.orderDetails(orderNo).then((res) => {
            let data = YFWO2OOrderConfirmReceiptionModel.setModelData(res.result)
            this.setState({
                dataSource: data.medicineItems,
                shopPhoneNumber: data.storePhone
            })
        }, (err) => {
        })
    }
    _dealNavigation(data) {
        if (isEmpty(data)) {
            return
        }
        let { navigate } = this.props.navigation;
        pushNavigation(navigate, { ...safeObj(data) })
    }
    _goBack() {
        let { goBack } = this.props.navigation;
        goBack();
    }
    //-----------------------------------------------RENDER---------------------------------------------
    render() {
        return new YFWO2OOrderConfirmReceiptionViewModel(this)
    }
}
