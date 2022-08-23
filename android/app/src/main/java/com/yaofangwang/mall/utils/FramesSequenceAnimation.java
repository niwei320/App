package com.yaofangwang.mall.utils;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.Message;
import android.widget.ImageView;

import com.yaofangwang.mall.R;

import java.lang.ref.SoftReference;

public class FramesSequenceAnimation {

    private int[] animationFrames; // animation frames
    private int currentFrames;   // current frame
    private boolean shouldRun;   // true if the animation should continue running. Used to stop the animation
    private boolean isRunning;   // true if the animation currently running. prevents starting the animation twice
    private SoftReference<ImageView> mSoftReferenceImageView; // Used to prevent holding ImageView when it should be dead.
    private Handler handler;
    private int delayMillis; // the gap of frames
    private int framesResourceID;
    private boolean oneShot = false;
    private Context context;
    private FramesSequenceAnimationListener onAnimationStoppedListener;
    private int mScrollHeihgt;
    int viewHeight;

    private Bitmap mBitmap = null;
    private BitmapFactory.Options mBitmapOptions;//Bitmap管理类，可有效减少Bitmap的OOM问题

    public FramesSequenceAnimation(Context context, ImageView imageView, int framesResourceID, int fps) {
        this.context = context;
        this.framesResourceID = framesResourceID;
        currentFrames = -1;
        shouldRun = false;
        isRunning = false;
        delayMillis = 1000 / fps;
        mSoftReferenceImageView = new SoftReference<>(imageView);
        handler = new Handler();
        getFramesResource();

        // 当图片大小类型相同时进行复用，避免频繁GC
        imageView.setImageResource(animationFrames[0]);
        if (Build.VERSION.SDK_INT >= 11) {
            Bitmap bmp = ((BitmapDrawable) imageView.getDrawable()).getBitmap();
            int width = bmp.getWidth();
            int height = bmp.getHeight();
            Bitmap.Config config = bmp.getConfig();
            mBitmap = Bitmap.createBitmap(width, height, config);
            mBitmapOptions = new BitmapFactory.Options();
            //设置Bitmap内存复用
            mBitmapOptions.inBitmap = mBitmap;//Bitmap复用内存块，类似对象池，避免不必要的内存分配和回收
            mBitmapOptions.inMutable = true;//解码时返回可变Bitmap
            mBitmapOptions.inSampleSize = 1;//缩放比例
        }
    }

    public void setOneShot(boolean oneShot) {
        this.oneShot = oneShot;
    }

    private int getNext() {
        currentFrames++;
        if (currentFrames >= animationFrames.length) {
            if (oneShot) {
                shouldRun = false;
                currentFrames = animationFrames.length - 1;
            } else {
                currentFrames = 0;
            }
        }
        return animationFrames[currentFrames];
    }

    public synchronized void start() {
        shouldRun = true;
        if (isRunning) {
            return;
        }

        handler.post(runnable);
    }

    Runnable runnable = new Runnable() {
        @Override
        public void run() {
            ImageView imageView = mSoftReferenceImageView.get();
            if (!shouldRun || imageView == null) {
                isRunning = false;
                if (onAnimationStoppedListener != null) {
                    onAnimationStoppedListener.AnimationStopped();
                }
                return;
            }
            isRunning = true;
            handler.postDelayed(this, delayMillis);
//            int imageRes = animationFrames[0];
            if (R.array.feed_icoxs2 == framesResourceID) {
//                imageView.setImageResource(getNext());
                int imageRes = getNext();
                if (mBitmap != null) { // so Build.VERSION.SDK_INT >= 11
                    Bitmap bitmap = null;
                    try {
                        bitmap = BitmapFactory.decodeResource(imageView.getResources(), imageRes, mBitmapOptions);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    if (bitmap != null) {
                        imageView.setImageBitmap(bitmap);
                    } else {
                        imageView.setImageResource(imageRes);
                        mBitmap.recycle();
                        mBitmap = null;
                    }
                } else {
                    imageView.setImageResource(imageRes);
                }
            } else if (R.array.feed_icons3 == framesResourceID) {

//                imageView.setImageResource(getNext());
                int imageRes = getNext();
                if (mBitmap != null) { // so Build.VERSION.SDK_INT >= 11
                    Bitmap bitmap = null;
                    try {
                        bitmap = BitmapFactory.decodeResource(imageView.getResources(), imageRes, mBitmapOptions);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    if (bitmap != null) {
                        imageView.setImageBitmap(bitmap);
                    } else {
                        imageView.setImageResource(imageRes);
                        mBitmap.recycle();
                        mBitmap = null;
                    }
                } else {
                    imageView.setImageResource(imageRes);
                }
            } else {
                if (mScrollHeihgt > viewHeight) {
//                    imageRes = animationFrames[animationFrames.length - 1];
//                                InputStream is = imageView.getResources().openRawResource(animationFrames[animationFrames.length-1]);
//                                bitmap= BitmapFactory.decodeStream(is,null,bitmapOptions);
//                    imageView.setImageResource(imageRes);
                } else {
//                    int position = (int) ((mScrollHeihgt - 70) / 5);
//                    if (position > 19 || position < 0) {
//                        imageView.setImageResource(animationFrames[0]);
//                    } else {
//                        Log.e("position", "" + position);
//                        imageRes = animationFrames[position];
//                        imageView.setImageResource(imageRes);
//                    }
//                                InputStream is = imageView.getResources().openRawResource(animationFrames[position]);
//                                bitmap = BitmapFactory.decodeStream(is,null,bitmapOptions);
                }
            }
//                        if (bitmap != null) {
//                            imageView.setImageBitmap(bitmap);
//                        } else {
//                            imageView.setImageResource(imageRes);
//                            bitmap.recycle();
//                            bitmap = null;
//                        }
        }
    };
    Handler handlerStop = new Handler() {
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case 1:
                    handler.removeCallbacks(runnable);
                    break;
            }
            super.handleMessage(msg);
        }

    };

    /**
     * Stops the animation
     */
    public synchronized void stop() {
        shouldRun = false;
    }

    private void getFramesResource() {
        TypedArray typedArray = context.getResources().obtainTypedArray(framesResourceID);
        int longth = typedArray.length();
        animationFrames = new int[longth];
        for (int index = 0; index < longth; index++) {
            int feedResId = typedArray.getResourceId(index, 0);
            animationFrames[index] = feedResId;
        }
        typedArray.recycle();
    }

    public void setFramesSequenceAnimationListener(FramesSequenceAnimationListener onAnimationStoppedListener) {
        this.onAnimationStoppedListener = onAnimationStoppedListener;
    }


    public void setCurrentHeihgt(int startHeight, int scrollHeihgt) {
        mScrollHeihgt = scrollHeihgt;
        viewHeight = startHeight;
    }

    public interface FramesSequenceAnimationListener {
        public void AnimationStopped();

        public void AnimationStarted();
    }

    public int getCurrentFrames() {
        return currentFrames;
    }

    public void setCurrentFrames(int currentFrames) {
        this.currentFrames = currentFrames;
        mSoftReferenceImageView.get().setImageResource(animationFrames[0]);
    }
}
