package com.yaofangwang.mall.utils;

import android.content.Context;
import android.net.TrafficStats;
import android.text.TextUtils;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.yaofangwang.mall.BuildConfig;
import com.yaofangwang.mall.TUtils.SPUtils;
import com.yaofangwang.mall.net.TcpUtils;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import static android.content.Context.MODE_PRIVATE;

/**
 * Created by marti on 2018/12/1.
 */

public class CarshMsgHandler {

    private static String ERROR_TXT_NAME = BuildConfig.APPLICATION_ID+"_CarshMsg.txt";

    public static void saveMsg(String msg,Context con){
        if(con!=null){
            HashMap<String, Object> map = new HashMap<>();
            //因为即使为空，也要存一个空MapJson进去，不然解析就报错，并且也方便清空数据
            if(!TextUtils.isEmpty(msg)){
                //表示需要上传
                SPUtils.saveHasCarshMsg(true);
                //获取设备信息
                map.put("level","error");
                map.put("os","android");//android
                map.put("osVersion",android.os.Build.VERSION.RELEASE);//设备版本号
                map.put("version",BuildConfig.VERSION_NAME);//APP版本号
                map.put("deviceName",android.os.Build.BRAND);//设备名称
                map.put("networkType", NetUtils.getNetType(con));
                long totalRxBytes = TrafficStats.getTotalRxBytes();//单位kb/s
                if(totalRxBytes>0 && totalRxBytes<= 100){
                    map.put("networkStatus","low");//网络等级
                }else if(totalRxBytes>100 && totalRxBytes<= 500){
                    map.put("networkStatus","standard");//网络等级
                }else if(totalRxBytes>500){
                    map.put("networkStatus","high");//网络等级
                }
                map.put("productName","");//药房网商城
                map.put("message",msg);//
                map.put("exception","");
            }
            writeFile(con,map);
        }
    }

    public static HashMap<String, Object> getMsg(Context con){
        Context app;
        HashMap<String,Object> map = null;
        if(con!=null){
            BufferedInputStream bis=null;
            try {
                bis = new BufferedInputStream(con.openFileInput(ERROR_TXT_NAME));
                StringBuilder sb = new StringBuilder();

                byte[] bys = new byte[1024];
                int len = 0;
                while ((len = bis.read(bys))!=-1){
                    sb.append(new String(bys,0,len));
                }
                if(TextUtils.isEmpty(sb.toString())){
                    map = new HashMap<>();
                }else{
                    map = new Gson().fromJson(sb.toString(),new TypeToken<HashMap<String,Object>>(){}.getType());
                }
            } catch (FileNotFoundException e) {
            } catch (IOException e) {
            } catch (Exception e) {
            } finally {
                if(bis!=null){
                    try {
                        bis.close();
                    } catch (IOException e) {
                    }
                }
                if(map == null){
                    map = new HashMap<>();
                }
                return map;
            }
        }
        return new HashMap<>();
    }

    private static void writeFile(Context con ,HashMap<String,Object> map){
        if(con !=null){
            if(map == null){
                map = new HashMap<>();
            }
            BufferedOutputStream bos = null;
            try {
                FileOutputStream fos = con.openFileOutput(ERROR_TXT_NAME, MODE_PRIVATE);
                bos = new BufferedOutputStream(fos);
                byte[] bytes = new JSONObject(map).toString().getBytes();
                bos.write(bytes,0,bytes.length);
                bos.flush();
            } catch (FileNotFoundException e) {
            } catch (IOException e) {
            }finally {
                if(bos!=null){
                    try {
                        bos.close();
                    } catch (IOException e) {
                    }
                }
            }
        }
    }

    public static void postErrorMsg(final Context con,HashMap<String, Object> map) {
        if(map.size()==0 || !SPUtils.getHasCarshMsg() || !SPUtils.getUploadCrashMsgSwitch()){
            return;
        }
        //报错过滤特定字符串
        String msg = (String) map.get("message");
        ArrayList<String> crashMsgFilter = new ArrayList<>();
        crashMsgFilter.add("com.facebook.react.bridge.NoSuchKeyException: lineNumber");
        crashMsgFilter.add("TypeError: undefined is not an object");
        for(String filter : crashMsgFilter){
            if(msg.contains(filter)){
                SPUtils.saveHasCarshMsg(false);
                writeFile(con,new HashMap<String, Object>());
                return;
            }
        }
        map.put("__cmd","guest.sys.log.add");
        new TcpUtils(con).sendMessage(map, new TcpUtils.OnResponseListener() {
            @Override
            public void onResponse(String s) {
                SPUtils.saveHasCarshMsg(false);
                writeFile(con,new HashMap<String, Object>());
            }

            @Override
            public void onError(String s) {
            }
        });
    }
}
