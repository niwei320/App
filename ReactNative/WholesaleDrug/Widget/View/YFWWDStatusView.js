import React from 'react'
import {DeviceEventEmitter, Dimensions, Image, Text, TouchableOpacity, View,} from 'react-native'
import {backGroundColor, darkLightColor, darkNomalColor} from "../../../Utils/YFWColor";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {isEmpty, adaptSize, kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWOrderEmptyView from '../../../widget/YFWOrderEmptyView'
import {IMG_LOADING, IMG_NET_ERROR} from "../../../YFWHomePage";
import { YFWImageConst } from '../../Images/YFWImageConst';
export let SHOW_LOADING = 'SHOW_LOADING'
export let SHOW_NETERROR = 'SHOW_NETERROR'
export let SHOW_EMPTY = 'SHOW_EMPTY'
export let DISMISS_STATUS = 'DISMISS_STATUS'
export let SHOW_ORDER_EMPTY = 'SHOW_ORDER_EMPTY'
export let SHOW_EMPTY_WITH_TIPS = 'SHOW_EMPTY_WITH_TIPS'


/**
 * 状态页
 */
export default class YFWWDStatusView extends React.Component {

    constructor(props) {
        super(props)
        this.retry = this.props.retry
        let initStatus = this.props.initStatus
        if (isEmpty(initStatus)) {
            initStatus = ''
        }
        //TODO 这里缺少网络状态的获取，当获取到网络不可用时直接切换为‘SHOW_NETERROR’状态
        this.state = {
            status: initStatus,
            tips:undefined,
            image: undefined,
            width: kScreenWidth,
            height: kScreenWidth,
            x: 0,
            y:0
        }

    }

    componentWillMount() { 
        this.refreshViewListener = DeviceEventEmitter.addListener('WDStatusView_Refresh', ({ width, height,x,y,pageX,pageY })=> {
            this.state.width = width
            this.state.height = height
            this.state.x = pageX
            this.state.y = pageY
            this.setState({})
        })
    }

    componentWillUnmount() {
        this.refreshViewListener&&this.refreshViewListener.remove()
    }

    render() {
        let view = <View/>
        switch (this.state.status) {
            case SHOW_LOADING:
                view = this.renderLoading()
                break
            case SHOW_NETERROR:
                view = this.renderNetError()
                break
            case SHOW_EMPTY:
                view = this.renderEmpty()
                break
            case SHOW_ORDER_EMPTY:
                view = this.renderOrderEmpty()
                break
            case SHOW_EMPTY_WITH_TIPS:
                view = this.renderEmptyWithTips()
                break
            default:
                return <View/>
        }
        return (
            <View style={{width:kScreenWidth,height:this.state.height,flex:1,top:this.state.y,position:'absolute'}}>
                {view}
            </View>
        )
    }

    /**
     * 返回加载中
     */
    renderLoading() {
        return (
            <View style={[{backgroundColor:backGroundColor(),flex: 1,alignItems: 'center'}]}>
                <View
                    style={[{position:'absolute',top:'50%',bottom:"50%",marginLeft:'auto',marginRight:'auto'},
                        BaseStyles.centerItem,{width: 80, height: 80}]}>
                    <Image style={{height: 40, width:40,resizeMode:'contain'}} source={IMG_LOADING}/>
                </View>
            </View>
        )
    }

    /**
     * 返回网络错误
     */
    renderNetError() {
        return (
            <View style={[{backgroundColor:backGroundColor(),flex: 1,alignItems: 'center',justifyContent:'center'}]}>
                {/* <Image source={IMG_NET_ERROR} style={{resizeMode: 'contain',width:adaptSize(167),height:adaptSize(167)}}/> */}
                <Text style={{fontSize:16,color:darkNomalColor()}}>请求失败</Text>
                <Text style={{width:100,textAlign: 'center' ,fontSize:13,color:darkLightColor(),marginTop:10}}>重新加载吧</Text>
                <TouchableOpacity activeOpacity={1} onPress={()=>{this.retryFuc()}} style={{marginTop:20}}>
                    <View
                        style={[BaseStyles.centerItem,{borderColor:darkNomalColor(),borderRadius: 4,borderWidth:1,paddingLeft: 8,paddingRight: 8,paddingTop: 4,paddingBottom: 4}]}>
                        <Text style={{fontSize:16,color:darkNomalColor()}}>重新加载</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * 返回空视图
     */
    renderEmpty() {
        return (
            <View style={[{backgroundColor:backGroundColor(),flex: 1,alignItems: 'center'}]}>
            </View>
        )
    }

    /*
     *  订单空视图
     * */
    renderOrderEmpty() {
        return (<View style={[{flex: 1}]}>
            <YFWOrderEmptyView navigation = {this.props.navigation}/>
        </View>)
    }

    /*
    *  列表空视图
    * */
    renderEmptyWithTips(){
        return(<View style={[{flex: 1}]}>
            <View style = {[BaseStyles.centerItem,{flex:1 }]}>
                <View style = {{width:200,height:300,alignItems:'center'}}>
                    <Image source={this.state.image || YFWImageConst.Icon_empty_page} resizeMode='contain' style={{ width: adaptSize(167), height: adaptSize(167) }}/>
                    <Text style={[BaseStyles.contentStyle,{marginTop:20,color:'#999999',marginLeft:0}]}>{this.state.tips}</Text>
                </View>
            </View>
        </View>)
    }

    showLoading() {
        this.setState({status: SHOW_LOADING})
    }

    showRequestError() {
        this.setState({status: SHOW_NETERROR});
    }

    showEmpty() {
        this.setState({status: SHOW_EMPTY});
    }

    showEmptyOrder(){
        this.setState({status:SHOW_ORDER_EMPTY});
    }

    dismiss() {
        this.setState({status: DISMISS_STATUS});
    }

    showEmptyWIthTips(tips,image){
        this.setState({status:SHOW_EMPTY_WITH_TIPS,tips:tips,image:image});
    }

    retryFuc() {
        this.retry && this.retry()
    }
}