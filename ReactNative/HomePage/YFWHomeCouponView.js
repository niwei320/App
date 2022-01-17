import React  from 'react'
import {View,Text,TouchableOpacity,ScrollView,StyleSheet,ImageBackground,Image} from 'react-native'
import { kScreenWidth, isNotEmpty, isEmpty } from '../PublicModule/Util/YFWPublicFunction'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWToast from '../Utils/YFWToast'
import PropTypes from 'prop-types'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import { doAfterLoginWithCallBack } from '../Utils/YFWJumpRouting'
import { BaseStyles } from '../Utils/YFWBaseCssStyle'
const Scale = kScreenWidth/375
export default class YFWHomeCouponView extends React.Component {

    constructor(args) {
        super(args)
        this.state = {}
    }
    static defaultProps = {
        dataArray:[]
    }
    static propTypes = {
        dataArray:PropTypes.array,
    }
    render() {
        if (isEmpty(this.props.dataArray) || this.props.dataArray.length == 0) {
            return (<View></View>)
        }
        return (
            <View style={{paddingLeft:13,paddingVertical:10,width:kScreenWidth}}>
                <Text style={{color:'#333',fontSize:14,fontWeight:'500',marginLeft:7,marginBottom:12}}>{'商家优惠券'}</Text>
                <ScrollView horizontal={true}>
                    {isNotEmpty(this.props.dataArray)&&this.props.dataArray.map((item,index)=>{
                        return (
                            <View key={index+'c'} style={[styles.cellContainer,{marginLeft:index>0?7:0}]}>
                                <Text style={{marginLeft:10,color:'#ffb423',fontSize:18,fontWeight:'bold'}}>{'￥'}<Text style={{fontSize:28,fontWeight:'bold',marginLeft:1}}>{item.price}</Text></Text>
                                <View style={{marginLeft:10,marginRight:10}}>
                                    <Text style={{color:'#333',fontSize:14,fontWeight:'500'}}>{item.coupons_type == 1?'通用券':'店铺券'}</Text>
                                    <Text style={{color:'#999',fontSize:10,marginTop:2}}>{item.title}</Text>
                                </View>
                                <View style={{alignItems:'center',justifyContent:'center'}}>
                                    <TouchableOpacity activeOpacity={1}  onPress={()=>this.getCoupon(item)} style={{width:60.8*Scale,height:29.6*Scale,marginRight:3,...BaseStyles.centerItem}}>
                                        {
                                            item.get == '1'?
                                            <ImageBackground
                                            imageStyle={{resizeMode:'stretch'}}
                                            style={{width:60.8*Scale,height:29.6*Scale,alignItems: 'center',justifyContent: 'center'}}
                                            source={require('../../img/button_djlq.png')}>
                                            <Text style={{color:'white',fontSize:9*Scale,top:-2*Scale,includeFontPadding:false}}>{'点击领取'}</Text>
                                        </ImageBackground>:
                                        <View style={{width:47*Scale,height:16*Scale,borderRadius:8*Scale,borderWidth:1,borderColor:'#1fdb9b',justifyContent:'center',alignItems:'center'}}>
                                            <Text style={{color:'#1fdb9b',fontSize:10*Scale}}>{'已领取'}</Text>
                                        </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }

    getCoupon(info){
        if (info.get != '1') {
            return
        }
        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            this._getCouponFromSever(info)
        } else {
            let {navigate} = this.props.navigation
            doAfterLoginWithCallBack(navigate,()=>{
                this._getCouponFromSever(info)
            })
        }
    }
    _getCouponFromSever(info) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.usercoupons.acceptCoupon');
        paramMap.set('id', info.id);
        viewModel.TCPRequest(paramMap, (res)=> {
            YFWToast('领取成功');
            info.user_coupon_count ++
            if (info.user_coupon_count >= info.max_claim_quantity){
                info.get = '0'
            }
            this.setState({})
        });
    }
}
const styles = StyleSheet.create({
    cellContainer:{
        backgroundColor:'white',
        minWidth: 167*Scale,
        height: 67*Scale,
        borderRadius: 7*Scale,
        flexDirection:'row',
        alignItems:'center',
    }
})