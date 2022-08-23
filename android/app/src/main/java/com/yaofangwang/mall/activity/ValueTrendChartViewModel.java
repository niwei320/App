package com.yaofangwang.mall.activity;

import android.app.Application;
import android.arch.lifecycle.AndroidViewModel;
import android.content.Context;
import android.databinding.ObservableInt;
import android.support.annotation.NonNull;
import android.text.TextUtils;

import com.google.gson.Gson;
import com.sobot.chat.utils.ToastUtil;
import com.yaofangwang.mall._BaseActivity;
import com.yaofangwang.mall.bean.TcpChartItemBean;
import com.yaofangwang.mall.bean.TcpChatConvertBean;
import com.yaofangwang.mall.bean.ValueTrendChartBean;
import com.yaofangwang.mall.bean.ValueTrendChartInfoBean;
import com.yaofangwang.mall.net.TcpUtils;
import com.yaofangwang.mall.widgtes.SingleLiveEvent;

import org.json.JSONException;
import org.json.JSONObject;

import java.lang.ref.WeakReference;
import java.util.HashMap;

/**
 * 折线图ViewModel
 */
public class ValueTrendChartViewModel extends AndroidViewModel {
    private ValueTrendChartBean chartDataDayForMonth;
    private ValueTrendChartBean chartDataMonthForThree;
    private ValueTrendChartBean chartDataMonthForYear;
    public ObservableInt clickIndex = new ObservableInt(1);//默认选中第一个
    public SingleLiveEvent<ValueTrendChartBean> chartData = new SingleLiveEvent<>();
    public SingleLiveEvent<ValueTrendChartInfoBean> infoBean = new SingleLiveEvent<>();
    public SingleLiveEvent<Boolean> isShowLoading = new SingleLiveEvent<>();

    private WeakReference<Context> con;
    private String goodsID;
    private String ssid;
    private boolean isTcp;

    public ValueTrendChartViewModel(@NonNull Application application) {
        super(application);
    }

    /**
     * 这里因为要用到Activity的网络请求，只能这么写
     *
     * @param con
     */
    public void setContext(_BaseActivity con) {
        this.con = new WeakReference<Context>(con);
    }

    /**
     * 是否TCP
     * @param tcp
     */
    public void setTcp(boolean tcp) {isTcp = tcp;}

    /**
     * 商品id
     *
     * @param goodsID
     */
    public void setGoodsID(String goodsID) {
        this.goodsID = goodsID;
    }
    public void setSSID(String ssid){this.ssid = ssid;}

    /**
     * 请求数据
     */

    public void getData() {
        isShowLoading.setValue(true);
        HashMap<String, Object> map = new HashMap<>();
        map.put("__cmd", "guest.repAvgpriceWeek.get_medicine_price_trend_info");
        map.put("medicineid", goodsID);
        new TcpUtils(con.get()).sendMessage(map, new TcpUtils.OnResponseListener() {
            @Override
            public void onResponse(String s) {
                isShowLoading.setValue(false);
                if (!TextUtils.isEmpty(s)) {
                    try {
                        TcpChatConvertBean tcpBean = new Gson().fromJson(s, TcpChatConvertBean.class);
                        ValueTrendChartInfoBean bean = tcpBean.convert();
                        isShowLoading.setValue(false);
                        infoBean.setValue(bean);
                        //默认返回近一个月的数据
                        if (bean != null && bean.getChart_item() != null) {
                            chartDataDayForMonth = bean.getChart_item();
                            chartData.setValue(chartDataDayForMonth);
                        }
                    } catch (Exception e) {
                    }
                }
            }

            @Override
            public void onError(String s) {
                isShowLoading.setValue(false);
                try {
                    JSONObject jb = new JSONObject(s);
                    Object msg = jb.opt("msg");
                    if (msg != null) {
                        ToastUtil.showToast(getApplication(), (String) msg);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /**
     * 请求折线图数据
     */
    public void getChartData(final int day) {
        isShowLoading.setValue(true);
        switch (day) {
            case 30:
                if (chartDataDayForMonth != null) {
                    chartData.setValue(chartDataDayForMonth);
                    isShowLoading.setValue(false);
                    return;
                }
                break;
            case 90:
                if (chartDataMonthForThree != null) {
                    chartData.setValue(chartDataMonthForThree);
                    isShowLoading.setValue(false);
                    return;
                }
                break;
            case 365:
                if (chartDataMonthForYear != null) {
                    chartData.setValue(chartDataMonthForYear);
                    isShowLoading.setValue(false);
                    return;
                }
                break;
        }
        HashMap<String, Object> map = new HashMap<>();
        map.put("__cmd", "guest.repAvgpriceWeek.get_medicine_price_trend_chart");
        map.put("medicineid", goodsID);
        map.put("dayCount", day);
        new TcpUtils(con.get()).sendMessage(map, new TcpUtils.OnResponseListener() {
            @Override
            public void onResponse(String s) {
                isShowLoading.setValue(false);
                if (!TextUtils.isEmpty(s)) {
                    try {
                        TcpChartItemBean itemBean = new Gson().fromJson(s, TcpChartItemBean.class);
                        if (itemBean.getResult() != null) {
                            ValueTrendChartBean bean = itemBean.getResult().convert();
                            switch (day) {
                                case 30:
                                    chartDataDayForMonth = bean;
                                    break;
                                case 90:
                                    chartDataMonthForThree = bean;
                                    break;
                                case 365:
                                    chartDataMonthForYear = bean;
                                    break;
                            }
                            chartData.setValue(bean);
                        }
                    } catch (Exception e) {

                    }
                }
            }

            @Override
            public void onError(String s) {
                isShowLoading.setValue(false);
                try {
                    JSONObject jb = new JSONObject(s);
                    Object msg = jb.opt("msg");
                    if (msg != null) {
                        ToastUtil.showToast(getApplication(), (String) msg);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /**
     * 切换日期
     */
    public void changeDate(int index) {
        if (clickIndex.get() == index) return;

        clickIndex.set(index);
        switch (clickIndex.get()) {
            case 1:
                //近一个月
                getChartData(30);
                break;
            case 2:
                //近三个月
                getChartData(90);
                break;
            case 3:
                //近一年
                getChartData(365);
                break;
        }
    }
}