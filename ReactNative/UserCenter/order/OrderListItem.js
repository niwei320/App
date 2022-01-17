import React from 'react'
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    Platform,
    Dimensions
} from 'react-native'
import {isNotEmpty, isEmpty, adaptSize} from '../../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import SendInfoTips from './SendInfoTips'
import OrderBottomTips from './../OrderBottomTips'
import OderPageFlatlistItem from './../OderPageFlatlistItem'
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWDiscountText from "../../PublicModule/Widge/YFWDiscountText"
import YFWMoneyLabel from "../../widget/YFWMoneyLabel"
import OrderRxPayInfoAlert from '../../PublicModule/Widge/OrderRxPayInfoAlert';
import YFWCheckButtonView from '../../PublicModule/Widge/YFWCheckButtonView';
import LinearGradient from 'react-native-linear-gradient'

const width = Dimensions.get('window').width;
export default class OrderListItem extends React.Component {
    constructor(props) {
        super(props)
        this.isShowRxHeader = false
        this.isERPOrder = isEmpty(this.props.isERPOrder)?false:this.props.isERPOrder
    }


    renderShopMessage(item) {
        const OTOOrder = item.item.dict_order_sub_type === '2'
        let isShowSelect = this.props.pageSource==1&&item.item.status_name=='暂未付款'?true:false
        let parentWith = isShowSelect?width - 40 - 40:width - 40;
        let status_name = item.item.status_name;
        let shop_title = item.item.shop_title;
        let tWith;
        let resultLength = shop_title.length * 15;
        if (resultLength > parentWith - status_name.length * 15 - 15 - 20) {
            if (Platform.OS == 'android') {
                tWith = parentWith - status_name.length * 15 - 15 - 5 - 20
            } else {
                tWith = parentWith - status_name.length * 15 - 15 - 20
            }
        } else {
            if (Platform.OS == 'android') {
                tWith = resultLength + 3;
            } else {
                tWith = resultLength + 5;
            }
        }
        if (OTOOrder) {
            parentWith = parentWith - 30
            tWith = tWith - 30
        }
        return (<View style={{flexDirection:'row',alignItems:'center',width:parentWith,justifyContent:'space-between'}}>
            <Text style={{fontSize:15,color:'#333333',marginLeft:6,alignSelf:'center', flex: 1}}
                  numberOfLines={1}>
                {item.item.shop_title}
            </Text>
            {/* <Image style={{width:15,height:15,resizeMode:'contain',alignSelf:'center'}}
                   source={ require('../../../img/around_detail_icon.png')}/>
            <View style={{flex:1}}/> */}
            <Text
                style={{
                    fontSize:15,
                    color:(item.item.status_name=='交易取消'||item.item.status_name=='交易失败'||item.item.status_name=='失效')?'#999999':'#1fdb9b',
                    marginRight:0,
                    textAlign:'right',
                    alignSelf:'center'}}
                numberOfLines={1}>
                {item.item.status_name}
            </Text>
        </View>)
    }

    clickItem(item) {
        const {navigate} = this.props.navigation;
        const OTOOrder = item.item.dict_order_sub_type === '2'
        if (OTOOrder) {

            pushNavigation(navigate, {
                type: 'O2O_order_detail',
                orderNo: item.item.order_no,
                position: item.index,
                pageSource: this.props.pageSource,
            })
        } else {

            pushNavigation(navigate, {
                type: 'get_order_detail',
                value: item.item.order_no,
                pageSource: this.props.pageSource,
                position: item.index,
                isERPOrder: this.isERPOrder,
            })
        }
    }

    _jumpToShopDetail(item) {
        if(this.isERPOrder){
            return
        }
        const {navigate} = this.props.navigation;
        const OTOOrder = item.item.dict_order_sub_type === '2'
        if (OTOOrder) {

            pushNavigation(navigate, { type:'get_oto_store', data: { storeid: item.item.shop_id } })
        } else {

            pushNavigation(navigate, {type: 'get_shop_detail', value: item.item.shop_id})
        }
    }


