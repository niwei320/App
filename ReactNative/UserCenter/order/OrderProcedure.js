/**
 * Created by admin on 2018/5/22.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Platform,
    TouchableOpacity,
    Dimensions,
    ImageBackground
} from 'react-native';
const width = Dimensions.get('window').width;
import {isNotEmpty, RECEIVE_PROTOCOL_HTML, safeObj} from '../../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'

export default class OrderProcedure extends Component {

    constructor(props){
        super(props)
        this.state = {
            orderStatusMap:[]
        }
    }

    componentDidMount(){
        let userInfo = YFWUserInfoManager.ShareInstance();
        let map =  userInfo.getSystemConfig().orderMap;
        this.setState({
            orderStatusMap:map
        })
    }

    render() {
        let expressData = this.props.datas;

        return (
            <View style={{backgroundColor:'#FFFFFF',marginTop:10}}>
                <View style={{flexDirection:'row',alignItems:'center',height:30,paddingLeft:10,paddingRight:10}}>
                    <Text style={{fontSize:12,color:'#666666'}}>订单编号</Text>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:12,color:'#666666'}}>{expressData.order_no}</Text>
                </View>
                {this._contactControl(expressData)}
                <View style={{backgroundColor:'#F5F5F5',width,height:10}}/>
                <View style={{alignItems:'center',flexDirection:'row',height:40}}>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:13,color:'#333333'}}>请按照</Text>
                    <TouchableOpacity onPress={()=> {const {navigate} = this.props.navigation;
                            pushNavigation(navigate, {
                                type: 'get_h5',
                                value: RECEIVE_PROTOCOL_HTML(),
                                name: '商品验收标准',
                                title:'商品验收标准'
                            });}}>
                        <Text style={{fontSize:13,color:'#16c08e'}}>《药房网商城商品验收标准》</Text>
                    </TouchableOpacity>
                    <Text style={{fontSize:13,color:'#333333'}}>对货品进行签收</Text>
                    <View style={{flex:1}}/>
                </View>
                <View style={{backgroundColor:'#F5F5F5',width,height:30}}/>
            </View>
        )
    }

    _contactControl(expressData) {
        let order_status_items = expressData.order_status_items;//流程数据
        if (isNotEmpty(order_status_items)) {
            return order_status_items.map((item) => this.renderItem(item))
        }
    }

    renderItem(item) {
        return (<View
            style={{flexDirection:'row',alignItems:'center',height:30,paddingLeft:10,paddingRight:10,justifyContent:'center',marginBottom:5}}
            key={item.name}>
            {this._renderItemMessage(item)}
            <View style={{flex:1}}/>
            <Text style={{fontSize:12,color:'#666666'}}>{item.datetime}</Text>
        </View>)
    }

    _renderItemMessage(item) {

        if(isNotEmpty(item.desc)){
            return( <View>
                <Text style={{fontSize:12,color:'#666666',padding:0}}>{isNotEmpty(this.state.orderStatusMap)?this.state.orderStatusMap[item.status]:item.name}</Text>
                <Text style={{fontSize:12,color:'#666666',padding:0}}>{item.desc}</Text>
            </View>)
        }else {
            return (<View>
                    <Text style={{fontSize:12,color:'#666666'}}>{isNotEmpty(this.state.orderStatusMap)?this.state.orderStatusMap[item.status]:item.name}</Text>
                </View>
            )
        }
    }
}