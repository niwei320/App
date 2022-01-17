import React, { Component } from 'react';
import {
    View,
    Image,
    DeviceEventEmitter,
    Text,
    Platform,
    TouchableOpacity,
    TextInput, ImageBackground
} from 'react-native'
import ModalView from './../../widget/ModalView';
import { kScreenWidth, adaptSize, safe, isNotEmpty, kScreenHeight, isRealName, isEmpty } from '../../PublicModule/Util/YFWPublicFunction';

export default class YFWErpOrderAlertView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            tips:'您还有1笔门店未付款订单，请前去付款',
            countDownTime: 30,
            callBack: () => { }
        }
        this.timer = null
    }

    componentDidMount() {

    }

    showView(time,tips, callBack) {
        if (isNotEmpty(time)) {
            this.state.countDownTime = time
        }
        if (isNotEmpty(callBack)) {
            this.state.callBack = callBack
        }
        if (isNotEmpty(tips)) {
            this.state.tips = tips
        }
        this.setState({
        })
        this._startTimer()
        this.modalView && this.modalView.show()
    }

    closeView() {
        this.modalView && this.modalView.disMiss()
    }

    onclick() {
        this.state.callBack && this.state.callBack()
        this.closeView()
    }

    getRestTimeStr() {
        if (isEmpty(this.state.countDownTime) || isNaN(parseInt(this.state.countDownTime))) {
            return ''
        }
        let time = parseInt(this.state.countDownTime)
        if (time < 0) {
            time = 0
        }
        // let hour = parseInt(time/(60*60)) + ''
        // time = time%(60*60)
        // if (hour.length <=1 ) {
        //     hour = '0'+hour
        // }
        let minutes = parseInt(time / (60)) + ''
        if (minutes.length <= 1) {
            minutes = '0' + minutes
        }
        time = time % 60 + ''
        if (time.length <= 1) {
            time = '0' + time
        }
        return minutes + ':' + time
    }

    _startTimer() {
        this.timer && clearInterval(this.timer)
        this.timer = setInterval(() => {
            this.state.countDownTime = this.state.countDownTime - 1
            if (this.state.countDownTime < 0) {
                clearInterval(this.timer)
                this.timer = null
                this.closeView()
            } else {
                this.setState({})
            }
        }, 1000)
    }

    _renderAlertView() {
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => { }} style={[{ alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
                <View style={{ width: kScreenWidth - adaptSize(28 * 2), justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#fff' }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => { this.closeView() }} style={{ top: 10, right: 11, position: 'absolute', paddingLeft: 20, paddingBottom: 20 }}>
                        <Image source={require('../../../img/returnTips_close.png')} style={{ width: 14, height: 14 }} />
                    </TouchableOpacity>
                    <Image style={{ marginTop: 31, width: 81, height: 61, borderRadius: 31, shadowColor: "rgba(247, 179, 72, 0.4)", shadowOffset: { width: -2, height: 1 }, shadowRadius: 10, shadowOpacity: 1 }} source={require('../../../img/icon_erp_order.png')} ></Image>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: adaptSize(25) }}>
                        <Text style={{ fontSize: 17, color: '#333', fontWeight: 'bold', }}>{'剩余付款时间'}</Text>
                        <Text style={{ fontSize: 17, color: '#ef0000', marginLeft: 20, fontWeight: 'bold', minWidth: 50 }}>{this.getRestTimeStr()}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#333', marginTop: adaptSize(6) }}>{this.state.tips}</Text>

                    <TouchableOpacity activeOpacity={1} onPress={() => { this.onclick() }} style={{ alignItems: 'center', justifyContent: 'center',marginBottom:21,marginTop:15}}>
                        <ImageBackground
                            style={{ width: 90, height: 47, alignItems: 'center', justifyContent: 'center' }}
                            source={require('../../../img/button_djlq.png')}>
                            <Text style={{ color: 'white', fontSize: 15, top: -3,fontWeight:'500' }}>{'前往付款'}</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this._renderAlertView()}
            </ModalView>
        )
    }



}
