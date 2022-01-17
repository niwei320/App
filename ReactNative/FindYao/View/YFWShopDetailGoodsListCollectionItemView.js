import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,DeviceEventEmitter
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {isEmpty, isNotEmpty, kScreenWidth, safe, tcpImage} from "../../PublicModule/Util/YFWPublicFunction";
import {backGroundColor, darkNomalColor, yfwOrangeColor} from '../../Utils/YFWColor'
import {pushNavigation,doAfterLogin} from "../../Utils/YFWJumpRouting";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWToast from '../../Utils/YFWToast'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';

export default class YFWShopDetailGoodsListCollectionItemView extends Component {

    static defaultProps = {
        Data: undefined,
    }

    _renderName(item,name) {

        if(isNotEmpty(this.props.type)&&this.props.type == 'all_medicine_list'){
            return (
                <Text numberOfLines={2}
                      style={[BaseStyles.titleStyle,{marginLeft:0,width:(kScreenWidth-15)/2-10,textAlign:'center',color:'#444'}]}>{item.inshop_search_tcpname}</Text>)
        }else {
            return (<Text numberOfLines={2}
                          style={[BaseStyles.titleStyle,{marginLeft:0,width:(kScreenWidth-15)/2-30,textAlign:'center',color:darkNomalColor()}]}>{name}</Text>)
        }

    }


    render() {

        let item = this.props.Data;
        let uneven = false;
        if (parseInt(item.key) % 2 == 0) {
            uneven = true;
        }

        let icon_image = isEmpty(item.intro_image) ? item.img_url : item.intro_image;
        let name = isEmpty(item.name_cn) ? item.title : item.name_cn;


        return (
            <View style={[BaseStyles.centerItem,{backgroundColor: backGroundColor()}]}>
                <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>this.clickItems(item)}>
                    <View style={[BaseStyles.centerItem,{width:(kScreenWidth-15)/2,height:220,backgroundColor:'white',
                        marginTop:5,marginLeft:uneven?5:2.5,marginRight:uneven?2.5:5}]}>
                        <Image style={{height:120,width:120}} key={item.key} source={{uri:tcpImage(icon_image)}}/>
                        {this._renderName(item,name)}
                        <YFWDiscountText navigation={this.props.navigation} style_view={{marginTop:0}} style_text={{fontSize:13}} value={'¥'+toDecimal(item.price)} discount={item.discount}/>
                        {this._renderBuyIcon(item)}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    _renderBuyIcon(item){
        if(isNotEmpty(this.props.type)&&this.props.type == 'all_medicine_list'&&item.is_add_cart){
            return(<View>
                <TouchableOpacity onPress={()=>this._addGoodsToshopCar(item)} activeOpacity={1} style={{alignItems:'center',justifyContent:'center'}}>
                    <Image style={{width:20,height:20,resizeMode:'contain'}} source={require('../../../img/compare_cart.png')}/>
                </TouchableOpacity>
            </View>)
        }else {
            return(<View/>)
        }
    }

    _addGoodsToshopCar(data){
        doAfterLogin(this.props.navigation,()=>{
            let paramMap = new Map();
            paramMap.set('__cmd', 'person.cart.addCart');
            paramMap.set('quantity', 1);
            paramMap.set('storeMedicineId', data.shop_goods_id);
            YFWUserInfoManager.ShareInstance().addCarIds.set(data.shop_goods_id+'','id')
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res) => {
                YFWToast('商品添加成功');
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

    /*
     * <Text style={[BaseStyles.titleStyle,{marginLeft:0,width:(kScreenWidth-15)/2-30,textAlign:'center',color:darkNomalColor()}]}>{name}</Text>
     {this._renderStandard(item)}*/


    _renderStandard(item) {

        if (isNotEmpty(item.standard)) {

            return (
                <Text style={{width:(kScreenWidth-15)/2,textAlign:'center',fontSize:13,color:darkNomalColor()}}
                      numberOfLines={1}>{safe(item.standard)}</Text>
            );

        } else {

            return (<View/>);

        }

    }


    clickItems(item) {
        const {navigate} = this.props.navigation;
        let shop_goods_id = this.props.Data.shop_medicine_id;
        if (isEmpty(shop_goods_id)) {
            shop_goods_id = this.props.Data.shop_goods_id;
        }
        pushNavigation(navigate, {type: 'get_shop_goods_detail', value: shop_goods_id,img_url:tcpImage(item.intro_image)});
    }


}