package com.yaofangwang.mall.activity;

import android.app.Activity;
import android.content.SharedPreferences;
import android.databinding.ObservableInt;
import android.widget.Toast;

import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.TUtils.UpdateJsAsync;
import com.yaofangwang.mall.net.ProjectGlaobleParams;

import java.io.File;
import java.lang.ref.WeakReference;

/**
 * Created by admin on 2019/3/11.
 */

public class ChangeIpViewModel {
    WeakReference<Activity> act;
    public ObservableInt mProgress = new ObservableInt();
    public ChangeIpViewModel(Activity activity) {
        this.act = new WeakReference<Activity>(activity);
    }

    public void changIpToDest(String ipAddress){
        changeIp(ipAddress);
        Toast.makeText(MainApplication.getInstance(),"服务器地址切换为:"+ipAddress,Toast.LENGTH_SHORT).show();
        ((ChangeIpActivity)act.get()).finish();
    }
    public String getTcpSetting(){
        return ProjectGlaobleParams.IP +":"+ ProjectGlaobleParams.TCP_PORT;
    }
    public void cancleChange(){
        ((ChangeIpActivity)act.get()).finish();
    }

    private void changeIp(String ipAddress) {
        //保存 想要设置的Ip
        SharedPreferences sharedPreferences = act.get().getSharedPreferences(Consts.PreferenceKey.preferenceName, act.get().MODE_PRIVATE);
        sharedPreferences.edit().putString("Debug_IP_Address",ipAddress).apply();
        ProjectGlaobleParams.resetNetConfig();
    }

    public void setProgress(int d) {
        mProgress.set(d);
    }

    public void hotLoadBundle(String url){
//        if(!BuildConfig.DEBUG) {
//            return;
//        }
        Toast.makeText(act.get(),"处理中，更新完毕后重启应用。",Toast.LENGTH_LONG).show();
        downloadCloudJsBundle(url,"2.8.0");
    }

    private void downloadCloudJsBundle(String cloudZipUrlCode, String cloudVersionCode) {
        String jsBundleUrl = this.act.get().getFilesDir().getAbsolutePath() + "/JsBundle.zip";
        File file = new File(jsBundleUrl);
        if (file.exists()) {
            this.act.get().deleteFile("JsBundle.zip");
        }
        new UpdateJsAsync(this.act.get(), cloudVersionCode, this).execute(cloudZipUrlCode);
    }
}
