import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import {darkLightColor, darkNomalColor, darkTextColor, separatorColor,backGroundColor} from "../Utils/YFWColor";
import DashLine from '../widget/DashLine'
import ExpandableView from '../widget/ExpandableView'
import {
    isEmpty,
    isNotEmpty,
    kScreenWidth,
    safe,
    safeObj,
    tcpImage,
    convertImg,coverAuthorizedTitle, safeArray
} from '../PublicModule/Util/YFWPublicFunction'
import {doAfterLogin, pushNavigation} from '../Utils/YFWJumpRouting'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWSameShopDataModal from './Model/YFWSameShopDataModal'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWToast from "../Utils/YFWToast";
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_PRESCRIPTION,
    TYPE_SINGLE,
    TYPE_OTC
} from "../widget/YFWPrescribedGoodsTitle";
import FastImage from 'react-native-fast-image'
import YFWOpenText from '../widget/YFWOpenText';

const addSameText = "加入同店购"
const cancelSameText = "取消同店购"
export default class YFWSellersListGoodsHeaderView extends Component {

    static defaultProps = {
        Data: undefined,
        shopCount: '0',
    }

    constructor(props) {
        super(props);
        this.state = {
            sameShopPic: [],
            sameShopText: '选择商家',
            tipsTest: addSameText,
            tipsTestColor: '#ff8364',
            showSameShopData: false,
            deleteIconVisibility: false,
            hidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice()
        };
        this.addListener()
    }

