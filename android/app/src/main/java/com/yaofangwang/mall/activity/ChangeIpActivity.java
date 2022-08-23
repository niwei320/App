package com.yaofangwang.mall.activity;

import android.app.Activity;
import android.databinding.DataBindingUtil;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.ColorInt;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.IpBean;
import com.yaofangwang.mall.databinding.ActivityChangeIpBinding;

import static com.sobot.chat.widget.kpswitch.util.StatusBarHeightUtil.getStatusBarHeight;

public class ChangeIpActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ActivityChangeIpBinding changeIpBinding =  DataBindingUtil.setContentView(this,R.layout.activity_change_ip);
        ChangeIpViewModel changeIpViewModel = new ChangeIpViewModel(this);
        changeIpBinding.setChangIp(changeIpViewModel);
        changeIpBinding.setProgress(changeIpViewModel.mProgress);
        changeIpBinding.setIpName(new IpBean());
        setStatusBarView(this, 0xFFFFFF, 1);
    }

    private void setStatusBarView(Activity activity, @ColorInt int color, int alpha) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            // 绘制一个和状态栏一样高的矩形
            View statusBarView = findViewById(R.id.status_view);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, getStatusBarHeight(activity));
            statusBarView.setLayoutParams(params);
            // statusBarView.setBackgroundColor(color);
        }
    }
}
