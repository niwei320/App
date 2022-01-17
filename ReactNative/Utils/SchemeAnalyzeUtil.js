import React from 'react'
import {isEmpty} from "../PublicModule/Util/YFWPublicFunction";

/**
 * 链接跳转解析
 */
class SchemeAnalyzeUtil {
}

export function analyzeUrl(url) {
    if (isEmpty(url) || !url.includes('?')) {
        return ''
    }

    let obj = {}
    let str=url.split("?")[1], items=str.split("&")
    for(let i = 0, l = items.length; i < l; i++){
        let arr=items[i].split("=")
        let name= arr[0]
        let value= arr[1]
        switch (name) {
            case "type":
                obj.type = value
                break
            case "value":
                obj.value = value
                break
            case "name":
                obj.name = value
                break
        }
    }

    if(Object.keys(obj).length === 0){
        return ''
    }

    return obj
}
