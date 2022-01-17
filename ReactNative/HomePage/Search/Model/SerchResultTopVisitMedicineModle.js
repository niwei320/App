
import YFWMedicineInfoModel from '../../../FindYao/Model/YFWMedicineInfoModel';

export default class SerchResultTopVisitMedicineModle {
    
    static getModelArray(array) {

        if (array == undefined) return [];

        let marray = [];
        array.forEach((item, index) => {
            item.price = item.price_min
            item.shopCount = item.store_num
            let model = new YFWMedicineInfoModel();
            marray.push(model.setModelData(item));
        });

        return marray;

    }
}
