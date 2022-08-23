package com.yaofangwang.mall.MapDelivery;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.os.CountDownTimer;
import android.support.annotation.NonNull;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.baidu.location.BDAbstractLocationListener;
import com.baidu.location.BDLocation;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.mapapi.map.ArcOptions;
import com.baidu.mapapi.map.BaiduMap;
import com.baidu.mapapi.map.BitmapDescriptor;
import com.baidu.mapapi.map.BitmapDescriptorFactory;
import com.baidu.mapapi.map.InfoWindow;
import com.baidu.mapapi.map.MapStatusUpdate;
import com.baidu.mapapi.map.MapStatusUpdateFactory;
import com.baidu.mapapi.map.MapView;
import com.baidu.mapapi.map.Marker;
import com.baidu.mapapi.map.MarkerOptions;
import com.baidu.mapapi.map.MyLocationData;
import com.baidu.mapapi.map.OverlayOptions;
import com.baidu.mapapi.map.UiSettings;
import com.baidu.mapapi.model.LatLng;
import com.baidu.mapapi.model.LatLngBounds;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.DeliveryMapBean;
import com.yaofangwang.mall.bean.LocationInfoBean;
import com.yaofangwang.mall.utils.FrescoLoad;

import java.util.ArrayList;

@SuppressLint("ViewConstructor")
class MapDeliveryView extends FrameLayout {
    private final ThemedReactContext mContext;
    private BaiduMap map;
    private MapView mapView;
    private LocationClient mLocClient;

    private View mInfoView;
    private View emptyMarker;
    private ImageView emptyMarkerIcon;
    private TextView titleView;
    private LinearLayout msgView;
    private TextView msg1View;
    private TextView msg2View;
    private TextView timeView;

    private CountDownTimer timer;
    private final DisplayMetrics dm = new DisplayMetrics();
    private ArrayList<DeliveryMapBean> mData = new ArrayList<>();
    private Boolean mShowLine = false;
    private Boolean mMapLoaded = false;

    public MapDeliveryView(@NonNull final ThemedReactContext context) {
        super(context);
        mContext = context;
        mContext.getCurrentActivity().getWindowManager().getDefaultDisplay().getMetrics(dm);
        initView();
        mapSetting();
        initListener();
        moveLocation(LocationManager.getLocationInfo());
    }
    private void initView(){
        View mView = LayoutInflater.from(mContext).inflate(R.layout.map_delivery_view, this);
        mapView = mView.findViewById(R.id.bmapView);
        View view = LayoutInflater.from(mContext).inflate(R.layout.map_delivery_info_view, null); //自定义气泡形状
        mInfoView = view.findViewById(R.id.delivery_info_item);
        mInfoView.setOnClickListener(v -> eventToRn(Arguments.createMap(),"onClick"));
        titleView = view.findViewById(R.id.delivery_info_item_title);
        msgView = view.findViewById(R.id.delivery_info_item_msg_item);
        msg1View= view.findViewById(R.id.delivery_info_item_msg1);
        msg2View= view.findViewById(R.id.delivery_info_item_msg2);
        timeView= view.findViewById(R.id.delivery_info_item_time);
        emptyMarker = LayoutInflater.from(mContext).inflate(R.layout.map_delivery_info_empty_marker, null);
        emptyMarkerIcon = emptyMarker.findViewById(R.id.delivery_empty_icon);
        map = mapView.getMap();
    }

