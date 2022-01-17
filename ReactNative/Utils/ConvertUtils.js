import React from 'react'
import {
    View,
} from 'react-native'
import YFWUserInfoManager from "./YFWUserInfoManager";

/**
 * 保留两位小数点
 * @param x
 * @returns {*}
 */
export function toDecimal(x) {
    try{

        if (x == undefined){
            return '0.00';
        }

        if (typeof (x) == 'string'&&x.indexOf('-') !=-1){
            return x;
        }

        var f_x = parseFloat(x+"");
        if (isNaN(f_x)) {
            return '';
        }
        var f_x = Math.round(x * 100) / 100;
        var s_x = f_x.toString();
        var pos_decimal = s_x.indexOf('.');
        if (pos_decimal < 0) {
            pos_decimal = s_x.length;
            s_x += '.';
        }
        while (s_x.length <= pos_decimal + 2) {
            s_x += '0';
        }
        return s_x;
    }catch (e) {
        return '0.00'
    }
}

/**
 * 转换评分
 * @param count
 * @returns {string}
 */
export function convertStar(count) {
    let num = 5
    if(!isNaN(parseFloat(count))){
        num = parseFloat(count)
    }
    return num.toFixed(1)
}