import React,{Component} from 'react'
import {View, ScrollView, StyleSheet,TouchableOpacity,Text,Image, FlatList} from 'react-native'
import YFWNativeManager from "../Utils/YFWNativeManager";
import {backGroundColor,darkLightColor,darkTextColor, yfwGreenColor, yfwLineColor} from '../Utils/YFWColor'
import { safeArray,} from "../PublicModule/Util/YFWPublicFunction";
import YFWToast from '../Utils/YFWToast';
import { BaseStyles } from '../Utils/YFWBaseCssStyle';
import YBTipsApiInfoView from './Views/YBTipsApiInfoView';
import { pushNavigation } from '../Utils/YFWJumpRouting';
import YBApiHelper from './Util/YBApiHelper';
import YBTipsUtilView from './Views/YBTipsUtilView';
import YBTipsResultListView from './Views/YBTipsResultListView';

export default class YBTestModuleApisLevel extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: navigation.state.params.headerTitle&&navigation.state.params.headerTitle.length>0?navigation.state.params.headerTitle:"工具",
        headerRight: <TouchableOpacity onPress={() => {navigation.state.params.rightAction&&navigation.state.params.rightAction()}} activeOpacity={1} style={{justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 15}}>
                        <Text style={{fontSize: 13, color: '#333'}}>{'一键测试'}</Text>
                    </TouchableOpacity>,
    });

    constructor(props) {
        super(props)
        this.state = {
            data: [],
        }
        this.currentIndex = 0
    }

    componentDidMount() {
        this.props.navigation.setParams({
            rightAction:()=>this._testAll()
        })
        let apis = safeArray(this.props.navigation.state.params.data)
        this.setState({
            data:apis
        })
    }

    componentWillUnmount() {

    }

    render() {
        return(
            <View style = {BaseStyles.container}>
                <FlatList
                    listKey={'one'}
                    style={{paddingHorizontal:13,paddingTop:10}}
                    data={this.state.data}
                    extraData={this.state}
                    renderItem={this._renderlargeItem.bind(this)}
                    ItemSeparatorComponent={this._renderSeparator.bind(this)}>
                </FlatList>
            </View>
        )
    }

    _renderlargeItem(info) {
        return (
            <View style={{flex:1,marginHorizontal:13,backgroundColor:'white',borderRadius:12,paddingVertical:13}}>
                <View style={{marginTop:5,backgroundColor:'white',paddingLeft:21}}>
                    <YBTipsApiInfoView status={info.item.status} cmd={info.item.cmd} cmdCN={info.item.cmdCN} spendTime={info.item.fetchSpendTime}></YBTipsApiInfoView>
                </View>
                <View style={{height:1,marginHorizontal:15,backgroundColor:yfwLineColor(),marginVertical:10}}></View>
                <YBTipsUtilView actions={[
                    {text:info.item.hidden?'展开':'折叠',hidden:false,onPress:()=>{
                        info.item.hidden = !info.item.hidden
                        this.setState({})}
                    },
                    {text:'复制',hidden:!(info.item.dataSource && info.item.dataSource.length > 0),onPress:()=>{this._copy(info.item.result)}},
                    {text:'修改参数',hidden:!(info.item.paramsMap && info.item.paramsMap.size > 0),onPress:()=>{this._changeParams(info.item)}},
                ]}></YBTipsUtilView>
                
                {
                !info.item.hidden && <YBTipsResultListView dataSource={info.item.dataSource} listKey={info.index}/>
                }
                <View style={{position:'absolute',left:0,top:0,bottom:0,width:22,...BaseStyles.centerItem}}>
                    <View style={styles.lineStyle}></View>
                    <View style={{position:'absolute',width:16,height:16,borderRadius:8,left:3,top:20,backgroundColor:yfwGreenColor()}}></View>
                </View>
            </View>
        )
    }
    _renderSeparator() {
        return (
            <View style={{height:20,marginHorizontal:13,backgroundColor:'transparent',marginVertical:-2}}>
                <View style={{position:'absolute',left:0,top:1,bottom:0,width:22,...BaseStyles.centerItem}}>
                    <View style={styles.lineStyle}></View>
                </View>
            </View>
        )
    }

    _copy(res){
        YFWNativeManager.copyLink(JSON.stringify(res,null,2))
        YFWToast('复制成功')
    }

    _changeParams(info) {
        pushNavigation(this.props.navigation.navigate,{type:'test_module_custom',info:info})
    }

    _testAll() {
        let currentIndex = this.currentIndex
        if (currentIndex >= this.state.data.length) {
            this.currentIndex = 0
            return
        }
        let newData = (this.state.data)
        let info = newData[currentIndex]
        info.status = 'loading'
        this.setState({data:newData})
        if (info.paramsFetchFunction) {
            info.paramsFetchFunction(newData,info)
        }
        YBApiHelper.fetchDataFromServer(info).then((info)=>{

        },(info)=>{

        }).finally(()=>{
            this.setState({data:newData})
            this.currentIndex++
            this._testAll()
        })
    }
}

const styles = StyleSheet.create({
    contanier: {
        flex: 1,
        backgroundColor: backGroundColor(),
    },
    lineStyle: {
        flex:1,width:2,backgroundColor:yfwGreenColor()
    }
})