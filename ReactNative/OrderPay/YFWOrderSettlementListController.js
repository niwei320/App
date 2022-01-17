import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    FlatList,
    Image,
    Text,
    ImageBackground
} from 'react-native'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {yfwGreenColor, darkNomalColor, darkTextColor,darkLightColor, separatorColor, yfwOrangeColor,backGroundColor} from "../Utils/YFWColor";
import {isNotEmpty, itemAddKey, kScreenWidth, mobClick, safeObj, adaptSize} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import YFWPaymentDialogView from './View/YFWPaymentDialogView'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import BaseTipsDialog from "../PublicModule/Widge/BaseTipsDialog";
import StatusView from '../widget/StatusView'
import {toDecimal} from "../Utils/ConvertUtils";
import AndroidHeaderBottomLine from "../widget/AndroidHeaderBottomLine";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWOrderSettlementListModel from "./Model/YFWOrderSettlementListModel";
import YFWSettlementHeader from "../widget/YFWSettlementHeader"
import { addLogPage } from '../Utils/YFWInitializeRequestFunction';

export default class YFWOrderSettlementListController extends Component {

    static navigationOptions = ({ navigation }) => ({
        headerRight: (
            <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={()=>navigation.state.toOrderList()} style={{marginRight:10}}>
                <Text style={{color:yfwGreenColor(),fontSize:adaptSize(12)}}>我的订单</Text>
            </TouchableOpacity>
        ),
        tabBarVisible: false,
        title:'订单提交成功',
    });

    static defaultProps = {
        orderNo: undefined,
    }

    constructor(props) {
        super(props);
        _this =this;
        this.unPayCount = 0;
        this.state = {
            orderArray: [],
            defaultAddress:undefined,
        }
        this.listener()
    }

