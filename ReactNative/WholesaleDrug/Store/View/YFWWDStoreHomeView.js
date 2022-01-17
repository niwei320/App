import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import YFWWDBaseView from '../../Base/YFWWDBaseView';
import {
    isIphoneX,
    kScreenWidth,
    iphoneBottomMargin,
    kStatusHeight,
    kNavigationHeight,
    isAndroid
} from '../../../PublicModule/Util/YFWPublicFunction';
import LinearGradient from 'react-native-linear-gradient';
import YFWWDScrollableTabView from '../../Widget/View/YFWWDScrollableTabView';
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';
import { YFWImageConst } from '../../Images/YFWImageConst';
import YFWWDMore from '../../Widget/View/YFWWDMore';


export default class YFWWDStoreHomeView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = this.props.model
    }

    componentWillReceiveProps(props) {
        this.model = props.model
    }

    render() {
        return (
            <View style={styles.container_style}>
                <Image style={styles.shop_bgimage_style} source={YFWImageConst.Bg_shop_bg_wd}/>
                {this.renderSearchView()}
                {this.renderHomeHeaderView()}
                {this.renderShopInfoView()}
                {this.renderCouponItem()}
                <YFWWDScrollableTabView father={this} style={styles.scrollView_style} tabs={this.model.tabs} dataArray={this.model.dataArray}/>
                {this.renderBottomMenu()}
            </View>
        )
    }

    renderSearchView() {
        return (
            <View style={{width:kScreenWidth,height:kNavigationHeight,flexDirection:'row'}} >
                <TouchableOpacity onPress={() => this.backMethod()} activeOpacity={1} style={styles.backbotton_style}>
                    <Image style={styles.backicon_style} source={ require('../../../../img/dingdan_back.png')}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.search_view_style} onPress={() => {this.toSearch() }}>
                    <View style={styles.search_content_style}>
                        <Image style={styles.search_icon_style} source={require('../../../../img/kind_search_white.png')}/>
                        <Text  style={styles.search_placeholder_style} numberOfLines={1}>批准文号、通用名、商品名、症状</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.morebooton_style}>
                    <YFWWDMore isStore={true} storeInfo={this.model.shopInfo} />
                </View>
            </View>
        )
    }

    renderHomeHeaderView () {
        let item = this.model.shopInfo;
        let collectImg = require('../../../../img/sx_image_collect.png')
        if (item.isfaverate) {
            collectImg = require('../../../../img/sx_image_collect_sellected.png')
        }
        return (
            <View style={styles.homeheader_style}>
                <View style={{flex:1,justifyContent:'center'}}>
                    <Text numberOfLines={2} style={{color: "white",fontSize:15,fontWeight:'700',marginRight:32,lineHeight:isAndroid()?undefined:16}}>{item.storeName}</Text>
                </View>
                <TouchableOpacity style={{ width: 65, height: 35, justifyContent: 'center' }} onPress={() => {this.toCollect()}}>
                    <Image style={{height: 23, width:65,borderRadius:11.5}} source={collectImg}/>
                </TouchableOpacity>
            </View>
        )
    }

    renderShopInfoView() {
        return (
            <View style={styles.shopinfo_style}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 32 }}>
                    <LinearGradient style={styles.linear_style} colors={['rgb(82,66,255)','rgb(65,109,255)']} start={{x: 1, y: 0}} end={{x: 0, y: 1}} locations={[0,1]}>
                        <Text style={{ fontSize: 10, color: 'white', fontWeight: 'bold', fontWeight:'400'}}>电子开户</Text>
                    </LinearGradient>
                    <Text style={{ fontSize: 13, color: 'white', marginLeft: 10 }}>{'开业'+this.model.shopInfo.storeAge+'年'}</Text>
                    <Text style={{ fontSize: 13, color: 'white', marginLeft: 12 }}>{'在售' + this.model.shopInfo.storeGoodsNum + '种商品'}</Text>
                </View>
                {this.model.shopInfo.dict_audit == -1?null:this.model.shopInfo.dict_audit == 1?
                    <View style={{ width: 65, height:21, alignItems:'center', justifyContent:'center', borderColor:'rgb(65,109,255)',borderWidth:1, borderRadius: 10 ,right:0}}>
                        <Text style={{color: 'rgb(65,109,255)', fontSize: 12,}}>已开户</Text>
                    </View>
                    :
                    <TouchableOpacity onPress={()=>this.toOpenAccount()} activeOpacity={1} style={{ width: 65, height:21, alignItems:'center', justifyContent:'center', backgroundColor: 'white', borderRadius: 10 ,right:0}}>
                        <Text style={{color: 'rgb(65,109,255)', fontSize: 12,}}>申请开户</Text>
                    </TouchableOpacity>
                }
            </View>
        )
    }

     //商家优惠券
     renderCouponItem() {

        if (this.model.shopInfo.coupon.length > 0 || this.model.shopInfo.open_coupons.length > 0){
            let openAccountCoupon = []
            let couponArray = []
            this.model.shopInfo.open_coupons.map((item, i) => {
                if(item.dict_bool_open_customer == 1){
                    let imageUrl = YFWImageConst.Icon_coupon_open_bg
                    openAccountCoupon.push (
                        <TouchableOpacity key={i} style={[BaseStyles.leftCenterView]}
                                          onPress={() => item.dict_bool_open_customer ==1 ?this.toOpenAccount():this.getCouponMethod(item)} underlayColor="transparent">
                            <View style={[{height: 58, width: 150 , marginLeft:6,justifyContent:"center"}]}>
                                <Image source={imageUrl} style={{resizeMode:'stretch',height: 58, width: 150,position:'absolute',top:0,left:0}}/>
                                <View style={{width:70,height:58,alignItems:'center',justifyContent:'center'}}>
                                    <Text style={{fontSize:15,color:'white',fontWeight:'700',marginTop:-3}}>¥
                                        <Text style={{fontSize:21,fontWeight:'900'}}>{item.price}</Text>
                                    </Text>
                                    <Text style={{fontSize:10,color:'white'}}> {item.title} </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }
            })
            this.model.shopInfo.coupon.map((item, i) => {
                let imageUrl = YFWImageConst.Icon_coupon_bg
                couponArray.push (
                    <TouchableOpacity key={i} style={[BaseStyles.leftCenterView]}
                                      onPress={() => item.dict_bool_open_customer ==1 ?this.toOpenAccount():this.getCouponMethod(item)} underlayColor="transparent">
                        <View style={[{height: 58, width: 150 , marginLeft:6,justifyContent:"center"}]}>
                            <Image source={imageUrl} style={{resizeMode:'stretch',height: 58, width: 150,position:'absolute',top:0,left:0}}/>
                            <View style={{width:70,height:58,alignItems:'center',justifyContent:'center'}}>
                                <Text style={{fontSize:15,color:'white',fontWeight:'700',marginTop:-3}}>¥
                                    <Text style={{fontSize:21,fontWeight:'900'}}>{item.price}</Text>
                                </Text>
                                <Text style={{fontSize:10,color:'white'}}> {item.title} </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })
            return(
                <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18,marginTop:12}}>
                    <ScrollView horizontal={true} style={{width:kScreenWidth-18*2}}>
                        {this.model.shopInfo.dict_audit == 0?openAccountCoupon:null}
                        {couponArray}
                    </ScrollView>
                </View>
            );
        }
    }

     //底部菜单
     renderBottomMenu(){
        const bottom = iphoneBottomMargin();
        return(
            <View style={{}}>
                <View style={[BaseStyles.separatorStyle,{marginLeft:0,width:kScreenWidth}]}/>
                <View style={{height: 50, marginBottom:bottom,backgroundColor: "white", flexDirection: "row"}}>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this.shopJianJieMethod()}>
                            <Image style={{width:18,height:18,resizeMode:'contain'}} source={ require('../../../../img/bottom_icon_dianpu.png')}/>
                            <Text style={{color:'rgb(51,51,51)',fontSize:10,marginTop:6}}>商家简介</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[BaseStyles.verticalSeparatorStyle,{height:50}]}/>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this.shopAllGoodsMethod()}>
                            <Image style={{width:18,height:18,resizeMode:'contain'}} source={ require('../../../../img/bottom_icon_all.png')}/>
                            <Text style={{color:'rgb(51,51,51)',fontSize:10,marginTop:6}}>全部商品</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[BaseStyles.verticalSeparatorStyle,{height:50}]}/>
                    <View style={{flex:1}}>
                        <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this.shopOnlineAdvisoryMethod()}>
                            <Image style={{width:18,height:18,resizeMode:'contain'}} source={ require('../../../../img/bottom_icon_zixun.png')}/>
                            <Text style={{color:'rgb(51,51,51)',fontSize:10,marginTop:6}}>在线咨询</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        );
    }

    backMethod() {
        this.props.father&&this.props.father.backMethod&&this.props.father.backMethod()
    }

    updateViews() {
        this.setState({})
    }

    toSearch() {
        this.props.father&&this.props.father.toSearch&&this.props.father.toSearch()
    }

    toCollect() {
        this.props.father&&this.props.father.toCollect&&this.props.father.toCollect()
    }

    toOpenAccount() {
        this.props.father&&this.props.father.toOpenAccount&&this.props.father.toOpenAccount()
    }

    onChangeTab(value) {
        this.props.father&&this.props.father.onChangeTab&&this.props.father.onChangeTab(value)
    }

    listRefresh() {
        this.props.father&&this.props.father.listRefresh&&this.props.father.listRefresh()
    }

    onEndReached() {
        this.props.father&&this.props.father.onEndReached&&this.props.father.onEndReached()
    }

    shopJianJieMethod() {
        this.props.father&&this.props.father.shopJianJieMethod&&this.props.father.shopJianJieMethod()
    }

    shopAllGoodsMethod() {
        this.props.father&&this.props.father.shopAllGoodsMethod&&this.props.father.shopAllGoodsMethod()
    }

    shopOnlineAdvisoryMethod() {
        this.props.father&&this.props.father.shopOnlineAdvisoryMethod&&this.props.father.shopOnlineAdvisoryMethod()
    }

    toDetail(medicine) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(medicine)
    }

    getCouponMethod(item) {
        this.props.father&&this.props.father.getCouponMethod&&this.props.father.getCouponMethod(item)
    }
}

