/**
 * Created by admin on 2018/4/28.
 */
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    Image,
    TouchableOpacity,
    DeviceEventEmitter,
    ImageBackground
} from 'react-native'
import { getItem, setItem, removeItem } from '../../Utils/YFWStorage'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import { backGroundColor, darkNomalColor } from "../../Utils/YFWColor";
import YFWNativeManager from '../../Utils/YFWNativeManager'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import YFWMarqueeView from '../../widget/YFWMarqueeView';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import { safe, kStyleWholesale, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import { YFWImageConst } from '../Images/YFWImageConst';
import YFWTitleView from "../../PublicModule/Widge/YFWTitleView";
import { kRoute_address_manager, pushWDNavigation, kRoute_store_info, kRoute_my_invoice, kRoute_order, kRoute_my_complaint, kRoute_comment, kRoute_account_setting, kRoute_logistics, kRoute_account_qualifiiy, kRoute_my_coupon, kRoute_share } from '../YFWWDJumpRouting';

const styles = StyleSheet.create({
    spiltView: {
        width: width,
        height: 10,
        backgroundColor: backGroundColor()
    },
    orderAndTips: {
        width: width,
        backgroundColor: "white"
    },
    TextStyle: {
        color: 'black',
        fontSize: 14,
        margin: 10
    }, innerImag: {
        width: 41,
        height: 41,
        resizeMode: 'cover',
        marginTop: 10,
        alignSelf: 'center',
    }, imgScroll: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 10
    },
    TipsTextStyle: {
        color: '#333',
        fontSize: 12,
        marginTop: 10
    }
});
export default class YFWWDUsercenterOderItems extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderNumItems: [],
            userCommonlyUsedItems: [0, 0, 0, 0],
            trafficnoList: [],
            orderStatusAnother: [
                { title: '待付款', imageSource: YFWImageConst.Order_icon_dfk },
                { title: '待发货', imageSource: YFWImageConst.Order_icon_dfh },
                { title: '待收货', imageSource: YFWImageConst.Order_icon_dsh },
                { title: '待评价', imageSource: YFWImageConst.Order_icon_dpj },
                { title: '退货/款', imageSource: YFWImageConst.Order_icon_thk },
            ],
            settingItemsAnother: [
                { title: '地址管理', imageSource: YFWImageConst.Setting_icon_shdz,routeType:kRoute_address_manager },
                { title: '我的档案', imageSource: YFWImageConst.Setting_icon_wdda,routeType:kRoute_account_qualifiiy },
                { title: '我的投诉', imageSource: YFWImageConst.Setting_icon_wdts,routeType:kRoute_my_complaint },
                { title: '我的评价', imageSource: YFWImageConst.Setting_icon_wdpj,routeType:kRoute_comment },
                { title: '开票信息', imageSource: YFWImageConst.Setting_icon_kpxx, routeType: kRoute_my_invoice },
                { title: '优惠券', imageSource: YFWImageConst.Setting_icon_yhq,routeType:kRoute_my_coupon },
                { title: '邀请入驻', imageSource: YFWImageConst.Setting_icon_yqrz,routeType: kRoute_share },
                // { title: '软件设置', imageSource: YFWImageConst.Setting_icon_rjsz,routeType:kRoute_account_setting },
            ],
        }
    }
    render() {
        return <View>
            <View style={styles.orderAndTips}>
                {this.requestOrders()}
            </View>
        </View>
    }

    componentDidMount() {
        DeviceEventEmitter.addListener('WD_ORDER_ITEMS_TIPS_NUMS', (tips) => {
            this.setState({
                orderNumItems: tips
            })
        })
        DeviceEventEmitter.addListener(('WD_DRUGREMIND_RED_POINT'), (nums) => {
            if (parseInt(nums.drug_remind_count) >= 0) {
                this.state.userCommonlyUsedItems[3] = nums.drug_remind_count
            }
        })

        DeviceEventEmitter.addListener('WDLOGOUT', () => {
            this.setState({
                trafficnoList: []
            })
        })

        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._requestTrafficnoList()
                this.setState({})
            }
        );
    }


    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
        this.didFocus.remove();
    }

    renderOrderItems() {
        let orderStatus = this.state.orderStatusAnother
        return (
            <View style={[styles.imgScroll, { justifyContent: 'center', alignItems: 'center', marginTop: 0 }]}>
                {
                    orderStatus.map((info, index) => {
                        if (parseInt(this.state.orderNumItems[index]) > 0) {
                            let num = this.state.orderNumItems[index]
                            try {
                                num = parseInt(num + '') > 99 ? '99+' : num
                            } catch (e) { }
                            return (
                                <View style={{ flex: 1, alignItems: 'center' }} key={index}>
                                    <TouchableOpacity onPress={() => this._onOrderItemClick(index + 1)} activeOpacity={1}>
                                        <View style={{ width: 40 }}>
                                            <Image key={'msg'} source={info.imageSource} style={styles.innerImag} />
                                            <View style={{
                                                width: 16, height: 16, backgroundColor: "#FF6E40",
                                                borderRadius: 10, marginLeft: 25, position: 'absolute', justifyContent: 'center', alignItems: 'center', marginTop: 5
                                            }}>
                                                <Text style={{ fontSize: 9, color: '#FFF' }}>{num + ''}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: "column" }}>
                                            <Text style={[styles.TipsTextStyle, { fontWeight: 'bold', marginBottom: 15 }]}>{info.title}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )

                        } else {
                            return (
                                <View style={{ flex: 1, alignItems: 'center' }} key={index}>
                                    <TouchableOpacity onPress={() => this._onOrderItemClick(index + 1)} activeOpacity={1}>
                                        <View style={{ flexDirection: "column" }}><Image source={info.imageSource} style={styles.innerImag} /></View>
                                        <View style={{ flexDirection: "column" }}>
                                            <Text style={[styles.TipsTextStyle, { fontWeight: 'bold', marginBottom: 15 }]}>{info.title}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    })
                }
            </View>
        )

    }


    requestOrders() {
        return (
            <View style={{ flexDirection: 'column', width: width }}>
                <TouchableOpacity onPress={() => this._onOrderItemClick(0)} activeOpacity={1}>
                    <View style={{ width: width, height: 50, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                        <View style={{ marginLeft: 13 }}>
                            <YFWTitleView title={'我的订单'} hiddenBgImage={true} />
                        </View>
                        <View style={{ flex: 1 }} />
                        <Text style={{ color: '#666', fontSize: 12 }}>全部订单</Text>
                        <Image source={require('../../../img/uc_next.png')}
                            style={{ width: 7, height: 13, marginLeft: 5, marginRight: 13, resizeMode: 'contain' }} />
                    </View>
                </TouchableOpacity>
                <View style={{ width: width }} aria-orientation="vertical">

                    {
                        this.renderOrderItems()
                    }

                </View>
                {this.renderTrafficnoInfo()}
                <View style={{ height: 15, backgroundColor: '#ccc', opacity: 0.1 }} />
                {this._renderUserCommonlyUsedItems()}
            </View>)
    }

    renderTrafficnoInfo() {
        if (this.state.trafficnoList && this.state.trafficnoList.length > 0) {
            return (
                <View>
                    <Text style={{ marginLeft: 17, fontSize: 12, color: '#333', fontWeight: 'bold' }}>{'最新物流'}</Text>
                    <View style={{ marginTop: 8, marginBottom: 21, marginLeft: 13, width: width - 13 * 2, height: 84, justifyContent: 'center', backgroundColor: 'white', borderRadius: 8, shadowColor: "rgba(204, 204, 204, 0.44)", shadowOffset: { width: 1, height: 1 }, shadowRadius: 8, shadowOpacity: 1 }}>
                        <YFWMarqueeView datasArray={this.state.trafficnoList} callBack={(index) => { this._gotoTrafficnoDetail(index) }} ></YFWMarqueeView>
                    </View>
                </View>
            )
        }
        return null
    }

    _renderUserCommonlyUsedItems() {
        let icons = []
        let settingItems = this.state.settingItemsAnother
        settingItems.map((info, index) => {
            let num = safe(this.state.userCommonlyUsedItems[index])
            num = parseInt(num + '') > 99 ? '99+' : num
            icons.push(
                <View style={{ alignItems: 'center', width: width / 4, }} key={index}>
                    <TouchableOpacity onPress={() => this._onBottomTitlePressed(info)} activeOpacity={1}>
                        <View style={{ flexDirection: "column" }}>
                            <Image source={info.imageSource} style={[styles.innerImag, { width: 52, height: 52 }]} />
                            {num > 0 ? <View style={{
                                width: 16, height: 16, backgroundColor: "#FF6E40",
                                borderRadius: 10, marginLeft: 40, position: 'absolute', justifyContent: 'center', alignItems: 'center', marginTop: 5
                            }}>
                                <Text style={{ fontSize: 9, color: '#FFF' }}>{num + ''}</Text>
                            </View> : null}
                        </View>
                        <View style={{ flexDirection: "column", alignItems: 'center' }}>
                            <Text style={[styles.TipsTextStyle, { marginBottom: 15, color: '#666', fontSize: 12 }]}>{info.title}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        })
        return (
            <View style={{ width: width }} aria-orientation="vertical">
                <View style={[styles.imgScroll, { alignItems: 'flex-start', flexWrap: 'wrap' }]}>
                    {icons}
                </View>
            </View>
        )
    }

    _requestTrafficnoList() {
        let userInfo = YFWUserInfoManager.ShareInstance();
        if (!userInfo.hasLogin()) {
            return
        }
        let paramMap = new Map()
        paramMap.set('__cmd', 'store.whole.order.getTrafficnoList')
        let request = new YFWRequestViewModel()
        request.TCPRequest(paramMap, (res) => {
            this.setState({
                trafficnoList: res.result
            })
        }, (error) => {
            console.log('error')
        })
    }

    _gotoTrafficnoDetail(index) {
        let info = this.state.trafficnoList[index]
        if (info) {
            let { navigate } = this.props.navigation;
            pushWDNavigation(navigate, { type: kRoute_logistics, orderNo: info.orderno, img_url: info.imageurl });
        }
    }

    _onOrderItemClick(index) {
        switch (index) {
            case 0:
                YFWNativeManager.mobClick('account-allorder');
                break;
            case 1:
                YFWNativeManager.mobClick('account-order-pay');
                break;
            case 2:
                YFWNativeManager.mobClick('account-order-delivered');
                break
            case 3:
                YFWNativeManager.mobClick('account-order-received');
                break
            case 4:
                YFWNativeManager.mobClick('account-order-evaluated');
                break
            case 5:
                YFWNativeManager.mobClick('account-order-refunds');
                break
        }
        let { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_order, value: index });
    }

    _onBottomTitlePressed(info) {
        if (info.routeType == kRoute_share) {
            
            let param = {
                page : 'usercenter',
                type : 'poster',
                title : this.inviteParams?.title || '',
                content : this.inviteParams?.content || '',
                image : this.inviteParams?.image || '',
                from : 'UserCenter',
                url: '',
                isShowHead: false
            };

            DeviceEventEmitter.emit('WDOpenShareView',param);
        } else {
            
            const { navigate } = this.props.navigation;
            pushWDNavigation(navigate,{type:info.routeType,father:'usercenter'})
        }
    }
}

