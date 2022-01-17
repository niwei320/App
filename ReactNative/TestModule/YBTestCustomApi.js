import React,{Component} from 'react'
import {View, TextInput, StyleSheet,TouchableOpacity,Text,Image,Alert, FlatList, ScrollView} from 'react-native'
import {backGroundColor,darkLightColor,darkTextColor, yfwGreenColor, yfwLineColor} from '../Utils/YFWColor'
import { deepCopyObj, iphoneBottomMargin, isEmpty, isNotEmpty, safe, kScreenHeight, kScreenWidth, safeArray, safeObj,} from "../PublicModule/Util/YFWPublicFunction";
import YFWToast from '../Utils/YFWToast';
import { BaseStyles } from '../Utils/YFWBaseCssStyle';
import YFWCheckButtonView from '../PublicModule/Widge/YFWCheckButtonView';
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YBTipsApiInfoView from './Views/YBTipsApiInfoView';
import YBApiHelper from './Util/YBApiHelper';
import YBTipsResultListView from './Views/YBTipsResultListView';

export default class YBTestCustomApi extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: navigation.state.params.headerTitle&&navigation.state.params.headerTitle.length>0?navigation.state.params.headerTitle:"自定义",
        headerRight: <TouchableOpacity onPress={() => {navigation.state.params.rightAction&&navigation.state.params.rightAction()}} activeOpacity={1} style={{justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 15}}>
                        <Text style={{fontSize: 13, color: '#333'}}>{'测试'}</Text>
                    </TouchableOpacity>,
    });

    constructor(props) {
        super(props)
        this.state = {
            data: {},
            dataSource:[],
            cmd:'',
            params:[
                {key:'',value:'',select:true},
            ],
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({
            rightAction:()=>this._testAll()
        })
        let info = safeObj(this.props.navigation.state.params.info)
        if (isNotEmpty(info)) {
            let newParams = []
            if (isNotEmpty(info.paramsMap) && info.paramsMap.size > 0) {
                for (let [k,v] of info.paramsMap) {
                    newParams.push({key:k,value:safe(v),select:true})
                }
            }
            if (newParams.length == 0) {
                newParams.push({key:'',value:'',select:true})
            }
            this.setState({
                cmd: info.cmd,
                params: newParams
            })
        }
    }

    componentWillUnmount() {

    }

    render() {
        return(
            <View style = {BaseStyles.container}>
                <View style={{marginHorizontal:13,marginTop:21,backgroundColor:'white',borderRadius:12,minHeight:21,paddingVertical:21}}>
                    <View style={{flexDirection:'row',paddingHorizontal:13,marginBottom:12}}>
                        <Text style={{fontSize:14,color:'#333',fontWeight:'500'}}>{'接口名：'}</Text>
                        <TextInput style={{fontSize:14,color:'#333',flex:1}}
                                        underlineColorAndroid='transparent'
                                        maxLength={100}
                                        returnKeyType={'done'}
                                        onChangeText={this._onChangeText.bind(this)}
                                        value={this.state.cmd}
                                        placeholderTextColor="#ccc"
                                        placeholder="请输入接口名"/>
                    </View>
                    <View style={{marginHorizontal:13,height:1,backgroundColor:yfwLineColor()}}/>
                    {this._renderParams()}
                </View>
                <View style={{marginHorizontal:13,marginTop:21,backgroundColor:'white',borderRadius:12,minHeight:21,paddingVertical:21,paddingHorizontal:13}}>
                    <YBTipsApiInfoView cmd={this.state.cmd} status={this.state.data.status} spendTime={this.state.data.fetchSpendTime}></YBTipsApiInfoView>
                </View>
                <View style={{flex:1,marginHorizontal:13,marginTop:10,marginBottom:iphoneBottomMargin()+20,backgroundColor:'white',borderRadius:12,paddingVertical:21}}>
                    <YBTipsResultListView dataSource={this.state.dataSource} extraData={this.state}></YBTipsResultListView>
                </View>
            </View>
        )
    }

    _renderParams() {
        return (
            <ScrollView style={{maxHeight:kScreenHeight/3}} ref={(e)=>{this.paramsScrollView = e}}>
                {this.state.params.map((item,index)=>{
                        return (
                            <View key={index+'param'} style={{flexDirection:'row',paddingHorizontal:13,paddingBottom:8,backgroundColor:'white',marginTop:8,...BaseStyles.centerItem}}>
                                <View>
                                    <Text style={{fontSize:14,color:'#333',fontWeight:'500'}}>{'参数'+(index+1)}</Text>
                                    <YFWCheckButtonView style={{width:25,height:25,marginLeft:13}} selectFn={()=>{item.select = !item.select;this.setState({})}}
                                                select={item.select}/>
                                </View>
                                <View style={{marginLeft:10,flex:1}}>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={{fontSize:14,color:'#333',fontWeight:'500'}}>{'key ：'}</Text>
                                        <TextInput style={{fontSize:14,color:'#333',maxWidth:kScreenWidth/3}}
                                                        underlineColorAndroid='transparent'
                                                        maxLength={100}
                                                        returnKeyType={'done'}
                                                        onChangeText={(text)=>{item.key = text;this.setState({})}}
                                                        value={item.key}
                                                        placeholderTextColor="#ccc"
                                                        placeholder="请输入参数key"/>
                                    </View>
                                    <View style={{flexDirection:'row',marginTop:10}}>
                                        <Text style={{fontSize:14,color:'#333',fontWeight:'500'}}>{'value：'}</Text>
                                        <TextInput style={{fontSize:14,color:'#333',maxWidth:kScreenWidth/3}}
                                                        underlineColorAndroid='transparent'
                                                        maxLength={100}
                                                        returnKeyType={'done'}
                                                        onChangeText={(text)=>{item.value = text;this.setState({})}}
                                                        value={item.value}
                                                        placeholderTextColor="#ccc"
                                                        placeholder="请输入值"/>
                                    </View>
                                </View>
                                <View>
                                    {
                                    this.state.params.length > 1 && <TouchableOpacity onPress={()=>{this._delectAction(index)}} hitSlop={{top:10,left:10,bottom:10,right:10}} style={{width:20,height:20,borderRadius:20,borderColor:yfwGreenColor(),borderWidth:1}}>
                                        <View style={{position:'absolute',width:16,height:1.5,borderRadius:2,backgroundColor:yfwGreenColor(),left:1,top:8,transform:[{rotate:'45deg'}]}}></View>
                                        <View style={{position:'absolute',width:1.5,height:16,borderRadius:2,backgroundColor:yfwGreenColor(),left:8,top:1,transform:[{rotate:'45deg'}]}}></View>
                                    </TouchableOpacity>
                                    }
                                    {
                                    index == (this.state.params.length - 1) && <TouchableOpacity onPress={()=>{this._addAction()}} hitSlop={{top:10,left:10,bottom:10,right:10}} style={{width:20,height:20,marginTop:10,borderRadius:20,borderColor:yfwGreenColor(),borderWidth:1}}>
                                        <View style={{position:'absolute',width:16,height:1.5,borderRadius:2,backgroundColor:yfwGreenColor(),left:1,top:8}}></View>
                                        <View style={{position:'absolute',width:1.5,height:16,borderRadius:2,backgroundColor:yfwGreenColor(),left:8,top:1}}></View>
                                    </TouchableOpacity>
                                    }
                                </View>
                                <View style={{position:'absolute',bottom:0,left:13,right:13,height:1,backgroundColor:yfwLineColor()}}/>
                            </View>
                        )
                    })}
            </ScrollView>
        )
    }

    _onChangeText(text) {
        this.setState({
            cmd:text
        })
    }

    _addAction() {
        this.state.params.push({
            key:'',value:'',select:true
        })
        this.setState({},()=>{
            setTimeout(() => {
                this.paramsScrollView && this.paramsScrollView.scrollToEnd()
            }, 300);
        })
    }

    _delectAction(index) {
        Alert.alert('提醒','是否删除此参数?',[
            {text:'确定',onPress:()=>{
                this.state.params.splice(index,1)
                this.setState({})
            }},
            {text:'取消',onPress:()=>{}}
        ]
    )
    }

    

    _testAll() {
        if (isEmpty(this.state.cmd)) {
            YFWToast('请输入接口名')
            return
        }
        let paramsMap = new Map()
        paramsMap.set('__cmd',this.state.cmd)
        this.state.params.map((info)=>{
            if (info.select && isNotEmpty(info.key)) {
                paramsMap.set(info.key,info.value)
            }
        })
        let newData = {cmd:this.state.cmd}
        newData.status = 'loading'
        this.setState({data:newData})
        let viewModel = new YFWRequestViewModel()
        viewModel.TCPRequest(paramsMap, res => {
            newData.status = 'success'
            newData.result = res
            newData.fetchSpendTime = res.getAllResponseTime
            newData.dataSource = this.dealResultToSub(res)
            this.setState({data:newData,dataSource:newData.dataSource})
        }, error => {
            newData.status = 'fail'
            let res = error?.msg || {}
            newData.result = res
            newData.dataSource = this.dealResultToSub(res)
            this.setState({data:newData,dataSource:newData.dataSource})
        },false)
    }

    dealResultToSub(result) {
        return YBApiHelper.dealResultToSub(result);
    }
}

const styles = StyleSheet.create({
    contanier: {
        flex: 1,
        backgroundColor: backGroundColor(),
    },
})