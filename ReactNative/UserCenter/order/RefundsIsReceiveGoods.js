/**
 * Created by admin on 2018/8/28.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    DeviceEventEmitter,
    FlatList,
    ScrollView, Platform, NativeModules, BackHandler
} from 'react-native';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const {StatusBarManager} = NativeModules;
import OrderClick from "./OrderClick";
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {iphoneBottomMargin, kScreenHeight, kScreenWidth, isIphoneX, safe, isEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import {darkLightColor, darkTextColor} from "../../Utils/YFWColor";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import YFWToast from '../../Utils/YFWToast';
import RetrunGoodsInfoModel from './Model/RetrunGoodsInfoModel';
import ReturnGoodsDetail from './ReturnGoodsDetail';
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';

/**待收货页面的 申请退款页*/
export default class RefundsIsReceiveGoods extends React.Component {
    static navigationOptions = ({navigation}) => ({
        headerTitleStyle: {
            color: '#333',textAlign: 'center',flex: 1, fontWeight: 'normal', fontSize:17
        },
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor:'white',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0, backgroundColor:'white'},
        // headerLeft: (
        //     <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
        //                       onPress={()=>{
        //                           if(_this.state.status==_this.statusStart){
        //                               navigation.state.params.state.gobackKey?navigation.goBack(navigation.state.params.state.gobackKey):navigation.goBack();
        //                               return;
        //                           }
        //                           if(_this.state.status==1){
        //                               _this.setState({status:0})
        //                           }else {
        //                               navigation.state.params.state.gobackKey?navigation.goBack(navigation.state.params.state.gobackKey):navigation.goBack();
        //                           }
        //                       }}>
        //         <Image style={{width:10,height:16,resizeMode:'stretch'}}
        //                source={ require('../../../img/top_back_white.png')}
        //                defaultSource={require('../../../img/top_back_white.png')}/>
        //     </TouchableOpacity>
        // ),
        headerRight: (
            <TouchableOpacity activeOpacity={1}
                onPress={() => {navigation.goBack();}}>
                <Text style={{marginRight:15,fontSize:14,color:'white'}}>取消
                </Text>
            </TouchableOpacity>
        ),
        tabBarVisible: false,
        headerTitle: "申请退货/款"

    });

    /**
     * status = '0' 已收货/未收货
     * status = '1' 退货/退款
     * @param props
     */
    constructor(props) {
        super(props);
        _this = this
        this.orderNo = this.props.navigation.state.params.state.value.orderNo;
        this.status = this.props.navigation.state.params.state.value.status;
        this.statusStart = this.props.navigation.state.params.state.value.status;
        this.totalMoney = this.props.navigation.state.params.state.value.orderTotal;
        this.state = {
            status: this.status,    //0:确认收货，1:确认退款类型
            title: '申请退货/款',
            selectIndex: 0,
            listArray: [['已收到货', '未收到货'], ['我要退货', '我要退款（无需退货）']],
            titleArray: ['亲, 请确认您收到货了吗?', '请选择退款类型'],
            orderDetailData:[]
        },
        this.operation = [
            {title:'我要退款（无需退货）',type:1,icon:require('../../../img/return_money_icon.png')},
            {title:'我要退货退款',type:2,icon:require('../../../img/return_goods_icon.png')},
        ]
    }
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        let navigation = this.props.navigation
        if(this.state.status==this.statusStart){
            navigation.state.params.state.gobackKey?navigation.goBack(navigation.state.params.state.gobackKey):navigation.goBack();
            return true;
        }
        if(this.state.status == 1){
            this.setState({
                status:0,
            })
            return true;
        } else {
            navigation.state.params.state.gobackKey?navigation.goBack(navigation.state.params.state.gobackKey):navigation.goBack();
            return true;
        }
    }
    _splitView(item) {
        if (item.index < this.state.listArray[this.state.status].length - 1) {
            return (
                <View style={{backgroundColor:'#E5E5E5',width:width}} height={0.5}/>
            );
        }
    }

    clickItem(value) {
        this.setState({
            selectIndex: value,
        });
    }

    _renderSelectedImage(item) {
        if (this.state.selectIndex === item.index) {
            return (
                <Image style={{width:20,height:20,resizeMode:'stretch'}}
                       source={require('../../../img/check_checked.png')}/>)
        } else {
            return (
                <View style={{width:20,height:20,}}/>
            )
        }
    }

    _renderItem = (item)=> {
        let textColor = this.state.selectIndex === item.index?darkTextColor():darkLightColor()
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=> this.clickItem(item.index)}>
                <View>
                    <View style={{width:width-64,paddingVertical:15,flexDirection:'row', justifyContent:'space-between', alignItems: 'center'}}>
                        <Text style={{fontSize:15,color:textColor}}>{item.item}</Text>
                        {this._renderSelectedImage(item)}
                    </View>
                    {this._splitView(item)}
                </View>
            </TouchableOpacity>
        )
    }


    render() {
        let BottomMargin = iphoneBottomMargin() + 50;
        let operationViews = []
        this.operation.map((item,index)=>{
            operationViews.push(
                <TouchableOpacity style={styles.operation} activeOpacity={1} onPress={()=>this.operationAction(item)}>
                    <Image style={{width:20,height:20,marginHorizontal:10}} source={item.icon}></Image>
                    <Text style={styles.operationText}>{item.title}</Text>
                    <Image source={require('../../../img/icon_arrow_gray.png')} style={styles.arrow}></Image>
                </TouchableOpacity>
            )
            if (index < this.operation.length - 1) {
                operationViews.push(
                    <View style={styles.line}/>
                )
            }
        })
        return (
            <ScrollView style={{flex:1}}>
                <View style={{marginTop:14,marginLeft:12}}>
                    <YFWTitleView title={'退货/款类型'} style_title={{width:90,fontSize:15}}/>
                </View>
                <View style={styles.operationContainer}>
                    {operationViews}
                </View>
                <View style={{justifyContent:'space-between'}}>
                </View>
            </ScrollView>
        )
    }

    editGoodsNum() {

    }

    operationAction(info) {
        OrderClick.buttonsClick({
            navigation:this.props.navigation,
            type : "order_apply_return_pay_detail",
            orderNo : this.orderNo,
            title : 'title',
            returnType:info.type,
            orderTotal: this.totalMoney,
            package_price:this.props.navigation.state.params.state.value.package_price,
            shipping_price:this.props.navigation.state.params.state.value.shipping_price,
            pageSource:this.props.navigation.state.params.state.value.pageSource,
            gobackKey: this.props.navigation.state.params.state.value.gobackKey,
            successCallBack:(info)=>{
                this.props.navigation.replace(info.type,{state:info})
                // this.props.navigation.goBack()
            }
        })
    }

    _onButtonClick(){
        if(this.state.status == 0){
            this.refundsTypeClick(this.state.selectIndex)
            return
            if (this.state.selectIndex == 0) {
                let paramMap = new Map();
                let viewModel = new YFWRequestViewModel();
                paramMap.set('__cmd', 'person.order.IsDeliverOrReceiver');
                paramMap.set('orderno', this.orderNo);
                viewModel.TCPRequest(paramMap, (res)=> {
                    if (safe(res.result).length>0) {
                        YFWToast(res.result)
                    }else{
                        this.refundsTypeClick(this.state.selectIndex)
                    }
                }, (error)=> {

                });
            }else{
                this.refundsTypeClick(this.state.selectIndex)
            }





        } else if (this.state.status == 1){
            this.refundsGoods(this.state.selectIndex)
        }
    }

    refundsTypeClick(number) {
        switch (number) {
            case 0:
                this.setState({
                    status: 1
                });
                break;
            case 1:
                this.requestReasonNoRecive();
                break;
        }
    }

    /** 未收到货情况*/
    requestReasonNoRecive() {
        let {navigate} =  this.props.navigation;
        let orderNo = this.props.navigation.state.params.state.value.orderNo;
        let orderTotal = this.props.navigation.state.params.state.value.orderTotal
        let pageSource = this.props.navigation.state.params.state.value.pageSource;
        let lastPage = this.props.navigation.state.params.state.value.lastPage;
        pushNavigation(navigate,{type:'erfund_withourt_goods',orderNo:orderNo,orderTotal:orderTotal,pageSource:pageSource,lastPage:lastPage,gobackKey: this.props.navigation.state.key})
    }

    /** 收到货后，选择退款类型*/
    refundsGoods(index) {
        let title;
        if(index == 0){
            title = "我要退货"
        }else{
            title = "我要退款(无需退货)"
        }
        // this.props.navigation.pop()
        OrderClick.buttonsClick({
            navigation:this.props.navigation,
            type : "order_apply_return_pay_detail",
            orderNo : this.orderNo,
            title : title,
            orderTotal: this.totalMoney,
            package_price:this.props.navigation.state.params.state.value.package_price,
            shipping_price:this.props.navigation.state.params.state.value.shipping_price,
            pageSource:this.props.navigation.state.params.state.value.pageSource
        })
    }
}

const styles = StyleSheet.create({
    list: {
        width: width-24,
        borderRadius: 10,
        padding:20,
        marginTop:19,
        marginHorizontal:12,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 5
        },
        elevation:2,
        shadowRadius: 11,
        shadowOpacity: 1
    },
    imageBack: {
        width:width,
        height:198/360*width,
        resizeMode:'stretch',
        top:0,
        left:0,
        position: 'absolute',
        flexDirection:'row'
    },
    statusTitle: {
        fontSize:15,
        fontWeight:'bold',
        color:'#fff',
        paddingTop: Platform.OS == 'android'?Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT + 36 : 50 + 36 : isIphoneX()?88+36:64+36
    },
    operationContainer:{
        backgroundColor:'white',
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation:2,
        borderRadius:8,
        marginHorizontal:13,
        marginTop:3,
        padding:4,
    },
    operation:{
        height:45,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    operationText:{
        color:'#333',
        fontSize:14,
        fontWeight:'500',
        textAlign:'left',
        flex:1
    },
    arrow:{
        width:7,
        height:12,
        marginRight:12
    },
    line:{
        backgroundColor:'#f5f5f5',
        height:1,
        flex:1
    }
});