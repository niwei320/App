import React,{Component} from 'react'
import {
    StyleSheet,
    View,
    Text,
    FlatList
} from 'react-native'
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import {darkNomalColor, darkTextColor} from "../Utils/YFWColor";
import {isEmpty, safe, safeObj} from "../PublicModule/Util/YFWPublicFunction";

export default class YFWShopInstructions extends Component{

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "说明书",
        headerRight: <View width={50}/>
    });

    constructor(props) {
        super(props);
        this.state={
            data:[]
        }
    }

    componentDidMount(){

        let guide =safeObj(this.props.navigation.state.params.state.guide)

        const keys = Object.keys(safeObj(guide));
        let map = new Map()
        for (let i = 0 ; i < keys.length ; i++){
            let key = keys[i];
            let value = guide[key]
            map.set(key,value);
        }

        let dd =[]
        //兼容IOS底层字典无序处理会乱序问题
        dd.push({key:"药品名称",value:safeObj(map.get("药品名称"))})
        dd.push({key:"执行标准",value:safeObj(map.get("执行标准"))})
        dd.push({key:"性状",value:safeObj(map.get("性状"))})
        dd.push({key:"作用类别",value:safeObj(map.get("作用类别"))})
        dd.push({key:"药理毒理",value:safeObj(map.get("药理毒理"))})
        dd.push({key:"药代动力学",value:safeObj(map.get("药代动力学"))})

        dd.push({key:"组方/成份",value:safeObj(map.get("组方/成份"))})
        dd.push({key:"功能与主治",value:safeObj(map.get("功能与主治"))})
        dd.push({key:"主要原料",value:safeObj(map.get("主要原料"))})
        dd.push({key:"保健功能",value:safeObj(map.get("保健功能"))})
        dd.push({key:"适应人群",value:safeObj(map.get("适应人群"))})
        dd.push({key:"不适应人群",value:safeObj(map.get("不适应人群"))})
        dd.push({key:"简介",value:safeObj(map.get("简介"))})
        dd.push({key:"产地",value:safeObj(map.get("产地"))})
        dd.push({key:"鉴别",value:safeObj(map.get("鉴别"))})
        dd.push({key:"注意",value:safeObj(map.get("注意"))})
        dd.push({key:"含量测定",value:safeObj(map.get("含量测定"))})
        dd.push({key:"检查",value:safeObj(map.get("检查"))})
        dd.push({key:"炮制",value:safeObj(map.get("炮制"))})
        dd.push({key:"性味与归经",value:safeObj(map.get("性味与归经"))})

        dd.push({key:"适应症",value:safeObj(map.get("适应症"))})
        dd.push({key:"用法用量",value:safeObj(map.get("用法用量"))})
        dd.push({key:"不良反应",value:safeObj(map.get("不良反应"))})
        dd.push({key:"禁忌症",value:safeObj(map.get("禁忌症"))})
        dd.push({key:"注意事项",value:safeObj(map.get("注意事项"))})
        dd.push({key:"孕妇及哺乳期妇女用药",value:safeObj(map.get("孕妇及哺乳期妇女用药"))})
        dd.push({key:"儿童用药",value:safeObj(map.get("儿童用药"))})
        dd.push({key:"老年患者用药",value:safeObj(map.get("老年患者用药"))})
        dd.push({key:"药物相互作用",value:safeObj(map.get("药物相互作用"))})
        dd.push({key:"药物过量",value:safeObj(map.get("药物过量"))})
        dd.push({key:"贮藏",value:safeObj(map.get("贮藏"))})

        //刷新数据源
        this.setState({
            data:dd
        })

    }

    render(){
        return(
            <View style={{flex: 1}}>
                <AndroidHeaderBottomLine/>
                <FlatList
                style={styles.list}
                data={this.state.data}
                renderItem={this._showDta.bind(this)}/>
            </View>
        )

    }

    _showDta=(item) =>{
        if(isEmpty(item.item.key) || isEmpty(item.item.value)){
            return <View/>
        }
        return(
            <View style={styles.content}>
                <Text style={styles.textTitle}>{item.item.key}</Text>
                <Text style={styles.textContent}>{item.item.value}</Text>
            </View>
        )
    }
}

const styles=StyleSheet.create({
        list:{
            backgroundColor: '#fff'
        },

        content:{
            flexDirection: 'column',
            padding:10
        },

        textTitle:{
            fontSize:14,
            color:'#666666',
            marginBottom: 5,
        },
        textContent:{
            fontSize:14,
            color:'#333333',
            marginBottom: 5,
        }
    });