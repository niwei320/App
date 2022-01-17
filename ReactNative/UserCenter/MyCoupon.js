/**
 * Created by admin on 2018/7/19.
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
    FlatList, Platform, NativeModules,DeviceEventEmitter
} from 'react-native';
const width = Dimensions.get('window').width;
const {StatusBarManager} = NativeModules;
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';
import CouponDetail from './CouponDetail'
import {darkStatusBar, isIphoneX, kScreenWidth,isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle"
import YFWScrollableTabBar from "../PublicModule/Widge/YFWScrollableTabBar"
import YFWMore from '../widget/YFWMore';
import {pushNavigation} from "../Utils/YFWJumpRouting";
import {getSignInData, TYPE_SIGN_COUPON} from "../Utils/YFWInitializeRequestFunction";

export default class MyCoupon extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "我的优惠券",
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:40,height:40,}]}
                              onPress={()=>navigation.goBack()}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                       source={ require('../../img/top_back_white.png')}
                       defaultSource={require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerStyle: Platform.OS == 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white',backgroundColor: 'white'},
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'bold', fontSize:17
        },
        headerRight: (
            <YFWMore/>
        ),
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:width, flex:1, resizeMode:'stretch'}}/>,
    });


    constructor(props) {
        super(props);
        this.state = {
            countAll: '',
            countDanpin: '',
            countDianpu: '',
            countPintai: '',
        }
    }

    componentDidMount() {
        darkStatusBar();
    }

    _clickedMethod(type) {
        let {navigate} = this.props.navigation;
        switch (type) {
            case 1 :
                pushNavigation(navigate, {type: 'get_coupon_record'})
                break;
            case 2:
                getSignInData(navigate,TYPE_SIGN_COUPON);
                break;
        }
    }

    _refreshTab (tabdata) {
        let {countAll} = this.state
        let {countDanpin} = this.state
        let {countDianpu} = this.state
        let {countPintai} = this.state
        if(
            countAll !== tabdata.countAll
            || countDanpin !== tabdata.countDanpin
            || countDianpu !== tabdata.countDianpu
            || countPintai !== tabdata.countPintai){
            this.setState({
                countAll:tabdata.countAll,
                countDanpin:tabdata.countDanpin,
                countDianpu:tabdata.countDianpu,
                countPintai:tabdata.countPintai,
            })
        }
    }

    _tabNameFormat(count){
        return (isNotEmpty(count)?(count<=99?'('+count+')':'99+'):'')
    }
    _renderBottom() {
        return (
            <View style={styles.bottomView}>
                <TouchableOpacity
                    onPress={()=>this._clickedMethod(1)}
                    hitSlop={{left:0,top:10,bottom:15,right:0}}
                    style={{flex:1,justifyContent: 'center',alignItems:'center'}}
                >
                    <Text style={{fontWeight:'bold',fontSize: 15, color: "#333333"}}>优惠券使用记录</Text>
                </TouchableOpacity>
                <View style={{width: 1, height: 15, backgroundColor: "#dddddd"}} />
                <TouchableOpacity
                    onPress={()=>this._clickedMethod(2)}
                    hitSlop={{left:0,top:10,bottom:15,right:0}}
                    style={{flex:1,justifyContent: 'center',alignItems:'center'}}
                >
                    <Text style={{fontWeight:'bold',fontSize: 15, color: "#333333"}}>领券中心</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        let {countAll} = this.state
        let {countDanpin} = this.state
        let {countDianpu} = this.state
        let {countPintai} = this.state
        let tabName1 = '全部' + this._tabNameFormat(countAll)
        let tabName2 = '单品券'+ this._tabNameFormat(countDanpin)
        let tabName3 = '店铺券'+ this._tabNameFormat(countDianpu)
        let tabName4 = '平台券'+ this._tabNameFormat(countPintai)
        return (
            <View style={styles.container}>
                <ScrollableTabView
                    style={styles.pagerView}
                    initialPage={0}
                    locked={true}
                    tabBarBackgroundColor='white'
                    tabBarActiveTextColor='#16c08e'
                    renderTabBar={() => <YFWScrollableTabBar tabNames={[tabName1,tabName2,tabName3,tabName4]} tabStyle={'longName'} width={width/4}/>}
                    tabBarUnderlineStyle={styles.lineStyle}
                    onChangeTab={(obj) => {
                    this._changerType(obj.i);
                      }
                    }
                >
                    <CouponDetail tabLabel={tabName1} ref="ref_detail" navigation = {this.props.navigation} refreshTab={this._refreshTab.bind(this)} type={'0'}/>
                    <CouponDetail tabLabel={tabName2} ref="ref_detail" navigation = {this.props.navigation} refreshTab={this._refreshTab.bind(this)} couponType={'2'} type={'0'}/>
                    <CouponDetail tabLabel={tabName3} ref="ref_detail" navigation = {this.props.navigation} refreshTab={this._refreshTab.bind(this)} couponType={'1'} type={'0'}/>
                    <CouponDetail tabLabel={tabName4} ref="ref_detail" navigation = {this.props.navigation} refreshTab={this._refreshTab.bind(this)} couponType={'3'} type={'0'}/>
                </ScrollableTabView>
                {this._renderBottom()}
            </View>
        )
    }

    _changerType(i) {
        // this.refs.ref_detail._changeStatus(i)
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',

    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white',
    },
    lineStyle: {
        height: 2,
        backgroundColor: '#16c08e',
    },
    textMainStyle: {
        flex: 1,
        fontSize: 40,
        marginTop: 10,
        textAlign: 'center',
        color: 'black'
    },

    textHeaderStyle: {
        fontSize: 40,
        color: 'white'
    },
    bottomView: {
        backgroundColor:'#FFF',
        width:kScreenWidth,
        height: isIphoneX()?74:54,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor:'#fafafa',
        paddingBottom: isIphoneX()?20:0,
    }
})