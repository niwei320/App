package com.yaofangwang.mall.utils;

import android.graphics.Color;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.formatter.ValueFormatter;

/**
 * Created by marti on 2018/7/3.
 */

public class LineChartSettings {
    public static void settingChart(LineChart chart){
        //启用/禁用拖动X/Y（平移）图表
        chart.setDragXEnabled(true);
        chart.setDragYEnabled(false);
        //启用/禁用缩放图表上的两个轴
        chart.setScaleXEnabled(true);
        chart.setScaleYEnabled(false);
        //设置为false以禁止通过在其上双击缩放图表
        chart.setDoubleTapToZoomEnabled(false);
        //禁止显示左下角线条类型说明
        chart.getLegend().setEnabled(false);
        //禁止显示右下角图表说明
        chart.getDescription().setEnabled(false);
        chart.setExtraRightOffset(26);
    }

    public static void settingXAxis(XAxis xAxis){
        //设置X轴在底部
        xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
        //不绘制网格线
        xAxis.setDrawGridLines(false);
        //设置X轴分割线颜色
        xAxis.setAxisLineColor(Color.parseColor("#DDDDDD"));
        //设置X轴分割线宽度，单位DP
        xAxis.setAxisLineWidth(1f);
        //设置Label文字大小，单位DP
        xAxis.setTextSize(8f);
        //Label字体颜色
        xAxis.setTextColor(Color.parseColor("#666666"));

        //设置Label偏移量
        xAxis.setXOffset(-0.5f);
        //设置Label间距，单位DP
//        xAxis.setLabelSpacing(1f);
//        xAxis.setGranularity(0.5f);
//        xAxis.setGranularityEnabled(true);
        //是否向中心点靠拢
//        xAxis.setCenterAxisLabels(true);
    }

    public static void settingYAxis(LineChart chart){
        YAxis axisLeft = chart.getAxisLeft();
        //不绘制右边的Y轴
        chart.getAxisRight().setEnabled(false);
        //绘制网格线
        axisLeft.setDrawGridLines(true);
        //显示网格线虚线模式
        axisLeft.enableGridDashedLine(4f, 2f, 4f);
        //Label字体颜色
        axisLeft.setTextColor(Color.parseColor("#666666"));
        //Label字体大小,单位DP
        axisLeft.setTextSize(8f);
        //设置Y轴分割线宽度，单位DP
        axisLeft.setAxisLineWidth(1f);
        //设置Y轴分割线颜色
        axisLeft.setAxisLineColor(Color.parseColor("#eeeeee"));
        //设置最小值为0
//        axisLeft.setAxisMinimum(0);
        //数据点往下移100%的距离
        axisLeft.setSpaceTop(50f);
        axisLeft.setSpaceBottom(50f);
        //格式化
        axisLeft.setValueFormatter(new ValueFormatter() {
            @Override
            public String getFormattedValue(float value) {
                return String.format("%.2f", value);
            }
        });
    }

    public static void settingLineDataSet(LineDataSet sets){
        //不绘制每个值的提示
        sets.setDrawValues(false);
        //绘制每个点的圆点
        sets.setDrawCircles(true);
        //绘制空心圆
        sets.setDrawCircleHole(true);
        //设置圆的radius，单位DP
        sets.setCircleRadius(6f);
        //设置空心圆的radius,单位DP
        sets.setCircleHoleRadius(3.5f);
        //设置圆的颜色
        sets.setCircleColor(Color.parseColor("#ddffffff"));
        //设置空心圆的颜色
        sets.setCircleHoleColor(Color.parseColor("#1fdb9b"));
        //绘制每个点点击的横竖线
        sets.setDrawHighlightIndicators(true);
        //不绘制每个点点击的横线
        sets.setDrawHorizontalHighlightIndicator(false);
        //绘制每个点点击的竖线
        sets.setDrawVerticalHighlightIndicator(true);
        //绘制每个点点击的竖线的颜色
        sets.setHighLightColor(Color.parseColor("#cccccc"));
        //设置线条的颜色
        sets.setColor(Color.parseColor("#1fdb9b"));
        //设置线条的宽度,单位DP
        sets.setLineWidth(2);
        //设置阴影
        sets.setDrawShadow(true);
        sets.setShadowColor(Color.parseColor("#80337e64"));
    }
}
