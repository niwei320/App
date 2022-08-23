/*
 * Copyright (C) 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.yaofangwang.mall.activity;

import android.app.Activity;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.provider.Settings;
import android.support.annotation.ColorInt;
import android.util.Log;
import android.view.KeyEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.google.gson.Gson;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.NotFoundException;
import com.google.zxing.RGBLuminanceSource;
import com.google.zxing.Result;
import com.google.zxing.ResultPoint;
import com.google.zxing.common.HybridBinarizer;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.TUtils.AppManager;
import com.yaofangwang.mall.TUtils.PicturePicUtils;
import com.yaofangwang.mall._BaseActivity;
import com.yaofangwang.mall.bean.QRCodeResultBean;
import com.yaofangwang.mall.net.TcpUtils;
import com.yaofangwang.mall.widgtes.TipsDialog;
import com.yaofangwang.zxing.AmbientLightManager;
import com.yaofangwang.zxing.BeepManager;
import com.yaofangwang.zxing.CameraManager;
import com.yaofangwang.zxing.CaptureActivityHandler;
import com.yaofangwang.zxing.DecodeFormatManager;
import com.yaofangwang.zxing.InactivityTimer;
import com.yaofangwang.zxing.ViewfinderView;

import org.json.JSONObject;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

import static com.sobot.chat.widget.kpswitch.util.StatusBarHeightUtil.getStatusBarHeight;
import static com.yaofangwang.mall.TUtils.TUtils.compressImage;

/**
 * This activity opens the camera and does the actual scanning on a background
 * thread. It draws a viewfinder to help the user place the barcode correctly,
 * shows feedback as the image processing is happening, and then overlays the
 * results when a scan is successful.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * @author Sean Owen
 */
public final class CaptureActivity extends _BaseActivity implements SurfaceHolder.Callback, View.OnClickListener {

    private static final String TAG = CaptureActivity.class.getSimpleName();

    private CameraManager cameraManager;
    private CaptureActivityHandler handler;
    private Result savedResultToShow;
    private ViewfinderView viewfinderView;
    private boolean hasSurface;
    private Collection<BarcodeFormat> decodeFormats;
    private Map<DecodeHintType, ?> decodeHints;
    private String characterSet;
    private InactivityTimer inactivityTimer;
    private BeepManager beepManager;
    private AmbientLightManager ambientLightManager;

    public ViewfinderView getViewfinderView() {
        return viewfinderView;
    }

    public Handler getHandler() {
        return handler;
    }

    public CameraManager getCameraManager() {
        return cameraManager;
    }

