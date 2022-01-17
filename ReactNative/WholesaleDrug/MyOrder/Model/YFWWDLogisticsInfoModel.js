export default class YFWWDLogisticsInfoModel{
    constructor(props) {

    }

    setModelData(data){
        return{
            com:data.com,
            condition:data.condition,
            data:data.data,
            ischeck:data.ischeck,
            message:data.message,
            name:data.name,
            nu:data.nu,
            state:data.state,
            web:data.web,
            phone:data.phone,
            num:data.nu,
            state_name:data.state_name,
            trafficno:data.trafficno,
            logo:data.logo
        }
    }
    
    static getModelArray(array){
        
        let model = new YFWWDLogisticsInfoModel();
        let ModeData =  model.setModelData(array)
        return ModeData;

    }
}
