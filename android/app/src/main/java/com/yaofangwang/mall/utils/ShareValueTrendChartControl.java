package com.yaofangwang.mall.utils;

import android.content.Context;
import android.content.Intent;
import android.databinding.DataBindingUtil;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.text.SpannableString;
import android.view.LayoutInflater;
import android.view.View;

import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.formatter.ValueFormatter;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.ValueTrendChartBean;
import com.yaofangwang.mall.bean.ValueTrendChartInfoBean;
import com.yaofangwang.mall.databinding.ViewShareValueTrendChartBinding;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by marti on 2018/7/5.
 * 分享折线图
 */
public class ShareValueTrendChartControl extends BaseShareControl {

    private ViewShareValueTrendChartBinding binding;
    private ValueTrendChartInfoBean bean;
    float scaling = 1f;//折线图缩放比例

    public ShareValueTrendChartControl(Context con, Intent dataIntent) {
        super(con, dataIntent);
    }

    @Override
    public View initView() {
        bean = (ValueTrendChartInfoBean) dataIntent.getSerializableExtra("bean");
        binding = DataBindingUtil.inflate(LayoutInflater.from(con), R.layout.view_share_value_trend_chart, null, false);
        binding.setBean(bean);

        initChart();
        setChartData(bean.getChart_item());

        SpannableString millTitle = new SpannableString(bean.getMill_title() + bean.getTime());
        RadiusBackgroundSpan backgroundSpan = new RadiusBackgroundSpan(
                con,
                Color.parseColor("#ff9a67"),//背景颜色
                Color.parseColor("#ff605e"),//背景颜色
                Color.parseColor("#fefefe"),//字体颜色
                bean.getTime(),
                7,
                4,
                2,
                2
        );
        backgroundSpan.setDrawShadow(true);
        millTitle.setSpan(backgroundSpan, bean.getMill_title().length(), millTitle.length(), SpannableString.SPAN_EXCLUSIVE_EXCLUSIVE);
        binding.companyTv.setText(millTitle);
        return binding.getRoot();
    }

    @Override
    public String getQRCodeURL() {
        return dataIntent.getStringExtra("QRCODE");
    }

    @Override
    public void setQRCodeBitmap(Bitmap bitmap) {
        binding.qrcodeIv.setImageBitmap(bitmap);
    }


    /**
     * 初始化图表
     */
    private void initChart() {
        LineChartSettings.settingXAxis(binding.chart.getXAxis());
        LineChartSettings.settingYAxis(binding.chart);
        LineChartSettings.settingChart(binding.chart);
        binding.chart.setNoDataText("暂无数据");
        binding.chart.setTouchEnabled(false);

        //根据视图需要修改尺寸

        binding.chart.getXAxis().setTextSize(8f * scaling);
        binding.chart.getAxisLeft().setTextSize(6f * scaling);
    }

    /**
     * 设置数据
     */
    private void setChartData(final ValueTrendChartBean bean) {
        List<Entry> list = new ArrayList<>();

        if (bean != null && bean.getItem_prices() != null) {
            List<ValueTrendChartBean.ItemPricesBean> datas = bean.getItem_prices();
            for (int i = 0; i < bean.getItem_prices().size(); i++) {
                list.add(new Entry(i, Float.valueOf(datas.get(i).getPrice()), datas.get(i).getTime()));
            }
        }

        LineDataSet sets = new LineDataSet(list, "line1");
        LineChartSettings.settingLineDataSet(sets);
        //设置圆的radius，单位DP
        sets.setCircleRadius(4.5f * scaling);
        //设置空心圆的radius,单位DP
        sets.setCircleHoleRadius(3f * scaling);
        //设置线条的宽度,单位DP
        sets.setLineWidth(2);
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
}
