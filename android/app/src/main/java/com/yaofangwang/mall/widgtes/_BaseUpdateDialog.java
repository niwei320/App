package com.yaofangwang.mall.widgtes;

import android.app.Dialog;
import android.content.Context;
import android.text.Html;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnticipateInterpolator;
import android.view.animation.TranslateAnimation;
import android.widget.ImageView;
import android.widget.TextView;

import com.yaofangwang.mall.R;

public abstract class _BaseUpdateDialog<T> extends Dialog implements View.OnClickListener {

    private static final int WIDTH_ZOOM_TIMES = 10;
    private static final int PADDING_NUM = 2;
    protected Context mContext;
    protected LayoutInflater mInflater;
    protected View mContentView;
    protected TextView mTVLeftButton;
    protected TextView mTVRightButton;
    protected TextView mTVContent;
    private ImageView mImageView;

    public _BaseUpdateDialog(Context context, String title) {
        super(context, R.style.custom_dialog_style);
        mContext = context;
        mInflater = LayoutInflater.from(context);
        initViews();
        initDatas();
    }

    private void initViews() {
        setContentView(R.layout.dialog_update_layout);
        mTVLeftButton = (TextView) findViewById(R.id.dialog_base_btn1);
        mTVRightButton = (TextView) findViewById(R.id.dialog_base_btn2);
        mTVContent = (TextView) findViewById(R.id.dialog_base_contenttext);
        mImageView = (ImageView) findViewById(R.id.imageview);
        mTVLeftButton.setOnClickListener(this);
        mTVRightButton.setOnClickListener(this);
    }

    public void setData(T data) {
        mTVContent.setText(Html.fromHtml(data.toString()));
        int[] location = new int[2];
        mImageView.getLocationOnScreen(location);
        int x = location[0];
        int y = location[1];
        final TranslateAnimation animation = new TranslateAnimation(x, x - 15, y, y - 15);
        animation.setDuration(1000);
        animation.setRepeatCount(-1);
        animation.setRepeatMode(Animation.REVERSE);
        animation.setInterpolator(new AnticipateInterpolator());
        mImageView.setAnimation(animation);
        animation.start();
    }

    private void initDatas() {
        mTVRightButton.setVisibility(View.GONE);
        Window window = getWindow();
        WindowManager.LayoutParams params = window.getAttributes();
        WindowManager windowManager = (WindowManager) mContext.getSystemService(Context.WINDOW_SERVICE);
        DisplayMetrics outMetrics = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(outMetrics);
//        params.width = outMetrics.widthPixels - outMetrics.widthPixels / WIDTH_ZOOM_TIMES * PADDING_NUM;
        params.gravity = Gravity.CENTER;
        window.setAttributes(params);
    }

    public _BaseUpdateDialog setRightButton(String text, OnClickListener rightClick) {
        mTVRightButton.setVisibility(View.VISIBLE);
        mTVRightButton.setText(text);
        mRightClickListener = rightClick;
        return this;
    }

    public _BaseUpdateDialog setLeftButton(String text, OnClickListener leftClick) {
        mTVLeftButton.setText(text);
        mTVLeftButton.setVisibility(View.VISIBLE);
        mLeftClickListener = leftClick;
        return this;
    }

    public void setLeftGone() {
        mTVLeftButton.setVisibility(View.GONE);
    }

    OnClickListener mLeftClickListener;
    OnClickListener mRightClickListener;

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.dialog_base_btn1:
                if (null != mLeftClickListener) {
                    mImageView.clearAnimation();
                    mLeftClickListener.onClick(this, -2);
                }
                break;
            case R.id.dialog_base_btn2:
                if (null != mRightClickListener) {
                    mRightClickListener.onClick(this, -1);
                }
//                cancel();
                break;
            default:
                break;
        }
    }
}
