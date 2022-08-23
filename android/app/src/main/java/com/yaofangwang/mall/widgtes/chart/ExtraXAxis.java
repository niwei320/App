package com.yaofangwang.mall.widgtes.chart;

import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.utils.Utils;

/**
 * Created by marti on 2018/6/26.
 */

public class ExtraXAxis extends XAxis {
    private float labelSpacing = 0f;

    public float getLabelSpacing() {
        return labelSpacing;
    }

    public void setLabelSpacing(float labelSpacing) {
        this.labelSpacing = Utils.convertDpToPixel(labelSpacing);
    }
}
