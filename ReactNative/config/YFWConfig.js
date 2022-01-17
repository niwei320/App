export default class YFWConfig {


    constructor(){
        //上传错误崩溃日志信息
        if (__DEV__) {
            this.uploadErrorLogSwitch = true
        } else {
            this.uploadErrorLogSwitch = true
        }
    }

    static ShareConfig(){

        let singleton = new YFWConfig();
        return singleton;
    }
}