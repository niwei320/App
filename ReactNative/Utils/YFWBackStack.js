import { getItem,setItem } from "./YFWStorage"
import { isNotEmpty, isEmpty, deepCopyObj } from "../PublicModule/Util/YFWPublicFunction"

const kBackStack = 'backStack'
const kFunctionKey = 'callBackFunction'
let instance = null;
/***
 * 记录当前访问(栈)页面信息
  */
export class YFWBackStack {
    
    constructor() {
        this.initListFromLocalStorage()
        this.lastVC = null // {name:'',params:{},timestamp:''}
        this.hasReadCache = false
        if (!instance) {
            instance = this;
            console.log('init last vc')
        }
        return instance;
    }
    /***
     * 类方法
     */
    static ShareInstance(){
        let singleton = new YFWBackStack();
        return singleton;
    }

    initListFromLocalStorage() {
        getItem(kBackStack).then((info)=>{
            this.hasReadCache = true
            if (isNotEmpty(info) && info != 'errro') {
                this.lastVC = info
            }
        })
    }

    cacheListToLocalStorage() {
        if (this.lastVC) {
            let currentDateTimestamp = new Date().getTime()
            this.lastVC.timestamp = currentDateTimestamp//存储当前时间戳
            if (this.lastVC.params) {//预防回调崩溃 Object.prototype.toString.call(()=>{}) [object Function]
                this.lastVC.params = this.analyticalObj(this.lastVC.params,true)
                if(this.lastVC.params.gobackKey) { this.lastVC.params.gobackKey = null }
                if(this.lastVC.params.goBackKey) { this.lastVC.params.goBackKey = null }
            }
        }
        console.log('cache last vc',this.lastVC)
        setItem(kBackStack,this.lastVC)
    }

    clearLastVC() {
        this.lastVC = null
        console.log('clear last vc',this.lastVC)
    }

    setLastVC(key,params) {
        if (isEmpty(key)) {
            return
        }
        this.lastVC = {
            name: key,
            params: deepCopyObj(params)
        }
        console.log('set last vc',this.lastVC)
    }

    getLastVC() {
        return new Promise((resolve,reject)=>{
            if (this.lastVC) {
                this._dealLastVC(resolve,reject)
            } else if (!this.hasReadCache) {
                getItem(kBackStack).then((info)=>{
                    this.hasReadCache = true
                    if (isNotEmpty(info) && info != 'errro') {
                        this.lastVC = info
                        this._dealLastVC(resolve,reject)
                    } else {
                        reject()
                    }
                })
            } else {
                reject()
            }
        })
        
    }

    _dealLastVC(resolve,reject) {
        if (this.lastVC.params) {//预防回调崩溃
            this.lastVC.params = this.analyticalObj(this.lastVC.params,false)
        }
        console.log('get last vc',this.lastVC)
        // resolve ({
        //     isNeedAlert:false,
        //     type:this.lastVC.name,
        //     ...this.lastVC.params
        // })
        // return
        let currentDateTimestamp = new Date().getTime()
        let lastTimestamp = parseInt(this.lastVC.timestamp)
        if (!isNaN(lastTimestamp)) {
            if ( currentDateTimestamp > lastTimestamp && currentDateTimestamp <= lastTimestamp + 2*60*1000) {//两分钟之内
                resolve ({
                            isNeedAlert:false,
                            type:this.lastVC.name,
                            ...this.lastVC.params
                        })
            } else if (currentDateTimestamp > lastTimestamp + 2*60*1000 && currentDateTimestamp <= lastTimestamp + 5*60*1000) {//2到5分钟
                resolve ({
                    isNeedAlert:true,
                    type:this.lastVC.name,
                    ...this.lastVC.params
                })
            } else {
                this.lastVC = null
                this.cacheListToLocalStorage()
                reject()
            }
        } else {
            reject()
        }
    }
    
    /**
     *  function => 特殊字符串 => function
     *  原因：function 类型不能通过storage存储，通过转换成特殊字符，后期使用再转换成空function
     * @param {*} res
     * @param {*} isEncoding 是否正转（function => 特殊字符）
     * @returns
     * @memberof YFWBackStack
     */
    analyticalObj(res,isEncoding) {
        try {
            let type = Object.prototype.toString.call(res);
            if (type === '[object Object]') {
                res = this.analyticalMap(res,isEncoding);
            } else if (type === '[object Array]'){
                res = this.analyticalArray(res,isEncoding);
            } else if (!isEncoding && type === '[object String]'){
                res = this.analyticalStr(res);
            } else if (isEncoding && type === '[object Function]') {
                res = this.analyticalFunction(res);
            }
        } catch (e) {
        } finally {
            return res
        }
    }
    analyticalMap(object,isEncoding){
        try {
            for (let key of Object.keys(object)) {
                let value = object[key];
                object[key] = this.analyticalObj(value,isEncoding)
            }
        } catch (e) {
        } finally {
            return object
        }
    }
    analyticalArray(array,isEncoding){
        try {
            for (let i = 0 ; i < array.length ; i++){
                let object = array[i];
                array[i] = this.analyticalObj(object,isEncoding)
            }
        } catch (e) {
        } finally {
            return array
        }
    }
    analyticalStr(value){
        if (value == kFunctionKey) {
            value = () => {}
        }
        return value
    }
    analyticalFunction(value){
        value = kFunctionKey
        return value
    }

}