package com.yaofangwang.mall.utils;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.text.TextUtils;
import android.widget.Toast;

import com.umeng.analytics.MobclickAgent;
import com.umeng.socialize.ShareAction;
import com.umeng.socialize.UMShareAPI;
import com.umeng.socialize.UMShareConfig;
import com.umeng.socialize.UMShareListener;
import com.umeng.socialize.bean.SHARE_MEDIA;
import com.umeng.socialize.media.UMImage;
import com.umeng.socialize.media.UMMin;
import com.umeng.socialize.media.UMWeb;
import com.yaofangwang.mall.R;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.ref.WeakReference;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.facebook.common.internal.ByteStreams.copy;

/**
 * Created by admin on 2018/12/25.
 */

public class UshareUtils {
    private static String FROM_TARGET = "GoodsDetail";
    private WeakReference<Activity> activity;
    private String chooseType;
    private String data;
    private UMShareListener mSnsPostListener;
    private String type;
    private String uri;
    private String action;
    private String from;

    public UshareUtils(@NonNull Activity activity) {
        if (activity == null) {
            throw new NullPointerException();
        }
        this.activity = new WeakReference(activity);
    }

    public void init(String chooseType, String data, String type, String uri, String action) {
        this.chooseType = chooseType;
        this.data = data;
        this.type = type;
        this.uri = uri;
        this.action = action;
        initSnsPostListner();
        initShare();
    }

    private void initSnsPostListner() {
        if ("sharePoster".equals(type) || ("downloadImage").equals(type)) return;
        UMShareConfig config = new UMShareConfig();
        config.isNeedAuthOnGetUserInfo(true);
        UMShareAPI.get(activity.get()).setShareConfig(config);

        mSnsPostListener = new UMShareListener() {
            @Override
            public void onStart(SHARE_MEDIA share_media) {

            }

            @Override
            public void onResult(SHARE_MEDIA share_media) {
                Toast.makeText(activity.get(), "分享成功", Toast.LENGTH_LONG).show();
                if (FROM_TARGET.equals(from)) {
                    MobclickAgent.onEvent(activity.get(), "product detail-success");
                }
            }

            @Override
            public void onError(SHARE_MEDIA share_media, Throwable throwable) {
                Toast.makeText(activity.get(), "分享失败", Toast.LENGTH_LONG).show();
                if (FROM_TARGET.equals(from)) {
                    MobclickAgent.onEvent(activity.get(), "product detail-fail");
                }
            }

            @Override
            public void onCancel(SHARE_MEDIA share_media) {
                Toast.makeText(activity.get(), "取消分享", Toast.LENGTH_LONG).show();
            }
        };
    }


    private SHARE_MEDIA getSharePlatform(String chooseType) {
        switch (chooseType) {
            case "qq":
                return SHARE_MEDIA.QQ;
            case "wxMini":
            case "wx":
                return SHARE_MEDIA.WEIXIN;
            case "pyq":
                return SHARE_MEDIA.WEIXIN_CIRCLE;
            case "wb":
                return SHARE_MEDIA.SINA;
            case "qzone":
                return SHARE_MEDIA.QZONE;
        }
        return null;
    }

    private void initShare() {
        if (("downloadImage".equals(type))) {
            if ("net".equals(action)) {
                dowLoadImage();
            } else {
                Bitmap bmp = GetLocalOrNetBitmap(uri);
                saveImage(bmp, PATH);
            }
            return;
        }
        if ("sharePoster".equals(type)) {
            Bitmap bmp = GetLocalOrNetBitmap(uri);
            if ("save".equals(action)) {
                saveImage(bmp, PATH);
            } else {
                SHARE_MEDIA sharePlatform = getSharePlatform(action);
                startShare(sharePlatform, bmp);
            }
        } else {
            try {
                Map<String, String> datas = new HashMap<>();
                JSONObject jsonObject = new JSONObject(data);
                datas.put("title", jsonObject.optString("title"));
                datas.put("content", jsonObject.optString("content"));
                datas.put("url", jsonObject.optString("url"));
                datas.put("image", jsonObject.optString("image"));
                SHARE_MEDIA sharePlatform = getSharePlatform(chooseType);
                from = jsonObject.optString("from");
                if (null == sharePlatform)
                    return;
                if(chooseType.equals("wxMini")){
                    sharePlatformWxmin(datas, sharePlatform, R.drawable.app_icon_share_wxmini);
                } else {
                    sharePlatform(datas, sharePlatform, R.drawable.app_icon_share);
                }
            } catch (JSONException e) {

            }
        }
    }

    private void dowLoadImage() {
        if (TextUtils.isEmpty(this.uri)) {
            return;
        }
        FrescoLoad.downLoadToBitmap(activity.get(), this.uri, new FrescoLoad.OnBitmapListener() {
            @Override
            public void onBitmap(Bitmap bitmap) {
                saveImage(bitmap, PATH);
            }
        });
    }