    addListener(){
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this.getSameData()
            }
        );
    }

    getSameData(){
        this.requestSameShopData_TcP()
    }

    componentDidMount() {
        //点击同店购展开或者关闭
        this.sameStoreListener = DeviceEventEmitter.addListener(('SameStorClick'), (value)=> {
            this.setState({
                showSameShopData:!this.state.showSameShopData
            })
        })
        this.priceListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            this.setState({
                hidePrice: isHide
            })
        })
    }

    componentWillUnmount(){
        if(isNotEmpty(this.sameStoreListener)){
            this.sameStoreListener.remove()
        }
        this.didFocus && this.didFocus.remove()
        this.priceListener&&this.priceListener.remove()
    }

    componentWillReceiveProps(){
        if(Object.keys(isEmpty(this.props.Data)?{}:this.props.Data).length >0){
            this.setState({
                tipsTestColor: this.props.Data.type == '2' ? '#ff8364' : '#ff8364',
                tipsTest: this.props.Data.type == '2' ? cancelSameText : addSameText,
            })
        }
    }

    render() {
        if(isEmpty(this.props.Data) || Object.keys(isEmpty(this.props.Data)?{}:this.props.Data).length === 0){
            return<View />
        }
        let dataInfo = safeObj(this.props.Data)
        let explainTitle = safe(dataInfo.applicability).replace(/<[^>]+>/g,"").replace(/(↵|\r|\n)/g,"").trim()
        return (
            <View style={{backgroundColor:backGroundColor()}}>
                <View style={[styles.container,{backgroundColor:'#FFFFFF'}]}>
                    {this.renderSameShopView()}
                    <View style={styles.content}>
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity activeOpacity={1} onPress={()=>this.showAllBigImage()}>
                                {this.renderGoodsImage()}
                            </TouchableOpacity>
                            <View style={{flex:1,marginLeft:11}}>
                                {this.renderTitleView()}
                                <View style={[styles.container4]}>
                                    <Text style={styles.smrollSizeText}>产品规格:<Text style={{color:dataInfo.isCanSale?darkTextColor():darkLightColor()}}>{safe(dataInfo.standard)}</Text></Text>
                                </View>
                                <View style={[styles.container4,{marginTop:7}]}>
                                    <Text style={styles.smrollSizeText}>剂型:<Text style={{color:dataInfo.isCanSale?darkTextColor():darkLightColor()}}>{safe(dataInfo.troche_type)}</Text></Text>
                                </View>
                                <View style={[styles.container4,{marginTop:7}]}>
                                    <Text style={styles.smrollSizeText}>{safe(dataInfo.authorizedCode_title)}:<Text style={{color:dataInfo.isCanSale?darkTextColor():darkLightColor()}}>{safe(dataInfo.authorized_code)}</Text></Text>
                                </View>
                                <View style={[styles.container4]}>
                                    <Text style={styles.smrollSizeText}>生产企业:<Text style={{color:dataInfo.isCanSale?darkTextColor():darkLightColor()}}>{safe(dataInfo.mill_title)}</Text></Text>
                                </View>
                                {isNotEmpty(dataInfo.bentrusted_store_name) && (dataInfo.name_path && dataInfo.name_path.indexOf('保健') !== -1)?<View style={[styles.container4]}>
                                    <Text style={styles.smrollSizeText}>委托企业:<Text style={{color:dataInfo.isCanSale?darkTextColor():darkLightColor()}}>{safe(dataInfo.bentrusted_store_name)}</Text></Text>
                                </View>:<View />}
                                {this.renderColdTip()}
                                <View style={{marginTop:9,flexDirection:'row'}}>
                                    {this.renderAddSameShopView()}
                                    <View style={{flex:1}}></View>
                                </View>
                                {explainTitle.length>0&&explainTitle.length < 22?<Text style={[styles.smrollSizeBlackText,{flex:1,marginTop:22}]} numberOfLines={1}>{explainTitle}</Text>:null}
                            </View>
                        </View>
                        {explainTitle.length > 22?<YFWOpenText style={{fontSize:12,width:kScreenWidth-44,marginHorizontal:22,color: '#999',lineHeight:14,marginTop:15}}
                            expandTextStyle={{color:'#1fdb9b',fontSize:12}}
                            numberOfLines={2}>{explainTitle}</YFWOpenText>:null}
                        {/* {explainTitle.length > 22?<Text style={[styles.smrollSizeBlackText,{flex:1,marginTop:15,marginHorizontal:22}]} numberOfLines={2}>{explainTitle}</Text>:null} */}
                    </View>
                </View>
                <View style={[styles.shadowStyle,{paddingTop:8,marginTop:14}]}>
                    {this._renderValueTrendAndStandard()}
                </View>
            </View>
        );
    }

    /**
     *冷藏药品提示
     */
    renderColdTip() {
        if (safeObj(this.props.Data).dict_bool_cold_storage == 1) {
            return (
                <View style={{flexDirection:'row',marginVertical:3}}>
                    <View style={{backgroundColor:'#e9f7ff',borderRadius:3,minHeight:18,marginLeft:0,paddingVertical:4,flexDirection:'row',alignItems:'center'}}>
                        <Image style={{width:12,height:14,marginLeft:4,tintColor:'#017dc5'}} source={require('../../img/icon_snowflakes.png')}></Image>
                        <Text style={{color:'#017dc5',fontSize:12,marginLeft:6,marginRight:4}}>{'本药品须冷藏存储，仅限同城购买。'}</Text>
                    </View>
                    <View style={{flex:1}}></View>
                </View>
            )
        }
        return null
    }

    renderGoodsImage(){
        if (Platform.OS == 'ios') {
            return (
                <FastImage
                style={styles.iconStyle}
                source={{uri:tcpImage(safeObj(safeObj(this.props.Data).img_url))}}
                resizeMode={FastImage.resizeMode.contain}
                />
            )
        }
        return (
            <Image
            style={[styles.iconStyle,{resizeMode: 'contain'}]}
            source={{uri:tcpImage(safeObj(safeObj(this.props.Data).img_url))}}/>
        )
    }

    _renderValueTrendAndStandard(){
        return(
            <View style={{flex:1,flexDirection:'row',backgroundColor:'#FFFFFF',paddingTop:5,alignItems:'center',paddingBottom:5}}>
                    <View style={{flexDirection:'row-reverse',alignItems:'center',justifyContent:'center'}}>
                        <TouchableOpacity activeOpacity={1}  onPress={()=>this._checkPriceMovement()}>
                            <Image style={{width:60,height:33,resizeMode:'contain',marginHorizontal:7,bottom:-3}} source={require('../../img/thumb.png')}/>
                        </TouchableOpacity>
                        <Text style={{textAlign:'center',color: 'rgb(153,153,153)',fontSize:13,fontWeight:'500',marginLeft:3}}>个商家报价</Text>
                        <Text accessibilityLabel='shop_num' style={{fontSize:13,color:'#16c08e',textAlign:"center",marginLeft:18,fontWeight:'500'}}>{this.convertShopCout(this.props.shopCount)}</Text>
                    </View>
                    <View style={{width:1,height:20,backgroundColor:'#DDDDDD'}}/>
                    <TouchableOpacity hitSlop={{left:0,top:10,bottom:10,right:0}} activeOpacity={1} style={{flexDirection:'row',flex:1,alignItems:'center'}} onPress={()=>this.props.showPopupDialog()}>
                            <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#1fdb9b',marginLeft:10}}/>
                            <Text style={{fontSize:13,color:'#333333',marginLeft:5,textAlign:'center',flex:1}}>{safe(safeObj(this.props.Data).standard)}</Text>
                            <Image style={{width:12,height:12,transform:[{rotate:'90deg'}],resizeMode:'contain',marginRight:15}} source={require('../../img/around_detail_icon.png')}/>
                    </TouchableOpacity>
            </View>
        )
    }

    /**
     * 返回加入同店购按钮
     * @returns {*}
     */
    renderAddSameShopView(){
        // if(this.props.Data.status+'' === 'hide'){
        //     return <View style={{height:20}} />
        // }
        if(!this.state.hidePrice){
            let canSale = safeObj(this.props.Data).isCanSale
            return(
                <TouchableOpacity hitSlop={{left:5,top:10,bottom:10,right:10}} style={[BaseStyles.centerItem,{borderColor: canSale?this.state.tipsTestColor:'#fff',backgroundColor:canSale?'#fff':'#ccc',borderWidth:1,borderRadius:10,height:20}]} activeOpacity={1} onPress={()=>this._showChoosedSameShopGoods()}>
                    <Text style={{fontSize: 12, color: canSale?this.state.tipsTestColor:'#fff',padding:4}}>{canSale?safe(this.state.tipsTest):'暂不销售'}</Text>
                </TouchableOpacity>
            )
        }
    }

    /**
     * 返回处方药提示
     * YFW-3715 比价页改动 去除该功能
     */
    renderPrescribedTips(){
        //3.1.00版本才有，并且现阶段只有HTTP才有
        if(safeObj(this.props.Data).prompt_info){
            return (
                <TouchableOpacity activeOpacity={1} style={{backgroundColor:'#f9f9f9',paddingLeft:15,paddingRight:15,paddingTop:10,paddingBottom:10}}>
                    <Text style={{color:darkLightColor(),fontSize:14}}>{safeObj(this.props.Data).prompt_info}</Text>
                </TouchableOpacity>
            )
        }
    }

    /**
     * 跳转H5单双轨说明
     */
    showPrescribedTips(){
        if(isNotEmpty(safeObj(this.props.Data).prompt_url)){
            pushNavigation(this.props.navigation.navigate,{type:'get_h5',value:this.props.Data.prompt_url,title:'H5单双轨说明页'})
        }
    }

    showAllBigImage(){
        if (isNotEmpty(safeObj(this.props.Data).image_list)) {
            let allImageUrls = safeArray(safeObj(this.props.Data).image_list).map((imageUrl)=>{
                return convertImg(imageUrl)
            })
            pushNavigation(this.props.navigation.navigate,{type:'big_picture',value:{imgs:allImageUrls,index:0}})
        }
    }

    convertShopCout(count){
        try{
            count = parseInt(count)
            if(count > 999){
                count = "999+"
            }
        }catch (e) {}
        return count
    }

    /**
     * 返回价格趋势图标
     * @returns {*}
     */
    renderValueTrend(){
        if(safeObj(this.props.Data).chart_show_status){
            return(
                <View style={[BaseStyles.centerItem,{flexDirection:'row'}]}>
                    <Image style={{width:10,height:10,resizeMode:'contain',marginLeft:5}}
                           source={require('../../img/icon_value_trend_label.png')}/>
                    <Text style={styles.smrollSizeTextColorYellow}>价格指数</Text>
                </View>
            )
        }else{
            return <View width={10+(13*4+4)}/>
        }
    }


    _showChoosedSameShopGoods() {
        if(!safeObj(this.props.Data).isCanSale) {
            return ;
        }
        const {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{
            this._addOrCancleGoodsToSameShop();
        });
    }

    renderTitleView() {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(this.props.Data).PrescriptionType+"" === "1"){
            return this.rednerPrescriptionLabel(TYPE_SINGLE,safeObj(this.props.Data).title,()=>{this.showPrescribedTips()})
        }
        //双轨药
        else if(safeObj(this.props.Data).PrescriptionType+"" === "2"){
            return this.rednerPrescriptionLabel(TYPE_DOUBLE,safeObj(this.props.Data).title,()=>{this.showPrescribedTips()})
        }
        //OTC
        else if(safeObj(this.props.Data).PrescriptionType+"" === "0"){
            return this.rednerPrescriptionLabel(TYPE_OTC,safeObj(this.props.Data).title,()=>{this.showPrescribedTips()})
        }
        //处方药
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL,safeObj(this.props.Data).title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type,title,onClick){

        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={{
                fontSize: 15,
                lineHeight:18,
                color: safeObj(this.props.Data).isCanSale?darkTextColor():darkLightColor(),
                fontWeight:'bold',
                marginLeft: 2,
            }}
            onClick={()=>{onClick && onClick()}}
        />
    }

    renderSameShopView() {
        if (this.state.showSameShopData) {

            let allItems = []
            let cellWidth = (kScreenWidth-5*4-10*2)/5
            let cellHeight = 74*cellWidth/63
            for (let index = 0; index < 5; index++) {
                let item = this.state.sameShopPic[index]
                allItems.push(
                    <View key={index+'c'}>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.editOrSearchClick(index)}} style={[styles.dashedBorder,{overflow:'hidden',marginLeft:index==0?0:5,alignItems:'center',width:cellWidth,height:cellHeight,padding:2}]}>
                            <Image
                                style={{width:cellWidth-4,height:cellHeight-4,resizeMode:'center'}}
                                source={item?{uri:tcpImage(item.imageUrl)}:require('../../img/icon_add.png')}/>
                        </TouchableOpacity>
                        {this.renderDeleteIcon(index+1)}
                    </View>
                )
            }

            return (
                <ExpandableView  ref='same_shop' expanded={false}>
                    <View style={[styles.content,{alignItems:'center',paddingBottom:7}]}>
                        <View  style={{backgroundColor:'white',flexDirection:'row',alignItems:'center',marginHorizontal:10}}>
                            {allItems}
                        </View>
                        <TouchableOpacity activeOpacity={1} hitSlop={{left:10,top:5,bottom:10,right:10}} style={{paddingHorizontal:10,alignItems:'center',marginVertical:7,backgroundColor:'white',borderRadius:10,alignItems:'center',justifyContent:'center',height:20,borderWidth:1,borderColor:'#1fdb9b'}}
                                              onPress={()=>{
                                                  this.changeStateButton()
                                                  YFWNativeManager.mobClick('price page-same store-choose a shop')
                                              }}>
                                <Text
                                    style={{fontSize:10,color:'#1fdb9b',fontWeight:'500'}}>{safe(this.state.sameShopText)}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{height:14,backgroundColor:'#fafafa',width:kScreenWidth}}></View>
                </ExpandableView>
            )
        }
    }

    editOrSearchClick(index){
        if(!(safeArray(this.state.sameShopPic).length>index)){
            this.startSearch()
            YFWNativeManager.mobClick('price page-same store-add goods')
        }
    }

    /**
     * 获取当前商品在同店购的ID
     * @returns {*}
     */
    getSameId(){
        let id = this.props.medicineId
        for (let i = 0; i < safeArray(this.state.sameShopPic).length; i++) {
            if(this.state.sameShopPic[i].medicineid == this.props.medicineId){
                id = this.state.sameShopPic[i].goodsID
            }
        }
        return id
    }

    _addOrCancleGoodsToSameShop() {
        if (this.state.tipsTest == cancelSameText) {
            //取消
            //添加到同店购的时候是需要商品medicineid,但是添加到同店购后会生成一个新的ID，删除商品的时候需要用这个新的ID
            this.deleteGoodsFromSameShop_Tcp( this.getSameId());
        } else {
            //添加
            this.addGoodsToSameShop_Tcp(this.props.medicineId);
        }
        YFWNativeManager.mobClick('price page-same store button')
    }

    addGoodsToSameShop_Tcp(goodsId) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.sameStore.addSameStore');
        paramMap.set('medicineid', goodsId);
        paramMap.set('qty', '1');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let aa = res
            if (res.code == '1') {
                YFWToast("加入成功")
                //刷新数据源
                this.requestSameShopData_TcP();
                //通知同店购的红点显示
                DeviceEventEmitter.emit('SHOW_SAME_SHOP_RED_POINT', {value: true})
                this.props.sameStoreChangeAction && this.props.sameStoreChangeAction()
            }
        },(error)=>{
            //消息已经在errorConfig里面弹了
            this.setState({showSameShopData: true,})
        })
    }

    requestSameShopData_TcP() {
        let ssid = YFWUserInfoManager.ShareInstance().hasLogin();
        if (!ssid)
            return
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.sameStore.getSameStoreList');
        paramMap.set('pageSize', '5');
        paramMap.set('pageIndex', '1');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let result = safeObj(safeObj(res).result)
            let dataArray = YFWSameShopDataModal.getModelArray(safeArray(result.dataList));
            //刷新数据源
            this.changeStatus(dataArray)
            this.setState({
                sameShopPic: dataArray
            })
        }, (error)=> {

        },false);
    }

    changeStatus(dataArray){
        dataArray = safeArray(dataArray)
        DeviceEventEmitter.emit('SHOW_SAME_SHOP_RED_POINT', {value: dataArray&&dataArray.length>0})
        let includ = dataArray.some((item)=>{
            return item.medicineid == this.props.medicineId
        })
        if(includ){
            this.setState({
                showSameShopData: false,
                tipsTest: cancelSameText,
                tipsTestColor: '#ff8364'
            })
        }else{
            this.setState({
                tipsTest: addSameText,
                tipsTestColor: '#ff8364'
            })
        }
    }

    deleteGoodsFromSameShop_Tcp(goodsId) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.sameStore.deleteSameStore');
        paramMap.set('sid', goodsId);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let aa = res
            if (res.code == '1') {
                YFWToast("取消成功")
                this.props.sameStoreChangeAction && this.props.sameStoreChangeAction()
                this.requestSameShopData_TcP();
            }
        })
    }

    renderDeleteIcon(index) {
        if (safeArray(this.state.sameShopPic).length >= index) {
            return (
                <TouchableOpacity activeOpacity={1} style={{position: 'absolute',right:-5,top:-5}} hitSlop={{top:10,left:10,bottom:10,right:5}}  onPress={()=>this.deleteGoodeFromSameShop(index-1)}>
                    <Image style={{width:16,height:17}} source={require('../../img/icon_delect.png')}/>
                </TouchableOpacity>
            )
        }
    }

    deleteGoodeFromSameShop(index) {
        this.deleteGoodsFromSameShop_Tcp(safe(safeArray(this.state.sameShopPic)[index].goodsID));
    }

    editSameShopDate() {
        this.setState({
            sameShopText: '确定',
            deleteIconVisibility: true
        })
    }

    changeStateButton() {
        if (this.state.deleteIconVisibility) {
            this.setState({
                deleteIconVisibility: false,
                sameShopText: '选择商家'
            })
        } else {
            //页面跳转
            if( safeArray(this.state.sameShopPic).length <= 1){
                YFWToast("请至少选择两件商品")
                return
            }
            let ids = ""
            for (let i = 0; i < safeArray(this.state.sameShopPic).length; i++) {
                if(i == this.state.sameShopPic.length-1){
                    ids+= safeObj(this.state.sameShopPic[i]).medicineid
                }else{
                    ids+= safeObj(this.state.sameShopPic[i]).medicineid+","
                }
            }
            const {navigate} = this.props.navigation;
            pushNavigation(navigate, {type: 'buy_in_sameshop',ids:ids})
        }
    }

    _checkPriceMovement() {
        if(safeObj(this.props.Data).chart_show_status){
            YFWNativeManager.startChart(YFWUserInfoManager.ShareInstance().getSsid(),safeObj(this.props.Data).goods_id)
        }
    }

    /*
     * YFW-3715 比价页改动 去除该功能
     * */
    _renderImstructionView() {
        return (
            safeObj(this.props.Data).goods_guid_show === 'true' ?
                (<View
                        style={{backgroundColor:'#FFFFFF',paddingBottom:10,justifyContent:'center',alignItems:'center'}}>
                        <TouchableOpacity activeOpacity={1} onPress={() =>{this._showInstructions(safeObj(this.props.Data).goods_id)}}>
                            <Text style={{fontSize:14,color:'#16c08e'}}>展开商品说明书</Text>
                        </TouchableOpacity>
                    </View>
                ) : ( null )
        )

    }

    _showInstructions(item){
        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'shop_instructions',value:item,guide:safeObj(this.props.Data).guide});
    }

    startSearch(){
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_search'});
    }
}


