import React,{Component} from 'react'
import {View, Text, StyleSheet, DeviceEventEmitter} from 'react-native'
import { toDecimal } from '../Utils/ConvertUtils';
import {yfwOrangeColor, yfwRedColor} from '../Utils/YFWColor'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";

export default class YFWMoneyLabel extends Component {


    static defaultProps = {
        money:'',
        moneyTextStyle:{},
        decimalsTextStyle:{},
        discount:'',
    }
    constructor(...args) {
        super(...args);
        this.state = {
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        };
    }

    componentDidMount(){
        let that = this
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            that.setState({
                noLocationHidePrice:isHide
            })
        })
    }

    componentWillUnmount() {
        this.locationListener && this.locationListener.remove()
    }

    render(){
        let price = toDecimal(this.props.money)
        let priceInt = price.split('.')[0]
        let priceDecimals = price.split('.')[1]
        const {moneyTextStyle,decimalsTextStyle} = this.props
        if(this.state.noLocationHidePrice){
            return <View />
        } else {
            return (
                <View style={{flexDirection:'row',}}>
                    <Text style={{fontSize:15,color:'rgb(255,51,0)',fontWeight:'bold',...decimalsTextStyle}}>¥
                        <Text style={{fontSize:17,...moneyTextStyle}}>{priceInt}
                            <Text style={{fontSize:15,...decimalsTextStyle}}>.{priceDecimals}</Text></Text>
                    </Text>
                    {this._renderDiscount()}
                </View>
            )
        }
    }

     //折扣返现
     _renderDiscount(){
        if (this.props.discount.length > 0 && Number.parseInt(this.props.discount) != 1){
            return(
                <View style={[styles.discountStyle,{borderWidth:1,borderColor:yfwOrangeColor()},this.props.discountStyle]}>
                    <Text style={[styles.textStyle,{color:yfwOrangeColor()}]}>{this.props.discount}</Text>
                </View>
            )

        } else {

            return(
                null
            )

        }

    }


}

const styles = StyleSheet.create({

    discountStyle: {
        marginHorizontal:5,
        borderRadius:3,
        paddingHorizontal:1,
    },
    textStyle:{
        fontSize:9,
        textAlign: 'center',
        marginHorizontal:2,
    }
})