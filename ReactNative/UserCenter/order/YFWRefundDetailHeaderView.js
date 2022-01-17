import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,ImageBackground
} from 'react-native';
import {isEmpty, kScreenWidth, isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import YFWMoneyLabel from "../../widget/YFWMoneyLabel";
import {darkLightColor} from "../../Utils/YFWColor";
import YFWToast from "../../Utils/YFWToast";

export default class YFWRefundDetailHeaderView extends Component {

    constructor(parameters) {
        super(parameters);
        this.state = {
            headerType: this.props.headerType,
            title : this.props.title,
            timeString : this.props.timeString,
            money : this.props.money,
            context1 : this.props.context1,
            context2 : this.props.context2,
            button:this.props.button,
            process:this.props.process,
            isProcessing:Boolean(this.props.isProcessing),
            logisticsText1:this.props.logisticsText1,
            logisticsText2:this.props.logisticsText2,
        }
    }
    componentWillReceiveProps(props) {
        this.setState({
            headerType: props.headerType,
            title : props.title,
            timeString : props.timeString,
            money : props.money,
            context1 : props.context1,
            context2 : props.context2,
            button:props.button,
            process:props.process,
            isProcessing:Boolean(props.isProcessing),
            logisticsText1: props.logisticsText1,
            logisticsText2: props.logisticsText2,
        })
    }
//-------------------------------------METHOD-------------------------------------------------------

    _jumpToLogisticsPage(){
        if (this.props.callBack) {
            this.props.callBack()
        }
    }
    _jumpToFullLogisticsInfo(){
        YFWToast('ToDo填写物流')
    }

//-------------------------------------RENDER-------------------------------------------------------
    _renderBackgroundView() {
        let title = this.state.title
        let timeString = this.state.timeString
        let context1 = this.state.context1
        return (
            <ImageBackground style={style.imgBackground}
                   source={ require('../../../img/shouhuo_bj.png')}>
                <Text style={style.textTitle}>{title}</Text>
                <Text style={style.textTimeString}>{timeString}</Text>
                {
                    isNotEmpty(this.props.reason)?
                    <Text style={{color:'white',fontSize:12* rpx,marginBottom:8}}>{'拒绝原因：'+this.props.reason}</Text>:
                    <View style={{flex:1}}></View>
                }
                <Text style={style.textContext1}>{context1}</Text>
            </ImageBackground>
        )
    }

    _renderFooterButtonView() {
        if(isEmpty(this.state.button) || this.state.button.length === 0){
            return <View/>
        }
        let buttons =[]
        this.state.button.forEach((item,index)=>{
            buttons.push(
                <TouchableOpacity style={index+1===this.state.button.length?style.buttonGreen:style.buttonGray} activeOpacity={1}
                                    onPress={()=>{item.method()}}>
                    <Text style={index+1===this.state.button.length?style.buttonGreenText:style.buttonGrayText}>{item.title}</Text>
                </TouchableOpacity>
            )
        })
        return (
            <View style={{paddingHorizontal: 12*rpx, paddingVertical: 13*rpx, flexDirection: 'row', justifyContent: 'flex-end', backgroundColor:'white'}}>
                {buttons}
            </View>
        )
    }

    _renderLayoutAbove() {
        let title = this.state.title
        let timeString = this.state.timeString
        let money = this.state.money
        let context1 = this.state.context1
        return (
            <View>
                <View style={{paddingHorizontal: 27*rpx, paddingTop: 30*rpx}}>
                    <Text style={style.textTitle}>{title}</Text>
                    <Text style={style.textTimeString}>{timeString}</Text>
                </View>
                <View style={style.aboveLayout}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize: 12*rpx,color: "#999999"}}>
                            退款金额：
                        </Text>
                        <YFWMoneyLabel moneyTextStyle={{fontSize:12*rpx}} decimalsTextStyle={{fontSize:10*rpx}} money={parseFloat(money)}/>
                    </View>
                    <Text style={{fontSize: 12*rpx,color: "#999999"}}>{context1}</Text>
                </View>
            </View>
        )
    }

    _renderFooterProcessView() {
        if(isEmpty(this.state.process) || this.state.process.length === 0){
            return <View/>
        }
        let processCheckPoint=[]
        let isProcessing = this.state.isProcessing
        this.state.process.forEach((item,index)=>{
            processCheckPoint.push(
                <View style={{alignItems: 'center'}}>
                    <Image style={{width:25*rpx,height:25*rpx,resizeMode:'stretch'}}
                           source={isProcessing&&index+1===this.state.process.length? require('../../../img/icon_check_green_off.png'):require('../../../img/icon_check_green_on.png')}/>
                    <Text style={{fontSize: 12*rpx,color: "#666666", marginTop:10*rpx}}>{item.msg}</Text>
                    <Text style={{fontSize: 11*rpx,color: "#999999"}}>{item.timeStr}</Text>
                </View>
            )
        })
        return (
            <View style={{paddingHorizontal:13*rpx, marginVertical:10*rpx, }}>
                <View style={{
                    paddingRight:isProcessing?kScreenWidth/2-13*rpx-16*rpx:0,
                    top:14*rpx,
                    height: 3*rpx,
                    borderRadius: 2*rpx,
                    backgroundColor: "#e5e5e5"}}>
                    <View style={{
                        height: 3*rpx,
                        borderRadius: 2*rpx,
                        backgroundColor: "#1fdb9b"}}/>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    {processCheckPoint}
                </View>
            </View>
        )
    }

    _renderLogisticsLayoutAbove(type){
        let title = this.state.title
        let timeString = this.state.timeString
        let logisticsText1 = this.state.logisticsText1
        let logisticsText2 = this.state.logisticsText2
        let logisticsContext = this.state.context1
        let logisticsTip = ['请按照如上收货地址寄出','请填写真实的物流信息、7天内未输入单号系统将自动取消退货申请。']
        let logisticsTitleView =[]
        let logisticsTipView =[]
        switch (type) {
            case 'track':
                logisticsTitleView.push(<Text style={{fontSize: 13*rpx,color: "#333333", fontWeight: '500'}}>{logisticsText1}</Text>)
            break;
            case 'sent':
                logisticsTitleView.push(<Text style={{fontSize: 13*rpx,color: "#333333", fontWeight: '500', marginRight:22*rpx}}>{logisticsText1}</Text>)
                logisticsTitleView.push(<Text style={{fontSize: 13*rpx,color: "#333333", fontWeight: '500'}}>{logisticsText2}</Text>)
                logisticsTip.forEach((tip)=>{
                    logisticsTipView.push(
                        <View style={{flexDirection:'row', minHeight: 15*rpx, marginLeft: 13*rpx, marginRight:40*rpx}}>
                            <View style={{height:2*rpx, width:2*rpx, marginTop:7*rpx, marginLeft:3*rpx, backgroundColor:'#85a694', borderRadius: 10}}/>
                            <Text style={{fontSize:12*rpx,color:"#999999",marginLeft:13*rpx}}>{tip}</Text>
                        </View>
                    )
                })
            break;
        }
        return (
            <View>
                <View style={{paddingHorizontal: 27*rpx, paddingTop: 30*rpx}}>
                    <Text style={style.textTitle}>{title}</Text>
                    <Text style={style.textTimeString}>{timeString}</Text>
                </View>
                <TouchableOpacity style={style.aboveLayout}  activeOpacity={1}
                                  onPress={()=>{type==='track'?this._jumpToLogisticsPage():()=>{}}}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <View style={{flex:1}}>
                            <View style={{flexDirection:'row', flexWrap: 'wrap'}}>
                                {logisticsTitleView}
                            </View>
                            <Text style={{fontSize: 13*rpx,color: "#999999", marginTop:25*rpx}}>{logisticsContext}</Text>
                        </View>
                        {type==='track'? <Image style={{width:7*rpx,height:13*rpx,left:19*rpx,top:3*rpx,resizeMode:'stretch'}}
                                               source={require('../../../img/icon_arrow_gray.png')}/>:<View/>}
                    </View>
                    <Image style={{width:kScreenWidth-2*12*rpx,height:3*rpx,right:23*rpx,top:18*rpx,resizeMode:'stretch'}}
                       source={require('../../../img/shouhuo_mail.png')}/>
                </TouchableOpacity>
                {logisticsTipView}
            </View>
        )
    }
    render() {
        switch (this.state.headerType) {
            case 'buttons':
                return(
                    <View style={{backgroundColor:'#FAFAFA'}}>
                        {this._renderBackgroundView()}
                        {this._renderFooterButtonView()}
                    </View>
                )
            case 'process':
                return(
                    <View style={{backgroundColor:'#FAFAFA'}}>
                        <ImageBackground style={[style.imgBackground,{position:'absolute', top:0,Left:0}]}
                                         source={ require('../../../img/shouhuo_bj.png')}/>
                        {this._renderLayoutAbove()}
                        {this._renderFooterProcessView()}
                    </View>
                )
            case 'logistics_track':
                return(
                    <View style={{backgroundColor:'#FAFAFA'}}>
                        <ImageBackground style={[style.imgBackground,{position:'absolute', top:0,Left:0}]}
                                         source={ require('../../../img/shouhuo_bj.png')}/>
                        {this._renderLogisticsLayoutAbove('track')}
                        {this._renderFooterButtonView()}
                    </View>
                )
            case 'logistics_sent':
                return(
                    <View style={{backgroundColor:'#FAFAFA'}}>
                        <ImageBackground style={[style.imgBackground,{position:'absolute', top:0,Left:0}]}
                                         source={ require('../../../img/shouhuo_bj.png')}/>
                        {this._renderLogisticsLayoutAbove('sent')}
                        {this._renderFooterButtonView()}
                    </View>
                )
        }
    }


}
const rpx = kScreenWidth/375  //设计稿显示单位（IOS，x3）
const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    imgBackground:{
        width:kScreenWidth,
        height:140*rpx,
        justifyContent:'space-between',
        resizeMode:'stretch',
        padding: 27*rpx,
        paddingTop: 20*rpx
    },
    textTitle:{
        fontWeight: '500',
        fontSize: 16 * rpx,
        color: "#ffffff"
    },
    textTimeString:{
        fontSize: 12* rpx,
        color: "#ffffff"
    },
    textContext1:{
        marginBottom: 5 * rpx,
        fontSize: 12 * rpx,
        color: "#ffffff"
    },
    textContext2:{
        marginTop: 9 * rpx,
        fontSize: 12 * rpx,
        color: "#ffffff"
    },
    buttonGreen:{
        marginLeft:11*rpx,
        borderRadius: 3*rpx,
        borderStyle: "solid",
        borderWidth: 1 *rpx,
        borderColor: "#15d598",
        paddingHorizontal: 12*rpx,
        paddingVertical: 7*rpx,
    },
    buttonGreenText:{
        fontSize: 12*rpx,
        color: "#1fdb9b"
    },
    buttonGray:{
        marginLeft:11*rpx,
        borderRadius: 3*rpx,
        paddingHorizontal: 12*rpx,
        paddingVertical: 7*rpx,
        backgroundColor: "#f5f5f5",
        fontSize: 12*rpx,
        color: "#666666"
    },
    buttonGrayText:{
        fontSize: 12*rpx,
        lineHeight: 18*rpx,
        color: "#666666"
    },
    aboveLayout:{
        margin:12*rpx,
        borderRadius: 7*rpx,
        backgroundColor: "#ffffff",
        paddingVertical:18*rpx,
        paddingLeft:23*rpx,
        paddingRight:37*rpx,
        shadowColor: "rgba(204, 204, 204, 0.3)",
        shadowOffset: {
            width: 0,
            height: 3*rpx
        },
        shadowRadius: 8*rpx,
        shadowOpacity: 1*rpx,
        elevation:1,
    }
});