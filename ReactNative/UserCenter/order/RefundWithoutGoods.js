import React from 'react'
import {
    View,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    DeviceEventEmitter,
    Platform,
    BackAndroid, NativeModules, StyleSheet
} from 'react-native'

import {
    itemAddKey,
    isEmpty,
    isNotEmpty,
    iphoneBottomMargin,
    kScreenHeight, kScreenWidth, isIphoneX
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const {StatusBarManager} = NativeModules;
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import {toDecimal} from "../../Utils/ConvertUtils";
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import {darkLightColor, darkTextColor, yfwRedColor} from "../../Utils/YFWColor";
import YFWTitleView from "../../PublicModule/Widge/YFWTitleView";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";

/**未收到货情况的 申请退款页*/
export default class RefundWithoutGoods extends React.Component {
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
                                  navigation.goBack();
                              }}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={ require('../../../img/top_back_white.png')}
                       defaultSource={require('../../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerRight: <View/>
    });

    constructor(props) {
        super(props)
        this.state = {
            showTops: false,
            selectIndex: 0,
            dataArray: ['',''],
            orderNo: '',
            orderTotal: undefined,
            pageSource: undefined
        }
        this.onBackAndroid = this.onBackAndroid.bind(this)
        this.listener();
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
                }
            }
        );
        this.didBlur = this.props.navigation.addListener('didBlur',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
                }
            }
        );
    }

    onBackAndroid = ()=> {
        this.props.navigation.goBack();
        return true;
    }


    componentDidMount() {
        let orderNo = this.props.navigation.state.params.state.orderNo;
        let orderTotal = this.props.navigation.state.params.state.orderTotal;
        let lastPage = this.props.navigation.state.params.state.lastPage;
        this.state.pageSource = this.props.navigation.state.params.state.pageSource;
        this.state.orderNo = orderNo
        this.setState({
            orderTotal: orderTotal,
            lastPage: lastPage
        })
        this._requestRefundReason();
    }

    _requestRefundReason() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnReason');
        paramMap.set('orderno', this.state.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = itemAddKey(res.result);
            this.setState({
                status: 'no_receive',
                dataArray: dataArray,
            });
        })

    }

    clickItem(index) {
        this.setState({
            selectIndex: index,
            orderTotal : this.state.dataArray[index].total_price
        })
        this.state.index = index;
        if (isNotEmpty(this.state.dataArray[index].promptinfo)) {
            this.setState({
                showTops: true
            })
        } else {
            this.setState({
                showTops: false
            })
        }
    }

    _commit() {
        if (isEmpty(this.state.dataArray)) {
            return
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.applyReturn');
        paramMap.set('orderno', this.state.orderNo);
        paramMap.set('desc', this.state.dataArray[this.state.selectIndex].reason);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isNotEmpty(this.state.pageSource)) {
                DeviceEventEmitter.emit('order_status_refresh', this.state.pageSource);
            }
            let {navigate} =  this.props.navigation;
            pushNavigation(navigate, {
                type: 'check_order_status_vc',
                title: '申请退款',
                tips: '您的申请已经提交，请等待商家确认',
                orderNo: this.state.orderNo,
                lastPage: this.state.lastPage,
                gobackKey: this.props.navigation.state.params.state.gobackKey
            })

        })

    }

    _showTitle() {
        return(
            <View style={{height:40,alignItems:'flex-start'}}>
                <YFWTitleView title={'申请原因'}/>
            </View>
        )

    }

    _showTips() {
        if (this.state.showTops) {
            return (
                <View>
                    <View style={{backgroundColor:'#E5E5E5',width:width}} height={0.5}/>
                    <View style={{paddingVertical:15,flexDirection:'row',backgroundColor:'white',width:width-64}}>
                        <Image style={{width:16, height:16, resizeMode:'stretch'}} source={require('../../../img/icon_warning.png')}/>
                        <Text style={{fontSize:12,color:darkLightColor(),flex:1}}>{this.state.dataArray[this.state.selectIndex].promptinfo}</Text>
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
            <TouchableOpacity activeOpacity={1} onPress={()=> this.clickItem(item.index)}>
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
        let BottomMargin = iphoneBottomMargin() + 50;
        return (
            <View style={{flex:1}}>
                <Image
                    source={require('../../../img/order_detail_header.png')}
                    style={styles.imageBack} >
                </Image>
                <View style={{flex:1, justifyContent:'space-between'}}>
                    <View style={[BaseStyles.centerItem]}>
                        <View style={[styles.list,styles.statusTitle]}>
                            <View style={{flexDirection:'row', alignItems: 'center'}}>
                                <Text style={{fontSize:14,color:darkTextColor(),marginLeft:15}}>退款类型:</Text>
                                <Text style={{fontSize:14,color:darkLightColor(),marginLeft:12}}>未收到货</Text>
                            </View>
                        </View>
                        <View style={[styles.list,{backgroundColor:"white", maxHeight:kScreenHeight/2,flexDirection:'column'}]}>
                            {this._showTitle()}
                            <FlatList
                                      renderItem={this._renderItem}
                                      keyExtractor={(item, index) => 'key'+index}
                                      ListFooterComponent={this._showTips()}
                                      data={this.state.dataArray}
                                      listKey={(item, index) => 'key'+index}>
                            </FlatList>
                        </View>
                        <View style={[styles.list,{backgroundColor:"white",marginVertical:17}]}>
                            <View style={{flexDirection:'row', alignItems: 'center'}}>
                                <Text style={{fontSize:14,color:darkTextColor(),marginLeft:15}}>退款金额:</Text>
                                <Text style={{fontSize:14,color:yfwRedColor(),marginLeft:12}}>¥{toDecimal(this.state.orderTotal)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{width:kScreenWidth,justifyContent:'center',alignItems:'center',bottom:BottomMargin,position:'absolute',}}>
                        <YFWTouchableOpacity style_title={{height:(kScreenWidth-16)/330*44, width:kScreenWidth-16, fontSize: 16}}
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
        marginTop: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT + 17 : 50 + 17 + (isIphoneX() ? 24:0)
    },
});
