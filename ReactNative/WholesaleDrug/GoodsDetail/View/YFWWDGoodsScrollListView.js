import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity,
    ScrollView, DeviceEventEmitter
} from 'react-native';
import {yfwOrangeColor} from '../../../Utils/YFWColor'
import {isNotEmpty, mobClick, tcpImage,isEmpty, iphoneTopMargin, adaptSize, convertImg} from "../../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../../Utils/ConvertUtils";
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager'
import YFWDiscountText from '../../../PublicModule/Widge/YFWDiscountText';
import { pushWDNavigation, kRoute_login,doAfterLogin } from '../../YFWWDJumpRouting';


export default class YFWWDGoodsScrollListView extends Component {

    static defaultProps = {
        Data:new Array(),
    }

    constructor(props) {
        super(props);
        this.state = {
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        }
    }

    componentDidMount() {
        let that = this
        //定位相关显示状态监听
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            that.setState({
                noLocationHidePrice:isHide
            })
        })
    }

    componentWillUnmount() {
        // 移除
        this.locationListener && this.locationListener.remove()
    }

    render() {
        return (
            <ScrollView style={styles.scrollViewStyle} horizontal={true} showsHorizontalScrollIndicator={false}>
                {this.renderItem()}
            </ScrollView>
        );

    }

    renderItem() {
        // 数组
        var itemAry = [];
        if (!this.props.Data) {
            return itemAry
        }
        let isLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        // 遍历
        for (let i = 0; i<this.props.Data.length; i++) {
            let dataItem = this.props.Data[i];
            let img_url =  tcpImage(dataItem.intro_image)
            let price = dataItem.price;
            let showBaoYou = dataItem.Isfreepostage
            let title = dataItem.name
            let marginLeft = 10
            itemAry.push(
                <View key={i} style={[styles.itemStyle,{marginLeft:marginLeft} ]}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}}  onPress={()=>this.clickItems(dataItem)}>
                        <Image style={[styles.imgStyle ]} resizeMode={'contain'} source={{uri:img_url}}/>
                        <Text style={[styles.textStyle ]} numberOfLines={1}>{title}</Text>
                        {this.state.noLocationHidePrice?<Text style={{fontSize: 11,color: "#999999",marginRight:18}}>仅做信息展示</Text>:
                            <TouchableOpacity activeOpacity={1} style={{marginRight:15}} onPress={()=>this.doAfterLogin()}>
                                {isLogin ? (<View style={{flexDirection:'row',justifyContent:'space-between',marginTop:2}}>
                                <YFWDiscountText navigation={this.props.navigation} style_text={{fontSize:13,fontWeight:'500'}} value={'¥'+toDecimal(price)}/>
                                {this.renderML(showBaoYou)}
                            </View>):
                                    (<Text style={styles.priceStyle}>{"价格登录可见"}</Text>)}
                            </TouchableOpacity>

                        }
                        {this.renderDeal(dataItem)}
                    </TouchableOpacity>

                </View>
            );
        }
        return itemAry;
    }

    renderDeal(item){
        if (item.is_sellout == '1') {
            return (
                <View style={{position:'absolute',width:40,height:16,right:0,borderRadius:8,backgroundColor:'#ccc',justifyContent:'center',alignItems:'center'}} >
                    <Text style={{color:'white',fontSize:10}}>已售罄</Text>
                </View>
            )
        }
        return null
    }

    renderML(show){
        if (show) {
            return (
                <View style={{marginRight:0,height:12,borderRadius:6,borderColor:'#1fdb9b',borderWidth:0.5,justifyContent:'center',alignItems:"center"}}>
                        <Text style={{fontSize:10,color:'#1fdb9b',paddingHorizontal:2}}>{'包邮'}</Text>
                </View>
            )
        } else {
            return <View style={{flex:1}}></View>
        }
    }

    doAfterLogin(){

        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{});

    }

    clickItems(badge){

        badge.value = badge.id
        mobClick('home-f1-adv1');
        if (isNotEmpty(badge.intro_image)){
            badge.img_url = convertImg(badge.intro_image)
        }

        const { navigate } = this.props.navigation;
        let userInfo = YFWUserInfoManager.ShareInstance();
        if (userInfo.hasLogin()) {
            pushWDNavigation(navigate, badge)
        }else {
            if((isEmpty(badge.is_login)||badge.is_login == '0')){
                pushWDNavigation(navigate, badge)
            }else {
                pushWDNavigation(navigate, {type: kRoute_login})
            }
        }
    }

}

var styles = StyleSheet.create({
    scrollViewStyle: {
        // 背景色
        backgroundColor:'white',
        height:adaptSize(130),
        // marginBottom:-(30+iphoneTopMargin())
    },

    itemStyle: {
        // 尺寸
        width:adaptSize(92),
        height:adaptSize(120),
        marginLeft:1

    },
    imgStyle:{
        flex:1,
        width: adaptSize(92),
        height:adaptSize(92),
        resizeMode:'contain',

    },
    textStyle:{
        color:'#333',
        textAlign:'center',
        marginTop:11,
        fontSize:11,
        fontWeight:'400',
        textAlign:'left'
    },
    priceStyle:{
        fontSize: 12,
        color:yfwOrangeColor(),
        textAlign: 'right',
    },
});