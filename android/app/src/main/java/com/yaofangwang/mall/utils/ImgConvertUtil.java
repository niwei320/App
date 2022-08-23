package com.yaofangwang.mall.utils;

import android.content.SharedPreferences;
import android.text.TextUtils;

import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainApplication;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

/**
 * Created by marti on 2018/12/3.
 */

public class ImgConvertUtil {

    public static String convertJSON(String json) {
        try {
            JSONObject objJSON = new JSONObject(json);
            json = convertObj(objJSON).toString();
        } catch (JSONException e) {
            e.printStackTrace();
        } finally {
            return json;
        }
    }

    public static JSONObject convertObj(JSONObject obj) {
        try {
            Iterator<String> keys = obj.keys();
            for (Iterator it = keys; keys.hasNext(); ) {
                String key = (String) it.next();
                Object value = obj.opt(key);
                if (value instanceof JSONObject) {
                    obj.putOpt(key, convertObj((JSONObject) value));
                } else if (value instanceof JSONArray) {
                    obj.putOpt(key, convertArray((JSONArray) value));
                } else if (value instanceof String) {
                    String img = convertImg((String) value);
                    obj.putOpt(key, img);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        } finally {
            return obj;
        }
    }

    public static JSONArray convertArray(JSONArray array) {
        try {
            for (int i = 0; i < array.length(); i++) {
                Object value = array.opt(i);
                if (value instanceof JSONObject) {
                    array.put(i, convertObj((JSONObject) value));
                } else if (value instanceof JSONArray) {
                    array.put(i, convertArray((JSONArray) value));
                } else if (value instanceof String) {
                    String img = convertImg((String) value);
                    array.put(i, img);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        } finally {
            return array;
        }
    }

    private final static String IMGS = ".+(.JPEG|.jpeg|.JPG|.jpg|.png|.gif|.webp|.svg)$";

    public static String convertImg(String img) {

        if (img.matches(IMGS) && img.contains("default")) {
            img = imgHander(img);
            return img;
        }
        if (!TextUtils.isEmpty(img) && img.matches(IMGS)) {
            if(img.startsWith("http://c1.yaofangwang.net")){
                return img;
            }
            if (img.contains("yaofangwang") && img.startsWith("https")) {

                img = img.replaceFirst("https", "http");

            } else if (img.startsWith("file://")) {

                img = img.replaceFirst("file://", "");
                img = imgHander(img);
            } else {
                img = imgHander(img);
            }
        }
        return img;
    }

    private static String imgHander(String img) {
        SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MainApplication.getInstance().MODE_PRIVATE);
        String cdn = sharedPreferences.getString("CDN_URL", "//c1.yaofangwang.net");

        if (img.startsWith("/")) {
            img = "http:" + cdn + img;
        } else {
            img = "http:" + cdn + "/" + img;
        }
        return img;
    }
}
