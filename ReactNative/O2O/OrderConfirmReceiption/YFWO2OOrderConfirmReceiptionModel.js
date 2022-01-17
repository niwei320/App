import { tcpImage, } from '../../PublicModule/Util/YFWPublicFunction'
export default class YFWO2OOrderConfirmReceiptionModel {
    static setModelData(data) {
        let array = {}
        let medicineItems = []
        data.maplist && data.maplist.forEach && data.maplist.forEach((medicineItem) => {
            let buffer = {}
            buffer = {
                authorizedCode: medicineItem.authorized_code,//国药准字Z22022905
                medicineName: medicineItem.medicine_name,//''
                introImage: tcpImage(medicineItem.intro_image.split('|')[0]),//"https://c1.yaofangwang.net/common/upload/medicine/170/170346/df27290b-e8c3-48aa-b32b-57a5fa9df2be5998.jpg"
                alias: medicineItem.alias,//'汇康健元'
                nameCN: medicineItem.namecn,//"双氯芬酸钠肠溶片"
                unitPrice: medicineItem.unit_price,//10.00
                qty: medicineItem.qty,//5
                standard: medicineItem.standard,//"25mgx12片x3板/盒"
                dictMedicineType: medicineItem.dict_medicine_type,//-1其他 0OTC 1 2 3RX
                batchinfo: medicineItem.batchinfo,//产品批号组
            }
            medicineItems.push(buffer)
        })
        array = {
            storePhone: data.maplist[0].store_phone,
            medicineItems: medicineItems,
        }
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

export { YFWO2OOrderConfirmReceiptionModel }