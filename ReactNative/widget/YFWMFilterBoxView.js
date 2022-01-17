import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet, Platform,FlatList
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWToast from "../Utils/YFWToast";
import {
    backGroundColor,
    yfwGreenColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor
} from "../Utils/YFWColor";
import {iphoneTopMargin, isNotEmpty, itemAddKey, kScreenWidth, safe, isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWFilterBoxDetailView from '../PublicModule/Widge/YFWFilterBoxDetailView'
import YFWNativeManager from '../Utils/YFWNativeManager'


export default class YFWMFilterBoxView extends Component {
    static defaultProps = {
        category_id: '',
        keywords: '',
        paramJson: {},
    }

    constructor(props, context) {

        super(props, context);
        this.state = {
            selectName: isNotEmpty(props.paramJson.selectName) ? props.paramJson.selectName : [],
            selectForm: isNotEmpty(props.paramJson.selectForm) ? props.paramJson.selectForm : [],
            selectStand: isNotEmpty(props.paramJson.selectStand) ? props.paramJson.selectStand : [],
            selectProduce: isNotEmpty(props.paramJson.selectProduce) ? props.paramJson.selectProduce : [],

            showDetail: false,
            selectDataArray: [],
            selectTitle: '',
            selectIndex: 0,
            dataArray:[],
        }
    }

    componentDidMount(){
        this.loadDataFromServer()
    }

    render(){
        return(
            <View style={[BaseStyles.container,{backgroundColor:'white'}]}>
                <FlatList
                    extraData={this.state}
                    data={this.state.dataArray}
                    renderItem = {this._renderListItem.bind(this)}
                />
                {this._renderBottomView()}
            </View>
        )
    }

    _renderListItem(info){
        let labels = []
        for (let i = 0;i<info.item.data.length;i++){
            labels.push(this.renderLabel(info.item.data,i))
        }

        return (
            <View style={{backgroundColor: 'white'}}>
                <Text style={{marginTop: 29,marginLeft: 18,color:'#333333',fontSize:15}}>{info.item.title}</Text>
                <View style={{flexDirection: 'row',flexWrap:'wrap',marginLeft:13,marginRight:3,marginTop:16}}>
                    {labels}
                    <TouchableOpacity activeOpacity={1}
                              style={{marginRight:10,alignItems:'center',justifyContent:'center',borderRadius:15,borderColor:'#999999',borderWidth: 1,backgroundColor:'#fafafa',height:31,width:91,marginBottom:10}}>
                        <Text style={{color:'#333333'}}>查看全部...</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )

    }
    renderLabel(data,index){
        let info = data[index]
        let bgColor = info.select?'#rgba(232,251,245,1)':'#fafafa'
        let textColor = info.select?'#1fdb9b':'#333333'
        let borderColor = info.select?'#1fdb9b':'#fafafa'

        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>this.clickedItem(data,index)}
                              style={{marginRight:10,alignItems:'center',justifyContent:'center',borderRadius:15,borderColor:borderColor,borderWidth: 1,backgroundColor:bgColor,height:31,width:91,marginBottom:10}}>
                <Text style={{color:textColor}}>{info.text}</Text>
            </TouchableOpacity>
        )
    }

    _renderBottomView() {


        return (

            <View
                style={[BaseStyles.centerItem , {height:51,marginBottom:0,flexDirection:'row',justifyContent:'space-between'}]}>

                <TouchableOpacity style={{height:51,flex:1}}>
                    <View
                        style={[BaseStyles.centerItem,{
                            flex:1,
                            borderTopColor: "#cccccc",
                            borderTopWidth:1,
                        }]
                        }>
                        <Text style={{color:darkTextColor(),fontSize:17}}>重置</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={{height:51,flex:1}}>
                    <View style={[BaseStyles.centerItem,{flex:1,backgroundColor:yfwGreenColor()}]}>
                        <Text style={{color:'white',fontSize:17}}>确认</Text>
                    </View>
                </TouchableOpacity>

            </View>

        );

    }

    clickedItem(data,index){
        data.map((item)=>{item.select=false})
        let selectItem = data[index]
        selectItem.select = true
        this.setState({})
    }

    loadDataFromServer(){
        this.setState({
            dataArray:[
                {title:'商品名/品牌',data:[{text:'白云山',select:false},{text:'同仁堂',select:false},{text:'修正',select:false},{text:'仁和',select:false}]},
                {title:'厂家',data:[{text:'北京双吉',select:false},{text:'济仁药业',select:false},{text:'北京同仁堂...',select:false},{text:'通化万通',select:false}]},
            ],
        })
    }
}