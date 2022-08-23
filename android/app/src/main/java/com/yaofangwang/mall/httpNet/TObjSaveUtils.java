package com.yaofangwang.mall.httpNet;

import android.content.Context;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.security.MessageDigest;
import java.util.Map;

public class TObjSaveUtils {
    /**
     * 缓存开关控制器:
     */
    public static final boolean CACHE_SWITCH = true;// 缓存开关
    public static final boolean ISDEUBG = true;

    public static void out(Object obj) {
        if (!ISDEUBG) {
            return;
        }
    }

    static final String OBJ_SAVE_DIR_NAME = "cacheFile";

    public static String MD5(String content) {
        char hexDigits[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};
        try {
            byte[] strTemp = content.getBytes();
            MessageDigest mdTemp = MessageDigest.getInstance("MD5");
            mdTemp.update(strTemp);
            byte[] md = mdTemp.digest();
            int j = md.length;
            char str[] = new char[j * 2];
            int k = 0;
            for (int i = 0; i < j; i++) {
                byte byte0 = md[i];
                str[k++] = hexDigits[byte0 >>> 4 & 0xf];
                str[k++] = hexDigits[byte0 & 0xf];
            }
            return new String(str);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 根据规则生成一个key,如果key已经存在,那么直接使用 fixedkey;
     *
     * @param url
     * @param params
     * @param fixedKey 固定的key
     * @return 如果fixedKey不为空, 则返回fixedKey ,否则返回 url 与 params 拼接的字符串的MD5值
     */
    public static String getMD5Key(String url, Map<String, String> params, String fixedKey) {
        if (null != fixedKey && fixedKey.length() > 0) {
            return fixedKey;
        } else {
            if (null != params && params.size() > 0) {
                return MD5(url + params.toString());
            } else {
                return MD5(url);
            }
        }
    }

    // /获取请求方式
    public static TObjSaveEntity requestLocal(Context context, String url, Map<String, String> params, String fixedKey) {
        TObjSaveEntity entity = new TObjSaveEntity();
        try {
            int type = TObjSaveType.getValue(params.get("service"));
            String key = null;
            Object result;
            switch (type) {
                case TObjSaveType.REQUEST_TYPE_NORMAL:
                    entity.is_need_request_net = true;
                    entity.is_need_save_result_data = false;
                    break;
                case TObjSaveType.REQUEST_TYPE_LOCAL:
                    key = getMD5Key(url, params, fixedKey);
                    if (entity.mSaveType == TObjSaveType.SAVA_TYPE_STRING) {
                        result = getCacheString(context, key);
                    } else {
                        result = getObjectInCache(context, key);
                    }

                    if (null != result) {
                        entity.cacheData = result;
                        entity.is_need_request_net = false;
                        entity.is_need_save_result_data = true;
                    } else {
                        entity.is_need_request_net = true;
                        entity.is_need_save_result_data = true;
                    }
                    break;
                case TObjSaveType.REQUEST_TYPE_TWICE:
                    key = getMD5Key(url, params, fixedKey);
                    if (entity.mSaveType == TObjSaveType.SAVA_TYPE_STRING) {
                        result = getCacheString(context, key);
                    } else {
                        result = getObjectInCache(context, key);
                    }
                    if (null != result) {
                        entity.cacheData = result;
                        entity.is_need_request_net = true;
                        entity.is_need_judge_result_data = true;
                        entity.is_need_save_result_data = true;
                    } else {
                        entity.is_need_request_net = true;
                        entity.is_need_judge_result_data = false;
                        entity.is_need_save_result_data = true;
                    }
                    break;
                default:
                    if (type > 0) {// 表示为时间戳类型请求
                        final long supportIntervalSecond = type * 60;
                        key = getMD5Key(url, params, fixedKey);
                        if (entity.mSaveType == TObjSaveType.SAVA_TYPE_STRING) {
                            result = getCacheString(context, key);
                        } else {
                            result = getObjectInCache(context, key);
                        }
                        if (null != result) {// 如果本地存在缓存
                            entity.cacheData = result;
                            entity.cacheTimeSecond = getCacheFileChangeTime(context, key) / 1000;// 那么获取缓存时间
                            long nowTime = System.currentTimeMillis() / 1000;// 现在时间转换为秒钟
                            long intervalSecond = nowTime - entity.cacheTimeSecond; // 缓存的时间间隔
                            TObjSaveUtils.out("------时间戳模式:(过期时间，已缓存时间):"+ "(" + supportIntervalSecond + "," + intervalSecond + ")");
                            if (intervalSecond > supportIntervalSecond) {// 如果缓存的时间间隔,大于支持的时间间隔
                                entity.is_need_request_net = true;
                                entity.is_need_save_result_data = true;
                            } else { // 如果缓存的时间间隔小于后者等于支持的时间间隔
                                entity.is_need_request_net = false;// 不需要请求后台接口数据
                                entity.is_need_save_result_data = false;
                            }
                        } else {// 如果本地不存在缓存
                            entity.is_need_request_net = true;// 需要请求
                            entity.is_need_save_result_data = true;// 需要保存结果数据
                        }
                    } else {// 如果为未表示的负数,那么不进行处理,可以直接进行网络请求
                        entity.is_need_request_net = true;
                        entity.is_need_save_result_data = false;
                    }
                    break;
            }
            entity.key = key;
        } catch (Exception e) {
            entity.is_need_request_net = true;
            entity.is_need_save_result_data = false;
        }
        return entity;
    }

    // 文件最后修改的时间
    public static long getCacheFileChangeTime(Context content, String key) {
        long time=0;
        File objFile = new File(content.getCacheDir()+File.separator+OBJ_SAVE_DIR_NAME+File.separator+key);
        if (objFile.exists()){
            time= objFile.lastModified();
        }
        return  time;
    }

    // /获取缓存对象
    public static Object getObjectInCache(Context content, String key) {
        File objDir = new File(content.getCacheDir(), OBJ_SAVE_DIR_NAME);

        FileInputStream fis = null;
        ObjectInputStream ois = null;
        try {
            File objFile = new File(objDir, key);
            if (objFile.exists()) {
                fis = new FileInputStream(objFile);
                ois = new ObjectInputStream(fis);
            } else {
                return null;
            }
            return ois.readObject();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (ois != null) {
                    ois.close();
                }
                if (fis != null) {
                    fis.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    // 保存缓存对象
    public static void saveObjectInCache(Context content, String key, Serializable obj) {
        File objDir = new File(content.getCacheDir(), OBJ_SAVE_DIR_NAME);
        if (!objDir.exists()) {
            objDir.mkdirs();
        }
        ObjectOutputStream oos = null;
        FileOutputStream fout = null;
        try {
            File outFile = new File(objDir, key);
            if (!outFile.exists()) {
                outFile.createNewFile();
            }
            fout = new FileOutputStream(new File(objDir, key));
            oos = new ObjectOutputStream(fout);
            oos.writeObject(obj);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (fout != null) {
                    fout.close();
                }
                if (oos != null) {
                    oos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static void saveCacheString(Context context, String key, String content) {//这个没有用到 用到再改 getCacheFileChangeTime这个只是取的存Object的数据
        BufferedWriter bw = null;
        try {
            File objFile = new File(context.getCacheDir(), key);
            if (!objFile.exists()) {
                objFile.createNewFile();
            }
            bw = new BufferedWriter(new FileWriter(objFile));
            bw.write(content);
            bw.flush();
            bw.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getCacheString(Context activity, String key) {
        BufferedReader br = null;
        StringBuffer sb = new StringBuffer();
        try {
            File objFile = new File(activity.getCacheDir(), key);
            if (objFile.exists()) {
                br = new BufferedReader(new FileReader(objFile));
                String temp = "";
                while (null != (temp = br.readLine())) {
                    sb.append(temp);
                }
            } else {
                return null;
            }
            return sb.toString();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (br != null) {
                    br.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return sb.toString();
    }

}
