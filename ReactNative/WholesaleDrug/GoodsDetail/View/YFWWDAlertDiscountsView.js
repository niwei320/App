import React, {Component} from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import ModalView from '../../../widget/ModalView'


import YFWToast from '../../../Utils/YFWToast'
import {
    darkNomalColor,
    darkLightColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor,
} from '../../../Utils/YFWColor'
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {
    isNotEmpty,
    itemAddKey,
    safeObj,
    safe,
    adaptSize,
    kScreenWidth,
    deepCopyObj,
    isEmpty
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";
import LinearGradient from 'react-native-linear-gradient';
import YFWWDShopCarModel from '../../ShopCar/Model/YFWWDShopCarModel';
import {
    pushWDNavigation,
    kRoute_shop_detail_list,
    doAfterLogin,
    kRoute_apply_account
} from '../../YFWWDJumpRouting';
import {YFWImageConst} from "../../Images/YFWImageConst";


export default class YFWWDAlertDiscountsView extends Component {

    static defaultProps = {
        data:undefined,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            dataArray:[],
            dataSource:[],
            visible: false,
        };
        this.data = {}
        this.shopGoodsPrice = 0
    }

    show(data) {

        this.data = data;
        this.modalView && this.modalView.show()
        this.setState({
            visible: true
        });
        if (isNotEmpty(data.couponArray)){
            let newDataArray = []
            let newDataSource = []
            data.couponArray.map((item)=>{
                if (item.get == '1') {
                    newDataArray.push(item)
                }

                if (item.aleardyget == 1) {
                    let newItem = {...item,get:'0'}
                    for (let index = 0; index < item.user_coupon_count; index++) {
                        newDataSource.push(newItem)
                    }
                }
            })
            this.setState({
                dataArray: newDataArray,
                dataSource:newDataSource
            });
        }
        this._faetchShopCarInfo()
    }

    dismiss() {

        this.modalView && this.modalView.disMiss()
        this.props.dismiss && this.props.dismiss()
        this.setState({
            visible: false,
        })

    }

    render() {
        let array = this.state.dataSource
        let array1 = this.state.dataArray
        return (
            <ModalView ref = {(c) => this.modalView = c}
                       transparent={true}
                       animationType = "slide"
                       visible={this.state.visible}
                       onRequestClose={()=>{
                this.props.onRequestClose && this.props.onRequestClose()
                this.dismiss()
            }}>
                <View style = {{flex: 1}}>
                    <TouchableOpacity activeOpacity = {1} style = {{flex: 1}} onPress = {() => this.dismiss()} />
                    <View style = {{backgroundColor: '#F8F8F8', height: 523,borderTopLeftRadius: 7,borderTopRightRadius: 7,padding:4}}>
                        <View style = {{height: 48,justifyContent:'center',alignItems:'center'}}>
                            <Text style = {{color: '#000', fontSize: 15,fontWeight:'bold',lineHeight: 20}}>优惠</Text>
                            <TouchableOpacity activeOpacity = {1} style = {{width: 15, height: 15,position:'absolute', right: 19,top:16}} hitSlop={{top:20,left:20,bottom:20,right:20}} onPress = {() => this.dismiss()}>
                                <Image style = {{width: 15, height: 15}} source = {require('../../../../img/close_button.png')} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{flex:1,}}>
                            {this.data.shop_promotion&&this.data.shop_promotion.length > 0?
                            <View style={{marginBottom:20}}>
                                <Text style={{color:'#999',fontSize:14,marginLeft:11,marginVertical:10}}>{'促销'}</Text>
                                {this.activeValidity()}
                                {this.rendercontentView()}
                            </View>:null
                            }
                            {(isNotEmpty(this.state.dataArray)&&this.state.dataArray.length>0)?this.ReceviceFavourable():null}
                            {(isNotEmpty(this.state.dataSource)&&this.state.dataSource.length>0)?this.haveReceviceFavourable():<View/>}
                        </ScrollView>
                        <View style = {{height: 10}} />
                    </View>
                </View>
            </ModalView>
        );
    }
    activeValidity(){
        var shop_promotion = {};
        if (this.data.shop_promotion != null) {
            shop_promotion = safeObj(this.data.shop_promotion)[0];
        }
        if(isEmpty(shop_promotion.start_time) || isEmpty(shop_promotion.end_time)){
            return<View/>
        }
        return (
           <View>
               <View style={{height:70,justifyContent: 'center',flex:1}}>
                   <Text style={{color:darkNomalColor(),fontSize:14,marginLeft:15}}>{shop_promotion.title}</Text>
                   <Text style={{color:darkLightColor(),fontSize:13,marginLeft:15,marginTop:5}}>
                       有效期：{shop_promotion.start_time} - {shop_promotion.end_time}
                   </Text>
               </View>
               <View style={{backgroundColor:separatorColor(),height:1,width:Dimensions.get('window').width,marginTop:0}}/>
           </View>
        )
    }

    rendercontentView(){

        var shop_promotion = {};
        var sub_items = [];
        if (this.data.shop_promotion != null) {
            shop_promotion = this.data.shop_promotion[0];
            if (shop_promotion.sub_items != null){
                let manjianInfos = []
                shop_promotion.sub_items.map((info,index)=>{
                    if (info.type == 0) {
                        manjianInfos.push(info.app_desc)
                    } else {
                        sub_items.push(info)
                    }
                })
                if (manjianInfos.length > 0) {
                    sub_items.unshift({
                        name:manjianInfos.join('; '),
                        type:0,
                        shipping_desc:'',
                        shipping_explain:'',
                        money_desc:'',
                        coupon_desc:'',
                        coupon_explain:''
                    })
                }
            }
        }
        if(isNotEmpty(this.data.open_desc) && this.data.dict_bool_account_status == 0){
            sub_items.push({
                name:this.data.open_desc,
                type:2,
                shipping_desc:'',
                shipping_explain:'',
                money_desc:'',
                coupon_desc:'',
                coupon_explain:''
            })
        }
        // 数组
        var itemAry = [];

        // 遍历
        var dataitems = sub_items;
        for (let i = 0; i<dataitems.length; i++) {
            let dataItem = dataitems[i];
            let content1 = dataItem.name;
            if (dataItem.shipping_desc.length > 0){
                content1 += ''+dataItem.shipping_desc;
            }
            let content2 = '';
            if (dataItem.shipping_explain.length > 0) {
                content2 += '('+(<Text style={{color:darkTextColor(),fontSize:13}}>
                    {dataItem.shipping_explain}
                </Text>)+')';
            }
            let content3 = '';
            if (dataItem.money_desc.length > 0){
                content3 += ''+dataItem.money_desc;
            }
            if (dataItem.coupon_desc.length > 0){
                content3 += ''+dataItem.coupon_desc;
            }
            if (dataItem.coupon_explain.length > 0) {
                content3 += '('+dataItem.coupon_explain+')';
            }
            let hiddenArrow = dataItem.name == '单品包邮'
            let iconText = dataItem.type==0?'满减':dataItem.type==1?'包邮':dataItem.type==2?'开户领券':''
            itemAry.push(
                <View key={'favourable'+i} style={{width:kScreenWidth,flex:1,padding:11}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{if(!hiddenArrow){dataItem.type==2?this._goOpenAccountAction():this._toshopAllGoods(dataItem)}}} style={{flexDirection:'row',alignItems:'center',flex:1}}>
                        <LinearGradient colors={['rgb(248,221,211)','rgb(248,221,211)']}
                                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                        locations={[0,1]}
                                        style={{width: dataItem.type==2?53:33,height: 14,borderRadius:2,justifyContent:'center',alignItems:'center',}}>
                            <Text style={{fontSize:10,color:'#e92c2e'}}>{iconText}</Text>
                        </LinearGradient>
                        <View style={{flex:1}}>
                            <Text style={{marginLeft:5,color:darkTextColor(),fontSize:13}}>
                                {content1}
                                {
                                    dataItem.shipping_explain.length > 0 ?(<Text style={{color:darkTextColor(),fontSize:13}}>
                                        ({dataItem.shipping_explain})
                                    </Text>):(null)
                                }
                                {content3}
                            </Text>
                        </View>
                        {hiddenArrow?null:
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                {dataItem.type==2?
                                <Text style={{	fontSize: 13, fontWeight:'bold', color: "#333333", }}>申请开户</Text>
                                :<></>}
                                <Image
                                    style={{width:8,height:14,marginLeft:6,marginRight:13,resizeMode:'contain'}}
                                    source={require('../../../../img/toPayArrow.png')}
                                />
                            </View>
                        }

                    </TouchableOpacity>

                </View>
            );
        }

        return itemAry;

    }
    ReceviceFavourable(){
        return(
            <View style={{flex:1}}>
                <Text style = {{color: '#999', fontSize: 14,marginLeft:11}}>可领取优惠券</Text>
                <FlatList ref = {(flatList) => this._flatList = flatList} extraData = {this.state} data = {this.state.dataArray} renderItem = {this._renderItem.bind(this)} ListFooterComponent = {() => this._footerView()}
                />
            </View>

        )
    }
    haveReceviceFavourable(){
        return(
            <View style={{flex:1}}>
                <Text style = {{color: '#999', fontSize: 14,marginLeft:11}}>已领取优惠券</Text>
                <FlatList ref = {(flatList) => this._flatList = flatList} extraData = {this.state} data = {this.state.dataSource} renderItem = {this._renderItem.bind(this)} ListFooterComponent = {() => this._footerView()}
                />
            </View>

        )
    }

    _renderItem = (item,index) => {

        if (item.item.time_start) {
            item.item.start_time = item.item.time_start
        }
        if (item.item.time_end) {
            item.item.end_time = item.item.time_end
        }

        let validTime = item.item.start_time.split('-').join('.') + '-' + item.item.end_time.split('-').join('.')
        let isCanGet = item.item.get === '1'
        let btnTitle = isCanGet?'点击领取':'已领取'
        let scale = 360/kScreenWidth
        return (
            <View style={{height:110,flex:1}}>
                <View style={styles.cell}>
                    <ImageBackground style={{width:112*scale,height:100,justifyContent:'center',alignItems:'center'}} source={YFWImageConst.Icon_icon_coupon_backimage} imageStyle={{resizeMode:'stretch'}}>
                        <Text style={{color:'white',fontSize:21,fontWeight:'bold'}}>¥<Text style={{fontSize:42}}>{parseInt(item.item.money)}</Text></Text>
                    </ImageBackground>
                    <View style={{flex:1,marginLeft:14*scale}}>
                        <View style = {{marginTop:19,flexDirection:'row',alignItems:'center'}}>
                            <View style={{height:adaptSize(16),borderRadius:adaptSize(8),borderWidth: 1,borderColor:'#547cff',marginRight:adaptSize(5),paddingHorizontal:6,justifyContent:'center'}}>
                                <Text style={{fontSize:12,color:'#547cff',includeFontPadding:false}}>{item.item.type==1?'店铺':'单品'}</Text>
                            </View>
                            <Text style={{color:darkTextColor(),fontSize:13*scale,fontWeight:'bold'}}>{item.item.title}</Text>
                        </View>
                        <View style={{flex:1}}/>
                        <Text style={{color:darkTextColor(),fontSize:11*scale,marginBottom:21*scale,marginRight:78*scale}}>{validTime}</Text>
                    </View>
                    {isCanGet?
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{width:63,height:23,right:14,bottom:14,position:'absolute'}}
                            onPress={()=> {if(isCanGet){this._getCouponMethod(item.item.id,item.index)}}}
                        >
                            <LinearGradient style={{width:63,height:23,borderRadius:11}} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                                    <Text style={{ fontSize: 12, color: 'white',}}>{btnTitle}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                        :
                        <View style={{width:63,height:21,right:14,bottom:14,position:'absolute',borderRadius:11, borderWidth: 1, borderColor: "#054cff"}}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                                <Text style={{ fontSize: 12, color: '#054cff',}}>{btnTitle}</Text>
                            </View>
                        </View>
                    }
                </View>
            </View>
        );

    }

    _footerView(){

        return(
            <View style={{height:20}}/>
        );
    }

    _faetchShopCarInfo() {
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            return
        }
        if (isEmpty(YFWUserInfoManager.ShareInstance().shopCarInfo)) {
            let paramMap = new Map();
            paramMap.set('__cmd', 'store.buy.cart.getCart')
            paramMap.set('isDiffLostMedicine','1')
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap , (res)=>{
                YFWUserInfoManager.ShareInstance().shopCarInfo = res.result
                this.shopGoodsPrice = this._updateChooseMedicine(YFWUserInfoManager.ShareInstance().shopCarInfo)
            })
        } else {
            this.shopGoodsPrice = this._updateChooseMedicine(YFWUserInfoManager.ShareInstance().shopCarInfo)
        }
    }

    _updateChooseMedicine(carInfoData){
        let data = itemAddKey(YFWWDShopCarModel.getModelArray(carInfoData));
        let firstLoad = YFWUserInfoManager.ShareInstance().firstTimeLoadShopCar
        let  new_selectData = [];
        let sum = 0
        data.forEach((shopValue,shopIndex,shopArray)=>{
            if(shopValue.shop_id == this.data.shop_id) {
                shopValue.cart_items.forEach((car_item,index,array)=>{
                    if (car_item.type == 'package' || car_item.type == 'courseOfTreatment') {
                        let nextPrice = Number.parseFloat(car_item.price) * Number.parseInt(car_item.count);
                        if (firstLoad) {
                            new_selectData.push(car_item);
                            sum += nextPrice
                        } else if(YFWUserInfoManager.ShareInstance().addCarIds.get(safe(car_item.package_id))){
                            new_selectData.push(car_item);
                            sum += nextPrice
                        }
                    } else if (car_item.type == 'medicines') {
                        car_item.medicines.map((car_item)=>{
                            let nextPrice = Number.parseFloat(car_item.price) * Number.parseInt(car_item.quantity);
                            if (firstLoad) {
                                new_selectData.push(car_item);
                                sum += nextPrice
                            } else if(YFWUserInfoManager.ShareInstance().addCarIds.get(safe(car_item.shop_goods_id))){
                                if(car_item.dict_store_medicine_status > 0){
                                    new_selectData.push(car_item);
                                    sum += nextPrice
                                }
                            }
                        })
                    }
                });
            }
        });
        console.log(sum,'sum')
        return sum;
    }

    _goOpenAccountAction(){
        this.dismiss()
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate,{type:kRoute_apply_account,value:this.data.shop_id});
    }

    _toshopAllGoods(dataItem){
        this.dismiss()
        const { navigate } = this.props.navigation;
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            doAfterLogin(navigate,()=>{})
            return
        }
        if (dataItem.type != 0) {
            pushWDNavigation(navigate,{type:kRoute_shop_detail_list,value:this.data.shop_id,priceSumInShop:this.shopGoodsPrice,goShop:true,from:'detail'});
        } else {
            YFWUserInfoManager.ShareInstance().jumpToAddGoodsShopId.push(this.data.shop_id);
            pushWDNavigation(navigate,{type:kRoute_shop_detail_list,value:this.data.shop_id,priceSumInShop:this.shopGoodsPrice,goShop:true,from:'detail'});
        }
    }


    //领取优惠券
    _getCouponMethod(coupon_id,index){

        if (coupon_id == null){
            return;
        }
        if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            this.dismiss()
        }
        let{navigate} = this.props.navigation
        doAfterLogin(navigate,()=>{
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'store.buy.usercoupons.acceptCoupon');
            paramMap.set('id', coupon_id);
            viewModel.TCPRequest(paramMap, (res) => {
                YFWToast('领取成功');
                if (res && (res.result+'' === '1' || res.result+'' === '2')) {//1代表已领 2 代表 还可继续领取
                        let infosArray = deepCopyObj(this.state.dataArray)
                        let info = infosArray[index]
                        info.aleardyget = 1
                        info.get = '0'
                        this.state.dataArray[index].user_coupon_count++
                        let data = this.state.dataSource
                        data.push(info)
                        //max_claim_quantity==0 代表不限数量
                        if (info.max_claim_quantity != 0 && info.max_claim_quantity <= this.state.dataArray[index].user_coupon_count) {
                            this.state.dataArray[index].get = '0'
                            this.state.dataArray.splice(index,1)
                        }
                        this.setState({
                            dataSource:data
                        })
                }

            });
        })
    }
}



const styles = StyleSheet.create({
    cell: {
        marginHorizontal:10,marginTop:10,height:100,
        alignItems: 'center',flexDirection: 'row',
        shadowColor: "rgba(250, 250, 250, 0.5)",
        backgroundColor:'white',
        shadowOffset: {
                    width: 0,
                    height: 4
                    },
        shadowRadius: 8,
        shadowOpacity: 1
    },
    text: {
        fontSize: 20,
        textAlign: 'center'
    },
    item: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'

    },
    shareImage: {
        width: 40,
        height: 40
    },
    shareView: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    }
});
