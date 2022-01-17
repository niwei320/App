/**
 * Created by admin on 2018/6/5.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ImageBackground,
    NativeModules
} from 'react-native';
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import {BaseStyles} from '../Utils/YFWBaseCssStyle'
import {darkNomalColor,backGroundColor} from '../Utils/YFWColor'
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {darkStatusBar,kScreenWidth,isIphoneX} from "../PublicModule/Util/YFWPublicFunction";
import YFWTitleView from '../PublicModule/Widge/YFWTitleView'
const {StatusBarManager} = NativeModules;
export default class MyIntergration extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "我的积分",
        headerTransparent: true,
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                            onPress={() => {navigation.goBack()}}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                        source={ require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerRight: <View style={{width:50}}/>,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor:'transparent',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0, backgroundColor:'transparent'},
        headerBackground: <Image source={require('../../img/order_detail_header.png')} style={{width:kScreenWidth, flex:1, resizeMode:'cover'}} opacity={0}/>
    });

    constructor(props) {
        super(props);
        this.state = {
           data:''
        }
    }

    componentDidMount() {
        darkStatusBar();
        getItem(kAccountKey).then((id)=> {
            if (id) {
                let paramMap = new Map();
                paramMap.set('__cmd', 'person.userpoint.getValidPoint');
                let viewModel = new YFWRequestViewModel();
                viewModel.TCPRequest(paramMap, (res) => {
                    this.setState({data: res.result})
                });
            } else {
                //跳转登录页面
                this.setState({})
            }
        });
    }

    render() {
        return (
            <View style={{flex:1, backgroundColor:backGroundColor()}}>
                <Image source={require('../../img/order_detail_header.png')} style={{width:kScreenWidth, height:173/375.0*kScreenWidth, resizeMode:'stretch'}}/>
                <View style={{flex:1, paddingHorizontal:13, position:'absolute', left:0, right:0, bottom:0, top:isIphoneX() ? 110 : 90}}>
                    {this._renderPointsView()}
                    {this._renderDecriptionView()}
                </View>
            </View>
        )
    }

    /** 积分 */
    _renderPointsView() {
        /*** 计算字体大小 */
        let text = this.state.data.toString()
        let length = text.length < 6 ? text.length%6 : 6
        let fontSize = 40-3*length
        return(
            <View style={[styles.content, {alignItems:'center', justifyContent:'center',}]}>
                <Text style={{fontSize:15, color:darkNomalColor()}}>当前积分</Text>
                <ImageBackground source={require('../../img/icon_mine_points.png')} style={{width:136,height:156,marginTop:15}} imageStyle={{resizeMode:'contain'}}>
                    <View style={{width:136, height:120, justifyContent:'center', alignItems:'center',paddingHorizontal:17}}>
                        <Text style={{color:'#fff', fontSize:fontSize, fontWeight:'500'}} numberOfLines={1}>{this.state.data}</Text>
                    </View>
                </ImageBackground>
            </View>
        )
    }

    /** 解释积分 */
    _renderDecriptionView() {
        return(
            <View style={styles.content}>
                <View style={{height:30}}>
                    <YFWTitleView title={'什么是商城积分'} style_title={{width:120}}/>
                </View>
                <Text style={{color:darkNomalColor(), fontSize:12, lineHeight:20}}>
                    商城积分是指用户在网站及客户端购物、评价、参加活动等情况给予的奖励。在消费时，积分可直接用于抵扣订单金额，每单最高抵扣订单金额的90%
                </Text>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    content: {
        marginBottom:17,
        paddingVertical:27,
        paddingHorizontal:20,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation:2
    },
})
