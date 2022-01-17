import React, {Component} from 'react';
import {
    View,
    ScrollView,
    Platform,
    Image,
    Text,
    TouchableOpacity, Dimensions, StyleSheet,
    DeviceEventEmitter,NativeModules
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    tcpImage,
    kScreenHeight,
    safe,
    convertShopImage,
    isNotEmpty,
    safeObj
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {backGroundColor, darkLightColor, darkNomalColor, yfwGreenColor, yfwOrangeColor} from '../../Utils/YFWColor'
import YFWShopDetailIntroModel from "../Model/YFWShopDetailIntroModel";
import ZoomImage from '../../widget/YFWZoomImage';
import {Easing} from 'react-native';
import YFWShopDetailInfoModel from "../Model/YFWShopDetailInfoModel";
import { isIphoneX } from 'react-native-iphone-x-helper';
import YFWStartScore from '../../widget/YFWStartScore';
import BigPictureView from '../../widget/BigPictureView';
import YFWMore from '../../widget/YFWMore';
import SharePoster from '../../widget/SharePoster';
const {StatusBarManager} = NativeModules;

export default class YFWShopDetailIntroController extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        header:null

    });


    constructor(props, context) {

        super(props, context);
        this.state = {
            dataInfo:{},
            qualificationItems:[],
            sceneItems:[],
            shareData: {
                type : 'poster',
                page: 'shop',
                shopID: this.shopID,
                title: '',
                image: '',
                content: '更多商品，速来围观'
            }
        }
        this.shopID = this.props.navigation.state.params.state.value;
        let marginTop
        if(Platform.OS === 'ios'){
            marginTop = isIphoneX()?44+2:20+2
        }else if(Platform.Version >19){
            marginTop = StatusBarManager.HEIGHT
        }
        this.marginTop = marginTop
        this.headerHeight = marginTop+40+10
        this.qualificationImgs = [];
        this.sceneImgs = [];
        this.handleData();
    }

    componentDidMount() {

    }

    handleData(){

        // this._requestShopDetail();
        // this._requestShopImageList();
        this._requestData()
    }


    //@ Request
    _requestData () {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        let cmd = 'guest.shop.getShopInfo as ShopInfo,guest.shop.getShopQualification as ShopQualification'
        paramMap.set('ShopInfo', {'storeid': this.shopID});
        paramMap.set('ShopQualification', {'storeid': this.shopID});
        paramMap.set('__cmd', cmd);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isNotEmpty(res.result)) {

                let dataArray = YFWShopDetailInfoModel.getModelArray(res.result.ShopInfo);
                let sceneItems = YFWShopDetailIntroModel.getModelArray(safeObj(res.result.ShopQualification).sj_items)
                let qualificationItems = YFWShopDetailIntroModel.getModelArray(safeObj(res.result.ShopQualification).zz_items);
                qualificationItems = itemAddKey(qualificationItems);
                sceneItems = itemAddKey(sceneItems);
                this.state.qualificationItems = qualificationItems
                this.state.sceneItems = sceneItems
                let logo = ''
                if (safe(dataArray.logo_img_url).length > 0) {
                    logo = dataArray.logo_img_url
                    logo = logo.indexOf('noyaodian_logo.png') == -1 ? logo : (sceneItems.length>0 ? convertShopImage(sceneItems[0].show_image_suffix,sceneItems[0].image_file) : '')
                } else {
                    logo = sceneItems.length>0 ? convertShopImage(sceneItems[0].show_image_suffix,sceneItems[0].image_file) : ''
                }
                let { shareData } = this.state
                shareData.title = safe(dataArray.title)
                shareData.image = logo
                shareData.shopID = safe(dataArray.shop_id)
                this.setState({
                    dataInfo:dataArray,
                    shareData: shareData
                });
                this.getImageArray()
            }

        },(error)=>{

        });
    }

    _requestShopDetail() {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.shop.getShopInfo');
        paramMap.set('storeid', this.shopID);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            let dataArray = YFWShopDetailInfoModel.getModelArray(res.result);
            this.setState({
                dataInfo: dataArray,
            });

        },(error)=>{

        });

    }

    _requestShopImageList(){

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.shop.getShopQualification');
        paramMap.set('storeid',  this.shopID);
        viewModel.TCPRequest(paramMap, (res)=> {
            let qualificationItems = YFWShopDetailIntroModel.getModelArray(res.result.zz_items);
            let sceneItems = YFWShopDetailIntroModel.getModelArray(res.result.sj_items);
            qualificationItems = itemAddKey(qualificationItems);
            sceneItems = itemAddKey(sceneItems);
            this.state.qualificationItems = qualificationItems,
            this.state.sceneItems = sceneItems,
            this.getImageArray()
            this.setState({})
        });

    }


    //@ Action



    //@ View
    render() {
        let topViewHeight = 350
        return(
            <View style={{flex:1,backgroundColor:'#fafafa'}}>
                <Image style={{height:topViewHeight,width:kScreenWidth,position:'absolute',top:-1,left:0,right:0,resizeMode:'stretch'}} source={require('../../../img/shop_bg.png')}/>
                {this._renderNavigationView()}
                <ScrollView style={{flex:1}}>
                    {this._renderTopView()}
                </ScrollView>
            </View>
        );

    }

    _renderTopView(){
        return (
            <View style={{width:kScreenWidth,marginBottom:20}}>
                {this._renderHeaderView()}
                {this._renderEvaluationView()}
                {this._renderSingleBackView()}
                {this._renderQualificationItemView()}
                {this._renderSceneItemView()}
                <BigPictureView ref={(view)=>{this.picView = view}}/>
            </View>
        )
    }


    _renderNavigationView(){
       let headerHeight = this.headerHeight
       let marginTop = this.marginTop
        return (
            <View style={{width:kScreenWidth,height:headerHeight,resizeMode:'contain',flexDirection:'row'}} >
                 <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} activeOpacity={1}
                                  style={{width:50,height:40,justifyContent:'center',marginTop:marginTop}}>
                    <Image style={{width:11,height:19,marginLeft:12,resizeMode:'contain'}}
                           source={ require('../../../img/dingdan_back.png')}/>
                </TouchableOpacity>
                <View style={{flex:1,height:40,justifyContent:'center',alignItems:'center',marginTop:marginTop}}>
                    <Text style={{color:'white',fontSize:17,fontWeight:'700'}}>店铺详情</Text>
                </View>
                <View style={{width:50,height:40,marginTop:marginTop,justifyContent:'center'}}>
                    <YFWMore fromPage='shop' shareData={this.state.shareData} />
                </View>
                <SharePoster shareData = {this.state.shareData} from = 'shop' type="Poster" navigation = {this.props.navigation}/>
            </View>
        )
    }

    //头部视图
    _renderHeaderView(){
        let isShowStoreStatus = this.state.dataInfo.dict_store_status == 4?true:false
        let item = this.state.dataInfo;
        let hasLogo = safe(item.logo_img_url).indexOf('noyaodian_logo.png') == -1
        return(
            <View style={{minHeight:84,paddingHorizontal:13}}>
                <View style={[{flex:1,backgroundColor:'white',borderRadius:10}]}>
                    <View style={[BaseStyles.leftCenterView,{height:35,marginTop:12}]}>
                        {hasLogo?<Image style={{height: 35, width: 70, resizeMode: "contain",marginLeft:8}} source={{uri: item.logo_img_url}}/>:null}
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:9,marginRight:17,flex:1,fontSize:15,color:'rgb(51,51,51)',fontWeight:'500'}]} numberOfLines={2}>{item.title}</Text>
                        {isShowStoreStatus?<View style={{alignItems:'center',justifyContent:'center',width:65,height:23,borderRadius:11.5,borderWidth:1,borderColor:'rgb(31,219,155)',marginRight:10}}>
                            <Text style={{fontSize:12,color:'rgb(31,219,155)'}}>已签约</Text>
                        </View>:null}
                    </View>
                    <Text style={{marginHorizontal:8,marginTop:13,marginBottom:8,fontSize:12,color:'rgb(102,102,102)'}} numberOfLines={2}>{item.address}</Text>
                </View>
            </View>
        );
    }

    //服务评价
    _renderEvaluationView(){

        let item = this.state.dataInfo;
        return(
            <View style={{marginTop:10,paddingHorizontal:13}}>
                <View style={[{flex:1,backgroundColor:'white',borderRadius:10}]}>
                    <View style={[BaseStyles.leftCenterView,{marginLeft:20,marginTop:16}]}>
                        <Text style={{fontSize:12,color:'rgb(153,153,153)'}}>{'服务总评'}</Text>
                        <YFWStartScore style={{marginLeft:23}} starSize={13} total={5} stars={item.total_star} starSpacing={1}/>
                        <Text style={{fontSize:12,color:'rgb(153,153,153)',marginLeft:5}}>(共{item.evaluation_count}人参加评分)</Text>
                    </View>
                    <View style={{marginLeft:20}}>
                        {this._renderEvaluationItem('客户服务',item.service_star,item.service_rate,{marginTop:7})}
                        {this._renderEvaluationItem('发货速度',item.delivery_star,item.send_rate,{marginTop:7})}
                        {this._renderEvaluationItem('物流速度',item.shipping_star,item.logistics_rate,{marginTop:7})}
                        {this._renderEvaluationItem('商品包装',item.package_star,item.package_rate,{marginTop:7,marginBottom:16,})}
                    </View>
                </View>
            </View>
        );
    }

    _renderEvaluationItem(title,star,percent,style){

        return (
            <View style={[BaseStyles.leftCenterView,style]}>
                <Text style={{fontSize:12,color:'rgb(153,153,153)'}}>{title}</Text>
                <Text style={{fontSize:15,color:'rgb(255,51,0)',marginLeft:23}}>{star}
                    <Text style={{fontSize:12}}>分</Text>
                </Text>
                <Text style={{fontSize:12,color:'rgb(102,102,102)',marginLeft:11}}>领先{percent}的商家</Text>
            </View>
        );

    }


    //退单栏
    _renderSingleBackView(){

        let item = this.state.dataInfo;
        return(
            <View style={{height:70,paddingHorizontal:13,justifyContent:'center',marginTop:10}}>
                <View style={[{flex:1,justifyContent:'center',backgroundColor:'white',borderRadius:10}]}>
                    <View style={[BaseStyles.leftCenterView]}>
                        <Text style={{fontSize:12,color:'rgb(153,153,153)',width:133,marginLeft:20}}>退单率：</Text>
                        <Text style={{fontSize:12,color:'rgb(31,219,155)'}}>{item.return_rate}</Text>
                    </View>
                    <View style={[BaseStyles.leftCenterView,{marginTop:10}]}>
                        <Text style={{fontSize:12,color:'rgb(153,153,153)',width:133,marginLeft:20}}>平均发货时长：</Text>
                        <Text style={{fontSize:12,color:'rgb(31,219,155)'}}>{item.avg_send_time}</Text>
                    </View>
                </View>
            </View>
        );

    }

    //资质栏
    _renderQualificationItemView(){

        if (this.state.qualificationItems.length > 0){

            return(
                <View style={{paddingHorizontal:13}}>
                    <View style={[BaseStyles.leftCenterView,{height:40}]}>
                        <Text style={[{fontSize:13,fontWeight:'500',color:'rgb(51,51,51)'}]}>商家资质</Text>
                    </View>
                    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                        {this._renderShopImagesView(this.state.qualificationItems,1)}
                    </View>
                </View>
            );

        }

    }

    //实景栏
    _renderSceneItemView(){

        if (this.state.sceneItems.length > 0){

            return(
                <View style={{paddingHorizontal:13}}>
                    <View style={[BaseStyles.leftCenterView,{height:40}]}>
                        <Text style={[{fontSize:13,fontWeight:'500',color:'rgb(51,51,51)'}]}>商家实景</Text>
                    </View>
                    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                        {this._renderShopImagesView(this.state.sceneItems,2)}
                    </View>
                </View>
            );

        }

    }

    //商家资质、实景视图
    _renderShopImagesView(array,type){
        let items = [];
        for (let i = 0 ;i<array.length;i++){
            let imageItem = array[i]
            if (type == 1) {
                let img = convertShopImage(imageItem.show_image_suffix,imageItem.image_file)
                items.push(
                    <TouchableOpacity key={'qualification'+i} style={[styles.outViewStyle,{marginTop:i*2>2?10:0,marginLeft:i%2==1?10:0,borderRadius:10}]}
                        onPress = {()=>{this.picView.showView(this.qualificationImgs,i)}} activeOpacity={1}>
                        <View style={{flex:1 , backgroundColor:'white' , alignItems:'center',borderRadius:10}} >
                            <Image source={{uri:img}}
                                style={styles.iconStyle} resizeMode={'contain'}/>
                            <Text style={[styles.visitedTitleStyle,{fontSize:11,marginTop:5}]}>
                                {imageItem.image_name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            }else{
                let img = convertShopImage(imageItem.show_image_suffix,imageItem.image_file)
                items.push(
                    <TouchableOpacity style={{width:kScreenWidth-26,height:171*kScreenWidth/375,justifyContent:'center', alignItems:'center',marginTop:i==0?0:10,borderRadius:10,overflow:'hidden'}}
                        onPress = {()=>{this.picView.showView(this.sceneImgs,i)}} activeOpacity={1}>
                        <Image source={{uri:img}}
                                style={{width:kScreenWidth-26,height:171*kScreenWidth/375}} resizeMode={'stretch'}/>
                    </TouchableOpacity>
                );
            }
        }

        return items;
    }

    getImageArray(){

        for (let imageItem of this.state.qualificationItems){
                let img = convertShopImage(imageItem.show_image_suffix,imageItem.image_file)
                this.qualificationImgs.push({url:img})
        }
        for (let imageItem of this.state.sceneItems){
                let img = convertShopImage(imageItem.show_image_suffix,imageItem.image_file)
                this.sceneImgs.push({url:img})
        }
    }


}


var cols = 2;
var boxW = (kScreenWidth-36) / 2;
var vMargin = 10
var hMargin = 0;
const styles = StyleSheet.create({
    outViewStyle:{
        //    设置侧轴的对齐方式
        alignItems:'center',
        width:boxW,
        height:boxW,
        marginLeft:hMargin,
        marginTop:vMargin,
    },
    iconStyle:{
        width:boxW - 50,
        height:boxW - 50,
        marginTop:10,
    },
    visitedTitleStyle:{

        width:boxW,
        textAlign:'center',
        fontSize: 14,
        color:'rgb(51,51,51)',
        marginTop:15,
    },
    img: {}
});
