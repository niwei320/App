/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    NativeModules,
    StyleSheet, DeviceEventEmitter
} from 'react-native';
import {
    kScreenWidth,
    mobClick
} from "../../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {darkTextColor, yfwGreenColor} from "../../../Utils/YFWColor";
import {YFWImageConst} from "../../Images/YFWImageConst";
const {StatusBarManager} = NativeModules;


export default class YFWWDGoodsListMenuView extends Component {

    static defaultProps = {
        hasScreening  : true,
        isSearch  : true,
    }

    constructor(...args) {

        super(...args);

        this.state = {
            type: 'create_time desc',//default
            defaultBtnIsCheck: true,
            priceBtnIsCheck: false,
            salesCountBtnIsCheck: false,
            priceBtnIsPlus: false,
            salesCountBtnIsPlus: true,

        }
        this._addListener()
    }

    _addListener() {

    }

    componentWillUnmount() {

    }

    _onButtonClick(title) {
        let type = 'create_time desc'; //default
        switch (title) {
            case '价格':
                this.state.priceBtnIsPlus = !this.state.priceBtnIsPlus;
                type = this.state.priceBtnIsPlus?'price_asc':'price_desc';
                break;
            case '销量':
                this.state.salesCountBtnIsPlus = !this.state.salesCountBtnIsPlus;
                type = this.state.salesCountBtnIsPlus?'sales_asc':'sales_desc';
                break;
            case '默认':
                this.setState({
                    priceBtnIsPlus: true,
                    salesCountBtnIsPlus: true
                });
                break;
            default:
        }
        this.state.type = type
        this.setState({
            defaultBtnIsCheck: title === '默认',
            priceBtnIsCheck: title === '价格',
            salesCountBtnIsCheck: title === '销量',
        })
        this._refreshData()
    }

    _refreshData(){

        if (this.props.refreshData){
            this.props.refreshData(this.state.type);
        }
    }

    render() {
        return (
            <View >
                <View style={[styles.ButtonView,{ borderTopLeftRadius: this.props.isSearch?7:0, borderTopRightRadius: this.props.isSearch?7:0}]}>

                    {this._renderButtonItem('默认',this.state.defaultBtnIsCheck)}
                    {this._renderButtonItem('价格',this.state.priceBtnIsCheck)}
                    {this._renderButtonItem('销量',this.state.salesCountBtnIsCheck)}
                    {this._renderFilterItem()}
                </View>
            </View>

        );
    }

    _renderButtonItem(title,select){
        let is_up = true;
        switch (title) {
            case '价格': is_up = this.state.priceBtnIsPlus; break;
            case '销量': is_up = this.state.salesCountBtnIsPlus;break;
            default:
        }
        return(
            <TouchableOpacity activeOpacity={1} style={[BaseStyles.item,{flex:1}]} onPress={() => this._onButtonClick(title)}>
                <Text style={{color: select ? "#416dff" : darkTextColor() , fontSize:14, fontWeight: 'bold'}}>{title}</Text>
                {this._renderOrderImage(is_up,select,title)}
            </TouchableOpacity>
        );
    }

    _renderOrderImage(is_up,select,title) {
        if(title === '默认'){
            return <View/>
        }
        let imageIcon = select?YFWImageConst.List_order_by_desc:YFWImageConst.List_order_by_default;
        return <Image style={{marginLeft: 5, height: 10, width: 5, resizeMode: 'contain', transform: [{rotateZ:is_up?"180deg":"0deg"}]}} source={imageIcon}/>

    }

    _renderFilterItem(){

        if (this.props.hasScreening){
            return (
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.item,{flex:1}]} onPress={() => {
                    if (this.props.onScreen){
                        this.props.onScreen();
                    }
                }}>
                    <Text style={{fontSize:14,color:darkTextColor(),fontWeight:'500'}}>筛选</Text>
                    <Image style={{height: 12, width: 12,marginLeft:5, resizeMode: 'contain'}} source={YFWImageConst.List_icon_filter}/>
                </TouchableOpacity>
            );
        }

    }


}

const styles = StyleSheet.create({
    ButtonView:{
        height: 50,
        width: kScreenWidth,
        flexDirection: "row",
        alignItems: 'center',
        backgroundColor: "white",
    },
    OptionView:{
        flexDirection:'row',
        width:kScreenWidth,
        height:50,
        backgroundColor:'white',
        paddingHorizontal: 25,
        paddingTop: 5,
    },
    OptionItemOn:{
        marginHorizontal: 7,
        backgroundColor:"#f4f6ff",
        height:27,
        paddingHorizontal:15,
        borderRadius: 30,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#416dff",
        justifyContent:'center',
        alignItems:'center',
    },
    OptionItemTextOn:{
        fontSize: 13,
        fontWeight:'bold',
        textAlign:"center",
        color: "#416dff",
    },
    OptionItemOff:{
        marginHorizontal: 7,
        backgroundColor:"#f5f5f5",
        height:27,
        paddingHorizontal:15,
        borderRadius: 30,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#f5f5f5",
        justifyContent:'center',
        alignItems:'center',
    },
    OptionItemTextOff:{
        fontSize: 13,
        textAlign:"center",
        color: "#666666",
    }
})
