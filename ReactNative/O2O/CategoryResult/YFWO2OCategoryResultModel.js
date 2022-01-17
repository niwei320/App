import {  tcpImage,} from '../../PublicModule/Util/YFWPublicFunction'
export default class YFWO2OCategoryResultModel {
    static setModelData(data) {
        let array = []
        data.dataList && data.dataList.forEach && data.dataList.forEach((item) => {
            let medicineItems = []
            item.medicine_items && item.medicine_items.forEach && item.medicine_items.forEach((medicineItem) => {
                let buffer = {}
                buffer = {
                    aliasCN: medicineItem.aliascn,//''
                    introImage: tcpImage(medicineItem.intro_image.split('|')[0]),//"https://c1.yaofangwang.net/common/upload/medicine/170/170346/df27290b-e8c3-48aa-b32b-57a5fa9df2be5998.jpg"
                    medicineId: medicineItem.medicineid,//170346
                    nameCN: medicineItem.namecn,//"双氯芬酸钠肠溶片"
                    realPrice: medicineItem.real_price,//10
                    reserve: medicineItem.reserve,//5
                    standard: medicineItem.standard,//"25mgx12片x3板/盒"
                    storeMedicineid: medicineItem.store_medicineid,//23665001
                    storeId: medicineItem.storeid,// 340833
                    trocheType: medicineItem.troche_type,// "片剂"
                }
                medicineItems.push(buffer)
            })
            array.push({
                address: item.address,// "山东省淄博市周村区北郊镇东崖村村北"
                distance: item.distance,// "91m"
                logisticsPrice: item.logistics_price,// 5
                logoImage: item.logo_image,// "https://c1.yaofangwang.net/common/upload/shopimage/340/340833/8e9d13e9-50df-406b-9f46-3bbddfc94ccb5920.jpg"
                medicineItems: medicineItems,
                sale_count: item.sale_count,// 0
                shopAvgLevel: this.fomatFloat(item.shop_avg_level, 1),// 4.803
                startingPrice: item.starting_price,// 0
                storeTitle: item.store_title,// "淄博鑫玉医药有限公司"
                storeId: item.storeid,// 340833 
                ifMore:medicineItems.length>=4?true:false
            })
        });
        return array
    }
    static fomatFloat = function (value, n) {
        var f = Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            s += '.';
        }
        for (var i = s.length - s.indexOf('.'); i <= n; i++) {
            s += "0";
        }
        return s;
    }
}

export { YFWO2OCategoryResultModel }