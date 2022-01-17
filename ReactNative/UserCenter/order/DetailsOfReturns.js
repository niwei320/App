import React from 'react'
import {
    View,
    Text,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    ImageBackground,
    StyleSheet,
    Platform,
    NativeModules
} from 'react-native'
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {isNotEmpty, itemAddKey, isEmpty,kScreenWidth,isIphoneX,tcpImage, safe,safeObj, adaptSize} from "../../PublicModule/Util/YFWPublicFunction";
import OrderClick from "./OrderClick";
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";
const width = Dimensions.get('window').width;
import YFWImageView from '../../widget/YFWImageView'
import {toDecimal} from "../../Utils/ConvertUtils";
import RetrunGoodsInfoModel from './Model/RetrunGoodsInfoModel'
import RetrunGoodsDetailInfoModel from './Model/RetrunGoodsDetailInfoModel'
import StatusView from '../../widget/StatusView'
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import {darkTextColor,darkNomalColor,darkLightColor,yfwRedColor,yfwGreenColor} from '../../Utils/YFWColor'
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView'
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText'
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_SINGLE,
    TYPE_OTC
} from "../../widget/YFWPrescribedGoodsTitle";
import BigPictureView from '../../widget/BigPictureView';
const {StatusBarManager} = NativeModules;
let _this = null
export default class DetailsOfReturns extends React.Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "退货单详情",
        headerRight: <View style={{width:50}}/>,
        headerTransparent: true,
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1
        },
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor:'transparent',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0, backgroundColor:'transparent'},
        headerBackground: <Image ref={(e) => _this.headerImage=e} source={require('../../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}} opacity={0}/>,
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                            onPress={()=>{
                            navigation.state.params.state.gobackKey?navigation.goBack(navigation.state.params.state.gobackKey):navigation.goBack();
                        }}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                    source={ require('../../../img/top_back_white.png')}
                    defaultSource={require('../../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
    });

    constructor(props) {
        super(props)
        _this= this;
        this.orderNo = this.props.navigation.state.params.state.mOrderNo
        this.shopName = this.props.navigation.state.params.state.shopName
        this.pageSource = this.props.navigation.state.params.state.pageSource
        this.orderTotal = this.props.navigation.state.params.state.orderTotal
        this.state = {
            showAddress: true,
            item: [],
            listData: [],
            isFistTime: true,
            headerOpacity: 0
        }
        this.initRequest('init');
        this.listener();
    }

    initRequest(init) {
        this._requestData(init)
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                _this.headerImage && _this.headerImage.setNativeProps({
                    opacity: this.state.headerOpacity
                })

                if (this.state.isFistTime) {
                    this.state.isFistTime = false;
                    return
                }
                this._requestData()
            }
        );
    }

    componentWillUnmount() {
        this.didFocus.remove()
    }

    _requestData(type) {
        this._getRetrunGoodsOrtherInfo(type);
        this._getRetrunGoodsList();
    }

    _getRetrunGoodsList() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnGoodsInfo');
        paramMap.set('orderno', this.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = RetrunGoodsInfoModel.getModelArray(res.result);
            this.setState({
                listData: dataArray
            });
        }, (error)=> {

        }, false);
    }

    render() {
        return (
            <View style={{backgroundColor:'#FFFFFF',flex:1}}>
                <ScrollView
                    onScrollBeginDrag={this._listScroll.bind(this)}
                    onScroll={this._listScroll.bind(this)}
                    onScrollEndDrag={this._listScroll.bind(this)}
                    showsVerticalScrollIndicator={false}>

                    {this._renderHeaderView()}
                    {this.voucherImg_view()}
                    {this.reportImg_view()}
                    {this._addressInfo()}
                    {this._ReturnsGoodsList()}
                    {this._renderReturnMoney()}
                    {this._renderBottomButton()}
                </ScrollView>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                <StatusView ref={(item)=>this.status = item} retry={()=>{
                    this._requestData()}} navigation={this.props.navigation}/>
                <BigPictureView ref={(view)=>{this.picView = view}}/>
            </View>
        )
    }

    _renderHeaderView() {
        let viewHeight = isNotEmpty(this.state.item.return_reply) ? 60 : 30

        return(
            <View style={{flex:1}}>
                <Image
                    source={require('../../../img/order_detail_header.png')}
                    style={{width:kScreenWidth, height:isIphoneX() ? 234 : 210, resizeMode:'stretch'}}/>
                <View style={{flex:1,height:viewHeight}}></View>
                <View style={[styles.content,{position:'absolute',left:0,right:0,top:isIphoneX() ? 105 : 80,bottom:0}]}>
                    {this._renderHeaderItem('退货单号：',this.state.item.order_return_no)}
                    {this._renderHeaderItem('退货类型：',this.state.item.status_name)}
                    {this._renderHeaderItem('申请理由：',this.state.item.return_reason)}
                    {this._renderShopReply()}
                </View>
            </View>
        )
    }

    _renderHeaderItem(title, content, contentColor) {
        let color = contentColor != undefined ? contentColor : darkLightColor()
        return(
            <View style={{flex:1,flexDirection:'row', alignItems:'center'}}>
                <Text style={{color:darkTextColor(), fontSize:15}}>{title}</Text>
                <Text style={{color:color, fontSize:15, flex:1}}>{content}</Text>
            </View>
        )
    }

    voucherImg_view() {
        if (isEmpty(this.state.item.voucher_images)) {
            return (<View/>);
        }
        if (this.state.item.voucher_images.length == 0) {
            return (<View/>);
        }
        if (this.state.item.voucher_images.length == 1 && this.state.item.voucher_images[0].length <= 1) {
            return (<View/>)
        }
        let images = [];
        for (let uri of this.state.item.voucher_images){
            images.push({url:uri})
        }
        return (
            <View style={[styles.content]}>
                <YFWTitleView style_title={{fontSize:15}} title={'举证图片'}/>
                <ScrollView style={{flexDirection:'row',marginTop:adaptSize(10)}} horizontal={true}>
                    {images.map((item, index)=>this._renderUserImage(item.url, index,images))}
                </ScrollView>
            </View>
        )
    }

    reportImg_view() {
        if (isEmpty(this.state.item.report_images)) {
            return (<View/>);
        }
        if (this.state.item.report_images.length == 0) {
            return (<View/>);
        }
        if (this.state.item.report_images.length == 1 && this.state.item.report_images[0].length <= 1) {
            return (<View/>)
        }
        let images = [];
        for (let uri of this.state.item.report_images){
            images.push({url:uri})
        }
        return (
            <View style={[styles.content]}>
                <YFWTitleView style_title={{fontSize:15}} title={'检验报告'}/>
                <ScrollView style={{flexDirection:'row',marginTop:adaptSize(10)}} horizontal={true}>
                    {images.map((item, index)=>this._renderUserImage(item.url, index,images))}
                </ScrollView>
            </View>
        )
    }

    _renderUserImage(uri, index,images) {
        if (index >= 3) return;
        return (
            <TouchableOpacity activeOpacity={1} style={{width:adaptSize(95),height:adaptSize(95),marginLeft:index==0?0:adaptSize(15)}}
                  key={index} onPress={()=>{this.picView.showView(images,index)}}>
                {this._renderImageforNetType(uri)}
            </TouchableOpacity>)
    }

    _renderImageforNetType(uri) {
        if (isNotEmpty(uri)) {
            return (
                <Image source={{uri:uri}} style={{width:adaptSize(95),height:adaptSize(95),resizeMode:'contain',resizeMode:'contain'}}/>
            )
        }
    }

    getOrderStatusText(index) {
        if (isNotEmpty(this.state.item) && isNotEmpty(this.state.item.button_items)) {
            return this.state.item.button_items[index].text
        }
    }

    _renderShopReply() {
        if (isNotEmpty(this.state.item.return_reply)) {
            return this._renderHeaderItem('商家回复：',this.state.item.return_reply.replace(/[\r\n]/g))
        }
    }

    _addressInfo() {
        if (isNotEmpty(this.state.item.return_name)) {
            return (
                <View style={styles.content}>
                    <View style={{flexDirection:'row',alignItems:'center',flex:1,marginBottom:8}}>
                        <Text style={{fontSize:15,color:darkTextColor()}}>{this.state.item.return_name}</Text>
                        <Text
                            style={{fontSize:15,color:darkTextColor(),marginLeft:10}}>{this.state.item.return_mobile + " , " + this.state.item.return_phone}</Text>
                    </View>
                    <Text
                        style={{flex:1,fontSize:12,color:darkLightColor()}}>{'退货地址：'+this.state.item.return_address}</Text>
                </View>
            )
        }
    }

    _ReturnsGoodsList() {
        if (isNotEmpty(this.state.listData)) {
            let data = itemAddKey(this.state.listData);
            return (
                <View style={[styles.content,{paddingTop:25}]}>
                    <YFWTitleView title={'退货商品及数量'} style_title={{width:120,fontSize:15}}></YFWTitleView>
                    <FlatList
                        style={{flex:1,backgroundColor:"#fff"}}
                            renderItem={this._renderItem}
                            keyExtractor={(item, index) => index}
                            data={data}>
                    </FlatList>
                </View>
            )
        }
    }

    _renderItem = (item)=> {
        return(
            <View style={{flex:1,flexDirection:'row', alignItems:'center',paddingVertical:5}}>
                <Image source={{uri:tcpImage(safe(item.item.img_url))}} style={{width:70, height:70, resizeMode:'contain'}}/>
                <View style={{flex:1,paddingVertical:7,paddingLeft:10}}>
                    <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <View style={{flex:1}}>
                            {this._renderTitleView(item.item)}
                        </View>
                        <View>
                            <YFWDiscountText navigation={this.props.navigation}  style_view={{marginLeft:15}} style_text={{color:darkTextColor(),fontSize:15,fontWeight:'500'}} value={'¥'+toDecimal(item.item.price)}/>
                        </View>
                    </View>
                    <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end',alignItems:'center',paddingTop:5}}>
                        <Text style={{color:darkLightColor(), fontSize:15}}>退货数量：</Text>
                        <Text style={{color:darkTextColor(), fontSize:15}}>{item.item.quantity}</Text>
                    </View>
                </View>
            </View>
        )
    }

    _renderTitleView(item) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(item).PrescriptionType+"" === "1"){
            return this._rednerPrescriptionLabel(TYPE_SINGLE,item.title)
        }
        //双轨药
        else if(safeObj(item).PrescriptionType+"" === "2"){
            return this._rednerPrescriptionLabel(TYPE_DOUBLE,item.title)
        }
        else if(safeObj(item).PrescriptionType+"" === "0") {
            return this._rednerPrescriptionLabel(TYPE_OTC,item.title)
        }
        //这里没有处方药的判断
        else {
            return this._rednerPrescriptionLabel(TYPE_NOMAL,item.title)
        }
    }
    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    _rednerPrescriptionLabel(type,title){
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={{color:darkTextColor(),fontSize:13,flex:1,lineHeight:16}}
            numberOfLines={2}
        />
    }

    _renderReturnMoney() {
        return (
            <View style={[styles.content, {flexDirection:'row'}]}>
                {this._renderHeaderItem('退款金额：','¥'+toDecimal(this.state.item.return_money),yfwRedColor())}
            </View>
        )
    }

    _renderBottomButton() {
        if (isNotEmpty(this.state.item) && isNotEmpty(this.state.item.button_items) && this.state.item.button_items.length != 0) {
            return (
                <View style={{flex:1, paddingHorizontal:13, flexDirection:'row', justifyContent:'flex-end', alignItems:'center',paddingVertical:40}}>
                    {this._renderBottomButtonItem()}
                </View>
            )
        }
    }

    _renderBottomButtonItem() {
        let items = []
        this.state.item.button_items.map((model, index) => {
            let color = index%2 == 0 ? yfwGreenColor() : darkNomalColor();
            items.push(
                <TouchableOpacity
                    activeOpacity={1}
                    style={{marginLeft:20, paddingHorizontal:12, height:24, borderRadius:12, borderWidth:1, borderColor:color, alignItems:'center', justifyContent:'center'}}
                    onPress={() => this._retuenButtonClick(model.value)}>
                    <Text style={{fontSize:13, color:color, fontWeight:'bold'}}>{model.text}</Text>
                </TouchableOpacity>
            )
        })
        return items
    }

    _retuenButtonClick(type) {
        let buttonType;
        var item;
        if (type == 'updateReturnGoods') {//更改退货单详情
            buttonType = 'order_apply_return_update'
        } else if (type == 'orderReturnSend') {//发出退货
            buttonType = 'order_return_send'
        } else if (type == 'orderReturnSendUpdate') {//修改单号
            buttonType = 'order_return_send_update'
        } else if (type == 'cancelReturnGoods') {
            buttonType = 'order_apply_return_cancel'
        }
        item = {
            navigation: this.props.navigation,
            type: buttonType,
            orderNo: this.orderNo,
            orderTotal: this.orderTotal,
            showTips: this._showTipsDialog,
            goBack: this._goBack,
            pageSource: this.pageSource,
            data:this.props.navigation.state.params.state.data
        }
        OrderClick.buttonsClick(item)
    }

    _showTipsDialog = (bean) => {
        this.tipsDialog && this.tipsDialog._show(bean)
    }

    _goBack = ()=> {
        let {goBack} = this.props.navigation
        goBack()
    }

    _getRetrunGoodsOrtherInfo(type) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnInfo');
        paramMap.set('orderno', this.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            this.status && this.status.dismiss()
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = RetrunGoodsDetailInfoModel.getModelArray(res.result);
            this.setState({
                item: dataArray[0]
            });
        }, (error)=> {
            this.status && this.status.showNetError()
        }, isEmpty(type) ? true : false);
    }

    _listScroll(e) {
        let scrollY = e.nativeEvent.contentOffset.y;
        let opacity = scrollY/40.0
        if(opacity < 0){
            opacity = 0
        }else if( opacity > 1) {
            opacity = 1
        }

        this.state.headerOpacity = opacity;

        if (_this.headerImage) {
            _this.headerImage.setNativeProps({
                opacity: opacity
            })
        }
    }
}

const styles = StyleSheet.create({
    container: {

    },
    content: {
        flex:1,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        elevation:2,
        shadowRadius: 8,
        shadowOpacity: 1,
        paddingHorizontal: 20,
        paddingVertical:15,
        marginHorizontal: 13,
        marginVertical: 10,
    }
})
