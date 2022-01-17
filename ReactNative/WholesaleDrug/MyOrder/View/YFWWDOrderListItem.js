import React from 'react'
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    Platform,
    Dimensions
} from 'react-native'
import {
    isNotEmpty,
    isEmpty,
    adaptSize,
    isAndroid
} from '../../../PublicModule/Util/YFWPublicFunction'
import YFWWDSendInfoTips from './YFWWDSendInfoTips'
import {toDecimal} from "../../../Utils/ConvertUtils";
import YFWDiscountText from "../../../PublicModule/Widge/YFWDiscountText"
import YFWMoneyLabel from "../../../widget/YFWMoneyLabel"
import OrderRxPayInfoAlert from '../../../PublicModule/Widge/OrderRxPayInfoAlert';
import YFWWDOrderBottomTips from "./YFWWDOrderBottomTips";
import YFWWDOrderPageFlatlistItem from "./YFWWDOrderPageFlatlistItem";
import {YFWImageConst} from "../../Images/YFWImageConst";
import {kRoute_order_detail, kRoute_shop_detail, pushWDNavigation} from "../../YFWWDJumpRouting";
import YFWWDCheckButtonView from '../../Widget/YFWWDCheckButtonView';

const width = Dimensions.get('window').width;
export default class YFWWDOrderListItem extends React.Component {
    constructor(props) {
        super(props)
    }

    _clickItem(item) {
        const {navigate} = this.props.navigation;
        pushWDNavigation(navigate, {
            type: kRoute_order_detail,
            value: item.item.order_no,
            pageSource: this.props.pageSource,
            position: item.index,
        })
    }

    _jumpToShopDetail(id) {
        const {navigate} = this.props.navigation;
        pushWDNavigation(navigate, {type: kRoute_shop_detail, value: id})
    }

    _renderShopMessage(item) {
        let isShowSelect = this.props.pageSource==1&&item.item.status_name=='暂未付款'
        let parentWith = isShowSelect?width - 80:width - 40;
        let status_name = item.item.status_name;
        let shop_title = item.item.shop_title;
        let tWith;
        let resultLength = shop_title.length * 15;
        if (resultLength > parentWith - status_name.length * 15 - 35) {
            tWith = parentWith - status_name.length * 15 - 15 - 20 - (isAndroid()?5:0)
        } else {
            tWith = resultLength + 3 + (isAndroid()?0:2);
        }
        let statusColor = (item.item.status_name=='交易取消'||item.item.status_name=='交易失败'||item.item.status_name=='失效')?'#999999':'#547cff'
        return (
            <View style={{flexDirection:'row',alignItems:'center',width:parentWith,justifyContent:'space-between'}}>
                <Text style={{fontSize:15,color:'#333333',marginLeft:6,alignSelf:'center',width:tWith,fontWeight:'500'}} numberOfLines={1}>
                    {item.item.shop_title}
                </Text>
                <Text
                    style={{color:statusColor,fontSize:15,marginRight:0,textAlign:'right',alignSelf:'center'}}
                    numberOfLines={1}>
                    {item.item.status_name}
                </Text>
            </View>
        )
    }

    _renderBottom(item) {
        if (isEmpty(item.item.button_items) || item.item.button_items.length === 0) {
            return (<View/>)
        }
        return (
            <View style={{height:40,justifyContent:'center',marginBottom:6,marginTop:8}}>
                <YFWWDOrderBottomTips
                    page={this.page}
                    data={item.item}
                    navigation={this.props.navigation}
                    pageSource={this.props.pageSource}
                    positionIndex={item.index}
                    _showPayDialog={()=>{this.props._showPayDialog(item.item.order_no)}}
                    _showTipsDialog={this.props._showTipsDialog}
                    _showReturnDialog={this.props._showReturnDialog}
                    refresh={(index)=>{this.props._refreshItemStatus(index)}}/>
            </View>
        )
    }

    render() {
        let item = this.props.itemData;
        if (!isEmpty(item) && !isEmpty(item.item)) {
            let isShowSelect = this.props.pageSource==1&&item.item.status_name=='暂未付款'
            return (
                <View>
                    <TouchableOpacity activeOpacity={1} onPress={()=>this._jumpToShopDetail(item.item.shop_id)}>
                        <View
                            style={{flexDirection:'row',alignItems:'center',width:width,paddingLeft:13,paddingBottom:13,paddingTop:18,paddingRight:15}}>
                            <View style={{flexDirection:'row',width:width,alignItems:'center'}}>
                                {isShowSelect?
                                    <View style={{ marginRight:10,width:30,height:30}}>
                                        <YFWWDCheckButtonView style={{flex:1}} select={item.item.isSelect} selectFn={()=>{
                                        item.item.isSelect = !item.item.isSelect
                                        this.setState({})
                                        if(this.props._refreshSelectState){
                                            this.props._refreshSelectState()
                                        }}}/>
                                    </View>:null}
                                <Image style={{width:14,height:14,resizeMode:'contain',alignSelf:'center'}}
                                       source={ YFWImageConst.Icon_store}/>
                                {this._renderShopMessage(item)}
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={this._clickItem.bind(this,item)}>
                        <YFWWDOrderPageFlatlistItem
                            orderData = {item}
                            _refreshItemStatus={(index)=>{this.props._refreshItemStatus(index)}}
                            medicineData={item.item.goods_items}
                            navigation = {this.props.navigation}
                            pageSource = {this.props.pageSource} />
                        <View style={{flexDirection:'row',marginTop:6,marginBottom:5,justifyContent:'flex-end',marginRight:13,alignItems:'center'}}>
                            <View style={{flex:1}}/>
                            {isEmpty(item.item.goods_kinds_count)?null:<Text style={{color:'#333333',fontSize:15}}>{"商品: " + item.item.goods_kinds_count +'  '}</Text>}
                            {isEmpty(item.item.goods_count)?null:<Text style={{color:'#333333',fontSize:15}}>{"数量: " + item.item.goods_count +'  '}</Text>}
                            <Text style={{color:'#333333',fontSize:15}}>{"总价: "}</Text>
                             <YFWDiscountText navigation={this.props.navigation} style_view={{}} style_text={{fontSize:18,fontWeight: '500'}} value={'¥'+toDecimal(item.item.order_total)} discount={item.discount}/>
                        </View>
                        <YFWWDSendInfoTips sendInfoData={item.item.send_info} orderNum={item.item.goods_count}
                                      position={item.index}
                                      orderNo={item.item.order_no}
                                      from = {'list'}
                                      refreshItemSendInfo={(position)=>this.props.refreshItemSendInfo(position)}/>
                        {this._renderBottom(item)}
                    </TouchableOpacity>
                </View>
            )
        } else {
            return (<View/>)
        }
    }
}