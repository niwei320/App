import React,{Component} from 'react'
import {View, FlatList, StyleSheet,TouchableOpacity,Text,Image,} from 'react-native'
import {backGroundColor,darkLightColor,darkTextColor, yfwLineColor} from '../Utils/YFWColor'
import YBAllApi from './Models/YBAllApi';
import YBTipsApiInfoView from './Views/YBTipsApiInfoView';
import { pushNavigation } from '../Utils/YFWJumpRouting';
import YBApiHelper from './Util/YBApiHelper';

export default class YBTestAllApisLevel extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: navigation.state.params.headerTitle&&navigation.state.params.headerTitle.length>0?navigation.state.params.headerTitle:"工具组",
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
        let allApi = YBAllApi.ShareInstance()
        let searchApis = allApi.getAllApis()
        this.setState({
            data:searchApis
        })
    }

    componentWillUnmount() {

    }

    render() {
        return(
            <View style = {styles.contanier}>
                <FlatList
                    data={this.state.data}
                    extraData={this.state}
                    renderItem = {this._renderCell.bind(this)}
                    ItemSeparatorComponent = {this._renderSeparator}
                    keyExtractor={(item,index) => index+''+item.cmd}
                />
            </View>

        )
    }

    /** 渲染SectionList */
    _renderCell({item}) {
        let model = item
        return(
            <TouchableOpacity style = {styles.cell} onPress={()=>this._selectCell(item)} activeOpacity={0.8}>
                <YBTipsApiInfoView status={model.status} cmd={model.cmd} cmdCN={model.cmdCN} spendTime={model.fetchSpendTime}></YBTipsApiInfoView>
                <Image source={require('../../img/uc_next.png')} style={styles.detail}/>
            </TouchableOpacity>
        )
    }

    _renderSeparator() {
        return (
            <View style={styles.separator}></View>
        )
    }
    /** 点击cell的回调方法 */
    _selectCell(item) {
        const {navigate} = this.props.navigation;

        if (item.cmd) {
            pushNavigation(navigate,{type:'test_module_three',headerTitle:item.cmdCN || item.cmd,info:item})
        }
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
    sectionHeader: {
        height: 40,
        backgroundColor: backGroundColor(),
        paddingLeft: 16,
    },
    sectionFooter: {
        height: 12,
        backgroundColor: backGroundColor(),
    },
    separator: {
        backgroundColor: yfwLineColor(),
        marginHorizontal: 13,
        height: 1,
    },
    cell: {
        flex: 1,
        padding: 16,
        height: 52,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: darkTextColor(),
        fontSize: 15,
    },
    rightView: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'row',
        height: 52,
    },
    subtitle: {
        color: darkLightColor(),
        fontSize: 15,
        right: 24,
    },
    detail: {
        width: 7,
        height: 12,
    },
    rightImage: {
        height: 12,
        width: 99,
        right: 24,
    },
})