package com.yaofangwang.mall.widgtes;

import android.app.Dialog;
import android.content.Context;
import android.support.annotation.Nullable;
import android.view.KeyEvent;
import android.widget.ImageView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.DataSource;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.load.resource.gif.GifDrawable;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.RequestOptions;
import com.bumptech.glide.request.target.Target;
import com.yaofangwang.mall.R;

public class LoadingDialog extends Dialog {

//    static AnimationDrawable animationDrawable;
    private static ImageView mImageView;
    private static LoadingDialog loadingDialog;
//    static FramesSequenceAnimation framesSequenceAnimation;
    private static Context mContext;

    private LoadingDialog(Context context) {
        super(context, R.style.custom_loading_dialog_style);
        mContext = context;
        setContentView(R.layout.dialog_loading);
        setCanceledOnTouchOutside(false);
        mImageView= (ImageView) findViewById(R.id.imageView);
//        framesSequenceAnimation = new FramesSequenceAnimation(context,mImageView, R.array.feed_icoxs2, 10);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode==KeyEvent.KEYCODE_BACK){
            if (loadingDialog!=null){
                if (loadingDialog.isShowing()){
                    cancelInstance();
                }
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    public static LoadingDialog showInstance(Context context) {
        if (loadingDialog == null) {
            try {
                loadingDialog = new LoadingDialog(context);
//                framesSequenceAnimation.setOneShot(false);
//                framesSequenceAnimation.start();
                startGif(context);
                loadingDialog.show();
            } catch (Exception e) {

            }
        }
        return loadingDialog;
    }

    public static void cancelInstance() {
        if (null != loadingDialog) {
                try {
                    if (loadingDialog.isShowing()) {
//                        framesSequenceAnimation.stop();
                        Glide.with(mContext).clear(mImageView);
                        mImageView.clearAnimation();
                        loadingDialog.cancel();

                    }
//                    framesSequenceAnimation=null;
                    loadingDialog = null;
                } catch (Exception e) {

                }
        }
    }

    public static void cancelForce() {
        if (null != loadingDialog) {
            try {
                if (loadingDialog.isShowing()) {
//                    framesSequenceAnimation.stop();
                    Glide.with(mContext).clear(mImageView);
                    mImageView.clearAnimation();
                    loadingDialog.cancel();
                }
                loadingDialog = null;
            } catch (Exception e) {

            }
        }
    }

    private static void startGif(Context context) {
        RequestOptions options = new RequestOptions()
                .diskCacheStrategy(DiskCacheStrategy.RESOURCE);
        Glide.with(context).asGif().load(R.drawable.loading).apply(options).listener(new RequestListener<com.bumptech.glide.load.resource.gif.GifDrawable>() {

            @Override
            public boolean onLoadFailed(@Nullable GlideException e, Object model, Target<GifDrawable> target, boolean isFirstResource) {
                return false;
            }

            @Override
            public boolean onResourceReady(GifDrawable resource, Object model, Target<GifDrawable> target, DataSource dataSource, boolean isFirstResource) {
                GifDrawable drawable = (GifDrawable) resource;
                drawable.startFromFirstFrame();
                return false;
            }

        }).into(mImageView);
    }
}


