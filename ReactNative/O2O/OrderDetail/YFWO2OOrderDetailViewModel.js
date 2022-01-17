import React from 'react';
import YFWO2OOrderDetailView from "./YFWO2OOrderDetailView";
import {isNotEmpty, safe, safeArray, safeNumber} from "../../PublicModule/Util/YFWPublicFunction";

export function YFWO2OOrderDetailViewModel(controller) {
    let {state} = controller
    let vm = {}
    let {statusList, dataSource} = state
    let {
        statusName,
        actionData,
        is_show_map,
        shippingMethod,
        reminderMsg,
        rxData,
        buttonData,
        deliveryData,
        orderInfoData,
        goodsInfoData
    } = dataSource
    vm.reminderMsg = reminderMsg
    vm.orderNo = dataSource.orderNo
    vm.isNeedMap = is_show_map == 1
    vm.statusName = statusName
    vm.isDeliveryOrder = safe(shippingMethod).search("配送") !== -1

    if(isNotEmpty(actionData)){

        let buttonsData = []
        let hasMore = false
        safeArray(actionData?.buttonsData).map((item,index)=>{
            if(item.value === 'order_complaint'){//隐藏投诉按钮
                hasMore = true
            } else {
                buttonsData.push({
                    image:item?.image?{uri:(safe(item.image))}:'',
                    text:item.text,
                    value:item.value,
                    color:item.color,
                })
            }
        })
        if(hasMore){
            buttonsData.push({
                image:require('../../../img/icon_sandian_gray.png'),
                text:'更多',
                value:'showMoreButton',
            })
        }
        vm.actionData = {
            statusText:actionData.dict_order_status_name_title,
            statusReason:actionData.dict_order_status_name_reason,
            buttonsData:buttonsData
        }
    }

    if(isNotEmpty(goodsInfoData)){
        vm.buttonData = buttonData
        let goodsData = []
        safeArray(goodsInfoData?.goodsArray).map((item)=>{
            goodsData.push({
                id:safe(item.store_medicineid),
                image:safe(item.intro_image),
                icon:safe(item.dict_medicine_type)==='0'?require('../Image/OTCicon.png')
                    :(item.dict_medicine_type==='1'||item.dict_medicine_type==='2'||item.dict_medicine_type==='3'?
                        require('../Image/ic_drug_track_label.png'):''),
                name:safe(item.medicine_name),
                standard:safe(item.standard),
                price:item.unit_price,
                quantity:safe(item.qty),
            })
        })
        let infoData = []
        infoData.push({title:'包装费', price:goodsInfoData.packaging_total})
        if(vm.isDeliveryOrder){
            infoData.push({title:'配送费', price:goodsInfoData.shipping_total})
        }
        goodsInfoData.use_coupon_price !== 0 && infoData.push({title:'商家优惠券', price:-goodsInfoData.use_coupon_price})
        goodsInfoData.plat_coupon_price !== 0 && infoData.push({title:'商城优惠券', price:-goodsInfoData.plat_coupon_price})
        goodsInfoData.use_point !== 0 && infoData.push({title:'积分抵用', price:-goodsInfoData.use_point})
        goodsInfoData.update_price !== 0 && infoData.push({title:'商品优惠', price:goodsInfoData.update_price})
        infoData.push({title:'发票', invoiceData:{
                title:goodsInfoData.invoice_showname,hasInvoice:isNotEmpty(goodsInfoData.invoice_title),invoice_info:goodsInfoData.invoice_info
            }})
        vm.goodsInfoData = {
            shopName:goodsInfoData.title,
            shopID:goodsInfoData.storeid,
            discount:(goodsInfoData.packaging_total + goodsInfoData.shipping_total + goodsInfoData.medicine_total - goodsInfoData.total_price),
            pay:goodsInfoData.total_price,
            goodsData:goodsData,
            infoData:infoData,
        }
        vm.deliveryData = deliveryData
        vm.orderInfoData = orderInfoData
    }

    if(isNotEmpty(rxData)){
        vm.rxData = {
            title:rxData.title,
            isFail:rxData.inquiry_status == 99
        }
    }

    if(isNotEmpty(deliveryData)){
        vm.deliveryData = {
            expectedTime : deliveryData.expected_delivery,
            deliveryType : deliveryData.shipping_method,
            address : deliveryData.shopping_address,
            name : deliveryData.shopping_name,
            phone : deliveryData.shopping_mobile,
        }
    }

    if(isNotEmpty(orderInfoData)){
        vm.orderInfoData = {
            orderId:orderInfoData.orderno,
            time:orderInfoData.create_time,
            payType:orderInfoData.payment_type,
            remark:orderInfoData.shopping_remark,
        }
    }

    if(isNotEmpty(statusList)){
        vm.statusList = []
        safeArray(statusList).map((item, index)=>{
            vm.statusList.push({
                statusText:safe(item.status_name),
                create_time:safe(item.finish_time),
                statusMsg:safe(item.status_name_text),
            })
        })
    }

    if(isNotEmpty(dataSource)){
        let buttonsData = []
        let isShowOrderBuyAgain = false
        safeArray(dataSource.buttonsData).map((item,index)=>{
            if(item.value === 'order_buy_again'){
                isShowOrderBuyAgain = true
            } else {
                buttonsData.push({
                    text:item.text,
                    value:item.value,
                    isPayButton:item.value==='order_pay'
                })
            }
        })
        vm.selfFetchInfoData = {
            statusTitle : dataSource.dict_order_status_name_title,
            waitPayTime : dataSource.waitPayTime,
            statusReason : dataSource.dict_order_status_name_reason,
            shopName:dataSource.shop_title,
            fetchCode:dataSource.selflift_code,
            fetchTime:dataSource.selflift_datetime,
            businessHours:dataSource.o2o_business_hours,
            shopAddress:dataSource.store_address,
            phone:dataSource.shopping_mobile,
            buttonsData:buttonsData,
            isShowMedicineSaff:safe(shippingMethod).search("配送") !== -1?false:dataSource.is_show_medicine_saff == 1,
            isShowOrderBuyAgain:isShowOrderBuyAgain,
        }
    }

    //地图标点数据
    if(isNotEmpty(dataSource) && safeArray(statusList).length > 0 && is_show_map == 1){
        let statusListLastItem = statusList[statusList.length - 1]
        let type = statusListLastItem?.status_type
        let mapDataArray=[]
        let showLine = false
        if(isNotEmpty(type)){
            let title = statusListLastItem?.status_name
            let msg = dataSource.waitPayTime_text
            let second = dataSource.waitPayTime
            let userPoint = {
                lat:dataSource.shipping_address_lat,
                lng:dataSource.shipping_address_lng,
                image:'',
            }
            let storePoint = {
                lat:dataSource.store_lat,
                lng:dataSource.store_lng,
                image: "https:" + dataSource.storelogourl,
            }
            switch (type) {
                case 'wait_pay':
                    userPoint.title = title
                    userPoint.msg = msg
                    userPoint.second = second
                    isNotEmpty(userPoint.lat) && isNotEmpty(userPoint.lng) && mapDataArray.push(userPoint)
                    isNotEmpty(storePoint.lat) && isNotEmpty(storePoint.lng) && mapDataArray.push(storePoint)
                    showLine = false
                    break
                case 'wait_shop_receive':
                case 'wait_hospital_kaifang':
                case 'wait_shop_audit':
                    storePoint.title = title
                    storePoint.msg = msg
                    storePoint.second = second
                    isNotEmpty(userPoint.lat) && isNotEmpty(userPoint.lng) && mapDataArray.push(userPoint)
                    isNotEmpty(storePoint.lat) && isNotEmpty(storePoint.lng) && mapDataArray.push(storePoint)
                    showLine = false
                    break
                case 'wait_buyer_confirm_goods':
                    storePoint.title = '商家自配送'
                    isNotEmpty(userPoint.lat) && isNotEmpty(userPoint.lng) && mapDataArray.push(userPoint)
                    isNotEmpty(storePoint.lat) && isNotEmpty(storePoint.lng) && mapDataArray.push(storePoint)
                    showLine = true
                    break
                default:
            }
        }
        vm.mapData = {
            dataArray:mapDataArray,
            showLine:showLine
        }
    }

    vm.navigation = controller.props.navigation

    vm._pageBack = () => {
        controller._pageBack && controller._pageBack()
    }

    vm._fetchData = () => {
        controller._fetchData && controller._fetchData()
    }

    vm._makePhoneCall = () => {
        controller._makePhoneCall && controller._makePhoneCall()
    }

    vm._gotoStoreDetail = () => {
        controller._gotoStoreDetail && controller._gotoStoreDetail()
    }

    vm._gotoInvoiceDetail = (data) => {
        controller._gotoInvoiceDetail && controller._gotoInvoiceDetail(data)
    }

    vm._gotoRxDetail = () => {
        controller._gotoRxDetail && controller._gotoRxDetail()
    }

    vm._onClicked = (type)=> {
        controller._onClicked && controller._onClicked(type)
    }

    return <YFWO2OOrderDetailView viewModel = {vm} />
}
