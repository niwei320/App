package com.yaofangwang.mall.activity;

import android.app.Activity;
import android.arch.lifecycle.Observer;
import android.arch.lifecycle.ViewModelProviders;
import android.content.Intent;
import android.databinding.DataBindingUtil;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.ColorInt;
import android.support.annotation.Nullable;
import android.text.SpannableString;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;

import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.formatter.ValueFormatter;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall._BaseActivity;
import com.yaofangwang.mall.bean.ValueTrendChartBean;
import com.yaofangwang.mall.bean.ValueTrendChartInfoBean;
import com.yaofangwang.mall.databinding.ActivityValueTrendChartBinding;
import com.yaofangwang.mall.utils.LineChartSettings;
import com.yaofangwang.mall.utils.RadiusBackgroundSpan;
import com.yaofangwang.mall.utils.ShareValueTrendChartControl;
import com.yaofangwang.mall.widgtes.ChartMarkerView;
import com.yaofangwang.mall.widgtes.LoadingDialog;

import java.util.ArrayList;
import java.util.List;

import static com.sobot.chat.widget.kpswitch.util.StatusBarHeightUtil.getStatusBarHeight;

/**
 * Created by marti on 2018/6/20.
 * 价格趋势-折线图
 */

public class ValueTrendChartActivity extends _BaseActivity {
    private ActivityValueTrendChartBinding binding;
    private ValueTrendChartViewModel viewModel;
    private String medicineId;
    private String ssid;
    private ImageView topRightTv;
    private boolean isTcp;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = DataBindingUtil.setContentView(this, R.layout.activity_value_trend_chart);
        //ReactNative特别处理，添加状态栏
        setStatusBarView(this,0xFFFFFF,1);
        medicineId = getIntent().getStringExtra("goodsID");
        ssid = getIntent().getStringExtra("ssid");
        isTcp = getIntent().getBooleanExtra("isTcp",false);
        topRightTv = findViewById(R.id.top_right_tv);
        findViewById(R.id.top_left).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        initViewModel();
        initChart();
        initObserver();
        initListener();
        viewModel.getData();
    }

    /**
     * 设置状态栏
     * @param activity
     * @param color
     * @param alpha
     */
    private void setStatusBarView(Activity activity, @ColorInt int color, int alpha) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            // 绘制一个和状态栏一样高的矩形
            View statusBarView = findViewById(R.id.statusView);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, getStatusBarHeight(activity));
            statusBarView.setLayoutParams(params);
        }
    }

    /**
     * 初始化ViewModel
     */
    private void initViewModel() {
        viewModel = ViewModelProviders.of(this).get(ValueTrendChartViewModel.class);
        viewModel.setContext(this);
        viewModel.setGoodsID(medicineId);
        viewModel.setSSID(ssid);
        viewModel.setTcp(isTcp);
        binding.setViewModel(viewModel);
    }

    /**
     * 监听LiveData
     */
    private void initObserver() {
        viewModel.chartData.observe(this, new Observer<ValueTrendChartBean>() {
            @Override
            public void onChanged(@Nullable ValueTrendChartBean valueTrendChartBean) {
                setChartData(valueTrendChartBean);
            }
        });
        viewModel.infoBean.observe(this, new Observer<ValueTrendChartInfoBean>() {
            @Override
            public void onChanged(@Nullable ValueTrendChartInfoBean bean) {
                binding.setBean(bean);
                initView(bean);
            }
        });
        viewModel.isShowLoading.observe(this, new Observer<Boolean>() {
            @Override
            public void onChanged(@Nullable Boolean aBoolean) {
                if(aBoolean){
                    LoadingDialog.showInstance(ValueTrendChartActivity.this);
                }else{
                    LoadingDialog.cancelInstance();
                }
            }
        });
    }

    /**
     * 初始化基础控件
     */
    private void initView(ValueTrendChartInfoBean bean) {
        Drawable drawable;
        if (bean != null && !TextUtils.isEmpty(bean.getPrice_sort())) {
            if (bean.getPrice_sort().equals("up")) {
                drawable = getResources().getDrawable(R.drawable.icon_value_trend_item_up);
            } else if (bean.getPrice_sort().equals("down")) {
                drawable = getResources().getDrawable(R.drawable.icon_value_trend_item_down);
            } else{
                drawable = getResources().getDrawable(R.drawable.icon_value_trend_ranking_line);
            }
        } else {
            drawable = getResources().getDrawable(R.drawable.icon_value_trend_ranking_line);
        }
        drawable.setBounds(0, 0, drawable.getMinimumWidth(), drawable.getMinimumHeight());
        binding.averageTv.setCompoundDrawables(null,null , drawable, null);
        binding.averageTv.setCompoundDrawablePadding(TUtils.dp2px(this, 1f));
        binding.goBuyTv.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        SpannableString millTitle = new SpannableString(bean.getMill_title() + bean.getTime().replace("-","."));
        RadiusBackgroundSpan backgroundSpan = new RadiusBackgroundSpan(
                this,
                Color.parseColor("#ff9a67"),//背景颜色
                Color.parseColor("#ff605e"),//背景颜色
                Color.parseColor("#fefefe"),//字体颜色
                bean.getTime().replace("-","."),
                9,
                4,
                7,
                2
        );
        backgroundSpan.setDrawShadow(true);
        millTitle.setSpan(backgroundSpan, bean.getMill_title().length(), millTitle.length(), SpannableString.SPAN_EXCLUSIVE_EXCLUSIVE);
        binding.companyTv.setText(millTitle);
    }


    /**
     * 初始化图表
     */
    private void initChart() {
        try {
            LineChartSettings.settingXAxis(binding.chart.getXAxis());
            LineChartSettings.settingYAxis(binding.chart);
        } catch (Exception e) {
            e.printStackTrace();
        }
        LineChartSettings.settingChart(binding.chart);
        binding.chart.setNoDataText("暂无数据");
        binding.chart.setMarker(new ChartMarkerView(this, binding.chart, R.layout.view_chart_marker));
    }

    /**
     * 设置数据
     */
    private void setChartData(final ValueTrendChartBean bean) {
        List<Entry> list = new ArrayList<>();

        if (bean != null && bean.getItem_prices() != null) {
            List<ValueTrendChartBean.ItemPricesBean> datas = bean.getItem_prices();
            for (int i = 0; i < bean.getItem_prices().size(); i++) {
                list.add(new Entry(i, Float.valueOf(datas.get(i).getPrice()), datas.get(i).getTime().replace("-",".")));
            }
        }

        LineDataSet sets = new LineDataSet(list, "line1");
        LineChartSettings.settingLineDataSet(sets);
        if (list.size() == 0) {
            binding.chart.setData(null);
        } else {
            binding.chart.setData(new LineData(sets));
        }

        if (bean != null && bean.getItem_times() != null) {
            //设置X轴的显示个数
            binding.chart.getXAxis().setLabelCount(bean.getItem_times().size());
        }
        //格式化Label内容
        binding.chart.getXAxis().setValueFormatter(new ValueFormatter() {
            @Override
            public String getFormattedValue(float value) {
                /*
                * 因为它自己也会调用这个方法，会返回小数点和大于数组的值，所以判断
                * 超出数组则不管，最后一次调用这个回调的肯定是自己在控件里返回正确的索引
                * */
                if (value >= bean.getItem_times().size()) {
                    return "";
                }

                return bean.getItem_times().get((int) value).getTime();
            }
        });

        //刷新数据，但不会刷新视图
        binding.chart.notifyDataSetChanged();
        //刷新视图，但不会刷新数据，notifySetDataChange() + invalidate()就可以一起刷新
        binding.chart.invalidate();
    }

    /**
     * 初始化事件
     */
    private void initListener() {
        //点击弹出分享
        topRightTv.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(ValueTrendChartActivity.this, SharePosterActivity.class);
                intent.putExtra("bean", viewModel.infoBean.getValue());
                intent.putExtra("QRCODE", "http://android.myapp.com/myapp/detail.htm?apkName=com.yaofangwang.mall&ADTAG=mobile");
                intent.putExtra("shareClass", ShareValueTrendChartControl.class.getName());
                intent.putExtra("isTcp",isTcp);

                startActivity(intent);
                overridePendingTransition(R.anim.in, 0);
            }
        });
    }

}
