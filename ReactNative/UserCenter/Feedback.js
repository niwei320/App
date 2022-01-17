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
    ImageBackground
} from 'react-native';
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWRequest from '../Utils/YFWRequest'
import {getItem, setItem, kAccountKey, NeverOpenEvaluation, ThisOpenEvaluation} from '../Utils/YFWStorage'
import YFWToast from '../Utils/YFWToast'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import {backGroundColor} from '../Utils/YFWColor';
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {EMOJIS} from "../PublicModule/Util/RuleString";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import YFWUserDetailInfoModel from "./Model/YFWUserDetailInfoModel";
import {darkStatusBar, dismissKeyboard_yfw, safe} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {get_new_ip} from '../Utils/YFWInitializeRequestFunction'
export default class Feedback extends Component {

    static navigationOptions = ({navigation}) => ({
        headerLeft:(
            <TouchableOpacity style={[BaseStyles.item,{width:50}]}
                            hitSlop={{left:10,top:10,bottom:15,right:10}}
                              onPress={()=>navigation.state.params.backMethod()}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={require('../../img/top_back_green.png')}/>
            </TouchableOpacity>
        ),
        headerRight: (
            <TouchableOpacity
                hitSlop={{left:10,top:10,bottom:15,right:10}}
                onPress={() => this2._commit(navigation)}>
                <Text style={{fontSize:16,color:'#16c08e',marginRight:5}}
                >提交</Text>
            </TouchableOpacity>
        ),
        tabBarVisible: false,
        headerTitle: "意见反馈",

    });

    constructor(props) {
        super(props);
        this2 =this
        this.state = {
            data: ''
        }
    }
    componentWillMount(){

        this.props.navigation.setParams({ backMethod:this._backMethod });

    }

    componentDidMount() {
        darkStatusBar();
    }

    _backMethod=()=> {
        if (this.props.navigation.state.params.state.from == 'rate'){
            setItem(ThisOpenEvaluation,1)
        }
        this.props.navigation.goBack();
    }

    onTextChange(text){
        YFWNativeManager.mobClick('account-feedback-input');
        this.setState(()=>({
            data:text.replace(EMOJIS,'')
        })
    )
    }

    render() {
        return (
            <TouchableOpacity style={styles.container} onPress={()=>{dismissKeyboard_yfw()}} activeOpacity={1}>
                <AndroidHeaderBottomLine/>
                <View style={{backgroundColor:'white',marginTop:15,height:200}}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder="您的意见对我非常重要，我们会不断的优化和改善，努力为您带来更好的体验，谢谢！"
                        placeholderTextColor="#999999"
                        multiline={true}
                        onChangeText={this.onTextChange.bind(this)}
                        value={this.state.data}
                        style={{flex:1,color:'black',fontSize:14,padding:20,paddingTop:15,textAlignVertical:'top'}}>

                    </TextInput>
                </View>
            </TouchableOpacity>
        )
    }


    _getUserInfo(retunBlock){

        if (YFWUserInfoManager.ShareInstance().hasLogin()){

            let paramMap = new Map();
            paramMap.set('__cmd', 'person.account.getAccountInfo');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap , (res)=>{
                let data = YFWUserDetailInfoModel.getModelData(res.result);
                let info = {
                    mobile:safe(data.mobile),
                    qq:safe(data.qq)
                }
                if (retunBlock) retunBlock(info);

            },(error)=>{
                let info = {
                    mobile:'',
                    qq:''
                }
                if (retunBlock) retunBlock(info);

            });

        } else {

            let info = {
                mobile:'',
                qq:''
            }
            if (retunBlock) retunBlock(info);

        }


    }


    _commit(navigation) {
        YFWNativeManager.mobClick('account-feedback-input-submit');

        this._getUserInfo((info)=>{
            get_new_ip((ip)=>{
                let paramMap = new Map();
                let viewModel = new YFWRequestViewModel();
                paramMap.set('__cmd', 'guest.common.app.feedback');
                paramMap.set('content', this.state.data);
                paramMap.set('mobile', safe(info.mobile));
                paramMap.set('qq', safe(info.qq));
                paramMap.set('accountId', safe(YFWUserInfoManager.ShareInstance().ssid));
                paramMap.set('fromip', ip);
                viewModel.TCPRequest(paramMap, (res) => {
                    YFWToast('提交成功');
                    if (this.props.navigation.state.params.state.from == 'rate'){
                        setItem(NeverOpenEvaluation,1)
                    }
                    navigation.goBack();
                },() => {
                    if (this.props.navigation.state.params.state.from == 'rate'){
                        setItem(ThisOpenEvaluation,1)
                    }
                });

            })
        });
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor:backGroundColor()
    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white'
    },

    lineStyle: {
        // width:ScreenWidth/3,
        height: 2,
        backgroundColor: '#FF0000'
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
    }
})
