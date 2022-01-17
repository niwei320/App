import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    NativeModules,
} from 'react-native';
import YFWHeaderLeft from "../../../WholesaleDrug/Widget/YFWHeaderLeft";
import {
    isIphoneX,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth, safe, safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWMore from "../../../widget/YFWMore";
import YFWTitleView from "../../../PublicModule/Widge/YFWTitleView";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import { o2oBlueColor } from '../../../Utils/YFWColor';

export default class YFWInvoiceDetailPage extends Component {
    static navigationOptions = ({navigation}) => {
        if (safeObj(navigation.state.params.state).from == 'oto') {
            return {
                tabBarVisible: false,
                headerTitle:'发票详情',
                headerRight:<View style={{width:50}}></View>
            }
        } else {
            return {
                tabBarVisible: false,
                header: null,
            }
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            info: {
                invoice_applicant:null, //抬头
                invoice_code:null, //身份证
                dict_bool_invoice_sent:0, //0不是随货发出，1随货发出
                dict_bool_etax:0,//0纸质，1电子
                invoice_type_name:'',//发票类型
                dict_bool_status:0,//0待开，1已开
                dict_invoice_type:0,//0企业，1个人
                invoice_price:0,
                invoiceno:null,
                invoice_image:null,//格式 “/18/2.png|/18/1.pdf” 包含了两个文件链接第一个是png第二个是pdf。pdf链接无用接口暂未去除。
                traffic_name:null,
                trafficno:null,
            },
            from:''
        }
        if (Platform.OS === 'ios') {
            this.marginTop = isIphoneX() ? 44 + 2 : 20 + 2
        } else if (Platform.Version > 19) {
            this.marginTop = NativeModules.StatusBarManager.HEIGHT
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        let info = this.props.navigation.state.params.state.value
        let orderNo = this.props.navigation.state.params.state.orderNo
        let from = this.props.navigation.state.params.state.from
        if(isNotEmpty(info)){
            this.setState({
                info:info,
                orderNo:orderNo,
                from:from,
            })
        }
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    _onButtonLogisticsClicked() {
        let { navigate } = this.props.navigation;
        let { info } = this.state;
        let { orderNo } = this.state;
        let { trafficno } = info;
        pushNavigation(navigate, {
            type: 'get_logistics',
            orderNo: orderNo,
            trafficno: trafficno,
            from: 'YFWInvoiceDetailPage'
        });
    }

    _onButtonInvoiceClicked() {
        let { navigate } = this.props.navigation;
        let { info } = this.state;
        let { invoice_image } = info;
        let { orderNo,from } = this.state;
        pushNavigation(navigate, {
            type: 'invoice_image_page',
            value: invoice_image,
            orderNo: orderNo,
            from: from,
        })
    }

//-----------------------------------------------RENDER---------------------------------------------

    _renderInvoiceStatusView() {
        let {info} = this.state
        let {dict_bool_status} = info
        let {dict_bool_invoice_sent} = info
        let {traffic_name} = info
        let {trafficno} = info
        let status = dict_bool_status?(dict_bool_invoice_sent?'已开票（随货寄出）':'已开票'):'待开票'
        return (
            <View style={{ marginHorizontal: 17, marginVertical: 14 }}>
                <Text style={{fontSize: 14,color: "#333333",fontWeight:this.state.from!='oto'?'400':'bold'}}>发票状态:  <Text style={{color:this.state.from!='oto'?"#16c08e":o2oBlueColor()}}>{status}</Text></Text>
                {isNotEmpty(trafficno)?
                    <>
                        <Text style={{marginVertical:5, fontSize: 14,color: "#333333"}}>配送单位:  <Text style={{color: "rgb(51,51,51)"}}>{traffic_name}</Text></Text>
                        <Text style={{fontSize: 14,color: "#333333"}}>物流单号:  <Text style={{color: "rgb(51,51,51)"}}>{trafficno}</Text></Text>
                        <TouchableOpacity style={{position:'absolute', bottom:5, right:0}} onPress={this._onButtonLogisticsClicked.bind(this)}>
                            <View style={[style.button,{borderColor:this.state.from!='oto'?'#666':o2oBlueColor()}]}>
                                <Text style={[style.buttonText,{color:this.state.from!='oto'?'#666':o2oBlueColor()}]}>查物流</Text>
                            </View>
                        </TouchableOpacity>
                    </>:null}
            </View>
        )
    }

    _renderInvoiceExplanView() {
        return (
            <View style={{ marginLeft: 17, marginTop: 24 }}>
                <YFWTitleView title='开票说明' hiddenBgImage={this.state.from=='oto'}/>
                <View style={{width:kScreenWidth - 34 - 24,marginBottom:20,alignItems:'center'}}>
                    <View style={{width:kScreenWidth - 34 - 24-38*2,height:1, opacity: 0.24, backgroundColor: "#a6a9a8", top:20}} />
                    <View style={{width:kScreenWidth - 34 - 24,flex:1,flexDirection:'row', justifyContent:'space-evenly'}}>
                        {this._renderIcon(this.state.from!='oto'?require('../../../../img/invoice_1.png'):require('../../../O2O/Image/invoice_oto_1.png'),'订单下单')}
                        {this._renderIcon(this.state.from!='oto'?require('../../../../img/invoice_2.png'):require('../../../O2O/Image/invoice_oto_2.png'),'订单发货')}
                        {this._renderIcon(this.state.from!='oto'?require('../../../../img/invoice_3.png'):require('../../../O2O/Image/invoice_oto_3.png'),'商家开具')}
                        {this._renderIcon(this.state.from!='oto'?require('../../../../img/invoice_4.png'):require('../../../O2O/Image/invoice_oto_4.png'),'查看发票')}
                    </View>
                </View>
            </View>
        )
    }

    _renderIcon(imgPath,text){
        return (
            <View style={{alignItems:'center'}}>
                <Image style={{height:40,width:40}} source={imgPath}/>
                <Text  style={{marginTop:10,fontSize: 12,color: "#666666"}}>{text}</Text>
            </View>
        )
    }

    _renderInvoiceInfoView() {
        let {info} = this.state
        let {dict_bool_etax} = info
        let {invoice_type_name} = info
        let {invoice_applicant} = info
        let {invoice_code} = info
        let {invoice_image} = info
        return (
            <View style={{ marginHorizontal: 17, marginTop: 24 }}>
                <YFWTitleView title='发票信息' hiddenBgImage={this.state.from=='oto'}/>
                <View style={{ marginVertical: 10 ,flex:1}}>
                    {this._renderInvoiceItem('   发票类型',invoice_type_name)}
                    {this._renderInvoiceItem('   发票抬头',safe(invoice_applicant))}
                    {this._renderInvoiceItem('   身份证号',invoice_code)}
                    {this._renderInvoiceItem('   发票内容','商品明细')}
                </View>
                {isNotEmpty(invoice_image) && dict_bool_etax?
                    <TouchableOpacity style={{position:'absolute', bottom:13, right:0}} onPress={this._onButtonInvoiceClicked.bind(this)}>
                        <View style={[style.button,{borderColor:this.state.from!='oto'?'#666':o2oBlueColor()}]}>
                            <Text style={[style.buttonText,{color:this.state.from!='oto'?'#666':o2oBlueColor()}]}>查看发票</Text>
                        </View>
                    </TouchableOpacity>:null}
            </View>
        )
    }

    _renderInvoiceItem(title,text) {
        return (
            <View style={{flexDirection: 'row',flexWrap:'nowrap', minHeight: 28, paddingVertical: 5}}>
                <Text style={style.infoTitle}>{title}</Text>
                <View style={{flex:1,marginLeft:14}}>
                    <Text style={style.infoText}>{text}</Text>
                </View>
            </View>
        )
    }

    _renderInvoiceNoticeView() {
        return (
            <View style={{ marginHorizontal: 11, marginTop: 24 ,marginBottom: 55}}>
                <Text style={style.noticeTitle}> 发票须知：</Text>
                <Text style={style.noticeText}> 1.发票金额不含优惠券、满减、积分等优惠扣减金额；</Text>
                <Text style={style.noticeText}> 2.商家若无法开具电子普通发票，则开具纸质发票，发票随货寄出或者发货后2日内寄出，若未收到可要求商家补开并寄出； </Text>
                <Text style={style.noticeText}> 3.电子发票：</Text>
                <Text style={style.noticeText}> (1)电子普通发票是税局认可的有效付款凭证，其法律效力、基本用途、基本使用规定同纸质发票，可支持报销入账，如需纸质发票可自行打印下载； </Text>
                <Text style={style.noticeText}> (2)电子普通发票在发货后2日内开出，若商家未开出可联系商家开出； </Text>
                <Text style={style.noticeText}> (3)用户可点击“我的订单-查看发票”查询，分享链接至电脑端下载打印。 </Text>
            </View>
        )
    }

    _renderContent() {
        return (
            <View>
                <View style={style.content}>
                    {this._renderInvoiceStatusView()}
                </View>
                <View style={style.content}>
                    {this._renderInvoiceExplanView()}
                </View>
                <View style={style.content}>
                    {this._renderInvoiceInfoView()}
                </View>
                {this._renderInvoiceNoticeView()}
            </View>
        )
    }

    _renderHeaderView() {
        let marginTop = this.marginTop
        return (
            <View style={style.headerView} >
                <Image
                    source={require('../../../../img/dingdan_bj.png')}
                    style={style.headerImage}
                />
                <View style={{ width: 50, height: 50, justifyContent: 'center', marginTop: marginTop }}>
                    <YFWHeaderLeft navigation={this.props.navigation}/>
                </View>
                <View style={{ flex: 1, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: marginTop }}>
                    <Text style={{ textAlign: 'center', fontSize: 17, color: '#FFF', fontWeight: 'bold' }}>发票详情</Text>
                </View>
                <View style={{width: 50,height: 50}} />
            </View>
        )
    }

    render() {
        let marginTop = this.marginTop + 50
        return (
            <View style = {{flex: 1}}>
                {this.state.from != 'oto'&&this._renderHeaderView()}
                <ScrollView
                    style={this.state.from != 'oto'?{ position: 'absolute', top: marginTop, height: kScreenHeight - marginTop }:{flex:1}}
                >
                    {this._renderContent()}
                </ScrollView>
            </View>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        width:kScreenWidth-24,
        marginHorizontal:12,
        marginTop:17,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 7,
        shadowOpacity: 1,
        elevation: 2
    },
    headerView: {
        width: kScreenWidth,
        height: 173,
        resizeMode: 'contain',
        flexDirection: 'row'
    },
    headerImage: {
        height: 173,
        width: kScreenWidth,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        resizeMode: 'stretch'
    },
    noticeText:{
        marginVertical:4,
        marginHorizontal:4,
        fontSize: 12,
        lineHeight: 15,
        color: "#999999"
    },
    noticeTitle:{
        marginBottom:7,
        fontWeight:'bold',
        fontSize: 12,
        color: "#666666"
    },
    infoTitle: {
        fontSize: 12,
        color: "#999999"
    },
    infoText: {
        fontSize: 12,
        color: "#333333"
    },
    button: {
        width: 73,
        height: 22,
        borderRadius: 11,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#666666",
        justifyContent:'center',
        alignItems:'center'
    },
    buttonText: {
        fontSize: 12,
        color: "#666666",
        fontWeight:'500'
    }
});