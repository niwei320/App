package com.yaofangwang.mall.widgtes;

import android.app.Dialog;
import android.content.Context;
import android.view.LayoutInflater;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.yaofangwang.mall.R;

public class UpdateDialog extends Dialog {
    protected Context mContext;
    protected LayoutInflater mInflater;
    protected TextView mTVTitle;
    protected TextView dialog_base_contenttext;
    protected TextView dialog_base_contenttext1;
    protected ProgressBar mPb;

    public UpdateDialog(Context context) {
        super(context, R.style.custom_dialog_style);
        mContext = context;
        mInflater = LayoutInflater.from(context);
        initViews();
        initDatas();
    }

    private void initViews() {
        setContentView(R.layout.dialog_base_layout_update);
        mTVTitle = (TextView) findViewById(R.id.dialog_base_title);
        dialog_base_contenttext = (TextView) findViewById(R.id.dialog_base_contenttext);
        dialog_base_contenttext1 = (TextView) findViewById(R.id.dialog_base_contenttext1);
        mPb = (ProgressBar) findViewById(R.id.update_pb);
    }

    private void initDatas() {
        mTVTitle.setText(getContext().getResources().getString(R.string.toast_download_prompt));
        dialog_base_contenttext.setText(getContext().getResources().getString(R.string.toast_download_wait) + "...");
        dialog_base_contenttext1.setText("0%");
    }

    public void setProgress(int value) {
        mPb.setProgress(value);
        dialog_base_contenttext1.setText("" + value + "%");
    }
}
