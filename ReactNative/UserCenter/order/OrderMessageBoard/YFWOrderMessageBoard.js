import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform, NativeModules, DeviceEventEmitter,Keyboard
} from 'react-native';
import {
    kScreenWidth,
    isEmpty,
    isIphoneX,
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWToast from "../../../Utils/YFWToast";
import YFWOrderMessageModel from "./YFWOrderMessageModel";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";

export default class YFWOrderMessageBoard extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '留言',
        headerRight: <View style={{width:50}}/>,
        headerStyle:Platform.OS == 'android' ?[navigation.headerStyle,{elevation:1,
            height: Platform.Version >= 19 ? 50 + NativeModules.StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? NativeModules.StatusBarManager.HEIGHT : 0}]:undefined
    });

    constructor(props) {
        super(props);
        this.state = {
            input:'',
            messageArray:[],
            loading:false,
            placeholder:'请输入您的留言',
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {
    }

    componentDidMount() {
        this._requestMessageArray()
        Keyboard.addListener("keyboardDidShow", this._keyboardDidShow);
        Keyboard.addListener("keyboardDidHide", this._keyboardDidHide);
        this.listenerPushGetOrderAdvisory = DeviceEventEmitter.addListener('push_get_order_advisory', (data) => {
            if(this.props.navigation.isFocused()){
                if(this.props.navigation.state.params.state.orderno == data.orderno){
                    this._requestMessageArray()
                } else {
                    pushNavigation(this.props.navigation.navigate, {type: 'order_message_board', orderno:data.orderno});
                }
            }
        });
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        this.timerPlaceholder && clearTimeout(this.timerPlaceholder);
        this.listenerPushGetOrderAdvisory && this.listenerPushGetOrderAdvisory.remove()
    }

//-----------------------------------------------METHOD---------------------------------------------

    _keyboardDidShow =(e)=>{
        this.timerPlaceholder = setTimeout(() => {
            this.setState({
                placeholder:'在此输入您的留言',
            })
        }, 200);
        this._scrollListToEnd(false)
    }

    _keyboardDidHide =(e)=>{
        this.setState({
            placeholder:'请输入您的留言',
        })
    }

    _requestMessageArray() {
        this.state = {
            loading:true,
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getAdvisoryByOrderno');
        paramMap.set('orderno', this.props.navigation.state.params.state.orderno);
        viewModel.TCPRequest(paramMap, (res)=> {
            console.log(JSON.stringify(res))
            let data = YFWOrderMessageModel.getModelArray(res.result)
            this.setState({
                messageArray:data.messageArray,
                loading:false,
            })
            this._scrollListToEnd(true)
        },(error)=>{
            this.state = {
                loading:false,
            }
        })
    }

    _sentMessage(msg) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.insertPersonAdvisory');
        paramMap.set('orderno', this.props.navigation.state.params.state.orderno);
        paramMap.set('content', msg.trim());
        viewModel.TCPRequest(paramMap, (res)=> {
            console.log(JSON.stringify(res))
            this._requestMessageArray()
        })
    }

    _onChangeText (text) {
        let msg = text.trim()
        this.setState({
            input:msg
        })
    }

    _onSubmitEditing () {
        let {input} = this.state
        if(isEmpty(input)){
            YFWToast('请填写留言内容')
            return
        }
        this.setState({
            input:'',
        })
        this._sentMessage(input)
    }

    _scrollListToEnd (animated) {
        this.timer = setTimeout(() => {
            this.msgList && this.msgList.scrollToEnd({animated:animated,})
        }, 300);
    }

//-----------------------------------------------RENDER---------------------------------------------

    _renderItem (item) {
        item = item.item
        let role = item.role
        let message = item.message
        let time = item.time
        return (
            <View style={{width:kScreenWidth,paddingHorizontal: 20, paddingTop: 14}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={{fontWeight:'bold', fontSize: 15, lineHeight: 19, color: "#16c08e"}}>{role}</Text>
                    <Text style={{fontSize: 11, color: "#999999"}}>{time}</Text>
                </View>
                <Text style={{marginTop:5, fontSize: 14, lineHeight: 19, color: "#666666"}}>{message}</Text>
                <View style={{width:'100%' ,height: 1,marginTop: 10, backgroundColor: "#ededed"}}/>
            </View>
        )
    }

    render() {
        return (
            <KeyboardAvoidingView style={[style.center,{flex:1,backgroundColor:'#FFF'}]} behavior="padding" keyboardVerticalOffset={80}>
                <FlatList
                    refreshing={this.state.loading}
                    onRefresh={() => this._requestMessageArray()}
                    ref={(ref) => {this.msgList = ref}}
                    style={{flex:1}}
                    renderItem={this._renderItem.bind(this)}
                    data={this.state.messageArray}
                    initialNumToRender={100}
                />
                <View style={{flexDirection:'row',alignItems:'flex-end',width:kScreenWidth, backgroundColor: "#f8f8f8", paddingHorizontal: 13, paddingTop: 11,paddingBottom: isIphoneX()?40:15}}>
                    <TextInput
                        placeholder={this.state.placeholder}
                        placeholderTextColor="#cccccc"
                        multiline={true}
                        style={{flex:1,color:'#333333',fontSize:14,textAlignVertical:'top',padding:10, backgroundColor:'#ffffff'}}
                        autoFocus={false}
                        maxLength={250}
                        blurOnSubmit={true}
                        onChangeText={this._onChangeText.bind(this)}
                        onSubmitEditing={this._onSubmitEditing.bind(this)}
                        returnKeyType={'send'}
                        underlineColorAndroid={'transparent'}
                    >
                        {this.state.input}
                    </TextInput>
                    <TouchableOpacity onPress={()=>{this._onSubmitEditing()}}
                                      style={[BaseStyles.centerItem,{marginLeft:7,width: 64, height: 39, borderRadius: 3, backgroundColor: this.state.input.length>0?"#1fdb9b":"#dddddd"}]}>
                        <Text style={{fontWeight:'bold',fontSize: 13, color: "#ffffff"}}>发送</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});
