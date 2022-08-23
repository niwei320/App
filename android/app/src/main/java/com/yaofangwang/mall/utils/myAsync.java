package com.yaofangwang.mall.utils;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.support.v4.content.FileProvider;

import com.sobot.chat.utils.ToastUtil;
import com.yaofangwang.mall.MainActivity;
import com.yaofangwang.mall.widgtes.UpdateDialog;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class myAsync extends AsyncTask<String, Integer, Void> {
    public final static int INSTALL_CANCLE_CODE = 123;
    private HttpURLConnection connection = null;
    private FileOutputStream fileOutputStream = null;
    private InputStream inputStream = null;
    UpdateDialog updateDialog;
    Context context;
    private File file;
    public final static int INSTALL_PREMISSION_CODE = 111;

    public myAsync(Context context) {
        super();
        this.context = context;
    }

    @Override
    protected void onPreExecute() {
        super.onPreExecute();
        updateDialog = new UpdateDialog(context);
        updateDialog.setCancelable(false);
        updateDialog.setCanceledOnTouchOutside(false);
        updateDialog.show();
        updateDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialogInterface) {
                if (value != 100) {
                    if (context instanceof MainActivity) {
                        ((MainActivity) context).finish();
                    }
                }
            }
        });
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
                    while ((length = inputStream.read(buffer)) != -1) {
                        if (updateDialog != null && updateDialog.isShowing()) {
                            total_length += length;
                            fileOutputStream.write(buffer, 0, length);
                            value = (int) ((total_length / (float) file_length) * 100);
                            // 调用update函数，更新进度
                            publishProgress(value);
                        } else {
                            return null;
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (fileOutputStream != null) {
                try {
                    fileOutputStream.close();
                    fileOutputStream.flush();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return null;
    }

    @Override
    protected void onProgressUpdate(Integer... values) {
        super.onProgressUpdate(values);
        updateDialog.setProgress(values[0]);
    }

    @Override
    protected void onPostExecute(Void result) {
        super.onPostExecute(result);
        if (updateDialog != null && updateDialog.isShowing()) {
            updateDialog.dismiss();
            //取消点击安装，下载完直接安装
            installApk();
        }
    }

    /**
     * 原路径为外部路径，现修改为包下路径
     * 因没有断点续传、或下载不完整等各种情况，这里做判断如果文件已存在则删除，不存在则差UN该敬爱呢
     *
     * @param url
     * @return
     */
    private File getFile(String url) {
        File files = new File(context.getExternalCacheDir() + "/yaofangwang.apk");
        if (files.exists()) {
            files.delete();
        } else {
            try {
                files.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return files;
    }

    /**
     * 安装APK
     */
    private void installApk() {
        if (file != null) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW);
                //兼容7.0
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    Uri contentUri = FileProvider.getUriForFile(context, "com.yaofangwang.mall.common.provider", file);
                    intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
                } else {
                    intent.setDataAndType(Uri.fromFile(file), "application/vnd.android.package-archive");
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                }
                if (context.getPackageManager().queryIntentActivities(intent, 0).size() > 0) {
                    if (context instanceof MainActivity){
//                        ((MainActivity) context).startActivityF(intent);
                        ((MainActivity) context).startActivityForResult(intent,INSTALL_CANCLE_CODE);
                    }else {
                        context.startActivity(intent);
                    }

                }
            } catch (Throwable e) {
                ToastUtil.showToast(context, "解析包错误，请及时反馈");
            }
        }
    }

}