    TextView mOpenLightTV;

    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setContentView(R.layout.capture);
        hasSurface = false;
        inactivityTimer = new InactivityTimer(this);
        beepManager = new BeepManager(this);
        ambientLightManager = new AmbientLightManager(this);
        mOpenLightTV = (TextView) findViewById(R.id.open_light);
        mOpenLightTV.setOnClickListener(this);
        setStatusBarView(this, 0xFFFFFF, 1);
        //                隐藏功能
//        findViewById(R.id.open_pic).setOnClickListener(this);
        findViewById(R.id.top_left).setOnClickListener(this);
        TextView mTitle = (TextView) findViewById(R.id.top_title);
        mTitle.setText("扫一扫");
        AppManager.getAppManager().addActivity(this);
    }

    private void setStatusBarView(Activity activity, @ColorInt int color, int alpha) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            // 绘制一个和状态栏一样高的矩形
            View statusBarView = findViewById(R.id.status_view);
            RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, getStatusBarHeight(activity));
            statusBarView.setLayoutParams(params);
            // statusBarView.setBackgroundColor(color);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        cameraManager = new CameraManager(getApplication());
        viewfinderView = (ViewfinderView) findViewById(R.id.viewfinder_view);
        viewfinderView.setCameraManager(cameraManager);
        handler = null;

        resetStatusView();

        SurfaceView surfaceView = (SurfaceView) findViewById(R.id.preview_view);
        SurfaceHolder surfaceHolder = surfaceView.getHolder();
        if (hasSurface) {
            // The activity was paused but not stopped, so the surface still
            // exists. Therefore
            // surfaceCreated() won't be called, so init the camera here.
            initCamera(surfaceHolder);
        } else {
            // Install the callback and wait for surfaceCreated() to init the
            // camera.
            surfaceHolder.addCallback(this);
        }

        beepManager.updatePrefs();
        ambientLightManager.start(cameraManager);

        inactivityTimer.onResume();

        decodeFormats = null;
        characterSet = null;

    }

    @Override
    protected void onPause() {
        if (handler != null) {
            handler.quitSynchronously();
            handler = null;
        }
        inactivityTimer.onPause();
        ambientLightManager.stop();
        beepManager.close();
        cameraManager.closeDriver();
        // historyManager = null; // Keep for onActivityResult
        if (!hasSurface) {
            SurfaceView surfaceView = (SurfaceView) findViewById(R.id.preview_view);
            SurfaceHolder surfaceHolder = surfaceView.getHolder();
            surfaceHolder.removeCallback(this);
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        inactivityTimer.shutdown();
        super.onDestroy();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_BACK:
                setResult(RESULT_CANCELED);
                finish();
                return true;
            // restartPreviewAfterDelay(0L);//重新准备扫描
            case KeyEvent.KEYCODE_FOCUS:
            case KeyEvent.KEYCODE_CAMERA:
                // Handle these events so they don't launch the Camera app
                return true;
            // Use volume up/down to turn on light
            case KeyEvent.KEYCODE_VOLUME_DOWN:
                cameraManager.setTorch(false);
                return true;
            case KeyEvent.KEYCODE_VOLUME_UP:
                cameraManager.setTorch(true);
                return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    private void decodeOrStoreSavedBitmap(Bitmap bitmap, Result result) {
        // Bitmap isn't used yet -- will be used soon
        if (handler == null) {
            savedResultToShow = result;
        } else {
            if (result != null) {
                savedResultToShow = result;
            }
            if (savedResultToShow != null) {
                Message message = Message.obtain(handler, R.id.decode_succeeded, savedResultToShow);
                handler.sendMessage(message);
            }
            savedResultToShow = null;
        }
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        if (holder == null) {
            Log.e(TAG, "*** WARNING *** surfaceCreated() gave us a null surface!");
        }
        if (!hasSurface) {
            hasSurface = true;
            initCamera(holder);
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        hasSurface = false;
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {

    }

    /**
     * A valid barcode has been found, so give an indication of success and show
     * the results.
     *
     * @param rawResult   The contents of the barcode.
     * @param scaleFactor amount by which thumbnail was scaled
     * @param barcode     A greyscale bitmap of the camera data which was decoded.
     */
    public void handleDecode(Result rawResult, Bitmap barcode, float scaleFactor) {
        inactivityTimer.onActivity();
        String content = rawResult.getText();
        requestQRResult(content);
        boolean fromLiveScan = barcode != null;
        if (fromLiveScan) {
            beepManager.playBeepSoundAndVibrate();
            drawResultPoints(barcode, scaleFactor, rawResult);
        }
    }

    public void requestQRResult(String text) {
        if(text.toLowerCase().contains("type=erporder")){//联合会员特殊处理
            String from_unionid = "";
            String sub_siteid = "";
            String data = text.split("\\?")[1];//type=erpOrderScan&orderno=&storeid=&sign=&from_unionid=&sub_siteid=
            for(String item:data.split("&")){
                if(item.contains("from_unionid")){
                    from_unionid = item.split("=")[1];
                }
                if(item.contains("sub_siteid")){
                    sub_siteid = item.split("=")[1];
                }
            }
            data = data.replaceAll("=&","\":\"\",\"");
            data = data.replaceAll("=","\":\"");
            data = data.replaceAll("&","\",\"");
            ((MainApplication) MainApplication.getInstance()).from_unionid = from_unionid;
            ((MainApplication) MainApplication.getInstance()).sub_siteid = sub_siteid;
            Intent intent = new Intent();
            intent.putExtra("type", Consts.qrresult.QR_ERP).putExtra("value", "{\""+data+"\"}").putExtra("scan_code",text);
            setResult(RESULT_OK, intent);
            finish();

            return;
        }
            HashMap<String, Object> datas = new HashMap<>();
            datas.put("__cmd", "guest.common.app.getScanResult");
            datas.put("scan_code", text);
            new TcpUtils(this).sendMessage(datas, new TcpUtils.OnResponseListener() {
                @Override
                public void onResponse(String s) {
                    try {
                        JSONObject jsonObject = new JSONObject(s);
                        JSONObject result = jsonObject.getJSONObject("result");
                        QRCodeResultBean qrCodeResultBean = new Gson().fromJson(result.toString(), QRCodeResultBean.class);
                        actionResult(qrCodeResultBean, text);
                    } catch (Exception e) {
                        Toast.makeText(CaptureActivity.this, "未找到此类型的二维码信息!请扫描药品二维码", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onError(String s) {
                    Toast.makeText(CaptureActivity.this, "未找到此类型的二维码信息!请扫描药品二维码", Toast.LENGTH_SHORT).show();
                    restartPreviewAfterDelay(1000L);
                }
            });
    }

    private void actionResult(QRCodeResultBean result, String QRCodeStr) {
        Intent intent = new Intent();
        if(result.name == null||result.value == null){
            Toast.makeText(this, "未找到此类型的二维码信息!请扫描药品二维码", Toast.LENGTH_SHORT).show();
            restartPreviewAfterDelay(2000L);
            return;
        }
        if (result.name.equals(Consts.qrresult.QR_GET_GOODS_DETAIL)) {
            // startActivity(new Intent(this, ValueCompareActivity.class).putExtra(Consts.extra.DATA_MEDICINE_ID, result.value));
            intent.putExtra("type", Consts.qrresult.QR_GET_GOODS_DETAIL).putExtra("value", result.value).putExtra("scan_code",QRCodeStr);
            setResult(RESULT_OK, intent);
            finish();
        } else if (result.name.equals(Consts.qrresult.QR_GET_SHOP_DETAIL)) {
            //startActivity(new Intent(this, ShopDetailActivity.class).putExtra(Consts.extra.DATA_SHOP_ID, result.value));
            intent.putExtra("type", Consts.qrresult.QR_GET_SHOP_DETAIL).putExtra("value", result.value).putExtra("scan_code",QRCodeStr);
            setResult(RESULT_OK, intent);
            finish();
        } else if (result.name.equals(Consts.qrresult.QR_GET_SHOP_GOODS_DETAIL)) {
            //startActivity(new Intent(this, MedicineDetailActivity.class).putExtra(Consts.extra.DATA_SHOP_GOODS_ID, result.value));
            intent.putExtra("type", Consts.qrresult.QR_GET_SHOP_GOODS_DETAIL).putExtra("value", result.value).putExtra("scan_code",QRCodeStr);
            setResult(RESULT_OK, intent);
            finish();
        } else if (result.name.equals(Consts.qrresult.QR_GET_H5)) {
            //startActivity(new Intent(this, WebActivity.class).putExtra(Consts.extra.DATA_URL, result.value));
            intent.putExtra("type", Consts.qrresult.QR_GET_H5).putExtra("value", result.value).putExtra("scan_code",QRCodeStr);
            setResult(RESULT_OK, intent);
            finish();
        } else if (result.name.equalsIgnoreCase(Consts.qrresult.QR_SEARCH)) {
            /*startActivity(new Intent(this, SearchResultActivity.class)
                    .putExtra("search", true)
                    .putExtra("String", result.value));*/
            intent.putExtra("type", Consts.qrresult.QR_SEARCH).putExtra("value", result.value).putExtra("scan_code",QRCodeStr);
            setResult(RESULT_OK, intent);
            finish();
        } else if (result.name.equalsIgnoreCase(Consts.qrresult.QR_GET_SHOP_CAR)) {
            intent.putExtra("type", Consts.qrresult.QR_GET_SHOP_CAR).putExtra("value", result.value).putExtra("scan_code",QRCodeStr);
            setResult(RESULT_OK, intent);
            finish();
        } else {
            //TUtils.showShortCustomToast(getContent(), "未找到此类型的二维码信息!请扫描药品二维码", R.drawable.toast_n);
            Toast.makeText(this, "未找到此类型的二维码信息!请扫描药品二维码", Toast.LENGTH_SHORT).show();
                                    restartPreviewAfterDelay(2000L);
        }
    }


    /**
     * Superimpose a line for 1D or dots for 2D to highlight the key features of
     * the barcode.
     *
     * @param barcode     A bitmap of the captured image.
     * @param scaleFactor amount by which thumbnail was scaled
     * @param rawResult   The decoded results which contains the points to draw.
     */
    private void drawResultPoints(Bitmap barcode, float scaleFactor, Result rawResult) {
        ResultPoint[] points = rawResult.getResultPoints();
        if (points != null && points.length > 0) {
            Canvas canvas = new Canvas(barcode);
            Paint paint = new Paint();
            paint.setColor(getResources().getColor(R.color.result_points));
            if (points.length == 2) {
                paint.setStrokeWidth(4.0f);
                drawLine(canvas, paint, points[0], points[1], scaleFactor);
            } else if (points.length == 4 && (rawResult.getBarcodeFormat() == BarcodeFormat.UPC_A || rawResult.getBarcodeFormat() == BarcodeFormat.EAN_13)) {
                // Hacky special case -- draw two lines, for the barcode and
                // metadata
                drawLine(canvas, paint, points[0], points[1], scaleFactor);
                drawLine(canvas, paint, points[2], points[3], scaleFactor);
            } else {
                paint.setStrokeWidth(10.0f);
                for (ResultPoint point : points) {
                    if (point != null) {
                        canvas.drawPoint(scaleFactor * point.getX(), scaleFactor * point.getY(), paint);
                    }
                }
            }
        }
    }

    private static void drawLine(Canvas canvas, Paint paint, ResultPoint a, ResultPoint b, float scaleFactor) {
        if (a != null && b != null) {
            canvas.drawLine(scaleFactor * a.getX(), scaleFactor * a.getY(), scaleFactor * b.getX(), scaleFactor * b.getY(), paint);
        }
    }

    private void initCamera(SurfaceHolder surfaceHolder) {
        if (surfaceHolder == null) {
            throw new IllegalStateException("No SurfaceHolder provided");
        }
        mOpenLightTV.setEnabled(true);
        if (cameraManager.isOpen()) {
            Log.w(TAG, "initCamera() while already open -- late SurfaceView callback?");
            return;
        }
        try {
            cameraManager.openDriver(surfaceHolder);
            // Creating the handler starts the preview, which can also throw a
            // RuntimeException.
            if (handler == null) {
                handler = new CaptureActivityHandler(this, decodeFormats, decodeHints, characterSet, cameraManager);
            }
            decodeOrStoreSavedBitmap(null, null);
        } catch (IOException ioe) {
            Log.w(TAG, ioe);
            mOpenLightTV.setEnabled(false);
            displayFrameworkBugMessageAndExit();
        } catch (RuntimeException e) {
            // Barcode Scanner has seen crashes in the wild of this variety:
            // java.?lang.?RuntimeException: Fail to connect to camera service
            Log.w(TAG, "Unexpected error initializing camera", e);
            mOpenLightTV.setEnabled(false);
            displayFrameworkBugMessageAndExit();
        }
    }

    private void displayFrameworkBugMessageAndExit() {
        TipsDialog dialog = TipsDialog.show(this, "在设置-应用-药房网商城-权限中开启相机权限，以正常使用相关功能");
        dialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialog) {
                finish();
            }
        });
        dialog.setRightButton("去设置", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                Intent intent = new Intent();
                intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                intent.setData(Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            }
        }).setLeftButton("取消", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
                finish();
            }
        });
    }

    public void restartPreviewAfterDelay(long delayMS) {
        if (handler != null) {
            handler.sendEmptyMessageDelayed(R.id.restart_preview, delayMS);
        }
        resetStatusView();
    }

    private void resetStatusView() {
        viewfinderView.setVisibility(View.VISIBLE);
    }

    public void drawViewfinder() {
        viewfinderView.drawViewfinder();
    }

    private BinaryBitmap loadImage(Bitmap bitmap) throws IOException {

        int lWidth = bitmap.getWidth();
        int lHeight = bitmap.getHeight();
        int[] lPixels = new int[lWidth * lHeight];
        bitmap.getPixels(lPixels, 0, lWidth, 0, 0, lWidth, lHeight);
        return new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(lWidth, lHeight, lPixels)));
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK) {
            if (requestCode == PicturePicUtils.AlbumPic) {
                decodeImageUri(data.getData());

            }
        }
    }

    public void decodeImageUri(Uri uri) {
        BinaryBitmap bitmap = null;
        try {
            bitmap = loadImage(getBitmapFormUri(CaptureActivity.this, uri));
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            Map<DecodeHintType, Object> hints = new EnumMap<DecodeHintType, Object>(DecodeHintType.class);
            Collection<BarcodeFormat> decodeFormats = EnumSet.noneOf(BarcodeFormat.class);
            decodeFormats.addAll(EnumSet.of(BarcodeFormat.QR_CODE));
            decodeFormats.addAll(EnumSet.of(BarcodeFormat.CODE_128));
            decodeFormats.addAll(DecodeFormatManager.PRODUCT_FORMATS);
            decodeFormats.addAll(DecodeFormatManager.INDUSTRIAL_FORMATS);
            decodeFormats.addAll(DecodeFormatManager.QR_CODE_FORMATS);
            decodeFormats.addAll(DecodeFormatManager.DATA_MATRIX_FORMATS);
            decodeFormats.addAll(DecodeFormatManager.AZTEC_FORMATS);
            decodeFormats.addAll(DecodeFormatManager.PDF417_FORMATS);
            hints.put(DecodeHintType.POSSIBLE_FORMATS, decodeFormats);
            hints.put(DecodeHintType.CHARACTER_SET, "UTF-8");
            Result result = new MultiFormatReader().decode(bitmap, hints);
            handleDecode(result, null, 0);
        } catch (NotFoundException e) {
            e.printStackTrace();
            // com.yaofangwang.mall.others.TUtils.showShortToast(CaptureActivity.this, "未找到此类型的二维码信息!请扫描药品二维码");
        }
    }

    /**
     * 通过uri获取图片并进行压缩
     *
     * @param uri
     */
    public static Bitmap getBitmapFormUri(Activity ac, Uri uri) throws FileNotFoundException, IOException {
        InputStream input = ac.getContentResolver().openInputStream(uri);
        BitmapFactory.Options onlyBoundsOptions = new BitmapFactory.Options();
        onlyBoundsOptions.inJustDecodeBounds = true;
        onlyBoundsOptions.inDither = true;//optional
        onlyBoundsOptions.inPreferredConfig = Bitmap.Config.ARGB_8888;//optional
        BitmapFactory.decodeStream(input, null, onlyBoundsOptions);
        input.close();
        int originalWidth = onlyBoundsOptions.outWidth;
        int originalHeight = onlyBoundsOptions.outHeight;
        if ((originalWidth == -1) || (originalHeight == -1)) return null;
        //图片分辨率以480x800为标准
        float hh = 800f;//这里设置高度为800f
        float ww = 480f;//这里设置宽度为480f
        //缩放比。由于是固定比例缩放，只用高或者宽其中一个数据进行计算即可
        int be = 1;//be=1表示不缩放
        if (originalWidth > originalHeight && originalWidth > ww) {//如果宽度大的话根据宽度固定大小缩放
            be = (int) (originalWidth / ww);
        } else if (originalWidth < originalHeight && originalHeight > hh) {//如果高度高的话根据宽度固定大小缩放
            be = (int) (originalHeight / hh);
        }
        if (be <= 0) be = 1;
        //比例压缩
        BitmapFactory.Options bitmapOptions = new BitmapFactory.Options();
        bitmapOptions.inSampleSize = be;//设置缩放比例
        bitmapOptions.inDither = true;//optional
        bitmapOptions.inPreferredConfig = Bitmap.Config.ARGB_8888;//optional
        input = ac.getContentResolver().openInputStream(uri);
        Bitmap bitmap = BitmapFactory.decodeStream(input, null, bitmapOptions);
        input.close();

        return compressImage(bitmap);//再进行质量压缩
    }


    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.open_light:
                if (v.getTag() != null) {
                    cameraManager.setTorch(false);
                    v.setTag(null);
                } else {
                    cameraManager.setTorch(true);
                    v.setTag("on");
                }
                break;
//                隐藏功能
//            case R.id.open_pic:
//                PicturePicUtils.getAlbumPic(this);
//                break;
            case R.id.top_left:
                finish();
                break;
        }
    }
}
