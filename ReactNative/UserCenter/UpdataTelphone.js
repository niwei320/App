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
import ScrollableTabView, {ScrollableTabBar,} from 'react-native-scrollable-tab-view';
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {dismissKeyboard_yfw, kScreenWidth, mapToJson} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {backGroundColor, darkLightColor} from "../Utils/YFWColor";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";

export default class UpdataTelphone extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "修改固话",
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
            userTel: ''
        }
    }

    render() {
        const {navigate, state, goBack} = this.props.navigation;
        return (
            <TouchableOpacity style={{position: 'relative', flex: 1, backgroundColor:backGroundColor()}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                <View style={{marginTop:10}}>
                    <TextInput style={{width:width,paddingRight:0,marginLeft:35,height:60}}
                               underlineColorAndroid='transparent'
                               keyboardType='numeric'
                               onChangeText={(text)=>{this.state.userTel = text}}
                               placeholderTextColor={darkLightColor()}
                               placeholder="请输入新的固话号码">
                    </TextInput>
                </View>
                <View style={{alignItems:'center', marginTop:100}}>
                    <YFWTouchableOpacity style_title={{height:(kScreenWidth-54)/304*54, width:kScreenWidth-24, fontSize: 16}} title={'保存'}
                                         callBack={() => {this._updataTel(state,goBack)}}
                                         isEnableTouch={true}/>
                </View>
            </TouchableOpacity>
        )
    }

    _updataTel(state, goBack) {
        let reg = "^((\\d{7,8})|((0)[2-9]{1}\\d{2}|((010)|(02)\\d{1}))(\\d{7,8})|((0)[2-9]{1}\\d{2}|((010)|(02)\\d{1}))(\\d{7,8})(\\d{4}|\\d{3}|\\d{2})|(\\d{7,8})" + "" +
            "(\\d{4}|\\d{3}|\\d{2}))$";
        if(!this.state.userTel.match(reg)){
            YFWToast('请输入正确的固话号');
            return
        }
        getItem(kAccountKey).then((id)=> {
            if (id) {
                let paramMap = new Map();
                let infoMap = new Map();
                let viewModel = new YFWRequestViewModel();

                paramMap.set('__cmd', 'person.account.update_app');
                infoMap.set('phone', this.state.userTel);
                paramMap.set('data', mapToJson(infoMap));
                viewModel.TCPRequest(paramMap, (res) => {
                    state.params.callback(this.state.userTel);
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