//设置样式
const styles = StyleSheet.create({
    content:{
        paddingTop:26,
        paddingBottom:19,
        backgroundColor: "#ffffff",
    },
    container: {
        //    确定主轴的方向
        flexDirection: 'column',
        width: Dimensions.get('window').width,
        backgroundColor: 'white',

    },
    container2: {
        //    确定主轴的方向
        flexDirection: 'column',
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
        marginTop: 10,

    },
    container3: {
        //    确定主轴的方向
        flexDirection: 'column',
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },
    iconStyle: {
        width: 107,
        height: 107,
        marginLeft: 17,
    },
    icon2Style: {
        width: 40,
        marginBottom: 10,
        marginTop: 0,
        resizeMode: 'contain',
    },
    cfyIconStyle: {
        resizeMode:'contain',
        height:15,
        width:35,
        marginTop:2,
        marginLeft:5
    },
    separatorStyle: {
        backgroundColor: separatorColor(),
        height: 1,
        width: Dimensions.get('window').width - 100,
        marginLeft: 100,
    },
    titleStyle: {
        fontSize: 14,
        width: Dimensions.get('window').width - 120,
        color: darkTextColor(),
        marginLeft: 5,
        marginRight: 10,
        marginBottom: 5,
    },
    textStyle: {
        fontSize: 13,
        textAlign: 'left',
        color: darkNomalColor(),
        width: Dimensions.get('window').width - 120,
        marginLeft: 10,
        marginTop: 5,
    },
    contentStyle: {
        fontSize: 13,
        textAlign: 'left',
        color: darkNomalColor(),
        width: Dimensions.get('window').width - 60,
        marginLeft: 15,
        marginTop: 10,
    },

    shopCountStyle: {

        width: 120,
        marginTop: 15,
        color: darkNomalColor(),
        textAlign: 'center',
        fontSize: 13,
    },
    shopCountseparatorStyle: {
        backgroundColor: separatorColor(),
        height: 30,
        width: 0.5,
        marginTop: 10,
    },
    goodsStandardStyle: {

        width: 200,
        marginTop: 15,
        marginLeft: 30,
        color: darkNomalColor(),
        textAlign: 'left',
        fontSize: 13,
    },
    clickItemStyle: {

        flex: 1,
        marginTop: 15,
        textAlign: 'center',
        fontSize: 13,
        color: darkNomalColor(),
    },
    container4: {
        flexDirection: 'row',
        marginTop:9,
        alignItems: 'center'
    },
    smrollSizeText: {
        fontSize: 12,
        minWidth:60,
        color: darkLightColor()
    },
    smrollSizeTextColorGreen: {
        fontSize: 13,
        color: '#16c08e'
    },
    smrollSizeTextColorYellow: {
        fontSize: 13,
        color: '#FF9100',
        marginLeft: 5
    },
    smrollSizeTextWithRadio: {

    },
    smrollSizeBlackText: {
        fontSize: 12,
        color: '#999',
        lineHeight:14
    },
    dashedBorder:{
        borderRadius: 7,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    shadowStyle:{
        backgroundColor: "#fff",
	    shadowColor: "rgba(204, 204, 204, 0.5)",
	    shadowOffset: {
		    width: 0,
		    height: 4
	    },
	    shadowRadius: 8,
        shadowOpacity: 1,
        borderRadius: 7,
    }

});