package com.yaofangwang.mall.net;

import com.google.gson.Gson;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Created by marti on 2019/1/3.
 */

public class Utils {
    /**
     * 对数据签名
     * @param md5FeatureCode
     * @param bytes
     * @param secretBytes
     * @return
     */
    public static byte[] getSignData(byte[] md5FeatureCode, byte[] bytes, byte[] secretBytes) {
        ByteArrayOutputStream bts = new ByteArrayOutputStream();
        try {
            bts.write(md5FeatureCode);
            bts.write(bytes);
            bts.write(secretBytes);
            bts.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        byte[] bytes1 = bts.toByteArray();
        return hashBytes(bytes1);
    }

    /**
     * Map转字节
     * @param mHashMap
     * @return
     */
    public static byte[] mapToByte(Map<String, Object> mHashMap) {
        ByteArrayOutputStream bts = new ByteArrayOutputStream();
        int size = mHashMap.size();
        byte[] count = ByteBuffer.allocate(4).putInt(size).array();
        try {
            bts.write(count);
            Iterator<Map.Entry<String, Object>> iterator = mHashMap.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry<String, Object> next = iterator.next();
                String key = next.getKey();
                Object value = next.getValue();
                String s = "";
                if (!key.startsWith("__")) {
                    s = new Gson().toJson(value);
                } else {
                    s = (String) value;
                }
                byte[] keyBy = key.getBytes();
                byte[] keyCountByte = ByteBuffer.allocate(4).putInt(keyBy.length).array();
                byte[] valueBy = s.getBytes();
                byte[] valueCountByte = ByteBuffer.allocate(4).putInt(valueBy.length).array();
                bts.write(keyCountByte);
                bts.write(keyBy);
                bts.write(valueCountByte);
                bts.write(valueBy);
            }
            bts.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        byte[] bytes = bts.toByteArray();
        return bytes;
    }

    /**
     * MD5校验字节
     * @param bts
     * @return
     */
    public static byte[] hashBytes(byte[] bts) {
        if (bts == null || bts.length == 0) return null;
        byte[] s = null;
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(bts);
            s = md.digest();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return s;
    }

    /**
     * 生成JSON
     * @param code
     * @param msg
     * @return
     */
    public static String jsonByMap(int code ,String msg){
        Map map = new HashMap();
        map.put("code",code);
        map.put("msg",msg);
        JSONObject json =new JSONObject(map);
        return json.toString();
    }
}
