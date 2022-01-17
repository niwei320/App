/**
 * Created by admin on 2018/5/22.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    Platform
} from 'react-native';
const width = Dimensions.get('window').width;
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import OderPageFlatlistItem from '../OderPageFlatlistItem'

export default class OrderMedicineDetai extends Component {

    static defaultProps = {
        goods: new Array(),
        shopTitle: ''
    }


    _renderShopTitel(shopTitle) {
        return (
            <Text
                style={{fontSize:14,color:'#333333',marginLeft:5,textAlign:'center',alignSelf:'center',maxWidth:width-65}}
                numberOfLines={1}>
                {shopTitle}
            </Text>
        )
    }


    render() {
        let datas = this.props.goods;
        let shopTitle = this.props.shopTitle;
        let shop_id = this.props.shop_id;
        return (
            <View style={{backgroundColor:'#FFF',marginTop:10}}>
                <TouchableOpacity activeOpacity={1} onPress={()=>this._jumpToMedicineDetai(shop_id)}>
                    <View style={{flexDirection:'row',height:40,alignItems:'center'}}>
                        <View style={{flexDirection:'row',width:width-20,alignItems:'center'}}>
                            <Image style={{width:15,height:15,resizeMode:'contain',alignSelf:'center',marginLeft:10}}
                                   source={ require('../../../img/order_shop_icon.png')}
                            />
                            {this._renderShopTitel(shopTitle)}
                            <Image style={{width:15,height:15,resizeMode:'contain',alignSelf:'center',marginLeft:5}}
                                   source={ require('../../../img/uc_next.png')}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{backgroundColor:'#E5E5E5',marginLeft:10,height:0.5,width:width-10}}/>
                <View>
                    <OderPageFlatlistItem medicienData={datas} from={'orderDetail'} navigation = {this.props.navigation}> </OderPageFlatlistItem>
                </View>

                <View style={{backgroundColor:'#E5E5E5',marginLeft:10,height:0.5,width:width-10}}/>
            </View>
        )
    }

    _jumpToMedicineDetai(shop_id) {
        let {navigate} = this.props.navigation
        pushNavigation(navigate, {type: 'get_shop_detail', value: shop_id})
    }
}