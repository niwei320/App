package com.yaofangwang.mall.widgtes;

import android.content.Context;
import android.widget.TextView;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.MarkerView;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.highlight.Highlight;
import com.github.mikephil.charting.utils.MPPointF;
import com.yaofangwang.mall.R;

/**
 * Created by marti on 2018/6/28.
 */

public class ChartMarkerView extends MarkerView {
    private TextView dataTv, averageTv, averagePriceTv;
    private LineChart chart;
    public ChartMarkerView(Context context, LineChart chart, int layoutResource) {
        super(context, layoutResource);
        dataTv = findViewById(R.id.dateTv);
        averageTv = findViewById(R.id.averageTv);
        averagePriceTv = findViewById(R.id.averagePriceTv);
        //markerview提供的方法chart为null，所以自己传入进来
        this.chart = chart;
    }

    @Override
    public void refreshContent(Entry e, Highlight highlight) {
        if(e.getData() instanceof String){
            dataTv.setText(e.getData().toString());
            averageTv.setText("平均成交价格 ");
            averagePriceTv.setText(String.format("%.2f", e.getY()));
        }
        super.refreshContent(e, highlight);
    }


    private final float PADDING_SIZE = 10f;
    private final float STOKE_WIDTH = 5f;//这里对于stroke_width的宽度也要做一定偏移

    @Override
    public MPPointF getOffsetForDrawingAtPoint(float posX, float posY) {

        // posY posX 指的是markerView左上角点在图表上面的位置 处理Y方向
        if (posY <= getHeight() + PADDING_SIZE) {
            // 如果点y坐标小于markerView的高度，如果不处理会超出上边界
            getOffset().y = PADDING_SIZE;
        } else {
            //否则属于正常情况，因为我们默认是箭头朝下，然后正常偏移就是，需要向上偏移markerView高度和arrow size，再加一个stroke的宽度，因为你需要看到对话框的上面的边框
            getOffset().y = -getHeight() - PADDING_SIZE - STOKE_WIDTH; // 40 arrow height   5 stroke width
        }

        //处理X方向，分为3种情况，1、在图表左边 2、在图表中间 3、在图表右边
        if (posX > chart.getWidth() - getWidth()) {
            //如果超过右边界，则向左偏移markerView的宽度
            getOffset().x = -getWidth()-10f;
        } else {
            //默认情况
            getOffset().x = 0f+10f;
        }

        return getOffset();
    }
}
