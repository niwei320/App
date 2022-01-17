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
import OrderClick from "../../../UserCenter/order/OrderClick";
import {iphoneBottomMargin, kScreenHeight, kScreenWidth, isIphoneX, safe, isEmpty, kStyleWholesale} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWTitleView from '../../../PublicModule/Widge/YFWTitleView';
import { yfwBlueColor } from '../../../Utils/YFWColor';
import YFWWDOrderClick from '../View/YFWWDOrderClick';

/**待收货页面的 申请退货款页 选择操作页*/
export default class YFWWDRefundsGoodsFirstStep extends React.Component {
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

    constructor(props) {
        super(props);
        _this = this
        this.orderNo = this.props.navigation.state.params.state.value.orderNo;
        this.totalMoney = this.props.navigation.state.params.state.value.orderTotal;
        this.state = {
            title: '申请退货/款',
            selectIndex: 0,
            orderDetailData:[]
        },
        this.operation = [
            {title:'我要退款（无需退货）',type:1,icon:require('../../../../img/return_money_icon.png')},
            {title:'我要退货退款',type:2,icon:require('../../../../img/return_goods_icon.png')},
        ]
    }
    componentDidMount() {
    }

    componentWillUnmount() {
    }


    render() {
        let BottomMargin = iphoneBottomMargin() + 50;
        let operationViews = []
        this.operation.map((item,index)=>{
            operationViews.push(
                <TouchableOpacity style={styles.operation} activeOpacity={1} onPress={()=>this.operationAction(item)}>
                    <Image style={{width:20,height:20,marginHorizontal:10,tintColor:yfwBlueColor()}} source={item.icon}></Image>
                    <Text style={styles.operationText}>{item.title}</Text>
                    <Image source={require('../../../../img/icon_arrow_gray.png')} style={styles.arrow}></Image>
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
                    <YFWTitleView title={'退货/款类型'} style_title={{width:90,fontSize:15}} hiddenBgImage={true}/>
                </View>
                <View style={styles.operationContainer}>
                    {operationViews}
                </View>
                <View style={{justifyContent:'space-between'}}>
                </View>
            </ScrollView>
        )
    }

    operationAction(info) {
        YFWWDOrderClick.buttonsClick({
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