    listener(){
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._getDataListFromServer();
            }
        );
    }

    componentWillMount() {
        // this.props.navigation.setParams({toOrderList: this.toOrderList});
        this.props.navigation.state.toOrderList = this.toOrderList
    }

    componentWillUnmount(){
        this.didFocus.remove()
    }

    componentDidMount() {
        this.state.defaultAddress = this.props.navigation.state.params.defaultAddress;
    }

    //request
    _getDataListFromServer(){

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let orderNo = this.props.navigation.state.params.orderNo;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getNotPayOrders');
        paramMap.set('ordernos',safeObj(orderNo));

        viewModel.TCPRequest(paramMap,(res)=>{
            this.statusView&&this.statusView.dismiss();
            let lists = YFWOrderSettlementListModel.getModelArray(res.result);
            lists = itemAddKey(lists);
            if (isNotEmpty(lists)){
                this.setState({
                    orderArray: lists,
                });
                if (lists.length == 0){
                    this.props.navigation.replace('MyOrder',{state: {value:1}})
                }
            }

        }, (error)=> {
            this.statusView&&this.statusView.showNetError();
        },false);

    }

    //Action

    toOrderList = () => {
        mobClick('order success-myorder');
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_order',value:0})
    }

    clickItems(order_no,type,prompt_info){
        if (type == 'order_pay') {
            this._showPay(order_no)
        }
        else if (type == 'order_rx_submit') {
            mobClick('order settlement-prescription');
            const {navigate} = this.props.navigation;
            pushNavigation(navigate, {type: "order_rx_submit", value: order_no})
        } else if(type == 'order_pay_not'){
            this._needSubmitRxTips(order_no,prompt_info)
        }
    }

    _needSubmitRxTips(order_no,prompt_info) {
        if (isNotEmpty(prompt_info)) {
            let bean = {
                id: order_no,
                title: prompt_info,
                leftText: "立即上传",
                leftTextColor: yfwGreenColor(),
                leftClick: ()=> {
                    const {navigate} = this.props.navigation;
                    pushNavigation(navigate, {
                        type: "order_rx_submit",
                        value: order_no,
                    })
                }
            }
            this.tipsDialog && this.tipsDialog._show(bean)
        }
    }

    _showPay(orderNo){

        this.PaymentDialog && this.PaymentDialog.show(orderNo);

    }

    //View
    _buttonsView(item){
        if (isNotEmpty(item)){
            // 遍历json数据
            let buttonArray = item.item.button_items;
            if(buttonArray.length==1){
                let button = buttonArray[0];
                return(

                    <TouchableOpacity key={button.value} onPress={()=>this.clickItems(item.item.order_no,button.value,button.prompt_info)}>
                        {/* <View style={{marginLeft:5,marginRight:5,marginTop:10,backgroundColor:button.text=="付款"?yfwOrangeColor():'white',height:30,alignItems:'center',justifyContent:'center'
                                        ,borderColor:button.text=="付款"?yfwOrangeColor():yfwOrangeColor(),borderRadius:3,borderWidth:1}}>
                            <Text style={{color:button.text=="付款"?'white':yfwOrangeColor()}}>{button.text}</Text>
                        </View> */}
                        <ImageBackground
                            source={require('../../img/button_pay.png')}
                            style={[{height:adaptSize(37), width:104, marginTop:72,alignItems:'center',}]}
                            imageStyle={{resizeMode:'stretch'}}>
                            <Text style={{fontWeight: 'bold',color: '#FFFFFF', fontSize:adaptSize(12),marginTop:adaptSize(8)}}>{button.text}</Text>
                        </ImageBackground>
                    </TouchableOpacity>

                );
            }else{

                let color = buttonArray[0].is_weak == 'true'?'#b0f6de':'#1fdb9b'
                return(
                    <View>
                            <TouchableOpacity key={buttonArray[0].value} onPress={()=>this.clickItems(item.item.order_no,buttonArray[0].value,buttonArray[0].prompt_info)}>
                                <View style={{marginLeft:6,marginTop:45,backgroundColor:'white',height:adaptSize(23),width:91,alignItems:'center',justifyContent:'center'
                                                ,borderColor:color,borderRadius:adaptSize(11),borderWidth:1,borderStyle: "solid",}}>
                                    <Text style={{color:color,fontSize:adaptSize(12)}}>{buttonArray[0].text}</Text>

                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity key={buttonArray[1].value} onPress={()=>this.clickItems(item.item.order_no,buttonArray[1].value,buttonArray[1].prompt_info)}>
                                <ImageBackground
                                    source={require('../../img/button_pay.png')}
                                    style={[{height:adaptSize(37), width:104, marginTop:6,alignItems:'center',}]}
                                    imageStyle={{resizeMode:'stretch'}}>
                                    <Text style={{fontWeight: 'bold',color: '#FFFFFF', fontSize:adaptSize(12),marginTop:adaptSize(8)}}>{buttonArray[1].text}</Text>
                                </ImageBackground>
                            </TouchableOpacity>
                    </View>
                )
            }


        }else {
            return <View style={{flex:1,flexDirection:'column'}}/>
        }
    }



    _splitView() {
        return (
            <View style={{backgroundColor:'#F5F5F5',width:kScreenWidth,marginTop:10}} height={0}/>
        );
    }
    _renderFooter(){

        return <View style={{height:11}}/>

    }
    clickItem(item) {
        //YFWToast(this.state.dataArray[item.index].id)
        //this.props.navigation.navigate('DrugRemidingDetail',this.state.dataArray[item.index].id)
    }
    _renderItem = (item)=> {
        return (
            <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item)}>
                <View style={[BaseStyles.radiusShadow,{backgroundColor:'white',width:kScreenWidth-26,marginLeft:13,shadowOffset: {width: 1, height: 6}}]}>
                    <View style={[BaseStyles.leftCenterView,{height:41}]}>
                        <Image style={{width:14,height:14,marginLeft:11}} source={ require('../../img/shop_icon.png')}/>
                        <Text  style={[BaseStyles.titleWordStyle,{marginLeft:8,flex:1}]} numberOfLines={1}>{item.item.shop_title}</Text>
                    </View>
                    <View style={[BaseStyles.separatorStyle,{width:kScreenWidth-26,backgroundColor:'rgba(230,230,230,1)',marginLeft:0}]}/>
                    <View style={{flex:1,flexDirection:'row',justifyContent:'space-between'}}>
                        <View style={{justifyContent:'center',flex:1,flexDirection:'column'}}>
                            <View style={[BaseStyles.leftCenterView,{flex:1,marginTop:24}]}>
                                <Text style={{marginLeft:33,color:darkTextColor(),fontSize:adaptSize(12)}}>订单:</Text>
                                <Text style={{marginLeft:15,color:darkLightColor(),fontSize:adaptSize(12)}}>{item.item.order_no}</Text>
                            </View>
                            <View style={[BaseStyles.leftCenterView,{flex:1,marginTop:13}]}>
                                <Text style={{marginLeft:33,color:darkTextColor(),fontSize:adaptSize(12)}}>数量:</Text>
                                <Text style={{marginLeft:15,color:darkLightColor(),fontSize:12}}>{item.item.goods_count}</Text>
                            </View>
                            <View style={[BaseStyles.leftCenterView,{flex:1,marginBottom:27,marginTop:18}]}>
                                <Text style={{marginLeft:33,color:darkTextColor(),fontSize:adaptSize(12)}}>金额:</Text>
                                <Text style={{marginLeft:15,color:'#ff3300',fontSize:adaptSize(12)}}>¥{toDecimal(item.item.order_total)}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection:'column',marginRight:16,width:104,alignItems:'center'}}>
                            {this._buttonsView(item)}
                        </View>
                    </View>
                </View>
                {this._renderFooter()}
            </TouchableOpacity>
        );
    };


    render(){

        return(
            <View style={[BaseStyles.container]}>
                <AndroidHeaderBottomLine />
                {this.renderRoot()}
                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{this._getDataListFromServer();}}/>
            </View>
        );

    }



    renderRoot() {
        this.unPayCount = this.state.orderArray.length
        return (
            <View style={[BaseStyles.container,]}>
                {isNotEmpty(this.state.defaultAddress)&&<View style={[BaseStyles.leftCenterView,{height: 166, width: kScreenWidth}]}>
                        <YFWSettlementHeader context={{
                    name:this.state.defaultAddress.name,
                    mobile:this.state.defaultAddress.mobile,
                    address:this.state.defaultAddress.address,
                    isDefault:this.state.defaultAddress.is_default
                    }}
                    isTouch={false}/>
                </View>
                }

                <View style={{marginTop: 3, flex: 1}}>
                    <FlatList style={{width: kScreenWidth, backgroundColor: backGroundColor()}}
                                ItemSeparatorComponent={this._splitView}
                                renderItem={this._renderItem}
                            //   ListFooterComponent={this._renderFooter.bind(this)}
                                data={this.state.orderArray}
                    >

                    </FlatList>
                </View>
                <YFWPaymentDialogView ref={(dialog) => { this.PaymentDialog = dialog; }} navigation={this.props.navigation} from={'orderSettlement'} unPayCount={this.unPayCount}/>
                <BaseTipsDialog ref = {(item) => {this.tipsDialog = item}} />
            </View>
        )
    }
}
