package com.yaofangwang.mall.utils;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class DownLoadImageService implements Runnable {
    private String url;
    private Context context;
    private ImageDownLoadCallBack callBack;
    private File currentFile;

    public DownLoadImageService(Context context, String url, ImageDownLoadCallBack callBack) {
        this.url = url;
        this.callBack = callBack;
        this.context = context;
    }

    @Override
    public void run() {

        FrescoLoad.downLoadToBitmap(context, url, new FrescoLoad.OnBitmapListener() {
            @Override
            public void onBitmap(final Bitmap bitmap) {
                //TODO 此处需要改，不需要在子线程中执行主线程，直接使用Fresco下载就好了
                new Thread(){
                    @Override
                    public void run() {
                        saveImageToGallery(context, bitmap);

                    }
                }.start();
            }
        });
    }

    public void saveImageToGallery(Context context, Bitmap bmp) {
        // 首先保存图片  
        File file = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).getAbsoluteFile();//注意小米手机必须这样获得public绝对路径
        String fileName = "pictures";
        File appDir = new File(file, fileName);
        if (!appDir.exists()) {
            appDir.mkdirs();
        }
        String fileName1 = System.currentTimeMillis() + ".jpg";
        currentFile = new File(appDir, fileName1);

        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(currentFile);
            bmp.compress(Bitmap.CompressFormat.JPEG, 100, fos);
            fos.flush();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (fos != null) {
                    fos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        if (currentFile.exists()) {
            callBack.onDownLoadSuccess(bmp);
        } else {
            callBack.onDownLoadFailed();
        }

        // 其次把文件插入到系统图库  
        try {
            MediaStore.Images.Media.insertImage(context.getContentResolver(), currentFile.getAbsolutePath(), fileName, null);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        // 最后通知图库更新  
        context.sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(new File(currentFile.getPath()))));
    }
}  