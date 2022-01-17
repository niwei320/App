import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    Dimensions,StyleSheet
} from 'react-native'
const width = Dimensions.get('window').width;
import YFWImageView from '../../widget/YFWImageView'
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText'
import {isNotEmpty, itemAddKey, isEmpty,kScreenWidth,isIphoneX,tcpImage, safe,safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import {
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor,
    newSeparatorColor
} from "../../Utils/YFWColor"
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_SINGLE,
    TYPE_OTC
} from "../../widget/YFWPrescribedGoodsTitle";
import YFWCheckButtonView from '../../PublicModule/Widge/YFWCheckButtonView';
export default class ReturnGoodsDetailItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            num: undefined,
            maxNum:undefined,
            select:true,
        }
    }


    componentDidMount() {
        let quantity = this.props.data.quantity;
        this.setState({
            num: quantity,
            maxNum: quantity
        })
    }

    render() {
        return (
            <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                <View style={styles.checkButton}>
                    <YFWCheckButtonView style={{flex:1}} selectFn={()=>{
                        let newNumber = this.state.select?0:parseInt(this.state.num)
                        this.props.editNum(this.props.index, newNumber)
                        this.setState({
                            select:!this.state.select
                        })
                    }}
                            select={this.state.select}/>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                    <YFWImageView width={70} height={70} resizeMode={'contain'}
                                  source={{uri:this.props.data.img_url}}
                    />
                    <View style={{flex:1}}>
                    <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <View style={{flex:1}}>
                            {this._renderTitleView(this.props.data)}
                        </View>
                        <View>
                            <YFWDiscountText navigation={this.props.navigation} style_view={{marginLeft:15}} style_text={{color:darkTextColor(),fontSize:15,fontWeight:'500'}} value={'¥'+toDecimal(this.props.data.price)}/>
                        </View>
                    </View>
                    {this._renderNumProgressView()}
                    </View>
                </View>

            </View>
        )
    }

    _renderTitleView(item) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(item).PrescriptionType+"" === "1"){
            return this._rednerPrescriptionLabel(TYPE_SINGLE,item.title)
        }
        //双轨药
        else if(safeObj(item).PrescriptionType+"" === "2"){
            return this._rednerPrescriptionLabel(TYPE_DOUBLE,item.title)
        }
        else if(safeObj(item).PrescriptionType+"" === "0") {
            return this._rednerPrescriptionLabel(TYPE_OTC,item.title)
        }
        //这里没有处方药的判断
        else {
            return this._rednerPrescriptionLabel(TYPE_NOMAL,item.title)
        }
    }
    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    _rednerPrescriptionLabel(type,title){
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            numberOfLines={2}
        />
    }

    _deleteNum(index) {
        if (this.state.num > 1) {
            this.props.editNum(index, parseInt(this.state.num) - 1)
            this.setState({
                    num: parseInt(this.state.num) - 1
                }
            )
        }
    }

    _addNum(index) {
        if (this.state.num<this.state.maxNum) {
            this.props.editNum(index, parseInt(this.state.num) + 1)
            this.setState({
                    num: parseInt(this.state.num) + 1
                }
            )
        }
    }

    _renderNumProgressView() {
        if(this.props.status == 0 && this.state.maxNum > 1){
            let showDown = this.state.num > 1?true:false
            let showUp = this.state.num >= this.state.maxNum?false:true
            return(<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:0}}>
                <View style={{flex:1}}/>
                <Text style={{fontSize:15,color:'#999'}}>退货数量</Text>
                <View style={styles.operatingBox}>
                    <TouchableOpacity activeOpacity={1}
                                    style={styles.reduce}
                                    onPress={()=> this._deleteNum(this.props.index)}>
                        <Text style={[styles.btn1,{color:showDown?'#333':'#999'}]}>－</Text>
                    </TouchableOpacity>
                    <View style={{borderColor:newSeparatorColor(), borderLeftWidth:1, borderRightWidth:1,height:24,width:30,alignItems:'center',justifyContent:'center'}}>
                        <Text style={{fontSize:14,color:'#333'}}>{this.state.num}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1}
                                    style={styles.reduce}
                                    onPress={()=> this._addNum(this.props.index)}>
                        <Text style={[styles.btn1,{color:showUp?'#333':'#999'}]}>＋</Text>
                    </TouchableOpacity>
                </View>
            </View>)
        }else {
            return(<View style={{flexDirection:'row',alignItems:'center',marginBottom:0}}>
                <View style={{flex:1}}/>
                <Text style={{fontSize:15,color:'#999'}}>退货数量:</Text>
                <Text style={{fontSize:15,color:'#333',marginLeft:6}}>{this.state.num}</Text>
            </View>)
        }
    }
}

const styles = StyleSheet.create({
    operatingBox:{
        width:90,
        height:24,
        borderColor:newSeparatorColor(),
        borderWidth:1,
        marginLeft:6,
        borderRadius:3,
        flexDirection: 'row',
        alignItems:'center'

    },
    reduce:{
        flex:1,
        width:30,
        height:24,
        alignItems:'center',
        justifyContent:'center',
    },
    btn1:{
        fontSize:14,
        // color:darkTextColor(),
        color:'#999'
    },
    checkButton:{
        marginLeft:5,
        width:30,
        height:30,
    },
})
