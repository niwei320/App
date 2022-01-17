import React, {Component} from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    DeviceEventEmitter,ImageBackground
} from 'react-native';
import {
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor,
    newSeparatorColor
} from "../../../Utils/YFWColor";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {
    dismissKeyboard_yfw,
    isEmpty,
    safe,
    safeObj,
    tcpImage,
    isNotEmpty,
    kScreenWidth
} from '../../../PublicModule/Util/YFWPublicFunction'
import YFWUserInfoManager from "../../../Utils/YFWUserInfoManager";
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_SINGLE,
    TYPE_OTC
} from "../../../widget/YFWPrescribedGoodsTitle";
import YFWMoneyLabel from '../../../widget/YFWMoneyLabel';

export default class YFWOTOShopCarStaleCell extends Component {

    static defaultProps = {
        Data:undefined,
        select:false,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            quantity:this.props.Data?.quantity,
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

    componentWillReceiveProps(nextProps){
        this.setState({
            quantity:nextProps.Data?.quantity,
        })
    }

    render() {
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>this._selectGoodsItemMethod(this.props.Data)} style={styles.container}>
                <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                    <View style={styles.checkButton}>
                        <View style={{width:23,height:23,backgroundColor:'#ccc',borderRadius:11.5}}></View>
                    </View>
                    <Image style={styles.imageStyle}
                           source={{uri:tcpImage(this.props?.Data?.img_url)}}/>
                    <View style={styles.view1Style}>
                        <View style={{marginHorizontal:10,marginTop:10,flex:1}}>
                            {this.renderTopInfo(this.props.Data)}
                            <View style={[styles.view2Style,{marginTop:8,marginBottom:10}]}>
                                <View flex={1} style={{height:24,flexDirection:'row',alignItems:'center'}}>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    renderTopInfo(item){
        let isOverdue = parseInt(safe(this.props.Data?.dict_store_medicine_status))<0?true:false
        return (
            <View style={{flexDirection:'row',justifyContent:'space-between',flex:1}}>
                <View style={{flex:1}}>
                    {this.renderTitleView(item,isOverdue)}
                    <Text style={styles.regionStyle} numberOfLines={1}>{this.props.Data?.standard}</Text>
                    {this._renderFreepostInfo(item)}
                    {this.props.Data?.reserve_desc?<Text style={{fontSize:11,color:'#e22d00',marginTop:6}}>{this.props.Data?.reserve_desc}</Text>:<View/>}
                </View>
                {isOverdue?null:<View>
                    <View style={{flexDirection:'row-reverse'}}>
                        <YFWMoneyLabel money={item.price_old} moneyTextStyle={{marginRight:0,fontSize:15,color:'#999'}} decimalsTextStyle={{color:'#999',fontSize:13}}/>
                    </View>
                    {this.props.showType=='oto'&&<Text style={[styles.regionStyle,{textAlign:'right'}]} numberOfLines={1}>{'x'+this.state.quantity}</Text>}
                    <View style={{flexDirection:'row-reverse'}}>
                        {this._renderDiscount()}
                    </View>
                </View>}
            </View>
        )
    }
    _renderFreepostInfo (item) {
        if (item.is_freepostage === 1 && item.freepostagecount > 0) {
            let title = item.freepostagecount + '件包邮'
            if (item.freepostagecount == 1) {
                title = '单品包邮'
            }
            return (
                <View style={{flexDirection:'row'}}>
                    <View style={{marginTop:2,height:15,borderRadius:3,borderColor:'#1fdb9b',borderWidth:0.5,alignItems:'center',justifyContent:'center'}}>
                        <Text style={{color:'#1fdb9b',fontSize:12,paddingHorizontal:3}}>{title}</Text>
                    </View>
                    <View style={{flex:1}}></View>
                </View>
            )
        }
        return (<View/>)
    }
    _renderDiscount(){
        if(isNotEmpty(this.props.Data?.discount) && !this.state.noLocationHidePrice){
            return (
                <ImageBackground source={require('../../../../img/sx_ticket.png')} style={{paddingHorizontal:4,marginTop:2}} imageStyle={{resizeMode:'stretch'}}>
                            <Text style={{color:'#ff3300',fontSize:10,textAlign:'center',lineHeight:12}}>{this.props.Data.discount}</Text>
                </ImageBackground>
            )
        }
    }

    renderTitleView(item,isOverdue) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(item).PrescriptionType+"" === "1"){
            return this.rednerPrescriptionLabel(TYPE_SINGLE,item.title,isOverdue)
        }
        //双轨药
        else if(safeObj(item).PrescriptionType+"" === "2"){
            return this.rednerPrescriptionLabel(TYPE_DOUBLE,item.title,isOverdue)
        }
        else if(safeObj(item).PrescriptionType+"" === "0") {
            return this.rednerPrescriptionLabel(TYPE_OTC,item.title,isOverdue)
        }
        //这里没有处方药的判断
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL,item.title,isOverdue)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type,title,isOverdue){
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            isOverdue={true}
            numberOfLines={2}
            style={{
                fontSize: 13 ,
                color: '#000',
                fontWeight:'bold',
                marginRight: 10,
                flex:1,
                lineHeight:16
            }}
        />
    }

    _selectFn(){
        if (this.props.selectFn){
            this.props.selectFn();
        }
    }

    _selectGoodsItemMethod(badge){
        if (this.props.selectGoodsItemMethod){
            this.props.selectGoodsItemMethod(badge)
        }
    }
}

//设置样式
const styles = StyleSheet.create({
    container: {
        flex:1,
        height:100,
        backgroundColor:'white',
    },
    checkButton:{
        marginLeft:5,
        width:30,
        height:30,
    },
    imageStyle:{
        marginLeft:0,
        height:60,
        width:60,
    },
    view1Style:{
        flex:1,
    },
    regionStyle:{

        fontSize: 12,
        color:darkLightColor(),
        marginRight:5,
        marginTop:5,

    },
    view2Style:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    priceStyle:{

        fontSize: 15,
        width:120,
        color:yfwOrangeColor(),
        marginTop:13,
        marginLeft:10,
        marginRight:15,
    },
    starStyle:{

        fontSize: 12,
        //width:100,
        color:darkNomalColor(),
        marginLeft:15,
    },
    shippingPriceStyle:{

        fontSize: 12,
        color:darkNomalColor(),
        width:85,
        marginRight:15,
        textAlign: 'right',
    },
    checkImgStyle:{
        width:12,
        height:12,
        marginLeft:10,
        marginTop:5,
    },
    textStyle:{

        fontSize: 12,
        color:darkNomalColor(),
        marginTop:5,
        marginLeft:2,
    },
    operatingBox:{

        width:90,
        height:24,
        borderColor:newSeparatorColor(),
        borderWidth:1,
        // marginRight:7,
        // marginTop:7,
        borderRadius:3,
        flexDirection: 'row',
        overflow:'hidden'

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
        color:darkTextColor(),
    },
    inputBorder:{
        borderColor:newSeparatorColor(),
        borderLeftWidth:1,
        borderRightWidth:1,
        width:30,
        height:24,
        textAlign:'center',
    },
    color_disabled1:{
        color:darkLightColor(),
    },
});
