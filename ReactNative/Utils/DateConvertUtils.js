import React from 'react'
import {
    View,
} from 'react-native'
import {isEmpty, safeObj} from "../PublicModule/Util/YFWPublicFunction";
/**
 * 时间转换工具类
 */

/**
 * 转换为多少天之前,超过1年显示多少年前，一年内为多少天之前
 */
export function convertDaysAgo(time) {
    if(isEmpty(time)){
        return safeObj(time)
    }
    try{
        let date = new Date(time);
        let createTime = Date.parse(date)
        let currentDate = new Date()
        let currentYear = currentDate.getFullYear()
        let currentTime = Date.parse(currentDate)
        let offset = currentTime - createTime
        let day = ""
        let year = ""
        if(currentYear%4==0&&currentYear%100!=0||currentYear%400==0){
            day = offset / 1000 / 60 / 60 / 24 + 1
            year = day / 366
        }else{
            day = offset / 1000 / 60 / 60 / 24
            year = day / 365
        }
        if(year >= 1){
            time = parseInt(year)+"年前"
        }else{
            time = parseInt(day)+"天前"
        }
    }catch (e) {}

    return time
}

/**
 * 格式化时间 2018-11-11 11:11:11 转为 2018-11-11
 * @param time
 * @returns {*}
 */
export function convertDate(time) {
    if(isEmpty(time)){
        return safeObj(time)
    }
    try{
        let date = new Date(time);
        time = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()
    }catch (e) {}
    return time
}