package com.yaofangwang.mall.utils;

import android.graphics.Bitmap;

import java.io.File;

public interface ImageDownLoadCallBack {
        void onDownLoadSuccess(File file);
        void onDownLoadSuccess(Bitmap bitmap);
      
        void onDownLoadFailed();  
    }  