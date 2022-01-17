import React, { Component } from 'react'
import { View, TouchableOpacity, Text, Image, StyleSheet, DeviceEventEmitter } from 'react-native'
import YFWDiscountText from '../PublicModule/Widge/YFWDiscountText'
import {darkTextColor,yfwGreenColor,darkLightColor} from '../Utils/YFWColor'
import {isNotEmpty, kScreenWidth, safe, tcpImage, mobClick, checkNotLoginIsHiddenPrice} from "../PublicModule/Util/YFWPublicFunction"
import {pushNavigation,doAfterLogin} from "../Utils/YFWJumpRouting"
import {BaseStyles} from "../Utils/YFWBaseCssStyle"
import YFWGoodsItemModel from './YFWGoodsItemModel'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWToast from '../Utils/YFWToast'
import YFWNativeManager from '../Utils/YFWNativeManager';
import {yfwOrangeColor} from '../Utils/YFWColor'
import { pushWDNavigation } from '../WholesaleDrug/YFWWDJumpRouting'

export default class YFWGoodsItem extends Component {

    constructor(props) {
        super(props)
        this.itemHeight = 0

        this.state = {
            hidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice()
        }
    }

    componentDidMount() {
        this.priceListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            this.setState({
                hidePrice: isHide
            })
        })
    }

    componentWillUnmount() {
        this.priceListener&&this.priceListener.remove()
    }

    render() {
        let model = YFWGoodsItemModel.getItemModel(this.props.model, this.props.from);
        this.model = model

        return (
            <View style={styles.container} onLayout = {(event)=>{this.itemHeight = event.nativeEvent.layout.height}}>
                <TouchableOpacity style={[BaseStyles.radiusShadow,styles.content,{width:safe(this.props.width)?this.props.width:(kScreenWidth-30)/2}]} activeOpacity={1} onPress={this._itemClick.bind(this)}>
                    <View style={{alignItems: 'center',height:135,paddingTop:8}}>
                        <Image
                            style={styles.image}
                            source={{uri:tcpImage(safe(model.goods_image))}}
                            defaultSource={require('../../img/default_img.png')}/>
                    </View>
                    <View style={[styles.nameStandardsView, styles.paddingView]}>
                        <Text style={styles.name} numberOfLines={1}>{safe(model.goods_name)}</Text>
                        <Text style={styles.standard} numberOfLines={1}>{safe(model.goods_standard)}</Text>
                    </View>
                    {this._renderPriceAndStoriesView(model)}
                </TouchableOpacity>
            </View>
        )
    }

    _renderPriceAndStoriesView(model) {
        if (this.state.hidePrice) {
            if(this.props.from == 'shop_medicine_recomand' || this.props.from == 'all_medicine_list') {
                return(
                    <Text style={{color:darkLightColor(), fontSize:13, fontWeight:'500',marginVertical:10, paddingLeft:8}}>仅做信息展示</Text>
                )
            }else {
                return(
                    <View style={{justifyContent: "space-between", marginVertical:5,height:40, paddingLeft:8}}>
                        <Text style={{color:darkLightColor(), fontSize:13, fontWeight:'500',marginTop:5}}>仅做信息展示</Text>
                        <Text style={{color:darkLightColor(), fontSize:12, marginRight:13}}>实体店购买</Text>
                    </View>
                )
            }
        }else if(model.isShowCart) {
            let isLogin = YFWUserInfoManager.ShareInstance().hasLogin()
            return(
                <View style={[styles.priceStroiesView, styles.paddingView, {paddingBottom:7, flexDirection:'row', alignItems:'center'}]}>
                    {this._renderPriceView(model)}
                    {isLogin?<TouchableOpacity hitSlop={{left:5,top:10,bottom:5,right:8}} activeOpacity={1} style={{width:30, height:30, alignItems:'flex-end', justifyContent:'center'}}
                        onPress={this._addGoodsToshopCar.bind(this)}>
                        <Image source={require('../../img/icon_addShopCar.png')} style={{width:20, height:20, resizeMode:'contain'}}/>
                    </TouchableOpacity>:null}
                </View>
            )
        }else {
            return(
                <View style={[styles.priceStroiesView, styles.paddingView, {paddingBottom:7}]}>
                    {this._renderPriceView(model)}
                    {this._renderStories(model)}
                </View>
            )
        }
    }

    _renderPriceView(model) {
        let isLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        let notLoginIsHiddenPrice = checkNotLoginIsHiddenPrice()
        return isLogin || !notLoginIsHiddenPrice?<YFWDiscountText navigation={this.props.navigation} style_view={{marginTop:7}} style_text={{fontSize:15,fontWeight:'500'}} value={model.goods_price} discount={model.goods_discount}/>:
        <TouchableOpacity activeOpacity={1} onPress={()=>this.doAfterLogin()}>
            <Text style={{fontSize: 12,color:yfwOrangeColor(),textAlign: 'left',marginTop:7}}>{"价格登录可见"}</Text>
        </TouchableOpacity>
    }

    doAfterLogin(){
        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{

        });
    }

    _renderStories(model) {
        return (
            model.isShowStories?
            <Text style={styles.stories} numberOfLines={1}>
                {safe(model.goods_stories)}
                <Text style={{color:darkLightColor()}}>个商家在售</Text>
            </Text>:null
        )
    }

    _itemClick() {

        mobClick(this.model.goods_mobclick);
        const { navigate } = this.props.navigation;
        if (this.props.from == 'wd_cart_list_recommend') {
            pushWDNavigation(navigate, this.model.navitation_params);
        } else {
            pushNavigation(navigate, this.model.navitation_params);
        }
    }

    /** 加入购物车 */
    _addGoodsToshopCar(){
        doAfterLogin(this.props.navigation.navigate,()=>{
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.cart.addCart');
            paramMap.set('quantity', 1);
            paramMap.set('storeMedicineId', this.model.goods_id);
            if (this.props.isSettlementCallback) {
                paramMap.set('type','buy')
            }
            YFWUserInfoManager.ShareInstance().addCarIds.set(this.model.goods_id+'','id')
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let info={}
                if (this.props.isSettlementCallback) {
                    //获取cartID
                    if (res.result && res.result.cartids) {
                        info.id = res.result.cartids.join(',')
                        info.storeMedicineId = this.model.goods_id
                    } else {
                        return
                    }
                } else {
                    YFWToast('商品添加成功');
                }
                this.props.addShopCarCallBack && this.props.addShopCarCallBack(safe(this.model.model.originData.old_price), info);
                this._getCartGoodsCountMethod()
            }, (error) => {
            });
        },true)
    }

    //获取购物车数量接口
    _getCartGoodsCountMethod() {
            if(!YFWUserInfoManager.ShareInstance().hasLogin()){
                return
            }
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.cart.getCartCount');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                new YFWUserInfoManager().shopCarNum = res.result.cartCount+''
                DeviceEventEmitter.emit('SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
            },(error)=>{},false);
    }

    //获取高度
    _getGoodsItemHeight(){
        return this.itemHeight
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: kScreenWidth/2,
        paddingHorizontal:5,
        paddingVertical:5,
    },
    content: {
        flex: 1,
        width: (kScreenWidth-30)/2,
        backgroundColor:'#fff'
    },
    image: {
        width: 130,
        height: 130,
        resizeMode:'contain',
    },
    nameStandardsView: {
        flex: 1,
        paddingTop:10,
        justifyContent:'space-between',
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 15,
        fontWeight: 'normal',
        color: darkTextColor(),
    },
    standard: {
        top: 3,
        fontSize: 12,
        color: darkLightColor(),
    },
    priceStroiesView: {
        flex: 1,
        justifyContent: 'space-between',
    },
    stories: {
        flex:1,
        fontSize: 12,
        color: yfwGreenColor(),
    },
    paddingView: {
        paddingHorizontal:8,
    }
})
