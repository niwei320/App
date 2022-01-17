import {isNotEmpty, safe} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWOTOAddressModel {

    constructor(props){

        this.name = '';
        this.mobile = '';
        this.address = '';
        this.address_name = ''
        this.dict_bool_default = '';
        this.province = '';
        this.city = '';
        this.area = '';
        this.street_name = '';
        this.region_id = '';
        this.id = '';
        this.address_label = ''
        this.distance = ''
        this.isChaoThree = ''
        this.location_address = ''
    }

    setModelData(data){

        if (isNotEmpty(data)) {

            this.id = data.id;
            this.region_id = data.regionid;
            this.name = data.name;
            this.mobile = data.mobile;
            this.address_name = data.address_name
            this.location_address = data.location_address
            this.dict_bool_default = data.dict_bool_default;
            this.isChaoThree = data.isChaoThree
            this.distance = data.distance
            this.province = safe(data.province)==safe(data.city)?'':safe(data.city)
            this.city = data.city;
            this.area = data.area;
            this.address_label = data.address_label
            this.lat = isNotEmpty(data.lat)?data.lat:'31.23224';//没有经纬度数据设置为上海市政府坐标
            this.lng = isNotEmpty(data.lng)?data.lng:'121.46902';
            this.address = safe(this.province) + safe(this.city) + safe(this.area) + safe(this.location_address)
        }

        return this;

    }


    static getModel(item){
        let model = new YFWOTOAddressModel();
        return model.setModelData(item)
    }


}