import React, {Component} from 'react';
import {
    View,
    Text, StyleSheet,Image,TouchableOpacity
} from 'react-native'
import {kScreenWidth, secretPhone} from '../../../PublicModule/Util/YFWPublicFunction'
import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor
} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import { YFWImageConst } from '../../Images/YFWImageConst';

export default class YFWWDSettlementHeader extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render(){
        let context ={
            name:this.props.context.name,
            mobile:this.props.context.mobile,
            address:this.props.context.address,
            isDefault:this.props.context.isDefault

        }
        return(
            <View style={styles.container}>
                <Image style={styles.bgImg}
                    source={YFWImageConst.Icon_settle_address_bg}/>
                <Text style={styles.topTitle}>收货地址</Text>
                <TouchableOpacity activeOpacity={1} onPress={()=>{this._renderClickCard()}} style={[BaseStyles.radiusShadow,styles.context]}>
                    <View style={{height:52,marginTop:33,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <View style={{marginLeft:14,height:52,justifyContent:'space-between'}}>
                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                <Image style={{height:12,width:14,resizeMode:'contain'}}
                                    source={require('../../../../img/local_shouhuo.png')}/>
                                <Text style={{fontSize:15,marginLeft:13,fontWeight:'500',color:darkTextColor()}}>{context.name}</Text>
                                <Text style={{fontSize:15,marginLeft:15,fontWeight:'500',color:darkTextColor()}}>{secretPhone(context.mobile)}</Text>
                                {context.isDefault?<Image style={{marginLeft:13, height:14, width:29}}
                                    source={require('../../../../img/Label_moren.png')}/>:<View/>}

                            </View>
                            <Text style={{marginLeft:27,marginBottom:0,fontSize:12,color:'#999999',width:kScreenWidth-108}}
                                    numberOfLines={1}>{'地址:'+context.address}</Text>


                        </View>
                        {this.props.isTouch?<Image style={{height:18,width:18,marginRight:15}}
                            source={require('../../../../img/around_detail_icon.png')}/>:<View/>}

                    </View>
                    <Image style={{marginBottom:0,width:kScreenWidth-26,resizeMode:'stretch'}}
                        source={require('../../../../img/shouhuo_mail.png')}/>
                </TouchableOpacity>
            </View>
        )
    }

    _renderClickCard(){
        if(this.props.changeAddress&&this.props.isTouch){
            this.props.changeAddress()
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        height:166
    },
    bgImg: {
        height:104,
        width:kScreenWidth
    },
    topTitle: {
        position:'absolute',
        top:22,
        color:'white',
        marginLeft:13,
        fontSize:15,
        fontWeight:'500'


    },
    context: {
        flex:1,
        height:111,
        width:kScreenWidth-26,
        marginLeft:13,
        position:'absolute',
        top:44,backgroundColor:'#ffffff',
        justifyContent:'space-between',
        shadowOffset: {width: 9, height: 9}
    }


})