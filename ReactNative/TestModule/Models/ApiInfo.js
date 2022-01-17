import { isEmpty, safeArray, safeObj } from "../../PublicModule/Util/YFWPublicFunction"

export default class ApiInfo {
    constructor() {
        this.cmd = ''
        this.cmdCN = ''
        this.requestClass = ''
        this.functionName = ''
        this.paramsMap = new Map()
        this.params = null
        /**
         * paramsFetchRule:参数获取规则数组
         * [{
            cmd: 'person.address.getReceiptAddress',//依赖的接口名
            key: null,//String类型 接口返回数据的子值：res.result[key]；key为非String的时候，返回result自身
            valueType: 'array',//取出的key对应值的数据类型
            valueIndex:0,//Int类型 数组类型对应的取值下标：res.result[key][valueIndex]；非数字代表取整个数组
            valueName:'id',//String类型 取出数组内元素后，再取值的key：res.result[key][valueIndex][valueName];非String代表取整个元素
            },
            {
            cmd: 'person.cart.addCart',
            key: 'cartids',
            valueType: 'array',
            valueIndex: null,
            valueName: null,
            valueDealFunction: (item) => { //取到最终的元素后，进行特殊处理后的返回值赋值给params（参数）；为空则直接把最终元素赋值给params（参数）
                item = safeArray(item)
                return item.join(',')
            }
            }],
        *   */  
        this.paramsFetchRule = null
        this.paramsFetchFunction = (infos,self)=>{
            self = safeObj(self)
            if (!(self.paramsFetchRule && safeArray(self.paramsFetchRule).length > 0)) {
            return
            }
            let apis = safeArray(infos)
            for (let ruleIndex = 0; ruleIndex < self.paramsFetchRule.length; ruleIndex++) {
            let ruleInfo = self.paramsFetchRule[ruleIndex]
            apis.some((apiInfo)=>{
                if (apiInfo.cmd == ruleInfo.cmd) {
                    let result = safeObj(apiInfo.result.result)
                    let obj = this._getValuesFromResultAccordingToRule(ruleInfo,result)
                    safeArray(self.params)[ruleIndex] = obj
                    return true
                }
                return false
            })
            }
            
        }
        this.businessTestParams = null
        this.businessTestParamsFetchRule = null
        this.businessTestParamsFetchFunction =  (infos,self)=>{
            self = safeObj(self)
            if (!(self.businessTestParamsFetchRule && safeArray(self.businessTestParamsFetchRule).length > 0)) {
                return
            }
            let apis = safeArray(infos)
            for (let ruleIndex = 0; ruleIndex < self.businessTestParamsFetchRule.length; ruleIndex++) {
                let ruleInfo = self.businessTestParamsFetchRule[ruleIndex]
                apis.some((apiInfo)=>{
                    if (apiInfo.cmd == ruleInfo.cmd) {
                        let result = safeObj(apiInfo.result.result)
                        let obj = this._getValuesFromResultAccordingToRule(ruleInfo,result)
                        safeArray(self.businessTestParams)[ruleIndex] = obj
                        return true
                    }
                    return false
                })
            }
        }
        this.status = ''
        this.result = ''
        this.hidden = true
        this.dataSource = []
        this.fetchSpendTime = ''
        this.businessTestFunction = null
        this.businessTestScores = []
    }
    
    initWithMap(infoMap){
        infoMap = safeObj(infoMap)
        this.cmd = infoMap.cmd
        this.cmdCN = infoMap.cmdCN
        this.requestClass = infoMap.requestClass
        this.functionName = infoMap.functionName
        this.params = infoMap.params
        this.paramsFetchFunction = infoMap.paramsFetchFunction || this.paramsFetchFunction
        this.paramsFetchRule = infoMap.paramsFetchRule
        this.businessTestFunction = infoMap.businessTestFunction
        this.businessTestParams = infoMap.businessTestParams
        this.businessTestParamsFetchRule = infoMap.businessTestParamsFetchRule
        this.businessTestParamsFetchFunction = infoMap.businessTestParamsFetchFunction || this.businessTestParamsFetchFunction
        return this
    }

    _getValuesFromResultAccordingToRule(ruleInfo,result) {
        if (ruleInfo.valueType == 'array') {
            let list = []
            if (ruleInfo.key && Object.prototype.toString.call(ruleInfo.key) === '[object String]') {
                list = safeArray(result[ruleInfo.key])
            } else {
                list = safeArray(result)
            }
            let item = null
            if (list.length > 0) {
                if (isEmpty(ruleInfo.valueIndex) || isNaN(parseInt(ruleInfo.valueIndex))) {
                    item = list
                } else {
                    let index = parseInt(ruleInfo.valueIndex)
                    if (ruleInfo.valueIndex < 0 || ruleInfo.valueIndex >= list.length) {
                    index = 0
                    }
                    item = list[index]
                    if (ruleInfo.valueName && Object.prototype.toString.call(ruleInfo.valueName) === '[object String]') {
                    item = item[ruleInfo.valueName]
                    }
                }
                if (ruleInfo.valueDealFunction && Object.prototype.toString.call(ruleInfo.valueDealFunction) === '[object Function]') {
                    item = ruleInfo.valueDealFunction(item)
                }
            }
            return item
        } else if (ruleInfo.valueType == 'object') {
            let obj = ''
            if (ruleInfo.key && Object.prototype.toString.call(ruleInfo.key) === '[object String]') {
                obj = safeObj(result[ruleInfo.key])
            } else {
                obj = safeObj(result)
            }
            if (ruleInfo.valueDealFunction && Object.prototype.toString.call(ruleInfo.valueDealFunction) === '[object Function]') {
                obj = ruleInfo.valueDealFunction(obj)
            }
            return obj
        }
        return null
    }
}