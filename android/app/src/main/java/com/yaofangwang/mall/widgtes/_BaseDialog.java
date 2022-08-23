package com.yaofangwang.mall.widgtes;

import android.app.Dialog;
import android.content.Context;
import android.text.Html;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.yaofangwang.mall.R;
import com.yaofangwang.mall.TUtils.TUtils;

public abstract class _BaseDialog<T> extends Dialog implements View.OnClickListener {

    private static final int WIDTH_ZOOM_TIMES = 10;
    private static final int PADDING_NUM = 4;
    protected Context mContext;
    protected LayoutInflater mInflater;
    protected View mContentView;
    protected TextView mTVLeftButton;
    protected TextView mTVRightButton;
    protected TextView mTVContent;
    protected LinearLayout mContentLayout;
    private TextView mTitleText;
    private LinearLayout mTitle;

    public _BaseDialog(Context context, String title) {
        super(context, R.style.custom_dialog_style);
        mContext = context;
        mInflater = LayoutInflater.from(context);
        initViews();
        initListener();
        initDatas(title);
    }

    public void setLeftButtonGone(){
        mTVLeftButton.setVisibility(View.GONE);
    }

    private void initViews() {
        setContentView(R.layout.dialog_base_layout);
        mTVLeftButton = (TextView) findViewById(R.id.dialog_base_btn1);
        mTVRightButton = (TextView) findViewById(R.id.dialog_base_btn2);
        mContentLayout = (LinearLayout) findViewById(R.id.dialog_base_content);
        mTVContent = (TextView) findViewById(R.id.dialog_base_contenttext);
        mTitleText = (TextView) findViewById(R.id.dialog_base_titletext);
        mTitle = (LinearLayout) findViewById(R.id.dialog_base_title);
    }



    public void setBaseTitle(String title){
        mTitle.setVisibility(View.VISIBLE);
        mTitleText.setText(title);
    }

    public void setData(String htmlStr, boolean isHtml) {
        mContentView = getView(null);
        if (null == mContentView) {
            mTVContent.setText(Html.fromHtml(htmlStr));
            mContentView = mTVContent;
        } else {
            mContentLayout.removeAllViews();
            mContentLayout.addView(mContentView);
        }
    }

    public void setData(T data) {
        mContentView = getView(data);
        if (null == mContentView) {
            mTVContent.setText(data.toString());
            mContentView = mTVContent;
        } else {
            mContentLayout.removeAllViews();
            mContentLayout.addView(mContentView);
        }
    }

    private void initListener() {
        mTVLeftButton.setOnClickListener(this);
        mTVRightButton.setOnClickListener(this);
    }

    private void initDatas(String title) {
        mTVLeftButton.setText(getContext().getResources().getString(R.string.toast_confirm));
        mTVRightButton.setVisibility(View.GONE);
        if(!TextUtils.isEmpty(title)){
            setBaseTitle(title);
        }
        Window window = getWindow();
        WindowManager.LayoutParams params = window.getAttributes();
        WindowManager windowManager = (WindowManager) mContext.getSystemService(Context.WINDOW_SERVICE);
        DisplayMetrics outMetrics = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(outMetrics);
        params.width = TUtils.dp2px(mContext, 270);
        params.gravity = Gravity.CENTER;
        window.setAttributes(params);
    }

    public _BaseDialog setRightButton(String text, OnClickListener rightClick) {
        mTVRightButton.setVisibility(View.VISIBLE);
        mTVRightButton.setText(text);
        mRightClickListener = rightClick;
        return this;
    }

    public _BaseDialog setLeftButton(String text, OnClickListener leftClick) {
        mTVLeftButton.setText(text);
        mTVLeftButton.setVisibility(View.VISIBLE);
        mLeftClickListener = leftClick;
        return this;
    }

    public _BaseDialog setOnbackFalse(OnKeyListener mKeylistener) {
        keylistener = mKeylistener;
        return this;
    }

    public abstract View getView(T data);

    OnClickListener mLeftClickListener;
    OnClickListener mRightClickListener;

    OnKeyListener keylistener;

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.dialog_base_btn1:
                if (null != mLeftClickListener) {
                    mLeftClickListener.onClick(this, -2);
                }
                cancel();
                break;
            case R.id.dialog_base_btn2:
                if (null != mRightClickListener) {
                    mRightClickListener.onClick(this, -1);
                }
                cancel();
                break;

            default:
                break;
        }
    }


}
