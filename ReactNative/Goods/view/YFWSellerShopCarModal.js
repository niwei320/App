import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native'
import {yfwOrangeColor} from '../../Utils/YFWColor'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {iphoneBottomMargin} from "../../PublicModule/Util/YFWPublicFunction";
import UserInfo from "../../UserCenter/UserInfo";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import {kRoute_shoppingcar, pushWDNavigation} from "../../WholesaleDrug/YFWWDJumpRouting";


export default class YFWSellerShopCarModal extends Component {

    static defaultProps = {
        shopCount: 0,
        style_view:{},
    }

    constructor(props) {
        super(props)
    }



    // ======= Action ======
    _clickMethod(){
        let { navigate } = this.props.navigation;
        if(new YFWUserInfoManager().is_wd_user){
            pushWDNavigation(navigate, { type: kRoute_shoppingcar });
            YFWNativeManager.mobClick('wd price page-cart')
        } else {
            pushNavigation(navigate,{type:'get_shopping_car'});
            YFWNativeManager.mobClick('price page-cart')
        }
    }




    // ====== View ======

    render() {
        return (
            <View style={[{padding:5},{position:'absolute' ,left:5,bottom:60+iphoneBottomMargin()}]}>
                <TouchableOpacity activeOpacity={1} onPress={()=>this._clickMethod()}>
                    <Image style={{width:42,height:42,resizeMode:'contain'}}
                           source={require('../../../img/icon_shopCar.png')}/>
                </TouchableOpacity>
                {this._renderCountView()}
            </View>
        )
    }

    _renderCountView(){

        if (Number.parseInt(this.props.shopCount) > 0){
            let num = this.props.shopCount
            if(Number.parseInt(this.props.shopCount) > 99){
                num = "99+"
                minWidth = 22
            }
            return (
                <View style={{position:'absolute',borderRadius:8,height:16,minWidth:16,maxWidth:30,backgroundColor:'#ff3300',right:num.length>2?-3:1,top:1,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{color:'white',fontSize:10,padding:3,lineHeight:10,textAlign:'center',fontWeight:'500'}}>{num}</Text>
                </View>
            );
        } else {
            return (<View/>);
        }
    }


}