    private void mapSetting() {
        mapView.showZoomControls(false);
        mapView.showScaleControl(false);
        map.setMyLocationEnabled(false);
//        map.setMyLocationConfiguration(new MyLocationConfiguration(MyLocationConfiguration.LocationMode.NORMAL, true, null));
        UiSettings mUiSettings = map.getUiSettings();
        mUiSettings.setOverlookingGesturesEnabled(false);
        mUiSettings.setRotateGesturesEnabled(false);
        mLocClient = new LocationClient(mContext);
        mLocClient.registerLocationListener(new BDAbstractLocationListener(){

            @Override
            public void onReceiveLocation(BDLocation location) {
                // map view 销毁后不在处理新接收的位置
                if (location == null || mapView == null) {
                    return;
                }
                MyLocationData locData = new MyLocationData.Builder()
                        .accuracy(location.getRadius())
                        .latitude(location.getLatitude())
                        .longitude(location.getLongitude()).build();
                map.setMyLocationData(locData);
            }
        });
        LocationClientOption option = new LocationClientOption();
        option.setOpenGps(true); // 打开gps
        option.setCoorType("bd09ll"); // 设置坐标类型
        option.setScanSpan(1000);
        mLocClient.setLocOption(option);
        mLocClient.start();
    }

    public void setData(ReadableArray dataArray, Boolean showLine){
        map.clear();
        if(timer != null){
            timer.cancel();
            timer.onFinish();
        }
        mData = new ArrayList<>();
        for(int i = 0; i < dataArray.size(); i++){
            if(!dataArray.isNull(i)){
                DeliveryMapBean bean = new DeliveryMapBean();
                ReadableMap data = dataArray.getMap(i);
                bean.setSecond(data.hasKey("second")&&!data.isNull("second")?data.getInt("second"):0);
                bean.setLat(data.hasKey("lat")&&!data.isNull("lat")&&!TextUtils.isEmpty(data.getString("lat"))?Double.parseDouble(data.getString("lat")):LocationManager.getLocationInfo().getLatitude());
                bean.setLag(data.hasKey("lng")&&!data.isNull("lng")&&!TextUtils.isEmpty(data.getString("lng"))?Double.parseDouble(data.getString("lng")):LocationManager.getLocationInfo().getLongitude());
                bean.setImageUrl(data.hasKey("image")&&!data.isNull("image")?data.getString("image"):"");
                bean.setMsg(data.hasKey("msg")&&!data.isNull("msg")?data.getString("msg"):"");
                bean.setTitle(data.hasKey("title")&&!data.isNull("title")?data.getString("title"):"");
                mData.add(bean);
            }
        }
        mShowLine = showLine;
        if(mMapLoaded){
            drawMarkersAndZoom(mData, mShowLine);
        }
    }

    private void initListener() {
        map.setOnMapLoadedCallback(() -> {
            drawMarkersAndZoom(mData, mShowLine);
            mMapLoaded = true;
        });
    }

    /**
     * 在地图上面添加一个标志
     */
    public void drawMarkersAndZoom(ArrayList<DeliveryMapBean> data, Boolean showLine) {
        if(data.size()==2){
            if(showLine){
                // 添加弧线坐标数据
                LatLng p1 = new LatLng(data.get(0).getLat(), data.get(0).getLag());//起点
                LatLng p3 = new LatLng(data.get(1).getLat(), data.get(1).getLag());//终点
                //避免百度地图画线点距离过近 导致的崩溃
                if(Math.abs(p1.latitude - p3.latitude)>0.0003 || Math.abs(p1.longitude - p3.longitude)>0.0003){
                    LatLng p2 = getMidPoint(p1, p3);//中间点
                    //构造ArcOptions对象
                    OverlayOptions mArcOptions = new ArcOptions()
                            .color(Color.parseColor("#256acd"))
                            .width((int)(3*dm.density))
                            .points(p1, p2, p3);

                    //在地图上显示弧线
                    map.addOverlay(mArcOptions);
                }
            }
            LatLng z1 = new LatLng(Math.min(data.get(0).getLat(), data.get(1).getLat()),
                    Math.min(data.get(0).getLag(), data.get(1).getLag()));
            LatLng z2 = new LatLng(Math.max(data.get(0).getLat(), data.get(1).getLat()),
                    Math.max(data.get(0).getLag(), data.get(1).getLag()));
            MapStatusUpdate u = MapStatusUpdateFactory.newLatLngBounds(new LatLngBounds.Builder().include(z1).include(z2).build(),
                    (int)((100)*dm.density),
                    (int)(110*dm.density),
                    (int)((100)*dm.density),
                    mapView.getHeight() - (int)(300*dm.density)
            );
            map.animateMapStatus(u);
        } else if(data.size()==1){
            LocationInfoBean locationInfoBean = new LocationInfoBean();
            locationInfoBean.setLatitude(data.get(0).getLat());
            locationInfoBean.setLongitude(data.get(0).getLag());
            moveLocation(locationInfoBean);
        }
        for(DeliveryMapBean bean:data){
            addMarker(bean);
        }
    }

