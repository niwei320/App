
import {log, logWarm, logErr} from './YFWLog'
import YFWToast from './YFWToast'


//默认的头信息
let headers = {

}

/*
//设置headers 头信息
exports.setHeader = function (name,value) {
    if (!name) return;
    headers[name] = value;
}

//获取头信息
exports.getHeader = function (name,value) {
    if (!name) return "";
    return headers[name] || '';
}
*/

export default class YFWRequest{

    /**
    * 检查返回状态码
    * @param {*} status
    * @param {*} res
    * */
    async _checkStatus(status,res,url){
        if (status !== 200){
            logWarm('请求失败参数', res.text(),url,headers);
            throw new  Error('网络连接失败，请检查网络');
        }

    }

    /**
     * 检查后端返回的状态码
     * @param {*} status
     */
    async _checkAppStatus(json, url) {
        if (json.status != 0) {
            logWarm('返回状态报错', json, url);
            throw new Error(`${json.errorMsg}`);
        }
    }

    /**
     * 内部实现网络请求
     * @param {*} url
     * @param {*} options
     */
    async _request(url, options, type) {
        // url = url.indexOf('http') == 0 ? url : url.indexOf('/api') == 0 ? domain + url : baseUrl + url;
        let res = await fetch(url, options);
        // console.log(res,'fetch res')
        let headers = res.headers['map']
        if (headers && headers['set-cookie']) {
            console.log(headers['set-cookie'],'fetch cookie')
        }
        this._checkStatus(res.status, res, url)

        if (type === 'json') return await this._jsonFactory(res, url, options)
        return await this._txtFactory(res, url, options)

    }
    /**
     * 处理数据
     * @param {*} res
     * @param {*} url
     */
    async _txtFactory(res, url, options) {
        let txt = '';
        try {
            txt = await res.text();
        } catch (e) {
            log('未拿到返回字符串', { url: url, txt: txt });
            throw new Error('数据格式错误');
        }
        log("请求返回", txt, url, options);
        return await txt;
    }

    /**
     * 处理json数据
     * @param {*} res
     * @param {*} url
     */
    async _jsonFactory(res, url, options) {
        let json;
        let txt = '';
        try {
            txt = await res.text();
        } catch (e) {
            log('未拿到返回字符串', { url: url, txt: txt });
            throw new Error('数据格式错误');
        }
        try {
            json = JSON.parse(txt);
        } catch (e) {
            logErr('返回数据格式错误', { url: url, txt: txt });
            throw new Error('数据格式错误');
        }
        // this._checkAppStatus(json, url)
        logWarm("_jsonFactory----------"+json.code);
        log("请求返回", json, url, options);
        return await json;
    }
    /**
     * get html 请求
     * @param {*} url
     */
    async getHtml(url) {
        let myHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain'
        });
        return await this._request(url, {
            method: 'GET',
            headers: myHeaders,
            timeout: 10000
        }, 'txt')
    }
    /**
     * get请求
     * @param {*} url
     */
     async get(url, data) {
        let myHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain'
        });
        return await this._request(url, {
            method: 'GET',
            headers: myHeaders,
            timeout: 10000
        }, 'json')
    }

    /**
     * post请求
     * @param {*} url
     * @param {*} data
     */
    async post(url, data) {
        return this._request(url, {
            method: 'POST',
            headers: Object.assign(headers, { 'Content-Type': 'application/x-www-form-urlencoded' }),
            timeout: 10000
        }, 'json')
    }


}
