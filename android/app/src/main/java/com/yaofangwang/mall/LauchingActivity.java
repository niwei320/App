package com.yaofangwang.mall;

import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.text.TextUtils;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;

import com.yaofangwang.mall.TUtils.AppManager;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall.TUtils.UpdateJsAsync;
import com.yaofangwang.mall.net.TcpUtils;
import com.yaofangwang.mall.utils.LoggerUtil;
import com.yaofangwang.mall.widgtes.TipsDialog;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.HashMap;

public class LauchingActivity extends _BaseActivity {

    private ProgressBar mDownloadProgress;
    private Intent schemeIntent;
    private Object hotUpdateMessage;
    private RelativeLayout updata_rl;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        MainActivity main = (MainActivity) AppManager.getAppManager().getActivity(MainActivity.class);
        schemeIntent = getScheme();
        if(main !=null && !main.isFinishing()){
            //如果启动过Activity，取值然后finishing
            schemeHandler(schemeIntent);
        }else{
            //如果没启动过就按流程走
            initActivity();
        }
    }

    /**
     * 解析Scheme参数
     * @return
     */
    private Intent getScheme(){
        Uri uri = getIntent().getData();
        if(uri == null){
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addCategory(Intent.CATEGORY_DEFAULT);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            intent.setData(Uri.parse("yfw://reactnative.yfw"));
            return intent;
        }
        String type = uri.getQueryParameter("type");
        String value = uri.getQueryParameter("value");
        String name = uri.getQueryParameter("name");
        String params = "";
        if(!TextUtils.isEmpty(type) && !TextUtils.isEmpty(value)){
            params= "?type="+type+"&value="+value+"&name="+name;
        }
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.addCategory(Intent.CATEGORY_DEFAULT);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        intent.setData(Uri.parse("yfw://reactnative.yfw" + params));
        return intent;
    }

    /**
     * 隐式跳转处理
     */
    private void schemeHandler(Intent intent) {
        startActivity(intent);
        overridePendingTransition(0, 0);
        finish();
    }



    private void initActivity() {
        setContentView(R.layout.activity_lauching);
        initView();
        hotUpdateChec();
    }

    public void deleteDirWihtFile(File dir) {
        if (dir == null || !dir.exists() || !dir.isDirectory())
            return;
        for (File file : dir.listFiles()) {
            if (file.isFile())
                file.delete(); // 删除所有文件
            else if (file.isDirectory())
                deleteDirWihtFile(file); // 递规的方式删除文件夹
        }
        dir.delete();// 删除目录本身
    }

    private void hotUpdateChec() {
        //判断app版本 是否跟上一次打开一致
        SharedPreferences sp = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MODE_PRIVATE);
        String mBuildNativeVersionCode = TUtils.getVersionCode(LauchingActivity.this);//bundle中配置的版本号
        String mSaveNativeVersionCode = sp.getString("LOCAL_NATIVE_VERSON", mBuildNativeVersionCode);//本地保存的版本号
        sp.edit().putString("LOCAL_NATIVE_VERSON",mBuildNativeVersionCode).apply();//更新本地吧保存的版本号
        int mSaveVersion = formatVersionCode(mSaveNativeVersionCode);
        int mBuildVersion = formatVersionCode(mBuildNativeVersionCode);
        LoggerUtil.e("updateJsBundle", "上一次记录的版本号" + mSaveVersion);
        if(mBuildVersion > mSaveVersion){
            LoggerUtil.e("updateJsBundle", "本次的版本号高于上一次记录的版本号");
            String url = getFilesDir().getAbsolutePath() + "/localJsBundleCode";
            File codeNumFile = new File(url);
            if(codeNumFile.exists()){
                codeNumFile.delete();
            }
            //不一致 表示本次打开之前apk进行了升级 需要清空本地存储逇bundle包
            String jsBundleFile = getFilesDir().getAbsolutePath() + "/index.android.bundle";
            File file = new File(jsBundleFile);
            if (file.exists()) {
                LoggerUtil.e("updateJsBundle", "删除本地下载的bundle");
                deleteDirWihtFile(file);
                startMain(schemeIntent);
            }
        }
        hotUpdateCheck_Tcp();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                if(hotUpdateMessage == null) {
//                    Toast.makeText(LauchingActivity.this,"接口返回超时",Toast.LENGTH_LONG).show();
                    startMain(schemeIntent);
                }
            }
        }, 5000);
    }

    private void checkToSaveDomain(String net_domain,String type) {
        if (TextUtils.isEmpty(net_domain)) {
            return;
        }
        if (net_domain.length() < 10) {
            return;
        }
        SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MODE_PRIVATE);
        if (type.equals("tcp")) {
            sharedPreferences.edit().putString("TCP_NET_DOMAIN", net_domain).apply();
        } else {
            sharedPreferences.edit().putString("HTTP_NET_DOMAIN", net_domain).apply();
        }
    }


    private void initView() {
        updata_rl = (RelativeLayout) findViewById(R.id.updata_rl);
        mDownloadProgress = (ProgressBar) findViewById(R.id.download_progress);
    }

    public void setmDownloadProgress(int value) {
        if(null != mDownloadProgress){
            mDownloadProgress.setProgress(value);
        }
    }

    @Override
    public void finish() {
        super.finish();
        overridePendingTransition(0, 0);
    }

    public void hotUpdateCheck_Tcp() {
        HashMap<String, Object> datas = new HashMap<>();
        datas.put("__cmd", "guest.common.app.getCurrentVersionZip");
        LoggerUtil.e("updateJsBundle", "tcp请求更新接口");
        new TcpUtils(this).sendMessage(datas, new TcpUtils.OnResponseListener() {
            @Override
            public void onResponse(String s) {
                if(LauchingActivity.this.isDestroyed()){
                    return;
                }
                hotUpdateMessage = s;
                LoggerUtil.e("updateJsBundle", s);
                try {
                    JSONObject jsonObject = new JSONObject(s);
                    JSONObject result = jsonObject.getJSONObject("result");
                    String updateType = result.optString("updateType");
                    String cloudNativeVersionCode = result.optString("version");
                    String cloudJsBundleZipVersionCode = result.optString("zipversion");
                    String cloudJsBundleZipUrlCode = result.optString("zipurl");
                    String tcp_domain = result.optString("tcp_domain");
                    String http_domain = result.optString("http_domain");
                    checkToSaveDomain(tcp_domain,"tcp");
                    checkToSaveDomain(http_domain,"http");
                    String loaclaNativeVersionCode = TUtils.getVersionCode(LauchingActivity.this);
                    int cloundVersion = formatVersionCode(cloudNativeVersionCode);
                    int loaclVersion = formatVersionCode(loaclaNativeVersionCode);
                    if (loaclVersion == cloundVersion) {    //Apk版本与接口返回相同,进行热更新
                        if (isNeedJsBundleUpdate(cloudJsBundleZipVersionCode)) {
                            if (updateType.equals("background")) {
                                LoggerUtil.e("updateJsBundle", "JsBundle本地版本<服务器版本,开始隐式更新.");
                                downloadCloudJsBundle(cloudJsBundleZipUrlCode, cloudJsBundleZipVersionCode, false);
                                startMain(schemeIntent);
                            } else {
                                LoggerUtil.e("updateJsBundle", "JsBundle本地版本<服务器版本,开始显式更新.");
                                String isforceUpdate = result.optString("isforceUpdate");
                                tipsJsBundleUpdate(cloudJsBundleZipVersionCode, cloudJsBundleZipUrlCode, isforceUpdate);
                            }
                        } else {
                            LoggerUtil.e("updateJsBundle", "本地JsBundle版本>=服务器版本,直接打开reactActivity.");
                            startMain(schemeIntent);
                        }
                    } else {
                        LoggerUtil.e("updateJsBundle", "本地Apk版本不等于接口返回的版本,直接打开reactActivity.");
                        startMain(schemeIntent);
                    }
                } catch (JSONException e) {
                    LoggerUtil.e("updateJsBundle", "热更新接口回调处理异常");
                    startMain(schemeIntent);
                }
            }

            @Override
            public void onError(String s) {
                LoggerUtil.e("updateJsBundle", "热更新接口Error.");
                startMain(schemeIntent);
            }
        });
    }

    //隐式更新, 应用内下载jsbundle.
    private void downloadCloudJsBundle(String cloudJsBundleZipUrlCode, String cloudJsBundleZipVersionCode, boolean visible) {
        String jsBundleUrl = getFilesDir().getAbsolutePath() + "/JsBundle.zip";
        File file = new File(jsBundleUrl);
        if (file.exists()) {
            deleteFile("JsBundle.zip");
        }
        new UpdateJsAsync(this, cloudJsBundleZipVersionCode, visible).execute(cloudJsBundleZipUrlCode);
    }

    //显式更新JsBundle
    public void tipsJsBundleUpdate(String cloudJsBundleZipVersionCode, String cloudJsBundleZipUrlCode, String type) {
        if (type.equals("false")) {
            LoggerUtil.e("updateJsBundle", "询问更新 可以取消");
            TipsDialog.show(this, "发现新版本").setRightButton("确认", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    updata_rl.setVisibility(View.VISIBLE);
                    new UpdateJsAsync(LauchingActivity.this, cloudJsBundleZipVersionCode, true).execute(cloudJsBundleZipUrlCode);
                    dialog.dismiss();
                }
            }).setLeftButton("取消", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {

                    dialog.dismiss();
                    startMain(schemeIntent);
                }
            });
        } else {
            LoggerUtil.e("updateJsBundle", "询问更新 不可取消");
            TipsDialog.showWithoutCancel(this, "发现新版本").setRightButton("确认", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    updata_rl.setVisibility(View.VISIBLE);
                    new UpdateJsAsync(LauchingActivity.this, cloudJsBundleZipVersionCode, true).execute(cloudJsBundleZipUrlCode);
                    dialog.dismiss();
                }
            }).setLeftButtonGone();
        }
    }

    private int formatVersionCode(String cloudVersionCode) {
        String replace = cloudVersionCode.replace(".", "");
        return Integer.parseInt(replace);
    }

    private boolean isNeedJsBundleUpdate(String cloudJsBundleZipVersionCode) {
        String url = getFilesDir().getAbsolutePath() + "/localJsBundleCode";
        File file = new File(url);
        if (file.exists()) {
            String result = "";
            try {
                LoggerUtil.e("updateJsBundle", "文件存在 不是第一次打开 判断jsBundle版本号");
                FileInputStream fileInputStream = openFileInput("localJsBundleCode");
                //获取文件长度
                int lenght = fileInputStream.available();
                byte[] buffer = new byte[lenght];
                fileInputStream.read(buffer);
                //将byte数组转换成指定格式的字符串
                result = new String(buffer, "UTF-8");
                //得到本地jsbundle版本
                int localJsBundleCode = formatVersionCode(result);
                int cloudJsBundleCode = formatVersionCode(cloudJsBundleZipVersionCode);
                return localJsBundleCode < cloudJsBundleCode;
            } catch (Exception e) {
                LoggerUtil.e("updateJsBundle", "读取本地文件中存储的jsbundleCode出现异常 直接接入reactActivity");
                startMain(schemeIntent);
            }
        } else {
            // 路径不存在 表示没有更新过  从BuildConfig中读取
            try {
                LoggerUtil.e("updateJsBundle", "文件不存在 是第一次打开 获取BuildConfig中的jsBundleCode");
                String js_bundle_code = BuildConfig.Js_Bundle_Code;
                int localJsBundleCode = formatVersionCode(js_bundle_code);
                int cloudJsBundleCode = formatVersionCode(cloudJsBundleZipVersionCode);
                if (localJsBundleCode < cloudJsBundleCode) {
                    return true;
                }
                FileOutputStream fileOutputStream = openFileOutput("localJsBundleCode", MODE_PRIVATE);
                byte[] bytes = cloudJsBundleZipVersionCode.getBytes();
                fileOutputStream.write(bytes);
                fileOutputStream.close();
                return false;
            } catch (Exception e) {
                LoggerUtil.e("updateJsBundle", "文件不存在 解析BuildConfig中的jsBundle出现异常 直接进入reactActivity");
                startMain(schemeIntent);
            }
        }
        return false;
    }

    /**
     * 跳转到首页，可能是隐式启动里面带有值，但如果不是的话就new一个新的Intent
     * @param intent
     */
    private void startMain(Intent intent){
        if (intent.resolveActivity(getPackageManager()) != null) {
            startActivity(intent);
        } else {
            startActivity(new Intent(this, MainActivity.class));
        }
        overridePendingTransition(0, 0);
        finish();
    }

    @Override
    protected void onDestroy() {
        getWindow().setBackgroundDrawable(null);
        super.onDestroy();
    }
}
