import React from 'react'
import {
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native'

const width = Dimensions.get('window').width;
import {isEmpty, isNotEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWToast from '../../Utils/YFWToast'
export default class SendInfoTips extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sendInfoData: [],
            orderNum: undefined,
            orderNo: undefined,
            position: undefined,
            type: undefined,
            pageSource: undefined
        }
    }

    render() {
        this.state.sendInfoData = this.props.sendInfoData;
        this.state.orderNum = this.props.orderNum;
        this.state.orderNo = this.props.orderNo;
        this.state.position = this.props.position;
        this.state.type = this.props.type;
        this.state.pageSource = this.props.pageSource;
        if (isEmpty(this.state.sendInfoData) || isEmpty(this.state.orderNum) || isEmpty(this.state.sendInfoData.desc)) {
            return (<View/>)
        } else {
            if (isNotEmpty(this.state.sendInfoData.button_items) && this.state.sendInfoData.button_items.length > 0) {
                return (
                    <View>
                        {this._isNeedRendSpliteView(this.state.type)}
                        <View
                            style={{width:width-45,flexDirection:'row',marginLeft:32,alignItems:'center',paddingTop:5,paddingBottom:5}}>
                            <Text style={{fontSize:13,color:'#999999',flex:1}}>{this.state.sendInfoData.desc}</Text>
                            {this._renderButtons(this.state.sendInfoData)}
                        </View>
                    </View>
                )
            } else {
                if (this.state.type == 'detail') {
                    return (
                        <View>{this._isNeedRendSpliteView(this.state.type)}
                            <View
                                style={{width:width-45,flexDirection:'row',marginLeft:32,alignItems:'center',height:35}}>
                                <Text style={{fontSize:13,color:'#999999',flex:1}}>{this.state.sendInfoData.desc}</Text>
                            </View>
                        </View>)
                } else {
                    return (<View/>)
                }
            }
        }
    }

    _renderButtons(sendInfoData) {
        return (<View style={{flexDirection:'row'}}>
            {sendInfoData.button_items.map((item, index)=>this._renderButtonsItem(item, index))}
        </View>)


    }

    _renderButtonsItem(item, index) {
        return ( <TouchableOpacity activeOpacity={1} onPress={()=>this._buttonItemsClick(index)}>
            <View
                style={{borderRadius:11,borderColor:'#cccccc',borderWidth:1,paddingBottom:5,paddingTop:5,paddingLeft:13,paddingRight:13,marginLeft:20}}>
                <Text key={index} style={{alignSelf:'center',color:'#cccccc',fontSize:12}}>{item.text}</Text>
            </View>
        </TouchableOpacity>)
    }

    _buttonItemsClick(index) {
        index == 0 ? this._agreeSendDelay() : this._refuseSendDelay();
    }

    _agreeSendDelay() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.delaySend');
        paramMap.set('orderno', this.state.orderNo);
        paramMap.set('isConfirm', 1);
        viewModel.TCPRequest(paramMap, (res)=> {
            YFWToast('您同意了商家的延期发货请求')
            if (this.props.from == 'list') {
                this.props.refreshItemSendInfo(this.state.position)
            } else {
                this.props.refreshItemSendInfo(this.state.position)
                refreshOrderStatusData = {
                    pageSource: this.state.pageSource,
                    position: this.state.position
                }
                DeviceEventEmitter.emit('delayed_shipment_action', refreshOrderStatusData)
            }
        })
    }


    _refuseSendDelay() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.delaySend');
        paramMap.set('orderno', this.state.orderNo);
        paramMap.set('isConfirm', 0);
        viewModel.TCPRequest(paramMap, (res)=> {
            YFWToast('您拒绝了商家的延期发货请求')
            if (this.props.from == 'list') {
                this.props.refreshItemSendInfo(this.state.position)
            } else {
                this.props.refreshItemSendInfo(this.state.position)
                refreshOrderStatusData = {
                    pageSource: this.state.pageSource,
                    position: this.state.position
                }
                DeviceEventEmitter.emit('delayed_shipment_action', refreshOrderStatusData)
            }
        })
    }

    _isNeedRendSpliteView(type) {
        if (type == 'detail') {
            return (<View style={{width:width-10,height:0.5,backgroundColor:'#E5E5E5',marginLeft:10}}/>)
        } else {
            return (<View/>)
        }
    }
}