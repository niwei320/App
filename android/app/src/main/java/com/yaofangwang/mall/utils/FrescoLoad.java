package com.yaofangwang.mall.utils;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;

import com.facebook.common.executors.CallerThreadExecutor;
import com.facebook.common.references.CloseableReference;
import com.facebook.datasource.BaseDataSubscriber;
import com.facebook.datasource.DataSource;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.drawee.interfaces.DraweeController;
import com.facebook.drawee.view.SimpleDraweeView;
import com.facebook.imagepipeline.core.ImagePipeline;
import com.facebook.imagepipeline.image.CloseableBitmap;
import com.facebook.imagepipeline.request.ImageRequest;
import com.facebook.imagepipeline.request.ImageRequestBuilder;
import com.yaofangwang.mall.BuildConfig;

import java.io.File;

/**
 * Created by marti on 2018/7/13.
 */

public class FrescoLoad {

    /**
     * 必须初始化
     *
     * @param con
     */
    public static void init(Context con) {
        Fresco.initialize(con);
    }

    /**
     * 加载图片，支持本地路径，本地res资源图片，网络链接
     *
     * @param img
     * @param url
     */
    public static void load(SimpleDraweeView img, Object url) {
        Uri uri;
        //如果是链接或者路径
        if (url instanceof String) {
            uri = parse((String) url);
        }
        //如果是res下的资源
        else if (url instanceof Integer) {
            uri = parse((Integer) url);
        }
        //如果是图片文件
        else if (url instanceof File) {
            uri = parse((File) url);
        } else {
            //暂时只支持这几种加载，如果传参不对则直接返回不加载
            return;
        }
        load(img, uri);
    }

    /**
     * 加载Assets图片文件
     *
     * @param img
     * @param fileName 文件名！文件名！文件名！
     */
    public static void loadAssets(SimpleDraweeView img, String fileName) {
        load(img, Uri.parse("asset:///" + fileName));
    }

    /**
     * 加载图片方法
     * @param img
     * @param uri
     */
    private static void load(SimpleDraweeView img, Uri uri) {
        img.setController(getControl(img,uri));
    }

    /**
     * 配置控制器
     * @param img
     * @param uri
     * @return
     */
    private static DraweeController getControl(SimpleDraweeView img, Uri uri){
        return Fresco.newDraweeControllerBuilder()
                //请求配置
                .setImageRequest(getImageRequest(uri))
                //获取自带的控制器
                .setOldController(img.getController())
                //自动播放GIF
                .setAutoPlayAnimations(true)
                .build();
    }

    /**
     * 获取请求配置
     * @return
     */
    private static ImageRequest getImageRequest(Uri uri){
        ImageRequestBuilder builder = ImageRequestBuilder.newBuilderWithSource(uri)
                //渐进式加载
                .setProgressiveRenderingEnabled(true);
        return builder.build();
    }

    /**
     * 网络链接转换为URI，但其实也可以转换路径
     *
     * @param url
     * @return
     */
    private static Uri parse(String url) {
        /**
         * 这里做这个判断是方便直接传文件路径
         * 如果遵守重载的规则的话,但是每次都new一个对象其实也是不必要的
         */
        File file = new File(url);
        if (file.exists()) {
            return parse(file);
        }

        return Uri.parse(url);
    }

    /**
     * 文件转换为URI
     *
     * @param file
     * @return
     */
    private static Uri parse(File file) {
        return Uri.parse("file://" + file.getAbsolutePath());
    }

    /**
     * 资源ID转换为URI
     *
     * @param resource
     * @return
     */
    private static Uri parse(int resource) {
        return Uri.parse("res://" + BuildConfig.APPLICATION_ID + "/" + resource);
    }

    /**
     * 通过Fresco自带的下载器下载图片并获取到bitmap
     * 判断
     * @param con
     * @param url
     * @param onBitmapListener
     */
    public static void downLoadToBitmap(Context con , String url , final OnBitmapListener onBitmapListener){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            if(con != null && con instanceof Activity && !((Activity) con).isFinishing() && !((Activity) con).isDestroyed()){
                ImageRequest imageRequest = getImageRequest(parse(url));
                ImagePipeline imagePipeline = Fresco.getImagePipeline();
                imagePipeline
                        .fetchDecodedImage(imageRequest, con.getApplicationContext())
                        .subscribe(new BaseDataSubscriber() {
                            @Override
                            protected void onNewResultImpl(DataSource dataSource) {
                                CloseableReference imageReference = (CloseableReference) dataSource.getResult();
                                if (imageReference != null) {
                                    final CloseableBitmap image = (CloseableBitmap) imageReference.get();
                                    if( onBitmapListener!=null){
                                        onBitmapListener.onBitmap(image.getUnderlyingBitmap());
                                    }
                                }
                            }

                            @Override
                            protected void onFailureImpl(DataSource dataSource) {

                            }
                        }, CallerThreadExecutor.getInstance());
            }
        }
    }

    /**
     * Bitmap回调
     */
    public interface OnBitmapListener{
        void onBitmap(Bitmap bitmap);
    }
}
