package com.yaofangwang.mall.TUtils;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapFactory.Options;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.net.Uri;
import android.provider.MediaStore;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;

public class PicturePicUtils {
    public static final int AlbumPic = 1001;
    public static final int CarmeraPic = 1002;
    public static final int CropPic = 1003;

    public static void getAlbumPic(Activity context) {
        Intent album = new Intent(Intent.ACTION_GET_CONTENT);
        album.setType("image/*");
        album.putExtra("scale", true);
        context.startActivityForResult(album, AlbumPic);
    }

    public static Bitmap createCircleImage(Bitmap source) {
        final Paint paint = new Paint();
        paint.setAntiAlias(true);
        int min = Math.min(source.getWidth(), source.getHeight());
        Bitmap target = Bitmap.createBitmap(min, min, Bitmap.Config.ARGB_8888);
        /**
         * 产生一个同样大小的画布
         */
        Canvas canvas = new Canvas(target);
        /**
         * 首先绘制圆形
         */
        canvas.drawCircle(min / 2, min / 2, min / 2, paint);
        /**
         * 使用SRC_IN
         */
        paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));
        /**
         * 绘制图片
         */
        canvas.drawBitmap(source, 0, 0, paint);
        return target;
    }


    public static void getCropPic(Activity activity, Uri inUri, Uri outUri, int outWidth, int outHeight, int sH, int sW) {
        Intent intent = new Intent("com.android.camera.action.CROP");
        intent.setDataAndType(inUri, "image/*");
        intent.putExtra(MediaStore.EXTRA_OUTPUT, outUri);
        intent.putExtra("crop", "true");
        intent.putExtra("aspectX", sW);// 裁剪框比例
        intent.putExtra("aspectY", sH);
        intent.putExtra("outputX", outWidth);// 输出图片大小
        intent.putExtra("outputY", outHeight);
        intent.putExtra("return-data", false);
        intent.putExtra("outputFormat", Bitmap.CompressFormat.PNG.toString());
        intent.putExtra("noFaceDetection", true); // no face detection
        activity.startActivityForResult(intent, CropPic);
    }


    public static void getCropPic(Activity activity, Uri inUri, Uri outUri) {
        Intent intent = new Intent("com.android.camera.action.CROP");
        intent.setDataAndType(inUri, "image/*");
        intent.putExtra(MediaStore.EXTRA_OUTPUT, outUri);
        intent.putExtra("crop", "true");
//        intent.putExtra("aspectX", sW);// 裁剪框比例
//        intent.putExtra("aspectY", sH);
//        intent.putExtra("outputX", 700);// 输出图片大小
//        intent.putExtra("outputY", 300);
        intent.putExtra("return-data", false);
        intent.putExtra("outputFormat", Bitmap.CompressFormat.JPEG.toString());
        intent.putExtra("noFaceDetection", true); // no face detection

        activity.startActivityForResult(intent, CropPic);
    }




    public static void getCarmeraPic(Activity activity, Uri outUri) {
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        intent.putExtra(MediaStore.EXTRA_OUTPUT, outUri);
        activity.startActivityForResult(intent, CarmeraPic);
    }

    public static Bitmap decodeUriAsBitmap(Activity activity, Uri uri, boolean isScale) {
        Bitmap bitmap = null;
        try {
            Options options = new Options();
            options.inJustDecodeBounds = true;
            int height = options.outHeight;
            int width = options.outWidth;
            int size = height * width / (1000 * 1000);
            options.inSampleSize = size;
            options.inDensity = 100;
            options.inJustDecodeBounds = false;
            bitmap = BitmapFactory.decodeStream(activity.getContentResolver().openInputStream(uri), new Rect(), options);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return null;
        }
        if (null!=bitmap){
            return compressImage(bitmap);
        }
        return  null;
    }

    private static Bitmap compressImage(Bitmap image) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        image.compress(Bitmap.CompressFormat.JPEG, 100, baos);// 质量压缩方法，这里100表示不压缩，把压缩后的数据存放到baos中
        int options = 100;
        while (baos.toByteArray().length / 1024 > 1024 * 2) { // 循环判断如果压缩后图片是否大于2M,大于继续压缩
            baos.reset();// 重置baos即清空baos
            image.compress(Bitmap.CompressFormat.JPEG, options, baos);// 这里压缩options%，把压缩后的数据存放到baos中
            options -= 10;// 每次都减少10
        }
        ByteArrayInputStream isBm = new ByteArrayInputStream(baos.toByteArray());// 把压缩后的数据baos存放到ByteArrayInputStream中
        Bitmap bitmap = BitmapFactory.decodeStream(isBm, null, null);// 把ByteArrayInputStream数据生成图片
        return bitmap;
    }

    public static Bitmap decodeUriAsBitmap(Activity activity, Uri uri) {
        return decodeUriAsBitmap(activity, uri, true);
    }
}