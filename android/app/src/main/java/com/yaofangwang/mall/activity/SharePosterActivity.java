package com.yaofangwang.mall.activity;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.app.ActivityCompat;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.facebook.drawee.view.SimpleDraweeView;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.umeng.socialize.ShareAction;
import com.umeng.socialize.bean.SHARE_MEDIA;
import com.umeng.socialize.media.UMImage;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall._BaseActivity;
import com.yaofangwang.mall.utils.BaseShareControl;
import com.yaofangwang.mall.utils.FrescoLoad;
import com.yaofangwang.mall.utils.ShareValueTrendChartControl;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.Hashtable;
import java.util.UUID;

public class SharePosterActivity extends _BaseActivity implements View.OnClickListener {

    private View mLl;
    private boolean isScaleBig = true;
    private View bottom;
    private View out;
    private View dis;
    private String standard;
    private String title;
    private String price;
    private String url;
    private ImageView qrcode;
    private TextView medicienName;
    private TextView medicienStandar;
    private TextView medicinePrice;
    private SimpleDraweeView bigPic;
    private View sahre_wx;
    private View share_pyq;
    private View share_qq;
    private View share_qqkz;
    private View share_save;

    private BaseShareControl shareControl;
    private boolean isTcp;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_share_poster);
        initViews();
        isTcp = getIntent().getBooleanExtra("isTcp", false);
        if (ShareValueTrendChartControl.class.getName().equals(getIntent().getStringExtra("shareClass"))) {
            ((ViewGroup) mLl).removeAllViews();
            shareControl = new ShareValueTrendChartControl(this, getIntent());
            shareControl.setQRCodeBitmap(generateBitmap(shareControl.getQRCodeURL(), TUtils.dp2px(this, 50), TUtils.dp2px(this, 50)));
            LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
            ((ViewGroup) mLl).addView(shareControl.getRootView(), layoutParams);
        } else {
            initData();
        }
        oppenAnimation();
        initListener();
    }

    private void sharePic(SHARE_MEDIA name) {
        Bitmap bitmap = creatPoster();
        startShare(name, bitmap);
    }

    private void startShare(SHARE_MEDIA name, Bitmap bitmap) {
        UMImage image = new UMImage(SharePosterActivity.this, bitmap);
        UMImage thumb = new UMImage(SharePosterActivity.this, R.drawable.app_icon);
        image.setThumb(thumb);
        image.compressStyle = UMImage.CompressStyle.SCALE;//大小压缩，默认为大小压缩，适合普通很大的图
        image.compressStyle = UMImage.CompressStyle.QUALITY;//质量压缩，适合长图的分享
        image.compressFormat = Bitmap.CompressFormat.PNG;//用户分享透明背景的图片可以设置这种方式，但是qq好友，微信朋友圈，不支持透明背景图片，会变成黑色
        new ShareAction(SharePosterActivity.this).withText("").withMedia(image).setPlatform(name).share();
    }

    private Bitmap creatPoster() {
        Bitmap bitmap = convertViewToBitmap(mLl, mLl.getWidth(), mLl.getHeight());
        return bitmap;
    }

    private void initListener() {
        dis.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                finish();
                overridePendingTransition(0, R.anim.translate_out);
            }
        });
        out.setFocusableInTouchMode(true);
        out.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(final View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        if (isScaleBig) {
                            big(v);
                            isScaleBig = false;
                        } else {
                            narrow(v);
                            isScaleBig = true;
                        }

                        break;
                }
                return false;
            }
        });

        bottom.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                switch (motionEvent.getAction()) {
                    case MotionEvent.ACTION_DOWN:

                        break;
                }
                return false;
            }
        });
        sahre_wx.setOnClickListener(this);
        share_pyq.setOnClickListener(this);
        share_qq.setOnClickListener(this);
        share_qqkz.setOnClickListener(this);
        share_save.setOnClickListener(this);
    }

    private void initData() {
        String type = getIntent().getStringExtra("type");
        String qrcode = getIntent().getStringExtra("QRCODE");
        standard = getIntent().getStringExtra("Standard");
        title = getIntent().getStringExtra("Title");
        price = getIntent().getStringExtra("price");
        String picUrl = getIntent().getStringExtra("PicUrl");
        String inviteQrcode = getIntent().getStringExtra("inviteQrcode");//邀请好友的二维码
        SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MODE_PRIVATE);
        if (isTcp) {
            String tcp_net_domain = sharedPreferences.getString("TCP_NET_DOMAIN", "yaofangwang.com");
            url = String.format("https://"+tcp_net_domain+"/detail-%s.html", qrcode);//普通的二维码
        } else {
            String http_net_domain = sharedPreferences.getString("HTTP_NET_DOMAIN", "yaofangwang.com");
            url = String.format("https://"+http_net_domain+"/detail-%s.html", qrcode);//普通的二维码
        }
        Bitmap bitmap;
        if (type.equals("nomal")) {
            bitmap = generateBitmap(url, TUtils.dp2px(this, 50), TUtils.dp2px(this, 50));
        } else {
            bitmap = generateBitmap(inviteQrcode, TUtils.dp2px(this, 50), TUtils.dp2px(this, 50));
        }
        this.qrcode.setImageBitmap(bitmap);
        FrescoLoad.load(bigPic, picUrl);
        medicienName.setText(title);
        medicienStandar.setText(standard);
        medicinePrice.setText("¥" + price);
    }

    private void initViews() {
        mLl = findViewById(R.id.ll_3);
        out = findViewById(R.id.out);
        bottom = findViewById(R.id.bottom);
        dis = findViewById(R.id.dis);
        qrcode = (ImageView) findViewById(R.id.qrcode);
        medicienName = (TextView) findViewById(R.id.medicien_name);
        medicienStandar = (TextView) findViewById(R.id.medicien_standar);
        medicinePrice = (TextView) findViewById(R.id.medicine_price);
        bigPic = (SimpleDraweeView) findViewById(R.id.big_pic);
        sahre_wx = findViewById(R.id.share_wx);
        share_pyq = findViewById(R.id.share_pyq);
        share_qq = findViewById(R.id.share_qq);
        share_qqkz = findViewById(R.id.share_qqkz);
        share_save = findViewById(R.id.share_save);
    }

    private Bitmap generateBitmap(String content, int width, int height) {
        try {
            Hashtable<EncodeHintType, Object> hints = new Hashtable<EncodeHintType, Object>();
            hints.put(EncodeHintType.CHARACTER_SET, "utf-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);
            BitMatrix matrix = new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, width, height);
            matrix = deleteWhite(matrix);//删除白边
            width = matrix.getWidth();
            height = matrix.getHeight();
            int[] pixels = new int[width * height];
            for (int y = 0; y < height; y++) {
                for (int x = 0; x < width; x++) {
                    if (matrix.get(x, y)) {
                        pixels[y * width + x] = Color.BLACK;
                    } else {
                        pixels[y * width + x] = Color.WHITE;
                    }
                }
            }
            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            bitmap.setPixels(pixels, 0, width, 0, 0, width, height);
            return bitmap;
        } catch (Exception e) {
            return null;
        }
    }

    private static BitMatrix deleteWhite(BitMatrix matrix) {
        int[] rec = matrix.getEnclosingRectangle();
        int resWidth = rec[2] + 1;
        int resHeight = rec[3] + 1;

        BitMatrix resMatrix = new BitMatrix(resWidth, resHeight);
        resMatrix.clear();
        for (int i = 0; i < resWidth; i++) {
            for (int j = 0; j < resHeight; j++) {
                if (matrix.get(i + rec[0], j + rec[1]))
                    resMatrix.set(i, j);
            }
        }
        return resMatrix;
    }


    @Override
    protected void onResume() {
        super.onResume();

    }

    private void oppenAnimation() {
        Animation animation = AnimationUtils.loadAnimation(SharePosterActivity.this, R.anim.open_narow);
        animation.setFillAfter(true);
        out.startAnimation(animation);

        Animation animation1 = AnimationUtils.loadAnimation(SharePosterActivity.this, R.anim.tran_down);
        animation1.setFillAfter(true);
        bottom.startAnimation(animation1);
    }

    private void narrow(View v) {
        Animation animation = AnimationUtils.loadAnimation(SharePosterActivity.this, R.anim.narrow);
        animation.setFillAfter(true);
        v.startAnimation(animation);

        Animation animation1 = AnimationUtils.loadAnimation(SharePosterActivity.this, R.anim.tran_down);
        animation1.setFillAfter(true);
        bottom.startAnimation(animation1);
    }

    private void big(View v) {
        Animation animation = AnimationUtils.loadAnimation(SharePosterActivity.this, R.anim.balloonscale);
        animation.setFillAfter(true);
        v.startAnimation(animation);

        Animation animation1 = AnimationUtils.loadAnimation(SharePosterActivity.this, R.anim.tran_up);
        animation1.setFillAfter(true);
        bottom.startAnimation(animation1);


    }

    public static Bitmap convertViewToBitmap(View view, int bitmapWidth, int bitmapHeight) {
        Bitmap bitmap = Bitmap.createBitmap(bitmapWidth, bitmapHeight, Bitmap.Config.ARGB_4444);
        Canvas canvas = new Canvas(bitmap);
        canvas.drawColor(Color.parseColor("#000000"));
        view.draw(canvas);
        return bitmap;
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
            verifyStoragePermissions(SharePosterActivity.this);
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
        } catch (FileNotFoundException e) {
            Toast.makeText(this, "保存失败", Toast.LENGTH_SHORT).show();
            e.printStackTrace();
        }
        //发送广播 提示相册内容发生改变
        sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(files)));
    }

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

    private static final int REQUEST_EXTERNAL_STORAGE = 1;
    private static String[] PERMISSIONS_STORAGE = {
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE};

    @Override
    public void finish() {
        super.finish();
        overridePendingTransition(0, 0);
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        finish();
        overridePendingTransition(0, R.anim.translate_out);
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.share_wx:
                sharePic(SHARE_MEDIA.WEIXIN);
                break;
            case R.id.share_pyq:
                sharePic(SHARE_MEDIA.WEIXIN_CIRCLE);
                break;
            case R.id.share_qq:
                sharePic(SHARE_MEDIA.QQ);
                break;
            case R.id.share_qqkz:
                sharePic(SHARE_MEDIA.QZONE);
                break;
            case R.id.share_save:
                Bitmap bitmap = convertViewToBitmap(mLl, mLl.getWidth(), mLl.getHeight());
                saveImage(bitmap, PATH);
                break;
        }
    }
}
