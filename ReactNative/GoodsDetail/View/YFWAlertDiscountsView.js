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
import ModalView from '../../widget/ModalView'


import YFWToast from '../../Utils/YFWToast'
import {
    darkNomalColor,
    darkLightColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor,
} from '../../Utils/YFWColor'
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {doAfterLogin, pushNavigation} from "../../Utils/YFWJumpRouting";
import {
    isNotEmpty,
    itemAddKey,
    safeObj,
    safe,
    adaptSize,
    kScreenWidth,
    deepCopyObj,
    isEmpty
} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import LinearGradient from 'react-native-linear-gradient';
import YFWShopCarModel from '../../ShopCar/Model/YFWShopCarModel';


export default class YFWAlertDiscountsView extends Component {

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
                                <Image style = {{width: 15, height: 15}} source = {require('../../../img/close_button.png')} />
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
                        let use_condition_price = info.name.split('满')[1]
                        use_condition_price = parseInt(use_condition_price.split('元')[0])
                        let money = info.shipping_desc.split('减')[1]
                        money = parseInt(money.split('元')[0])
                        manjianInfos.push('满'+use_condition_price+'元减'+money+'元')
                    } else {
                        sub_items.push(info)
                    }
                })
                if (manjianInfos.length > 0) {
                    sub_items.unshift({
                        name:manjianInfos.join('，'),
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
            itemAry.push(
                <View key={'favourable'+i} style={{width:kScreenWidth,flex:1,padding:11}}>
                    <TouchableOpacity hitSlop={{left:0,top:10,bottom:10,right:0}} activeOpacity={1} onPress={()=>{if(!hiddenArrow){this._toshopAllGoods(dataItem)}}} style={{flexDirection:'row',alignItems:'center',flex:1}}>
                        {dataItem.type==0? <LinearGradient colors={['rgb(250,171,129)','rgb(250,209,110)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center',}}>
                                <Text style={{fontSize:10,color:'white'}}>满减</Text>
                        </LinearGradient>:<LinearGradient colors={['rgb(44,92,241)','rgb(124,100,247)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center',}}>
                                <Text style={{fontSize:10,color:'white'}}>包邮</Text>
                        </LinearGradient>}
                        <Text style={{width: kScreenWidth-42-5-22-13-8,marginLeft:5,color:darkTextColor(),fontSize:13}}>
                            {content1}
                            {
                                dataItem.shipping_explain.length > 0 ?(<Text style={{color:darkTextColor(),fontSize:13}}>
                            ({dataItem.shipping_explain})
                                </Text>):(null)
                            }
                            {content3}
                        </Text>
                        {hiddenArrow?null:<Image
                            style={{width:8,height:14,marginLeft:0,marginRight:13,resizeMode:'contain'}}
                            source={require('../../../img/toPayArrow.png')}
                        />}

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
        let btnBgSource = require('../../../img/button_djlq.png')
        let scale = 360/kScreenWidth
        return (
            <View style={{height:110,flex:1}}>
                <View style={styles.cell}>
                    <ImageBackground style={{width:112*scale,height:100,justifyContent:'center',alignItems:'center'}} source={require('../../../img/icon_coupon_backimage.png')} imageStyle={{resizeMode:'stretch'}}>
                        <Text style={{color:'white',fontSize:21,fontWeight:'bold'}}>¥<Text style={{fontSize:42}}>{parseInt(item.item.money)}</Text></Text>
                    </ImageBackground>
                    <View style={{flex:1,marginLeft:14*scale}}>
                        <View style = {{marginTop:19,flexDirection:'row',alignItems:'center'}}>
                            <View style={{height:adaptSize(16),borderRadius:adaptSize(8),borderWidth: 1,borderColor:'#1fdb9b',marginRight:adaptSize(5),paddingHorizontal:6,justifyContent:'center'}}>
                                <Text style={{fontSize:12,color:'#1fdb9b',includeFontPadding:false}}>{item.item.type==1?'店铺':'单品'}</Text>
                            </View>
                            <Text style={{color:darkTextColor(),fontSize:13*scale,fontWeight:'bold'}}>{item.item.title}</Text>
                        </View>
                        <View style={{flex:1}}/>
                        <Text style={{color:darkTextColor(),fontSize:11*scale,marginBottom:21*scale,marginRight:78*scale}}>{validTime}</Text>
                    </View>
                    {isCanGet?<TouchableOpacity activeOpacity={1}  style={{width:76*scale,height:37*scale,right:4*scale,bottom:8*scale,position:'absolute'}} onPress={()=>
                         {if(isCanGet){this._getCouponMethod(item.item.id,item.index)}}
                        }>
                                <ImageBackground
                                    style={{flex:1,alignItems: 'center',justifyContent: 'center'}}
                                    source={btnBgSource}>
                                    <Text style={{color:'white',fontSize:12*scale,top:-3*scale,includeFontPadding:false}}>{btnTitle}</Text>
                                </ImageBackground>
                    </TouchableOpacity>:
                    <View style={{width:62.5*scale,height:22.2*scale,right:7*scale,bottom:18*scale,position:'absolute',borderRadius:11.1*scale,borderWidth:1,borderColor:'#1fdb9b',justifyContent:'center',alignItems:'center'}}>
                        <Text style={{color:'#1fdb9b',fontSize:12*scale}}>{btnTitle}</Text>
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
            paramMap.set('__cmd', 'person.cart.getCart')
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
        let data = itemAddKey(YFWShopCarModel.getModelArray(carInfoData));
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

    _toshopAllGoods(dataItem){
        this.dismiss()
        const { navigate } = this.props.navigation;
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            doAfterLogin(navigate,()=>{})
            return
        }
        if (dataItem.type != 0) {
            pushNavigation(navigate,{type:'get_shop_detail_list',value:this.data.shop_id,priceSumInShop:this.shopGoodsPrice,goShop:true});
        } else {
            YFWUserInfoManager.ShareInstance().jumpToAddGoodsShopId.push(this.data.shop_id);
            pushNavigation(navigate,{type:'get_shop_detail_list',value:this.data.shop_id,priceSumInShop:this.shopGoodsPrice,goShop:true});
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
            paramMap.set('__cmd', 'person.usercoupons.acceptCoupon');
            paramMap.set('id', coupon_id);
            viewModel.TCPRequest(paramMap, (res) => {
                YFWToast('领取成功');
                if (res && (res.result+'' === '1' || res.result+'' === '2')) {//1代表已领 2 代表 还可继续领取
                        let infosArray = deepCopyObj(this.state.dataArray)
                        let info = infosArray[index]
                        info.aleardyget = 1
                        info.get = '0'
                        this.state.dataArray[index].user_coupon_count++
                        this.state.dataArray[index].aleardyget = 1
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