    render() {
        //to-do,true根据接口字段判断，下面已审方标签
        let item = this.props.itemData;
        const OTOOrder = item.item.dict_order_sub_type === '2'
        const method_name = item.item.shipping_method.length>0 ? item.item.shipping_method : item.item.shipping_method_name
        const colors = method_name.indexOf('配送')!=-1 ? ['#65a2fa', '#3369ff'] : ['#fad265', '#ff8933']
        if (isNotEmpty(item)) {
            let isShowSelect = this.props.pageSource==1&&item.item.status_name=='暂未付款'?true:false
            return (
                <View>
                    {this.isShowRxHeader?
                    <View>
                        <View style={{width:width,paddingLeft:adaptSize(25),paddingRight:adaptSize(10),paddingBottom:adaptSize(10),backgroundColor:'white'}}>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'stretch',marginTop:adaptSize(14)}}>
                                <Text style={{color:'#333333',fontSize:15}}>互联网医院问诊服务</Text>
                                <Text style={{color:'#1fdb9b',fontSize:15}}>暂未付款</Text>
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'stretch',marginTop:adaptSize(19)}}>
                                <View style={{flexDirection: 'row',alignItems:'stretch'}}>
                                    <Text style={{color:'#333333',fontSize:15,marginTop:adaptSize(5)}}>问诊费</Text>
                                    <View style={{flexDirection: 'row',alignItems:'center',marginLeft:adaptSize(20)}}>
                                        <YFWMoneyLabel money='5.00' moneyTextStyle={{marginRight:0,fontSize:15}} decimalsTextStyle={{fontSize:13}}/>
                                    </View>
                                </View>
                                <TouchableOpacity activeOpacity={1} onPress={()=>{this.onclick()}} style={{alignItems:'center',justifyContent:'center',width:adaptSize(77),height:23,
                                    borderRadius:adaptSize(15),borderWidth:1,borderColor:'rgb(31,219,155)'}}>
                                    <Text style={{color:'rgb(31,219,155)',fontSize:12,fontWeight:'500'}}>付款</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{backgroundColor:'rgb(250,250,250)',width:width,height:adaptSize(10)}}/>
                    </View>:null}
                    <TouchableOpacity activeOpacity={1} onPress={()=>this._jumpToShopDetail(item)}>
                        <View
                            style={{flexDirection:'row',alignItems:'center',width:width,paddingLeft: OTOOrder ? 0 : 13,paddingBottom:13,paddingTop:18,paddingRight:15}}>
                            <View style={{flexDirection:'row',width:width,alignItems:'center'}}>
                                {(OTOOrder && method_name.length>0) &&<LinearGradient colors={colors} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={{width: 35, height: 30, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 3, borderBottomRightRadius: 3, marginRight: 8}}>
                                    <Text style={{fontSize: 10, color: '#fff', fontWeight: 'bold'}}>{method_name}</Text>
                                </LinearGradient>}
                                {isShowSelect?<View style={{ marginRight:10,width:30,height:30}}>
                                    <YFWCheckButtonView style={{flex:1}} select={item.item.isSelect} selectFn={()=>{
                                        item.item.isSelect = !item.item.isSelect
                                        this.setState({})
                                        if(this.props._refreshSelectState){
                                            this.props._refreshSelectState()
                                        }
                                    }}/>
                                </View>:null}
                                <Image style={{width:14,height:14,resizeMode:'contain',alignSelf:'center'}}
                                       source={ require('../../../img/shops.png')}/>
                                {this.renderShopMessage(item)}
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={{flexDirection:'row',justifyContent:'flex-end',alignItems:'center',width:width,paddingLeft:13,marginTop:-10,paddingRight:15}}>
                    <Text
                        style={{
                            fontSize:15,
                            color:(item.item.status_name=='已审方'||item.item.status_name=='未审方')?'#999999':'#1fdb9b',
                            marginRight:0,
                            textAlign:'right',
                            alignSelf:'center'}}
                        numberOfLines={1}></Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item)}>
                        <OderPageFlatlistItem _refreshItemStatus={(index)=>{
                            this.props._refreshItemStatus(index)
                            }} medicienData={item.item.goods_items} navigation = {this.props.navigation} orderData = {item} pageSource = {this.props.pageSource} from = {this.isERPOrder?'erpOrderList':''}/>
                        <View style={{flexDirection:'row',marginTop:6,marginBottom:5,justifyContent:'flex-end',marginRight:13,alignItems:'center'}}>
                            <View style={{flex:1}}/>
                            <Text style={{color:'#333333',fontSize:15}}>{"共" + item.item.goods_count + '件商品 '}</Text>
                            <Text style={{color:'#333333',fontSize:15}}>{"总价："}</Text>
                             <YFWDiscountText navigation={this.props.navigation} style_view={{}} style_text={{fontSize:18,}} value={'¥'+toDecimal(item.item.order_total)} discount={item.discount}/>
                        </View>
                        <SendInfoTips sendInfoData={item.item.send_info} orderNum={item.item.goods_count}
                                      position={item.index}
                                      orderNo={item.item.order_no}
                                      from = {'list'}
                                      refreshItemSendInfo={(position)=>this.props.refreshItemSendInfo(position)}/>
                        {this._renderBottom(item)}

                    </TouchableOpacity>
                    <OrderRxPayInfoAlert ref = {(item) => {this.rxPayInfoAlert = item}} />
                </View>
            )
        } else {
            return (<View/>)
        }
    }

    _renderBottom(item) {
        if (isEmpty(item.item.button_items)) {
            return (<View/>)
        }
        if (item.item.button_items.length == 0) {
            return (<View/>)
        }
        return (
            <View style={{height:40,justifyContent:'center',marginBottom:6,marginTop:8}}>
                <OrderBottomTips
                    page={this.page}
                    data={item.item}
                    navigation={this.props.navigation}
                    pageSource={this.props.pageSource}
                    positionIndex={item.index}
                    _showPayDialog={()=>{this.props._showPayDialog(item.item.order_no)}}
                    _showPickupCodeDialog={()=>{this.props._showPickupCodeDialog&&this.props._showPickupCodeDialog(item.item)}}
                    _showTipsDialog={this.props._showTipsDialog}
                    _showTipsAlert={this.props._showTipsAlert}
                    _showReturnDialog={this.props._showReturnDialog}
                    refreshHeader={()=>{this.showRxHeader()}}
                    refresh={(index)=>{this.props._refreshItemStatus(index)}}/>
            </View>
        )
    }

    //to-do,加弹框,付款成功调用this.props.refresh
    showRxHeader(){
        this.rxPayInfoAlert.showView()
        this.isShowRxHeader = true
        this.setState({})
    }
}
