import React from 'react'
import {
    View,
    Dimensions,
    TouchableOpacity,
    Image,
    Text,
    Platform,
    BackAndroid
} from 'react-native'
const width = Dimensions.get('window').width;
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import {isNotEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
export default class OrderStatusVc extends React.Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: `${navigation.state.params.state.title}`,
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                              onPress={()=>{
                              navigation.goBack(navigation.state.params.state.gobackKey);
                          }}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={ require('../../../img/top_back_green.png')} defaultSource={require('../../../img/top_back_green.png')}/>
            </TouchableOpacity>
        )
    });




    constructor(props) {
        super(props)
        this.onBackAndroid = this.onBackAndroid.bind(this)
        this.listener();
    }

    listener(){
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid);
                }
            }
        );
        this.didBlur = this.props.navigation.addListener('didBlur',
            payload => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress',this.onBackAndroid);
                }
            }
        );
    }

    onBackAndroid=()=>{
        let {goBack} = this.props.navigation;
        goBack(this.props.navigation.state.params.state.gobackKey)
        return true;
    }

    render() {
        return (
            <View style={{ width: width, flexDirection: 'column',alignItems:'center',backgroundColor:"#f5f5f5"}}>
                <AndroidHeaderBottomLine/>
                <Image style={{width: 80, height: 80,marginTop:30}}
                       source={require('../../../img/user_center_payback_ok.png')}/>
                <Text
                    style={{fontSize:15,color:'#333333',marginTop:20}}>{this.props.navigation.state.params.state.tips}</Text>
                <TouchableOpacity activeOpacity={1}
                                  onPress={()=>this.checkDetail(this.props.navigation.state.params.state.orderNo)}>
                    <View
                        style={{ width: width - 40, height: 40,marginLeft: 20,alignItems: 'center',backgroundColor: '#16c08e',borderRadius: 3, justifyContent: 'center',marginTop:30}}>
                        <Text style={{fontSize:15,color:'#FFF'}}>查看订单详情</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    checkDetail(orderNo) {
        let lastPage = this.props.navigation.state.params.state.lastPage;
        if (isNotEmpty(lastPage)&&lastPage == 'OrderDetail') {
            let {goBack} = this.props.navigation;
            goBack(this.props.navigation.state.params.state.gobackKey)
        } else {
            let {navigate} = this.props.navigation;
            this.props.navigation.pop();
            pushNavigation(navigate, {type: 'get_order_detail', value: orderNo,gobackKey:this.props.navigation.state.params.state.gobackKey})
        }
    }
}