    private void startShare(SHARE_MEDIA name, Bitmap bitmap) {
        UMImage image = new UMImage(activity.get(), bitmap);
        UMImage thumb = new UMImage(activity.get(), R.drawable.app_icon);
        image.setThumb(thumb);
        image.compressStyle = UMImage.CompressStyle.SCALE;//大小压缩，默认为大小压缩，适合普通很大的图
        image.compressStyle = UMImage.CompressStyle.QUALITY;//质量压缩，适合长图的分享
        image.compressFormat = Bitmap.CompressFormat.PNG;//用户分享透明背景的图片可以设置这种方式，但是qq好友，微信朋友圈，不支持透明背景图片，会变成黑色
        new ShareAction(activity.get()).withText("").withMedia(image).setPlatform(name).setCallback(new UMShareListener() {
            @Override
            public void onStart(SHARE_MEDIA share_media) {

            }

            @Override
            public void onResult(SHARE_MEDIA share_media) {
            }

            @Override
            public void onError(SHARE_MEDIA share_media, Throwable throwable) {
            }

            @Override
            public void onCancel(SHARE_MEDIA share_media) {
            }
        }).share();

    }

    private void sharePlatform(Map<String, String> data, SHARE_MEDIA platform, int drawable) {
        UMImage image;
        if (TextUtils.isEmpty(data.get("image"))) {
            image = new UMImage(activity.get(), drawable);
        } else {
            image = new UMImage(activity.get(), data.get("image"));
        }
        UMWeb web = new UMWeb(data.get("url"));
        web.setThumb(image);
        image.compressStyle = UMImage.CompressStyle.SCALE;
        web.setTitle(data.get("title"));
        web.setDescription(TextUtils.isEmpty(data.get("content"))?" ":data.get("content"));
        new ShareAction(activity.get()).setPlatform(platform)
//                .withText(content)
                .withMedia(web).setCallback(mSnsPostListener).share();
    }

    private void sharePlatformWxmin(Map<String, String> data, SHARE_MEDIA platform, int drawable) {
        UMImage image;
        if (TextUtils.isEmpty(data.get("image"))) {
            image = new UMImage(activity.get(), drawable);
        } else {
            image = new UMImage(activity.get(), data.get("image"));
        }
        UMMin umMin = new UMMin(data.get("url").replaceFirst("http:","https:"));//兼容低版本的网页链接
        umMin.setThumb(image);// 小程序消息封面图片
        umMin.setTitle(data.get("title"));// 小程序消息title
        umMin.setDescription( data.get("content"));// 小程序消息描述
        umMin.setPath("/components/YFWWebView/YFWWebView?params={\"value\":\"" + data.get("url").replaceFirst("http:","https:") + "\"}");//小程序页面路径
        umMin.setUserName("gh_1cc6c01f4bdd");// 小程序原始id,在微信平台查询
        new ShareAction(activity.get())
                .withMedia(umMin)
                .setPlatform(platform)
                .setCallback(mSnsPostListener).share();
    }

    public static Bitmap GetLocalOrNetBitmap(String url) {
        Bitmap bitmap = null;
        InputStream in = null;
        BufferedOutputStream out = null;
        try {
            in = new BufferedInputStream(new URL(url).openStream(), 300 * 300);
            final ByteArrayOutputStream dataStream = new ByteArrayOutputStream();
            out = new BufferedOutputStream(dataStream, 300 * 300);
            copy(in, out);
            out.flush();
            byte[] data = dataStream.toByteArray();
            bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
            data = null;
            return bitmap;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private static final int REQUEST_EXTERNAL_STORAGE = 1;
    private static String[] PERMISSIONS_STORAGE = {
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE};

    public void verifyStoragePermissions(Activity activity) {
        // Check if we have write permission
        int permission = ActivityCompat.checkSelfPermission(activity,
                Manifest.permission.WRITE_EXTERNAL_STORAGE);
        if (permission != PackageManager.PERMISSION_GRANTED) {
            // We don't have permission so prompt the user
            ActivityCompat.requestPermissions(activity, PERMISSIONS_STORAGE,
                    REQUEST_EXTERNAL_STORAGE);
        }
    }

    public static final String PATH = Environment.getExternalStorageDirectory().getAbsolutePath() + "/mypicture/";

    public void saveImage(final Bitmap bmp, final String path) {
        String state = Environment.getExternalStorageState();
        //如果状态不是mounted，无法读写
        if (!state.equals(Environment.MEDIA_MOUNTED)) {
            return;
        }

        final String fileName = UUID.randomUUID().toString();
        File files = null;
        try {
            File file = new File(path);
            if (!file.exists()) {
                file.mkdir();
            }
            files = new File(file, fileName + ".jpg");
            verifyStoragePermissions(activity.get());
            FileOutputStream out = new FileOutputStream(files);
            bmp.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.flush();
            out.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        //将图片添加到系统相册目录
        try {
            String insertImage = MediaStore.Images.Media.insertImage(activity.get().getContentResolver(), files.getAbsolutePath(), fileName, null);
            File file1 = new File(getRealPathFromURI(Uri.parse(insertImage),activity.get()));
            activity.get().sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(file1)));
            Toast.makeText(activity.get(), "保存成功", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(activity.get(), "保存失败", Toast.LENGTH_SHORT).show();
        }
        //发送广播 提示相册内容发生改变

    }




    //得到绝对地址
    private static String getRealPathFromURI(Uri contentUri,Context context) {
        String[] proj = { MediaStore.Images.Media.DATA };
        Cursor cursor = context.getContentResolver().query(contentUri, proj, null, null, null);
        int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
        cursor.moveToFirst();
        String fileStr = cursor.getString(column_index);
        cursor.close();
        return fileStr;
    }

}
