import React,{Component} from 'react'
import {View, SectionList, Alert, StyleSheet,} from 'react-native'
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWSettingCell from '../UserCenter/YFWSettingCell'
import {backGroundColor} from '../Utils/YFWColor'
import YFWTitleView from '../PublicModule/Widge/YFWTitleView'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import { kScreenWidth, safeObj,} from "../PublicModule/Util/YFWPublicFunction";
import {YFWSearchRequest} from '../YFWApi'
import YBAllApi from './Models/YBAllApi';
import YFWToast from '../Utils/YFWToast';
let _this = null;

export default class YBTestHomeLevel extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "工具组",
        headerRight: <View style={{width:50}}/>,
    });

    constructor(props) {
        super(props)
        this.state = {
            dataSource: [
                {
                    id: 1,
                    key: 'one',
                    title:'TCP',
                    isShowHeader: true,
                    data: [
                        {
                            id: 1,
                            key: 'tcp',
                            title: 'TCP地址切换',
                        }
                    ],
                },
                {
                    id: 2,
                    key: 'two',
                    title: '接口',
                    isShowHeader: true,
                    data: [
                        {
                            id: 5,
                            key: 'custom-interface',
                            title: '自定义接口',
                        },
                        {
                            id: 1,
                            key: 'all-interface',
                            title: '所有接口',
                        },
                        {
                            id: 2,
                            key: 'search-interface',
                            title: '搜索模块接口',
                        },
                        {
                            id: 3,
                            key: 'sale-interface',
                            title: '加购下单模块接口',
                        },
                    ],
                },
                {
                    id: 3,
                    key: 'three',
                    title: '模拟切换',
                    isShowHeader: true,
                    data: [
                        {
                            id: 1,
                            key: 'change-user',
                            title: '切换用户',
                        },
                        {
                            id: 4,
                            key: 'change-location',
                            title: '切换定位',
                        }
                    ],
                },
                {
                    id: 4,
                    key: 'four',
                    title: '业务测试',
                    isShowHeader: true,
                    data: [
                        {
                            id: 1,
                            key: 'home-data-test',
                            title: '首页数据测试',
                        },
                        {
                            id: 4,
                            key: 'sale-shop-num-test',
                            title: '比价页在售商家数测试',
                        },
                    ],
                }
    
            ],
        }
    }

    componentDidMount() {
        _this = this
    }

    componentWillUnmount() {

    }

    render() {
        return(
            <View style = {styles.contanier}>
                <SectionList
                    sections = {this.state.dataSource}
                    renderItem = {this._renderCell}
                    renderSectionHeader = {this._renderSectionHeader}
                    renderSectionFooter = {this._renderSectionFooter}
                    ItemSeparatorComponent = {this._renderSeparator}
                    ListFooterComponent = {this._renderListFooter}
                    stickySectionHeadersEnabled={false}
                />
            </View>

        )
    }

    _renderListFooter=()=>{
        return (
            
            <View style={{ width: kScreenWidth, height: 50, backgroundColor: 'transform', alignItems: 'center' ,flexDirection:'row'}}>
            </View>
        )

    }

    /** 渲染SectionList */
    _renderCell({item}) {
        return <YFWSettingCell model={item} callBack={(item) => _this._selectCell(item)}/>
    }

    _renderSectionHeader({section}) {
        if (section.isShowHeader === true) {
            return (
                <View style={styles.sectionHeader}>
                    <YFWTitleView title={section.title}></YFWTitleView>
                </View>
            )
        }

    }

    _renderSectionFooter({item}) {
        return <View style={styles.sectionFooter}/>
    }

    _renderSeparator() {
        return (
            <View style={styles.separator}>
                <View style={{backgroundColor: backGroundColor(), height: 1}}></View>
            </View>
        )
    }
    /** 点击cell的回调方法 */
    _selectCell(item) {
        const {navigate} = this.props.navigation;

        if (item.key === 'tcp') {
            YFWNativeManager.changeTcpHost()
        } else if (item.key === 'all-interface') {
            pushNavigation(navigate,{type:'test_module_two',headerTitle:item.title})
        } else if (item.key === 'search-interface') {
            let allApi = YBAllApi.ShareInstance()
            let searchApis = allApi.getAllSearchApis()
            pushNavigation(navigate,{type:'test_module_four',headerTitle:item.title,data:searchApis})
        } else if (item.key === 'sale-interface') {
            let allApi = YBAllApi.ShareInstance()
            let buyApis = allApi.getAllAddBuyApis()
            let searchApis = allApi.getAllSearchApis()
            pushNavigation(navigate,{type:'test_module_four',headerTitle:item.title,data:searchApis.concat(buyApis)})
        } else if (item.key === 'custom-interface') {
            let allApi = YBAllApi.ShareInstance()
            let buyApis = allApi.getAllAddBuyApis()
            let searchApis = allApi.getAllSearchApis()
            pushNavigation(navigate,{type:'test_module_custom',headerTitle:item.title,data:searchApis.concat(buyApis)})
        }  else if (item.key === 'change-location') {
            navigate('YBTestChangeLocation')
        } else if (item.key === 'change-user') {
            YFWToast('待完善')
        } else if (item.key === 'home-data-test') {
            let allApi = YBAllApi.ShareInstance()
            let otherApisMap = allApi.getAllOtherApisMap()
            let item = safeObj(otherApisMap.get('guest.common.app.getIndexData_new'))
            pushNavigation(navigate,{type:'test_module_business',headerTitle:item.cmdCN || item.cmd,info:item})
        } else if (item.key === 'sale-shop-num-test') {
            let allApi = YBAllApi.ShareInstance()
            let otherApisMap = allApi.getAllSearchApisMap()
            let item = safeObj(otherApisMap.get('guest.medicine.getMedicineDetail as details,guest.medicine.getShopMedicines as shopmedicines'))
            pushNavigation(navigate,{type:'test_module_business',headerTitle:item.cmdCN || item.cmd,info:item})
        }
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
        backgroundColor: 'white',
        paddingLeft: 16,
        height: 1,
    }
})