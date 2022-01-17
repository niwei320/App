import React  from 'react'
import {View,Text,TouchableOpacity,ScrollView,StyleSheet,ImageBackground,Image,DeviceEventEmitter} from 'react-native'
import { kScreenWidth, tcpImage, isEmpty, checkNotLoginIsHiddenPrice } from '../PublicModule/Util/YFWPublicFunction'
import { toDecimal } from '../Utils/ConvertUtils'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import { BaseStyles } from '../Utils/YFWBaseCssStyle'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import { pushNavigation,doAfterLogin } from '../Utils/YFWJumpRouting'
import LinearGradient from 'react-native-linear-gradient'
import YFWToast from '../Utils/YFWToast'
import {yfwOrangeColor} from '../Utils/YFWColor'
const Scale = kScreenWidth/375
export default class YFWHomeShopAdGoodsView extends React.Component {

    constructor(args) {
        super(args)
        this.state = {
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        }
    }
    componentDidMount() {
        let that = this
        //定位相关显示状态监听
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            that.setState({
                noLocationHidePrice:isHide
            })
        })
    }

    componentWillUnmount() {
        // 移除
        this.locationListener && this.locationListener.remove()
    }

    render() {
        if (isEmpty(this.props.dataArray) || this.props.dataArray.length == 0) {
            return (<View></View>)
        }
        let hasLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        let notLoginIsHiddenPrice = checkNotLoginIsHiddenPrice()
        return (
            <View style={{paddingLeft:13,paddingVertical:10}}>
                <Text style={{color:'#333',fontSize:14,fontWeight:'500',marginLeft:7,marginBottom:12}}>{'促销活动'}</Text>
                <ScrollView horizontal={true}>
                    {this.props.dataArray.map((item,index)=>{
                        let goodsInfo = item.medicine_list[0]
                        let original_prices = toDecimal(item.original_price).split('.')
                        let prices = toDecimal(item.price).split('.')
                        return (
                            <TouchableOpacity activeOpacity={1} onPress={()=>{this.clickAction(item)}} key={index+'d'} style={[styles.cellContainer,{marginLeft:index>0?7:0}]}>
                                <View style={{flex:1,height:121*Scale}}>
                                    <Image style={{flex:1,height:121*Scale,resizeMode:'contain',borderWidth:2,borderColor:'#f05955',borderRadius:8}} source={{uri:tcpImage(goodsInfo.image_url)}} ></Image>
                                    {
                                        hasLogin&&!this.state.noLocationHidePrice?
                                        <ImageBackground style={{position:'absolute',bottom:0,right:0,width:54*Scale,height:30*Scale,alignItems:'center',justifyContent:'center'}} source={require('../../img/activity_bg.png')}>
                                            <Text style={{color:'white',fontSize:8,textAlign:'center',marginTop:4,marginLeft:14*Scale,marginRight:0}}>{'到手价'}</Text>
                                            <Text style={{color:'white',fontSize:6,marginTop:2*Scale}}>{'￥'}<Text style={{fontSize:14,fontWeight:'500'}}>{prices[0]}<Text style={{fontSize:10}}>{'.'+prices[1]}</Text></Text></Text>
                                        </ImageBackground>:null
                                    }

                                </View>
                                <View style={{flexDirection:'row',marginTop:12,height:15*Scale,alignItems:'center'}}>
                                    <LinearGradient colors={['rgb(122,219,255)','rgb(72,139,255)']}
                                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                        locations={[0,1]}
                                        style={{marginLeft:12*Scale,width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center'}}>
                                        <Text style={{fontSize:10,color:'white'}}>多件装</Text>
                                    </LinearGradient>
                                    <Text numberOfLines={1} style={{marginLeft:2,color:'#333',fontSize:14,fontWeight:'500',flex:1,marginRight:0}}>{goodsInfo.namecn}</Text>
                                </View>
                                <Text style={{color:'#999',fontSize:12,marginTop:3*Scale,marginLeft:12}}>{goodsInfo.standard}</Text>
                                {this.state.noLocationHidePrice?<Text style={{fontSize: 11,color: "#999999",marginLeft:12}}>仅做信息展示</Text>:
                                    <TouchableOpacity activeOpacity={1}  onPress={()=>{notLoginIsHiddenPrice&&this.doAfterLogin()}}>
                                        {hasLogin || !notLoginIsHiddenPrice ? (<Text style={{fontSize:14,color:'#ef0000',marginLeft:12,fontWeight:'500',marginTop:4*Scale}}>{'￥'+original_prices[0]}<Text style={{fontSize:10}}>{'.'+original_prices[1]}</Text></Text>):
                                            (<Text style={styles.priceStyle}>{"价格登录可见"}</Text>)}
                                    </TouchableOpacity>
                                }
                                {
                                    hasLogin&&!this.state.noLocationHidePrice?
                                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.addToCar(item)}} hitSlop={{left:10,top:10,bottom:10,right:10}} style={{...BaseStyles.centerItem,width:27,height:40,position:'absolute',bottom:12,right:12}}>
                                        <Image style={{width:27,height:27}} source={require('../../img/add_car_green.png')}></Image>
                                    </TouchableOpacity>:null
                                }
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }

    clickAction(item) {
        const { navigate } = this.props.navigation;
        let param = {
            type: 'get_shop_goods_detail',
            value: item.store_medicineid,
        }
        pushNavigation(navigate,param);
    }

    doAfterLogin(){
        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{});
    }

    addToCar(info){
        if (YFWUserInfoManager.ShareInstance().hasLogin()) {
            this._addToCarFromServer(info)
        } else {
            let {navigate} = this.props.navigation
            doAfterLoginWithCallBack(navigate,()=>{
                this._addToCarFromServer(info)
            })
        }
    }
    _addToCarFromServer(info) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.addCart');
        paramMap.set('quantity', 1);
        paramMap.set('packageId', info.package_id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast('商品添加成功');
            this.getCarNumber();
        }, (error) => {
        });
    }
    getCarNumber() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.cart.getCartCount');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.dealCarNumber(res)
        }, (error) => {
        }, false);
    }

    dealCarNumber(res) {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        new YFWUserInfoManager().shopCarNum = res.result.cartCount + ''
        DeviceEventEmitter.emit('SHOPCAR_NUMTIPS_RED_POINT', res.result.cartCount);
    }
}
const styles = StyleSheet.create({
    cellContainer:{
        backgroundColor:'white',
        width: 170*Scale,
        height: 200*Scale,
        paddingBottom:7*Scale,
        borderRadius: 7*Scale,
        // alignItems:'center',
    },
    priceStyle:{
        fontSize: 12,
        color:yfwOrangeColor(),
        textAlign: 'left',
        marginLeft:12
    },
})