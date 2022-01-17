import YFWWDBaseModel from '../../Base/YFWWDBaseModel'

export class LoginModel extends YFWWDBaseModel{ 
    constructor() {
        super()
        this.account = ''
        this.pwd = ''
    }
    /**
     * 
     * @param {用户名} account 
     * @param {密码} pwd 
     */
    static initWithParams(account,pwd){
        let instance = new LoginModel();
        instance.account = account;
        instance.pwd = pwd
        return instance;
    }

}