import React, {Component} from 'react'
import { View, Image, Text, TouchableOpacity, StyleSheet, ImageBackground, } from 'react-native'
import {darkTextColor, darkLightColor} from '../../../Utils/YFWColor'
import { kScreenWidth, tcpImage, safe } from '../../../PublicModule/Util/YFWPublicFunction';
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWDiscountText from "../../../PublicModule/Widge/YFWDiscountText";
import {toDecimal} from "../../../Utils/ConvertUtils";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
export default class YFWSearchShopResultCell extends Component {
    render() {
        /** 商家model */
        let model = this.props.model
        let hasLogo = safe(model.logo_img_url).indexOf('noyaodian_logo.png') == -1
        return(
            <View style={[styles.contanier, BaseStyles.radiusShadow]}>
                <View style={styles.titleView}>
                    <View style={{flexDirection: 'row', alignItems: 'center',flex:3}}>
                        {hasLogo?<Image source={{uri:model.logo_img_url}} style={styles.storeImage} />:null}
                        <Text style={styles.storeTitle} numberOfLines={2}>{model.title}</Text>
                    </View>
                    <View style={{width:25}}></View>
                    <TouchableOpacity activeOpacity={0.9} onPress={this._storeOpacityClick.bind(this)}>
                        <ImageBackground source={require('../../../../img/search_store_backimage.png')} style={styles.storeBtn} imageStyle={{resizeMode:'stretch'}}>
                            <Text style={styles.storeBtnTitle}>进入店铺</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemView}>
                    {this._renderGoodsItem(model)}
                </View>
            </View>
        )
    }

    _renderGoodsItem(shopModel) {
        var items = [];

        for (let index = 0; index < shopModel.goods_items.length; index++) {
            let goodModel = shopModel.goods_items[index];
            let goodImages = goodModel.intro_image.split('|')
            items.push(
                <TouchableOpacity style={styles.item} activeOpacity={0.9} onPress={() => this._storeGoodsItemClick(goodModel)}>
                    <Image source={{uri:tcpImage(safe(goodImages[0]))}} style={styles.itemImage}/>
                    <View style={[styles.itemTextView,{paddingTop:10}]}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{goodModel.namecn}</Text>
                        <YFWDiscountText navigation={this.props.navigation}  style_view={{marginTop:5}} style_text={{fontSize:13, fontWeight:'500'}} value={'¥'+toDecimal(goodModel.price)}/>
                    </View>
                </TouchableOpacity>
            )
        }
        return items;
    }

    _storeOpacityClick() {
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail',value:this.props.model.id});
    }

    _storeGoodsItemClick(item) {
        let {navigate} = this.props.navigation;
        let goodImages = safe(item.intro_image).split('|')
        pushNavigation(navigate, {type: 'get_shop_goods_detail', value: item.id ,img_url:tcpImage(safe(goodImages[0]))})
    }
}

const styles = StyleSheet.create({
    contanier: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop:25,
        marginLeft: 10,
        marginRight: 10,
        paddingBottom:15,
        marginBottom:10
    },
    titleView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    storeImage: {
        width: 70,
        height: 27,
        resizeMode: 'stretch',
        borderWidth: 0.5,
        borderColor: '#eee',
    },
    storeTitle: {
        flex: 1,
        color: darkTextColor(),
        fontSize: 13,
        fontWeight: 'bold',
        left: 8,
    },
    storeBtn: {
        width: 65,
        height: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
    storeBtnTitle: {
        color: '#26af73',
        fontSize: 12,
    },
    itemView: {
        flex: 3,
        flexDirection: 'row',
        paddingTop:15
    },
    item: {
        flex:1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingTop: 10,
    },
    itemImage: {
        width: (kScreenWidth-70)/3-16,
        height: (kScreenWidth-70)/3-16,
        resizeMode: 'contain',
    },
    itemTextView: {
        flex: 1,
        width: (kScreenWidth-70)/3,
        justifyContent: 'space-evenly',
    },
    itemTitle: {
        fontSize: 11,
        color: darkTextColor(),
    },
    itemPrice: {
        fontSize: 11,
        color: '#ff3300',
    }
})
