import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import {
    dealDayStr,
    isEmpty,
    isNotEmpty,
    safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWOrderMessageModel {

    setModelData(data) {

        let messageArray = [];
        if (isNotEmpty(data.advisoryList) && data.advisoryList.length>0) {
            data.advisoryList.forEach((item, index) => {
                    messageArray.push({
                        orderno: item.orderno,
                        accountid: item.accountid,
                        storeid: item.storeid,
                        content: item.content,
                        create_time: item.create_time,
                        account_name: item.account_name,
                        title: item.title,

                        key:index,
                        role:item.accountid>0?'我':'商家回复',
                        message:item.content,
                        time:this.getFormatDate(item.create_time),
                    })
                }
            )
        }
        return {messageArray:messageArray}
    }

    getFormatDate (data) {
       let date = new Date(data.replace(/\-/g, "/"))
        let m = dealDayStr(date.getMonth()+1)
        let d = dealDayStr(date.getDate())
        return m + '-' + d + ' ' + dealDayStr(date.getHours()) + ':' + dealDayStr(date.getMinutes())
    }

    static getModelArray(data) {
        let model = new YFWOrderMessageModel();
        let ModeData = model.setModelData(data)
        return ModeData;

    }
}