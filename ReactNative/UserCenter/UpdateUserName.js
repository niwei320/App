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
import EditView from '../widget/EditView'
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWRequest from '../Utils/YFWRequest'
import Navigation from "react-navigation";
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import YFWToast from '../Utils/YFWToast'
import TopBar from './TopBar'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import ScrollableTabView, {ScrollableTabBar,} from 'react-native-scrollable-tab-view';
import {log, logErr, logWarm} from '../Utils/YFWLog'
import {BaseStyles} from '../Utils/YFWBaseCssStyle'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {dismissKeyboard_yfw, isEmpty, kScreenWidth, mapToJson} from "../PublicModule/Util/YFWPublicFunction";
import {backGroundColor, darkLightColor} from "../Utils/YFWColor";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";

export default class UpdateUserName extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "修改真实姓名",
        headerRight:<View style={{height:50,width:50}}/>,
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
            new_name :''
        }
    }

    componentDidMount() {
        this.setState({
            new_name: this.props.navigation.state.params.newName
        });


    }

    render() {
        const {navigate,state,goBack} = this.props.navigation;
        return (
            <TouchableOpacity style={{position: 'relative', flex: 1, backgroundColor:backGroundColor()}} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                <View style={{backgroundColor:'white',flexDirection:'row',marginTop:15,height:60,padding:15}} >
                    <TextInput
                        underlineColorAndroid='transparent'
                        numberOfLines={1}
                        maxLength={16}
                        style={{fontSize:14,padding: 0,flex:1}}
                        onChangeText={(text)=>{this.new_name = text}}
                        placeholderTextColor={darkLightColor()}
                        placeholder="请输入新的真实姓名">
                    </TextInput>
                </View>
                <View style={{alignItems:'center', marginTop:100}}>
                    <YFWTouchableOpacity style_title={{height:(kScreenWidth-44)/304*44, width:kScreenWidth-24, fontSize: 16}} title={'保存'}
                                         callBack={() => {this._updataName(state,goBack)}}
                                         isEnableTouch={true}/>
                </View>
            </TouchableOpacity>
        )
    }

    _updataName(state,goBack) {
        if(isEmpty(this.new_name)){
            YFWToast("姓名不能为空")
            return
        }
        let paramMap = new Map();
        let infoMap = new Map();
        let viewModel = new YFWRequestViewModel();

        paramMap.set('__cmd', 'person.account.update_app');
        infoMap.set('real_name', this.new_name);
        paramMap.set('data', mapToJson(infoMap));
        viewModel.TCPRequest(paramMap, (res) => {
            state.params.callback(this.new_name);
            DeviceEventEmitter.emit('userinfochange');
            goBack();
        });
    }
}
