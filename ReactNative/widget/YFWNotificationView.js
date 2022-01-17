import React,{ Component } from 'react'
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet} from 'react-native'
import ModalView from './ModalView'
import YFWNativeManager from "../Utils/YFWNativeManager";
import {adaptSize, haslogin, isEmpty, isNotEmpty, formatDateTime} from "../PublicModule/Util/YFWPublicFunction";
import {yfwGreenColor,darkTextColor} from "../Utils/YFWColor";
import {setItem, getItem, removeItem, YFWNotificationData} from "../Utils/YFWStorage"

export default class YFWNotificationView extends Component {
    constructor (props) {
        super(props);

        this.state = {
            showModal: false
        }
    }

    componentDidMount() {
        this.showNotification()
    }

    render() {
        return (
            <ModalView animationType="fade" ref={(modal) => this.modalView = modal}>
                {this.renderNotification()}
            </ModalView>
        )
    }

    renderNotification() {
        return(
            <View style={styles.container}>
                <View style={styles.content}>
                    <TouchableOpacity activeOpacity={1} style={styles.close} onPress={() => {this.hideNotification()}}>
                        <Image source={require('../../img/icon_notification_close.png')} style={{width:14, height: 14}}/>
                    </TouchableOpacity>
                    <ImageBackground style={styles.head} source={require('../../img/icon_notification_bg.png')} imageStyle={{resizeMode:'stretch'}}>
                        <Image source={require('../../img/icon_notification_clock.png')} style={styles.clock}/>
                        <View style={{marginRight:14,justifyContent:'center'}}>
                            <Text style={{fontSize:19, color:'#fff', marginBottom:7}}>开启系统通知</Text>
                            <Text style={{fontSize:13, color:'#fff'}}>第一时间收到以下消息提醒哦~</Text>
                        </View>
                    </ImageBackground>
                    <View style={{flex:1, justifyContent:"center", alignItems:'center'}}>
                        {this.renderCenterItem(require('../../img/icon_notification_activity.png'),"商城福利活动信息", true)}
                        {this.renderCenterItem(require('../../img/icon_notification_discount.png'),"折扣优惠信息", true)}
                        {this.renderCenterItem(require('../../img/icon_notification_order.png'),"订单实时信息", false)}
                    </View>
                    <View style={styles.bottom}>
                        <TouchableOpacity activeOpacity={1} style={styles.open} onPress={() => {this.openNotification()}}>
                            <Text style={{fontSize:15, color:yfwGreenColor()}}>立即开启</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    /**
     * 中间小item
     *
     * @param {图片资源} img
     * @param {标题} title
     * @param {是否显示横线} line
     */
    renderCenterItem(img, title, line) {
        return (
            <View style={{flexDirection:"row", height:adaptSize(40), justifyContent:'center', alignItems:'center'}}>
                <Image source={img} style={{width:adaptSize(27), height:adaptSize(27), marginRight:10, resizeMode:"contain"}}/>
                <View style={{justifyContent:"space-between", width:adaptSize(130)}}>
                    <View style={{height:adaptSize(40), justifyContent:"center"}}>
                        <Text style={{color:darkTextColor(), fontSize:15, fontWeight:"500"}}>{title}</Text>
                    </View>
                    <View style={{height:1, backgroundColor:"#e5e5e5", opacity:line ? 1 : 0}}></View>
                </View>
            </View>
        )
    }

    /**
     * 显示弹框
     */
    showNotification() {
        YFWNativeManager.isOpenNotification((openStatus) => {
            if (openStatus) {
                return
            }
            /**
             * 检查通知状态
             *
             * 1.周开启次数是否为1
             * 2.当天开启次数是否为1
             */
            let islogin = haslogin()
            if (islogin) {
                getItem(YFWNotificationData).then((notification) => {
                    let currentDateString = formatDateTime()

                    if (isEmpty(notification)) {
                        this.saveNotificationData(currentDateString)
                    }else {
                        let currentDate = new Date(currentDateString.replace(/\-/g,'/'))
                        let currentInterval = currentDate.valueOf()
                        if(this.props.notiType == "home") {
                            // 首页检查 周
                            let lastWeek = notification.weekDay.replace(/\-/g,'/');
                            let lastInterval = new Date(lastWeek).valueOf()
                            let sub = currentInterval - lastInterval
                            if (sub >= 7*24*60*60*1000) {
                                this.saveNotificationData(currentDateString)
                            }
                        }else {
                            // 订单检查 日
                            let lastDay = notification.day.replace(/\-/g,'/');
                            let lastInterval = new Date(lastDay).valueOf()
                            let sub = currentInterval - lastInterval
                            if(sub >= 24*60*60*1000) {
                                this.saveNotificationData(notification.weekDay)
                            }
                        }
                    }
                })
            }
        })
    }

    saveNotificationData(week) {
        this.modalView && this.modalView.show()
        let currentDateString = formatDateTime()
        let notification = {
            weekDay: week, // 周
            weekCount: 1, // 周弹窗次数
            day: currentDateString,     // 日
            dayCount: 1,  // 日弹框次数
        }
        setItem(YFWNotificationData, notification)
    }

    /**
     * 隐藏弹框
     */
    hideNotification() {
        this.modalView && this.modalView.disMiss()
    }

    /**
     * 开启通知
     */
    openNotification() {
        this.hideNotification()
        YFWNativeManager.openSetting()
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent:"center",
        alignItems:'center',
        flex:1,
        backgroundColor:'rgba(0, 0, 0, 0.3)'
    },
    content: {
        width:adaptSize(300),
        height:adaptSize(350),
        borderRadius:7,
        backgroundColor:"#fff",
        overflow:"hidden"
    },
    close: {
        width:adaptSize(40),
        height:adaptSize(40),
        position:"absolute",
        right:0,
        top:0,
        justifyContent:"center",
        alignItems:'center',
        zIndex: 10
    },
    head: {
        height:adaptSize(100),
        flexDirection:"row",
        alignItems:"center"
    },
    clock: {
        width:adaptSize(50),
        height:adaptSize(50),
        resizeMode:'contain',
        marginLeft:adaptSize(30),
        marginRight: adaptSize(15)
    },
    bottom: {
        height: adaptSize(60),
        alignItems:"center",
    },
    open: {
        borderRadius:adaptSize(15),
        width:adaptSize(130),
        height:adaptSize(30),
        borderWidth:1,
        borderColor:yfwGreenColor(),
        justifyContent:"center",
        alignItems:'center'
    }
})