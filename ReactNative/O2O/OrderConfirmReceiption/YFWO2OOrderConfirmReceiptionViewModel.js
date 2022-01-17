import React, { Component } from 'react';
import YFWO2OOrderConfirmReceiptionView from './YFWO2OOrderConfirmReceiptionView'
export function YFWO2OOrderConfirmReceiptionViewModel(controller) {
    let { state } = controller;
    let vm = {};
    vm.dataSource = state.dataSource
    vm.orderNo = state.orderNo
    vm.pageSource = state.pageSource
    vm.gobackKey = state.gobackKey
    vm._dealNavigation = (data) => {
        controller._dealNavigation && controller._dealNavigation(data)
    }
    vm.goBack = () => {
        controller._goBack && controller._goBack();
    }
    vm._fetchOrderReceive = (orderNo) => {
        controller._fetchOrderReceive && controller._fetchOrderReceive(orderNo)
    }
    vm.announcement = {
        orangeTitle: '为保证购药安全，请确认所收商品相关信息，包括：',
        orangeIcon: require('../Image/announce.png'),
        content: '1 . 查看商品外包装，确认是否有人为刮损、涂改；\n2 . 查看商品【生产日期、有效期至】，确认是否已过期；\n3 . 查看商品【规格、数量、批准文号】，确认是否一致；\n4 . 查看商品，确认是否破损；\n5 . 核对商家发货时所填[产品批号]是否与所收商品【产品批号】一致。',
        greenContent: '查看【产品批号】示例图',
        exampleChart: require('../Image/exampleChart.png')
    }
    vm.productNumberTitle = {
        titleHeader: '商家发货时所填',
        titleTail: '如下：',
        blueTitle: '【产品批号】',
    }
    vm.contactShop = {
        icon: require('../Image/phone_blue.png'),
        text: '电话\n商家',
    }
    vm.button = {
        acceptance: '验收通过',
        failureAcceptance: '验收不通过',
    }
    vm.deleteIcon = require('../Image/delete_icon.png')
    vm.shopPhoneNumber = state.shopPhoneNumber
    return <YFWO2OOrderConfirmReceiptionView viewModel={vm} />
}
export default YFWO2OOrderConfirmReceiptionViewModel;
