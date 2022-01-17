import React, {Component} from 'react';
import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View,ImageBackground,DeviceEventEmitter} from 'react-native';
import {darkNomalColor, darkTextColor, separatorColor, yfwOrangeColor,darkLightColor} from "../Utils/YFWColor";
import {doAfterLogin} from "../Utils/YFWJumpRouting";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {isEmpty, isNotEmpty, safeObj, checkNotLoginIsHiddenPrice} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {convertStar, toDecimal} from "../Utils/ConvertUtils";
import YFWDiscountText from '../PublicModule/Widge/YFWDiscountText'
import DashLine from '../widget/DashLine'
import LinearGradient from 'react-native-linear-gradient';
import YFWMoneyLabel from '../widget/YFWMoneyLabel';
export default class YFWSellersListCellView extends Component {

    static defaultProps = {
        Data:undefined,
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

    // ==== Action ====
    addShopCar(){
        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{
            if (this.props.addShopCar) {
                this.props.addShopCar();
                YFWNativeManager.mobClick('price page-add cart')
            }
        });
    }

    doAfterLogin(){

        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{});

    }

    // ==== View ====
    render() {
        let userInfo = YFWUserInfoManager.ShareInstance();
        let isLogin = userInfo.hasLogin()
        let notLoginIsHiddenPrice = checkNotLoginIsHiddenPrice()
        let shopName = this.props.Data.title
        if (isNotEmpty(this.props.Data.activity_icon)) {
            shopName = '          ' + shopName
        }
        return (
            <View style={styles.container}>
                <View style={[BaseStyles.leftCenterView,{justifyContent:'space-between'}]}>
                    <View style={{flexDirection:'row'}}>
                        {
                            isNotEmpty(this.props.Data.activity_icon)?
                            <Image style={{width:31,height:16,position:'absolute'}} source={{uri:this.props.Data.activity_icon}}></Image>:null
                        }
                        <Text style={[styles.titleStyle,{lineHeight:15,width:195}]} numberOfLines={2}>{shopName}</Text>
                    </View>
                    {this.state.hidePrice ?
                        <Text style={{fontSize:13, fontWeight:"500", color:darkLightColor(), marginRight:13}}>仅做信息展示</Text>  :
                        <TouchableOpacity activeOpacity={1} style={{marginRight:13}} onPress={()=>{notLoginIsHiddenPrice&&this.doAfterLogin()}}>
                            {isLogin || !notLoginIsHiddenPrice ? (<YFWMoneyLabel decimalsTextStyle={{fontSize:13}} moneyTextStyle={{fontSize:15,color:'#ff3300'}}
                                                        money={this.props.Data.price}/>):
                                (<Text style={styles.priceStyle}>{"价格登录可见"}</Text>)}
                        </TouchableOpacity>
                    }
                </View>
                <View style={[styles.view2Style,{marginTop:10}]}>
                    {this.renderInfo()}
                    {this.renderDiscount(true)}
                </View>
                {this.state.hidePrice ? <View/> :
                    <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                        {this._renderReserveInfo()}
                        {this._renderTermOfValidity()}
                        {this.renderDiscount(false)}
                    </View>
                }
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View style={[{flex:1,marginTop:8}]}>
                        {this.renderItem()}
                    </View>
                    {/*如果为登录不显示购物车按钮*/}
                    {!this.state.hidePrice&&isLogin && this.props.Data.is_add_cart === 'true'?<TouchableOpacity accessibilityLabel={this.props.accessibilityLabel} hitSlop={{left:10,top:10,bottom:10,right:0}} activeOpacity={1} onPress={()=>this.addShopCar()}>
                        <Image style = {{width:24,height:24,resizeMode:'contain',marginRight:13}} source={ require('../../img/icon_addShopCar.png')}/>
                    </TouchableOpacity>:<View width={22} height={22}/>}

                </View>
                <View style={styles.separatorStyle}/>
            </View>
        );
    }


    _renderTermOfValidity(){
        if(isNotEmpty(this.props.Data.period_to)){
            let period_to = this.props.Data.period_to.includes('有效期') ? this.props.Data.period_to : ('有效期至：' + this.props.Data.period_to)
            return(
                <Text flex={1} style={{fontSize: 13,color: darkLightColor(),marginLeft:8}}>{period_to}</Text>
            )
        }
    }

    _renderReserveInfo(){
        if(isNotEmpty(this.props.Data.reserve)){
            return(
                <Text flex={1} style={{fontSize: 13,color: darkLightColor(),}}>库存{this.props.Data.reserve}</Text>
            )
        }
    }

    renderInfo() {
        let items = []
        if (isNotEmpty(this.props.Data.star)) {
            items.push(convertStar(this.props.Data.star))
        }
        if (isNotEmpty(this.props.Data.region)) {
            items.push(this.props.Data.region)
        }
        let textOne = ""
        let textTwo = ""
        for (let i = 0; i < items.length; i++) {
            switch (i) {
                case 0:
                    textOne = items[i]
                    break
                case 1:
                    textTwo = items[i]
                    break
            }
        }
        return (
            <View style={{flexDirection:'row',flex:1,alignItems:'center',marginLeft:0}}>
                <Image style={{width:10,height:10,resizeMode:'contain'}}
                        source={require('../../img/sx_star.png')}/>
                <Text style={[styles.starStyle,{marginLeft:3}]}>{textOne}</Text>
                <Text numberOfLines={1} style={[styles.starStyle,{marginLeft:13,textAlign:'center'}]}>{textTwo}</Text>
            </View>
        )
    }

    renderItem() {
            return(<View>
                <View style={{flexDirection:'row',alignItems:'center',marginLeft:-3}}>
                    {this._renderScheduled()}
                    {this._renderFreeExem()}
                    {this._renderActivity()}
                    {this._renderCoupon()}
                </View>
                {this.renderMedicinePackage()}
            </View>)
    }

    renderDiscount(showCount){
        let shipping_price_info = ''
        let shipping_price = toDecimal(this.props.Data.shipping_price)
        if (parseFloat(shipping_price) == 0) {
            shipping_price_info = '包邮'
        } else {
            shipping_price_info = '运费' + shipping_price +'元'
        }
        if (showCount) {
            if (isNotEmpty(this.props.Data.discount) && !this.state.hidePrice) {
                return (
                    <View style={{backgroundColor:'#ff5c5c',borderRadius:3,marginRight:13,height:15,alignItems:'center',justifyContent:'center'}}>
                        <Text style={{fontSize:10,color:'white',fontWeight:'500',textAlign:'center',paddingHorizontal:2,paddingVertical:1}}>{this.props.Data.discount}</Text>
                    </View>
                )
            } else {
                if (this.state.hidePrice) {
                    return (<View/>)
                } else {
                    return (<Text style={[styles.shippingPriceStyle,{textAlign:'right',flex:1}]}>{shipping_price_info}</Text>)
                }
            }
        } else {
            if (this.state.hidePrice || !isNotEmpty(this.props.Data.discount)) {
                return (<View/>)
            } else {
                return (<Text style={[styles.shippingPriceStyle,{textAlign:'right',flex:1}]}>{shipping_price_info}</Text>)
            }
        }
    }

    /*
    *  多件转
    * */
    renderMedicinePackage(){
        if(isNotEmpty(this.props.Data.medicine_package_desc)) {
            return (<View style={{flexDirection:'row',marginLeft:2,marginTop:5,alignItems:'center'}}>
                <LinearGradient colors={['rgb(255,201,86)','rgb(255,153,7)']}
                                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                    locations={[0,1]}
                                    style={{height: 13,borderRadius:3,justifyContent:'center',alignItems:'center'}}>
                                    <Text style={{fontSize:10,color:'white',paddingHorizontal:5,textAlign:'center'}}>多件装</Text>
                </LinearGradient>
                <Text style={{color:'#999999',fontSize:10,marginLeft:6}}>{this.props.Data.medicine_package_desc}</Text>
            </View>)
        }
    }

    /*
    *  包邮标签
    * */
    _renderFreeExem(){
        if(isNotEmpty(this.props.Data.logistics_desc)){
            return (
                <LinearGradient colors={['rgb(255,154,103)','rgb(255,96,94)']}
                                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                    locations={[0,1]}
                                    style={{height: 13,borderRadius:3,marginLeft:3,justifyContent:'center',alignItems:'center'}}>
                                    <Text style={{fontSize:10,color:'white',paddingHorizontal:5}}>{this.props.Data.logistics_desc}</Text>
                </LinearGradient>
            )
        }
    }

    /*
    *  活动
    * */
    _renderActivity(){
        if(isNotEmpty(this.props.Data.activity_desc)){
            return (
                <ImageBackground source={require('../../img/sx_ticket.png')} style={{height:12,marginLeft:3,justifyContent:'center'}} imageStyle={{resizeMode:'stretch'}}>
                            <Text style={{color:'#ff3300',fontSize:10,paddingHorizontal:4}}>{this.props.Data.activity_desc}</Text>
                </ImageBackground>
            )
        }
    }

    /*
    *  优惠券
    * */
    _renderCoupon(){
        if(isNotEmpty(this.props.Data.coupons_desc)){
            return(
                <View style={{borderRadius:2,paddingTop:1
                ,paddingBottom:1,paddingLeft:2,paddingRight:2,borderColor:'#FF9F04',borderWidth:0.5,marginLeft:3,alignItems:'center',flexDirection:'row'}}>
                    <Text style={{fontSize:10,color:'#FF9F04',width:15,textAlign:'center'}}>券</Text>
                    <DashLine backgroundColor={'#FF9F04'} len={3} flexD={1}/>
                    <Text style={{fontSize:10,color:'#FF9F04',marginLeft:2}}>{this.props.Data.coupons_desc}</Text>
                </View>)
        }
    }

    /*
    *  发货时间
    * */
    _renderScheduled(){
        if(isNotEmpty(this.props.Data.scheduled_name)){
            return(
                    <View style={{fontSize:10,color:'#896727',borderRadius:3,borderColor:'#896727',borderWidth:0.5,paddingHorizontal:2,height:13,marginLeft:3,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{fontSize:10,color:'#896727'}}>{this.props.Data.scheduled_name}</Text>
                    </View>
                )
        }
    }

}

//设置样式
const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:'white',
        paddingLeft:16,
        paddingTop:13
    },
    view2Style:{
        height:20,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    titleStyle:{
        fontSize: 14,
        color:darkTextColor(),
    },
    separatorStyle:{
        backgroundColor:separatorColor(),
        height:0.5,
        width: Dimensions.get('window').width - 10,
        marginLeft:10,
        marginTop:10
    },
    priceStyle:{

        fontSize: 15,
        color:yfwOrangeColor(),
        textAlign: 'right',
    },
    regionStyle:{

        fontSize: 12,
        //width:100,
        color:darkNomalColor(),

    },
    starStyle:{

        fontSize: 13,
        color:darkLightColor(),
    },
    shippingPriceStyle:{

        fontSize: 13,
        color:darkLightColor(),
        width:120,
        marginRight:13,
        textAlign: 'right',
    },
    checkImgStyle:{
        width:12,
        height:12,
        marginLeft:10,
        marginTop:5,
    },
    textStyle:{

        fontSize: 12,
        color:darkNomalColor(),
    },

});