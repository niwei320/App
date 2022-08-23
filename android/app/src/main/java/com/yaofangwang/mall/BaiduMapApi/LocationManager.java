package com.yaofangwang.mall.BaiduMapApi;

import android.app.Application;
import android.content.SharedPreferences;

import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.mapapi.CoordType;
import com.baidu.mapapi.SDKInitializer;
import com.google.gson.Gson;
import com.yaofangwang.mall.bean.LocationInfoBean;

import java.util.ArrayList;
import java.util.List;

import static android.content.Context.MODE_PRIVATE;

/**
 * Created by marti on 2018/7/30.
 * 定位管理类，单例
 */
public class LocationManager implements BDLocationListener {
    private static LocationManager manager;
    private LocationClient mLocationClient = null;
    private static LocationInfoBean bean;
    private List<OnLocationListener> listeners = new ArrayList<>();
    private final static int RETRY_TOTAL = 6;//连续重新定位最大次数
    private int retryCount = 0;//定位次数
    private static Application con;
    public final static int RESULT_OK = 0;
    public final static int RESULT_FAILURE = -1;
    private boolean isNeedSave = true; //是否需要存储定位信息，不怕资源共享问题，只要有一个为true，就会存储

    public static LocationManager getInstance() {
        if (manager == null) {
            synchronized (LocationManager.class) {
                if (manager == null) {
                    manager = new LocationManager();
                }
            }
        }
        return manager;
    }

    public static void init(Application con) {
        LocationManager.con = con;
        manager = getInstance();
        SDKInitializer.initialize(con);
        //自4.3.0起，百度地图SDK所有接口均支持百度坐标和国测局坐标，用此方法设置您使用的坐标类型.
        //包括BD09LL和GCJ02两种坐标，默认是BD09LL坐标。
        SDKInitializer.setCoordType(CoordType.BD09LL);
    }

    private LocationManager() {
        mLocationClient = new LocationClient(con);
        initLocation();
    }

    /**
     * 初始化定位配置
     */
    private void initLocation() {
        LocationClientOption option = new LocationClientOption();
        option.setLocationMode(LocationClientOption.LocationMode.Hight_Accuracy);
        //可选，默认高精度，设置定位模式，高精度，低功耗，仅设备

        option.setCoorType("bd09ll");
        //可选，默认gcj02，设置返回的定位结果坐标系

        /*需要连续定位在这里设置*/
        int span = 2000;
        option.setScanSpan(span);
        //可选，默认0，即仅定位一次，设置发起定位请求的间隔需要大于等于1000ms才是有效的

        option.setIsNeedAddress(true);
        //可选，设置是否需要地址信息，默认不需要

        option.setOpenGps(true);
        //可选，默认false,设置是否使用gps

        option.setLocationNotify(false);
        //可选，默认false，设置是否当GPS有效时按照1S/1次频率输出GPS结果

        option.setIsNeedLocationDescribe(true);
        //可选，默认false，设置是否需要位置语义化结果，可以在BDLocation.getLocationDescribe里得到，结果类似于“在北京天安门附近”

        option.setIsNeedLocationPoiList(true);
        //可选，默认false，设置是否需要POI结果，可以在BDLocation.getPoiList里得到

        option.setIgnoreKillProcess(false);
        //可选，默认true，定位SDK内部是一个SERVICE，并放到了独立进程，设置是否在stop的时候杀死这个进程，默认不杀死

        option.SetIgnoreCacheException(false);
        //可选，默认false，设置是否收集CRASH信息，默认收集

        option.setEnableSimulateGps(false);
        //可选，默认false，设置是否需要过滤GPS仿真结果，默认需要

        mLocationClient.setLocOption(option);
        //设置配置参数

    }

    /**
     * 开始定位, 则会把信息回调出去，并且信息也保存在本地
     *
     * @param listener
     */
    public void start(boolean isNeedSave,OnLocationListener listener) {
        if(listener == null){
            listener = new DefaultOnLocationListener();
        }
        this.isNeedSave = isNeedSave;
        listeners.add(listener);
        startAction();
    }

    /**
     * 停止定位，并清除所有回调
     */
    public void stopAll() {
        stopAction();
        listeners.clear();
    }

    /**
     * 停止定位，并清除某个回调
     *
     * @param listener
     */
    public void stop(OnLocationListener listener) {
        stopAction();
        listeners.remove(listener);
        listener = null;
    }

    /**
     * 停止定位
     */
    private void stopAction() {
        mLocationClient.unRegisterLocationListener(this);
        mLocationClient.stop();
    }

    /**
     * 开始定位
     */
    private void startAction() {
        mLocationClient.registerLocationListener(this);
        //设置监听对象
        if (mLocationClient.isStarted()) {
            mLocationClient.requestLocation();
        } else {
            mLocationClient.start();
        }
    }

