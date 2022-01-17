
import { AsyncStorage } from 'react-native';

import {removeItem} from './YFWStorage'
export const kIsShowLaunchViewKey = 'isShowLaunchView';

export const kIsShowPermissionsViewKey = 'isShowPermissionsView';

export const kIsFirstLoadLaunchKey = 'isFirstLoadLaunch';

export const kOpenFullAdData = 'OpenFullAdData';

export const kAccountKey = 'account';
export const kWDAccountKey = 'wd_account';

export const kTcpSsidKey = 'tcpSsid';

export const kSearchHistoryKey = 'searchHistory';

export const kO2OSearchHistoryKey = 'O2OsearchHistory'

export const kO2OStoreSearchHistoryKey = 'O2OStoreSearchHistory'

export const OpenPrivacyPolicy = 'OpenPrivacyPolicy';

export const HomePageCacheData = 'HomePageCacheData';

export const HomeSelectCacheData = 'HomeSelectCacheData';

export const FindYaoPageCacheData = 'FindYaoPageCacheData';

export const FindYaoNearCacheData = 'FindYaoNearCacheData';

export const ChooseAddressProvinceData = 'ChooseAddressProvinceData';

export const WeekNumber = 'WeekNumber';
export const WeekDatas = 'WeekDatas';

//评论弹框三个key,逻辑废弃
export const ISAppEvaluation = 'ISAppEvaluation';
export const AppEvaluationStartTime = 'AppEvaluationStartTime';
export const AppEvaluationActionShow = 'AppEvaluationActionShow';

//评论弹框新key值
export const NeverOpenEvaluation = 'NeverOpenEvaluation';
export const ThisOpenEvaluation = 'ThisOpenEvaluation';
export const ThisOpenEvaluationVersion = 'ThisOpenEvaluationVersion';

export const LOGIN_TOKEN = 'LOGIN_TOKEN';

export const YFWNotificationData = 'YFWNotificationData';

// //手动设置地址经纬度信息
// export const YFWLocationManualData = 'YFWLocationManualData';

//上一次打开应用的日期year-month-day
export const kLastDateLaunchApp = 'LastDateLaunchApp'

//是否不再显示确认收货抽奖弹框
export const KIsShowReceiptLottery = 'ShowReceiptLottery'

//最新支付订单号
export const kLastPayOrderNo = 'kLastPayOrderNo'

//O2O城市选择页,列表数据缓存
export const kO2OCityListCacheData = 'kO2OCityListCacheData'
//O2O城市选择页,历史搜索缓存
export const kO2OCitySearchHistoryKeyword = 'kO2OCitySearchHistoryKeyword'
//O2O自提用药安全提示
export const kO2OSafetyTipsForSelfFetch = 'kO2OSafetyTipsForSelfFetch'

/**
 * 获取存储的数据
 * @param {*} key
 */
exports.getItem = async (key) => {
    try {
        let item = await AsyncStorage.getItem(key);
        if (!item) {
            return null;
        }
        return JSON.parse(item).v || null;
    } catch (error) {
        return 'error';
    }
}

/**
 * 存入数据
 * @param {*} key
 * @param {*} value
 */
exports.setItem = (key, value) => AsyncStorage.setItem(key, JSON.stringify({
    v: value
}));



/**
 * 删除已经存在的数据
 * @param {*} key
 */
exports.removeItem = (key) => AsyncStorage.removeItem(key);



/**
 * 清除所有键值（包括三方库用AsyncStorage存储的值）慎用！
 */
exports.clear = () => AsyncStorage.clear();


/**
 * 清除所有用户相关的键值
 */
exports.clearUserInfo = () => {
    removeItem(kAccountKey);
    removeItem(kTcpSsidKey);
    removeItem(kSearchHistoryKey);
    removeItem(LOGIN_TOKEN);
    removeItem(kO2OSearchHistoryKey);
    // removeItem(kO2OStoreSearchHistoryKey);
}


/**
 * 获取所有的key
 */
exports.getAllKeys = () => AsyncStorage.getAllKeys();




