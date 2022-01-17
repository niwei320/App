import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity, Dimensions, DeviceEventEmitter
} from 'react-native';
import {darkNomalColor,darkTextColor,darkLightColor,separatorColor,yfwRedColor} from "../../Utils/YFWColor";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {mobClick, safeObj, kScreenWidth, adaptSize, iphoneBottomMargin} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWToast from "../../Utils/YFWToast";
import LinearGradient from 'react-native-linear-gradient';
import YFWMoneyLabel from '../../widget/YFWMoneyLabel';
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWCheckButton from '../../PublicModule/Widge/YFWCheckButtonView';

export default class MergePayBottomView extends Component {
    constructor(...args) {
        super(...args);
        this.selectData = new Map();
        this.allData = []
        this.allPrice = 0
        this.selectOrderArray = []
        this.isSelectAll = true
    }

    componentWillReceiveProps(nextProps){
        this.allData = nextProps.allData
        this._refrehsSelect()
        this._getAllPrice()
        this.setState({})
    }
    _refrehsSelect(){
        this.selectData = new Map();
        this.selectOrderArray = []
        this.allData.forEach((item)=>{
            if(item.isSelect){
                this.selectData.set(item.order_no,item);
                this.selectOrderArray.push(item.order_no)
            }
        })
        if(this.allData.length == this.selectData.size){
            this.isSelectAll = true
        }else{
            this.isSelectAll = false
        }
    }
    _selectAll(){
        if(this.isSelectAll){
            this.allData.forEach((item)=>{
                item.isSelect = false
            })
        }else{
            this.allData.forEach((item)=>{
                item.isSelect = true
            })
        }
        this.setState({})
        if(this.props._refreshSelectState){
            this.props._refreshSelectState()
        }
    }

    _getAllPrice(){
        this.allPrice = 0
        this.selectData.forEach((value, key, mapObj) => {
            this.allPrice += value.order_total
        })
    }
    _toPay(){
        if(this.props.toPay){
            this.props.toPay(this.selectOrderArray)
        }
    }


    render() {
        return (
            <View style={{width:kScreenWidth,height:adaptSize(50)+iphoneBottomMargin()}}>
                <View style={styles.separatorStyle}/>
                <View style={styles.container}>
                    <View style={styles.checkButton}>
                        <YFWCheckButton style={{flex:1}} selectFn={()=>this._selectAll()}
                        select={this.isSelectAll}/>
                    </View>
                    <Text style={{marginLeft:adaptSize(8),color:'#333',fontSize:13}}>全选</Text>
                    <View style={{flex:1}}></View>
                    <View style={styles.view1Style}>
                        <Text style={{fontSize:15,color:darkTextColor(),fontWeight:'bold'}}>合计：</Text>
                        <YFWMoneyLabel money={this.allPrice}/>
                    </View>
                    <TouchableOpacity style={styles.view2Style} onPress={()=>this._toPay()}>
                        <LinearGradient colors={['rgb(255,51,0)','rgb(255,110,74)']}
                                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                        locations={[0,1]}
                                        style={{width: adaptSize(120),height: adaptSize(50),justifyContent:'center',alignItems:'center'}}>
                            <View style={{flex:1,justifyContent:'center', alignItems:'center'}}>
                                <Text style={styles.payStyle}>合并付款 ({this.selectData.size})</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

}

//设置样式
const styles = StyleSheet.create({
    container: {
        flex:1,
        height:adaptSize(50),
        backgroundColor:'white',
        flexDirection: 'row',
        alignItems:'center'
    },
    checkButton:{
        marginLeft:adaptSize(21),
        width:adaptSize(25),
        height:adaptSize(25),
    },
    view1Style:{
        height:adaptSize(50),
        marginRight:adaptSize(14),
        marginLeft: adaptSize(10),
        flexDirection: 'row',
        alignItems: 'center'
    },
    view2Style:{
        width:adaptSize(120),
        height:adaptSize(50),
        justifyContent:'center',
        alignItems:'center',
        marginRight:0,
    },

    separatorStyle:{
        backgroundColor:separatorColor(),
        height:0.5,
        width: Dimensions.get('window').width,
    },
    payStyle:{
        color:'white',
        fontSize:15,
    }

});