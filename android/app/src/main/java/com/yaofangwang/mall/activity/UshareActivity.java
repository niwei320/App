package com.yaofangwang.mall.activity;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;
import android.widget.Toast;

import com.umeng.analytics.MobclickAgent;
import com.umeng.socialize.ShareAction;
import com.umeng.socialize.UMShareAPI;
import com.umeng.socialize.UMShareConfig;
import com.umeng.socialize.UMShareListener;
import com.umeng.socialize.bean.SHARE_MEDIA;
import com.umeng.socialize.media.UMImage;
import com.umeng.socialize.media.UMWeb;
import com.yaofangwang.mall.R;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.facebook.common.internal.ByteStreams.copy;

public class UshareActivity extends AppCompatActivity {

    private static String FROM_TARGET = "GoodsDetail";

    private String chooseType;
    private String data;
    private UMShareListener mSnsPostListener;
    private String type;
    private String uri;
    private String action;
    private String from;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ushare);
        initIntent();
        initSnsPostListner();
        initShare();
    }

    private void initSnsPostListner() {
        if ("sharePoster".equals(type)) return;
        UMShareConfig config = new UMShareConfig();
        config.isNeedAuthOnGetUserInfo(true);
        UMShareAPI.get(this).setShareConfig(config);

        mSnsPostListener = new UMShareListener() {
            @Override
            public void onStart(SHARE_MEDIA share_media) {

            }

            @Override
            public void onResult(SHARE_MEDIA share_media) {
                Toast.makeText(UshareActivity.this, "分享成功", Toast.LENGTH_LONG).show();
                if (FROM_TARGET.equals(from)) {
                    MobclickAgent.onEvent(UshareActivity.this, "product detail-success");
                }
                finish();
            }

            @Override
            public void onError(SHARE_MEDIA share_media, Throwable throwable) {
                Toast.makeText(UshareActivity.this, "分享失败", Toast.LENGTH_LONG).show();
                if (FROM_TARGET.equals(from)) {
                    MobclickAgent.onEvent(UshareActivity.this, "product detail-fail");
                }
                finish();
            }

            @Override
            public void onCancel(SHARE_MEDIA share_media) {
                Toast.makeText(UshareActivity.this, "取消分享", Toast.LENGTH_LONG).show();
                finish();
            }
        };
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

    public static final String PATH = Environment.getExternalStorageDirectory().getAbsolutePath() + "/mypicture/";

    private void initShare() {
        if ("sharePoster".equals(type)) {
            Bitmap bmp = GetLocalOrNetBitmap(uri);
            if ("save".equals(action)) {
                saveImage(bmp, PATH);
                finish();
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
                sharePlatform(datas, sharePlatform, R.drawable.app_icon_share);
            } catch (JSONException e) {

            }
        }
    }


    private void startShare(SHARE_MEDIA name, Bitmap bitmap) {
        UMImage image = new UMImage(this, bitmap);
        UMImage thumb = new UMImage(this, R.drawable.app_icon);
        image.setThumb(thumb);
        image.compressStyle = UMImage.CompressStyle.SCALE;//大小压缩，默认为大小压缩，适合普通很大的图
        image.compressStyle = UMImage.CompressStyle.QUALITY;//质量压缩，适合长图的分享
        image.compressFormat = Bitmap.CompressFormat.PNG;//用户分享透明背景的图片可以设置这种方式，但是qq好友，微信朋友圈，不支持透明背景图片，会变成黑色
        new ShareAction(this).withText("").withMedia(image).setPlatform(name).setCallback(new UMShareListener() {
            @Override
            public void onStart(SHARE_MEDIA share_media) {

            }

            @Override
            public void onResult(SHARE_MEDIA share_media) {
                finish();
            }

            @Override
            public void onError(SHARE_MEDIA share_media, Throwable throwable) {
                finish();
            }

            @Override
            public void onCancel(SHARE_MEDIA share_media) {
                finish();
            }
        }).share();

    }

    private SHARE_MEDIA getSharePlatform(String chooseType) {
        switch (chooseType) {
            case "qq":
                return SHARE_MEDIA.QQ;
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


    private void sharePlatform(Map<String, String> data, SHARE_MEDIA platform, int drawable) {
        UMImage image;
        if (TextUtils.isEmpty(data.get("image"))) {
            image = new UMImage(this, drawable);
        } else {
            image = new UMImage(this, data.get("image"));
        }
        UMWeb web = new UMWeb(data.get("url"));
        web.setThumb(image);
        image.compressStyle = UMImage.CompressStyle.SCALE;
        web.setTitle(data.get("title"));
        web.setDescription(data.get("content"));
        new ShareAction(this).setPlatform(platform)
//                .withText(content)
                .withMedia(web).setCallback(mSnsPostListener).share();
    }


    private void initIntent() {
        chooseType = getIntent().getStringExtra("chooseType");
        data = getIntent().getStringExtra("data");
        type = getIntent().getStringExtra("type");
        uri = getIntent().getStringExtra("uri");
        action = getIntent().getStringExtra("action");
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
            verifyStoragePermissions(this);
            FileOutputStream out = new FileOutputStream(files);
            bmp.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.flush();
            out.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        //将图片添加到系统相册目录
        try {
            MediaStore.Images.Media.insertImage(this.getContentResolver(),
                    files.getAbsolutePath(), fileName, null);
            Toast.makeText(this, "保存成功", Toast.LENGTH_SHORT).show();
            finish();
        } catch (FileNotFoundException e) {
            Toast.makeText(this, "保存失败", Toast.LENGTH_SHORT).show();
            finish();
        }
        //发送广播 提示相册内容发生改变
        sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(files)));
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        UMShareAPI.get(this).onActivityResult(requestCode, resultCode, data);

    }
}
