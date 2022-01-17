import React,{Component} from 'react'
import {View, ScrollView, StyleSheet,TouchableOpacity,Text,Image,ActivityIndicator,SafeAreaView, FlatList} from 'react-native'
import YFWNativeManager from "../Utils/YFWNativeManager";
import {backGroundColor,darkLightColor,darkTextColor, yfwGreenColor} from '../Utils/YFWColor'
import { deepCopyObj, iphoneBottomMargin, itemAddKey, kScreenHeight, kScreenWidth, safeObj,} from "../PublicModule/Util/YFWPublicFunction";
import YFWToast from '../Utils/YFWToast';
import { BaseStyles } from '../Utils/YFWBaseCssStyle';
import YBTipsApiInfoView from './Views/YBTipsApiInfoView';
import { pushNavigation } from '../Utils/YFWJumpRouting';
import YBApiHelper from './Util/YBApiHelper';
import YBTipsUtilView from './Views/YBTipsUtilView';
import YBTipsResultListView from './Views/YBTipsResultListView';

export default class YBTestOneApiLevel extends Component {
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
        YBApiHelper.fetchDataFromServer(this.state.data).then((newData)=>{
            this.setState({data:newData,dataSource:newData.dataSource})
        },(newData)=>{
            this.setState({data:newData,dataSource:newData.dataSource})
        })
        this.setState({})
    }
}

const styles = StyleSheet.create({
    contanier: {
        flex: 1,
        backgroundColor: backGroundColor(),
    },
})