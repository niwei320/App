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
    ScrollView, Platform, NativeModules, ImageBackground
} from 'react-native';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const {StatusBarManager} = NativeModules;
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import {
    itemAddKey,
    isEmpty,
    jsonToArray,
    kScreenWidth,
    iphoneBottomMargin, kScreenHeight
} from "../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import {darkLightColor, darkTextColor} from "../../Utils/YFWColor";
import { YFWImageConst } from '../Images/YFWImageConst';

/**取消订单页*/
export default class YFWWDCancelOrder extends React.Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        headerTitle: "取消订单",
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
            dataArray: ['','',''],
            selectIndex: -1,
        }
        this.getCancelOrderReason();
    }

    getCancelOrderReason() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.buy.order.getCancelReason');
        paramMap.set('orderno', this.props.navigation.state.params.state.value);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = res.result;
            dataArray = itemAddKey(dataArray);
            dataArray = jsonToArray(dataArray);
            this.setState({
                dataArray: dataArray,
                selectIndex: 0,
            });
        });
    }

    _splitView(item) {
        if (item.index < this.state.dataArray.length - 1) {
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
        if (this.state.selectIndex == item.index) {
            return (
                <Image style={{width:20,height:20,resizeMode:'stretch'}}
                       source={YFWImageConst.Icon_gou_blue}/>)
        } else {
            return (
                <View style={{width:20,height:20,}}/>
            )
        }
    }

    _renderItem = (item)=> {
        let textColor = this.state.selectIndex == item.index?darkTextColor():darkLightColor()
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=> this.clickItem(item.index)}>
                <View>
                    <View style={{width:width-64,paddingVertical:15,flexDirection:'row', justifyContent:'space-between', alignItems: 'center'}}>
                        <Text style={{fontSize:14,color:textColor}}>{item.item}</Text>
                        {this._renderSelectedImage(item)}
                    </View>
                    {this._splitView(item)}
                </View>
            </TouchableOpacity>
        )
    }

    _commit() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        let refreshOrderStatusData;
        paramMap.set('__cmd', 'store.buy.order.cancel');
        paramMap.set('orderno', this.props.navigation.state.params.state.value);
        paramMap.set('desc', this.state.dataArray[this.state.selectIndex]);
        viewModel.TCPRequest(paramMap, (res)=> {
            refreshOrderStatusData = {
                pageSource: this.props.navigation.state.params.state.pageSource,
                position: this.props.navigation.state.params.state.itemPosition
            }
            DeviceEventEmitter.emit('cancel_order_status_refresh', refreshOrderStatusData);
            this.props.navigation.pop();
        });
    }

    render() {
        let BottomMargin = iphoneBottomMargin() + 50;
        return (
            <View style={{flex:1}}>
                <Image
                    source={YFWImageConst.Bg_page_header}
                    style={styles.imageBack} >
                </Image>
                <View style={{flex:1, justifyContent:'space-between'}}>
                    <View style={[BaseStyles.centerItem]}>
                        <Text style={styles.statusTitle}>亲为什么要取消这个订单呢？</Text>
                        <FlatList style={[styles.list,{backgroundColor:"white", maxHeight:kScreenHeight*2/3}]}
                                  renderItem={this._renderItem}
                                  keyExtractor={(item, index) => 'key'+index}
                                  data={this.state.dataArray}
                                  listKey={(item, index) => 'key'+index}>
                        </FlatList>
                    </View>
                    <View style={{width:kScreenWidth,justifyContent:'center',alignItems:'center',bottom:BottomMargin,position:'absolute'}}>
                        {/* <YFWTouchableOpacity style_title={{height:(kScreenWidth-16)/330*44, width:kScreenWidth-16}}
                                             title={'提交'}
                                             callBack={() => {this._commit()}}
                            isEnableTouch={true} /> */}
                        <TouchableOpacity onPress={()=>this._commit()} activeOpacity={1} style={{backgroundColor:'rgb(51,105,255)',alignItems:'center',justifyContent:'center',borderRadius:(kScreenWidth-16)/330*44/2,height:(kScreenWidth-16)/330*44, width:kScreenWidth-16, fontSize: 16}}>
                            <Text style={{fontSize:16,color:'white',fontWeight:'bold'}}>{'提交'}</Text>
                        </TouchableOpacity>
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
        fontSize:14,
        fontWeight:'bold',
        color:'#fff',
        paddingTop: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT + 36 : 50 + 36
    },
});

