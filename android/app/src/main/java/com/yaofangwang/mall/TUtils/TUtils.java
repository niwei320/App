package com.yaofangwang.mall.TUtils;

import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall._BaseActivity;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.lang.ref.WeakReference;
import java.net.URLEncoder;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class TUtils {

    public static final String debug_tag = "debug";

    public static String getSign(Map<String, String> datas) {
        StringBuffer signUrl = new StringBuffer();// 这个是用了 sign的。
        for (String key : datas.keySet()) {
            String signValue = "";
            try {
                signValue = datas.get(key);// 用来sign的不需要编码
            } catch (Exception e) {
                e.printStackTrace();
            }
            signUrl.append(key).append("=").append(signValue).append("&");
        }
        return MD5.Md5(signUrl.toString().trim() + "app_secret=" + Consts.api.app_secret);
    }

    public static String getUrlSpell(Map<String, String> datas, String url) {
        StringBuffer resultUrl = new StringBuffer();
        StringBuffer signUrl = new StringBuffer();// 这个是用了 sign的。
        for (String key : datas.keySet()) {
            String value = "";
            String signValue = "";
            try {
                signValue = datas.get(key);// 用来sign的不需要编码
                value = datas.get(key);
                if (null != value) {
                    // if("timestamp".equals(key)){
                    // value = value.replace(" ","%20");
                    // }else {
                    value = URLEncoder.encode(value, "UTF-8");// 用了传递的需要编码
                    // }
                }
                // datas.put(key, value);
            } catch (Exception e) {
                e.printStackTrace();
            }
            resultUrl.append(key).append("=").append(value).append("&");
            signUrl.append(key).append("=").append(signValue).append("&");
        }
        // String sign = MD5.Md5(resultUrl.toString().trim() + "app_secret="
        // + Consts.api.app_secret);
        String sign = MD5.Md5(signUrl.toString().trim() + "app_secret=" + Consts.api.app_secret);
        String result = url + "?" + resultUrl.toString() + "sign=" + sign;
        return result;
    }


    public static int dp2px(Context context, float dp) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dp * scale + 0.5f);
    }

    public static int px2dp(Context context, float px) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (px / scale + 0.5f);
    }

    public static int getWindowWidth(Context context) {
        DisplayMetrics d = new DisplayMetrics();
        ((_BaseActivity) context).getWindowManager().getDefaultDisplay().getMetrics(d);
        int mWidth = d.widthPixels;
        return mWidth;
    }

    public static int getWindowHight(Context context) {
        DisplayMetrics d = new DisplayMetrics();
        ((_BaseActivity) context).getWindowManager().getDefaultDisplay().getMetrics(d);
        int height = d.heightPixels;
        return height;
    }

    public static boolean getNetWorkState(Context context) {
        if (context != null) {
            ConnectivityManager mConnectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkInfo mNetworkInfo = mConnectivityManager.getActiveNetworkInfo();
            if (mNetworkInfo != null) {
                return mNetworkInfo.isAvailable();
            }
        }
        return false;
    }

    /**
     * 小透明通知
     */
    private static Toast mToast;


    public static byte[] Bitmap2Bytes(Bitmap bm) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bm.compress(Bitmap.CompressFormat.PNG, 100, baos);
        return baos.toByteArray();
    }

    /**
     * 判断网络
     *
     * @param context
     * @return
     */
    public static boolean isNetworkAvailable(Context context) {
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) {
        } else {
            //则可以使用 cm.getActiveNetworkInfo().isAvailable();
            NetworkInfo[] info = cm.getAllNetworkInfo();
            if (info != null) {
                for (int i = 0; i < info.length; i++) {
                    if (info[i].getState() == NetworkInfo.State.CONNECTED) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public static void callPhone(Context context, String number) {
        if (null == context || TextUtils.isEmpty(number)) {
            return;
        }
        Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + number));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        if(context.getPackageManager().resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY) == null){
            Toast.makeText(context,"未找到应用。请手动拨打 " + number,Toast.LENGTH_SHORT).show();
            return;
        }
        context.startActivity(intent);
    }

    public static Bitmap convertToBitmap(Context context, String path, int w, int h) {
        BitmapFactory.Options opts = new BitmapFactory.Options();
        // 设置为ture只获取图片大小
        opts.inJustDecodeBounds = true;
        opts.inPreferredConfig = Bitmap.Config.RGB_565;
        Bitmap bitmap = BitmapFactory.decodeFile(path, opts);
        int width = opts.outWidth;
        int height = opts.outHeight;
        float scaleWidth = 0.f, scaleHeight = 0.f;
        if (width > w || height > h) {
            // 缩放
            scaleWidth = ((float) width) / w;
            scaleHeight = ((float) height) / h;
        }
        opts.inJustDecodeBounds = false;
        float scale = Math.max(scaleWidth, scaleHeight);
        opts.inSampleSize = (int) scale;
        WeakReference<Bitmap> weak;
        try {
            weak = new WeakReference<>(BitmapFactory.decodeFile(path, opts));
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        return compressImage(weak.get());
    }

    public static Bitmap convertToBitmap(String srcPath) {

        BitmapFactory.Options newOpts = new BitmapFactory.Options();
        //开始读入图片，此时把options.inJustDecodeBounds 设回true了
        newOpts.inJustDecodeBounds = true;
        newOpts.inPreferredConfig = Bitmap.Config.RGB_565;
        String path = srcPath.replace("file://","");
        Bitmap bitmap = BitmapFactory.decodeFile(path, newOpts);
        newOpts.inJustDecodeBounds = false;
        int w = newOpts.outWidth;
        int h = newOpts.outHeight;
        // 想要缩放的目标尺寸
        //现在主流手机比较多是800*480分辨率，所以高和宽我们设置为
        float hh = 1280f;//这里设置高度为1200f
        float ww = 720f;//这里设置宽度为720f
        //缩放比。由于是固定比例缩放，只用高或者宽其中一个数据进行计算即可
        int be = 1;//be=1表示不缩放
        if (w > h && w > ww) {//如果宽度大的话根据宽度固定大小缩放
            be = (int) (newOpts.outWidth / ww);
        } else if (w < h && h > hh) {//如果高度高的话根据高度固定大小缩放
            be = (int) (newOpts.outHeight / hh);
        }
        if (be <= 0) be = 1;
        newOpts.inSampleSize = be;//设置缩放比例
        WeakReference<Bitmap> weak;
        /*try {
            //重新读入图片，注意此时已经把options.inJustDecodeBounds 设回false了
            weak = new WeakReference<>(BitmapFactory.decodeFile(path, newOpts));
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }*/
        Bitmap bitmap1 = BitmapFactory.decodeFile(path, newOpts);

        return bitmap1;//压缩好比例大小后再进行质量压缩
    }


    public static Bitmap compressImage(Bitmap image) {
        Bitmap bitmap = null;
        if (null != image) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            image.compress(Bitmap.CompressFormat.JPEG, 100, baos);//质量压缩方法，这里100表示不压缩，把压缩后的数据存放到baos中
            int options = 100;
            while (baos.toByteArray().length / 1024 > 100) {  //循环判断如果压缩后图片是否大于100kb,大于继续压缩
                baos.reset();//重置baos即清空baos
                //第一个参数 ：图片格式 ，第二个参数： 图片质量，100为最高，0为最差  ，第三个参数：保存压缩后的数据的流
                image.compress(Bitmap.CompressFormat.JPEG, options, baos);//这里压缩options%，把压缩后的数据存放到baos中
                options -= 10;//每次都减少10
            }
            ByteArrayInputStream isBm = new ByteArrayInputStream(baos.toByteArray());//把压缩后的数据baos存放到ByteArrayInputStream中
            bitmap = BitmapFactory.decodeStream(isBm, null, null);//把ByteArrayInputStream数据生成图片
        }
        return bitmap;
    }


    private final static long minute = 60 * 1000;// 1分钟
    private final static long hour = 60 * minute;// 1小时
    private final static long day = 24 * hour;// 1天
    private final static long month = 31 * day;// 月
    private final static long year = 12 * month;// 年

    public static String formatTime(long timeStamp) {
        long curTimeMillis = System.currentTimeMillis();
        Date curDate = new Date(curTimeMillis);
        int todayHoursSeconds = curDate.getHours() * 60 * 60;
        int todayMinutesSeconds = curDate.getMinutes() * 60;
        int todaySeconds = curDate.getSeconds();
        int todayMillis = (todayHoursSeconds + todayMinutesSeconds + todaySeconds) * 1000;
        long todayStartMillis = curTimeMillis - todayMillis;
        if (timeStamp >= todayStartMillis) {
            return "今天";
        }
        int oneDayMillis = 24 * 60 * 60 * 1000;
        long yesterdayStartMilis = todayStartMillis - oneDayMillis;
        if (timeStamp >= yesterdayStartMilis) {
            return "昨天";
        }
        long yesterdayBeforeStartMilis = yesterdayStartMilis - oneDayMillis;
        if (timeStamp >= yesterdayBeforeStartMilis) {
            return "前天";
        }
// SimpleDateFormat sdf = new SimpleDateFormat(“yyyy-MM-dd HH:mm:ss”);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(new Date(timeStamp));
    }

    public static void openKeybord(EditText mEditText, Context mContext) {
        InputMethodManager imm = (InputMethodManager) mContext.getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.showSoftInput(mEditText, InputMethodManager.RESULT_SHOWN);
        imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, InputMethodManager.HIDE_IMPLICIT_ONLY);
    }

    public static void closeKeybord(EditText mEditText, Context mContext) {
        InputMethodManager imm = (InputMethodManager) mContext.getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.hideSoftInputFromWindow(mEditText.getWindowToken(), 0);
    }


    private static long lastClickTime;

    public static boolean isFastDoubleClick() {
        long time = System.currentTimeMillis();
        long timeD = time - lastClickTime;
        if (0 < timeD && timeD < 1000) {
            return true;
        }
        lastClickTime = time;
        return false;
    }

    public static boolean isAppAlive(Application app) {
        //通过activity的任务栈查找来判断app是否在前台
        ActivityManager mAm = (ActivityManager) app.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningTaskInfo> runningTasks = mAm.getRunningTasks(100);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            for (ActivityManager.RunningTaskInfo runningTask : runningTasks) {
                    Log.e("run", runningTask.baseActivity.getClassName());
                if ("com.yaofangwang.mall.MainActivity".equals(runningTask.baseActivity.getClassName())) {
                    return true;
                }
            }
        }
        return false;
    }

    public static String getTime(Date date) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        return format.format(date);
    }

    // 获取ApiKey
    public static String getMetaValue(Context context, String metaKey) {
        Bundle metaData = null;
        String apiKey = null;
        if (context == null || metaKey == null) {
            return null;
        }
        try {
            ApplicationInfo ai = context.getPackageManager().getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
            if (null != ai) {
                metaData = ai.metaData;
            }
            if (null != metaData) {
                apiKey = metaData.getString(metaKey);
            }
        } catch (PackageManager.NameNotFoundException e) {

        }
        return apiKey;
    }

    /*
    * 生成图片
    * */
    public static Bitmap convertViewToBitmap(View view, int bitmapWidth, int bitmapHeight) {
        Bitmap bitmap = Bitmap.createBitmap(bitmapWidth, bitmapHeight, Bitmap.Config.RGB_565);
        Canvas canvas = new Canvas(bitmap);
        canvas.drawColor(Color.parseColor("#f4f4f4"));
        view.layout(0, 0, bitmapWidth, bitmapHeight);
        view.draw(canvas);
        return bitmap;
    }


    public static String double2Point(Double aDouble) {
        DecimalFormat df = new DecimalFormat("0.00");
        return df.format(aDouble);
    }

    public static String priceBig(Double aDouble) {
        return String.valueOf(double2Point(aDouble)).split("\\.")[0];

    }
    public static String priceSmall(Double aDouble) {
        return "." + String.valueOf(double2Point(aDouble)).split("\\.")[1];
    }

    /**
     * 根据当前时间获得是星期几
     *
     * @return
     */

    public static String getWeek(long time) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        String t = format.format(new Date(time));


        String Week = "";

        //SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        Calendar c = Calendar.getInstance();
        try {

            c.setTime(format.parse(t));

        } catch (ParseException e) {
            e.printStackTrace();
        }
        if (c.get(Calendar.DAY_OF_WEEK) == 1) {
            Week += "周天";
        }
        if (c.get(Calendar.DAY_OF_WEEK) == 2) {
            Week += "周一";
        }
        if (c.get(Calendar.DAY_OF_WEEK) == 3) {
            Week += "周二";
        }
        if (c.get(Calendar.DAY_OF_WEEK) == 4) {
            Week += "周三";
        }
        if (c.get(Calendar.DAY_OF_WEEK) == 5) {
            Week += "周四";
        }
        if (c.get(Calendar.DAY_OF_WEEK) == 6) {
            Week += "周五";
        }
        if (c.get(Calendar.DAY_OF_WEEK) == 7) {
            Week += "周六";
        }
        return Week;
    }

    public static long formartTimesToMillils(String date) {
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");//24小时制
        long time = -1;
        try {
            time = simpleDateFormat.parse(date).getTime();
        } catch (ParseException e) {
            return -1;
        }
        return time;
    }

    public static String formatDuring(long mss) {
        long days = mss / (1000 * 60 * 60 * 24);
        long hours = (mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
        long minutes = (mss % (1000 * 60 * 60)) / (1000 * 60);
        long seconds = (mss % (1000 * 60)) / 1000;
        return days + " days " + hours + " hours " + minutes + " minutes "
                + seconds + " seconds ";
    }

    public static String formatDuringMinAndSeconds(long mss) {
        long minutes = (mss % (1000 * 60 * 60)) / (1000 * 60);
        long seconds = (mss % (1000 * 60)) / 1000;
        if (seconds >= 10) {
            return minutes + ":"
                    + seconds;
        } else {
            return minutes + ":"
                    + "0" + seconds;
        }

    }

    public static Map<String, String> jsonToHashMap(JSONObject jsonObject) {
        Map<String, String> map = new HashMap<String, String>();
        Iterator it = jsonObject.keys();        // 遍历jsonObject数据，添加到Map对象
        while (it.hasNext()) {
            String key = String.valueOf(it.next());            //注意：这里获取value使用的是optString
            String value = (String) jsonObject.optString(key);
            map.put(key, value);
        }
        return map;
    }

    public static String getPackageName(Context context) {
        try {
            PackageManager manager = context.getPackageManager();
            PackageInfo info = manager.getPackageInfo(context.getPackageName(), 0);
            return info.packageName;
        } catch (PackageManager.NameNotFoundException e) {
            return null;
        }
    }

    public static String getVersionCode(Context context) {
        try {
            PackageManager manager = context.getPackageManager();
            PackageInfo info = manager.getPackageInfo(context.getPackageName(), 0);
            return info.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            return "";
        }
    }

    public static void showShortToast(Context context, String string) {
        if (TextUtils.isEmpty(string)) {
            return;
        }
        if (null == context) {
            return;
        }
        String str = string.toString();
        if (!TextUtils.isEmpty(str)) {
//                mToast = Toast.makeText(context.getApplicationContext(), str, Toast.LENGTH_SHORT);
            if (mToast == null) {
                mToast = new Toast(context);
                LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                View root = inflater.inflate(R.layout.toast_utils, null);
                mToast.setView(root);
                mToast.setGravity(Gravity.CENTER, 0, 0);
            }
            View root = mToast.getView();
            TextView toastTv = (TextView) root.findViewById(R.id.toast_tv);
            toastTv.setText(string);
            mToast.setDuration(Toast.LENGTH_SHORT);

            mToast.show();
        }
    }
    /**
     *
     * 替换自定义适配器，解决gson默认将int转换为double
     *
     * @return
     */
    public static Map<String, Object> jsonToMap(String strJson) {
        Gson gson = new GsonBuilder().registerTypeAdapter(new TypeToken<Map<String,Object>>(){}.getType(),new DataTypeAdaptor()).create();
        return gson.fromJson(strJson, new TypeToken<Map<String, Object>>() {}.getType());
    }
}
