import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,DeviceEventEmitter
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {kScreenWidth, tcpImage, convertImg, checkNotLoginIsHiddenPrice} from "../../PublicModule/Util/YFWPublicFunction";
import {pushNavigation,doAfterLogin} from "../../Utils/YFWJumpRouting";
import {isEmpty,isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWToast from '../../Utils/YFWToast'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import YFWNativeManager from '../../Utils/YFWNativeManager';
import {yfwOrangeColor} from '../../Utils/YFWColor'
export default class YFWShopDetailGoodsListItemView extends Component {

    static defaultProps = {
        Data: undefined,
    }

    constructor(props) {
        super(props)

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


    //@ Action
    _toGoodsDetailMethod() {

        const {navigate} = this.props.navigation;
        let shop_goods_id = this.props.Data.medicine_id;
        if (isEmpty(shop_goods_id)) {
            shop_goods_id = this.props.Data.shop_goods_id;
        }
        pushNavigation(navigate, {type: 'get_shop_goods_detail', value: shop_goods_id,img_url:convertImg(this.props.Data.img_url)});

    }


    //@ View
    render() {
        let isLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        let item = this.props.Data;
        let notLoginIsHiddenPrice = checkNotLoginIsHiddenPrice()
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this._toGoodsDetailMethod()} style={{backgroundColor:"#fff"}}>
                <View style={[BaseStyles.item, {backgroundColor:'white'}]}>
                    <View style={{justifyContent:'center',height:80}}>
                        <Image style={[BaseStyles.imageStyle,{height:60,width:60,alignItems:'center'}]}
                               key={item.key} source={{uri: tcpImage(item.img_url)}}/>
                    </View>
                    <View style={{flex:1, paddingTop:10, paddingLeft:10}}>
                        <View style={[BaseStyles.leftCenterView]}>
                            {this._renderTitle(item)}
                        </View>
                        <View style={[BaseStyles.leftCenterView]}>
                            <Text
                                style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{item.standard}</Text>
                        </View>
                        {this.state.hidePrice ?
                            <Text style={{color:"#999", fontSize:13, fontWeight:'500', marginLeft:10,marginVertical:10}}>仅做信息展示</Text>:
                            isLogin||!notLoginIsHiddenPrice?<View style={[BaseStyles.leftCenterView, {paddingVertical:7,justifyContent:'space-between'}]}>
                                {this._showPriceView(item)}
                                {isLogin&&this._renderBuyIcon(item)}
                            </View>:
                            <TouchableOpacity activeOpacity={1} onPress={()=>this.doAfterLogin()} style={[BaseStyles.leftCenterView, {paddingVertical:7,justifyContent:'space-between'}]}>
                                <Text style={{fontSize: 12,color:yfwOrangeColor(),textAlign: 'left',marginLeft:10}}>{"价格登录可见"}</Text>
                            </TouchableOpacity>

                        }
                        <View style={[BaseStyles.separatorStyle,{width:kScreenWidth,marginLeft:10}]}/>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    doAfterLogin(){
        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{

        });
    }

    _addGoodsToshopCar(data){
        doAfterLogin(this.props.navigation.navigate,()=>{
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.cart.addCart');
            paramMap.set('quantity', 1);
            paramMap.set('storeMedicineId', data.medicine_id);
            if (this.props.isSettlementCallback) {
                paramMap.set('type','buy')
            }
            YFWUserInfoManager.ShareInstance().addCarIds.set(data.medicine_id+'','id')
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                let info = {}
                if (this.props.isSettlementCallback) {
                    if (res.result && res.result.cartids) {
                        info.id = res.result.cartids.join(',')
                        info.storeMedicineId = data.medicine_id
                    } else {
                        return
                    }
                } else {
                    YFWToast('商品添加成功');
                }
                this.props.addShopCarCallBack && this.props.addShopCarCallBack(data.originData.old_price, info);
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
            DeviceEventEmitter.emit('SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
            new YFWUserInfoManager().shopCarNum = res.result.cartCount+''
        },(error)=>{},false);
    }

    _showPriceView(item) {
            return (
                <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                    <YFWDiscountText navigation={this.props.navigation} style_view={{marginLeft:10,flex:1}} style_text={{fontSize:15,fontWeight:'500'}}
                                     value={'¥'+toDecimal(isNotEmpty(item.price)?item.price:item.price_min)} discount={item.discount}/>
                </View>
            );
        }



    _renderTitle(item) {

        return (
            <Text style={[BaseStyles.titleStyle,{width:kScreenWidth - 110,}]}
                  numberOfLines={1}>{item.inshop_search_tcpname}</Text>
        )

    }

    _renderBuyIcon(item) {
        if(item.is_add_cart){
            return(<View>
                <TouchableOpacity hitSlop={{left:15,top:10,bottom:10,right:10}} onPress={()=>this._addGoodsToshopCar(item)} activeOpacity={1}>
                    <Image style={{width:20,height:20,resizeMode:'contain',marginRight:15}} source={require('../../../img/icon_addShopCar.png')}/>
                </TouchableOpacity>
            </View>)
        }else {
            return(<View/>)
        }
    }
}