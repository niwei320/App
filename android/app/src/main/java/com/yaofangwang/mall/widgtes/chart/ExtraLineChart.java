package com.yaofangwang.mall.widgtes.chart;


import android.content.Context;
import android.graphics.Canvas;
import android.util.AttributeSet;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.interfaces.datasets.ILineDataSet;
import com.github.mikephil.charting.renderer.XAxisRenderer;
import com.github.mikephil.charting.utils.MPPointF;
import com.github.mikephil.charting.utils.Utils;

import java.util.List;

/**
 * Created by marti on 2018/6/25.
 */

public class ExtraLineChart extends LineChart {
    public ExtraLineChart(Context context) {
        super(context);
    }

    public ExtraLineChart(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public ExtraLineChart(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    @Override
    protected void init() {
        super.init();
        mXAxis = new ExtraXAxis();
        mXAxisRenderer = new XAxisRenderer(mViewPortHandler, mXAxis, mLeftAxisTransformer) {
            ExtraXAxis mXAxis;

            {
                mXAxis = (ExtraXAxis) this.mAxis;
            }

            @Override
            protected void drawLabels(Canvas c, float pos, MPPointF anchor) {
                final float labelRotationAngleDegrees = mXAxis.getLabelRotationAngle();
                List<ILineDataSet> dataSets = getLineData().getDataSets();
                if(dataSets!=null && dataSets.size()>0) {

                    /*
                    * 这里只按第一条线的点来绘，如果有多条线，建议用一天透明的线作为第一条线
                    * 然后根据第一条线绘制Label
                    * */
                    for (int i = 0; i < 1; i++) {
                        for (int j = 0; j < dataSets.get(i).getEntryCount(); j++) {
                            Entry entry = ((LineDataSet) dataSets.get(i)).getValues().get(j);

                            mGetPositionBuffer[0] = entry.getX();
                            mGetPositionBuffer[1] = entry.getY();

                            mTrans.pointValuesToPixel(mGetPositionBuffer);
                            MPPointF instance = MPPointF.getInstance(mGetPositionBuffer[0], mGetPositionBuffer[1]);


                            String label = mXAxis.getValueFormatter().getFormattedValue(j, mXAxis);
                            int width = Utils.calcTextWidth(mAxisLabelPaint, label);

                            /*
                            * 这里判断，如果字符太长就计算，只是四个字符内则不用
                            * */
//                            if(!TextUtils.isEmpty(label) && label.length()>=4){
//                                if (j == 0) {
//                                    width -= width / 2;
//                                } else if (j == ((LineDataSet) dataSets.get(i)).getValues().size() - 1) {
//                                    width = -width / 2;
//                                } else {
//                                    width = 0;
//                                }
//                            }else{
                                width = 0;
//                            }

                            float x = 0;
                            //修复setXOffset不起作用
                            x -= mXAxis.getXOffset();
                            //增加Label之间的距离
                            if (i > 0)
                                x += mXAxis.getLabelSpacing() * i;

                            drawLabel(c, label, instance.getX() + x + width, pos, anchor, labelRotationAngleDegrees);
                        }
                    }
                }
            }
        };
    }

    @Override
    public ExtraXAxis getXAxis() {
        return (ExtraXAxis) super.getXAxis();
    }
}
