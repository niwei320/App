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
    ScrollView, Platform, NativeModules
} from 'react-native';
const width = Dimensions.get('window').width;
const {StatusBarManager} = NativeModules;
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import {
    itemAddKey,
    isEmpty,
    iphoneBottomMargin,
    kScreenWidth,
    kScreenHeight
} from "../../PublicModule/Util/YFWPublicFunction";
import {isIphoneX, isNotEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import {toDecimal} from "../../Utils/ConvertUtils";
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {darkLightColor, darkTextColor, yfwRedColor} from "../../Utils/YFWColor";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import YFWTitleView from "../../PublicModule/Widge/YFWTitleView";
import YFWToast from "../../Utils/YFWToast";

/**待发货情况下的 申请退款页*/
export default class YFWRefund extends React.Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "申请退款",
        headerTransparent: true,
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'normal', fontSize:16
        },
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor:'transparent',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0, backgroundColor:'transparent'},
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
        headerRight: <View/>

    });

    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            tips: '',
            orderNo: '',
            reason: '',
            selectIndex: 0,
            lastPage: undefined,
            showTops: false,
        }
    }

    componentDidMount() {
        let orderNo = this.props.navigation.state.params.state.value.orderNo;
        let lastPage = this.props.navigation.state.params.state.value.lastPage;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnReason');
        paramMap.set('orderno', orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = res.result;
            if (isNotEmpty(dataArray[0].reason)) {
                let prompt_info = dataArray[0].promptinfo
                let reason = dataArray[0].reason
                this.setState({
                    dataArray: dataArray,
                    orderNo: orderNo,
                    lastPage: lastPage,
                    showTops: isNotEmpty(prompt_info),
                    reason: reason,
                    tips: prompt_info,
                });
            }
        });

    }

    _commit() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.applyReturn');
        paramMap.set('orderno', this.state.orderNo);
        paramMap.set('desc', this.state.reason);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isNotEmpty(this.props.navigation.state.params.state.value.pageSource)) {
                DeviceEventEmitter.emit('order_status_refresh', this.props.navigation.state.params.state.value.pageSource);
            }
            let {navigate} =  this.props.navigation;
            pushNavigation(navigate, {
                type: 'check_order_status_vc',
                title: '申请退款',
                tips: '您的申请已经提交，请等待商家确认',
                orderNo: this.state.orderNo,
                lastPage: this.state.lastPage,
                gobackKey: this.props.navigation.state.key
            })

        })

    }

    _clickItem(index) {
        let prompt_info = this.state.dataArray[index].promptinfo;
        this.setState({
            selectIndex: index,
            tips: prompt_info,
            showTops: isNotEmpty(prompt_info)
        })
    }

    _showTitle() {
        return(
            <View style={{flex:1,alignItems:'flex-start',}}>
                <YFWTitleView title={'申请退款原因'} style_title={{width:100}}/>
            </View>
        )

    }

    _showTips() {
        if (this.state.showTops) {
            return (
                <View>
                    <View style={{paddingVertical:15,flexDirection:'row',width:width-64, alignItems:'flex-start'}}>
                        <Image style={{width:16, height:16, resizeMode:'stretch', marginTop:5}} source={require('../../../img/icon_warning.png')}/>
                        <Text style={{fontSize:12,color:darkLightColor(),flex:1,includeFontPadding:false,lineHeight: 20,}}>{this.state.dataArray[this.state.selectIndex].promptinfo}</Text>
                    </View>
                </View>
            )
        }
    }

    _splitView(item) {
        if (item.index < this.state.dataArray.length - 1) {
            return (
                <View style={{backgroundColor:'#E5E5E5',width:width}} height={0.5}/>
            );
        }
    }

    _renderSelectedImage(item) {
        if (this.state.selectIndex == item.index) {
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
            <TouchableOpacity activeOpacity={1} onPress={()=> this._clickItem(item.index)}>
                <View>
                    <View style={{width:width-64,paddingVertical:15,flexDirection:'row', justifyContent:'space-between', alignItems: 'center'}}>
                        <Text style={{fontSize:14,color:textColor,flex:1}}>{item.item.reason}</Text>
                        {this._renderSelectedImage(item)}
                    </View>
                    {this._splitView(item)}
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        const orderTotal = this.props.navigation.state.params.state.value.orderTotal;
        let BottomMargin = iphoneBottomMargin() + 50;
        let btnH = (kScreenWidth-16)/330*44;
        let btnW = kScreenWidth-16;
        return (
            <View style={{flex:1}}>
                <Image
                    source={require('../../../img/order_detail_header.png')}
                    style={styles.imageBack} >
                </Image>
                <View style={{flex:1, justifyContent:'space-between'}}>
                    <View style={[BaseStyles.centerItem,styles.statusTitle]}>
                        <FlatList style={[styles.list,{backgroundColor:"white", maxHeight:kScreenHeight/2}]}
                                  renderItem={this._renderItem}
                                  keyExtractor={(item, index) => 'key'+index}
                                  ListHeaderComponent={this._showTitle()}
                                  data={this.state.dataArray}
                                  listKey={(item, index) => 'key'+index}>
                        </FlatList>
                        <View style={[styles.list,{backgroundColor:"white",marginVertical:17,paddingHorizontal:5}]}>
                            <View style={{flexDirection:'row', alignItems: 'center'}}>
                                <Text style={{fontSize:14,color:darkTextColor(),marginLeft:15}}>退款金额:</Text>
                                <Text style={{fontSize:14,color:yfwRedColor(),marginLeft:12}}>¥{toDecimal(orderTotal)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{width:kScreenWidth,justifyContent:'center',alignItems:'center',bottom:BottomMargin + btnH + 10,position:'absolute',}}>
                    {this._showTips()}
                    </View>
                    <View style={{width:kScreenWidth,justifyContent:'center',alignItems:'center',bottom:BottomMargin,position:'absolute',}}>
                        <YFWTouchableOpacity style_title={{height:btnH, width:btnW, fontSize: 16}}
                                             title={'提交'}
                                             callBack={() => {this._commit()}}
                                             isEnableTouch = {true}/>
                    </View>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    list: {
        width: width-24,
        borderRadius: 10,
        paddingHorizontal:20,
        paddingVertical:15,
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
        fontSize:14,
        fontWeight:'bold',
        color:'#fff',
        marginTop: Platform.OS == 'android'?Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT + 36 : 50 + 36 : isIphoneX()?88+36:64+36
    },
});
