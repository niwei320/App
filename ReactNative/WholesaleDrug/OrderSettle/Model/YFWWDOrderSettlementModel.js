import {
    isNotEmpty,
    safe,
    safeObj,
    extractDateToYMD,
    isEmpty, safeArray
} from '../../../PublicModule/Util/YFWPublicFunction';

export default class YFWWDOrderSettlementModel {

    constructor(props) {

    }

    setModelData(data) {

        let shopmedicine = [];
        let medicate_item = {}
        let is_first_order = false

        if (isNotEmpty(data)) {

            data.result.list.forEach((item, index) => {
                let medicine = [];
                if(item.is_first_order){
                    is_first_order = true
                }
                if (isNotEmpty(item.medicine_list)) {
                    item.medicine_list.forEach((medicineitem, index) => {
                        medicine.push(
                            {
                                id: medicineitem.id,
                                shop_goods_id: medicineitem.store_medicineid,
                                title: medicineitem.medicine_name,
                                standard: medicineitem.standard,
                                img_url: medicineitem.intro_image,
                                prescription: medicineitem.prescription,
                                price: medicineitem.price_real,
                                price_old: medicineitem.price,
                                discount: medicineitem.price_desc,
                                quantity: medicineitem.amount,
                                package_id: '0',
                                type: 'medicine',
                                period_to: extractDateToYMD(medicineitem.period_to),
                                PrescriptionType: this.convertPrescriptionType(medicineitem.dict_medicine_type),//单双轨 '1'='单轨' '2'=双轨
                            });
                    });
                }

                if (isNotEmpty(item.packmedicine_list)) {
                    item.packmedicine_list.forEach((packmedicine, index) => {
                        let packmedicine1 = [];
                        if (isNotEmpty(packmedicine.medicine_list)) {

                            packmedicine.medicine_list.forEach((medicine1, index1) => {
                                packmedicine1.push(
                                    {
                                        id: medicine1.id,
                                        shop_goods_id: medicine1.store_medicineid,
                                        title: medicine1.medicine_name,
                                        standard: medicine1.standard,
                                        img_url: medicine1.intro_image,
                                        prescription: medicine1.prescription,
                                        price: medicine1.price,
                                        quantity: medicine1.amount,
                                        reserve: medicine1.reserve,
                                        lbuy_no: '0',
                                        order_no: '0',
                                        package_id: '0',
                                        period_to: extractDateToYMD(medicine1.period_to),
                                        PrescriptionType: this.convertPrescriptionType(medicine1.dict_medicine_type + '')
                                    }
                                );
                            })
                            medicine.push(
                                {
                                    package_id: packmedicine.packageid,
                                    package_name: packmedicine.smp_name,
                                    price: packmedicine.smp_price,
                                    price_old: packmedicine.smp_price,
                                    discount: packmedicine.price_desc,
                                    count: packmedicine.amount,
                                    type: "package",
                                    package_medicines: packmedicine1,
                                    package_type: packmedicine.package_type,
                                }
                            );

                        }

                    });
                }

                let logistic = [];
                if (isNotEmpty(item.logistcs_list)) {
                    item.logistcs_list.forEach((item, index) => {
                        logistic.push({
                            id: item.id,
                            name: item.name,
                            cod: "0",
                            price: item.price,
                            desc: item.show_name
                        })
                    });
                }

                let packagelist = [];
                if (isNotEmpty(item.package_list)) {
                    item.package_list.forEach((item, index) => {
                        packagelist.push({
                            id: item.id,
                            name: item.name,
                            desc: item.show_name,
                            price: item.price
                        })
                    });
                }


                let coupon_items = [];
                if (isNotEmpty(item.coupons_list)) {
                    item.coupons_list.forEach((item, index) => {
                        coupon_items.push({
                            name: item.name,
                            money: item.price,
                            id: item.id,
                            expire_time: this._checkTimeStyle(safe(item.expire_time)),
                            start_time: this._checkTimeStyle(safe(item.start_time)),
                            coupon_des: item.use_condition_price_desc,
                            dict_coupons_type: item.dict_coupons_type // 1.店铺 2.单品
                        });
                    });
                    if (item.coupons_list.length > 0) {
                        coupon_items.push({
                            name: '不使用优惠券',
                            coupon_des: '不使用优惠券',
                            money: '0',
                            id: ''
                        });
                    }
                }
                // 1 纸质  2 电子
                let invoice_types = []
                if (isNotEmpty(item.invoice_types)) {
                    invoice_types = String(item.invoice_types).split(',')
                }
                if (isEmpty(invoice_types) || safeArray(invoice_types).length === 0 ) {
                    invoice_types = ['1']
                }
                invoice_types = invoice_types.sort((a,b)=>{
                    return  parseInt(b) - parseInt(a)
                })
                shopmedicine.push({
                    shop_id: item.storeid,
                    shop_title: item.title,
                    store_medicine_count:item.store_medicine_count,
                    store_medicine_count_total:item.store_medicine_count_total,
                    store_medicine_price_total:item.store_medicine_price_total,
                    order_desc: '',
                    cart_items: medicine,
                    package_items: packagelist,
                    coupon_items: coupon_items,
                    invoice_types:invoice_types,
                    shop_offers_price: String(item.activity_item),
                    logistic_items: logistic,
                    packedup: safeObj(safeObj(item.shippingAndpackedup).packedup),
                    sellershipping: safeObj(safeObj(item.shippingAndpackedup).sellershipping),
                    payment_items: item.payment_list,
                    discount: safe(item.return_price_total)
                });


            });

            if (isNotEmpty(safeObj(data.result).medicate_item)) {
                medicate_item = {
                    medicate_name: data.result.medicate_item.medicate_name,
                    medicate_sex: isNotEmpty(data.result.medicate_item.medicate_sex) ? (data.result.medicate_item.medicate_sex + '' === "1" ? '男' : "女") : '',
                    medicate_idcard: data.result.medicate_item.medicate_idcard,
                }
            }
        }

        let platform_coupon_list = [];
        data.result.platform_coupon_list.forEach((value) => {

            let platform_coupon_list_obj = {
                id: safe(value.id),
                money: safe(value.price),
                name: safe(value.name),
                start_time: safe(value.start_time),
                expire_time: safe(value.expire_time),
                coupon_des: safe(value.use_condition_price_desc),
                dict_coupons_type: safe(value.dict_coupons_type)
            };

            platform_coupon_list.push(platform_coupon_list_obj);
        });



        return {
            code: '1',
            shop_items: shopmedicine,
            platform_coupons_items: platform_coupon_list,
            compliance_prompt: data.result.compliance_prompt,
            invoice_name: safe(safeObj(data.result.invoice_info).company_name),//抬头
            invoice_code: safe(safeObj(data.result.invoice_info).tax_no),//税号
            invoice_bank_name:safe(safeObj(data.result.invoice_info).bank_name), //开户行
            invoice_register_phone:safe(safeObj(data.result.invoice_info).register_phone), //注册电话
            invoice_bank_no:safe(safeObj(data.result.invoice_info).bank_no), //银行号
            invoice_register_address:safe(safeObj(data.result.invoice_info).register_address), //注册地址
            rx_img_items: [],
            medicate_info_show: data.result.medicate_info_show,//是否显示用药人信息 'true' = 显示 'false' = 不显示
            medicate_info_type: data.result.medicate_info_type,//电子处方信息 1:登记用药人（现有）2:电子处方模式3:都不要
            medicate_item: medicate_item,//用药人信息
            is_certificate_upload: (String(data.result.is_certificate_upload) == 'true'),//复诊记录 必传？？
            rx_mode: data.result.rx_mode,//电子处方模式  1、只支持电子处方  2、只支持已有处方  其他 不控制（电子处方&已有处方都可以）
            balance: data.result.balance,
            balance_prompt: data.result.balance_prompt,
            use_ratio: data.result.use_ratio,
            user_point: data.result.user_point,
            drug_items: data.result.drug_items,
            inquiry_rx_images: data.result.inquiry_rx_images,
            disease_items: data.result.disease_items,
            rx_cid_items: data.result.rx_cid_items,
            inquiry_original_price: isNotEmpty(data.result.inquiry_yh_price) ? data.result.inquiry_yh_price : 0,
            inquiry_real_price: isNotEmpty(data.result.inquiry_price) ? data.result.inquiry_price : 0,
            inquiry_price_explain: isNotEmpty(data.result.inquiry_price_explain) ? data.result.inquiry_price_explain : '活动期间平台补贴',
            disease_xz_count: data.result.disease_xz_count,
            is_first_order: is_first_order,//店铺首单
        };
    }

    /**
     * 处方、单双轨字段转换
     * @param type
     */
    convertPrescriptionType(type) {
        if (type + '' === '3') {
            return '1'//单轨
        }
        //TCP 和HTTP 双轨都是2
        return type + ""
    }

    _checkTimeStyle(time) {
        while (time.indexOf('-') > 0) {
            time = time.replace('-', '.')
        }

        return time
    }

    static getModelValue(array) {
        let model = new YFWWDOrderSettlementModel();
        let ModeData = model.setModelData(array)
        return ModeData;

    }


}
