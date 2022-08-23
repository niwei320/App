package com.yaofangwang.mall.httpNet;

import java.util.HashMap;
import java.util.Map;

/**
 * 用来配置请求的类型
 *
 * @author tim
 */
public class TObjSaveType {
    public static final String FIXED_KEY = "fixed_key_final";
    public static final int SAVA_TYPE_STRING = 0;
    public static final int SAVA_TYPE_OBJECT = 1;
    public static final int REQUEST_TYPE_NORMAL = 0;
    public static final int REQUEST_TYPE_TWICE = -1;
    // public static final int REQUEST_TYPE_LOCAL_WITH_TIME ;
    public static final int REQUEST_TYPE_LOCAL = -2;
    // public static final int REQUEST_TYPE_TIMESTAMP = -3;

    private static final Map<String, Integer> requestMap = new HashMap<>();

    // 将需要配置的方法放在此处,如果是需要设置缓存时间,则可以将第二个参数改为,任意正整数,用来代表,缓存的时间,单位为分钟,例如:
    // requestMap.put(ServiceManager.getString(ServiceConst.FD_COMPANY_INFORMATION_BASE),10);
    static {
        requestMap.put("get_category", REQUEST_TYPE_TWICE);
        requestMap.put("get_index_data",REQUEST_TYPE_TWICE);//更改：首页下拉刷新，需要请求网络，不请求本地
//        requestMap.put("get_search_hot_words", 5);//单位：分钟
        requestMap.put("get_yao_index_data",REQUEST_TYPE_TWICE);
//        requestMap.put("get_top_visit_medicine",REQUEST_TYPE_TWICE);
//        requestMap.put("get_account_center_tip",REQUEST_TYPE_LOCAL);get_cartget_top_visit_medicine
    }

    private static int save_type = SAVA_TYPE_OBJECT;

    public static int getValue(String key) {
        if (!TObjSaveUtils.CACHE_SWITCH) {// /没开缓存返回0
            return 0;
        }

        Integer value = requestMap.get(key);///没有以上key为正常模式
        if (null == value) {
            value = 0;
        }
        switch (value) {
            case REQUEST_TYPE_NORMAL: // 0
                TObjSaveUtils.out("-----正常模式");
                break;
            case REQUEST_TYPE_TWICE: // -1
                TObjSaveUtils.out("-----本地网络双重请求模式");
                break;
            case REQUEST_TYPE_LOCAL:// -2
                TObjSaveUtils.out("-----本地优先请求模式");
                break;
            default:
                TObjSaveUtils.out("-----时间戳本地优先模式");
                break;
        }
        return value;
    }

    public static int getSavetype() {
        return save_type;
    }
}
