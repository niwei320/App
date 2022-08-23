package com.yaofangwang.mall.TUtils;

import android.annotation.SuppressLint;
import android.app.AppOpsManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.os.Build;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Date;

import static android.content.Context.MODE_PRIVATE;

/**
 * Created by admin on 2018/5/7.
 */

public class NotificationsUtils {
    private static final String CHECK_OP_NO_THROW = "checkOpNoThrow";
    private static final String OP_POST_NOTIFICATION = "OP_POST_NOTIFICATION";
    private static String now_date;
    private static String week;
    private static int save_times;

    @SuppressLint("NewApi")
    public static boolean isNotificationEnabled(Context context) {
        /*
        *  高版本V4包中提供的方法
        *
        * */
        boolean b = true;
       /* try {
           b = NotificationManagerCompat.from(context).areNotificationsEnabled();
        }catch (Exception e){

        }*/

        /*
        *  通过反射处理的方式
        *
        * */
        if (Build.VERSION.SDK_INT < 19) {
            return true;
        }

        try {
            AppOpsManager mAppOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
            ApplicationInfo appInfo = context.getApplicationInfo();
            String pkg = context.getApplicationContext().getPackageName();
            int uid = appInfo.uid;
            Class appOpsClass = null;
            /* Context.APP_OPS_MANAGER */
            appOpsClass = Class.forName(AppOpsManager.class.getName());
            Method checkOpNoThrowMethod = appOpsClass.getMethod(CHECK_OP_NO_THROW, Integer.TYPE, Integer.TYPE,
                    String.class);
            Field opPostNotificationValue = appOpsClass.getDeclaredField(OP_POST_NOTIFICATION);

            int value = (Integer) opPostNotificationValue.get(Integer.class);
            return ((Integer) checkOpNoThrowMethod.invoke(mAppOps, value, uid, pkg) == AppOpsManager.MODE_ALLOWED);

        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
        return b;
    }

    public static boolean noticeNotification(Context context) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        now_date = format.format(new Date(System.currentTimeMillis()));
        String save_date = context.getSharedPreferences("WEEK_SAVE_TIMES", MODE_PRIVATE).getString("Sava_Date", "");
        week = TUtils.getWeek(System.currentTimeMillis());
        save_times = context.getSharedPreferences("WEEK_SAVE_TIMES", MODE_PRIVATE).getInt("TIMES", 0);
        if (!now_date.equals(save_date) && save_times<3) {
            //今天没提示过
            afterNotice(context);
            return true;
        }else {
            return false;
        }
    }

    private static void afterNotice(Context context){
        context.getSharedPreferences("WEEK_SAVE_TIMES", MODE_PRIVATE).edit().putString("Sava_Date", now_date).commit();//弹出过后 才将当天标记为已提示过
        if (week.equals("周一")) {
            context.getSharedPreferences("WEEK_SAVE_TIMES", MODE_PRIVATE).edit().putInt("TIMES", 1).commit();
        } else {
            if (!(save_times >= 3)) {
                context.getSharedPreferences("WEEK_SAVE_TIMES", MODE_PRIVATE).edit().putInt("TIMES", save_times + 1).commit();
            }
        }
    }
}
