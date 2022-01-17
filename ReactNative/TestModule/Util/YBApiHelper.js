export default class YBApiHelper {

    static fetchDataFromServer(apiInfo) {
        return new Promise(function(resolve, reject) {
            let newData = apiInfo
            newData.status = 'loading'
            let info = newData
            let request = new info.requestClass()
            let params = info.params || []
            request[info.functionName](...params, (res)=>{
                newData.status = 'success'
                newData.result = res
                newData.fetchSpendTime = res.getAllResponseTime
                newData.dataSource = YBApiHelper.dealResultToSub(res)
                resolve(newData)
            },(error)=>{
                newData.status = 'fail'
                let res = error?.msg || {}
                newData.result = res
                newData.dataSource = YBApiHelper.dealResultToSub(res)
                reject(newData)
            })
        })
    }

    static dealResultToSub(result) {
        let maxLength = 200
        let allInfo = JSON.stringify(result,null,2)
        let count = Math.ceil(allInfo.length / maxLength)
        let dataSource = []
        for (let index = 0; index < count; index++) {
            dataSource.push(allInfo.substr(index*maxLength,maxLength))
        }
        return dataSource;
    }
}