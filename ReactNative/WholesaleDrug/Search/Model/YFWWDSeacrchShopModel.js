
import {isNotEmpty} from '../../../PublicModule/Util/YFWPublicFunction'


export default class YFWWDSeacrchShopModel{
    constructor(props) {
    }

    setModelData(data) {
        if (isNotEmpty(data)) {
            let dataArray = [];
            data.forEach((item,index)=>{
                dataArray.push(
                    {
                        logo_img_url:item.logo_image,
                        title:item.title,
                        star:item.evaluation_star_sum,
                        distance:item.distance+'km',
                        id:item.id,
                        goods_items: item.goods_items,
                    }
                );
            });
            return dataArray;
        }
    }

    static getModelArray(array) {
        if (array == undefined) return [];

        let model = new YFWWDSeacrchShopModel();
        let ModeData =  model.setModelData(array);
        return ModeData;

    }
}
