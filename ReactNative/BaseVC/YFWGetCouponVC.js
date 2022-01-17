import React, {Component} from 'react';
import {
    View,
    Image,
    DeviceEventEmitter,
    Text,
    Platform,
    TouchableOpacity, NativeModules
} from 'react-native'
import { BaseStyles } from '../Utils/YFWBaseCssStyle';
import { kScreenWidth, adaptSize } from '../PublicModule/Util/YFWPublicFunction';
import { doAfterLogin } from '../Utils/YFWJumpRouting';
const { StatusBarManager } = NativeModules;
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWToast from '../Utils/YFWToast';



export default class YFWGetCouponVC extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "领取优惠券",
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
            <View style={{width:30}}/>
        ),
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>,
    });

    constructor(props) {
        super(props)
        this.model = this.props.navigation.state.params.state;
        this.value = ''
        this._getCouponInfo()
    }

    componentWillMount(){
    }

    componentDidMount(){

    }

    render() {
        return (
            <View style={{flex:1,backgroundColor:'white',alignItems:'center'}}>
                <Image source={require('../../img/quan-icon.png')} style={{width:adaptSize(145),height:adaptSize(100),marginTop:adaptSize(190)}}/>
                <Text style={{color:'#666666',fontSize:15,marginTop:adaptSize(36)}}>确认领取</Text>
                <Text style={{color:'#666666',fontSize:15,marginTop:adaptSize(9)}}>{this.value.title}</Text>
                <Text style={{color:'#fc5656',fontSize:15,marginTop:adaptSize(10)}}>{this.value.price}元
                    <Text style={{color:'#666666',fontSize:15,marginTop:adaptSize(9)}}>店铺优惠券吗？</Text>
                </Text>
                <TouchableOpacity activeOpacity={1} style={{marginTop:adaptSize(53),width:adaptSize(87),height:adaptSize(30),borderRadius:adaptSize(15),borderColor:'#fc5656',borderWidth:1,alignItems:'center',justifyContent:'center'}}
                    onPress={()=>{this._getCouponMethod()}}>
                    <Text style={{color:'#fc5656',fontSize:15}}>确认领取</Text>
                </TouchableOpacity>
            </View>
        )
    }

    //优惠券信息
    _getCouponInfo(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.medicine.getCouponDetail');
        paramMap.set('uuid', this.model.value);
        viewModel.TCPRequest(paramMap, (res)=> {
            this.value = res.result
            this.setState({})
        });
    }

    //领取优惠券
    _getCouponMethod(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.usercoupons.acceptCoupon');
        paramMap.set('id', this.model.value);
        // paramMap.set('id', 'b68bfcac-38a0-4a41-a5a5-c56cdf734cfe');
        viewModel.TCPRequest(paramMap, (res)=> {
            YFWToast('领取成功');
            this.props.navigation.goBack()
        })
    }


}
