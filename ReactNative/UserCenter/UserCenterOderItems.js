/**
 * Created by admin on 2018/4/28.
 */
import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    Image,
    TouchableOpacity,
    DeviceEventEmitter,
    ImageBackground
}from 'react-native'
import {getItem, setItem, removeItem} from '../Utils/YFWStorage'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import {pushNavigation} from '../Utils/YFWJumpRouting'
import {backGroundColor,darkNomalColor} from "../Utils/YFWColor";
import YFWNativeManager from '../Utils/YFWNativeManager'
import YFWTitleView from '../PublicModule/Widge/YFWTitleView';
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWMarqueeView from '../widget/YFWMarqueeView';
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
import { safe, isEmpty, isNotEmpty } from '../PublicModule/Util/YFWPublicFunction';
import { getAuthUrl } from '../Utils/YFWInitializeRequestFunction';

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
        alignSelf: 'center'
    }, imgScroll: {
        width: '100%',
        flexDirection: 'row',
        marginTop:10
    },
    TipsTextStyle: {
        color: '#333',
        fontSize: 12,
        marginTop: 10
    }
});
export default class UsercenterOderItems extends Component {
    constructor(props) {
        super(props);
        this.isShowDrugRemind = YFWUserInfoManager.ShareInstance().getSystemConfig().drug_remind_show;
        this.state = {
            titles: ['待付款', '待发货', '待收货', '待评价', '退货/款'],
            pics: [require('../../img/uc_icon0.png'), require('../../img/uc_icon1.png'), require('../../img/uc_icon2.png'), require('../../img/uc_icon3.png'), require('../../img/uc_icon4.png')],
            tips2: ['收货地址', '我的评价', '我的投诉', '用药提醒', '我的处方', '用药人','我的保单'],
            pic2: [require('../../img/user_icon_shdz.png'), require('../../img/user_icon_wdpj.png'), require('../../img/user_icon_wdts.png'), require('../../img/user_icon_yytx.png'), require('../../img/dzcf_icon_3X.png'), require('../../img/user_icon_yyr.png'), require('../../img/user_icon_wdbd.png')],orderNumItems: [],
            userCommonlyUsedItems:[0,0,0,0],
            trafficnoList:[],
            showMyPrescription:YFWUserInfoManager.ShareInstance().getSystemConfig().electronic_prescription_show,
            hiddenMyInsurance: YFWUserInfoManager.ShareInstance().getSystemConfig().my_insurance_hidden,
        }
        this.myInsuranceUrl = ''
    }

    render() {
        return <View>
            <View style={styles.orderAndTips}>
                {this.requestOrders()}
            </View>
        </View>
    }

