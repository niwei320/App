import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
class YFWO2OSearchAPI {
    static getSearchMedcine(keywords, pageIndex, from, first = false) {
        let paramMap = new Map(); //搜索结果和分类结果为统一接口
        paramMap.set('__cmd', 'guest.o2o.medicine.getSearchMedcine');
        if (from == 'category')
            paramMap.set('categoryid', keywords);
        else
            paramMap.set('keywords', keywords);
        paramMap.set('pageIndex', pageIndex);
        paramMap.set('pageSize', 10);
        return YFWRequest(paramMap, first)
    }
    static getKeyWordRelative(keyWords) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getAssociateKeywords');
        paramMap.set('keyword', keyWords);
        paramMap.set('limit', '20');
        paramMap.set('type', 'medicine');
        return YFWRequest(paramMap)
    }
    static getHotWordsData() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.sitemap.getHotKeywords');
        paramMap.set('limit', 10);
        return YFWRequest(paramMap)
    }
}
export function YFWRequest(paramMap = new Map(), showLoad = false) {
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
export {
    YFWO2OSearchAPI,
}