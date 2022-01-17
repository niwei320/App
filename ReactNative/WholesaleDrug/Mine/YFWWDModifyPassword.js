import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, TextInput,
} from 'react-native';
import {EMOJIS, NUMBERS} from "../../PublicModule/Util/RuleString";
import {isAndroid, isEmpty, kScreenWidth, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import YFWToast from "../../Utils/YFWToast";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import MyTextInput from "../../widget/YFWTextInput";
import LinearGradient from "react-native-linear-gradient";
import YFWWDTipsAlert from "../Widget/YFWWDTipsAlert";

export default class YFWWDModifyPassword extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '修改密码',
        headerRight: <View style={{width:50}}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            old_password:'',
            new_password:'',
            new_password_again:'',
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    requestModify() {
        let {old_password, new_password, new_password_again} = this.state
        if(isEmpty(old_password)){
            YFWToast('请输入当前密码')
            return
        }
        if(isEmpty(new_password)){
            YFWToast('请输入新密码')
            return
        }
        if(new_password !== new_password_again){
            YFWToast('两次密码输入不一致')
            return
        }
        let paramMap = new Map()
        paramMap.set('__cmd','guest.account.changePwd')
        paramMap.set('old_password',old_password)
        paramMap.set('new_password',new_password)
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if(safeObj(res.result)){
                this.tipsAlert&&this.tipsAlert.showView(
                    '',
                    '密码修改成功',
                    '确定',
                    [],
                    ()=>{this.props.navigation&&this.props.navigation.goBack()}
                )
            }
        }, (err) =>{
        },true);
    }

//-----------------------------------------------RENDER---------------------------------------------



    render() {
        let {old_password,new_password,new_password_again} = this.state
        return (
            <View style = {style.container_style}>
                <View style={{marginTop:13, backgroundColor:'white'}}>
                    <View style={{width: kScreenWidth, height: 52, paddingHorizontal:19, flexDirection:'row', alignItems: 'center'}}>
                        <Text style={{color:'rgb(51,51,51)',fontSize: 15}}>当前密码：</Text>
                        <View style={{ flex:1, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                            <MyTextInput
                                style={{flex:1,color:'rgb(51,51,51)',fontSize: 15}}
                                placeholderTextColor={'rgb(204,204,204)'}
                                placeholder={'请输入当前密码'}
                                value={old_password}
                                keyboardType={'default'}
                                secureTextEntry={true}
                                onChangeText={(text)=>{
                                    text = text.replace(EMOJIS,'')
                                    this.setState({
                                        old_password : text
                                    })
                                }}
                            />
                        </View>
                    </View>

                    <View style={{width: kScreenWidth, height: 52, paddingHorizontal:19, flexDirection:'row', alignItems: 'center'}}>
                        <Text style={{color:'rgb(51,51,51)',fontSize: 15}}>新密码：</Text>
                        <View style={{ flex:1, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                            <MyTextInput
                                style={{flex:1,color:'rgb(51,51,51)',fontSize: 15}}
                                placeholderTextColor={'rgb(204,204,204)'}
                                placeholder={'请输入新密码'}
                                value={new_password}
                                keyboardType={'default'}
                                secureTextEntry={true}
                                onChangeText={(text)=>{
                                    text = text.replace(EMOJIS,'')
                                    this.setState({
                                        new_password : text
                                    })
                                }}
                            />
                        </View>
                    </View>
                    <View style={{width: kScreenWidth, height: 52, paddingHorizontal:19, flexDirection:'row', alignItems: 'center'}}>
                        <Text style={{color:'rgb(51,51,51)',fontSize: 15}}>确认密码：</Text>
                        <View style={{ flex:1, flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                            <MyTextInput
                                style={{flex:1,color:'rgb(51,51,51)',fontSize: 15}}
                                placeholderTextColor={'rgb(204,204,204)'}
                                placeholder={'请再次输入密码'}
                                value={new_password_again}
                                keyboardType={'default'}
                                secureTextEntry={true}
                                onChangeText={(text)=>{
                                    text = text.replace(EMOJIS,'')
                                    this.setState({
                                        new_password_again : text
                                    })
                                }}
                            />
                        </View>
                    </View>
                </View>
                <View style={{width: kScreenWidth-72,height:100,shadowOffset:{width: 0,height:5},shadowColor:'black',shadowOpacity:0.2,elevation:10}}>
                    <LinearGradient
                        style={style.login_botton_style}
                        colors={['rgb(82,66,255)','rgb(65,109,255)']}
                        start={{x: 1, y: 0}}
                        end={{x: 0, y: 1}}
                        locations={[0,1]}
                    >
                        <TouchableOpacity style={{ flex: 1,alignItems:'center',justifyContent:'center'}} onPress={() => this.requestModify()}>
                            <Text style={{fontSize:17,color:'white',fontWeight:'bold'}}>确 认</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
                <YFWWDTipsAlert ref={(e)=>this.tipsAlert=e} />
            </View>
        )
    }

}

const style = StyleSheet.create({
    container_style: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    login_botton_style: { width: kScreenWidth-72,height: 42, borderRadius: 24},
});