    /**
     * 定位回调
     *
     * @param location
     */
    @Override
    public void onReceiveLocation(BDLocation location) {
        //获取定位结果
        switch (location.getLocType()) {
            // GPS定位结果,gps定位成功
            case BDLocation.TypeGpsLocation:
                // 网络定位结果,网络定位成功
            case BDLocation.TypeNetWorkLocation:
                // 离线定位结果,离线定位成功
            case BDLocation.TypeOffLineLocation:
                setLocation(location);
                break;
            //获取缓存数据，但是当前都需要获取最新数据，所以需要重新请求
            case BDLocation.TypeCacheLocation:
                //服务端网络定位失败，可以反馈IMEI号和大体定位时间到loc-bugs@baidu.com，会有人追查原因
            case BDLocation.TypeServerError:
                //网络不同导致定位失败，请检查网络是否通畅
            case BDLocation.TypeNetWorkException:
                //无法获取有效定位依据导致定位失败，一般是由于手机的原因，处于飞行模式下一般会造成这种结果，可以试着重启手机
            case BDLocation.TypeCriteriaException:
                retryCount++;
                if (retryCount >= RETRY_TOTAL) {
                    retryCount = 0;
                    stopAction();
                    locationResult(false,bean);
                }
                break;
        }
    }

    /**
     * 获取到地址,保存定位信息后停止定位
     *
     * @param location
     */
    private void setLocation(BDLocation location) {
        LocationInfoBean bean = null;
        //保存定位信息

        if (LocationManager.bean == null) {
            LocationManager.bean = getLocationInfo();
        }

        /*如果需要保存的话，则将内存中的bean*/
        if(isNeedSave){
            bean = LocationManager.bean;
        }else{
            bean = new LocationInfoBean();
        }

        bean.setDataForBDLocation(location);

        /*这里每次都存储在本地，是因为程序运行中只会获取内存中的信息，当下次开启APP的时候肯定每次都需要使用上一次最新的信息的*/
        SharedPreferences preference_name = con.getSharedPreferences("preference_name", MODE_PRIVATE);
        bean.isSuccess = -2;
        preference_name.edit().putString("LOCATION_INFO", new Gson().toJson(bean)).apply();
        //SPUtils.saveLocationInfo(bean);

        locationResult(true,bean);
        /*如果只是定位一次，则定位完成后停止定位，否则根据自己需要取消定位*/
        if (mLocationClient.getLocOption().getScanSpan() == 0) {
            stopAll();
        }
    }

    /**
     * 定位结果
     * 回调的方法如果返回true，则将该回调加入集合中，然后遍历移除掉需要停止回调的接口
     * 并且定位也将停止，因为定位是全局的，所以如果有连续定位得地方，也将会停止
     * 但如果只是因为想用定位数据就去定位，其实可以使用连续定位后存在本地的信息，或者是上一次定位信息
     * 建议每次进入APP定位一次，定位之前的请求使用getLocationInfo的数据，定位完成后再请求一次
     *
     * @param isSuccess 是否定位成功
     */
    private void locationResult(boolean isSuccess,LocationInfoBean bean) {
        if(isNeedSave){
            if(isSuccess){
                bean.isSuccess = 0;
            }else{
                bean.isSuccess = -1;
            }
        }

        ArrayList<OnLocationListener> list = new ArrayList<>();
        for (OnLocationListener key : this.listeners) {
            if (key != null) {
                /*判断执行定位成功还是失败，成功的话获取返回值，是否需要停止并移除定位*/
                if (isSuccess) {
                    key.isSuccessive = key.onSuccess(bean);
                } else {
                    key.onFailure();
                }
                /*添加到集合中移除，false为不连续定位，true为连续定位*/
                if (!key.isSuccessive) {
                    list.add(key);
                }
            }
        }
        stopList(list);
    }

    /*停止并移除集合中的回调*/
    private void stopList(ArrayList<OnLocationListener> list) {
        for (OnLocationListener key : list) {
            stop(key);
        }
        list.clear();
        list = null;
    }

    /**
     * 获取定位信息
     *
     * @return
     */
    public static LocationInfoBean getLocationInfo() {
        //如果获取定位信息时，还未定位完成则使用以前保存的数据
        if (bean == null) {
            SharedPreferences preference_name = con.getSharedPreferences("preference_name", MODE_PRIVATE);
            String json = preference_name.getString("LOCATION_INFO", "");
            LocationInfoBean bean = null;
            try {
                bean = new Gson().fromJson(json, LocationInfoBean.class);
            } catch (Exception e) {
                bean = new LocationInfoBean();
            }
        }
        //如果没有以前保存的数据，就使用默认的上海市政府的数据
        if (bean == null) {
            bean = new LocationInfoBean();
            bean.setLatitude(31.236276);//纬度
            bean.setLongitude(121.480248);//经度
            bean.setCity("上海市");
            bean.setAddress("上海市");
            bean.isSuccess = -1;
        }
        return bean;
    }

    /**
     * 是否定位成功
     * @return
     */
    public static boolean isSuccess(){
        if(LocationManager.getLocationInfo().isSuccess == RESULT_OK){
            return true;
        }
        return false;
    }

    /**
     * 定位回调接口
     */
    public static abstract class OnLocationListener {

        public boolean isSuccessive;//是否是连续定位的

        /*返回false则停止并清空回调,true为连续定位*/
        public abstract boolean onSuccess(LocationInfoBean bean);

        /*重试6次请求依然失败，停止并清空回调*/
        public abstract void onFailure();
    }

    /**
     * 默认的接口类，用于只是定位，什么都不做的时候
     */
    public static class DefaultOnLocationListener extends OnLocationListener{
        @Override
        public boolean onSuccess(LocationInfoBean bean) {return false;}

        @Override
        public void onFailure() {}
    }

}
