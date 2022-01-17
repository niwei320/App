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
    Dimensions,
    TextInput,
    ImageBackground,
    DeviceEventEmitter
} from 'react-native';
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWRequest from '../Utils/YFWRequest'
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import YFWToast from '../Utils/YFWToast'
const width = Dimensions.get('window').width;
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {dismissKeyboard_yfw, kScreenWidth, mapToJson} from "../PublicModule/Util/YFWPublicFunction";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {backGroundColor, darkLightColor} from "../Utils/YFWColor";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";

export default class UpdataQq extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "修改QQ号码",
        headerRight:<View style={{width:50}}/>,
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'normal', fontSize:17
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                              onPress={() => {navigation.goBack()}}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                       source={ require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            userQq: ''
        }
    }

    render() {
        const {navigate, state, goBack} = this.props.navigation;
        return (
            <TouchableOpacity style={{position: 'relative', flex: 1, backgroundColor:backGroundColor()}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                <View style={{backgroundColor:'white',marginTop:15}}>
                    <TextInput maxLength={14} style={{width:width,paddingRight:0,marginLeft:15,height:60}}
                               underlineColorAndroid='transparent'
                               keyboardType='numeric'
                               value={this.state.userQq}
                               onChangeText={(text)=>{this.setState({userQq:text.replace(/[^0-9]/ig,'')})}}
                               placeholderTextColor={darkLightColor()}
                               placeholder="请输入新的QQ号码">
                    </TextInput>
                </View>
                <View style={{alignItems:'center', marginTop:100}}>
                    <YFWTouchableOpacity style_title={{height:(kScreenWidth-44)/304*44, width:kScreenWidth-24, fontSize: 16}} title={'保存'}
                                         callBack={() => {this._updataTel(state,goBack)}}
                                         isEnableTouch={true}/>
                </View>
            </TouchableOpacity>
        )
    }

    _updataTel(state, goBack) {
        let reg = "^[1-9][0-9]{4,14}$";
        if(!this.state.userQq.match(reg)){
            YFWToast('请输入正确的QQ号');
            return
        }
        getItem(kAccountKey).then((id)=> {
            if (id) {
                let paramMap = new Map();
                let infoMap = new Map();
                let viewModel = new YFWRequestViewModel();

                paramMap.set('__cmd', 'person.account.update_app');
                infoMap.set('qq', this.state.userQq);
                paramMap.set('data', mapToJson(infoMap));
                viewModel.TCPRequest(paramMap, (res) => {
                    state.params.callback(this.state.userQq);
                    goBack();
                });
            } else {
                this.setState(()=>({
                        //跳转登录页面
                    }
                    )
                )
            }
        });
    }
}