const styles = StyleSheet.create({
    container_style: { flex: 1, backgroundColor: '#FAFAFA' },
    shop_bgimage_style: { height: kNavigationHeight + 240, width: kScreenWidth, position: 'absolute', top: -1, left: 0, right: 0, resizeMode: 'stretch' },
    backbotton_style: { width: 50, height: 40, justifyContent: 'center', marginTop: kStatusHeight },
    backicon_style: { width: 11, height: 19, marginLeft: 12, resizeMode: 'contain' },
    search_view_style: { flex: 1, height: 40, justifyContent: 'center', marginTop: kStatusHeight, marginLeft: 1, marginRight: 5 },
    search_content_style: { height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', flexDirection: 'row' },
    search_icon_style: { width: 15, height: 16, marginLeft: 15 },
    search_placeholder_style: { flex: 1, marginLeft: 10, marginRight: 10, fontSize: 14, color: 'white' },
    morebooton_style: { width: 50, height: 40, marginTop: kStatusHeight, justifyContent: 'center' },
    homeheader_style: { marginTop: 20 ,paddingHorizontal: 18,flexDirection: 'row'},
    shopinfo_style: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18,marginTop:12},
    linear_style: { width: 47, height: 13, borderRadius: 3,justifyContent:'center',alignItems:'center'},
    scrollView_style:  { backgroundColor: 'transparent',marginHorizontal:12},


});