    componentDidMount() {
        DeviceEventEmitter.addListener('ORDER_ITEMS_TIPS_NUMS', (tips)=> {
            this.setState({
                orderNumItems: tips
            })
        })
        DeviceEventEmitter.addListener(('DRUGREMIND_RED_POINT'), (nums)=> {
            if (parseInt(nums.drug_remind_count) >= 0) {
                this.state.userCommonlyUsedItems[3] = nums.drug_remind_count
            }
        })

        DeviceEventEmitter.addListener('LOGOUT',()=>{
            this.setState({
                trafficnoList:[]
            })
        })
        this.configChangeListener = DeviceEventEmitter.addListener('kSystemConfigChangeNotification',(info)=>{
            this._dealSystemConfig()
        })

        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._requestTrafficnoList()
                this._requestMyInsuranceUrl()
                this._dealSystemConfig()
            }
        );
    }


    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
        this.didFocus && this.didFocus.remove();
        this.configChangeListener && this.configChangeListener.remove()
    }

    renderOrderItems() {
        return (
            <View style={[styles.imgScroll,{justifyContent:'center',alignItems:'center',marginTop:0}]}>
                {
                    this.state.pics.map((url, index)=> {
                        if (parseInt(this.state.orderNumItems[index]) > 0) {
                            let num = this.state.orderNumItems[index]
                            try {
                                num = parseInt(num+'') > 99? '99+':num
                            }catch (e) {}
                            return (
                                <View style={{flex:1,alignItems:'center'}} key={index}>
                                    <TouchableOpacity onPress={()=>this._onOrderItemClick(index+1)} activeOpacity={1}>
                                        <View style={{width:40}}>
                                            <Image key={'msg'} source={url} style={styles.innerImag}/>
                                            <View style={{width:16,height:16,backgroundColor:"#FF6E40",
                                                borderRadius:10,marginLeft:25,position: 'absolute',justifyContent:'center',alignItems:'center',marginTop:5}}>
                                                <Text style={{fontSize:9,color:'#FFF'}}>{num+''}</Text>
                                            </View>
                                        </View>
                                        <View style={{flexDirection:"column"}}>
                                            <Text style={[styles.TipsTextStyle,{fontWeight:'bold',marginBottom:15}]}>{this.state.titles[index]}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )

                        } else {
                            return (
                                <View style={{flex:1,alignItems:'center'}} key={index}>
                                    <TouchableOpacity onPress={()=>this._onOrderItemClick(index+1)} activeOpacity={1}>
                                        <View style={{flexDirection:"column"}}><Image source={url} style={styles.innerImag}/></View>
                                        <View style={{flexDirection:"column"}}>
                                            <Text style={[styles.TipsTextStyle,{fontWeight:'bold',marginBottom:15}]}>{this.state.titles[index]}</Text>
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
        return <View style={{flexDirection:'column',width:width}}>
            <TouchableOpacity onPress={()=>this._onOrderItemClick(0)} activeOpacity={1}>
                <View style={{width:width,height:50,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                    <View style={{marginLeft:20}}>
                        <YFWTitleView accessibilityLabel='my_order' title={'我的订单'} />
                    </View>
                    <View style={{flex:1}}/>
                    <Text style={{color:'#666',fontSize:12}}>全部订单</Text>
                    <Image source={ require('../../img/uc_next.png')}
                           style={{width:7,height:13,marginLeft:5,marginRight:13,resizeMode:'contain'}}/>
                </View>
            </TouchableOpacity>
            <View style={{width:width}} aria-orientation="vertical">

                {
                    this.renderOrderItems()
                }

            </View>
            {this.renderTrafficnoInfo()}
            <View style={{height:15,backgroundColor:'#ccc',opacity:0.1}}/>
            {this._renderUserCommonlyUsedItems()}
        </View>
    }

    renderTrafficnoInfo(){
        if (this.state.trafficnoList&&this.state.trafficnoList.length>0) {
            return (
                <View>
                    <Text style={{marginLeft:17,fontSize:12,color:'#333',fontWeight:'bold'}}>{'最新物流'}</Text>
                    <View style={{marginTop:8,marginBottom:21,marginLeft:13,width:width-13*2,height:84,justifyContent:'center',backgroundColor:'white',borderRadius:8,shadowColor: "rgba(204, 204, 204, 0.44)",shadowOffset: {width: 1,height: 1},shadowRadius: 8,shadowOpacity: 1}}>
                        <YFWMarqueeView datasArray={this.state.trafficnoList} callBack={(index)=>{this._gotoTrafficnoDetail(index)}} ></YFWMarqueeView>
                    </View>
                </View>
            )
        }
        return null
    }

    _renderUserCommonlyUsedItems(){
        let icons = []
        this.state.pic2.map((url, index)=> {
            if ((index==3 && !this.isShowDrugRemind) || (index == 4 && !this.state.showMyPrescription) || (index == 6 && this.state.hiddenMyInsurance)) {
                return null
            }
            let num = safe(this.state.userCommonlyUsedItems[index])
            num = parseInt(num+'') > 99? '99+':num
            icons.push(
                <View style={{alignItems:'center', width:width/4,}} key={index}>
                    <TouchableOpacity onPress={() => this._onBottomTitlePressed(index)} activeOpacity={1}>
                        <View style={{flexDirection:"column"}}>
                            <Image source={url} style={[styles.innerImag,{width:52,height:52}]}/>
                            {num>0?<View style={{width:16,height:16,backgroundColor:"#FF6E40",
                                borderRadius:10,marginLeft:40,position: 'absolute',justifyContent:'center',alignItems:'center',marginTop:5}}>
                                <Text style={{fontSize:9,color:'#FFF'}}>{num+''}</Text>
                            </View>:null}
                        </View>
                        <View style={{flexDirection:"column", alignItems:'center'}}>
                            <Text style={[styles.TipsTextStyle,{marginBottom:15,color:'#666',fontSize:12}]}>{this.state.tips2[index]}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        })
        return (
            <View style={{width:width}} aria-orientation="vertical">
                <View style={[styles.imgScroll,{alignItems:'flex-start', flexWrap:'wrap'}]}>
                    {icons}
                </View>
            </View>
        )
    }

    _requestTrafficnoList(){
        let userInfo = YFWUserInfoManager.ShareInstance();
        if (!userInfo.hasLogin()) {
            return
        }
        let paramMap = new Map()
        paramMap.set('__cmd','person.order.getTrafficnoList')
        let request = new YFWRequestViewModel()
        request.TCPRequest(paramMap,(res)=>{
            this.setState({
                trafficnoList:res.result
            })
        },(error)=>{
            console.log('error')
        })
    }

    _requestMyInsuranceUrl(isJump){
        let userInfo = YFWUserInfoManager.ShareInstance();
        if (!userInfo.hasLogin() || isNotEmpty(this.myInsuranceUrl)) {
            return
        }
        let paramMap = new Map()
        paramMap.set('__cmd','person.account.getMyInsuranceUrl')
        let request = new YFWRequestViewModel()
        request.TCPRequest(paramMap,(res)=>{
            this.myInsuranceUrl = res.result
            if (isJump) {
                this._gotoMyInsurance()
            }
        },(error)=>{
            console.log('error')
        })
    }

    _dealSystemConfig() {
        this.isShowDrugRemind = YFWUserInfoManager.ShareInstance().getSystemConfig().drug_remind_show;
        this.setState({
            showMyPrescription: YFWUserInfoManager.ShareInstance().getSystemConfig().electronic_prescription_show,
            hiddenMyInsurance: YFWUserInfoManager.ShareInstance().getSystemConfig().my_insurance_hidden,
        })
    }

    _gotoMyInsurance() {
        const {navigate} = this.props.navigation;
        getAuthUrl(navigate,{ type: 'get_h5',value: this.myInsuranceUrl,isHiddenShare:true,forceBackEnable:true })
    }

    _gotoTrafficnoDetail(index) {
        let info = this.state.trafficnoList[index]
        if (info) {
            let {navigate} =  this.props.navigation;
            pushNavigation(navigate, {type: 'get_logistics',orderNo:info.orderno,img_url:info.imageurl});
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
        let {navigate} =  this.props.navigation;
        pushNavigation(navigate, {type: 'get_order',value:index});
    }

    _onBottomTitlePressed(index) {
        const {navigate} = this.props.navigation;
        switch (index) {
            case 0:
                YFWNativeManager.mobClick('account-address');
                pushNavigation(navigate, {type: 'address_manager'});
                break;
            case 1:
                YFWNativeManager.mobClick('');
                pushNavigation(navigate, {type: 'get_comment'});
                break;
            case 2:
                YFWNativeManager.mobClick('account-my complaint');
                pushNavigation(navigate, {type: 'get_complain'});
                break;
            case 3:
                YFWNativeManager.mobClick('account-drug reminding');
                pushNavigation(navigate,{type:'drug_reminding'})
                break;
            case 4:
                YFWNativeManager.mobClick('');
                pushNavigation(navigate, { type: 'my_prescription' })
                break;
            case 5:
                YFWNativeManager.mobClick('');
                pushNavigation(navigate, { type: 'patient_info' })
                break;
            case 6:
                YFWNativeManager.mobClick('');
                if (isEmpty(this.myInsuranceUrl)) {
                    this._requestMyInsuranceUrl(true)
                } else {
                    this._gotoMyInsurance()
                }
                break;

        }
    }
}

