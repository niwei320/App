import {isNotEmpty} from "../../../PublicModule/Util/YFWPublicFunction";


export default class ReturnGoodsDetailModel {

    constructor(props) {
        this.order_goods_no = '';
        this.title = '';
        this.img_url = '';
        this.authorized_code = '';
        this.price = '';
        this.quantity = '';
        this.tempQuantity = '';
    }

    setModelData(data) {

        if (isNotEmpty(data)) {
            this.order_goods_no = '';
            this.title = '';
            this.img_url = '';
            this.authorized_code = '';
            this.price = '';
            this.quantity = '';

        }
        return this;

    }

    static getModelArray(array) {

        let marray = [];
        array.forEach((item, index)=> {
            let model = new ReturnGoodsDetailModel();
            marray.push(model.setModelData(item));

        });

        return marray;

    }

}