    private LatLng getMidPoint(LatLng start, LatLng end) {
        double t, t2, h,h2;
        double lng1 = start.longitude;
        double lng2 = end.longitude;
        double lat1 = start.latitude;
        double lat2 = end.latitude;

        if (lng2 > lng1) {
            if ((lng2 - lng1) > 180) {
                if (lng1 < 0) {
                    lng1 = (180 + 180 + lng1);
                }
            }
        }
        if (lng1 > lng2) {
            if ((lng1 - lng2) > 180) {
                if (lng2 < 0) {
                    lng2 = (180 + 180 + lng2);
                }
            }
        }
        if (lat2 == lat1) {
            t = 0;
            h = lng1 - lng2;
        } else {
            if (lng2 == lng1) {
                t = Math.PI / 2;
                h = lat1 - lat2;
            } else {
                t = Math.atan((lat2 - lat1) / (lng2 - lng1));
                h = (lat2 - lat1) / Math.sin(t);
            }
        }
        t2 = (t + (Math.PI / 10));
        h2 = h / 2;
        double lng3 = h2 * Math.cos(t2) + lng1;
        double lat3 = h2 * Math.sin(t2) + lat1;
        return new LatLng(lat3,lng3);
    }

    /**
     * 在地图上面添加一个标志
     */
    public void addMarker(DeliveryMapBean bean) {
        //标点
        Marker marker;
        String url = bean.getImageUrl();
        LatLng pointMaker = new LatLng(bean.getLat(), bean.getLag());
        if(TextUtils.isEmpty(url)){
            BitmapDrawable bitmapDraw = (BitmapDrawable)getResources().getDrawable(R.drawable.map_point_user);
            Bitmap b = bitmapDraw.getBitmap();
            Bitmap smallMarker = Bitmap.createScaledBitmap(b, (int)(37*dm.density), (int)(41*dm.density), false);
            BitmapDescriptor bitmap = BitmapDescriptorFactory.fromBitmap(smallMarker);
            MarkerOptions option = new MarkerOptions().position(pointMaker).icon(bitmap);
            map.addOverlay(option);
        } else {
            BitmapDescriptor viewBitmap = BitmapDescriptorFactory.fromView(emptyMarker);
            Bitmap b = viewBitmap.getBitmap();
            Bitmap smallMarker = Bitmap.createScaledBitmap(b, (int)(37*dm.density), (int)(41*dm.density), false);
            BitmapDescriptor bitmap = BitmapDescriptorFactory.fromBitmap(smallMarker);
            MarkerOptions option = new MarkerOptions().position(pointMaker).icon(bitmap);
            marker = (Marker) map.addOverlay(option);
            FrescoLoad.downLoadToBitmap(mContext.getCurrentActivity(), url, bitmap12 -> {
                Bitmap bitmap2= Bitmap.createScaledBitmap(bitmap12, (int)(37*dm.density), (int)(41*dm.density), false);
                emptyMarkerIcon.setImageBitmap(bitmap2);
                emptyMarkerIcon.setBackground(getResources().getDrawable(R.drawable.map_point_empty));
                BitmapDescriptor viewBitmap1 = BitmapDescriptorFactory.fromView(emptyMarkerIcon);
                Bitmap smallMarker1 = Bitmap.createScaledBitmap(viewBitmap1.getBitmap(), (int)(37*dm.density), (int)(41*dm.density), false);
                BitmapDescriptor bitmap1 = BitmapDescriptorFactory.fromBitmap(smallMarker1);
                marker.setIcon(bitmap1);
            });
        }


        //信息窗
        if(!TextUtils.isEmpty(bean.getTitle())){
            titleView.setText(bean.getTitle());
            if(TextUtils.isEmpty(bean.getMsg()) || (bean.getMsg().contains("X") && bean.getSecond() <= 0)){
                msgView.setVisibility(GONE);
            } else {
                msgView.setVisibility(VISIBLE);
                String[] splitX = bean.getMsg().split("X");
                msg1View.setText(splitX[0]);
                msg2View.setText(splitX.length > 1 ?splitX[1]:"");
                int seconds = bean.getSecond();
                if(seconds > 0){
                    if (timer != null) {
                        timer.cancel();
                    }
                    int minute = (seconds) / 60;
                    int second = (seconds - minute * 60);
                    String timeStr = minute + ":" + (second<10?"0" + second:second);
                    timeView.setText(timeStr);

                    timer = new CountDownTimer(1000 * bean.getSecond(), 1000) {
                        @SuppressLint("DefaultLocale")
                        @Override
                        public void onTick(long millisUntilFinished) {
                            if(mapView == null) {
                                timer.cancel();
                                timer.onFinish();
                                return;
                            }
                            int seconds = (int) (millisUntilFinished / 1000);
                            if(seconds == 0){
                                msgView.setVisibility(GONE);
                            } else {
                                int minute = (seconds) / 60;
                                int second = (seconds - minute * 60);
                                if(timeView != null){
                                    String timeStr = minute + ":" + (second<10?"0" + second:second);
                                    timeView.setText(timeStr);
                                }
                            }
                            LatLng pointInfo = new LatLng(bean.getLat(), bean.getLag());
                            InfoWindow mInfoWindow = new InfoWindow(BitmapDescriptorFactory.fromView(mInfoView), pointInfo, (int)(-50*dm.density), () -> eventToRn(Arguments.createMap(),"onClick"));
                            map.hideInfoWindow();
                            map.showInfoWindow(mInfoWindow);
                        }

                        @Override
                        public void onFinish() {
                            eventToRn(Arguments.createMap(),"onTimeOut");
                        }
                    };
                    timer.start();
                }
            }
            //信息窗
            LatLng pointInfo = new LatLng(bean.getLat(), bean.getLag());
            InfoWindow mInfoWindow = new InfoWindow(BitmapDescriptorFactory.fromView(mInfoView), pointInfo, (int)(-50*dm.density), () -> eventToRn(Arguments.createMap(),"onClick"));
            map.showInfoWindow(mInfoWindow);
        }


    }

    private void moveLocation(LocationInfoBean bean) {
        MapStatusUpdate u = MapStatusUpdateFactory.newLatLngZoom(new LatLng(bean.getLatitude(), bean.getLongitude()), 18);
        map.animateMapStatus(u);
    }

    public void eventToRn(WritableMap data, String eventName) {
        ReactContext reactContext = (ReactContext) getContext();
        if(reactContext!= null){
            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                    getId(),
                    eventName,
                    data);
        }
    }

    public void onResume() {
        if(mapView != null){
            mapView.onResume();
        }
    }

    public void onPause() {
        if(mapView != null) {
            mapView.onPause();
        }
    }

    public void onDestroy() {
        if(mapView != null) {
            mapView.onDestroy();
            mapView = null;
        }
        if(map != null){
            map.setMyLocationEnabled(false);
            map = null;
        }
        if(mLocClient != null){
            mLocClient.stop();
        }
    }

}
