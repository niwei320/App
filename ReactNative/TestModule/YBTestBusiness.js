import React,{Component} from 'react'
import {View, ScrollView, StyleSheet,TouchableOpacity,Text,Image,ActivityIndicator,SafeAreaView, FlatList} from 'react-native'
import YFWNativeManager from "../Utils/YFWNativeManager";
import {backGroundColor,darkLightColor,darkTextColor, yfwGreenColor, yfwLineColor} from '../Utils/YFWColor'
import { deepCopyObj, iphoneBottomMargin, itemAddKey, kScreenHeight, kScreenWidth, safeArray, safeObj,} from "../PublicModule/Util/YFWPublicFunction";
import YFWToast from '../Utils/YFWToast';
import { BaseStyles } from '../Utils/YFWBaseCssStyle';
import YBTipsApiInfoView from './Views/YBTipsApiInfoView';
import { pushNavigation } from '../Utils/YFWJumpRouting';
import YBTipsStatusView from './Views/YBTipsStatusView';
import YBApiHelper from './Util/YBApiHelper';
import YBTipsUtilView from './Views/YBTipsUtilView';
import YBTipsResultListView from './Views/YBTipsResultListView';

export default class YBTestBusiness extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: navigation.state.params.headerTitle&&navigation.state.params.headerTitle.length>0?navigation.state.params.headerTitle:"工具",
        headerRight: <TouchableOpacity onPress={() => {navigation.state.params.rightAction&&navigation.state.params.rightAction()}} activeOpacity={1} style={{justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 15}}>
                        <Text style={{fontSize: 13, color: '#333'}}>{'测试'}</Text>
                    </TouchableOpacity>,
    });

    constructor(props) {
        super(props)
        this.state = {
            data: {},
            dataSource:[]
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({
            rightAction:()=>this._testAll()
        })
        let info = safeObj(this.props.navigation.state.params.info)
        this.setState({
            dataSource:info.dataSource,
            data: info
        })
    }

    componentWillUnmount() {

    }

    render() {
        return(
            <View style = {BaseStyles.container}>
                <View style={{marginHorizontal:13,marginTop:21,backgroundColor:'white',borderRadius:12,paddingVertical:21,paddingHorizontal:13}}>
                    <YBTipsApiInfoView status={this.state.data.status} cmd={this.state.data.cmd} cmdCN={this.state.data.cmdCN} spendTime={this.state.data.fetchSpendTime}></YBTipsApiInfoView>
                </View>
                <View style={{flexDirection:'row',marginVertical:10,marginHorizontal:13,backgroundColor:'white',borderRadius:12,minHeight:21,paddingVertical:13,}}>
                    <YBTipsUtilView actions={[
                        {text:'复制',hidden:!(this.state.data.dataSource && this.state.data.dataSource.length > 0),onPress:()=>{this._copy()}},
                        {text:'修改参数',hidden:!(this.state.data.paramsMap && this.state.data.paramsMap.size > 0),onPress:()=>{this._changeParams()}},
                    ]}></YBTipsUtilView>
                </View>
                {
                safeArray(this.state.data.businessTestScores).length > 0 && 
                    <View style={{marginVertical:10,marginHorizontal:13,backgroundColor:'white',borderRadius:12,minHeight:21,paddingVertical:13,paddingHorizontal:13}}>
                        <View key={'score'} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:3}}>
                            <Text style={{color:'#333',fontSize:14,fontWeight:'500'}}>{'所有测试结果：'}</Text>
                            <YBTipsStatusView status={this.state.data.businessTestScores.some((info)=>{return !info.result})?'fail':'success'}></YBTipsStatusView>
                        </View>
                        <View style={{height:1,marginHorizontal:0,backgroundColor:yfwLineColor(),marginVertical:2}}></View>
                        {this.state.data.businessTestScores.map((info,index)=>{
                            return (
                                <View key={index+'score'} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:3}}>
                                    <Text style={{color:'#333',fontSize:13,flex:1}}>{info.title}</Text>
                                    <Text style={{color:'#333',fontSize:13,flex:1,textAlign:'center'}}>{info.desc}</Text>
                                    <YBTipsStatusView status={info.result?'success':'fail'}></YBTipsStatusView>
                                </View>
                            )
                        })}
                    </View>
                }
                <View style={{flex:1,marginHorizontal:13,marginTop:10,marginBottom:iphoneBottomMargin()+20,backgroundColor:'white',borderRadius:12,paddingVertical:21}}>
                    <YBTipsResultListView dataSource={this.state.dataSource} extraData={this.state}></YBTipsResultListView>
                </View>
            </View>
        )
    }

    _copy() {
        YFWNativeManager.copyLink(JSON.stringify(this.state.data.result,null,2))
        YFWToast('复制成功')
    }

    _changeParams(){
        pushNavigation(this.props.navigation.navigate,{type:'test_module_custom',info:this.state.data})
    }

    

    _testAll() {
        let newData = (this.state.data)
        newData.status = 'loading'
        this.setState({data:newData})
        let info = newData
        if (info.businessTestParamsFetchFunction) {
            // info.businessTestParamsFetchFunction(newData,info)
        }
        YBApiHelper.fetchDataFromServer(info).then((info)=>{
            let res = info.result
            if (newData.businessTestFunction && Object.prototype.toString.call(newData.businessTestFunction) === '[object Function]') {
                safeArray(newData.businessTestFunction(res,newData,()=>{
                    this.setState({})
                }))
            }
            this.setState({data:newData,dataSource:newData.dataSource})
        },(info)=>{
            this.setState({data:newData,dataSource:newData.dataSource})
        }).finally(()=>{
            
        })
    }
}

const styles = StyleSheet.create({
    contanier: {
        flex: 1,
        backgroundColor: backGroundColor(),
    },
})