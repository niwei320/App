package com.yaofangwang.mall.TUtils;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.Toast;

import com.yaofangwang.mall.LauchingActivity;
import com.yaofangwang.mall.MainActivity;
import com.yaofangwang.mall.activity.ChangeIpViewModel;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class UpdateJsAsync extends AsyncTask<String, Integer, Void> {
    public final static int INSTALL_CANCLE_CODE = 123;
    private HttpURLConnection connection = null;
    private FileOutputStream fileOutputStream = null;
    private InputStream inputStream = null;
    Context context;
    private File file;
    public final static int INSTALL_PREMISSION_CODE = 111;
    public String bundleCode;
    public boolean visible;
    public ChangeIpViewModel testModeOn;

    public UpdateJsAsync(Context context, String cloudBunderCode, boolean visible) {
        super();
        this.context = context;
        this.bundleCode = cloudBunderCode;
        this.visible = visible;
    }
    public UpdateJsAsync(Context context, String cloudBunderCode, ChangeIpViewModel changeIpViewModel) {
        super();
        this.context = context;
        this.bundleCode = cloudBunderCode;
        this.visible = false;
        this.testModeOn = changeIpViewModel;
    }

    @Override
    protected void onPreExecute() {
        super.onPreExecute();
    }

    int value = 0;

    @Override
    protected Void doInBackground(String... params) {
        try {

            int total_length = 0;
            URL url = new URL(params[0]);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            if (connection.getResponseCode() == 200) {
                inputStream = connection.getInputStream();
                // 先获得文件的总长度
                long file_length = connection.getContentLength();
                if (inputStream != null) {
                    file = getFile(params[0]);
                    fileOutputStream = new FileOutputStream(file);
                    byte[] buffer = new byte[1024];
                    int length = 0;
                    Log.d("updateJsBundle","开始下载");
                    while ((length = inputStream.read(buffer)) != -1) {
                        total_length += length;
                        fileOutputStream.write(buffer, 0, length);
                        value = (int) ((total_length / (float) file_length) * 100);
                        // 调用update函数，更新进度
                        publishProgress(value);
                    }
                }
            }
        } catch (Exception e) {
            Log.e("updateJsBundle","更新失败" + e.getMessage());
            cancel(true);
            if(visible){
                //TODO 这里应该做一个点击重新下载更好
                ((Activity)context).runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(context, "更新失败程序已退出，请检查网络！", Toast.LENGTH_SHORT).show();
                        ((Activity)context).finish();
                    }
                });
            };
            if(null != testModeOn){
                ((Activity)context).runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(context, "更新失败程序" + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
            }
        } finally {
            if (fileOutputStream != null) {
                try {
                    fileOutputStream.close();
                    fileOutputStream.flush();
                } catch (IOException e) {
                    Log.e("updateJsBundle",e.getMessage().toString());
                }
            }
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    Log.e("updateJsBundle",e.getMessage().toString());
                }
            }
        }
        return null;
    }

    @Override
    protected void onProgressUpdate(Integer... values) {
        super.onProgressUpdate(values);
        if (visible) {
            ((LauchingActivity)context).setmDownloadProgress(values[0]);
        }
        if ( null != testModeOn) {
            testModeOn.setProgress(values[0]);
        }
    }

    @Override
    protected void onPostExecute(Void result) {
        super.onPostExecute(result);
        Log.e("updateJsBundle","下载完成 开始解压");
        //压缩包下载完成 进行解压
        UnZipFolder();
    }

    /**
     * 解压
     */
    public void UnZipFolder() {
        ZipInputStream inZip = null;
        try {
            inZip = new ZipInputStream(new FileInputStream(context.getFilesDir().getAbsolutePath() + "/JsBundle.zip"));
            ZipEntry zipEntry;
            String szName = "";
            while ((zipEntry = inZip.getNextEntry()) != null) {
                szName = zipEntry.getName();
                if (zipEntry.isDirectory()) {
                    //获取部件的文件夹名
                    szName = szName.substring(0, szName.length() - 1);
                    File folder = new File(context.getFilesDir().getAbsolutePath() + "/index.android.bundle" + File.separator + szName);
                    folder.mkdirs();
                } else {
                    File file = new File(context.getFilesDir().getAbsolutePath() + "/index.android.bundle" + File.separator + szName);
                    if (!file.exists()) {
                        file.getParentFile().mkdirs();
                        file.createNewFile();
                    }
                    // 获取文件的输出流
                    FileOutputStream out = new FileOutputStream(file);
                    int len;
                    byte[] buffer = new byte[1024];
                    // 读取（字节）字节到缓冲区
                    while ((len = inZip.read(buffer)) != -1) {
                        // 从缓冲区（0）位置写入（字节）字节
                        out.write(buffer, 0, len);
                        out.flush();
                    }
                    out.close();
                }
            }
            //新版bundle写入完成
            //更改本地bundle版本号
            updataLocalBundleCode();
            //删除压缩包
            deleteZip();
            inZip.close();
            //可见性更新JsBundle后 跳转ReactActivity
            Log.e("updateJsBundle","更新完成");
            if ( null != testModeOn)Toast.makeText(context, "更新完成！", Toast.LENGTH_SHORT).show();
            jumpToReactActivity();
        } catch (Exception e) {
            Log.e("updateJsBundle","解压失败");
            if ( null != testModeOn)Toast.makeText(context, "解压失败！", Toast.LENGTH_SHORT).show();
            jumpToReactActivity();
        }

    }

    private void deleteZip() {
        File files = new File(context.getFilesDir().getAbsolutePath() + "/JsBundle.zip");
        files.delete();
    }

    private void updataLocalBundleCode() throws IOException {
        FileOutputStream fileOutputStream = context.openFileOutput("localJsBundleCode", context.MODE_PRIVATE);
        byte[] bytes = bundleCode.getBytes();
        fileOutputStream.write(bytes);
        fileOutputStream.close();
        Log.e("updateJsBundle","解压完成 写入新的jsBundleCode");
    }


    /**
     * 因没有断点续传、或下载不完整等各种情况，这里做判断如果文件已存在则删除
     *
     * @param url
     * @return
     */
    private File getFile(String url) {
        File files = new File(context.getFilesDir().getAbsolutePath() + "/JsBundle.zip");
        if (files.exists()) {
            files.delete();
        } else {
            try {
                files.createNewFile();
            } catch (IOException e) {
                Log.e("updateJsBundle","获取压缩包下载地址FFile对象失败");
                if ( null != testModeOn) Toast.makeText(context, "获取压缩包下载地址FFile对象失败！", Toast.LENGTH_SHORT).show();
                jumpToReactActivity();
            }
        }
        return files;
    }

    public void jumpToReactActivity(){
        testModeOn = null;
        if(visible){
            Log.e("updateJsBundle","进入MainActivity");
            context.startActivity(new Intent(context, MainActivity.class));
            ((LauchingActivity)context).overridePendingTransition(0, 0);
            ((LauchingActivity)context).finish();
        }
    }

}
