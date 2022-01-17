import YFWWDBaseModel from "../../Base/YFWWDBaseModel";

export default class YFWWDSettingModel extends YFWWDBaseModel{
    constructor() {
        super()
        /**
         *
         * {
                key: 1,
                isShowHeader: true,
                title: '清除图片缓存',
                data: [
                    {
                        key: 1,
                        title: '批发订单验收标准',
                        subtitle: this.state.cacheSize,
                        subImage: require('../../img/good_reputation.png'),
                    },{
                        key: 2,
                        title: '意见建议',
                    },{
                        key: 3,
                        title: '退出登录',
                    }
                ],
            }
         */
        this.pageData = [
            {
                key: 1,
                isShowHeader: false,
                data: [
                    {
                        key: 1,
                        title: '批发订单验收标准',
                    },{
                        key: 2,
                        title: '意见建议',
                    },{
                        key: 4,
                        title: '修改密码',
                    },{
                        key: 3,
                        title: '退出登录',
                    }
                ],
            }

        ]
     }




 }
