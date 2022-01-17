import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";

export class YFWOTOMedicineDetailAPI {
    static getMedcineDetail(storeMedicineId) {
        let paramMap = new Map(); //搜索结果和分类结果为统一接口
        paramMap.set('__cmd', 'guest.shopMedicine.getStoreMedicineDetailO2O as detail,guest.common.app.getAPPBannerBottom as zzImage');
        paramMap.set('detail', {
            store_medicine_id: storeMedicineId,
            user_region_id:YFWUserInfoManager.ShareInstance().getRegionId(),
            user_city_name:YFWUserInfoManager.ShareInstance().getAddress()
        });
        return YFWRequest(paramMap)
    }
}

function YFWRequest(paramMap = new Map(), showLoad = false) {
    return new Promise(function (resolve, reject) {
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            console.log('请求参数', paramMap, '\n请求成功', res);
            resolve(res);
        }, (error) => {
            console.log('请求参数', paramMap, '\n请求失败', error);
            reject(error);
        }, showLoad);
    });
}